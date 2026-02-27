"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/app/lib/supabase/client";

export default function LoginPage() {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [message, setMessage] = useState<string | null>(null);

    const router = useRouter();
    const supabase = createClient();

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setMessage(null);

        try {
            if (isLogin) {
                const { error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });
                if (error) throw error;
                router.push("/");
                router.refresh();
            } else {
                const { error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        emailRedirectTo: `${window.location.origin}/auth/callback`,
                    },
                });
                if (error) throw error;
                setMessage("Check your email for the confirmation link!");
            }
        } catch (err: any) {
            setError(err.message || "An error occurred");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-[#f5f5f7] p-4 font-sans text-zinc-900">
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-gold/5 blur-[120px]" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-gold/5 blur-[120px]" />
            </div>

            <div className="relative w-full max-w-5xl overflow-hidden rounded-3xl bg-white shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] flex flex-col md:flex-row min-h-[600px]">

                <div className="hidden md:flex md:w-1/2 bg-zinc-950 p-12 flex-col justify-between relative overflow-hidden">
                    <div className="absolute inset-0 opacity-20 pointer-events-none">
                        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_2px_2px,#D4A843_1px,transparent_0)] bg-[length:40px_40px]" />
                    </div>

                    <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-12">
                            <div className="w-10 h-10 rounded-xl bg-gold flex items-center justify-center text-zinc-950 font-bold text-xl">H</div>
                            <span className="text-2xl font-bold tracking-tight text-white">HashPay</span>
                        </div>

                        <h2 className="text-4xl font-semibold text-white leading-tight mb-6">
                            The borderless way to <span className="text-gold italic">hash</span> your payments.
                        </h2>
                        <p className="text-zinc-400 text-lg max-w-sm">
                            Join thousands of users sending money globally with lightning fast speed and bank-grade security.
                        </p>
                    </div>

                    <div className="relative z-10 flex items-center gap-4 text-zinc-500 text-sm">
                        <div className="flex -space-x-2">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="w-8 h-8 rounded-full border-2 border-zinc-950 bg-zinc-800 flex items-center justify-center overflow-hidden">
                                    <div className="w-full h-full bg-zinc-700" />
                                </div>
                            ))}
                        </div>
                        <span>Trusted by 10k+ users</span>
                    </div>
                </div>

                <div className="w-full md:w-1/2 p-8 md:p-16 flex flex-col justify-center">
                    <div className="md:hidden flex items-center justify-center gap-2 mb-8">
                        <div className="w-8 h-8 rounded-lg bg-gold flex items-center justify-center text-zinc-950 font-bold text-lg">H</div>
                        <span className="text-xl font-bold tracking-tight">HashPay</span>
                    </div>

                    <div className="mb-10 text-center md:text-left">
                        <h1 className="text-3xl font-bold mb-2 tracking-tight">
                            {isLogin ? "Welcome back" : "Create an account"}
                        </h1>
                        <p className="text-zinc-500">
                            {isLogin ? "Enter your details to access your account" : "Get started with your free account today"}
                        </p>
                    </div>

                    <div className="flex p-1 bg-zinc-100 rounded-xl mb-8 relative">
                        <div
                            className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-white rounded-lg shadow-sm transition-all duration-300 ease-out ${isLogin ? 'left-1' : 'left-[calc(50%+2px)]'}`}
                        />
                        <button
                            onClick={() => setIsLogin(true)}
                            className={`relative z-10 w-1/2 py-2 text-sm font-medium transition-colors duration-200 ${isLogin ? 'text-zinc-950' : 'text-zinc-500 hover:text-zinc-800'}`}
                        >
                            Login
                        </button>
                        <button
                            onClick={() => setIsLogin(false)}
                            className={`relative z-10 w-1/2 py-2 text-sm font-medium transition-colors duration-200 ${!isLogin ? 'text-zinc-950' : 'text-zinc-500 hover:text-zinc-800'}`}
                        >
                            Sign Up
                        </button>
                    </div>

                    <form onSubmit={handleAuth} className="space-y-5">
                        {error && (
                            <div className="p-3 rounded-lg bg-red-50 border border-red-100 text-red-600 text-sm animate-fade-in">
                                {error}
                            </div>
                        )}
                        {message && (
                            <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-100 text-emerald-600 text-sm animate-fade-in">
                                {message}
                            </div>
                        )}

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-zinc-700 block" htmlFor="email">
                                Email Address
                            </label>
                            <input
                                id="email"
                                type="email"
                                placeholder="name@company.com"
                                required
                                className="w-full px-4 py-3 rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-gold/20 focus:border-gold transition-all bg-white"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <label className="text-sm font-medium text-zinc-700 block" htmlFor="password">
                                    Password
                                </label>
                                {isLogin && (
                                    <button type="button" className="text-xs font-medium text-gold hover:text-gold-hover">
                                        Forgot password?
                                    </button>
                                )}
                            </div>
                            <input
                                id="password"
                                type="password"
                                placeholder="••••••••"
                                required
                                className="w-full px-4 py-3 rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-gold/20 focus:border-gold transition-all bg-white"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-zinc-950 text-white py-3.5 rounded-xl font-semibold hover:bg-zinc-800 active:scale-[0.98] transition-all disabled:opacity-70 disabled:active:scale-100 flex items-center justify-center gap-2 group"
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    {isLogin ? "Sign In" : "Get Started"}
                                    <svg className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                    </svg>
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-10 pt-8 border-t border-zinc-100 text-center">
                        <p className="text-sm text-zinc-500">
                            By continuing, you agree to our{" "}
                            <button className="text-zinc-950 font-medium hover:underline">Terms of Service</button>
                            {" "}and{" "}
                            <button className="text-zinc-950 font-medium hover:underline">Privacy Policy</button>
                            .
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
