<script setup>
definePageMeta({
  layout: 'admin'
})

import { ref, computed, onMounted } from 'vue'
const config = useRuntimeConfig()

const loading = ref(true)
const roomsList = ref([])
const hotelsList = ref([])

// Filtreleme State'leri
const searchQuery = ref('')
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

// Add Room Form State'i (POST /api/Rooms)
const showAddRoomForm = ref(false)
const newRoomForm = ref({
  hotelId: '',
  roomNumber: '',
  roomType: 'Standard',
  capacity: 2,
  pricePerNight: 1000,
  isAvailable: true
})
const savingRoom = ref(false)

// Satır İçi Düzenleme State'leri (PUT /api/Rooms/{id})
const editingRoomId = ref(null)
const editRoomForm = ref({
  hotelId: '',
  roomNumber: '',
  roomType: '',
  capacity: 2,
  pricePerNight: 0,
  isAvailable: true
})
const updatingRoom = ref(false)

// Silme Modalı State'i (DELETE /api/Rooms/{id})
const roomToDelete = ref(null)

// Otelleri ve Odaları Çekme
const fetchData = async () => {
  try {
    loading.value = true
    const token = getAuthToken()
    const headers = { Authorization: `Bearer ${token}` }

    const [roomsRes, hotelsRes] = await Promise.all([
      $fetch(`${config.public.apiBase}/api/Rooms`, { headers }).catch(() => []),
      $fetch(`${config.public.apiBase}/api/Hotels`, { headers }).catch(() => [])
    ])

    hotelsList.value = hotelsRes || []

    const hotelMap = {}
    hotelsList.value.forEach(h => {
      hotelMap[h.id || h.Id] = h.name || h.Name || 'Unknown Hotel'
    })

    roomsList.value = (roomsRes || []).map(r => {
      const hId = r.hotelId || r.HotelId || ''
      return {
        id: r.id || r.Id,
        hotelId: hId,
        hotelName: hotelMap[hId] || 'Unknown Hotel',
        roomNumber: r.roomNumber || r.RoomNumber || '',
        roomType: r.roomType || r.RoomType || 'Standard',
        capacity: r.capacity ?? r.Capacity ?? 2,
        pricePerNight: r.pricePerNight ?? r.PricePerNight ?? 0,
        isAvailable: r.isAvailable ?? r.IsAvailable ?? true
      }
    })

    if (hotelsList.value.length > 0 && !newRoomForm.value.hotelId) {
      newRoomForm.value.hotelId = hotelsList.value[0].id || hotelsList.value[0].Id
    }

  } catch (error) {
    console.error('Veriler yüklenirken hata:', error)
    showFeedback('Failed to load rooms.', 'error')
  } finally {
    loading.value = false
  }
}

// Yeni Oda Ekle (POST /api/Rooms)
const createRoom = async () => {
  if (!newRoomForm.value.hotelId || !newRoomForm.value.roomNumber) {
    showFeedback('Please select a hotel and enter room number.', 'error')
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
      isAvailable: Boolean(newRoomForm.value.isAvailable)
    }

    await $fetch(`${config.public.apiBase}/api/Rooms`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: payload
    })

    showFeedback('Room successfully created.', 'success')
    showAddRoomForm.value = false
    newRoomForm.value.roomNumber = ''
    fetchData()
  } catch (error) {
    console.error('Oda eklenemedi:', error)
    showFeedback('An error occurred while creating room.', 'error')
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
    roomType: room.roomType,
    capacity: room.capacity,
    pricePerNight: room.pricePerNight,
    isAvailable: room.isAvailable
  }
}

const cancelEditing = () => {
  editingRoomId.value = null
}

// Oda Güncelle (PUT /api/Rooms/{id})
const updateRoom = async (roomId) => {
  try {
    updatingRoom.value = true
    const token = getAuthToken()

    const payload = {
      hotelId: editRoomForm.value.hotelId,
      roomNumber: editRoomForm.value.roomNumber.toString(),
      roomType: editRoomForm.value.roomType,
      capacity: Number(editRoomForm.value.capacity),
      pricePerNight: Number(editRoomForm.value.pricePerNight),
      isAvailable: Boolean(editRoomForm.value.isAvailable)
    }

    await $fetch(`${config.public.apiBase}/api/Rooms/${roomId}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` },
      body: payload
    })

    showFeedback('Room successfully updated.', 'success')
    editingRoomId.value = null
    fetchData()
  } catch (error) {
    console.error('Oda güncellenemedi:', error)
    showFeedback('An error occurred while updating room.', 'error')
  } finally {
    updatingRoom.value = false
  }
}

// Oda Sil (DELETE /api/Rooms/{id})
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
    showFeedback('An error occurred while deleting room.', 'error')
  } finally {
    roomToDelete.value = null
  }
}

// Filtreleme
const filteredRooms = computed(() => {
  return roomsList.value.filter(room => {
    const matchesSearch = 
      room.roomNumber.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      room.roomType.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      room.hotelName.toLowerCase().includes(searchQuery.value.toLowerCase())

    const matchesHotel = selectedHotelFilter.value === 'All hotels' || room.hotelId === selectedHotelFilter.value

    return matchesSearch && matchesHotel
  })
})

onMounted(() => {
  fetchData()
})
</script>

<template>
  <div class="max-w-7xl mx-auto pb-12 relative">
    
    <!-- Başlık ve Add Room Butonu -->
    <div class="flex items-center justify-between mb-8">
      <div>
        <h1 class="text-2xl font-bold text-slate-900">Room management</h1>
        <p class="text-sm text-slate-500 mt-1">View, update, and manage all hotel rooms.</p>
      </div>
      <button @click="showAddRoomForm = !showAddRoomForm; editingRoomId = null" class="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2.5 rounded-xl text-sm font-medium flex items-center space-x-2 transition shadow-sm">
        <Icon :name="showAddRoomForm ? 'lucide:x' : 'lucide:plus'" class="w-4 h-4" />
        <span>{{ showAddRoomForm ? 'Close form' : 'Add room' }}</span>
      </button>
    </div>

    <!-- Bildirim Kutusu -->
    <div v-if="feedbackMessage.text" class="mb-6 p-4 rounded-xl text-sm font-medium flex items-center space-x-2" :class="feedbackMessage.type === 'error' ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'">
      <Icon :name="feedbackMessage.type === 'error' ? 'lucide:alert-circle' : 'lucide:check-circle'" class="w-5 h-5" />
      <span>{{ feedbackMessage.text }}</span>
    </div>

    <!-- Add Room Paneli -->
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
            <label class="block text-xs font-semibold text-slate-600 mb-1">Select Hotel</label>
            <select v-model="newRoomForm.hotelId" class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:bg-white focus:border-slate-300 focus:outline-none transition">
              <option v-for="hotel in hotelsList" :key="hotel.id || hotel.Id" :value="hotel.id || hotel.Id">
                {{ hotel.name || hotel.Name }}
              </option>
            </select>
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-600 mb-1">Room Number</label>
            <input v-model="newRoomForm.roomNumber" type="text" placeholder="e.g. 101" class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:bg-white focus:border-slate-300 focus:outline-none transition" />
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-600 mb-1">Room Type</label>
            <input v-model="newRoomForm.roomType" type="text" placeholder="e.g. Deluxe, Suite" class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:bg-white focus:border-slate-300 focus:outline-none transition" />
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-600 mb-1">Capacity (Guests)</label>
            <input v-model.number="newRoomForm.capacity" type="number" min="1" class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:bg-white focus:border-slate-300 focus:outline-none transition" />
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-600 mb-1">Price Per Night (₺)</label>
            <input v-model.number="newRoomForm.pricePerNight" type="number" min="0" class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:bg-white focus:border-slate-300 focus:outline-none transition" />
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-600 mb-1">Availability</label>
            <select v-model="newRoomForm.isAvailable" class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:bg-white focus:border-slate-300 focus:outline-none transition">
              <option :value="true">Available</option>
              <option :value="false">Occupied / Not Available</option>
            </select>
          </div>
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

    <!-- Filtreleme Çubuğu -->
    <div class="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm mb-6 flex flex-wrap items-center gap-4">
      <div class="relative flex-1 min-w-[240px]">
        <Icon name="lucide:search" class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input 
          v-model="searchQuery"
          type="text" 
          placeholder="Search by room number, type or hotel" 
          class="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:bg-white focus:border-slate-300 focus:outline-none transition"
        />
      </div>

      <div class="w-56">
        <select v-model="selectedHotelFilter" class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 outline-none focus:bg-white focus:border-slate-300 transition">
          <option value="All hotels">All hotels</option>
          <option v-for="hotel in hotelsList" :key="hotel.id || hotel.Id" :value="hotel.id || hotel.Id">
            {{ hotel.name || hotel.Name }}
          </option>
        </select>
      </div>
    </div>

    <!-- Yükleniyor -->
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
            <th class="py-4 px-6">Hotel</th>
            <th class="py-4 px-6">Room #</th>
            <th class="py-4 px-6">Type</th>
            <th class="py-4 px-6">Capacity</th>
            <th class="py-4 px-6">Price / Night</th>
            <th class="py-4 px-6">Status</th>
            <th class="py-4 px-6 text-right">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100 text-sm text-slate-700">
          <template v-for="room in filteredRooms" :key="room.id">
            
            <!-- Normal Satır -->
            <tr v-if="editingRoomId !== room.id" class="hover:bg-slate-50/50 transition">
              <td class="py-4 px-6 font-semibold text-slate-900">
                {{ room.hotelName }}
              </td>
              <td class="py-4 px-6 font-bold text-slate-900">
                #{{ room.roomNumber }}
              </td>
              <td class="py-4 px-6 text-slate-600">
                {{ room.roomType }}
              </td>
              <td class="py-4 px-6 text-slate-600">
                {{ room.capacity }} guests
              </td>
              <td class="py-4 px-6 font-bold text-slate-900">
                ₺{{ room.pricePerNight.toLocaleString() }}
              </td>
              <td class="py-4 px-6">
                <span 
                  class="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-medium"
                  :class="room.isAvailable ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'"
                >
                  <span class="w-1.5 h-1.5 rounded-full" :class="room.isAvailable ? 'bg-emerald-500' : 'bg-amber-500'"></span>
                  <span>{{ room.isAvailable ? 'Available' : 'Occupied' }}</span>
                </span>
              </td>
              <td class="py-4 px-6 text-right space-x-1">
                <button @click="startEditing(room); showAddRoomForm = false" class="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition" title="Edit room">
                  <Icon name="lucide:pencil" class="w-4 h-4" />
                </button>
                <button @click="confirmDelete(room)" class="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition" title="Delete room">
                  <Icon name="lucide:trash-2" class="w-4 h-4" />
                </button>
              </td>
            </tr>

            <!-- Satır İçi Düzenleme -->
            <tr v-else class="bg-slate-50/80">
              <td class="py-4 px-6">
                <select v-model="editRoomForm.hotelId" class="p-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 focus:outline-none">
                  <option v-for="hotel in hotelsList" :key="hotel.id || hotel.Id" :value="hotel.id || hotel.Id">
                    {{ hotel.name || hotel.Name }}
                  </option>
                </select>
              </td>
              <td class="py-4 px-6">
                <input v-model="editRoomForm.roomNumber" type="text" class="w-20 p-1.5 bg-white border border-slate-300 rounded-lg text-sm font-semibold text-slate-900 focus:outline-none" />
              </td>
              <td class="py-4 px-6">
                <input v-model="editRoomForm.roomType" type="text" class="w-28 p-1.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-700 focus:outline-none" />
              </td>
              <td class="py-4 px-6">
                <input v-model.number="editRoomForm.capacity" type="number" min="1" class="w-16 p-1.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-700 focus:outline-none" />
              </td>
              <td class="py-4 px-6">
                <input v-model.number="editRoomForm.pricePerNight" type="number" class="w-24 p-1.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-700 focus:outline-none" />
              </td>
              <td class="py-4 px-6">
                <select v-model="editRoomForm.isAvailable" class="p-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-700 focus:outline-none">
                  <option :value="true">Available</option>
                  <option :value="false">Occupied</option>
                </select>
              </td>
              <td class="py-4 px-6 text-right space-x-1">
                <button @click="updateRoom(room.id)" :disabled="updatingRoom" class="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-medium transition shadow-sm disabled:opacity-50">
                  {{ updatingRoom ? 'Saving...' : 'Save' }}
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
        <p class="text-xs text-slate-500 mb-6">Are you sure you want to delete Room <span class="font-semibold text-slate-800">#{{ roomToDelete.roomNumber }}</span>? This action cannot be undone.</p>
        
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