"use client"

import { useEffect, useRef, useState } from "react"
import { MapPin } from "lucide-react"

interface LeafletMapPickerProps {
  latitude?: string
  longitude?: string
  onLocationSelect: (lat: number, lng: number) => void
  className?: string
}

export function LeafletMapPicker({ latitude, longitude, onLocationSelect, className }: LeafletMapPickerProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const [map, setMap] = useState<any>(null)
  const [marker, setMarker] = useState<any>(null)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    // Load Leaflet CSS and JS
    const loadLeaflet = async () => {
      if (typeof window === "undefined" || typeof document === "undefined") return

      // Load CSS
      if (!document.querySelector('link[href*="leaflet.css"]')) {
        const link = document.createElement("link")
        link.rel = "stylesheet"
        link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
        if (document.head) {
          document.head.appendChild(link)
        }
      }

      // Load JS
      if (!(window as any).L) {
        const script = document.createElement("script")
        script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"
        script.onload = () => setIsLoaded(true)
        if (document.head) {
          document.head.appendChild(script)
        }
      } else {
        setIsLoaded(true)
      }
    }

    loadLeaflet()
  }, [])

  useEffect(() => {
    if (!isLoaded || !mapRef.current || map || typeof window === "undefined") return

    const L = (window as any).L
    if (!L) return

    let newMap: any

    try {
      // Initialize map centered on Germany
      newMap = L.map(mapRef.current).setView([51.1657, 10.4515], 6)

      // Add OpenStreetMap tiles
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors",
      }).addTo(newMap)

      setMap(newMap)
    } catch (error) {
      console.error("Error initializing map:", error)
    }

    return () => {
      if (newMap) {
        try {
          newMap.remove()
        } catch (error) {
          console.error("Error removing map:", error)
        }
      }
    }
  }, [isLoaded])

  useEffect(() => {
    if (!latitude || !longitude) return

    const lat = Number.parseFloat(latitude)
    const lng = Number.parseFloat(longitude)

    if (isNaN(lat) || isNaN(lng)) return

    const updateMarker = () => {
      try {
        const L = (window as any).L
        if (!L || !map) return

        if (!map._container || !map._loaded || !mapRef.current) {
          console.log("[v0] Map not ready, retrying...")
          setTimeout(updateMarker, 100)
          return
        }

        if (marker) {
          try {
            map.removeLayer(marker)
          } catch (error) {
            console.log("[v0] Error removing marker:", error)
          }
        }

        try {
          const newMarker = L.marker([lat, lng])
          newMarker.addTo(map)
          setMarker(newMarker)

          map.setView([lat, lng], 10)
          console.log("[v0] Marker updated successfully")
        } catch (error) {
          console.log("[v0] Error adding marker:", error)
        }
      } catch (error) {
        console.log("[v0] Error in updateMarker:", error)
      }
    }

    if (map) {
      updateMarker()
    }
  }, [map, latitude, longitude])

  if (!isLoaded) {
    return (
      <div className={`${className} flex items-center justify-center bg-gray-100 rounded-xl`}>
        <div className="text-center">
          <MapPin className="h-8 w-8 text-gray-400 mx-auto mb-2" />
          <p className="text-gray-500">Loading map...</p>
        </div>
      </div>
    )
  }

  return (
    <div className={className}>
      <div ref={mapRef} className="w-full h-full rounded-xl" />
    </div>
  )
}
