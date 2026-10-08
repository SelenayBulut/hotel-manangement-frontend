<template>
  <header class="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-slate-200 px-8 py-4 flex items-center justify-between">
    <div class="flex items-center space-x-4 flex-1 max-w-md">
      
    </div>

    <div class="flex items-center space-x-4">
      <div class="text-xs text-slate-500 flex items-center space-x-1">
        <span>Viewing as</span>
        <span class="font-semibold text-slate-800">Hotel Owner</span>
        
      </div>
      
      <div class="w-9 h-9 rounded-full bg-slate-900 text-white font-bold text-sm flex items-center justify-center">
        {{ user.initials }}
      </div>
    </div>
  </header>
</template>

<script setup>
defineProps({
  user: {
    type: Object,
    required: true
  }
})
</script>