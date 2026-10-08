<template>
  <div class="min-h-screen bg-slate-50 flex">
    <!-- Sol Sidebar Bileşeni (components/hotelowner/sidebar.vue) -->
    <HotelownerSidebar :user="user" />

    <!-- Sağ Ana Alan -->
    <div class="flex-1 ml-64 flex flex-col min-w-0">
      <!-- Üst Header Bileşeni (components/hotelowner/header.vue) -->
      <HotelownerHeader :user="user" />

      <!-- Sayfaların geleceği alan -->
      <main class="flex-1 p-8 overflow-y-auto">
        <slot />
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const user = ref({
  firstName: 'Otel Sahibi',
  name: 'Otel Sahibi',
  initials: 'OS'
})

onMounted(() => {
  const username = localStorage.getItem('username') || 'Otel Sahibi'
  user.value = {
    firstName: username,
    name: username,
    initials: username.substring(0, 2).toUpperCase()
  }
})
</script>