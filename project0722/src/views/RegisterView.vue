<template>
  <div class="register-view">
    <div class="register-container">
      <div class="register-card">
        <div class="register-header">
          <h1 class="register-title">會員註冊</h1>
          <p class="register-subtitle">加入奇異鳥航空，享受更便利的旅行體驗</p>
        </div>

        <form @submit.prevent="handleRegister" class="register-form">
          <!-- 姓名 -->
          <div class="form-row">
            <div class="form-group">
              <label for="firstName" class="form-label">姓氏 *</label>
              <input 
                type="text" 
                id="firstName"
                v-model="registerForm.firstName"
                class="form-control"
                placeholder="請輸入您的姓氏"
                required
                :class="{ 'error': firstNameError }"
              />
              <div v-if="firstNameError" class="form-error">{{ firstNameError }}</div>
            </div>

            <div class="form-group">
              <label for="lastName" class="form-label">名字 *</label>
              <input 
                type="text" 
                id="lastName"
                v-model="registerForm.lastName"
                class="form-control"
                placeholder="請輸入您的名字"
                required
                :class="{ 'error': lastNameError }"
              />
              <div v-if="lastNameError" class="form-error">{{ lastNameError }}</div>
            </div>
          </div>

          <!-- 電子郵件 -->
          <div class="form-group">
            <label for="email" class="form-label">電子郵件 *</label>
            <input 
              type="email" 
              id="email"
              v-model="registerForm.email"
              class="form-control"
              placeholder="請輸入您的電子郵件"
              required
              :class="{ 'error': emailError }"
            />
            <div v-if="emailError" class="form-error">{{ emailError }}</div>
          </div>

          <!-- 手機號碼 -->
          <div class="form-group">
            <label for="phoneNumber" class="form-label">手機號碼 *</label>
            <input 
              type="tel" 
              id="phoneNumber"
              v-model="registerForm.phoneNumber"
              class="form-control"
              placeholder="請輸入您的手機號碼"
              required
              :class="{ 'error': phoneError }"
            />
            <div v-if="phoneError" class="form-error">{{ phoneError }}</div>
          </div>

          <!-- 密碼 -->
          <div class="form-group">
            <label for="password" class="form-label">密碼 *</label>
            <div class="password-input-container">
              <input 
                :type="showPassword ? 'text' : 'password'"
                id="password"
                v-model="registerForm.password"
                class="form-control"
                placeholder="請輸入密碼（至少8個字元）"
                required
                :class="{ 'error': passwordError }"
              />
              <button 
                type="button" 
                @click="togglePasswordVisibility"
                class="password-toggle"
              >
                <svg width="20" height="20" viewBox="0 0 20 20">
                  <path v-if="!showPassword" fill="currentColor" d="M10 12a2 2 0 100-4 2 2 0 000 4z"/>
                  <path v-if="!showPassword" fill="currentColor" fill-rule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clip-rule="evenodd"/>
                  <path v-if="showPassword" fill="currentColor" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z"/>
                  <path v-if="showPassword" fill="currentColor" d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z"/>
                </svg>
              </button>
            </div>
            <div v-if="passwordError" class="form-error">{{ passwordError }}</div>
            <div class="password-strength">
              <div class="strength-bar">
                <div class="strength-fill" :style="{ width: passwordStrength + '%' }"></div>
              </div>
              <span class="strength-text">{{ passwordStrengthText }}</span>
            </div>
          </div>

          <!-- 確認密碼 -->
          <div class="form-group">
            <label for="confirmPassword" class="form-label">確認密碼 *</label>
            <div class="password-input-container">
              <input 
                :type="showConfirmPassword ? 'text' : 'password'"
                id="confirmPassword"
                v-model="registerForm.confirmPassword"
                class="form-control"
                placeholder="請再次輸入密碼"
                required
                :class="{ 'error': confirmPasswordError }"
              />
              <button 
                type="button" 
                @click="toggleConfirmPasswordVisibility"
                class="password-toggle"
              >
                <svg width="20" height="20" viewBox="0 0 20 20">
                  <path v-if="!showConfirmPassword" fill="currentColor" d="M10 12a2 2 0 100-4 2 2 0 000 4z"/>
                  <path v-if="!showConfirmPassword" fill="currentColor" fill-rule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clip-rule="evenodd"/>
                  <path v-if="showConfirmPassword" fill="currentColor" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z"/>
                  <path v-if="showConfirmPassword" fill="currentColor" d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z"/>
                </svg>
              </button>
            </div>
            <div v-if="confirmPasswordError" class="form-error">{{ confirmPasswordError }}</div>
          </div>

          <!-- 同意條款 -->
          <div class="form-group">
            <label class="checkbox-label">
              <input 
                type="checkbox" 
                v-model="agreeToTerms" 
                class="checkbox"
                required
              >
              <span class="checkbox-text">
                我同意 <a href="#" class="terms-link">服務條款</a> 和 <a href="#" class="terms-link">隱私政策</a>
              </span>
            </label>
            <div v-if="termsError" class="form-error">{{ termsError }}</div>
          </div>

          <!-- 註冊按鈕 -->
          <button 
            type="submit" 
            class="btn btn-primary register-btn"
            :disabled="isLoading || !isFormValid"
          >
            <div v-if="isLoading" class="spinner"></div>
            <span v-if="!isLoading">建立帳戶</span>
            <span v-else>註冊中...</span>
          </button>

          <!-- 錯誤訊息 -->
          <div v-if="errorMessage" class="alert alert-error">
            {{ errorMessage }}
          </div>

          <!-- 成功訊息 -->
          <div v-if="successMessage" class="alert alert-success">
            {{ successMessage }}
          </div>
        </form>

        <div class="register-footer">
          <p class="footer-text">
            已經有帳戶？
            <router-link to="/login" class="footer-link">立即登入</router-link>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const authStore = useAuthStore()

// 響應式資料
const registerForm = ref({
  firstName: '',
  lastName: '',
  email: '',
  phoneNumber: '',
  password: '',
  confirmPassword: ''
})

const showPassword = ref(false)
const showConfirmPassword = ref(false)
const agreeToTerms = ref(false)
const isLoading = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

// 表單驗證錯誤
const firstNameError = ref('')
const lastNameError = ref('')
const emailError = ref('')
const phoneError = ref('')
const passwordError = ref('')
const confirmPasswordError = ref('')
const termsError = ref('')

// 密碼強度計算
const passwordStrength = computed(() => {
  const password = registerForm.value.password
  if (!password) return 0
  
  let strength = 0
  if (password.length >= 8) strength += 25
  if (/[A-Z]/.test(password)) strength += 25
  if (/[a-z]/.test(password)) strength += 25
  if (/[0-9]/.test(password)) strength += 25
  
  return strength
})

const passwordStrengthText = computed(() => {
  const strength = passwordStrength.value
  if (strength === 0) return ''
  if (strength <= 25) return '弱'
  if (strength <= 50) return '中'
  if (strength <= 75) return '強'
  return '非常強'
})

// 表單驗證
const isFormValid = computed(() => {
  return registerForm.value.firstName && 
         registerForm.value.lastName &&
         registerForm.value.email && 
         registerForm.value.phoneNumber &&
         registerForm.value.password &&
         registerForm.value.confirmPassword &&
         agreeToTerms.value &&
         !firstNameError.value &&
         !lastNameError.value &&
         !emailError.value &&
         !phoneError.value &&
         !passwordError.value &&
         !confirmPasswordError.value
})

// 切換密碼可見性
const togglePasswordVisibility = () => {
  showPassword.value = !showPassword.value
}

const toggleConfirmPasswordVisibility = () => {
  showConfirmPassword.value = !showConfirmPassword.value
}

// 表單驗證函數
const validateFirstName = () => {
  if (!registerForm.value.firstName) {
    firstNameError.value = '請輸入姓氏'
    return false
  } else if (registerForm.value.firstName.length > 50) {
    firstNameError.value = '姓氏長度不能超過50個字元'
    return false
  } else {
    firstNameError.value = ''
    return true
  }
}

const validateLastName = () => {
  if (!registerForm.value.lastName) {
    lastNameError.value = '請輸入名字'
    return false
  } else if (registerForm.value.lastName.length > 50) {
    lastNameError.value = '名字長度不能超過50個字元'
    return false
  } else {
    lastNameError.value = ''
    return true
  }
}

const validateEmail = () => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!registerForm.value.email) {
    emailError.value = '請輸入電子郵件'
    return false
  } else if (!emailRegex.test(registerForm.value.email)) {
    emailError.value = '請輸入有效的電子郵件格式'
    return false
  } else {
    emailError.value = ''
    return true
  }
}

const validatePhone = () => {
  const phoneRegex = /^09\d{8}$/
  if (!registerForm.value.phoneNumber) {
    phoneError.value = '請輸入手機號碼'
    return false
  } else if (!phoneRegex.test(registerForm.value.phoneNumber)) {
    phoneError.value = '請輸入有效的手機號碼格式（如：0912345678）'
    return false
  } else {
    phoneError.value = ''
    return true
  }
}

const validatePassword = () => {
  if (!registerForm.value.password) {
    passwordError.value = '請輸入密碼'
    return false
  } else if (registerForm.value.password.length < 8) {
    passwordError.value = '密碼長度至少8個字元'
    return false
  } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(registerForm.value.password)) {
    passwordError.value = '密碼必須包含大寫字母、小寫字母和數字'
    return false
  } else {
    passwordError.value = ''
    return true
  }
}

const validateConfirmPassword = () => {
  if (!registerForm.value.confirmPassword) {
    confirmPasswordError.value = '請確認密碼'
    return false
  } else if (registerForm.value.password !== registerForm.value.confirmPassword) {
    confirmPasswordError.value = '密碼不一致'
    return false
  } else {
    confirmPasswordError.value = ''
    return true
  }
}

// 監聽表單變化，即時驗證
watch(() => registerForm.value.firstName, validateFirstName)
watch(() => registerForm.value.lastName, validateLastName)
watch(() => registerForm.value.email, validateEmail)
watch(() => registerForm.value.phoneNumber, validatePhone)
watch(() => registerForm.value.password, () => {
  validatePassword()
  if (registerForm.value.confirmPassword) {
    validateConfirmPassword()
  }
})
watch(() => registerForm.value.confirmPassword, validateConfirmPassword)

// 處理註冊
const handleRegister = async () => {
  // 重置錯誤訊息
  errorMessage.value = ''
  successMessage.value = ''

  // 驗證表單
  const isValid = validateFirstName() && 
                  validateLastName() &&
                  validateEmail() && 
                  validatePhone() &&
                  validatePassword() && 
                  validateConfirmPassword()

  if (!agreeToTerms.value) {
    termsError.value = '請同意服務條款和隱私政策'
    return
  } else {
    termsError.value = ''
  }

  if (!isValid) {
    return
  }

  isLoading.value = true

  try {
    // 呼叫註冊API
    const result = await authStore.register({
      firstName: registerForm.value.firstName,
      lastName: registerForm.value.lastName,
      email: registerForm.value.email,
      phoneNumber: registerForm.value.phoneNumber,
      password: registerForm.value.password,
      confirmPassword: registerForm.value.confirmPassword,
      agreeToTerms: agreeToTerms.value
    })
    
    if (result.success) {
      successMessage.value = result.message
      
      // 延遲跳轉到登入頁面
      setTimeout(() => {
        router.push('/login')
      }, 2000)
    } else {
      errorMessage.value = result.message
    }
  } catch (error) {
    console.error('註冊錯誤:', error)
    errorMessage.value = '註冊失敗，請稍後再試'
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
.register-view {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, var(--kiwi-blue) 0%, var(--deep-sea) 100%);
  padding: var(--space-4);
}

.register-container {
  width: 100%;
  max-width: 500px;
}

.register-card {
  background-color: var(--white);
  border-radius: 12px;
  box-shadow: var(--shadow-xl);
  overflow: hidden;
}

.register-header {
  background-color: var(--white);
  padding: var(--space-8) var(--space-6) var(--space-6);
  text-align: center;
  border-bottom: 1px solid var(--border-gray);
}

.register-title {
  font-size: var(--text-2xl);
  font-weight: 700;
  color: var(--deep-sea);
  margin-bottom: var(--space-2);
}

.register-subtitle {
  color: var(--medium-gray);
  font-size: var(--text-base);
}

.register-form {
  padding: var(--space-6);
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-4);
}

.form-group {
  margin-bottom: var(--space-5);
}

.form-label {
  display: block;
  margin-bottom: var(--space-2);
  font-weight: 600;
  color: var(--deep-sea);
}

.form-control {
  width: 100%;
  padding: var(--space-3);
  border: 2px solid var(--border-gray);
  border-radius: 8px;
  font-size: var(--text-base);
  transition: all 0.3s ease;
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

.password-input-container {
  position: relative;
}

.password-toggle {
  position: absolute;
  right: var(--space-3);
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: var(--medium-gray);
  cursor: pointer;
  padding: var(--space-1);
  border-radius: 4px;
  transition: all 0.3s ease;
}

.password-toggle:hover {
  background-color: var(--light-gray);
  color: var(--kiwi-blue);
}

.password-strength {
  margin-top: var(--space-2);
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.strength-bar {
  flex: 1;
  height: 4px;
  background-color: var(--border-gray);
  border-radius: 2px;
  overflow: hidden;
}

.strength-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--danger) 0%, var(--warning) 50%, var(--success) 100%);
  transition: width 0.3s ease;
}

.strength-text {
  font-size: var(--text-xs);
  color: var(--medium-gray);
  min-width: 60px;
}

.checkbox-label {
  display: flex;
  align-items: flex-start;
  cursor: pointer;
  user-select: none;
}

.checkbox {
  margin-right: var(--space-2);
  margin-top: var(--space-1);
  cursor: pointer;
}

.checkbox-text {
  font-size: var(--text-sm);
  color: var(--dark-gray);
  line-height: 1.5;
}

.terms-link {
  color: var(--kiwi-blue);
  text-decoration: none;
}

.terms-link:hover {
  text-decoration: underline;
}

.register-btn {
  width: 100%;
  padding: var(--space-4);
  font-size: var(--text-base);
  font-weight: 600;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  transition: all 0.3s ease;
  margin-bottom: var(--space-4);
}

.register-btn:disabled {
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

.alert-success {
  background-color: #d4edda;
  border: 1px solid #c3e6cb;
  color: #155724;
}

.register-footer {
  padding: var(--space-6);
  background-color: var(--light-gray);
  text-align: center;
  border-top: 1px solid var(--border-gray);
}

.footer-text {
  color: var(--medium-gray);
  font-size: var(--text-sm);
}

.footer-link {
  color: var(--kiwi-blue);
  text-decoration: none;
  font-weight: 600;
  transition: color 0.3s ease;
}

.footer-link:hover {
  color: var(--deep-sea);
  text-decoration: underline;
}

/* 響應式設計 */
@media (max-width: 768px) {
  .form-row {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 480px) {
  .register-view {
    padding: var(--space-2);
  }
  
  .register-header {
    padding: var(--space-6) var(--space-4) var(--space-4);
  }
  
  .register-form {
    padding: var(--space-4);
  }
  
  .register-footer {
    padding: var(--space-4);
  }
  
  .register-title {
    font-size: var(--text-xl);
  }
}
</style>
