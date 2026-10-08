<script setup>
definePageMeta({
  layout: 'admin'
})

import { ref, computed, onMounted } from 'vue'
const config = useRuntimeConfig()

const loading = ref(true)
const paymentsList = ref([])

// Filtreleme State'leri
const searchQuery = ref('')
const selectedStatus = ref('All statuses')
const selectedType = ref('All types')

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

// Ödemeleri Çekme (GET /api/Payments)[cite: 12]
const fetchPayments = async () => {
  try {
    loading.value = true
    const token = getAuthToken()
    const response = await $fetch(`${config.public.apiBase}/api/Payments`, {
      headers: { Authorization: `Bearer ${token}` }
    })

    if (response) {
      paymentsList.value = response.map(p => ({
        id: p.id || p.Id,
        userId: p.userId || p.UserId || '',
        reservationId: p.reservationId || p.ReservationId || '',
        amount: p.amount ?? p.Amount ?? 0,
        transactionType: p.transactionType || p.TransactionType || 'Payment',
        status: p.status || p.Status || 'Success',
        createdAt: p.createdAt || p.CreatedAt || ''
      }))
    }
  } catch (error) {
    console.error('Ödemeler yüklenirken hata:', error)
    showFeedback('Failed to load payments.', 'error')
  } finally {
    loading.value = false
  }
}

// Filtreleme Mantığı
const filteredPayments = computed(() => {
  return paymentsList.value.filter(payment => {
    const matchesSearch = 
      payment.id.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      payment.userId.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      payment.reservationId.toLowerCase().includes(searchQuery.value.toLowerCase())

    const matchesStatus = selectedStatus.value === 'All statuses' || payment.status.toLowerCase() === selectedStatus.value.toLowerCase()
    const matchesType = selectedType.value === 'All types' || payment.transactionType.toLowerCase() === selectedType.value.toLowerCase()

    return matchesSearch && matchesStatus && matchesType
  })
})

onMounted(() => {
  fetchPayments()
})
</script>

<template>
  <div class="max-w-7xl mx-auto pb-12">
    
    <!-- Başlık Alanı -->
    <div class="mb-8">
      <h1 class="text-2xl font-bold text-slate-900">Payment management</h1>
      <p class="text-sm text-slate-500 mt-1">Monitor financial transactions, refunds, and penalties across the platform.</p>
    </div>

    <!-- Bildirim Kutusu -->
    <div v-if="feedbackMessage.text" class="mb-6 p-4 rounded-xl text-sm font-medium flex items-center space-x-2" :class="feedbackMessage.type === 'error' ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'">
      <Icon :name="feedbackMessage.type === 'error' ? 'lucide:alert-circle' : 'lucide:check-circle'" class="w-5 h-5" />
      <span>{{ feedbackMessage.text }}</span>
    </div>

    <!-- Filtreleme Çubuğu -->
    <div class="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm mb-6 flex flex-wrap items-center gap-4">
      
      <div class="relative flex-1 min-w-[240px]">
        <Icon name="lucide:search" class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input 
          v-model="searchQuery"
          type="text" 
          placeholder="Search by Payment ID, User ID or Reservation ID" 
          class="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:bg-white focus:border-slate-300 focus:outline-none transition"
        />
      </div>

      <div class="w-48">
        <select v-model="selectedType" class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 outline-none focus:bg-white focus:border-slate-300 transition">
          <option value="All types">All types</option>
          <option value="Payment">Payment</option>
          <option value="Refund">Refund</option>
          <option value="Penalty">Penalty</option>
        </select>
      </div>

      <div class="w-44">
        <select v-model="selectedStatus" class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 outline-none focus:bg-white focus:border-slate-300 transition">
          <option value="All statuses">All statuses</option>
          <option value="Success">Success</option>
          <option value="Refunded">Refunded</option>
          <option value="Failed">Failed</option>
        </select>
      </div>

    </div>

    <!-- Yükleniyor Durumu -->
    <div v-if="loading" class="text-center py-24 text-slate-400 text-sm">
      Loading payments...
    </div>

    <!-- Ödemeler Tablosu -->
    <div v-else class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      
      <div v-if="filteredPayments.length === 0" class="text-center py-16 text-slate-400 text-sm">
        No payment records found matching your criteria.
      </div>

      <table v-else class="w-full text-left border-collapse">
        <thead>
          <tr class="border-b border-slate-100 text-[11px] font-semibold text-slate-400 uppercase tracking-wider bg-slate-50/50">
            <th class="py-4 px-6">Transaction ID</th>
            <th class="py-4 px-6">User ID</th>
            <th class="py-4 px-6">Reservation ID</th>
            <th class="py-4 px-6">Type</th>
            <th class="py-4 px-6">Amount</th>
            <th class="py-4 px-6">Date</th>
            <th class="py-4 px-6 text-right">Status</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100 text-sm text-slate-700">
          <tr v-for="payment in filteredPayments" :key="payment.id" class="hover:bg-slate-50/50 transition">
            
            <td class="py-4 px-6 font-mono text-xs font-semibold text-slate-900 truncate max-w-[130px]">
              {{ payment.id }}
            </td>

            <td class="py-4 px-6 font-mono text-xs text-slate-500 truncate max-w-[120px]">
              {{ payment.userId }}
            </td>

            <td class="py-4 px-6 font-mono text-xs text-slate-500 truncate max-w-[120px]">
              {{ payment.reservationId }}
            </td>

            <td class="py-4 px-6 font-medium">
              <span 
                class="px-2.5 py-1 rounded-full text-xs font-medium"
                :class="payment.transactionType === 'Payment' ? 'bg-emerald-50 text-emerald-700' : payment.transactionType === 'Refund' ? 'bg-blue-50 text-blue-700' : 'bg-amber-50 text-amber-700'"
              >
                {{ payment.transactionType }}
              </span>
            </td>

            <td class="py-4 px-6 font-bold text-slate-900">
              ₺{{ payment.amount.toLocaleString() }}
            </td>

            <td class="py-4 px-6 text-slate-500 text-xs">
              {{ payment.createdAt ? new Date(payment.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '-' }}
            </td>

            <td class="py-4 px-6 text-right">
              <span 
                class="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-medium"
                :class="payment.status.toLowerCase() === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'"
              >
                <span class="w-1.5 h-1.5 rounded-full" :class="payment.status.toLowerCase() === 'success' ? 'bg-emerald-500' : 'bg-rose-500'"></span>
                <span>{{ payment.status }}</span>
              </span>
            </td>

          </tr>
        </tbody>
      </table>

    </div>

  </div>
</template>