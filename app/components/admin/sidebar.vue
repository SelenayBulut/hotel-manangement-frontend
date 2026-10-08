<template>
  <aside class="w-64 bg-[#0B132B] text-slate-300 flex flex-col justify-between fixed inset-y-0 left-0 z-30 border-r border-slate-800">
    <div>
      <!-- Logo -->
      <div class="p-6 flex items-center space-x-3 border-b border-slate-800/60">
        <div class="w-10 h-10 rounded-xl bg-amber-600 flex items-center justify-center text-white font-bold text-lg shadow-lg">
          H
        </div>
        <div>
          <span class="text-white font-bold text-base tracking-wide block leading-none">Hotelio</span>
          <span class="text-slate-400 text-xs tracking-wider uppercase">Admin Panel</span>
        </div>
      </div>

      <!-- Kullanıcı Kısa Kartı (Dinamik Bilgi) -->
      <div class="p-4 mx-4 mt-6 bg-slate-900/80 rounded-xl border border-slate-800 flex items-center justify-between">
        <div class="flex items-center space-x-3 truncate">
          <div class="w-9 h-9 rounded-lg bg-slate-700 flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
            {{ userInitials }}
          </div>
          <div class="truncate">
            <h4 class="text-white text-sm font-medium leading-tight truncate">{{ userName }}</h4>
            <span class="text-xs text-amber-500 font-medium">Admin</span>
          </div>
        </div>
        <Icon name="lucide:chevron-down" class="w-4 h-4 text-slate-400 flex-shrink-0" />
      </div>

      <!-- Navigasyon Sekmeleri -->
      <div class="px-4 py-6 space-y-1 overflow-y-auto max-h-[calc(100vh-280px)]">
        <span class="px-3 text-[10px] font-semibold tracking-wider text-slate-500 uppercase">Workspace</span>
        
        <!-- Dashboard -->
        <NuxtLink 
          to="/admin" 
          class="flex items-center space-x-3 px-3 py-2.5 rounded-xl font-medium text-sm transition"
          :class="route.path === '/admin' ? 'bg-slate-800 text-white' : 'hover:bg-slate-800/50 text-slate-400 hover:text-white'"
        >
          <Icon name="lucide:layout-dashboard" class="w-5 h-5" :class="route.path === '/admin' ? 'text-amber-500' : ''" />
          <span>Dashboard</span>
        </NuxtLink>

        <!-- Users -->
        <NuxtLink 
          to="/admin/users" 
          class="flex items-center space-x-3 px-3 py-2.5 rounded-xl font-medium text-sm transition"
          :class="route.path.startsWith('/admin/users') ? 'bg-slate-800 text-white' : 'hover:bg-slate-800/50 text-slate-400 hover:text-white'"
        >
          <Icon name="lucide:users" class="w-5 h-5" :class="route.path.startsWith('/admin/users') ? 'text-amber-500' : ''" />
          <span>Users</span>
        </NuxtLink>

        <!-- Hotels -->
        <NuxtLink 
          to="/admin/hotels" 
          class="flex items-center space-x-3 px-3 py-2.5 rounded-xl font-medium text-sm transition"
          :class="route.path.startsWith('/admin/hotels') ? 'bg-slate-800 text-white' : 'hover:bg-slate-800/50 text-slate-400 hover:text-white'"
        >
          <Icon name="lucide:building-2" class="w-5 h-5" :class="route.path.startsWith('/admin/hotels') ? 'text-amber-500' : ''" />
          <span>Hotels</span>
        </NuxtLink>

        <!-- Rooms -->
        <NuxtLink 
          to="/admin/rooms" 
          class="flex items-center space-x-3 px-3 py-2.5 rounded-xl font-medium text-sm transition"
          :class="route.path.startsWith('/admin/rooms') ? 'bg-slate-800 text-white' : 'hover:bg-slate-800/50 text-slate-400 hover:text-white'"
        >
          <Icon name="lucide:door-open" class="w-5 h-5" :class="route.path.startsWith('/admin/rooms') ? 'text-amber-500' : ''" />
          <span>Rooms</span>
        </NuxtLink>

        <!-- Reservations -->
        <NuxtLink 
          to="/admin/reservations" 
          class="flex items-center space-x-3 px-3 py-2.5 rounded-xl font-medium text-sm transition"
          :class="route.path === '/admin/reservations' ? 'bg-slate-800 text-white' : 'hover:bg-slate-800/50 text-slate-400 hover:text-white'"
        >
          <Icon name="lucide:calendar-check" class="w-5 h-5" :class="route.path === '/admin/reservations' ? 'text-amber-500' : ''" />
          <span>Reservations</span>
        </NuxtLink>

        <!-- Payments -->
        <NuxtLink 
          to="/admin/payments" 
          class="flex items-center space-x-3 px-3 py-2.5 rounded-xl font-medium text-sm transition"
          :class="route.path === '/admin/payments' ? 'bg-slate-800 text-white' : 'hover:bg-slate-800/50 text-slate-400 hover:text-white'"
        >
          <Icon name="lucide:credit-card" class="w-5 h-5" :class="route.path === '/admin/payments' ? 'text-amber-500' : ''" />
          <span>Payments</span>
        </NuxtLink>

        <!-- Logs -->
        <NuxtLink 
          to="/admin/logs" 
          class="flex items-center space-x-3 px-3 py-2.5 rounded-xl font-medium text-sm transition"
          :class="route.path === '/admin/logs' ? 'bg-slate-800 text-white' : 'hover:bg-slate-800/50 text-slate-400 hover:text-white'"
        >
          <Icon name="lucide:file-text" class="w-5 h-5" :class="route.path === '/admin/logs' ? 'text-amber-500' : ''" />
          <span>Logs</span>
        </NuxtLink>

        <!-- Profile -->
        <NuxtLink 
          to="/admin/profile" 
          class="flex items-center space-x-3 px-3 py-2.5 rounded-xl font-medium text-sm transition"
          :class="route.path === '/admin/profile' ? 'bg-slate-800 text-white' : 'hover:bg-slate-800/50 text-slate-400 hover:text-white'"
        >
          <Icon name="lucide:user" class="w-5 h-5" :class="route.path === '/admin/profile' ? 'text-amber-500' : ''" />
          <span>Profile</span>
        </NuxtLink>
      </div>
    </div>

    <!-- Alt Alan -->
    <div class="p-4 space-y-4 border-t border-slate-800/60 bg-[#0B132B]">
      <div class="p-3 bg-slate-900 rounded-xl border border-slate-800 text-xs">
        <div class="flex items-center space-x-2 text-amber-500 font-medium mb-1">
          <Icon name="lucide:shield-alert" class="w-4 h-4" />
          <span>System Status</span>
        </div>
        <p class="text-slate-400 text-[11px] mb-2">All security nodes operational.</p>
        <NuxtLink to="/admin/logs" class="text-white font-semibold hover:underline">View system logs</NuxtLink>
      </div>

      <button @click="logout" class="w-full flex items-center space-x-3 px-3 py-2 rounded-xl text-red-400 hover:bg-red-500/10 text-sm transition">
        <Icon name="lucide:log-out" class="w-5 h-5" />
        <span>Log out</span>
      </button>
    </div>
  </aside>
</template>

<script setup>
import { ref, onMounted } from 'vue'
const route = useRoute()

// Dinamik kullanıcı bilgileri
const userName = ref('Admin User')
const userInitials = ref('AU')

onMounted(() => {
  // localStorage veya genel state'ten kullanıcı adını çekme (yoksa varsayılan kalır)
  const storedName = localStorage.getItem('userName') || localStorage.getItem('username')
  if (storedName) {
    userName.value = storedName
    const parts = storedName.trim().split(' ')
    if (parts.length >= 2) {
      userInitials.value = (parts[0][0] + parts[1][0]).toUpperCase()
    } else if (parts.length === 1) {
      userInitials.value = parts[0].substring(0, 2).toUpperCase()
    }
  }
})


const logout = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('jwt')
  localStorage.removeItem('accessToken')
  localStorage.removeItem('userName')
  localStorage.removeItem('username')
  navigateTo('/login') // Projendeki giriş sayfasına yönlendirme
}
</script>