export const pubspecYaml = `name: telecom_reseller_user_app
description: "Production-ready Telecom Reselling & Flexiload User App for Bangladesh Operators (GP, Robi, BL, Airtel, Teletalk)."
publish_to: 'none'
version: 1.0.0+1

environment:
  sdk: '>=3.0.0 <4.0.0'

dependencies:
  flutter:
    sdk: flutter

  # State Management & DI
  provider: ^6.1.2

  # Firebase Suite
  firebase_core: ^3.1.0
  firebase_auth: ^5.1.0
  cloud_firestore: ^5.0.1
  firebase_messaging: ^15.0.1

  # Security & Biometrics
  local_auth: ^2.2.0
  flutter_secure_storage: ^9.2.2

  # UI Enhancements & Animations
  marquee: ^2.2.3
  intl: ^0.19.0
  flutter_spinkit: ^5.2.1
  cached_network_image: ^3.3.1
  google_fonts: ^6.2.1
  flutter_svg: ^2.0.10+1
  shimmer: ^3.0.0

dev_dependencies:
  flutter_test:
    sdk: flutter
  flutter_lints: ^3.0.0

flutter:
  uses-material-design: true
  assets:
    - assets/operators/
    - assets/icons/
`;
