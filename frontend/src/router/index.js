import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import SearchView from '../views/SearchView.vue'
import NotFoundView from '../views/NotFoundView.vue'
import AllAnimeView from '../views/AllAnimeView.vue'
import AccountSummaryView from '../views/AccountSummaryView.vue'

import { userStore } from '../stores/user'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  scrollBehavior() {
    return { top: 0 }
  },
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/search/sentences',
      name: 'search-sentences',
      component: SearchView
    },
    {
      path: '/anime/all',
      name: 'anime-all',
      component: AllAnimeView
    },
    {
      path: '/:catchAll(.*)',
      name: 'not-found',
      component: NotFoundView
    },
    {
      path: '/account',
      name: 'account',
      component: AccountSummaryView,
      meta: { requireAuth: true }
    }
  ]
})

// Global Route Guard
router.beforeEach(async (to, _from, next) => {
  const store = userStore()
  if (to.matched.some((record) => record.meta.requireAuth)) {
    if (store.isLoggedIn) {
      next()
    } else {
      next({
        path: '/'
      })
    }
  } else {
    next()
  }
})

export default router
