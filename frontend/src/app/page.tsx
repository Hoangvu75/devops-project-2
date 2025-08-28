'use client'

import { useState } from 'react'
import CreateOrderForm from '@/components/CreateOrderForm'
import OrderList from '@/components/OrderList'
import NotificationList from '@/components/NotificationList'

export default function HomePage() {
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  const handleOrderCreated = () => {
    // Trigger refresh for both order list and notification list
    setRefreshTrigger(prev => prev + 1)
  }

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="text-center py-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Chào mừng đến với Hệ thống Quản lý Đơn hàng
        </h1>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
          Hệ thống microservices được xây dựng với NestJS, Apache Kafka và NextJS. 
          Tạo đơn hàng và theo dõi thông báo được gửi tự động qua email.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">Order Service</p>
              <p className="text-2xl font-bold">Port 3001</p>
            </div>
            <div className="bg-blue-400 bg-opacity-30 rounded-full p-3">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"/>
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium">Notification Service</p>
              <p className="text-2xl font-bold">Port 3002</p>
            </div>
            <div className="bg-green-400 bg-opacity-30 rounded-full p-3">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 2L3 7v11c0 .55.45 1 1 1h3v-6h6v6h3c.55 0 1-.45 1-1V7l-7-5z"/>
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm font-medium">Apache Kafka</p>
              <p className="text-2xl font-bold">Port 9092</p>
            </div>
            <div className="bg-purple-400 bg-opacity-30 rounded-full p-3">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd"/>
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Left Column - Create Order Form */}
        <div>
          <CreateOrderForm onOrderCreated={handleOrderCreated} />
        </div>

        {/* Right Column - Order List */}
        <div>
          <OrderList refreshTrigger={refreshTrigger} />
        </div>
      </div>

      {/* Notification List - Full Width */}
      <div>
        <NotificationList refreshTrigger={refreshTrigger} />
      </div>

      {/* Footer */}
      <footer className="text-center py-8 border-t border-gray-200 mt-16">
        <p className="text-gray-500 text-sm">
          Hệ thống Microservices với NestJS + Apache Kafka + NextJS
        </p>
        <p className="text-gray-400 text-xs mt-2">
          Được xây dựng với ❤️ để demo kiến trúc microservices
        </p>
      </footer>
    </div>
  )
} 