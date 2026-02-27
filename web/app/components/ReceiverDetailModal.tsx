"use client";

import Image from "next/image";
import StatusBadge, { type Status } from "./StatusBadge";
import CurrencyBadge from "./CurrencyBadge";

export interface Transaction {
    id: number;
    referenceNumber: string;
    to: string;
    dateTime: string;
    paidWith: string;
    amount: string;
    amountCountryCode: string;
    status: Status;
}

export interface ReceiverCurrency {
    countryCode: string;
    code: string;
    accountCount: number;
}

export interface Receiver {
    id: number;
    name: string;
    email: string;
    currencies: ReceiverCurrency[];
    transactions: Transaction[];
    createdOn: string;
}

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
    const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget) onClose();
    };

    return (
        <div
            className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center p-0 sm:p-6 animate-fade-in"
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
                        {receiver.currencies.map((c) => (
                            <CurrencyBadge key={c.code} countryCode={c.countryCode} code={c.code} accountCount={c.accountCount} />
                        ))}
                    </div>
                </div>

                <div>
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-[17px] font-bold text-gray-900 m-0">
                            Transactions History With {currentUserName}
                        </h3>
                        <div className="flex gap-2">
                            <button
                                className="w-[34px] h-[34px] border border-gray-200 rounded-[10px] bg-white flex items-center justify-center cursor-pointer text-gray-700 hover:border-gray-300 transition-colors"
                                title="Search"
                            >
                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="11" cy="11" r="8" />
                                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                                </svg>
                            </button>
                            <button
                                className="w-[34px] h-[34px] border border-gray-200 rounded-[10px] bg-white flex items-center justify-center cursor-pointer text-gray-700 hover:border-gray-300 transition-colors"
                                title="Expand"
                            >
                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="7 17 17 7" />
                                    <polyline points="7 7 17 7 17 17" />
                                </svg>
                            </button>
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
                                {receiver.transactions.map((tx) => (
                                    <tr key={tx.id} className="border-b border-gray-50">
                                        <td className="py-3.5 pr-4 text-gray-400">{tx.id}</td>
                                        <td className="py-3.5 pr-4 text-gray-700 font-medium font-mono text-xs">{tx.referenceNumber}</td>
                                        <td className="py-3.5 pr-4 text-gray-900">{tx.to}</td>
                                        <td className="py-3.5 pr-4 text-gray-500 whitespace-nowrap">{tx.dateTime}</td>
                                        <td className="py-3.5 pr-4 text-gray-700">{tx.paidWith}</td>
                                        <td className="py-3.5 pr-4 text-gray-900 whitespace-nowrap">
                                            <span className="flex items-center gap-2">
                                                <span className="w-5 h-5 rounded-full overflow-hidden shrink-0 inline-flex relative">
                                                    <Image
                                                        src={`https://flagcdn.com/w40/${tx.amountCountryCode.toLowerCase()}.png`}
                                                        alt={tx.amountCountryCode}
                                                        width={40}
                                                        height={30}
                                                        className="w-full h-full object-cover"
                                                        unoptimized
                                                    />
                                                </span>
                                                {tx.amount}
                                            </span>
                                        </td>
                                        <td className="py-3.5 pr-4">
                                            <StatusBadge status={tx.status} />
                                        </td>
                                        <td className="py-3.5 whitespace-nowrap">
                                            <button className="text-gray-700 text-xs font-medium bg-transparent border-none cursor-pointer px-1 py-0.5 hover:text-gray-900">
                                                View
                                            </button>
                                            <span className="text-gray-200 mx-1">|</span>
                                            <button className="text-[#D4A843] text-xs font-medium bg-transparent border-none cursor-pointer px-1 py-0.5 hover:text-[#c49830]">
                                                Download
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <p className="text-gray-400 text-xs mt-6">
                        You&apos;ve created this customer on {receiver.createdOn}
                    </p>
                </div>
            </div>
        </div>
    );
}
