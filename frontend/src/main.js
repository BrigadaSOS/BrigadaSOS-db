if (typeof window !== 'undefined') {
  import('preline')
}

import "vue-toastification/dist/index.css";

import './assets/main.css'

import App from './App.vue'
import router from './router'
import Toast from "vue-toastification";
import vue3GoogleLogin from 'vue3-google-login'
import messages from '@intlify/unplugin-vue-i18n/messages'
import piniaPluginPersistedstate from "pinia-plugin-persistedstate";
import { createSSRApp } from 'vue'
import { createI18n } from "vue-i18n";
import { createPinia } from "pinia";
import { createHead } from '@unhead/vue'
import { getStartingLocale } from './utils/i18n'

// Language Configuration
export const i18n = createI18n({
  legacy: false,
  globalInjection: true,
  locale: getStartingLocale(),
  fallbackLocale: 'en',
  availableLocales: ['es', 'en'],
  messages
})

export function createApp() {
  const app = createSSRApp(App);
  const pinia = createPinia();
  const head = createHead()
  app.use(pinia)
  app.use(router)
  app.use(Toast, options_toast)
  app.use(vue3GoogleLogin, {
    clientId: '467066531682-q8p3ve3pc59cqnfjqn9vftpbmplclum3.apps.googleusercontent.com'
  })
  app.use(i18n)
  app.use(head)
  if (typeof window !== 'undefined') {
    //Very important to only do this client-side, to avoid localStorage being undefined during ssg-build.
    // Use the 'piniaPluginPersistedstate' for state persistence in Pinia stores.
    pinia.use(piniaPluginPersistedstate)
  }

  return { app, router };
}

const options_toast = {
  transition: "Vue-Toastification__fade",
  maxToasts: 3,
  newestOnTop: true,
}