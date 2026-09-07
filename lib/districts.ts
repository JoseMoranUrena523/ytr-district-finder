import type { Coordinates, DistrictResult } from "./types";

function findGeographyLayer(
  geographies: Record<string, any[]>,
  ...mustInclude: string[]
): any[] | null {
  const lowerNeedles = mustInclude.map((s) => s.toLowerCase());
  for (const key of Object.keys(geographies)) {
    const lowerKey = key.toLowerCase();
    if (lowerNeedles.every((n) => lowerKey.includes(n))) {
      return geographies[key];
    }
  }
  return null;
}

function firstFeatureField(
  features: any[] | null,
  fields: string[]
): string | null {
  if (!features || features.length === 0) return null;
  const feature = features[0];
  for (const f of fields) {
    if (feature[f] !== undefined && feature[f] !== null && feature[f] !== "") {
      return String(feature[f]);
    }
  }
  return null;
}

export function parseCensusDistricts(
  geographies: Record<string, any[]>
): DistrictResult[] {
  const results: DistrictResult[] = [];

  const congress = findGeographyLayer(geographies, "congressional");
  const congressName = firstFeatureField(congress, ["BASENAME", "NAME"]);
  results.push({
    level: "U.S. House of Representatives",
    district: congressName,
    label: congressName ? `Congressional District ${congressName}` : "Not found",
    status: congressName ? "found" : "notFound",
    source: "U.S. Census Bureau Geocoder",
  });

  const senate = findGeographyLayer(geographies, "state legislative", "upper");
  const senateName = firstFeatureField(senate, ["BASENAME", "NAME"]);
  results.push({
    level: "NY State Senate",
    district: senateName,
    label: senateName ? `Senate District ${senateName}` : "Not found",
    status: senateName ? "found" : "notFound",
    source: "U.S. Census Bureau Geocoder",
  });

  const assembly = findGeographyLayer(geographies, "state legislative", "lower");
  const assemblyName = firstFeatureField(assembly, ["BASENAME", "NAME"]);
  results.push({
    level: "NY State Assembly",
    district: assemblyName,
    label: assemblyName ? `Assembly District ${assemblyName}` : "Not found",
    status: assemblyName ? "found" : "notFound",
    source: "U.S. Census Bureau Geocoder",
  });

  return results;
}

export async function lookupWestchesterCountyDistrict(
  coords: Coordinates
): Promise<DistrictResult> {
  const url = new URL("https://giswww.westchestergov.com/arcgis/rest/services/Datahub_Boundaries/MapServer/160/query");
  url.searchParams.set("geometry", `${coords.lon},${coords.lat}`);
  url.searchParams.set("geometryType", "esriGeometryPoint");
  url.searchParams.set("inSR", "4326");
  url.searchParams.set("spatialRel", "esriSpatialRelIntersects");
  url.searchParams.set("outFields", "DISTRICTID");
  url.searchParams.set("returnGeometry", "false");
  url.searchParams.set("f", "json");

  try {
    const res = await fetch(url.toString());
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    const feature = data?.features?.[0];
    const districtId: string | undefined = feature?.attributes?.DISTRICTID;

    if (!districtId) {
      return {
        level: "Westchester County Legislature",
        district: null,
        label: "Not found",
        status: "notFound",
        source: "Westchester County GIS",
      };
    }

    return {
      level: "Westchester County Legislature",
      district: districtId,
      label: `Legislative District ${districtId}`,
      status: "found",
      source: "Westchester County GIS",
    };
  } catch (err) {
    return {
      level: "Westchester County Legislature",
      district: null,
      label: "Lookup unavailable",
      status: "unavailable",
      source: "Westchester County GIS",
      note: err instanceof Error ? err.message : "Unknown error",
    };
  }
}

export async function lookupYonkersCouncilDistrict(
  coords: Coordinates
): Promise<DistrictResult> {
  const url = new URL("https://services1.arcgis.com/gBhxGcfCoIWU5257/arcgis/rest/services/Yonkers_City_Council_Districts/FeatureServer/0/query");
  url.searchParams.set("geometry", `${coords.lon},${coords.lat}`);
  url.searchParams.set("geometryType", "esriGeometryPoint");
  url.searchParams.set("inSR", "4326");
  url.searchParams.set("spatialRel", "esriSpatialRelIntersects");
  url.searchParams.set("outFields", "DISTRICT");
  url.searchParams.set("returnGeometry", "false");
  url.searchParams.set("f", "json");

  try {
    const res = await fetch(url.toString());
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (data?.error) {
      throw new Error(data.error.message ?? "ArcGIS query failed");
    }
    const feature = data?.features?.[0];
    const districtId = feature?.attributes?.DISTRICT;

    if (!districtId) {
      return {
        level: "Yonkers City Council",
        district: null,
        label: "Not found",
        status: "notFound",
        source: "Yonkers GIS",
      };
    }

    return {
      level: "Yonkers City Council",
      district: String(districtId),
      label: `Council District ${districtId}`,
      status: "found",
      source: "Yonkers GIS",
    };
  } catch (err) {
    return {
      level: "Yonkers City Council",
      district: null,
      label: "Lookup unavailable",
      status: "unavailable",
      source: "Yonkers GIS",
      note: err instanceof Error ? err.message : "Unknown error",
    };
  }
}
