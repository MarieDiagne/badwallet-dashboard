export interface Wallet {
  id: number;
  code: string;
  phoneNumber: string;
  email: string;
  balance: number;
  currency: string;
  createdAt: string;
  updatedAt: string;
}

export interface WalletPage {
  content: Wallet[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

export interface Transaction {
  id: number;
  amount: number;
  type: string;
  description: string;
  referencePhone: string | null;
  fees: number;
  createdAt: string;
}

export interface BalanceResponse {
  balance: number;
  phoneNumber: string;
}

export interface CreateWalletDto {
  phoneNumber: string;
  email: string;
  initialBalance: number;
  code: string;
  currency: string;
}

export interface DepositDto {
  amount: number;
  paymentMethod: string;
}

export interface WithdrawDto {
  phoneNumber: string;
  amount: number;
}

export interface TransferDto {
  senderPhone: string;
  receiverPhone: string;
  amount: number;
}

export interface PayBillDto {
  phoneNumber: string;
  serviceName: string;
  amount: number;
}

export interface PayFacturesDto {
  phoneNumber: string;
  serviceName: string;
  factureReferences: string[];
}
