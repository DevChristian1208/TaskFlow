"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { login, guestLogin } from "@/lib/auth";
import Image from "next/image";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";

const inputClass =
  "input-autofill-fix mt-1 w-full h-11 roomy:h-14 rounded-2xl border border-border bg-card px-4 text-foreground placeholder:text-muted-foreground shadow-apple-sm focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/20 transition-all duration-200 ease-apple";

const inputClassNoMargin =
  "input-autofill-fix w-full h-11 roomy:h-14 rounded-2xl border border-border bg-card px-4 text-foreground placeholder:text-muted-foreground shadow-apple-sm focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/20 transition-all duration-200 ease-apple";

export default function LoginPage() {
  const router = useRouter();
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
    setLoading(true);
    setErrorMsg("");

    try {
      await guestLogin();
      router.replace("/Dashboard");
    } catch (err) {
      const code = (err as { code?: string })?.code || String(err);
      setErrorMsg(`Gast-Login ist fehlgeschlagen (${code}).`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="h-dvh overflow-hidden bg-[#E8E9FF] dark:bg-black flex flex-col transition-colors duration-300">
      <header className="w-full shrink-0 px-5 py-3 roomy:px-10 roomy:py-8">
        <Image
          src="/taskflow-logo.png"
          alt="TaskFlow"
          width={856}
          height={241}
          priority
          className="h-8 roomy:h-9 w-auto"
        />
      </header>

      <div className="flex-1 min-h-0 flex items-center justify-center px-5 pb-4 roomy:px-6 roomy:pb-12">
        <div className="w-full max-w-md max-h-full overflow-hidden bg-white/70 dark:bg-white/5 backdrop-blur-xl border border-white/40 dark:border-white/10 shadow-xl rounded-3xl p-6 roomy:p-10 transition-all">
        <h1 className="text-xl roomy:text-3xl font-semibold tracking-tight text-gray-900 dark:text-white text-center mb-1.5 roomy:mb-2">
          Willkommen zurück
        </h1>

        <p className="text-sm text-gray-500 dark:text-gray-400 text-center mb-4 roomy:mb-8">
          Melde dich in deinem Konto an
        </p>

        <form onSubmit={handleLogin} className="space-y-3 roomy:space-y-6">
          <div>
            <label className="text-gray-700 dark:text-gray-300 text-sm font-medium">
              E-Mail
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputClass}
              placeholder="name@example.com"
            />
          </div>

          <div>
            <div className="flex justify-between items-center">
              <label className="text-gray-700 dark:text-gray-300 text-sm font-medium">
                Passwort
              </label>
              <Link
                href="/ResetPass"
                className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
              >
                Passwort vergessen?
              </Link>
            </div>

            <div className="relative mt-1">
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={inputClassNoMargin}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors duration-200 ease-apple"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {errorMsg && <p className="text-red-600 text-sm text-center">{errorMsg}</p>}

          <div className="flex flex-col gap-2.5 roomy:gap-3">
            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 roomy:h-14 rounded-full bg-black dark:bg-white text-white dark:text-black font-medium hover:bg-[#1d1d1f] dark:hover:bg-gray-200 shadow-apple-md transition-all duration-200 ease-apple disabled:opacity-60 text-base roomy:text-lg cursor-pointer"
            >
              {loading ? "Lade..." : "Login"}
            </button>

            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-gray-200 dark:bg-white/10" />
              <span className="text-sm text-gray-400 dark:text-gray-500">
                oder
              </span>
              <div className="flex-1 h-px bg-gray-200 dark:bg-white/10" />
            </div>

            <button
              type="button"
              onClick={handleGuestLogin}
              disabled={loading}
              className="w-full h-11 roomy:h-14 rounded-full border border-gray-300 dark:border-white/10 bg-white dark:bg-white/5 text-gray-900 dark:text-white font-medium hover:bg-gray-50 dark:hover:bg-white/10 transition-colors duration-200 ease-apple text-base roomy:text-lg cursor-pointer"
            >
              Als Gast fortfahren
            </button>
          </div>

          <p className="text-gray-600 dark:text-gray-400 text-center text-sm">
            Noch kein Konto?{" "}
            <Link
              href="/Register"
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              Registrieren
            </Link>
          </p>
        </form>

        <div className="mt-4 roomy:mt-8 flex justify-center gap-6 text-sm text-gray-500 dark:text-gray-400">
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
    </div>
  );
}
