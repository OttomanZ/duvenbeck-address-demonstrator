export interface AddressApiResult {
  ADR_NAME1: string
  ADR_NAME2: string | null
  ADR_STRASSE: string
  ADR_LND: string
  ADR_PLZ: string
  ADR_ORT: string
  ADR_LATITUDE2: number
  ADR_LONGITUDE2: number
  ADR_LATITUDE_MERCATOR2: number
  ADR_LONGITUDE_MERCATOR2: number
  confidence_percent: number
}

export interface AddressApiResponse {
  results: AddressApiResult[]
}

export async function matchAddress(query: string): Promise<AddressApiResponse> {
  const response = await fetch("https://depending-affiliates-suitable-perfume.trycloudflare.com/match-address", {
    method: "POST",
    headers: {
      accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query }),
    signal: AbortSignal.timeout(10000), // Increased timeout to 10 seconds
  })

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status} ${response.statusText}`)
  }

  return await response.json()
}

export function formatAddressQuery(formData: {
  customerName: string
  address: string
  city: string
  postalCode: string
  country: string
}): string {
  // Create a comprehensive query string
  const parts = [formData.customerName, formData.address, formData.city, formData.postalCode, formData.country].filter(
    Boolean,
  )

  return parts.join(" ")
}

export function convertApiResultToCustomerLocation(
  result: AddressApiResult,
): import("@/types/customer").CustomerLocation {
  return {
    id: `api-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    customerName: result.ADR_NAME1 + (result.ADR_NAME2 ? ` ${result.ADR_NAME2}` : ""),
    address: result.ADR_STRASSE,
    city: result.ADR_ORT,
    postalCode: result.ADR_PLZ,
    country: result.ADR_LND === "D" ? "Germany" : result.ADR_LND,
    latitude: result.ADR_LONGITUDE2, // Note: API has lat/lng swapped
    longitude: result.ADR_LATITUDE2,
    createdAt: new Date(),
    updatedAt: new Date(),
  }
}
