import type { Coordinates } from "./types";

export interface CensusAddressMatch {
  matchedAddress: string;
  coordinates: Coordinates;
  geographies: Record<string, any[]>;
}

export async function geocodeWithCensus(
  address: string
): Promise<CensusAddressMatch | null> {
  const url = new URL("https://geocoding.geo.census.gov/geocoder/geographies/onelineaddress");
  url.searchParams.set("address", address);
  url.searchParams.set("benchmark", "4");
  url.searchParams.set("vintage", "4");
  url.searchParams.set("layers", "all");
  url.searchParams.set("format", "json");

  const res = await fetch(url.toString());

  if (!res.ok) {
    throw new Error(`Census geocoder returned HTTP ${res.status}`);
  }

  const data = await res.json();
  const matches = data?.result?.addressMatches;

  if (!Array.isArray(matches) || matches.length === 0) {
    return null;
  }

  const best = matches[0];

  return {
    matchedAddress: best.matchedAddress,
    coordinates: {
      lon: best.coordinates.x,
      lat: best.coordinates.y,
    },
    geographies: best.geographies ?? {},
  };
}