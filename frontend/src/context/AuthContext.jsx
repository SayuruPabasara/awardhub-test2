import { createContext, useContext, useReducer, useEffect } from 'react';

const AuthContext = createContext(null);

const initialState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
};

function authReducer(state, action) {
  switch (action.type) {
    case 'LOGIN':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        isLoading: false,
      };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
      };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'RESTORE':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: !!action.payload,
        isLoading: false,
      };
    default:
      return state;
  }
}

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Restore auth state from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('user');
      const refreshToken = localStorage.getItem('refreshToken');
      if (stored && refreshToken) {
        const user = JSON.parse(stored);
        // Restore access token to memory
        window.__accessToken = user.accessToken || null;
        dispatch({ type: 'RESTORE', payload: user });
      } else {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    } catch {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  const login = (authData) => {
    const user = {
      userId: authData.userId,
      email: authData.email,
      role: authData.role,
      accessToken: authData.accessToken,
    };
    // Access token in memory
    window.__accessToken = authData.accessToken;
    // Refresh token in localStorage (would be httpOnly cookie in production)
    localStorage.setItem('refreshToken', authData.refreshToken);
    localStorage.setItem('user', JSON.stringify(user));
    dispatch({ type: 'LOGIN', payload: user });
  };

  const logout = () => {
    window.__accessToken = null;
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    dispatch({ type: 'LOGOUT' });
  };

  const value = {
    ...state,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
