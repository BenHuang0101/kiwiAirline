import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '../services/api'

export const useBookingStore = defineStore('booking', () => {
  // 狀態
  const bookings = ref([])
  const currentBooking = ref(null)
  const passengers = ref([])
  const paymentInfo = ref({
    method: 'credit_card',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: ''
  })
  const isProcessing = ref(false)

  // 從 localStorage 載入模擬訂單
  const loadLocalBookings = () => {
    const savedBookings = localStorage.getItem('mockBookings')
    if (savedBookings) {
      bookings.value = JSON.parse(savedBookings)
    }
  }

  // 工具函數：格式化性別
  const formatGender = (gender) => {
    if (!gender || typeof gender !== 'string') {
      console.log('⚠️ 無效的性別值，使用預設值:', gender)
      return 'other'
    }
    
    const normalizedGender = gender.toLowerCase().trim()
    console.log('👤 原始性別:', gender, '→ 標準化:', normalizedGender)
    
    // 性別對應表
    const genderMap = {
      'male': 'male',
      'man': 'male',
      '男': 'male',
      '男性': 'male',
      'female': 'female',
      'woman': 'female',
      '女': 'female',
      '女性': 'female',
      'other': 'other',
      '其他': 'other',
      '不詳': 'other'
    }
    
    const mappedGender = genderMap[normalizedGender] || 'other'
    console.log('✅ 性別格式化結果:', gender, '→', mappedGender)
    return mappedGender
  }

  // 工具函數：格式化電話號碼
  const formatPhoneNumber = (phone) => {
    if (!phone || typeof phone !== 'string') {
      console.log('⚠️ 無效的電話號碼，使用預設值:', phone)
      return '+886912345678' // 預設電話號碼
    }
    
    // 移除所有非數字字符（保留 + 號）
    let cleanPhone = phone.replace(/[^\d+]/g, '')
    
    console.log('📞 原始電話號碼:', phone)
    console.log('📞 清理後電話號碼:', cleanPhone)
    
    // 如果沒有 + 號且以 0 開頭，轉換為 +886 格式
    if (cleanPhone.startsWith('0') && cleanPhone.length >= 10) {
      cleanPhone = '+886' + cleanPhone.substring(1)
      console.log('📞 轉換為國際格式:', cleanPhone)
    }
    
    // 如果沒有 + 號且不是以 0 開頭，添加 +886
    if (!cleanPhone.startsWith('+') && /^[1-9]\d{8,13}$/.test(cleanPhone)) {
      cleanPhone = '+886' + cleanPhone
      console.log('📞 添加國際前綴:', cleanPhone)
    }
    
    // 驗證最終格式 (後端規則: /^\+?[1-9]\d{7,14}$/)
    if (/^\+?[1-9]\d{7,14}$/.test(cleanPhone)) {
      console.log('✅ 電話號碼格式正確:', cleanPhone)
      return cleanPhone
    } else {
      console.log('❌ 電話號碼格式無效，使用預設值:', cleanPhone)
      return '+886912345678' // 預設電話號碼
    }
  }

  // 儲存模擬訂單到 localStorage
  const saveLocalBookings = () => {
    localStorage.setItem('mockBookings', JSON.stringify(bookings.value))
  }

  // 添加模擬訂單
  const addMockBooking = (bookingData) => {
    const newBooking = {
      id: Date.now(),
      bookingReference: bookingData.bookingNumber,
      bookingDate: new Date().toISOString(),
      status: 'confirmed',
      flight: {
        flightNumber: bookingData.flight?.flightNumber || 'KW001',
        departure: {
          airport: { 
            code: bookingData.flight?.departure?.airport?.code || 'TPE' 
          },
          city: bookingData.flight?.departure?.city || '台北',
          dateTime: bookingData.flight?.departure?.dateTime || new Date().toISOString()
        },
        arrival: {
          airport: { 
            code: bookingData.flight?.arrival?.airport?.code || 'KIX' 
          },
          city: bookingData.flight?.arrival?.city || '大阪',
          dateTime: bookingData.flight?.arrival?.dateTime || new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString()
        }
      },
      passengers: bookingData.passengers || [],
      totalAmount: bookingData.totalAmount || 0,
      currency: bookingData.currency || 'TWD',
      confirmationCode: bookingData.confirmationCode
    }
    
    bookings.value.unshift(newBooking) // 添加到開頭
    saveLocalBookings()
    return newBooking
  }

  // 計算屬性
  const hasBookings = computed(() => bookings.value.length > 0)
  const totalBookings = computed(() => bookings.value.length)

  // 建立訂單
  const createBooking = async (bookingData) => {
    isProcessing.value = true
    
    try {
      console.log('🔄 正在建立訂單...', bookingData)
      console.log('🔍 原始 flightId 類型:', typeof bookingData.flightId, '值:', bookingData.flightId)
      console.log('🔍 乘客電話號碼資料:')
      bookingData.passengers.forEach((passenger, index) => {
        console.log(`  乘客 ${index}: phone = "${passenger.phone}" (類型: ${typeof passenger.phone})`)
      })
      
      console.log('🚀 開始處理資料...')
      
      // flightId 保持為字符串（UUID格式）
      const processedData = {
        ...bookingData,
        flightId: bookingData.flightId, // 保持原始字符串格式
        passengers: bookingData.passengers.map((passenger, index) => {
          console.log(`🔧 處理乘客 ${index} 的資料...`)
          const formattedPhone = formatPhoneNumber(passenger.phone)
          const formattedGender = formatGender(passenger.gender)
          console.log(`📋 乘客 ${index} 處理結果:`)
          console.log(`  電話: ${passenger.phone} → ${formattedPhone}`)
          console.log(`  性別: ${passenger.gender} → ${formattedGender}`)
          return {
            ...passenger,
            phone: formattedPhone,
            gender: formattedGender
          }
        }),
        // 格式化聯絡人電話號碼
        contactInfo: {
          ...bookingData.contactInfo,
          phone: (() => {
            console.log('📞 處理聯絡人電話號碼:', bookingData.contactInfo?.phone)
            const formattedContactPhone = formatPhoneNumber(bookingData.contactInfo?.phone)
            console.log('📞 聯絡人電話號碼處理結果:', bookingData.contactInfo?.phone, '→', formattedContactPhone)
            return formattedContactPhone
          })()
        }
      }
      
      console.log('✅ 資料處理完成:', processedData)
      
      console.log('🔍 處理後 flightId 類型:', typeof processedData.flightId, '值:', processedData.flightId)
      
      // 驗證 flightId 存在
      if (!processedData.flightId) {
        throw new Error(`無效的航班 ID: ${bookingData.flightId}`)
      }
      
      const response = await api.post('/bookings', processedData)
      
      console.log('✅ 訂單建立響應:', response)
      currentBooking.value = response.data
      return { success: true, data: response.data }
    } catch (error) {
      console.error('❌ 建立訂單失敗:', error)
      console.error('🔍 錯誤詳情:', error.response?.data)
      
      // 顯示詳細的驗證錯誤
      if (error.response?.data?.code === 'VALIDATION_ERROR' && error.response?.data?.details) {
        console.error('📋 驗證錯誤詳情:')
        error.response.data.details.forEach((detail, index) => {
          console.error(`  ${index + 1}. 欄位: ${detail.field || detail.path || '未知'}, 錯誤: ${detail.message}`)
        })
      }
      
      return { 
        success: false, 
        message: error.message || '建立訂單失敗，請稍後再試' 
      }
    } finally {
      isProcessing.value = false
    }
  }

  // 獲取用戶訂單（使用模擬資料）
  const fetchUserBookings = async () => {
    try {
      // 載入本地模擬資料
      loadLocalBookings()
      
      // 模擬 API 延遲
      await new Promise(resolve => setTimeout(resolve, 500))
      
      console.log('📋 載入的模擬訂單:', bookings.value)
      
      return { success: true, data: bookings.value }
    } catch (error) {
      console.error('獲取訂單失敗:', error)
      return { 
        success: false, 
        message: error.message || '獲取訂單失敗' 
      }
    }
  }

  // 獲取特定訂單詳情
  const getBookingDetails = async (bookingId) => {
    try {
      const response = await api.get(`/bookings/${bookingId}`)
      
      currentBooking.value = response.data
      return { success: true, data: response.data }
    } catch (error) {
      console.error('獲取訂單詳情失敗:', error)
      return { 
        success: false, 
        message: error.message || '獲取訂單詳情失敗' 
      }
    }
  }

  // 修改訂單
  const updateBooking = async (bookingId, updateData) => {
    isProcessing.value = true
    
    try {
      const response = await api.put(`/bookings/${bookingId}`, updateData)
      
      // 更新本地訂單資料
      const index = bookings.value.findIndex(b => b.id === bookingId)
      if (index !== -1) {
        bookings.value[index] = response.data
      }
      
      return { success: true, data: response.data }
    } catch (error) {
      console.error('修改訂單失敗:', error)
      return { 
        success: false, 
        message: error.message || '修改訂單失敗' 
      }
    } finally {
      isProcessing.value = false
    }
  }

  // 取消訂單
  const cancelBooking = async (bookingId) => {
    isProcessing.value = true
    
    try {
      const response = await api.delete(`/bookings/${bookingId}`)
      
      // 從本地訂單列表中移除
      bookings.value = bookings.value.filter(b => b.id !== bookingId)
      
      return { success: true, data: response.data }
    } catch (error) {
      console.error('取消訂單失敗:', error)
      return { 
        success: false, 
        message: error.message || '取消訂單失敗' 
      }
    } finally {
      isProcessing.value = false
    }
  }

  // 設置乘客資訊
  const setPassengers = (passengerData) => {
    passengers.value = passengerData
  }

  // 設置付款資訊
  const setPaymentInfo = (payment) => {
    paymentInfo.value = { ...payment }
  }

  // 重置訂單狀態
  const resetBookingState = () => {
    currentBooking.value = null
    passengers.value = []
    paymentInfo.value = {
      method: 'credit_card',
      cardNumber: '',
      expiryDate: '',
      cvv: '',
      cardholderName: ''
    }
  }

  return {
    // 狀態
    bookings,
    currentBooking,
    passengers,
    paymentInfo,
    isProcessing,
    // 計算屬性
    hasBookings,
    totalBookings,
    // 方法
    createBooking,
    fetchUserBookings,
    getUserBookings: fetchUserBookings, // 別名，供 MyBookingsView 使用
    getBookingDetails,
    updateBooking,
    cancelBooking,
    setPassengers,
    setPaymentInfo,
    resetBookingState
  }
})
