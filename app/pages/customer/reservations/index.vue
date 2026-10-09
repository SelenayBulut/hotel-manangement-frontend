<script setup>
definePageMeta({
  layout: 'customer'
})

import { ref, onMounted } from 'vue'
const config = useRuntimeConfig()

const loading = ref(true)
const reservations = ref([])

const getAuthToken = () => {
  return localStorage.getItem('token') || localStorage.getItem('jwt') || localStorage.getItem('accessToken') || ''
}

const formatDate = (dateString) => {
  if (!dateString) return '-'
  const date = new Date(dateString)
  return isNaN(date.getTime()) ? '-' : date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

const fetchReservations = async () => {
  try {
    loading.value = true
    const token = getAuthToken()
    
    // Kullanıcının kendi rezervasyonlarını çeken endpoint (Projeye göre /api/Reservations veya kullanıcının ID'sine özel bir endpoint olabilir)
    const response = await $fetch(`${config.public.apiBase}/api/Reservations`, {
      headers: { Authorization: `Bearer ${token}` }
    })

    reservations.value = response || []
  } catch (error) {
    console.error('Rezervasyonlar yüklenirken hata:', error)
    reservations.value = []
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchReservations()
})
</script>

<template>
  <div class="max-w-7xl mx-auto pb-12">
    
    <div class="mb-8 flex items-center justify-between">
      <div>
        <span class="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">My Stays</span>
        <h1 class="text-2xl font-bold text-slate-900">Reservations</h1>
        <p class="text-sm text-slate-500 mt-0.5">View and manage your hotel bookings.</p>
      </div>
    </div>

    <div v-if="loading" class="text-center py-24 text-slate-400 text-sm">
      Loading your reservations...
    </div>

    <div v-else-if="reservations.length === 0" class="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-sm">
      <div class="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center mx-auto mb-4 text-slate-400">
        <Icon name="lucide:calendar-off" class="w-6 h-6" />
      </div>
      <h3 class="font-bold text-slate-900 text-base mb-1">No reservations found</h3>
      <p class="text-xs text-slate-500 mb-6">You haven't made any bookings yet.</p>
      <NuxtLink to="/hotels" class="inline-block bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-xl text-xs font-semibold transition">
        Explore Hotels
      </NuxtLink>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div 
        v-for="res in reservations" 
        :key="res.id || res.Id"
        class="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:border-slate-300 transition flex flex-col justify-between"
      >
        <div>
          <div class="flex items-center justify-between mb-4">
            <span class="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 font-mono">
              RES-{{ (res.id || res.Id).slice(0, 4).toUpperCase() }}
            </span>
            <span class="text-xs font-medium text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full flex items-center space-x-1">
              <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1"></span>
              {{ res.status || res.Status || 'Confirmed' }}
            </span>
          </div>

          <h3 class="font-bold text-slate-900 text-lg mb-1">{{ res.hotelName || res.HotelName }}</h3>
          <p class="text-xs text-slate-500 mb-4">Room {{ res.roomNumber || res.RoomNumber }} · {{ res.guestCount || res.GuestCount }} Guests</p>

          <div class="bg-slate-50 rounded-xl p-3 text-xs text-slate-600 space-y-1 mb-6 border border-slate-100">
            <div class="flex justify-between">
              <span class="text-slate-400">Check-in:</span>
              <span class="font-medium text-slate-800">{{ formatDate(res.checkInDate || res.CheckInDate) }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-400">Check-out:</span>
              <span class="font-medium text-slate-800">{{ formatDate(res.checkOutDate || res.CheckOutDate) }}</span>
            </div>
          </div>
        </div>

        <div class="flex items-center justify-between pt-4 border-t border-slate-100">
          <div>
            <span class="text-[10px] text-slate-400 block">Total Price</span>
            <span class="font-bold text-slate-900 text-base">₺{{ res.totalPrice || res.TotalPrice }}</span>
          </div>
          <NuxtLink 
            :to="`/customer/reservations/${res.id || res.Id}`"
            class="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-xl text-xs font-semibold transition flex items-center space-x-1"
          >
            <span>Details</span>
            <Icon name="lucide:chevron-right" class="w-3.5 h-3.5" />
          </NuxtLink>
        </div>
      </div>
    </div>

  </div>
</template>