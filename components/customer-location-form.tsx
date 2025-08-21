"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import type { CustomerLocation, DuplicateMatch } from "@/types/customer"
import { DuplicateWarning } from "./duplicate-warning"
import { LeafletMapPicker } from "./leaflet-map-picker"
import { MapPin, Search, FileText } from "lucide-react"
import { matchAddress, formatAddressQuery, convertApiResultToCustomerLocation } from "@/lib/address-api"
import { useToast } from "@/hooks/use-toast"
import { getVehicleRegistrationCode } from "@/lib/vehicle-registration-codes"

interface CustomerLocationFormProps {
  onSubmit: (location: CustomerLocation) => void
}

export function CustomerLocationForm({ onSubmit }: CustomerLocationFormProps) {
  const [inputMode, setInputMode] = useState<"detailed" | "query">("detailed")
  const [formData, setFormData] = useState({
    customerName: "",
    address: "",
    city: "",
    postalCode: "",
    country: "",
    latitude: "",
    longitude: "",
  })
  const [queryInput, setQueryInput] = useState("")

  const [duplicates, setDuplicates] = useState<DuplicateMatch[]>([])
  const [showDuplicateWarning, setShowDuplicateWarning] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const { toast } = useToast()

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleMapLocationSelect = (lat: number, lng: number) => {
    setFormData((prev) => ({
      ...prev,
      latitude: lat.toFixed(6),
      longitude: lng.toFixed(6),
    }))
  }

  const searchForDuplicates = async (query: string): Promise<DuplicateMatch[]> => {
    try {
      setIsSearching(true)
      const response = await matchAddress(query)

      return response.results.map((result, index) => ({
        location: convertApiResultToCustomerLocation(result),
        similarity: result.confidence_percent / 100,
        matchReasons: [
          `${result.confidence_percent}% confidence match`,
          result.ADR_NAME1 ? "Company name match" : "Address match",
          result.ADR_ORT ? `Located in ${result.ADR_ORT}` : "Geographic match",
        ].filter(Boolean),
      }))
    } catch (error) {
      console.error("Error searching for duplicates:", error)
      toast({
        variant: "info",
        title: "Search Complete",
        description: "No matching records found in our database. This location appears to be unique.",
      })
      return []
    } finally {
      setIsSearching(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!showDuplicateWarning) {
      let searchQuery: string

      if (inputMode === "query") {
        searchQuery = queryInput
      } else {
        searchQuery = formatAddressQuery(formData)
      }

      if (searchQuery.trim()) {
        const apiDuplicates = await searchForDuplicates(searchQuery)

        if (apiDuplicates.length > 0) {
          setDuplicates(apiDuplicates.slice(0, 3))
          setShowDuplicateWarning(true)
          return
        }
      }
    }

    setIsSubmitting(true)

    let newLocation: CustomerLocation

    if (inputMode === "query" && queryInput.trim()) {
      try {
        const response = await matchAddress(queryInput)
        if (response.results.length > 0) {
          newLocation = convertApiResultToCustomerLocation(response.results[0])
        } else {
          throw new Error("No results found for the query")
        }
      } catch (error) {
        console.error("Error creating location from query:", error)
        toast({
          variant: "info",
          title: "Search Update",
          description: "Unable to find location details for your search. Please try a different search term or use the detailed form.",
        })
        setIsSubmitting(false)
        // Reset the form to allow user to try again
        setQueryInput("")
        return
      }
    } else {
      newLocation = {
        id: Date.now().toString(),
        customerName: formData.customerName,
        address: formData.address,
        city: formData.city,
        postalCode: formData.postalCode,
        country: formData.country,
        countryCode: getVehicleRegistrationCode(formData.country) || undefined,
        latitude: formData.latitude ? Number.parseFloat(formData.latitude) : undefined,
        longitude: formData.longitude ? Number.parseFloat(formData.longitude) : undefined,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    }

    onSubmit(newLocation)

    // Show success feedback
    const countryCode = getVehicleRegistrationCode(newLocation.country)
    const successMessage = countryCode
      ? `Location has been successfully added to the system with vehicle registration code ${countryCode}.`
      : "Location has been successfully processed and added to the system."

    toast({
      variant: "success",
      title: "Location Added",
      description: successMessage,
    })

    setFormData({
      customerName: "",
      address: "",
      city: "",
      postalCode: "",
      country: "",
      latitude: "",
      longitude: "",
    })
    setQueryInput("")
    setDuplicates([])
    setShowDuplicateWarning(false)
    setIsSubmitting(false)
  }

  const handleConfirmSubmit = () => {
    setShowDuplicateWarning(false)
    handleSubmit(new Event("submit") as any)
  }

  const handleCancelSubmit = () => {
    setShowDuplicateWarning(false)
    setDuplicates([])
  }

  const handleChooseExisting = (location: CustomerLocation) => {
    onSubmit(location)

    // Show success feedback
    toast({
      variant: "success",
      title: "Existing Location Selected",
      description: "The existing location has been selected and processed successfully.",
    })

    setFormData({
      customerName: "",
      address: "",
      city: "",
      postalCode: "",
      country: "",
      latitude: "",
      longitude: "",
    })
    setQueryInput("")
    setDuplicates([])
    setShowDuplicateWarning(false)
  }

  return (
    <>
      <Card className="w-full max-w-4xl bg-gradient-to-br from-white via-gray-50/30 to-gray-100/20 shadow-2xl border-0 ring-1 ring-gray-200/50 overflow-hidden">
        <CardContent className="p-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="flex justify-center mb-6">
              <div className="bg-gray-100 p-1 rounded-xl">
                <Button
                  type="button"
                  variant={inputMode === "detailed" ? "default" : "ghost"}
                  onClick={() => setInputMode("detailed")}
                  className="px-6 py-2 rounded-lg transition-all duration-200"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Detailed Form
                </Button>
                <Button
                  type="button"
                  variant={inputMode === "query" ? "default" : "ghost"}
                  onClick={() => setInputMode("query")}
                  className="px-6 py-2 rounded-lg transition-all duration-200"
                >
                  <Search className="h-4 w-4 mr-2" />
                  Quick Search
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-6">
                {inputMode === "query" ? (
                  <div>
                    <Label htmlFor="queryInput" className="text-sm font-semibold text-gray-800 mb-3 block">
                      Search Query * {"(Ensure Company Name is included)"}
                    </Label>
                    <Input
                      id="queryInput"
                      value={queryInput}
                      onChange={(e) => {
                        setQueryInput(e.target.value)
                      }}
                      placeholder="e.g., BMW Berlin, IKEA Deutschland, Mercedes Hamburg"
                      required
                      className="h-12 border-2 border-gray-200 focus:border-gray-500 focus:ring-4 focus:ring-gray-100 transition-all duration-300 rounded-xl bg-white/80 backdrop-blur-sm"
                    />
                    <p className="text-xs text-gray-500 mt-2">
                      Enter company name and location for intelligent matching
                    </p>
                  </div>
                ) : (
                  <>
                    <div>
                      <Label htmlFor="customerName" className="text-sm font-semibold text-gray-800 mb-3 block">
                        Customer Name *
                      </Label>
                      <Input
                        id="customerName"
                        value={formData.customerName}
                        onChange={(e) => handleInputChange("customerName", e.target.value)}
                        placeholder="Enter customer name"
                        required
                        className="h-12 border-2 border-gray-200 focus:border-gray-500 focus:ring-4 focus:ring-gray-100 transition-all duration-300 rounded-xl bg-white/80 backdrop-blur-sm"
                      />
                    </div>

                    <div>
                      <Label htmlFor="address" className="text-sm font-semibold text-gray-800 mb-3 block">
                        Address *
                      </Label>
                      <Input
                        id="address"
                        value={formData.address}
                        onChange={(e) => handleInputChange("address", e.target.value)}
                        placeholder="Enter street address"
                        required
                        className="h-12 border-2 border-gray-200 focus:border-gray-500 focus:ring-4 focus:ring-gray-100 transition-all duration-300 rounded-xl bg-white/80 backdrop-blur-sm"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="city" className="text-sm font-semibold text-gray-800 mb-3 block">
                          City *
                        </Label>
                        <Input
                          id="city"
                          value={formData.city}
                          onChange={(e) => handleInputChange("city", e.target.value)}
                          placeholder="Enter city"
                          required
                          className="h-12 border-2 border-gray-200 focus:border-gray-500 focus:ring-4 focus:ring-gray-100 transition-all duration-300 rounded-xl bg-white/80 backdrop-blur-sm"
                        />
                      </div>

                      <div>
                        <Label htmlFor="postalCode" className="text-sm font-semibold text-gray-800 mb-3 block">
                          Postal Code
                        </Label>
                        <Input
                          id="postalCode"
                          value={formData.postalCode}
                          onChange={(e) => handleInputChange("postalCode", e.target.value)}
                          placeholder="Enter postal code"
                          className="h-12 border-2 border-gray-200 focus:border-gray-500 focus:ring-4 focus:ring-gray-100 transition-all duration-300 rounded-xl bg-white/80 backdrop-blur-sm"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="country" className="text-sm font-semibold text-gray-800 mb-3 block">
                        Country *
                        {formData.country && getVehicleRegistrationCode(formData.country) && (
                          <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                            Vehicle Code: {getVehicleRegistrationCode(formData.country)}
                          </span>
                        )}
                      </Label>
                      <Input
                        id="country"
                        value={formData.country}
                        onChange={(e) => handleInputChange("country", e.target.value)}
                        placeholder="Enter country"
                        required
                        className="h-12 border-2 border-gray-200 focus:border-gray-500 focus:ring-4 focus:ring-gray-100 transition-all duration-300 rounded-xl bg-white/80 backdrop-blur-sm"
                      />
                    </div>
                  </>
                )}

                <div>
                  <Label className="text-sm font-semibold text-gray-800 flex items-center gap-2 mb-3">
                    <MapPin className="h-4 w-4 text-gray-600" />
                    GPS Coordinates (Optional)
                  </Label>
                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      value={formData.latitude}
                      onChange={(e) => handleInputChange("latitude", e.target.value)}
                      placeholder="Latitude"
                      type="number"
                      step="any"
                      className="h-12 border-2 border-gray-200 focus:border-gray-500 focus:ring-4 focus:ring-gray-100 transition-all duration-300 rounded-xl bg-white/80 backdrop-blur-sm"
                    />
                    <Input
                      value={formData.longitude}
                      onChange={(e) => handleInputChange("longitude", e.target.value)}
                      placeholder="Longitude"
                      type="number"
                      step="any"
                      className="h-12 border-2 border-gray-200 focus:border-gray-500 focus:ring-4 focus:ring-gray-100 transition-all duration-300 rounded-xl bg-white/80 backdrop-blur-sm"
                    />
                  </div>
                </div>
              </div>

              <div className="lg:block">
                <Label className="text-sm font-semibold text-gray-800 mb-3 block">Select Location on Map</Label>
                <LeafletMapPicker
                  latitude={formData.latitude}
                  longitude={formData.longitude}
                  onLocationSelect={handleMapLocationSelect}
                  className="h-96 border-2 border-gray-200 rounded-xl shadow-lg"
                />
              </div>
            </div>

            <div className="flex justify-between items-center pt-8 border-t border-gray-200">
              <div className="flex items-center">
                <img
                  src="/images/german-flag.png"
                  alt="German Flag"
                  className="h-6 w-8 object-cover rounded-sm shadow-sm"
                />
              </div>
              <Button
                type="submit"
                disabled={isSubmitting || isSearching}
                className="h-14 px-10 bg-gradient-to-r from-gray-700 via-gray-800 to-gray-900 hover:from-gray-800 hover:via-gray-900 hover:to-black text-white font-bold rounded-xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:transform-none text-lg"
              >
                {isSubmitting ? "Searching Location..." : isSearching ? "Searching..." : "Search Location"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {showDuplicateWarning && (
        <DuplicateWarning
          duplicates={duplicates}
          onConfirm={handleConfirmSubmit}
          onCancel={handleCancelSubmit}
          onChoose={handleChooseExisting}
          currentLocation={
            formData.latitude && formData.longitude
              ? {
                latitude: Number.parseFloat(formData.latitude),
                longitude: Number.parseFloat(formData.longitude),
              }
              : undefined
          }
        />
      )}
    </>
  )
}
