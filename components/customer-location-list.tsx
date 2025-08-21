"use client"

import { useState, useEffect, useMemo } from "react"
import { Search, MapPin, Building2, Filter, ChevronLeft, ChevronRight, Loader2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { fetchDatabaseLocations, paginateLocations, type DatabaseLocation } from "@/lib/database-api"
import { useToast } from "@/hooks/use-toast"

const PAGE_SIZE = 20 // Show 20 locations per page for optimal performance

export function CustomerLocationList() {
  const [allLocations, setAllLocations] = useState<DatabaseLocation[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState<"name" | "city" | "country">("name")
  const [currentPage, setCurrentPage] = useState(1)
  const { toast } = useToast()

  useEffect(() => {
    const loadLocations = async () => {
      try {
        setLoading(true)
        const locations = await fetchDatabaseLocations()
        setAllLocations(locations)
      } catch (err) {
        console.error("Failed to load database locations:", err)
        toast({
          variant: "info",
          title: "Database Status",
          description: "Database connection temporarily unavailable. System is ready for new entries.",
        })
        // Provide some fallback so the component still works
        setAllLocations([])
      } finally {
        setLoading(false)
      }
    }

    loadLocations()
  }, [])

  const filteredAndSortedLocations = useMemo(() => {
    return allLocations
      .filter((location) => {
        const searchLower = searchTerm.toLowerCase()
        return (
          (location.ADR_NAME1 && location.ADR_NAME1.toLowerCase().includes(searchLower)) ||
          (location.ADR_NAME2 && location.ADR_NAME2.toLowerCase().includes(searchLower)) ||
          (location.ADR_STRASSE && location.ADR_STRASSE.toLowerCase().includes(searchLower)) ||
          (location.ADR_ORT && location.ADR_ORT.toLowerCase().includes(searchLower)) ||
          (location.ADR_LND && location.ADR_LND.toLowerCase().includes(searchLower)) ||
          (location.ADR_PLZ && location.ADR_PLZ.toLowerCase().includes(searchLower))
        )
      })
      .sort((a, b) => {
        switch (sortBy) {
          case "name":
            return (a.ADR_NAME1 || "").localeCompare(b.ADR_NAME1 || "")
          case "city":
            return (a.ADR_ORT || "").localeCompare(b.ADR_ORT || "")
          case "country":
            return (a.ADR_LND || "").localeCompare(b.ADR_LND || "")
          default:
            return 0
        }
      })
  }, [allLocations, searchTerm, sortBy])

  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, sortBy])

  const paginatedData = useMemo(() => {
    return paginateLocations(filteredAndSortedLocations, currentPage, PAGE_SIZE)
  }, [filteredAndSortedLocations, currentPage])

  if (loading) {
    return (
      <Card className="w-full">
        <CardContent className="flex items-center justify-center py-12">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
            Loading database locations...
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-semibold text-foreground">Customer Locations Database</CardTitle>
          <Badge variant="secondary" className="text-sm">
            {allLocations.length} total locations
          </Badge>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mt-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by company name, address, city, or country..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as "name" | "city" | "country")}
              className="px-3 py-2 border border-input bg-background rounded-md text-sm"
            >
              <option value="name">Sort by Company</option>
              <option value="city">Sort by City</option>
              <option value="country">Sort by Country</option>
            </select>
          </div>
        </div>

        {filteredAndSortedLocations.length > 0 && (
          <div className="flex items-center justify-between mt-4 pt-4 border-t">
            <div className="text-sm text-muted-foreground">
              Showing {(currentPage - 1) * PAGE_SIZE + 1} to{" "}
              {Math.min(currentPage * PAGE_SIZE, filteredAndSortedLocations.length)} of{" "}
              {filteredAndSortedLocations.length} locations
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {currentPage} of {paginatedData.totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((prev) => Math.min(paginatedData.totalPages, prev + 1))}
                disabled={currentPage === paginatedData.totalPages}
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </CardHeader>

      <CardContent>
        {filteredAndSortedLocations.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            {searchTerm ? "No locations found matching your search." : "No customer locations in database."}
          </div>
        ) : (
          <div className="space-y-4">
            {paginatedData.locations.map((location, index) => (
              <Card
                key={`${location.ADR_NAME1}-${location.ADR_PLZ}-${index}`}
                className="border-l-4 border-l-primary/20"
              >
                <CardContent className="pt-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-5 w-5 text-primary" />
                      <div>
                        <h3 className="font-semibold text-foreground text-lg">
                          {location.ADR_NAME1 || "Unknown Company"}
                        </h3>
                        {location.ADR_NAME2 && <p className="text-sm text-muted-foreground">{location.ADR_NAME2}</p>}
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {location.ADR_LND || "Unknown"}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-start gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground mt-1" />
                      <div className="text-sm">
                        <div className="font-medium text-foreground">{location.ADR_STRASSE || "No street address"}</div>
                        <div className="text-muted-foreground">
                          {location.ADR_ORT || "Unknown city"}, {location.ADR_PLZ || "No postal code"}
                        </div>
                        <div className="text-muted-foreground">{location.ADR_LND || "Unknown country"}</div>
                      </div>
                    </div>

                    <div className="text-sm">
                      <div className="font-medium text-foreground mb-1">GPS Coordinates</div>
                      <div className="text-muted-foreground font-mono">
                        {location.ADR_LONGITUDE2 ? location.ADR_LONGITUDE2.toFixed(4) : "0.0000"},{" "}
                        {location.ADR_LATITUDE2 ? location.ADR_LATITUDE2.toFixed(4) : "0.0000"}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
