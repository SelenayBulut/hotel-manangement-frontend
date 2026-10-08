<script setup>
import { ref } from 'vue'
const sidebarOpen = ref(false)
</script>

<template>
  <div class="min-h-screen bg-slate-50 flex">
    
    <!-- Admin Sidebar (Fixed w-64) -->
    <AdminSidebar :isOpen="sidebarOpen" @close="sidebarOpen = false" />

    <!-- Sağ Ana İçerik Alanı (lg ekranlarda sol boşluk bırakıldı) -->
    <div class="flex-1 flex flex-col min-w-0 lg:pl-64">
      
      <!-- Admin Header -->
      <AdminHeader @toggle-sidebar="sidebarOpen = !sidebarOpen" />

      <!-- Sayfa İçeriği -->
      <main class="flex-1 p-6 lg:p-10 overflow-y-auto">
        <slot />
      </main>

    </div>
  </div>
</template>