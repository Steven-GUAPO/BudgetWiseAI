import React, { createContext, useState, useEffect, ReactNode, useContext } from 'react';
import authService from '../services/auth.service';
import { User, AuthContextType, SignupData } from '../types/auth.types';
import api from '../services/api';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children })=> {
        const [user, setUser] = useState<User | null>(null);
        const [loading, setLoading] = useState<boolean>(true);

        useEffect(() => {
            checkAuth();
        }, []);

        const checkAuth = async () => {
            try {
                if (authService.isAuthenticated()) {
                    const currentUser = await authService.getCurrentUser();
                    setUser(currentUser);
                }
            } catch (error) {
                console.error('Error fetching current user:', error);
                authService.logout();
            } finally {
                setLoading(false);
            }
        };

        const login = async (username: string, password: string) => {
            const response = await authService.login({ username, password });
            const currentUser = await authService.getCurrentUser();
            setUser(currentUser);
            // Auto Sync on Login
            api.post('/bank/sync').catch(() => {});
        };

        const signup = async (userData: SignupData) => {
            await authService.signup(userData);
            await login(userData.username, userData.password);
        };

        const logout = () => {
            authService.logout();
            setUser(null);
        }

        return (
            <AuthContext.Provider value={{ user, login, setUser, signup, logout, isAuthenticated: authService.isAuthenticated, loading }}>
                {children}
            </AuthContext.Provider>
        );
    };

    export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;

};