<script setup>
definePageMeta({
  layout: 'customer'
})

import { ref, onMounted } from 'vue'
const config = useRuntimeConfig()

const loading = ref(true)
const user = ref(null)
const feedbackMessage = ref({ text: '', type: '' })

// Kişisel bilgiler formu
const profileForm = ref({
  username: '',
  email: ''
})

// Şifre formu
const passwordForm = ref({
  newPassword: '',
  confirmPassword: ''
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

const getUserId = () => {
  let userId = localStorage.getItem('userId') || localStorage.getItem('id')
  if (!userId) {
    try {
      const storedUser = JSON.parse(localStorage.getItem('user') || '{}')
      userId = storedUser.id || storedUser.Id
    } catch (e) {}
  }

  if (!userId) {
    try {
      const token = getAuthToken()
      if (token) {
        const base64Url = token.split('.')[1]
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
        }).join(''))
        const parsed = JSON.parse(jsonPayload)
        
        const guidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
        userId = parsed.sub || parsed['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'] || parsed.id || parsed.Id || parsed.userId || parsed.UserId

        if (!userId || !guidRegex.test(userId)) {
          for (const key in parsed) {
            if (guidRegex.test(parsed[key])) {
              userId = parsed[key]
              break
            }
          }
        }
      }
    } catch (e) {}
  }
  return userId
}

const fetchUserProfile = async () => {
  try {
    loading.value = true
    const token = getAuthToken()
    const userId = getUserId()

    if (!userId) {
      loading.value = false
      return
    }

    const response = await $fetch(`${config.public.apiBase}/api/Users/${userId}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    if (response) {
      user.value = response
      profileForm.value.username = response.username || response.Username || ''
      profileForm.value.email = response.email || response.Email || ''
    }
  } catch (error) {
    console.error('Error loading profile:', error)
  } finally {
    loading.value = false
  }
}

// Kişisel Bilgileri Güncelleme (/api/Users/profile kullanarak)
const updateProfileDetails = async () => {
  try {
    const token = getAuthToken()

    const payload = {
      username: profileForm.value.username,
      email: profileForm.value.email,
      password: null // Şifre değiştirilmiyor
    }

    await $fetch(`${config.public.apiBase}/api/Users/profile`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` },
      body: payload
    })

    showFeedback('Personal information successfully updated.', 'success')
    fetchUserProfile()
  } catch (error) {
    console.error('Profile update error:', error)
    showFeedback('Failed to update personal information.', 'error')
  }
}

// Şifre Güncelleme (/api/Users/profile kullanarak)
const updatePassword = async () => {
  if (passwordForm.value.newPassword !== passwordForm.value.confirmPassword) {
    showFeedback('New passwords do not match.', 'error')
    return
  }

  if (!passwordForm.value.newPassword || passwordForm.value.newPassword.length < 6) {
    showFeedback('Password must be at least 6 characters long.', 'error')
    return
  }

  try {
    const token = getAuthToken()

    const payload = {
      username: profileForm.value.username,
      email: profileForm.value.email,
      password: passwordForm.value.newPassword
    }

    await $fetch(`${config.public.apiBase}/api/Users/profile`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` },
      body: payload
    })

    showFeedback('Password successfully updated.', 'success')
    passwordForm.value.newPassword = ''
    passwordForm.value.confirmPassword = ''
  } catch (error) {
    console.error('Password update error:', error)
    showFeedback('Failed to update password.', 'error')
  }
}

onMounted(() => {
  fetchUserProfile()
})
</script>

<template>
  <div class="max-w-7xl mx-auto pb-12">
    
    <div class="mb-8">
      <h1 class="text-2xl font-bold text-slate-900">My profile</h1>
      <p class="text-sm text-slate-500 mt-1">Manage your personal details, security, and account preferences.</p>
    </div>

    <div v-if="feedbackMessage.text" class="mb-6 p-4 rounded-xl text-sm font-medium flex items-center space-x-2" :class="feedbackMessage.type === 'error' ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'">
      <Icon :name="feedbackMessage.type === 'error' ? 'lucide:alert-circle' : 'lucide:check-circle'" class="w-5 h-5" />
      <span>{{ feedbackMessage.text }}</span>
    </div>

    <div v-if="loading" class="text-center py-24 text-slate-400 text-sm">
      Loading profile...
    </div>

    <template v-else-if="user">
      
      <div class="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mb-8 flex items-center justify-between">
        <div class="flex items-center space-x-4">
          <div class="w-16 h-16 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xl">
            {{ (profileForm.username || 'U').slice(0, 2).toUpperCase() }}
          </div>
          <div>
            <h2 class="text-xl font-bold text-slate-900">{{ profileForm.username }}</h2>
            <p class="text-sm text-slate-500">{{ profileForm.email }}</p>
            <div class="flex items-center space-x-2 mt-2">
              <span class="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700">
                {{ user.role || user.Role }}
              </span>
              <span class="text-xs text-slate-400" v-if="user.createdAt || user.CreatedAt">
                Member since {{ new Date(user.createdAt || user.CreatedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        <div class="lg:col-span-2 space-y-8">
          
          <!-- Personal Information (Düzenlenebilir) -->
          <div class="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <h3 class="font-bold text-slate-900 text-base mb-1">Personal information</h3>
            <p class="text-xs text-slate-500 mb-6">Your personal account details.</p>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mb-6">
              <div>
                <label class="block text-xs font-semibold text-slate-600 mb-1">Full Name</label>
                <input v-model="profileForm.username" type="text" class="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:border-amber-500" />
              </div>

              <div>
                <label class="block text-xs font-semibold text-slate-600 mb-1">Email address</label>
                <input v-model="profileForm.email" type="text" class="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:border-amber-500" />
              </div>

              <div>
                <label class="block text-xs font-semibold text-slate-600 mb-1">Account Role</label>
                <input type="text" :value="user.role || user.Role" disabled class="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-500" />
              </div>

              <div>
                <label class="block text-xs font-semibold text-slate-600 mb-1">Registration Date</label>
                <input type="text" :value="user.createdAt || user.CreatedAt ? new Date(user.createdAt || user.CreatedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : '-'" disabled class="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-500" />
              </div>
            </div>

            <div class="flex justify-end">
              <button @click="updateProfileDetails" class="bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition">
                Save Personal Info
              </button>
            </div>
          </div>

          <!-- Security (Şifre Güncelleme) -->
          <div class="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <h3 class="font-bold text-slate-900 text-base mb-1">Security</h3>
            <p class="text-xs text-slate-500 mb-6">Update your password securely.</p>

            <div class="space-y-4 mb-6">
              <div>
                <label class="block text-xs font-semibold text-slate-600 mb-1">New password</label>
                <input v-model="passwordForm.newPassword" type="password" placeholder="At least 6 characters" class="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-amber-500" />
              </div>

              <div>
                <label class="block text-xs font-semibold text-slate-600 mb-1">Confirm new password</label>
                <input v-model="passwordForm.confirmPassword" type="password" placeholder="Re-enter new password" class="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-amber-500" />
              </div>
            </div>

            <div class="flex justify-end">
              <button @click="updatePassword" class="bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition">
                Update password
              </button>
            </div>
          </div>

        </div>

        <div class="space-y-6">
          <div class="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <h3 class="font-bold text-slate-900 text-base mb-4">Account information</h3>
            
            <div class="space-y-4 text-sm">
              <div class="flex justify-between pb-3 border-b border-slate-100">
                <span class="text-slate-500 text-xs">User ID</span>
                <span class="font-mono text-xs font-medium text-slate-800">{{ (user.id || user.Id || '').slice(0, 8) }}...</span>
              </div>
              <div class="flex justify-between pb-3 border-b border-slate-100">
                <span class="text-slate-500 text-xs">Account Status</span>
                <span class="text-emerald-600 font-medium text-xs">Active</span>
              </div>
              <div class="flex justify-between pb-3 border-b border-slate-100">
                <span class="text-slate-500 text-xs">Wallet Balance</span>
                <span class="font-bold text-slate-900 text-xs">₺{{ user.balance || user.Balance || 0 }}</span>
              </div>
            </div>
          </div>
        </div>

      </div>

    </template>

    <div v-else class="text-center py-24 text-slate-400 text-sm">
      Could not load profile data. Please check if you are logged in.
    </div>

  </div>
</template>