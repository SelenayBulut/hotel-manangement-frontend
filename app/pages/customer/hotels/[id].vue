<script setup>
definePageMeta({
  layout: 'customer'
})

import { ref, computed, onMounted } from 'vue'
const route = useRoute()
const config = useRuntimeConfig()

const hotelId = route.params.id
const loading = ref(true)
const hotel = ref(null)
const rooms = ref([])

// Modal ve Rezervasyon State'leri
const showModal = ref(false)
const currentStep = ref(1) // 1: Room, 2: Dates, 3: Review, 4: Confirm
const selectedRoom = ref(null)
const submitting = ref(false)

// Şık Hata/Bildirim State'i
const errorMessage = ref('')

const checkInDate = ref('2026-10-18')
const checkOutDate = ref('2026-10-22')
const guestCount = ref(2)

// Backend'den gelen gerçek rezervasyon bilgileri
const confirmedReservation = ref({
  code: 'RES-2401',
  totalPrice: 0
})

const getAuthToken = () => {
  return localStorage.getItem('token') || localStorage.getItem('jwt') || localStorage.getItem('accessToken') || ''
}

// Otel ve odaları çekme
const fetchHotelDetailsAndRooms = async () => {
  try {
    loading.value = true
    const token = getAuthToken()

    const hotelRes = await $fetch(`${config.public.apiBase}/api/Hotels/${hotelId}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    
    if (hotelRes) {
      hotel.value = {
        id: hotelRes.id || hotelRes.Id,
        name: hotelRes.name || hotelRes.Name || 'Hotel',
        description: hotelRes.description || hotelRes.Description || '',
        city: hotelRes.city || hotelRes.City || '',
        address: hotelRes.address || hotelRes.Address || '',
        rating: hotelRes.rating ?? hotelRes.Rating ?? 4.9,
        imageUrl: hotelRes.imageUrl || hotelRes.ImageUrl || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80'
      }
    }

    const roomsRes = await $fetch(`${config.public.apiBase}/api/Rooms/hotel/${hotelId}`, {
      headers: { Authorization: `Bearer ${token}` }
    })

    if (roomsRes) {
      rooms.value = roomsRes.map(room => {
        const rawImageUrl = room.imageUrl || room.ImageUrl
        const roomImage = rawImageUrl 
          ? (rawImageUrl.startsWith('http') ? rawImageUrl : `${config.public.apiBase}${rawImageUrl}`)
          : 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=400&q=80'

        return {
          id: room.id || room.Id,
          roomNumber: room.roomNumber || room.RoomNumber || '101',
          roomType: room.roomType || room.RoomType || 'Standard',
          capacity: room.capacity ?? room.Capacity ?? 2,
          pricePerNight: room.pricePerNight ?? room.PricePerNight ?? 0,
          isAvailable: room.isAvailable ?? room.IsAvailable ?? true,
          image: roomImage
        }
      })
    }
  } catch (error) {
    console.error('Loading error:', error)
  } finally {
    loading.value = false
  }
}

const openBookingModal = (room) => {
  selectedRoom.value = room
  currentStep.value = 1
  errorMessage.value = ''
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
}

const numberOfNights = computed(() => {
  const start = new Date(checkInDate.value)
  const end = new Date(checkOutDate.value)
  const diffTime = Math.abs(end - start)
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return diffDays > 0 ? diffDays : 4
})

const estimatedTotalPrice = computed(() => {
  if (!selectedRoom.value) return 0
  const pricePerNight = Number(selectedRoom.value.pricePerNight) || 0
  const nights = numberOfNights.value
  const guests = Number(guestCount.value) || 1
  return pricePerNight * nights * guests
})

// Rezervasyon Gönderimi ve Özel Tasarımlı İngilizce Hata Yönetimi
const submitReservation = async () => {
  try {
    submitting.value = true
    errorMessage.value = ''
    const token = getAuthToken()

    const formatDate = (dateStr) => {
      const d = new Date(dateStr)
      const year = d.getFullYear()
      const month = String(d.getMonth() + 1).padStart(2, '0')
      const day = String(d.getDate()).padStart(2, '0')
      return `${year}-${month}-${day}`
    }

    const payload = {
      roomId: selectedRoom.value.id, // Number() dönüşümünü kaldırdık, Guid olarak gidiyor
      checkInDate: formatDate(checkInDate.value),
      checkOutDate: formatDate(checkOutDate.value),
      guestCount: Number(guestCount.value)
    }

    const response = await $fetch(`${config.public.apiBase}/api/Reservations`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: payload
    })

    if (response) {
      const resId = response.id || response.Id || ''
      confirmedReservation.value = {
        code: resId ? `RES-${String(resId).substring(0, 4).toUpperCase()}` : 'RES-2401',
        totalPrice: response.totalPrice ?? response.TotalPrice ?? estimatedTotalPrice.value
      }
    }

    currentStep.value = 4
  } catch (error) {
    console.error('Reservation error:', error.data || error)
    errorMessage.value = error.data?.message || error.data?.title || 'An error occurred while creating your reservation. Please check your dates and try again.'
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  fetchHotelDetailsAndRooms()
})
</script>

<template>
  <div class="max-w-7xl mx-auto pb-16 relative">
    
    <!-- Geri Dön -->
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

    <div v-else-if="!hotel" class="text-center py-24 text-slate-400 text-sm">
      Hotel not found.
    </div>

    <div v-else class="space-y-8">
      
      <!-- Otel Banner -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div class="lg:col-span-2 h-[320px] rounded-2xl overflow-hidden shadow-sm bg-slate-200">
          <img 
            :src="hotel.imageUrl ? (hotel.imageUrl.startsWith('http') ? hotel.imageUrl : `${config.public.apiBase}${hotel.imageUrl}`) : 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80'" 
            alt="Hotel Banner" 
            class="w-full h-full object-cover" 
          />
        </div>
        <div class="grid grid-rows-2 gap-4 h-[320px]">
          <div class="rounded-2xl overflow-hidden shadow-sm bg-slate-200 h-full">
            <img :src="rooms[0]?.image || 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=600&q=80'" alt="Room Detail 1" class="w-full h-full object-cover" />
          </div>
          <div class="rounded-2xl overflow-hidden shadow-sm bg-slate-200 h-full">
            <img :src="rooms[1]?.image || 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=600&q=80'" alt="Room Detail 2" class="w-full h-full object-cover" />
          </div>
        </div>
      </div>

      <!-- Otel Bilgileri -->
      <div class="flex flex-wrap items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div class="flex items-center space-x-1.5 text-xs text-slate-500 mb-1">
            <Icon name="lucide:map-pin" class="w-3.5 h-3.5 text-amber-600" />
            <span>{{ hotel.city }} - {{ hotel.address }}</span>
          </div>
          <h1 class="text-2xl font-bold text-slate-900">{{ hotel.name }}</h1>
          <p class="text-sm text-slate-500 mt-1 max-w-2xl">{{ hotel.description }}</p>
        </div>
        <div class="flex items-center space-x-2 bg-slate-50 px-4 py-3 rounded-2xl border border-slate-100">
          <span class="text-xl font-bold text-slate-900">{{ hotel.rating }}</span>
          <div class="text-xs">
            <span class="text-amber-500 font-semibold block">Exceptional</span>
            <span class="text-slate-400">Verified</span>
          </div>
        </div>
      </div>

      <!-- Odalar Listesi -->
      <div>
        <div class="mb-4">
          <h2 class="text-lg font-bold text-slate-900">Available rooms</h2>
          <p class="text-xs text-slate-500">Choose a room to start your reservation.</p>
        </div>

        <div v-if="rooms.length === 0" class="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-400 text-sm">
          No rooms available for this hotel yet.
        </div>

        <div v-else class="space-y-4">
          <div v-for="room in rooms" :key="room.id" class="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex flex-wrap items-center justify-between gap-6 hover:border-slate-300 transition">
            
            <div class="flex items-center space-x-4">
              <div class="w-32 h-24 rounded-xl overflow-hidden bg-slate-100 flex-shrink-0">
                <img :src="room.image" alt="Room" class="w-full h-full object-cover" />
              </div>
              <div>
                <div class="flex items-center space-x-2 mb-1">
                  <span class="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-semibold" :class="room.isAvailable ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'">
                    <span class="w-1.5 h-1.5 rounded-full" :class="room.isAvailable ? 'bg-emerald-500' : 'bg-rose-500'"></span>
                    <span>{{ room.isAvailable ? 'Available' : 'Occupied' }}</span>
                  </span>
                </div>
                <h3 class="font-bold text-slate-900 text-base">{{ room.roomType }}</h3>
                <div class="flex items-center space-x-3 text-xs text-slate-500 mt-1">
                  <span>Room No: {{ room.roomNumber }}</span>
                  <span>•</span>
                  <span class="flex items-center space-x-1">
                    <Icon name="lucide:users" class="w-3.5 h-3.5" />
                    <span>{{ room.capacity }} guests</span>
                  </span>
                </div>
              </div>
            </div>

            <div class="flex flex-col items-end justify-center min-w-[120px]">
              <span class="text-[10px] text-slate-400 uppercase tracking-wider">per night</span>
              <span class="text-xl font-bold text-slate-900 mb-2">${{ room.pricePerNight }}</span>
              <button 
                @click="openBookingModal(room)"
                :disabled="!room.isAvailable"
                class="bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-xl text-xs font-semibold transition shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Reserve room
              </button>
            </div>

          </div>
        </div>

      </div>

    </div>

    <!-- REZERVASYON MODALI -->
    <div v-if="showModal" class="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div class="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-xl w-full p-6 relative my-8">
        
        <!-- Modal Başlık ve Stepper -->
        <div class="mb-6 border-b border-slate-100 pb-4">
          <div class="flex items-center justify-between mb-4">
            <div>
              <span class="text-[10px] font-bold tracking-wider text-amber-600 uppercase">Reservation</span>
              <h3 class="text-lg font-bold text-slate-900">Complete your booking</h3>
            </div>
            <button @click="closeModal" class="p-1.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition">
              <Icon name="lucide:x" class="w-5 h-5" />
            </button>
          </div>

          <div class="flex items-center justify-between relative px-6">
            <div class="absolute left-10 right-10 top-1/2 -translate-y-1/2 h-0.5 bg-slate-200 z-0"></div>

            <div class="flex flex-col items-center relative z-10">
              <div class="w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs" :class="currentStep >= 1 ? 'bg-slate-900 text-white' : 'bg-slate-200 text-slate-600'">1</div>
              <span class="text-[10px] font-medium text-slate-600 mt-1">Room</span>
            </div>
            <div class="flex flex-col items-center relative z-10">
              <div class="w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs" :class="currentStep >= 2 ? 'bg-slate-900 text-white' : 'bg-slate-200 text-slate-600'">2</div>
              <span class="text-[10px] font-medium text-slate-600 mt-1">Dates</span>
            </div>
            <div class="flex flex-col items-center relative z-10">
              <div class="w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs" :class="currentStep >= 3 ? 'bg-slate-900 text-white' : 'bg-slate-200 text-slate-600'">3</div>
              <span class="text-[10px] font-medium text-slate-600 mt-1">Review</span>
            </div>
            <div class="flex flex-col items-center relative z-10">
              <div class="w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs" :class="currentStep === 4 ? 'bg-slate-900 text-white' : 'bg-slate-200 text-slate-600'">4</div>
              <span class="text-[10px] font-medium text-slate-600 mt-1">Confirm</span>
            </div>
          </div>
        </div>

        <!-- Şık Hata Bildirim Kutusu -->
        <div v-if="errorMessage" class="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center space-x-2">
          <Icon name="lucide:alert-circle" class="w-4 h-4 flex-shrink-0" />
          <span>{{ errorMessage }}</span>
        </div>

        <!-- ADIMLAR -->
        <div>
          
          <!-- ADIM 1 -->
          <div v-if="currentStep === 1" class="space-y-4">
            <div class="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex items-center justify-between">
              <div class="flex items-center space-x-3">
                <img :src="selectedRoom?.image" alt="Room" class="w-20 h-16 rounded-xl object-cover bg-slate-200" />
                <div>
                  <span class="text-xs text-slate-400">{{ hotel.name }}</span>
                  <h4 class="font-bold text-slate-900 text-sm">{{ selectedRoom?.roomType }} - Room {{ selectedRoom?.roomNumber }}</h4>
                  <p class="text-[11px] text-slate-500">Up to {{ selectedRoom?.capacity }} guests</p>
                </div>
              </div>
              <div class="text-right">
                <span class="text-base font-bold text-slate-900">${{ selectedRoom?.pricePerNight }}</span>
                <span class="text-[10px] text-slate-400 block">/night</span>
              </div>
            </div>

            <div class="flex justify-end pt-3 border-t border-slate-100">
              <button @click="currentStep = 2" class="bg-slate-900 hover:bg-slate-800 text-white px-5 py-2 rounded-xl text-xs font-semibold transition shadow-sm">
                Continue
              </button>
            </div>
          </div>

          <!-- ADIM 2 -->
          <div v-if="currentStep === 2" class="space-y-4">
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-xs font-semibold text-slate-600 mb-1">Check-in date</label>
                <input v-model="checkInDate" type="date" class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none" />
              </div>
              <div>
                <label class="block text-xs font-semibold text-slate-600 mb-1">Check-out date</label>
                <input v-model="checkOutDate" type="date" class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none" />
              </div>
            </div>

            <div>
              <label class="block text-xs font-semibold text-slate-600 mb-1">Guests (Max: {{ selectedRoom?.capacity || 1 }})</label>
              <select v-model="guestCount" class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none">
                <option v-for="n in (selectedRoom?.capacity || 1)" :key="n" :value="n">
                  {{ n }} {{ n === 1 ? 'adult' : 'adults' }}
                </option>
              </select>
            </div>

            <div class="flex justify-between pt-3 border-t border-slate-100">
              <button @click="currentStep = 1" class="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl text-xs font-semibold">Back</button>
              <button @click="currentStep = 3" class="bg-slate-900 text-white px-5 py-2 rounded-xl text-xs font-semibold">Continue</button>
            </div>
          </div>

          <!-- ADIM 3 -->
          <div v-if="currentStep === 3" class="space-y-4">
            <div class="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2 text-xs">
              <div class="flex justify-between pb-2 border-b border-slate-200">
                <span class="text-slate-500">Price per night</span>
                <span class="font-semibold text-slate-900">${{ selectedRoom?.pricePerNight }}.00</span>
              </div>
              <div class="flex justify-between pb-2 border-b border-slate-200">
                <span class="text-slate-500">Number of nights</span>
                <span class="font-semibold text-slate-900">{{ numberOfNights }} nights</span>
              </div>
              <div class="flex justify-between pb-2 border-b border-slate-200">
                <span class="text-slate-500">Guests</span>
                <span class="font-semibold text-slate-900">{{ guestCount }} adults</span>
              </div>
              <div class="flex justify-between pt-1 text-sm font-bold">
                <span class="text-slate-900">Estimated total</span>
                <span class="text-slate-900">${{ estimatedTotalPrice }}.00</span>
              </div>
            </div>

            <div class="flex justify-between pt-3 border-t border-slate-100">
              <button @click="currentStep = 2" class="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl text-xs font-semibold">Back</button>
              <button @click="submitReservation" :disabled="submitting" class="bg-slate-900 hover:bg-slate-800 text-white px-5 py-2 rounded-xl text-xs font-semibold shadow-sm disabled:opacity-50">
                {{ submitting ? 'Processing...' : `Confirm & pay` }}
              </button>
            </div>
          </div>

          <!-- ADIM 4 -->
          <div v-if="currentStep === 4" class="text-center py-4 space-y-4">
            <div class="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
              <Icon name="lucide:check" class="w-7 h-7" />
            </div>

            <div>
              <h4 class="text-lg font-bold text-slate-900">Your stay is confirmed</h4>
              <p class="text-xs text-slate-500 mt-1">
                Reservation <span class="font-semibold text-slate-800">{{ confirmedReservation.code }}</span> has been successfully booked.
              </p>
              <p class="text-xs font-bold text-emerald-600 mt-2">
                Total Charged: ${{ confirmedReservation.totalPrice }}.00
              </p>
            </div>

            <div class="pt-2">
              <button @click="closeModal" class="bg-slate-900 hover:bg-slate-800 text-white px-6 py-2.5 rounded-xl text-xs font-semibold transition shadow-sm">
                View reservations
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>

  </div>
</template>