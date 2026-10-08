<script setup>
definePageMeta({
  layout: 'hotelowner'
})

import { ref, computed, onMounted } from 'vue'
const config = useRuntimeConfig()

const loading = ref(true)
const roomsList = ref([])
const hotelsList = ref([])

// Filtreleme State'leri
const searchQuery = ref('')
const selectedHotel = ref('All hotels')
const selectedType = ref('All room types')
const selectedAvailability = ref('All availability')

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

// Add Room Form State'i
const showAddRoomForm = ref(false)
const newRoomForm = ref({
  hotelId: '',
  roomNumber: '',
  roomType: 'Standard',
  capacity: 2,
  pricePerNight: 0,
  isAvailable: true,
  imageUrl: ''
})
const savingRoom = ref(false)

// Satır İçi Düzenleme (Inline Edit) State'leri
const editingRoomId = ref(null)
const editRoomForm = ref({
  hotelId: '',
  roomNumber: '',
  roomType: 'Standard',
  capacity: 2,
  pricePerNight: 0,
  isAvailable: true,
  imageUrl: ''
})
const updatingRoom = ref(false)

// Görsel Yükleme Fonksiyonu
const uploadImage = async (event, isEdit = false) => {
  const file = event.target.files[0]
  if (!file) return

  const formData = new FormData()
  formData.append('file', file)

  try {
    const token = getAuthToken()
    const response = await $fetch(`${config.public.apiBase}/api/Rooms/upload-image`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData
    })

    if (response && response.url) {
      if (isEdit) {
        editRoomForm.value.imageUrl = response.url
      } else {
        newRoomForm.value.imageUrl = response.url
      }
      showFeedback('Image uploaded successfully.', 'success')
    }
  } catch (error) {
    console.error('Görsel yüklenemedi:', error)
    showFeedback('Failed to upload image.', 'error')
  }
}

// Otelleri ve odaları çekme mantığı
const fetchRoomsAndHotels = async () => {
  try {
    loading.value = true
    const token = getAuthToken()

    const hotelsResponse = await $fetch(`${config.public.apiBase}/api/Hotels/my-hotels`, {
      headers: { Authorization: `Bearer ${token}` }
    })

    if (hotelsResponse) {
      hotelsList.value = hotelsResponse
      let allRooms = []

      hotelsResponse.forEach(hotel => {
        const hotelName = hotel.name || hotel.Name || 'Otel'
        const hotelId = hotel.id || hotel.Id
        const rooms = hotel.rooms || hotel.Rooms || []

        rooms.forEach(room => {
          const roomPrice = room.pricePerNight ?? room.PricePerNight ?? room.nightlyRate ?? room.NightlyRate ?? room.price ?? room.Price ?? 0

          allRooms.push({
            id: room.id || room.Id,
            roomNumber: room.roomNumber || room.RoomNumber || 'N/A',
            hotelName: hotelName,
            hotelId: hotelId,
            type: room.roomType ?? room.RoomType ?? room.type ?? room.Type ?? 'Standard',
            capacity: room.capacity || room.Capacity || 2,
            price: roomPrice,
            isAvailable: room.isAvailable ?? room.IsAvailable ?? true,
            imageUrl: room.imageUrl || room.ImageUrl || ''
          })
        })
      })

      roomsList.value = allRooms
    }
  } catch (error) {
    console.error('Oda verileri yüklenirken hata oluştu:', error)
    showFeedback('Failed to load room details.', 'error')
  } finally {
    loading.value = false
  }
}

// Yeni Oda Ekleme (POST /api/Rooms)
const createRoom = async () => {
  if (!newRoomForm.value.hotelId) {
    showFeedback('Please select a hotel.', 'error')
    return
  }
  if (!newRoomForm.value.roomNumber) {
    showFeedback('Please enter a room number.', 'error')
    return
  }

  try {
    savingRoom.value = true
    const token = getAuthToken()

    const payload = {
      hotelId: newRoomForm.value.hotelId,
      roomNumber: newRoomForm.value.roomNumber.toString(),
      roomType: newRoomForm.value.roomType,
      capacity: Number(newRoomForm.value.capacity),
      pricePerNight: Number(newRoomForm.value.pricePerNight),
      isAvailable: Boolean(newRoomForm.value.isAvailable),
      imageUrl: newRoomForm.value.imageUrl
    }

    await $fetch(`${config.public.apiBase}/api/Rooms`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: payload
    })

    showFeedback('Room successfully created.', 'success')
    showAddRoomForm.value = false
    newRoomForm.value = {
      hotelId: '',
      roomNumber: '',
      roomType: 'Standard',
      capacity: 2,
      pricePerNight: 0,
      isAvailable: true,
      imageUrl: ''
    }
    fetchRoomsAndHotels()
  } catch (error) {
    console.error('Oda eklenemedi:', error)
    const errMessage = error?.data?.message || 'An error occurred while creating the room.'
    showFeedback(errMessage, 'error')
  } finally {
    savingRoom.value = false
  }
}

// Düzenlemeyi Başlat
const startEditing = (room) => {
  editingRoomId.value = room.id
  editRoomForm.value = {
    hotelId: room.hotelId,
    roomNumber: room.roomNumber,
    roomType: room.type,
    capacity: room.capacity,
    pricePerNight: room.price,
    isAvailable: room.isAvailable,
    imageUrl: room.imageUrl
  }
}

// Düzenlemeyi İptal Et
const cancelEditing = () => {
  editingRoomId.value = null
}

// Oda Güncelleme (PUT /api/Rooms/{id})
const updateRoom = async (roomId) => {
  try {
    updatingRoom.value = true
    const token = getAuthToken()

    const payload = {
      id: roomId,
      hotelId: editRoomForm.value.hotelId,
      roomNumber: editRoomForm.value.roomNumber.toString(),
      roomType: editRoomForm.value.roomType,
      capacity: Number(editRoomForm.value.capacity),
      pricePerNight: Number(editRoomForm.value.pricePerNight),
      isAvailable: Boolean(editRoomForm.value.isAvailable),
      imageUrl: editRoomForm.value.imageUrl
    }

    await $fetch(`${config.public.apiBase}/api/Rooms/${roomId}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` },
      body: payload
    })

    showFeedback('Room successfully updated.', 'success')
    editingRoomId.value = null
    fetchRoomsAndHotels()
  } catch (error) {
    console.error('Oda güncellenemedi:', error)
    const errMessage = error?.data?.message || 'An error occurred while updating the room.'
    showFeedback(errMessage, 'error')
  } finally {
    updatingRoom.value = false
  }
}

// Filtreleme mantığı
const filteredRooms = computed(() => {
  return roomsList.value.filter(room => {
    const matchesSearch = 
      room.roomNumber.toString().toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      room.hotelName.toLowerCase().includes(searchQuery.value.toLowerCase())

    const matchesHotel = selectedHotel.value === 'All hotels' || room.hotelName === selectedHotel.value
    const matchesType = selectedType.value === 'All room types' || room.type === selectedType.value
    
    const matchesAvailability = 
      selectedAvailability.value === 'All availability' || 
      (selectedAvailability.value === 'Available' && room.isAvailable) ||
      (selectedAvailability.value === 'Unavailable' && !room.isAvailable)

    return matchesSearch && matchesHotel && matchesType && matchesAvailability
  })
})

// Silme Mantığı ve Onay Modalı
const roomToDelete = ref(null)

const confirmDelete = (room) => {
  roomToDelete.value = room
}

const deleteRoom = async () => {
  if (!roomToDelete.value) return
  const roomId = roomToDelete.value.id

  try {
    const token = getAuthToken()
    await $fetch(`${config.public.apiBase}/api/Rooms/${roomId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    })
    roomsList.value = roomsList.value.filter(r => r.id !== roomId)
    showFeedback('Room successfully deleted.', 'success')
  } catch (error) {
    console.error('Oda silinemedi:', error)
    showFeedback('An error occurred while deleting the room.', 'error')
  } finally {
    roomToDelete.value = null
  }
}

onMounted(() => {
  fetchRoomsAndHotels()
})
</script>

<template>
  <div class="max-w-7xl mx-auto pb-12 relative">
    
    <!-- Başlık ve Add Room Butonu -->
    <div class="flex items-center justify-between mb-8">
      <div>
        <h1 class="text-2xl font-bold text-slate-900">Room management</h1>
        <p class="text-sm text-slate-500 mt-1">Manage room inventory, pricing, and availability.</p>
      </div>
      <button @click="showAddRoomForm = !showAddRoomForm; editingRoomId = null" class="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2.5 rounded-xl text-sm font-medium flex items-center space-x-2 transition shadow-sm">
        <Icon :name="showAddRoomForm ? 'lucide:x' : 'lucide:plus'" class="w-4 h-4" />
        <span>{{ showAddRoomForm ? 'Close form' : 'Add room' }}</span>
      </button>
    </div>

    <!-- Şık Bildirim Kutusu -->
    <div v-if="feedbackMessage.text" class="mb-6 p-4 rounded-xl text-sm font-medium flex items-center space-x-2" :class="feedbackMessage.type === 'error' ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'">
      <Icon :name="feedbackMessage.type === 'error' ? 'lucide:alert-circle' : 'lucide:check-circle'" class="w-5 h-5" />
      <span>{{ feedbackMessage.text }}</span>
    </div>

    <!-- Add Room Hızlı Ekleme Paneli (En Üstte) -->
    <transition
      enter-active-class="transform transition duration-300 ease-out"
      enter-from-class="-translate-y-4 opacity-0"
      enter-to-class="translate-y-0 opacity-100"
      leave-active-class="transform transition duration-200 ease-in"
      leave-from-class="translate-y-0 opacity-100"
      leave-to-class="-translate-y-4 opacity-0"
    >
      <div v-if="showAddRoomForm" class="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm mb-6">
        <h3 class="font-bold text-slate-900 text-base mb-4">Add new room</h3>
        
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
          <div>
            <label class="block text-xs font-semibold text-slate-600 mb-1">Hotel</label>
            <select v-model="newRoomForm.hotelId" class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 outline-none focus:bg-white focus:border-slate-300 transition">
              <option value="" disabled>Select hotel</option>
              <option v-for="hotel in hotelsList" :key="hotel.id || hotel.Id" :value="hotel.id || hotel.Id">
                {{ hotel.name || hotel.Name }}
              </option>
            </select>
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-600 mb-1">Room Number</label>
            <input v-model="newRoomForm.roomNumber" type="text" placeholder="e.g. 305" class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:bg-white focus:border-slate-300 focus:outline-none transition" />
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-600 mb-1">Room Type</label>
            <select v-model="newRoomForm.roomType" class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 outline-none focus:bg-white focus:border-slate-300 transition">
              <option value="Standard">Standard</option>
              <option value="Deluxe">Deluxe</option>
              <option value="Suite">Suite</option>
            </select>
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-600 mb-1">Capacity</label>
            <input v-model.number="newRoomForm.capacity" type="number" min="1" max="10" class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:bg-white focus:border-slate-300 focus:outline-none transition" />
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-600 mb-1">Price Per Night (₺)</label>
            <input v-model.number="newRoomForm.pricePerNight" type="number" min="0" step="50" class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:bg-white focus:border-slate-300 focus:outline-none transition" />
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-600 mb-1">Room Image</label>
            <input type="file" @change="(e) => uploadImage(e, false)" class="w-full text-xs text-slate-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-slate-900 file:text-white hover:file:bg-slate-800" />
          </div>
        </div>

        <!-- Görsel Önizleme -->
        <div v-if="newRoomForm.imageUrl" class="mb-4 flex items-center space-x-3">
          <img :src="config.public.apiBase + newRoomForm.imageUrl" class="w-16 h-12 object-cover rounded-lg border border-slate-200" alt="Room preview" />
          <span class="text-xs text-emerald-600 font-medium">Image uploaded successfully</span>
        </div>

        <div class="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100">
          <button @click="showAddRoomForm = false" class="px-4 py-2 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-100 transition">
            Cancel
          </button>
          <button @click="createRoom" :disabled="savingRoom" class="bg-slate-900 hover:bg-slate-800 text-white px-5 py-2 rounded-xl text-xs font-medium transition shadow-sm disabled:opacity-50">
            {{ savingRoom ? 'Saving...' : 'Save Room' }}
          </button>
        </div> 
      </div>
    </transition>

    <!-- Filtreleme Çubuğu Alanı -->
    <div class="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm mb-6 flex flex-wrap items-center gap-4">
      <div class="relative flex-1 min-w-[240px]">
        <Icon name="lucide:search" class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input 
          v-model="searchQuery"
          type="text" 
          placeholder="Search room or hotel" 
          class="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:bg-white focus:border-slate-300 focus:outline-none transition"
        />
      </div>

      <div class="w-48">
        <select v-model="selectedHotel" class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 outline-none focus:bg-white focus:border-slate-300 transition">
          <option>All hotels</option>
          <option v-for="hotel in hotelsList" :key="hotel.id || hotel.Id" :value="hotel.name || hotel.Name">
            {{ hotel.name || hotel.Name }}
          </option>
        </select>
      </div>

      <div class="w-48">
        <select v-model="selectedType" class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 outline-none focus:bg-white focus:border-slate-300 transition">
          <option>All room types</option>
          <option value="Standard">Standard</option>
          <option value="Deluxe">Deluxe</option>
          <option value="Suite">Suite</option>
        </select>
      </div>

      <div class="w-44">
        <select v-model="selectedAvailability" class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 outline-none focus:bg-white focus:border-slate-300 transition">
          <option>All availability</option>
          <option>Available</option>
          <option>Unavailable</option>
        </select>
      </div>
    </div>

    <!-- Yükleniyor Durumu -->
    <div v-if="loading" class="text-center py-24 text-slate-400 text-sm">
      Loading rooms...
    </div>

    <!-- Tablo Alanı -->
    <div v-else class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      
      <div v-if="filteredRooms.length === 0" class="text-center py-16 text-slate-400 text-sm">
        No rooms found matching your criteria.
      </div>

      <table v-else class="w-full text-left border-collapse">
        <thead>
          <tr class="border-b border-slate-100 text-[11px] font-semibold text-slate-400 uppercase tracking-wider bg-slate-50/50">
            <th class="py-4 px-6">Image</th>
            <th class="py-4 px-6">Room</th>
            <th class="py-4 px-6">Hotel</th>
            <th class="py-4 px-6">Type</th>
            <th class="py-4 px-6">Capacity</th>
            <th class="py-4 px-6">Nightly rate</th>
            <th class="py-4 px-6">Availability</th>
            <th class="py-4 px-6 text-right">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100 text-sm text-slate-700">
          <template v-for="room in filteredRooms" :key="room.id">
            
            <!-- Normal Satır Görünümü -->
            <tr v-if="editingRoomId !== room.id" class="hover:bg-slate-50/50 transition">
              <td class="py-3 px-6">
                <img v-if="room.imageUrl" :src="config.public.apiBase + room.imageUrl" class="w-12 h-9 object-cover rounded-lg border border-slate-200" alt="Room" />
                <div v-else class="w-12 h-9 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400">
                  <Icon name="lucide:image" class="w-4 h-4" />
                </div>
              </td>
              <td class="py-4 px-6 font-semibold text-slate-900">#{{ room.roomNumber }}</td>
              <td class="py-4 px-6 text-slate-600">{{ room.hotelName }}</td>
              <td class="py-4 px-6 text-slate-600">{{ room.type }}</td>
              <td class="py-4 px-6 text-slate-600">{{ room.capacity }} guests</td>
              <td class="py-4 px-6 font-medium text-slate-900">₺{{ room.price }}</td>
              <td class="py-4 px-6">
                <span 
                  class="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-medium"
                  :class="room.isAvailable ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'"
                >
                  <span class="w-1.5 h-1.5 rounded-full" :class="room.isAvailable ? 'bg-emerald-500' : 'bg-slate-400'"></span>
                  <span>{{ room.isAvailable ? 'Available' : 'Unavailable' }}</span>
                </span>
              </td>
              <td class="py-4 px-6 text-right space-x-2">
                <button @click="startEditing(room); showAddRoomForm = false" class="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition" title="Edit room">
                  <Icon name="lucide:pencil" class="w-4 h-4" />
                </button>
                <button @click="confirmDelete(room)" class="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition" title="Delete room">
                  <Icon name="lucide:trash-2" class="w-4 h-4" />
                </button>
              </td>
            </tr>

            <!-- Satır İçi Düzenleme (Inline Edit) Görünümü -->
            <tr v-else class="bg-slate-50/80">
              <td class="py-3 px-6 flex items-center space-x-2">
                <img v-if="editRoomForm.imageUrl" :src="config.public.apiBase + editRoomForm.imageUrl" class="w-10 h-8 object-cover rounded border" alt="Edit preview" />
                <input type="file" @change="(e) => uploadImage(e, true)" class="w-24 text-[10px] text-slate-500 file:mr-1 file:py-1 file:px-2 file:rounded file:border-0 file:bg-slate-900 file:text-white" />
              </td>
              <td class="py-4 px-6">
                <input v-model="editRoomForm.roomNumber" type="text" class="w-16 p-1.5 bg-white border border-slate-300 rounded-lg text-sm font-semibold text-slate-900 focus:outline-none" />
              </td>
              <td class="py-4 px-6">
                <select v-model="editRoomForm.hotelId" class="w-full p-1.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-700 outline-none">
                  <option v-for="hotel in hotelsList" :key="hotel.id || hotel.Id" :value="hotel.id || hotel.Id">
                    {{ hotel.name || hotel.Name }}
                  </option>
                </select>
              </td>
              <td class="py-4 px-6">
                <select v-model="editRoomForm.roomType" class="w-full p-1.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-700 outline-none">
                  <option value="Standard">Standard</option>
                  <option value="Deluxe">Deluxe</option>
                  <option value="Suite">Suite</option>
                </select>
              </td>
              <td class="py-4 px-6">
                <input v-model.number="editRoomForm.capacity" type="number" min="1" max="10" class="w-16 p-1.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-700 focus:outline-none" />
              </td>
              <td class="py-4 px-6">
                <input v-model.number="editRoomForm.pricePerNight" type="number" min="0" step="50" class="w-24 p-1.5 bg-white border border-slate-300 rounded-lg text-sm font-medium text-slate-900 focus:outline-none" />
              </td>
              <td class="py-4 px-6">
                <select v-model="editRoomForm.isAvailable" class="w-full p-1.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-700 outline-none">
                  <option :value="true">Available</option>
                  <option :value="false">Unavailable</option>
                </select>
              </td>
              <td class="py-4 px-6 text-right space-x-1">
                <button @click="updateRoom(room.id)" :disabled="updatingRoom" class="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-medium transition shadow-sm">
                  Save
                </button>
                <button @click="cancelEditing" class="px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 rounded-lg text-xs font-medium transition">
                  Cancel
                </button>
              </td>
            </tr>

          </template>
        </tbody>
      </table>

    </div>

    <!-- Silme Onay Modalı -->
    <div v-if="roomToDelete" class="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div class="bg-white rounded-2xl border border-slate-200 p-6 max-w-sm w-full shadow-2xl">
        <h3 class="font-bold text-slate-900 text-base mb-2">Delete Room</h3>
        <p class="text-xs text-slate-500 mb-6">Are you sure you want to delete room <span class="font-semibold text-slate-800">#{{ roomToDelete.roomNumber }}</span>? This action cannot be undone.</p>
        
        <div class="flex items-center justify-end space-x-3">
          <button @click="roomToDelete = null" class="px-4 py-2.5 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-100 transition">
            Cancel
          </button>
          <button @click="deleteRoom" class="px-4 py-2.5 rounded-xl text-xs font-medium bg-rose-600 hover:bg-rose-700 text-white transition shadow-sm">
            Delete
          </button>
        </div>
      </div>
    </div>

  </div>
</template>