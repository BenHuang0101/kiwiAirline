<template>
  <div class="passenger-form">
    <form @submit.prevent="handleSubmit">
      <div 
        v-for="(passenger, index) in passengers" 
        :key="index"
        class="passenger-section"
      >
        <h3 class="passenger-title">
          乘客 {{ index + 1 }}
          <span v-if="index === 0" class="primary-passenger">(主要聯絡人)</span>
        </h3>

        <div class="form-row">
          <!-- 姓氏 -->
          <div class="form-group">
            <label :for="`firstName-${index}`" class="form-label">姓氏 *</label>
            <input 
              type="text" 
              :id="`firstName-${index}`"
              v-model="passenger.firstName"
              class="form-control"
              placeholder="請輸入姓氏"
              required
              :class="{ 'error': errors[`passenger${index}FirstName`] }"
            />
            <div v-if="errors[`passenger${index}FirstName`]" class="form-error">
              {{ errors[`passenger${index}FirstName`] }}
            </div>
          </div>

          <!-- 名字 -->
          <div class="form-group">
            <label :for="`lastName-${index}`" class="form-label">名字 *</label>
            <input 
              type="text" 
              :id="`lastName-${index}`"
              v-model="passenger.lastName"
              class="form-control"
              placeholder="請輸入名字"
              required
              :class="{ 'error': errors[`passenger${index}LastName`] }"
            />
            <div v-if="errors[`passenger${index}LastName`]" class="form-error">
              {{ errors[`passenger${index}LastName`] }}
            </div>
          </div>
        </div>

        <div class="form-row">
          <!-- 護照號碼 -->
          <div class="form-group">
            <label :for="`passport-${index}`" class="form-label">護照號碼 *</label>
            <input 
              type="text" 
              :id="`passport-${index}`"
              v-model="passenger.passportNumber"
              class="form-control"
              placeholder="請輸入護照號碼"
              required
              :class="{ 'error': errors[`passenger${index}Passport`] }"
            />
            <div v-if="errors[`passenger${index}Passport`]" class="form-error">
              {{ errors[`passenger${index}Passport`] }}
            </div>
          </div>

          <!-- 出生日期 -->
          <div class="form-group">
            <label :for="`birth-${index}`" class="form-label">出生日期 *</label>
            <input 
              type="date" 
              :id="`birth-${index}`"
              v-model="passenger.dateOfBirth"
              class="form-control"
              required
              :max="maxBirthDate"
              :class="{ 'error': errors[`passenger${index}Birth`] }"
            />
            <div v-if="errors[`passenger${index}Birth`]" class="form-error">
              {{ errors[`passenger${index}Birth`] }}
            </div>
          </div>
        </div>

        <div class="form-row">
          <!-- 國籍 -->
          <div class="form-group">
            <label :for="`nationality-${index}`" class="form-label">國籍 *</label>
            <select 
              :id="`nationality-${index}`"
              v-model="passenger.nationality"
              class="form-control"
              required
              :class="{ 'error': errors[`passenger${index}Nationality`] }"
            >
              <option value="">請選擇國籍</option>
              <option v-for="country in countries" :key="country.code" :value="country.code">
                {{ country.name }}
              </option>
            </select>
            <div v-if="errors[`passenger${index}Nationality`]" class="form-error">
              {{ errors[`passenger${index}Nationality`] }}
            </div>
          </div>

          <!-- 性別 -->
          <div class="form-group">
            <label :for="`gender-${index}`" class="form-label">性別</label>
            <select 
              :id="`gender-${index}`"
              v-model="passenger.gender"
              class="form-control"
            >
              <option value="">請選擇性別</option>
              <option value="M">男性</option>
              <option value="F">女性</option>
              <option value="OTHER">其他</option>
            </select>
          </div>
        </div>

        <!-- 聯絡資訊（僅主要聯絡人） -->
        <div v-if="index === 0" class="contact-section">
          <h4 class="contact-title">聯絡資訊</h4>
          
          <div class="form-row">
            <div class="form-group">
              <label :for="`email-${index}`" class="form-label">電子郵件 *</label>
              <input 
                type="email" 
                :id="`email-${index}`"
                v-model="passenger.email"
                class="form-control"
                placeholder="請輸入電子郵件"
                required
                :class="{ 'error': errors[`passenger${index}Email`] }"
              />
              <div v-if="errors[`passenger${index}Email`]" class="form-error">
                {{ errors[`passenger${index}Email`] }}
              </div>
            </div>

            <div class="form-group">
              <label :for="`phone-${index}`" class="form-label">手機號碼 *</label>
              <input 
                type="tel" 
                :id="`phone-${index}`"
                v-model="passenger.phoneNumber"
                class="form-control"
                placeholder="請輸入手機號碼"
                required
                :class="{ 'error': errors[`passenger${index}Phone`] }"
              />
              <div v-if="errors[`passenger${index}Phone`]" class="form-error">
                {{ errors[`passenger${index}Phone`] }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 表單總錯誤訊息 -->
      <div v-if="generalError" class="alert alert-error">
        {{ generalError }}
      </div>

      <!-- 提交按鈕 -->
      <div class="form-actions">
        <button 
          type="submit" 
          class="btn btn-primary"
          :disabled="isSubmitting"
        >
          <div v-if="isSubmitting" class="spinner"></div>
          {{ isSubmitting ? '處理中...' : '確認乘客資訊' }}
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '../stores/auth'

const props = defineProps({
  passengerCount: {
    type: Number,
    default: 1
  }
})

const emit = defineEmits(['submit'])

const authStore = useAuthStore()

// 響應式資料
const passengers = ref([])
const errors = ref({})
const generalError = ref('')
const isSubmitting = ref(false)

// 國家列表
const countries = ref([
  { code: 'TW', name: '台灣' },
  { code: 'CN', name: '中國' },
  { code: 'JP', name: '日本' },
  { code: 'KR', name: '韓國' },
  { code: 'US', name: '美國' },
  { code: 'UK', name: '英國' },
  { code: 'SG', name: '新加坡' },
  { code: 'TH', name: '泰國' },
  { code: 'MY', name: '馬來西亞' },
  { code: 'ID', name: '印尼' },
  { code: 'PH', name: '菲律賓' },
  { code: 'VN', name: '越南' },
  { code: 'AU', name: '澳洲' },
  { code: 'CA', name: '加拿大' },
  { code: 'FR', name: '法國' },
  { code: 'DE', name: '德國' },
  { code: 'IT', name: '義大利' },
  { code: 'ES', name: '西班牙' },
  { code: 'NL', name: '荷蘭' },
  { code: 'CH', name: '瑞士' }
])

// 計算屬性
const maxBirthDate = computed(() => {
  // 最小年齡設為0歲（今天出生）
  return new Date().toISOString().split('T')[0]
})

// 初始化乘客資料
const initializePassengers = () => {
  passengers.value = Array.from({ length: props.passengerCount }, (_, index) => ({
    firstName: '',
    lastName: '',
    passportNumber: '',
    dateOfBirth: '',
    nationality: 'TW', // 預設為台灣
    gender: '',
    email: index === 0 ? authStore.userInfo?.email || '' : '',
    phoneNumber: index === 0 ? authStore.userInfo?.phoneNumber || '' : ''
  }))
}

// 表單驗證
const validateForm = () => {
  errors.value = {}
  let isValid = true

  passengers.value.forEach((passenger, index) => {
    // 姓氏驗證
    if (!passenger.firstName.trim()) {
      errors.value[`passenger${index}FirstName`] = '請輸入姓氏'
      isValid = false
    } else if (passenger.firstName.length > 50) {
      errors.value[`passenger${index}FirstName`] = '姓氏長度不能超過50個字元'
      isValid = false
    }

    // 名字驗證
    if (!passenger.lastName.trim()) {
      errors.value[`passenger${index}LastName`] = '請輸入名字'
      isValid = false
    } else if (passenger.lastName.length > 50) {
      errors.value[`passenger${index}LastName`] = '名字長度不能超過50個字元'
      isValid = false
    }

    // 護照號碼驗證
    if (!passenger.passportNumber.trim()) {
      errors.value[`passenger${index}Passport`] = '請輸入護照號碼'
      isValid = false
    } else if (!/^[A-Z0-9]{8,9}$/.test(passenger.passportNumber.toUpperCase())) {
      errors.value[`passenger${index}Passport`] = '護照號碼格式錯誤'
      isValid = false
    }

    // 出生日期驗證
    if (!passenger.dateOfBirth) {
      errors.value[`passenger${index}Birth`] = '請選擇出生日期'
      isValid = false
    } else {
      const birthDate = new Date(passenger.dateOfBirth)
      const today = new Date()
      const age = today.getFullYear() - birthDate.getFullYear()
      
      if (age > 120) {
        errors.value[`passenger${index}Birth`] = '出生日期不合理'
        isValid = false
      }
    }

    // 國籍驗證
    if (!passenger.nationality) {
      errors.value[`passenger${index}Nationality`] = '請選擇國籍'
      isValid = false
    }

    // 主要聯絡人的聯絡資訊驗證
    if (index === 0) {
      // 電子郵件驗證
      if (!passenger.email.trim()) {
        errors.value[`passenger${index}Email`] = '請輸入電子郵件'
        isValid = false
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(passenger.email)) {
        errors.value[`passenger${index}Email`] = '電子郵件格式錯誤'
        isValid = false
      }

      // 手機號碼驗證
      if (!passenger.phoneNumber.trim()) {
        errors.value[`passenger${index}Phone`] = '請輸入手機號碼'
        isValid = false
      } else if (!/^09\d{8}$/.test(passenger.phoneNumber)) {
        errors.value[`passenger${index}Phone`] = '手機號碼格式錯誤'
        isValid = false
      }
    }
  })

  return isValid
}

// 處理表單提交
const handleSubmit = async () => {
  generalError.value = ''
  
  if (!validateForm()) {
    generalError.value = '請修正表單中的錯誤'
    return
  }

  isSubmitting.value = true

  try {
    // 格式化資料
    const formattedPassengers = passengers.value.map(passenger => ({
      ...passenger,
      passportNumber: passenger.passportNumber.toUpperCase()
    }))

    // 發送資料給父組件
    emit('submit', formattedPassengers)
  } catch (error) {
    console.error('提交乘客資訊錯誤:', error)
    generalError.value = '提交失敗，請稍後再試'
  } finally {
    isSubmitting.value = false
  }
}

// 頁面載入時初始化
onMounted(() => {
  initializePassengers()
})
</script>

<style scoped>
.passenger-form {
  max-width: 100%;
}

.passenger-section {
  background-color: var(--light-gray);
  border-radius: 8px;
  padding: var(--space-4);
  margin-bottom: var(--space-4);
}

.passenger-title {
  font-size: var(--text-lg);
  font-weight: 600;
  color: var(--deep-sea);
  margin-bottom: var(--space-4);
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.primary-passenger {
  font-size: var(--text-sm);
  font-weight: normal;
  color: var(--kiwi-orange);
  background-color: var(--white);
  padding: var(--space-1) var(--space-2);
  border-radius: 4px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
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

.form-control.error {
  border-color: var(--danger);
}

.form-error {
  margin-top: var(--space-2);
  color: var(--danger);
  font-size: var(--text-sm);
}

.contact-section {
  margin-top: var(--space-4);
  padding-top: var(--space-4);
  border-top: 1px solid var(--border-gray);
}

.contact-title {
  font-size: var(--text-base);
  font-weight: 600;
  color: var(--deep-sea);
  margin-bottom: var(--space-4);
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: var(--space-6);
}

.btn {
  padding: var(--space-3) var(--space-8);
  font-size: var(--text-base);
  font-weight: 600;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: var(--space-2);
  transition: all 0.3s ease;
}

.btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.spinner {
  width: 20px;
  height: 20px;
  border: 2px solid transparent;
  border-top: 2px solid var(--white);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.alert {
  padding: var(--space-3);
  border-radius: 6px;
  margin-bottom: var(--space-4);
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
  
  .passenger-section {
    padding: var(--space-3);
  }
  
  .form-actions {
    justify-content: center;
  }
  
  .btn {
    width: 100%;
    max-width: 300px;
  }
}

@media (max-width: 480px) {
  .passenger-title {
    font-size: var(--text-base);
    flex-direction: column;
    align-items: flex-start;
  }
  
  .primary-passenger {
    font-size: var(--text-xs);
  }
}
</style>
