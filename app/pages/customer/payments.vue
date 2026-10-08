<script setup>
definePageMeta({
  layout: 'customer'
})

import { ref, computed, onMounted } from 'vue'
const config = useRuntimeConfig()

const loading = ref(true)
const payments = ref([])
const userBalance = ref(0)

const getAuthToken = () => {
  return localStorage.getItem('token') || localStorage.getItem('jwt') || localStorage.getItem('accessToken') || ''
}

// Token içerisindeki verileri okuyup GUID formatındaki ID'yi otomatik bulan akıllı fonksiyon
const getUserIdFromToken = (token) => {
  try {
    const base64Url = token.split('.')[1]
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
    }).join(''))
    const parsed = JSON.parse(jsonPayload)
    
    // GUID regex deseni (Örn: 808D656F-CC9F-4213-846E-A3245C5FD17B)
    const guidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

    // 1. Önce bilinen yaygın anahtarları dene
    const directMatch = parsed.sub || 
                        parsed['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'] || 
                        parsed.id || 
                        parsed.Id || 
                        parsed.userId || 
                        parsed.UserId

    if (directMatch && guidRegex.test(directMatch)) {
      return directMatch
    }

    // 2. Bulunamadıysa token içindeki tüm alanları tarayıp GUID olanı yakala
    for (const key in parsed) {
      if (guidRegex.test(parsed[key])) {
        return parsed[key]
      }
    }

    return null
  } catch (e) {
    console.error('Token decode error:', e)
    return null
  }
}

// Kullanıcı bakiyesini ve ödeme geçmişini çekme
const fetchData = async () => {
  try {
    loading.value = true
    const token = getAuthToken()
    
    // LocalStorage veya Token üzerinden kullanıcı ID'sini al
    let userId = localStorage.getItem('userId') || localStorage.getItem('id')

    if (!userId) {
      try {
        const storedUser = JSON.parse(localStorage.getItem('user') || '{}')
        userId = storedUser.id || storedUser.Id
      } catch (e) {}
    }

    if (!userId) {
      userId = getUserIdFromToken(token)
    }

    // 1. Ödeme geçmişini çek
    const paymentsRes = await $fetch(`${config.public.apiBase}/api/Payments/my-payments`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    if (paymentsRes) {
      payments.value = paymentsRes
    }

    // 2. Kullanıcı bakiyesini /api/Users/{id} adresinden çek
    if (userId) {
      const userRes = await $fetch(`${config.public.apiBase}/api/Users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (userRes) {
        userBalance.value = userRes.balance || userRes.Balance || 0
      }
    } else {
      console.warn('User ID could not be found.')
    }
  } catch (error) {
    console.error('Error loading payments or user data:', error)
  } finally {
    loading.value = false
  }
}

// Toplam İade Tutarı (Refund türündekiler)
const totalRefunded = computed(() => {
  return payments.value
    .filter(p => (p.transactionType || p.TransactionType) === 'Refund')
    .reduce((sum, p) => sum + (p.amount || p.Amount || 0), 0)
})

// Toplam Ceza Tutarı (Penalty türündekiler)
const totalPenalty = computed(() => {
  return payments.value
    .filter(p => (p.transactionType || p.TransactionType) === 'Penalty')
    .reduce((sum, p) => sum + (p.amount || p.Amount || 0), 0)
})

onMounted(() => {
  fetchData()
})
</script>

<template>
  <div class="max-w-7xl mx-auto pb-12">
    
    <!-- Sayfa Başlığı -->
    <div class="mb-8">
      <h1 class="text-2xl font-bold text-slate-900">Payments</h1>
      <p class="text-sm text-slate-500 mt-1">Track your transactions, invoices, and refunds.</p>
    </div>

    <!-- Üst Özet Kartları -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      
      <!-- Balance Kartı -->
      <div class="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
        <div>
          <span class="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">Account Balance</span>
          <h2 class="text-3xl font-bold text-slate-900">₺{{ userBalance.toLocaleString() }}</h2>
          <span class="text-xs text-blue-600 font-medium mt-1 inline-block">Available wallet balance</span>
        </div>
        <div class="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-700">
          <Icon name="lucide:wallet" class="w-6 h-6" />
        </div>
      </div>

      <!-- Refunded Kartı -->
      <div class="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
        <div>
          <span class="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">Refunded</span>
          <h2 class="text-3xl font-bold text-slate-900">₺{{ totalRefunded.toLocaleString() }}</h2>
          <span class="text-xs text-amber-600 font-medium mt-1 inline-block">Processed refunds</span>
        </div>
        <div class="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center text-amber-700">
          <Icon name="lucide:trending-up" class="w-6 h-6" />
        </div>
      </div>

      <!-- Penalty Kartı -->
      <div class="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
        <div>
          <span class="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">Penalty</span>
          <h2 class="text-3xl font-bold text-slate-900">₺{{ totalPenalty.toLocaleString() }}</h2>
          <span class="text-xs text-rose-600 font-medium mt-1 inline-block">Penalty fees applied</span>
        </div>
        <div class="w-12 h-12 rounded-xl bg-rose-50 flex items-center justify-center text-rose-700">
          <Icon name="lucide:alert-circle" class="w-6 h-6" />
        </div>
      </div>

    </div>

    <!-- Transaction History Bölümü -->
    <div class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      
      <div class="p-6 border-b border-slate-100 flex items-center justify-between">
        <div>
          <h3 class="font-bold text-slate-900 text-base">Transaction history</h3>
          <p class="text-xs text-slate-500 mt-0.5">All payments and refunds</p>
        </div>
      </div>

      <div v-if="loading" class="text-center py-16 text-slate-400 text-sm">
        Loading transactions...
      </div>

      <div v-else-if="payments.length === 0" class="text-center py-16 text-slate-400 text-sm">
        No payment records found.
      </div>

      <div v-else class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="border-b border-slate-100 text-xs font-semibold text-slate-400 uppercase tracking-wider bg-slate-50/50">
              <th class="py-4 px-6">Payment ID</th>
              <th class="py-4 px-6">Reservation</th>
              <th class="py-4 px-6">Amount</th>
              <th class="py-4 px-6">Type</th>
              <th class="py-4 px-6">Status</th>
              <th class="py-4 px-6">Date</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 text-sm text-slate-700">
            <tr v-for="pay in payments" :key="pay.id || pay.Id" class="hover:bg-slate-50/50 transition">
              <td class="py-4 px-6 font-medium text-slate-900">
                PAY-{{ (pay.id || pay.Id).slice(0, 4).toUpperCase() }}
              </td>
              <td class="py-4 px-6 text-slate-500">
                RES-{{ (pay.reservationId || pay.ReservationId).slice(0, 4).toUpperCase() }}
              </td>
              <td class="py-4 px-6 font-semibold text-slate-900">
                ₺{{ pay.amount || pay.Amount }}
              </td>
              <td class="py-4 px-6">
                <span class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium"
                  :class="{
                    'bg-emerald-50 text-emerald-700': (pay.transactionType || pay.TransactionType) === 'Payment',
                    'bg-amber-50 text-amber-700': (pay.transactionType || pay.TransactionType) === 'Refund',
                    'bg-rose-50 text-rose-700': (pay.transactionType || pay.TransactionType) === 'Penalty'
                  }">
                  {{ pay.transactionType || pay.TransactionType }}
                </span>
              </td>
              <td class="py-4 px-6">
                <span class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                  <span class="w-1.5 h-1.5 rounded-full mr-1.5 bg-slate-500"></span>
                  {{ pay.status || pay.Status }}
                </span>
              </td>
              <td class="py-4 px-6 text-slate-500 text-xs">
                {{ new Date(pay.createdAt || pay.CreatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

    </div>

  </div>
</template>