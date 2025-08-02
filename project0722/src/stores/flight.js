import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '../services/api'

export const useFlightStore = defineStore('flight', () => {
  // 狀態
  const searchResults = ref([])
  const selectedFlight = ref(null)
  const searchCriteria = ref({
    departure: '',
    arrival: '',
    departureDate: '',
    passengers: 1,
    sortBy: 'price',
    sortOrder: 'asc'
  })
  const isSearching = ref(false)

  // 計算屬性
  const hasSearchResults = computed(() => searchResults.value.length > 0)
  const totalResults = computed(() => searchResults.value.length)

  // 搜尋航班
  const searchFlights = async (criteria) => {
    isSearching.value = true
    searchCriteria.value = { ...criteria }
    
    try {
      console.log('🔍 原始搜尋參數:', criteria) // 調試信息
      
      // 轉換參數格式以符合後端 API
      const apiParams = {
        departure: criteria.departure,
        arrival: criteria.arrival,
        departureDate: criteria.departureDate,
        passengers: parseInt(criteria.passengers) || 1,
        sort: criteria.sortBy || 'price',
        order: criteria.sortOrder || 'asc'
      }
      
      // 添加可選參數
      if (criteria.returnDate) {
        apiParams.returnDate = criteria.returnDate
      }
      if (criteria.class) {
        apiParams.class = criteria.class
      }
      
      console.log('🔍 轉換後的 API 參數:', apiParams) // 調試信息
      
      const response = await api.get('/flights/search', {
        params: apiParams
      })
      
      console.log('🔍 航班搜尋響應:', response) // 調試信息
      
      searchResults.value = response.data.flights || []
      return { success: true, data: response.data }
    } catch (error) {
      console.error('搜尋航班失敗:', error)
      console.error('🔍 錯誤詳情:', error.response?.data) // 新增錯誤詳情
      searchResults.value = []
      return { 
        success: false, 
        message: error.message || '搜尋航班失敗，請稍後再試' 
      }
    } finally {
      isSearching.value = false
    }
  }

  // 獲取特定航班詳情
  const getFlightDetails = async (flightId) => {
    try {
      const response = await api.get(`/flights/${flightId}`)
      console.log('✈️ 獲取航班詳情響應:', response.data)
      
      // 保持 flightId 為字符串格式（UUID）
      const processedFlight = {
        ...response.data,
        flightId: response.data.flightId || response.data.id // 使用原始ID
      }
      
      console.log('🔍 處理後的 flightId 類型:', typeof processedFlight.flightId, '值:', processedFlight.flightId)
      
      selectedFlight.value = processedFlight
      return { success: true, data: processedFlight }
    } catch (error) {
      console.error('獲取航班詳情失敗:', error)
      return { 
        success: false, 
        message: error.message || '獲取航班詳情失敗' 
      }
    }
  }

  // 重置搜尋
  const resetSearch = () => {
    searchResults.value = []
    selectedFlight.value = null
    searchCriteria.value = {
      departure: '',
      arrival: '',
      departureDate: '',
      passengers: 1,
      sortBy: 'price',
      sortOrder: 'asc'
    }
  }

  // 排序航班
  const sortFlights = (sortBy, sortOrder) => {
    searchCriteria.value.sortBy = sortBy
    searchCriteria.value.sortOrder = sortOrder
    
    searchResults.value.sort((a, b) => {
      let aValue, bValue
      
      switch (sortBy) {
        case 'price':
          aValue = a.price.amount
          bValue = b.price.amount
          break
        case 'time':
          aValue = new Date(a.departure.dateTime)
          bValue = new Date(b.departure.dateTime)
          break
        case 'duration':
          aValue = a.duration
          bValue = b.duration
          break
        default:
          return 0
      }
      
      if (sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0
      }
    })
  }

  return {
    // 狀態
    searchResults,
    selectedFlight,
    searchCriteria,
    isSearching,
    // 計算屬性
    hasSearchResults,
    totalResults,
    // 方法
    searchFlights,
    getFlightDetails,
    resetSearch,
    sortFlights
  }
})
