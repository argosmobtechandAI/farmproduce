import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import API_URLS from '../config/api';

const AuthContext = createContext();

const getErrorMessage = (data, fallback) => {
    if (!data) return fallback;
    if (typeof data === 'string') return data;
    if (data.message) return data.message;
    if (data.error) return data.error;
    if (typeof data === 'object') {
        const keys = Object.keys(data);
        if (keys.length > 0) {
            const val = data[keys[0]];
            if (Array.isArray(val) && val.length > 0) {
                return val[0];
            }
            if (typeof val === 'string') {
                return val;
            }
        }
    }
    return fallback;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [isAppReady, setIsAppReady] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Initial load: check for stored token and user
    useEffect(() => {
        const loadAuthData = async () => {
            try {
                const storedToken = await AsyncStorage.getItem('token') || await AsyncStorage.getItem('accessToken');
                const storedUser = await AsyncStorage.getItem('user');

                if (storedToken) {
                    setToken(storedToken);
                }
                if (storedUser) {
                    setUser(JSON.parse(storedUser));
                }
            } catch (e) {
                console.error('Failed to load auth data from storage');
            } finally {
                setIsAppReady(true);
            }
        };

        loadAuthData();
    }, []);

    const sendOtp = async (phoneNumber, countryCode) => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(API_URLS.SEND_OTP, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    phone: phoneNumber,
                    country_code: countryCode,

                }),
            });

            console.log("response", response);
            const responseText = await response.text();
            console.log("responseText", responseText);
            let data;
            try {
                data = JSON.parse(responseText);
                console.log("data", data);
            } catch (e) {
                console.error('Failed to parse response as JSON:', responseText);
                throw new Error('Server returned an unexpected response (HTML instead of JSON).');
            }

            if (response.ok) {
                setLoading(false);
                return { success: true, data };
            } else {
                throw new Error(getErrorMessage(data, 'Failed to send OTP'));
            }
        } catch (err) {
            setLoading(false);
            setError(err.message);
            return { success: false, error: err.message };
        }
    };

    const verifyOtp = async (phoneNumber, otp) => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(API_URLS.VERIFY_OTP, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone: phoneNumber, country_code: "+91", otp }),
            });

            const responseText = await response.text();
            console.log("responseText", responseText);
            let data;
            try {
                data = JSON.parse(responseText);
                console.log("verify response data", data);
            } catch (e) {
                console.error('Failed to parse response as JSON:', responseText);
                throw new Error('Server returned an unexpected response.');
            }

            if (response.ok) {
                const authToken = data.token || data.access || data.access_token;
                const userData = data.user;

                if (authToken) {
                    await AsyncStorage.setItem('token', authToken);
                    setToken(authToken);
                }
                if (userData) {
                    await AsyncStorage.setItem('user', JSON.stringify(userData));
                    setUser(userData);
                }

                setLoading(false);
                return { success: true, data };
            } else {
                throw new Error(getErrorMessage(data, 'Invalid OTP'));
            }
        } catch (err) {
            setLoading(false);
            setError(err.message);
            return { success: false, error: err.message };
        }
    };

    const register = async (userData) => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(API_URLS.REGISTER, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userData),
            });

            const responseText = await response.text();
            let data;
            try {
                data = JSON.parse(responseText);
            } catch (e) {
                console.log("parse error", e);
                console.error('Failed to parse response as JSON:', responseText);
                throw new Error('Server returned an unexpected response.');
            }

            if (response.ok) {
                // Removed auto-login logic so user must login manually after registration.

                setLoading(false);
                return { success: true, data };
            } else {
                throw new Error(getErrorMessage(data, 'Registration failed'));
            }
        } catch (err) {
            setLoading(false);
            setError(err.message);
            return { success: false, error: err.message };
        }
    };

    const logout = async () => {
        try {
            await AsyncStorage.removeItem('token');
            await AsyncStorage.removeItem('user');
            setToken(null);
            setUser(null);
        } catch (e) {
            console.error('Error clearing auth data during logout');
        }
    };

    const setAuthData = async (newToken, newUser) => {
        if (newToken) {
            await AsyncStorage.setItem('token', newToken);
            setToken(newToken);
        }
        if (newUser) {
            await AsyncStorage.setItem('user', JSON.stringify(newUser));
            setUser(newUser);
        }
    };

    return (
        <AuthContext.Provider value={{ user, token, loading, isAppReady, error, sendOtp, verifyOtp, register, logout, setAuthData }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
