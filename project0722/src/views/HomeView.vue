<template>
  <div class="home-view">
    <!-- Hero Section 英雄區塊 -->
    <section class="hero-section">
      <div class="hero-container">
        <div class="hero-content">
          <h1 class="hero-title">探索世界，從這裡開始</h1>
          <p class="hero-subtitle">
            奇異鳥航空為您提供安全、舒適、便捷的航空服務，讓每一趟旅程都成為美好回憶
          </p>
        </div>
        
        <!-- 航班搜尋表單 -->
        <div class="search-form-container">
          <FlightSearchForm @search="handleSearch" />
        </div>
      </div>
    </section>

    <!-- 服務特色區塊 -->
    <section class="features-section">
      <div class="section-container">
        <h2 class="section-title">為什麼選擇奇異鳥航空</h2>
        <div class="features-grid">
          <div class="feature-card">
            <div class="feature-icon">
              <svg width="48" height="48" viewBox="0 0 48 48">
                <path fill="var(--kiwi-blue)" d="M24 4L6 16v26a2 2 0 002 2h8a2 2 0 002-2v-10a2 2 0 012-2h8a2 2 0 012 2v10a2 2 0 002 2h8a2 2 0 002-2V16L24 4z"/>
              </svg>
            </div>
            <h3 class="feature-title">安全保障</h3>
            <p class="feature-description">
              嚴格的安全標準和定期維護，確保每次飛行都是安全的旅程
            </p>
          </div>
          
          <div class="feature-card">
            <div class="feature-icon">
              <svg width="48" height="48" viewBox="0 0 48 48">
                <path fill="var(--kiwi-blue)" d="M24 2C13.5 2 5 10.5 5 21c0 15.25 19 25 19 25s19-9.75 19-25c0-10.5-8.5-19-19-19zm0 25.5c-3.6 0-6.5-2.9-6.5-6.5s2.9-6.5 6.5-6.5 6.5 2.9 6.5 6.5-2.9 6.5-6.5 6.5z"/>
              </svg>
            </div>
            <h3 class="feature-title">全球航線</h3>
            <p class="feature-description">
              連接世界各大城市，豐富的航線選擇滿足您的旅行需求
            </p>
          </div>
          
          <div class="feature-card">
            <div class="feature-icon">
              <svg width="48" height="48" viewBox="0 0 48 48">
                <path fill="var(--kiwi-blue)" d="M24 4c11.05 0 20 8.95 20 20s-8.95 20-20 20S4 35.05 4 24 12.95 4 24 4zm0 6c-7.73 0-14 6.27-14 14s6.27 14 14 14 14-6.27 14-14-6.27-14-14-14z"/>
              </svg>
            </div>
            <h3 class="feature-title">24小時服務</h3>
            <p class="feature-description">
              全天候客服支援，隨時為您解決旅行中的各種問題
            </p>
          </div>
          
          <div class="feature-card">
            <div class="feature-icon">
              <svg width="48" height="48" viewBox="0 0 48 48">
                <path fill="var(--kiwi-blue)" d="M24 4l6 4.5V14h8v8.5l6 4.5-6 4.5V40h-8v-5.5L24 44l-6-4.5V32H10v-8.5L4 19l6-4.5V8h8V4.5L24 4z"/>
              </svg>
            </div>
            <h3 class="feature-title">優質服務</h3>
            <p class="feature-description">
              專業的機組人員和貼心的服務，讓您的旅程更加愉快
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- 熱門目的地區塊 -->
    <section class="destinations-section">
      <div class="section-container">
        <h2 class="section-title">熱門目的地</h2>
        <div class="destinations-grid">
          <div class="destination-card" v-for="destination in popularDestinations" :key="destination.code">
            <div class="destination-image">
              <img :src="destination.image" :alt="destination.name" />
              <div class="destination-overlay">
                <h3 class="destination-name">{{ destination.name }}</h3>
                <p class="destination-description">{{ destination.description }}</p>
                <button 
                  @click="searchDestination(destination.code)" 
                  class="btn btn-primary destination-btn"
                >
                  搜尋航班
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 客戶評價區塊 -->
    <section class="testimonials-section">
      <div class="section-container">
        <h2 class="section-title">客戶評價</h2>
        <div class="testimonials-grid">
          <div class="testimonial-card" v-for="testimonial in testimonials" :key="testimonial.id">
            <div class="testimonial-content">
              <div class="testimonial-rating">
                <svg v-for="star in 5" :key="star" width="20" height="20" viewBox="0 0 20 20">
                  <path 
                    :fill="star <= testimonial.rating ? 'var(--kiwi-orange)' : 'var(--border-gray)'" 
                    d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
                  />
                </svg>
              </div>
              <p class="testimonial-text">{{ testimonial.text }}</p>
              <div class="testimonial-author">
                <div class="author-info">
                  <h4 class="author-name">{{ testimonial.author }}</h4>
                  <p class="author-location">{{ testimonial.location }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import FlightSearchForm from '../components/FlightSearchForm.vue'

const router = useRouter()

// 熱門目的地資料
const popularDestinations = ref([
  {
    code: 'NRT',
    name: '東京',
    description: '體驗日本的現代與傳統文化',
    image: '/images/tokyo.jpg'
  },
  {
    code: 'ICN',
    name: '首爾',
    description: '韓流文化的發源地',
    image: '/images/seoul.jpg'
  },
  {
    code: 'BKK',
    name: '曼谷',
    description: '泰國的美食與寺廟之旅',
    image: '/images/bangkok.jpg'
  },
  {
    code: 'SIN',
    name: '新加坡',
    description: '花園城市的完美假期',
    image: '/images/singapore.jpg'
  },
  {
    code: 'HKG',
    name: '香港',
    description: '東方明珠的購物天堂',
    image: '/images/hongkong.jpg'
  },
  {
    code: 'KIX',
    name: '大阪',
    description: '日本的廚房與古都風情',
    image: '/images/osaka.jpg'
  }
])

// 客戶評價資料
const testimonials = ref([
  {
    id: 1,
    rating: 5,
    text: '服務非常好，機組人員專業親切，飛行過程非常平穩舒適。會再次選擇奇異鳥航空。',
    author: '王小明',
    location: '台北'
  },
  {
    id: 2,
    rating: 5,
    text: '線上訂票系統很便利，價格合理，準時起降。推薦給經常出差的朋友。',
    author: '李小華',
    location: '台中'
  },
  {
    id: 3,
    rating: 4,
    text: '整體體驗很棒，餐點美味，座位舒適。唯一小建議是希望能增加更多娛樂節目。',
    author: '張小美',
    location: '高雄'
  }
])

// 處理搜尋
const handleSearch = (searchData) => {
  router.push({
    name: 'search-results',
    query: searchData
  })
}

// 搜尋特定目的地
const searchDestination = (destinationCode) => {
  router.push({
    name: 'search-results',
    query: {
      departure: 'TPE', // 預設從台北出發
      arrival: destinationCode,
      departureDate: new Date().toISOString().split('T')[0],
      passengers: 1
    }
  })
}
</script>

<style scoped>
/* Hero Section */
.hero-section {
  background: linear-gradient(135deg, var(--kiwi-blue) 0%, var(--deep-sea) 100%);
  color: var(--white);
  padding: var(--space-16) 0;
  position: relative;
  overflow: hidden;
}

.hero-section::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url('/images/hero-bg.jpg') center/cover;
  opacity: 0.1;
  z-index: 1;
}

.hero-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 var(--space-4);
  position: relative;
  z-index: 2;
}

.hero-content {
  text-align: center;
  margin-bottom: var(--space-12);
}

.hero-title {
  font-size: var(--text-3xl);
  font-weight: 700;
  margin-bottom: var(--space-4);
  line-height: 1.2;
}

.hero-subtitle {
  font-size: var(--text-lg);
  opacity: 0.9;
  max-width: 600px;
  margin: 0 auto;
  line-height: 1.6;
}

.search-form-container {
  max-width: 800px;
  margin: 0 auto;
}

/* 通用區塊樣式 */
.section-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 var(--space-4);
}

.section-title {
  font-size: var(--text-2xl);
  font-weight: 700;
  text-align: center;
  margin-bottom: var(--space-12);
  color: var(--deep-sea);
}

/* 服務特色區塊 */
.features-section {
  padding: var(--space-16) 0;
  background-color: var(--white);
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: var(--space-8);
}

.feature-card {
  text-align: center;
  padding: var(--space-6);
  background-color: var(--white);
  border-radius: 12px;
  box-shadow: var(--shadow-md);
  transition: all 0.3s ease;
}

.feature-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg);
}

.feature-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 80px;
  height: 80px;
  background-color: var(--light-gray);
  border-radius: 50%;
  margin: 0 auto var(--space-4);
}

.feature-title {
  font-size: var(--text-xl);
  font-weight: 600;
  margin-bottom: var(--space-3);
  color: var(--deep-sea);
}

.feature-description {
  color: var(--medium-gray);
  line-height: 1.6;
}

/* 熱門目的地區塊 */
.destinations-section {
  padding: var(--space-16) 0;
  background-color: var(--light-gray);
}

.destinations-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: var(--space-6);
}

.destination-card {
  border-radius: 12px;
  overflow: hidden;
  box-shadow: var(--shadow-md);
  transition: all 0.3s ease;
}

.destination-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg);
}

.destination-image {
  position: relative;
  height: 250px;
  overflow: hidden;
}

.destination-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.destination-card:hover .destination-image img {
  transform: scale(1.05);
}

.destination-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.8));
  color: var(--white);
  padding: var(--space-6);
  text-align: center;
}

.destination-name {
  font-size: var(--text-xl);
  font-weight: 600;
  margin-bottom: var(--space-2);
}

.destination-description {
  margin-bottom: var(--space-4);
  opacity: 0.9;
}

.destination-btn {
  padding: var(--space-2) var(--space-4);
  font-size: var(--text-sm);
}

/* 客戶評價區塊 */
.testimonials-section {
  padding: var(--space-16) 0;
  background-color: var(--white);
}

.testimonials-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: var(--space-8);
}

.testimonial-card {
  background-color: var(--white);
  border-radius: 12px;
  padding: var(--space-6);
  box-shadow: var(--shadow-md);
  transition: all 0.3s ease;
}

.testimonial-card:hover {
  box-shadow: var(--shadow-lg);
}

.testimonial-content {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.testimonial-rating {
  display: flex;
  gap: var(--space-1);
  margin-bottom: var(--space-4);
}

.testimonial-text {
  color: var(--dark-gray);
  line-height: 1.6;
  margin-bottom: var(--space-4);
  flex-grow: 1;
  font-style: italic;
}

.testimonial-author {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.author-info {
  flex-grow: 1;
}

.author-name {
  font-size: var(--text-base);
  font-weight: 600;
  color: var(--deep-sea);
  margin-bottom: var(--space-1);
}

.author-location {
  font-size: var(--text-sm);
  color: var(--medium-gray);
}

/* 響應式設計 */
@media (max-width: 768px) {
  .hero-title {
    font-size: var(--text-2xl);
  }
  
  .hero-subtitle {
    font-size: var(--text-base);
  }
  
  .features-grid {
    grid-template-columns: 1fr;
    gap: var(--space-6);
  }
  
  .destinations-grid {
    grid-template-columns: 1fr;
  }
  
  .testimonials-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 480px) {
  .hero-section {
    padding: var(--space-12) 0;
  }
  
  .section-title {
    font-size: var(--text-xl);
  }
  
  .feature-card {
    padding: var(--space-4);
  }
  
  .destination-overlay {
    padding: var(--space-4);
  }
}
</style>
