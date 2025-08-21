/**
 * International Vehicle Registration Codes
 * Based on the international standard for vehicle registration codes
 */

interface CountryCodeMapping {
    [key: string]: string
}

// Comprehensive mapping of countries to their international vehicle registration codes
const COUNTRY_CODES: CountryCodeMapping = {
    // Germany variants
    "germany": "D",
    "deutschland": "D",
    "german": "D",
    "de": "D",
    "deu": "D",

    // Other European countries
    "austria": "A",
    "österreich": "A",
    "belgium": "B",
    "belgique": "B",
    "belgië": "B",
    "switzerland": "CH",
    "schweiz": "CH",
    "suisse": "CH",
    "svizzera": "CH",
    "czech republic": "CZ",
    "česká republika": "CZ",
    "denmark": "DK",
    "danmark": "DK",
    "spain": "E",
    "españa": "E",
    "finland": "FIN",
    "suomi": "FIN",
    "france": "F",
    "frankreich": "F",
    "united kingdom": "GB",
    "great britain": "GB",
    "england": "GB",
    "scotland": "GB",
    "wales": "GB",
    "greece": "GR",
    "ελλάδα": "GR",
    "hungary": "H",
    "magyarország": "H",
    "ireland": "IRL",
    "éire": "IRL",
    "italy": "I",
    "italia": "I",
    "luxembourg": "L",
    "netherlands": "NL",
    "nederland": "NL",
    "holland": "NL",
    "norway": "N",
    "norge": "N",
    "poland": "PL",
    "polska": "PL",
    "portugal": "P",
    "romania": "RO",
    "românia": "RO",
    "sweden": "S",
    "sverige": "S",
    "slovenia": "SLO",
    "slovenija": "SLO",
    "slovakia": "SK",
    "slovensko": "SK",

    // Non-European countries
    "united states": "USA",
    "usa": "USA",
    "america": "USA",
    "canada": "CDN",
    "japan": "J",
    "australia": "AUS",
    "new zealand": "NZ",
    "china": "CHN",
    "russia": "RUS",
    "brasil": "BR",
    "brazil": "BR",
    "india": "IND",
    "south africa": "ZA",
    "mexico": "MEX",
    "turkey": "TR",
    "türkiye": "TR",
}

/**
 * Gets the international vehicle registration code for a given country
 * @param country - The country name (case insensitive)
 * @returns The international vehicle registration code or null if not found
 */
export function getVehicleRegistrationCode(country: string): string | null {
    if (!country) return null

    // Normalize the input: lowercase and trim
    const normalizedCountry = country.toLowerCase().trim()

    // Direct lookup
    if (COUNTRY_CODES[normalizedCountry]) {
        return COUNTRY_CODES[normalizedCountry]
    }

    // Try partial matching for compound country names
    for (const [key, code] of Object.entries(COUNTRY_CODES)) {
        if (normalizedCountry.includes(key) || key.includes(normalizedCountry)) {
            return code
        }
    }

    return null
}

/**
 * Gets all supported countries and their codes
 * @returns Array of country-code pairs
 */
export function getAllCountryCodes(): Array<{ country: string; code: string }> {
    const uniqueCodes = new Map<string, string>()

    // Get unique codes with their primary country names
    Object.entries(COUNTRY_CODES).forEach(([country, code]) => {
        if (!uniqueCodes.has(code)) {
            uniqueCodes.set(code, country)
        }
    })

    return Array.from(uniqueCodes.entries()).map(([code, country]) => ({
        country: country.charAt(0).toUpperCase() + country.slice(1),
        code
    })).sort((a, b) => a.country.localeCompare(b.country))
}

/**
 * Validates if a country code exists
 * @param code - The vehicle registration code to validate
 * @returns True if the code exists
 */
export function isValidVehicleCode(code: string): boolean {
    return Object.values(COUNTRY_CODES).includes(code.toUpperCase())
}
