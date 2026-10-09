<template>
    <!-- Yan Menü (Sidebar) Ana Kapsayıcısı:-->
  <aside 
    :class="[
      'w-64 bg-[#0B132B] text-slate-300 flex flex-col justify-between fixed inset-y-0 left-0 z-30 border-r border-slate-800 transition-transform duration-300 lg:translate-x-0',
      isOpen ? 'translate-x-0' : '-translate-x-full'
    ]"
  >
    <div>
      <!-- Logo -->
      <div class="p-6 flex items-center space-x-3 border-b border-slate-800/60">
        <div class="w-10 h-10 rounded-xl bg-amber-600 flex items-center justify-center text-white font-bold text-lg shadow-lg">
          H
        </div>
        <div>
          <span class="text-white font-bold text-base tracking-wide block leading-none">Hotelio</span>
          <span class="text-slate-400 text-xs tracking-wider uppercase">{{ roleDisplay }} Panel</span>
        </div>
      </div>

      <!-- Kullanıcı Kısa Kartı -->
      <div class="p-4 mx-4 mt-6 bg-slate-900/80 rounded-xl border border-slate-800 flex items-center justify-between">
        <div class="flex items-center space-x-3 truncate">
          <div class="w-9 h-9 rounded-lg bg-slate-700 flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
            {{ user.initials || 'U' }}
          </div>
          <div class="truncate">
            <h4 class="text-white text-sm font-medium leading-tight truncate">{{ user.name || user.firstName || 'Kullanıcı' }}</h4>
            <span class="text-xs text-amber-500 font-medium">{{ roleDisplay }}</span>
          </div>
        </div>
        <Icon name="lucide:chevron-down" class="w-4 h-4 text-slate-400 flex-shrink-0" />
      </div>

      <!-- Navigasyon Sekmeleri (Role Göre Dinamik) -->
      <div class="px-4 py-6 space-y-1 overflow-y-auto max-h-[calc(100vh-280px)]">
        <span class="px-3 text-[10px] font-semibold tracking-wider text-slate-500 uppercase">Workspace</span>
        
        <!-- ADMIN MENÜLERİ -->
        <template v-if="role === 'Admin'">
          <NuxtLink to="/admin" :class="linkClass('/admin')">
            <Icon name="lucide:layout-dashboard" :class="iconClass('/admin')" />
            <span>Dashboard</span>
          </NuxtLink>
          <NuxtLink to="/admin/users" :class="linkClass('/admin/users', true)">
            <Icon name="lucide:users" :class="iconClass('/admin/users', true)" />
            <span>Users</span>
          </NuxtLink>
          <NuxtLink to="/admin/hotels" :class="linkClass('/admin/hotels', true)">
            <Icon name="lucide:building-2" :class="iconClass('/admin/hotels', true)" />
            <span>Hotels</span>
          </NuxtLink>
          <NuxtLink to="/admin/rooms" :class="linkClass('/admin/rooms', true)">
            <Icon name="lucide:door-open" :class="iconClass('/admin/rooms', true)" />
            <span>Rooms</span>
          </NuxtLink>
          <NuxtLink to="/admin/reservations" :class="linkClass('/admin/reservations')">
            <Icon name="lucide:calendar-check" :class="iconClass('/admin/reservations')" />
            <span>Reservations</span>
          </NuxtLink>
          <NuxtLink to="/admin/payments" :class="linkClass('/admin/payments')">
            <Icon name="lucide:credit-card" :class="iconClass('/admin/payments')" />
            <span>Payments</span>
          </NuxtLink>
          <NuxtLink to="/admin/logs" :class="linkClass('/admin/logs')">
            <Icon name="lucide:file-text" :class="iconClass('/admin/logs')" />
            <span>Logs</span>
          </NuxtLink>
          <NuxtLink to="/admin/profile" :class="linkClass('/admin/profile')">
            <Icon name="lucide:user" :class="iconClass('/admin/profile')" />
            <span>Profile</span>
          </NuxtLink>
        </template>

        <!-- HOTEL OWNER MENÜLERİ -->
        <template v-else-if="role === 'Hotel Owner'">
          <NuxtLink to="/hotelowner" :class="linkClass('/hotelowner')">
            <Icon name="lucide:layout-dashboard" :class="iconClass('/hotelowner')" />
            <span>Dashboard</span>
          </NuxtLink>
          <NuxtLink to="/hotelowner/hotels" :class="linkClass('/hotelowner/hotels', true)">
            <Icon name="lucide:building-2" :class="iconClass('/hotelowner/hotels', true)" />
            <span>My Hotels</span>
          </NuxtLink>
          <NuxtLink to="/hotelowner/rooms" :class="linkClass('/hotelowner/rooms')">
            <Icon name="lucide:bed" :class="iconClass('/hotelowner/rooms')" />
            <span>Rooms</span>
          </NuxtLink>
          <NuxtLink to="/hotelowner/reservations" :class="linkClass('/hotelowner/reservations')">
            <Icon name="lucide:calendar" :class="iconClass('/hotelowner/reservations')" />
            <span>Reservations</span>
          </NuxtLink>
          <NuxtLink to="/hotelowner/profile" :class="linkClass('/hotelowner/profile')">
            <Icon name="lucide:user" :class="iconClass('/hotelowner/profile')" />
            <span>Profile</span>
          </NuxtLink>
        </template>

        <!-- CUSTOMER MENÜLERİ -->
        <template v-else-if="role === 'Customer'">
          <NuxtLink to="/customer" :class="linkClass('/customer')">
            <Icon name="lucide:layout-dashboard" :class="iconClass('/customer')" />
            <span>Dashboard</span>
          </NuxtLink>
          <NuxtLink to="/customer/hotels" :class="linkClass('/customer/hotels', true)">
            <Icon name="lucide:building-2" :class="iconClass('/customer/hotels', true)" />
            <span>Hotels</span>
          </NuxtLink>
          <NuxtLink to="/customer/reservations" :class="linkClass('/customer/reservations')">
            <Icon name="lucide:calendar" :class="iconClass('/customer/reservations')" />
            <span>My Reservations</span>
          </NuxtLink>
          <NuxtLink to="/customer/payments" :class="linkClass('/customer/payments')">
            <Icon name="lucide:credit-card" :class="iconClass('/customer/payments')" />
            <span>Payments</span>
          </NuxtLink>
          <NuxtLink to="/customer/profile" :class="linkClass('/customer/profile')">
            <Icon name="lucide:user" :class="iconClass('/customer/profile')" />
            <span>Profile</span>
          </NuxtLink>
        </template>
      </div>
    </div>

    <!-- Alt Sabit Alan -->
    <div class="p-4 space-y-3 border-t border-slate-800/60 bg-[#0B132B]">
      <div class="p-3 bg-slate-900 rounded-xl border border-slate-800 text-xs">
        <div class="flex items-center space-x-2 text-amber-500 font-medium mb-1">
          <Icon name="lucide:shield-alert" class="w-4 h-4" />
          <span>{{ role === 'Admin' ? 'System Status' : 'Need assistance?' }}</span>
        </div>
        <p class="text-slate-400 text-[11px] mb-2">
          {{ role === 'Admin' ? 'All security nodes operational.' : 'Our support team is here to help.' }}
        </p>
        <component 
          :is="role === 'Admin' ? 'NuxtLink' : 'button'" 
          :to="role === 'Admin' ? '/admin/logs' : undefined"
          class="text-white font-semibold hover:underline"
        >
          {{ role === 'Admin' ? 'View system logs' : 'Contact support' }}
        </component>
      </div>

      <button @click="logout" class="w-full flex items-center space-x-3 px-3 py-2 rounded-xl text-red-400 hover:bg-red-500/10 text-sm transition">
        <Icon name="lucide:log-out" class="w-5 h-5" />
        <span>Log out</span>
      </button>
    </div>
  </aside>

  <!-- Mobil Arka Plan Karartması (Overlay) -->
  <div 
    v-if="isOpen" 
    @click="$emit('close')" 
    class="fixed inset-0 bg-black/50 z-20 lg:hidden"
  ></div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  role: {
    type: String,
    required: true // 'Admin', 'Hotel Owner', 'Customer'
  },
  user: {
    type: Object, //kullanıcı bas harfleri
    required: true
  },
  isOpen: {
    type: Boolean,
    default: false
  }
})

defineEmits(['close'])

const route = useRoute()

const roleDisplay = computed(() => {
  if (props.role === 'Hotel Owner') return 'Hotel Owner'
  if (props.role === 'Customer') return 'Customer'
  return 'Admin'
})

// Aktif link kontrolü için yardımcı fonksiyonlar
const isActive = (path, startsWith = false) => {
  return startsWith ? route.path.startsWith(path) : route.path === path
}

const linkClass = (path, startsWith = false) => {
  return [
    'flex items-center space-x-3 px-3 py-2.5 rounded-xl font-medium text-sm transition',
    isActive(path, startsWith) ? 'bg-slate-800 text-white' : 'hover:bg-slate-800/50 text-slate-400 hover:text-white'
  ]
}

// Aktif menü ikonunun renk sınıflarını dinamik oluşturan fonksiyon
const iconClass = (path, startsWith = false) => {
  return [
    'w-5 h-5',
    isActive(path, startsWith) ? 'text-amber-500' : ''
  ]
}

const logout = () => { //cikis 
  localStorage.clear()
  navigateTo('/login')
}
</script>