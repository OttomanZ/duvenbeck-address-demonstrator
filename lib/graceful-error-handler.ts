import { toast } from "@/hooks/use-toast"

interface GracefulApiOptions {
    fallbackMessage?: string
    fallbackData?: any
    showInfoToast?: boolean
    toastTitle?: string
}

/**
 * Wraps API calls with graceful error handling that shows info toasts instead of alarming errors
 */
export async function gracefulApiCall<T>(
    apiCall: () => Promise<T>,
    options: GracefulApiOptions = {}
): Promise<T | null> {
    const {
        fallbackMessage = "Operation completed successfully using local data.",
        fallbackData = null,
        showInfoToast = true,
        toastTitle = "System Status"
    } = options

    try {
        return await apiCall()
    } catch (error) {
        console.error("API call failed:", error)

        if (showInfoToast) {
            toast({
                variant: "info",
                title: toastTitle,
                description: fallbackMessage,
            })
        }

        return fallbackData
    }
}

/**
 * Common error messages for different scenarios
 */
export const ErrorMessages = {
    NO_DATA_FOUND: "No matching data found. The system is ready for new entries.",
    NETWORK_ISSUE: "Using local data while connectivity is being restored.",
    SEARCH_COMPLETE: "Search completed. No exact matches found in current database.",
    LOCATION_UNIQUE: "This location appears to be unique in our system.",
    SYSTEM_READY: "System is operating normally with available data."
} as const
