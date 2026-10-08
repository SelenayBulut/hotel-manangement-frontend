<template>
  <div class="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-white">
    <!-- Sol Taraf: Otel / Sahil Görseli -->
    <div class="hidden lg:block relative h-full">
      <img 
        src="https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80" 
        alt="Hotel View" 
        class="absolute inset-0 w-full h-full object-cover filter grayscale contrast-125"
      />
    </div>

    <!-- Sağ Taraf: Şifre Sıfırlama Formu -->
    <div class="flex flex-col justify-center px-8 sm:px-16 lg:px-24 py-12">
      <div class="max-w-md w-full mx-auto">
        <span class="text-xs font-bold tracking-widest text-amber-600 uppercase">HOTEL MANAGEMENT SYSTEM</span>
        <h2 class="text-3xl font-extrabold text-slate-900 mt-2 mb-1">Reset your password</h2>
        <p class="text-sm text-slate-500 mb-8">Enter your email and we'll send you reset instructions.</p>
        
        <!-- Başarı veya Hata Mesajı -->
        <div v-if="successMessage" class="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm rounded-lg">
          {{ successMessage }}
        </div>
        <div v-if="errorMessage" class="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg">
          {{ errorMessage }}
        </div>

        <form class="space-y-5" @submit.prevent="handleForgotPassword">
          <div>
            <label class="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">Email address</label>
            <input 
              type="email" 
              v-model="email"
              required
              placeholder="name@example.com" 
              class="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition"
            />
          </div>

          <button 
            type="submit" 
            :disabled="loading"
            class="w-full bg-[#0B132B] text-white py-3 rounded-lg font-medium hover:bg-slate-800 transition shadow-sm disabled:opacity-50"
          >
            {{ loading ? 'Sending reset link...' : 'Send reset link' }}
          </button>
        </form>

        <p class="text-sm text-center text-slate-600 mt-8">
          <NuxtLink to="/login" class="text-slate-900 font-semibold hover:underline">← Back to sign in</NuxtLink>
        </p>

        <p class="text-xs text-center text-slate-400 mt-6">
          By continuing, you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const email = ref('')
const successMessage = ref('')
const errorMessage = ref('')
const loading = ref(false)
const config = useRuntimeConfig()

const handleForgotPassword = async () => {
  errorMessage.value = ''
  successMessage.value = ''
  loading.value = true

  try {
    // Backend'de henüz endpoint yazmadıysan, burası hata verecektir.
    // Şimdilik test etmek için alt taraftaki geçici C# metodunu yazabilirsin.
    await $fetch(`${config.public.apiBase}/api/auth/forgot-password`, {
      method: 'POST',
      body: {
        Email: email.value
      }
    })

    successMessage.value = "Şifre sıfırlama talimatları e-posta adresinize gönderildi."
  } catch (error) {
    errorMessage.value = error.data?.message || "İşlem sırasında bir hata oluştu."
  } finally {
    loading.value = false
  }
}
</script>