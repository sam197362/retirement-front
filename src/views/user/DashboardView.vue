<template>
  <div>
    <div class="row align-items-center mb-4">
      <div class="col-md-8">
        <h2 class="fw-bold m-0 text-light">財務規劃儀表板 Dashboard</h2>
        <p class="text-secondary mb-0">即時分析您目前的財務現況與未來的退休缺口</p>
      </div>
      <div class="col-md-4 text-md-end mt-3 mt-md-0">
        <button @click="fetchData" class="btn btn-outline-green" :disabled="loading">
          <i class="bi bi-arrow-clockwise" :class="{ 'spin': loading }"></i> 重新載入數據
        </button>
      </div>
    </div>

    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-success" role="status"></div>
      <p class="text-secondary mt-2">載入數據中...</p>
    </div>

    <div v-else class="row g-4">
      <!-- 1. Stats Summary Cards -->
      <div class="col-md-6 col-lg-3">
        <div class="glass-card bg-gradient-green text-start">
          <div class="text-secondary fs-7 mb-1">當前總資產</div>
          <div class="fs-2 fw-bold text-light">${{ formatCurrency(summary.totalAssets) }}</div>
          <div class="fs-8 text-secondary mt-2">包含現金、股票、定存等</div>
        </div>
      </div>

      <div class="col-md-6 col-lg-3">
        <div class="glass-card bg-gradient-blue text-start">
          <div class="text-secondary fs-7 mb-1">工作期每月淨流</div>
          <div class="fs-2 fw-bold" :class="summary.monthlyIncome - summary.monthlyExpense >= 0 ? 'text-success' : 'text-danger'">
            ${{ formatCurrency(summary.monthlyIncome - summary.monthlyExpense) }}
          </div>
          <div class="fs-8 text-secondary mt-2">月收入 ${{ formatCurrency(summary.monthlyIncome) }} / 月支出 ${{ formatCurrency(summary.monthlyExpense) }}</div>
        </div>
      </div>

      <div class="col-md-6 col-lg-3">
        <div class="glass-card bg-gradient-orange text-start">
          <div class="text-secondary fs-7 mb-1">退休預估月收入</div>
          <div class="fs-2 fw-bold text-warning">
            ${{ formatCurrency(summary.retirementSummary?.totalMonthlyRetirementIncome || 0) }}
          </div>
          <div class="fs-8 text-secondary mt-2">包含勞保年金、勞退與持續性收入</div>
        </div>
      </div>

      <div class="col-md-6 col-lg-3">
        <div class="glass-card bg-gradient-red text-start" :style="summary.retirementSummary?.totalRetirementGap > 0 ? 'border-color: var(--accent-red)' : ''">
          <div class="text-secondary fs-7 mb-1">預期退休總缺口</div>
          <div class="fs-2 fw-bold" :class="summary.retirementSummary?.totalRetirementGap > 0 ? 'text-danger' : 'text-success'">
            ${{ formatCurrency(summary.retirementSummary?.totalRetirementGap || 0) }}
          </div>
          <div class="fs-8 text-secondary mt-2">依壽命與通膨計算之資金缺口</div>
        </div>
      </div>

      <!-- 2. Charts Section -->
      <div class="col-lg-6">
        <div class="glass-card h-100">
          <h5 class="fw-bold text-light mb-4"><i class="bi bi-pie-chart text-success me-2"></i> 當前資產配置比例</h5>
          <div style="position: relative; height: 260px;">
            <canvas ref="assetChartCanvas"></canvas>
            <div v-if="assetsCount === 0" class="chart-placeholder d-flex align-items-center justify-content-center">
              <span class="text-secondary fs-7">尚無資產項目，請先新增資產</span>
            </div>
          </div>
        </div>
      </div>

      <div class="col-lg-6">
        <div class="glass-card h-100">
          <h5 class="fw-bold text-light mb-4"><i class="bi bi-bar-chart-steps text-primary me-2"></i> 退休前後月度財務對比</h5>
          <div style="position: relative; height: 260px;">
            <canvas ref="cashflowChartCanvas"></canvas>
            <div v-if="!hasCashflow" class="chart-placeholder d-flex align-items-center justify-content-center">
              <span class="text-secondary fs-7">尚無收支數據，請先新增收支項目與退休規劃</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 3. Pre-Retirement vs Post-Retirement Cashflow Comparison -->
      <div class="col-12">
        <div class="glass-card">
          <h5 class="fw-bold text-light mb-4"><i class="bi bi-shuffle text-success me-2"></i> 退休前後收支儲蓄對比明細</h5>
          <div class="row g-4">
            <!-- 退休前 (工作期) -->
            <div class="col-md-6">
              <div class="p-4 rounded-3 border border-color bg-dark-primary h-100">
                <div class="d-flex justify-content-between align-items-center mb-3">
                  <h6 class="fw-bold text-success m-0"><i class="bi bi-briefcase-fill me-2"></i> 退休前 (工作期)</h6>
                  <span class="badge bg-success-light text-success px-2.5 py-1.5 rounded-pill">當前狀態</span>
                </div>
                <div class="d-flex justify-content-between py-2 border-bottom border-color-light">
                  <span class="text-secondary">每月總收入</span>
                  <span class="fw-semibold text-light">${{ formatCurrency(summary.monthlyIncome) }}</span>
                </div>
                <div class="d-flex justify-content-between py-2 border-bottom border-color-light">
                  <span class="text-secondary">每月總支出</span>
                  <span class="fw-semibold text-danger">${{ formatCurrency(summary.monthlyExpense) }}</span>
                </div>
                <div class="d-flex justify-content-between py-2 mt-2">
                  <span class="text-secondary fw-bold">每月淨儲蓄</span>
                  <span class="fw-bold fs-5" :class="summary.monthlyIncome - summary.monthlyExpense >= 0 ? 'text-success' : 'text-danger'">
                    ${{ formatCurrency(summary.monthlyIncome - summary.monthlyExpense) }}
                  </span>
                </div>
              </div>
            </div>

            <!-- 退休後 (退休期) -->
            <div class="col-md-6" v-if="summary.retirementSummary">
              <div class="p-4 rounded-3 border border-color bg-dark-primary h-100">
                <div class="d-flex justify-content-between align-items-center mb-3">
                  <h6 class="fw-bold text-warning m-0"><i class="bi bi-balloon-fill me-2"></i> 退休後 (退休期)</h6>
                  <span class="badge bg-warning-light text-warning px-2.5 py-1.5 rounded-pill">未來預估</span>
                </div>
                <div class="d-flex justify-content-between py-2 border-bottom border-color-light">
                  <span class="text-secondary">每月預估總收入</span>
                  <span class="fw-semibold text-light">${{ formatCurrency(summary.retirementSummary.totalMonthlyRetirementIncome) }}</span>
                </div>
                <div class="d-flex justify-content-between py-2 border-bottom border-color-light">
                  <span class="text-secondary">每月預估總支出</span>
                  <span class="fw-semibold text-danger">${{ formatCurrency(summary.retirementSummary.expectedMonthlyRetirementExpense) }}</span>
                </div>
                <div class="d-flex justify-content-between py-2 mt-2">
                  <span class="text-secondary fw-bold">每月預估淨差額 (淨儲蓄)</span>
                  <span class="fw-bold fs-5" :class="summary.retirementSummary.totalMonthlyRetirementIncome - summary.retirementSummary.expectedMonthlyRetirementExpense >= 0 ? 'text-success' : 'text-danger'">
                    ${{ formatCurrency(summary.retirementSummary.totalMonthlyRetirementIncome - summary.retirementSummary.expectedMonthlyRetirementExpense) }}
                  </span>
                </div>
              </div>
            </div>
            <div class="col-md-6" v-else>
              <div class="p-4 rounded-3 border border-color bg-dark-primary h-100 d-flex flex-column justify-content-center align-items-center text-secondary">
                <i class="bi bi-lock fs-2 mb-2 text-warning"></i>
                <p class="m-0">請先填寫退休年齡與預期壽命設定，以解鎖退休預估</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 4. Asset Growth & Monthly Savings Path Chart -->
      <div class="col-12 mt-4" v-if="summary.assetProjection && summary.assetProjection.length > 0">
        <div class="glass-card">
          <h5 class="fw-bold text-light mb-4"><i class="bi bi-graph-up-arrow text-success me-2"></i> 總資產趨勢圖</h5>
          <div style="position: relative; height: 350px;">
            <canvas ref="projectionChartCanvas"></canvas>
          </div>
        </div>
      </div>

      <!-- 5. Retirement Gap Analysis Report -->
      <div class="col-12 mt-4" v-if="summary.retirementSummary">
        <div class="glass-card">
          <h5 class="fw-bold text-light mb-4"><i class="bi bi-journal-check text-success me-2"></i> 退休金缺口分析報告</h5>
          
          <div class="row g-4">
            <!-- 缺口試算流程圖 -->
            <div class="col-lg-6">
              <div class="p-4 rounded-3 border border-color bg-dark-primary h-100 d-flex flex-column justify-content-between">
                <h6 class="fw-bold text-light mb-4"><i class="bi bi-calculator-fill text-info me-2"></i> 退休金平衡計算模型</h6>
                
                <div class="d-flex flex-column gap-3 text-start">
                  <!-- 退休總支出 -->
                  <div class="d-flex align-items-center justify-content-between p-3 bg-dark-secondary rounded border border-color-light">
                    <div>
                      <div class="text-secondary fs-8"><i class="bi bi-arrow-up-circle text-danger me-1"></i> A. 退休期預估總需求 (總支出)</div>
                      <div class="text-secondary fs-8 ms-3">{{ summary.retirementSummary.expectedLifeAge - summary.retirementSummary.retirementAge }} 年 × 每月 ${{ formatCurrency(summary.retirementSummary.expectedMonthlyRetirementExpense) }}</div>
                    </div>
                    <div class="fs-5 fw-bold text-danger">${{ formatCurrency(summary.retirementSummary.totalRequiredFunds) }}</div>
                  </div>

                  <div class="text-center text-secondary fs-6"><i class="bi bi-dash-lg"></i></div>

                  <!-- 退休總年金 -->
                  <div class="d-flex align-items-center justify-content-between p-3 bg-dark-secondary rounded border border-color-light">
                    <div>
                      <div class="text-secondary fs-8"><i class="bi bi-arrow-down-circle text-success me-1"></i> B. 退休期預估總年金收入</div>
                      <div class="text-secondary fs-8 ms-3">{{ summary.retirementSummary.expectedLifeAge - summary.retirementSummary.retirementAge }} 年 × 每月 ${{ formatCurrency(summary.retirementSummary.totalMonthlyRetirementIncome) }}</div>
                    </div>
                    <div class="fs-5 fw-bold text-success">${{ formatCurrency(summary.retirementSummary.totalExpectedIncomes) }}</div>
                  </div>

                  <div class="text-center text-secondary fs-6"><i class="bi bi-dash-lg"></i></div>

                  <!-- 退休準備資產 -->
                  <div class="d-flex align-items-center justify-content-between p-3 bg-dark-secondary rounded border border-color-light">
                    <div>
                      <div class="text-secondary fs-8"><i class="bi bi-wallet2 text-info me-1"></i> C. 退休時點預估準備資產</div>
                      <div class="text-secondary fs-8 ms-3">現有資產增值 + 定期投資累積</div>
                    </div>
                    <div class="fs-5 fw-bold text-info">${{ formatCurrency(summary.retirementSummary.projectedAssetsAtRetirement) }}</div>
                  </div>

                  <div class="text-center text-secondary fs-6"><i class="bi bi-pause-fill rotate-90"></i></div>

                  <!-- 預期退休總缺口 -->
                  <div class="d-flex align-items-center justify-content-between p-3 rounded border" :class="summary.retirementSummary.totalRetirementGap > 0 ? 'bg-danger-light border-danger' : 'bg-success-light border-success'">
                    <div>
                      <div class="fw-bold text-light fs-7">D. 預期退休準備總缺口 (A - B - C)</div>
                      <div class="text-secondary fs-8" v-if="summary.retirementSummary.totalRetirementGap > 0">資金不足，需要額外儲蓄或提高投報率</div>
                      <div class="text-secondary fs-8" v-else>資金充足，預期退休生活財務安全</div>
                    </div>
                    <div class="fs-4 fw-bold" :class="summary.retirementSummary.totalRetirementGap > 0 ? 'text-danger' : 'text-success'">
                      ${{ formatCurrency(summary.retirementSummary.totalRetirementGap) }}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 細項分析與建議 -->
            <div class="col-lg-6">
              <div class="p-4 rounded-3 border border-color bg-dark-primary h-100 d-flex flex-column justify-content-between">
                <div>
                  <h6 class="fw-bold text-light mb-4"><i class="bi bi-pie-chart-fill text-warning me-2"></i> 退休後月收入結構分析</h6>
                  <div class="table-responsive">
                    <table class="table table-custom table-sm text-start mb-4">
                      <thead>
                        <tr>
                          <th>月收入項目</th>
                          <th class="text-end">預估金額 /月</th>
                          <th class="text-end">佔總需求比例</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td class="text-secondary"><i class="bi bi-shield-check text-success me-1"></i> 勞保老年年金</td>
                          <td class="text-end fw-semibold text-light">${{ formatCurrency(summary.retirementSummary.estimatedLaborInsurance || 0) }}</td>
                          <td class="text-end text-info">{{ calculatePercentage(summary.retirementSummary.estimatedLaborInsurance, summary.retirementSummary.expectedMonthlyRetirementExpense) }}%</td>
                        </tr>
                        <tr>
                          <td class="text-secondary"><i class="bi bi-piggy-bank-fill text-success me-1"></i> 勞退新制專戶年金</td>
                          <td class="text-end fw-semibold text-light">${{ formatCurrency(summary.retirementSummary.estimatedLaborPension || 0) }}</td>
                          <td class="text-end text-info">{{ calculatePercentage(summary.retirementSummary.estimatedLaborPension, summary.retirementSummary.expectedMonthlyRetirementExpense) }}%</td>
                        </tr>
                        <tr>
                          <td class="text-secondary"><i class="bi bi-arrow-repeat text-success me-1"></i> 其他退休後持續收入</td>
                          <td class="text-end fw-semibold text-light">${{ formatCurrency(summary.retirementSummary.totalMonthlyRetirementIncome - (summary.retirementSummary.estimatedLaborInsurance || 0) - (summary.retirementSummary.estimatedLaborPension || 0)) }}</td>
                          <td class="text-end text-info">{{ calculatePercentage(summary.retirementSummary.totalMonthlyRetirementIncome - (summary.retirementSummary.estimatedLaborInsurance || 0) - (summary.retirementSummary.estimatedLaborPension || 0), summary.retirementSummary.expectedMonthlyRetirementExpense) }}%</td>
                        </tr>
                        <tr class="fw-bold border-top border-color">
                          <td class="text-light">月收入合計</td>
                          <td class="text-end text-success">${{ formatCurrency(summary.retirementSummary.totalMonthlyRetirementIncome) }}</td>
                          <td class="text-end text-success">{{ calculatePercentage(summary.retirementSummary.totalMonthlyRetirementIncome, summary.retirementSummary.expectedMonthlyRetirementExpense) }}%</td>
                        </tr>
                        <tr class="fw-bold text-secondary">
                          <td>退休預估月總需求 (支出)</td>
                          <td class="text-end text-danger">${{ formatCurrency(summary.retirementSummary.expectedMonthlyRetirementExpense) }}</td>
                          <td class="text-end">100.0%</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <h6 class="fw-bold text-light mb-3"><i class="bi bi-shield-fill-check text-info me-2"></i> 缺口安全指標</h6>
                  <div class="row g-2 mb-3">
                    <div class="col-6">
                      <div class="p-3 bg-dark-secondary rounded border border-color text-center">
                        <div class="text-secondary fs-8 mb-1">年金保障率</div>
                        <div class="fs-4 fw-bold text-info">{{ calculatePercentage(summary.retirementSummary.totalMonthlyRetirementIncome, summary.retirementSummary.expectedMonthlyRetirementExpense) }}%</div>
                        <div class="text-secondary fs-8 mt-1">越接近 100% 越安全</div>
                      </div>
                    </div>
                    <div class="col-6">
                      <div class="p-3 bg-dark-secondary rounded border border-color text-center">
                        <div class="text-secondary fs-8 mb-1">資產支應率</div>
                        <div class="fs-4 fw-bold text-info">
                          {{ summary.retirementSummary.totalRequiredFunds > 0 ? calculatePercentage(summary.retirementSummary.projectedAssetsAtRetirement, summary.retirementSummary.totalRequiredFunds) : '100.0' }}%
                        </div>
                        <div class="text-secondary fs-8 mt-1">資產覆蓋總支出比率</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 3. Advisory Panel -->
      <div class="col-12" v-if="summary.retirementSummary">
        <div class="glass-card">
          <h5 class="fw-bold text-light mb-3"><i class="bi bi-activity text-warning me-2"></i> 退休財務評估報告與建議</h5>
          <div class="row align-items-center">
            <div class="col-md-9">
              <p class="text-secondary mb-2" v-if="summary.retirementSummary.totalRetirementGap > 0">
                系統分析顯示：您在 <span class="text-light fw-bold">{{ summary.retirementSummary.retirementAge }} 歲</span> 退休至 <span class="text-light fw-bold">{{ summary.retirementSummary.expectedLifeAge }} 歲</span> 的壽命區間內，預估資金仍有約 <span class="text-danger fw-bold">${{ formatCurrency(summary.retirementSummary.totalRetirementGap) }} 元</span> 的缺口。
              </p>
              <p class="text-secondary mb-2" v-else>
                恭喜您！目前您的資產預期累積金額加上各項年金收入，已經足以覆蓋您退休後的預期生活支出。
              </p>
              <ul class="text-secondary fs-7 m-0 ps-3">
                <li class="mb-1" v-if="summary.retirementSummary.totalRetirementGap > 0">建議您提高每月的定期投資金額，或適度將投資配置調整為年化報酬率較高的標的。</li>
                <li class="mb-1" v-if="summary.retirementSummary.totalRetirementGap > 0">考慮延後退休年齡，增加工作期的儲蓄時間與年資累積。</li>
                <li class="mb-1">退休後的預估月支出設為 ${{ formatCurrency(summary.retirementSummary.expectedMonthlyRetirementExpense) }} 元，可考慮降低非必要支出以縮小缺口。</li>
              </ul>
            </div>
            <div class="col-md-3 text-end mt-3 mt-md-0">
              <router-link to="/dashboard/simulators" class="btn btn-primary-green w-100">進行深度試算 <i class="bi bi-arrow-right"></i></router-link>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, nextTick } from 'vue';
import axios from 'axios';
import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);

export default {
  name: 'DashboardView',
  setup() {
    const loading = ref(true);
    const summary = ref({});
    const assetsCount = ref(0);
    const hasCashflow = ref(false);

    const assetChartCanvas = ref(null);
    const cashflowChartCanvas = ref(null);
    const projectionChartCanvas = ref(null);

    let assetChartInstance = null;
    let cashflowChartInstance = null;
    let projectionChartInstance = null;

    const formatCurrency = (val) => {
      if (val === undefined || val === null) return '0';
      return Math.round(val).toLocaleString();
    };

    const fetchData = async () => {
      loading.value = true;
      try {
        const res = await axios.get('/api/dashboard');
        if (res.data.success) {
          summary.value = res.data.data;
          
          // Fetch assets to check configurations
          const assetRes = await axios.get('/api/assets');
          const assets = assetRes.data.data;
          assetsCount.value = assets.length;

          const monthlyIncome = summary.value.monthlyIncome || 0;
          const monthlyExpense = summary.value.monthlyExpense || 0;
          const monthlyRetIncome = summary.value.retirementSummary?.totalMonthlyRetirementIncome || 0;
          const monthlyRetExpense = summary.value.retirementSummary?.expectedMonthlyRetirementExpense || 0;
          hasCashflow.value = (monthlyIncome > 0 || monthlyExpense > 0 || monthlyRetIncome > 0 || monthlyRetExpense > 0);

          loading.value = false;
          await nextTick();
          renderCharts(assets);
        } else {
          loading.value = false;
        }
      } catch (err) {
        console.error('Failed to load dashboard data', err);
        loading.value = false;
      }
    };

    const renderCharts = (assets) => {
      // Destroy existing chart instances to avoid overlap/errors
      if (assetChartInstance) assetChartInstance.destroy();
      if (cashflowChartInstance) cashflowChartInstance.destroy();
      if (projectionChartInstance) projectionChartInstance.destroy();

      // 1. Asset Configuration Doughnut Chart
      if (assetChartCanvas.value && assets.length > 0) {
        const assetGroups = {};
        assets.forEach(asset => {
          const typeName = asset.assetTypeId?.name || '其他';
          assetGroups[typeName] = (assetGroups[typeName] || 0) + asset.amount;
        });

        const labels = Object.keys(assetGroups);
        const data = Object.values(assetGroups);
        const colors = [
          '#10B981', '#3B82F6', '#F59E0B', '#EF4444', 
          '#8B5CF6', '#EC4899', '#14B8A6', '#6366F1'
        ];

        assetChartInstance = new Chart(assetChartCanvas.value, {
          type: 'doughnut',
          data: {
            labels,
            datasets: [{
              data,
              backgroundColor: colors.slice(0, labels.length),
              borderWidth: 1,
              borderColor: '#1E293B'
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                position: 'right',
                labels: { color: '#94A3B8' }
              }
            }
          }
        });
      }

      // 2. Work vs Retirement Cashflow Bar Chart
      if (cashflowChartCanvas.value && hasCashflow.value) {
        const monthlyIncome = summary.value.monthlyIncome || 0;
        const monthlyExpense = summary.value.monthlyExpense || 0;
        const monthlyRetIncome = summary.value.retirementSummary?.totalMonthlyRetirementIncome || 0;
        const monthlyRetExpense = summary.value.retirementSummary?.expectedMonthlyRetirementExpense || 0;

        cashflowChartInstance = new Chart(cashflowChartCanvas.value, {
          type: 'bar',
          data: {
            labels: ['工作期 (當前)', '退休期 (預估)'],
            datasets: [
              {
                label: '每月總收入',
                data: [monthlyIncome, monthlyRetIncome],
                backgroundColor: '#10B981',
                borderColor: '#10B981',
                borderWidth: 1
              },
              {
                label: '每月總支出',
                data: [monthlyExpense, monthlyRetExpense],
                backgroundColor: '#EF4444',
                borderColor: '#EF4444',
                borderWidth: 1
              }
            ]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              x: {
                grid: { display: false },
                ticks: { color: '#94A3B8' }
              },
              y: {
                grid: { color: 'rgba(255,255,255,0.05)' },
                ticks: { color: '#94A3B8' }
              }
            },
            plugins: {
              legend: {
                labels: { color: '#94A3B8' }
              }
            }
          }
        });
      }

      // 3. Asset Projection Line Chart (總資產趨勢圖)
      if (projectionChartCanvas.value && summary.value.assetProjection && summary.value.assetProjection.length > 0) {
        const projData = summary.value.assetProjection;
        const labels = projData.map(item => `${item.age}歲`);
        const assetValues = projData.map(item => item.assetValue);
        const retirementAge = summary.value.retirementSummary?.retirementAge || 65;

        // Custom styling for retirement year point
        const pointRadii = projData.map(item => (item.age === retirementAge ? 8 : 3));
        const pointHoverRadii = projData.map(item => (item.age === retirementAge ? 10 : 5));
        const pointBackgroundColors = projData.map(item => (item.age === retirementAge ? '#F59E0B' : '#3B82F6'));

        projectionChartInstance = new Chart(projectionChartCanvas.value, {
          type: 'line',
          data: {
            labels,
            datasets: [
              {
                label: '每年總資產合計',
                data: assetValues,
                borderColor: '#3B82F6',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                borderWidth: 2,
                fill: true,
                tension: 0.15,
                pointRadius: pointRadii,
                pointHoverRadius: pointHoverRadii,
                pointBackgroundColor: pointBackgroundColors,
                pointBorderColor: '#FFFFFF',
                pointBorderWidth: projData.map(item => (item.age === retirementAge ? 2 : 1))
              }
            ]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
              mode: 'index',
              intersect: false
            },
            scales: {
              y: {
                type: 'linear',
                ticks: { color: '#94A3B8' },
                grid: { color: 'rgba(255,255,255,0.05)' },
                title: {
                  display: true,
                  text: '資產總額 (NTD)',
                  color: '#94A3B8'
                }
              },
              x: {
                ticks: { color: '#94A3B8' },
                grid: { display: false }
              }
            },
            plugins: {
              legend: {
                labels: { color: '#94A3B8' }
              },
              tooltip: {
                callbacks: {
                  label: function(context) {
                    let label = context.dataset.label || '';
                    if (label) {
                      label += ': ';
                    }
                    if (context.parsed.y !== null) {
                      label += '$' + Math.round(context.parsed.y).toLocaleString();
                    }
                    return label;
                  }
                }
              }
            }
          }
        });
      }
    };

    const calculatePercentage = (value, total) => {
      if (!total || total === 0) return '0.0';
      const val = Number(value) || 0;
      return ((val / total) * 100).toFixed(1);
    };

    onMounted(() => {
      fetchData();
    });

    return {
      loading,
      summary,
      assetsCount,
      hasCashflow,
      assetChartCanvas,
      cashflowChartCanvas,
      projectionChartCanvas,
      formatCurrency,
      calculatePercentage,
      fetchData
    };
  }
};
</script>

<style scoped>
.bg-gradient-green {
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(15, 23, 42, 0.4) 100%);
  border-left: 5px solid var(--accent-green);
}
.bg-gradient-blue {
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(15, 23, 42, 0.4) 100%);
  border-left: 5px solid var(--accent-blue);
}
.bg-gradient-orange {
  background: linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(15, 23, 42, 0.4) 100%);
  border-left: 5px solid var(--accent-orange);
}
.bg-gradient-red {
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(15, 23, 42, 0.4) 100%);
  border-left: 5px solid var(--accent-red);
}

.fs-7 {
  font-size: 0.9rem;
}
.fs-8 {
  font-size: 0.8rem;
}

.spin {
  animation: spinner 1s linear infinite;
}

@keyframes spinner {
  to { transform: rotate(360deg); }
}

.chart-placeholder {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(15, 23, 42, 0.6);
  border-radius: 8px;
}

.bg-danger-light {
  background-color: rgba(239, 68, 68, 0.1);
}

.bg-success-light {
  background-color: rgba(16, 185, 129, 0.1);
}

.border-danger {
  border-color: rgba(239, 68, 68, 0.3) !important;
}

.border-success {
  border-color: rgba(16, 185, 129, 0.3) !important;
}

.rotate-90 {
  display: inline-block;
  transform: rotate(90deg);
}
</style>
