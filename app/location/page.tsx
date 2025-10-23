"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Edit2 } from "lucide-react"
import { useRouter } from "next/navigation"

type LocationStatus = "available" | "disabled"

interface LocationItem {
  id: string
  status: string
  createdAt?: string
  updatedAt?: string
}

export default function LocationPage() {
  const router = useRouter()
  const [editMode, setEditMode] = useState(false)
  const [locationStatuses, setLocationStatuses] = useState<Record<string, LocationStatus>>({})
  const [isLoading, setIsLoading] = useState(true)
  
  // Load location statuses from API on mount
  useEffect(() => {
    fetchLocations()
  }, [])
  
  const fetchLocations = async () => {
    try {
      const response = await fetch('/api/location')
      const data: LocationItem[] = await response.json()
      
      // Convert array to Record<string, LocationStatus>
      const statuses: Record<string, LocationStatus> = {}
      data.forEach(loc => {
        statuses[loc.id] = loc.status as LocationStatus
      })
      
      setLocationStatuses(statuses)
      setIsLoading(false)
    } catch (error) {
      console.error('Error fetching locations:', error)
      setIsLoading(false)
    }
  }
  
  const initializeAllLocations = async () => {
    const letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L']
    const allLocations: { id: string; status: string }[] = []
    
    letters.forEach(letter => {
      const maxNumber = (letter === 'J' || letter === 'K' || letter === 'L') ? 11 : 28
      for (let i = 1; i <= maxNumber; i++) {
        allLocations.push({
          id: `${letter}-${i}`,
          status: 'available'
        })
      }
    })
    
    // Add stage location
    allLocations.push({ id: 'stage', status: 'available' })
    
    try {
      await fetch('/api/location', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ locations: allLocations })
      })
      
      await fetchLocations()
    } catch (error) {
      console.error('Error initializing locations:', error)
    }
  }
  
  useEffect(() => {
    if (!isLoading && Object.keys(locationStatuses).length === 0) {
      initializeAllLocations()
    }
  }, [isLoading, locationStatuses])
  
  const generateLocationRows = () => {
    const letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L']
    return letters
  }
  
  const generateLocationColumns = (letter: string) => {
    // J, K, L only go up to 11, others go up to 28
    const maxNumber = (letter === 'J' || letter === 'K' || letter === 'L') ? 11 : 28
    return Array.from({ length: maxNumber }, (_, i) => i + 1)
  }
  
  const generateLocationLetters = () => {
    return ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L']
  }
  
  const handleLocationClick = async (locationId: string) => {
    if (editMode) {
      // Toggle status and save to API
      const currentStatus = locationStatuses[locationId]
      const newStatus = currentStatus === 'available' ? 'disabled' : 'available'
      
      try {
        await fetch('/api/location', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: locationId,
            status: newStatus
          })
        })
        
        // Update local state
        setLocationStatuses(prev => ({
          ...prev,
          [locationId]: newStatus
        }))
      } catch (error) {
        console.error('Error updating location:', error)
      }
    }
  }
  
  const handleEditToggle = () => {
    setEditMode(!editMode)
  }
  
  const letters = generateLocationLetters()
  const availableLocations = Object.keys(locationStatuses).filter(
    id => locationStatuses[id] === 'available'
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <h1 className="text-3xl font-bold text-foreground">Location Map</h1>
      </div>

      {/* Location Available Section */}
      <Card>
        <CardHeader>
          <CardTitle>Location Available</CardTitle>
          <CardDescription>Available locations shown in green below</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {availableLocations.map((location) => (
              <div
                key={location}
                className="px-3 py-1.5 bg-green-100 text-green-700 border border-green-300 rounded-md text-sm font-medium"
              >
                {location}
              </div>
            ))}
            {availableLocations.length === 0 && (
              <div className="text-center py-4 text-muted-foreground w-full">
                No available locations
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Location Map */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Location Map</CardTitle>
              <CardDescription>
                {editMode 
                  ? "Edit mode: Click on a location to change its status" 
                  : "View all locations (A-1 to L-28)"
                }
              </CardDescription>
            </div>
            <Button
              onClick={handleEditToggle}
              variant={editMode ? "default" : "outline"}
              size="sm"
            >
              <Edit2 className="h-4 w-4 mr-2" />
              {editMode ? "Exit Edit" : "Edit"}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-8">
            {/* First row: Location columns A-L */}
            <div className="flex flex-wrap items-start">
              {letters.map((letter, index) => {
                const columns = generateLocationColumns(letter)
                // A,B 띄움(index 0,1), B,C 붙음(index 1,2), C,D 띄움(index 2,3), D,E 붙음(index 3,4)...
                // 홀수 인덱스(B,D,F,H,J,L)는 왼쪽 마진 있음 (띄움)
                // 짝수 인덱스(A,C,E,G,I,K)는 왼쪽 마진 없음 (붙임, 단 A는 첫번째라 상관없음)
                const hasLeftMargin = index % 2 === 1
                
                return (
                  <div key={letter} className="flex flex-col items-center">
                    <div 
                      className={`flex flex-col gap-1 ${hasLeftMargin ? 'ml-8' : ''}`}
                    >
                      {/* Location Cells */}
                      {columns.map((num) => {
                        const locationId = `${letter}-${num}`
                        const status = locationStatuses[locationId]
                        
                        return (
                          <button
                            key={locationId}
                            onClick={() => handleLocationClick(locationId)}
                            disabled={!editMode && status === "disabled"}
                            title={locationId}
                            className={`w-20 h-10 border-2 rounded text-xs font-semibold transition-colors duration-200 flex items-center justify-center relative ${
                              status === "available"
                                ? "border-green-300 bg-green-100 text-green-700"
                                : "border-red-300 bg-red-100 text-red-700 cursor-not-allowed"
                            } ${editMode ? "hover:border-blue-500 hover:shadow-md cursor-pointer" : ""}`}
                          >
                            <span className={status === "disabled" ? "line-through decoration-2" : ""}>
                              {locationId}
                            </span>
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>
            
            {/* Office box below G, H columns */}
            <div className="flex">
              {/* Spacer for A-F columns (6 columns * 20px + 4 gaps * 32px = 248px) */}
              <div style={{ width: 'calc(6 * 80px + 3 * 32px)' }} />
              
              {/* Office positioned below G, H */}
              <div className="flex justify-center" style={{ width: 'calc(2 * 80px + 32px)' }}>
                <button
                  className="w-32 h-14 border-2 border-purple-300 rounded-lg bg-purple-50 hover:bg-purple-100 hover:border-purple-500 transition-colors duration-200 flex items-center justify-center font-semibold text-purple-700 hover:text-purple-800 text-base"
                >
                  Office
                </button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

