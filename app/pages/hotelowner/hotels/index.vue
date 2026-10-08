<script setup>
definePageMeta({
  layout: 'hotelowner'
})

import { ref, computed, onMounted } from 'vue'
const config = useRuntimeConfig()

const loading = ref(true)
const hotelsList = ref([])

// Filtreleme State'leri
const searchQuery = ref('')
const selectedCity = ref('All cities')

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

// Add Hotel Form State'i (Rating formdan kaldırıldı, arkada 5 olarak gönderiliyor)
const showAddHotelForm = ref(false)
const newHotelForm = ref({
  name: '',
  address: '',
  city: '',
  description: '',
  imageUrl: ''
})
const savingHotel = ref(false)

// Satır İçi Düzenleme (Inline Edit) State'leri (Rating formdan kaldırıldı)
const editingHotelId = ref(null)
const editHotelForm = ref({
  name: '',
  address: '',
  city: '',
  description: '',
  imageUrl: ''
})
const updatingHotel = ref(false)

// Otelleri backend'den çekme
const fetchHotels = async () => {
  try {
    loading.value = true
    const token = getAuthToken()

    const response = await $fetch(`${config.public.apiBase}/api/Hotels/my-hotels`, {
      headers: { Authorization: `Bearer ${token}` }
    })

    if (response) {
      hotelsList.value = response.map(hotel => ({
        id: hotel.id || hotel.Id,
        name: hotel.name || hotel.Name || '',
        address: hotel.address || hotel.Address || '',
        city: hotel.city || hotel.City || '',
        rating: hotel.rating ?? hotel.Rating ?? 5,
        description: hotel.description || hotel.Description || '',
        imageUrl: hotel.imageUrl || hotel.ImageUrl || ''
      }))
    }
  } catch (error) {
    console.error('Otel verileri yüklenirken hata oluştu:', error)
    showFeedback('Failed to load hotels.', 'error')
  } finally {
    loading.value = false
  }
}

// Yeni Otel Ekleme (POST /api/Hotels)
const createHotel = async () => {
  if (!newHotelForm.value.name || !newHotelForm.value.city) {
    showFeedback('Please fill in hotel name and city.', 'error')
    return
  }

  try {
    savingHotel.value = true
    const token = getAuthToken()

    const payload = {
      name: newHotelForm.value.name,
      address: newHotelForm.value.address,
      city: newHotelForm.value.city,
      rating: 5, // Otomatik varsayılan puan
      description: newHotelForm.value.description,
      imageUrl: newHotelForm.value.imageUrl
    }

    await $fetch(`${config.public.apiBase}/api/Hotels`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: payload
    })

    showFeedback('Hotel successfully created.', 'success')
    showAddHotelForm.value = false
    newHotelForm.value = {
      name: '',
      address: '',
      city: '',
      description: '',
      imageUrl: ''
    }
    fetchHotels()
  } catch (error) {
    console.error('Otel eklenemedi:', error)
    const errMessage = error?.data?.message || 'An error occurred while creating the hotel.'
    showFeedback(errMessage, 'error')
  } finally {
    savingHotel.value = false
  }
}

// Düzenlemeyi Başlat
const startEditing = (hotel) => {
  editingHotelId.value = hotel.id
  editHotelForm.value = {
    name: hotel.name,
    address: hotel.address,
    city: hotel.city,
    description: hotel.description,
    imageUrl: hotel.imageUrl
  }
}

// Düzenlemeyi İptal Et
const cancelEditing = () => {
  editingHotelId.value = null
}

// Otel Güncelleme (PUT /api/Hotels/{id})
const updateHotel = async (hotelId) => {
  try {
    updatingHotel.value = true
    const token = getAuthToken()

    const currentHotel = hotelsList.value.find(h => h.id === hotelId)

    const payload = {
      name: editHotelForm.value.name,
      address: editHotelForm.value.address,
      city: editHotelForm.value.city,
      rating: currentHotel ? currentHotel.rating : 5, // Mevcut puanı koruyoruz
      description: editHotelForm.value.description,
      imageUrl: editHotelForm.value.imageUrl
    }

    await $fetch(`${config.public.apiBase}/api/Hotels/${hotelId}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` },
      body: payload
    })

    showFeedback('Hotel successfully updated.', 'success')
    editingHotelId.value = null
    fetchHotels()
  } catch (error) {
    console.error('Otel güncellenemedi:', error)
    const errMessage = error?.data?.message || 'An error occurred while updating the hotel.'
    showFeedback(errMessage, 'error')
  } finally {
    updatingHotel.value = false
  }
}

// Filtreleme mantığı
const filteredHotels = computed(() => {
  return hotelsList.value.filter(hotel => {
    const matchesSearch = 
      hotel.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      hotel.city.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      hotel.address.toLowerCase().includes(searchQuery.value.toLowerCase())

    const matchesCity = selectedCity.value === 'All cities' || hotel.city === selectedCity.value

    return matchesSearch && matchesCity
  })
})

// Benzersiz Şehir Listesi
const availableCities = computed(() => {
  const cities = hotelsList.value.map(h => h.city).filter(Boolean)
  return ['All cities', ...new Set(cities)]
})

// Silme Mantığı ve Onay Modalı
const hotelToDelete = ref(null)

const confirmDelete = (hotel) => {
  hotelToDelete.value = hotel
}

const deleteHotel = async () => {
  if (!hotelToDelete.value) return
  const hotelId = hotelToDelete.value.id

  try {
    const token = getAuthToken()
    await $fetch(`${config.public.apiBase}/api/Hotels/${hotelId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    })
    hotelsList.value = hotelsList.value.filter(h => h.id !== hotelId)
    showFeedback('Hotel successfully deleted.', 'success')
  } catch (error) {
    console.error('Otel silinemedi:', error)
    showFeedback('An error occurred while deleting the hotel.', 'error')
  } finally {
    hotelToDelete.value = null
  }
}

onMounted(() => {
  fetchHotels()
})
</script>

<template>
  <div class="max-w-7xl mx-auto pb-12 relative">
    
    <!-- Başlık ve Add Hotel Butonu -->
    <div class="flex items-center justify-between mb-8">
      <div>
        <h1 class="text-2xl font-bold text-slate-900">Hotel management</h1>
        <p class="text-sm text-slate-500 mt-1">Manage your properties, locations, and details.</p>
      </div>
      <button @click="showAddHotelForm = !showAddHotelForm; editingHotelId = null" class="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2.5 rounded-xl text-sm font-medium flex items-center space-x-2 transition shadow-sm">
        <Icon :name="showAddHotelForm ? 'lucide:x' : 'lucide:plus'" class="w-4 h-4" />
        <span>{{ showAddHotelForm ? 'Close form' : 'Add hotel' }}</span>
      </button>
    </div>

    <!-- Şık Bildirim Kutusu -->
    <div v-if="feedbackMessage.text" class="mb-6 p-4 rounded-xl text-sm font-medium flex items-center space-x-2" :class="feedbackMessage.type === 'error' ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'">
      <Icon :name="feedbackMessage.type === 'error' ? 'lucide:alert-circle' : 'lucide:check-circle'" class="w-5 h-5" />
      <span>{{ feedbackMessage.text }}</span>
    </div>

    <!-- Add Hotel Hızlı Ekleme Paneli -->
    <transition
      enter-active-class="transform transition duration-300 ease-out"
      enter-from-class="-translate-y-4 opacity-0"
      enter-to-class="translate-y-0 opacity-100"
      leave-active-class="transform transition duration-200 ease-in"
      leave-from-class="translate-y-0 opacity-100"
      leave-to-class="-translate-y-4 opacity-0"
    >
      <div v-if="showAddHotelForm" class="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm mb-6">
        <h3 class="font-bold text-slate-900 text-base mb-4">Add new hotel</h3>
        
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
          <div>
            <label class="block text-xs font-semibold text-slate-600 mb-1">Hotel Name</label>
            <input v-model="newHotelForm.name" type="text" placeholder="e.g. Grand Resort" class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:bg-white focus:border-slate-300 focus:outline-none transition" />
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-600 mb-1">City</label>
            <input v-model="newHotelForm.city" type="text" placeholder="e.g. Antalya" class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:bg-white focus:border-slate-300 focus:outline-none transition" />
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-600 mb-1">Image URL</label>
            <input v-model="newHotelForm.imageUrl" type="text" placeholder="https://..." class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:bg-white focus:border-slate-300 focus:outline-none transition" />
          </div>

          <div class="sm:col-span-2">
            <label class="block text-xs font-semibold text-slate-600 mb-1">Address</label>
            <input v-model="newHotelForm.address" type="text" placeholder="Street, district, etc." class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:bg-white focus:border-slate-300 focus:outline-none transition" />
          </div>

          <div class="sm:col-span-3">
            <label class="block text-xs font-semibold text-slate-600 mb-1">Description</label>
            <textarea v-model="newHotelForm.description" rows="2" placeholder="Brief details about the hotel..." class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:bg-white focus:border-slate-300 focus:outline-none transition"></textarea>
          </div>
        </div>

        <div class="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100">
          <button @click="showAddHotelForm = false" class="px-4 py-2 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-100 transition">
            Cancel
          </button>
          <button @click="createHotel" :disabled="savingHotel" class="bg-slate-900 hover:bg-slate-800 text-white px-5 py-2 rounded-xl text-xs font-medium transition shadow-sm disabled:opacity-50">
            {{ savingHotel ? 'Saving...' : 'Save Hotel' }}
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
          placeholder="Search hotel name or city" 
          class="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:bg-white focus:border-slate-300 focus:outline-none transition"
        />
      </div>

      <div class="w-48">
        <select v-model="selectedCity" class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 outline-none focus:bg-white focus:border-slate-300 transition">
          <option v-for="city in availableCities" :key="city" :value="city">{{ city }}</option>
        </select>
      </div>
    </div>

    <!-- Yükleniyor Durumu -->
    <div v-if="loading" class="text-center py-24 text-slate-400 text-sm">
      Loading hotels...
    </div>

    <!-- Tablo Alanı -->
    <div v-else class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      
      <div v-if="filteredHotels.length === 0" class="text-center py-16 text-slate-400 text-sm">
        No hotels found matching your criteria.
      </div>

      <table v-else class="w-full text-left border-collapse">
        <thead>
          <tr class="border-b border-slate-100 text-[11px] font-semibold text-slate-400 uppercase tracking-wider bg-slate-50/50">
            <th class="py-4 px-6">Hotel Name</th>
            <th class="py-4 px-6">City</th>
            <th class="py-4 px-6">Address</th>
            <th class="py-4 px-6">Rating</th>
            <th class="py-4 px-6">Description</th>
            <th class="py-4 px-6 text-right">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100 text-sm text-slate-700">
          <template v-for="hotel in filteredHotels" :key="hotel.id">
            
            <!-- Normal Satır Görünümü (Rating sadece okunabilir olarak gösterilir) -->
            <tr v-if="editingHotelId !== hotel.id" class="hover:bg-slate-50/50 transition">
              <td class="py-4 px-6 font-semibold text-slate-900 flex items-center space-x-3">
                <img v-if="hotel.imageUrl" :src="hotel.imageUrl" alt="Hotel" class="w-9 h-9 rounded-lg object-cover flex-shrink-0" />
                <div v-else class="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-xs flex-shrink-0">
                  {{ hotel.name.substring(0, 2).toUpperCase() }}
                </div>
                <span>{{ hotel.name }}</span>
              </td>
              <td class="py-4 px-6 text-slate-600">{{ hotel.city }}</td>
              <td class="py-4 px-6 text-slate-600 truncate max-w-xs">{{ hotel.address }}</td>
              <td class="py-4 px-6">
                <span class="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
                  <Icon name="lucide:star" class="w-3.5 h-3.5 fill-current" />
                  <span>{{ hotel.rating }}</span>
                </span>
              </td>
              <td class="py-4 px-6 text-slate-500 truncate max-w-xs">{{ hotel.description || '-' }}</td>
              <td class="py-4 px-6 text-right space-x-2">
                <button @click="startEditing(hotel); showAddHotelForm = false" class="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition" title="Edit hotel">
                  <Icon name="lucide:pencil" class="w-4 h-4" />
                </button>
                <button @click="confirmDelete(hotel)" class="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition" title="Delete hotel">
                  <Icon name="lucide:trash-2" class="w-4 h-4" />
                </button>
              </td>
            </tr>

            <!-- Satır İçi Düzenleme (Inline Edit) Görünümü - Rating alanı kaldırıldı -->
            <tr v-else class="bg-slate-50/80">
              <td class="py-4 px-6 space-y-2">
                <input v-model="editHotelForm.name" type="text" placeholder="Hotel Name" class="w-full p-1.5 bg-white border border-slate-300 rounded-lg text-sm font-semibold text-slate-900 focus:outline-none" />
                <input v-model="editHotelForm.imageUrl" type="text" placeholder="Image URL" class="w-full p-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-600 focus:outline-none" />
              </td>
              <td class="py-4 px-6">
                <input v-model="editHotelForm.city" type="text" placeholder="City" class="w-28 p-1.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-700 focus:outline-none" />
              </td>
              <td class="py-4 px-6">
                <input v-model="editHotelForm.address" type="text" placeholder="Address" class="w-full p-1.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-700 focus:outline-none" />
              </td>
              <td class="py-4 px-6 text-slate-400 text-xs italic">
                System rating
              </td>
              <td class="py-4 px-6">
                <input v-model="editHotelForm.description" type="text" placeholder="Description" class="w-full p-1.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-700 focus:outline-none" />
              </td>
              <td class="py-4 px-6 text-right space-x-1">
                <button @click="updateHotel(hotel.id)" :disabled="updatingHotel" class="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-medium transition shadow-sm disabled:opacity-50">
                  {{ updatingHotel ? 'Saving...' : 'Save' }}
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
    <div v-if="hotelToDelete" class="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div class="bg-white rounded-2xl border border-slate-200 p-6 max-w-sm w-full shadow-2xl">
        <h3 class="font-bold text-slate-900 text-base mb-2">Delete Hotel</h3>
        <p class="text-xs text-slate-500 mb-6">Are you sure you want to delete <span class="font-semibold text-slate-800">{{ hotelToDelete.name }}</span>? This action cannot be undone.</p>
        
        <div class="flex items-center justify-end space-x-3">
          <button @click="hotelToDelete = null" class="px-4 py-2.5 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-100 transition">
            Cancel
          </button>
          <button @click="deleteHotel" class="px-4 py-2.5 rounded-xl text-xs font-medium bg-rose-600 hover:bg-rose-700 text-white transition shadow-sm">
            Delete
          </button>
        </div>
      </div>
    </div>

  </div>
</template>