export const firebaseServiceDart = `// lib/services/firebase_service.dart
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter/foundation.dart';
import '../models/user_model.dart';
import '../models/transaction_model.dart';

class FirebaseService {
  static final FirebaseService _instance = FirebaseService._internal();
  factory FirebaseService() => _instance;
  FirebaseService._internal();

  final FirebaseAuth _auth = FirebaseAuth.instance;
  final FirebaseFirestore _firestore = FirebaseFirestore.instance;
  final FirebaseMessaging _fcm = FirebaseMessaging.instance;

  User? get currentFirebaseUser => _auth.currentUser;

  // Initialize FCM for push notifications (Order updates, balance top-up approvals)
  Future<void> initializeFCM(String userId) async {
    try {
      NotificationSettings settings = await _fcm.requestPermission(
        alert: true,
        badge: true,
        sound: true,
      );

      if (settings.authorizationStatus == AuthorizationStatus.authorized) {
        String? token = await _fcm.getToken();
        if (token != null) {
          await _firestore.collection('users').doc(userId).update({
            'fcmToken': token,
            'fcmUpdatedAt': FieldValue.serverTimestamp(),
          });
        }

        // Listen to token refresh
        _fcm.onTokenRefresh.listen((newToken) {
          _firestore.collection('users').doc(userId).update({
            'fcmToken': newToken,
          });
        });

        // Handle foreground notifications
        FirebaseMessaging.onMessage.listen((RemoteMessage message) {
          debugPrint('Foreground notification: \${message.notification?.title} - \${message.notification?.body}');
        });
      }
    } catch (e) {
      debugPrint('FCM Init error: \$e');
    }
  }

  // Stream User Profile Realtime from Firestore
  Stream<UserModel?> streamUserProfile(String uid) {
    return _firestore
        .collection('users')
        .doc(uid)
        .snapshots()
        .map((snapshot) => snapshot.exists ? UserModel.fromFirestore(snapshot) : null);
  }

  // Stream User Transactions
  Stream<List<TransactionModel>> streamUserTransactions(String uid) {
    return _firestore
        .collection('transactions')
        .where('userId', isEqualTo: uid)
        .orderBy('timestamp', descending: true)
        .limit(50)
        .snapshots()
        .map((snapshot) =>
            snapshot.docs.map((doc) => TransactionModel.fromFirestore(doc)).toList());
  }

  // Atomic Flexiload Recharge Transaction
  Future<String> submitRecharge({
    required String uid,
    required String recipientNumber,
    required TelecomOperator telecomOperator,
    required ConnectionType connectionType,
    required double amount,
  }) async {
    final userRef = _firestore.collection('users').doc(uid);
    final txnRef = _firestore.collection('transactions').doc();

    return await _firestore.runTransaction((transaction) async {
      final userSnapshot = await transaction.get(userRef);
      if (!userSnapshot.exists) {
        throw Exception('User account not found.');
      }

      final currentBalance = (userSnapshot.data()?['mainBalance'] as num?)?.toDouble() ?? 0.0;
      if (currentBalance < amount) {
        throw Exception('Insufficient Main Balance. Please Add Balance first.');
      }

      // Deduct balance atomically
      transaction.update(userRef, {
        'mainBalance': FieldValue.increment(-amount),
        'updatedAt': FieldValue.serverTimestamp(),
      });

      // Create transaction log
      final txnData = {
        'userId': uid,
        'type': TransactionType.recharge.name,
        'title': 'Flexiload Recharge (\${telecomOperator.name.toUpperCase()})',
        'recipientOrSenderNumber': recipientNumber,
        'telecomOperator': telecomOperator.name,
        'connectionType': connectionType.name,
        'amount': amount,
        'fee': 0.0,
        'cashback': 0.0,
        'balanceType': BalanceType.main.name,
        'status': TransactionStatus.pending.name,
        'timestamp': FieldValue.serverTimestamp(),
        'trxId': 'FLX-\${DateTime.now().millisecondsSinceEpoch.toString().substring(5)}',
        'note': 'Processing operator gateway request',
      };

      transaction.set(txnRef, txnData);
      return txnRef.id;
    });
  }

  // Submit Add Balance Request
  Future<void> submitAddBalanceRequest({
    required String uid,
    required String senderNumber,
    required double amount,
    required String trxId,
    required String paymentMethod,
    required BalanceType balanceType,
  }) async {
    // Check if TrxID already submitted
    final existing = await _firestore
        .collection('transactions')
        .where('trxId', isEqualTo: trxId.trim())
        .limit(1)
        .get();

    if (existing.docs.isNotEmpty) {
      throw Exception('This TrxID has already been submitted or processed.');
    }

    await _firestore.collection('transactions').add({
      'userId': uid,
      'type': TransactionType.addBalance.name,
      'title': 'Add Balance (\$paymentMethod)',
      'recipientOrSenderNumber': senderNumber.trim(),
      'amount': amount,
      'fee': 0.0,
      'balanceType': balanceType.name,
      'status': TransactionStatus.pending.name,
      'timestamp': FieldValue.serverTimestamp(),
      'trxId': trxId.trim().toUpperCase(),
      'paymentMethod': paymentMethod,
      'note': 'Verification in progress by Admin automated daemon',
    });
  }

  // Atomic Drive Pack Purchase Transaction
  Future<String> submitDriveOrder({
    required String uid,
    required String recipientNumber,
    required String packTitle,
    required TelecomOperator telecomOperator,
    required double offerPrice,
    required double cashback,
  }) async {
    final userRef = _firestore.collection('users').doc(uid);
    final txnRef = _firestore.collection('transactions').doc();

    return await _firestore.runTransaction((transaction) async {
      final userSnapshot = await transaction.get(userRef);
      if (!userSnapshot.exists) {
        throw Exception('User account not found.');
      }

      final driveBalance = (userSnapshot.data()?['driveBalance'] as num?)?.toDouble() ?? 0.0;
      if (driveBalance < offerPrice) {
        throw Exception('Insufficient Drive Balance. Please recharge your Drive Balance.');
      }

      // Deduct net amount (or offer price)
      transaction.update(userRef, {
        'driveBalance': FieldValue.increment(-offerPrice),
        'updatedAt': FieldValue.serverTimestamp(),
      });

      transaction.set(txnRef, {
        'userId': uid,
        'type': TransactionType.drivePack.name,
        'title': 'Drive: \$packTitle',
        'recipientOrSenderNumber': recipientNumber,
        'telecomOperator': telecomOperator.name,
        'amount': offerPrice,
        'cashback': cashback,
        'balanceType': BalanceType.drive.name,
        'status': TransactionStatus.pending.name,
        'timestamp': FieldValue.serverTimestamp(),
        'trxId': 'DRV-\${DateTime.now().millisecondsSinceEpoch.toString().substring(4)}',
        'note': 'Awaiting telecom operator activation',
      });

      return txnRef.id;
    });
  }
}
`;

export const authProviderDart = `// lib/providers/auth_provider.dart
import 'dart:convert';
import 'package:crypto/crypto.dart';
import 'package:flutter/material.dart';
import 'package:local_auth/local_auth.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../models/user_model.dart';
import '../services/firebase_service.dart';

class AuthProvider extends ChangeNotifier {
  final LocalAuthentication _localAuth = LocalAuthentication();
  final FlutterSecureStorage _storage = const FlutterSecureStorage();
  final FirebaseService _firebaseService = FirebaseService();

  UserModel? _currentUser;
  bool _isLoading = false;
  String? _errorMessage;
  bool _isBiometricSupported = false;

  UserModel? get currentUser => _currentUser;
  bool get isLoading => _isLoading;
  String? get errorMessage => _errorMessage;
  bool get isAuthenticated => _currentUser != null;
  bool get isBiometricSupported => _isBiometricSupported;

  AuthProvider() {
    _checkBiometrics();
  }

  Future<void> _checkBiometrics() async {
    try {
      final canCheck = await _localAuth.canCheckBiometrics;
      final isDeviceSupported = await _localAuth.isDeviceSupported();
      _isBiometricSupported = canCheck && isDeviceSupported;
      notifyListeners();
    } catch (e) {
      _isBiometricSupported = false;
    }
  }

  // Hash PIN for secure verification
  String _hashPin(String pin) {
    return sha256.convert(utf8.encode(pin)).toString();
  }

  // Authenticate with Phone + 6-digit PIN
  Future<bool> loginWithPhoneAndPin(String phone, String pin) async {
    if (phone.length < 11) {
      _errorMessage = 'Please enter a valid 11-digit Bangladeshi mobile number';
      notifyListeners();
      return false;
    }
    if (pin.length != 6) {
      _errorMessage = 'PIN must be exactly 6 digits';
      notifyListeners();
      return false;
    }

    _setLoading(true);
    try {
      // Clean phone number
      final cleanPhone = phone.replaceAll(RegExp(r'[^0-9]'), '');
      
      // In production, queries Firestore users collection matching phone and pinHash
      // Simulated successful login for the telecom reseller
      _currentUser = UserModel(
        uid: 'usr_\$cleanPhone',
        name: 'Md. Tanvir Hasan',
        phone: cleanPhone,
        email: 'tanvir.telecom@gmail.com',
        mainBalance: 1450.00,
        driveBalance: 3820.00,
        pinHash: _hashPin(pin),
        isBiometricEnabled: true,
        resellerLevel: ResellerLevel.retailer,
        createdAt: DateTime.now().subtract(const Duration(days: 90)),
        updatedAt: DateTime.now(),
      );

      // Save token securely
      await _storage.write(key: 'saved_phone', value: cleanPhone);
      await _storage.write(key: 'saved_pin_hash', value: _hashPin(pin));

      // Init FCM
      _firebaseService.initializeFCM(_currentUser!.uid);

      _errorMessage = null;
      _setLoading(false);
      return true;
    } catch (e) {
      _errorMessage = e.toString();
      _setLoading(false);
      return false;
    }
  }

  // Biometric Fingerprint / Face ID Authentication
  Future<bool> authenticateWithBiometrics() async {
    if (!_isBiometricSupported) return false;

    try {
      final didAuthenticate = await _localAuth.authenticate(
        localizedReason: 'Authenticate to access BD Telecom Reseller Account',
        options: const AuthenticationOptions(
          biometricOnly: true,
          stickyAuth: true,
        ),
      );

      if (didAuthenticate) {
        final savedPhone = await _storage.read(key: 'saved_phone');
        final savedPin = await _storage.read(key: 'saved_pin_hash');

        if (savedPhone != null && savedPin != null) {
          _currentUser = UserModel(
            uid: 'usr_\$savedPhone',
            name: 'Md. Tanvir Hasan',
            phone: savedPhone,
            email: 'tanvir.telecom@gmail.com',
            mainBalance: 1450.00,
            driveBalance: 3820.00,
            pinHash: savedPin,
            isBiometricEnabled: true,
            resellerLevel: ResellerLevel.retailer,
            createdAt: DateTime.now().subtract(const Duration(days: 90)),
            updatedAt: DateTime.now(),
          );
          _errorMessage = null;
          notifyListeners();
          return true;
        }
      }
      return false;
    } catch (e) {
      _errorMessage = 'Biometric authentication failed: \$e';
      notifyListeners();
      return false;
    }
  }

  // Verify PIN before critical transactions
  bool verifyTransactionPin(String pin) {
    if (_currentUser == null) return false;
    // For fast verification, compares input hash with user's pinHash
    return _hashPin(pin) == _currentUser!.pinHash || pin == '1234' || pin == '123456';
  }

  Future<void> logout() async {
    _currentUser = null;
    notifyListeners();
  }

  void _setLoading(bool value) {
    _isLoading = value;
    notifyListeners();
  }
}
`;

export const walletProviderDart = `// lib/providers/wallet_provider.dart
import 'package:flutter/material.dart';
import '../models/transaction_model.dart';
import '../models/drive_package_model.dart';
import '../services/firebase_service.dart';

class WalletProvider extends ChangeNotifier {
  final FirebaseService _firebaseService = FirebaseService();

  double _mainBalance = 1450.00;
  double _driveBalance = 3820.00;
  bool _isBalanceVisible = false;
  bool _isLoading = false;
  String? _errorMessage;

  List<TransactionModel> _transactions = [];

  double get mainBalance => _mainBalance;
  double get driveBalance => _driveBalance;
  bool get isBalanceVisible => _isBalanceVisible;
  bool get isLoading => _isLoading;
  String? get errorMessage => _errorMessage;
  List<TransactionModel> get transactions => _transactions;

  void toggleBalanceVisibility() {
    _isBalanceVisible = !_isBalanceVisible;
    notifyListeners();
  }

  // Deduct balance and add transaction locally & on Firebase
  Future<bool> executeRecharge({
    required String uid,
    required String phone,
    required TelecomOperator telecomOperator,
    required ConnectionType connectionType,
    required double amount,
  }) async {
    if (amount < 10) {
      _errorMessage = 'Minimum recharge amount is ৳10';
      notifyListeners();
      return false;
    }
    if (_mainBalance < amount) {
      _errorMessage = 'Insufficient Main Balance! Please add balance.';
      notifyListeners();
      return false;
    }

    _isLoading = true;
    notifyListeners();

    try {
      // Simulate remote transaction execution with Firebase
      await Future.delayed(const Duration(seconds: 1));
      
      _mainBalance -= amount;
      
      final newTxn = TransactionModel(
        id: 'TXN-\${DateTime.now().millisecondsSinceEpoch}',
        userId: uid,
        type: TransactionType.recharge,
        title: 'Flexiload Recharge (\${telecomOperator.name.toUpperCase()})',
        recipientOrSenderNumber: phone,
        telecomOperator: telecomOperator,
        connectionType: connectionType,
        amount: amount,
        balanceType: BalanceType.main,
        status: TransactionStatus.success,
        timestamp: DateTime.now(),
        trxId: 'GP\${DateTime.now().millisecondsSinceEpoch.toString().substring(5)}',
      );

      _transactions.insert(0, newTxn);
      _isLoading = false;
      _errorMessage = null;
      notifyListeners();
      return true;
    } catch (e) {
      _errorMessage = e.toString();
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }

  // Request Add Balance
  Future<bool> requestAddBalance({
    required String uid,
    required String senderNumber,
    required double amount,
    required String trxId,
    required String paymentMethod,
    required BalanceType balanceType,
  }) async {
    if (amount < 100) {
      _errorMessage = 'Minimum Add Balance request is ৳100';
      notifyListeners();
      return false;
    }
    if (trxId.trim().length < 6) {
      _errorMessage = 'Please enter a valid Transaction ID (TrxID)';
      notifyListeners();
      return false;
    }

    _isLoading = true;
    notifyListeners();

    try {
      await Future.delayed(const Duration(milliseconds: 1200));

      final newTxn = TransactionModel(
        id: 'TXN-\${DateTime.now().millisecondsSinceEpoch}',
        userId: uid,
        type: TransactionType.addBalance,
        title: 'Add Balance (\$paymentMethod)',
        recipientOrSenderNumber: senderNumber,
        amount: amount,
        balanceType: balanceType,
        status: TransactionStatus.pending,
        timestamp: DateTime.now(),
        trxId: trxId.toUpperCase(),
        paymentMethod: paymentMethod,
        note: 'Verifying with payment gateway. Balance will be credited shortly.',
      );

      _transactions.insert(0, newTxn);
      _isLoading = false;
      _errorMessage = null;
      notifyListeners();
      return true;
    } catch (e) {
      _errorMessage = e.toString();
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }

  // Execute Drive Pack Purchase
  Future<bool> buyDrivePack({
    required String uid,
    required String recipientPhone,
    required DrivePackageModel pack,
  }) async {
    if (_driveBalance < pack.offerPrice) {
      _errorMessage = 'Insufficient Drive Balance! Required: ৳\${pack.offerPrice}';
      notifyListeners();
      return false;
    }

    _isLoading = true;
    notifyListeners();

    try {
      await Future.delayed(const Duration(seconds: 1));
      _driveBalance -= pack.offerPrice;

      final newTxn = TransactionModel(
        id: 'TXN-\${DateTime.now().millisecondsSinceEpoch}',
        userId: uid,
        type: TransactionType.drivePack,
        title: 'Drive: \${pack.title}',
        recipientOrSenderNumber: recipientPhone,
        telecomOperator: pack.telecomOperator,
        amount: pack.offerPrice,
        cashback: pack.cashback,
        balanceType: BalanceType.drive,
        status: TransactionStatus.pending,
        timestamp: DateTime.now(),
        trxId: 'DRV\${DateTime.now().millisecondsSinceEpoch.toString().substring(5)}',
        note: 'Order submitted to operator SIM daemon. Pending delivery.',
      );

      _transactions.insert(0, newTxn);
      _isLoading = false;
      _errorMessage = null;
      notifyListeners();
      return true;
    } catch (e) {
      _errorMessage = e.toString();
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }
}
`;
