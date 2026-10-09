<template>
  <div class="min-h-screen bg-slate-50 flex">
    
    <!-- Sol Sidebar Bileşeni (Mobil uyumlu hale getirildi) -->
    <Sidebar role="Customer" :user="user" :isOpen="sidebarOpen" @close="sidebarOpen = false" />

    <!-- Sağ Ana Alan (lg ekranlarda ml-64 yerine lg:pl-64 kullanılarak esneklik sağlandı) -->
    <div class="flex-1 flex flex-col min-w-0 lg:pl-64">
      
      <!-- Ortak Üst Header Bileşeni (Customer rolüyle) -->
      <Header 
        role="Customer" 
        :user="user" 
        @toggle-sidebar="sidebarOpen = !sidebarOpen" 
      />

      <!-- Sayfaların geleceği alan -->
      <main class="flex-1 p-6 lg:p-8 overflow-y-auto">
        <slot />
      </main>

    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import Header from '@/components/Header.vue' 
import Sidebar from '@/components/Sidebar.vue'

const sidebarOpen = ref(false)

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