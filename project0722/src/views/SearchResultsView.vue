<template>
  <div class="search-results-view">
    <!-- 搜尋條件摘要 -->
    <section class="search-summary">
      <div class="summary-container">
        <h1 class="summary-title">航班搜尋結果</h1>
        <div class="summary-info">
          <span class="route-info">
            {{ getAirportName(searchCriteria.departure) }} → {{ getAirportName(searchCriteria.arrival) }}
          </span>
          <span class="date-info">{{ formatDate(searchCriteria.departureDate) }}</span>
          <span class="passenger-info">{{ searchCriteria.passengers }} 位乘客</span>
        </div>
        <div class="summary-actions">
          <button @click="showSearchForm = true" class="btn btn-outline">
            修改搜尋條件
          </button>
        </div>
      </div>
    </section>

    <!-- 搜尋表單（摺疊） -->
    <section v-if="showSearchForm" class="search-form-section">
      <div class="search-form-container">
        <FlightSearchForm @search="handleNewSearch" />
        <button @click="showSearchForm = false" class="btn btn-secondary close-search">
          收起搜尋
        </button>
      </div>
    </section>

    <!-- 載入中狀態 -->
    <div v-if="flightStore.isSearching" class="loading-container">
      <div class="spinner"></div>
      <p>正在搜尋航班...</p>
    </div>

    <!-- 搜尋結果 -->
    <section v-else class="results-section">
      <div class="results-container">
        <!-- 篩選和排序 -->
        <div class="filters-sidebar">
          <div class="filter-section">
            <h3 class="filter-title">排序方式</h3>
            <div class="sort-options">
              <label class="sort-option">
                <input 
                  type="radio" 
                  name="sortBy" 
                  value="price"
                  v-model="currentSort.sortBy"
                  @change="handleSort"
                >
                <span>價格 (低到高)</span>
              </label>
              <label class="sort-option">
                <input 
                  type="radio" 
                  name="sortBy" 
                  value="time"
                  v-model="currentSort.sortBy"
                  @change="handleSort"
                >
                <span>起飛時間</span>
              </label>
              <label class="sort-option">
                <input 
                  type="radio" 
                  name="sortBy" 
                  value="duration"
                  v-model="currentSort.sortBy"
                  @change="handleSort"
                >
                <span>飛行時間</span>
              </label>
            </div>
          </div>

          <div class="filter-section">
            <h3 class="filter-title">起飛時間</h3>
            <div class="time-filters">
              <label class="time-filter">
                <input type="checkbox" v-model="timeFilters.morning">
                <span>早班機 (06:00-12:00)</span>
              </label>
              <label class="time-filter">
                <input type="checkbox" v-model="timeFilters.afternoon">
                <span>午班機 (12:00-18:00)</span>
              </label>
              <label class="time-filter">
                <input type="checkbox" v-model="timeFilters.evening">
                <span>晚班機 (18:00-24:00)</span>
              </label>
            </div>
          </div>
        </div>

        <!-- 航班列表 -->
        <div class="flights-list">
          <div class="results-header">
            <h2 class="results-title">
              找到 {{ filteredFlights.length }} 個航班
            </h2>
          </div>

          <div v-if="filteredFlights.length === 0" class="no-results">
            <div class="no-results-content">
              <svg width="64" height="64" viewBox="0 0 64 64">
                <path fill="var(--medium-gray)" d="M32 4C16.536 4 4 16.536 4 32s12.536 28 28 28 28-12.536 28-28S47.464 4 32 4zm0 52C18.745 56 8 45.255 8 32S18.745 8 32 8s24 10.745 24 24-10.745 24-24 24z"/>
                <path fill="var(--medium-gray)" d="M32 16c-8.837 0-16 7.163-16 16 0 3.234.96 6.24 2.607 8.758L44.758 14.607C41.24 15.04 35.234 16 32 16zm11.393 6.242L17.242 48.393C19.76 47.04 22.766 46 26 46c8.837 0 16-7.163 16-16 0-3.234-.96-6.24-2.607-8.758z"/>
              </svg>
              <h3>沒有找到符合條件的航班</h3>
              <p>請嘗試調整搜尋條件或篩選器</p>
              <button @click="showSearchForm = true" class="btn btn-primary">
                修改搜尋條件
              </button>
            </div>
          </div>

          <div v-else class="flight-cards">
            <div 
              v-for="flight in filteredFlights" 
              :key="flight.flightId"
              class="flight-card"
            >
              <div class="flight-header">
                <div class="flight-number">{{ flight.flightNumber }}</div>
                <div class="aircraft-info">{{ flight.aircraft }}</div>
              </div>

              <div class="flight-details">
                <div class="route-info">
                  <div class="departure">
                    <div class="time">{{ formatTime(flight.departure.dateTime) }}</div>
                    <div class="airport">{{ flight.departure.airportCode }}</div>
                    <div class="city">{{ flight.departure.city }}</div>
                  </div>

                  <div class="route-visual">
                    <div class="route-line">
                      <svg width="40" height="20" viewBox="0 0 40 20">
                        <path fill="var(--kiwi-blue)" d="M30 10l-4-4v2H6v4h20v2l4-4z"/>
                      </svg>
                    </div>
                    <div class="duration">{{ flight.duration }}</div>
                  </div>

                  <div class="arrival">
                    <div class="time">{{ formatTime(flight.arrival.dateTime) }}</div>
                    <div class="airport">{{ flight.arrival.airportCode }}</div>
                    <div class="city">{{ flight.arrival.city }}</div>
                  </div>
                </div>

                <div class="flight-meta">
                  <div class="price-info">
                    <div class="price">
                      <span class="currency">{{ flight.price.currency }}</span>
                      <span class="amount">{{ flight.price.amount.toLocaleString() }}</span>
                    </div>
                    <div class="price-note">含稅價格</div>
                  </div>

                  <div class="seats-info">
                    <div class="seats-available">
                      剩餘 {{ flight.availableSeats }} 個座位
                    </div>
                    <div class="cabin-class">{{ flight.class }}</div>
                  </div>
                </div>
              </div>

              <div class="flight-actions">
                <button 
                  @click="selectFlight(flight)"
                  class="btn btn-primary select-btn"
                  :disabled="flight.availableSeats === 0"
                >
                  {{ flight.availableSeats === 0 ? '已售完' : '選擇此航班' }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useFlightStore } from '../stores/flight'
import FlightSearchForm from '../components/FlightSearchForm.vue'

const router = useRouter()
const route = useRoute()
const flightStore = useFlightStore()

// 響應式資料
const showSearchForm = ref(false)
const currentSort = ref({
  sortBy: 'price',
  sortOrder: 'asc'
})
const timeFilters = ref({
  morning: false,
  afternoon: false,
  evening: false
})

// 機場資料
const airports = ref([
  { code: 'TPE', name: '台北桃園國際機場' },
  { code: 'TSA', name: '台北松山機場' },
  { code: 'KHH', name: '高雄小港機場' },
  { code: 'NRT', name: '東京成田國際機場' },
  { code: 'HND', name: '東京羽田機場' },
  { code: 'KIX', name: '大阪關西國際機場' },
  { code: 'ICN', name: '首爾仁川國際機場' },
  { code: 'GMP', name: '首爾金浦機場' },
  { code: 'BKK', name: '曼谷蘇凡納布機場' },
  { code: 'SIN', name: '新加坡樟宜機場' },
  { code: 'HKG', name: '香港國際機場' },
  { code: 'MNL', name: '馬尼拉尼諾阿基諾國際機場' },
  { code: 'KUL', name: '吉隆坡國際機場' },
  { code: 'CGK', name: '雅加達蘇卡諾哈達國際機場' }
])

// 計算屬性
const searchCriteria = computed(() => flightStore.searchCriteria)

const filteredFlights = computed(() => {
  let flights = [...flightStore.searchResults]

  // 時間篩選
  if (timeFilters.value.morning || timeFilters.value.afternoon || timeFilters.value.evening) {
    flights = flights.filter(flight => {
      const departureTime = new Date(flight.departure.dateTime)
      const hour = departureTime.getHours()
      
      return (
        (timeFilters.value.morning && hour >= 6 && hour < 12) ||
        (timeFilters.value.afternoon && hour >= 12 && hour < 18) ||
        (timeFilters.value.evening && hour >= 18 && hour < 24)
      )
    })
  }

  return flights
})

// 工具函數
const getAirportName = (code) => {
  const airport = airports.value.find(a => a.code === code)
  return airport ? airport.name : code
}

const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-TW', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const formatTime = (dateTimeString) => {
  if (!dateTimeString) return ''
  const date = new Date(dateTimeString)
  return date.toLocaleTimeString('zh-TW', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 事件處理
const handleNewSearch = (searchData) => {
  showSearchForm.value = false
  performSearch(searchData)
}

const handleSort = () => {
  flightStore.sortFlights(currentSort.value.sortBy, currentSort.value.sortOrder)
}

const selectFlight = (flight) => {
  if (flight.availableSeats === 0) return
  
  // 儲存選擇的航班
  flightStore.selectedFlight = flight
  
  // 跳轉到訂票頁面
  router.push({
    name: 'booking',
    params: { flightId: flight.flightId }
  })
}

const performSearch = async (criteria) => {
  try {
    await flightStore.searchFlights(criteria)
  } catch (error) {
    console.error('搜尋失敗:', error)
  }
}

// 監聽路由變化
watch(() => route.query, (newQuery) => {
  if (newQuery.departure && newQuery.arrival && newQuery.departureDate) {
    performSearch(newQuery)
  }
}, { immediate: true })

// 頁面載入
onMounted(() => {
  // 如果有查詢參數，執行搜尋
  if (route.query.departure && route.query.arrival && route.query.departureDate) {
    performSearch(route.query)
  }
})
</script>

<style scoped>
.search-results-view {
  min-height: 100vh;
  background-color: var(--light-gray);
}

/* 搜尋條件摘要 */
.search-summary {
  background-color: var(--white);
  border-bottom: 1px solid var(--border-gray);
  padding: var(--space-6) 0;
}

.summary-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 var(--space-4);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.summary-title {
  font-size: var(--text-2xl);
  font-weight: 700;
  color: var(--deep-sea);
  margin-bottom: var(--space-2);
}

.summary-info {
  display: flex;
  gap: var(--space-4);
  align-items: center;
}

.route-info {
  font-size: var(--text-lg);
  font-weight: 600;
  color: var(--kiwi-blue);
}

.date-info,
.passenger-info {
  color: var(--medium-gray);
}

/* 搜尋表單區塊 */
.search-form-section {
  background-color: var(--white);
  padding: var(--space-6) 0;
  border-bottom: 1px solid var(--border-gray);
}

.search-form-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 var(--space-4);
}

.close-search {
  margin-top: var(--space-4);
  display: block;
  margin-left: auto;
  margin-right: auto;
}

/* 載入狀態 */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--space-16);
  color: var(--medium-gray);
}

/* 搜尋結果 */
.results-section {
  padding: var(--space-6) 0;
}

.results-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 var(--space-4);
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: var(--space-6);
}

/* 篩選側邊欄 */
.filters-sidebar {
  background-color: var(--white);
  border-radius: 8px;
  padding: var(--space-4);
  height: fit-content;
  box-shadow: var(--shadow-sm);
}

.filter-section {
  margin-bottom: var(--space-6);
}

.filter-section:last-child {
  margin-bottom: 0;
}

.filter-title {
  font-size: var(--text-base);
  font-weight: 600;
  color: var(--deep-sea);
  margin-bottom: var(--space-3);
}

.sort-options,
.time-filters {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.sort-option,
.time-filter {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  cursor: pointer;
}

.sort-option input,
.time-filter input {
  cursor: pointer;
}

/* 航班列表 */
.flights-list {
  background-color: var(--white);
  border-radius: 8px;
  padding: var(--space-4);
  box-shadow: var(--shadow-sm);
}

.results-header {
  margin-bottom: var(--space-6);
}

.results-title {
  font-size: var(--text-xl);
  font-weight: 600;
  color: var(--deep-sea);
}

/* 無結果狀態 */
.no-results {
  text-align: center;
  padding: var(--space-12);
}

.no-results-content h3 {
  color: var(--deep-sea);
  margin: var(--space-4) 0;
}

.no-results-content p {
  color: var(--medium-gray);
  margin-bottom: var(--space-6);
}

/* 航班卡片 */
.flight-cards {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.flight-card {
  border: 1px solid var(--border-gray);
  border-radius: 8px;
  padding: var(--space-4);
  transition: all 0.3s ease;
}

.flight-card:hover {
  border-color: var(--kiwi-blue);
  box-shadow: var(--shadow-md);
}

.flight-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-4);
}

.flight-number {
  font-size: var(--text-lg);
  font-weight: 600;
  color: var(--kiwi-blue);
}

.aircraft-info {
  color: var(--medium-gray);
  font-size: var(--text-sm);
}

.flight-details {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: var(--space-6);
  margin-bottom: var(--space-4);
}

.route-info {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  gap: var(--space-4);
  align-items: center;
}

.departure,
.arrival {
  text-align: center;
}

.departure .time,
.arrival .time {
  font-size: var(--text-xl);
  font-weight: 600;
  color: var(--deep-sea);
}

.departure .airport,
.arrival .airport {
  font-size: var(--text-lg);
  font-weight: 500;
  color: var(--kiwi-blue);
}

.departure .city,
.arrival .city {
  font-size: var(--text-sm);
  color: var(--medium-gray);
}

.route-visual {
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.route-line {
  margin-bottom: var(--space-1);
}

.duration {
  font-size: var(--text-sm);
  color: var(--medium-gray);
}

.flight-meta {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: var(--space-2);
}

.price-info {
  text-align: right;
}

.price {
  font-size: var(--text-2xl);
  font-weight: 700;
  color: var(--kiwi-orange);
}

.currency {
  font-size: var(--text-sm);
  margin-right: var(--space-1);
}

.price-note {
  font-size: var(--text-xs);
  color: var(--medium-gray);
}

.seats-info {
  text-align: right;
}

.seats-available {
  font-size: var(--text-sm);
  color: var(--medium-gray);
}

.cabin-class {
  font-size: var(--text-sm);
  color: var(--success);
}

.flight-actions {
  display: flex;
  justify-content: flex-end;
}

.select-btn {
  padding: var(--space-3) var(--space-6);
}

.select-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* 響應式設計 */
@media (max-width: 768px) {
  .summary-container {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--space-4);
  }

  .summary-info {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--space-2);
  }

  .results-container {
    grid-template-columns: 1fr;
  }

  .flight-details {
    grid-template-columns: 1fr;
    gap: var(--space-4);
  }

  .flight-meta {
    align-items: flex-start;
  }

  .price-info,
  .seats-info {
    text-align: left;
  }
}
</style>
