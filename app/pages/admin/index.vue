<script setup>
definePageMeta({
  layout: 'admin'
})

import { ref, computed, onMounted } from 'vue'
const config = useRuntimeConfig()

const loading = ref(true)
const usersList = ref([])
const hotelsList = ref([])
const roomsList = ref([])
const reservationsList = ref([])

const getAuthToken = () => {
  return localStorage.getItem('token') || localStorage.getItem('jwt') || localStorage.getItem('accessToken') || ''
}

const fetchAdminData = async () => {
  try {
    loading.value = true
    const token = getAuthToken()
    const headers = { Authorization: `Bearer ${token}` }

    const [usersRes, hotelsRes, roomsRes, reservationsRes] = await Promise.all([
      $fetch(`${config.public.apiBase}/api/Users`, { headers }).catch(() => []),
      $fetch(`${config.public.apiBase}/api/Hotels`, { headers }).catch(() => []),
      $fetch(`${config.public.apiBase}/api/Rooms`, { headers }).catch(() => []),
      $fetch(`${config.public.apiBase}/api/Reservations`, { headers }).catch(() => [])
    ])

    usersList.value = usersRes || []
    hotelsList.value = hotelsRes || []
    roomsList.value = roomsRes || []
    reservationsList.value = reservationsRes || []

  } catch (error) {
    console.error('Admin verileri yüklenirken hata:', error)
  } finally {
    loading.value = false
  }
}

const totalUsers = computed(() => usersList.value.length)
const totalHotels = computed(() => hotelsList.value.length)
const totalRooms = computed(() => roomsList.value.length)
const totalReservations = computed(() => reservationsList.value.length)

const totalRevenue = computed(() => {
  const sum = reservationsList.value.reduce((acc, curr) => acc + (curr.totalPrice || curr.TotalPrice || 0), 0)
  return `₺${sum.toLocaleString()}`
})

const roleDistribution = computed(() => {
  let customer = 0
  let hotelOwner = 0
  let admin = 0

  usersList.value.forEach(u => {
    const role = (u.role || u.Role || '').toLowerCase()
    if (role.includes('customer')) customer++
    else if (role.includes('owner')) hotelOwner++
    else if (role.includes('admin')) admin++
  })

  return { customer, hotelOwner, admin }
})

const chartBars = computed(() => {
  const list = reservationsList.value
  
  if (!list.length) {
    return Array(7).fill(0).map((_, i) => {
      const d = new Date()
      d.setDate(d.getDate() - (6 - i))
      return {
        date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        count: 0,
        height: 15
      }
    })
  }

  const daysMap = {}
  const today = new Date()
  
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(today.getDate() - i)
    const dateKey = d.toISOString().split('T')[0]
    daysMap[dateKey] = {
      dateObj: d,
      count: 0
    }
  }

  list.forEach(res => {
    const rawDate = res.createdAt || res.CreatedAt || res.date || res.Date
    if (rawDate) {
      const parsedDate = new Date(rawDate)
      if (!isNaN(parsedDate.getTime())) {
        const dateKey = parsedDate.toISOString().split('T')[0]
        if (daysMap[dateKey]) {
          daysMap[dateKey].count++
        }
      }
    }
  })

  const values = Object.values(daysMap)
  const counts = values.map(v => v.count)
  const max = Math.max(...counts, 1)

  return values.map(item => {
    const height = Math.max(Math.round((item.count / max) * 100), 15)
    return {
      date: item.dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      count: item.count,
      height: height
    }
  })
})

const recentUsers = computed(() => {
  if (!Array.isArray(usersList.value)) return []
  
  return [...usersList.value]
    .sort((a, b) => {
      const dateA = new Date(a.createdAt || a.CreatedAt || 0)
      const dateB = new Date(b.createdAt || b.CreatedAt || 0)
      return dateB - dateA
    })
    .slice(0, 5)
    .map(u => ({
      id: u?.id || u?.Id || '-',
      name: u?.username || u?.Username || 'User',
      email: u?.email || u?.Email || '',
      role: u?.role || u?.Role || 'Customer',
      status: 'Active',
      created: (u?.createdAt || u?.CreatedAt) ? new Date(u.createdAt || u.CreatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '-'
    }))
})

onMounted(() => {
  fetchAdminData()
})
</script>

<template>
  <div class="max-w-7xl mx-auto pb-12">
    
    <div class="mb-8">
      <span class="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">System Overview</span>
      <h1 class="text-2xl font-bold text-slate-900">Administration dashboard</h1>
      <p class="text-sm text-slate-500 mt-0.5">Monitor platform activity and manage core operations.</p>
    </div>

    <div v-if="loading" class="text-center py-24 text-slate-400 text-sm">
      Loading administration statistics...
    </div>

    <template v-else>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        
        <div class="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div class="flex items-center justify-between mb-4">
            <span class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total users</span>
            <div class="w-9 h-9 rounded-xl bg-slate-50 flex items-center justify-center text-slate-600">
              <Icon name="lucide:users" class="w-4 h-4" />
            </div>
          </div>
          <div class="text-2xl font-bold text-slate-900 mb-1.5">{{ totalUsers.toLocaleString() }}</div>
          <div class="text-xs text-emerald-600 font-medium flex items-center space-x-1">
            <Icon name="lucide:trending-up" class="w-3.5 h-3.5" />
            <span>Active database records</span>
          </div>
        </div>

        <div class="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div class="flex items-center justify-between mb-4">
            <span class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total hotels</span>
            <div class="w-9 h-9 rounded-xl bg-slate-50 flex items-center justify-center text-slate-600">
              <Icon name="lucide:building-2" class="w-4 h-4" />
            </div>
          </div>
          <div class="text-2xl font-bold text-slate-900 mb-1.5">{{ totalHotels }}</div>
          <div class="text-xs text-slate-400 font-medium flex items-center space-x-1">
            <Icon name="lucide:check-circle" class="w-3.5 h-3.5" />
            <span>Verified properties</span>
          </div>
        </div>

        <div class="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div class="flex items-center justify-between mb-4">
            <span class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total rooms</span>
            <div class="w-9 h-9 rounded-xl bg-slate-50 flex items-center justify-center text-slate-600">
              <Icon name="lucide:door-open" class="w-4 h-4" />
            </div>
          </div>
          <div class="text-2xl font-bold text-slate-900 mb-1.5">{{ totalRooms.toLocaleString() }}</div>
          <div class="text-xs text-emerald-600 font-medium flex items-center space-x-1">
            <Icon name="lucide:trending-up" class="w-3.5 h-3.5" />
            <span>Registered inventory</span>
          </div>
        </div>

        <div class="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div class="flex items-center justify-between mb-4">
            <span class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total revenue</span>
            <div class="w-9 h-9 rounded-xl bg-slate-50 flex items-center justify-center text-slate-600">
              <Icon name="lucide:dollar-sign" class="w-4 h-4" />
            </div>
          </div>
          <div class="text-2xl font-bold text-slate-900 mb-1.5">{{ totalRevenue }}</div>
          <div class="text-xs text-emerald-600 font-medium flex items-center space-x-1">
            <Icon name="lucide:trending-up" class="w-3.5 h-3.5" />
            <span>{{ totalReservations }} total bookings</span>
          </div>
        </div>

      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        
        <!-- Platform Activity (Günlük Dinamik Grafik) -->
        <div class="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between">
          <div class="flex items-center justify-between mb-6">
            <div>
              <h3 class="font-bold text-slate-900 text-base">Platform activity</h3>
              <p class="text-xs text-slate-500">Last 7 days reservation tracking</p>
            </div>
            <div class="flex items-center space-x-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl text-xs font-medium text-slate-700">
              <span>Last 7 Days</span>
              <Icon name="lucide:calendar" class="w-3.5 h-3.5 text-slate-400" />
            </div>
          </div>

          <div class="flex items-center space-x-3 mb-6">
            <span class="text-2xl font-bold text-slate-900">{{ totalReservations }}</span>
            <span class="px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700">Live data</span>
          </div>

          <div>
            <div class="h-44 flex items-end justify-between gap-3 pt-4 border-t border-slate-100">
              <div 
                v-for="(bar, index) in chartBars" 
                :key="index"
                class="w-full h-full flex flex-col justify-end items-center group relative"
              >
                <span class="absolute -top-8 opacity-0 group-hover:opacity-100 transition bg-slate-900 text-white text-[10px] px-1.5 py-0.5 rounded z-10">
                  {{ bar.count }}
                </span>
                <div 
                  class="w-full bg-amber-400 hover:bg-amber-600 transition rounded-t-lg"
                  :style="{ height: `${bar.height}%` }"
                ></div>
              </div>
            </div>
            
            <div class="flex justify-between gap-3 mt-2 text-[11px] text-slate-400 font-medium text-center">
              <span v-for="(bar, index) in chartBars" :key="index" class="w-full">
                {{ bar.date }}
              </span>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h3 class="font-bold text-slate-900 text-base mb-1">User distribution</h3>
            <p class="text-xs text-slate-500 mb-6">By account role</p>
          </div>

          <div class="space-y-6">
            <div>
              <div class="flex justify-between text-xs font-semibold text-slate-700 mb-2">
                <span>Customers</span>
                <span>{{ roleDistribution.customer }}</span>
              </div>
              <div class="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div class="bg-slate-900 h-full rounded-full" :style="`width: ${totalUsers ? (roleDistribution.customer / totalUsers) * 100 : 0}%;`"></div>
              </div>
            </div>

            <div>
              <div class="flex justify-between text-xs font-semibold text-slate-700 mb-2">
                <span>Hotel owners</span>
                <span>{{ roleDistribution.hotelOwner }}</span>
              </div>
              <div class="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div class="bg-slate-700 h-full rounded-full" :style="`width: ${totalUsers ? (roleDistribution.hotelOwner / totalUsers) * 100 : 0}%;`"></div>
              </div>
            </div>

            <div>
              <div class="flex justify-between text-xs font-semibold text-slate-700 mb-2">
                <span>Administrators</span>
                <span>{{ roleDistribution.admin }}</span>
              </div>
              <div class="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div class="bg-slate-400 h-full rounded-full" :style="`width: ${totalUsers ? (roleDistribution.admin / totalUsers) * 100 : 0}%;`"></div>
              </div>
            </div>
          </div>

          <div class="pt-4 mt-4 border-t border-slate-100 text-[11px] text-slate-400 text-right">
            Updated live from database
          </div>
        </div>

      </div>

      <!-- Recent User Registrations -->
      <div class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        
        <div class="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 class="font-bold text-slate-900 text-base">Recent user registrations</h3>
            <p class="text-xs text-slate-500">Newest accounts across the platform</p>
          </div>
          <NuxtLink to="/admin/users" class="text-xs font-semibold text-slate-900 hover:underline flex items-center space-x-1">
            <span>Manage users</span>
            <Icon name="lucide:chevron-right" class="w-3.5 h-3.5" />
          </NuxtLink>
        </div>

        <div v-if="!recentUsers || recentUsers.length === 0" class="text-center py-12 text-slate-400 text-sm">
          No users found.
        </div>

        <table v-else class="w-full text-left border-collapse">
          <thead>
            <tr class="border-b border-slate-100 text-[11px] font-semibold text-slate-400 uppercase tracking-wider bg-slate-50/50">
              <th class="py-4 px-6">User ID</th>
              <th class="py-4 px-6">Full Name</th>
              <th class="py-4 px-6">Email</th>
              <th class="py-4 px-6">Role</th>
              <th class="py-4 px-6">Status</th>
              <th class="py-4 px-6 text-right">Created</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 text-sm text-slate-700">
            <tr v-for="user in recentUsers" :key="user.id" class="hover:bg-slate-50/50 transition">
              
              <td class="py-4 px-6 font-mono text-xs font-semibold text-slate-900 truncate max-w-[120px]">
                {{ user.id }}
              </td>

              <td class="py-4 px-6 font-semibold text-slate-900 flex items-center space-x-3">
                <div class="w-7 h-7 rounded-lg bg-slate-900 text-white font-bold text-xs flex items-center justify-center flex-shrink-0">
                  {{ user.name.substring(0, 2).toUpperCase() }}
                </div>
                <span>{{ user.name }}</span>
              </td>

              <td class="py-4 px-6 text-slate-600">
                {{ user.email }}
              </td>

              <td class="py-4 px-6">
                <span class="px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                  {{ user.role }}
                </span>
              </td>

              <td class="py-4 px-6">
                <span class="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700">
                  <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  <span>{{ user.status }}</span>
                </span>
              </td>

              <td class="py-4 px-6 text-slate-500 text-xs text-right">
                {{ user.created }}
              </td>

            </tr>
          </tbody>
        </table>

      </div>
    </template>

  </div>
</template>