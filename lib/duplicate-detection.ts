import type { CustomerLocation, DuplicateMatch } from "@/types/customer"

// Simple string similarity function using Levenshtein distance
function calculateSimilarity(str1: string, str2: string): number {
  const s1 = str1.toLowerCase().trim()
  const s2 = str2.toLowerCase().trim()

  if (s1 === s2) return 1

  const longer = s1.length > s2.length ? s1 : s2
  const shorter = s1.length > s2.length ? s2 : s1

  if (longer.length === 0) return 1

  const distance = levenshteinDistance(longer, shorter)
  return (longer.length - distance) / longer.length
}

function levenshteinDistance(str1: string, str2: string): number {
  const matrix = []

  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i]
  }

  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j
  }

  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1]
      } else {
        matrix[i][j] = Math.min(matrix[i - 1][j - 1] + 1, matrix[i][j - 1] + 1, matrix[i - 1][j] + 1)
      }
    }
  }

  return matrix[str2.length][str1.length]
}

// GPS distance calculation (Haversine formula)
function calculateGPSDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371 // Earth's radius in kilometers
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

export function findDuplicates(
  newLocation: Partial<CustomerLocation>,
  existingLocations: CustomerLocation[],
): DuplicateMatch[] {
  const matches: DuplicateMatch[] = []

  for (const existing of existingLocations) {
    const matchReasons: string[] = []
    let totalSimilarity = 0
    let factors = 0

    // Check customer name similarity
    if (newLocation.customerName && existing.customerName) {
      const nameSimilarity = calculateSimilarity(newLocation.customerName, existing.customerName)
      if (nameSimilarity > 0.7) {
        matchReasons.push(`Similar customer name (${Math.round(nameSimilarity * 100)}% match)`)
        totalSimilarity += nameSimilarity * 0.4 // 40% weight
        factors++
      }
    }

    // Check address similarity
    if (newLocation.address && existing.address) {
      const addressSimilarity = calculateSimilarity(newLocation.address, existing.address)
      if (addressSimilarity > 0.6) {
        matchReasons.push(`Similar address (${Math.round(addressSimilarity * 100)}% match)`)
        totalSimilarity += addressSimilarity * 0.3 // 30% weight
        factors++
      }
    }

    // Check city similarity
    if (newLocation.city && existing.city) {
      const citySimilarity = calculateSimilarity(newLocation.city, existing.city)
      if (citySimilarity > 0.8) {
        matchReasons.push(`Same/similar city (${Math.round(citySimilarity * 100)}% match)`)
        totalSimilarity += citySimilarity * 0.2 // 20% weight
        factors++
      }
    }

    // Check postal code similarity
    if (newLocation.postalCode && existing.postalCode) {
      const postalSimilarity = calculateSimilarity(newLocation.postalCode, existing.postalCode)
      if (postalSimilarity > 0.8) {
        matchReasons.push(`Same/similar postal code`)
        totalSimilarity += postalSimilarity * 0.1 // 10% weight
        factors++
      }
    }

    // Check GPS proximity (if both have coordinates)
    if (newLocation.latitude && newLocation.longitude && existing.latitude && existing.longitude) {
      const distance = calculateGPSDistance(
        newLocation.latitude,
        newLocation.longitude,
        existing.latitude,
        existing.longitude,
      )
      if (distance < 1) {
        // Within 1km
        matchReasons.push(`Very close GPS location (${distance.toFixed(2)}km away)`)
        totalSimilarity += 0.3 // High weight for GPS proximity
        factors++
      }
    }

    // Only consider it a potential duplicate if we have matches and reasonable similarity
    if (matchReasons.length > 0 && factors > 0) {
      const finalSimilarity = totalSimilarity / Math.max(factors, 1)
      if (finalSimilarity > 0.5) {
        // Threshold for considering it a duplicate
        matches.push({
          location: existing,
          similarity: finalSimilarity,
          matchReasons,
        })
      }
    }
  }

  // Sort by similarity (highest first) and return top 3
  return matches.sort((a, b) => b.similarity - a.similarity).slice(0, 3)
}
