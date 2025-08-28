'use client'

import { useState } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { Plus, Trash2, ShoppingCart } from 'lucide-react'
import toast from 'react-hot-toast'
import { orderService, CreateOrderRequest, OrderProduct } from '@/lib/api'
import { formatCurrency } from '@/lib/utils'

interface CreateOrderFormProps {
  onOrderCreated: () => void
}

export default function CreateOrderForm({ onOrderCreated }: CreateOrderFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  
  const { register, control, handleSubmit, watch, setValue, reset, formState: { errors } } = useForm<CreateOrderRequest>({
    defaultValues: {
      customerName: '',
      customerEmail: '',
      products: [{ productId: '', productName: '', quantity: 1, price: 0 }],
      totalAmount: 0,
    }
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'products'
  })

  const watchedProducts = watch('products')

  // Tính tổng tiền tự động
  const calculateTotal = () => {
    const total = watchedProducts.reduce((sum, product) => {
      return sum + (product.quantity * product.price)
    }, 0)
    setValue('totalAmount', total)
    return total
  }

  const onSubmit = async (data: CreateOrderRequest) => {
    setIsLoading(true)
    try {
      data.totalAmount = calculateTotal()
      await orderService.createOrder(data)
      toast.success('Đơn hàng đã được tạo thành công!')
      reset()
      onOrderCreated()
    } catch (error) {
      console.error('Error creating order:', error)
      toast.error('Có lỗi xảy ra khi tạo đơn hàng')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center mb-6">
        <ShoppingCart className="w-6 h-6 text-blue-600 mr-2" />
        <h2 className="text-xl font-semibold text-gray-900">Tạo đơn hàng mới</h2>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Thông tin khách hàng */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tên khách hàng *
            </label>
            <input
              type="text"
              {...register('customerName', { required: 'Vui lòng nhập tên khách hàng' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Nhập tên khách hàng"
            />
            {errors.customerName && (
              <p className="mt-1 text-sm text-red-600">{errors.customerName.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email khách hàng *
            </label>
            <input
              type="email"
              {...register('customerEmail', { 
                required: 'Vui lòng nhập email',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Email không hợp lệ'
                }
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="example@email.com"
            />
            {errors.customerEmail && (
              <p className="mt-1 text-sm text-red-600">{errors.customerEmail.message}</p>
            )}
          </div>
        </div>

        {/* Danh sách sản phẩm */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <label className="block text-sm font-medium text-gray-700">
              Sản phẩm *
            </label>
            <button
              type="button"
              onClick={() => append({ productId: '', productName: '', quantity: 1, price: 0 })}
              className="flex items-center px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4 mr-1" />
              Thêm sản phẩm
            </button>
          </div>

          <div className="space-y-4">
            {fields.map((field, index) => (
              <div key={field.id} className="grid grid-cols-1 md:grid-cols-5 gap-4 p-4 border border-gray-200 rounded-lg">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Mã sản phẩm
                  </label>
                  <input
                    type="text"
                    {...register(`products.${index}.productId`, { required: 'Bắt buộc' })}
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="SP001"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Tên sản phẩm
                  </label>
                  <input
                    type="text"
                    {...register(`products.${index}.productName`, { required: 'Bắt buộc' })}
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="Tên sản phẩm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Số lượng
                  </label>
                  <input
                    type="number"
                    min="1"
                    {...register(`products.${index}.quantity`, { 
                      required: 'Bắt buộc',
                      min: { value: 1, message: 'Tối thiểu 1' }
                    })}
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Giá (VND)
                  </label>
                  <input
                    type="number"
                    min="0"
                    {...register(`products.${index}.price`, { 
                      required: 'Bắt buộc',
                      min: { value: 0, message: 'Giá phải >= 0' }
                    })}
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div className="flex items-end">
                  {fields.length > 1 && (
                    <button
                      type="button"
                      onClick={() => remove(index)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tổng tiền */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex justify-between items-center">
            <span className="text-lg font-medium text-gray-900">Tổng tiền:</span>
            <span className="text-xl font-bold text-blue-600">
              {formatCurrency(calculateTotal())}
            </span>
          </div>
        </div>

        {/* Submit button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? (
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Đang tạo đơn hàng...
            </div>
          ) : (
            'Tạo đơn hàng'
          )}
        </button>
      </form>
    </div>
  )
} 