type LocationStatus = "available" | "disabled"

const LOCATION_STORAGE_KEY = "location_statuses"

export function initializeLocations(): Record<string, LocationStatus> {
  const locations: Record<string, LocationStatus> = {}
  const letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L']
  
  letters.forEach(letter => {
    // J, K, L only go up to 11, others go up to 28
    const maxNumber = (letter === 'J' || letter === 'K' || letter === 'L') ? 11 : 28
    
    for (let i = 1; i <= maxNumber; i++) {
      const locationId = `${letter}-${i}`
      // Only A-23 is available, rest are disabled
      if (locationId === 'A-23') {
        locations[locationId] = "available"
      } else {
        locations[locationId] = "disabled"
      }
    }
  })
  
  return locations
}

export function getLocationStatuses(): Record<string, LocationStatus> {
  if (typeof window === 'undefined') return initializeLocations()
  
  try {
    const stored = localStorage.getItem(LOCATION_STORAGE_KEY)
    if (stored) {
      return JSON.parse(stored)
    }
  } catch (error) {
    console.error('Error loading location statuses:', error)
  }
  
  return initializeLocations()
}

export function saveLocationStatuses(statuses: Record<string, LocationStatus>) {
  if (typeof window === 'undefined') return
  
  try {
    localStorage.setItem(LOCATION_STORAGE_KEY, JSON.stringify(statuses))
  } catch (error) {
    console.error('Error saving location statuses:', error)
  }
}

export function getAvailableLocations(): string[] {
  const statuses = getLocationStatuses()
  return Object.entries(statuses)
    .filter(([_, status]) => status === "available")
    .map(([id, _]) => id)
    .sort()
}

export function toggleLocationStatus(locationId: string): Record<string, LocationStatus> {
  const statuses = getLocationStatuses()
  const newStatuses = {
    ...statuses,
    [locationId]: statuses[locationId] === "available" ? "disabled" : "available"
  }
  saveLocationStatuses(newStatuses)
  return newStatuses
}

export function resetLocations(): Record<string, LocationStatus> {
  const newStatuses = initializeLocations()
  saveLocationStatuses(newStatuses)
  return newStatuses
}

