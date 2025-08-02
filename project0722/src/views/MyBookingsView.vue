<template>
  <div class="my-bookings-view">
    <div class="container">
      <h2 class="page-title">我的訂票記錄</h2>
      
      <!-- 加載狀態 -->
      <div v-if="isLoading" class="loading-container">
        <div class="spinner"></div>
        <p>載入中...</p>
      </div>

      <!-- 訂票記錄為空 -->
      <div v-else-if="!bookings || bookings.length === 0" class="empty-state">
        <svg class="empty-icon" width="120" height="120" viewBox="0 0 120 120">
          <circle cx="60" cy="60" r="50" fill="none" stroke="#e0e0e0" stroke-width="2"/>
          <path d="M40 60 L55 75 L80 45" stroke="#e0e0e0" stroke-width="2" fill="none"/>
        </svg>
        <h3>暫無訂票記錄</h3>
        <p>您還沒有任何訂票記錄，快去搜尋您的理想航班吧！</p>
        <button @click="$router.push('/')" class="btn btn-primary">
          開始搜尋航班
        </button>
      </div>

      <!-- 訂票記錄列表 -->
      <div v-else class="bookings-list">
        <div class="bookings-header">
          <div class="filter-section">
            <select v-model="selectedStatus" @change="filterBookings" class="filter-select">
              <option value="">所有狀態</option>
              <option value="confirmed">已確認</option>
              <option value="cancelled">已取消</option>
              <option value="pending">待確認</option>
              <option value="completed">已完成</option>
            </select>
            
            <div class="date-range-filter">
              <input 
                type="date" 
                v-model="dateRange.start" 
                @change="filterBookings"
                class="date-input"
              >
              <span>至</span>
              <input 
                type="date" 
                v-model="dateRange.end" 
                @change="filterBookings"
                class="date-input"
              >
            </div>
          </div>
          
          <div class="results-count">
            共 {{ filteredBookings.length }} 筆記錄
          </div>
        </div>

        <div class="booking-cards">
          <div 
            v-for="booking in filteredBookings" 
            :key="booking.id" 
            class="booking-card"
          >
            <!-- 訂票狀態標籤 -->
            <div class="status-badge" :class="getStatusClass(booking.status)">
              {{ getStatusText(booking.status) }}
            </div>

            <!-- 訂票基本資訊 -->
            <div class="booking-header">
              <div class="booking-info">
                <h3 class="booking-reference">{{ booking.bookingReference }}</h3>
                <p class="booking-date">訂票日期：{{ formatDate(booking.bookingDate) }}</p>
              </div>
              <div class="booking-actions">
                <button 
                  @click="viewBookingDetails(booking)" 
                  class="btn btn-outline-primary btn-sm"
                >
                  查看詳情
                </button>
                <button 
                  v-if="booking.status === 'confirmed'" 
                  @click="cancelBooking(booking)" 
                  class="btn btn-outline-danger btn-sm"
                >
                  取消訂票
                </button>
              </div>
            </div>

            <!-- 航班資訊 -->
            <div class="flight-info">
              <div class="flight-route">
                <div class="departure">
                  <span class="airport-code">{{ booking.flight.departure.airport.code }}</span>
                  <span class="city-name">{{ booking.flight.departure.city }}</span>
                  <span class="date-time">{{ formatDateTime(booking.flight.departure.dateTime) }}</span>
                </div>
                
                <div class="route-indicator">
                  <svg width="24" height="24" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/>
                  </svg>
                </div>
                
                <div class="arrival">
                  <span class="airport-code">{{ booking.flight.arrival.airport.code }}</span>
                  <span class="city-name">{{ booking.flight.arrival.city }}</span>
                  <span class="date-time">{{ formatDateTime(booking.flight.arrival.dateTime) }}</span>
                </div>
              </div>
              
              <div class="flight-details">
                <span class="flight-number">{{ booking.flight.flightNumber }}</span>
                <span class="passengers">{{ booking.passengers.length }} 位乘客</span>
                <span class="total-price">
                  {{ booking.payment.currency }} {{ booking.payment.totalAmount.toLocaleString() }}
                </span>
              </div>
            </div>

            <!-- 乘客資訊 -->
            <div class="passengers-info">
              <h4>乘客資訊</h4>
              <div class="passenger-list">
                <div 
                  v-for="(passenger, index) in booking.passengers" 
                  :key="index"
                  class="passenger-item"
                >
                  <span class="passenger-name">{{ passenger.firstName }} {{ passenger.lastName }}</span>
                  <span class="passenger-type">{{ passenger.type === 'adult' ? '成人' : '兒童' }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 訂票詳情對話框 -->
    <div v-if="selectedBooking" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>訂票詳情</h3>
          <button @click="closeModal" class="close-btn">
            <svg width="24" height="24" viewBox="0 0 24 24">
              <path fill="currentColor" d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
            </svg>
          </button>
        </div>
        
        <div class="modal-body">
          <div class="booking-detail-section">
            <h4>訂票資訊</h4>
            <div class="detail-row">
              <span>訂票編號：</span>
              <span>{{ selectedBooking.bookingReference }}</span>
            </div>
            <div class="detail-row">
              <span>訂票日期：</span>
              <span>{{ formatDate(selectedBooking.bookingDate) }}</span>
            </div>
            <div class="detail-row">
              <span>訂票狀態：</span>
              <span class="status-text" :class="getStatusClass(selectedBooking.status)">
                {{ getStatusText(selectedBooking.status) }}
              </span>
            </div>
          </div>

          <div class="booking-detail-section">
            <h4>航班資訊</h4>
            <div class="detail-row">
              <span>航班編號：</span>
              <span>{{ selectedBooking.flight.flightNumber }}</span>
            </div>
            <div class="detail-row">
              <span>起飛時間：</span>
              <span>{{ formatDateTime(selectedBooking.flight.departure.dateTime) }}</span>
            </div>
            <div class="detail-row">
              <span>抵達時間：</span>
              <span>{{ formatDateTime(selectedBooking.flight.arrival.dateTime) }}</span>
            </div>
            <div class="detail-row">
              <span>航線：</span>
              <span>{{ selectedBooking.flight.departure.city }} → {{ selectedBooking.flight.arrival.city }}</span>
            </div>
          </div>

          <div class="booking-detail-section">
            <h4>乘客資訊</h4>
            <div v-for="(passenger, index) in selectedBooking.passengers" :key="index" class="passenger-detail">
              <div class="passenger-header">乘客 {{ index + 1 }} ({{ passenger.type === 'adult' ? '成人' : '兒童' }})</div>
              <div class="detail-row">
                <span>姓名：</span>
                <span>{{ passenger.firstName }} {{ passenger.lastName }}</span>
              </div>
              <div class="detail-row">
                <span>護照號碼：</span>
                <span>{{ passenger.passportNumber }}</span>
              </div>
              <div class="detail-row">
                <span>出生日期：</span>
                <span>{{ formatDate(passenger.dateOfBirth) }}</span>
              </div>
              <div class="detail-row">
                <span>國籍：</span>
                <span>{{ passenger.nationality }}</span>
              </div>
            </div>
          </div>

          <div class="booking-detail-section">
            <h4>付款資訊</h4>
            <div class="detail-row">
              <span>付款方式：</span>
              <span>{{ selectedBooking.payment.method === 'credit_card' ? '信用卡' : 'ATM轉帳' }}</span>
            </div>
            <div class="detail-row">
              <span>總金額：</span>
              <span class="total-amount">{{ selectedBooking.payment.currency }} {{ selectedBooking.payment.totalAmount.toLocaleString() }}</span>
            </div>
            <div class="detail-row">
              <span>付款狀態：</span>
              <span class="payment-status" :class="selectedBooking.payment.status">
                {{ selectedBooking.payment.status === 'paid' ? '已付款' : '未付款' }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useBookingStore } from '@/stores/booking'

const router = useRouter()
const authStore = useAuthStore()
const bookingStore = useBookingStore()

// 響應式資料
const bookings = ref([])
const filteredBookings = ref([])
const isLoading = ref(true)
const selectedStatus = ref('')
const dateRange = ref({
  start: '',
  end: ''
})
const selectedBooking = ref(null)

// 計算屬性
const isAuthenticated = computed(() => authStore.isLoggedIn)

// 生命週期
onMounted(() => {
  if (isAuthenticated.value) {
    loadBookings()
  } else {
    // 如果未登入，跳轉到登入頁面
    router.push('/login')
  }
})

// 工具函數
const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-TW', {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric'
  })
}

const formatDateTime = (dateTimeString) => {
  const date = new Date(dateTimeString)
  return date.toLocaleString('zh-TW', {
    month: 'numeric',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const getStatusClass = (status) => {
  const statusClasses = {
    confirmed: 'status-confirmed',
    cancelled: 'status-cancelled',
    pending: 'status-pending',
    completed: 'status-completed'
  }
  return statusClasses[status] || 'status-default'
}

const getStatusText = (status) => {
  const statusTexts = {
    confirmed: '已確認',
    cancelled: '已取消',
    pending: '待確認',
    completed: '已完成'
  }
  return statusTexts[status] || status
}

// 載入訂票記錄
const loadBookings = async () => {
  try {
    isLoading.value = true
    console.log('🔄 開始載入訂單...')
    
    const result = await bookingStore.getUserBookings()
    console.log('📦 訂單 API 響應:', result)
    
    if (result.success && result.data) {
      bookings.value = result.data || []
      console.log('✅ 訂單資料:', bookings.value)
    } else {
      console.log('⚠️ 沒有訂單資料，使用空陣列')
      bookings.value = []
    }
    
    filteredBookings.value = bookings.value
  } catch (error) {
    console.error('❌ 載入訂票記錄失敗:', error)
    // 使用空陣列而不是模擬資料，這樣可以顯示「暫無訂單」狀態
    bookings.value = []
    filteredBookings.value = []
  } finally {
    isLoading.value = false
  }
}

// 篩選訂票記錄
const filterBookings = () => {
  let filtered = bookings.value

  // 狀態篩選
  if (selectedStatus.value) {
    filtered = filtered.filter(booking => booking.status === selectedStatus.value)
  }

  // 日期範圍篩選
  if (dateRange.value.start && dateRange.value.end) {
    filtered = filtered.filter(booking => {
      const bookingDate = new Date(booking.bookingDate)
      const startDate = new Date(dateRange.value.start)
      const endDate = new Date(dateRange.value.end)
      return bookingDate >= startDate && bookingDate <= endDate
    })
  }

  filteredBookings.value = filtered
}

// 查看訂票詳情
const viewBookingDetails = (booking) => {
  selectedBooking.value = booking
}

// 關閉對話框
const closeModal = () => {
  selectedBooking.value = null
}

// 取消訂票
const cancelBooking = async (booking) => {
  if (confirm('確定要取消此訂票嗎？取消後將無法恢復。')) {
    try {
      await bookingStore.cancelBooking(booking.id)
      booking.status = 'cancelled'
      alert('訂票已成功取消')
    } catch (error) {
      console.error('取消訂票失敗:', error)
      alert('取消訂票失敗，請稍後再試')
    }
  }
}
</script>

<style scoped>
.my-bookings-view {
  min-height: 100vh;
  background-color: var(--background-gray);
  padding: var(--space-6) 0;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 var(--space-4);
}

.page-title {
  font-size: var(--text-2xl);
  font-weight: 600;
  color: var(--deep-sea);
  margin-bottom: var(--space-6);
  text-align: center;
}

/* 加載狀態 */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--space-8);
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid var(--border-gray);
  border-top: 4px solid var(--kiwi-blue);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: var(--space-3);
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* 空狀態 */
.empty-state {
  text-align: center;
  padding: var(--space-8);
}

.empty-icon {
  margin-bottom: var(--space-4);
}

.empty-state h3 {
  color: var(--deep-sea);
  margin-bottom: var(--space-2);
}

.empty-state p {
  color: var(--medium-gray);
  margin-bottom: var(--space-6);
}

/* 訂票記錄 */
.bookings-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-6);
  padding: var(--space-4);
  background-color: var(--white);
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.filter-section {
  display: flex;
  align-items: center;
  gap: var(--space-4);
}

.filter-select {
  padding: var(--space-2) var(--space-3);
  border: 1px solid var(--border-gray);
  border-radius: 6px;
  font-size: var(--text-sm);
}

.date-range-filter {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.date-input {
  padding: var(--space-2) var(--space-3);
  border: 1px solid var(--border-gray);
  border-radius: 6px;
  font-size: var(--text-sm);
}

.results-count {
  color: var(--medium-gray);
  font-size: var(--text-sm);
}

/* 訂票卡片 */
.booking-cards {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.booking-card {
  background-color: var(--white);
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  padding: var(--space-4);
  position: relative;
}

.status-badge {
  position: absolute;
  top: var(--space-3);
  right: var(--space-3);
  padding: var(--space-1) var(--space-2);
  border-radius: 4px;
  font-size: var(--text-xs);
  font-weight: 600;
  text-transform: uppercase;
}

.status-confirmed {
  background-color: var(--success-light);
  color: var(--success);
}

.status-cancelled {
  background-color: var(--danger-light);
  color: var(--danger);
}

.status-pending {
  background-color: var(--warning-light);
  color: var(--warning);
}

.status-completed {
  background-color: var(--info-light);
  color: var(--info);
}

.booking-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: var(--space-4);
}

.booking-reference {
  font-size: var(--text-lg);
  font-weight: 600;
  color: var(--kiwi-blue);
  margin-bottom: var(--space-1);
}

.booking-date {
  color: var(--medium-gray);
  font-size: var(--text-sm);
}

.booking-actions {
  display: flex;
  gap: var(--space-2);
}

.btn-sm {
  padding: var(--space-2) var(--space-3);
  font-size: var(--text-sm);
}

/* 航班資訊 */
.flight-info {
  border-top: 1px solid var(--border-gray);
  padding-top: var(--space-4);
  margin-bottom: var(--space-4);
}

.flight-route {
  display: flex;
  align-items: center;
  margin-bottom: var(--space-3);
}

.departure,
.arrival {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.arrival {
  text-align: right;
}

.route-indicator {
  margin: 0 var(--space-3);
  color: var(--kiwi-blue);
}

.airport-code {
  font-size: var(--text-lg);
  font-weight: 600;
  color: var(--deep-sea);
}

.city-name {
  color: var(--medium-gray);
  font-size: var(--text-sm);
}

.date-time {
  color: var(--dark-gray);
  font-size: var(--text-sm);
}

.flight-details {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: var(--text-sm);
}

.flight-number {
  color: var(--kiwi-blue);
  font-weight: 600;
}

.total-price {
  color: var(--kiwi-orange);
  font-weight: 600;
  font-size: var(--text-base);
}

/* 乘客資訊 */
.passengers-info {
  border-top: 1px solid var(--border-gray);
  padding-top: var(--space-4);
}

.passengers-info h4 {
  font-size: var(--text-base);
  font-weight: 600;
  color: var(--deep-sea);
  margin-bottom: var(--space-2);
}

.passenger-list {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
}

.passenger-item {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-3);
  background-color: var(--light-gray);
  border-radius: 6px;
  font-size: var(--text-sm);
}

.passenger-name {
  font-weight: 600;
  color: var(--deep-sea);
}

.passenger-type {
  color: var(--medium-gray);
}

/* 對話框 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background-color: var(--white);
  border-radius: 8px;
  max-width: 600px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-4);
  border-bottom: 1px solid var(--border-gray);
}

.modal-header h3 {
  color: var(--deep-sea);
  margin: 0;
}

.close-btn {
  background: none;
  border: none;
  color: var(--medium-gray);
  cursor: pointer;
  padding: var(--space-1);
  border-radius: 4px;
  transition: all 0.2s ease;
}

.close-btn:hover {
  background-color: var(--light-gray);
}

.modal-body {
  padding: var(--space-4);
}

.booking-detail-section {
  margin-bottom: var(--space-4);
}

.booking-detail-section:last-child {
  margin-bottom: 0;
}

.booking-detail-section h4 {
  color: var(--deep-sea);
  font-size: var(--text-base);
  font-weight: 600;
  margin-bottom: var(--space-3);
  padding-bottom: var(--space-1);
  border-bottom: 1px solid var(--border-gray);
}

.detail-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: var(--space-2);
  font-size: var(--text-sm);
}

.detail-row span:first-child {
  color: var(--medium-gray);
}

.detail-row span:last-child {
  color: var(--dark-gray);
  font-weight: 500;
}

.status-text {
  padding: var(--space-1) var(--space-2);
  border-radius: 4px;
  font-size: var(--text-xs);
  font-weight: 600;
}

.total-amount {
  color: var(--kiwi-orange) !important;
  font-weight: 600 !important;
}

.payment-status.paid {
  color: var(--success) !important;
}

.passenger-detail {
  margin-bottom: var(--space-3);
  padding: var(--space-2);
  background-color: var(--light-gray);
  border-radius: 6px;
}

.passenger-header {
  font-weight: 600;
  color: var(--deep-sea);
  margin-bottom: var(--space-2);
  font-size: var(--text-sm);
}

/* 響應式設計 */
@media (max-width: 768px) {
  .bookings-header {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--space-3);
  }

  .filter-section {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--space-2);
  }

  .booking-header {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--space-3);
  }

  .booking-actions {
    align-self: stretch;
  }

  .booking-actions .btn {
    flex: 1;
  }

  .flight-route {
    flex-direction: column;
    gap: var(--space-3);
  }

  .departure,
  .arrival {
    text-align: left;
  }

  .route-indicator {
    margin: 0;
    align-self: center;
  }

  .flight-details {
    flex-direction: column;
    gap: var(--space-2);
    align-items: flex-start;
  }

  .passenger-list {
    flex-direction: column;
    align-items: flex-start;
  }

  .passenger-item {
    align-self: stretch;
  }

  .modal-content {
    width: 95%;
  }

  .detail-row {
    flex-direction: column;
    gap: var(--space-1);
  }
}
</style>
