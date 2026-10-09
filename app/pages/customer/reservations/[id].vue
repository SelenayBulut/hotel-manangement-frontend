<script setup>
definePageMeta({
  layout: 'customer'
})

import { ref, onMounted } from 'vue'
const route = useRoute()
const config = useRuntimeConfig()

const loading = ref(true)
const reservation = ref(null)
const isEditing = ref(false)

const feedbackMessage = ref({ text: '', type: '' })

const editForm = ref({
  guestCount: 1,
  checkInDate: '',
  checkOutDate: ''
})

const roomCapacity = ref(4)

const showFeedback = (text, type = 'success') => {
  feedbackMessage.value = { text, type }
  setTimeout(() => {
    feedbackMessage.value.text = ''
  }, 4000)
}

const getAuthToken = () => {
  return localStorage.getItem('token') || localStorage.getItem('jwt') || localStorage.getItem('accessToken') || ''
}

const fetchReservationDetail = async () => {
  try {
    loading.value = true
    const reservationId = route.params.id
    const token = getAuthToken()

    // 1. Rezervasyon detayını çek
    const response = await $fetch(`${config.public.apiBase}/api/Reservations/${reservationId}`, {
      headers: { Authorization: `Bearer ${token}` }
    })

    if (response) {
      reservation.value = response
      editForm.value.guestCount = response.guestCount || response.GuestCount || 1
      editForm.value.checkInDate = (response.checkInDate || response.CheckInDate || '').slice(0, 16)
      editForm.value.checkOutDate = (response.checkOutDate || response.CheckOutDate || '').slice(0, 16)

      // 2. Odanın gerçek kapasitesini öğrenmek için /api/Rooms/{id} isteği atıyoruz
      const roomId = response.roomId || response.RoomId
      if (roomId) {
        try {
          const roomResponse = await $fetch(`${config.public.apiBase}/api/Rooms/${roomId}`, {
            headers: { Authorization: `Bearer ${token}` }
          })
          if (roomResponse) {
            roomCapacity.value = roomResponse.capacity ?? roomResponse.Capacity ?? roomResponse.data?.capacity ?? 4
          }
        } catch (roomErr) {
          console.error('Failed to fetch room capacity:', roomErr)
        }
      }
    }
  } catch (error) {
    console.error('Error loading details:', error)
    showFeedback('Failed to load reservation details.', 'error')
  } finally {
    loading.value = false
  }
}

const isConfirmingCancel = ref(false)
const confirmCancel = () => {
  isConfirmingCancel.value = true
}

const cancelReservation = async () => {
  try {
    const reservationId = route.params.id
    const token = getAuthToken()

    await $fetch(`${config.public.apiBase}/api/Reservations/${reservationId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    })

    showFeedback('Reservation successfully cancelled.', 'success')
    setTimeout(() => {
      navigateTo('/customer/reservations')
    }, 1500)
  } catch (error) {
    console.error('Cancellation failed:', error)
    showFeedback('An error occurred while cancelling the reservation.', 'error')
    isConfirmingCancel.value = false
  }
}

const updateReservation = async () => {
  try {
    const reservationId = route.params.id
    const token = getAuthToken()

    const payload = {
      id: reservation.value.id || reservation.value.Id,
      roomId: reservation.value.roomId || reservation.value.RoomId,
      checkInDate: editForm.value.checkInDate,
      checkOutDate: editForm.value.checkOutDate,
      guestCount: Number(editForm.value.guestCount)
    }

    const res = await $fetch(`${config.public.apiBase}/api/Reservations/${reservationId}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` },
      body: payload
    })

    showFeedback('Reservation successfully updated.', 'success')
    isEditing.value = false
    fetchReservationDetail()
  } catch (error) {
    console.error('Update error details:', error)
    const errorMsg = error?.data?.message || 'An error occurred while updating. Please check your inputs or balance.'
    showFeedback(errorMsg, 'error')
  }
}

onMounted(() => {
  fetchReservationDetail()
})
</script>

<template>
  <div class="max-w-7xl mx-auto pb-12">
    
    <div class="mb-6">
      <NuxtLink to="/customer/reservations" class="text-sm font-medium text-slate-500 hover:text-slate-900 flex items-center space-x-1 transition">
        <Icon name="lucide:arrow-left" class="w-4 h-4 mr-1" />
        <span>Back to reservations</span>
      </NuxtLink>
    </div>

    <div v-if="feedbackMessage.text" class="mb-6 p-4 rounded-xl text-sm font-medium flex items-center space-x-2" :class="feedbackMessage.type === 'error' ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'">
      <Icon :name="feedbackMessage.type === 'error' ? 'lucide:alert-circle' : 'lucide:check-circle'" class="w-5 h-5" />
      <span>{{ feedbackMessage.text }}</span>
    </div>

    <div v-if="loading" class="text-center py-24 text-slate-400 text-sm">
      Loading reservation details...
    </div>

    <template v-else-if="reservation">
      
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <span class="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
            RESERVATION RES-{{ (reservation.id || reservation.Id).slice(0, 4).toUpperCase() }}
          </span>
          <h1 class="text-3xl font-bold text-slate-900">{{ reservation.hotelName || reservation.HotelName }}</h1>
          <p class="text-sm text-slate-500 mt-0.5">Room · {{ reservation.roomNumber || reservation.RoomNumber }}</p>
        </div>

        <div class="flex items-center space-x-3">
          <button @click="isEditing = !isEditing; isConfirmingCancel = false;" class="bg-white border border-slate-200 hover:bg-slate-50 text-slate-800 px-4 py-2.5 rounded-xl font-medium text-sm shadow-sm transition">
            {{ isEditing ? 'Cancel Editing' : 'Update reservation' }}
          </button>
          
          <button v-if="!isConfirmingCancel" @click="confirmCancel" class="bg-rose-700 hover:bg-rose-800 text-white px-4 py-2.5 rounded-xl font-medium text-sm shadow-sm transition">
            Cancel reservation
          </button>
        </div>
      </div>

      <div v-if="isConfirmingCancel" class="bg-rose-50 border border-rose-200 rounded-2xl p-5 mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div class="flex items-center space-x-3 text-rose-900">
          <Icon name="lucide:alert-triangle" class="w-6 h-6 text-rose-600 flex-shrink-0" />
          <p class="text-sm font-medium">Are you sure you want to cancel this reservation? This action cannot be undone.</p>
        </div>
        <div class="flex items-center space-x-2 flex-shrink-0">
          <button @click="cancelReservation" class="bg-rose-700 hover:bg-rose-800 text-white px-4 py-2 rounded-xl text-xs font-bold transition">
            Yes, Cancel
          </button>
          <button @click="isConfirmingCancel = false" class="bg-white border border-rose-300 hover:bg-rose-100 text-rose-800 px-4 py-2 rounded-xl text-xs font-bold transition">
            Dismiss
          </button>
        </div>
      </div>

      <!-- Update Form with Dynamic Room Capacity -->
      <div v-if="isEditing" class="bg-slate-50 border border-slate-200 rounded-2xl p-6 mb-6">
        <h3 class="font-bold text-slate-900 mb-4 text-base">Edit Reservation Details</h3>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label class="block text-xs font-semibold text-slate-600 mb-1">Check-in Date</label>
            <input v-model="editForm.checkInDate" type="datetime-local" class="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-amber-500" />
          </div>
          <div>
            <label class="block text-xs font-semibold text-slate-600 mb-1">Check-out Date</label>
            <input v-model="editForm.checkOutDate" type="datetime-local" class="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-amber-500" />
          </div>
          <div>
            <!-- Dinamik Oda Kapasitesi (roomCapacity değişkeni bağlandı) -->
            <label class="block text-xs font-semibold text-slate-600 mb-1">Guest Count (Max: {{ roomCapacity }})</label>
            <select v-model="editForm.guestCount" class="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-amber-500">
              <option v-for="n in roomCapacity" :key="n" :value="n">
                {{ n }} {{ n === 1 ? 'Guest' : 'Guests' }}
              </option>
            </select>
          </div>
        </div>
        <div class="flex justify-end">
          <button @click="updateReservation" class="bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition">
            Save Changes
          </button>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        <div class="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden p-6">
          
          <div class="bg-slate-50 border border-slate-100 rounded-xl p-4 flex items-center justify-between mb-6">
            <div class="flex items-center space-x-3">
              <div class="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center text-amber-700 font-bold">
                <Icon name="lucide:calendar" class="w-5 h-5" />
              </div>
              <div>
                <h3 class="font-semibold text-slate-900">
                  {{ new Date(reservation.checkInDate || reservation.CheckInDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) }} – 
                  {{ new Date(reservation.checkOutDate || reservation.CheckOutDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) }}
                </h3>
                <p class="text-xs text-slate-500">Confirmed stay duration</p>
              </div>
            </div>

            <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span class="w-1.5 h-1.5 rounded-full mr-1.5 bg-emerald-500"></span>
              {{ reservation.status || reservation.Status }}
            </span>

          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8 text-sm">
            <div>
              <span class="text-xs text-slate-400 block mb-1">Customer</span>
              <span class="font-semibold text-slate-800">{{ reservation.username || reservation.Username || 'User' }}</span>
            </div>

            <div>
              <span class="text-xs text-slate-400 block mb-1">Hotel</span>
              <span class="font-semibold text-slate-800">{{ reservation.hotelName || reservation.HotelName }}</span>
            </div>

            <div>
              <span class="text-xs text-slate-400 block mb-1">Room</span>
              <span class="font-semibold text-slate-800">Room {{ reservation.roomNumber || reservation.RoomNumber }}</span>
            </div>

            <div>
              <span class="text-xs text-slate-400 block mb-1">Guest count</span>
              <span class="font-semibold text-slate-800">{{ reservation.guestCount || reservation.GuestCount }} adults</span>
            </div>

            <div>
              <span class="text-xs text-slate-400 block mb-1">Check-in</span>
              <span class="font-semibold text-slate-800">{{ new Date(reservation.checkInDate || reservation.CheckInDate).toLocaleString() }}</span>
            </div>

            <div>
              <span class="text-xs text-slate-400 block mb-1">Check-out</span>
              <span class="font-semibold text-slate-800">{{ new Date(reservation.checkOutDate || reservation.CheckOutDate).toLocaleString() }}</span>
            </div>

            <div>
              <span class="text-xs text-slate-400 block mb-1">Total price</span>
              <span class="font-bold text-slate-900 text-base">₺{{ reservation.totalPrice || reservation.TotalPrice }}</span>
            </div>

            <div>
              <span class="text-xs text-slate-400 block mb-1">Created date</span>
              <span class="font-semibold text-slate-800">{{ new Date(reservation.createdAt || reservation.CreatedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) }}</span>
            </div>
          </div>

        </div>

        <div class="space-y-6">
          <div class="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <h3 class="font-bold text-slate-900 mb-4 text-base">Price summary</h3>
            
            <div class="flex justify-between text-sm text-slate-600 mb-2">
              <span>Stay total</span>
              <span class="font-medium text-slate-900">₺{{ reservation.totalPrice || reservation.TotalPrice }}</span>
            </div>
            <div class="flex justify-between text-sm text-slate-600 pb-4 border-b border-slate-100 mb-4">
              <span>Taxes and fees</span>
              <span class="font-medium text-emerald-600">Included</span>
            </div>

            <div class="flex justify-between font-bold text-slate-900 text-base mb-6">
              <span>Total price</span>
              <span>₺{{ reservation.totalPrice || reservation.TotalPrice }}</span>
            </div>

            <div class="bg-emerald-50 border border-emerald-100 text-emerald-800 text-xs font-medium px-3 py-2 rounded-xl mb-4 flex items-center space-x-2">
              <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>Payment completed successfully</span>
            </div>
          </div>
        </div>

      </div>

    </template>

    <div v-else class="text-center py-24 text-slate-400 text-sm">
      Reservation not found or has been deleted.
    </div>

  </div>
</template>