'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { PaymentMethod, Transaction, Payout } from '@/types/payment';

interface PaymentContextType {
  paymentMethods: PaymentMethod[];
  transactions: Transaction[];
  payouts: Payout[];
  loading: boolean;
  error: string | null;
  fetchPaymentMethods: () => Promise<void>;
  fetchTransactions: (filters?: Record<string, any>) => Promise<void>;
  fetchPayouts: (filters?: Record<string, any>) => Promise<void>;
  createPaymentIntent: (amount: number, currency: string) => Promise<{ clientSecret: string }>;
  processPayout: (amount: number, destination: string, method: string) => Promise<void>;
}

const PaymentContext = createContext<PaymentContextType | undefined>(undefined);

export function PaymentProvider({ children }: { children: React.ReactNode }) {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPaymentMethods = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/payment/methods');
      if (!response.ok) throw new Error('Failed to fetch payment methods');
      const data = await response.json();
      setPaymentMethods(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const fetchTransactions = async (filters = {}) => {
    try {
      setLoading(true);
      const query = new URLSearchParams(filters).toString();
      const response = await fetch(`/api/payment/transactions?${query}`);
      if (!response.ok) throw new Error('Failed to fetch transactions');
      const data = await response.json();
      setTransactions(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const fetchPayouts = async (filters = {}) => {
    try {
      setLoading(true);
      const query = new URLSearchParams(filters).toString();
      const response = await fetch(`/api/payment/payouts?${query}`);
      if (!response.ok) throw new Error('Failed to fetch payouts');
      const data = await response.json();
      setPayouts(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const createPaymentIntent = async (amount: number, currency: string) => {
    try {
      const response = await fetch('/api/payment/create-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, currency }),
      });
      if (!response.ok) throw new Error('Failed to create payment intent');
      return await response.json();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create payment intent');
      throw err;
    }
  };

  const processPayout = async (amount: number, destination: string, method: string) => {
    try {
      const response = await fetch('/api/payment/process-payout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, destination, method }),
      });
      if (!response.ok) throw new Error('Failed to process payout');
      await fetchPayouts(); // Refresh payouts list
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process payout');
      throw err;
    }
  };

  // Load initial data
  useEffect(() => {
    fetchPaymentMethods();
    fetchTransactions();
    fetchPayouts();
  }, []);

  return (
    <PaymentContext.Provider
      value={{
        paymentMethods,
        transactions,
        payouts,
        loading,
        error,
        fetchPaymentMethods,
        fetchTransactions,
        fetchPayouts,
        createPaymentIntent,
        processPayout,
      }}
    >
      {children}
    </PaymentContext.Provider>
  );
}

export const usePayment = () => {
  const context = useContext(PaymentContext);
  if (context === undefined) {
    throw new Error('usePayment must be used within a PaymentProvider');
  }
  return context;
};
