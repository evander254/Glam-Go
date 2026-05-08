<script setup lang="ts">
import { 
  LayoutDashboard, 
  Calendar, 
  ShoppingBag, 
  Package, 
  Users, 
  MessageSquare, 
  Camera,
  LogOut
} from 'lucide-vue-next'

const props = defineProps<{
  activeTab: string
}>()

const emit = defineEmits(['update:activeTab'])

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'bookings', label: 'Bookings', icon: Calendar },
  { id: 'orders', label: 'Orders', icon: ShoppingBag },
  { id: 'products', label: 'Products', icon: Package },
  { id: 'users', label: 'Users', icon: Users },
  { id: 'testimonials', label: 'Testimonials', icon: MessageSquare },
  { id: 'portfolio', label: 'Portfolio', icon: Camera },
]
</script>

<template>
  <aside class="fixed left-0 top-0 z-40 h-screen w-64 -translate-x-full transition-transform sm:translate-x-0">
    <div class="h-full overflow-y-auto border-r border-border bg-card px-3 py-4 dark:bg-[#0a0a0a]">
      <div class="mb-10 flex items-center px-2">
        <span class="font-serif text-xl font-bold tracking-tight text-primary">Glam & Go</span>
      </div>
      
      <ul class="space-y-2 font-medium">
        <li v-for="item in navItems" :key="item.id">
          <button
            @click="emit('update:activeTab', item.id)"
            :class="[
              'flex w-full items-center rounded-xl p-3 text-sm transition-all duration-200 group',
              activeTab === item.id 
                ? 'bg-primary/10 text-primary shadow-sm shadow-primary/5' 
                : 'text-muted-foreground hover:bg-secondary/50 hover:text-foreground'
            ]"
          >
            <component 
              :is="item.icon" 
              :class="[
                'h-5 w-5 transition-colors',
                activeTab === item.id ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'
              ]"
            />
            <span class="ml-3">{{ item.label }}</span>
            <div 
              v-if="activeTab === item.id" 
              class="ml-auto h-1.5 w-1.5 rounded-full bg-primary"
            ></div>
          </button>
        </li>
      </ul>

      <div class="absolute bottom-4 left-0 w-full px-3">
        <button class="flex w-full items-center rounded-xl p-3 text-sm text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all">
          <LogOut class="h-5 w-5" />
          <span class="ml-3">Logout</span>
        </button>
      </div>
    </div>
  </aside>
</template>
