<template>
  <footer class="footer">
    <div class="footer-container">
      <!-- 公司資訊 -->
      <div class="footer-section">
        <h3 class="footer-title">奇異鳥航空</h3>
        <p class="footer-description">
          提供安全、舒適、便捷的航空服務，讓每一趟旅程都成為美好回憶。
        </p>
        <div class="footer-social">
          <a href="#" class="social-link" aria-label="Facebook">
            <svg width="24" height="24" viewBox="0 0 24 24">
              <path fill="currentColor" d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
          </a>
          <a href="#" class="social-link" aria-label="Instagram">
            <svg width="24" height="24" viewBox="0 0 24 24">
              <path fill="currentColor" d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
            </svg>
          </a>
          <a href="#" class="social-link" aria-label="Twitter">
            <svg width="24" height="24" viewBox="0 0 24 24">
              <path fill="currentColor" d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
            </svg>
          </a>
        </div>
      </div>

      <!-- 快速連結 -->
      <div class="footer-section">
        <h4 class="footer-subtitle">快速連結</h4>
        <ul class="footer-links">
          <li><router-link to="/" class="footer-link">首頁</router-link></li>
          <li><router-link to="/flights/search" class="footer-link">航班搜尋</router-link></li>
          <li><router-link to="/my-bookings" class="footer-link">我的訂單</router-link></li>
          <li><router-link to="/contact" class="footer-link">客服中心</router-link></li>
        </ul>
      </div>

      <!-- 客服資訊 -->
      <div class="footer-section">
        <h4 class="footer-subtitle">客服資訊</h4>
        <div class="footer-contact">
          <div class="contact-item">
            <svg width="20" height="20" viewBox="0 0 20 20">
              <path fill="currentColor" d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"/>
            </svg>
            <span>客服專線：0800-123-456</span>
          </div>
          <div class="contact-item">
            <svg width="20" height="20" viewBox="0 0 20 20">
              <path fill="currentColor" d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"/>
              <path fill="currentColor" d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"/>
            </svg>
            <span>service@kiwiairline.com</span>
          </div>
          <div class="contact-item">
            <svg width="20" height="20" viewBox="0 0 20 20">
              <path fill="currentColor" d="M10 2L3 7v11a1 1 0 001 1h3a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1h3a1 1 0 001-1V7l-7-5z"/>
            </svg>
            <span>服務時間：24小時全天候服務</span>
          </div>
        </div>
      </div>

      <!-- 法律資訊 -->
      <div class="footer-section">
        <h4 class="footer-subtitle">法律資訊</h4>
        <ul class="footer-links">
          <li><a href="#" class="footer-link">隱私政策</a></li>
          <li><a href="#" class="footer-link">服務條款</a></li>
          <li><a href="#" class="footer-link">退改票規則</a></li>
          <li><a href="#" class="footer-link">旅客須知</a></li>
        </ul>
      </div>
    </div>

    <!-- 版權資訊 -->
    <div class="footer-bottom">
      <div class="footer-container">
        <p class="copyright">
          © 2025 奇異鳥航空 Kiwi Airlines. 版權所有。
        </p>
        <div class="footer-certifications">
          <span class="cert-badge">ISO 9001認證</span>
          <span class="cert-badge">IATA會員</span>
          <span class="cert-badge">政府認可</span>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup>
// 這個組件不需要任何邏輯，純展示組件
</script>

<style scoped>
.footer {
  background-color: var(--deep-sea);
  color: var(--white);
  margin-top: auto;
}

.footer-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: var(--space-8) var(--space-4);
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: var(--space-8);
}

.footer-section {
  min-width: 0;
}

.footer-title {
  font-size: var(--text-2xl);
  font-weight: 700;
  margin-bottom: var(--space-4);
  color: var(--kiwi-orange);
}

.footer-subtitle {
  font-size: var(--text-lg);
  font-weight: 600;
  margin-bottom: var(--space-4);
  color: var(--white);
}

.footer-description {
  color: #b8c6d4;
  line-height: 1.6;
  margin-bottom: var(--space-4);
}

.footer-social {
  display: flex;
  gap: var(--space-3);
}

.social-link {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  color: var(--white);
  transition: all 0.3s ease;
}

.social-link:hover {
  background-color: var(--kiwi-orange);
  transform: translateY(-2px);
}

.footer-links {
  list-style: none;
  padding: 0;
  margin: 0;
}

.footer-links li {
  margin-bottom: var(--space-3);
}

.footer-link {
  color: #b8c6d4;
  text-decoration: none;
  transition: color 0.3s ease;
}

.footer-link:hover {
  color: var(--kiwi-orange);
}

.footer-contact {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.contact-item {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  color: #b8c6d4;
}

.contact-item svg {
  flex-shrink: 0;
}

.footer-bottom {
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding: var(--space-4) 0;
}

.footer-bottom .footer-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-4);
  grid-template-columns: none;
  gap: var(--space-4);
}

.copyright {
  color: #b8c6d4;
  font-size: var(--text-sm);
}

.footer-certifications {
  display: flex;
  gap: var(--space-3);
  flex-wrap: wrap;
}

.cert-badge {
  background-color: rgba(255, 255, 255, 0.1);
  color: var(--white);
  padding: var(--space-1) var(--space-3);
  border-radius: 12px;
  font-size: var(--text-xs);
  font-weight: 500;
}

/* 響應式設計 */
@media (max-width: 768px) {
  .footer-container {
    grid-template-columns: 1fr;
    gap: var(--space-6);
    padding: var(--space-6) var(--space-4);
  }
  
  .footer-bottom .footer-container {
    flex-direction: column;
    align-items: flex-start;
    text-align: left;
  }
  
  .footer-certifications {
    width: 100%;
    justify-content: flex-start;
  }
}

@media (max-width: 480px) {
  .footer-social {
    justify-content: flex-start;
  }
  
  .cert-badge {
    font-size: var(--text-xs);
    padding: var(--space-1) var(--space-2);
  }
}
</style>
