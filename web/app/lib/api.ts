import { createClient } from './supabase/client';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

async function getAccessToken(): Promise<string | null> {
    const supabase = createClient();

    const { data: { session } } = await supabase.auth.getSession();
    if (session?.access_token) {
        return session.access_token;
    }

    return new Promise((resolve) => {
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            (_event, session) => {
                subscription.unsubscribe();
                resolve(session?.access_token ?? null);
            }
        );

        setTimeout(() => {
            subscription.unsubscribe();
            resolve(null);
        }, 3000);
    });
}

export async function apiFetch(endpoint: string, options: RequestInit = {}) {
    const token = await getAccessToken();

    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        ...(options.headers as Record<string, string> || {}),
    };

    const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers,
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `API request failed (${response.status})`);
    }

    return response.json();
}
