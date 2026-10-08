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
          <span class="text-slate-400 text-xs tracking-wider uppercase">Management System</span>
        </div>
      </div>

      <!-- Kullanıcı Kısa Kartı -->
      <div class="p-4 mx-4 mt-6 bg-slate-900/80 rounded-xl border border-slate-800 flex items-center justify-between">
        <div class="flex items-center space-x-3">
          <div class="w-9 h-9 rounded-lg bg-slate-700 flex items-center justify-center text-white font-semibold text-sm">
            {{ user.initials }}
          </div>
          <div class="overflow-hidden">
            <h4 class="text-white text-sm font-medium leading-tight truncate">{{ user.name }}</h4>
            <span class="text-xs text-amber-500 font-medium">Hotel Owner</span>
          </div>
        </div>
        <Icon name="lucide:chevron-down" class="w-4 h-4 text-slate-400 flex-shrink-0" />
      </div>

      <!-- Navigasyon Sekmeleri -->
      <div class="px-4 py-6 space-y-1">
        <span class="px-3 text-[10px] font-semibold tracking-wider text-slate-500 uppercase">Workspace</span>
        
        <!-- Dashboard -->
        <NuxtLink 
          to="/hotelowner" 
          class="flex items-center space-x-3 px-3 py-2.5 rounded-xl font-medium text-sm transition"
          :class="route.path === '/hotelowner' ? 'bg-slate-800 text-white' : 'hover:bg-slate-800/50 text-slate-400 hover:text-white'"
        >
          <Icon name="lucide:layout-dashboard" class="w-5 h-5" :class="route.path === '/hotelowner' ? 'text-amber-500' : ''" />
          <span>Dashboard</span>
        </NuxtLink>

        <!-- My Hotels -->
        <NuxtLink 
          to="/hotelowner/hotels" 
          class="flex items-center space-x-3 px-3 py-2.5 rounded-xl font-medium text-sm transition"
          :class="route.path.startsWith('/hotelowner/hotels') ? 'bg-slate-800 text-white' : 'hover:bg-slate-800/50 text-slate-400 hover:text-white'"
        >
          <Icon name="lucide:building-2" class="w-5 h-5" :class="route.path.startsWith('/hotelowner/hotels') ? 'text-amber-500' : ''" />
          <span>My Hotels</span>
        </NuxtLink>

        <!-- Rooms -->
        <NuxtLink 
          to="/hotelowner/rooms" 
          class="flex items-center space-x-3 px-3 py-2.5 rounded-xl font-medium text-sm transition"
          :class="route.path === '/hotelowner/rooms' ? 'bg-slate-800 text-white' : 'hover:bg-slate-800/50 text-slate-400 hover:text-white'"
        >
          <Icon name="lucide:bed" class="w-5 h-5" :class="route.path === '/hotelowner/rooms' ? 'text-amber-500' : ''" />
          <span>Rooms</span>
        </NuxtLink>

        <!-- Reservations -->
        <NuxtLink 
          to="/hotelowner/reservations" 
          class="flex items-center space-x-3 px-3 py-2.5 rounded-xl font-medium text-sm transition"
          :class="route.path === '/hotelowner/reservations' ? 'bg-slate-800 text-white' : 'hover:bg-slate-800/50 text-slate-400 hover:text-white'"
        >
          <Icon name="lucide:calendar" class="w-5 h-5" :class="route.path === '/hotelowner/reservations' ? 'text-amber-500' : ''" />
          <span>Reservations</span>
        </NuxtLink>


        <!-- Profile -->
        <NuxtLink 
          to="/hotelowner/profile" 
          class="flex items-center space-x-3 px-3 py-2.5 rounded-xl font-medium text-sm transition"
          :class="route.path === '/hotelowner/profile' ? 'bg-slate-800 text-white' : 'hover:bg-slate-800/50 text-slate-400 hover:text-white'"
        >
          <Icon name="lucide:user" class="w-5 h-5" :class="route.path === '/hotelowner/profile' ? 'text-amber-500' : ''" />
          <span>Profile</span>
        </NuxtLink>
      </div>
    </div>

    <!-- Alt Alan -->
    <div class="p-4 space-y-4 border-t border-slate-800/60">
      <div class="p-3 bg-slate-900 rounded-xl border border-slate-800 text-xs">
        <div class="flex items-center space-x-2 text-amber-500 font-medium mb-1">
          <Icon name="lucide:shield-alert" class="w-4 h-4" />
          <span>Need assistance?</span>
        </div>
        <p class="text-slate-400 text-[11px] mb-2">Our support team is here to help.</p>
        <button class="text-white font-semibold hover:underline">Contact support</button>
      </div>

      <button @click="logout" class="w-full flex items-center space-x-3 px-3 py-2 rounded-xl text-red-400 hover:bg-red-500/10 text-sm transition">
        <Icon name="lucide:log-out" class="w-5 h-5" />
        <span>Log out</span>
      </button>
    </div>
  </aside>
</template>

<script setup>
const route = useRoute()

defineProps({
  user: {
    type: Object,
    required: true
  }
})

const logout = () => {
  localStorage.clear()
  navigateTo('/login')
}
</script>