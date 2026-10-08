<template>
  <!-- Eğer user veya veriler yükleniyorsa yükleniyor ekranı gösterelim -->
  <div v-if="loading" class="min-h-screen flex items-center justify-center bg-slate-50">
    <p class="text-slate-500 text-sm font-medium animate-pulse">Yükleniyor...</p>
  </div>

  <!-- Yüklendikten sonra ana panel -->
  <div v-else class="min-h-screen bg-slate-50 flex">
    <!-- Sol Sabit Menü (Component) -->
    <CustomerSidebar :user="user" />

    <!-- Sağ Ana Alan -->
    <div class="flex-1 ml-64 flex flex-col min-w-0">
      <!-- Üst Bar (Component) -->
      <CustomerHeader :user="user" />

      <!-- Dinamik Sayfa İçeriği -->
      <main class="p-8 space-y-8 flex-1">
        <div class="flex items-end justify-between">
          <div>
            <span class="text-xs font-bold tracking-widest text-amber-600 uppercase">WELCOME</span>
            <h1 class="text-3xl font-extrabold text-slate-900 mt-1">Welcome back, {{ user.firstName }}</h1>
            <p class="text-sm text-slate-500 mt-0.5">Here's what's happening with your stays.</p>
          </div>
          <NuxtLink to="/customer/hotels" class="bg-[#0B132B] hover:bg-slate-800 text-white px-5 py-2.5 rounded-xl font-medium text-sm shadow-sm flex items-center space-x-2 transition">
            <Icon name="lucide:search" class="w-4 h-4" />
            <span>Find a hotel</span>
          </NuxtLink>
        </div>

        
        <!-- İstatistik Kartları -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        <!-- 1. Active Reservations -->
        <div class="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-4">
            <div class="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-600 shrink-0">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
            </div>
            <div>
            <span class="text-xs font-semibold uppercase tracking-wider text-slate-400">Active reservations</span>
            <div class="text-2xl font-extrabold text-slate-900 mt-0.5">{{ stats.activeReservations }}</div>
            </div>
        </div>

        <!-- 2. Upcoming Check-Ins -->
        <div class="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-4">
            <div class="w-12 h-12 rounded-xl bg-amber-50/80 border border-amber-100 flex items-center justify-center text-amber-600 shrink-0">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>
            </div>
            <div>
            <span class="text-xs font-semibold uppercase tracking-wider text-slate-400">Upcoming check-ins</span>
            <div class="text-2xl font-extrabold text-slate-900 mt-0.5">{{ stats.upcomingCheckIns }}</div>
            </div>
        </div>

        <!-- 3. Total Reservations -->
        <div class="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-4">
            <div class="w-12 h-12 rounded-xl bg-purple-50/80 border border-purple-100 flex items-center justify-center text-purple-600 shrink-0">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            </div>
            <div>
            <span class="text-xs font-semibold uppercase tracking-wider text-slate-400">Total reservations</span>
            <div class="text-2xl font-extrabold text-slate-900 mt-0.5">{{ stats.totalReservations }}</div>
            </div>
        </div>

        <!-- 4. Total Spending -->
        <div class="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-4">
            <div class="w-12 h-12 rounded-xl bg-emerald-50/80 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/></svg>
            </div>
            <div>
            <span class="text-xs font-semibold uppercase tracking-wider text-slate-400">Total spending</span>
            <div class="text-2xl font-extrabold text-slate-900 mt-0.5">${{ stats.totalSpending }}</div>
            </div>
        </div>

        </div>

      


        <!-- Alt Kısımlar (Your Next Stay & Quick Actions) -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
       <!-- Your Next Stay Kartı (Sol 2 Sütun) -->
<div class="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col justify-between">
  <div class="flex items-center justify-between mb-4">
    <span class="text-xs font-bold tracking-wider text-amber-600 uppercase">UP NEXT</span>
    <NuxtLink to="/customer/reservations" class="text-sm font-semibold text-slate-900 hover:underline flex items-center space-x-1">
      <span>View details</span>
      <Icon name="lucide:chevron-right" class="w-4 h-4" />
    </NuxtLink>
  </div>
  <h2 class="text-xl font-bold text-slate-900 mb-4">Your next stay</h2>

  <!-- nextReservation verisi varsa kartı göster -->
  <div v-if="nextReservation" class="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-4 rounded-xl border border-slate-100">
    
    <!-- Otel Görseli (Backend'den gelen ImageUrl) -->
    <img 
      :src=" nextReservation.ImageUrl || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80'" 
      :alt="nextReservation.name ||  'Hotel'" 
      class="w-full h-44 object-cover rounded-lg filter grayscale contrast-125"
    />
    
    <div class="flex flex-col justify-between">
      <div>
        <div class="inline-block px-2.5 py-0.5 bg-emerald-100 text-emerald-800 text-[11px] font-semibold rounded-full mb-2">Confirmed</div>
        
        <!-- Otel Adı (Backend'den gelen Name) -->
        <h3 class="text-lg font-bold text-slate-900">
          {{ nextReservation.name ||'Otel Adı Bulunamadı' }}
        </h3>
        
        <!-- Şehir / Konum (Backend'den gelen City) -->
        <p class="text-xs text-slate-500 flex items-center space-x-1 mt-0.5">
          <Icon name="lucide:map-pin" class="w-3.5 h-3.5" />
          <span>{{ nextReservation.city ||  'Konum belirtilmemiş' }}</span>
        </p>
      </div>
      
      <!-- Tarih Bilgileri -->
      <div class="border-t border-slate-200/60 pt-3 mt-3 grid grid-cols-2 text-xs">
        <div>
          <span class="text-slate-400 block">Check-in</span>
          <span class="font-bold text-slate-800">{{ new Date(nextReservation.checkInDate ).toLocaleDateString() }}</span>
        </div>
        <div>
          <span class="text-slate-400 block">Check-out</span>
          <span class="font-bold text-slate-800">{{ new Date(nextReservation.checkOutDate ).toLocaleDateString() }}</span>
        </div>
      </div>
    </div>
  </div>
  
  <!-- Rezervasyon Yoksa Gösterilecek Alan -->
  <div v-else class="text-sm text-slate-500 py-8 text-center bg-slate-50 rounded-xl border border-slate-100">
    Yaklaşan aktif bir rezervasyonunuz bulunmuyor.
  </div>
</div>

          <!-- Quick Actions Kartı (Sağ 1 Sütun) -->
          <div class="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col justify-between">
            <h2 class="text-lg font-bold text-slate-900 mb-4">Quick actions</h2>
            <div class="space-y-3">
              
              <!-- 1. Explore Hotels -->
              <NuxtLink to="/customer/hotels" class="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors group">
                <div class="flex items-center space-x-3">
                  <div class="w-11 h-11 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-600 shrink-0">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
                  </div>
                  <div>
                    <h4 class="text-sm font-bold text-slate-900">Explore hotels</h4>
                    <span class="text-[11px] text-slate-400">Find your next stay</span>
                  </div>
                </div>
                <svg class="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"/></svg>
              </NuxtLink>

              <!-- 2. Manage Booking -->
              <NuxtLink to="/customer/reservations" class="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors group">
                <div class="flex items-center space-x-3">
                  <div class="w-11 h-11 rounded-xl bg-amber-50/80 border border-amber-100 flex items-center justify-center text-amber-600 shrink-0">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                  </div>
                  <div>
                    <h4 class="text-sm font-bold text-slate-900">Manage booking</h4>
                    <span class="text-[11px] text-slate-400">Update dates or guests</span>
                  </div>
                </div>
                <svg class="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"/></svg>
              </NuxtLink>

              <!-- 3. Payment History -->
              <NuxtLink to="/customer/payments" class="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors group">
                <div class="flex items-center space-x-3">
                  <div class="w-11 h-11 rounded-xl bg-emerald-50/80 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/></svg>
                  </div>
                  <div>
                    <h4 class="text-sm font-bold text-slate-900">Payment history</h4>
                    <span class="text-[11px] text-slate-400">View invoices and refunds</span>
                  </div>
                </div>
                <svg class="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"/></svg>
              </NuxtLink>

            </div>
          </div>
        </div>

        
       <!-- Recommended for you Bölümü (Yatayda genişletilmiş özel alan) -->
        <div class="mt-8 mb-12 w-full">
        <div class="flex items-center justify-between mb-4">
            <div>
            <h2 class="text-xl font-bold text-slate-900">Recommended for you</h2>
            <p class="text-xs text-slate-500 mt-0.5">Handpicked stays based on your travel style</p>
            </div>
            <NuxtLink to="/customer/hotels" class="text-sm font-semibold text-slate-900 hover:underline flex items-center space-x-1">
            <span>View all hotels</span>
            <Icon name="lucide:chevron-right" class="w-4 h-4" />
            </NuxtLink>
        </div>

        <!-- Otel Kartları Grid Yapısı (Yatayda tam yayılma için w-full) -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
            
            <div v-for="hotel in recommendedHotels" :key="hotel.id" class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col justify-between group">
            
            <!-- Otel Görseli -->
            <div class="relative h-48 w-full overflow-hidden bg-slate-100">
                <img 
                :src="hotel.imageUrl || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80'" 
                :alt="hotel.name" 
                class="w-full h-full object-cover filter grayscale contrast-125 group-hover:scale-105 transition-transform duration-500"
                />
                <!-- Puan Rozeti -->
                <div class="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-lg text-xs font-bold text-slate-900 flex items-center space-x-1 shadow-sm">
                <span class="text-amber-500">★</span>
                <span>{{ hotel.rating || '4.8' }}</span>
                </div>
            </div>

            <!-- Otel Bilgileri -->
            <div class="p-5 flex flex-col justify-between flex-grow">
                <div>
                <p class="text-xs text-slate-400 flex items-center space-x-1 mb-1">
                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path stroke-linecap="round" stroke-linejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                    <span>{{ hotel.city || 'Santorini, Greece' }}</span>
                </p>
                <h3 class="text-base font-bold text-slate-900 mb-1">{{ hotel.name }}</h3>
                <p class="text-xs text-slate-500 line-clamp-2">{{ hotel.description || 'A serene cliffside escape with sweeping views and thoughtful modern comforts.' }}</p>
                </div>

                <!-- Alt Kısım: Odalar ve Fiyat -->
                <div class="border-t border-slate-100 pt-4 mt-4 flex items-center justify-between">
                <span class="text-xs text-slate-500 font-medium">
                    <strong class="text-slate-900">{{ hotel.rooms ? hotel.rooms.length : '3' }}</strong> rooms available
                </span>
                <div class="text-right">
                    <span class="text-[10px] text-slate-400 uppercase tracking-wider block">from</span>
                    <span class="text-base font-extrabold text-slate-900">
                    {{ getMinPrice(hotel.rooms) !== '0' ? getMinPrice(hotel.rooms) : '2400' }} ₺ <span class="text-xs font-normal text-slate-500">/ night</span>
                    </span>
                </div>
                </div>
                
            </div>

            <!-- Detay Butonu -->
            <div class="p-4 pt-0">
                <NuxtLink :to="`/customer/hotels/${hotel.id}`" class="w-full py-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-900 text-xs font-bold rounded-xl transition-colors flex items-center justify-center">
                View details
                </NuxtLink>
            </div>
            </div>


        </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const config = useRuntimeConfig()
const loading = ref(true)

const user = ref({
  firstName: 'Kullanıcı',
  name: 'Kullanıcı',
  initials: 'K'
})

const stats = ref({
  activeReservations: 0,
  upcomingCheckIns: 0,
  totalReservations: 0,
  totalSpending: '0'
})

const nextReservation = ref(null)
const recommendedHotels = ref([])

// Otelleri veritabanından çeken fonksiyon
const fetchRecommendedHotels = async () => {
  try {
    const response = await $fetch(`${config.public.apiBase}/api/Hotels`) 
    
    if (response && Array.isArray(response)) {
      const shuffled = [...response].sort(() => 0.5 - Math.random())
      recommendedHotels.value = shuffled.slice(0, 3)
    }
  } catch (error) {
    console.error('Önerilen oteller yüklenirken hata oluştu:', error)
  }
}

// Odalar içindeki PricePerNight alanına göre en düşük fiyatı bulan fonksiyon
const getMinPrice = (rooms) => {
  if (!rooms || !Array.isArray(rooms) || rooms.length === 0) return '0'
  
  const prices = rooms.map(room => {
    // C# modelindeki PricePerNight alanını baz alıyoruz
    const val = room.pricePerNight ?? room.PricePerNight ?? 0
    return Number(val)
  }).filter(price => !isNaN(price) && price > 0)
  
  if (prices.length === 0) return '0'
  
  return Math.min(...prices)
}

onMounted(async () => {
  try {
    const token = localStorage.getItem('token')
    const username = localStorage.getItem('username') || 'Kullanıcı'

    user.value = {
      firstName: username,
      name: username,
      initials: username.substring(0, 2).toUpperCase()
    }

    const response = await $fetch(`${config.public.apiBase}/api/Reservations/dashboard-stats`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    stats.value = {
      activeReservations: response.stats.activeReservations,
      upcomingCheckIns: response.stats.upcomingCheckIns,
      totalReservations: response.stats.totalReservations,
      totalSpending: response.stats.totalSpending.toLocaleString()
    }

    // Backend'den gelen dashboard-stats içerisindeki nextReservation verisi doğrudan buraya atanır.
    // Eğer backend'den tüm liste geliyorsa ve içerisinden en yakın tarihi kendin seçeceksen burayı güncelleyebiliriz,
    // ancak dashboard-stats endpoint'i zaten en yakın rezervasyonu (nextReservation) hesaplayıp dönüyorsa direkt eşleşir.
    nextReservation.value = response.nextReservation

    await fetchRecommendedHotels()

  } catch (error) {
    console.error("Dashboard verileri yüklenirken hata oluştu:", error)
  } finally {
    loading.value = false
  }
})
</script>