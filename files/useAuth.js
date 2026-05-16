// src/hooks/useAuth.js
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return {
    state: context.state,
    login: context.login,
    logout: context.logout,
    resetPassword: context.resetPassword,
    user: context.state.user,
    userData: context.state.userData,
    isLoading: context.state.isLoading,
    isSignout: context.state.isSignout,
    isSignedIn: context.state.user !== null,
    hasPermission: (permission) => {
      return context.state.userData?.permissions?.includes(permission) || false;
    },
  };
};
