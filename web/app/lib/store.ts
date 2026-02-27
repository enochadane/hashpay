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

export interface PaginationMeta {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

interface AuthState {
    profile: any | null;
    accounts: any[];
    accountsMeta: PaginationMeta | null;
    fetchProfile: () => Promise<void>;
    fetchAccounts: (page?: number, limit?: number) => Promise<void>;
    loading: boolean;
}

interface ReceiversState {
    receivers: Receiver[];
    receiversMeta: PaginationMeta | null;
    selectedReceiver: Receiver | null;
    selectedCurrency: string | null;
    transactions: Transaction[];
    transactionsMeta: PaginationMeta | null;
    loading: boolean;
    error: string | null;
    fetchReceivers: (page?: number, limit?: number) => Promise<void>;
    fetchContactTransactions: (contactId: string, page?: number, limit?: number) => Promise<void>;
    setSelectedReceiver: (receiver: Receiver | null) => void;
    setSelectedCurrency: (currency: string | null) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
    profile: null,
    accounts: [],
    accountsMeta: null,
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
    fetchAccounts: async (page = 1, limit = 5) => {
        console.log('[AuthStore] fetchAccounts() called');
        set({ loading: true });
        try {
            const { data, meta } = await apiFetch(`/accounts?page=${page}&limit=${limit}`);
            console.log('[AuthStore] fetchAccounts() success — got', data.length, 'accounts');
            set({ accounts: data, accountsMeta: meta, loading: false });
        } catch (err) {
            console.error('[AuthStore] fetchAccounts failed:', err);
            set({ accounts: [], accountsMeta: null, loading: false });
        }
    },
}));

export const useReceiversStore = create<ReceiversState>((set) => ({
    receivers: [],
    receiversMeta: null,
    selectedReceiver: null,
    selectedCurrency: "USD",
    transactions: [],
    transactionsMeta: null,
    loading: false,
    error: null,
    fetchReceivers: async (page = 1, limit = 5) => {
        set({ loading: true, error: null });
        try {
            const { data, meta } = await apiFetch(`/contacts?page=${page}&limit=${limit}`);
            set({ receivers: data, receiversMeta: meta, loading: false });
        } catch (err: any) {
            set({ error: err.message, loading: false });
        }
    },
    fetchContactTransactions: async (contactId: string, page = 1, limit = 5) => {
        console.log('[ReceiversStore] fetchContactTransactions() called for', contactId);
        set({ loading: true });
        try {
            const { data, meta } = await apiFetch(`/contacts/${contactId}/transactions?page=${page}&limit=${limit}`);
            console.log('[ReceiversStore] fetchContactTransactions() success — got', data.length, 'transactions');
            set({ transactions: data, transactionsMeta: meta, loading: false });
        } catch (err: any) {
            console.error('[ReceiversStore] fetchContactTransactions failed:', err);
            set({ transactions: [], transactionsMeta: null, loading: false });
        }
    },
    setSelectedReceiver: (receiver) => set({ selectedReceiver: receiver }),
    setSelectedCurrency: (currency) => set({ selectedCurrency: currency }),
}));
