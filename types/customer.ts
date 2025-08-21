export interface CustomerLocation {
  id: string
  customerName: string
  address: string
  city: string
  postalCode: string
  country: string
  countryCode?: string // International vehicle registration code
  latitude?: number
  longitude?: number
  createdAt: Date
  updatedAt: Date
}

export interface DuplicateMatch {
  location: CustomerLocation
  similarity: number
  matchReasons: string[]
}
