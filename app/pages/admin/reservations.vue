<script setup>
definePageMeta({
  layout: 'admin'
})

import { ref, computed, onMounted } from 'vue'
const config = useRuntimeConfig()

const loading = ref(true)
const reservationsList = ref([])
const hotelsList = ref([])

// Filtreleme State'leri
const searchQuery = ref('')
const selectedStatus = ref('All statuses')
const selectedHotelFilter = ref('All hotels')

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

// Rezervasyonları ve Otelleri Çekme
const fetchData = async () => {
  try {
    loading.value = true
    const token = getAuthToken()
    const headers = { Authorization: `Bearer ${token}` }

    const [reservationsRes, hotelsRes] = await Promise.all([
      $fetch(`${config.public.apiBase}/api/Reservations`, { headers }).catch(() => []),
      $fetch(`${config.public.apiBase}/api/Hotels`, { headers }).catch(() => [])
    ])

    hotelsList.value = hotelsRes || []
    
    const hotelMap = {}
    hotelsList.value.forEach(h => {
      hotelMap[h.id || h.Id] = h.name || h.Name || 'Unknown Hotel'
    })

    reservationsList.value = (reservationsRes || []).map(r => {
      const hId = r.hotelId || r.HotelId || ''
      return {
        id: r.id || r.Id,
        username: r.username || r.Username || 'Guest',
        roomNumber: r.roomNumber || r.RoomNumber || 'N/A',
        hotelId: hId,
        hotelName: r.hotelName || r.HotelName || hotelMap[hId] || 'Unknown Hotel',
        checkInDate: r.checkInDate || r.CheckInDate || '',
        checkOutDate: r.checkOutDate || r.CheckOutDate || '',
        guestCount: r.guestCount || r.GuestCount || 1,
        totalPrice: r.totalPrice || r.TotalPrice || 0,
        status: r.status || r.Status || 'Confirmed',
        createdAt: r.createdAt || r.CreatedAt || ''
      }
    })

  } catch (error) {
    console.error('Rezervasyonlar yüklenirken hata:', error)
    showFeedback('Failed to load reservations.', 'error')
  } finally {
    loading.value = false
  }
}

// Filtreleme Mantığı
const filteredReservations = computed(() => {
  return reservationsList.value.filter(res => {
    const matchesSearch = 
      res.username.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      res.hotelName.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      res.roomNumber.toString().toLowerCase().includes(searchQuery.value.toLowerCase())

    const matchesStatus = selectedStatus.value === 'All statuses' || res.status.toLowerCase() === selectedStatus.value.toLowerCase()
    const matchesHotel = selectedHotelFilter.value === 'All hotels' || res.hotelId === selectedHotelFilter.value

    return matchesSearch && matchesStatus && matchesHotel
  })
})

onMounted(() => {
  fetchData()
})
</script>

<template>
  <div class="max-w-7xl mx-auto pb-12">
    
    <!-- Başlık Alanı -->
    <div class="mb-8">
      <h1 class="text-2xl font-bold text-slate-900">Reservation management</h1>
      <p class="text-sm text-slate-500 mt-1">Monitor, track, and filter all bookings across the platform.</p>
    </div>

    <!-- Bildirim Kutusu -->
    <div v-if="feedbackMessage.text" class="mb-6 p-4 rounded-xl text-sm font-medium flex items-center space-x-2" :class="feedbackMessage.type === 'error' ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'">
      <Icon :name="feedbackMessage.type === 'error' ? 'lucide:alert-circle' : 'lucide:check-circle'" class="w-5 h-5" />
      <span>{{ feedbackMessage.text }}</span>
    </div>

    <!-- Filtreleme Çubuğu -->
    <div class="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm mb-6 flex flex-wrap items-center gap-4">
      
      <div class="relative flex-1 min-w-[240px]">
        <Icon name="lucide:search" class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input 
          v-model="searchQuery"
          type="text" 
          placeholder="Search by customer, hotel or room number" 
          class="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:bg-white focus:border-slate-300 focus:outline-none transition"
        />
      </div>

      <div class="w-52">
        <select v-model="selectedHotelFilter" class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 outline-none focus:bg-white focus:border-slate-300 transition">
          <option value="All hotels">All hotels</option>
          <option v-for="hotel in hotelsList" :key="hotel.id || hotel.Id" :value="hotel.id || hotel.Id">
            {{ hotel.name || hotel.Name }}
          </option>
        </select>
      </div>

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
        No reservations found matching your criteria.
      </div>

      <table v-else class="w-full text-left border-collapse">
        <thead>
          <tr class="border-b border-slate-100 text-[11px] font-semibold text-slate-400 uppercase tracking-wider bg-slate-50/50">
            <th class="py-4 px-6">Customer</th>
            <th class="py-4 px-6">Hotel / Room</th>
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

            <td class="py-4 px-6">
              <span class="font-medium text-slate-900 block">{{ res.hotelName }}</span>
              <span class="text-xs text-slate-500">Room #{{ res.roomNumber }}</span>
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
              ₺{{ res.totalPrice.toLocaleString() }}
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