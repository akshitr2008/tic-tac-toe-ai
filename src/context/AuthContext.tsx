import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';

interface AuthContextType {
  currentUser: User | null;
  isAuthenticated: boolean;
  login: (usernameOrEmail: string, password: string) => { success: boolean; message?: string };
  signup: (
    name: string,
    usernameOrEmail: string,
    password: string,
    confirmPassword: string
  ) => { success: boolean; message?: string };
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const USERS_STORAGE_KEY = 'tictactoe_registered_users';
const CURRENT_USER_STORAGE_KEY = 'tictactoe_current_user';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem(CURRENT_USER_STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // Return null on parsing or storage failure
    }
    return null;
  });

  // Initialize with sample users if none exist in localStorage
  useEffect(() => {
    try {
      const savedUsers = localStorage.getItem(USERS_STORAGE_KEY);
      if (!savedUsers) {
        const defaultUsers: User[] = [
          {
            id: 'user-demo-1',
            name: 'Alex Rivera',
            usernameOrEmail: 'alex',
            password: 'password123',
            createdAt: new Date().toISOString(),
          },
          {
            id: 'user-demo-2',
            name: 'Student Gamer',
            usernameOrEmail: 'player1@college.edu',
            password: 'password123',
            createdAt: new Date().toISOString(),
          },
        ];
        localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(defaultUsers));
      }
    } catch {
      // Storage unavailable or restricted
    }
  }, []);

  const getUsers = (): User[] => {
    try {
      const savedUsers = localStorage.getItem(USERS_STORAGE_KEY);
      return savedUsers ? JSON.parse(savedUsers) : [];
    } catch {
      return [];
    }
  };

  const saveUsers = (users: User[]) => {
    try {
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
    } catch {
      // Storage write error
    }
  };

  const login = (usernameOrEmail: string, password: string) => {
    const cleanIdentifier = usernameOrEmail.trim().toLowerCase();
    const cleanPassword = password.trim();

    if (!cleanIdentifier || !cleanPassword) {
      return { success: false, message: 'Please provide both username/email and password.' };
    }

    const users = getUsers();
    const foundUser = users.find(
      (u) =>
        u.usernameOrEmail.toLowerCase() === cleanIdentifier &&
        u.password === cleanPassword
    );

    if (!foundUser) {
      return {
        success: false,
        message: 'Invalid credentials. Please check your username/email or password.',
      };
    }

    const sessionUser: User = {
      id: foundUser.id,
      name: foundUser.name,
      usernameOrEmail: foundUser.usernameOrEmail,
      createdAt: foundUser.createdAt,
    };

    setCurrentUser(sessionUser);
    try {
      localStorage.setItem(CURRENT_USER_STORAGE_KEY, JSON.stringify(sessionUser));
    } catch {
      // Storage write error
    }

    return { success: true };
  };

  const signup = (
    name: string,
    usernameOrEmail: string,
    password: string,
    confirmPassword: string
  ) => {
    const cleanName = name.trim();
    const cleanIdentifier = usernameOrEmail.trim().toLowerCase();
    const cleanPassword = password.trim();
    const cleanConfirm = confirmPassword.trim();

    if (!cleanName || !cleanIdentifier || !cleanPassword || !cleanConfirm) {
      return { success: false, message: 'All fields are required.' };
    }

    if (cleanPassword.length < 4) {
      return { success: false, message: 'Password must be at least 4 characters long.' };
    }

    if (cleanPassword !== cleanConfirm) {
      return { success: false, message: 'Passwords do not match. Please re-enter.' };
    }

    const users = getUsers();
    const userExists = users.some(
      (u) => u.usernameOrEmail.toLowerCase() === cleanIdentifier
    );

    if (userExists) {
      return {
        success: false,
        message: 'A user with this username or email already exists. Please login.',
      };
    }

    const newUser: User = {
      id: `user-${Date.now()}`,
      name: cleanName,
      usernameOrEmail: cleanIdentifier,
      password: cleanPassword,
      createdAt: new Date().toISOString(),
    };

    const updatedUsers = [...users, newUser];
    saveUsers(updatedUsers);

    const sessionUser: User = {
      id: newUser.id,
      name: newUser.name,
      usernameOrEmail: newUser.usernameOrEmail,
      createdAt: newUser.createdAt,
    };

    setCurrentUser(sessionUser);
    try {
      localStorage.setItem(CURRENT_USER_STORAGE_KEY, JSON.stringify(sessionUser));
    } catch {
      // Storage write error
    }

    return { success: true };
  };

  const logout = () => {
    setCurrentUser(null);
    try {
      localStorage.removeItem(CURRENT_USER_STORAGE_KEY);
    } catch {
      // Storage write error
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAuthenticated: !!currentUser,
        login,
        signup,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
