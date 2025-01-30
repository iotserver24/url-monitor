"use client"

import { useEffect, useRef, useState } from 'react'
import { Chart } from 'chart.js/auto'
import 'chartjs-adapter-date-fns'
import { enUS } from 'date-fns/locale'

type Log = {
  url_id: string
  url_name: string
  timestamp: string
  uptime: number
  status: 'up' | 'down'
  response_time: number
}

export default function UptimeChart({ urlId }: { urlId: string }) {
  const [logs, setLogs] = useState<Log[]>([])
  const chartRef = useRef<HTMLCanvasElement>(null)
  const chartInstance = useRef<Chart | null>(null)

  useEffect(() => {
    if (!urlId) return
    
    fetch(`/api/urls/${urlId}/logs`, {
      headers: { 'x-is-admin': 'true' }
    })
      .then(res => res.json())
      .then(data => setLogs(data || []))
      .catch(console.error)
  }, [urlId])

  useEffect(() => {
    if (!chartRef.current || !logs?.length) return

    // Destroy existing chart
    if (chartInstance.current) {
      chartInstance.current.destroy()
    }

    const ctx = chartRef.current.getContext('2d')
    if (!ctx) return

    // Create new chart
    chartInstance.current = new Chart(ctx, {
      type: 'line',
      data: {
        datasets: [{
          label: 'Uptime',
          data: logs.map(log => ({
            x: new Date(log.timestamp),
            y: log.uptime,
            status: log.status,
            responseTime: log.response_time
          })),
          borderColor: '#10B981',
          backgroundColor: 'transparent',
          borderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 6,
          pointBackgroundColor: '#10B981',
          tension: 0.4,
          fill: false
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        devicePixelRatio: 2, // Increase resolution
        interaction: {
          intersect: false,
          mode: 'index'
        },
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            backgroundColor: 'white',
            titleColor: '#111827',
            bodyColor: '#111827',
            borderColor: '#E5E7EB',
            borderWidth: 1,
            padding: 12,
            callbacks: {
              title: (items) => {
                if (!items.length) return ''
                const date = new Date(items[0].raw.x)
                return date.toLocaleString('en-US', { 
                  timeZone: 'UTC',
                  dateStyle: 'medium',
                  timeStyle: 'short'
                })
              },
              label: (context) => {
                const point = context.raw as any
                return [
                  `Uptime: ${point.y.toFixed(2)}%`,
                  `Status: ${point.status.toUpperCase()}`,
                  `Response Time: ${point.responseTime}ms`
                ]
              }
            }
          }
        },
        scales: {
          x: {
            type: 'time',
            time: {
              unit: 'hour',
              displayFormats: {
                hour: 'MMM d, HH:mm'
              }
            },
            grid: {
              display: true,
              color: '#E5E7EB',
              drawBorder: false
            },
            ticks: {
              color: '#4B5563',
              font: {
                size: 12,
                weight: '500'
              },
              maxRotation: 0
            },
            adapters: {
              date: {
                locale: enUS
              }
            }
          },
          y: {
            min: 0,
            max: 100,
            grid: {
              display: true,
              color: '#E5E7EB',
              drawBorder: false
            },
            ticks: {
              color: '#4B5563',
              font: {
                size: 12,
                weight: '500'
              },
              callback: (value) => `${value}%`
            }
          }
        }
      }
    })

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy()
      }
    }
  }, [logs])

  if (!logs?.length) {
    return (
      <div className="h-full flex items-center justify-center text-gray-500">
        No data available
      </div>
    )
  }

  return (
    <div className="bg-white p-4 rounded-lg">
      <canvas 
        ref={chartRef} 
        style={{ height: '300px', width: '100%' }}
      />
    </div>
  )
} 