"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { useAuthStore } from "../lib/store";

const navItems = [
    {
        label: "Wallet",
        href: "/wallet",
        icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="7" width="20" height="14" rx="2" />
                <path d="M16 3H8L2 7h20l-6-4z" />
                <circle cx="16" cy="14" r="2" />
            </svg>
        ),
    },
    {
        label: "Exchange",
        href: "/exchange",
        icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M7 16V4m0 0L3 8m4-4l4 4" />
                <path d="M17 8v12m0 0l4-4m-4 4l-4-4" />
            </svg>
        ),
    },
    {
        label: "Transactions",
        href: "/transactions",
        icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
                <polyline points="10 9 9 9 8 9" />
            </svg>
        ),
    },
    {
        label: "Receivers",
        href: "/receivers",
        icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
        ),
    },
];

const bottomItems = [
    {
        label: "Notifications",
        href: "/notifications",
        icon: (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
        ),
    },
    {
        label: "Profile",
        href: "/profile",
        icon: (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
            </svg>
        ),
    },
    {
        label: "Get Help",
        href: "/help",
        icon: (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
        ),
    },
];

interface SidebarProps {
    isOpen?: boolean;
    onClose?: () => void;
}

export default function Sidebar({ isOpen = true, onClose }: SidebarProps) {
    const pathname = usePathname();
    const { profile, fetchProfile } = useAuthStore();
    console.log(profile, 'profile');

    useEffect(() => {
        if (!profile) {
            fetchProfile();
        }
    }, [profile, fetchProfile]);

    const userInitials = profile ? (profile.first_name?.[0] || "") : "U";
    const userName = profile ? `${profile.first_name || ""} ${profile.last_name || ""}`.trim() : "User";
    const userEmail = profile?.email || "user@email.com";

    return (
        <>
            {isOpen && (
                <div
                    className="sm:hidden fixed inset-0 bg-black/55 z-[39] animate-fade-in"
                    onClick={onClose}
                    aria-hidden="true"
                />
            )}

            <aside
                className={`app-sidebar${isOpen ? " open" : ""} w-[260px] flex flex-col shrink-0 border-r border-gray-200 z-40`}
            >
                <div className="flex items-center justify-between px-6 pt-7 pb-5">
                    <div className="flex items-center gap-2.5">
                        <div className="w-[34px] h-[34px] rounded-[10px] bg-[#D4A843] flex items-center justify-center shrink-0">
                            <span className="text-black font-extrabold text-[15px]">H</span>
                        </div>
                        <span className="text-gray-900 font-bold text-base tracking-tight">HashPay</span>
                    </div>

                    {onClose && (
                        <div className="flex sm:hidden">
                            <button
                                onClick={onClose}
                                className="p-1 flex items-center text-gray-400 bg-transparent border-none cursor-pointer"
                                aria-label="Close menu"
                            >
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="18" y1="6" x2="6" y2="18" />
                                    <line x1="6" y1="6" x2="18" y2="18" />
                                </svg>
                            </button>
                        </div>
                    )}
                </div>

                <nav className="flex-1 px-3.5">
                    <ul className="list-none m-0 p-0 flex flex-col gap-1">
                        {navItems.map((item) => {
                            const active = pathname === item.href;
                            return (
                                <li key={item.href}>
                                    <Link
                                        href={item.href}
                                        onClick={onClose}
                                        className={`flex items-center gap-3.5 rounded-xl px-4 py-3 text-[14.5px] no-underline transition-all duration-150
                                            ${active
                                                ? "bg-[rgba(212,168,67,0.12)] text-[#D4A843] font-semibold"
                                                : "text-gray-600 font-normal hover:bg-gray-100 hover:text-gray-900"
                                            }`}
                                    >
                                        {item.icon}
                                        {item.label}
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>

                    <div className="mt-6 px-0.5">
                        <button className="w-full bg-[#D4A843] hover:bg-[#c49830] text-black font-bold text-[14.5px] rounded-2xl py-3.5 cursor-pointer border-none transition-colors duration-150">
                            Send
                        </button>
                    </div>
                </nav>

                <div className="px-3.5 pb-5 pt-3">
                    <div className="flex items-center gap-3 bg-black/5 rounded-2xl px-3.5 py-3 mb-1.5 min-w-0">
                        <div className="w-[34px] h-[34px] rounded-full bg-[#D4A843] flex items-center justify-center shrink-0">
                            <span className="text-black font-bold text-[13px]">{userInitials}</span>
                        </div>
                        <div className="min-w-0">
                            <p className="text-gray-900 text-[13.5px] font-semibold m-0 truncate">{userName}</p>
                            <p className="text-gray-400 text-[11px] m-0 truncate">{userEmail}</p>
                        </div>
                    </div>

                    <ul className="list-none m-0 p-0 flex flex-col gap-0.5">
                        {bottomItems.map((item) => (
                            <li key={item.href}>
                                <Link
                                    href={item.href}
                                    onClick={onClose}
                                    className="flex items-center gap-3 text-gray-500 rounded-[10px] px-3.5 py-2.5 text-[13.5px] no-underline transition-all duration-150 hover:bg-gray-100 hover:text-gray-800"
                                >
                                    {item.icon}
                                    {item.label}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>
            </aside>
        </>
    );
}
