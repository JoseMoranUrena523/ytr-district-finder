"use client";

import Image from "next/image";
import { useState, FormEvent } from "react";
import type { LookupResponse } from "@/lib/types";

const statusMark: Record<string, string> = {
  found: "●",
  notFound: "○",
  unavailable: "—",
};

const statusColor: Record<string, string> = {
  found: "text-brick",
  notFound: "text-ink/40",
  unavailable: "text-ink/40",
};

const districtLevels = [
  "U.S. House of Representatives",
  "NY State Senate",
  "NY State Assembly",
  "Westchester County Legislature",
  "Yonkers City Council",
];

export default function Home() {
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<LookupResponse | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!address.trim()) {
      setFormError("Enter an address first.");
      return;
    }
    setFormError(null);
    setLoading(true);
    setResult(null);

    try {
      const res = await fetch("/api/lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address }),
      });
      const data: LookupResponse = await res.json();
      setResult(data);
    } catch {
      setFormError("Something went wrong reaching the lookup service. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-[640px] flex-col px-6 py-14">
      <header className="border-b-2 border-ink pb-6 text-center">
        <Image
          src="/ytr-logo.png"
          alt="Yonkers Teen Republicans logo"
          width={90}
          height={90}
          priority
          className="mx-auto mb-4 h-36 w-36 object-contain"
        />
        <p className="font-mono text-xs tracking-wide text-brick">
          Yonkers Teen Republicans
        </p>
        <h1 className="mt-3 font-serif text-4xl font-semibold text-navy sm:text-5xl">
          Find your districts
        </h1>
        <p className="mx-auto mt-3 max-w-[46ch] text-ink/70">
          Enter a home address in Yonkers to see every legislative
          district it falls in, from Congress down to City Council.
        </p>
      </header>

      <form onSubmit={handleSubmit} className="mt-10">
        <label htmlFor="address" className="block font-serif text-lg text-navy">
          Home address
        </label>
        <div className="mt-2 flex items-end gap-3 border-b-2 border-ink focus-within:border-brick">
          <input
            id="address"
            name="address"
            type="text"
            autoComplete="street-address"
            placeholder="40 South Broadway, Yonkers, NY"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="w-full bg-transparent py-2 font-mono text-base text-ink outline-none placeholder:text-ink/30"
          />
          <button
            type="submit"
            disabled={loading}
            className="mb-1 shrink-0 border border-ink bg-navy px-4 py-1.5 font-serif text-paper transition-colors hover:bg-brick disabled:opacity-50"
          >
            {loading ? "Looking up…" : "Look up"}
          </button>
        </div>
        {formError && (
          <p className="mt-2 text-sm text-brick" role="alert">
            {formError}
          </p>
        )}
      </form>

      {loading && (
        <section className="mt-12" aria-live="polite" aria-busy="true">
          <ol className="divide-y divide-ledger border-y border-ledger">
            {districtLevels.map((level) => (
              <li
                key={level}
                className="flex items-baseline justify-between gap-4 py-4"
              >
                <p className="font-serif text-lg text-navy">{level}</p>
                <p className="animate-pulse font-mono text-sm text-ink/40">
                  Looking up...
                </p>
              </li>
            ))}
          </ol>
        </section>
      )}

      {result && (
        <section className="mt-12" aria-live="polite">
          {result.matchedAddress ? (
            <p className="font-mono text-xs text-ink/60">
              Matched: {result.matchedAddress}
            </p>
          ) : (
            <p className="text-brick">
              {result.errors[result.errors.length - 1] ??
                "Could not find that address."}
            </p>
          )}

          {result.districts.length > 0 && (
            <ol className="mt-4 divide-y divide-ledger border-y border-ledger">
              {result.districts.map((d) => (
                <li
                  key={d.level}
                  className="flex items-baseline justify-between gap-4 py-4"
                >
                  <div>
                    <p className="font-serif text-lg text-navy">{d.level}</p>
                    <p className="mt-0.5 font-mono text-sm text-ink/50">
                      {d.source}
                    </p>
                  </div>
                  <div className="text-right">
                    <p
                      className={`font-mono text-lg ${
                        d.status === "found" ? "text-ink" : "text-ink/40"
                      }`}
                    >
                      <span className={`mr-2 ${statusColor[d.status]}`}>
                        {statusMark[d.status]}
                      </span>
                      {d.label}
                    </p>
                    {d.note && (
                      <p className="mt-0.5 max-w-[32ch] text-xs text-ink/40">
                        {d.note}
                      </p>
                    )}
                  </div>
                </li>
              ))}
            </ol>
          )}

          {result.errors.length > 0 && result.matchedAddress && (
            <div className="mt-4 space-y-1">
              {result.errors.map((err, i) => (
                <p key={i} className="text-xs text-ink/50">
                  {err}
                </p>
              ))}
            </div>
          )}
        </section>
      )}

      <footer className="mt-auto pt-14 text-center font-mono text-xs text-ink/40">
        Sources: U.S. Census Bureau Geocoder · Westchester County GIS · Yonkers
        GIS
      </footer>
    </main>
  );
}
