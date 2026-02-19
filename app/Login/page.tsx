"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { login } from "@/lib/auth";
import { useAuth } from "@/lib/Context/AuthContext";
import Image from "next/image";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { setGuestUser } = useAuth(); 

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    try {
      await login(email, password);
      router.replace("/Dashboard");
    } catch (err) {
      setErrorMsg("E-Mail oder Passwort ist falsch.");
    } finally {
      setLoading(false);
    }
  }

  async function handleGuestLogin() {
    const guestId = "guest_" + crypto.randomUUID();
    localStorage.setItem("guestId", guestId);
    setGuestUser(guestId); 
    router.replace("/Dashboard");
  }

  return (
    <div className="min-h-screen bg-[#E8E9FF] flex items-center justify-center px-6 relative">
      <div className="absolute -top-10 left-6 flex items-center">
        <Image src="/Taskflow.png" alt="logo" width={200} height={200} />
      </div>

      <div className="w-full max-w-md bg-white/70 backdrop-blur-xl border border-white/40 shadow-xl rounded-3xl p-10 transition-all">
        <h1 className="text-3xl font-semibold text-gray-900 text-center mb-2">
          Willkommen zurück
        </h1>

        <p className="text-gray-500 text-center mb-8">
          Melde dich in deinem Konto an
        </p>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="text-gray-700 text-sm font-medium">E-Mail</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-2 w-full h-14 rounded-2xl border border-gray-300 bg-[#FAFAFB] px-4 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#6f6fff] focus:ring-4 focus:ring-[#6f6fff]/20 focus:bg-white transition-all duration-200"
              placeholder="name@example.com"
            />
          </div>

          <div>
            <div className="flex justify-between items-center">
              <label className="text-gray-700 text-sm font-medium">
                Passwort
              </label>
              <Link
                href="/ResetPass"
                className="text-blue-600 hover:underline text-sm"
              >
                Passwort vergessen?
              </Link>
            </div>

            <div className="relative mt-2">
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-2 w-full h-14 rounded-2xl border border-gray-300 bg-[#FAFAFB] px-4 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#6f6fff] focus:ring-4 focus:ring-[#6f6fff]/20 focus:bg-white transition-all duration-200"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 mt-1"
              >
                {showPassword ? <EyeOff /> : <Eye />}
              </button>
            </div>
          </div>

          {errorMsg && <p className="text-red-600 text-center">{errorMsg}</p>}

          <div className="flex flex-col gap-3">
            <button
              type="submit"
              disabled={loading}
              className="w-full h-14 rounded-2xl bg-black text-white font-medium hover:bg-[#1d1d1f] transition disabled:opacity-60 text-lg cursor-pointer"
            >
              {loading ? "Lade..." : "Login"}
            </button>

            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-gray-200" />
              <span className="text-sm text-gray-400">oder</span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>

            <button
              type="button"
              onClick={handleGuestLogin}
              disabled={loading}
              className="w-full h-14 rounded-2xl border border-gray-300 bg-white text-gray-900 font-medium hover:bg-gray-50 transition text-lg"
            >
              Als Gast fortfahren
            </button>
          </div>

          <p className="text-gray-600 text-center text-sm">
            Noch kein Konto?{" "}
            <Link href="/Register" className="text-blue-600 hover:underline">
              Registrieren
            </Link>
          </p>
        </form>

        <div className="mt-8 flex justify-center gap-6 text-sm text-gray-500">
          <Link
            href="/ImpressumundDatenschutz/LegalNotice"
            className="hover:underline"
          >
            Impressum
          </Link>
          <Link
            href="/ImpressumundDatenschutz/PrivacyPolicy"
            className="hover:underline"
          >
            Datenschutz
          </Link>
        </div>
      </div>
    </div>
  );
}
