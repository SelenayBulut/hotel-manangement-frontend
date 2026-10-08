<script setup>
definePageMeta({
  layout: 'hotelowner'
})

import { ref, computed, onMounted, watch } from 'vue'
const config = useRuntimeConfig()

const loading = ref(true)
const hotelsList = ref([])
const reservationsList = ref([])
const selectedHotelId = ref('')

// Durum Filtresi
const selectedStatus = ref('All statuses')

// Bildirim Mesajı State'i
const feedbackMessage = ref({ text: '', type: '' })

const showFeedback = (text, type = 'success') => {
  feedbackMessage.value = { text, type }
  setTimeout(() => {
    feedbackMessage.value.text = ''
  }, 4000)
}

const getAuthToken = () => {
  return localStorage.getItem('token') || localStorage.getItem('jwt') || localStorage.getItem('accessToken') || ''
}

// 1. Önce otel sahibinin otellerini çekelim
const fetchMyHotels = async () => {
  try {
    const token = getAuthToken()
    const response = await $fetch(`${config.public.apiBase}/api/Hotels/my-hotels`, {
      headers: { Authorization: `Bearer ${token}` }
    })

    if (response && response.length > 0) {
      hotelsList.value = response
      selectedHotelId.value = response[0].id || response[0].Id
      fetchReservationsForHotel(selectedHotelId.value)
    } else {
      loading.value = false
    }
  } catch (error) {
    console.error('Oteller yüklenirken hata:', error)
    showFeedback('Failed to load hotels.', 'error')
    loading.value = false
  }
}

// 2. Seçilen otelin rezervasyonlarını çekelim (/api/Reservations/hotel/{hotelId})[cite: 6]
const fetchReservationsForHotel = async (hotelId) => {
  if (!hotelId) return

  try {
    loading.value = true
    const token = getAuthToken()
    const response = await $fetch(`${config.public.apiBase}/api/Reservations/hotel/${hotelId}`, {
      headers: { Authorization: `Bearer ${token}` }
    })

    if (response) {
      reservationsList.value = response.map(res => ({
        id: res.id || res.Id,
        username: res.username || res.Username || 'Guest',
        roomNumber: res.roomNumber || res.RoomNumber || 'N/A',
        hotelName: res.hotelName || res.HotelName || '',
        checkInDate: res.checkInDate || res.CheckInDate || '',
        checkOutDate: res.checkOutDate || res.CheckOutDate || '',
        guestCount: res.guestCount || res.GuestCount || 1,
        totalPrice: res.totalPrice || res.TotalPrice || 0,
        status: res.status || res.Status || 'Confirmed',
        createdAt: res.createdAt || res.CreatedAt || ''
      }))
    } else {
      reservationsList.value = []
    }
  } catch (error) {
    console.error('Rezervasyonlar yüklenirken hata:', error)
    reservationsList.value = []
    showFeedback('Failed to load reservations for this hotel.', 'error')
  } finally {
    loading.value = false
  }
}

// Otel değiştiğinde rezervasyonları yeniden yükle
watch(selectedHotelId, (newId) => {
  if (newId) {
    fetchReservationsForHotel(newId)
  }
})

// Sadece durum filtresi kaldı
const filteredReservations = computed(() => {
  return reservationsList.value.filter(res => {
    return selectedStatus.value === 'All statuses' || res.status.toLowerCase() === selectedStatus.value.toLowerCase()
  })
})

onMounted(() => {
  fetchMyHotels()
})
</script>

<template>
  <div class="max-w-7xl mx-auto pb-12">
    
    <!-- Başlık Alanı -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
      <div>
        <h1 class="text-2xl font-bold text-slate-900">Hotel reservations</h1>
        <p class="text-sm text-slate-500 mt-1">View and track bookings across your properties.</p>
      </div>

      <!-- Otel Seçim Dropdown'ı -->
      <div class="w-72">
        <select 
          v-model="selectedHotelId" 
          class="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-800 shadow-sm outline-none focus:border-slate-400 transition"
        >
          <option v-for="hotel in hotelsList" :key="hotel.id || hotel.Id" :value="hotel.id || hotel.Id">
            {{ hotel.name || hotel.Name }}
          </option>
        </select>
      </div>
    </div>

    <!-- Şık Bildirim Kutusu -->
    <div v-if="feedbackMessage.text" class="mb-6 p-4 rounded-xl text-sm font-medium flex items-center space-x-2" :class="feedbackMessage.type === 'error' ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'">
      <Icon :name="feedbackMessage.type === 'error' ? 'lucide:alert-circle' : 'lucide:check-circle'" class="w-5 h-5" />
      <span>{{ feedbackMessage.text }}</span>
    </div>

    <!-- Sadece Durum Filtresi -->
    <div class="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm mb-6 flex items-center justify-between">
      <span class="text-sm font-medium text-slate-600">Filter by reservation status:</span>
      <div class="w-44">
        <select v-model="selectedStatus" class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 outline-none focus:bg-white focus:border-slate-300 transition">
          <option>All statuses</option>
          <option value="Confirmed">Confirmed</option>
          <option value="Cancelled">Cancelled</option>
          <option value="Completed">Completed</option>
        </select>
      </div>
    </div>

    <!-- Yükleniyor Durumu -->
    <div v-if="loading" class="text-center py-24 text-slate-400 text-sm">
      Loading reservations...
    </div>

    <!-- Rezervasyon Tablosu -->
    <div v-else class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      
      <div v-if="filteredReservations.length === 0" class="text-center py-16 text-slate-400 text-sm">
        No reservations found for this hotel.
      </div>

      <table v-else class="w-full text-left border-collapse">
        <thead>
          <tr class="border-b border-slate-100 text-[11px] font-semibold text-slate-400 uppercase tracking-wider bg-slate-50/50">
            <th class="py-4 px-6">Customer</th>
            <th class="py-4 px-6">Room</th>
            <th class="py-4 px-6">Check-in</th>
            <th class="py-4 px-6">Check-out</th>
            <th class="py-4 px-6">Guests</th>
            <th class="py-4 px-6">Total Price</th>
            <th class="py-4 px-6 text-right">Status</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100 text-sm text-slate-700">
          <tr v-for="res in filteredReservations" :key="res.id" class="hover:bg-slate-50/50 transition">
            
            <td class="py-4 px-6 font-semibold text-slate-900">
              {{ res.username }}
            </td>

            <td class="py-4 px-6 text-slate-600 font-medium">
              Room #{{ res.roomNumber }}
            </td>

            <td class="py-4 px-6 text-slate-600">
              {{ new Date(res.checkInDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) }}
            </td>

            <td class="py-4 px-6 text-slate-600">
              {{ new Date(res.checkOutDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) }}
            </td>

            <td class="py-4 px-6 text-slate-600">
              {{ res.guestCount }} guests
            </td>

            <td class="py-4 px-6 font-bold text-slate-900">
              ₺{{ res.totalPrice }}
            </td>

            <td class="py-4 px-6 text-right">
              <span 
                class="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-medium"
                :class="res.status.toLowerCase() === 'confirmed' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'"
              >
                <span class="w-1.5 h-1.5 rounded-full" :class="res.status.toLowerCase() === 'confirmed' ? 'bg-emerald-500' : 'bg-rose-500'"></span>
                <span>{{ res.status }}</span>
              </span>
            </td>

          </tr>
        </tbody>
      </table>

    </div>

  </div>
</template>