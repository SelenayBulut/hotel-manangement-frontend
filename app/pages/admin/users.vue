<script setup>
definePageMeta({
  layout: 'admin'
})

import { ref, computed, onMounted } from 'vue'
const config = useRuntimeConfig()

const loading = ref(true)
const usersList = ref([])

// Filtreleme State'leri
const searchQuery = ref('')
const selectedRole = ref('All roles')

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

// Add User Form State'i (POST /api/Users)
const showAddUserForm = ref(false)
const newUserForm = ref({
  username: '',
  email: '',
  password: '',
  role: 'Customer',
  balance: 0
})
const savingUser = ref(false)

// Satır İçi Düzenleme (Inline Edit) State'leri (PUT /api/Users/{id})
const editingUserId = ref(null)
const editUserForm = ref({
  username: '',
  email: '',
  password: '',
  role: '',
  balance: 0
})
const updatingUser = ref(false)

// Silme Onay Modalı State'i (DELETE /api/Users/{id})
const userToDelete = ref(null)

// Kullanıcıları Çekme (GET /api/Users)
const fetchUsers = async () => {
  try {
    loading.value = true
    const token = getAuthToken()
    const response = await $fetch(`${config.public.apiBase}/api/Users`, {
      headers: { Authorization: `Bearer ${token}` }
    })

    if (response) {
      usersList.value = response.map(u => ({
        id: u.id || u.Id,
        username: u.username || u.Username || '',
        email: u.email || u.Email || '',
        role: u.role || u.Role || 'Customer',
        balance: u.balance ?? u.Balance ?? 0,
        createdAt: u.createdAt || u.CreatedAt || ''
      }))
    }
  } catch (error) {
    console.error('Kullanıcılar yüklenirken hata:', error)
    showFeedback('Failed to load users.', 'error')
  } finally {
    loading.value = false
  }
}

// Yeni Kullanıcı Ekle (POST /api/Users)
const createUser = async () => {
  if (!newUserForm.value.username || !newUserForm.value.email || !newUserForm.value.password) {
    showFeedback('Please fill in username, email and password.', 'error')
    return
  }

  try {
    savingUser.value = true
    const token = getAuthToken()

    const payload = {
      username: newUserForm.value.username,
      email: newUserForm.value.email,
      password: newUserForm.value.password,
      role: newUserForm.value.role,
      balance: Number(newUserForm.value.balance)
    }

    await $fetch(`${config.public.apiBase}/api/Users`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: payload
    })

    showFeedback('User successfully created.', 'success')
    showAddUserForm.value = false
    newUserForm.value = { username: '', email: '', password: '', role: 'Customer', balance: 0 }
    fetchUsers()
  } catch (error) {
    console.error('Kullanıcı eklenemedi:', error)
    showFeedback('An error occurred while creating user.', 'error')
  } finally {
    savingUser.value = false
  }
}

// Düzenlemeyi Başlat
const startEditing = (user) => {
  editingUserId.value = user.id
  editUserForm.value = {
    username: user.username,
    email: user.email,
    password: '', // Şifre opsiyonel / boş bırakılabilir
    role: user.role,
    balance: user.balance
  }
}

const cancelEditing = () => {
  editingUserId.value = null
}

// Kullanıcı Güncelle (PUT /api/Users/{id})
const updateUser = async (userId) => {
  try {
    updatingUser.value = true
    const token = getAuthToken()

    const payload = {
      username: editUserForm.value.username,
      email: editUserForm.value.email,
      password: editUserForm.value.password ? editUserForm.value.password : null,
      role: editUserForm.value.role,
      balance: Number(editUserForm.value.balance)
    }

    await $fetch(`${config.public.apiBase}/api/Users/${userId}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` },
      body: payload
    })

    showFeedback('User successfully updated.', 'success')
    editingUserId.value = null
    fetchUsers()
  } catch (error) {
    console.error('Kullanıcı güncellenemedi:', error)
    showFeedback('An error occurred while updating user.', 'error')
  } finally {
    updatingUser.value = false
  }
}

// Kullanıcı Sil (DELETE /api/Users/{id})
const confirmDelete = (user) => {
  userToDelete.value = user
}

const deleteUser = async () => {
  if (!userToDelete.value) return
  const userId = userToDelete.value.id

  try {
    const token = getAuthToken()
    await $fetch(`${config.public.apiBase}/api/Users/${userId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    })
    usersList.value = usersList.value.filter(u => u.id !== userId)
    showFeedback('User successfully deleted.', 'success')
  } catch (error) {
    console.error('Kullanıcı silinemedi:', error)
    showFeedback('An error occurred while deleting user.', 'error')
  } finally {
    userToDelete.value = null
  }
}

// Filtreleme Mantığı
const filteredUsers = computed(() => {
  return usersList.value.filter(user => {
    const matchesSearch = 
      user.username.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      user.id.toLowerCase().includes(searchQuery.value.toLowerCase())

    const matchesRole = selectedRole.value === 'All roles' || user.role.toLowerCase() === selectedRole.value.toLowerCase()

    return matchesSearch && matchesRole
  })
})

onMounted(() => {
  fetchUsers()
})
</script>

<template>
  <div class="max-w-7xl mx-auto pb-12 relative">
    
    <!-- Başlık ve Add User Butonu -->
    <div class="flex items-center justify-between mb-8">
      <div>
        <h1 class="text-2xl font-bold text-slate-900">User management</h1>
        <p class="text-sm text-slate-500 mt-1">View, update, and control user access across the platform.</p>
      </div>
      <button @click="showAddUserForm = !showAddUserForm; editingUserId = null" class="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2.5 rounded-xl text-sm font-medium flex items-center space-x-2 transition shadow-sm">
        <Icon :name="showAddUserForm ? 'lucide:x' : 'lucide:plus'" class="w-4 h-4" />
        <span>{{ showAddUserForm ? 'Close form' : 'Add user' }}</span>
      </button>
    </div>

    <!-- Şık Bildirim Kutusu -->
    <div v-if="feedbackMessage.text" class="mb-6 p-4 rounded-xl text-sm font-medium flex items-center space-x-2" :class="feedbackMessage.type === 'error' ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'">
      <Icon :name="feedbackMessage.type === 'error' ? 'lucide:alert-circle' : 'lucide:check-circle'" class="w-5 h-5" />
      <span>{{ feedbackMessage.text }}</span>
    </div>

    <!-- Add User Paneli -->
    <transition
      enter-active-class="transform transition duration-300 ease-out"
      enter-from-class="-translate-y-4 opacity-0"
      enter-to-class="translate-y-0 opacity-100"
      leave-active-class="transform transition duration-200 ease-in"
      leave-from-class="translate-y-0 opacity-100"
      leave-to-class="-translate-y-4 opacity-0"
    >
      <div v-if="showAddUserForm" class="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm mb-6">
        <h3 class="font-bold text-slate-900 text-base mb-4">Add new user</h3>
        
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
          <div>
            <label class="block text-xs font-semibold text-slate-600 mb-1">Username</label>
            <input v-model="newUserForm.username" type="text" placeholder="e.g. alex_morgan" class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:bg-white focus:border-slate-300 focus:outline-none transition" />
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-600 mb-1">Email address</label>
            <input v-model="newUserForm.email" type="email" placeholder="e.g. alex@example.com" class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:bg-white focus:border-slate-300 focus:outline-none transition" />
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-600 mb-1">Password</label>
            <input v-model="newUserForm.password" type="password" placeholder="••••••••" class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:bg-white focus:border-slate-300 focus:outline-none transition" />
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-600 mb-1">Role</label>
            <select v-model="newUserForm.role" class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:bg-white focus:border-slate-300 focus:outline-none transition">
              <option value="Customer">Customer</option>
              <option value="HotelOwner">HotelOwner</option>
              <option value="Admin">Admin</option>
            </select>
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-600 mb-1">Balance (₺)</label>
            <input v-model.number="newUserForm.balance" type="number" class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:bg-white focus:border-slate-300 focus:outline-none transition" />
          </div>
        </div>

        <div class="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100">
          <button @click="showAddUserForm = false" class="px-4 py-2 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-100 transition">
            Cancel
          </button>
          <button @click="createUser" :disabled="savingUser" class="bg-slate-900 hover:bg-slate-800 text-white px-5 py-2 rounded-xl text-xs font-medium transition shadow-sm disabled:opacity-50">
            {{ savingUser ? 'Saving...' : 'Save User' }}
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
          placeholder="Search by name, email or ID" 
          class="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:bg-white focus:border-slate-300 focus:outline-none transition"
        />
      </div>

      <div class="w-48">
        <select v-model="selectedRole" class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 outline-none focus:bg-white focus:border-slate-300 transition">
          <option>All roles</option>
          <option value="Customer">Customer</option>
          <option value="HotelOwner">HotelOwner</option>
          <option value="Admin">Admin</option>
        </select>
      </div>
    </div>

    <!-- Yükleniyor -->
    <div v-if="loading" class="text-center py-24 text-slate-400 text-sm">
      Loading users...
    </div>

    <!-- Kullanıcılar Tablosu -->
    <div v-else class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      
      <div v-if="filteredUsers.length === 0" class="text-center py-16 text-slate-400 text-sm">
        No users found matching your criteria.
      </div>

      <table v-else class="w-full text-left border-collapse">
        <thead>
          <tr class="border-b border-slate-100 text-[11px] font-semibold text-slate-400 uppercase tracking-wider bg-slate-50/50">
            <th class="py-4 px-6">User ID</th>
            <th class="py-4 px-6">Full Name</th>
            <th class="py-4 px-6">Email</th>
            <th class="py-4 px-6">Role</th>
            <th class="py-4 px-6">Balance</th>
            <th class="py-4 px-6">Created</th>
            <th class="py-4 px-6 text-right">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100 text-sm text-slate-700">
          <template v-for="user in filteredUsers" :key="user.id">
            
            <!-- Normal Satır Görünümü -->
            <tr v-if="editingUserId !== user.id" class="hover:bg-slate-50/50 transition">
              <td class="py-4 px-6 font-mono text-xs font-semibold text-slate-900 truncate max-w-[120px]">
                {{ user.id }}
              </td>

              <td class="py-4 px-6 font-semibold text-slate-900 flex items-center space-x-3">
                <div class="w-7 h-7 rounded-lg bg-slate-900 text-white font-bold text-xs flex items-center justify-center flex-shrink-0">
                  {{ user.username ? user.username.substring(0, 2).toUpperCase() : 'U' }}
                </div>
                <span>{{ user.username }}</span>
              </td>

              <td class="py-4 px-6 text-slate-600">
                {{ user.email }}
              </td>

              <td class="py-4 px-6">
                <span class="px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                  {{ user.role }}
                </span>
              </td>

              <td class="py-4 px-6 font-bold text-slate-900">
                ₺{{ user.balance.toLocaleString() }}
              </td>

              <td class="py-4 px-6 text-slate-500 text-xs">
                {{ user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '-' }}
              </td>

              <td class="py-4 px-6 text-right space-x-1">
                <button @click="startEditing(user); showAddUserForm = false" class="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition" title="Edit user">
                  <Icon name="lucide:pencil" class="w-4 h-4" />
                </button>
                <button @click="confirmDelete(user)" class="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition" title="Delete user">
                  <Icon name="lucide:trash-2" class="w-4 h-4" />
                </button>
              </td>
            </tr>

            <!-- Satır İçi Düzenleme (Inline Edit) Görünümü -->
            <tr v-else class="bg-slate-50/80">
              <td class="py-4 px-6 font-mono text-xs text-slate-500">
                Editing...
              </td>
              <td class="py-4 px-6">
                <input v-model="editUserForm.username" type="text" class="w-full p-1.5 bg-white border border-slate-300 rounded-lg text-sm font-semibold text-slate-900 focus:outline-none" />
              </td>
              <td class="py-4 px-6">
                <input v-model="editUserForm.email" type="email" class="w-full p-1.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-700 focus:outline-none" />
              </td>
              <td class="py-4 px-6">
                <select v-model="editUserForm.role" class="p-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-700 focus:outline-none">
                  <option value="Customer">Customer</option>
                  <option value="HotelOwner">HotelOwner</option>
                  <option value="Admin">Admin</option>
                </select>
              </td>
              <td class="py-4 px-6">
                <input v-model.number="editUserForm.balance" type="number" class="w-24 p-1.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-700 focus:outline-none" />
              </td>
              <td class="py-4 px-6 text-xs text-slate-400">
                -
              </td>
              <td class="py-4 px-6 text-right space-x-1">
                <button @click="updateUser(user.id)" :disabled="updatingUser" class="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-medium transition shadow-sm disabled:opacity-50">
                  {{ updatingUser ? 'Saving...' : 'Save' }}
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
    <div v-if="userToDelete" class="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div class="bg-white rounded-2xl border border-slate-200 p-6 max-w-sm w-full shadow-2xl">
        <h3 class="font-bold text-slate-900 text-base mb-2">Delete User</h3>
        <p class="text-xs text-slate-500 mb-6">Are you sure you want to delete <span class="font-semibold text-slate-800">{{ userToDelete.username }}</span>? This action cannot be undone.</p>
        
        <div class="flex items-center justify-end space-x-3">
          <button @click="userToDelete = null" class="px-4 py-2.5 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-100 transition">
            Cancel
          </button>
          <button @click="deleteUser" class="px-4 py-2.5 rounded-xl text-xs font-medium bg-rose-600 hover:bg-rose-700 text-white transition shadow-sm">
            Delete
          </button>
        </div>
      </div>
    </div>

  </div>
</template>