<script setup>
definePageMeta({
  layout: 'hotelowner'
})

import { ref, onMounted } from 'vue'
const config = useRuntimeConfig()

const loading = ref(true)
const profile = ref({
  id: '',
  username: '',
  email: '',
  role: '',
  balance: 0,
  createdAt: ''
})

// Profil Düzenleme State'leri
const isEditing = ref(false)
const editForm = ref({
  username: '',
  email: ''
})
const updating = ref(false)

// Şifre Değiştirme State'i
const passwordForm = ref({
  newPassword: '',
  confirmPassword: ''
})
const changingPassword = ref(false)

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

// Profil Bilgilerini Çekme (GET /api/Users/profile)
const fetchProfile = async () => {
  try {
    loading.value = true
    const token = getAuthToken()

    const response = await $fetch(`${config.public.apiBase}/api/Users/profile`, {
      headers: { Authorization: `Bearer ${token}` }
    })

    if (response) {
      profile.value = {
        id: response.id || response.Id || '',
        username: response.username || response.Username || '',
        email: response.email || response.Email || '',
        role: response.role || response.Role || '',
        balance: response.balance ?? response.Balance ?? 0,
        createdAt: response.createdAt || response.CreatedAt || ''
      }

      editForm.value.username = profile.value.username
      editForm.value.email = profile.value.email
    }
  } catch (error) {
    console.error('Profil yüklenirken hata:', error)
    showFeedback('Failed to load profile details.', 'error')
  } finally {
    loading.value = false
  }
}

// Profili Güncelleme (PUT /api/Users/profile)
const updateProfile = async () => {
  try {
    updating.value = true
    const token = getAuthToken()

    const payload = {
      username: editForm.value.username,
      email: editForm.value.email,
      password: null // Şifre değiştirilmiyor
    }

    await $fetch(`${config.public.apiBase}/api/Users/profile`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` },
      body: payload
    })

    showFeedback('Profile successfully updated.', 'success')
    isEditing.value = false
    fetchProfile()
  } catch (error) {
    console.error('Profil güncellenemedi:', error)
    const errMessage = error?.data?.message || 'An error occurred while updating profile.'
    showFeedback(errMessage, 'error')
  } finally {
    updating.value = false
  }
}

// Şifre Güncelleme (PUT /api/Users/profile kullanarak)
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
    changingPassword.value = true
    const token = getAuthToken()

    const payload = {
      username: profile.value.username,
      email: profile.value.email,
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
  } finally {
    changingPassword.value = false
  }
}

onMounted(() => {
  fetchProfile()
})
</script>

<template>
  <div class="max-w-5xl mx-auto pb-12">
    
    <!-- Başlık -->
    <div class="flex items-center justify-between mb-8">
      <div>
        <h1 class="text-2xl font-bold text-slate-900">My profile</h1>
        <p class="text-sm text-slate-500 mt-1">Manage your account details and security preferences.</p>
      </div>
      <button 
        @click="isEditing = !isEditing" 
        class="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2.5 rounded-xl text-sm font-medium flex items-center space-x-2 transition shadow-sm"
      >
        <Icon :name="isEditing ? 'lucide:x' : 'lucide:pencil'" class="w-4 h-4" />
        <span>{{ isEditing ? 'Cancel' : 'Edit profile' }}</span>
      </button>
    </div>

    <!-- Şık Bildirim Kutusu -->
    <div v-if="feedbackMessage.text" class="mb-6 p-4 rounded-xl text-sm font-medium flex items-center space-x-2" :class="feedbackMessage.type === 'error' ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'">
      <Icon :name="feedbackMessage.type === 'error' ? 'lucide:alert-circle' : 'lucide:check-circle'" class="w-5 h-5" />
      <span>{{ feedbackMessage.text }}</span>
    </div>

    <!-- Yükleniyor -->
    <div v-if="loading" class="text-center py-24 text-slate-400 text-sm">
      Loading profile...
    </div>

    <div v-else class="space-y-6">
      
      <!-- Profil Üst Kartı -->
      <div class="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6">
        <div class="flex items-center space-x-4">
          <div class="w-16 h-16 rounded-2xl bg-slate-900 text-white font-bold text-xl flex items-center justify-center shadow-inner">
            {{ profile.username ? profile.username.substring(0, 2).toUpperCase() : 'U' }}
          </div>
          <div>
            <h2 class="text-lg font-bold text-slate-900">{{ profile.username }}</h2>
            <p class="text-sm text-slate-500">{{ profile.email }}</p>
            <div class="flex items-center space-x-2 mt-2">
              <span class="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
                {{ profile.role }}
              </span>
              <span class="text-xs text-slate-400">
                Member since {{ profile.createdAt ? new Date(profile.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '-' }}
              </span>
            </div>
          </div>
        </div>

        <!-- Bakiye Kartı -->
        <div class="bg-slate-50 border border-slate-100 rounded-2xl p-4 text-right min-w-[160px]">
          <span class="text-xs font-semibold text-slate-400 block mb-1 uppercase tracking-wider">Account Balance</span>
          <span class="text-xl font-bold text-slate-900">₺{{ profile.balance.toLocaleString() }}</span>
        </div>
      </div>

      <!-- Bilgi Detayları / Düzenleme Alanı -->
      <div class="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <h3 class="font-bold text-slate-900 text-base mb-4">Personal information</h3>

        <!-- Görüntüleme Modu -->
        <div v-if="!isEditing" class="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
          <div>
            <span class="text-xs text-slate-400 block mb-1">Username</span>
            <span class="font-semibold text-slate-800">{{ profile.username }}</span>
          </div>
          <div>
            <span class="text-xs text-slate-400 block mb-1">Email address</span>
            <span class="font-semibold text-slate-800">{{ profile.email }}</span>
          </div>
          <div>
            <span class="text-xs text-slate-400 block mb-1">Role</span>
            <span class="font-semibold text-slate-800">{{ profile.role }}</span>
          </div>
          <div>
            <span class="text-xs text-slate-400 block mb-1">User ID</span>
            <span class="font-mono text-xs text-slate-600 bg-slate-50 px-2 py-1 rounded">{{ profile.id }}</span>
          </div>
        </div>

        <!-- Düzenleme Modu (PUT /api/Users/profile) -->
        <div v-else class="space-y-4">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-semibold text-slate-600 mb-1">Username</label>
              <input v-model="editForm.username" type="text" class="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:border-slate-400 transition" />
            </div>
            <div>
              <label class="block text-xs font-semibold text-slate-600 mb-1">Email address</label>
              <input v-model="editForm.email" type="email" class="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:border-slate-400 transition" />
            </div>
          </div>

          <div class="flex justify-end space-x-3 pt-4 border-t border-slate-100">
            <button @click="isEditing = false" class="px-4 py-2.5 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-100 transition">
              Cancel
            </button>
            <button @click="updateProfile" :disabled="updating" class="bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-xl text-xs font-medium transition shadow-sm disabled:opacity-50">
              {{ updating ? 'Saving...' : 'Save changes' }}
            </button>
          </div>
        </div>

      </div>

      <!-- Şifre Değiştirme Kartı -->
      <div class="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <h3 class="font-bold text-slate-900 text-base mb-1">Change password</h3>
        <p class="text-xs text-slate-500 mb-6">Enter your new password below twice to update it.</p>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div>
            <label class="block text-xs font-semibold text-slate-600 mb-1">New password</label>
            <input v-model="passwordForm.newPassword" type="password" placeholder="••••••••" class="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:border-slate-400 transition" />
          </div>
          <div>
            <label class="block text-xs font-semibold text-slate-600 mb-1">Confirm new password</label>
            <input v-model="passwordForm.confirmPassword" type="password" placeholder="••••••••" class="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:border-slate-400 transition" />
          </div>
        </div>

        <div class="flex justify-end">
          <button @click="updatePassword" :disabled="changingPassword" class="bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-xl text-xs font-medium transition shadow-sm disabled:opacity-50">
            {{ changingPassword ? 'Updating password...' : 'Update password' }}
          </button>
        </div>
      </div>

    </div>

  </div>
</template>