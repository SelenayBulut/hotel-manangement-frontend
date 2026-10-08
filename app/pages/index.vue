<script setup>
import { onMounted } from 'vue'

onMounted(() => {
  const token = localStorage.getItem('token')
  const role = localStorage.getItem('role')?.toLowerCase()

  if (token) {
    if (role === 'customer') {
      navigateTo('/customer')
    } else if (role === 'admin') {
      navigateTo('/admin')
    } else if (role === 'hotelowner') {
      navigateTo('/hotelowner')
    } else {
      navigateTo('/login')
    }
  } else {
    navigateTo('/login')
  }
})
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-slate-50">
    <p class="text-slate-500 text-sm font-medium animate-pulse">Yönlendiriliyor...</p>
  </div>
</template>