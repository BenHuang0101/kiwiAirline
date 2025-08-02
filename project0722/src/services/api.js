// API服務配置
import axios from 'axios'

// 創建axios實例
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api', // 使用環境變數配置API地址
  timeout: 10000, // 請求超時時間
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
})

// 請求攔截器
api.interceptors.request.use(
  (config) => {
    // 添加認證token
    const token = localStorage.getItem('accessToken') // 修正：使用 accessToken 而不是 authToken
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 響應攔截器
api.interceptors.response.use(
  (response) => {
    return response.data
  },
  (error) => {
    // 處理常見錯誤
    if (error.response?.status === 401) {
      // 未授權，清除token並跳轉到登入頁面
      localStorage.removeItem('accessToken') // 修正：使用 accessToken
      localStorage.removeItem('refreshToken') // 修正：使用 refreshToken
      localStorage.removeItem('userInfo')
      window.location.href = '/login'
    }
    
    // 保留原始錯誤詳情以便調試
    console.error('🔍 API 錯誤詳情:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      url: error.config?.url,
      method: error.config?.method
    })
    
    // 統一錯誤處理，但保留 response 資訊
    const errorMessage = error.response?.data?.message || error.message || '請求失敗'
    const customError = new Error(errorMessage)
    customError.response = error.response // 保留原始響應資訊
    return Promise.reject(customError)
  }
)

// 認證服務
export const authService = {
  // 用戶登入
  async login(credentials) {
    try {
      const response = await api.post('/auth/login', credentials)
      return {
        success: true,
        data: response
      }
    } catch (error) {
      return {
        success: false,
        message: error.message
      }
    }
  },

  // 用戶註冊
  async register(userData) {
    try {
      const response = await api.post('/auth/register', userData)
      return {
        success: true,
        data: response
      }
    } catch (error) {
      return {
        success: false,
        message: error.message
      }
    }
  },

  // 登出
  async logout() {
    try {
      await api.post('/auth/logout')
      return { success: true }
    } catch (error) {
      return {
        success: false,
        message: error.message
      }
    }
  },

  // 獲取用戶資訊
  async getUserInfo() {
    try {
      const response = await api.get('/auth/user')
      return {
        success: true,
        data: response
      }
    } catch (error) {
      return {
        success: false,
        message: error.message
      }
    }
  }
}

// 航班服務
export const flightService = {
  // 搜尋航班
  async searchFlights(searchCriteria) {
    try {
      const response = await api.get('/flights/search', {
        params: searchCriteria
      })
      return {
        success: true,
        data: response
      }
    } catch (error) {
      return {
        success: false,
        message: error.message
      }
    }
  },

  // 獲取航班詳情
  async getFlightDetails(flightId) {
    try {
      const response = await api.get(`/flights/${flightId}`)
      return {
        success: true,
        data: response
      }
    } catch (error) {
      return {
        success: false,
        message: error.message
      }
    }
  },

  // 獲取熱門目的地
  async getPopularDestinations() {
    try {
      const response = await api.get('/flights/popular-destinations')
      return {
        success: true,
        data: response
      }
    } catch (error) {
      return {
        success: false,
        message: error.message
      }
    }
  },

  // 獲取機場列表
  async getAirports(query = '') {
    try {
      const response = await api.get('/airports', {
        params: { q: query }
      })
      return {
        success: true,
        data: response
      }
    } catch (error) {
      return {
        success: false,
        message: error.message
      }
    }
  }
}

// 訂票服務
export const bookingService = {
  // 創建訂單
  async createBooking(bookingData) {
    try {
      const response = await api.post('/bookings', bookingData)
      return {
        success: true,
        data: response
      }
    } catch (error) {
      return {
        success: false,
        message: error.message
      }
    }
  },

  // 獲取用戶訂單
  async getUserBookings() {
    try {
      const response = await api.get('/bookings/user')
      return {
        success: true,
        data: response
      }
    } catch (error) {
      return {
        success: false,
        message: error.message
      }
    }
  },

  // 獲取訂單詳情
  async getBookingDetails(bookingId) {
    try {
      const response = await api.get(`/bookings/${bookingId}`)
      return {
        success: true,
        data: response
      }
    } catch (error) {
      return {
        success: false,
        message: error.message
      }
    }
  },

  // 取消訂單
  async cancelBooking(bookingId) {
    try {
      const response = await api.put(`/bookings/${bookingId}/cancel`)
      return {
        success: true,
        data: response
      }
    } catch (error) {
      return {
        success: false,
        message: error.message
      }
    }
  },

  // 修改訂單
  async updateBooking(bookingId, updateData) {
    try {
      const response = await api.put(`/bookings/${bookingId}`, updateData)
      return {
        success: true,
        data: response
      }
    } catch (error) {
      return {
        success: false,
        message: error.message
      }
    }
  }
}

// 付款服務
export const paymentService = {
  // 處理付款
  async processPayment(paymentData) {
    try {
      const response = await api.post('/payments/process', paymentData)
      return {
        success: true,
        data: response
      }
    } catch (error) {
      return {
        success: false,
        message: error.message
      }
    }
  },

  // 獲取付款狀態
  async getPaymentStatus(paymentId) {
    try {
      const response = await api.get(`/payments/${paymentId}/status`)
      return {
        success: true,
        data: response
      }
    } catch (error) {
      return {
        success: false,
        message: error.message
      }
    }
  },

  // 申請退款
  async requestRefund(bookingId, refundData) {
    try {
      const response = await api.post(`/bookings/${bookingId}/refund`, refundData)
      return {
        success: true,
        data: response
      }
    } catch (error) {
      return {
        success: false,
        message: error.message
      }
    }
  }
}

// 客服服務
export const customerService = {
  // 提交客服表單
  async submitContactForm(formData) {
    try {
      const response = await api.post('/support/contact', formData)
      return {
        success: true,
        data: response
      }
    } catch (error) {
      return {
        success: false,
        message: error.message
      }
    }
  },

  // 獲取常見問題
  async getFAQ() {
    try {
      const response = await api.get('/support/faq')
      return {
        success: true,
        data: response
      }
    } catch (error) {
      return {
        success: false,
        message: error.message
      }
    }
  },

  // 開始聊天會話
  async startChatSession() {
    try {
      const response = await api.post('/support/chat/start')
      return {
        success: true,
        data: response
      }
    } catch (error) {
      return {
        success: false,
        message: error.message
      }
    }
  }
}

// 通知服務
export const notificationService = {
  // 發送電子郵件
  async sendEmail(emailData) {
    try {
      const response = await api.post('/notifications/email', emailData)
      return {
        success: true,
        data: response
      }
    } catch (error) {
      return {
        success: false,
        message: error.message
      }
    }
  },

  // 發送簡訊
  async sendSMS(smsData) {
    try {
      const response = await api.post('/notifications/sms', smsData)
      return {
        success: true,
        data: response
      }
    } catch (error) {
      return {
        success: false,
        message: error.message
      }
    }
  }
}

// 工具函數
export const utils = {
  // 格式化錯誤訊息
  formatErrorMessage(error) {
    if (typeof error === 'string') {
      return error
    }
    
    if (error.response?.data?.message) {
      return error.response.data.message
    }
    
    if (error.message) {
      return error.message
    }
    
    return '未知錯誤'
  },

  // 處理文件上傳
  async uploadFile(file, uploadType = 'general') {
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('type', uploadType)
      
      const response = await api.post('/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      
      return {
        success: true,
        data: response
      }
    } catch (error) {
      return {
        success: false,
        message: error.message
      }
    }
  }
}

// 導出默認實例
export default api
