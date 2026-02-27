"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import SearchBar from "../components/SearchBar";
import ReceiverDetailModal from "../components/ReceiverDetailModal";
import { useReceiversStore, useAuthStore, type Receiver } from "../lib/store";

function getInitials(name: string) {
    if (!name) return "";
    return name.split(" ").slice(0, 2).map((n) => n[0]).join("").toUpperCase();
}

const AVATAR_COLORS = ["#4f46e5", "#0891b2", "#059669", "#d97706", "#dc2626", "#7c3aed", "#db2777", "#065f46", "#1e40af"];
function avatarColor(id: string) {
    const numId = id.split('-').reduce((acc, part) => acc + parseInt(part, 16) || 0, 0);
    return AVATAR_COLORS[numId % AVATAR_COLORS.length];
}

function BalanceCard({ balance, code, countryCode }: {
    balance: string; code: string; countryCode: string;
}) {
    return (
        <div className="flex flex-col gap-3 min-w-[200px] bg-white border border-gray-100 rounded-[24px] p-5 shadow-sm hover:shadow-md transition-all duration-300 group">
            <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-full overflow-hidden border border-gray-100 shadow-sm shrink-0">
                    <Image
                        src={`https://flagcdn.com/w80/${countryCode.toLowerCase()}.png`}
                        alt={code}
                        width={40}
                        height={30}
                        className="w-full h-full object-cover scale-125"
                        unoptimized
                    />
                </div>
                <span className="text-[11px] font-bold text-gray-400 tracking-wider uppercase bg-gray-50 px-2 py-1 rounded-lg">
                    {code}
                </span>
            </div>
            <div className="mt-1">
                <p className="text-[11px] text-gray-400 font-medium mb-0.5">Available Balance</p>
                <div className="flex items-baseline gap-1.5">
                    <span className="text-2xl font-black text-gray-900 tracking-tight">
                        {parseFloat(balance).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                    <span className="text-sm font-bold text-[#D4A843]">{code}</span>
                </div>
            </div>
            <div className="h-1 w-0 group-hover:w-full bg-[#D4A843] transition-all duration-300 rounded-full opacity-20" />
        </div>
    );
}

export default function ReceiversPage() {
    const [search, setSearch] = useState("");
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const { receivers, loading, error, fetchReceivers, setSelectedReceiver, selectedReceiver } = useReceiversStore();
    const { profile, fetchProfile, accounts, fetchAccounts } = useAuthStore();

    useEffect(() => {
        fetchReceivers();
        fetchProfile();
        fetchAccounts();
    }, [fetchReceivers, fetchProfile, fetchAccounts]);

    const filtered = receivers.filter(
        (r: Receiver) =>
            r.name.toLowerCase().includes(search.toLowerCase()) ||
            r.email.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <>
            <div className="flex flex-col sm:flex-row min-h-screen bg-[#f3f4f6]">
                <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

                <div className="flex flex-col flex-1 min-w-0">

                    <div className="flex sm:hidden items-center justify-between px-5 py-3.5 bg-[#f5f5f7] border-b border-gray-200 sticky top-0 z-30">
                        <div className="flex items-center gap-2.5">
                            <button
                                onClick={() => setSidebarOpen(true)}
                                className="p-1 flex bg-transparent border-none text-gray-600 cursor-pointer"
                                aria-label="Open menu"
                            >
                                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                                    <line x1="3" y1="6" x2="21" y2="6" />
                                    <line x1="3" y1="12" x2="21" y2="12" />
                                    <line x1="3" y1="18" x2="21" y2="18" />
                                </svg>
                            </button>
                            <span className="text-gray-900 font-bold text-base">HashPay</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-[30px] h-[30px] rounded-full bg-[#D4A843] flex items-center justify-center">
                                <span className="text-black font-bold text-[13px]">{profile?.first_name?.[0] || "U"}</span>
                            </div>
                        </div>
                    </div>

                    <main className="flex-1 p-4 sm:px-12 sm:py-10 overflow-y-auto min-w-0">

                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center justify-between mb-7">
                            <h1 className="text-[26px] font-extrabold text-gray-900 m-0 tracking-tight">Receivers</h1>
                            <div className="flex items-center gap-3">
                                <button className="w-10 h-10 rounded-xl border border-gray-200 bg-white flex items-center justify-center cursor-pointer text-gray-500 shrink-0 hover:border-gray-300 transition-colors">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                                        <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                                    </svg>
                                </button>
                                <SearchBar value={search} onChange={setSearch} />
                            </div>
                        </div>

                        {/* Balance Cards Grid */}
                        <div className="flex flex-nowrap sm:grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-10 overflow-x-auto pb-4 sm:pb-0 scrollbar-hide">
                            {accounts.length > 0 ? (
                                accounts.map((acc) => (
                                    <BalanceCard
                                        key={acc.id}
                                        balance={acc.balance}
                                        code={acc.currencies.code}
                                        countryCode={acc.currencies.country_code}
                                    />
                                ))
                            ) : (
                                <div className="col-span-full py-8 text-center bg-white rounded-3xl border border-dashed border-gray-200">
                                    <p className="text-gray-400 text-sm">No accounts found</p>
                                </div>
                            )}
                        </div>

                        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm min-h-[400px]">
                            <div className="flex items-center justify-between px-6 pt-[18px]">
                                <p className="font-bold text-[15px] text-gray-900 m-0">All Receivers</p>
                                <button className="bg-[#D4A843] text-black border-none rounded-[10px] px-[18px] py-2 font-bold text-[13px] cursor-pointer hover:bg-[#c49830] transition-colors">
                                    + Add Receiver
                                </button>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="receivers-table w-full border-collapse text-sm mt-3">
                                    <thead>
                                        <tr className="bg-gray-50 border-t border-b border-gray-100">
                                            {["#", "Name", "Email", "Currencies", "Action"].map((h) => (
                                                <th key={h} className="text-left px-6 py-3.5 text-gray-400 font-medium text-xs tracking-wide whitespace-nowrap">
                                                    {h}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {loading ? (
                                            <tr>
                                                <td colSpan={5} className="py-20 text-center">
                                                    <div className="flex flex-col items-center gap-3">
                                                        <div className="w-8 h-8 border-4 border-gray-100 border-t-[#D4A843] rounded-full animate-spin" />
                                                        <span className="text-sm text-gray-400">Loading receivers...</span>
                                                    </div>
                                                </td>
                                            </tr>
                                        ) : error ? (
                                            <tr>
                                                <td colSpan={5} className="py-20 text-center text-red-500 text-sm">
                                                    {error}
                                                </td>
                                            </tr>
                                        ) : filtered.length === 0 ? (
                                            <tr>
                                                <td colSpan={5} className="py-20 text-center text-gray-400 text-sm">
                                                    No receivers found.
                                                </td>
                                            </tr>
                                        ) : (
                                            filtered.map((receiver: Receiver, idx: number) => (
                                                <tr
                                                    key={receiver.id}
                                                    onClick={() => setSelectedReceiver(receiver)}
                                                    className={`cursor-pointer transition-colors hover:bg-gray-50 ${idx < filtered.length - 1 ? "border-b border-gray-100" : ""}`}
                                                >
                                                    <td className="px-6 py-4 text-gray-400 w-12">{idx + 1}</td>

                                                    <td data-label="Name" className="px-6 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <div
                                                                className="w-[38px] h-[38px] rounded-full flex items-center justify-center shrink-0"
                                                                style={{ backgroundColor: avatarColor(receiver.id) }}
                                                            >
                                                                <span className="text-white text-[13px] font-bold">{getInitials(receiver.name)}</span>
                                                            </div>
                                                            <span className="font-semibold text-gray-900 whitespace-nowrap">{receiver.name}</span>
                                                        </div>
                                                    </td>

                                                    <td data-label="Email" className="px-6 py-4 text-gray-500 whitespace-nowrap">{receiver.email}</td>

                                                    <td data-label="Currencies" className="px-6 py-4">
                                                        <div className="flex items-center gap-1.5 flex-wrap">
                                                            {(() => {
                                                                // Group currencies by code, summing accountCount
                                                                const grouped = receiver.currencies.reduce((map: Record<string, { code: string; countryCode: string; accountCount: number }>, c: any) => {
                                                                    if (map[c.code]) {
                                                                        map[c.code].accountCount += c.accountCount;
                                                                    } else {
                                                                        map[c.code] = { code: c.code, countryCode: c.countryCode, accountCount: c.accountCount };
                                                                    }
                                                                    return map;
                                                                }, {} as Record<string, { code: string; countryCode: string; accountCount: number }>);
                                                                const uniqueCurrencies = Object.values(grouped);
                                                                const totalAccts = uniqueCurrencies.reduce((s, c) => s + c.accountCount, 0);
                                                                return (
                                                                    <>
                                                                        {uniqueCurrencies.map((c) => (
                                                                            <span
                                                                                key={c.code}
                                                                                title={`${c.code} — ${c.accountCount} account${c.accountCount !== 1 ? "s" : ""}`}
                                                                                className="w-[26px] h-[26px] rounded-full overflow-hidden shrink-0 border border-gray-200 inline-flex relative"
                                                                            >
                                                                                <Image
                                                                                    src={`https://flagcdn.com/w40/${c.countryCode.toLowerCase()}.png`}
                                                                                    alt={c.code}
                                                                                    width={40}
                                                                                    height={30}
                                                                                    className="w-full h-full object-cover"
                                                                                    unoptimized
                                                                                />
                                                                                {c.accountCount > 1 && (
                                                                                    <span className="absolute -top-1 -right-1 bg-[#D4A843] text-black text-[9px] font-bold w-3.5 h-3.5 rounded-full flex items-center justify-center leading-none shadow-sm">
                                                                                        {c.accountCount}
                                                                                    </span>
                                                                                )}
                                                                            </span>
                                                                        ))}
                                                                        <span className="text-xs text-gray-400 ml-1">
                                                                            {totalAccts} acct{totalAccts !== 1 ? "s" : ""}
                                                                        </span>
                                                                    </>
                                                                );
                                                            })()}
                                                        </div>
                                                    </td>

                                                    <td data-label="Action" className="px-6 py-4">
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); setSelectedReceiver(receiver); }}
                                                            className="text-[#D4A843] font-semibold text-[13px] bg-transparent border-none cursor-pointer py-1.5 hover:text-[#c49830] transition-colors"
                                                        >
                                                            View →
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            <div className="px-6 py-3.5 border-t border-gray-100">
                                <p className="text-xs text-gray-400 m-0">
                                    Showing {filtered.length} of {receivers.length} receivers
                                </p>
                            </div>
                        </div>
                    </main>
                </div>
            </div>

            {selectedReceiver && (
                <ReceiverDetailModal
                    receiver={selectedReceiver}
                    currentUserName={profile ? `${profile.first_name} ${profile.last_name}` : "User"}
                    onClose={() => setSelectedReceiver(null)}
                />
            )}
        </>
    );
}
