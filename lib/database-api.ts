export interface DatabaseLocation {
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
}

export interface PaginatedResponse {
  locations: DatabaseLocation[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export async function fetchDatabaseLocations(): Promise<DatabaseLocation[]> {
  try {
    console.log("[v0] Fetching database locations from API...")

    const response = await fetch("https://depending-affiliates-suitable-perfume.trycloudflare.com/address-database", {
      method: "GET",
      headers: {
        accept: "application/json",
      },
      signal: AbortSignal.timeout(15000), // 15 second timeout for large dataset
    })

    if (!response.ok) {
      throw new Error(`Database API error: ${response.status} ${response.statusText}`)
    }

    const data: DatabaseLocation[] = await response.json()
    console.log("[v0] Successfully fetched", data.length, "locations from database")

    return data
  } catch (error) {
    console.error("[v0] Database API error:", error)
    throw error
  }
}

// Client-side pagination helper
export function paginateLocations(locations: DatabaseLocation[], page: number, pageSize: number): PaginatedResponse {
  const startIndex = (page - 1) * pageSize
  const endIndex = startIndex + pageSize
  const paginatedLocations = locations.slice(startIndex, endIndex)

  return {
    locations: paginatedLocations,
    total: locations.length,
    page,
    pageSize,
    totalPages: Math.ceil(locations.length / pageSize),
  }
}
