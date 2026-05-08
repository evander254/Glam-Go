<script setup lang="ts">
import { Search, Bell, User } from 'lucide-vue-next'
import { Input } from '@/components/ui/input/index'

defineProps<{
  userName: string
}>()
</script>

<template>
  <header class="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-border bg-background/80 px-8 backdrop-blur-md dark:bg-[#0a0a0a]/80">
    <div class="flex items-center gap-4">
      <div class="relative w-64">
        <Search class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input 
          type="text" 
          placeholder="Search..." 
          class="h-9 w-full rounded-full border-border bg-secondary/30 pl-10 focus-visible:ring-primary/20"
        />
      </div>
    </div>

    <div class="flex items-center gap-6">
      <button class="relative rounded-full p-2 text-muted-foreground hover:bg-secondary/50 hover:text-foreground transition-all">
        <Bell class="h-5 w-5" />
        <span class="absolute right-2 top-2 h-2 w-2 rounded-full bg-primary border-2 border-background"></span>
      </button>
      
      <div class="flex items-center gap-3 border-l border-border pl-6">
        <div class="text-right hidden sm:block">
          <p class="text-sm font-semibold text-foreground">{{ userName }}</p>
          <p class="text-[10px] uppercase tracking-wider text-muted-foreground">Administrator</p>
        </div>
        <div class="h-9 w-9 rounded-full bg-gradient-to-tr from-primary/20 to-accent/20 border border-primary/20 flex items-center justify-center text-primary">
          <User class="h-5 w-5" />
        </div>
      </div>
    </div>
  </header>
</template>
