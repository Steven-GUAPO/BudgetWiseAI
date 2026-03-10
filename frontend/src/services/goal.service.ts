import api from './api';
import { Goal, GoalCreate, GoalUpdate, GoalDeposit, GoalSummary } from '../types/goal.types';

class GoalService {

    async getGoals(priority?: string, completed?: boolean): Promise<Goal[]> {
        const params = new URLSearchParams();
        if (priority) params.append('priority', priority);
        if (completed !== undefined) params.append('completed', completed.toString());

        const response = await api.get(`/goals/?${params.toString()}`);
        return response.data;
    }
    
    async getGoalById(id: string): Promise<Goal> {
        const response = await api.get<Goal>(`/goals/${id}`);
        return response.data;
    }

    async createGoal(data: GoalCreate): Promise<Goal> {
        const response = await api.post<Goal>('/goals/', data);
        return response.data;
    }

    async updateGoal(id: string, data: GoalUpdate): Promise<Goal> {
        const response = await api.put<Goal>(`/goals/${id}`, data);
        return response.data;
    }

    async deleteGoal(id: string): Promise<void> {
        await api.delete(`/goals/${id}`);
    }

    async makeDeposit(id: string, data: GoalDeposit): Promise<Goal> {
        const response = await api.post<Goal>(`/goals/${id}/deposit`, data);
        return response.data;
    }

    async getGoalSummary(): Promise<GoalSummary> {
        const response = await api.get<GoalSummary>('/goals/summary');
        return response.data;
    }
}

export default new GoalService();