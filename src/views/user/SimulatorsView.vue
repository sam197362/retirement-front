<template>
  <div>
    <h2 class="fw-bold text-light mb-1"><i class="bi bi-calculator text-success me-2"></i> 退休年金與成長試算</h2>
    <p class="text-secondary mb-4">深入試算您的政府退休金及個人資產複利累積情形</p>

    <!-- Nav tabs -->
    <ul class="nav nav-pills mb-4 gap-2" id="simulator-tabs" role="tablist">
      <li class="nav-item" role="presentation">
        <button class="nav-link nav-pill-custom active" id="li-tab" data-bs-toggle="tab" data-bs-target="#li-pane" type="button" role="tab">
          <i class="bi bi-calculator-fill"></i> 勞工保險 (老年年金)
        </button>
      </li>
      <li class="nav-item" role="presentation">
        <button class="nav-link nav-pill-custom" id="lp-tab" data-bs-toggle="tab" data-bs-target="#lp-pane" type="button" role="tab">
          <i class="bi bi-wallet2"></i> 勞工退休金 (新制專戶)
        </button>
      </li>
      <li class="nav-item" role="presentation">
        <button class="nav-link nav-pill-custom" id="ag-tab" data-bs-toggle="tab" data-bs-target="#ag-pane" type="button" role="tab" @click="handleAssetGrowthTab">
          <i class="bi bi-graph-up-arrow"></i> 長期資產複利模擬
        </button>
      </li>
    </ul>

    <!-- Tab panes -->
    <div class="tab-content" id="simulator-tabs-content">
      <!-- 1. Labor Insurance Pane -->
      <div class="tab-pane fade show active" id="li-pane" role="tabpanel">
        <div class="row g-4">
          <div class="col-lg-5">
            <div class="glass-card">
              <h5 class="fw-bold text-light mb-4">老年給付試算條件</h5>
              <div class="mb-3">
                <label for="liAvgSalary" class="form-label">最高 60 個月之平均投保薪資 (元)</label>
                <input type="number" id="liAvgSalary" v-model.number="liForm.avgSalary" class="form-control" min="0" max="45800">
                <div class="form-text text-secondary">目前勞保最高投保薪資級距為 45,800 元</div>
              </div>
              <div class="mb-3">
                <label for="liYears" class="form-label">累計投保年資 (年)</label>
                <input type="number" id="liYears" v-model.number="liForm.years" class="form-control" min="0" max="60">
              </div>
              <div class="mb-4">
                <label for="liRetireAge" class="form-label">預定退休年齡 (歲)</label>
                <input type="number" id="liRetireAge" v-model.number="liForm.retirementAge" class="form-control" min="50" max="80">
                <div class="form-text text-secondary">法定年齡為 65 歲，提前/延後一年增減 4% (最多 20%)</div>
              </div>
              <button @click="runLaborInsuranceSim" class="btn btn-primary-green w-100 py-2.5" :disabled="calculatingLi">
                <span v-if="calculatingLi" class="spinner-border spinner-border-sm"></span>
                <span v-else>開始試算</span>
              </button>
            </div>
          </div>
          <div class="col-lg-7">
            <div class="glass-card h-100 d-flex flex-column justify-content-between">
              <div>
                <h5 class="fw-bold text-light mb-4">勞保試算結果 (給付公式擇優)</h5>
                <div v-if="liResult" class="row g-3">
                  <div class="col-sm-6">
                    <div class="p-3 bg-dark-primary rounded border border-color">
                      <div class="text-secondary fs-8 mb-1">第一式計算 (0.775% + 3000)</div>
                      <div class="fs-4 fw-bold text-light">${{ formatCurrency(liResult.formulaA) }}</div>
                    </div>
                  </div>
                  <div class="col-sm-6">
                    <div class="p-3 bg-dark-primary rounded border border-color">
                      <div class="text-secondary fs-8 mb-1">第二式計算 (1.55%)</div>
                      <div class="fs-4 fw-bold text-light">${{ formatCurrency(liResult.formulaB) }}</div>
                    </div>
                  </div>
                  <div class="col-12 mt-4 text-center">
                    <div class="p-4 bg-success-light rounded-3 border border-success">
                      <div class="text-secondary fs-7 mb-1 fw-semibold">建議最優月領金額 (月退休金)</div>
                      <div class="display-5 fw-bold text-success">${{ formatCurrency(liResult.monthlyAnnuity) }} <span class="fs-6 text-secondary">元/月</span></div>
                      <div class="text-secondary fs-8 mt-2">年領金額約 ${{ formatCurrency(liResult.annualAnnuity) }} 元</div>
                      <div v-if="liResult.ratio !== 0" class="text-warning fs-8 mt-2 fw-semibold">
                        {{ liResult.ratio < 0 ? `⚠️ 因提前退休，老年年金減給 ${Math.abs(liResult.ratio)}%` : `🎉 因展延退休，老年年金增給 ${liResult.ratio}%` }}
                      </div>
                    </div>
                  </div>
                </div>
                <div v-else class="text-center py-5 text-secondary">
                  <i class="bi bi-calculator display-3 opacity-25"></i>
                  <p class="mt-2">請於左側輸入資料並點擊「開始試算」</p>
                </div>
              </div>
              <div v-if="liResult" class="text-center">
                <button @click="saveLiToRetirementPlan" class="btn btn-outline-green btn-sm" :disabled="savingLi">
                  <i class="bi bi-save"></i> 儲存此試算至我的個人退休設定
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 2. Labor Pension Pane -->
      <div class="tab-pane fade" id="lp-pane" role="tabpanel">
        <div class="row g-4">
          <div class="col-lg-5">
            <div class="glass-card">
              <h5 class="fw-bold text-light mb-4">個人專戶試算條件</h5>
              <div class="mb-3">
                <label for="lpBalance" class="form-label">個人專戶目前累積餘額 (元)</label>
                <input type="number" id="lpBalance" v-model.number="lpForm.currentBalance" class="form-control" min="0">
              </div>
              <div class="row mb-3">
                <div class="col-6">
                  <label for="lpSalary" class="form-label">當前申報月薪 (元)</label>
                  <input type="number" id="lpSalary" v-model.number="lpForm.monthlySalary" class="form-control" min="0">
                </div>
                <div class="col-6">
                  <label for="lpYears" class="form-label">距離退休剩餘年數</label>
                  <input type="number" id="lpYears" v-model.number="lpForm.yearsToRetire" class="form-control" min="0" max="60">
                </div>
              </div>
              <div class="row mb-3">
                <div class="col-6">
                  <label for="lpEmployer" class="form-label">提繳率 (自提+雇主)</label>
                  <select id="lpEmployer" v-model.number="lpForm.contributionRate" class="form-select">
                    <option :value="0.06">6% (僅雇主提撥)</option>
                    <option :value="0.08">8% (雇主+自提2%)</option>
                    <option :value="0.10">10% (雇主+自提4%)</option>
                    <option :value="0.12">12% (足額自提6%)</option>
                  </select>
                </div>
                <div class="col-6">
                  <label for="lpGrowth" class="form-label">預估每年薪資調幅</label>
                  <input type="number" id="lpGrowth" v-model.number="lpForm.salaryGrowthRate" class="form-control" min="0" max="20" step="0.5">
                </div>
              </div>
              <div class="mb-4">
                <label for="lpReturn" class="form-label">個人專戶年收益率 (%)</label>
                <input type="number" id="lpReturn" v-model.number="lpForm.investmentReturn" class="form-control" min="0" max="15" step="0.1">
                <div class="form-text text-secondary">政府最低保證收益率約為 2%</div>
              </div>
              <button @click="runLaborPensionSim" class="btn btn-primary-green w-100 py-2.5" :disabled="calculatingLp">
                <span v-if="calculatingLp" class="spinner-border spinner-border-sm"></span>
                <span v-else>開始專戶試算</span>
              </button>
            </div>
          </div>
          <div class="col-lg-7">
            <div class="glass-card h-100 d-flex flex-column justify-content-between">
              <div>
                <h5 class="fw-bold text-light mb-4">勞退專戶模擬結果</h5>
                <div v-if="lpResult" class="row g-3">
                  <div class="col-sm-12">
                    <div class="p-3 bg-dark-primary rounded border border-color text-center">
                      <div class="text-secondary fs-7 mb-1">退休時個人專戶預計累積總額</div>
                      <div class="fs-2 fw-bold text-warning">${{ formatCurrency(lpResult.accumulatedAmount) }} <span class="fs-6 text-secondary">元</span></div>
                    </div>
                  </div>
                  <div class="col-12 mt-4 text-center">
                    <div class="p-4 bg-success-light rounded-3 border border-success">
                      <div class="text-secondary fs-7 mb-1 fw-semibold">預估按月領取金額 (月退休金，以折現發放 20 年計)</div>
                      <div class="display-5 fw-bold text-success">${{ formatCurrency(lpResult.monthlyAnnuity) }} <span class="fs-6 text-secondary">元/月</span></div>
                      <div class="text-secondary fs-8 mt-2">一年領取金額約 ${{ formatCurrency(lpResult.annualAnnuity) }} 元</div>
                    </div>
                  </div>
                </div>
                <div v-else class="text-center py-5 text-secondary">
                  <i class="bi bi-wallet2 display-3 opacity-25"></i>
                  <p class="mt-2">請於左側輸入資料並點擊「開始專戶試算」</p>
                </div>
              </div>
              <div v-if="lpResult" class="text-center">
                <button @click="saveLpToRetirementPlan" class="btn btn-outline-green btn-sm" :disabled="savingLp">
                  <i class="bi bi-save"></i> 儲存此試算至我的個人退休設定
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 3. Asset Growth Pane -->
      <div class="tab-pane fade" id="ag-pane" role="tabpanel">
        <div class="row g-4">
          <div class="col-lg-4">
            <div class="glass-card">
              <h5 class="fw-bold text-light mb-4">複利模擬控制板</h5>
              <div class="mb-4">
                <label class="form-label d-flex justify-content-between">
                  <span>模擬年數</span>
                  <span class="text-success fw-bold">{{ agForm.years }} 年</span>
                </label>
                <input type="range" class="form-range" min="5" max="50" step="1" v-model.number="agForm.years" @change="runAssetGrowthSim">
              </div>
              
              <div class="p-3 bg-dark-primary rounded border border-color mb-4 fs-7 text-secondary">
                <div class="fw-semibold text-light mb-2"><i class="bi bi-info-circle text-info"></i> 當前參數載入來源：</div>
                <div class="mb-1">現有資產總額：<span class="text-success fw-bold">${{ formatCurrency(agStats.initialAssets) }}</span></div>
                <div>定期投資金額：<span class="text-success fw-bold">${{ formatCurrency(agStats.monthlyInvest) }} /月</span></div>
                <div class="mt-2 fs-8">本模擬將依您所建立的「資產配置」與「投資計畫」的預估報酬率，進行長期滾存計算。</div>
              </div>

              <button @click="runAssetGrowthSim" class="btn btn-primary-green w-100" :disabled="calculatingAg">
                <span v-if="calculatingAg" class="spinner-border spinner-border-sm"></span>
                <span v-else>刷新模擬曲線</span>
              </button>
            </div>
          </div>
          <div class="col-lg-8">
            <div class="glass-card h-100">
              <h5 class="fw-bold text-light mb-4"><i class="bi bi-graph-up text-success"></i> 長期資產成長複利曲線 (本金 vs 累計資產)</h5>
              <div style="position: relative; height: 350px;">
                <canvas ref="growthChartCanvas"></canvas>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, nextTick, watch } from 'vue';
import axios from 'axios';
import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);

export default {
  name: 'SimulatorsView',
  setup() {
    const liForm = ref({ avgSalary: 45800, years: 25, retirementAge: 65 });
    const liResult = ref(null);
    const calculatingLi = ref(false);
    const savingLi = ref(false);

    const lpForm = ref({
      currentBalance: 500000,
      monthlySalary: 50000,
      yearsToRetire: 20,
      contributionRate: 0.06,
      salaryGrowthRate: 1,
      investmentReturn: 2.5
    });
    const lpResult = ref(null);
    const calculatingLp = ref(false);
    const savingLp = ref(false);

    const agForm = ref({ years: 30 });
    const agStats = ref({ initialAssets: 0, monthlyInvest: 0 });
    const calculatingAg = ref(false);
    const growthChartCanvas = ref(null);
    let growthChartInstance = null;

    watch(liForm, (newVal) => {
      localStorage.setItem('sim_li_form', JSON.stringify(newVal));
    }, { deep: true });

    watch(lpForm, (newVal) => {
      localStorage.setItem('sim_lp_form', JSON.stringify(newVal));
    }, { deep: true });

    const formatCurrency = (val) => val?.toLocaleString() || '0';

    const runLaborInsuranceSim = async () => {
      calculatingLi.value = true;
      try {
        const res = await axios.post('/api/retirement/labor-insurance', liForm.value);
        if (res.data.success) {
          liResult.value = res.data.data;
        }
      } catch (err) {
        alert('試算失敗，請檢查輸入內容');
      } finally {
        calculatingLi.value = false;
      }
    };

    const saveLiToRetirementPlan = async () => {
      if (!liResult.value) return;
      savingLi.value = true;
      try {
        const res = await axios.put('/api/auth/profile', {
          laborInsurance: liResult.value.monthlyAnnuity
        });
        if (res.data.success) {
          alert('勞保月年金設定已儲存至您的退休規劃！');
        }
      } catch (err) {
        alert('儲存失敗');
      } finally {
        savingLi.value = false;
      }
    };

    const runLaborPensionSim = async () => {
      calculatingLp.value = true;
      try {
        // Convert growth rates from percent to decimal
        const payload = {
          currentBalance: lpForm.value.currentBalance,
          monthlySalary: lpForm.value.monthlySalary,
          yearsToRetire: lpForm.value.yearsToRetire,
          employerRate: lpForm.value.contributionRate,
          employeeRate: 0,
          salaryGrowthRate: lpForm.value.salaryGrowthRate / 100,
          investmentReturn: lpForm.value.investmentReturn / 100
        };
        const res = await axios.post('/api/retirement/labor-pension', payload);
        if (res.data.success) {
          lpResult.value = res.data.data;
        }
      } catch (err) {
        alert('試算失敗，請檢查輸入內容');
      } finally {
        calculatingLp.value = false;
      }
    };

    const saveLpToRetirementPlan = async () => {
      if (!lpResult.value) return;
      savingLp.value = true;
      try {
        const res = await axios.put('/api/auth/profile', {
          laborPension: lpResult.value.monthlyAnnuity
        });
        if (res.data.success) {
          alert('勞退月年金設定已儲存至您的退休規劃！');
        }
      } catch (err) {
        alert('儲存失敗');
      } finally {
        savingLp.value = false;
      }
    };

    // Asset Growth simulation
    const runAssetGrowthSim = async () => {
      calculatingAg.value = true;
      try {
        const res = await axios.post('/api/retirement/asset-growth', {
          years: agForm.value.years
        });
        if (res.data.success) {
          const simData = res.data.data.simulation;
          agStats.value.initialAssets = res.data.data.initialAssets;
          
          await nextTick();
          plotGrowthChart(simData);
        }
      } catch (err) {
        console.error(err);
      } finally {
        calculatingAg.value = false;
      }
    };

    const plotGrowthChart = (simData) => {
      if (growthChartInstance) growthChartInstance.destroy();
      if (!growthChartCanvas.value) return;

      const labels = simData.map(item => `第 ${item.year} 年`);
      const principals = simData.map(item => item.principal);
      const totals = simData.map(item => item.total);

      growthChartInstance = new Chart(growthChartCanvas.value, {
        type: 'line',
        data: {
          labels,
          datasets: [
            {
              label: '複利滾存總值 (本利和)',
              data: totals,
              borderColor: '#10B981',
              backgroundColor: 'rgba(16, 185, 129, 0.1)',
              fill: true,
              tension: 0.1
            },
            {
              label: '累計投入本金',
              data: principals,
              borderColor: '#475569',
              borderDash: [5, 5],
              fill: false,
              tension: 0.1
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
    };

    const fetchCurrentInvestValue = async () => {
      try {
        const res = await axios.get('/api/dashboard');
        if (res.data.success) {
          agStats.value.monthlyInvest = res.data.data.monthlyInvestable;
        }
      } catch (err) {}
    };

    const handleAssetGrowthTab = async () => {
      await fetchCurrentInvestValue();
      await runAssetGrowthSim();
    };

    onMounted(async () => {
      const savedLi = localStorage.getItem('sim_li_form');
      if (savedLi) {
        try {
          liForm.value = JSON.parse(savedLi);
          await runLaborInsuranceSim();
        } catch (e) {
          console.error(e);
        }
      }
      const savedLp = localStorage.getItem('sim_lp_form');
      if (savedLp) {
        try {
          lpForm.value = JSON.parse(savedLp);
          await runLaborPensionSim();
        } catch (e) {
          console.error(e);
        }
      }
    });

    return {
      liForm,
      liResult,
      calculatingLi,
      savingLi,
      lpForm,
      lpResult,
      calculatingLp,
      savingLp,
      agForm,
      agStats,
      calculatingAg,
      growthChartCanvas,
      formatCurrency,
      runLaborInsuranceSim,
      saveLiToRetirementPlan,
      runLaborPensionSim,
      saveLpToRetirementPlan,
      runAssetGrowthSim,
      handleAssetGrowthTab
    };
  }
};
</script>

<style scoped>
.nav-pill-custom {
  background-color: var(--bg-dark-secondary) !important;
  color: var(--text-secondary) !important;
  border: 1px solid var(--border-color) !important;
  border-radius: 8px !important;
  padding: 0.75rem 1.25rem !important;
  font-weight: 500;
  transition: all 0.2s ease;
}

.nav-pill-custom.active {
  background-color: var(--accent-green) !important;
  color: #fff !important;
  border-color: var(--accent-green) !important;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3) !important;
}

.bg-success-light {
  background-color: rgba(16, 185, 129, 0.1);
}

.fs-7 {
  font-size: 0.9rem;
}
.fs-8 {
  font-size: 0.8rem;
}
</style>
