<template>
  <div class="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-white">
    <!-- Sol Taraf: Görsel ve İçerik -->
<div class="hidden lg:flex relative h-full flex-col justify-between p-12 bg-slate-900">
  <!-- Arka Plan Görseli -->
  <img 
    src="https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80" 
    alt="Hotel View" 
    class="absolute inset-0 w-full h-full object-cover filter grayscale contrast-125 opacity-50"
  />
  
  <!-- Okunabilirlik İçin Koyu Degrade Katman -->
  <div class="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-slate-950/30"></div>

  <!-- Üst Kısım: Logo ve Sistem Adı -->
  <div class="relative z-10 flex items-center space-x-3">
    <div class="w-10 h-10 rounded-xl bg-amber-600 flex items-center justify-center text-white font-bold text-lg shadow-lg">
      H
    </div>
    <div>
      <span class="text-white font-bold text-base tracking-wide block leading-none">Hotelio</span>
      <span class="text-slate-300 text-xs tracking-wider uppercase">Management System</span>
    </div>
  </div>

  <!-- Alt Kısım: Alıntı Söz ve Açıklama -->
  <div class="relative z-10 max-w-lg mb-4">
    <h3 class="text-2xl sm:text-3xl font-extrabold text-white leading-snug mb-3">
      "Great hospitality starts with a seamless experience."
    </h3>
    <p class="text-sm text-slate-300">
      One platform for guests, hotel owners, and teams.
    </p>
  </div>
</div>

    <!-- Sağ Taraf: Giriş Formu -->
    <div class="flex flex-col justify-center px-8 sm:px-16 lg:px-24 py-12">
      <div class="max-w-md w-full mx-auto">
        <span class="text-xs font-bold tracking-widest text-amber-600 uppercase">HOTEL MANAGEMENT SYSTEM</span>
        <h2 class="text-3xl font-extrabold text-slate-900 mt-2 mb-1">Welcome back</h2>
        <p class="text-sm text-slate-500 mb-8">Sign in to manage your stays and reservations.</p>
        
        <!-- Hata Mesajı -->
        <div v-if="errorMessage" class="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg">
          {{ errorMessage }}
        </div>

        <form class="space-y-5" @submit.prevent="handleLogin">
          <div>
            <label class="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">Email address</label>
            <input 
              type="email" 
              v-model="email"
              required
              placeholder="name@example.com" 
              class="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition"
            />
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">Password</label>
            <input 
              type="password" 
              v-model="password"
              required
              placeholder="At least 8 characters" 
              class="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition"
            />
          </div>

          <div class="flex items-center justify-between text-sm">
            <label class="flex items-center space-x-2 cursor-pointer">
              <input type="checkbox" class="rounded border-slate-300 text-slate-900 focus:ring-slate-900" />
              <span class="text-slate-600">Remember me</span>
            </label>
          </div>

          <button 
            type="submit" 
            :disabled="loading"
            class="w-full bg-[#0B132B] text-white py-3 rounded-lg font-medium hover:bg-slate-800 transition shadow-sm disabled:opacity-50"
          >
            {{ loading ? 'Signing in...' : 'Sign in' }}
          </button>
        </form>

        <p class="text-sm text-center text-slate-600 mt-8">
          New to Hotelio? 
          <NuxtLink to="/register" class="text-slate-900 font-semibold hover:underline">Create an account</NuxtLink>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const email = ref('')
const password = ref('')
const errorMessage = ref('')
const loading = ref(false)
const router = useRouter()
const config = useRuntimeConfig()

const handleLogin = async () => {
  errorMessage.value = ''
  loading.value = true
  
  try {
    const response = await $fetch(`${config.public.apiBase}/api/auth/login`, {
      method: 'POST',
      body: {
        Email: email.value,       
        Password: password.value  
      }
    })

    localStorage.setItem('token', response.token)
    localStorage.setItem('username', response.username)
    localStorage.setItem('role', response.role)
    const role = response.role?.toLowerCase()

      if (role === 'customer') {
        router.push('/customer') 
      } else if (role === 'admin') {
        router.push('/admin')
      } else if (role === 'hotelowner') {
        router.push('/hotelowner') // Projedeki klasör adına göre '/hotel-owner' veya '/hotelowner' yapabilirsin
      }

    router.push('/')
  } catch (error) {
    errorMessage.value = error.data?.message || "Giriş yapılırken bir hata oluştu."
  } finally {
    loading.value = false
  }
}
</script>