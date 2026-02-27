"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useAuthStore, useReceiversStore, type Receiver } from "../lib/store";
import { apiFetch } from "../lib/api";

interface SendMoneyModalProps {
    onClose: () => void;
}

export default function SendMoneyModal({ onClose }: SendMoneyModalProps) {
    const [step, setStep] = useState<1 | 2>(1);
    const [selectedReceiver, setSelectedReceiver] = useState<Receiver | null>(null);
    const [amount, setAmount] = useState("");
    const [currencyId, setCurrencyId] = useState("");
    const [idempotencyKey] = useState(() => Math.random().toString(36).substring(7));
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState("");
    const [receiverAccounts, setReceiverAccounts] = useState<any[]>([]);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const { receivers, fetchReceivers } = useReceiversStore();
    const { accounts, fetchAccounts, profile } = useAuthStore();

    useEffect(() => {
        if (receivers.length === 0) fetchReceivers();
        if (accounts.length === 0) fetchAccounts();
    }, [receivers, accounts, fetchReceivers, fetchAccounts]);

    const filteredReceivers = receivers.filter(r =>
        r.name.toLowerCase().includes(search.toLowerCase()) ||
        r.email.toLowerCase().includes(search.toLowerCase())
    );

    const handleSelectReceiver = async (receiver: Receiver) => {
        setSelectedReceiver(receiver);
        setLoading(true);
        try {
            const data = await apiFetch(`/contacts/${receiver.id}/accounts`);
            setReceiverAccounts(data);
            if (data.length > 0) {
                setCurrencyId(data[0].currency_id);
            }
            setStep(2);
        } catch (err: any) {
            setError("Failed to fetch contact accounts");
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedReceiver || !currencyId || !amount) return;

        setLoading(true);
        setError(null);

        try {
            const senderAccount = accounts.find(a => a.currency_id === currencyId);
            const receiverAccount = receiverAccounts.find(a => a.currency_id === currencyId);

            if (!senderAccount) throw new Error("You don't have an account in this currency");
            if (!receiverAccount) throw new Error("Receiver doesn't have an account in this currency");

            await apiFetch("/transactions/transfer", {
                method: "POST",
                body: JSON.stringify({
                    fromAccountId: senderAccount.id,
                    toAccountId: receiverAccount.id,
                    amount: parseFloat(amount),
                    currencyId,
                    idempotencyKey,
                }),
            });

            setSuccess(true);
            fetchAccounts();
            const storeReceiver = useReceiversStore.getState().selectedReceiver;
            if (storeReceiver) {
                useReceiversStore.getState().fetchContactTransactions(storeReceiver.id);
            }
        } catch (err: any) {
            setError(err.message || "Transaction failed");
        } finally {
            setLoading(false);
        }
    };

    const selectedCurrency = receiverAccounts.find(a => a.currency_id === currencyId)?.currencies;
    const senderAccountForCurrency = accounts.find(a => a.currency_id === currencyId);

    if (success) {
        return (
            <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={onClose} />
                <div className="bg-white rounded-[32px] w-full max-w-md p-10 relative z-10 text-center animate-scale-up">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Transfer Successful!</h2>
                    <p className="text-gray-500 mb-8">Your money is on its way to {selectedReceiver?.name}.</p>
                    <button
                        onClick={onClose}
                        className="w-full bg-[#D4A843] text-black font-bold py-4 rounded-2xl hover:bg-[#c49830] transition-colors"
                    >
                        Done
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={onClose} />
            <div className="bg-white rounded-[32px] w-full max-w-md overflow-hidden relative z-10 animate-scale-up shadow-2xl">
                {/* Header */}
                <div className="px-8 pt-8 pb-4 flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Send Money</h2>
                        <p className="text-sm text-gray-500">{step === 1 ? "Select a contact" : "Enter amount"}</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full text-gray-400 transition-colors">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                    </button>
                </div>

                <div className="p-8 pt-2">
                    {step === 1 ? (
                        <>
                            <div className="relative mb-6">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
                                </span>
                                <input
                                    type="text"
                                    placeholder="Search contacts..."
                                    className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-[#D4A843]/20 focus:border-[#D4A843] transition-all"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                            </div>

                            <div className="max-h-[350px] overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                                {filteredReceivers.map(r => (
                                    <button
                                        key={r.id}
                                        onClick={() => handleSelectReceiver(r)}
                                        className="w-full flex items-center gap-4 p-4 rounded-2xl hover:bg-gray-50 transition-all text-left group"
                                    >
                                        <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden shrink-0 group-hover:scale-105 transition-transform">
                                            <span className="text-gray-600 font-bold">{r.name[0]}</span>
                                        </div>
                                        <div className="min-w-0">
                                            <p className="font-semibold text-gray-900 truncate">{r.name}</p>
                                            <p className="text-xs text-gray-500 truncate">{r.email}</p>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center shrink-0">
                                    <span className="text-gray-600 font-bold">{selectedReceiver?.name[0]}</span>
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="text-xs text-gray-400">Sending to</p>
                                    <p className="font-semibold text-gray-900 truncate">{selectedReceiver?.name}</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setStep(1)}
                                    className="text-xs font-bold text-[#D4A843] hover:underline"
                                >
                                    Change
                                </button>
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between items-center px-1">
                                    <label className="text-sm font-semibold text-gray-700">Amount</label>
                                    {senderAccountForCurrency && (
                                        <span className="text-xs text-gray-500">
                                            Balance: <span className="font-bold text-gray-900">{parseFloat(senderAccountForCurrency.balance).toLocaleString()} {selectedCurrency?.code}</span>
                                        </span>
                                    )}
                                </div>
                                <div className="relative">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2 pr-3 border-r border-gray-200">
                                        {selectedCurrency?.country_code && (
                                            <Image
                                                src={`https://flagcdn.com/w40/${selectedCurrency.country_code.toLowerCase()}.png`}
                                                alt={selectedCurrency.code}
                                                width={20} height={15}
                                                className="rounded-sm"
                                            />
                                        )}
                                        <select
                                            value={currencyId}
                                            onChange={(e) => setCurrencyId(e.target.value)}
                                            className="bg-transparent text-sm font-bold text-gray-900 focus:outline-none appearance-none cursor-pointer"
                                        >
                                            {receiverAccounts.map(acc => (
                                                <option key={acc.id} value={acc.currency_id}>{acc.currencies.code}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <input
                                        type="number"
                                        step="0.01"
                                        placeholder="0.00"
                                        required
                                        className="w-full pl-28 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-xl font-bold focus:outline-none focus:ring-2 focus:ring-[#D4A843]/20 focus:border-[#D4A843] transition-all"
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                    />
                                </div>
                            </div>

                            {error && (
                                <div className="p-4 bg-red-50 text-red-600 text-sm rounded-xl border border-red-100">
                                    {error}
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={loading || !amount || parseFloat(amount) <= 0}
                                className="w-full bg-[#D4A843] hover:bg-[#c49830] disabled:opacity-50 disabled:cursor-not-allowed text-black font-bold py-4 rounded-2xl transition-all shadow-lg shadow-[#D4A843]/20 relative overflow-hidden group"
                            >
                                {loading ? (
                                    <div className="w-6 h-6 border-3 border-black border-t-transparent rounded-full animate-spin mx-auto" />
                                ) : (
                                    "Continue"
                                )}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}
