export interface Facture {
  id: number;
  reference: string;
  walletCode: string;
  serviceName: string;
  montant: number;
  mois: string;
  payee: boolean;
  paidAt: string | null;
  createdAt: string;
}
