import api from './api';
import { Budget, BudgetCreate, BudgetUpdate, BudgetSummary } from '../types/budget.types';

class BudgetService {

    
    async getBudgets(month?: string, year?: number, activeOnly: boolean = true): Promise<Budget[]> {
        const params = new URLSearchParams();
        if (month) params.append('month', month);
        if (year) params.append('year', year.toString());
        params.append('active_only', activeOnly.toString());

        const response = await api.get(`/budgets?${params.toString()}`);
        return response.data;
    }

    async getBudgetById(id: string): Promise<Budget> {
        const response = await api.get<Budget>(`/budgets/${id}`);
        return response.data;
    }

    async createBudget(data: BudgetCreate): Promise<Budget> {
        const response = await api.post<Budget>('/budgets', data);
        return response.data;
    }

    async updateBudget(id: string, data: BudgetUpdate): Promise<Budget> {
        const response = await api.put<Budget>(`/budgets/${id}`, data);
        return response.data;
    }
    
    async deleteBudget(id: string): Promise<void> {
        await api.delete(`/budgets/${id}`);
    }

    async getBudgetSummary(): Promise<BudgetSummary> {
        const response = await api.get<BudgetSummary>('/budgets/summary');
        return response.data;
    }
}   

export default new BudgetService();
