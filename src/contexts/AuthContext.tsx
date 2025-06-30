
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, AuthContextType } from '@/types';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock users for demo
const mockUsers: (User & { password: string })[] = [
  {
    id: '1',
    email: 'farmer@demo.com',
    password: 'password',
    name: 'John Farmer',
    role: 'farmer',
    phone: '+1234567890',
    location: 'Farm Valley'
  },
  {
    id: '2',
    email: 'owner@demo.com',
    password: 'password',
    name: 'Mike Owner',
    role: 'vehicle_owner',
    phone: '+1234567891',
    location: 'Vehicle Center'
  },
  {
    id: '3',
    email: 'admin@demo.com',
    password: 'password',
    name: 'Sarah Admin',
    role: 'admin',
    phone: '+1234567892',
    location: 'Admin Office'
  }
];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    const foundUser = mockUsers.find(u => u.email === email && u.password === password);
    if (foundUser) {
      const { password: _, ...userWithoutPassword } = foundUser;
      setUser(userWithoutPassword);
      localStorage.setItem('currentUser', JSON.stringify(userWithoutPassword));
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('currentUser');
  };

  const register = async (userData: Omit<User, 'id'> & { password: string }): Promise<boolean> => {
    // In a real app, this would make an API call
    const newUser: User = {
      ...userData,
      id: Date.now().toString(),
    };
    const { password: _, ...userWithoutPassword } = userData;
    setUser(newUser);
    localStorage.setItem('currentUser', JSON.stringify(newUser));
    return true;
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, register }}>
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
