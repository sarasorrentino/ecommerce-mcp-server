import { fetchJson } from "../utils/http.js";

const NOMINATIM_URL = "https://nominatim.openstreetmap.org/search";
const OVERPASS_URL = "https://overpass-api.de/api/interpreter";

export async function geocodeLocation(location) {
  const url =
    `${NOMINATIM_URL}?` +
    new URLSearchParams({
      q: location,
      format: "json",
      limit: 1
    });

  const results = await fetchJson(url);

  if (!results.length) {
    throw new Error(`Could not geocode location: ${location}`);
  }

  return {
    lat: Number(results[0].lat),
    lng: Number(results[0].lon),
    displayName: results[0].display_name
  };
}

export async function searchPlacesByBrand({
  brand,
  lat,
  lng,
  radiusKm = 5,
  limit = 5
}) {
  const radiusMeters = radiusKm * 1000;

  const query = `
    [out:json][timeout:25];
    (
      node["name"~"${brand}", i](around:${radiusMeters}, ${lat}, ${lng});
      way["name"~"${brand}", i](around:${radiusMeters}, ${lat}, ${lng});
    );
    out center tags;
  `;

  const data = await fetchJson(OVERPASS_URL, {
    method: "POST",
    body: query
  });

  return data.elements.slice(0, limit).map((el) => ({
    id: `osm-${el.type}-${el.id}`,
    name: el.tags?.name ?? brand,
    coords: [
      el.lon ?? el.center?.lon,
      el.lat ?? el.center?.lat
    ],
    description:
      el.tags?.description ??
      el.tags?.shop ??
      el.tags?.amenity ??
      "Local shop",
    city:
      el.tags?.["addr:city"] ??
      el.tags?.["addr:suburb"] ??
      "",
    rating: null,
    price: null,
    thumbnail: null
  }));
}
