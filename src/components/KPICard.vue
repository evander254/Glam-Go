<script setup lang="ts">
import { LucideIcon } from 'lucide-vue-next'

defineProps<{
  title: string
  value: string | number
  icon: LucideIcon
  trend?: {
    value: string
    isUp: boolean
  }
}>()
</script>

<template>
  <div class="rounded-2xl border border-border bg-card p-6 shadow-sm transition-all hover:border-primary/20 hover:shadow-md dark:bg-[#111111]">
    <div class="flex items-center justify-between">
      <div>
        <p class="text-xs font-bold uppercase tracking-wider text-muted-foreground">{{ title }}</p>
        <h3 class="mt-2 text-3xl font-bold tracking-tight text-foreground">{{ value }}</h3>
        
        <div v-if="trend" class="mt-3 flex items-center gap-1.5">
          <span 
            :class="[
              'text-xs font-medium',
              trend.isUp ? 'text-emerald-500' : 'text-rose-500'
            ]"
          >
            {{ trend.isUp ? '↑' : '↓' }} {{ trend.value }}
          </span>
          <span class="text-[10px] text-muted-foreground">vs last month</span>
        </div>
      </div>
      
      <div class="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
        <component :is="icon" class="h-6 w-6" />
      </div>
    </div>
  </div>
</template>
