import { createRouter, createWebHashHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import axios from 'axios'

// Layouts
import UserLayout from '../layouts/UserLayout.vue'
import AdminLayout from '../layouts/AdminLayout.vue'

// Views
import HomeView from '../views/HomeView.vue'
import LoginView from '../views/LoginView.vue'
import RegisterView from '../views/RegisterView.vue'

// User Views
import DashboardView from '../views/user/DashboardView.vue'
import IncomeView from '../views/user/IncomeView.vue'
import ExpenseView from '../views/user/ExpenseView.vue'
import AssetView from '../views/user/AssetView.vue'
import InvestmentView from '../views/user/InvestmentView.vue'
import SimulatorsView from '../views/user/SimulatorsView.vue'
import ProfileView from '../views/user/ProfileView.vue'

// Admin Views
import AdminLoginView from '../views/admin/AdminLoginView.vue'
import AdminDashboardView from '../views/admin/AdminDashboardView.vue'
import UserManagementView from '../views/admin/UserManagementView.vue'
import CategoryManagementView from '../views/admin/CategoryManagementView.vue'
import NoticeManagementView from '../views/admin/NoticeManagementView.vue'
import SystemLogView from '../views/admin/SystemLogView.vue'
import AdminManagementView from '../views/admin/AdminManagementView.vue'

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView
  },
  {
    path: '/login',
    name: 'login',
    component: LoginView,
    meta: { requiresGuest: true }
  },
  {
    path: '/register',
    name: 'register',
    component: RegisterView,
    meta: { requiresGuest: true }
  },
  {
    path: '/admin/login',
    name: 'admin-login',
    component: AdminLoginView,
    meta: { requiresAdminGuest: true }
  },
  {
    path: '/dashboard',
    component: UserLayout,
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        name: 'dashboard',
        component: DashboardView
      },
      {
        path: 'income',
        name: 'income-management',
        component: IncomeView
      },
      {
        path: 'expense',
        name: 'expense-management',
        component: ExpenseView
      },
      {
        path: 'asset',
        name: 'asset-management',
        component: AssetView
      },
      {
        path: 'investment',
        name: 'investment-management',
        component: InvestmentView
      },
      {
        path: 'simulators',
        name: 'simulators',
        component: SimulatorsView
      },
      {
        path: 'profile',
        name: 'profile',
        component: ProfileView
      }
    ]
  },
  {
    path: '/admin',
    component: AdminLayout,
    meta: { requiresAdmin: true },
    children: [
      {
        path: 'dashboard',
        name: 'admin-dashboard',
        component: AdminDashboardView
      },
      {
        path: 'users',
        name: 'admin-users',
        component: UserManagementView
      },
      {
        path: 'categories',
        name: 'admin-categories',
        component: CategoryManagementView
      },
      {
        path: 'notices',
        name: 'admin-notices',
        component: NoticeManagementView
      },
      {
        path: 'system-logs',
        name: 'admin-system-logs',
        component: SystemLogView
      },
      {
        path: 'manage-admins',
        name: 'admin-manage-admins',
        component: AdminManagementView
      }
    ]
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/'
  }
]

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes,
  linkActiveClass: 'active'
})

// Dynamic Axios Request Interceptor for Token Scoping
axios.interceptors.request.use(
  (config) => {
    const authStore = useAuthStore()
    const url = config.url || ''

    // Route Admin API calls using adminToken
    if (url.includes('/api/admin')) {
      if (authStore.adminToken) {
        config.headers.Authorization = `Bearer ${authStore.adminToken}`
      } else {
        delete config.headers.Authorization
      }
    } else {
      // Route User API calls using user Token
      if (authStore.token) {
        config.headers.Authorization = `Bearer ${authStore.token}`
      } else {
        delete config.headers.Authorization
      }
    }

    return config
  },
  (error) => Promise.reject(error)
)

// Axios Response Interceptor for global 401 error handling
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      const authStore = useAuthStore()
      const requestUrl = error.config?.url || ''
      const currentPath = router.currentRoute.value.path || ''

      if (requestUrl.includes('/api/admin') || currentPath.startsWith('/admin')) {
        authStore.adminLogout()
        if (!currentPath.includes('/admin/login')) {
          router.push({ name: 'admin-login' })
        }
      } else {
        authStore.logout()
        if (!currentPath.includes('/login') && !currentPath.includes('/register') && currentPath !== '/') {
          router.push({ name: 'login' })
        }
      }
    }
    return Promise.reject(error)
  }
)

// Route Guards
router.beforeEach((to, from, next) => {
  if (to.path.startsWith('/admin')) {
    document.title = '管理員後台'
  } else {
    document.title = '退休理財規劃平台'
  }

  const authStore = useAuthStore()
  authStore.init()

  const isUserAuth = authStore.isAuthenticated
  const isAdminAuth = authStore.isAdminAuthenticated

  if (to.matched.some(record => record.meta.requiresAuth)) {
    // Requires User Login
    if (!isUserAuth) {
      next({ name: 'login' })
    } else {
      next()
    }
  } else if (to.matched.some(record => record.meta.requiresAdmin)) {
    // Requires Admin Login
    if (!isAdminAuth) {
      next({ name: 'admin-login' })
    } else {
      next()
    }
  } else if (to.matched.some(record => record.meta.requiresGuest)) {
    // User cannot visit login/register if already logged into User account
    if (isUserAuth) {
      next({ name: 'dashboard' })
    } else {
      next()
    }
  } else if (to.matched.some(record => record.meta.requiresAdminGuest)) {
    // Admin cannot visit admin login if already logged into Admin account
    if (isAdminAuth) {
      next({ name: 'admin-dashboard' })
    } else {
      next()
    }
  } else {
    next()
  }
})

export default router
