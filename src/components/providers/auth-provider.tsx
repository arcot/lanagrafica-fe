import { useAuth0, User } from "@auth0/auth0-react";
import { ReactNode, createContext, useContext, useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";

interface AuthContextType {
  user: User | undefined;
  isAuthenticated: boolean;
  isLoading: boolean;
  isAdmin: boolean;
  getAccessToken: () => Promise<string>;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType>({
  user: undefined,
  isAuthenticated: false,
  isLoading: true,
  isAdmin: false,
  getAccessToken: async () => '',
  signIn: async () => {},
  signOut: async () => {},
});

interface Node {
  children: ReactNode;
}

export const AuthProvider = ({ children }: Node) => {
  const {
    user,
    isAuthenticated,
    isLoading,
    loginWithRedirect,
    logout,
    getAccessTokenSilently,
  } = useAuth0();
  
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAdminRole = async () => {
      if (isAuthenticated && user) {
        try {
          const token = await getAccessTokenSilently();
          const decodedToken = jwtDecode(token) as { permissions?: string[] };
          const permissions = decodedToken.permissions || [];
          setIsAdmin(Array.isArray(permissions) && permissions.includes('Admin'));
        } catch (error) {
          console.error('Error checking admin role:', error);
          setIsAdmin(false);
        }
      } else {
        setIsAdmin(false);
      }
    };

    checkAdminRole();
  }, [isAuthenticated, user, getAccessTokenSilently]);

  const signIn = async () => {
    await loginWithRedirect({
      authorizationParams: {
        redirect_uri: window.location.origin,
      },
    });
  };

  const signOut = async () => {
    logout({
      logoutParams: {
        returnTo: `${window.location.origin}/login`,
      },
    });
  };

  const getAccessToken = async () => {
    if (!isAuthenticated) throw new Error('User not authenticated');
    return await getAccessTokenSilently();
  };

  if (isLoading) {
    return null;
  }

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated, 
      isLoading, 
      isAdmin, 
      getAccessToken, 
      signIn, 
      signOut 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
