import { pubspecYaml } from './pubspec';
import { userModelDart, transactionModelDart, drivePackageModelDart } from './models';
import { firebaseServiceDart, authProviderDart, walletProviderDart } from './servicesAndProviders';
import {
  mainDart,
  authScreenDart,
  homeDashboardDart,
  flexiloadScreenDart,
  drivePackScreenDart,
  addBalanceScreenDart,
  historyScreenDart,
  slideToConfirmDart,
} from './screensDart';

export interface FlutterCodeFile {
  path: string;
  name: string;
  category: 'config' | 'entry' | 'model' | 'service' | 'provider' | 'screen' | 'widget';
  language: 'yaml' | 'dart';
  description: string;
  content: string;
}

export const FLUTTER_CODE_FILES: FlutterCodeFile[] = [
  {
    path: 'pubspec.yaml',
    name: 'pubspec.yaml',
    category: 'config',
    language: 'yaml',
    description: 'Flutter dependencies including Firebase, Provider, local_auth, marquee, etc.',
    content: pubspecYaml,
  },
  {
    path: 'lib/main.dart',
    name: 'main.dart',
    category: 'entry',
    language: 'dart',
    description: 'Application entry point with MultiProvider setup and Material 3 theme configuration.',
    content: mainDart,
  },
  {
    path: 'lib/models/user_model.dart',
    name: 'user_model.dart',
    category: 'model',
    language: 'dart',
    description: 'User profile data model with Firestore serialization, Main & Drive balance properties.',
    content: userModelDart,
  },
  {
    path: 'lib/models/transaction_model.dart',
    name: 'transaction_model.dart',
    category: 'model',
    language: 'dart',
    description: 'Comprehensive transaction model supporting Recharge, Add Balance, Drive Packs, and status badges.',
    content: transactionModelDart,
  },
  {
    path: 'lib/models/drive_package_model.dart',
    name: 'drive_package_model.dart',
    category: 'model',
    language: 'dart',
    description: 'Drive Package model for Bangladesh operators (GP, Robi, BL, Airtel, Teletalk) with cashback metadata.',
    content: drivePackageModelDart,
  },
  {
    path: 'lib/services/firebase_service.dart',
    name: 'firebase_service.dart',
    category: 'service',
    language: 'dart',
    description: 'Atomic Firestore transactions, Firebase Auth integration, and FCM push notifications.',
    content: firebaseServiceDart,
  },
  {
    path: 'lib/providers/auth_provider.dart',
    name: 'auth_provider.dart',
    category: 'provider',
    language: 'dart',
    description: 'State management for phone + 6-digit PIN login, local_auth biometrics, and secure session persistence.',
    content: authProviderDart,
  },
  {
    path: 'lib/providers/wallet_provider.dart',
    name: 'wallet_provider.dart',
    category: 'provider',
    language: 'dart',
    description: 'State management for Main Balance & Drive Balance, Flexiload execution, and TrxID validation.',
    content: walletProviderDart,
  },
  {
    path: 'lib/screens/auth_screen.dart',
    name: 'auth_screen.dart',
    category: 'screen',
    language: 'dart',
    description: 'Screen 1: Phone number + 6-digit PIN authentication with biometric fingerprint toggle.',
    content: authScreenDart,
  },
  {
    path: 'lib/screens/home_dashboard.dart',
    name: 'home_dashboard.dart',
    category: 'screen',
    language: 'dart',
    description: 'Screen 2: Header with profile, Tap to View Balance toggle (Main & Drive), Quick Grid, Marquee, and Recent TXNs.',
    content: homeDashboardDart,
  },
  {
    path: 'lib/screens/flexiload_screen.dart',
    name: 'flexiload_screen.dart',
    category: 'screen',
    language: 'dart',
    description: 'Screen 3: Prefix auto-detection (017/013, 018, 019/014, 016, 015), Prepaid/Postpaid, and Slide-to-Confirm bottom sheet.',
    content: flexiloadScreenDart,
  },
  {
    path: 'lib/screens/drive_pack_screen.dart',
    name: 'drive_pack_screen.dart',
    category: 'screen',
    language: 'dart',
    description: 'Screen 4: Operator TabBar (GP, Robi, BL, Airtel, Teletalk), offers list with Cashback and 1-click Activate.',
    content: drivePackScreenDart,
  },
  {
    path: 'lib/screens/add_balance_screen.dart',
    name: 'add_balance_screen.dart',
    category: 'screen',
    language: 'dart',
    description: 'Screen 5: bKash, Nagad, Rocket tabs, Admin payment numbers with copy, and TrxID submission.',
    content: addBalanceScreenDart,
  },
  {
    path: 'lib/screens/history_screen.dart',
    name: 'history_screen.dart',
    category: 'screen',
    language: 'dart',
    description: 'Screen 6: Tabbed history (All, Recharge, Add Balance, Drive Orders) with Pending/Success/Cancelled badges.',
    content: historyScreenDart,
  },
  {
    path: 'lib/widgets/slide_to_confirm_button.dart',
    name: 'slide_to_confirm_button.dart',
    category: 'widget',
    language: 'dart',
    description: 'Hold/Slide-to-confirm custom interactive button for transaction confirmation.',
    content: slideToConfirmDart,
  },
];
