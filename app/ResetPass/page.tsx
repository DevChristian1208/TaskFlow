"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";
import { auth } from "@/lib/firebase";
import { sendPasswordResetEmail } from "firebase/auth";
import { FirebaseError } from "firebase/app";

const inputClass =
  "input-autofill-fix mt-1 w-full h-11 roomy:h-14 rounded-2xl border border-border bg-card px-4 text-foreground placeholder:text-muted-foreground shadow-apple-sm focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/20 transition-all duration-200 ease-apple";

export default function ResetPassword() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    auth.languageCode = "de";
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);

    if (!email.trim()) return;
    setLoading(true);

    try {
      await sendPasswordResetEmail(auth, email.trim());
      setSent(true);
    } catch (e) {
      const fe = e as FirebaseError;
      setErr("E-Mail konnte nicht gesendet werden.");
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
        <div className="w-full max-w-md max-h-full overflow-hidden bg-white/70 dark:bg-white/5 backdrop-blur-xl border border-white/40 dark:border-white/10 shadow-xl rounded-3xl p-6 roomy:p-10 relative">
        <Link href="/Login" className="absolute left-5 top-5 roomy:left-8 roomy:top-8">
          <Image
            src="/13. Go back.png"
            alt="back"
            width={28}
            height={28}
            className="h-6 w-6 roomy:h-7 roomy:w-7 dark:invert"
          />
        </Link>

        <h1 className="text-xl roomy:text-3xl font-semibold tracking-tight text-gray-900 dark:text-white text-center mb-1.5 roomy:mb-2">
          Passwort zurücksetzen
        </h1>

        <p className="text-sm text-gray-500 dark:text-gray-400 text-center mb-4 roomy:mb-8">
          Gib deine E-Mail-Adresse ein, um dein Passwort zurückzusetzen.
        </p>

        {sent ? (
          <>
            <p className="bg-green-500/10 border border-green-500/20 rounded-2xl py-3 roomy:py-4 px-4 text-sm text-green-600 dark:text-green-400 text-center mb-4 roomy:mb-6">
              Falls ein Konto existiert, wurde eine E-Mail gesendet.
            </p>

            <button
              onClick={() => router.push("/Login")}
              className="w-full h-11 roomy:h-14 rounded-full bg-black dark:bg-white text-white dark:text-black text-base roomy:text-lg hover:bg-[#1d1d1f] dark:hover:bg-gray-200 shadow-apple-md transition-all duration-200 ease-apple"
            >
              Zur Anmeldung
            </button>
          </>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3 roomy:space-y-6">
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

            {err && (
              <p className="text-red-600 text-sm text-center">{err}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 roomy:h-14 rounded-full bg-black dark:bg-white text-white dark:text-black text-base roomy:text-lg hover:bg-[#1d1d1f] dark:hover:bg-gray-200 shadow-apple-md transition-all duration-200 ease-apple disabled:opacity-60"
            >
              {loading ? "Sende..." : "E-Mail senden"}
            </button>
          </form>
        )}

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
