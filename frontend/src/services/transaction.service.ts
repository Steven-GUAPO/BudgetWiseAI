import api from './api';

export interface Transaction {
  id: string;
  user_id: string;
  account_id: string;
  merchant: string;
  category: string;
  amount: number;
  transaction_type: string;
  date: string;
  description: string | null;
  created_at: string;
}

export interface TransactionFilters {
  category?: string;
  transaction_type?: string;
  limit?: number;
}

class TransactionService {
  async getTransactions(filters: TransactionFilters = {}): Promise<Transaction[]> {
    const params = new URLSearchParams();
    if (filters.category) params.append('category', filters.category);
    if (filters.transaction_type) params.append('transaction_type', filters.transaction_type);
    if (filters.limit) params.append('limit', filters.limit.toString());
    const response = await api.get<Transaction[]>(`/transactions?${params.toString()}`);
    return response.data;
  }

  async getBalance(): Promise<number> {
    const response = await api.get<{ balance: number }>('/transactions/balance');
    return response.data.balance;
  }

  async generateSample(count: number = 30): Promise<void> {
    await api.post(`/transactions/generate-sample?count=${count}`);
  }

  async deleteTransaction(id: string): Promise<void> {
    await api.delete(`/transactions/${id}`);
  }
}

export default new TransactionService();