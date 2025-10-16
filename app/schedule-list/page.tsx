"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Calendar, Eye } from "lucide-react"
import { useRouter } from "next/navigation"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { format } from "date-fns"

interface ScheduleListItem {
  date: string
  count: number
  lastUpdated: string
}

export default function ScheduleListPage() {
  const router = useRouter()
  const [scheduleList, setScheduleList] = useState<ScheduleListItem[]>([])
  const [loading, setLoading] = useState(true)

  // localStorage에서 스케줄 리스트 불러오기
  useEffect(() => {
    const loadScheduleList = () => {
      try {
        setLoading(true)
        const storedList = localStorage.getItem('scheduleList')
        
        if (storedList) {
          const parsedList = JSON.parse(storedList)
          
          // 각 날짜별로 실제 데이터 개수 확인
          const updatedList = parsedList.map((item: ScheduleListItem) => {
            const actualData = localStorage.getItem(`confirmedScheduleData_${item.date}`)
            if (actualData) {
              const parsedData = JSON.parse(actualData)
              return {
                ...item,
                count: parsedData.length // 실제 데이터 개수로 업데이트
              }
            }
            return item
          })
          
          setScheduleList(updatedList)
        } else {
          // 샘플 데이터 (개발용)
          setScheduleList([
            {
              date: "10/15/2025",
              count: 5,
              lastUpdated: "10/15/2025 09:30"
            },
            {
              date: "10/16/2025", 
              count: 8,
              lastUpdated: "10/16/2025 14:20"
            },
            {
              date: "10/17/2025",
              count: 3,
              lastUpdated: "10/17/2025 11:45"
            }
          ])
        }
      } catch (error) {
        console.error('Error loading schedule list:', error)
      } finally {
        setLoading(false)
      }
    }

    loadScheduleList()
  }, [])

  const handleViewSchedule = (date: string) => {
    // 선택한 날짜의 스케줄 데이터를 불러와서 현재 선택된 데이터로 설정
    const confirmedData = localStorage.getItem(`confirmedScheduleData_${date}`)
    if (confirmedData) {
      // 현재 선택된 데이터로 설정
      localStorage.setItem('confirmedScheduleData', confirmedData)
      
      // 날짜를 ISO 형식으로 변환하여 저장
      const [month, day, year] = date.split('/')
      const isoDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day)).toISOString()
      localStorage.setItem('confirmedScheduleDate', isoDate)
    }
    
    router.push('/schedule')
  }

  const handleDeleteSchedule = (date: string) => {
    if (confirm(`정말로 ${date}의 스케줄 데이터를 삭제하시겠습니까?`)) {
      // 리스트에서 제거
      const updatedList = scheduleList.filter(item => item.date !== date)
      setScheduleList(updatedList)
      localStorage.setItem('scheduleList', JSON.stringify(updatedList))
      
      // 해당 날짜의 데이터 삭제
      localStorage.removeItem(`confirmedScheduleData_${date}`)
      
      // 만약 현재 선택된 날짜라면 confirmedScheduleData도 삭제
      const confirmedDate = localStorage.getItem('confirmedScheduleDate')
      if (confirmedDate) {
        const confirmedDateStr = format(new Date(confirmedDate), 'MM/dd/yyyy')
        if (confirmedDateStr === date) {
          localStorage.removeItem('confirmedScheduleData')
          localStorage.removeItem('confirmedScheduleDate')
        }
      }
    }
  }

  if (loading) {
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
          <h1 className="text-3xl font-bold text-foreground">Schedule List</h1>
        </div>
        <div className="flex items-center justify-center py-8">
          <p className="text-muted-foreground">로딩 중...</p>
        </div>
      </div>
    )
  }

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
        <h1 className="text-3xl font-bold text-foreground">Schedule List</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Confirmed Schedules
          </CardTitle>
          <CardDescription>
            확인된 스케줄 데이터 목록입니다. 날짜를 클릭하여 해당 스케줄을 확인할 수 있습니다.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {scheduleList.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">확인된 스케줄 데이터가 없습니다.</p>
              <p className="text-sm text-muted-foreground mt-2">
                Manage Schedule에서 데이터를 확인해주세요.
              </p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Items Count</TableHead>
                    <TableHead>Last Updated</TableHead>
                    <TableHead className="text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {scheduleList.map((item, index) => (
                    <TableRow 
                      key={index}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => handleViewSchedule(item.date)}
                    >
                      <TableCell className="font-medium">
                        {item.date}
                      </TableCell>
                      <TableCell>
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-md text-sm font-medium">
                          {item.count} items
                        </span>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {item.lastUpdated}
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleViewSchedule(item.date)
                            }}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDeleteSchedule(item.date)
                            }}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            Delete
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
