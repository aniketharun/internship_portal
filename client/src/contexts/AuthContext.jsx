import { createContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    // Check if user is logged in on load
    useEffect(() => {
        const loadUser = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                setLoading(false);
                return;
            }

            try {
                const { data } = await api.get('/auth/me');
                if (data.success) {
                    setUser(data.data);
                    setIsAuthenticated(true);
                }
            } catch (error) {
                console.error('Failed to load user', error);
                localStorage.removeItem('token');
                setUser(null);
                setIsAuthenticated(false);
            } finally {
                setLoading(false);
            }
        };

        loadUser();
    }, []);

    // Register User
    const register = async (userData) => {
        const { data } = await api.post('/auth/register', userData);
        if (data.success) {
            localStorage.setItem('token', data.data.token);
            setUser(data.data);
            setIsAuthenticated(true);
            return data;
        }
    };

    // Login User
    const login = async (userData) => {
        const { data } = await api.post('/auth/login', userData);
        if (data.success) {
            localStorage.setItem('token', data.data.token);
            setUser(data.data);
            setIsAuthenticated(true);
            return data;
        }
    };

    // Logout
    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
        setIsAuthenticated(false);
    };

    // Forgot Password
    const forgotPassword = async (email) => {
        const { data } = await api.post('/auth/forgotpassword', { email });
        return data;
    };

    // Reset Password
    const resetPassword = async (token, password) => {
        const { data } = await api.put(`/auth/resetpassword/${token}`, { password });
        return data;
    };

    // Update Profile
    const updateProfile = async (profileData) => {
        const { data } = await api.put('/auth/updatedetails', profileData);
        if (data.success) {
            setUser(data.data);
            return data;
        }
    };

    // Google Login
    const googleLogin = async (accessToken) => {
        const { data } = await api.post('/auth/google', { access_token: accessToken });
        if (data.success) {
            localStorage.setItem('token', data.data.token);
            setUser(data.data);
            setIsAuthenticated(true);
            return data;
        }
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                loading,
                isAuthenticated,
                register,
                login,
                googleLogin,
                logout,
                forgotPassword,
                resetPassword,
                updateProfile,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;
