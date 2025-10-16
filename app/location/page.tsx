"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Edit2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { 
  getLocationStatuses, 
  saveLocationStatuses, 
  toggleLocationStatus,
  getAvailableLocations as getAvailableLocationsFromStorage
} from "@/lib/location-storage"

type LocationStatus = "available" | "disabled"

interface LocationItem {
  id: string
  status: LocationStatus
}

export default function LocationPage() {
  const router = useRouter()
  const [editMode, setEditMode] = useState(false)
  const [locationStatuses, setLocationStatuses] = useState<Record<string, LocationStatus>>({})
  
  // Load location statuses from localStorage on mount
  useEffect(() => {
    setLocationStatuses(getLocationStatuses())
  }, [])
  
  const generateLocationRows = () => {
    const letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L']
    return letters
  }
  
  const generateLocationColumns = (letter: string) => {
    // J, K, L only go up to 11, others go up to 28
    const maxNumber = (letter === 'J' || letter === 'K' || letter === 'L') ? 11 : 28
    return Array.from({ length: maxNumber }, (_, i) => i + 1)
  }
  
  const generateLocationGroups = () => {
    const letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L']
    const groups = []
    
    for (let i = 0; i < letters.length; i += 2) {
      groups.push([letters[i], letters[i + 1]].filter(Boolean))
    }
    
    return groups
  }
  
  const handleLocationClick = (locationId: string) => {
    if (editMode) {
      // Toggle status on click and save to localStorage
      const newStatuses = toggleLocationStatus(locationId)
      setLocationStatuses(newStatuses)
    }
  }
  
  const handleEditToggle = () => {
    setEditMode(!editMode)
  }
  
  const letters = generateLocationRows()
  const locationGroups = generateLocationGroups()
  const availableLocations = getAvailableLocationsFromStorage()

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
          <div className="flex flex-wrap gap-12">
            {locationGroups.map((group, groupIndex) => (
              <div key={groupIndex} className="space-y-4">
                <div className="flex gap-4">
                {group.map((letter) => {
                  const columns = generateLocationColumns(letter)
                  return (
                    <div key={letter} className="flex flex-col gap-1">
                      {/* Vertical Location Grid */}
                      {columns.map((num) => {
                        const locationId = `${letter}-${num}`
                        const status = locationStatuses[locationId]
                        
                        return (
                          <button
                            key={locationId}
                            onClick={() => handleLocationClick(locationId)}
                            disabled={!editMode && status === "disabled"}
                            title={locationId}
                            className={`w-16 h-10 border-2 rounded text-xs font-medium transition-colors duration-200 flex items-center justify-center ${
                              status === "available"
                                ? "border-green-300 bg-green-100 text-green-700"
                                : "border-red-300 bg-red-100 text-red-700 cursor-not-allowed"
                            } ${editMode ? "hover:border-blue-500 hover:shadow-md cursor-pointer" : ""}`}
                          >
                            {status === "disabled" ? "✕" : locationId}
                          </button>
                        )
                      })}
                    </div>
                  )
                })}
                </div>
                
                {/* Office box below G, H group (groupIndex 3) */}
                {groupIndex === 3 && (
                  <div className="flex justify-center">
                    <button
                      className="w-36 h-14 border-2 border-purple-300 rounded-lg bg-purple-50 hover:bg-purple-100 hover:border-purple-500 transition-colors duration-200 flex items-center justify-center font-semibold text-purple-700 hover:text-purple-800 text-base"
                    >
                      Office
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

