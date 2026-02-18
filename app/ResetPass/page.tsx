"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";
import { auth } from "@/lib/firebase";
import { sendPasswordResetEmail } from "firebase/auth";
import { FirebaseError } from "firebase/app";

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
    <div className="min-h-screen bg-[#E8E9FF] flex items-center justify-center px-6 relative">
      <div className="absolute -top-10 left-6 flex items-center">
        <Image src="/Taskflow.png" alt="logo" width={200} height={200} />
      </div>

      <div className="w-full max-w-md bg-white/70 backdrop-blur-xl border border-white/40 shadow-xl rounded-3xl p-10 relative">
        <Link href="/Login" className="absolute left-8 top-10">
          <Image src="/13. Go back.png" alt="back" width={28} height={28} />
        </Link>

        <h1 className="text-3xl font-semibold text-gray-900 text-center mb-2">
          Passwort zurücksetzen
        </h1>

        <p className="text-gray-500 text-center mb-8">
          Gib deine E-Mail-Adresse ein, um dein Passwort zurückzusetzen.
        </p>

        {sent ? (
          <>
            <p className="bg-green-100 border border-green-200 rounded-2xl py-4 px-4 text-green-700 text-center mb-6">
              Falls ein Konto existiert, wurde eine E-Mail gesendet.
            </p>

            <button
              onClick={() => router.push("/Login")}
              className="w-full h-14 rounded-2xl bg-black text-white text-lg hover:bg-[#1d1d1f] transition"
            >
              Zur Anmeldung
            </button>
          </>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="text-gray-700 text-sm font-medium">
                E-Mail
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-2 w-full h-14 rounded-2xl border border-gray-300 bg-[#FAFAFB] px-4 focus:ring-2 focus:ring-black focus:bg-white transition text-gray-900"
                placeholder="name@example.com"
              />
            </div>

            {err && <p className="text-red-600 text-center">{err}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full h-14 rounded-2xl bg-black text-white text-lg hover:bg-[#1d1d1f] transition disabled:opacity-60"
            >
              {loading ? "Sende..." : "E-Mail senden"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
