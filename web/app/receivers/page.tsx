"use client";

import Image from "next/image";
import { useState } from "react";
import Sidebar from "../components/Sidebar";
import SearchBar from "../components/SearchBar";
import ReceiverDetailModal, { type Receiver } from "../components/ReceiverDetailModal";

const MOCK_RECEIVERS: Receiver[] = [
    {
        id: 1,
        name: "Taha Shokouhi",
        email: "taha@email.com",
        currencies: [
            { countryCode: "us", code: "USD", accountCount: 1 },
            { countryCode: "ir", code: "IRR", accountCount: 2 },
            { countryCode: "in", code: "INR", accountCount: 1 },
        ],
        transactions: [
            { id: 1, referenceNumber: "61651351355468", to: "Taha Shokouhi", dateTime: "Mon 23 Dec 2024, 3:40 PM", paidWith: "ACH (Connected bank Accounts)", amount: "3000$", amountCountryCode: "us", status: "Approved" },
            { id: 2, referenceNumber: "61651351355468", to: "Taha Shokouhi", dateTime: "Thu 18 Dec 2024, 8:20 AM", paidWith: "ACH (Connected bank Accounts)", amount: "1,191,680 ₹", amountCountryCode: "in", status: "Pending" },
            { id: 3, referenceNumber: "61651351355468", to: "Taha Shokouhi", dateTime: "Thu 18 Dec 2024, 8:15 AM", paidWith: "ACH (Connected bank Accounts)", amount: "1,191,680 ₹", amountCountryCode: "in", status: "Approved" },
        ],
        createdOn: "22 Dec 2024",
    },
    {
        id: 2,
        name: "Rami Hussein",
        email: "rami@email.com",
        currencies: [
            { countryCode: "us", code: "USD", accountCount: 2 },
            { countryCode: "jo", code: "JOD", accountCount: 1 },
        ],
        transactions: [
            { id: 1, referenceNumber: "78432189564312", to: "Rami Hussein", dateTime: "Fri 20 Dec 2024, 11:00 AM", paidWith: "ACH (Connected bank Accounts)", amount: "500$", amountCountryCode: "us", status: "Approved" },
            { id: 2, referenceNumber: "78432189564312", to: "Rami Hussein", dateTime: "Wed 15 Dec 2024, 9:30 AM", paidWith: "Wire Transfer", amount: "354 JOD", amountCountryCode: "jo", status: "Pending" },
        ],
        createdOn: "10 Dec 2024",
    },
    {
        id: 3,
        name: "Sofia Martinez",
        email: "sofia@email.com",
        currencies: [
            { countryCode: "eu", code: "EUR", accountCount: 1 },
            { countryCode: "mx", code: "MXN", accountCount: 1 },
        ],
        transactions: [
            { id: 1, referenceNumber: "99127345678901", to: "Sofia Martinez", dateTime: "Tue 17 Dec 2024, 2:15 PM", paidWith: "ACH (Connected bank Accounts)", amount: "€1,200", amountCountryCode: "eu", status: "Approved" },
        ],
        createdOn: "5 Dec 2024",
    },
    {
        id: 4,
        name: "Liang Wei",
        email: "liang@email.com",
        currencies: [
            { countryCode: "cn", code: "CNY", accountCount: 2 },
            { countryCode: "us", code: "USD", accountCount: 1 },
        ],
        transactions: [
            { id: 1, referenceNumber: "54321987654321", to: "Liang Wei", dateTime: "Sun 22 Dec 2024, 1:00 PM", paidWith: "Wire Transfer", amount: "¥8,000", amountCountryCode: "cn", status: "Approved" },
            { id: 2, referenceNumber: "54321987654321", to: "Liang Wei", dateTime: "Sat 14 Dec 2024, 4:45 PM", paidWith: "ACH (Connected bank Accounts)", amount: "200$", amountCountryCode: "us", status: "Pending" },
        ],
        createdOn: "3 Dec 2024",
    },
    {
        id: 5,
        name: "Amira Osei",
        email: "amira@email.com",
        currencies: [
            { countryCode: "gh", code: "GHS", accountCount: 1 },
            { countryCode: "us", code: "USD", accountCount: 1 },
        ],
        transactions: [
            { id: 1, referenceNumber: "11223344556677", to: "Amira Osei", dateTime: "Mon 16 Dec 2024, 10:20 AM", paidWith: "ACH (Connected bank Accounts)", amount: "150$", amountCountryCode: "us", status: "Approved" },
        ],
        createdOn: "1 Dec 2024",
    },
];

function getInitials(name: string) {
    return name.split(" ").slice(0, 2).map((n) => n[0]).join("").toUpperCase();
}

const AVATAR_COLORS = ["#4f46e5", "#0891b2", "#059669", "#d97706", "#dc2626", "#7c3aed", "#db2777", "#065f46", "#1e40af"];
function avatarColor(id: number) { return AVATAR_COLORS[id % AVATAR_COLORS.length]; }

function StatCard({ label, value, sub, icon, accentColor }: {
    label: string; value: string; sub: string; icon: React.ReactNode; accentColor: string;
}) {
    return (
        <div className="flex items-start gap-4 flex-1 bg-white border border-gray-200 rounded-2xl px-6 py-5 shadow-sm min-w-0">
            <div
                className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                style={{ backgroundColor: accentColor + "18", color: accentColor }}
            >
                {icon}
            </div>
            <div className="min-w-0">
                <p className="text-[12px] text-gray-400 m-0 mb-1 font-medium">{label}</p>
                <p className="text-2xl font-extrabold text-gray-900 m-0 mb-0.5 tracking-tight">{value}</p>
                <p className="text-[12px] text-gray-400 m-0">{sub}</p>
            </div>
        </div>
    );
}

export default function ReceiversPage() {
    const [search, setSearch] = useState("");
    const [selectedReceiver, setSelectedReceiver] = useState<Receiver | null>(null);
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const filtered = MOCK_RECEIVERS.filter(
        (r) =>
            r.name.toLowerCase().includes(search.toLowerCase()) ||
            r.email.toLowerCase().includes(search.toLowerCase())
    );

    const totalAccounts = MOCK_RECEIVERS.flatMap((r) => r.currencies).reduce((s, c) => s + c.accountCount, 0);
    const totalTransactions = MOCK_RECEIVERS.flatMap((r) => r.transactions).length;
    const totalCurrencies = new Set(MOCK_RECEIVERS.flatMap((r) => r.currencies.map((c) => c.code))).size;

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
                                <span className="text-black font-bold text-xs">K</span>
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

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-7">
                            <StatCard label="Total Receivers" value={String(MOCK_RECEIVERS.length)} sub="All time" accentColor="#D4A843"
                                icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>}
                            />
                            <StatCard label="Linked Accounts" value={String(totalAccounts)} sub="Across all receivers" accentColor="#4f46e5"
                                icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 3H8L2 7h20l-6-4z" /><circle cx="16" cy="14" r="2" /></svg>}
                            />
                            <StatCard label="Transactions Sent" value={String(totalTransactions)} sub="Total payments made" accentColor="#059669"
                                icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></svg>}
                            />
                            <StatCard label="Currencies Used" value={String(totalCurrencies)} sub="Unique currencies" accentColor="#0891b2"
                                icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" /></svg>}
                            />
                        </div>

                        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
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
                                        {filtered.length === 0 ? (
                                            <tr>
                                                <td colSpan={5} className="py-12 text-center text-gray-400 text-sm">
                                                    No receivers found.
                                                </td>
                                            </tr>
                                        ) : (
                                            filtered.map((receiver, idx) => (
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
                                                            {receiver.currencies.map((c) => (
                                                                <span
                                                                    key={c.code}
                                                                    title={c.code}
                                                                    className="w-[26px] h-[26px] rounded-full overflow-hidden shrink-0 border border-gray-200 inline-flex"
                                                                >
                                                                    <Image
                                                                        src={`https://flagcdn.com/w40/${c.countryCode.toLowerCase()}.png`}
                                                                        alt={c.code}
                                                                        width={40}
                                                                        height={30}
                                                                        className="w-full h-full object-cover"
                                                                        unoptimized
                                                                    />
                                                                </span>
                                                            ))}
                                                            <span className="text-xs text-gray-400 ml-1">
                                                                {receiver.currencies.reduce((s, c) => s + c.accountCount, 0)} accts
                                                            </span>
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
                                    Showing {filtered.length} of {MOCK_RECEIVERS.length} receivers
                                </p>
                            </div>
                        </div>
                    </main>
                </div>
            </div>

            {selectedReceiver && (
                <ReceiverDetailModal
                    receiver={selectedReceiver}
                    currentUserName="Kasra"
                    onClose={() => setSelectedReceiver(null)}
                />
            )}
        </>
    );
}
