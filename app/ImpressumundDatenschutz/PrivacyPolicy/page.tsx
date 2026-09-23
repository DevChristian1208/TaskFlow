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
            <p className="mt-1 text-sm text-gray-600">Stand: September 2026</p>
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
                verarbeitet, die für Authentifizierung und Nutzung der
                Task-Management-Funktionen erforderlich sind. Der Umfang
                unterscheidet sich dabei je nachdem, ob du Taskflow als
                registrierter Nutzer oder im Gast-Modus verwendest.
              </p>

              <h3 className="mt-4 font-semibold text-gray-900">
                Registrierte Nutzer
              </h3>
              <p className="mt-2">
                Bei der Registrierung werden E-Mail-Adresse, ein von dir
                gewählter Name sowie ein Passwort (verschlüsselt über Firebase
                Authentication) gespeichert. Optional kannst du ein Profilbild
                hinterlegen, das über Firebase Storage gespeichert wird. Deine
                erstellten Tasks, Boards, Kontakte und Kategorien werden
                dauerhaft mit deinem Konto verknüpft in der Firebase Realtime
                Database gespeichert, bis du sie löschst oder dein Konto
                entfernst.
              </p>

              <h3 className="mt-4 font-semibold text-gray-900">Gast-Modus</h3>
              <p className="mt-2">
                Im Gast-Modus wird über Firebase Authentication ein anonymes,
                temporäres Konto ohne E-Mail-Adresse oder Passwort erstellt.
                Es werden keine Namens- oder Kontaktdaten von dir abgefragt.
                Tasks, Boards, Kontakte und Kategorien, die du als Gast
                anlegst, werden unter dieser anonymen Kennung ebenfalls in der
                Firebase Realtime Database gespeichert – getrennt von den
                Daten registrierter Nutzer – und bleiben so lange bestehen,
                bis du sie löschst, dein Gast-Konto entfernst oder die
                Browser-Daten (siehe Abschnitt 4) gelöscht werden. Eine
                dauerhafte Zuordnung zu deiner Person findet nicht statt.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                3. Firebase
              </h2>
              <p className="mt-2">
                Taskflow nutzt Firebase-Dienste der Google Ireland Limited
                (Firebase Authentication, Realtime Database und Storage).
                Dabei werden u. a. E-Mail-Adresse (nur registrierte Nutzer),
                Benutzer-ID sowie technisch notwendige Metadaten verarbeitet.
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
                4. Lokale Speicherung im Browser
              </h2>
              <p className="mt-2">
                Taskflow speichert einige Einstellungen ausschließlich lokal
                in deinem Browser (Local- bzw. Session-Storage), z. B. das
                gewählte Farbschema, die zuletzt aktive Board-Auswahl sowie
                einen Hinweis, ob du an einem Tag bereits über fällige Tasks
                benachrichtigt wurdest. Diese Daten verlassen deinen Browser
                nicht und werden nicht an den Verantwortlichen übertragen.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                5. Speicherung &amp; Kontolöschung
              </h2>
              <p className="mt-2">
                Sowohl registrierte Nutzer als auch Gäste können ihr Konto
                selbstständig unter Einstellungen → Account → „Konto löschen“
                entfernen. Dabei werden dein Nutzerkonto sowie sämtliche damit
                verknüpften Daten (Tasks, Boards, Kontakte, Kategorien,
                ggf. Profilbild) unwiderruflich aus der Firebase Realtime
                Database bzw. Firebase Storage gelöscht. Bei registrierten
                Nutzern ist dafür aus Sicherheitsgründen eine erneute
                Passwort-Eingabe erforderlich. Alternativ kannst du die
                Löschung auch formlos per E-Mail an den Verantwortlichen
                beantragen.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                6. Rechte der betroffenen Personen
              </h2>
              <p className="mt-2">
                Du hast jederzeit das Recht auf Auskunft, Berichtigung,
                Löschung, Einschränkung der Verarbeitung sowie Beschwerde bei
                einer zuständigen Aufsichtsbehörde gemäß Art. 15 ff. DSGVO.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                7. Änderungen
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
