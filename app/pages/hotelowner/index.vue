<script setup>
definePageMeta({
  layout: 'hotelowner'
})

import { ref, onMounted, computed } from 'vue'
const config = useRuntimeConfig()

const loading = ref(true)
const myHotels = ref([])
const dashboardStats = ref({
  totalHotels: 0,
  totalRooms: 0,
  activeReservations: 0,
  totalRevenue: 0
})

const allReservations = ref([])

const getAuthToken = () => {
  return localStorage.getItem('token') || localStorage.getItem('jwt') || localStorage.getItem('accessToken') || ''
}

const fetchOwnerDashboardData = async () => {
  try {
    loading.value = true
    const token = getAuthToken()

    const hotelsResponse = await $fetch(`${config.public.apiBase}/api/Hotels/my-hotels`, {
      headers: { Authorization: `Bearer ${token}` }
    })

    if (hotelsResponse) {
      myHotels.value = hotelsResponse
      dashboardStats.value.totalHotels = hotelsResponse.length

      let roomCount = 0
      let totalReservationsCount = 0
      let calculatedRevenue = 0
      let tempReservations = []

      for (const hotel of hotelsResponse) {
        const hotelId = hotel.id || hotel.Id
        const rooms = hotel.rooms || hotel.Rooms || []
        roomCount += rooms.length

        try {
          const reservations = await $fetch(`${config.public.apiBase}/api/Reservations/hotel/${hotelId}`, {
            headers: { Authorization: `Bearer ${token}` }
          })

          if (reservations && Array.isArray(reservations)) {
            totalReservationsCount += reservations.length
            reservations.forEach(res => {
              calculatedRevenue += (res.totalPrice || res.TotalPrice || 0)
              tempReservations.push(res)
            })
          }
        } catch (err) {
          console.error(`Otel rezervasyonları alınamadı (HotelId: ${hotelId}):`, err)
        }
      }

      dashboardStats.value.totalRooms = roomCount
      dashboardStats.value.activeReservations = totalReservationsCount
      dashboardStats.value.totalRevenue = calculatedRevenue
      allReservations.value = tempReservations
    }

  } catch (error) {
    console.error('Error loading hotel owner dashboard data:', error)
  } finally {
    loading.value = false
  }
}

// Son 7 günü baz alarak günlük gelir hesaplayan dinamik grafik yapısı
const dailyRevenueData = computed(() => {
  const daysMap = {}
  const today = new Date()

  const resultDays = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(today.getDate() - i)
    const dateKey = d.toISOString().split('T')[0]
    
    const label = d.toLocaleDateString('tr-TR', { weekday: 'short' })
    daysMap[dateKey] = { label, amount: 0 }
    resultDays.push(dateKey)
  }

  allReservations.value.forEach(res => {
    const dateStr = res.createdAt || res.CreatedAt || res.checkInDate || res.CheckInDate
    if (dateStr) {
      const dateKey = dateStr.split('T')[0]
      if (daysMap[dateKey]) {
        daysMap[dateKey].amount += (res.totalPrice || res.TotalPrice || 0)
      }
    }
  })

  const amounts = resultDays.map(key => daysMap[key].amount)
  const maxVal = Math.max(...amounts, 1000)

  return resultDays.map(key => {
    const item = daysMap[key]
    const heightPercent = Math.round((item.amount / maxVal) * 100)
    return {
      label: item.label,
      height: `${Math.max(heightPercent, 15)}%`,
      amount: `₺${item.amount.toLocaleString()}`
    }
  })
})

onMounted(() => {
  fetchOwnerDashboardData()
})
</script>

<template>
  <div class="max-w-7xl mx-auto pb-12">
    
    <!-- Üst Karşılama ve Buton Alanı -->
    <div class="flex items-center justify-between mb-8">
      <div>
        <h1 class="text-2xl font-bold text-slate-900">Hotel Owner Dashboard</h1>
        <p class="text-sm text-slate-500 mt-1">Here's how your portfolio is performing today.</p>
      </div>
      <NuxtLink to="/hotelowner/hotels/create" class="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2.5 rounded-xl text-sm font-medium flex items-center space-x-2 transition shadow-sm">
        <Icon name="lucide:plus" class="w-4 h-4" />
        <span>Add hotel</span>
      </NuxtLink>
    </div>

    <!-- Yükleniyor Durumu -->
    <div v-if="loading" class="text-center py-24 text-slate-400 text-sm">
      Loading dashboard overview...
    </div>

    <template v-else>
      
      <!-- 4'lü İstatistik Kartları -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        
        <!-- Total Hotels -->
        <div class="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <div class="flex items-center justify-between mb-3">
            <span class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total hotels</span>
            <div class="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-700">
              <Icon name="lucide:building-2" class="w-5 h-5" />
            </div>
          </div>
          <div class="text-2xl font-bold text-slate-900 mb-1">{{ dashboardStats.totalHotels }}</div>
          <span class="text-xs text-emerald-600 font-medium">Active properties</span>
        </div>

        <!-- Total Rooms -->
        <div class="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <div class="flex items-center justify-between mb-3">
            <span class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total rooms</span>
            <div class="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-700">
              <Icon name="lucide:bed" class="w-5 h-5" />
            </div>
          </div>
          <div class="text-2xl font-bold text-slate-900 mb-1">{{ dashboardStats.totalRooms }}</div>
          <span class="text-xs text-slate-500 font-medium">Across all hotels</span>
        </div>

        <!-- Active Reservations -->
        <div class="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <div class="flex items-center justify-between mb-3">
            <span class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active reservations</span>
            <div class="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-700">
              <Icon name="lucide:calendar-check" class="w-5 h-5" />
            </div>
          </div>
          <div class="text-2xl font-bold text-slate-900 mb-1">{{ dashboardStats.activeReservations }}</div>
          <span class="text-xs text-emerald-600 font-medium">Live data</span>
        </div>

        <!-- Total Revenue -->
        <div class="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <div class="flex items-center justify-between mb-3">
            <span class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total revenue</span>
            <div class="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-700">
              <Icon name="lucide:badge-dollar-sign" class="w-5 h-5" />
            </div>
          </div>
          <div class="text-2xl font-bold text-slate-900 mb-1">₺{{ dashboardStats.totalRevenue.toLocaleString() }}</div>
          <span class="text-xs text-emerald-600 font-medium">Total earnings</span>
        </div>

      </div>

      <!-- Günlük Gelir Grafiği (Görseldeki Tarzda Degrade Çubuklar ve Yatay Kılavuz Çizgileri) -->
      <div class="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm mb-8">
        <div class="flex items-center justify-between mb-2">
          <h3 class="font-bold text-slate-900 text-base">Daily revenue overview</h3>
          <span class="text-xs text-slate-400">Last 7 days performance</span>
        </div>
        <p class="text-xs text-slate-400 mb-6">Gross revenue across all properties by day</p>

        <div class="flex items-baseline space-x-3 mb-6">
          <span class="text-3xl font-extrabold text-slate-900">₺{{ dashboardStats.totalRevenue.toLocaleString() }}</span>
        </div>

        <!-- Grafik Konteyneri (Arkada Yatay Kılavuz Çizgileri ile) -->
        <div class="relative h-48 pt-4 border-t border-slate-100 flex items-end justify-between gap-4">
          
          <!-- Arka Plan Yatay Çizgileri -->
          <div class="absolute inset-0 flex flex-col justify-between pointer-events-none pt-4 pb-8">
            <div class="w-full border-b border-slate-100"></div>
            <div class="w-full border-b border-slate-100"></div>
            <div class="w-full border-b border-slate-100"></div>
          </div>

          <!-- Çubuklar -->
          <div v-for="(item, index) in dailyRevenueData" :key="index" class="flex-1 flex flex-col items-center h-full justify-end group z-10">
            <div 
              class="w-full max-w-[55px] rounded-t-lg transition-all duration-300 relative bg-gradient-to-t from-slate-500/70 via-slate-600/80 to-slate-700 group-hover:from-slate-600 group-hover:to-slate-800 shadow-sm"
              :style="{ height: item.height }"
            >
              <!-- Tooltip -->
              <div class="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap pointer-events-none shadow-md">
                {{ item.amount }}
              </div>
            </div>
            <span class="text-xs font-medium text-slate-500 mt-3">{{ item.label }}</span>
          </div>
        </div>
      </div>

      <!-- Your Properties Listesi -->
      <div class="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <div class="flex items-center justify-between mb-6">
          <div>
            <h3 class="font-bold text-slate-900 text-base">Your properties</h3>
            <p class="text-xs text-slate-500 mt-0.5">Live performance overview of your registered hotels.</p>
          </div>
        </div>

        <div v-if="myHotels.length === 0" class="text-center py-12 text-slate-400 text-sm">
          You haven't added any hotels yet. Click "Add hotel" to get started.
        </div>

        <div v-else class="divide-y divide-slate-100">
          <div v-for="hotel in myHotels" :key="hotel.id || hotel.Id" class="py-4 flex items-center justify-between">
            <div class="flex items-center space-x-4">
              <div class="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center font-bold text-slate-700 text-sm">
                {{ (hotel.name || hotel.Name || 'H').slice(0, 2).toUpperCase() }}
              </div>
              <div>
                <h4 class="font-bold text-slate-900 text-sm">{{ hotel.name || hotel.Name }}</h4>
                <p class="text-xs text-slate-500">{{ hotel.address || hotel.Address }} - {{ hotel.city || hotel.City }}</p>
              </div>
            </div>
            
            <div class="flex items-center space-x-8 text-sm">
              <div>
                <span class="block text-xs text-slate-400">Rooms</span>
                <span class="font-semibold text-slate-700">{{ (hotel.rooms || hotel.Rooms || []).length }}</span>
              </div>
              <div>
                <span class="block text-xs text-slate-400">Rating</span>
                <span class="font-semibold text-slate-700">⭐ {{ hotel.rating || hotel.Rating || 0 }}</span>
              </div>
              <span class="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700">
                Active
              </span>
            </div>
          </div>
        </div>
      </div>

    </template>

  </div>
</template>