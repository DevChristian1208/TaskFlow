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
            priority
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

      {/* Content */}
      <main className="px-4 pb-16 pt-28">
        <div className="mx-auto w-full max-w-3xl rounded-2xl bg-white shadow-sm p-6 sm:p-8">
          <header className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              Datenschutzerklärung
            </h1>
            <p className="mt-1 text-sm text-gray-600">Stand: Oktober 2025</p>
          </header>

          <section className="space-y-6 text-gray-800 leading-relaxed">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                1. Verantwortlicher
              </h2>
              <p className="mt-2">
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
            </div>

            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                2. Verarbeitung personenbezogener Daten
              </h2>
              <p className="mt-2">
                Bei der Nutzung von Taskflow werden personenbezogene Daten
                verarbeitet, die für Registrierung, Authentifizierung und
                Nutzung der Task-Management-Funktionen erforderlich sind.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                3. Firebase
              </h2>
              <p className="mt-2">
                Taskflow nutzt Firebase-Dienste der Google Ireland Limited
                (Firebase Authentication und Realtime Database). Dabei werden u.
                a. E-Mail-Adresse, Benutzer-ID sowie technisch notwendige
                Metadaten verarbeitet.
              </p>
              <p className="mt-2">
                Weitere Informationen findest du unter:
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
            </div>

            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                4. Speicherung &amp; Kontolöschung
              </h2>
              <p className="mt-2">
                Benutzerkonten können nicht selbstständig gelöscht werden. Zur
                Löschung eines Kontos ist eine formlose Anfrage per E-Mail an
                den Verantwortlichen erforderlich.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                5. Rechte der betroffenen Personen
              </h2>
              <p className="mt-2">
                Du hast jederzeit das Recht auf Auskunft, Berichtigung,
                Löschung, Einschränkung der Verarbeitung sowie Beschwerde bei
                einer zuständigen Aufsichtsbehörde gemäß Art. 15 ff. DSGVO.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                6. Änderungen
              </h2>
              <p className="mt-2">
                Diese Datenschutzerklärung kann angepasst werden, wenn sich
                rechtliche oder technische Rahmenbedingungen ändern. Es gilt die
                jeweils aktuelle Version.
              </p>
            </div>
          </section>

          <div className="mt-10 flex flex-wrap gap-3">
            <Link
              href="/Login"
              className="rounded-xl bg-gray-900 px-4 py-2 hover:bg-gray-800"
            >
              Zur Startseite
            </Link>
            <Link
              href="/ImpressumundDatenschutz/LegalNotice"
              className="rounded-xl border border-gray-300 px-4 py-2 hover:bg-gray-50 text-black"
            >
              Zum Impressum
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
