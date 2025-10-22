"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

interface ScanItem {
  id: string
  itemNumber: string
  quantity: number
  timestamp: string
}

export default function PwsScanComparePage() {
  const router = useRouter()
  const [scanInput, setScanInput] = useState<string>("")
  const [scannedItems, setScannedItems] = useState<ScanItem[]>([])

  const handleScan = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!scanInput.trim()) {
      return
    }

    // Add scanned item to the list
    const newItem: ScanItem = {
      id: Date.now().toString(),
      itemNumber: scanInput.trim(),
      quantity: 1,
      timestamp: new Date().toLocaleString()
    }

    setScannedItems(prev => {
      // Check if item already exists
      const existingIndex = prev.findIndex(item => item.itemNumber === newItem.itemNumber)
      if (existingIndex !== -1) {
        // Increment quantity if exists
        const updated = [...prev]
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + 1,
          timestamp: new Date().toLocaleString()
        }
        return updated
      }
      // Add new item
      return [...prev, newItem]
    })

    // Clear input
    setScanInput("")
  }

  const handleClearAll = () => {
    if (confirm('Are you sure you want to clear all scanned items?')) {
      setScannedItems([])
    }
  }

  const handleRemoveItem = (id: string) => {
    setScannedItems(prev => prev.filter(item => item.id !== id))
  }

  const totalItems = scannedItems.reduce((sum, item) => sum + item.quantity, 0)

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
        <h1 className="text-3xl font-bold text-foreground">PWS Scan Compare</h1>
      </div>

      {/* Scan Input Section */}
      <Card>
        <CardHeader>
          <CardTitle>Scan Items</CardTitle>
          <CardDescription>
            Scan barcodes to add items to the comparison list
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleScan} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="scanInput" className="text-lg font-semibold">
                Barcode / Item Number
              </Label>
              <Input
                id="scanInput"
                type="text"
                placeholder="Scan or enter item number..."
                value={scanInput}
                onChange={(e) => setScanInput(e.target.value)}
                className="text-xl h-14 text-center font-mono"
                autoFocus
              />
            </div>

            <div className="flex gap-4">
              <Button
                type="submit"
                size="lg"
                className="flex-1 h-12 text-lg"
              >
                Add Item
              </Button>
              <Button
                type="button"
                variant="outline"
                size="lg"
                onClick={handleClearAll}
                className="h-12"
                disabled={scannedItems.length === 0}
              >
                Clear All
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Summary Section */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <p className="text-sm text-gray-600">Total Items</p>
              <p className="text-3xl font-bold text-blue-900">{totalItems}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Unique Items</p>
              <p className="text-3xl font-bold text-blue-900">{scannedItems.length}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Scanned Items Table */}
      {scannedItems.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Scanned Items</CardTitle>
            <CardDescription>
              List of all scanned items with quantities
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item Number</TableHead>
                    <TableHead className="text-center">Quantity</TableHead>
                    <TableHead>Last Scanned</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {scannedItems.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-mono font-medium">
                        {item.itemNumber}
                      </TableCell>
                      <TableCell className="text-center">
                        <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 text-blue-800 font-bold">
                          {item.quantity}
                        </span>
                      </TableCell>
                      <TableCell className="text-sm text-gray-600">
                        {item.timestamp}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveItem(item.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          Remove
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {scannedItems.length === 0 && (
        <Card>
          <CardContent className="py-12">
            <div className="text-center text-gray-500">
              <p className="text-lg font-medium mb-2">No items scanned yet</p>
              <p className="text-sm">Start scanning items to build your comparison list</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}



