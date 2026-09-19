"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { register } from "@/lib/auth";
import { useAuth } from "@/lib/Context/AuthContext";
import Image from "next/image";
import Link from "next/link";
import { Eye, EyeOff, CheckCircle2 } from "lucide-react";

const inputClass =
  "input-autofill-fix mt-2 w-full h-14 rounded-2xl border border-border bg-card px-4 text-foreground placeholder:text-muted-foreground shadow-apple-sm focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/20 transition-all duration-200 ease-apple";

const inputClassNoMargin =
  "input-autofill-fix w-full h-14 rounded-2xl border border-border bg-card px-4 text-foreground placeholder:text-muted-foreground shadow-apple-sm focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/20 transition-all duration-200 ease-apple";

export default function RegisterPage() {
  const router = useRouter();
  const { refreshUser } = useAuth();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);

    try {
      await register(email, password, name);
      refreshUser();
      setSuccess(true);
    } catch (err: any) {
      setErrorMsg("Registrierung fehlgeschlagen.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#E8E9FF] dark:bg-black flex flex-col items-center justify-center gap-6 px-6 py-12 transition-colors duration-300">
      <Image
        src="/Taskflow.png"
        alt="logo"
        width={200}
        height={200}
        priority
        className="h-20 w-20 sm:h-28 sm:w-28 shrink-0"
      />

      <div className="w-full max-w-md bg-white/70 dark:bg-white/5 backdrop-blur-xl border border-white/40 dark:border-white/10 shadow-xl rounded-3xl p-10">
        <h1 className="text-3xl font-semibold tracking-tight text-gray-900 dark:text-white text-center mb-2">
          Konto erstellen
        </h1>

        {success ? (
          <>
            <p className="text-gray-500 dark:text-gray-400 text-center mb-8">
              Willkommen! Bitte gib deine Daten ein.
            </p>

            <div className="flex flex-col items-center gap-3 bg-green-500/10 border border-green-500/20 rounded-2xl py-6 px-4 text-green-600 dark:text-green-400 text-center mb-6">
              <CheckCircle2 size={32} />
              <p className="font-medium">
                Konto erfolgreich erstellt, {name}!
              </p>
            </div>

            <button
              onClick={() => router.push("/Dashboard")}
              className="w-full h-14 rounded-full bg-black dark:bg-white text-white dark:text-black font-medium hover:bg-[#1d1d1f] dark:hover:bg-gray-200 shadow-apple-md transition-all duration-200 ease-apple text-lg cursor-pointer"
            >
              Los geht&apos;s
            </button>
          </>
        ) : (
          <>
            <p className="text-gray-500 dark:text-gray-400 text-center mb-8">
              Willkommen! Bitte gib deine Daten ein.
            </p>

            <form onSubmit={onSubmit} className="space-y-6">
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
                <label className="text-gray-700 dark:text-gray-300 text-sm font-medium">
                  Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={inputClass}
                  placeholder="Max Mustermann"
                />
              </div>
              <div>
                <label className="text-gray-700 dark:text-gray-300 text-sm font-medium">
                  Passwort
                </label>

                <div className="relative mt-2">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={inputClassNoMargin}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors duration-200 ease-apple"
                  >
                    {showPassword ? <EyeOff /> : <Eye />}
                  </button>
                </div>
              </div>

              {errorMsg && (
                <p className="text-red-600 text-center">{errorMsg}</p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full h-14 rounded-full bg-black dark:bg-white text-white dark:text-black font-medium hover:bg-[#1d1d1f] dark:hover:bg-gray-200 shadow-apple-md transition-all duration-200 ease-apple text-lg cursor-pointer disabled:opacity-60"
              >
                {loading ? "Registriere…" : "Registrieren"}
              </button>

              <p className="text-gray-600 dark:text-gray-400 text-center text-sm">
                Du hast bereits ein Konto?{" "}
                <Link
                  href="/Login"
                  className="text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Login
                </Link>
              </p>
            </form>
            <div className="mt-8 flex justify-center gap-6 text-sm text-gray-500 dark:text-gray-400">
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
          </>
        )}
      </div>
    </div>
  );
}
