<template>
  <header class="header">
    <div class="header-container">
      <!-- 品牌Logo -->
      <div class="header-brand">
        <router-link to="/" class="brand-link">
          <img src="@/assets/logo.svg" alt="奇異鳥航空" class="brand-logo" />
          <span class="brand-text">奇異鳥航空</span>
        </router-link>
      </div>

      <!-- 桌面版導航 -->
      <nav class="desktop-nav">
        <router-link to="/" class="nav-link">首頁</router-link>
        <router-link to="/flights/search" class="nav-link">航班搜尋</router-link>
        <router-link to="/contact" class="nav-link">客服中心</router-link>
      </nav>

      <!-- 用戶操作區 -->
      <div class="header-actions">
        <template v-if="!authStore.isLoggedIn">
          <router-link to="/login" class="btn btn-outline">登入</router-link>
          <router-link to="/register" class="btn btn-primary">註冊</router-link>
        </template>
        <template v-else>
          <div class="user-dropdown" @click="toggleUserDropdown">
            <div class="user-info">
              <span class="user-name">{{ authStore.userInfo?.firstName }}{{ authStore.userInfo?.lastName }}</span>
              <svg class="dropdown-icon" :class="{ 'rotated': isUserDropdownOpen }" width="20" height="20" viewBox="0 0 20 20">
                <path fill="currentColor" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"/>
              </svg>
            </div>
            <div class="dropdown-menu" v-show="isUserDropdownOpen">
              <router-link to="/my-bookings" class="dropdown-item" @click="closeUserDropdown">
                我的訂單
              </router-link>
              <hr class="dropdown-divider">
              <button @click="handleLogout" class="dropdown-item logout-btn">
                登出
              </button>
            </div>
          </div>
        </template>
      </div>

      <!-- 手機版選單按鈕 -->
      <button class="mobile-menu-btn" @click="toggleMobileMenu">
        <svg width="24" height="24" viewBox="0 0 24 24">
          <path fill="currentColor" d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"/>
        </svg>
      </button>
    </div>

    <!-- 手機版導航選單 -->
    <div class="mobile-nav" v-show="isMobileMenuOpen">
      <div class="mobile-nav-content">
        <router-link to="/" class="mobile-nav-link" @click="closeMobileMenu">首頁</router-link>
        <router-link to="/flights/search" class="mobile-nav-link" @click="closeMobileMenu">航班搜尋</router-link>
        <router-link to="/contact" class="mobile-nav-link" @click="closeMobileMenu">客服中心</router-link>
        
        <template v-if="authStore.isLoggedIn">
          <hr class="mobile-nav-divider">
          <router-link to="/my-bookings" class="mobile-nav-link" @click="closeMobileMenu">我的訂單</router-link>
          <button @click="handleLogout" class="mobile-nav-link logout-btn">登出</button>
        </template>
        <template v-else>
          <hr class="mobile-nav-divider">
          <router-link to="/login" class="mobile-nav-link" @click="closeMobileMenu">登入</router-link>
          <router-link to="/register" class="mobile-nav-link" @click="closeMobileMenu">註冊</router-link>
        </template>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const authStore = useAuthStore()

// 響應式狀態
const isMobileMenuOpen = ref(false)
const isUserDropdownOpen = ref(false)

// 切換手機版選單
const toggleMobileMenu = () => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value
}

const closeMobileMenu = () => {
  isMobileMenuOpen.value = false
}

// 切換用戶下拉選單
const toggleUserDropdown = () => {
  isUserDropdownOpen.value = !isUserDropdownOpen.value
}

const closeUserDropdown = () => {
  isUserDropdownOpen.value = false
}

// 處理登出
const handleLogout = () => {
  authStore.logout()
  router.push('/')
  closeMobileMenu()
  closeUserDropdown()
}

// 點擊外部關閉下拉選單
const handleClickOutside = (event) => {
  if (!event.target.closest('.user-dropdown')) {
    isUserDropdownOpen.value = false
  }
  if (!event.target.closest('.mobile-nav') && !event.target.closest('.mobile-menu-btn')) {
    isMobileMenuOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.header {
  background-color: var(--white);
  box-shadow: var(--shadow-sm);
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 var(--space-4);
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 72px;
}

/* 品牌Logo */
.header-brand {
  flex-shrink: 0;
}

.brand-link {
  display: flex;
  align-items: center;
  text-decoration: none;
  color: var(--kiwi-blue);
  font-weight: 700;
  font-size: var(--text-lg);
}

.brand-logo {
  height: 40px;
  width: 40px;
  margin-right: var(--space-2);
}

.brand-text {
  font-family: var(--font-chinese);
}

/* 桌面版導航 */
.desktop-nav {
  display: flex;
  align-items: center;
  gap: var(--space-6);
}

.nav-link {
  text-decoration: none;
  color: var(--dark-gray);
  font-weight: 500;
  padding: var(--space-2) var(--space-3);
  border-radius: 4px;
  transition: all 0.3s ease;
}

.nav-link:hover {
  background-color: var(--light-gray);
  color: var(--kiwi-blue);
}

.nav-link.router-link-active {
  color: var(--kiwi-blue);
  background-color: var(--light-gray);
}

/* 用戶操作區 */
.header-actions {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.user-dropdown {
  position: relative;
  cursor: pointer;
}

.user-info {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-3);
  border-radius: 4px;
  transition: background-color 0.3s ease;
}

.user-info:hover {
  background-color: var(--light-gray);
}

.user-name {
  font-weight: 500;
  color: var(--dark-gray);
}

.dropdown-icon {
  transition: transform 0.3s ease;
}

.dropdown-icon.rotated {
  transform: rotate(180deg);
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  right: 0;
  background-color: var(--white);
  border: 1px solid var(--border-gray);
  border-radius: 4px;
  box-shadow: var(--shadow-lg);
  min-width: 160px;
  z-index: 1000;
  margin-top: var(--space-2);
}

.dropdown-item {
  display: block;
  width: 100%;
  padding: var(--space-3) var(--space-4);
  text-decoration: none;
  color: var(--dark-gray);
  border: none;
  background: none;
  text-align: left;
  transition: background-color 0.3s ease;
}

.dropdown-item:hover {
  background-color: var(--light-gray);
}

.dropdown-divider {
  height: 1px;
  background-color: var(--border-gray);
  border: none;
  margin: var(--space-2) 0;
}

.logout-btn {
  cursor: pointer;
  color: var(--danger);
}

.logout-btn:hover {
  background-color: #f8d7da;
}

/* 手機版選單按鈕 */
.mobile-menu-btn {
  display: none;
  background: none;
  border: none;
  color: var(--dark-gray);
  cursor: pointer;
  padding: var(--space-2);
}

/* 手機版導航 */
.mobile-nav {
  background-color: var(--white);
  border-top: 1px solid var(--border-gray);
  display: none;
}

.mobile-nav-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: var(--space-4);
}

.mobile-nav-link {
  display: block;
  padding: var(--space-3) 0;
  text-decoration: none;
  color: var(--dark-gray);
  font-weight: 500;
  border-bottom: 1px solid var(--border-gray);
  border: none;
  background: none;
  width: 100%;
  text-align: left;
  cursor: pointer;
}

.mobile-nav-link:hover {
  color: var(--kiwi-blue);
}

.mobile-nav-divider {
  height: 1px;
  background-color: var(--border-gray);
  border: none;
  margin: var(--space-3) 0;
}

/* 響應式設計 */
@media (max-width: 768px) {
  .desktop-nav {
    display: none;
  }
  
  .header-actions {
    display: none;
  }
  
  .mobile-menu-btn {
    display: block;
  }
  
  .mobile-nav {
    display: block;
  }
}
</style>
