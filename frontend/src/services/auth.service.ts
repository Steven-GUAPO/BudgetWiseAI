import api from './api';

export interface SignupData {
    username: string;
    first_name: string;
    last_name: string;
    email: string;
    password: string;
}

export interface LoginData {
    username: string;   
    password: string;
}

export interface UserResponse {
    id: string;
    username: string;
    first_name: string;
    last_name: string;
    email: string;
    created_at: string;
}

export interface TokenResponse {
    access_token: string;
    token_type: string;
}

class AuthService {
    async signup(data: SignupData): Promise<UserResponse> {
        const response = await api.post<UserResponse>('/auth/signup', data);
        return response.data;
    }

    async login(data: LoginData): Promise<TokenResponse> {
        const response = await api.post<TokenResponse>('/auth/login', data);
        if (response.data.access_token) {
            localStorage.setItem('access_token', response.data.access_token);
        }
        return response.data;
    }

    async getCurrentUser(): Promise<UserResponse> {
        const response = await api.get<UserResponse>('/auth/me');
        return response.data;
    }

    logout(): void {
        localStorage.removeItem('access_token');
    }

    getToken(): string | null {
        return localStorage.getItem('access_token');
    }

    isAuthenticated(): boolean {
        return !!this.getToken();
    }
}

export default new AuthService();


