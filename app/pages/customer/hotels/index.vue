<script setup>
definePageMeta({
  layout: 'customer' 
})

import { ref, computed, onMounted } from 'vue'

const config = useRuntimeConfig()
const loading = ref(true)
const hotels = ref([])

// Filtreleme State'leri
const searchQuery = ref('')
const selectedLocation = ref('')
const selectedPriceRange = ref('any')
const selectedRoomType = ref('all')
const selectedGuests = ref('2')

// Otelleri ve odaları backend'den güvenli şekilde çeken fonksiyon
const fetchHotels = async () => {
  try {
    loading.value = true
    const response = await $fetch(`${config.public.apiBase}/api/Hotels`)
    if (response && Array.isArray(response)) {
      hotels.value = response.map(hotel => ({
        id: hotel.id || hotel.Id,
        name: hotel.name || hotel.Name || '',
        city: hotel.city || hotel.City || '',
        address: hotel.address || hotel.Address || '',
        description: hotel.description || hotel.Description || '',
        rating: hotel.rating ?? hotel.Rating ?? 4.8,
        imageUrl: hotel.imageUrl || hotel.ImageUrl || '',
        rooms: hotel.rooms || hotel.Rooms || []
      }))
    }
  } catch (error) {
    console.error('Oteller yüklenirken hata oluştu:', error)
  } finally {
    loading.value = false
  }
}

// En düşük fiyat hesaplama fonksiyonu
const getMinPrice = (rooms) => {
  if (!rooms || !Array.isArray(rooms) || rooms.length === 0) return '0'
  
  const prices = rooms.map(room => {
    const val = room.pricePerNight ?? room.PricePerNight ?? 0
    return Number(val)
  }).filter(price => !isNaN(price) && price > 0)
  
  if (prices.length === 0) return '0'
  
  return Math.min(...prices)
}

// Konum filtresi için dinamik şehir listesi
const availableLocations = computed(() => {
  const cities = hotels.value.map(h => h.city).filter(Boolean)
  return [...new Set(cities)]
})

// Güçlendirilmiş Filtreleme Mantığı
const filteredHotels = computed(() => {
  return hotels.value.filter(hotel => {
    const name = hotel.name || ''
    const city = hotel.city || ''
    const description = hotel.description || ''
    const rooms = hotel.rooms || []
    
    const matchesSearch = searchQuery.value === '' || 
      name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      city.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      description.toLowerCase().includes(searchQuery.value.toLowerCase())

    const matchesLocation = !selectedLocation.value || city === selectedLocation.value

    const minPrice = Number(getMinPrice(rooms))
    let matchesPrice = true
    if (selectedPriceRange.value === 'budget') {
      matchesPrice = minPrice <= 1000
    } else if (selectedPriceRange.value === 'mid') {
      matchesPrice = minPrice > 1000 && minPrice <= 2000
    } else if (selectedPriceRange.value === 'luxury') {
      matchesPrice = minPrice > 2000
    }

    // Odası olmayan otellerin de listelenmesi veya filtrelere uyum sağlaması
    const matchesRoomAndGuests = rooms.length === 0 ? (selectedRoomType.value === 'all') : rooms.some(room => {
      const rType = room.roomType || room.RoomType || ''
      const rCapacity = Number(room.capacity || room.Capacity || 1)
      
      const matchesType = selectedRoomType.value === 'all' || 
        rType.toLowerCase() === selectedRoomType.value.toLowerCase()

      const requiredGuests = Number(selectedGuests.value)
      const matchesGuestCount = rCapacity >= requiredGuests

      return matchesType && matchesGuestCount
    })

    return matchesSearch && matchesLocation && matchesPrice && matchesRoomAndGuests
  })
})

onMounted(() => {
  fetchHotels()
})
</script>

<template>
  <div class="max-w-7xl mx-auto pb-12">
    <!-- Sayfa Başlığı -->
    <div class="mb-6">
      <h1 class="text-3xl font-bold text-slate-900">Find your perfect stay</h1>
      <p class="text-sm text-slate-500 mt-1">Discover curated hotels for every kind of journey.</p>
    </div>

    <!-- Üst Filtreleme Barı -->
    <div class="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm mb-8 grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
      
      <!-- Arama Çubuğu -->
      <div class="md:col-span-1 relative">
        <Icon name="lucide:search" class="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
        <input 
          v-model="searchQuery"
          type="text" 
          placeholder="Search by hotel, room..." 
          class="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-amber-500 text-slate-800"
        />
      </div>

      <!-- Konum (Location) -->
      <div>
        <select 
          v-model="selectedLocation"
          class="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:border-amber-500"
        >
          <option value="">All locations</option>
          <option v-for="city in availableLocations" :key="city" :value="city">{{ city }}</option>
        </select>
      </div>

      <!-- Fiyat Aralığı (Price Range) -->
      <div>
        <select 
          v-model="selectedPriceRange"
          class="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:border-amber-500"
        >
          <option value="any">Any price</option>
          <option value="budget">Budget (₺0 - ₺1000)</option>
          <option value="mid">Mid-range (₺1000 - ₺2000)</option>
          <option value="luxury">Luxury (₺2000+)</option>
        </select>
      </div>

      <!-- Oda Tipi (Room Type) -->
      <div>
        <select 
          v-model="selectedRoomType"
          class="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:border-amber-500"
        >
          <option value="all">All room types</option>
          <option value="Standard">Standard</option>
          <option value="Deluxe">Deluxe</option>
          <option value="Suite">Suite</option>
        </select>
      </div>

      <!-- Misafir (Guests) -->
      <div class="flex items-center space-x-2">
        <select 
          v-model="selectedGuests"
          class="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:border-amber-500"
        >
          <option value="1">1 guest</option>
          <option value="2">2 guests</option>
          <option value="3">3+ guests</option>
        </select>
      </div>
    </div>

    <!-- Sonuç Sayısı -->
    <div class="flex items-center justify-between mb-6">
      <span class="text-sm font-semibold text-slate-700">{{ filteredHotels.length }} hotels matching your preferences</span>
    </div>

    <!-- Yükleniyor Durumu -->
    <div v-if="loading" class="text-center py-20 text-slate-400 text-sm">
      Oteller yükleniyor...
    </div>

    <!-- Otel Bulunamadı -->
    <div v-else-if="filteredHotels.length === 0" class="text-center py-16 bg-white rounded-2xl border border-slate-200">
      <Icon name="lucide:search-x" class="w-10 h-10 text-slate-300 mx-auto mb-3" />
      <h3 class="text-base font-bold text-slate-800">Aramanıza uygun otel bulunamadı</h3>
      <p class="text-xs text-slate-500 mt-1">Farklı filtre kombinasyonları deneyebilirsiniz.</p>
    </div>

    <!-- Otel Kartları Grid Yapısı -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div v-for="hotel in filteredHotels" :key="hotel.id" class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col justify-between group hover:shadow-md transition">
        
        <!-- Kart Görseli -->
        <div class="relative h-52 overflow-hidden bg-slate-100">
          <img 
            :src="hotel.imageUrl ? `${config.public.apiBase}${hotel.imageUrl}` : 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=600&q=80'" 
            alt="Hotel" 
            class="w-full h-48 object-cover" 
          />
          
          <div class="absolute top-3 left-3 bg-black/60 backdrop-blur-md text-white text-xs font-semibold px-2.5 py-1 rounded-lg flex items-center space-x-1">
            <Icon name="lucide:star" class="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
            <span>{{ hotel.rating }}</span>
          </div>
        </div>

        <!-- Kart İçeriği -->
        <div class="p-5 flex flex-col flex-grow justify-between">
          <div>
            <p class="text-xs text-slate-400 flex items-center space-x-1">
              <Icon name="lucide:map-pin" class="w-3.5 h-3.5" />
              <span>{{ hotel.city }}</span>
            </p>
            <h3 class="text-lg font-bold text-slate-900 mt-1">{{ hotel.name }}</h3>
            <p class="text-xs text-slate-500 mt-1 line-clamp-2">{{ hotel.description || 'A serene retreat offering sweeping ocean views and thoughtful modern amenities.' }}</p>
          </div>

          <div class="border-t border-slate-100 pt-4 mt-4 flex items-center justify-between">
            <span class="text-xs text-slate-500">Starting from</span>
            <div class="text-right">
              <span class="text-lg font-bold text-slate-900">₺{{ getMinPrice(hotel.rooms) }}</span>
              <span class="text-xs text-slate-400"> / night</span>
            </div>
          </div>

          <NuxtLink :to="`/customer/hotels/${hotel.id}`" class="mt-4 w-full block text-center py-2.5 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 hover:bg-slate-50 transition">
            View details
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>