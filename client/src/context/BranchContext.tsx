import React, { createContext, useContext, useState, useEffect } from 'react';
import { Branch } from '../types';
import { api } from '../services/api';
import { useAuth } from './AuthContext';

interface BranchContextType {
  branches: Branch[];
  currentBranchId: string | null;
  currentBranch: Branch | null;
  isLoadingBranches: boolean;
  setCurrentBranchId: (id: string | null) => void;
  refreshBranches: () => Promise<void>;
}

const BranchContext = createContext<BranchContextType | undefined>(undefined);

export const BranchProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [branches, setBranches] = useState<Branch[]>([]);
  const [currentBranchId, setCurrentBranchIdState] = useState<string | null>(() => {
    return localStorage.getItem('nanifrys_pos_branch_id') || localStorage.getItem('simba_pos_branch_id') || null;
  });
  const [isLoadingBranches, setIsLoadingBranches] = useState<boolean>(false);

  const fetchBranches = async () => {
    if (!isAuthenticated) return;
    setIsLoadingBranches(true);
    try {
      const data = await api.getBranches();
      setBranches(data);

      if (!currentBranchId && data.length > 0) {
        const initial = user?.branchId || data[0].id;
        setCurrentBranchIdState(initial);
        localStorage.setItem('nanifrys_pos_branch_id', initial);
      }
    } catch (err) {
      console.error('Failed to load branches:', err);
    } finally {
      setIsLoadingBranches(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchBranches();
    }
  }, [isAuthenticated, user]);

  const setCurrentBranchId = (id: string | null) => {
    setCurrentBranchIdState(id);
    if (id) {
      localStorage.setItem('nanifrys_pos_branch_id', id);
    } else {
      localStorage.removeItem('nanifrys_pos_branch_id');
      localStorage.removeItem('simba_pos_branch_id');
    }
  };

  const currentBranch = branches.find(b => b.id === currentBranchId) || null;

  return (
    <BranchContext.Provider
      value={{
        branches,
        currentBranchId,
        currentBranch,
        isLoadingBranches,
        setCurrentBranchId,
        refreshBranches: fetchBranches,
      }}
    >
      {children}
    </BranchContext.Provider>
  );
};

export const useBranch = () => {
  const context = useContext(BranchContext);
  if (!context) {
    throw new Error('useBranch must be used within a BranchProvider');
  }
  return context;
};
