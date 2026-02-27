"use client";

import { useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import { getAccessToken } from './api';
import { useAuthStore, useReceiversStore } from './store';

const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

let socket: Socket | null = null;
let isConnecting = false;

async function connectSocket() {
    if (socket?.connected || isConnecting) {
        console.log('[Socket] Already connected or connecting, skipping');
        return;
    }

    isConnecting = true;
    console.log('[Socket] ── Initializing ──');
    console.log('[Socket] URL:', `${SOCKET_URL}/notifications`);

    try {
        const token = await getAccessToken();
        if (!token) {
            console.error('[Socket] ❌ No access token — cannot connect');
            isConnecting = false;
            return;
        }
        console.log('[Socket] ✅ Got access token (length:', token.length, ')');

        socket = io(`${SOCKET_URL}/notifications`, {
            auth: { token },
            transports: ['websocket', 'polling'],
            reconnection: true,
            reconnectionAttempts: 15,
            reconnectionDelay: 2000,
        });

        socket.on('connect', () => {
            console.log('[Socket] ✅ Connected! Socket ID:', socket?.id);
            isConnecting = false;
        });

        socket.on('TRANSACTION_SUCCESS', (data: any) => {
            console.log('[Socket] 📨 TRANSACTION_SUCCESS received:', data);
            useAuthStore.getState().fetchAccounts();

            const receiver = useReceiversStore.getState().selectedReceiver;
            if (receiver) {
                const from = data.from_account?.user_id;
                const to = data.to_account?.user_id;
                if (from === receiver.id || to === receiver.id) {
                    console.log('[Socket] Refreshing contact transactions for', receiver.id);
                    useReceiversStore.getState().fetchContactTransactions(receiver.id);
                }
            }
        });

        socket.on('new_notification', (n: any) => {
            console.log('[Socket] 🔔 Notification:', n);
        });

        socket.on('disconnect', (reason: string) => {
            console.warn('[Socket] ❌ Disconnected:', reason);
            isConnecting = false;
        });

        socket.on('connect_error', (err: Error) => {
            console.error('[Socket] ❌ Connection error:', err.message);
            isConnecting = false;
        });

        socket.io.on('reconnect_attempt', (attempt: number) => {
            console.log(`[Socket] 🔄 Reconnecting (attempt ${attempt})...`);
        });

    } catch (err) {
        console.error('[Socket] ❌ Init failed:', err);
        isConnecting = false;
    }
}

export function useSocket() {
    const profile = useAuthStore((s) => s.profile);

    useEffect(() => {
        if (profile) {
            connectSocket();
        }
    }, [profile]);
}
