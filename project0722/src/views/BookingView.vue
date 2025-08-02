<template>
  <div class="booking-view">
    <div class="booking-container">
      <!-- 訂票進度指示器 -->
      <div class="progress-indicator">
        <div class="progress-steps">
          <div class="step" :class="{ active: currentStep >= 1, completed: currentStep > 1 }">
            <span class="step-number">1</span>
            <span class="step-label">選擇航班</span>
          </div>
          <div class="step" :class="{ active: currentStep >= 2, completed: currentStep > 2 }">
            <span class="step-number">2</span>
            <span class="step-label">乘客資訊</span>
          </div>
          <div class="step" :class="{ active: currentStep >= 3, completed: currentStep > 3 }">
            <span class="step-number">3</span>
            <span class="step-label">付款</span>
          </div>
          <div class="step" :class="{ active: currentStep >= 4 }">
            <span class="step-number">4</span>
            <span class="step-label">完成</span>
          </div>
        </div>
      </div>

      <!-- 步驟 1: 航班詳情確認 -->
      <div v-if="currentStep === 1" class="step-content">
        <FlightSummary 
          v-if="selectedFlight" 
          :flight="selectedFlight" 
          :passengers="passengerCount"
          @confirm="nextStep" 
        />
      </div>

      <!-- 步驟 2: 乘客資訊 -->
      <div v-if="currentStep === 2" class="step-content">
        <PassengerForm 
          :passenger-count="passengerCount" 
          @submit="handlePassengerSubmit"
        />
      </div>

      <!-- 步驟 3: 付款 -->
      <div v-if="currentStep === 3" class="step-content">
        <PaymentForm 
          :booking-summary="bookingSummary"
          @submit="handlePaymentSubmit"
          :is-processing="bookingStore.isProcessing"
        />
      </div>

      <!-- 步驟 4: 訂票完成 -->
      <div v-if="currentStep === 4" class="step-content">
        <div class="booking-confirmation">
          <div class="success-icon">
            <svg width="64" height="64" viewBox="0 0 64 64">
              <circle cx="32" cy="32" r="32" fill="#10B981"/>
              <path d="M20 32l8 8 16-16" stroke="white" stroke-width="3" fill="none"/>
            </svg>
          </div>
          <h2 class="confirmation-title">訂票成功！</h2>
          <p class="confirmation-message">
            您的訂票已確認，我們已將確認郵件發送至您的信箱
          </p>
          <div class="booking-info" v-if="bookingStore.currentBooking">
            <h3>訂票資訊</h3>
            <p><strong>訂票號碼:</strong> {{ bookingStore.currentBooking.bookingReference || 'KW' + Date.now() }}</p>
            <p><strong>航班號碼:</strong> {{ selectedFlight?.flightNumber }}</p>
            <p><strong>出發時間:</strong> {{ formatDateTime(selectedFlight?.departureTime) }}</p>
            <p><strong>抵達時間:</strong> {{ formatDateTime(selectedFlight?.arrivalTime) }}</p>
          </div>
          <div class="action-buttons">
            <router-link to="/my-bookings" class="btn btn-primary">
              查看我的訂單
            </router-link>
            <router-link to="/" class="btn btn-outline">
              回到首頁
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useFlightStore } from '../stores/flight'
import { useBookingStore } from '../stores/booking'
import { useAuthStore } from '../stores/auth'
import FlightSummary from '../components/FlightSummary.vue'
import PassengerForm from '../components/PassengerForm.vue'
import PaymentForm from '../components/PaymentForm.vue'

// Stores
const flightStore = useFlightStore()
const bookingStore = useBookingStore()
const authStore = useAuthStore()
const router = useRouter()
const route = useRoute()

// 響應式數據
const currentStep = ref(1)

// 計算屬性
const selectedFlight = computed(() => flightStore.selectedFlight)
const passengerCount = computed(() => flightStore.searchCriteria.passengers || 1)
const bookingSummary = computed(() => ({
  flight: selectedFlight.value,
  passengers: bookingStore.passengers,
  totalAmount: selectedFlight.value?.price.amount * passengerCount.value
}))

// 工具函數
const formatDateTime = (dateTimeString) => {
  const date = new Date(dateTimeString)
  return date.toLocaleString('zh-TW', {
    month: 'numeric',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 事件處理
const nextStep = () => {
  if (currentStep.value < 4) {
    currentStep.value++
  }
}

const handlePassengerSubmit = (passengerData) => {
  bookingStore.setPassengers(passengerData)
  nextStep()
}

const handlePaymentSubmit = async (paymentData) => {
  try {
    console.log('💳 處理付款資料...', paymentData)
    console.log('👥 乘客資料:', bookingStore.passengers)
    console.log('✈️ 航班資料:', selectedFlight.value)
    console.log('🔍 航班ID類型和值:', typeof selectedFlight.value?.flightId, selectedFlight.value?.flightId)
    console.log('👤 用戶資料:', authStore.userInfo)
    
    // 如果沒有乘客資料，建立預設乘客
    let passengers = bookingStore.passengers
    if (!passengers || passengers.length === 0) {
      console.log('⚠️ 沒有乘客資料，建立預設乘客')
      passengers = [{
        firstName: '測試',
        lastName: '用戶',
        email: authStore.userInfo?.email || 'test@example.com',
        phone: authStore.userInfo?.phoneNumber || '+886912345678',
        dateOfBirth: '1990-01-01',
        gender: 'other',
        nationality: 'TW',
        passportNumber: 'TEMP123456'
      }]
    }
    
    // 建立訂單（會調用後端 API，後端會模擬付款成功）
    const bookingData = {
      flightId: selectedFlight.value.flightId, // 保持原始字符串格式（UUID）
      passengers: passengers.map(passenger => ({
        firstName: passenger.firstName || '測試',
        lastName: passenger.lastName || '用戶',
        email: passenger.email || authStore.userInfo?.email || 'test@example.com',
        phone: passenger.phoneNumber || passenger.phone || authStore.userInfo?.phoneNumber || '+886912345678',
        dateOfBirth: passenger.dateOfBirth || '1990-01-01',
        gender: passenger.gender || 'other',
        nationality: passenger.nationality || 'TW',
        passportNumber: passenger.passportNumber || 'TEMP123456',
        passportExpiry: '2030-12-31', // 預設護照到期日
        seatPreference: 'none',
        mealPreference: 'regular',
        specialRequests: ''
      })),
      contactInfo: {
        email: authStore.userInfo?.email || 'test@example.com',
        phone: authStore.userInfo?.phoneNumber || '+886912345678'
      },
      payment: {
        cardNumber: paymentData.cardNumber || '4111111111111111',
        expiryMonth: parseInt(paymentData.expiryMonth) || 12,
        expiryYear: parseInt(paymentData.expiryYear) || 2025,
        cvv: paymentData.cvv || '123',
        cardholderName: paymentData.cardholderName || '測試用戶'
      }
    }

    console.log('📝 準備建立訂單...', bookingData)
    
    const result = await bookingStore.createBooking(bookingData)
    
    if (result.success) {
      console.log('✅ 訂單建立成功!', result.data)
      nextStep() // 進入完成步驟
    } else {
      console.error('❌ 訂單建立失敗:', result.message)
      alert(`訂票失敗：${result.message}`)
    }
  } catch (error) {
    console.error('❌ 付款處理失敗:', error)
    alert('訂票失敗，請稍後再試')
  }
}

// 生命週期
onMounted(async () => {
  // 檢查是否有選中的航班
  const flightId = route.params.flightId || route.query.flightId
  
  if (!selectedFlight.value && flightId) {
    // 如果沒有選中的航班但有 flightId，則獲取航班詳情
    console.log('🔍 獲取航班詳情，ID:', flightId)
    const result = await flightStore.getFlightDetails(flightId)
    if (!result.success) {
      console.error('❌ 獲取航班詳情失敗')
      router.push('/')
      return
    }
  }
  
  if (!selectedFlight.value) {
    console.log('❌ 沒有選中的航班，重導向到首頁')
    router.push('/')
    return
  }
  
  console.log('✅ 航班資料已準備好:', selectedFlight.value)
})
</script>

<style scoped>
.booking-view {
  min-height: 100vh;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  padding: 2rem 0;
}

.booking-container {
  max-width: 900px;
  margin: 0 auto;
  padding: 0 1rem;
}

/* 進度指示器 */
.progress-indicator {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.progress-steps {
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
}

.progress-steps::before {
  content: '';
  position: absolute;
  top: 20px;
  left: 40px;
  right: 40px;
  height: 2px;
  background: #e2e8f0;
  z-index: 1;
}

.step {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  z-index: 2;
}

.step-number {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #e2e8f0;
  color: #64748b;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
  transition: all 0.3s ease;
}

.step.active .step-number {
  background: var(--kiwi-blue);
  color: white;
}

.step.completed .step-number {
  background: #10b981;
  color: white;
}

.step-label {
  font-size: 0.875rem;
  color: #64748b;
  text-align: center;
  white-space: nowrap;
}

.step.active .step-label {
  color: var(--kiwi-blue);
  font-weight: 600;
}

/* 步驟內容 */
.step-content {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

/* 訂票確認 */
.booking-confirmation {
  text-align: center;
  padding: 3rem 2rem;
}

.success-icon {
  margin: 0 auto 1.5rem;
  width: 64px;
  height: 64px;
}

.confirmation-title {
  font-size: 2rem;
  font-weight: bold;
  color: #1e293b;
  margin-bottom: 1rem;
}

.confirmation-message {
  font-size: 1.125rem;
  color: #64748b;
  margin-bottom: 2rem;
}

.booking-info {
  background: #f8fafc;
  border-radius: 8px;
  padding: 1.5rem;
  margin: 2rem 0;
  text-align: left;
}

.booking-info h3 {
  margin-bottom: 1rem;
  color: #1e293b;
}

.booking-info p {
  margin-bottom: 0.5rem;
  color: #64748b;
}

.action-buttons {
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-top: 2rem;
}

.btn {
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.3s ease;
  border: 2px solid;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.btn-primary {
  background: var(--kiwi-blue);
  color: white;
  border-color: var(--kiwi-blue);
}

.btn-primary:hover {
  background: #1e40af;
  border-color: #1e40af;
}

.btn-outline {
  background: transparent;
  color: var(--kiwi-blue);
  border-color: var(--kiwi-blue);
}

.btn-outline:hover {
  background: var(--kiwi-blue);
  color: white;
}

/* 響應式設計 */
@media (max-width: 768px) {
  .booking-container {
    padding: 0 0.5rem;
  }
  
  .progress-steps {
    flex-wrap: wrap;
    gap: 1rem;
  }
  
  .progress-steps::before {
    display: none;
  }
  
  .step-label {
    font-size: 0.75rem;
  }
  
  .action-buttons {
    flex-direction: column;
  }
  
  .action-buttons .btn {
    width: 100%;
    max-width: 300px;
  }
}
</style>
