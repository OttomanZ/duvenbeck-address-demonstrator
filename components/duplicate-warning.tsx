"use client"

import { AlertTriangle, MapPin, Building2, Navigation } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { DuplicateMatch } from "@/types/customer"

interface DuplicateWarningProps {
  duplicates: DuplicateMatch[]
  onConfirm: () => void
  onCancel: () => void
  onChoose?: (location: DuplicateMatch["location"]) => void
  currentLocation?: { latitude: number; longitude: number }
}

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371 // Earth's radius in kilometers
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

export function DuplicateWarning({
  duplicates,
  onConfirm,
  onCancel,
  onChoose,
  currentLocation,
}: DuplicateWarningProps) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4" style={{ zIndex: 9999 }}>
      <Card className="w-full max-w-3xl max-h-[80vh] overflow-y-auto">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-6 w-6 text-blue-500" />
            <CardTitle className="text-xl font-semibold text-foreground">Similar Locations Found</CardTitle>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            We found {duplicates.length} similar location{duplicates.length > 1 ? "s" : ""} in our database that might be related. Please review these suggestions or continue with adding the new location.
          </p>
        </CardHeader>

        <CardContent className="space-y-3">
          {duplicates.map((match, index) => {
            const distance =
              currentLocation && match.location.latitude && match.location.longitude
                ? calculateDistance(
                  currentLocation.latitude,
                  currentLocation.longitude,
                  match.location.latitude,
                  match.location.longitude,
                )
                : null

            return (
              <Card key={match.location.id} className="border-l-4 border-l-blue-500">
                <CardContent className="pt-3 pb-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                      <h4 className="font-medium text-foreground">{match.location.customerName}</h4>
                      <Badge variant="secondary" className="text-xs">
                        {Math.round(match.similarity * 100)}% match
                      </Badge>
                      {distance && (
                        <Badge variant="outline" className="text-xs flex items-center gap-1">
                          <Navigation className="h-3 w-3" />
                          {distance.toFixed(1)} km away
                        </Badge>
                      )}
                    </div>
                    {onChoose && (
                      <Button
                        size="sm"
                        variant="default"
                        onClick={() => onChoose(match.location)}
                        className="bg-green-600 hover:bg-green-700 text-white"
                      >
                        Choose
                      </Button>
                    )}
                  </div>

                  <div className="flex items-start gap-2 mb-2">
                    <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div className="text-sm text-muted-foreground">
                      {match.location.address}, {match.location.city}, {match.location.postalCode},{" "}
                      {match.location.country}
                      {match.location.countryCode && (
                        <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-1 rounded">
                          {match.location.countryCode}
                        </span>
                      )}
                      {match.location.latitude && match.location.longitude && (
                        <span className="ml-2 text-xs">
                          ({match.location.latitude.toFixed(4)}, {match.location.longitude.toFixed(4)})
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {match.matchReasons.map((reason, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs py-0 px-2">
                        {reason}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )
          })}

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={onCancel}>
              Review Details
            </Button>
            <Button onClick={onConfirm} className="bg-blue-600 hover:bg-blue-700 text-white">
              Continue - Add New Location
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
