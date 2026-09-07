import { NextRequest, NextResponse } from "next/server";
import { geocodeWithCensus } from "@/lib/geocode";
import {
  parseCensusDistricts,
  lookupWestchesterCountyDistrict,
  lookupYonkersCouncilDistrict,
} from "@/lib/districts";
import type { Coordinates, DistrictResult, LookupResponse } from "@/lib/types";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const address = typeof body?.address === "string" ? body.address.trim() : "";

  if (!address) {
    return NextResponse.json(
      { error: "Missing 'address' in request body." },
      { status: 400 }
    );
  }

  const errors: string[] = [];
  const districts: DistrictResult[] = [];
  let matchedAddress: string | null = null;
  let coords: Coordinates | null = null;

  try {
    const censusMatch = await geocodeWithCensus(address);
    if (censusMatch) {
      matchedAddress = censusMatch.matchedAddress;
      coords = censusMatch.coordinates;
      districts.push(...parseCensusDistricts(censusMatch.geographies));
    }
  } catch (err) {
    errors.push(
      `Census geocoder error: ${err instanceof Error ? err.message : "unknown"}`
    );
  }

  if (!coords) {
    const response: LookupResponse = {
      matchedAddress: null,
      districts: [],
      errors: [
        ...errors,
        "Could not geocode this address. Double-check the spelling and include city/state.",
      ],
    };
    return NextResponse.json(response, { status: 422 });
  }

  const [westchester, yonkers] = await Promise.all([
    lookupWestchesterCountyDistrict(coords),
    lookupYonkersCouncilDistrict(coords),
  ]);
  districts.push(westchester, yonkers);

  const response: LookupResponse = {
    matchedAddress,
    districts,
    errors,
  };

  return NextResponse.json(response);
}
