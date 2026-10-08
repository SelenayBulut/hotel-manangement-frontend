<script setup>
definePageMeta({
  layout: 'admin'
})

import { ref, onMounted } from 'vue'
const config = useRuntimeConfig()

const loading = ref(true)
const savingPersonal = ref(false)
const savingPassword = ref(false)
const feedbackMessage = ref({ text: '', type: '' })

// Profil State'leri
const profile = ref({
  id: '',
  username: '',
  email: '',
  role: 'Administrator',
  status: 'Active',
  registrationDate: 'October 7, 2026'
})

// Şifre State'leri
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

// Profili Çekme (GET /api/Users/profile)
const fetchProfile = async () => {
  try {
    loading.value = true
    const token = getAuthToken()
    const response = await $fetch(`${config.public.apiBase}/api/Users/profile`, {
      headers: { Authorization: `Bearer ${token}` }
    })

    if (response) {
      profile.value = {
        id: response.id || response.Id || 'ADM-0001',
        username: response.username || response.Username || 'Selenay Bulut',
        email: response.email || response.Email || 'selenay@gmail.com',
        role: response.role || response.Role || 'Administrator',
        status: response.status || response.Status || 'Active',
        registrationDate: response.createdAt ? new Date(response.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'October 7, 2026'
      }
    }
  } catch (error) {
    console.error('Profil yüklenirken hata:', error)
    showFeedback('Failed to load profile details.', 'error')
  } finally {
    loading.value = false
  }
}

// Kişisel Bilgileri Güncelleme (PUT /api/Users/profile)
const updatePersonal = async () => {
  if (!profile.value.username || !profile.value.email) {
    showFeedback('Full name and email cannot be empty.', 'error')
    return
  }

  try {
    savingPersonal.value = true
    const token = getAuthToken()

    await $fetch(`${config.public.apiBase}/api/Users/profile`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` },
      body: {
        username: profile.value.username,
        email: profile.value.email
      }
    })

    showFeedback('Personal information successfully updated.', 'success')
  } catch (error) {
    console.error('Kişisel bilgiler güncellenemedi:', error)
    showFeedback('An error occurred while updating profile.', 'error')
  } finally {
    savingPersonal.value = false
  }
}

// Şifre Güncelleme (PUT /api/Users/profile)
const updatePassword = async () => {
  if (!passwordForm.value.newPassword || passwordForm.value.newPassword.length < 6) {
    showFeedback('Password must be at least 6 characters.', 'error')
    return
  }

  if (passwordForm.value.newPassword !== passwordForm.value.confirmPassword) {
    showFeedback('Passwords do not match.', 'error')
    return
  }

  try {
    savingPassword.value = true
    const token = getAuthToken()

    await $fetch(`${config.public.apiBase}/api/Users/profile`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` },
      body: {
        username: profile.value.username,
        email: profile.value.email,
        password: passwordForm.value.newPassword
      }
    })

    showFeedback('Password successfully updated.', 'success')
    passwordForm.value.newPassword = ''
    passwordForm.value.confirmPassword = ''
  } catch (error) {
    console.error('Şifre güncellenemedi:', error)
    showFeedback('An error occurred while updating password.', 'error')
  } finally {
    savingPassword.value = false
  }
}

onMounted(() => {
  fetchProfile()
})
</script>

<template>
  <div class="max-w-6xl mx-auto pb-12">
    
    <!-- Başlık -->
    <div class="mb-8">
      <h1 class="text-2xl font-bold text-slate-900">My profile</h1>
      <p class="text-sm text-slate-500 mt-1">Manage your personal details, security, and account preferences.</p>
    </div>

    <!-- Bildirim Kutusu -->
    <div v-if="feedbackMessage.text" class="mb-6 p-4 rounded-xl text-sm font-medium flex items-center space-x-2" :class="feedbackMessage.type === 'error' ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'">
      <Icon :name="feedbackMessage.type === 'error' ? 'lucide:alert-circle' : 'lucide:check-circle'" class="w-5 h-5" />
      <span>{{ feedbackMessage.text }}</span>
    </div>

    <!-- Yükleniyor Durumu -->
    <div v-if="loading" class="text-center py-24 text-slate-400 text-sm">
      Loading profile...
    </div>

    <!-- Profil İçeriği -->
    <div v-else class="space-y-6">
      
      <!-- Üst Özet Kartı -->
      <div class="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex items-center space-x-4">
        <div class="w-14 h-14 rounded-2xl bg-slate-900 text-white font-bold text-lg flex items-center justify-center shadow-md">
          {{ profile.username ? profile.username.substring(0, 2).toUpperCase() : 'SB' }}
        </div>
        <div>
          <h2 class="text-lg font-bold text-slate-900">{{ profile.username }}</h2>
          <p class="text-sm text-slate-500">{{ profile.email }}</p>
          <div class="flex items-center space-x-2 mt-1">
            <span class="text-xs font-medium text-amber-600 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
              {{ profile.role }}
            </span>
            <span class="text-xs text-slate-400">Member since {{ profile.registrationDate }}</span>
          </div>
        </div>
      </div>

      <!-- Orta Alan: Kişisel Bilgiler (Sol) ve Hesap Bilgileri (Sağ) -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        <!-- Sol: Personal Information (2 Sütun Kaplar) -->
        <div class="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h3 class="font-bold text-slate-900 text-base mb-1">Personal information</h3>
            <p class="text-xs text-slate-500 mb-6">Your personal account details.</p>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <div>
                <label class="block text-xs font-semibold text-slate-600 mb-2">Full Name</label>
                <input 
                  v-model="profile.username" 
                  type="text" 
                  class="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:bg-white focus:border-slate-300 focus:outline-none transition"
                />
              </div>

              <div>
                <label class="block text-xs font-semibold text-slate-600 mb-2">Email address</label>
                <input 
                  v-model="profile.email" 
                  type="email" 
                  class="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:bg-white focus:border-slate-300 focus:outline-none transition"
                />
              </div>

              <div>
                <label class="block text-xs font-semibold text-slate-600 mb-2">Account Role</label>
                <input 
                  v-model="profile.role" 
                  type="text" 
                  disabled
                  class="w-full px-4 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-sm text-slate-500 cursor-not-allowed"
                />
              </div>

              <div>
                <label class="block text-xs font-semibold text-slate-600 mb-2">Registration Date</label>
                <input 
                  v-model="profile.registrationDate" 
                  type="text" 
                  disabled
                  class="w-full px-4 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-sm text-slate-500 cursor-not-allowed"
                />
              </div>
            </div>
          </div>

          <div class="flex justify-end pt-4 border-t border-slate-100">
            <button 
              @click="updatePersonal"
              :disabled="savingPersonal"
              class="bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-xl text-xs font-semibold transition shadow-sm disabled:opacity-50"
            >
              {{ savingPersonal ? 'Saving...' : 'Save Personal Info' }}
            </button>
          </div>
        </div>

        <!-- Sağ: Account Information (1 Sütun Kaplar) -->
        <div class="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h3 class="font-bold text-slate-900 text-base mb-1">Account Information</h3>
            <p class="text-xs text-slate-500 mb-6">System account details.</p>

            <div class="space-y-4 text-sm">
              <div class="flex items-center justify-between py-2.5 border-b border-slate-100">
                <span class="text-xs text-slate-500">User ID</span>
                <span class="font-mono text-xs text-slate-800 truncate max-w-[140px]">{{ profile.id }}</span>
              </div>

              <div class="flex items-center justify-between py-2.5 border-b border-slate-100">
                <span class="text-xs text-slate-500">Account Status</span>
                <span class="inline-flex items-center space-x-1.5 text-emerald-600 font-medium text-xs">
                  <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  <span>{{ profile.status }}</span>
                </span>
              </div>

              <div class="flex items-center justify-between py-2.5">
                <span class="text-xs text-slate-500">Access Level</span>
                <span class="font-semibold text-amber-600 text-xs">Full Admin</span>
              </div>
            </div>
          </div>

          <div class="pt-6 border-t border-slate-100 text-center">
            <span class="text-[11px] text-slate-400">Hotelio Security Node v2.6</span>
          </div>
        </div>

      </div>

      <!-- Alt Alan: Security (Şifre Değiştirme) -->
      <div class="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <h3 class="font-bold text-slate-900 text-base mb-1">Security</h3>
        <p class="text-xs text-slate-500 mb-6">Update your password securely.</p>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div>
            <label class="block text-xs font-semibold text-slate-600 mb-2">New password</label>
            <input 
              v-model="passwordForm.newPassword" 
              type="password" 
              placeholder="At least 6 characters" 
              class="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:bg-white focus:border-slate-300 focus:outline-none transition"
            />
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-600 mb-2">Confirm new password</label>
            <input 
              v-model="passwordForm.confirmPassword" 
              type="password" 
              placeholder="Re-enter new password" 
              class="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:bg-white focus:border-slate-300 focus:outline-none transition"
            />
          </div>
        </div>

        <div class="flex justify-end pt-4 border-t border-slate-100">
          <button 
            @click="updatePassword"
            :disabled="savingPassword"
            class="bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-xl text-xs font-semibold transition shadow-sm disabled:opacity-50"
          >
            {{ savingPassword ? 'Updating...' : 'Update password' }}
          </button>
        </div>
      </div>

    </div>

  </div>
</template>