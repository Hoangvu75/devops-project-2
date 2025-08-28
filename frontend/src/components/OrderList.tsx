'use client'

import { useState, useEffect } from 'react'
import { Package, Calendar, User, Mail, CheckCircle, RefreshCw } from 'lucide-react'
import toast from 'react-hot-toast'
import { orderService, Order } from '@/lib/api'
import { formatCurrency, formatDate, getStatusColor, getStatusText } from '@/lib/utils'

interface OrderListProps {
  refreshTrigger: number
}

export default function OrderList({ refreshTrigger }: OrderListProps) {
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [confirmingOrderId, setConfirmingOrderId] = useState<string | null>(null)

  const fetchOrders = async () => {
    setIsLoading(true)
    try {
      const data = await orderService.getAllOrders()
      setOrders(data)
    } catch (error) {
      console.error('Error fetching orders:', error)
      toast.error('Không thể tải danh sách đơn hàng')
    } finally {
      setIsLoading(false)
    }
  }

  const handleConfirmOrder = async (orderId: string) => {
    setConfirmingOrderId(orderId)
    try {
      await orderService.confirmOrder(orderId)
      toast.success('Đơn hàng đã được xác nhận!')
      fetchOrders() // Refresh the list
    } catch (error) {
      console.error('Error confirming order:', error)
      toast.error('Không thể xác nhận đơn hàng')
    } finally {
      setConfirmingOrderId(null)
    }
  }

  useEffect(() => {
    fetchOrders()
  }, [refreshTrigger])

  if (isLoading && orders.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Đang tải danh sách đơn hàng...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-md">
      <div className="flex items-center justify-between p-6 border-b border-gray-200">
        <div className="flex items-center">
          <Package className="w-6 h-6 text-blue-600 mr-2" />
          <h2 className="text-xl font-semibold text-gray-900">
            Danh sách đơn hàng ({orders.length})
          </h2>
        </div>
        <button
          onClick={fetchOrders}
          disabled={isLoading}
          className="flex items-center px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
          Làm mới
        </button>
      </div>

      {orders.length === 0 ? (
        <div className="p-12 text-center">
          <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">Chưa có đơn hàng nào</p>
          <p className="text-gray-400 text-sm mt-2">Tạo đơn hàng đầu tiên để bắt đầu</p>
        </div>
      ) : (
        <div className="divide-y divide-gray-200">
          {orders.map((order) => (
            <div key={order.id} className="p-6 hover:bg-gray-50 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <h3 className="text-lg font-medium text-gray-900">
                        Đơn hàng #{order.id.slice(-8).toUpperCase()}
                      </h3>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(order.status)}`}>
                        {getStatusText(order.status)}
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-blue-600">
                        {formatCurrency(order.totalAmount)}
                      </div>
                    </div>
                  </div>

                  {/* Customer Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <User className="w-4 h-4 mr-2" />
                      <span>{order.customerName}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Mail className="w-4 h-4 mr-2" />
                      <span>{order.customerEmail}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="w-4 h-4 mr-2" />
                      <span>{formatDate(order.createdAt)}</span>
                    </div>
                  </div>

                  {/* Products */}
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Sản phẩm:</h4>
                    <div className="bg-gray-50 rounded-lg p-3">
                      {order.products.map((product, index) => (
                        <div key={index} className="flex justify-between items-center py-1">
                          <div className="flex-1">
                            <span className="text-sm text-gray-900">{product.productName}</span>
                            <span className="text-xs text-gray-500 ml-2">({product.productId})</span>
                          </div>
                          <div className="text-sm text-gray-600">
                            {product.quantity} x {formatCurrency(product.price)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  {order.status === 'pending' && (
                    <div className="flex justify-end">
                      <button
                        onClick={() => handleConfirmOrder(order.id)}
                        disabled={confirmingOrderId === order.id}
                        className="flex items-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {confirmingOrderId === order.id ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Đang xác nhận...
                          </>
                        ) : (
                          <>
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Xác nhận đơn hàng
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
} 