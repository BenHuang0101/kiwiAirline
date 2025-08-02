<template>
  <div class="login-view">
    <div class="login-container">
      <div class="login-card">
        <div class="login-header">
          <h1 class="login-title">會員登入</h1>
          <p class="login-subtitle">登入您的奇異鳥航空帳戶</p>
        </div>

        <form @submit.prevent="handleLogin" class="login-form">
          <!-- 電子郵件 -->
          <div class="form-group">
            <label for="email" class="form-label">電子郵件</label>
            <input 
              type="email" 
              id="email"
              v-model="loginForm.email"
              class="form-control"
              placeholder="請輸入您的電子郵件"
              required
              :class="{ 'error': emailError }"
            />
            <div v-if="emailError" class="form-error">{{ emailError }}</div>
          </div>

          <!-- 密碼 -->
          <div class="form-group">
            <label for="password" class="form-label">密碼</label>
            <div class="password-input-container">
              <input 
                :type="showPassword ? 'text' : 'password'"
                id="password"
                v-model="loginForm.password"
                class="form-control"
                placeholder="請輸入您的密碼"
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
          </div>

          <!-- 記住我 -->
          <div class="form-group">
            <label class="checkbox-label">
              <input type="checkbox" v-model="rememberMe" class="checkbox">
              <span class="checkbox-text">記住我</span>
            </label>
          </div>

          <!-- 登入按鈕 -->
          <button 
            type="submit" 
            class="btn btn-primary login-btn"
            :disabled="isLoading"
          >
            <div v-if="isLoading" class="spinner"></div>
            <span v-if="!isLoading">登入</span>
            <span v-else>登入中...</span>
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

        <div class="login-footer">
          <p class="footer-text">
            還沒有帳戶？
            <router-link to="/register" class="footer-link">立即註冊</router-link>
          </p>
          <p class="footer-text">
            <a href="#" class="footer-link">忘記密碼？</a>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const authStore = useAuthStore()

// 響應式資料
const loginForm = ref({
  email: '',
  password: ''
})

const showPassword = ref(false)
const rememberMe = ref(false)
const isLoading = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

// 表單驗證錯誤
const emailError = ref('')
const passwordError = ref('')

// 表單驗證
const isFormValid = computed(() => {
  return loginForm.value.email && loginForm.value.password
})

// 切換密碼可見性
const togglePasswordVisibility = () => {
  showPassword.value = !showPassword.value
}

// 驗證電子郵件格式
const validateEmail = () => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!loginForm.value.email) {
    emailError.value = '請輸入電子郵件'
    return false
  } else if (!emailRegex.test(loginForm.value.email)) {
    emailError.value = '請輸入有效的電子郵件格式'
    return false
  } else {
    emailError.value = ''
    return true
  }
}

// 驗證密碼
const validatePassword = () => {
  if (!loginForm.value.password) {
    passwordError.value = '請輸入密碼'
    return false
  } else if (loginForm.value.password.length < 6) {
    passwordError.value = '密碼長度至少6個字元'
    return false
  } else {
    passwordError.value = ''
    return true
  }
}

// 處理登入
const handleLogin = async () => {
  // 重置錯誤訊息
  errorMessage.value = ''
  successMessage.value = ''

  // 驗證表單
  const isEmailValid = validateEmail()
  const isPasswordValid = validatePassword()

  if (!isEmailValid || !isPasswordValid) {
    return
  }

  isLoading.value = true

  try {
    // 呼叫登入API
    const result = await authStore.login(loginForm.value.email, loginForm.value.password)
    
    if (result.success) {
      successMessage.value = result.message
      
      // 如果選擇記住我，儲存到localStorage
      if (rememberMe.value) {
        localStorage.setItem('rememberedEmail', loginForm.value.email)
      } else {
        localStorage.removeItem('rememberedEmail')
      }
      
      // 延遲跳轉給用戶看到成功訊息
      setTimeout(() => {
        router.push('/')
      }, 1000)
    } else {
      errorMessage.value = result.message
    }
  } catch (error) {
    console.error('登入錯誤:', error)
    errorMessage.value = '登入失敗，請稍後再試'
  } finally {
    isLoading.value = false
  }
}

// 如果用戶選擇記住我，自動填入電子郵件
const rememberedEmail = localStorage.getItem('rememberedEmail')
if (rememberedEmail) {
  loginForm.value.email = rememberedEmail
  rememberMe.value = true
}
</script>

<style scoped>
.login-view {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, var(--kiwi-blue) 0%, var(--deep-sea) 100%);
  padding: var(--space-4);
}

.login-container {
  width: 100%;
  max-width: 400px;
}

.login-card {
  background-color: var(--white);
  border-radius: 12px;
  box-shadow: var(--shadow-xl);
  overflow: hidden;
}

.login-header {
  background-color: var(--white);
  padding: var(--space-8) var(--space-6) var(--space-6);
  text-align: center;
  border-bottom: 1px solid var(--border-gray);
}

.login-title {
  font-size: var(--text-2xl);
  font-weight: 700;
  color: var(--deep-sea);
  margin-bottom: var(--space-2);
}

.login-subtitle {
  color: var(--medium-gray);
  font-size: var(--text-base);
}

.login-form {
  padding: var(--space-6);
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

.checkbox-label {
  display: flex;
  align-items: center;
  cursor: pointer;
  user-select: none;
}

.checkbox {
  margin-right: var(--space-2);
  cursor: pointer;
}

.checkbox-text {
  font-size: var(--text-sm);
  color: var(--dark-gray);
}

.login-btn {
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

.login-btn:disabled {
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

.login-footer {
  padding: var(--space-6);
  background-color: var(--light-gray);
  text-align: center;
  border-top: 1px solid var(--border-gray);
}

.footer-text {
  margin-bottom: var(--space-3);
  color: var(--medium-gray);
  font-size: var(--text-sm);
}

.footer-text:last-child {
  margin-bottom: 0;
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
@media (max-width: 480px) {
  .login-view {
    padding: var(--space-2);
  }
  
  .login-header {
    padding: var(--space-6) var(--space-4) var(--space-4);
  }
  
  .login-form {
    padding: var(--space-4);
  }
  
  .login-footer {
    padding: var(--space-4);
  }
  
  .login-title {
    font-size: var(--text-xl);
  }
}
</style>
