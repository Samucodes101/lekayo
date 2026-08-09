export type DeliveryLocation = {
  id: string;
  label: string;
  cost: number;
  /** Optional keywords used to auto-detect the location from an address. */
  keywords?: string[];
};

// Default delivery locations used when no admin-configured list exists.
export const defaultDeliveryLocations: DeliveryLocation[] = [
  { id: "area-1-3", label: "Area 1-3", cost: 3000 },
  { id: "area-7-11", label: "Area 7-11", cost: 3000 },
  { id: "asokoro", label: "Asokoro", cost: 4000 },
  { id: "asokoro-ext", label: "Asokoro Ext", cost: 4500 },
  { id: "aso-drive", label: "Aso drive", cost: 4000 },
  { id: "airport", label: "Airport", cost: 15000 },
  {
    id: "airport-road-after-lugbe",
    label: "Airport Road (After Lugbe)",
    cost: 7000,
  },
  { id: "apo-resettlement", label: "Apo resettlement", cost: 4000 },
  { id: "amina-court", label: "Amina Court", cost: 4000 },
  { id: "apo-legislative", label: "Apo legislative", cost: 3500 },
  { id: "aya", label: "AYA", cost: 4000 },
  { id: "apo-mechanic", label: "Apo Mechanic", cost: 4500 },
  { id: "apo-dutse", label: "Apo Dutse", cost: 4000 },
  { id: "barracks", label: "Barracks", cost: 4000 },
  { id: "baze-university", label: "Baze University", cost: 4000 },
  { id: "central-area", label: "Central Area", cost: 3000 },
  { id: "citec", label: "Citec", cost: 3000 },
  { id: "city-gates", label: "City gates", cost: 4500 },
  { id: "durumi", label: "Durumi", cost: 4000 },
  { id: "dawaki", label: "Dawaki", cost: 4000 },
  { id: "dutse-alhaji", label: "Dutse Alhaji", cost: 4500 },
  { id: "deidei", label: "Deidei", cost: 8000 },
  { id: "garki-2", label: "Garki 2", cost: 3000 },
  { id: "gaduwa", label: "Gaduwa", cost: 4000 },
  { id: "galadimawa", label: "Galadimawa", cost: 5000 },
  { id: "games-village", label: "Games village", cost: 4000 },
  { id: "guzape", label: "Guzape", cost: 4000 },
  { id: "gudu", label: "Gudu", cost: 4000 },
  { id: "gwarinpa", label: "Gwarinpa", cost: 3500 },
  { id: "idu", label: "Idu", cost: 4000 },
  { id: "jikwoyi", label: "Jikwoyi", cost: 7000 },
  { id: "jahi", label: "Jahi", cost: 3000 },
  { id: "jabi", label: "Jabi", cost: 3000 },
  { id: "kado", label: "Kado", cost: 3500 },
  { id: "kubwa", label: "Kubwa", cost: 5000 },
  { id: "kubwa-arab-road", label: "Kubwa (Arab road)", cost: 6000 },
  { id: "kukwaba", label: "Kukwaba", cost: 4500 },
  { id: "kugbo", label: "Kugbo", cost: 5000 },
  { id: "karu", label: "Karu", cost: 6000 },
  { id: "katampe", label: "Katampe", cost: 3500 },
  { id: "katampe-extension", label: "Katampe Extension", cost: 4000 },
  { id: "kabusa", label: "Kabusa", cost: 4000 },
  { id: "karsana", label: "Karsana", cost: 4000 },
  { id: "kurudu", label: "Kurudu", cost: 8000 },
  { id: "karimo", label: "Karimo", cost: 5000 },
  { id: "lokogoma", label: "Lokogoma", cost: 4000 },
  { id: "lugbe-fha", label: "Lugbe FHA", cost: 5000 },
  { id: "lugbe-suaka", label: "Lugbe (Suaka)", cost: 6000 },
  { id: "lifecamp", label: "Lifecamp", cost: 3000 },
  { id: "lifecamp-godab-axis", label: "Lifecamp (Godab axis)", cost: 3500 },
  { id: "maitama", label: "Maitama", cost: 3000 },
  { id: "mabushi", label: "Mabushi", cost: 3000 },
  { id: "mpape", label: "Mpape", cost: 7000 },
  { id: "mararaba", label: "Mararaba", cost: 12000 },
  { id: "nile-university", label: "Nile University", cost: 400 },
  { id: "nyanya", label: "Nyanya", cost: 7000 },
  { id: "sun-city", label: "Sun city", cost: 4000 },
  { id: "sunnyvale", label: "Sunnyvale", cost: 4000 },
  { id: "utako", label: "Utako", cost: 3000 },
  { id: "wuse-2", label: "Wuse 2", cost: 3000 },
  { id: "wuse-all-zones", label: "Wuse (All zones)", cost: 3000 },
  { id: "wuye", label: "Wuye", cost: 3000 },
  { id: "wumba", label: "Wumba", cost: 4000 },
  { id: "aco-estate", label: "Aco Estate", cost: 7000 },
  { id: "ochacho", label: "Ochacho", cost: 5000 },
  { id: "pykassa", label: "Pykassa", cost: 5000 },
  { id: "trademoore-axis", label: "Trademoore axis", cost: 6000 },
];

export function getDeliveryLocation(
  id: string,
  locations: DeliveryLocation[] = defaultDeliveryLocations,
) {
  return locations.find((location) => location.id === id);
}

export function getDeliveryCostForLocation(
  id: string,
  locations: DeliveryLocation[] = defaultDeliveryLocations,
) {
  return getDeliveryLocation(id, locations)?.cost;
}

export function normalizeDeliveryLocations(value: unknown): DeliveryLocation[] {
  if (!Array.isArray(value)) {
    return defaultDeliveryLocations;
  }

  return value
    .map((item) => {
      if (typeof item !== "object" || item === null) {
        return null;
      }
      const parsed = item as Record<string, unknown>;
      const id =
        typeof parsed.id === "string" ? parsed.id : String(parsed.id ?? "");
      const label =
        typeof parsed.label === "string"
          ? parsed.label
          : String(parsed.label ?? "");
      const cost = Number(parsed.cost ?? 0);
      const keywords: string[] = Array.isArray(parsed.keywords)
        ? parsed.keywords.filter((k): k is string => typeof k === "string")
        : [];
      if (!id || !label || Number.isNaN(cost)) {
        return null;
      }
      const location: DeliveryLocation = { id, label, cost };
      if (keywords.length > 0) {
        location.keywords = keywords;
      }
      return location;
    })
    .filter((location): location is DeliveryLocation => location !== null);
}

/**
 * Auto-detect a delivery location from an address string.
 *
 * It checks the address against each location's `keywords` (if provided) and
 * also against the location `label` itself. The first match wins. If no match
 * is found, `null` is returned.
 *
 * @example
 * detectDeliveryLocation("12 Maitama Street, Abuja", locations)
 * // → { id: "maitama", label: "Maitama", cost: 3000 }
 */
export function detectDeliveryLocation(
  address: string,
  locations: DeliveryLocation[] = defaultDeliveryLocations,
): DeliveryLocation | null {
  if (!address || typeof address !== "string") {
    return null;
  }

  const normalizedAddress = address.toLowerCase().trim();

  for (const location of locations) {
    // Check explicit keywords first (admin-configured).
    if (location.keywords && location.keywords.length > 0) {
      for (const keyword of location.keywords) {
        if (keyword && normalizedAddress.includes(keyword.toLowerCase())) {
          return location;
        }
      }
    }

    // Fall back to matching on the label itself.
    if (location.label && normalizedAddress.includes(location.label.toLowerCase())) {
      return location;
    }
  }

  return null;
}
