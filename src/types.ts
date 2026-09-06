export type OperatorId = 'gp' | 'robi' | 'bl' | 'airtel' | 'teletalk';

export interface Operator {
  id: OperatorId;
  name: string;
  nameBn: string;
  color: string;
  secondaryColor: string;
  prefixes: string[];
  logoText: string;
}

export type ConnectionType = 'prepaid' | 'postpaid' | 'skitto';

export interface UserProfile {
  uid: string;
  name: string;
  phone: string;
  email: string;
  mainBalance: number;
  driveBalance: number;
  pin: string; // 4-digit or 6-digit PIN
  isBiometricEnabled: boolean;
  avatarUrl?: string;
  resellerLevel: 'Retailer' | 'Dealer' | 'DGM' | 'House';
}

export type TransactionType = 'recharge' | 'add_balance' | 'drive_pack' | 'transfer';
export type TransactionStatus = 'pending' | 'success' | 'cancelled';

export interface Transaction {
  id: string;
  type: TransactionType;
  title: string;
  recipientOrSenderNumber: string;
  operator?: OperatorId;
  connectionType?: ConnectionType;
  amount: number;
  fee?: number;
  cashback?: number;
  balanceType: 'main' | 'drive';
  status: TransactionStatus;
  timestamp: string;
  trxId?: string;
  paymentMethod?: 'bKash' | 'Nagad' | 'Rocket' | 'Wallet';
  note?: string;
}

export interface DrivePackage {
  id: string;
  operator: OperatorId;
  title: string;
  dataAllowance: string;
  minuteAllowance: string;
  smsAllowance?: string;
  validity: string;
  regularPrice: number;
  offerPrice: number;
  cashback: number;
  category: 'all' | 'internet' | 'minute' | 'combo';
  division?: string; // e.g. "All Bangladesh", "Dhaka & Ctg"
}

export interface Notice {
  id: string;
  text: string;
  type: 'info' | 'alert' | 'update';
  isActive: boolean;
}

export interface AdminPaymentNumber {
  method: 'bKash' | 'Nagad' | 'Rocket';
  personalNumber: string;
  merchantNumber?: string;
  agentNumber?: string;
  instructions: string;
}

export type ScreenId = 
  | 'auth'
  | 'home'
  | 'flexiload'
  | 'drive'
  | 'add_balance'
  | 'history'
  | 'transfer';
