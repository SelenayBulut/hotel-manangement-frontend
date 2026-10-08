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
          <div>
            <h4 class="text-white text-sm font-medium leading-tight">{{ user.name }}</h4>
            <span class="text-xs text-slate-400">Customer</span>
          </div>
        </div>
        <Icon name="lucide:chevron-down" class="w-4 h-4 text-slate-400" />
      </div>

      <!-- Navigasyon Sekmeleri -->
      <div class="px-4 py-6 space-y-1">
        <span class="px-3 text-[10px] font-semibold tracking-wider text-slate-500 uppercase">Workspace</span>
        
        <!-- Dashboard -->
        <NuxtLink 
          to="/customer" 
          class="flex items-center space-x-3 px-3 py-2.5 rounded-xl font-medium text-sm transition"
          :class="route.path === '/customer' ? 'bg-slate-800 text-white' : 'hover:bg-slate-800/50 text-slate-400 hover:text-white'"
        >
          <Icon name="lucide:layout-dashboard" class="w-5 h-5" :class="route.path === '/customer' ? 'text-amber-500' : ''" />
          <span>Dashboard</span>
        </NuxtLink>

        <!-- Hotels -->
        <NuxtLink 
          to="/customer/hotels" 
          class="flex items-center space-x-3 px-3 py-2.5 rounded-xl font-medium text-sm transition"
          :class="route.path.startsWith('/customer/hotels') ? 'bg-slate-800 text-white' : 'hover:bg-slate-800/50 text-slate-400 hover:text-white'"
        >
          <Icon name="lucide:building-2" class="w-5 h-5" :class="route.path.startsWith('/customer/hotels') ? 'text-amber-500' : ''" />
          <span>Hotels</span>
        </NuxtLink>

        <!-- My Reservations -->
        <NuxtLink 
          to="/customer/reservations" 
          class="flex items-center space-x-3 px-3 py-2.5 rounded-xl font-medium text-sm transition"
          :class="route.path === '/customer/reservations' ? 'bg-slate-800 text-white' : 'hover:bg-slate-800/50 text-slate-400 hover:text-white'"
        >
          <Icon name="lucide:calendar" class="w-5 h-5" :class="route.path === '/customer/reservations' ? 'text-amber-500' : ''" />
          <span>My Reservations</span>
        </NuxtLink>

        <!-- Payments -->
        <NuxtLink 
          to="/customer/payments" 
          class="flex items-center space-x-3 px-3 py-2.5 rounded-xl font-medium text-sm transition"
          :class="route.path === '/customer/payments' ? 'bg-slate-800 text-white' : 'hover:bg-slate-800/50 text-slate-400 hover:text-white'"
        >
          <Icon name="lucide:credit-card" class="w-5 h-5" :class="route.path === '/customer/payments' ? 'text-amber-500' : ''" />
          <span>Payments</span>
        </NuxtLink>

        <!-- Profile -->
        <NuxtLink 
          to="/customer/profile" 
          class="flex items-center space-x-3 px-3 py-2.5 rounded-xl font-medium text-sm transition"
          :class="route.path === '/customer/profile' ? 'bg-slate-800 text-white' : 'hover:bg-slate-800/50 text-slate-400 hover:text-white'"
        >
          <Icon name="lucide:user" class="w-5 h-5" :class="route.path === '/customer/profile' ? 'text-amber-500' : ''" />
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
  navigateTo('/login')
}
</script>