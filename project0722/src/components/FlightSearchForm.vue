<template>
  <div class="flight-search-form">
    <form @submit.prevent="handleSubmit" class="search-form">
      <div class="form-row">
        <!-- 出發地 -->
        <div class="form-group">
          <label for="departure" class="form-label">出發地</label>
          <select 
            id="departure" 
            v-model="formData.departure" 
            class="form-control"
            required
          >
            <option value="">請選擇出發地</option>
            <option v-for="airport in airports" :key="airport.code" :value="airport.code">
              {{ airport.name }} ({{ airport.code }})
            </option>
          </select>
        </div>

        <!-- 目的地 -->
        <div class="form-group">
          <label for="arrival" class="form-label">目的地</label>
          <select 
            id="arrival" 
            v-model="formData.arrival" 
            class="form-control"
            required
          >
            <option value="">請選擇目的地</option>
            <option v-for="airport in airports" :key="airport.code" :value="airport.code">
              {{ airport.name }} ({{ airport.code }})
            </option>
          </select>
        </div>

        <!-- 出發日期 -->
        <div class="form-group">
          <label for="departureDate" class="form-label">出發日期</label>
          <input 
            type="date" 
            id="departureDate"
            v-model="formData.departureDate"
            :min="todayDate"
            class="form-control"
            required
          />
        </div>

        <!-- 乘客人數 -->
        <div class="form-group">
          <label for="passengers" class="form-label">乘客人數</label>
          <select 
            id="passengers" 
            v-model="formData.passengers" 
            class="form-control"
            required
          >
            <option v-for="num in 9" :key="num" :value="num">
              {{ num }} 人
            </option>
          </select>
        </div>

        <!-- 搜尋按鈕 -->
        <div class="form-group">
          <button 
            type="submit" 
            class="btn btn-primary search-btn"
            :disabled="!isFormValid"
          >
            <svg width="20" height="20" viewBox="0 0 20 20">
              <path fill="currentColor" d="M9 2a7 7 0 105.2 11.6l4.6 4.6a1 1 0 001.4-1.4l-4.6-4.6A7 7 0 009 2zm0 2a5 5 0 110 10A5 5 0 019 4z"/>
            </svg>
            搜尋航班
          </button>
        </div>
      </div>

      <!-- 進階選項 -->
      <div class="advanced-options" v-if="showAdvancedOptions">
        <div class="form-row">
          <div class="form-group">
            <label for="sortBy" class="form-label">排序方式</label>
            <select id="sortBy" v-model="formData.sortBy" class="form-control">
              <option value="price">價格</option>
              <option value="time">時間</option>
              <option value="duration">飛行時間</option>
            </select>
          </div>

          <div class="form-group">
            <label for="sortOrder" class="form-label">排序順序</label>
            <select id="sortOrder" v-model="formData.sortOrder" class="form-control">
              <option value="asc">由低到高</option>
              <option value="desc">由高到低</option>
            </select>
          </div>
        </div>
      </div>

      <!-- 進階選項切換 -->
      <div class="advanced-toggle">
        <button 
          type="button" 
          @click="showAdvancedOptions = !showAdvancedOptions"
          class="toggle-btn"
        >
          {{ showAdvancedOptions ? '隱藏' : '顯示' }}進階選項
          <svg 
            width="16" 
            height="16" 
            viewBox="0 0 16 16"
            :class="{ 'rotated': showAdvancedOptions }"
          >
            <path fill="currentColor" d="M8 4l-4 4h8l-4-4z"/>
          </svg>
        </button>
      </div>

      <!-- 表單錯誤訊息 -->
      <div v-if="errorMessage" class="alert alert-error">
        {{ errorMessage }}
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

// 定義事件
const emit = defineEmits(['search'])

// 響應式資料
const formData = ref({
  departure: '',
  arrival: '',
  departureDate: '',
  passengers: 1,
  sortBy: 'price',
  sortOrder: 'asc'
})

const showAdvancedOptions = ref(false)
const errorMessage = ref('')

// 機場資料（依照規格文件中的IATA代碼）
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

// 計算今天的日期
const todayDate = computed(() => {
  return new Date().toISOString().split('T')[0]
})

// 表單驗證
const isFormValid = computed(() => {
  return formData.value.departure && 
         formData.value.arrival && 
         formData.value.departureDate &&
         formData.value.passengers &&
         formData.value.departure !== formData.value.arrival
})

// 初始化表單
onMounted(() => {
  // 設定預設出發日期為今天
  formData.value.departureDate = todayDate.value
})

// 處理表單提交
const handleSubmit = () => {
  errorMessage.value = ''
  
  // 驗證表單
  if (!isFormValid.value) {
    errorMessage.value = '請填寫完整的搜尋條件'
    return
  }

  // 檢查出發地和目的地不能相同
  if (formData.value.departure === formData.value.arrival) {
    errorMessage.value = '出發地和目的地不能相同'
    return
  }

  // 檢查出發日期不能是過去
  const selectedDate = new Date(formData.value.departureDate)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  if (selectedDate < today) {
    errorMessage.value = '出發日期不能是過去的日期'
    return
  }

  // 發送搜尋事件
  emit('search', { ...formData.value })
}

// 重置表單
const resetForm = () => {
  formData.value = {
    departure: '',
    arrival: '',
    departureDate: todayDate.value,
    passengers: 1,
    sortBy: 'price',
    sortOrder: 'asc'
  }
  errorMessage.value = ''
  showAdvancedOptions.value = false
}

// 導出方法供父組件使用
defineExpose({
  resetForm
})
</script>

<style scoped>
.flight-search-form {
  background-color: var(--white);
  border-radius: 12px;
  padding: var(--space-6);
  box-shadow: var(--shadow-lg);
}

.search-form {
  width: 100%;
}

.form-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--space-4);
  margin-bottom: var(--space-4);
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-label {
  font-weight: 600;
  color: var(--deep-sea);
  margin-bottom: var(--space-2);
  font-size: var(--text-sm);
}

.form-control {
  padding: var(--space-3);
  border: 2px solid var(--border-gray);
  border-radius: 8px;
  font-size: var(--text-base);
  transition: all 0.3s ease;
  background-color: var(--white);
}

.form-control:focus {
  outline: none;
  border-color: var(--kiwi-blue);
  box-shadow: 0 0 0 3px rgba(0, 119, 204, 0.1);
}

.search-btn {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-3) var(--space-6);
  font-size: var(--text-base);
  font-weight: 600;
  border-radius: 8px;
  transition: all 0.3s ease;
  align-self: end;
  min-height: 48px;
}

.search-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.search-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}

.advanced-options {
  border-top: 1px solid var(--border-gray);
  padding-top: var(--space-4);
  margin-top: var(--space-4);
}

.advanced-toggle {
  display: flex;
  justify-content: center;
  margin-top: var(--space-4);
}

.toggle-btn {
  background: none;
  border: none;
  color: var(--kiwi-blue);
  cursor: pointer;
  font-size: var(--text-sm);
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-4);
  border-radius: 6px;
  transition: all 0.3s ease;
}

.toggle-btn:hover {
  background-color: var(--light-gray);
}

.toggle-btn svg {
  transition: transform 0.3s ease;
}

.toggle-btn svg.rotated {
  transform: rotate(180deg);
}

.alert {
  margin-top: var(--space-4);
  padding: var(--space-3);
  border-radius: 6px;
  font-size: var(--text-sm);
}

.alert-error {
  background-color: #f8d7da;
  border: 1px solid #f5c6cb;
  color: #721c24;
}

/* 響應式設計 */
@media (max-width: 768px) {
  .form-row {
    grid-template-columns: 1fr;
    gap: var(--space-3);
  }
  
  .flight-search-form {
    padding: var(--space-4);
  }
  
  .search-btn {
    width: 100%;
    justify-content: center;
  }
}

@media (max-width: 480px) {
  .flight-search-form {
    padding: var(--space-3);
    margin: 0 var(--space-2);
  }
  
  .form-control {
    padding: var(--space-2);
  }
  
  .search-btn {
    padding: var(--space-3) var(--space-4);
  }
}

/* 特殊樣式 */
.form-control option {
  padding: var(--space-2);
}

/* 選擇器特殊樣式 */
.form-control:invalid {
  border-color: var(--border-gray);
}

.form-control:valid {
  border-color: var(--success);
}

/* 日期選擇器樣式 */
.form-control[type="date"] {
  position: relative;
  cursor: pointer;
}

.form-control[type="date"]::-webkit-calendar-picker-indicator {
  cursor: pointer;
  padding: var(--space-1);
  border-radius: 4px;
}

.form-control[type="date"]::-webkit-calendar-picker-indicator:hover {
  background-color: var(--light-gray);
}
</style>
