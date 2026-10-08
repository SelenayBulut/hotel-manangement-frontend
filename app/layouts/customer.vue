<template>
  <div class="min-h-screen bg-slate-50 flex">
    <!-- Sol Sidebar Bileşeni -->
    <CustomerSidebar :user="user" />

    <!-- Sağ Ana Alan -->
    <div class="flex-1 ml-64 flex flex-col min-w-0">
      <!-- Üst Header Bileşeni -->
      <CustomerHeader :user="user" />

      <!-- Sayfaların (Hotels, index vb.) geleceği alan -->
      <main class="flex-1 p-6 lg:p-8">
        <slot />
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const user = ref({
  firstName: 'Kullanıcı',
  name: 'Kullanıcı',
  initials: 'K'
})

onMounted(() => {
  const username = localStorage.getItem('username') || 'Kullanıcı'
  user.value = {
    firstName: username,
    name: username,
    initials: username.substring(0, 2).toUpperCase()
  }
})
</script>