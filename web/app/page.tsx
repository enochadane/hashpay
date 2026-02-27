"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/app/lib/supabase/client";
import { User } from "@supabase/supabase-js";

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    async function getUser() {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setLoading(false);
    }
    getUser();
  }, [supabase]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    router.refresh();
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f5f5f7] p-4 font-sans text-zinc-900">
      {/* Glow effect background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-gold/5 blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-gold/5 blur-[120px]" />
      </div>

      <main className="relative z-10 flex flex-col items-center text-center max-w-2xl px-6 py-20 bg-white rounded-3xl shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] w-full">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-xl bg-gold flex items-center justify-center text-zinc-950 font-bold text-2xl">H</div>
          <span className="text-3xl font-bold tracking-tight text-zinc-950">HashPay</span>
        </div>

        <h1 className="text-4xl sm:text-5xl font-bold text-zinc-950 leading-tight mb-6">
          The borderless way to <span className="text-gold italic">hash</span> your payments.
        </h1>

        <p className="text-lg text-zinc-500 mb-10 max-w-lg">
          Join thousands of users sending money globally with lightning fast speed and bank-grade security.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto min-h-[56px] items-center justify-center">
          {!loading && (
            <>
              {user ? (
                <button
                  onClick={handleLogout}
                  className="flex h-14 items-center justify-center gap-2 rounded-xl bg-zinc-950 px-8 text-base font-medium text-white transition-all hover:bg-zinc-800 active:scale-95 w-full sm:w-auto"
                >
                  Logout
                </button>
              ) : (
                <Link
                  href="/auth"
                  className="flex h-14 items-center justify-center gap-2 rounded-xl bg-zinc-950 px-8 text-base font-medium text-white transition-all hover:bg-zinc-800 active:scale-95 w-full sm:w-auto"
                >
                  Get Started
                </Link>
              )}
              <Link
                href="/receivers"
                className="flex h-14 items-center justify-center gap-2 rounded-xl bg-gold px-8 text-base font-medium text-zinc-950 transition-all hover:bg-[#c49830] active:scale-95 w-full sm:w-auto"
              >
                Dashboard
              </Link>
            </>
          )}
          {loading && (
            <div className="w-12 h-12 border-4 border-zinc-100 border-t-gold rounded-full animate-spin" />
          )}
        </div>
      </main>
    </div>
  );
}
