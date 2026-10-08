<script setup>
definePageMeta({
  layout: 'admin'
})

import { ref, computed, onMounted, watch } from 'vue'
const config = useRuntimeConfig()

const loading = ref(false)
const logFiles = ref([])
const selectedFile = ref('')
const logLines = ref([])

const searchQuery = ref('')
const selectedLevel = ref('All')

const getAuthToken = () => {
  return localStorage.getItem('token') || localStorage.getItem('jwt') || localStorage.getItem('accessToken') || ''
}

// 1. Log Dosyalarını Çek
const fetchLogFiles = async () => {
  try {
    const token = getAuthToken()
    const response = await $fetch(`${config.public.apiBase}/api/Logs`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    logFiles.value = response || []
    if (logFiles.value.length > 0 && !selectedFile.value) {
      selectedFile.value = logFiles.value[0].name
    }
  } catch (error) {
    console.error('Log dosyaları alınamadı:', error)
  }
}

// 2. Seçilen Dosyanın İçeriğini Çek
const fetchLogContent = async (fileName) => {
  if (!fileName) return
  try {
    loading.value = true
    const token = getAuthToken()
    const response = await $fetch(`${config.public.apiBase}/api/Logs/${fileName}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    logLines.value = response || []
  } catch (error) {
    console.error('Log içeriği okunamadı:', error)
    logLines.value = []
  } finally {
    loading.value = false
  }
}

watch(selectedFile, (newFile) => {
  if (newFile) fetchLogContent(newFile)
})

// Filtreleme
const filteredLogs = computed(() => {
  return logLines.value.filter(log => {
    const matchesSearch = log.text.toLowerCase().includes(searchQuery.value.toLowerCase()) || log.time.includes(searchQuery.value)
    const matchesLevel = selectedLevel.value === 'All' || log.level === selectedLevel.value
    return matchesSearch && matchesLevel
  })
})

onMounted(() => {
  fetchLogFiles()
})
</script>

<template>
  <div class="w-full pb-12">
    
    <!-- Başlık Alanı -->
    <div class="mb-8 flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-slate-900">System logs & diagnostics</h1>
        <p class="text-sm text-slate-500 mt-1">Inspect backend text logs, server events, and database query traces.</p>
      </div>
      <div class="flex items-center space-x-2">
        <span class="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
          <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>Server Active</span>
        </span>
      </div>
    </div>

    <!-- Ana Terminal Layout (Genişlik kaplayacak şekilde düzeltildi) -->
    <div class="grid grid-cols-1 lg:grid-cols-4 gap-6">
      
      <!-- Sol Sidebar: Log Dosyaları Listesi -->
      <div class="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm h-fit">
        <h3 class="font-bold text-slate-900 text-sm px-2 mb-3 uppercase tracking-wider text-[11px] text-slate-400">Log Files</h3>
        
        <div v-if="logFiles.length === 0" class="text-xs text-slate-400 px-2 py-4">
          No log files found.
        </div>

        <div v-else class="space-y-1">
          <button 
            v-for="file in logFiles" 
            :key="file.name"
            @click="selectedFile = file.name"
            class="w-full text-left px-3 py-2.5 rounded-xl text-xs font-mono transition flex items-center justify-between group"
            :class="selectedFile === file.name ? 'bg-slate-900 text-white font-semibold shadow-sm' : 'text-slate-600 hover:bg-slate-100'"
          >
            <div class="flex items-center space-x-2 truncate">
              <Icon name="lucide:file-text" class="w-4 h-4 flex-shrink-0" :class="selectedFile === file.name ? 'text-amber-400' : 'text-slate-400'" />
              <span class="truncate">{{ file.name }}</span>
            </div>
            <span class="text-[10px]" :class="selectedFile === file.name ? 'text-slate-400' : 'text-slate-400'">{{ file.size }}</span>
          </button>
        </div>
      </div>

      <!-- Sağ Taraf: Log Terminal Görüntüleyicisi -->
      <div class="lg:col-span-3 bg-slate-900 rounded-2xl border border-slate-800 shadow-xl overflow-hidden flex flex-col">
        
        <!-- Terminal Üst Araç Çubuğu -->
        <div class="p-4 bg-slate-950 border-b border-slate-800 flex flex-wrap items-center justify-between gap-4">
          
          <div class="flex items-center space-x-2">
            <div class="flex space-x-1.5 mr-2">
              <div class="w-3 h-3 rounded-full bg-rose-500"></div>
              <div class="w-3 h-3 rounded-full bg-amber-500"></div>
              <div class="w-3 h-3 rounded-full bg-emerald-500"></div>
            </div>
            <span class="text-xs font-mono text-slate-400 bg-slate-900 px-3 py-1 rounded-lg border border-slate-800">
              {{ selectedFile || 'Select a file' }}
            </span>
          </div>

          <!-- Arama ve Filtreleme -->
          <div class="flex items-center space-x-3">
            <div class="relative">
              <Icon name="lucide:search" class="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
              <input 
                v-model="searchQuery"
                type="text" 
                placeholder="Search logs..." 
                class="w-48 pl-9 pr-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-slate-500 transition"
              />
            </div>

            <select v-model="selectedLevel" class="bg-slate-900 border border-slate-700 text-xs font-mono text-slate-300 rounded-lg px-2.5 py-1.5 focus:outline-none">
              <option value="All">LEVEL: ALL</option>
              <option value="INF">INF (Info)</option>
              <option value="WRN">WRN (Warning)</option>
              <option value="ERR">ERR (Error)</option>
            </select>
          </div>

        </div>

        <!-- Terminal İçeriği -->
        <div class="p-6 font-mono text-xs overflow-x-auto min-h-[400px] max-h-[600px] space-y-2 select-text">
          
          <div v-if="loading" class="text-slate-500 text-center py-20">
            Loading log contents...
          </div>

          <div v-else-if="filteredLogs.length === 0" class="text-slate-500 text-center py-20">
            No matching log entries found.
          </div>

          <div v-for="log in filteredLogs" :key="log.id" class="flex items-start space-x-3 hover:bg-slate-800/50 p-1 rounded transition">
            <span class="text-slate-500 select-none w-8 text-right">{{ log.id }}</span>
            <span class="text-slate-400 whitespace-nowrap">{{ log.time }}</span>
            <span 
              class="px-1.5 py-0.5 rounded text-[10px] font-bold uppercase"
              :class="log.level === 'INF' ? 'bg-sky-500/20 text-sky-400' : log.level === 'WRN' ? 'bg-amber-500/20 text-amber-400' : 'bg-rose-500/20 text-rose-400'"
            >
              [{{ log.level }}]
            </span>
            <span class="text-slate-200 break-all">{{ log.text }}</span>
          </div>

        </div>

        <!-- Terminal Alt Bilgi Çubuğu -->
        <div class="px-6 py-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-[11px] font-mono text-slate-500">
          <span>Showing {{ filteredLogs.length }} lines</span>
          <span class="text-emerald-400">UTF-8 / LF / Serilog Engine</span>
        </div>

      </div>

    </div>

  </div>
</template>