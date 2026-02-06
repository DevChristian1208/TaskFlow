"use client";

import Image from "next/image";
import Link from "next/link";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-[#E8E9FF] relative overflow-x-hidden">
      <div className="px-4 pt-6">
        <div className="absolute -top-10 left-6 flex items-center">
          <Image
            src="/Taskflow.png"
            alt="Taskflow Logo"
            width={200}
            height={200}
          />
        </div>

        <div className="absolute top-6 right-6 text-sm text-gray-700 flex flex-col items-end">
          <span className="hidden sm:block">Noch kein Konto?</span>
          <Link
            href="/Register"
            className="text-blue-600 font-medium hover:underline"
          >
            Registrieren
          </Link>
        </div>
      </div>

      <main className="px-4 pb-16 pt-24">
        <div className="mx-auto w-full max-w-3xl bg-white/80 backdrop-blur-sm rounded-2xl p-6 sm:p-8 shadow-sm">
          <header className="mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Datenschutzerklärung
            </h1>
            <p className="mt-1 text-sm text-gray-600">Stand: Oktober 2025</p>
          </header>

          <section className="prose prose-gray max-w-none">
            <h2>1. Verantwortlicher</h2>
            <p>
              Christian Seidel
              <br />
              Am Hang 4, 95152 Selbitz, Deutschland
              <br />
              E-Mail:{" "}
              <a
                href="mailto:christian.pressig@web.de"
                className="text-blue-600 hover:underline"
              >
                christian.pressig@web.de
              </a>
            </p>

            <h2>2. Verarbeitung personenbezogener Daten</h2>
            <p>
              Bei der Nutzung von Taskflow werden personenbezogene Daten
              verarbeitet, die für Registrierung, Authentifizierung und Nutzung
              der Task-Management-Funktionen erforderlich sind.
            </p>

            <h2>3. Firebase</h2>
            <p>
              Taskflow verwendet Firebase-Dienste der Google Ireland Limited
              (Firebase Authentication und Realtime Database). Dabei werden u.
              a. E-Mail-Adresse, Benutzer-ID sowie technisch notwendige
              Metadaten verarbeitet.
            </p>

            <p>
              Weitere Informationen:
              <br />
              <a
                href="https://firebase.google.com/support/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                https://firebase.google.com/support/privacy
              </a>
            </p>

            <h2>4. Speicherung & Kontolöschung</h2>
            <p>
              Benutzerkonten können nicht selbstständig gelöscht werden. Zur
              Löschung eines Kontos ist eine formlose Anfrage per E-Mail an den
              Verantwortlichen erforderlich.
            </p>

            <h2>5. Rechte der betroffenen Personen</h2>
            <p>
              Du hast jederzeit das Recht auf Auskunft, Berichtigung, Löschung,
              Einschränkung der Verarbeitung sowie Beschwerde bei einer
              zuständigen Aufsichtsbehörde gemäß Art. 15 ff. DSGVO.
            </p>

            <h2>6. Änderungen</h2>
            <p>
              Diese Datenschutzerklärung kann angepasst werden, wenn sich
              rechtliche oder technische Rahmenbedingungen ändern. Es gilt die
              jeweils aktuelle Version.
            </p>
          </section>

          <div className="mt-10 flex flex-wrap gap-3">
            <Link
              href="/Login"
              className="px-4 py-2 rounded-xl bg-gray-900 text-white hover:bg-gray-800"
            >
              Zur Startseite
            </Link>
            <Link
              href="/ImpressumundDatenschutz/LegalNotice"
              className="px-4 py-2 rounded-xl bg-white border border-gray-300 hover:bg-gray-50"
            >
              Zum Impressum
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
