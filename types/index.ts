export interface LogData {
  _id: string
  urlId: string
  urlName: string
  status: string
  responseTime: number
  statusCode: number
  uptime: number
  timestamp: string
  details: string
}

export interface UrlData {
  _id: string
  name: string
  url: string
  status: string
  uptime: number
  responseTime: number
  lastChecked: string
  downSince?: string
  createdAt: string
  updatedAt: string
} 