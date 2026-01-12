"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        router.replace("/");
        router.refresh();
      }
    });

    return () => subscription.unsubscribe();
  }, [router]);


 async function handleLogin(type: "login" | "signup") {
  setLoading(true);
  setError(null);

  if (type === "login") {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

   if (error) {
        setError(error.message);
      } else {
        router.replace("/");
        router.refresh(); 
      }
    } else {
      const { error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        setError(error.message);
      } else {
        setError("Check your email to confirm your account");
      }
    }

    setLoading(false);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-100">
      <div className="w-full max-w-sm rounded-lg bg-white p-6 shadow">
        <h1 className="text-xl font-semibold text-center mb-4 text-black">
          Cloud Drive Login
        </h1>

        <input
          type="email"
          placeholder="Email"
          className="w-full mb-3 rounded border px-3 py-2 text-black"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full mb-3 rounded border px-3 py-2 text-black"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {error && (
          <p className="mb-3 text-sm text-red-600">{error}</p>
        )}

        <button
          onClick={() => handleLogin("login")}
          disabled={loading}
          className="mb-2 w-full rounded bg-black py-2 text-white"
        >
          Login
        </button>

        <button
          onClick={() => handleLogin("signup")}
          disabled={loading}
          className="w-full rounded border py-2 bg-black py-2 text-white"
        >
          Sign Up
        </button>
      </div>
    </div>
  );
}
