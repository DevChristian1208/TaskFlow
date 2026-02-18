"use client";

import Image from "next/image";
import Link from "next/link";

export default function LegalNotice() {
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

      <main className="px-4 pb-16 pt-28">
        <div className="mx-auto w-full max-w-3xl rounded-2xl bg-white shadow-sm p-6 sm:p-8">
          <header className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Impressum</h1>
            <p className="mt-1 text-sm text-gray-600">Stand: Oktober 2025</p>
          </header>

          <section className="space-y-6 text-gray-800 leading-relaxed">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Angaben gemäß § 5 TMG
              </h2>
              <p className="mt-2">
                Christian Seidel
                <br />
                Am Hang 4
                <br />
                95152 Selbitz
                <br />
                Deutschland
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-gray-900">Kontakt</h2>
              <p className="mt-2">
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
                Verantwortlich für den Inhalt nach § 55 Abs. 2 RStV
              </h2>
              <p className="mt-2">
                Christian Seidel
                <br />
                Am Hang 4
                <br />
                95152 Selbitz
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Projektinformationen
              </h2>
              <p className="mt-2">
                <strong>Taskflow</strong> ist ein webbasiertes
                Task-Management-Tool mit Benutzerkonten und cloudbasierter
                Datenspeicherung über Firebase (Google Ireland Limited). Eine
                dauerhafte Verfügbarkeit oder Fehlerfreiheit wird nicht
                garantiert.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Haftung für Inhalte
              </h2>
              <p className="mt-2">
                Als Diensteanbieter bin ich gemäß § 7 Abs. 1 TMG für eigene
                Inhalte nach den allgemeinen Gesetzen verantwortlich. Nach §§
                8–10 TMG bin ich jedoch nicht verpflichtet, übermittelte oder
                gespeicherte fremde Informationen zu überwachen oder nach
                Umständen zu forschen, die auf eine rechtswidrige Tätigkeit
                hinweisen.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Haftung für Links
              </h2>
              <p className="mt-2">
                Diese Website enthält ggf. Links zu externen Websites Dritter,
                auf deren Inhalte ich keinen Einfluss habe. Für diese fremden
                Inhalte wird keine Gewähr übernommen. Verantwortlich ist stets
                der jeweilige Anbieter oder Betreiber der Seiten.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Urheberrecht
              </h2>
              <p className="mt-2">
                Die durch den Seitenbetreiber erstellten Inhalte und Werke
                unterliegen dem deutschen Urheberrecht.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Verbraucherstreitbeilegung
              </h2>
              <p className="mt-2">
                Ich bin nicht bereit und nicht verpflichtet, an
                Streitbeilegungsverfahren vor einer
                Verbraucherschlichtungsstelle teilzunehmen (§ 36 VSBG).
              </p>
            </div>
          </section>

          <div className="mt-10 flex flex-wrap gap-3">
            <Link
              href="/Login"
              className="rounded-xl bg-gray-900 px-4 py-2 text-white hover:bg-gray-800"
            >
              Zur Startseite
            </Link>
            <Link
              href="/ImpressumundDatenschutz/PrivacyPolicy"
              className="rounded-xl border border-gray-300 bg-white text-black px-4 py-2"
            >
              Zur Datenschutzerklärung
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
