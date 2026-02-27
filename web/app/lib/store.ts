import { create } from 'zustand';
import { apiFetch } from './api';

export interface Receiver {
    id: string;
    name: string;
    email: string;
    currencies: {
        countryCode: string;
        code: string;
        accountCount: number;
    }[];
    createdOn: string;
}

export interface Transaction {
    id: string;
    reference_number: string;
    amount: string;
    currency_id: string;
    status: string;
    created_at: string;
    currency: {
        code: string;
        country_code: string;
    };
    from_account: {
        provider_details: string;
        user_id: string;
        profiles: {
            first_name: string;
            last_name: string;
        };
    };
    to_account: {
        provider_details: string;
        user_id: string;
        profiles: {
            first_name: string;
            last_name: string;
        };
    };
}

interface AuthState {
    profile: any | null;
    accounts: any[];
    fetchProfile: () => Promise<void>;
    fetchAccounts: () => Promise<void>;
    loading: boolean;
}

interface ReceiversState {
    receivers: Receiver[];
    selectedReceiver: Receiver | null;
    selectedCurrency: string | null;
    transactions: Transaction[];
    loading: boolean;
    error: string | null;
    fetchReceivers: () => Promise<void>;
    fetchContactTransactions: (contactId: string) => Promise<void>;
    setSelectedReceiver: (receiver: Receiver | null) => void;
    setSelectedCurrency: (currency: string | null) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
    profile: null,
    accounts: [],
    loading: false,
    fetchProfile: async () => {
        set({ loading: true });
        try {
            const profile = await apiFetch('/auth/me');
            set({ profile, loading: false });
        } catch (err) {
            console.error('[AuthStore] fetchProfile failed:', err);
            set({ profile: null, loading: false });
        }
    },
    fetchAccounts: async () => {
        console.log('[AuthStore] fetchAccounts() called');
        set({ loading: true });
        try {
            const accounts = await apiFetch('/accounts');
            console.log('[AuthStore] fetchAccounts() success — got', accounts.length, 'accounts');
            set({ accounts, loading: false });
        } catch (err) {
            console.error('[AuthStore] fetchAccounts failed:', err);
            set({ accounts: [], loading: false });
        }
    },
}));

export const useReceiversStore = create<ReceiversState>((set) => ({
    receivers: [],
    selectedReceiver: null,
    selectedCurrency: "USD",
    transactions: [],
    loading: false,
    error: null,
    fetchReceivers: async () => {
        set({ loading: true, error: null });
        try {
            const data = await apiFetch('/contacts');
            set({ receivers: data, loading: false });
        } catch (err: any) {
            set({ error: err.message, loading: false });
        }
    },
    fetchContactTransactions: async (contactId: string) => {
        console.log('[ReceiversStore] fetchContactTransactions() called for', contactId);
        set({ loading: true });
        try {
            const data = await apiFetch(`/contacts/${contactId}/transactions`);
            console.log('[ReceiversStore] fetchContactTransactions() success — got', data.length, 'transactions');
            set({ transactions: data, loading: false });
        } catch (err: any) {
            console.error('[ReceiversStore] fetchContactTransactions failed:', err);
            set({ transactions: [], loading: false });
        }
    },
    setSelectedReceiver: (receiver) => set({ selectedReceiver: receiver }),
    setSelectedCurrency: (currency) => set({ selectedCurrency: currency }),
}));
