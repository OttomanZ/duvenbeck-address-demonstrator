"use client"

import { useState, useEffect } from "react"
import { CustomerLocationForm } from "@/components/customer-location-form"
import { CustomerLocationList } from "@/components/customer-location-list"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Building2, Database, Shield } from "lucide-react"
import Image from "next/image"
import { useToast } from "@/hooks/use-toast"

export default function Home() {
  const [databaseCount, setDatabaseCount] = useState<number>(15) // Start with placeholder
  const [isLoadingCount, setIsLoadingCount] = useState<boolean>(true)
  const { toast } = useToast()

  const handleLocationSubmit = (location: any) => {
    console.log("[v0] Location submitted:", location)
    toast({
      variant: "success",
      title: "Location Processed",
      description: "The location has been successfully added to the system.",
    })
  }

  useEffect(() => {
    const fetchDatabaseCount = async () => {
      try {
        const response = await fetch(
          "https://depending-affiliates-suitable-perfume.trycloudflare.com/address-database",
          {
            method: "GET",
            headers: {
              accept: "application/json",
            },
            signal: AbortSignal.timeout(10000),
          },
        )

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const data = await response.json()
        setDatabaseCount(data.length)
        setIsLoadingCount(false)
      } catch (error) {
        console.error("Failed to fetch database count:", error)
        // Keep showing placeholder count on error - no user notification needed
        setIsLoadingCount(false)
      }
    }

    fetchDatabaseCount()
  }, [])

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-3">
              <Image
                src="/images/duvenbeck-logo.png"
                alt="Duvenbeck Logo"
                width={48}
                height={48}
                className="rounded-md"
              />
              <div className="flex items-center gap-2">
                <div>
                  <h1 className="text-2xl font-bold text-foreground">Duvenbeck Location Manager</h1>
                  <p className="text-sm text-muted-foreground">Technology Demonstrator - Duplicate Prevention System</p>
                </div>
              </div>
            </div>
            <div className="ml-auto flex items-center gap-2">
              <Shield className="h-5 w-5 text-green-600" />
              <span className="text-sm font-medium text-green-600">Duplicate Detection Active</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="add" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="add" className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Search Location
            </TabsTrigger>
            <TabsTrigger value="list" className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              View Database ({isLoadingCount ? "..." : databaseCount})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="add" className="flex justify-center">
            <CustomerLocationForm onSubmit={handleLocationSubmit} />
          </TabsContent>

          <TabsContent value="list">
            <CustomerLocationList />
          </TabsContent>
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="border-t bg-muted/30 mt-16">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col items-center justify-center text-center space-y-2">
            <div className="text-sm text-muted-foreground">
              Duvenbeck & AlfGlobal (C) 2025 - Powered by DocwynMatch™
            </div>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span>Duplicate Prevention: Active</span>
              <span>Database: {isLoadingCount ? "Loading..." : `${databaseCount} locations`}</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
