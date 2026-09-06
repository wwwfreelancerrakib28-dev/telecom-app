import { Operator, OperatorId, DrivePackage, AdminPaymentNumber, UserProfile, Transaction, Notice } from '../types';

export const OPERATORS: Record<string, Operator> = {
  gp: {
    id: 'gp',
    name: 'Grameenphone',
    nameBn: 'গ্রামীণফোন',
    color: '#00a3e0',
    secondaryColor: '#e1f5fe',
    prefixes: ['017', '013'],
    logoText: 'GP',
  },
  robi: {
    id: 'robi',
    name: 'Robi',
    nameBn: 'রবি',
    color: '#e60000',
    secondaryColor: '#ffebee',
    prefixes: ['018'],
    logoText: 'Robi',
  },
  bl: {
    id: 'bl',
    name: 'Banglalink',
    nameBn: 'বাংলালিংক',
    color: '#f37021',
    secondaryColor: '#fff3e0',
    prefixes: ['019', '014'],
    logoText: 'BL',
  },
  airtel: {
    id: 'airtel',
    name: 'Airtel',
    nameBn: 'এয়ারটেল',
    color: '#d6001c',
    secondaryColor: '#fce4ec',
    prefixes: ['016'],
    logoText: 'Airtel',
  },
  teletalk: {
    id: 'teletalk',
    name: 'Teletalk',
    nameBn: 'টেলিটক',
    color: '#00873d',
    secondaryColor: '#e8f5e9',
    prefixes: ['015'],
    logoText: 'TT',
  },
};

export const INITIAL_USER: UserProfile = {
  uid: 'bd_user_9921',
  name: 'Md. Tanvir Hasan',
  phone: '01712-345678',
  email: 'tanvir.telecom@gmail.com',
  mainBalance: 1450.00,
  driveBalance: 3820.00,
  pin: '1234',
  isBiometricEnabled: true,
  resellerLevel: 'Retailer',
};

export const ADMIN_PAYMENT_NUMBERS: AdminPaymentNumber[] = [
  {
    method: 'bKash',
    personalNumber: '01711-223344',
    merchantNumber: '01799-887766',
    agentNumber: '01755-443322',
    instructions: 'bKash Send Money (Personal) অথবা Payment (Merchant) করুন। TrxID কপি করে নিচে ইনপুট দিন। মিনিমাম রিকোয়েস্ট ১০০ টাকা।'
  },
  {
    method: 'Nagad',
    personalNumber: '01822-334455',
    merchantNumber: '01877-665544',
    agentNumber: '01833-221100',
    instructions: 'Nagad Send Money করে ফিরতি মেসেজ থেকে TrxID এবং প্রেরক নম্বর দিন। ২ মিনিটের মধ্যে ব্যালেন্স যোগ হবে।'
  },
  {
    method: 'Rocket',
    personalNumber: '01933-4455667',
    agentNumber: '01988-7766550',
    instructions: 'Rocket Send Money সম্পন্ন করার পর ট্রানজেকশন আইডি দিন। ভুল তথ্যে ব্যালেন্স আটকে গেলে সাপোর্টে যোগাযোগ করুন।'
  }
];

export const INITIAL_NOTICES: Notice[] = [
  {
    id: '1',
    text: '📢 স্বাগতম! রবি ও এয়ারটেল ড্রাইভ প্যাক আজ ৫০-১৩০ টাকা পর্যন্ত স্পেশাল ক্যাশব্যাক চলছে! রিচার্জ সার্ভার সম্পূর্ণ সচল।',
    type: 'info',
    isActive: true
  },
  {
    id: '2',
    text: '⚡ নোটিশ: রাত ১১:০০ থেকে ১১:৩০ পর্যন্ত ব্যাংকিং গেটওয়ে মেইনটেন্যান্স চলবে। নগদ ও বিকাশ অটো অ্যাড ব্যালেন্স চালু আছে।',
    type: 'alert',
    isActive: true
  }
];

export const INITIAL_PACKAGES: DrivePackage[] = [
  // Grameenphone
  {
    id: 'gp-1',
    operator: 'gp',
    title: '50 GB + 1000 Min Combo',
    dataAllowance: '50 GB',
    minuteAllowance: '1000 Min',
    smsAllowance: '100 SMS',
    validity: '30 Days',
    regularPrice: 899,
    offerPrice: 779,
    cashback: 120,
    category: 'combo',
    division: 'All Bangladesh'
  },
  {
    id: 'gp-2',
    operator: 'gp',
    title: '30 GB Internet Dhamaka',
    dataAllowance: '30 GB',
    minuteAllowance: '0 Min',
    validity: '30 Days',
    regularPrice: 499,
    offerPrice: 419,
    cashback: 80,
    category: 'internet',
    division: 'All Bangladesh'
  },
  {
    id: 'gp-3',
    operator: 'gp',
    title: '800 Minutes Super Bundle',
    dataAllowance: '0 GB',
    minuteAllowance: '800 Min',
    validity: '30 Days',
    regularPrice: 539,
    offerPrice: 449,
    cashback: 90,
    category: 'minute',
    division: 'All Bangladesh'
  },
  {
    id: 'gp-4',
    operator: 'gp',
    title: '15 GB + 400 Min Family Pack',
    dataAllowance: '15 GB',
    minuteAllowance: '400 Min',
    validity: '30 Days',
    regularPrice: 599,
    offerPrice: 509,
    cashback: 90,
    category: 'combo',
    division: 'Dhaka, Ctg & Sylhet'
  },

  // Robi
  {
    id: 'robi-1',
    operator: 'robi',
    title: '60 GB + 1200 Min VIP Pack',
    dataAllowance: '60 GB',
    minuteAllowance: '1200 Min',
    validity: '30 Days',
    regularPrice: 998,
    offerPrice: 848,
    cashback: 150,
    category: 'combo',
    division: 'All Bangladesh'
  },
  {
    id: 'robi-2',
    operator: 'robi',
    title: '40 GB Super Net Offer',
    dataAllowance: '40 GB',
    minuteAllowance: '0 Min',
    validity: '30 Days',
    regularPrice: 549,
    offerPrice: 449,
    cashback: 100,
    category: 'internet',
    division: 'All Bangladesh'
  },
  {
    id: 'robi-3',
    operator: 'robi',
    title: '650 Minutes Voice Pack',
    dataAllowance: '0 GB',
    minuteAllowance: '650 Min',
    validity: '30 Days',
    regularPrice: 437,
    offerPrice: 367,
    cashback: 70,
    category: 'minute',
    division: 'All Bangladesh'
  },

  // Banglalink
  {
    id: 'bl-1',
    operator: 'bl',
    title: '45 GB + 800 Min Power Pack',
    dataAllowance: '45 GB',
    minuteAllowance: '800 Min',
    validity: '30 Days',
    regularPrice: 799,
    offerPrice: 679,
    cashback: 120,
    category: 'combo',
    division: 'All Bangladesh'
  },
  {
    id: 'bl-2',
    operator: 'bl',
    title: '25 GB Data Express',
    dataAllowance: '25 GB',
    minuteAllowance: '0 Min',
    validity: '30 Days',
    regularPrice: 399,
    offerPrice: 329,
    cashback: 70,
    category: 'internet',
    division: 'All Bangladesh'
  },
  {
    id: 'bl-3',
    operator: 'bl',
    title: '500 Minutes Talktime',
    dataAllowance: '0 GB',
    minuteAllowance: '500 Min',
    validity: '30 Days',
    regularPrice: 330,
    offerPrice: 275,
    cashback: 55,
    category: 'minute',
    division: 'All Bangladesh'
  },

  // Airtel
  {
    id: 'airtel-1',
    operator: 'airtel',
    title: '55 GB + 900 Min Unlimited Fun',
    dataAllowance: '55 GB',
    minuteAllowance: '900 Min',
    validity: '30 Days',
    regularPrice: 848,
    offerPrice: 708,
    cashback: 140,
    category: 'combo',
    division: 'All Bangladesh'
  },
  {
    id: 'airtel-2',
    operator: 'airtel',
    title: '35 GB Non-stop Data',
    dataAllowance: '35 GB',
    minuteAllowance: '0 Min',
    validity: '30 Days',
    regularPrice: 469,
    offerPrice: 389,
    cashback: 80,
    category: 'internet',
    division: 'All Bangladesh'
  },

  // Teletalk
  {
    id: 'teletalk-1',
    operator: 'teletalk',
    title: '30 GB + 500 Min Swadhin Pack',
    dataAllowance: '30 GB',
    minuteAllowance: '500 Min',
    validity: '30 Days',
    regularPrice: 497,
    offerPrice: 427,
    cashback: 70,
    category: 'combo',
    division: 'All Bangladesh'
  },
  {
    id: 'teletalk-2',
    operator: 'teletalk',
    title: '20 GB Shadhinota Net',
    dataAllowance: '20 GB',
    minuteAllowance: '0 Min',
    validity: '30 Days',
    regularPrice: 299,
    offerPrice: 249,
    cashback: 50,
    category: 'internet',
    division: 'All Bangladesh'
  }
];

export const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: 'TXN-882194',
    type: 'recharge',
    title: 'Flexiload Recharge',
    recipientOrSenderNumber: '01712-998877',
    operator: 'gp',
    connectionType: 'prepaid',
    amount: 100,
    fee: 0,
    balanceType: 'main',
    status: 'success',
    timestamp: '2026-09-05 17:34',
    trxId: 'GP882931201'
  },
  {
    id: 'TXN-882193',
    type: 'drive_pack',
    title: 'Drive: 60 GB + 1200 Min',
    recipientOrSenderNumber: '01844-556677',
    operator: 'robi',
    connectionType: 'prepaid',
    amount: 848,
    cashback: 150,
    balanceType: 'drive',
    status: 'pending',
    timestamp: '2026-09-05 16:15',
    trxId: 'DRV-RB9012',
    note: 'Waiting for operator confirmation'
  },
  {
    id: 'TXN-882192',
    type: 'add_balance',
    title: 'Add Balance (bKash)',
    recipientOrSenderNumber: '01711-223344',
    amount: 2000,
    balanceType: 'drive',
    status: 'success',
    timestamp: '2026-09-05 14:02',
    paymentMethod: 'bKash',
    trxId: 'BK9A02K918'
  },
  {
    id: 'TXN-882191',
    type: 'recharge',
    title: 'Flexiload Recharge',
    recipientOrSenderNumber: '01911-332211',
    operator: 'bl',
    connectionType: 'postpaid',
    amount: 500,
    balanceType: 'main',
    status: 'success',
    timestamp: '2026-09-04 20:45',
    trxId: 'BL77281923'
  },
  {
    id: 'TXN-882190',
    type: 'drive_pack',
    title: 'Drive: 35 GB Non-stop',
    recipientOrSenderNumber: '01622-887766',
    operator: 'airtel',
    connectionType: 'prepaid',
    amount: 389,
    cashback: 80,
    balanceType: 'drive',
    status: 'cancelled',
    timestamp: '2026-09-04 11:20',
    trxId: 'DRV-AIR441',
    note: 'Customer SIM ineligible for special pack. Balance refunded.'
  },
  {
    id: 'TXN-882189',
    type: 'add_balance',
    title: 'Add Balance (Nagad)',
    recipientOrSenderNumber: '01822-334455',
    amount: 1500,
    balanceType: 'main',
    status: 'success',
    timestamp: '2026-09-03 09:12',
    paymentMethod: 'Nagad',
    trxId: 'NG7716652'
  }
];

export const CONTACT_PRESETS = [
  { name: 'Abdur Rahim (Store)', phone: '01712-334455' },
  { name: 'Kamal Hossain', phone: '01819-887766' },
  { name: 'Sumon Mia', phone: '01914-112233' },
  { name: 'Farhana Akhter', phone: '01678-990011' },
  { name: 'Teletalk Govt Work', phone: '01552-443322' },
];

export function detectOperatorFromPhone(phone: string): OperatorId | null {
  const clean = phone.replace(/[^0-9]/g, '');
  // Extract first 3 digits after country code if present
  let prefix = '';
  if (clean.startsWith('880')) {
    prefix = clean.substring(2, 5); // '017', etc.
  } else if (clean.startsWith('01')) {
    prefix = clean.substring(0, 3);
  }

  if (prefix === '017' || prefix === '013') return 'gp';
  if (prefix === '018') return 'robi';
  if (prefix === '019' || prefix === '014') return 'bl';
  if (prefix === '016') return 'airtel';
  if (prefix === '015') return 'teletalk';

  return null;
}
