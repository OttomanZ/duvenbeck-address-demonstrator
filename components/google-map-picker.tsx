"use client"

import type React from "react"

import { useEffect, useRef, useState } from "react"
import { MapPin } from "lucide-react"

interface GoogleMapPickerProps {
  latitude?: string
  longitude?: string
  onLocationSelect: (lat: number, lng: number) => void
  className?: string
}

export function GoogleMapPicker({ latitude, longitude, onLocationSelect, className }: GoogleMapPickerProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const [markerPosition, setMarkerPosition] = useState<{ lat: number; lng: number } | null>(null)

  useEffect(() => {
    if (latitude && longitude) {
      setMarkerPosition({
        lat: Number.parseFloat(latitude),
        lng: Number.parseFloat(longitude),
      })
    }
  }, [latitude, longitude])

  const handleMapClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!mapRef.current) return

    const rect = mapRef.current.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top

    // Convert pixel coordinates to lat/lng (mock conversion for demo)
    // Germany bounds: lat 47.3-55.1, lng 5.9-15.0
    const lat = 55.1 - (y / rect.height) * (55.1 - 47.3)
    const lng = 5.9 + (x / rect.width) * (15.0 - 5.9)

    setMarkerPosition({ lat, lng })
    onLocationSelect(lat, lng)
  }

  return (
    <div className={`relative ${className}`}>
      <div
        ref={mapRef}
        className="w-full h-full rounded-lg bg-gradient-to-br from-green-100 via-blue-50 to-green-200 cursor-crosshair relative overflow-hidden border-2 border-gray-200"
        onClick={handleMapClick}
        style={{
          backgroundImage: `
            linear-gradient(rgba(34, 197, 94, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(34, 197, 94, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: "20px 20px",
        }}
      >
        {/* Mock road lines */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-0 right-0 h-0.5 bg-gray-400 opacity-30"></div>
          <div className="absolute top-2/3 left-0 right-0 h-0.5 bg-gray-400 opacity-30"></div>
          <div className="absolute left-1/3 top-0 bottom-0 w-0.5 bg-gray-400 opacity-30"></div>
          <div className="absolute left-2/3 top-0 bottom-0 w-0.5 bg-gray-400 opacity-30"></div>
        </div>

        {/* Mock cities */}
        <div className="absolute top-1/4 left-1/3 w-2 h-2 bg-gray-600 rounded-full"></div>
        <div className="absolute top-2/3 left-2/3 w-2 h-2 bg-gray-600 rounded-full"></div>
        <div className="absolute top-1/2 left-1/2 w-3 h-3 bg-red-600 rounded-full"></div>

        {markerPosition && (
          <div
            className="absolute transform -translate-x-1/2 -translate-y-full"
            style={{
              left: `${((markerPosition.lng - 5.9) / (15.0 - 5.9)) * 100}%`,
              top: `${((55.1 - markerPosition.lat) / (55.1 - 47.3)) * 100}%`,
            }}
          >
            <MapPin className="h-6 w-6 text-red-600 drop-shadow-lg" fill="currentColor" />
          </div>
        )}
      </div>

      <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-3 py-2 rounded-lg shadow-md text-sm text-gray-600">
        <MapPin className="h-4 w-4 inline mr-1" />
        Click on map to set location
      </div>

      {markerPosition && (
        <div className="absolute bottom-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-2 rounded-lg shadow-md text-sm text-gray-600">
          <div className="font-mono">
            {markerPosition.lat.toFixed(4)}, {markerPosition.lng.toFixed(4)}
          </div>
        </div>
      )}
    </div>
  )
}
