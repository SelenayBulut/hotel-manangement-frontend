<script setup>
definePageMeta({
  layout: 'customer' // Müşteri paneli layout'u
})

import { ref, onMounted } from 'vue'
const route = useRoute()
const config = useRuntimeConfig()

const hotelId = route.params.id
const loading = ref(true)
const hotel = ref(null)
const rooms = ref([])

const getAuthToken = () => {
  return localStorage.getItem('token') || localStorage.getItem('jwt') || localStorage.getItem('accessToken') || ''
}

// Otel detaylarını ve odalarını çekme
const fetchHotelDetails = async () => {
  try {
    loading.value = true
    const token = getAuthToken()
    
    // Otel bilgisi ve otele ait odalar
    const hotelRes = await $fetch(`${config.public.apiBase}/api/HotelControllers/${hotelId}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    
    hotel.value = hotelRes || {
      name: 'Azure Bay Resort',
      description: 'A tranquil coastal resort shaped by Aegean light. Through daily designed rooms, warm local hospitality, and unforgettable sea views.',
      rating: '4.9',
      imageUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80'
    }

    // Odalar (Eğer ayrı endpoint yoksa otel objesinden veya rooms endpoint'inden alınabilir)
    rooms.value = hotelRes?.rooms || [
      { id: 1, name: 'Deluxe King', roomNumber: 'Room 304', capacity: '2 guests', price: 290, status: 'Available', image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=400&q=80' },
      { id: 2, name: 'Aegean Suite', roomNumber: 'Room 408', capacity: '3 guests', price: 420, status: 'Available', image: 'https://images.unsplash.com/photo-1591088398332-8a7791972843?auto=format&fit=crop&w=400&q=80' },
      { id: 3, name: 'Standard Queen', roomNumber: 'Room 216', capacity: '2 guests', price: 225, status: 'Available', image: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=400&q=80' }
    ]
  } catch (error) {
    console.error('Otel detayları yüklenemedi:', error)
    // Hata durumunda örnek tasarım verisi
    hotel.value = {
      name: 'Azure Bay Resort',
      description: 'A tranquil coastal resort shaped by Aegean light.',
      rating: '4.9',
    }
    rooms.value = [
      { id: 1, name: 'Deluxe King', roomNumber: 'Room 304', capacity: '2 guests', price: 290, status: 'Available' },
      { id: 2, name: 'Aegean Suite', roomNumber: 'Room 408', capacity: '3 guests', price: 420, status: 'Available' }
    ]
  } finally {
    loading.value = false
  }
}

// Oda rezerve et butonuna basıldığında rezervasyon sayfasına yönlendirme
const reserveRoom = (roomId) => {
  navigateTo(`/customer/reserve/${roomId}`)
}

onMounted(() => {
  fetchHotelDetails()
})
</script>

<template>
  <div class="max-w-7xl mx-auto pb-16">
    
    <!-- Geri Dön Butonu -->
    <div class="mb-6">
      <NuxtLink to="/customer/hotels" class="text-xs font-semibold text-slate-500 hover:text-slate-800 flex items-center space-x-1 w-fit">
        <Icon name="lucide:arrow-left" class="w-4 h-4" />
        <span>Back to hotels</span>
      </NuxtLink>
    </div>

    <!-- Yükleniyor -->
    <div v-if="loading" class="text-center py-24 text-slate-400 text-sm">
      Loading hotel details...
    </div>

    <div v-else class="space-y-8">
      
      <!-- Otel Görselleri Grid Alanı -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <!-- Büyük Ana Görsel -->
        <div class="lg:col-span-2 h-[320px] rounded-2xl overflow-hidden shadow-sm bg-slate-200">
          <img :src="hotel.imageUrl || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80'" alt="Hotel Banner" class="w-full h-full object-cover" />
        </div>
        <!-- Sağ Yan Görseller -->
        <div class="grid grid-rows-2 gap-4 h-[320px]">
          <div class="rounded-2xl overflow-hidden shadow-sm bg-slate-200 h-full">
            <img src="https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=600&q=80" alt="Hotel Detail" class="w-full h-full object-cover" />
          </div>
          <div class="rounded-2xl overflow-hidden shadow-sm bg-slate-200 h-full">
            <img src="https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=600&q=80" alt="Hotel Detail" class="w-full h-full object-cover" />
          </div>
        </div>
      </div>

      <!-- Otel Başlığı ve Puanı -->
      <div class="flex flex-wrap items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div class="flex items-center space-x-1.5 text-xs text-slate-500 mb-1">
            <Icon name="lucide:map-pin" class="w-3.5 h-3.5 text-amber-600" />
            <span>Aegean, Greece</span>
          </div>
          <h1 class="text-2xl font-bold text-slate-900">{{ hotel.name }}</h1>
          <p class="text-sm text-slate-500 mt-1 max-w-2xl">{{ hotel.description }}</p>
        </div>
        <div class="flex items-center space-x-2 bg-slate-50 px-4 py-3 rounded-2xl border border-slate-100">
          <span class="text-xl font-bold text-slate-900">{{ hotel.rating || '4.9' }}</span>
          <div class="text-xs">
            <span class="text-amber-500 font-semibold block">Exceptional</span>
            <span class="text-slate-400">384+ reviews</span>
          </div>
        </div>
      </div>

      <!-- Müsait Odalar Alanı (Change dates kaldırıldı) -->
      <div>
        <div class="mb-4">
          <h2 class="text-lg font-bold text-slate-900">Available rooms</h2>
          <p class="text-xs text-slate-500">Choose a room to proceed with your reservation.</p>
        </div>

        <!-- Oda Listesi Kartları -->
        <div class="space-y-4">
          <div v-for="room in rooms" :key="room.id" class="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex flex-wrap items-center justify-between gap-6 hover:border-slate-300 transition">
            
            <div class="flex items-center space-x-4">
              <div class="w-32 h-24 rounded-xl overflow-hidden bg-slate-100 flex-shrink-0">
                <img :src="room.image || 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=400&q=80'" alt="Room" class="w-full h-full object-cover" />
              </div>
              <div>
                <div class="flex items-center space-x-2 mb-1">
                  <span class="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    <span>{{ room.status || 'Available' }}</span>
                  </span>
                </div>
                <h3 class="font-bold text-slate-900 text-base">{{ room.name }}</h3>
                <div class="flex items-center space-x-3 text-xs text-slate-500 mt-1">
                  <span>{{ room.roomNumber || 'Room 101' }}</span>
                  <span>•</span>
                  <span class="flex items-center space-x-1">
                    <Icon name="lucide:users" class="w-3.5 h-3.5" />
                    <span>{{ room.capacity || '2 guests' }}</span>
                  </span>
                </div>
                <div class="flex items-center space-x-2 mt-2 text-[11px] text-slate-400">
                  <span class="bg-slate-100 px-2 py-0.5 rounded">Breakfast included</span>
                  <span class="bg-slate-100 px-2 py-0.5 rounded">Free Wi-Fi</span>
                  <span class="bg-slate-100 px-2 py-0.5 rounded">Sea view</span>
                </div>
              </div>
            </div>

            <!-- Fiyat ve Rezervasyon Butonu -->
            <div class="flex flex-col items-end justify-center min-w-[120px]">
              <span class="text-[10px] text-slate-400 uppercase tracking-wider">per night</span>
              <span class="text-xl font-bold text-slate-900 mb-2">${{ room.price }}</span>
              <button 
                @click="reserveRoom(room.id)"
                class="bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-xl text-xs font-semibold transition shadow-sm"
              >
                Reserve room
              </button>
            </div>

          </div>
        </div>

      </div>

    </div>

  </div>
</template>