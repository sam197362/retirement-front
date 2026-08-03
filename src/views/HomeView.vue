<template>
  <div class="home-container">
    <!-- Header / Navbar -->
    <header class="header">
      <div class="container">
        <div class="nav-wrapper">
          <router-link to="/" class="brand-logo">
            <div class="brand-icon">
              <i class="bi bi-shield-lock-fill"></i>
            </div>
            <span class="brand-name gradient-text">退休理財規劃平台</span>
          </router-link>

          <ul class="nav-links">
            <li><a href="#hero" class="nav-link">首頁</a></li>
            <li><a href="#features" class="nav-link">核心功能</a></li>
            <li><a href="#simulator" class="nav-link">即時試算</a></li>
            <li><a href="#steps" class="nav-link">規劃流程</a></li>
            <li><a href="#notices" class="nav-link">系統公告</a></li>
          </ul>

          <div class="nav-actions">
            <template v-if="!isAuthenticated">
              <router-link to="/login" class="btn btn-outline btn-sm">會員登入</router-link>
              <router-link to="/register" class="btn btn-primary btn-sm">免費註冊</router-link>
            </template>
            <template v-else>
              <router-link to="/dashboard" class="btn btn-primary btn-sm">進入控制台</router-link>
            </template>
            <router-link to="/admin/login" class="btn btn-outline btn-sm opacity-75">後台管理</router-link>
          </div>
        </div>
      </div>
    </header>

    <!-- Hero Section -->
    <section id="hero" class="hero-section">
      <div class="container">
        <div class="hero-grid">
          <div class="hero-content">
            <div class="hero-tag">
              <span class="badge badge-emerald">
                <i class="bi bi-stars"></i> 全台首創勞保勞退與複利整合模型
              </span>
            </div>
            <h1 class="hero-title">
              提早規劃，<br>
              <span class="gradient-text">安心預約無憂退休</span>
            </h1>
            <p class="hero-description">
              整合個人工作期與退休後收支、投資成長複利與勞工老年年金試算，為您量身打造專屬退休財務模型，精準分析資金缺口。
            </p>
            <div class="hero-buttons">
              <router-link to="/register" class="btn btn-primary">
                <i class="bi bi-rocket-takeoff-fill"></i> 免費開始退休規劃
              </router-link>
              <a href="#simulator" class="btn btn-outline">
                <i class="bi bi-calculator"></i> 快速試算資金
              </a>
            </div>
          </div>

          <!-- Interactive Hero Dashboard Card -->
          <div class="hero-visual">
            <div class="glass-card demo-dashboard-card">
              <div class="demo-header">
                <div>
                  <span style="font-weight: 700; font-size: 1.1rem; color: #fff;">財務試算模擬看板</span>
                  <span style="font-size: 0.8rem; color: var(--text-dim); display: block;">計算基準：通膨率 2% | 投資報酬率 {{ simReturn }}%</span>
                </div>
                <span class="badge badge-emerald">動態連動中</span>
              </div>

              <div class="demo-metrics-grid">
                <div class="metric-box">
                  <div class="metric-label">預估月退收入</div>
                  <div class="metric-value emerald">$65,000</div>
                  <div style="font-size: 0.75rem; color: var(--text-dim); margin-top: 4px;">含勞保/勞退/投資派息</div>
                </div>
                <div class="metric-box">
                  <div class="metric-label">預估退休月支出</div>
                  <div class="metric-value rose">$50,000</div>
                  <div style="font-size: 0.75rem; color: var(--text-dim); margin-top: 4px;">考慮醫療與通膨調整</div>
                </div>
              </div>

              <div class="chart-preview-box">
                <div style="display: flex; justify-content: space-between; align-items: baseline;">
                  <span class="metric-label">預估退休時資產總額 ({{ simRetireAge }}歲)</span>
                  <span style="font-size: 0.85rem; color: #34d399; font-weight: 600;">已達目標 78%</span>
                </div>
                <div class="metric-value amber">{{ formatMoney(calculatedFV) }}</div>
                <div class="progress-bar-container">
                  <div class="progress-bar-fill"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section id="features" style="padding: 100px 0;">
      <div class="container">
        <div class="section-header">
          <h2 class="section-title">四大核心功能，全面防護退休生活</h2>
          <p class="section-subtitle">客製化對接台灣現行勞退制度與稅制環境，提供最實用且精準的理財決策支援。</p>
        </div>

        <div class="features-grid">
          <!-- Feature 1 -->
          <div class="glass-card feature-card">
            <div class="feature-icon icon-emerald">
              <i class="bi bi-wallet2"></i>
            </div>
            <h3 class="feature-title">收支與理財帳簿</h3>
            <p class="feature-desc">
              建立個人化工作期與退休期收支模型，自動區分常態與一次性花費，清楚掌握現金流與儲蓄率。
            </p>
          </div>

          <!-- Feature 2 -->
          <div class="glass-card feature-card">
            <div class="feature-icon icon-teal">
              <i class="bi bi-award"></i>
            </div>
            <h3 class="feature-title">勞保勞退精準試算</h3>
            <p class="feature-desc">
              內建勞退新制與老年給付最新試算公式，輸入投保年資與平均薪資，自動帶出未來的年金發放額。
            </p>
          </div>

          <!-- Feature 3 -->
          <div class="glass-card feature-card">
            <div class="feature-icon icon-amber">
              <i class="bi bi-graph-up-arrow"></i>
            </div>
            <h3 class="feature-title">長期資產複利模擬</h3>
            <p class="feature-desc">
              支援股票、基金、定存與房產等多元資產報酬率，預測未來 10 至 40 年資產複利成長曲線。
            </p>
          </div>

          <!-- Feature 4 -->
          <div class="glass-card feature-card">
            <div class="feature-icon icon-indigo">
              <i class="bi bi-pie-chart"></i>
            </div>
            <h3 class="feature-title">退休資金缺口分析</h3>
            <p class="feature-desc">
              自動精算通貨膨脹調整後的實際花費需求，精確比較資金儲蓄缺口，並提供行動策略建議。
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- Interactive Quick Simulator Section -->
    <section id="simulator" class="simulator-section">
      <div class="container">
        <div class="glass-card simulator-box">
          <div class="simulator-grid">
            <div>
              <span class="badge badge-emerald" style="margin-bottom: 12px;">即時拉條試算</span>
              <h2 style="font-size: 2rem; font-weight: 800; margin-bottom: 16px;">幾秒鐘內估算您的退休資金</h2>
              <p style="color: var(--text-muted); margin-bottom: 28px;">試著移動下方滑桿，了解定期儲蓄與時間複利帶來的倍增效益：</p>

              <div class="form-group">
                <div class="form-label">
                  <span>目前年齡</span>
                  <span class="gradient-text font-bold">{{ simAge }} 歲</span>
                </div>
                <input type="range" v-model.number="simAge" class="range-input" min="20" max="60">
              </div>

              <div class="form-group">
                <div class="form-label">
                  <span>預計退休年齡</span>
                  <span class="gradient-text font-bold">{{ simRetireAge }} 歲</span>
                </div>
                <input type="range" v-model.number="simRetireAge" class="range-input" :min="simAge + 1" max="75">
              </div>

              <div class="form-group">
                <div class="form-label">
                  <span>每月投入儲蓄/投資額</span>
                  <span class="gradient-text font-bold">{{ formatMoney(simMonthly) }} / 月</span>
                </div>
                <input type="range" v-model.number="simMonthly" class="range-input" min="3000" max="50000" step="1000">
              </div>

              <div class="form-group">
                <div class="form-label">
                  <span>預期年化報酬率</span>
                  <span class="gradient-text font-bold">{{ simReturn }} %</span>
                </div>
                <input type="range" v-model.number="simReturn" class="range-input" min="1" max="12" step="0.5">
              </div>
            </div>

            <div class="sim-result-card">
              <div style="color: var(--text-muted); font-size: 0.95rem;">退休時預估可累積資產總額</div>
              <div class="sim-number gradient-text">{{ formatMoney(calculatedFV) }}</div>
              <p style="color: var(--text-dim); font-size: 0.85rem; margin-bottom: 24px;">
                距離退休還有 <span style="color: var(--text-main); font-weight: 600;">{{ simYears }}</span> 年，總本金投入約 <span style="color: var(--text-main); font-weight: 600;">{{ formatMoney(calculatedPrincipal) }}</span>，複利獲利達 <span style="color: #34d399; font-weight: 600;">{{ formatMoney(calculatedInterest) }}</span>。
              </p>
              <router-link to="/register" class="btn btn-primary" style="width: 100%;">
                建立完整的退休規劃模型 <i class="bi bi-arrow-right"></i>
              </router-link>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Step Process Section -->
    <section id="steps" class="steps-section">
      <div class="container">
        <div class="section-header">
          <h2 class="section-title">三步驟，輕鬆開啟您的退休藍圖</h2>
          <p class="section-subtitle">簡潔直覺的介面，帶您按部就班釐清財務現況。</p>
        </div>

        <div class="steps-grid">
          <div class="glass-card step-card">
            <div class="step-badge">1</div>
            <h3 class="feature-title">輸入現有資產與收支</h3>
            <p class="feature-desc">建立您的基礎資產庫，包括銀行存款、投資部位以及日常各項生活支出。</p>
          </div>

          <div class="glass-card step-card">
            <div class="step-badge">2</div>
            <h3 class="feature-title">設定勞保與投資參數</h3>
            <p class="feature-desc">選填工作薪資投保級距，並可彈性調整多元投資組合的年化回報率。</p>
          </div>

          <div class="glass-card step-card">
            <div class="step-badge">3</div>
            <h3 class="feature-title">生成缺口報告與建議</h3>
            <p class="feature-desc">系統自動產生動態圖表與缺口數據，助您調整最適儲蓄與資產配置策略。</p>
          </div>
        </div>
      </div>
    </section>

    <!-- System Announcements Section -->
    <section id="notices" class="notices-section">
      <div class="container">
        <div class="section-header">
          <h2 class="section-title"><i class="bi bi-megaphone me-2 gradient-text"></i> 最新系統公告與法令更新</h2>
          <p class="section-subtitle">即時掌握最新的勞退制度微調與平台全新升級功能。</p>
        </div>

        <div v-if="loadingNotices" class="text-center py-4">
          <div class="spinner-border text-success" role="status"></div>
        </div>
        <div v-else-if="notices.length === 0" class="notices-list">
          <div class="notice-item">
            <div>
              <span class="badge badge-emerald" style="margin-bottom: 6px;">系統功能更新</span>
              <div class="notice-title">【功能上線】新增勞保投保薪資上限動態微調試算工具</div>
              <div style="font-size: 0.85rem; color: var(--text-muted);">
                已更新 2026 最新勞保與勞退投保分級表，輸入薪資即可自動核算最新老年給付標準。
              </div>
            </div>
            <div class="notice-date">2026-07-20</div>
          </div>
          <div class="notice-item">
            <div>
              <span class="badge badge-emerald" style="margin-bottom: 6px;">重要提醒</span>
              <div class="notice-title">預估退休缺口時建議包含醫療與長照預備金</div>
              <div style="font-size: 0.85rem; color: var(--text-muted);">
                平台分析建議於支出設定中包含每年一定比例的醫療準備金，以提高模型實務可靠度。
              </div>
            </div>
            <div class="notice-date">2026-07-15</div>
          </div>
        </div>
        <div v-else class="notices-list">
          <div v-for="notice in notices" :key="notice._id" class="notice-item">
            <div>
              <span class="badge badge-emerald" style="margin-bottom: 6px;">系統公告</span>
              <div class="notice-title">{{ notice.title }}</div>
              <div style="font-size: 0.85rem; color: var(--text-muted); white-space: pre-wrap;">{{ notice.content }}</div>
            </div>
            <div class="notice-date">{{ formatDate(notice.publishDate) }}</div>
          </div>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <footer class="footer">
      <div class="container">
        <div class="footer-grid">
          <div class="footer-brand">
            <router-link to="/" class="brand-logo">
              <div class="brand-icon">
                <i class="bi bi-shield-lock-fill"></i>
              </div>
              <span class="brand-name gradient-text">退休理財規劃平台</span>
            </router-link>
            <p>專業、精準、安心的個人化退休財務規劃解決方案。幫助您自信邁向人生下一階段。</p>
          </div>

          <div>
            <h4 class="footer-col-title">平台導覽</h4>
            <ul class="footer-links">
              <li><a href="#hero">首頁</a></li>
              <li><a href="#features">核心功能</a></li>
              <li><a href="#simulator">即時試算</a></li>
              <li><a href="#notices">最新公告</a></li>
            </ul>
          </div>

          <div>
            <h4 class="footer-col-title">常用工具</h4>
            <ul class="footer-links">
              <li><router-link to="/register">勞保老年給付試算</router-link></li>
              <li><router-link to="/register">勞退個人專戶累積</router-link></li>
              <li><router-link to="/register">複利投資模擬器</router-link></li>
              <li><router-link to="/register">通膨影響評估器</router-link></li>
            </ul>
          </div>

          <div>
            <h4 class="footer-col-title">聯絡與說明</h4>
            <ul class="footer-links">
              <li><a href="#">使用說明與教學</a></li>
              <li><a href="#">常見問題 FAQ</a></li>
              <li><a href="#">隱私權條款</a></li>
              <li><a href="#">服務條款</a></li>
            </ul>
          </div>
        </div>

        <div class="footer-bottom">
          <p>© 2026 退休理財規劃平台. All Rights Reserved. 專題報告與系統演示使用。</p>
          <p style="margin-top: 4px; opacity: 0.7;">本平台所提供之所有試算結果與分析圖表僅供財務規劃參考，不構成任何實際投資建議。</p>
        </div>
      </div>
    </footer>
  </div>
</template>

<script>
import { computed, onMounted, ref } from 'vue';
import { useAuthStore } from '../stores/auth';
import axios from 'axios';

export default {
  name: 'HomeView',
  setup() {
    const authStore = useAuthStore();
    const notices = ref([]);
    const loadingNotices = ref(true);

    const isAuthenticated = computed(() => authStore.isAuthenticated);

    // Interactive Simulator State
    const simAge = ref(30);
    const simRetireAge = ref(65);
    const simMonthly = ref(15000);
    const simReturn = ref(6);

    const simYears = computed(() => Math.max(1, simRetireAge.value - simAge.value));

    const calculatedFV = computed(() => {
      const rateMonth = (simReturn.value / 100) / 12;
      const months = simYears.value * 12;
      if (rateMonth <= 0) return simMonthly.value * months;
      return simMonthly.value * ((Math.pow(1 + rateMonth, months) - 1) / rateMonth);
    });

    const calculatedPrincipal = computed(() => simMonthly.value * simYears.value * 12);
    const calculatedInterest = computed(() => Math.max(0, calculatedFV.value - calculatedPrincipal.value));

    const formatMoney = (amount) => {
      if (!amount) return '$0';
      return '$' + Math.round(amount).toLocaleString('zh-TW');
    };

    const fetchNotices = async () => {
      try {
        const res = await axios.get('/api/notices');
        if (res.data && res.data.success) {
          notices.value = res.data.data;
        }
      } catch (err) {
        console.error('Failed to load notices', err);
      } finally {
        loadingNotices.value = false;
      }
    };

    const formatDate = (dateStr) => {
      if (!dateStr) return '';
      const date = new Date(dateStr);
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    };

    onMounted(() => {
      fetchNotices();
    });

    return {
      isAuthenticated,
      notices,
      loadingNotices,
      formatDate,
      simAge,
      simRetireAge,
      simMonthly,
      simReturn,
      simYears,
      calculatedFV,
      calculatedPrincipal,
      calculatedInterest,
      formatMoney
    };
  }
};
</script>

<style scoped>
/* Modern Scoped Styling */
.home-container {
  min-height: 100vh;
  background-color: #0f172a;
  color: #f8fafc;
  font-family: 'Inter', 'Noto Sans TC', sans-serif;
  overflow-x: hidden;
  background: radial-gradient(circle at 50% 0%, #1e1b4b 0%, #0f172a 50%, #090d16 100%);
}

.gradient-text {
  background: linear-gradient(135deg, #34d399 0%, #38bdf8 50%, #818cf8 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.font-bold {
  font-weight: 700;
}

.badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  border-radius: 9999px;
  font-size: 0.85rem;
  font-weight: 600;
}

.badge-emerald {
  background: rgba(16, 185, 129, 0.12);
  color: #34d399;
  border: 1px solid rgba(16, 185, 129, 0.3);
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 14px 28px;
  border-radius: 16px;
  font-size: 1rem;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  border: none;
}

.btn-primary {
  background: linear-gradient(135deg, #10b981 0%, #3b82f6 100%);
  color: #ffffff;
  box-shadow: 0 10px 20px -5px rgba(16, 185, 129, 0.4);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 15px 30px -5px rgba(16, 185, 129, 0.6);
  filter: brightness(1.1);
}

.btn-outline {
  background: rgba(255, 255, 255, 0.03);
  color: #f8fafc;
  border: 1px solid rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
}

.btn-outline:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: #10b981;
  color: #34d399;
  transform: translateY(-2px);
}

.btn-sm {
  padding: 8px 18px;
  font-size: 0.9rem;
  border-radius: 8px;
}

.glass-card {
  background: rgba(30, 41, 59, 0.7);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 24px;
  padding: 32px;
  transition: all 0.3s ease;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5);
}

.glass-card:hover {
  border-color: rgba(16, 185, 129, 0.3);
}

.header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  background: rgba(15, 23, 42, 0.75);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.nav-wrapper {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 80px;
}

.brand-logo {
  display: flex;
  align-items: center;
  gap: 12px;
  text-decoration: none;
}

.brand-icon {
  width: 42px;
  height: 42px;
  background: linear-gradient(135deg, #10b981 0%, #3b82f6 100%);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.4rem;
  color: white;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
}

.brand-name {
  font-size: 1.35rem;
  font-weight: 800;
  letter-spacing: -0.5px;
}

.nav-links {
  display: flex;
  align-items: center;
  gap: 32px;
  list-style: none;
  margin: 0;
  padding: 0;
}

.nav-link {
  color: #94a3b8;
  text-decoration: none;
  font-weight: 500;
  font-size: 0.95rem;
  transition: color 0.2s;
}

.nav-link:hover {
  color: #10b981;
}

.nav-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.hero-section {
  padding-top: 160px;
  padding-bottom: 100px;
}

.hero-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 60px;
  align-items: center;
}

.hero-tag {
  margin-bottom: 24px;
}

.hero-title {
  font-size: 3.5rem;
  font-weight: 900;
  line-height: 1.15;
  letter-spacing: -1.5px;
  margin-bottom: 24px;
}

.hero-description {
  font-size: 1.15rem;
  color: #94a3b8;
  margin-bottom: 36px;
  line-height: 1.7;
}

.hero-buttons {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

.demo-dashboard-card {
  background: linear-gradient(145deg, rgba(30, 41, 59, 0.9), rgba(15, 23, 42, 0.95));
  border: 1px solid rgba(16, 185, 129, 0.3);
  box-shadow: 0 0 30px rgba(16, 185, 129, 0.25), 0 20px 25px -5px rgba(0, 0, 0, 0.5);
}

.demo-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  padding-bottom: 16px;
  margin-bottom: 24px;
}

.demo-metrics-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 24px;
}

.metric-box {
  background: rgba(15, 23, 42, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  padding: 18px;
}

.metric-label {
  font-size: 0.85rem;
  color: #94a3b8;
  margin-bottom: 6px;
}

.metric-value {
  font-size: 1.6rem;
  font-weight: 700;
}

.metric-value.emerald { color: #10b981; }
.metric-value.amber { color: #f59e0b; }
.metric-value.rose { color: #f43f5e; }

.chart-preview-box {
  background: rgba(15, 23, 42, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  padding: 20px;
}

.progress-bar-container {
  height: 10px;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 5px;
  overflow: hidden;
  margin-top: 12px;
}

.progress-bar-fill {
  height: 100%;
  background: linear-gradient(135deg, #10b981 0%, #3b82f6 100%);
  width: 78%;
  border-radius: 5px;
  transition: width 1s ease-in-out;
}

.section-header {
  text-align: center;
  max-width: 680px;
  margin: 0 auto 60px auto;
}

.section-title {
  font-size: 2.5rem;
  font-weight: 800;
  margin-bottom: 16px;
}

.section-subtitle {
  font-size: 1.1rem;
  color: #94a3b8;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;
}

.feature-card:hover {
  transform: translateY(-6px);
  background: rgba(51, 65, 85, 0.8);
}

.feature-icon {
  width: 56px;
  height: 56px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.75rem;
  margin-bottom: 24px;
}

.feature-icon.icon-emerald { background: rgba(16, 185, 129, 0.15); color: #34d399; }
.feature-icon.icon-teal { background: rgba(20, 184, 166, 0.15); color: #2dd4bf; }
.feature-icon.icon-amber { background: rgba(245, 158, 11, 0.15); color: #fbbf24; }
.feature-icon.icon-indigo { background: rgba(99, 102, 241, 0.15); color: #818cf8; }

.feature-title {
  font-size: 1.25rem;
  font-weight: 700;
  margin-bottom: 12px;
  color: #ffffff;
}

.feature-desc {
  font-size: 0.95rem;
  color: #94a3b8;
  line-height: 1.6;
}

.simulator-section {
  padding: 100px 0;
}

.simulator-box {
  background: linear-gradient(135deg, rgba(30, 41, 59, 0.8), rgba(15, 23, 42, 0.95));
  border: 1px solid rgba(16, 185, 129, 0.2);
}

.simulator-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 40px;
  align-items: center;
}

.form-group {
  margin-bottom: 24px;
}

.form-label {
  display: flex;
  justify-content: space-between;
  font-weight: 600;
  font-size: 0.95rem;
  margin-bottom: 10px;
  color: #f8fafc;
}

.range-input {
  width: 100%;
  height: 8px;
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.1);
  outline: none;
  accent-color: #10b981;
  cursor: pointer;
}

.sim-result-card {
  background: rgba(15, 23, 42, 0.8);
  border: 1px solid rgba(16, 185, 129, 0.3);
  border-radius: 16px;
  padding: 28px;
  text-align: center;
}

.sim-number {
  font-size: 3rem;
  font-weight: 900;
  line-height: 1.2;
  margin: 12px 0;
}

.steps-section {
  padding: 100px 0;
}

.steps-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 32px;
}

.step-badge {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #10b981 0%, #3b82f6 100%);
  border-radius: 9999px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: 1.1rem;
  color: white;
  margin-bottom: 20px;
}

.notices-section {
  padding: 100px 0;
}

.notices-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
  max-width: 840px;
  margin: 0 auto;
}

.notice-item {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 20px;
  padding: 20px 24px;
  background: rgba(30, 41, 59, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  transition: border-color 0.2s;
}

.notice-item:hover {
  border-color: rgba(16, 185, 129, 0.4);
}

.notice-title {
  font-weight: 600;
  font-size: 1.05rem;
  margin-bottom: 6px;
  color: #ffffff;
}

.notice-date {
  font-size: 0.85rem;
  color: #64748b;
  white-space: nowrap;
}

.footer {
  background: rgba(9, 13, 22, 0.95);
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  padding: 60px 0 30px 0;
}

.footer-grid {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr;
  gap: 40px;
  margin-bottom: 40px;
}

.footer-brand p {
  color: #94a3b8;
  font-size: 0.95rem;
  margin-top: 16px;
  max-width: 320px;
}

.footer-col-title {
  font-size: 1rem;
  font-weight: 700;
  margin-bottom: 20px;
  color: #f8fafc;
}

.footer-links {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 0;
  margin: 0;
}

.footer-links a {
  color: #94a3b8;
  text-decoration: none;
  font-size: 0.9rem;
  transition: color 0.2s;
}

.footer-links a:hover {
  color: #10b981;
}

.footer-bottom {
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  padding-top: 24px;
  text-align: center;
  color: #64748b;
  font-size: 0.85rem;
}

@media (max-width: 1024px) {
  .hero-grid, .simulator-grid {
    grid-template-columns: 1fr;
  }
  .features-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  .steps-grid {
    grid-template-columns: 1fr;
  }
  .footer-grid {
    grid-template-columns: 1fr 1fr;
  }
}

@media (max-width: 640px) {
  .features-grid {
    grid-template-columns: 1fr;
  }
  .hero-title {
    font-size: 2.5rem;
  }
  .nav-links {
    display: none;
  }
}
</style>
