import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
 const [user, setUser] = useState(null);
 const [loading, setLoading] = useState(true);

 useEffect(() => {
 const checkAuth = async () => {
 const storedUser = localStorage.getItem('welloraUser');
 if (storedUser) {
 try {
 setUser(JSON.parse(storedUser));
 // Optionally verify token with backend here
 } catch (error) {
 console.error("Auth check failed", error);
 localStorage.removeItem('welloraUser');
 }
 }
 setLoading(false);
 };
 checkAuth();
 }, []);

 const login = async (email, password) => {
 const { data } = await api.post('/auth/login', { email, password });
 localStorage.setItem('welloraUser', JSON.stringify(data));
 setUser(data);
 return data;
 };

 const signup = async (name, email, password) => {
 const { data } = await api.post('/auth/signup', { name, email, password });
 localStorage.setItem('welloraUser', JSON.stringify(data));
 setUser(data);
 return data;
 };

 const logout = () => {
 localStorage.removeItem('welloraUser');
 setUser(null);
 };

 const updateOnboarding = (status) => {
 const updatedUser = { ...user, onboardingCompleted: status };
 localStorage.setItem('welloraUser', JSON.stringify(updatedUser));
 setUser(updatedUser);
 };

 // Call this after any profile update to keep context + localStorage in sync
 const updateUser = (updatedFields) => {
 const updatedUser = { ...user, ...updatedFields };
 localStorage.setItem('welloraUser', JSON.stringify(updatedUser));
 setUser(updatedUser);
 };

 return (
 <AuthContext.Provider value={{ user, login, signup, logout, loading, updateOnboarding, updateUser }}>
 {children}
 </AuthContext.Provider>
 );
};
