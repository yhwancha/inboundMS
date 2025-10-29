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

  // API에서 스케줄 리스트 불러오기
  useEffect(() => {
    const loadScheduleList = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/schedule')
        const schedules = await response.json()
        
        // 날짜별로 그룹화
        const dateGroups: { [key: string]: any[] } = {}
        schedules.forEach((schedule: any) => {
          if (!dateGroups[schedule.date]) {
            dateGroups[schedule.date] = []
          }
          dateGroups[schedule.date].push(schedule)
        })
        
        // ScheduleListItem 형식으로 변환
        const list: ScheduleListItem[] = Object.entries(dateGroups).map(([date, items]) => {
          // 가장 최근 업데이트 시간 찾기
          const latestUpdate = items.reduce((latest, item) => {
            const itemDate = new Date(item.updatedAt)
            return itemDate > latest ? itemDate : latest
          }, new Date(items[0].updatedAt))
          
          return {
            date: format(new Date(date), 'MM/dd/yyyy'),
            count: items.length,
            lastUpdated: format(latestUpdate, 'MM/dd/yyyy, hh:mm a')
          }
        })
        
        // 날짜순 정렬 (최신순)
        list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        
        setScheduleList(list)
      } catch (error) {
        console.error('Error loading schedule list:', error)
        setScheduleList([])
      } finally {
        setLoading(false)
      }
    }

    loadScheduleList()
  }, [])

  const handleViewSchedule = (date: string) => {
    // 날짜를 쿼리 파라미터로 전달하여 Schedule 페이지로 이동
    const [month, day, year] = date.split('/')
    const isoDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day)).toISOString().split('T')[0]
    
    router.push(`/schedule?date=${isoDate}`)
  }

  const handleDeleteSchedule = async (date: string) => {
    if (confirm(`정말로 ${date}의 스케줄 데이터를 삭제하시겠습니까?`)) {
      try {
        // 날짜를 ISO 형식으로 변환
        const [month, day, year] = date.split('/')
        const isoDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day)).toISOString().split('T')[0]
        
        // API에서 해당 날짜의 모든 스케줄 조회
        const response = await fetch(`/api/schedule?date=${isoDate}`)
        const schedules = await response.json()
        
        // 각 스케줄 삭제
        await Promise.all(
          schedules.map((schedule: any) =>
            fetch(`/api/schedule/${schedule.id}`, { method: 'DELETE' })
          )
        )
        
        // 로컬 상태에서 제거
        const updatedList = scheduleList.filter(item => item.date !== date)
        setScheduleList(updatedList)
      } catch (error) {
        console.error('Error deleting schedules:', error)
        alert('스케줄 삭제 중 오류가 발생했습니다.')
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
