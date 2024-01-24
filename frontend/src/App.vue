<script>
import { RouterView } from 'vue-router'
import { initFlowbite } from 'flowbite'

export default {
  created() {
    const savedLanguage = typeof window !== 'undefined' ? localStorage.getItem('language') : null;
    if (savedLanguage) {
      this.$i18n.locale = savedLanguage
    }
    if(typeof window !== 'undefined'){
      initFlowbite()
    }
  }
}
</script>

<template>
  <header></header>

  <RouterView />
</template>
