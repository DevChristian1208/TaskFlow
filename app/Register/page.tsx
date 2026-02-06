"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { register } from "@/lib/auth";
import Image from "next/image";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg("");

    try {
      await register(email, password, name);
      router.push("/Login");
    } catch (err: any) {
      setErrorMsg("Registrierung fehlgeschlagen.");
    }
  }

  return (
    <div className="min-h-screen bg-[#F5F5F7] flex items-center justify-center px-6 relative">
      <div className="absolute -top-10 left-6 flex items-center">
        <Image src="/Taskflow.png" alt="logo" width={200} height={200} />
      </div>

      <div className="w-full max-w-md bg-white/70 backdrop-blur-xl border border-white/40 shadow-xl rounded-3xl p-10">
        <h1 className="text-3xl font-semibold text-gray-900 text-center mb-2">
          Konto erstellen
        </h1>

        <p className="text-gray-500 text-center mb-8">
          Willkommen! Bitte gib deine Daten ein.
        </p>

        <form onSubmit={onSubmit} className="space-y-6">
          <div>
            <label className="text-gray-700 text-sm font-medium">E-Mail</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-2 w-full h-14 rounded-2xl border border-gray-300 bg-[#FAFAFB] px-4 focus:ring-2 focus:ring-black focus:bg-white transition text-gray-900"
              placeholder="name@example.com"
            />
          </div>

          <div>
            <label className="text-gray-700 text-sm font-medium">Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-2 w-full h-14 rounded-2xl border border-gray-300 bg-[#FAFAFB] px-4 focus:ring-2 focus:ring-black focus:bg-white transition text-gray-900"
              placeholder="Max Mustermann"
            />
          </div>
          <div>
            <label className="text-gray-700 text-sm font-medium">
              Passwort
            </label>

            <div className="relative mt-2">
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-14 rounded-2xl border border-gray-300 bg-[#FAFAFB] px-4 pr-12 focus:ring-2 focus:ring-black focus:bg-white transition text-gray-900"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? <EyeOff /> : <Eye />}
              </button>
            </div>
          </div>

          {errorMsg && <p className="text-red-600 text-center">{errorMsg}</p>}

          <button
            type="submit"
            className="w-full h-14 rounded-2xl bg-black text-white font-medium hover:bg-[#1d1d1f] transition text-lg cursor-pointer"
          >
            Registrieren
          </button>

          <p className="text-gray-600 text-center text-sm">
            Du hast bereits ein Konto?{" "}
            <Link href="/Login" className="text-blue-600 hover:underline">
              Login
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
