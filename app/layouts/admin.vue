<template>
  <div class="min-h-screen bg-slate-50 flex">
    
    <!-- Admin Sidebar -->
    <Sidebar role="Admin" :user="user" :isOpen="sidebarOpen" @close="sidebarOpen = false" />

    <!-- Sağ Ana Alan -->
    <div class="flex-1 flex flex-col min-w-0 lg:pl-64">
      
      <!-- Ortak Header (Admin rolüyle) -->
      <Header 
        role="Admin" 
        :user="user" 
        @toggle-sidebar="sidebarOpen = !sidebarOpen" 
      />

      <!-- Sayfa İçeriği -->
      <main class="flex-1 p-6 lg:p-10 overflow-y-auto">
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
  firstName: 'Admin',
  name: 'Admin',
  initials: 'AD'
})

onMounted(() => {
  const username = localStorage.getItem('username') || localStorage.getItem('adminName') || 'Admin'
  user.value = {
    firstName: username,
    name: username,
    initials: username.substring(0, 2).toUpperCase()
  }
})
</script>