<template>
  <div id="app">
    <!-- 導航欄 -->
    <AppHeader />
    
    <!-- 主要內容區域 -->
    <main class="main-content">
      <router-view />
    </main>
    
    <!-- 頁腳 -->
    <AppFooter />
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useAuthStore } from './stores/auth'
import AppHeader from './components/AppHeader.vue'
import AppFooter from './components/AppFooter.vue'

const authStore = useAuthStore()

// 應用程式載入時檢查認證狀態
onMounted(() => {
  authStore.checkAuth()
})
</script>

<style>
/* 全域樣式 - 根據UI規格文件的設計系統 */
:root {
  /* 主色彩 */
  --kiwi-blue: #0077cc;
  --kiwi-orange: #ff6b35;
  --deep-sea: #003366;

  /* 功能色彩 */
  --success: #28a745;
  --warning: #ffc107;
  --danger: #dc3545;
  --info: #17a2b8;

  /* 中性色彩 */
  --white: #ffffff;
  --light-gray: #f8f9fa;
  --medium-gray: #6c757d;
  --dark-gray: #343a40;
  --border-gray: #e9ecef;

  /* 字體系統 */
  --font-chinese: "Noto Sans TC", "Microsoft JhengHei", sans-serif;
  --font-english: "Inter", "Helvetica Neue", Arial, sans-serif;
  --font-number: "Roboto Mono", monospace;

  /* 字體大小 */
  --text-xs: 12px;
  --text-sm: 14px;
  --text-base: 16px;
  --text-lg: 18px;
  --text-xl: 20px;
  --text-2xl: 24px;
  --text-3xl: 32px;

  /* 間距系統 */
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 20px;
  --space-6: 24px;
  --space-8: 32px;
  --space-12: 48px;
  --space-16: 64px;

  /* 陰影系統 */
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.1);
  --shadow-xl: 0 20px 25px rgba(0, 0, 0, 0.1);
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: var(--font-chinese);
  font-size: var(--text-base);
  line-height: 1.6;
  color: var(--dark-gray);
  background-color: var(--light-gray);
}

#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.main-content {
  flex: 1;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 var(--space-4);
  width: 100%;
}

/* 響應式設計 */
@media (max-width: 768px) {
  .main-content {
    padding: 0 var(--space-3);
  }
}

/* 通用按鈕樣式 */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-3) var(--space-6);
  border: none;
  border-radius: 6px;
  font-size: var(--text-base);
  font-weight: 500;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.3s ease;
  min-height: 44px;
}

.btn-primary {
  background-color: var(--kiwi-blue);
  color: var(--white);
}

.btn-primary:hover {
  background-color: #005fa3;
}

.btn-secondary {
  background-color: var(--medium-gray);
  color: var(--white);
}

.btn-secondary:hover {
  background-color: #5a6268;
}

.btn-outline {
  background-color: transparent;
  color: var(--kiwi-blue);
  border: 2px solid var(--kiwi-blue);
}

.btn-outline:hover {
  background-color: var(--kiwi-blue);
  color: var(--white);
}

.btn-danger {
  background-color: var(--danger);
  color: var(--white);
}

.btn-danger:hover {
  background-color: #c82333;
}

/* 通用表單樣式 */
.form-group {
  margin-bottom: var(--space-4);
}

.form-label {
  display: block;
  margin-bottom: var(--space-2);
  font-weight: 500;
  color: var(--dark-gray);
}

.form-control {
  width: 100%;
  padding: var(--space-3);
  border: 1px solid var(--border-gray);
  border-radius: 4px;
  font-size: var(--text-base);
  transition: border-color 0.3s ease;
}

.form-control:focus {
  outline: none;
  border-color: var(--kiwi-blue);
  box-shadow: 0 0 0 3px rgba(0, 119, 204, 0.1);
}

.form-error {
  margin-top: var(--space-2);
  color: var(--danger);
  font-size: var(--text-sm);
}

/* 通用卡片樣式 */
.card {
  background-color: var(--white);
  border-radius: 8px;
  box-shadow: var(--shadow-md);
  overflow: hidden;
}

.card-header {
  padding: var(--space-4);
  background-color: var(--light-gray);
  border-bottom: 1px solid var(--border-gray);
}

.card-body {
  padding: var(--space-4);
}

/* 載入動畫 */
.loading {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: var(--space-8);
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid var(--border-gray);
  border-top: 4px solid var(--kiwi-blue);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* 訊息提示 */
.alert {
  padding: var(--space-4);
  margin-bottom: var(--space-4);
  border-radius: 4px;
  border: 1px solid transparent;
}

.alert-success {
  background-color: #d4edda;
  border-color: #c3e6cb;
  color: #155724;
}

.alert-error {
  background-color: #f8d7da;
  border-color: #f5c6cb;
  color: #721c24;
}

.alert-warning {
  background-color: #fff3cd;
  border-color: #ffeaa7;
  color: #856404;
}

.alert-info {
  background-color: #d1ecf1;
  border-color: #bee5eb;
  color: #0c5460;
}
</style>
