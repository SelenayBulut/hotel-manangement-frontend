<script setup>
definePageMeta({
  layout: 'customer'
})

import { ref, computed, onMounted } from 'vue'

const config = useRuntimeConfig()
const loading = ref(true)
const reservations = ref([])

const activeTab = ref('all') // 'all', 'upcoming', 'completed', 'cancelled'
const searchQuery = ref('')
const selectedStatus = ref('')

// Verileri backend'den çeken ve UI ile eşleyen fonksiyon
const fetchReservations = async () => {
  try {
    loading.value = true
    
    const userId = localStorage.getItem('userId') || '808d656f-cc9f-4213-846e-a3245c5fd17b'
    const token = localStorage.getItem('token') || ''

    const response = await $fetch(`${config.public.apiBase}/api/Reservations/user/${userId}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    
    if (response && Array.isArray(response)) {
      reservations.value = response.map(res => {
        const isDel = res.isDeleted ?? res.IsDeleted ?? false
        let stat = res.status || res.Status || 'Confirmed'

        // Eğer isDeleted true ise veya statü iptal edilmişse Cancelled yapalım
        if (isDel || stat.toLowerCase() === 'cancelled' || stat.toLowerCase() === 'deleted') {
          stat = 'Cancelled'
        }

        // Modelde ödeme alanı olmadığı için statüye göre ödeme durumunu türetiyoruz
        let payment = 'Paid'
        if (stat === 'Cancelled') {
          payment = 'Refunded'
        }

        // ID'yi görseldeki gibi RES-XXXX formatına dönüştürüyoruz
        const rawId = res.id || res.Id || '0000'
        const shortId = 'RES-' + rawId.slice(0, 4).toUpperCase()

        // Oluşturulma tarihini "Booked Mar 12" formatına benzetiyoruz
        const createdDate = new Date(res.createdAt || res.CreatedAt || Date.now())
        const bookedFormatted = 'Booked ' + createdDate.toLocaleDateString('en-US', { month: 'short', day: '2-digit' })

        // Check-in / Check-out tarih formatı (Örn: Jun 18, 2026)
        const checkInFormatted = new Date(res.checkInDate || res.CheckInDate).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })
        const checkOutFormatted = new Date(res.checkOutDate || res.CheckOutDate).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })

        return {
          ...res,
          displayId: shortId,
          bookedDateText: bookedFormatted,
          checkInText: checkInFormatted,
          checkOutText: checkOutFormatted,
          status: stat,
          paymentStatus: payment,
          isDeleted: isDel
        }
      })
    } else {
      reservations.value = []
    }
  } catch (error) {
    console.error('Rezervasyonlar yüklenirken hata oluştu:', error)
    reservations.value = []
  } finally {
    loading.value = false
  }
}

// Sekmelere göre sayaçlar
const counts = computed(() => {
  return {
    all: reservations.value.length,
    upcoming: reservations.value.filter(r => r.status === 'Confirmed' || r.status === 'Upcoming').length,
    completed: reservations.value.filter(r => r.status === 'Completed').length,
    cancelled: reservations.value.filter(r => r.status === 'Cancelled').length
  }
})

// Filtreleme mantığı
const filteredReservations = computed(() => {
  return reservations.value.filter(res => {
    let matchesTab = true
    const status = (res.status || '').toLowerCase()
    
    if (activeTab.value === 'upcoming') {
      matchesTab = status === 'confirmed' || status === 'upcoming'
    } else if (activeTab.value === 'completed') {
      matchesTab = status === 'completed'
    } else if (activeTab.value === 'cancelled') {
      matchesTab = status === 'cancelled'
    }

    const query = searchQuery.value.toLowerCase()
    const hotelName = (res.hotelName || res.HotelName || '').toLowerCase()
    const roomNumber = (res.roomNumber || res.RoomNumber || '').toString().toLowerCase()
    const displayId = res.displayId.toLowerCase()

    const matchesSearch = !query || 
      displayId.includes(query) ||
      hotelName.includes(query) ||
      roomNumber.includes(query)

    const matchesStatus = !selectedStatus.value || status === selectedStatus.value.toLowerCase()

    return matchesTab && matchesSearch && matchesStatus
  })
})

onMounted(() => {
  fetchReservations()
})
</script>

<template>
  <div class="max-w-7xl mx-auto">
    
    <!-- Sayfa Başlığı ve Yeni Rezervasyon Butonu -->
    <div class="flex items-end justify-between mb-6">
      <div>
        <h1 class="text-3xl font-bold text-slate-900">My reservations</h1>
        <p class="text-sm text-slate-500 mt-1">View and manage your upcoming and past stays.</p>
      </div>
      <NuxtLink to="/customer/hotels" class="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2.5 rounded-xl font-medium text-sm shadow-sm flex items-center space-x-2 transition">
        <Icon name="lucide:plus" class="w-4 h-4" />
        <span>New reservation</span>
      </NuxtLink>
    </div>

    <!-- Kategori Sekmeleri (Tabs) -->
    <div class="flex items-center space-x-6 border-b border-slate-200 mb-6 text-sm">
      <button 
        @click="activeTab = 'all'" 
        class="pb-3 font-semibold transition relative flex items-center space-x-2"
        :class="activeTab === 'all' ? 'text-slate-900 border-b-2 border-slate-900 -mb-[2px]' : 'text-slate-500 hover:text-slate-900'"
      >
        <span>All reservations</span>
        <span class="text-xs px-2 py-0.5 rounded-full" :class="activeTab === 'all' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600'">{{ counts.all }}</span>
      </button>

      <button 
        @click="activeTab = 'upcoming'" 
        class="pb-3 font-semibold transition relative flex items-center space-x-2"
        :class="activeTab === 'upcoming' ? 'text-slate-900 border-b-2 border-slate-900 -mb-[2px]' : 'text-slate-500 hover:text-slate-900'"
      >
        <span>Upcoming</span>
        <span class="text-xs px-2 py-0.5 rounded-full" :class="activeTab === 'upcoming' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600'">{{ counts.upcoming }}</span>
      </button>

      <button 
        @click="activeTab = 'completed'" 
        class="pb-3 font-semibold transition relative flex items-center space-x-2"
        :class="activeTab === 'completed' ? 'text-slate-900 border-b-2 border-slate-900 -mb-[2px]' : 'text-slate-500 hover:text-slate-900'"
      >
        <span>Completed</span>
        <span class="text-xs px-2 py-0.5 rounded-full" :class="activeTab === 'completed' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600'">{{ counts.completed }}</span>
      </button>

      <button 
        @click="activeTab = 'cancelled'" 
        class="pb-3 font-semibold transition relative flex items-center space-x-2"
        :class="activeTab === 'cancelled' ? 'text-slate-900 border-b-2 border-slate-900 -mb-[2px]' : 'text-slate-500 hover:text-slate-900'"
      >
        <span>Cancelled</span>
        <span class="text-xs px-2 py-0.5 rounded-full" :class="activeTab === 'cancelled' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600'">{{ counts.cancelled }}</span>
      </button>
    </div>

    <!-- Arama ve Filtreleme Barı -->
    <div class="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm mb-6 grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
      
      <!-- Arama Çubuğu -->
      <div class="md:col-span-2 relative">
        <Icon name="lucide:search" class="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
        <input 
          v-model="searchQuery"
          type="text" 
          placeholder="Search reservations..." 
          class="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-amber-500 text-slate-800"
        />
      </div>

      <!-- Durum Filtresi (Status Dropdown) -->
      <div>
        <select 
          v-model="selectedStatus"
          class="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:border-amber-500"
        >
          <option value="">All statuses</option>
          <option value="Confirmed">Confirmed</option>
          <option value="Completed">Completed</option>
          <option value="Cancelled">Cancelled</option>
        </select>
      </div>
    </div>

    <!-- Yükleniyor Durumu -->
    <div v-if="loading" class="text-center py-20 text-slate-400 text-sm">
      Rezervasyonlar yükleniyor...
    </div>

    <!-- Tablo Alanı -->
    <div v-else class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="border-b border-slate-200 text-[11px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50/50">
              <th class="py-3.5 px-6">Reservation</th>
              <th class="py-3.5 px-6">Hotel & Room</th>
              <th class="py-3.5 px-6">Stay</th>
              <th class="py-3.5 px-6">Guests</th>
              <th class="py-3.5 px-6">Total</th>
              <th class="py-3.5 px-6">Status</th>
              <th class="py-3.5 px-6">Payment</th>
              <th class="py-3.5 px-6 text-right">Action</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 text-sm">
            
            <tr v-for="res in filteredReservations" :key="res.id || res.Id" class="hover:bg-slate-50/50 transition">
              
              <!-- Reservation ID & Booked Date -->
              <td class="py-4 px-6">
                <span class="font-bold text-slate-900 block">{{ res.displayId }}</span>
                <span class="text-xs text-slate-400">{{ res.bookedDateText }}</span>
              </td>

              <!-- Hotel & Room -->
              <td class="py-4 px-6">
                <span class="font-semibold text-slate-900 block">{{ res.hotelName || res.HotelName }}</span>
                <span class="text-xs text-slate-500">Room · {{ res.roomNumber || res.RoomNumber }}</span>
              </td>

              <!-- Stay Dates -->
              <td class="py-4 px-6">
                <span class="font-medium text-slate-800 block text-xs">{{ res.checkInText }}</span>
                <span class="text-xs text-slate-400">to {{ res.checkOutText }}</span>
              </td>

              <!-- Guests -->
              <td class="py-4 px-6 text-slate-600 text-xs">
                {{ res.guestCount || res.GuestCount }} adults
              </td>

              <!-- Total Price -->
              <td class="py-4 px-6 font-bold text-slate-900">
                ₺{{ res.totalPrice || res.TotalPrice }}
              </td>

              <!-- Status Badge -->
              <td class="py-4 px-6">
                <span 
                  class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold"
                  :class="{
                    'bg-emerald-50 text-emerald-700 border border-emerald-200': res.status === 'Confirmed',
                    'bg-slate-100 text-slate-700 border border-slate-200': res.status === 'Completed',
                    'bg-rose-50 text-rose-700 border border-rose-200': res.status === 'Cancelled'
                  }"
                >
                  <span class="w-1.5 h-1.5 rounded-full mr-1.5" :class="{
                    'bg-emerald-500': res.status === 'Confirmed',
                    'bg-slate-500': res.status === 'Completed',
                    'bg-rose-500': res.status === 'Cancelled'
                  }"></span>
                  {{ res.status }}
                </span>
              </td>

              <!-- Payment Status Badge -->
              <td class="py-4 px-6">
                <span 
                  class="inline-flex items-center text-xs font-medium"
                  :class="{
                    'text-emerald-700': res.paymentStatus === 'Paid',
                    'text-amber-700': res.paymentStatus === 'Refunded'
                  }"
                >
                  <span class="w-1.5 h-1.5 rounded-full mr-1.5" :class="{
                    'bg-emerald-500': res.paymentStatus === 'Paid',
                    'bg-amber-500': res.paymentStatus === 'Refunded'
                  }"></span>
                  {{ res.paymentStatus }}
                </span>
              </td>

              <!-- Action (View) -->
              <td class="py-4 px-6 text-right">
                    <NuxtLink :to="`/customer/reservations/${res.id || res.Id}`" class="text-xs font-semibold text-slate-900 hover:text-amber-600 transition">
                        View
                      </NuxtLink>
              </td>

            </tr>

            <!-- Eğer Filtreye Uygun Sonuç Yoksa -->
            <tr v-if="filteredReservations.length === 0">
              <td colspan="8" class="text-center py-12 text-slate-400 text-sm">
                Aramanıza uygun rezervasyon bulunamadı.
              </td>
            </tr>

          </tbody>
        </table>
      </div>
    </div>

  </div>
</template>