<template>
  <div class="flight-summary">
    <div class="summary-header">
      <h2>航班詳情確認</h2>
      <p>請確認您選擇的航班信息</p>
    </div>
    
    <div class="flight-card">
      <div class="flight-header">
        <div class="airline-info">
          <h3>{{ flight.airline }}</h3>
          <span class="flight-number">{{ flight.flightNumber }}</span>
        </div>
        <div class="flight-type">
          <span class="badge">{{ flightTypeText }}</span>
        </div>
      </div>
      
      <div class="flight-route">
        <div class="departure-info">
          <div class="time">{{ formatTime(flight.departureTime) }}</div>
          <div class="airport">
            <div class="airport-code">{{ flight.departure.airport.code }}</div>
            <div class="airport-name">{{ flight.departure.airport.name }}</div>
            <div class="city">{{ flight.departure.city }}</div>
          </div>
        </div>
        
        <div class="flight-duration">
          <div class="duration-line">
            <div class="duration-dot"></div>
            <div class="duration-bar"></div>
            <div class="duration-dot"></div>
          </div>
          <div class="duration-text">{{ formatDuration(flight.duration) }}</div>
          <div class="flight-type-small">{{ flight.type === 'direct' ? '直飛' : '轉機' }}</div>
        </div>
        
        <div class="arrival-info">
          <div class="time">{{ formatTime(flight.arrivalTime) }}</div>
          <div class="airport">
            <div class="airport-code">{{ flight.arrival.airport.code }}</div>
            <div class="airport-name">{{ flight.arrival.airport.name }}</div>
            <div class="city">{{ flight.arrival.city }}</div>
          </div>
        </div>
      </div>
      
      <div class="flight-details">
        <div class="detail-item">
          <span class="label">航班日期:</span>
          <span class="value">{{ formatDate(flight.departureTime) }}</span>
        </div>
        <div class="detail-item">
          <span class="label">飛行時長:</span>
          <span class="value">{{ formatDuration(flight.duration) }}</span>
        </div>
        <div class="detail-item">
          <span class="label">機型:</span>
          <span class="value">{{ flight.aircraft || '空中巴士A320' }}</span>
        </div>
      </div>
    </div>
    
    <div class="booking-summary">
      <h3>訂票摘要</h3>
      <div class="summary-details">
        <div class="summary-item">
          <span class="label">乘客人數:</span>
          <span class="value">{{ passengers }} 人</span>
        </div>
        <div class="summary-item">
          <span class="label">艙等:</span>
          <span class="value">{{ classText }}</span>
        </div>
        <div class="summary-item">
          <span class="label">票價 (每人):</span>
          <span class="value">NT$ {{ flight.price.amount.toLocaleString() }}</span>
        </div>
        <div class="summary-item total">
          <span class="label">總金額:</span>
          <span class="value">NT$ {{ totalAmount.toLocaleString() }}</span>
        </div>
      </div>
    </div>
    
    <div class="actions">
      <button @click="$emit('confirm')" class="btn btn-primary">
        確認並繼續
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

// Props
const props = defineProps({
  flight: {
    type: Object,
    required: true
  },
  passengers: {
    type: Number,
    default: 1
  },
  seatClass: {
    type: String,
    default: 'economy'
  }
})

// Emits
const emit = defineEmits(['confirm'])

// 計算屬性
const flightTypeText = computed(() => {
  return props.flight.type === 'direct' ? '直飛' : '轉機'
})

const classText = computed(() => {
  const classMap = {
    economy: '經濟艙',
    business: '商務艙',
    first: '頭等艙'
  }
  return classMap[props.seatClass] || '經濟艙'
})

const totalAmount = computed(() => {
  return props.flight.price.amount * props.passengers
})

// 工具函數
const formatTime = (datetime) => {
  const date = new Date(datetime)
  return date.toLocaleTimeString('zh-TW', { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: false 
  })
}

const formatDate = (datetime) => {
  const date = new Date(datetime)
  return date.toLocaleDateString('zh-TW', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const formatDuration = (minutes) => {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return `${hours}小時${mins}分鐘`
}
</script>

<style scoped>
.flight-summary {
  padding: 2rem;
}

.summary-header {
  text-align: center;
  margin-bottom: 2rem;
}

.summary-header h2 {
  color: #1e293b;
  margin-bottom: 0.5rem;
}

.summary-header p {
  color: #64748b;
}

.flight-card {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
}

.flight-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.airline-info h3 {
  color: #1e293b;
  margin-bottom: 0.25rem;
}

.flight-number {
  color: #64748b;
  font-size: 0.875rem;
}

.badge {
  background: var(--kiwi-blue);
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 500;
}

.flight-route {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  gap: 1rem;
  align-items: center;
  margin-bottom: 1.5rem;
}

.departure-info,
.arrival-info {
  text-align: center;
}

.departure-info {
  text-align: left;
}

.arrival-info {
  text-align: right;
}

.time {
  font-size: 1.5rem;
  font-weight: bold;
  color: #1e293b;
  margin-bottom: 0.5rem;
}

.airport-code {
  font-size: 1.25rem;
  font-weight: bold;
  color: var(--kiwi-blue);
  margin-bottom: 0.25rem;
}

.airport-name {
  font-size: 0.875rem;
  color: #64748b;
  margin-bottom: 0.25rem;
}

.city {
  font-size: 0.875rem;
  color: #64748b;
}

.flight-duration {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 120px;
}

.duration-line {
  display: flex;
  align-items: center;
  width: 100%;
  margin-bottom: 0.5rem;
}

.duration-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--kiwi-blue);
}

.duration-bar {
  flex: 1;
  height: 2px;
  background: var(--kiwi-blue);
  margin: 0 0.5rem;
}

.duration-text {
  font-size: 0.875rem;
  color: #64748b;
  margin-bottom: 0.25rem;
}

.flight-type-small {
  font-size: 0.75rem;
  color: #64748b;
}

.flight-details {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #e2e8f0;
}

.detail-item {
  display: flex;
  justify-content: space-between;
}

.detail-item .label {
  color: #64748b;
}

.detail-item .value {
  color: #1e293b;
  font-weight: 500;
}

.booking-summary {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
}

.booking-summary h3 {
  color: #1e293b;
  margin-bottom: 1rem;
}

.summary-details {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.summary-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.summary-item.total {
  padding-top: 0.75rem;
  border-top: 1px solid #e2e8f0;
  font-weight: bold;
  font-size: 1.125rem;
}

.summary-item .label {
  color: #64748b;
}

.summary-item .value {
  color: #1e293b;
  font-weight: 500;
}

.summary-item.total .value {
  color: var(--kiwi-blue);
}

.actions {
  text-align: center;
}

.btn {
  padding: 0.75rem 2rem;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-primary {
  background: var(--kiwi-blue);
  color: white;
}

.btn-primary:hover {
  background: #1e40af;
}

/* 響應式設計 */
@media (max-width: 768px) {
  .flight-summary {
    padding: 1rem;
  }
  
  .flight-route {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
  
  .departure-info,
  .arrival-info {
    text-align: center;
  }
  
  .flight-duration {
    order: -1;
  }
  
  .duration-line {
    transform: rotate(90deg);
    height: 60px;
    width: 2px;
    margin: 0 auto;
  }
  
  .duration-bar {
    width: 2px;
    height: 40px;
    margin: 0.5rem 0;
  }
  
  .flight-details {
    grid-template-columns: 1fr;
  }
}
</style>
