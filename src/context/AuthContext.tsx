import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Profile } from '../types';
import { DB } from '../lib/db';

interface AuthContextType {
  currentUser: Profile | null;
  activeProfile: Profile | null; // O perfil em exibição (próprio ou o inspecionado pelo Admin)
  activeUserId: string | null;
  adminInspectedProfile: Profile | null;
  isLoading: boolean;
  login: (usernameOrEmail: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  setInspectedUser: (user: Profile | null) => void;
  refreshProfiles: () => Promise<void>;
  allProfiles: Profile[];
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<Profile | null>(null);
  const [adminInspectedProfile, setAdminInspectedProfile] = useState<Profile | null>(null);
  const [allProfiles, setAllProfiles] = useState<Profile[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchProfiles = async () => {
    const profiles = await DB.getProfiles();
    setAllProfiles(profiles);
    return profiles;
  };

  useEffect(() => {
    const initAuth = async () => {
      setIsLoading(true);
      const profiles = await fetchProfiles();
      const savedUserId = localStorage.getItem('app_treinos_logged_user_id');
      if (savedUserId) {
        const found = profiles.find(p => p.id === savedUserId);
        if (found) {
          setCurrentUser(found);
        } else {
          localStorage.removeItem('app_treinos_logged_user_id');
        }
      }
      setIsLoading(false);
    };
    initAuth();
  }, []);

  const login = async (usernameOrEmail: string, pass: string): Promise<{ success: boolean; error?: string }> => {
    const profiles = await fetchProfiles();
    const cleanUser = usernameOrEmail.trim().toLowerCase();
    const cleanPass = pass.trim();

    // Verificação MVP direta com credenciais (Admin/Admin, sofia/sofia123, etc.)
    const matched = profiles.find(p => p.username.toLowerCase() === cleanUser);
    if (!matched) {
      return { success: false, error: 'Utilizador não encontrado na base de dados.' };
    }

    // Regra da especificação: pass Admin para Admin, pass sofia123 para sofia
    const isCorrectPass = 
      (matched.username.toLowerCase() === 'admin' && cleanPass === 'Admin') ||
      (matched.username.toLowerCase() === 'sofia' && cleanPass === 'sofia123') ||
      (cleanPass === matched.username); // Fallback amigável para novos utilizadores locais

    if (!isCorrectPass) {
      return { success: false, error: 'Palavra-passe incorreta. Para o utilizador Admin, use a password "Admin".' };
    }

    setCurrentUser(matched);
    setAdminInspectedProfile(null);
    localStorage.setItem('app_treinos_logged_user_id', matched.id);
    return { success: true };
  };

  const logout = () => {
    setCurrentUser(null);
    setAdminInspectedProfile(null);
    localStorage.removeItem('app_treinos_logged_user_id');
  };

  const setInspectedUser = (user: Profile | null) => {
    if (currentUser?.role === 'admin') {
      setAdminInspectedProfile(user);
    }
  };

  // Se o admin está a inspecionar outra conta, o activeProfile/activeUserId muda para a conta inspecionada
  const activeProfile = adminInspectedProfile || currentUser;
  const activeUserId = activeProfile?.id || null;

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        activeProfile,
        activeUserId,
        adminInspectedProfile,
        isLoading,
        login,
        logout,
        setInspectedUser,
        refreshProfiles: async () => { await fetchProfiles(); },
        allProfiles
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  return context;
};
