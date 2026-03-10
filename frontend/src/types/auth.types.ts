import { Sign } from "crypto";

export interface User{
    id: string;
    username: string;
    first_name: string;
    last_name: string;
    email: string;
    created_at: string;
}

export interface AuthContextType{
    user: User | null;
    setUser: (user: User) => void;
    login: (username: string, password: string) => Promise<void>;
    signup: (userData: SignupData) => Promise<void>;
    logout: () => void;
    isAuthenticated: () => boolean;
    loading: boolean;
}

export interface SignupData {
    username: string;
    first_name: string;
    last_name: string;
    email: string;
    password: string;
}

