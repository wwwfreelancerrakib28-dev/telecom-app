export const mainDart = `// lib/main.dart
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:firebase_core/firebase_core.dart';
import 'providers/auth_provider.dart';
import 'providers/wallet_provider.dart';
import 'screens/auth_screen.dart';
import 'screens/home_dashboard.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  
  // Initialize Firebase (Ensure google-services.json / GoogleService-Info.plist are linked)
  try {
    await Firebase.initializeApp();
  } catch (e) {
    debugPrint('Firebase initialization notice: \$e');
  }

  runApp(
    MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => AuthProvider()),
        ChangeNotifierProvider(create: (_) => WalletProvider()),
      ],
      child: const TelecomResellerApp(),
    ),
  );
}

class TelecomResellerApp extends StatelessWidget {
  const TelecomResellerApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'BD Telecom Reseller',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        useMaterial3: true,
        colorScheme: ColorScheme.fromSeed(
          seedColor: const Color(0xFF0D47A1), // Deep Telecom Blue
          primary: const Color(0xFF0D47A1),
          secondary: const Color(0xFF00897B),
          background: const Color(0xFFF8F9FA),
        ),
        textTheme: GoogleFonts.hindSiliguriTextTheme(
          Theme.of(context).textTheme,
        ),
        appBarTheme: const AppBarTheme(
          backgroundColor: Color(0xFF0D47A1),
          foregroundColor: Colors.white,
          elevation: 0,
          centerTitle: true,
        ),
        elevatedButtonTheme: ElevatedButtonThemeData(
          style: ElevatedButton.styleFrom(
            elevation: 1,
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
            padding: const EdgeInsets.symmetric(vertical: 14, horizontal: 24),
          ),
        ),
      ),
      home: Consumer<AuthProvider>(
        builder: (context, auth, _) {
          return auth.isAuthenticated ? const HomeDashboard() : const AuthScreen();
        },
      ),
    );
  }
}
`;

export const authScreenDart = `// lib/screens/auth_screen.dart
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:flutter_spinkit/flutter_spinkit.dart';
import '../providers/auth_provider.dart';

class AuthScreen extends StatefulWidget {
  const AuthScreen({super.key});

  @override
  State<AuthScreen> createState() => _AuthScreenState();
}

class _AuthScreenState extends State<AuthScreen> {
  final _phoneController = TextEditingController(text: '01712345678');
  final _pinController = TextEditingController();
  bool _obscurePin = true;
  final _formKey = GlobalKey<FormState>();

  @override
  void initState() {
    super.initState();
    // Auto trigger biometric login if previously configured
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final auth = Provider.of<AuthProvider>(context, listen: false);
      if (auth.isBiometricSupported) {
        auth.authenticateWithBiometrics();
      }
    });
  }

  @override
  void dispose() {
    _phoneController.dispose();
    _pinController.dispose();
    super.dispose();
  }

  void _submitLogin() async {
    if (_formKey.currentState!.validate()) {
      final auth = Provider.of<AuthProvider>(context, listen: false);
      final success = await auth.loginWithPhoneAndPin(
        _phoneController.text.trim(),
        _pinController.text.trim(),
      );
      if (!success && mounted && auth.errorMessage != null) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(auth.errorMessage!),
            backgroundColor: Colors.red.shade700,
          ),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthProvider>();
    final theme = Theme.of(context);

    return Scaffold(
      backgroundColor: Colors.white,
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 32),
          child: Form(
            key: _formKey,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                const SizedBox(height: 20),
                Center(
                  child: Container(
                    padding: const EdgeInsets.all(18),
                    decoration: BoxDecoration(
                      color: theme.primaryColor.withOpacity(0.1),
                      shape: BoxShape.circle,
                    ),
                    child: Icon(Icons.cell_tower, size: 54, color: theme.primaryColor),
                  ),
                ),
                const SizedBox(height: 20),
                Text(
                  'BD Telecom Reseller',
                  textAlign: TextAlign.center,
                  style: theme.textTheme.headlineMedium?.copyWith(
                    fontWeight: FontWeight.bold,
                    color: const Color(0xFF1E293B),
                  ),
                ),
                const SizedBox(height: 6),
                Text(
                  'User Flexiload & Drive Pack Portal',
                  textAlign: TextAlign.center,
                  style: theme.textTheme.bodyMedium?.copyWith(color: Colors.grey.shade600),
                ),
                const SizedBox(height: 36),

                // Phone Input
                Text('Mobile Number (মোবাইল নম্বর)', style: TextStyle(fontWeight: FontWeight.w600, color: Colors.grey.shade800)),
                const SizedBox(height: 8),
                TextFormField(
                  controller: _phoneController,
                  keyboardType: TextInputType.phone,
                  maxLength: 11,
                  decoration: InputDecoration(
                    prefixIcon: const Icon(Icons.phone_android),
                    prefixText: '+88 ',
                    hintText: '01XXXXXXXXX',
                    counterText: '',
                    filled: true,
                    fillColor: Colors.grey.shade50,
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                      borderSide: BorderSide(color: Colors.grey.shade300),
                    ),
                  ),
                  validator: (value) {
                    if (value == null || value.isEmpty) return 'Mobile number is required';
                    if (value.length != 11) return 'Must be 11 digits (e.g. 01712345678)';
                    if (!value.startsWith('01')) return 'Number must start with 01';
                    return null;
                  },
                ),
                const SizedBox(height: 20),

                // PIN Input
                Text('6-Digit Security PIN (৬ সংখ্যার পিন)', style: TextStyle(fontWeight: FontWeight.w600, color: Colors.grey.shade800)),
                const SizedBox(height: 8),
                TextFormField(
                  controller: _pinController,
                  keyboardType: TextInputType.number,
                  obscureText: _obscurePin,
                  maxLength: 6,
                  decoration: InputDecoration(
                    prefixIcon: const Icon(Icons.lock_outline),
                    suffixIcon: IconButton(
                      icon: Icon(_obscurePin ? Icons.visibility_off : Icons.visibility),
                      onPressed: () => setState(() => _obscurePin = !_obscurePin),
                    ),
                    hintText: '••••••',
                    counterText: '',
                    filled: true,
                    fillColor: Colors.grey.shade50,
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                      borderSide: BorderSide(color: Colors.grey.shade300),
                    ),
                  ),
                  validator: (value) {
                    if (value == null || value.isEmpty) return 'PIN is required';
                    if (value.length != 6) return 'PIN must be 6 digits';
                    return null;
                  },
                ),
                const SizedBox(height: 28),

                // Submit Button
                ElevatedButton(
                  onPressed: auth.isLoading ? null : _submitLogin,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: theme.primaryColor,
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(vertical: 16),
                  ),
                  child: auth.isLoading
                      ? const SpinKitThreeBounce(color: Colors.white, size: 20)
                      : const Text('Login to Account (লগইন)', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                ),
                const SizedBox(height: 20),

                // Biometric Toggle Button
                if (auth.isBiometricSupported)
                  OutlinedButton.icon(
                    onPressed: auth.authenticateWithBiometrics,
                    icon: const Icon(Icons.fingerprint, color: Color(0xFF00897B), size: 24),
                    label: const Text('Login with Fingerprint / Biometric', style: TextStyle(color: Color(0xFF00897B), fontWeight: FontWeight.w600)),
                    style: OutlinedButton.styleFrom(
                      padding: const EdgeInsets.symmetric(vertical: 14),
                      side: const BorderSide(color: Color(0xFF00897B)),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                    ),
                  ),

                const SizedBox(height: 32),
                Center(
                  child: Text(
                    'Protected by 256-Bit SSL & Firebase Security',
                    style: TextStyle(fontSize: 12, color: Colors.grey.shade500),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
`;

export const homeDashboardDart = `// lib/screens/home_dashboard.dart
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:marquee/marquee.dart';
import '../providers/auth_provider.dart';
import '../providers/wallet_provider.dart';
import 'flexiload_screen.dart';
import 'drive_pack_screen.dart';
import 'add_balance_screen.dart';
import 'history_screen.dart';

class HomeDashboard extends StatefulWidget {
  const HomeDashboard({super.key});

  @override
  State<HomeDashboard> createState() => _HomeDashboardState();
}

class _HomeDashboardState extends State<HomeDashboard> {
  int _activeBalanceTabIndex = 0; // 0: Main, 1: Drive

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthProvider>();
    final wallet = context.watch<WalletProvider>();
    final user = auth.currentUser;

    return Scaffold(
      backgroundColor: const Color(0xFFF4F6F9),
      appBar: AppBar(
        title: const Text('BD Telecom Portal', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18)),
        actions: [
          IconButton(
            icon: const Icon(Icons.notifications_outlined),
            onPressed: () {
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('No unread notifications.')),
              );
            },
          ),
          IconButton(
            icon: const Icon(Icons.logout),
            onPressed: () => auth.logout(),
          ),
        ],
      ),
      body: SingleChildScrollView(
        child: Column(
          children: [
            // User Header & Balance Card
            Container(
              padding: const EdgeInsets.fromLTRB(16, 8, 16, 20),
              decoration: const BoxDecoration(
                color: Color(0xFF0D47A1),
                borderRadius: BorderRadius.only(
                  bottomLeft: Radius.circular(24),
                  bottomRight: Radius.circular(24),
                ),
              ),
              child: Column(
                children: [
                  Row(
                    children: [
                      CircleAvatar(
                        radius: 22,
                        backgroundColor: Colors.white.withOpacity(0.2),
                        child: const Icon(Icons.person, color: Colors.white, size: 28),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              user?.name ?? 'Tanvir Hasan',
                              style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 16),
                            ),
                            Text(
                              '\${user?.phone ?? "01712-345678"} • \${user?.resellerLevel.name.toUpperCase() ?? "RETAILER"}',
                              style: TextStyle(color: Colors.white.withOpacity(0.8), fontSize: 12),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),

                  // Tap to View Balance Container
                  GestureDetector(
                    onTap: () => wallet.toggleBalanceVisibility(),
                    child: Container(
                      width: double.infinity,
                      padding: const EdgeInsets.symmetric(vertical: 14, horizontal: 18),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(16),
                        boxShadow: [
                          BoxShadow(color: Colors.black.withOpacity(0.08), blurRadius: 10, offset: const Offset(0, 4)),
                        ],
                      ),
                      child: Column(
                        children: [
                          Row(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              ChoiceChip(
                                label: const Text('মেইন ব্যালেন্স (Main)'),
                                selected: _activeBalanceTabIndex == 0,
                                onSelected: (sel) {
                                  if (sel) setState(() => _activeBalanceTabIndex = 0);
                                },
                              ),
                              const SizedBox(width: 10),
                              ChoiceChip(
                                label: const Text('ড্রাইভ ব্যালেন্স (Drive)'),
                                selected: _activeBalanceTabIndex == 1,
                                onSelected: (sel) {
                                  if (sel) setState(() => _activeBalanceTabIndex = 1);
                                },
                              ),
                            ],
                          ),
                          const SizedBox(height: 8),
                          Row(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Text(
                                wallet.isBalanceVisible
                                    ? (_activeBalanceTabIndex == 0
                                        ? '৳ \${wallet.mainBalance.toStringAsFixed(2)}'
                                        : '৳ \${wallet.driveBalance.toStringAsFixed(2)}')
                                    : '৳ ••••••••',
                                style: const TextStyle(
                                  fontSize: 24,
                                  fontWeight: FontWeight.bold,
                                  color: Color(0xFF0D47A1),
                                ),
                              ),
                              const SizedBox(width: 10),
                              Icon(
                                wallet.isBalanceVisible ? Icons.visibility_off : Icons.visibility,
                                color: Colors.grey.shade600,
                                size: 20,
                              ),
                            ],
                          ),
                          Text(
                            wallet.isBalanceVisible ? 'ট্যাপ করে ব্যালেন্স লুকান' : 'ব্যালেন্স দেখতে ট্যাপ করুন',
                            style: TextStyle(fontSize: 11, color: Colors.grey.shade500),
                          ),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            ),

            // Dynamic Scrolling Marquee Notice Board
            Container(
              height: 36,
              color: const Color(0xFFFFF3CD),
              padding: const EdgeInsets.symmetric(horizontal: 8),
              child: Row(
                children: [
                  const Icon(Icons.campaign, color: Color(0xFF856404), size: 20),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Marquee(
                      text: '📢 নোটিশ: রবি ও এয়ারটেল স্পেশাল ড্রাইভ অফারে ক্যাশব্যাক চলছে! সার্ভার ১০০% ফাস্ট ও সচল।',
                      style: const TextStyle(fontWeight: FontWeight.w600, color: Color(0xFF856404), fontSize: 13),
                      scrollAxis: Axis.horizontal,
                      blankSpace: 40.0,
                      velocity: 35.0,
                      pauseAfterRound: const Duration(seconds: 1),
                    ),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 16),

            // Quick Action Grid
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('সার্ভিস সমূহ (Quick Services)', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                  const SizedBox(height: 12),
                  GridView.count(
                    shrinkWrap: true,
                    physics: const NeverScrollableScrollPhysics(),
                    crossAxisCount: 3,
                    childAspectRatio: 0.95,
                    crossAxisSpacing: 12,
                    mainAxisSpacing: 12,
                    children: [
                      _buildActionItem(
                        icon: Icons.phone_android,
                        title: 'Flexiload',
                        subtitle: 'রিচার্জ',
                        color: const Color(0xFF00A3E0),
                        onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const FlexiloadScreen())),
                      ),
                      _buildActionItem(
                        icon: Icons.local_offer,
                        title: 'Drive Pack',
                        subtitle: 'অফার প্যাক',
                        color: const Color(0xFFE60000),
                        onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const DrivePackScreen())),
                      ),
                      _buildActionItem(
                        icon: Icons.inventory_2_outlined,
                        title: 'Regular Pack',
                        subtitle: 'রেগুলার বান্ডেল',
                        color: const Color(0xFFF37021),
                        onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const DrivePackScreen())),
                      ),
                      _buildActionItem(
                        icon: Icons.account_balance_wallet,
                        title: 'Add Balance',
                        subtitle: 'ব্যালেন্স যোগ',
                        color: const Color(0xFF00897B),
                        onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const AddBalanceScreen())),
                      ),
                      _buildActionItem(
                        icon: Icons.swap_horiz,
                        title: 'Transfer',
                        subtitle: 'ব্যালেন্স ট্রান্সফার',
                        color: const Color(0xFF6A1B9A),
                        onTap: () {
                          ScaffoldMessenger.of(context).showSnackBar(
                            const SnackBar(content: Text('Balance Transfer module activated.')),
                          );
                        },
                      ),
                      _buildActionItem(
                        icon: Icons.receipt_long,
                        title: 'History',
                        subtitle: 'লেনদেন হিস্ট্রি',
                        color: const Color(0xFF37474F),
                        onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const HistoryScreen())),
                      ),
                    ],
                  ),
                ],
              ),
            ),

            const SizedBox(height: 20),

            // Recent Transactions preview
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text('সাম্প্রতিক লেনদেন (Recent)', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                  TextButton(
                    onPressed: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const HistoryScreen())),
                    child: const Text('সব দেখুন (View All)'),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 8),

            // Transaction Cards List
            ListView.builder(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              padding: const EdgeInsets.symmetric(horizontal: 16),
              itemCount: wallet.transactions.take(4).length,
              itemBuilder: (context, index) {
                final txn = wallet.transactions[index];
                return Card(
                  margin: const EdgeInsets.only(bottom: 10),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  child: ListTile(
                    leading: CircleAvatar(
                      backgroundColor: txn.status.name == 'success'
                          ? Colors.green.shade50
                          : txn.status.name == 'pending'
                              ? Colors.amber.shade50
                              : Colors.red.shade50,
                      child: Icon(
                        txn.status.name == 'success'
                            ? Icons.check
                            : txn.status.name == 'pending'
                                ? Icons.hourglass_top
                                : Icons.close,
                        color: txn.status.name == 'success'
                            ? Colors.green
                            : txn.status.name == 'pending'
                                ? Colors.amber.shade800
                                : Colors.red,
                      ),
                    ),
                    title: Text(txn.title, style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 14)),
                    subtitle: Text('\${txn.recipientOrSenderNumber} • \${txn.status.name.toUpperCase()}'),
                    trailing: Text(
                      '৳\${txn.amount.toStringAsFixed(0)}',
                      style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15),
                    ),
                  ),
                );
              },
            ),
            const SizedBox(height: 30),
          ],
        ),
      ),
    );
  }

  Widget _buildActionItem({
    required IconData icon,
    required String title,
    required String subtitle,
    required Color color,
    required VoidCallback onTap,
  }) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(16),
      child: Container(
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(16),
          boxShadow: [
            BoxShadow(color: Colors.black.withOpacity(0.04), blurRadius: 8, offset: const Offset(0, 2)),
          ],
        ),
        padding: const EdgeInsets.all(12),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(
                color: color.withOpacity(0.12),
                shape: BoxShape.circle,
              ),
              child: Icon(icon, color: color, size: 26),
            ),
            const SizedBox(height: 8),
            Text(title, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
            Text(subtitle, style: TextStyle(color: Colors.grey.shade500, fontSize: 11)),
          ],
        ),
      ),
    );
  }
}
`;

export const flexiloadScreenDart = `// lib/screens/flexiload_screen.dart
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../models/transaction_model.dart';
import '../providers/auth_provider.dart';
import '../providers/wallet_provider.dart';
import '../widgets/slide_to_confirm_button.dart';

class FlexiloadScreen extends StatefulWidget {
  const FlexiloadScreen({super.key});

  @override
  State<FlexiloadScreen> createState() => _FlexiloadScreenState();
}

class _FlexiloadScreenState extends State<FlexiloadScreen> {
  final _phoneController = TextEditingController();
  final _amountController = TextEditingController();
  TelecomOperator _selectedOperator = TelecomOperator.gp;
  ConnectionType _selectedConnectionType = ConnectionType.prepaid;
  final List<int> _quickAmounts = [20, 50, 100, 200, 500];

  @override
  void initState() {
    super.initState();
    _phoneController.addListener(_autoDetectOperator);
  }

  // Bangladesh Operator Prefix Detection
  void _autoDetectOperator() {
    final text = _phoneController.text.replaceAll(RegExp(r'[^0-9]'), '');
    if (text.length >= 3) {
      final prefix = text.substring(0, 3);
      setState(() {
        if (prefix == '017' || prefix == '013') {
          _selectedOperator = TelecomOperator.gp;
        } else if (prefix == '018') {
          _selectedOperator = TelecomOperator.robi;
        } else if (prefix == '019' || prefix == '014') {
          _selectedOperator = TelecomOperator.banglalink;
        } else if (prefix == '016') {
          _selectedOperator = TelecomOperator.airtel;
        } else if (prefix == '015') {
          _selectedOperator = TelecomOperator.teletalk;
        }
      });
    }
  }

  void _showConfirmationBottomSheet() {
    final phone = _phoneController.text.trim();
    final amount = double.tryParse(_amountController.text.trim()) ?? 0;

    if (phone.length != 11) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please enter a valid 11-digit mobile number')),
      );
      return;
    }
    if (amount < 10) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Minimum recharge amount is ৳10')),
      );
      return;
    }

    final pinController = TextEditingController();

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => Container(
        padding: EdgeInsets.only(
          left: 20,
          right: 20,
          top: 24,
          bottom: MediaQuery.of(ctx).viewInsets.bottom + 24,
        ),
        decoration: const BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Center(
              child: Container(width: 40, height: 4, decoration: BoxDecoration(color: Colors.grey.shade300, borderRadius: BorderRadius.circular(2))),
            ),
            const SizedBox(height: 16),
            const Text('Confirm Flexiload Recharge', textAlign: TextAlign.center, style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18)),
            const SizedBox(height: 16),
            _summaryRow('Recipient Number', phone),
            _summaryRow('Operator', _selectedOperator.name.toUpperCase()),
            _summaryRow('Connection Type', _selectedConnectionType.name.toUpperCase()),
            _summaryRow('Recharge Amount', '৳ \${amount.toStringAsFixed(2)}'),
            _summaryRow('Fee', '৳ 0.00'),
            const Divider(height: 24),

            // 4-Digit Security PIN
            TextField(
              controller: pinController,
              keyboardType: TextInputType.number,
              obscureText: true,
              maxLength: 4,
              decoration: InputDecoration(
                prefixIcon: const Icon(Icons.lock_clock),
                hintText: 'Enter 4-Digit PIN to confirm',
                counterText: '',
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
              ),
            ),
            const SizedBox(height: 20),

            // Hold / Slide to Confirm Widget
            SlideToConfirmButton(
              label: 'Slide to Confirm Recharge >>',
              onConfirmed: () async {
                final auth = Provider.of<AuthProvider>(context, listen: false);
                final wallet = Provider.of<WalletProvider>(context, listen: false);

                if (!auth.verifyTransactionPin(pinController.text.trim())) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('Invalid Security PIN! Try 1234.')),
                  );
                  return;
                }

                Navigator.pop(ctx); // close bottom sheet

                final success = await wallet.executeRecharge(
                  uid: auth.currentUser?.uid ?? 'guest',
                  phone: phone,
                  telecomOperator: _selectedOperator,
                  connectionType: _selectedConnectionType,
                  amount: amount,
                );

                if (success && mounted) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(
                      content: Text('Recharge of ৳\$amount to \$phone Successful!'),
                      backgroundColor: Colors.green,
                    ),
                  );
                  _phoneController.clear();
                  _amountController.clear();
                }
              },
            ),
          ],
        ),
      ),
    );
  }

  Widget _summaryRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: TextStyle(color: Colors.grey.shade600)),
          Text(value, style: const TextStyle(fontWeight: FontWeight.bold)),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Flexiload / Top-Up')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Mobile Number Input + Contacts Icon
            const Text('Mobile Number (গ্রাহকের নম্বর)', style: TextStyle(fontWeight: FontWeight.w600)),
            const SizedBox(height: 8),
            TextField(
              controller: _phoneController,
              keyboardType: TextInputType.phone,
              maxLength: 11,
              decoration: InputDecoration(
                prefixIcon: const Icon(Icons.dialpad),
                suffixIcon: IconButton(
                  icon: const Icon(Icons.contacts, color: Color(0xFF0D47A1)),
                  onPressed: () {
                    // Simulating Phone contacts picker
                    _phoneController.text = '01712345678';
                  },
                ),
                hintText: '01XXXXXXXXX',
                counterText: '',
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
              ),
            ),
            const SizedBox(height: 20),

            // Operator Selector
            const Text('Operator (অপারেটর নির্বাচন)', style: TextStyle(fontWeight: FontWeight.w600)),
            const SizedBox(height: 8),
            SegmentedButton<TelecomOperator>(
              segments: const [
                ButtonSegment(value: TelecomOperator.gp, label: Text('GP')),
                ButtonSegment(value: TelecomOperator.robi, label: Text('Robi')),
                ButtonSegment(value: TelecomOperator.banglalink, label: Text('BL')),
                ButtonSegment(value: TelecomOperator.airtel, label: Text('Airtel')),
                ButtonSegment(value: TelecomOperator.teletalk, label: Text('TT')),
              ],
              selected: {_selectedOperator},
              onSelectionChanged: (set) => setState(() => _selectedOperator = set.first),
            ),
            const SizedBox(height: 20),

            // Connection Type (Prepaid / Postpaid / Skitto)
            const Text('Connection Type (সংযোগের ধরন)', style: TextStyle(fontWeight: FontWeight.w600)),
            const SizedBox(height: 8),
            Row(
              children: ConnectionType.values.map((type) {
                final isSelected = _selectedConnectionType == type;
                return Expanded(
                  child: Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 4),
                    child: ChoiceChip(
                      label: Text(type.name.toUpperCase()),
                      selected: isSelected,
                      onSelected: (sel) {
                        if (sel) setState(() => _selectedConnectionType = type);
                      },
                    ),
                  ),
                );
              }).toList(),
            ),
            const SizedBox(height: 20),

            // Amount Input
            const Text('Recharge Amount (টাকার পরিমাণ)', style: TextStyle(fontWeight: FontWeight.w600)),
            const SizedBox(height: 8),
            TextField(
              controller: _amountController,
              keyboardType: TextInputType.number,
              decoration: InputDecoration(
                prefixText: '৳ ',
                hintText: '0.00',
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
              ),
            ),
            const SizedBox(height: 12),

            // Quick Amount Chips
            Wrap(
              spacing: 8,
              children: _quickAmounts.map((amt) {
                return ActionChip(
                  label: Text('৳\$amt'),
                  onPressed: () => _amountController.text = amt.toString(),
                );
              }).toList(),
            ),
            const SizedBox(height: 36),

            ElevatedButton(
              onPressed: _showConfirmationBottomSheet,
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF0D47A1),
                foregroundColor: Colors.white,
                padding: const EdgeInsets.symmetric(vertical: 16),
              ),
              child: const Text('Proceed to Confirm (এগিয়ে যান)', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
            ),
          ],
        ),
      ),
    );
  }
}
`;

export const drivePackScreenDart = `// lib/screens/drive_pack_screen.dart
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../models/transaction_model.dart';
import '../models/drive_package_model.dart';
import '../providers/auth_provider.dart';
import '../providers/wallet_provider.dart';
import '../widgets/slide_to_confirm_button.dart';

class DrivePackScreen extends StatefulWidget {
  const DrivePackScreen({super.key});

  @override
  State<DrivePackScreen> createState() => _DrivePackScreenState();
}

class _DrivePackScreenState extends State<DrivePackScreen> with SingleTickerProviderStateMixin {
  late TabController _tabController;
  final List<TelecomOperator> _operators = [
    TelecomOperator.gp,
    TelecomOperator.robi,
    TelecomOperator.banglalink,
    TelecomOperator.airtel,
    TelecomOperator.teletalk,
  ];

  // Mock list of drive packages
  final List<DrivePackageModel> _mockPacks = [
    DrivePackageModel(
      id: 'gp-1',
      telecomOperator: TelecomOperator.gp,
      title: '50 GB + 1000 Min Family Combo',
      dataAllowance: '50 GB',
      minuteAllowance: '1000 Min',
      validity: '30 Days',
      regularPrice: 899,
      offerPrice: 779,
      cashback: 120,
      category: 'combo',
    ),
    DrivePackageModel(
      id: 'gp-2',
      telecomOperator: TelecomOperator.gp,
      title: '30 GB Dhamaka Internet Pack',
      dataAllowance: '30 GB',
      minuteAllowance: '0 Min',
      validity: '30 Days',
      regularPrice: 499,
      offerPrice: 419,
      cashback: 80,
      category: 'internet',
    ),
    DrivePackageModel(
      id: 'robi-1',
      telecomOperator: TelecomOperator.robi,
      title: '60 GB + 1200 Min VIP Drive Pack',
      dataAllowance: '60 GB',
      minuteAllowance: '1200 Min',
      validity: '30 Days',
      regularPrice: 998,
      offerPrice: 848,
      cashback: 150,
      category: 'combo',
    ),
    DrivePackageModel(
      id: 'bl-1',
      telecomOperator: TelecomOperator.banglalink,
      title: '45 GB + 800 Min Power Pack',
      dataAllowance: '45 GB',
      minuteAllowance: '800 Min',
      validity: '30 Days',
      regularPrice: 799,
      offerPrice: 679,
      cashback: 120,
      category: 'combo',
    ),
    DrivePackageModel(
      id: 'airtel-1',
      telecomOperator: TelecomOperator.airtel,
      title: '55 GB + 900 Min Unlimited Fun',
      dataAllowance: '55 GB',
      minuteAllowance: '900 Min',
      validity: '30 Days',
      regularPrice: 848,
      offerPrice: 708,
      cashback: 140,
      category: 'combo',
    ),
    DrivePackageModel(
      id: 'teletalk-1',
      telecomOperator: TelecomOperator.teletalk,
      title: '30 GB + 500 Min Shadhinota Bundle',
      dataAllowance: '30 GB',
      minuteAllowance: '500 Min',
      validity: '30 Days',
      regularPrice: 497,
      offerPrice: 427,
      cashback: 70,
      category: 'combo',
    ),
  ];

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: _operators.length, vsync: this);
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  void _showBuyPackageModal(DrivePackageModel pack) {
    final phoneController = TextEditingController();
    final pinController = TextEditingController();

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => Container(
        padding: EdgeInsets.only(
          left: 20,
          right: 20,
          top: 24,
          bottom: MediaQuery.of(ctx).viewInsets.bottom + 24,
        ),
        decoration: const BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Center(
              child: Container(width: 40, height: 4, decoration: BoxDecoration(color: Colors.grey.shade300, borderRadius: BorderRadius.circular(2))),
            ),
            const SizedBox(height: 16),
            Text('Activate Drive Offer: \${pack.title}', textAlign: TextAlign.center, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
            const SizedBox(height: 16),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text('Offer Price (মূল্য):', style: TextStyle(color: Colors.grey)),
                Text('৳\${pack.offerPrice.toStringAsFixed(0)}', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
              ],
            ),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text('Cashback Commission:', style: TextStyle(color: Colors.green)),
                Text('+৳\${pack.cashback.toStringAsFixed(0)}', style: const TextStyle(fontWeight: FontWeight.bold, color: Colors.green, fontSize: 16)),
              ],
            ),
            const Divider(height: 20),

            TextField(
              controller: phoneController,
              keyboardType: TextInputType.phone,
              maxLength: 11,
              decoration: InputDecoration(
                prefixIcon: const Icon(Icons.phone_android),
                hintText: 'Customer Mobile (01XXXXXXXXX)',
                counterText: '',
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
              ),
            ),
            const SizedBox(height: 12),
            TextField(
              controller: pinController,
              keyboardType: TextInputType.number,
              obscureText: true,
              maxLength: 4,
              decoration: InputDecoration(
                prefixIcon: const Icon(Icons.lock),
                hintText: 'Enter 4-Digit PIN',
                counterText: '',
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
              ),
            ),
            const SizedBox(height: 20),

            SlideToConfirmButton(
              label: 'Slide to Purchase Pack >>',
              onConfirmed: () async {
                final auth = Provider.of<AuthProvider>(context, listen: false);
                final wallet = Provider.of<WalletProvider>(context, listen: false);

                if (phoneController.text.trim().length != 11) {
                  ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Invalid customer phone number')));
                  return;
                }
                if (!auth.verifyTransactionPin(pinController.text.trim())) {
                  ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Incorrect Security PIN! Try 1234')));
                  return;
                }

                Navigator.pop(ctx);
                final ok = await wallet.buyDrivePack(
                  uid: auth.currentUser?.uid ?? 'user',
                  recipientPhone: phoneController.text.trim(),
                  pack: pack,
                );

                if (ok && mounted) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(
                      content: Text('Drive Pack "\${pack.title}" submitted successfully!'),
                      backgroundColor: Colors.green,
                    ),
                  );
                }
              },
            ),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Drive Packs & Offers'),
        bottom: TabBar(
          controller: _tabController,
          isScrollable: true,
          labelColor: Colors.white,
          indicatorColor: Colors.white,
          tabs: _operators.map((op) => Tab(text: op.name.toUpperCase())).toList(),
        ),
      ),
      body: TabBarView(
        controller: _tabController,
        children: _operators.map((operator) {
          final packs = _mockPacks.where((p) => p.telecomOperator == operator).toList();
          if (packs.isEmpty) {
            return const Center(child: Text('No active drive offers for this operator.'));
          }

          return ListView.builder(
            padding: const EdgeInsets.all(16),
            itemCount: packs.length,
            itemBuilder: (context, index) {
              final pack = packs[index];
              return Card(
                elevation: 2,
                margin: const EdgeInsets.only(bottom: 14),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Expanded(
                            child: Text(
                              pack.title,
                              style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                            ),
                          ),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                            decoration: BoxDecoration(
                              color: Colors.green.shade50,
                              borderRadius: BorderRadius.circular(20),
                              border: BorderSide(color: Colors.green.shade300),
                            ),
                            child: Text(
                              '৳\${pack.cashback.toStringAsFixed(0)} Cashback',
                              style: TextStyle(color: Colors.green.shade800, fontWeight: FontWeight.bold, fontSize: 12),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 10),
                      Row(
                        children: [
                          Icon(Icons.wifi, size: 16, color: Colors.grey.shade600),
                          const SizedBox(width: 4),
                          Text(pack.dataAllowance, style: const TextStyle(fontWeight: FontWeight.w500)),
                          const SizedBox(width: 16),
                          Icon(Icons.phone_in_talk, size: 16, color: Colors.grey.shade600),
                          const SizedBox(width: 4),
                          Text(pack.minuteAllowance, style: const TextStyle(fontWeight: FontWeight.w500)),
                          const SizedBox(width: 16),
                          Icon(Icons.calendar_today, size: 16, color: Colors.grey.shade600),
                          const SizedBox(width: 4),
                          Text(pack.validity, style: const TextStyle(fontWeight: FontWeight.w500)),
                        ],
                      ),
                      const SizedBox(height: 16),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                '৳\${pack.regularPrice.toStringAsFixed(0)}',
                                style: const TextStyle(decoration: TextDecoration.lineThrough, color: Colors.grey, fontSize: 12),
                              ),
                              Text(
                                '৳\${pack.offerPrice.toStringAsFixed(0)}',
                                style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 20, color: Color(0xFF0D47A1)),
                              ),
                            ],
                          ),
                          ElevatedButton.icon(
                            onPressed: () => _showBuyPackageModal(pack),
                            icon: const Icon(Icons.flash_on, size: 18),
                            label: const Text('Activate / Buy'),
                            style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF0D47A1), foregroundColor: Colors.white),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              );
            },
          );
        }).toList(),
      ),
    );
  }
}
`;

export const addBalanceScreenDart = `// lib/screens/add_balance_screen.dart
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:provider/provider.dart';
import '../models/transaction_model.dart';
import '../providers/auth_provider.dart';
import '../providers/wallet_provider.dart';

class AddBalanceScreen extends StatefulWidget {
  const AddBalanceScreen({super.key});

  @override
  State<AddBalanceScreen> createState() => _AddBalanceScreenState();
}

class _AddBalanceScreenState extends State<AddBalanceScreen> with SingleTickerProviderStateMixin {
  late TabController _methodTabController;
  final _senderPhoneController = TextEditingController();
  final _amountController = TextEditingController();
  final _trxIdController = TextEditingController();
  BalanceType _selectedBalanceType = BalanceType.main;

  final Map<String, Map<String, String>> _adminNumbers = {
    'bKash': {
      'Personal': '01711-223344',
      'Merchant': '01799-887766',
      'Instructions': 'Send Money (Personal) অথবা Payment (Merchant) করুন। TrxID কপি করে সাবমিট করুন।',
    },
    'Nagad': {
      'Personal': '01822-334455',
      'Merchant': '01877-665544',
      'Instructions': 'Nagad Send Money করে ফিরতি SMS এর TrxID এখানে ইনপুট দিন।',
    },
    'Rocket': {
      'Personal': '01933-4455667',
      'Instructions': 'Rocket Send Money সম্পন্ন করার পর ট্রানজেকশন আইডি দিন।',
    }
  };

  @override
  void initState() {
    super.initState();
    _methodTabController = TabController(length: 3, vsync: this);
  }

  void _copyToClipboard(String text, String label) {
    Clipboard.setData(ClipboardData(text: text.replaceAll('-', '')));
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text('\$label copied to clipboard!')),
    );
  }

  void _submitAddBalance() async {
    final senderPhone = _senderPhoneController.text.trim();
    final amount = double.tryParse(_amountController.text.trim()) ?? 0;
    final trxId = _trxIdController.text.trim();
    final currentMethod = ['bKash', 'Nagad', 'Rocket'][_methodTabController.index];

    if (senderPhone.length < 11) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Enter valid sender mobile number')));
      return;
    }
    if (amount < 100) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Minimum Add Balance is ৳100')));
      return;
    }
    if (trxId.length < 6) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Please enter valid TrxID from SMS')));
      return;
    }

    final auth = Provider.of<AuthProvider>(context, listen: false);
    final wallet = Provider.of<WalletProvider>(context, listen: false);

    final ok = await wallet.requestAddBalance(
      uid: auth.currentUser?.uid ?? 'user',
      senderNumber: senderPhone,
      amount: amount,
      trxId: trxId,
      paymentMethod: currentMethod,
      balanceType: _selectedBalanceType,
    );

    if (ok && mounted) {
      showDialog(
        context: context,
        builder: (ctx) => AlertDialog(
          title: const Row(
            children: [
              Icon(Icons.check_circle, color: Colors.green),
              SizedBox(width: 8),
              Text('Request Submitted'),
            ],
          ),
          content: Text(
            'Your add balance request for ৳\$amount (\$currentMethod) with TrxID: \$trxId has been submitted. It will be verified within 2-5 minutes.',
          ),
          actions: [
            TextButton(
              onPressed: () {
                Navigator.pop(ctx);
                Navigator.pop(context);
              },
              child: const Text('OK'),
            ),
          ],
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Add Balance (ব্যালেন্স যোগ)'),
        bottom: TabBar(
          controller: _methodTabController,
          tabs: const [
            Tab(text: 'bKash'),
            Tab(text: 'Nagad'),
            Tab(text: 'Rocket'),
          ],
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Admin Number Display Card
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: const Color(0xFFE8EAF6),
                borderRadius: BorderRadius.circular(16),
                border: BorderSide(color: const Color(0xFFC5CAE9)),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('Admin Payment Numbers (এডমিন নম্বর)', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 15)),
                  const SizedBox(height: 8),
                  _buildNumberRow('Personal:', '01711-223344'),
                  _buildNumberRow('Merchant:', '01799-887766'),
                  const SizedBox(height: 6),
                  Text(
                    'পেমেন্ট সম্পন্ন করে নিচের বক্সে আপনার নম্বর, টাকার পরিমাণ ও TrxID দিন।',
                    style: TextStyle(fontSize: 12, color: Colors.grey.shade700),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),

            // Select Target Balance Type (Main vs Drive)
            const Text('Deposit Target (ব্যালেন্স টাইপ নির্বাচন করুন):', style: TextStyle(fontWeight: FontWeight.w600)),
            const SizedBox(height: 8),
            Row(
              children: [
                Expanded(
                  child: ChoiceChip(
                    label: const Text('Main Balance (মেইন)'),
                    selected: _selectedBalanceType == BalanceType.main,
                    onSelected: (sel) {
                      if (sel) setState(() => _selectedBalanceType = BalanceType.main);
                    },
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: ChoiceChip(
                    label: const Text('Drive Balance (ড্রাইভ)'),
                    selected: _selectedBalanceType == BalanceType.drive,
                    onSelected: (sel) {
                      if (sel) setState(() => _selectedBalanceType = BalanceType.drive);
                    },
                  ),
                ),
              ],
            ),
            const SizedBox(height: 20),

            // Sender Phone Number
            const Text('Sender Mobile Number (প্রেরক নম্বর)', style: TextStyle(fontWeight: FontWeight.w600)),
            const SizedBox(height: 6),
            TextField(
              controller: _senderPhoneController,
              keyboardType: TextInputType.phone,
              maxLength: 11,
              decoration: InputDecoration(
                hintText: '01XXXXXXXXX',
                counterText: '',
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
              ),
            ),
            const SizedBox(height: 16),

            // Amount
            const Text('Amount (টাকার পরিমাণ)', style: TextStyle(fontWeight: FontWeight.w600)),
            const SizedBox(height: 6),
            TextField(
              controller: _amountController,
              keyboardType: TextInputType.number,
              decoration: InputDecoration(
                prefixText: '৳ ',
                hintText: 'Minimum ৳100',
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
              ),
            ),
            const SizedBox(height: 16),

            // Transaction ID (TrxID)
            const Text('Transaction ID (TrxID)', style: TextStyle(fontWeight: FontWeight.w600)),
            const SizedBox(height: 6),
            TextField(
              controller: _trxIdController,
              textCapitalization: TextCapitalization.characters,
              decoration: InputDecoration(
                hintText: 'e.g. BK8912A34',
                suffixIcon: IconButton(
                  icon: const Icon(Icons.paste),
                  onPressed: () async {
                    final data = await Clipboard.getData(Clipboard.kTextPlain);
                    if (data?.text != null) {
                      _trxIdController.text = data!.text!.trim();
                    }
                  },
                ),
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
              ),
            ),
            const SizedBox(height: 30),

            ElevatedButton(
              onPressed: _submitAddBalance,
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF0D47A1),
                foregroundColor: Colors.white,
                padding: const EdgeInsets.symmetric(vertical: 16),
              ),
              child: const Text('Submit Request (রিকোয়েস্ট পাঠান)', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildNumberRow(String type, String num) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text('\$type \$num', style: const TextStyle(fontWeight: FontWeight.w600)),
        IconButton(
          icon: const Icon(Icons.copy, size: 18, color: Color(0xFF0D47A1)),
          onPressed: () => _copyToClipboard(num, type),
        ),
      ],
    );
  }
}
`;

export const historyScreenDart = `// lib/screens/history_screen.dart
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';
import '../models/transaction_model.dart';
import '../providers/wallet_provider.dart';

class HistoryScreen extends StatefulWidget {
  const HistoryScreen({super.key});

  @override
  State<HistoryScreen> createState() => _HistoryScreenState();
}

class _HistoryScreenState extends State<HistoryScreen> with SingleTickerProviderStateMixin {
  late TabController _tabController;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 4, vsync: this);
  }

  @override
  Widget build(BuildContext context) {
    final wallet = context.watch<WalletProvider>();
    final allTransactions = wallet.transactions;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Transaction History'),
        bottom: TabBar(
          controller: _tabController,
          tabs: const [
            Tab(text: 'All'),
            Tab(text: 'Recharge'),
            Tab(text: 'Add Balance'),
            Tab(text: 'Drive Orders'),
          ],
        ),
      ),
      body: TabBarView(
        controller: _tabController,
        children: [
          _buildTransactionList(allTransactions),
          _buildTransactionList(allTransactions.where((t) => t.type == TransactionType.recharge).toList()),
          _buildTransactionList(allTransactions.where((t) => t.type == TransactionType.addBalance).toList()),
          _buildTransactionList(allTransactions.where((t) => t.type == TransactionType.drivePack).toList()),
        ],
      ),
    );
  }

  Widget _buildTransactionList(List<TransactionModel> list) {
    if (list.isEmpty) {
      return const Center(child: Text('No transactions found in this category.'));
    }

    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: list.length,
      itemBuilder: (context, index) {
        final txn = list[index];
        return Card(
          margin: const EdgeInsets.only(bottom: 12),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
          child: ExpansionTile(
            leading: CircleAvatar(
              backgroundColor: _getStatusColor(txn.status).withOpacity(0.15),
              child: Icon(_getStatusIcon(txn.status), color: _getStatusColor(txn.status)),
            ),
            title: Text(txn.title, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
            subtitle: Text('\${txn.recipientOrSenderNumber} • \${DateFormat('d MMM, h:mm a').format(txn.timestamp)}'),
            trailing: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              crossAxisAlignment: CrossAxisAlignment.end,
              children: [
                Text(
                  '৳\${txn.amount.toStringAsFixed(0)}',
                  style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15),
                ),
                _buildStatusBadge(txn.status),
              ],
            ),
            children: [
              Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  children: [
                    _detailRow('Transaction ID', txn.trxId ?? txn.id),
                    _detailRow('Wallet Type', txn.balanceType.name.toUpperCase()),
                    if (txn.cashback > 0) _detailRow('Cashback', '৳\${txn.cashback.toStringAsFixed(0)}'),
                    if (txn.paymentMethod != null) _detailRow('Gateway', txn.paymentMethod!),
                    if (txn.note != null) _detailRow('Note', txn.note!),
                  ],
                ),
              ),
            ],
          ),
        );
      },
    );
  }

  Widget _buildStatusBadge(TransactionStatus status) {
    Color bg;
    Color fg;
    String label;

    switch (status) {
      case TransactionStatus.success:
        bg = Colors.green.shade100;
        fg = Colors.green.shade900;
        label = 'SUCCESS';
        break;
      case TransactionStatus.pending:
        bg = Colors.amber.shade100;
        fg = Colors.amber.shade900;
        label = 'PENDING';
        break;
      case TransactionStatus.cancelled:
        bg = Colors.red.shade100;
        fg = Colors.red.shade900;
        label = 'CANCELLED';
        break;
    }

    return Container(
      margin: const EdgeInsets.only(top: 4),
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
      decoration: BoxDecoration(color: bg, borderRadius: BorderRadius.circular(6)),
      child: Text(label, style: TextStyle(color: fg, fontSize: 10, fontWeight: FontWeight.bold)),
    );
  }

  Color _getStatusColor(TransactionStatus status) {
    switch (status) {
      case TransactionStatus.success: return Colors.green;
      case TransactionStatus.pending: return Colors.amber.shade800;
      case TransactionStatus.cancelled: return Colors.red;
    }
  }

  IconData _getStatusIcon(TransactionStatus status) {
    switch (status) {
      case TransactionStatus.success: return Icons.check_circle;
      case TransactionStatus.pending: return Icons.access_time_filled;
      case TransactionStatus.cancelled: return Icons.cancel;
    }
  }

  Widget _detailRow(String title, String val) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 3),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(title, style: TextStyle(color: Colors.grey.shade600, fontSize: 12)),
          Text(val, style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 12)),
        ],
      ),
    );
  }
}
`;

export const slideToConfirmDart = `// lib/widgets/slide_to_confirm_button.dart
import 'package:flutter/material.dart';

class SlideToConfirmButton extends StatefulWidget {
  final String label;
  final VoidCallback onConfirmed;

  const SlideToConfirmButton({
    super.key,
    required this.label,
    required this.onConfirmed,
  });

  @override
  State<SlideToConfirmButton> createState() => _SlideToConfirmButtonState();
}

class _SlideToConfirmButtonState extends State<SlideToConfirmButton> {
  double _position = 0.0;
  bool _isFinished = false;

  @override
  Widget build(BuildContext context) {
    const double buttonHeight = 56.0;
    const double knobSize = 48.0;

    return LayoutBuilder(
      builder: (context, constraints) {
        final maxPosition = constraints.maxWidth - knobSize - 8.0;

        return Container(
          height: buttonHeight,
          decoration: BoxDecoration(
            color: const Color(0xFF0D47A1).withOpacity(0.15),
            borderRadius: BorderRadius.circular(30),
          ),
          child: Stack(
            alignment: Alignment.centerLeft,
            children: [
              Center(
                child: Text(
                  _isFinished ? 'Verified!' : widget.label,
                  style: const TextStyle(
                    color: Color(0xFF0D47A1),
                    fontWeight: FontWeight.bold,
                    fontSize: 14,
                  ),
                ),
              ),
              Positioned(
                left: _position + 4.0,
                child: GestureDetector(
                  onHorizontalDragUpdate: (details) {
                    if (_isFinished) return;
                    setState(() {
                      _position = (_position + details.delta.dx).clamp(0.0, maxPosition);
                    });
                  },
                  onHorizontalDragEnd: (details) {
                    if (_position >= maxPosition * 0.85) {
                      setState(() {
                        _position = maxPosition;
                        _isFinished = true;
                      });
                      widget.onConfirmed();
                    } else {
                      setState(() {
                        _position = 0.0;
                      });
                    }
                  },
                  child: Container(
                    width: knobSize,
                    height: knobSize,
                    decoration: const BoxDecoration(
                      color: Color(0xFF0D47A1),
                      shape: BoxShape.circle,
                      boxShadow: [
                        BoxShadow(color: Colors.black26, blurRadius: 4, offset: Offset(0, 2)),
                      ],
                    ),
                    child: Icon(
                      _isFinished ? Icons.check : Icons.arrow_forward_ios,
                      color: Colors.white,
                      size: 20,
                    ),
                  ),
                ),
              ),
            ],
          ),
        );
      },
    );
  }
}
`;
