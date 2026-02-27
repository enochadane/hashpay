"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import StatusBadge from "./StatusBadge";
import CurrencyBadge from "./CurrencyBadge";
import { useReceiversStore, type Receiver, type Transaction } from "../lib/store";

interface ReceiverDetailModalProps {
    receiver: Receiver;
    currentUserName: string;
    onClose: () => void;
}

export default function ReceiverDetailModal({
    receiver,
    currentUserName,
    onClose,
}: ReceiverDetailModalProps) {
    const {
        transactions,
        loading,
        fetchContactTransactions,
        selectedCurrency,
        setSelectedCurrency
    } = useReceiversStore();

    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("ALL");

    const filteredTransactions = transactions.filter(tx => {
        const matchesCurrency = !selectedCurrency || tx.currency?.code === selectedCurrency;

        const receiverProfile = tx.to_account?.profiles;
        const receiverName = receiverProfile ? `${receiverProfile.first_name} ${receiverProfile.last_name}` : "Unknown";

        const matchesSearch = !searchTerm ||
            receiverName.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus = statusFilter === "ALL" ||
            tx.status?.toUpperCase() === statusFilter.toUpperCase();

        return matchesCurrency && matchesSearch && matchesStatus;
    });

    useEffect(() => {
        if (receiver.id) {
            fetchContactTransactions(receiver.id);
        }
    }, [receiver.id, fetchContactTransactions]);

    const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget) onClose();
    };

    const formatDate = (dateStr: string) => {
        if (!dateStr) return "N/A";
        const d = new Date(dateStr);
        return d.toLocaleDateString('en-GB', {
            weekday: 'short',
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <div
            className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center sm:items-center p-0 sm:p-6 animate-fade-in"
            onClick={handleBackdropClick}
        >
            <div className="bg-white rounded-t-[1.25rem] sm:rounded-[1.25rem] w-full sm:max-w-[min(1080px,calc(100vw-3rem))] max-h-[92vh] sm:max-h-[88vh] overflow-y-auto overflow-x-hidden px-4 py-6 sm:px-10 sm:py-9 relative animate-slide-up shadow-[0_32px_80px_rgba(0,0,0,0.20)]">

                <div className="flex items-start justify-between mb-5">
                    <div>
                        <div className="flex items-center gap-3.5 flex-wrap">
                            <h2 className="text-[22px] font-bold text-gray-900 m-0">
                                {receiver.name}
                            </h2>
                            <a
                                href="#"
                                className="flex items-center gap-1 text-[#D4A843] text-sm font-medium no-underline whitespace-nowrap"
                                onClick={(e) => e.preventDefault()}
                            >
                                Send Them Money
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="5" y1="12" x2="19" y2="12" />
                                    <polyline points="12 5 19 12 12 19" />
                                </svg>
                            </a>
                        </div>
                        <p className="text-gray-400 text-[13px] mt-1 mb-0">{receiver.email}</p>
                    </div>

                    <div className="flex gap-2 ml-4 shrink-0">
                        <button
                            className="w-[38px] h-[38px] border border-gray-200 rounded-[10px] bg-white flex items-center justify-center cursor-pointer text-gray-700 hover:border-gray-300 transition-colors"
                            title="Edit"
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                            </svg>
                        </button>
                        <button
                            onClick={onClose}
                            className="w-[38px] h-[38px] border border-gray-200 rounded-[10px] bg-white flex items-center justify-center cursor-pointer text-gray-700 text-lg leading-none hover:border-gray-300 transition-colors"
                            title="Close"
                        >
                            ×
                        </button>
                    </div>
                </div>

                <div className="mb-7">
                    <p className="text-[13px] text-gray-500 mb-3">Currencies they use:</p>
                    <div className="flex gap-3 flex-wrap">
                        {(() => {
                            const grouped = receiver.currencies.reduce((map: Record<string, { code: string; countryCode: string; accountCount: number }>, c: any) => {
                                if (map[c.code]) {
                                    map[c.code].accountCount += c.accountCount;
                                } else {
                                    map[c.code] = { code: c.code, countryCode: c.countryCode, accountCount: c.accountCount };
                                }
                                return map;
                            }, {} as Record<string, { code: string; countryCode: string; accountCount: number }>);
                            return Object.values(grouped).map((c) => (
                                <CurrencyBadge
                                    key={c.code}
                                    countryCode={c.countryCode}
                                    code={c.code}
                                    accountCount={c.accountCount}
                                    isSelected={selectedCurrency === c.code}
                                    onClick={() => setSelectedCurrency(selectedCurrency === c.code ? null : c.code)}
                                />
                            ));
                        })()}
                    </div>
                </div>

                <div>
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-[17px] font-bold text-gray-900 m-0">
                            Transactions History With {currentUserName}
                        </h3>
                        <div className="flex gap-3 items-center">
                            <div className="flex items-center gap-1.5 p-1 bg-gray-50 border border-gray-100 rounded-[12px]">
                                {(["ALL", "APPROVED", "PENDING"] as const).map((s) => (
                                    <button
                                        key={s}
                                        onClick={() => setStatusFilter(s)}
                                        className={`px-3 py-1.5 rounded-[9px] text-[11px] font-bold transition-all border-none cursor-pointer ${statusFilter === s
                                            ? "bg-white text-gray-900 shadow-sm"
                                            : "bg-transparent text-gray-400 hover:text-gray-600"
                                            }`}
                                    >
                                        {s === "ALL" ? "All" : s.charAt(0) + s.slice(1).toLowerCase()}
                                    </button>
                                ))}
                            </div>
                            <div className="relative flex items-center">
                                <input
                                    type="text"
                                    placeholder="Search by name..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="h-[34px] border border-gray-200 rounded-[10px] bg-white px-3 py-1 text-[13px] text-gray-700 focus:outline-none focus:border-[#D4A843] transition-all w-[220px] sm:w-[300px] pr-8"
                                />
                                <div className="absolute right-2.5 text-gray-400">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                        <circle cx="11" cy="11" r="8" />
                                        <line x1="21" y1="21" x2="16.65" y2="16.65" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
                        <table className="w-full border-collapse text-[13px]">
                            <thead>
                                <tr>
                                    {["#", "Reference number", "To", "Date & Time", "Paid with", "Amount", "Status", "Actions"].map((h) => (
                                        <th
                                            key={h}
                                            className="text-left text-gray-400 font-medium text-xs pb-2.5 pr-4 whitespace-nowrap border-b border-gray-100"
                                        >
                                            {h}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {loading && transactions.length === 0 ? (
                                    <tr>
                                        <td colSpan={8} className="py-20 text-center">
                                            <div className="flex flex-col items-center gap-3">
                                                <div className="w-6 h-6 border-2 border-gray-100 border-t-[#D4A843] rounded-full animate-spin" />
                                                <span className="text-gray-400">Loading history...</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : filteredTransactions.length === 0 ? (
                                    <tr>
                                        <td colSpan={8} className="py-12 text-center text-gray-400">
                                            {transactions.length === 0
                                                ? `No transactions found between you and ${receiver.name}.`
                                                : searchTerm
                                                    ? `No transactions matching "${searchTerm}" found.`
                                                    : statusFilter !== "ALL"
                                                        ? `No ${statusFilter.toLowerCase()} transactions found.`
                                                        : `No transactions found for ${selectedCurrency}.`}
                                        </td>
                                    </tr>
                                ) : (
                                    filteredTransactions.map((tx: Transaction, idx: number) => {
                                        const receiverProfile = tx.to_account?.profiles;
                                        const receiverName = receiverProfile ? `${receiverProfile.first_name} ${receiverProfile.last_name}` : "Unknown";
                                        const paidWith = tx.from_account?.provider_details || "—";

                                        return (
                                            <tr key={tx.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                                                <td className="py-3.5 pr-4 text-gray-400">{idx + 1}</td>
                                                <td className="py-3.5 pr-4 text-gray-700 font-medium font-mono text-xs uppercase">{tx.reference_number?.slice(-12) || "TXN-" + tx.id.slice(0, 8)}</td>
                                                <td className="py-3.5 pr-4 text-gray-900 font-medium">{receiverName}</td>
                                                <td className="py-3.5 pr-4 text-gray-500 whitespace-nowrap">{formatDate(tx.created_at)}</td>
                                                <td className="py-3.5 pr-4 text-gray-700 text-xs whitespace-nowrap">{paidWith}</td>
                                                <td className="py-3.5 pr-4 text-gray-900 whitespace-nowrap">
                                                    <span className="flex items-center gap-2">
                                                        <span className="w-5 h-5 rounded-full overflow-hidden shrink-0 inline-flex relative border border-gray-100">
                                                            <Image
                                                                src={`https://flagcdn.com/w40/${tx.currency.country_code.toLowerCase()}.png`}
                                                                alt={tx.currency.code}
                                                                width={40}
                                                                height={30}
                                                                className="w-full h-full object-cover"
                                                                unoptimized
                                                            />
                                                        </span>
                                                        <span className="font-bold">{parseFloat(tx.amount).toLocaleString()} {tx.currency.code}</span>
                                                    </span>
                                                </td>
                                                <td className="py-3.5 pr-4">
                                                    <StatusBadge status={tx.status as any} />
                                                </td>
                                                <td className="py-3.5 whitespace-nowrap">
                                                    <div className="flex items-center gap-1.5">
                                                        <button className="text-blue-600 text-xs font-semibold bg-transparent border border-blue-200 cursor-pointer px-2.5 py-1 rounded-md hover:bg-blue-50 transition-colors">
                                                            View
                                                        </button>
                                                        <button className="text-amber-600 text-xs font-semibold bg-transparent border border-amber-200 cursor-pointer px-2.5 py-1 rounded-md hover:bg-amber-50 transition-colors">
                                                            Download
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>

                    <p className="text-gray-400 text-xs mt-6">
                        Added {receiver.name} on {new Date(receiver.createdOn).toLocaleDateString()}
                    </p>
                </div>
            </div>
        </div>
    );
}
