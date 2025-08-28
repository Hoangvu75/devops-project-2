'use client'

import { useState, useEffect } from 'react'
import { Bell, RefreshCw, Mail, Clock, CheckCircle, XCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import { notificationService, Notification } from '@/lib/api'
import { formatDate, getStatusColor, getStatusText } from '@/lib/utils'

interface NotificationListProps {
  refreshTrigger: number
}

export default function NotificationList({ refreshTrigger }: NotificationListProps) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const fetchNotifications = async () => {
    setIsLoading(true)
    try {
      const data = await notificationService.getAllNotifications()
      // Sắp xếp theo thời gian tạo mới nhất
      const sortedData = data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      setNotifications(sortedData)
    } catch (error) {
      console.error('Error fetching notifications:', error)
      toast.error('Không thể tải danh sách thông báo')
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'sent':
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-600" />
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-600" />
      default:
        return <Bell className="w-4 h-4 text-gray-600" />
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'email':
        return <Mail className="w-4 h-4 text-blue-600" />
      case 'sms':
        return <Bell className="w-4 h-4 text-green-600" />
      case 'push':
        return <Bell className="w-4 h-4 text-purple-600" />
      default:
        return <Bell className="w-4 h-4 text-gray-600" />
    }
  }

  useEffect(() => {
    fetchNotifications()
  }, [refreshTrigger])

  if (isLoading && notifications.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Đang tải danh sách thông báo...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-md">
      <div className="flex items-center justify-between p-6 border-b border-gray-200">
        <div className="flex items-center">
          <Bell className="w-6 h-6 text-blue-600 mr-2" />
          <h2 className="text-xl font-semibold text-gray-900">
            Thông báo ({notifications.length})
          </h2>
        </div>
        <button
          onClick={fetchNotifications}
          disabled={isLoading}
          className="flex items-center px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
          Làm mới
        </button>
      </div>

      {notifications.length === 0 ? (
        <div className="p-12 text-center">
          <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">Chưa có thông báo nào</p>
          <p className="text-gray-400 text-sm mt-2">Thông báo sẽ xuất hiện khi có đơn hàng mới</p>
        </div>
      ) : (
        <div className="divide-y divide-gray-200">
          {notifications.map((notification) => (
            <div key={notification.id} className="p-6 hover:bg-gray-50 transition-colors">
              <div className="flex items-start space-x-4">
                {/* Icon */}
                <div className="flex-shrink-0 mt-1">
                  {getTypeIcon(notification.type)}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium text-gray-900 truncate">
                      {notification.subject}
                    </h3>
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(notification.status)}
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(notification.status)}`}>
                        {getStatusText(notification.status)}
                      </span>
                    </div>
                  </div>

                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {notification.message}
                  </p>

                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center space-x-4">
                      <span>Đến: {notification.recipient}</span>
                      {notification.orderId && (
                        <span>Đơn hàng: #{notification.orderId.slice(-8).toUpperCase()}</span>
                      )}
                    </div>
                    <div className="flex items-center space-x-4">
                      <span>Tạo: {formatDate(notification.createdAt)}</span>
                      {notification.sentAt && (
                        <span>Gửi: {formatDate(notification.sentAt)}</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
} 