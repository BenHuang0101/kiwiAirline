import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '../services/api'

export const useAuthStore = defineStore('auth', () => {
  // 狀態
  const user = ref(null)
  const accessToken = ref(localStorage.getItem('accessToken') || null)
  const refreshToken = ref(localStorage.getItem('refreshToken') || null)

  // 計算屬性
  const isLoggedIn = computed(() => !!accessToken.value)
  const userInfo = computed(() => user.value)

  // 登入函數
  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', {
        email,
        password
      })
      
      console.log('🔍 完整登入響應:', response) // 調試信息
      console.log('🔍 響應數據:', response) // API interceptor 已經返回 response.data
      
      // API interceptor 返回 response.data，所以 response 就是後端的響應數據
      const { accessToken: newAccessToken, refreshToken: newRefreshToken } = response.data.tokens
      const userData = response.data.user
      
      // 儲存token到localStorage
      localStorage.setItem('accessToken', newAccessToken)
      localStorage.setItem('refreshToken', newRefreshToken)
      
      // 更新狀態
      accessToken.value = newAccessToken
      refreshToken.value = newRefreshToken
      user.value = userData
      
      return { success: true, message: '登入成功' }
    } catch (error) {
      console.error('登入失敗:', error)
      return { 
        success: false, 
        message: error.message || '登入失敗，請稍後再試' 
      }
    }
  }

  // 註冊函數
  const register = async (userData) => {
    try {
      const response = await api.post('/auth/register', userData)
      return { success: true, message: '註冊成功，請使用您的帳戶登入' }
    } catch (error) {
      console.error('註冊失敗:', error)
      return { 
        success: false, 
        message: error.message || '註冊失敗，請稍後再試' 
      }
    }
  }

  // 登出函數
  const logout = () => {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    accessToken.value = null
    refreshToken.value = null
    user.value = null
  }

  // 檢查token是否有效
  const checkAuth = async () => {
    if (!accessToken.value) return false
    
    try {
      const response = await api.get('/auth/verify', {
        headers: {
          Authorization: `Bearer ${accessToken.value}`
        }
      })
      // API interceptor 返回 response.data，所以 response 就是後端的響應數據
      user.value = response.data.user
      return true
    } catch (error) {
      logout()
      return false
    }
  }

  return {
    // 狀態
    user,
    accessToken,
    refreshToken,
    // 計算屬性
    isLoggedIn,
    userInfo,
    // 方法
    login,
    register,
    logout,
    checkAuth
  }
})
