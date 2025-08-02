<template>
  <div class="contact-view">
    <div class="container">
      <!-- 頁面標題 -->
      <div class="page-header">
        <h1 class="page-title">聯繫客服</h1>
        <p class="page-subtitle">我們提供24小時客服服務，隨時為您解答問題</p>
      </div>

      <div class="contact-content">
        <!-- 聯繫方式 -->
        <div class="contact-methods">
          <div class="contact-card">
            <div class="contact-icon">
              <svg width="32" height="32" viewBox="0 0 32 32">
                <path fill="currentColor" d="M16 2C8.3 2 2 8.3 2 16s6.3 14 14 14 14-6.3 14-14S23.7 2 16 2zm0 26C9.4 28 4 22.6 4 16S9.4 4 16 4s12 5.4 12 12-5.4 12-12 12z"/>
                <path fill="currentColor" d="M16 8c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm-1.5 5v9h3v-9h-3z"/>
              </svg>
            </div>
            <h3>客服電話</h3>
            <p class="contact-detail">0800-123-456</p>
            <p class="contact-description">24小時免費客服專線</p>
          </div>

          <div class="contact-card">
            <div class="contact-icon">
              <svg width="32" height="32" viewBox="0 0 32 32">
                <path fill="currentColor" d="M28 6H4c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h24c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zM4 8h24v2.4l-12 7.2L4 10.4V8zm0 16V12.6l12 7.2 12-7.2V24H4z"/>
              </svg>
            </div>
            <h3>電子信箱</h3>
            <p class="contact-detail">service@kiwiairline.com</p>
            <p class="contact-description">24小時內回覆</p>
          </div>

          <div class="contact-card">
            <div class="contact-icon">
              <svg width="32" height="32" viewBox="0 0 32 32">
                <path fill="currentColor" d="M16 2C8.3 2 2 8.3 2 16c0 2.6.7 5.1 2.1 7.3L2 30l7.3-2.1C11.9 29.3 14.4 30 16 30c7.7 0 14-6.3 14-14S23.7 2 16 2zm0 26c-2.2 0-4.3-.6-6.1-1.7L4 28l1.7-5.9C4.6 20.3 4 18.2 4 16c0-6.6 5.4-12 12-12s12 5.4 12 12-5.4 12-12 12z"/>
                <path fill="currentColor" d="M12 10v4h8v-4h-8zm0 6v4h8v-4h-8z"/>
              </svg>
            </div>
            <h3>線上客服</h3>
            <p class="contact-detail">即時聊天</p>
            <p class="contact-description">週一至週日 09:00-21:00</p>
            <button class="btn btn-primary btn-sm" @click="startChat">
              開始聊天
            </button>
          </div>
        </div>

        <!-- 聯繫表單 -->
        <div class="contact-form-section">
          <h2>線上聯繫表單</h2>
          <p class="form-description">請詳細描述您的問題，我們會盡快為您處理</p>
          
          <form @submit.prevent="handleSubmit" class="contact-form">
            <div class="form-row">
              <div class="form-group">
                <label for="name" class="form-label">姓名 *</label>
                <input 
                  type="text" 
                  id="name"
                  v-model="formData.name"
                  class="form-control"
                  placeholder="請輸入您的姓名"
                  required
                  :class="{ 'error': errors.name }"
                />
                <div v-if="errors.name" class="form-error">{{ errors.name }}</div>
              </div>

              <div class="form-group">
                <label for="email" class="form-label">電子信箱 *</label>
                <input 
                  type="email" 
                  id="email"
                  v-model="formData.email"
                  class="form-control"
                  placeholder="example@email.com"
                  required
                  :class="{ 'error': errors.email }"
                />
                <div v-if="errors.email" class="form-error">{{ errors.email }}</div>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label for="phone" class="form-label">聯繫電話</label>
                <input 
                  type="tel" 
                  id="phone"
                  v-model="formData.phone"
                  class="form-control"
                  placeholder="請輸入您的聯繫電話"
                  :class="{ 'error': errors.phone }"
                />
                <div v-if="errors.phone" class="form-error">{{ errors.phone }}</div>
              </div>

              <div class="form-group">
                <label for="category" class="form-label">問題類型 *</label>
                <select 
                  id="category"
                  v-model="formData.category"
                  class="form-control"
                  required
                  :class="{ 'error': errors.category }"
                >
                  <option value="">請選擇問題類型</option>
                  <option value="booking">訂票問題</option>
                  <option value="payment">付款問題</option>
                  <option value="refund">退款問題</option>
                  <option value="flight_change">航班異動</option>
                  <option value="check_in">報到問題</option>
                  <option value="baggage">行李問題</option>
                  <option value="special_needs">特殊需求</option>
                  <option value="complaint">投訴建議</option>
                  <option value="other">其他問題</option>
                </select>
                <div v-if="errors.category" class="form-error">{{ errors.category }}</div>
              </div>
            </div>

            <div class="form-group">
              <label for="bookingReference" class="form-label">訂票編號</label>
              <input 
                type="text" 
                id="bookingReference"
                v-model="formData.bookingReference"
                class="form-control"
                placeholder="如有相關訂票編號，請填寫"
                :class="{ 'error': errors.bookingReference }"
              />
              <div v-if="errors.bookingReference" class="form-error">{{ errors.bookingReference }}</div>
            </div>

            <div class="form-group">
              <label for="subject" class="form-label">問題主旨 *</label>
              <input 
                type="text" 
                id="subject"
                v-model="formData.subject"
                class="form-control"
                placeholder="請簡述您的問題"
                required
                :class="{ 'error': errors.subject }"
              />
              <div v-if="errors.subject" class="form-error">{{ errors.subject }}</div>
            </div>

            <div class="form-group">
              <label for="message" class="form-label">詳細描述 *</label>
              <textarea 
                id="message"
                v-model="formData.message"
                class="form-control"
                rows="6"
                placeholder="請詳細描述您遇到的問題，我們會盡快為您處理"
                required
                :class="{ 'error': errors.message }"
              ></textarea>
              <div v-if="errors.message" class="form-error">{{ errors.message }}</div>
            </div>

            <div class="form-group">
              <label for="priority" class="form-label">緊急程度</label>
              <div class="radio-group">
                <label class="radio-label">
                  <input 
                    type="radio" 
                    name="priority" 
                    value="low"
                    v-model="formData.priority"
                  >
                  <span>一般</span>
                </label>
                <label class="radio-label">
                  <input 
                    type="radio" 
                    name="priority" 
                    value="medium"
                    v-model="formData.priority"
                  >
                  <span>中等</span>
                </label>
                <label class="radio-label">
                  <input 
                    type="radio" 
                    name="priority" 
                    value="high"
                    v-model="formData.priority"
                  >
                  <span>緊急</span>
                </label>
              </div>
            </div>

            <div class="form-group">
              <label class="checkbox-label">
                <input 
                  type="checkbox" 
                  v-model="formData.subscribe"
                  class="checkbox"
                >
                <span class="checkbox-text">
                  我同意接收奇異鳥航空的最新優惠資訊
                </span>
              </label>
            </div>

            <!-- 表單錯誤訊息 -->
            <div v-if="generalError" class="alert alert-error">
              {{ generalError }}
            </div>

            <!-- 成功訊息 -->
            <div v-if="successMessage" class="alert alert-success">
              {{ successMessage }}
            </div>

            <!-- 提交按鈕 -->
            <div class="form-actions">
              <button 
                type="submit" 
                class="btn btn-primary"
                :disabled="isSubmitting"
              >
                <div v-if="isSubmitting" class="spinner"></div>
                <span v-if="!isSubmitting">提交表單</span>
                <span v-else>處理中...</span>
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- 常見問題 -->
      <div class="faq-section">
        <h2>常見問題</h2>
        <div class="faq-list">
          <div 
            v-for="(faq, index) in faqs" 
            :key="index"
            class="faq-item"
          >
            <button 
              @click="toggleFaq(index)"
              class="faq-question"
              :class="{ active: activeFaq === index }"
            >
              <span>{{ faq.question }}</span>
              <svg 
                class="faq-icon" 
                :class="{ rotated: activeFaq === index }"
                width="20" 
                height="20" 
                viewBox="0 0 20 20"
              >
                <path fill="currentColor" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"/>
              </svg>
            </button>
            <div 
              v-if="activeFaq === index"
              class="faq-answer"
            >
              {{ faq.answer }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

// 響應式資料
const formData = ref({
  name: '',
  email: '',
  phone: '',
  category: '',
  bookingReference: '',
  subject: '',
  message: '',
  priority: 'medium',
  subscribe: false
})

const errors = ref({})
const generalError = ref('')
const successMessage = ref('')
const isSubmitting = ref(false)
const activeFaq = ref(null)

// 常見問題資料
const faqs = ref([
  {
    question: '如何查詢我的訂票記錄？',
    answer: '您可以登入會員帳號後，在「我的訂票記錄」頁面查看所有的訂票資訊。如果您沒有會員帳號，可以使用訂票編號和電子信箱進行查詢。'
  },
  {
    question: '如何取消或更改訂票？',
    answer: '您可以在訂票記錄中點擊「取消訂票」或「更改訂票」按鈕。請注意，取消或更改可能會產生手續費，詳細規定請參考購票條款。'
  },
  {
    question: '如何申請退款？',
    answer: '退款申請需要根據您購買的票價類型而定。可退票的訂票可以在線上申請退款，不可退票的訂票則需要符合特殊條件才能申請。'
  },
  {
    question: '忘記密碼怎麼辦？',
    answer: '請在登入頁面點擊「忘記密碼」，輸入您的電子信箱地址，系統會發送重設密碼的連結到您的信箱。'
  },
  {
    question: '可以攜帶多少行李？',
    answer: '行李限制依據您的票價類型而定。一般經濟艙可攜帶20公斤托運行李和7公斤手提行李。詳細規定請參考行李政策。'
  },
  {
    question: '如何線上報到？',
    answer: '您可以在航班起飛前24小時開始線上報到。請準備好您的訂票編號和護照資訊，在我們的官網或手機APP完成報到手續。'
  }
])

// 表單驗證
const validateForm = () => {
  errors.value = {}
  let isValid = true

  // 姓名驗證
  if (!formData.value.name.trim()) {
    errors.value.name = '請輸入姓名'
    isValid = false
  }

  // 電子信箱驗證
  if (!formData.value.email.trim()) {
    errors.value.email = '請輸入電子信箱'
    isValid = false
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.value.email)) {
    errors.value.email = '電子信箱格式不正確'
    isValid = false
  }

  // 聯繫電話驗證（可選）
  if (formData.value.phone && !/^[0-9\-\+\s\(\)]+$/.test(formData.value.phone)) {
    errors.value.phone = '電話號碼格式不正確'
    isValid = false
  }

  // 問題類型驗證
  if (!formData.value.category) {
    errors.value.category = '請選擇問題類型'
    isValid = false
  }

  // 問題主旨驗證
  if (!formData.value.subject.trim()) {
    errors.value.subject = '請輸入問題主旨'
    isValid = false
  }

  // 詳細描述驗證
  if (!formData.value.message.trim()) {
    errors.value.message = '請輸入詳細描述'
    isValid = false
  } else if (formData.value.message.trim().length < 10) {
    errors.value.message = '詳細描述至少需要10個字元'
    isValid = false
  }

  return isValid
}

// 處理表單提交
const handleSubmit = async () => {
  generalError.value = ''
  successMessage.value = ''
  
  if (!validateForm()) {
    generalError.value = '請修正表單中的錯誤'
    return
  }

  isSubmitting.value = true

  try {
    // 模擬API調用
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // 這裡應該調用真實的API
    // await contactService.submitForm(formData.value)
    
    successMessage.value = '您的訊息已成功提交！我們會在24小時內回覆您。'
    
    // 重置表單
    formData.value = {
      name: '',
      email: '',
      phone: '',
      category: '',
      bookingReference: '',
      subject: '',
      message: '',
      priority: 'medium',
      subscribe: false
    }
    
  } catch (error) {
    console.error('提交表單失敗:', error)
    generalError.value = '提交失敗，請稍後再試'
  } finally {
    isSubmitting.value = false
  }
}

// 開始聊天
const startChat = () => {
  // 這裡應該整合真實的聊天系統
  alert('聊天功能開發中，請使用其他聯繫方式')
}

// 切換常見問題
const toggleFaq = (index) => {
  activeFaq.value = activeFaq.value === index ? null : index
}
</script>

<style scoped>
.contact-view {
  min-height: 100vh;
  background-color: var(--background-gray);
  padding: var(--space-6) 0;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 var(--space-4);
}

/* 頁面標題 */
.page-header {
  text-align: center;
  margin-bottom: var(--space-8);
}

.page-title {
  font-size: var(--text-3xl);
  font-weight: 700;
  color: var(--deep-sea);
  margin-bottom: var(--space-2);
}

.page-subtitle {
  font-size: var(--text-lg);
  color: var(--medium-gray);
}

/* 內容區域 */
.contact-content {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: var(--space-8);
  margin-bottom: var(--space-8);
}

/* 聯繫方式 */
.contact-methods {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.contact-card {
  background-color: var(--white);
  padding: var(--space-6);
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  text-align: center;
}

.contact-icon {
  color: var(--kiwi-blue);
  margin-bottom: var(--space-3);
}

.contact-card h3 {
  font-size: var(--text-lg);
  font-weight: 600;
  color: var(--deep-sea);
  margin-bottom: var(--space-2);
}

.contact-detail {
  font-size: var(--text-xl);
  font-weight: 600;
  color: var(--kiwi-blue);
  margin-bottom: var(--space-1);
}

.contact-description {
  color: var(--medium-gray);
  margin-bottom: var(--space-4);
}

/* 聯繫表單 */
.contact-form-section {
  background-color: var(--white);
  padding: var(--space-6);
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.contact-form-section h2 {
  font-size: var(--text-xl);
  font-weight: 600;
  color: var(--deep-sea);
  margin-bottom: var(--space-2);
}

.form-description {
  color: var(--medium-gray);
  margin-bottom: var(--space-6);
}

.contact-form {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-4);
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

textarea.form-control {
  resize: vertical;
  min-height: 120px;
}

.radio-group {
  display: flex;
  gap: var(--space-4);
  margin-top: var(--space-2);
}

.radio-label {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  cursor: pointer;
}

.checkbox-label {
  display: flex;
  align-items: flex-start;
  gap: var(--space-2);
  cursor: pointer;
}

.checkbox-text {
  color: var(--dark-gray);
  font-size: var(--text-sm);
  line-height: 1.5;
}

.form-actions {
  display: flex;
  justify-content: center;
  margin-top: var(--space-4);
}

.btn {
  padding: var(--space-4) var(--space-8);
  font-size: var(--text-base);
  font-weight: 600;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: var(--space-2);
  transition: all 0.3s ease;
  cursor: pointer;
  border: none;
}

.btn-primary {
  background-color: var(--kiwi-blue);
  color: var(--white);
}

.btn-primary:hover {
  background-color: var(--deep-sea);
}

.btn-primary:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.btn-sm {
  padding: var(--space-2) var(--space-4);
  font-size: var(--text-sm);
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

.alert-success {
  background-color: #d1edff;
  border: 1px solid #b3d9ff;
  color: #0066cc;
}

/* 常見問題 */
.faq-section {
  background-color: var(--white);
  padding: var(--space-6);
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.faq-section h2 {
  font-size: var(--text-xl);
  font-weight: 600;
  color: var(--deep-sea);
  margin-bottom: var(--space-6);
  text-align: center;
}

.faq-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.faq-item {
  border: 1px solid var(--border-gray);
  border-radius: 8px;
  overflow: hidden;
}

.faq-question {
  width: 100%;
  padding: var(--space-4);
  background-color: var(--white);
  border: none;
  text-align: left;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  font-size: var(--text-base);
  font-weight: 600;
  color: var(--deep-sea);
  transition: all 0.3s ease;
}

.faq-question:hover {
  background-color: var(--light-gray);
}

.faq-question.active {
  background-color: var(--kiwi-blue);
  color: var(--white);
}

.faq-icon {
  transition: transform 0.3s ease;
}

.faq-icon.rotated {
  transform: rotate(180deg);
}

.faq-answer {
  padding: var(--space-4);
  background-color: var(--light-gray);
  color: var(--dark-gray);
  line-height: 1.6;
  border-top: 1px solid var(--border-gray);
}

/* 響應式設計 */
@media (max-width: 1024px) {
  .contact-content {
    grid-template-columns: 1fr;
  }
  
  .contact-methods {
    flex-direction: row;
    gap: var(--space-4);
  }
  
  .contact-card {
    flex: 1;
  }
}

@media (max-width: 768px) {
  .form-row {
    grid-template-columns: 1fr;
  }
  
  .contact-methods {
    flex-direction: column;
  }
  
  .radio-group {
    flex-direction: column;
    gap: var(--space-2);
  }
  
  .page-title {
    font-size: var(--text-2xl);
  }
  
  .contact-detail {
    font-size: var(--text-lg);
  }
}

@media (max-width: 480px) {
  .container {
    padding: 0 var(--space-2);
  }
  
  .contact-form-section,
  .faq-section {
    padding: var(--space-4);
  }
  
  .contact-card {
    padding: var(--space-4);
  }
}
</style>
