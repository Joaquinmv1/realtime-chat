import { SetStateAction, createContext, useEffect, useState } from "react";
import {
  loginUserRequest,
  registerUserRequest,
  verifyTokenRequest,

} from "../service/auth.service";
import Cookies from 'js-cookie';
import { useNavigate } from "react-router-dom";

interface AuthContextProps {
  children: React.ReactNode;
}

export interface Values {
  id: string;
  email: string;
  password: string;
  username?: string;
  contacts?: [];
  conversations?: Values[];
}

interface Auth {
  user: Values | null;
  isAuthenticated: boolean;
  loginUser: (user: Values) => void;
  registerUser: (user: Values) => void;
  isLoading: boolean;
  setUser: React.Dispatch<SetStateAction<Values | null>>;
}

export const AuthContext = createContext<Auth | null>(null);

export const AuthProvider = ({ children }: AuthContextProps) => {
  const [user, setUser] = useState<Values | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  const navigate = useNavigate();

  const loginUser = async (user: Values) => {
    try {
      const res = await loginUserRequest(user);
      setUser(res.data);
      setIsAuthenticated(true);
      navigate('/home')
    } catch (error) {
      setIsAuthenticated(false);
      setUser(null);
    }
  };

  const registerUser = async (user: Values) => {
    try {
      const res = await registerUserRequest(user);
      setUser(res.data);
      setIsAuthenticated(true);
      navigate('/home')
    } catch (error) {
      setIsAuthenticated(false);
      setUser(null);
    }
  };

  const verifyToken = async () => {
    const cookie = Cookies.get('chatToken');

    if (cookie) {
      try {
        const response = await verifyTokenRequest();
        if (response) {
          setIsAuthenticated(true);
          setUser(response.data);
          setIsLoading(false)
          // setIsLoading(false)
          return;
        }
      } catch (error) {
        setIsAuthenticated(false)
        setUser(null)
        setIsLoading(false)
      }
    }
  };

  useEffect(() => {
    verifyToken();
  }, []);

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated,
      isLoading,
      loginUser,
      registerUser,
      setUser
    }}>
      {children}
    </AuthContext.Provider>
  )
}