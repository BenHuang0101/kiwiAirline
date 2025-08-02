<template>
  <div class="payment-form">
    <!-- 訂單摘要 -->
    <div class="booking-summary">
      <h3 class="summary-title">訂單摘要</h3>
      <div class="summary-content">
        <div class="flight-summary">
          <div class="flight-info">
            <h4>{{ bookingSummary.flight.flightNumber }}</h4>
            <p>{{ bookingSummary.flight.departure.city }} → {{ bookingSummary.flight.arrival.city }}</p>
            <p>{{ formatDateTime(bookingSummary.flight.departure.dateTime) }}</p>
          </div>
          <div class="passenger-summary">
            <p>乘客人數：{{ bookingSummary.passengers.length }} 人</p>
            <div class="passenger-names">
              <div v-for="(passenger, index) in bookingSummary.passengers" :key="index" class="passenger-name">
                {{ passenger.firstName }} {{ passenger.lastName }}
              </div>
            </div>
          </div>
        </div>
        
        <div class="price-breakdown">
          <div class="price-item">
            <span>機票費用</span>
            <span>{{ bookingSummary.flight.price.currency }} {{ bookingSummary.flight.price.amount.toLocaleString() }} × {{ bookingSummary.passengers.length }}</span>
          </div>
          <div class="price-item">
            <span>稅金及手續費</span>
            <span>{{ bookingSummary.flight.price.currency }} {{ calculateTaxes().toLocaleString() }}</span>
          </div>
          <div class="price-item total">
            <span>總金額</span>
            <span>{{ bookingSummary.flight.price.currency }} {{ calculateTotal().toLocaleString() }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 付款表單 -->
    <div class="payment-methods">
      <h3 class="payment-title">付款方式</h3>
      
      <form @submit.prevent="handleSubmit">
        <!-- 付款方式選擇 -->
        <div class="payment-method-selection">
          <label class="payment-method-option">
            <input 
              type="radio" 
              name="paymentMethod" 
              value="credit_card"
              v-model="paymentData.method"
            >
            <div class="method-info">
              <div class="method-icon">
                <svg width="24" height="24" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 2v2H4V6h16zm0 6H4v6h16v-6z"/>
                </svg>
              </div>
              <div class="method-details">
                <span class="method-name">信用卡</span>
                <span class="method-description">Visa, MasterCard, JCB</span>
              </div>
            </div>
          </label>

          <label class="payment-method-option">
            <input 
              type="radio" 
              name="paymentMethod" 
              value="atm_transfer"
              v-model="paymentData.method"
            >
            <div class="method-info">
              <div class="method-icon">
                <svg width="24" height="24" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M11.5 1L2 6v2h20V6l-9.5-5zM2 9v9c0 1.1.9 2 2 2h16c0-1.1-.9-2-2-2H4V9H2z"/>
                </svg>
              </div>
              <div class="method-details">
                <span class="method-name">ATM轉帳</span>
                <span class="method-description">虛擬帳號轉帳</span>
              </div>
            </div>
          </label>
        </div>

        <!-- 信用卡資訊 -->
        <div v-if="paymentData.method === 'credit_card'" class="credit-card-form">
          <div class="form-row">
            <div class="form-group">
              <label for="cardNumber" class="form-label">卡號 *</label>
              <input 
                type="text" 
                id="cardNumber"
                v-model="paymentData.cardNumber"
                class="form-control"
                placeholder="1234 5678 9012 3456"
                maxlength="19"
                @input="formatCardNumber"
                required
                :class="{ 'error': errors.cardNumber }"
              />
              <div v-if="errors.cardNumber" class="form-error">{{ errors.cardNumber }}</div>
            </div>

            <div class="form-group">
              <label for="cardholderName" class="form-label">持卡人姓名 *</label>
              <input 
                type="text" 
                id="cardholderName"
                v-model="paymentData.cardholderName"
                class="form-control"
                placeholder="請輸入持卡人姓名"
                required
                :class="{ 'error': errors.cardholderName }"
              />
              <div v-if="errors.cardholderName" class="form-error">{{ errors.cardholderName }}</div>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="expiryDate" class="form-label">有效期限 *</label>
              <input 
                type="text" 
                id="expiryDate"
                v-model="paymentData.expiryDate"
                class="form-control"
                placeholder="MM/YY"
                maxlength="5"
                @input="formatExpiryDate"
                required
                :class="{ 'error': errors.expiryDate }"
              />
              <div v-if="errors.expiryDate" class="form-error">{{ errors.expiryDate }}</div>
            </div>

            <div class="form-group">
              <label for="cvv" class="form-label">安全碼 *</label>
              <input 
                type="text" 
                id="cvv"
                v-model="paymentData.cvv"
                class="form-control"
                placeholder="123"
                maxlength="4"
                required
                :class="{ 'error': errors.cvv }"
              />
              <div v-if="errors.cvv" class="form-error">{{ errors.cvv }}</div>
            </div>
          </div>
        </div>

        <!-- ATM轉帳資訊 -->
        <div v-if="paymentData.method === 'atm_transfer'" class="atm-transfer-info">
          <div class="info-card">
            <h4>ATM轉帳資訊</h4>
            <p>選擇ATM轉帳後，系統將產生專屬的虛擬帳號供您轉帳。</p>
            <ul>
              <li>請在 24 小時內完成轉帳</li>
              <li>轉帳金額請精確到元</li>
              <li>轉帳完成後，系統將自動確認並發送電子機票</li>
            </ul>
          </div>
        </div>

        <!-- 安全說明 -->
        <div class="security-info">
          <div class="security-badge">
            <svg width="20" height="20" viewBox="0 0 20 20">
              <path fill="currentColor" d="M10 1L3 5v5.5c0 4.1 2.6 7.9 6.4 9.3.2.1.4.1.6.1s.4 0 .6-.1C14.4 18.4 17 14.6 17 10.5V5l-7-4z"/>
            </svg>
            <span>SSL 256位元加密保護</span>
          </div>
          <p>您的付款資訊經由SSL安全加密傳輸，符合PCI DSS安全標準。</p>
        </div>

        <!-- 同意條款 -->
        <div class="agreement">
          <label class="checkbox-label">
            <input 
              type="checkbox" 
              v-model="agreeToTerms"
              class="checkbox"
              required
            >
            <span class="checkbox-text">
              我同意 <a href="#" class="terms-link">購票條款</a> 和 <a href="#" class="terms-link">退改票政策</a>
            </span>
          </label>
          <div v-if="errors.terms" class="form-error">{{ errors.terms }}</div>
        </div>

        <!-- 表單錯誤訊息 -->
        <div v-if="generalError" class="alert alert-error">
          {{ generalError }}
        </div>

        <!-- 提交按鈕 -->
        <div class="form-actions">
          <button 
            type="submit" 
            class="btn btn-primary payment-btn"
            :disabled="isProcessing || !isFormValid"
          >
            <div v-if="isProcessing" class="spinner"></div>
            <span v-if="!isProcessing">確認付款</span>
            <span v-else>處理中...</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  bookingSummary: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['submit'])

// 響應式資料
const paymentData = ref({
  method: 'credit_card',
  cardNumber: '',
  cardholderName: '',
  expiryDate: '',
  cvv: ''
})

const agreeToTerms = ref(false)
const errors = ref({})
const generalError = ref('')
const isProcessing = ref(false)

// 計算屬性
const isFormValid = computed(() => {
  if (!agreeToTerms.value) return false
  
  if (paymentData.value.method === 'credit_card') {
    return paymentData.value.cardNumber &&
           paymentData.value.cardholderName &&
           paymentData.value.expiryDate &&
           paymentData.value.cvv
  }
  
  return true
})

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

const calculateTaxes = () => {
  const basePrice = props.bookingSummary.flight.price.amount
  const passengerCount = props.bookingSummary.passengers.length
  return Math.round(basePrice * passengerCount * 0.15) // 假設稅金為15%
}

const calculateTotal = () => {
  const basePrice = props.bookingSummary.flight.price.amount
  const passengerCount = props.bookingSummary.passengers.length
  const subtotal = basePrice * passengerCount
  const taxes = calculateTaxes()
  return subtotal + taxes
}

// 格式化函數
const formatCardNumber = (event) => {
  let value = event.target.value.replace(/\D/g, '')
  value = value.substring(0, 16)
  value = value.replace(/(\d{4})(?=\d)/g, '$1 ')
  paymentData.value.cardNumber = value
}

const formatExpiryDate = (event) => {
  let value = event.target.value.replace(/\D/g, '')
  value = value.substring(0, 4)
  if (value.length >= 2) {
    value = value.substring(0, 2) + '/' + value.substring(2)
  }
  paymentData.value.expiryDate = value
}

// 表單驗證
const validateForm = () => {
  errors.value = {}
  let isValid = true

  if (!agreeToTerms.value) {
    errors.value.terms = '請同意購票條款'
    isValid = false
  }

  if (paymentData.value.method === 'credit_card') {
    // 信用卡號驗證
    const cardNumber = paymentData.value.cardNumber.replace(/\s/g, '')
    if (!cardNumber) {
      errors.value.cardNumber = '請輸入信用卡號'
      isValid = false
    } else if (cardNumber.length < 13 || cardNumber.length > 19) {
      errors.value.cardNumber = '信用卡號格式錯誤'
      isValid = false
    } else if (!/^\d+$/.test(cardNumber)) {
      errors.value.cardNumber = '信用卡號只能包含數字'
      isValid = false
    }

    // 持卡人姓名驗證
    if (!paymentData.value.cardholderName.trim()) {
      errors.value.cardholderName = '請輸入持卡人姓名'
      isValid = false
    }

    // 有效期限驗證
    if (!paymentData.value.expiryDate) {
      errors.value.expiryDate = '請輸入有效期限'
      isValid = false
    } else if (!/^\d{2}\/\d{2}$/.test(paymentData.value.expiryDate)) {
      errors.value.expiryDate = '有效期限格式錯誤'
      isValid = false
    } else {
      const [month, year] = paymentData.value.expiryDate.split('/')
      const currentDate = new Date()
      const currentYear = currentDate.getFullYear() % 100
      const currentMonth = currentDate.getMonth() + 1
      
      if (parseInt(month) < 1 || parseInt(month) > 12) {
        errors.value.expiryDate = '月份不正確'
        isValid = false
      } else if (parseInt(year) < currentYear || 
                (parseInt(year) === currentYear && parseInt(month) < currentMonth)) {
        errors.value.expiryDate = '信用卡已過期'
        isValid = false
      }
    }

    // CVV驗證
    if (!paymentData.value.cvv) {
      errors.value.cvv = '請輸入安全碼'
      isValid = false
    } else if (!/^\d{3,4}$/.test(paymentData.value.cvv)) {
      errors.value.cvv = '安全碼格式錯誤'
      isValid = false
    }
  }

  return isValid
}

// 處理表單提交
const handleSubmit = async () => {
  generalError.value = ''
  
  if (!validateForm()) {
    generalError.value = '請修正表單中的錯誤'
    return
  }

  isProcessing.value = true

  try {
    // 準備付款資料
    const paymentFormData = {
      method: paymentData.value.method,
      totalAmount: calculateTotal(),
      currency: props.bookingSummary.flight.price.currency
    }

    // 如果是信用卡付款，添加信用卡資訊
    if (paymentData.value.method === 'credit_card') {
      paymentFormData.cardNumber = paymentData.value.cardNumber.replace(/\s/g, '')
      paymentFormData.cardholderName = paymentData.value.cardholderName
      paymentFormData.expiryDate = paymentData.value.expiryDate
      paymentFormData.cvv = paymentData.value.cvv
    }

    // 發送資料給父組件
    emit('submit', paymentFormData)
  } catch (error) {
    console.error('付款處理錯誤:', error)
    generalError.value = '付款處理失敗，請稍後再試'
  } finally {
    isProcessing.value = false
  }
}
</script>

<style scoped>
.payment-form {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-6);
  max-width: 100%;
}

/* 訂單摘要 */
.booking-summary {
  background-color: var(--light-gray);
  border-radius: 8px;
  padding: var(--space-4);
  height: fit-content;
}

.summary-title {
  font-size: var(--text-lg);
  font-weight: 600;
  color: var(--deep-sea);
  margin-bottom: var(--space-4);
}

.flight-summary {
  margin-bottom: var(--space-4);
  padding-bottom: var(--space-4);
  border-bottom: 1px solid var(--border-gray);
}

.flight-info h4 {
  color: var(--kiwi-blue);
  margin-bottom: var(--space-2);
}

.flight-info p {
  color: var(--medium-gray);
  margin-bottom: var(--space-1);
}

.passenger-summary {
  margin-top: var(--space-3);
}

.passenger-names {
  margin-top: var(--space-2);
}

.passenger-name {
  color: var(--medium-gray);
  font-size: var(--text-sm);
  margin-bottom: var(--space-1);
}

.price-breakdown {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.price-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.price-item.total {
  font-weight: 600;
  color: var(--deep-sea);
  font-size: var(--text-lg);
  padding-top: var(--space-2);
  border-top: 1px solid var(--border-gray);
}

/* 付款方式 */
.payment-methods {
  background-color: var(--white);
  border-radius: 8px;
  padding: var(--space-4);
}

.payment-title {
  font-size: var(--text-lg);
  font-weight: 600;
  color: var(--deep-sea);
  margin-bottom: var(--space-4);
}

.payment-method-selection {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  margin-bottom: var(--space-4);
}

.payment-method-option {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-3);
  border: 2px solid var(--border-gray);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.payment-method-option:hover {
  border-color: var(--kiwi-blue);
}

.payment-method-option:has(input:checked) {
  border-color: var(--kiwi-blue);
  background-color: rgba(0, 119, 204, 0.05);
}

.method-info {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  flex: 1;
}

.method-icon {
  color: var(--kiwi-blue);
}

.method-details {
  display: flex;
  flex-direction: column;
}

.method-name {
  font-weight: 600;
  color: var(--deep-sea);
}

.method-description {
  font-size: var(--text-sm);
  color: var(--medium-gray);
}

/* 信用卡表單 */
.credit-card-form {
  background-color: var(--light-gray);
  border-radius: 8px;
  padding: var(--space-4);
  margin-bottom: var(--space-4);
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

/* ATM轉帳資訊 */
.atm-transfer-info {
  margin-bottom: var(--space-4);
}

.info-card {
  background-color: var(--light-gray);
  border-radius: 8px;
  padding: var(--space-4);
}

.info-card h4 {
  color: var(--deep-sea);
  margin-bottom: var(--space-2);
}

.info-card p {
  color: var(--medium-gray);
  margin-bottom: var(--space-3);
}

.info-card ul {
  margin-left: var(--space-4);
  color: var(--medium-gray);
}

.info-card li {
  margin-bottom: var(--space-1);
}

/* 安全說明 */
.security-info {
  background-color: var(--light-gray);
  border-radius: 8px;
  padding: var(--space-4);
  margin-bottom: var(--space-4);
}

.security-badge {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  margin-bottom: var(--space-2);
  color: var(--success);
  font-weight: 600;
}

.security-info p {
  color: var(--medium-gray);
  font-size: var(--text-sm);
}

/* 同意條款 */
.agreement {
  margin-bottom: var(--space-4);
}

.checkbox-label {
  display: flex;
  align-items: flex-start;
  gap: var(--space-2);
  cursor: pointer;
}

.checkbox {
  margin-top: var(--space-1);
  cursor: pointer;
}

.checkbox-text {
  color: var(--dark-gray);
  font-size: var(--text-sm);
  line-height: 1.5;
}

.terms-link {
  color: var(--kiwi-blue);
  text-decoration: none;
}

.terms-link:hover {
  text-decoration: underline;
}

/* 提交按鈕 */
.form-actions {
  display: flex;
  justify-content: flex-end;
}

.payment-btn {
  padding: var(--space-4) var(--space-8);
  font-size: var(--text-base);
  font-weight: 600;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: var(--space-2);
  transition: all 0.3s ease;
}

.payment-btn:disabled {
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
  .payment-form {
    grid-template-columns: 1fr;
  }
  
  .form-row {
    grid-template-columns: 1fr;
  }
  
  .form-actions {
    justify-content: center;
  }
  
  .payment-btn {
    width: 100%;
    max-width: 300px;
  }
}
</style>
