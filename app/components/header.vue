<template>
  <header class="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-slate-200 px-8 py-4 flex items-center justify-between">
    
    <!-- Sol: Arama Çubuğu -->
    <div class="flex items-center space-x-4 flex-1 max-w-md">
      <slot name="search">
        <!-- Eğer arama çubuğu özelleştirilmek istenirse slot kullanılabilir -->
      </slot>
    </div>

    <!-- Sağ: Rol, Bildirim ve Profil -->
    <div class="flex items-center space-x-4">
      
      <!-- Rol Göstergesi -->
      <div class="text-xs text-slate-500 flex items-center space-x-1">
        <span>Viewing as</span>
        <span class="font-semibold text-slate-800">{{ role }}</span>
      </div>

      <!-- Profil Avatarı ve Baş Harfler -->
      <div class="w-9 h-9 rounded-full bg-slate-900 text-white font-bold text-sm flex items-center justify-center shadow-sm">
        {{ initials }}
      </div>

    </div>
  </header>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  // Rol adı: 'Admin', 'Customer', 'Hotel Owner' vb.
  role: {
    type: String,
    required: true
  },
  
  user: {
    type: Object,
    default: () => ({ initials: 'AM' })
  }
})

const initials = computed(() => props.user?.initials || 'AM')
</script>