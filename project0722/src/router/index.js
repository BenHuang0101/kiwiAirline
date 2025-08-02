import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import SearchResultsView from '../views/SearchResultsView.vue'
import BookingView from '../views/BookingView.vue'
import LoginView from '../views/LoginView.vue'
import RegisterView from '../views/RegisterView.vue'
import MyBookingsView from '../views/MyBookingsView.vue'
import ContactView from '../views/ContactView.vue'
import { useAuthStore } from '../stores/auth'

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView
  },
  {
    path: '/flights/search',
    name: 'search-results',
    component: SearchResultsView
  },
  {
    path: '/booking/:flightId',
    name: 'booking',
    component: BookingView,
    meta: { requiresAuth: true }
  },
  {
    path: '/login',
    name: 'login',
    component: LoginView
  },
  {
    path: '/register',
    name: 'register',
    component: RegisterView
  },
  {
    path: '/my-bookings',
    name: 'my-bookings',
    component: MyBookingsView,
    meta: { requiresAuth: true }
  },
  {
    path: '/contact',
    name: 'contact',
    component: ContactView
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守衛 - 檢查認證狀態
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  
  if (to.matched.some(record => record.meta.requiresAuth)) {
    if (!authStore.isLoggedIn) {
      next('/login')
    } else {
      next()
    }
  } else {
    next()
  }
})

export default router
