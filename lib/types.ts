export interface Coordinates {
  lat: number;
  lon: number;
}

export type DistrictSourceStatus = "found" | "notFound" | "unavailable";

export interface DistrictResult {
  level: string;
  district: string | null;
  label: string;
  status: DistrictSourceStatus;
  source: string;
  note?: string;
}

export interface LookupResponse {
  matchedAddress: string | null;
  districts: DistrictResult[];
  errors: string[];
}
