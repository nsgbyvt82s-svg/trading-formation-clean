export type PaymentMethod = {
  id: string;
  provider: 'stripe' | 'paypal';
  isActive: boolean;
  displayName: string;
  credentials: Record<string, string>;
  fees: {
    percentage: number;
    fixed: number;
  };
  createdAt: string;
  updatedAt: string;
};

export type TransactionStatus = 'pending' | 'completed' | 'failed' | 'refunded';

export type Transaction = {
  id: string;
  userId: string;
  amount: number;
  currency: string;
  status: TransactionStatus;
  paymentMethod: string;
  paymentIntentId?: string; // ID de l'intention de paiement Stripe
  paypalOrderId?: string;   // ID de commande PayPal
  description: string;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
};

export type PayoutStatus = 'pending' | 'completed' | 'failed';

export type Payout = {
  id: string;
  userId: string;
  amount: number;
  currency: string;
  status: PayoutStatus;
  paymentMethod: string;
  destination: string; // Email ou ID de compte bancaire
  description?: string;
  metadata?: Record<string, any>;
  processedAt?: string;
  completedAt?: string;
  createdAt: string;
};
