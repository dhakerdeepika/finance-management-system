// src/context/AuthContext.js
import React, { createContext, useEffect, useState } from 'react';
import AuthService from '../services/authService';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = React.useReducer(authReducer, initialLoginState);

  useEffect(() => {
    const unsubscribe = AuthService.onAuthStateChange((authState) => {
      if (authState.isAuthenticated) {
        dispatch({
          type: 'RESTORE_TOKEN',
          payload: {
            user: authState.user,
            userData: authState.userData,
          },
        });
      } else {
        dispatch({ type: 'SIGN_OUT' });
      }
    });

    return unsubscribe;
  }, []);

  const authContext = {
    state,
    dispatch,
    login: async (email, password) => {
      try {
        const result = await AuthService.loginUser(email, password);
        if (result.success) {
          dispatch({
            type: 'SIGN_IN',
            payload: {
              user: result.user,
            },
          });
          return { success: true };
        }
        return { success: false, error: result.error };
      } catch (error) {
        return { success: false, error: error.message };
      }
    },
    logout: async () => {
      try {
        await AuthService.logoutUser();
        dispatch({ type: 'SIGN_OUT' });
        return { success: true };
      } catch (error) {
        return { success: false, error: error.message };
      }
    },
    resetPassword: async (email) => {
      try {
        const result = await AuthService.resetPassword(email);
        return result;
      } catch (error) {
        return { success: false, error: error.message };
      }
    },
  };

  return <AuthContext.Provider value={authContext}>{children}</AuthContext.Provider>;
};

const initialLoginState = {
  isLoading: true,
  isSignout: false,
  user: null,
  userData: null,
};

const authReducer = (prevState, action) => {
  switch (action.type) {
    case 'RESTORE_TOKEN':
      return {
        isLoading: false,
        isSignout: false,
        user: action.payload.user,
        userData: action.payload.userData,
      };
    case 'SIGN_IN':
      return {
        isLoading: false,
        isSignout: false,
        user: action.payload.user,
        userData: action.payload.userData,
      };
    case 'SIGN_OUT':
      return {
        isLoading: false,
        isSignout: true,
        user: null,
        userData: null,
      };
    case 'SIGN_UP':
      return {
        isLoading: false,
        isSignout: false,
        user: action.payload.user,
        userData: action.payload.userData,
      };
  }
};
