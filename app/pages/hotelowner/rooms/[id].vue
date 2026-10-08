<script setup>
definePageMeta({
  layout: 'hotelowner'
})

import { ref, onMounted } from 'vue'
const route = useRoute()
const config = useRuntimeConfig()

const loading = ref(true)
const room = ref(null)
const hotelName = ref('')
const isEditing = ref(false)

const feedbackMessage = ref({ text: '', type: '' })

// Düzenleme Formu State'i
const editForm = ref({
  roomNumber: '',
  roomType: 'Standard',
  capacity: 2,
  pricePerNight: 0,
  isAvailable: true
})

const showFeedback = (text, type = 'success') => {
  feedbackMessage.value = { text, type }
  setTimeout(() => {
    feedbackMessage.value.text = ''
  }, 4000)
}

const getAuthToken = () => {
  return localStorage.getItem('token') || localStorage.getItem('jwt') || localStorage.getItem('accessToken') || ''
}

// Oda detayını ve bağlı olduğu otel bilgisini çekme
const fetchRoomDetail = async () => {
  try {
    loading.value = true
    const roomId = route.params.id
    const token = getAuthToken()

    const roomResponse = await $fetch(`${config.public.apiBase}/api/Rooms/${roomId}`, {
      headers: { Authorization: `Bearer ${token}` }
    })

    if (roomResponse) {
      room.value = roomResponse
      
      // Form alanlarını doldur
      editForm.value.roomNumber = roomResponse.roomNumber || roomResponse.RoomNumber || ''
      editForm.value.roomType = roomResponse.roomType || roomResponse.RoomType || 'Standard'
      editForm.value.capacity = roomResponse.capacity || roomResponse.Capacity || 2
      editForm.value.pricePerNight = roomResponse.pricePerNight || roomResponse.PricePerNight || roomResponse.price || 0
      editForm.value.isAvailable = roomResponse.isAvailable ?? roomResponse.IsAvailable ?? true

      // Otel adını almak için otelin detayını çekelim
      const hotelId = roomResponse.hotelId || roomResponse.HotelId
      if (hotelId) {
        try {
          const hotelResponse = await $fetch(`${config.public.apiBase}/api/Hotels/${hotelId}`, {
            headers: { Authorization: `Bearer ${token}` }
          })
          if (hotelResponse) {
            hotelName.value = hotelResponse.name || hotelResponse.Name || 'Hotel'
          }
        } catch (hotelErr) {
          console.error('Otel adı alınamadı:', hotelErr)
        }
      }
    }
  } catch (error) {
    console.error('Oda detayı yüklenirken hata:', error)
    showFeedback('Failed to load room details.', 'error')
  } finally {
    loading.value = false
  }
}

// Oda Güncelleme (PUT /api/Rooms/{id})
const updateRoom = async () => {
  try {
    const roomId = route.params.id
    const token = getAuthToken()

    const payload = {
      id: roomId,
      hotelId: room.value.hotelId || room.value.HotelId,
      roomNumber: editForm.value.roomNumber.toString(),
      roomType: editForm.value.roomType,
      capacity: Number(editForm.value.capacity),
      pricePerNight: Number(editForm.value.pricePerNight),
      isAvailable: Boolean(editForm.value.isAvailable)
    }

    await $fetch(`${config.public.apiBase}/api/Rooms/${roomId}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` },
      body: payload
    })

    showFeedback('Room successfully updated.', 'success')
    isEditing.value = false
    fetchRoomDetail()
  } catch (error) {
    console.error('Oda güncellenemedi:', error)
    const errMessage = error?.data?.message || 'An error occurred while updating the room.'
    showFeedback(errMessage, 'error')
  }
}

onMounted(() => {
  fetchRoomDetail()
})
</script>

<template>
  <div class="max-w-7xl mx-auto pb-12">
    
    <!-- Geri Dönüş Linki -->
    <div class="mb-6">
      <NuxtLink to="/hotelowner/rooms" class="text-sm font-medium text-slate-500 hover:text-slate-900 flex items-center space-x-1 transition">
        <Icon name="lucide:arrow-left" class="w-4 h-4 mr-1" />
        <span>Back to rooms</span>
      </NuxtLink>
    </div>

    <!-- Şık Bildirim Kutusu -->
    <div v-if="feedbackMessage.text" class="mb-6 p-4 rounded-xl text-sm font-medium flex items-center space-x-2" :class="feedbackMessage.type === 'error' ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'">
      <Icon :name="feedbackMessage.type === 'error' ? 'lucide:alert-circle' : 'lucide:check-circle'" class="w-5 h-5" />
      <span>{{ feedbackMessage.text }}</span>
    </div>

    <!-- Yükleniyor Durumu -->
    <div v-if="loading" class="text-center py-24 text-slate-400 text-sm">
      Loading room details...
    </div>

    <template v-else-if="room">
      
      <!-- Üst Başlık ve Düzenle Butonu -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <span class="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
            ROOM {{ editForm.roomNumber }}
          </span>
          <h1 class="text-3xl font-bold text-slate-900">{{ editForm.roomType }} Room</h1>
          <p class="text-sm text-slate-500 mt-0.5">{{ hotelName }}</p>
        </div>

        <button @click="isEditing = !isEditing" class="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2.5 rounded-xl font-medium text-sm shadow-sm transition flex items-center space-x-2">
          <Icon :name="isEditing ? 'lucide:x' : 'lucide:pencil'" class="w-4 h-4" />
          <span>{{ isEditing ? 'Cancel editing' : 'Edit room' }}</span>
        </button>
      </div>

      <!-- Düzenleme Formu (Edit Room Aktif Olduğunda Görünür) -->
      <div v-if="isEditing" class="bg-slate-50 border border-slate-200 rounded-2xl p-6 mb-8 shadow-sm">
        <h3 class="font-bold text-slate-900 mb-4 text-base">Edit room details</h3>
        
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          
          <div>
            <label class="block text-xs font-semibold text-slate-600 mb-1">Room Number</label>
            <input v-model="editForm.roomNumber" type="text" class="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-slate-400" />
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-600 mb-1">Room Type</label>
            <select v-model="editForm.roomType" class="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-slate-400">
              <option value="Standard">Standard</option>
              <option value="Deluxe">Deluxe</option>
              <option value="Suite">Suite</option>
            </select>
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-600 mb-1">Capacity (Guests)</label>
            <input v-model.number="editForm.capacity" type="number" min="1" max="10" class="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-slate-400" />
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-600 mb-1">Price Per Night (₺)</label>
            <input v-model.number="editForm.pricePerNight" type="number" min="0" step="50" class="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-slate-400" />
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-600 mb-1">Availability Status</label>
            <select v-model="editForm.isAvailable" class="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-slate-400">
              <option :value="true">Available</option>
              <option :value="false">Unavailable</option>
            </select>
          </div>

        </div>

        <div class="flex justify-end space-x-3">
          <button @click="isEditing = false" class="px-4 py-2.5 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-200 transition">
            Cancel
          </button>
          <button @click="updateRoom" class="bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-xl text-xs font-medium transition shadow-sm">
            Save Changes
          </button>
        </div>
      </div>

      <!-- Oda Detay Kartı (Görseldeki Tasarım Standardı) -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        <div class="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          
          <!-- Üst Durum Rozeti -->
          <div class="flex items-center justify-between pb-6 mb-6 border-b border-slate-100">
            <div class="flex items-center space-x-3">
              <div class="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center font-bold text-slate-800 text-lg">
                #{{ editForm.roomNumber }}
              </div>
              <div>
                <h3 class="font-bold text-slate-900">Room #{{ editForm.roomNumber }}</h3>
                <p class="text-xs text-slate-500">Inventory and pricing details</p>
              </div>
            </div>

            <span 
              class="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-medium"
              :class="editForm.isAvailable ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'"
            >
              <span class="w-1.5 h-1.5 rounded-full" :class="editForm.isAvailable ? 'bg-emerald-500' : 'bg-slate-400'"></span>
              <span>{{ editForm.isAvailable ? 'Available' : 'Unavailable' }}</span>
            </span>
          </div>

          <!-- Detay Grid Alanı -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8 text-sm">
            
            <div>
              <span class="text-xs text-slate-400 block mb-1">Room type</span>
              <span class="font-semibold text-slate-800">{{ editForm.roomType }}</span>
            </div>

            <div>
              <span class="text-xs text-slate-400 block mb-1">Capacity</span>
              <span class="font-semibold text-slate-800">{{ editForm.capacity }} guests</span>
            </div>

            <div>
              <span class="text-xs text-slate-400 block mb-1">Price per night</span>
              <span class="font-bold text-slate-900 text-base">₺{{ editForm.pricePerNight }}</span>
            </div>

            <div>
              <span class="text-xs text-slate-400 block mb-1">Hotel</span>
              <span class="font-semibold text-slate-800">{{ hotelName }}</span>
            </div>

          </div>

        </div>

        <!-- Sağ Taraf: Oda Performans Özeti -->
        <div class="space-y-6">
          <div class="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <h3 class="font-bold text-slate-900 mb-4 text-base">Room performance</h3>
            
            <div class="flex justify-between text-sm text-slate-600 mb-3">
              <span>Occupancy this month</span>
              <span class="font-medium text-slate-900">%84</span>
            </div>
            <div class="flex justify-between text-sm text-slate-600 mb-3">
              <span>Active reservations</span>
              <span class="font-medium text-slate-900">4</span>
            </div>
            <div class="flex justify-between text-sm text-slate-600 pb-4 border-b border-slate-100 mb-4">
              <span>Monthly revenue</span>
              <span class="font-medium text-emerald-600">₺{{ (editForm.pricePerNight * 15).toLocaleString() }}</span>
            </div>

            <div class="bg-slate-50 border border-slate-100 text-slate-600 text-xs font-medium px-3 py-2.5 rounded-xl flex items-center space-x-2">
              <Icon name="lucide:info" class="w-4 h-4 text-slate-400 flex-shrink-0" />
              <span>Performance statistics are calculated based on live reservations.</span>
            </div>
          </div>
        </div>

      </div>

    </template>

    <div v-else class="text-center py-24 text-slate-400 text-sm">
      Room not found or has been deleted.
    </div>

  </div>
</template>