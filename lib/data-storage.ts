// In-memory data storage to replace Prisma
type Settings = {
  id: string
  logoUrl: string
  userImage: string
}

type TimesheetEntry = {
  id: string
  date: string
  employeeName: string
  checkInTime: string
  checkOutTime: string
  location: string
  totalHours: number
  createdAt: string
}

type Location = {
  id: string
  status: string
}

type Schedule = {
  id: string
  date: string
  appointmentTime: string
  locationId: string
  clientName: string
  phoneNumber: string
  serviceType: string
  notes?: string
  createdAt: string
}

class InMemoryStorage {
  private settings: Settings = {
    id: 'settings',
    logoUrl: '',
    userImage: ''
  }
  
  private timesheets: TimesheetEntry[] = []
  private locations: Location[] = []
  private schedules: Schedule[] = []

  // Settings
  getSettings(): Settings {
    return { ...this.settings }
  }

  updateSettings(data: Partial<Settings>): Settings {
    this.settings = { ...this.settings, ...data }
    return { ...this.settings }
  }

  // Timesheets
  getTimesheets(date?: string): TimesheetEntry[] {
    if (date) {
      return this.timesheets.filter(t => t.date === date)
    }
    return [...this.timesheets]
  }

  createTimesheet(data: Omit<TimesheetEntry, 'id' | 'createdAt'>): TimesheetEntry {
    const entry: TimesheetEntry = {
      ...data,
      id: `ts_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString()
    }
    this.timesheets.push(entry)
    return entry
  }

  updateTimesheet(id: string, data: Partial<TimesheetEntry>): TimesheetEntry | null {
    const index = this.timesheets.findIndex(t => t.id === id)
    if (index === -1) return null
    
    this.timesheets[index] = { ...this.timesheets[index], ...data }
    return { ...this.timesheets[index] }
  }

  deleteTimesheet(id: string): boolean {
    const index = this.timesheets.findIndex(t => t.id === id)
    if (index === -1) return false
    
    this.timesheets.splice(index, 1)
    return true
  }

  // Locations
  getLocations(): Location[] {
    return [...this.locations]
  }

  initializeLocations(locations: Location[]): void {
    // Upsert logic
    locations.forEach(loc => {
      const index = this.locations.findIndex(l => l.id === loc.id)
      if (index >= 0) {
        this.locations[index] = loc
      } else {
        this.locations.push(loc)
      }
    })
  }

  updateLocation(id: string, status: string): Location {
    const index = this.locations.findIndex(l => l.id === id)
    if (index >= 0) {
      this.locations[index].status = status
      return { ...this.locations[index] }
    } else {
      const newLocation = { id, status }
      this.locations.push(newLocation)
      return newLocation
    }
  }

  // Schedules
  getSchedules(date?: string): Schedule[] {
    if (date) {
      return this.schedules
        .filter(s => s.date === date)
        .sort((a, b) => a.appointmentTime.localeCompare(b.appointmentTime))
    }
    return [...this.schedules].sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
  }

  createSchedules(schedules: Omit<Schedule, 'id' | 'createdAt'>[]): number {
    if (schedules.length === 0) return 0

    // Delete existing schedules for the date
    const date = schedules[0].date
    this.schedules = this.schedules.filter(s => s.date !== date)

    // Create new schedules
    schedules.forEach(schedule => {
      const newSchedule: Schedule = {
        ...schedule,
        id: `sch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date().toISOString()
      }
      this.schedules.push(newSchedule)
    })

    return schedules.length
  }

  updateSchedule(id: string, data: Partial<Schedule>): Schedule | null {
    const index = this.schedules.findIndex(s => s.id === id)
    if (index === -1) return null
    
    this.schedules[index] = { ...this.schedules[index], ...data }
    return { ...this.schedules[index] }
  }

  deleteSchedule(id: string): boolean {
    const index = this.schedules.findIndex(s => s.id === id)
    if (index === -1) return false
    
    this.schedules.splice(index, 1)
    return true
  }
}

// Global singleton instance
const globalForStorage = globalThis as unknown as {
  storage: InMemoryStorage | undefined
}

export const storage = globalForStorage.storage ?? new InMemoryStorage()

if (process.env.NODE_ENV !== 'production') {
  globalForStorage.storage = storage
}

