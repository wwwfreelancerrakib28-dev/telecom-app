export const userModelDart = `// lib/models/user_model.dart
import 'package:cloud_firestore/cloud_firestore.dart';

enum ResellerLevel { retailer, dealer, dgm, house }

class UserModel {
  final String uid;
  final String name;
  final String phone;
  final String email;
  final double mainBalance;
  final double driveBalance;
  final String pinHash; // Securely hashed 6-digit PIN
  final bool isBiometricEnabled;
  final ResellerLevel resellerLevel;
  final String? profileImageUrl;
  final DateTime createdAt;
  final DateTime updatedAt;

  UserModel({
    required this.uid,
    required this.name,
    required this.phone,
    required this.email,
    required this.mainBalance,
    required this.driveBalance,
    required this.pinHash,
    this.isBiometricEnabled = false,
    this.resellerLevel = ResellerLevel.retailer,
    this.profileImageUrl,
    required this.createdAt,
    required this.updatedAt,
  });

  // Convert Firestore DocumentSnapshot to UserModel
  factory UserModel.fromFirestore(DocumentSnapshot<Map<String, dynamic>> doc) {
    final data = doc.data() ?? {};
    return UserModel(
      uid: doc.id,
      name: data['name'] ?? '',
      phone: data['phone'] ?? '',
      email: data['email'] ?? '',
      mainBalance: (data['mainBalance'] as num?)?.toDouble() ?? 0.0,
      driveBalance: (data['driveBalance'] as num?)?.toDouble() ?? 0.0,
      pinHash: data['pinHash'] ?? '',
      isBiometricEnabled: data['isBiometricEnabled'] ?? false,
      resellerLevel: _parseResellerLevel(data['resellerLevel']),
      profileImageUrl: data['profileImageUrl'],
      createdAt: (data['createdAt'] as Timestamp?)?.toDate() ?? DateTime.now(),
      updatedAt: (data['updatedAt'] as Timestamp?)?.toDate() ?? DateTime.now(),
    );
  }

  // Convert UserModel to JSON Map for Firestore writes
  Map<String, dynamic> toFirestore() {
    return {
      'name': name,
      'phone': phone,
      'email': email,
      'mainBalance': mainBalance,
      'driveBalance': driveBalance,
      'pinHash': pinHash,
      'isBiometricEnabled': isBiometricEnabled,
      'resellerLevel': resellerLevel.name,
      'profileImageUrl': profileImageUrl,
      'createdAt': Timestamp.fromDate(createdAt),
      'updatedAt': FieldValue.serverTimestamp(),
    };
  }

  UserModel copyWith({
    String? name,
    String? phone,
    String? email,
    double? mainBalance,
    double? driveBalance,
    String? pinHash,
    bool? isBiometricEnabled,
    ResellerLevel? resellerLevel,
    String? profileImageUrl,
  }) {
    return UserModel(
      uid: uid,
      name: name ?? this.name,
      phone: phone ?? this.phone,
      email: email ?? this.email,
      mainBalance: mainBalance ?? this.mainBalance,
      driveBalance: driveBalance ?? this.driveBalance,
      pinHash: pinHash ?? this.pinHash,
      isBiometricEnabled: isBiometricEnabled ?? this.isBiometricEnabled,
      resellerLevel: resellerLevel ?? this.resellerLevel,
      profileImageUrl: profileImageUrl ?? this.profileImageUrl,
      createdAt: createdAt,
      updatedAt: DateTime.now(),
    );
  }

  static ResellerLevel _parseResellerLevel(String? value) {
    switch (value?.toLowerCase()) {
      case 'dealer':
        return ResellerLevel.dealer;
      case 'dgm':
        return ResellerLevel.dgm;
      case 'house':
        return ResellerLevel.house;
      default:
        return ResellerLevel.retailer;
    }
  }
}
`;

export const transactionModelDart = `// lib/models/transaction_model.dart
import 'package:cloud_firestore/cloud_firestore.dart';

enum TransactionType { recharge, addBalance, drivePack, transfer }
enum TransactionStatus { pending, success, cancelled }
enum BalanceType { main, drive }
enum TelecomOperator { gp, robi, banglalink, airtel, teletalk }
enum ConnectionType { prepaid, postpaid, skitto }

class TransactionModel {
  final String id;
  final String userId;
  final TransactionType type;
  final String title;
  final String recipientOrSenderNumber;
  final TelecomOperator? telecomOperator;
  final ConnectionType? connectionType;
  final double amount;
  final double fee;
  final double cashback;
  final BalanceType balanceType;
  final TransactionStatus status;
  final DateTime timestamp;
  final String? trxId;
  final String? paymentMethod; // e.g. bKash, Nagad, Rocket
  final String? note;

  TransactionModel({
    required this.id,
    required this.userId,
    required this.type,
    required this.title,
    required this.recipientOrSenderNumber,
    this.telecomOperator,
    this.connectionType,
    required this.amount,
    this.fee = 0.0,
    this.cashback = 0.0,
    required this.balanceType,
    required this.status,
    required this.timestamp,
    this.trxId,
    this.paymentMethod,
    this.note,
  });

  factory TransactionModel.fromFirestore(DocumentSnapshot<Map<String, dynamic>> doc) {
    final data = doc.data() ?? {};
    return TransactionModel(
      id: doc.id,
      userId: data['userId'] ?? '',
      type: _parseType(data['type']),
      title: data['title'] ?? '',
      recipientOrSenderNumber: data['recipientOrSenderNumber'] ?? '',
      telecomOperator: _parseOperator(data['telecomOperator']),
      connectionType: _parseConnectionType(data['connectionType']),
      amount: (data['amount'] as num?)?.toDouble() ?? 0.0,
      fee: (data['fee'] as num?)?.toDouble() ?? 0.0,
      cashback: (data['cashback'] as num?)?.toDouble() ?? 0.0,
      balanceType: (data['balanceType'] == 'drive') ? BalanceType.drive : BalanceType.main,
      status: _parseStatus(data['status']),
      timestamp: (data['timestamp'] as Timestamp?)?.toDate() ?? DateTime.now(),
      trxId: data['trxId'],
      paymentMethod: data['paymentMethod'],
      note: data['note'],
    );
  }

  Map<String, dynamic> toFirestore() {
    return {
      'userId': userId,
      'type': type.name,
      'title': title,
      'recipientOrSenderNumber': recipientOrSenderNumber,
      'telecomOperator': telecomOperator?.name,
      'connectionType': connectionType?.name,
      'amount': amount,
      'fee': fee,
      'cashback': cashback,
      'balanceType': balanceType.name,
      'status': status.name,
      'timestamp': Timestamp.fromDate(timestamp),
      'trxId': trxId,
      'paymentMethod': paymentMethod,
      'note': note,
    };
  }

  static TransactionType _parseType(String? value) {
    switch (value) {
      case 'addBalance': return TransactionType.addBalance;
      case 'drivePack': return TransactionType.drivePack;
      case 'transfer': return TransactionType.transfer;
      default: return TransactionType.recharge;
    }
  }

  static TransactionStatus _parseStatus(String? value) {
    switch (value) {
      case 'success': return TransactionStatus.success;
      case 'cancelled': return TransactionStatus.cancelled;
      default: return TransactionStatus.pending;
    }
  }

  static TelecomOperator? _parseOperator(String? value) {
    if (value == null) return null;
    switch (value.toLowerCase()) {
      case 'gp': return TelecomOperator.gp;
      case 'robi': return TelecomOperator.robi;
      case 'banglalink':
      case 'bl': return TelecomOperator.banglalink;
      case 'airtel': return TelecomOperator.airtel;
      case 'teletalk': return TelecomOperator.teletalk;
      default: return null;
    }
  }

  static ConnectionType? _parseConnectionType(String? value) {
    if (value == null) return null;
    switch (value.toLowerCase()) {
      case 'postpaid': return ConnectionType.postpaid;
      case 'skitto': return ConnectionType.skitto;
      default: return ConnectionType.prepaid;
    }
  }
}
`;

export const drivePackageModelDart = `// lib/models/drive_package_model.dart
import 'package:cloud_firestore/cloud_firestore.dart';
import 'transaction_model.dart';

class DrivePackageModel {
  final String id;
  final TelecomOperator telecomOperator;
  final String title;
  final String dataAllowance;
  final String minuteAllowance;
  final String? smsAllowance;
  final String validity;
  final double regularPrice;
  final double offerPrice;
  final double cashback;
  final String category; // 'internet', 'minute', 'combo'
  final String division; // e.g. "All Bangladesh"
  final bool isActive;

  DrivePackageModel({
    required this.id,
    required this.telecomOperator,
    required this.title,
    required this.dataAllowance,
    required this.minuteAllowance,
    this.smsAllowance,
    required this.validity,
    required this.regularPrice,
    required this.offerPrice,
    required this.cashback,
    required this.category,
    this.division = 'All Bangladesh',
    this.isActive = true,
  });

  factory DrivePackageModel.fromFirestore(DocumentSnapshot<Map<String, dynamic>> doc) {
    final data = doc.data() ?? {};
    return DrivePackageModel(
      id: doc.id,
      telecomOperator: TransactionModel._parseOperator(data['telecomOperator']) ?? TelecomOperator.gp,
      title: data['title'] ?? '',
      dataAllowance: data['dataAllowance'] ?? '',
      minuteAllowance: data['minuteAllowance'] ?? '',
      smsAllowance: data['smsAllowance'],
      validity: data['validity'] ?? '30 Days',
      regularPrice: (data['regularPrice'] as num?)?.toDouble() ?? 0.0,
      offerPrice: (data['offerPrice'] as num?)?.toDouble() ?? 0.0,
      cashback: (data['cashback'] as num?)?.toDouble() ?? 0.0,
      category: data['category'] ?? 'combo',
      division: data['division'] ?? 'All Bangladesh',
      isActive: data['isActive'] ?? true,
    );
  }

  Map<String, dynamic> toFirestore() {
    return {
      'telecomOperator': telecomOperator.name,
      'title': title,
      'dataAllowance': dataAllowance,
      'minuteAllowance': minuteAllowance,
      'smsAllowance': smsAllowance,
      'validity': validity,
      'regularPrice': regularPrice,
      'offerPrice': offerPrice,
      'cashback': cashback,
      'category': category,
      'division': division,
      'isActive': isActive,
    };
  }
}
`;
