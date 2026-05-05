<script setup lang="ts">
import { ref, onMounted, watchEffect } from 'vue'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/composables/useAuth'
import { Button } from '@/components/ui/button/index'

type Booking = { 
  id: number 
  booking_date: string 
  booking_time: string 
  status: string 
  services: { name: string; price: number } | null 
}

type Order = { 
  id: number 
  total_amount: number 
  status: string 
  created_at: string 
}

const { user, loading } = useAuth()
const bookings = ref<Booking[]>([])
const orders = ref<Order[]>([])

watchEffect(async () => {
  if (!user.value) return
  
  // Fetch the public user ID (integer)
  const { data: publicUser } = await supabase
    .from('users')
    .select('id')
    .eq('email', user.value.email)
    .single()
    
  if (!publicUser) return

  const { data: bookingsData } = await supabase
    .from('bookings')
    .select('id,booking_date,booking_time,status,services(name,price)')
    .eq('user_id', publicUser.id)
    .order('booking_date', { ascending: false })
  
  if (bookingsData) {
    bookings.value = bookingsData as unknown as Booking[]
  }
  
  const { data: ordersData } = await supabase
    .from('orders')
    .select('*')
    .eq('user_id', publicUser.id)
    .order('created_at', { ascending: false })
  
  if (ordersData) {
    orders.value = ordersData as Order[]
  }
})

const getStatusBadgeClass = (status: string) => {
  if (status === 'completed') return 'bg-green-100 text-green-700'
  if (status === 'confirmed') return 'bg-blue-100 text-blue-700'
  return 'bg-amber-100 text-amber-700'
}
</script>

<template>
  <div v-if="!loading" class="container mx-auto max-w-3xl px-4 py-12">
    <div v-if="!user" class="max-w-md mx-auto text-center">
      <p class="text-muted-foreground">Please sign in to view your dashboard.</p>
      <router-link to="/auth">
        <Button class="mt-4">Sign in</Button>
      </router-link>
    </div>
    
    <template v-else>
      <h1 class="font-serif text-3xl font-bold">My Account</h1>
      <p class="mt-1 text-sm text-muted-foreground">{{ user.email }}</p>

      <section class="mt-8">
        <h2 class="font-serif text-xl font-semibold">My Bookings</h2>
        <div class="mt-3 space-y-2">
          <p v-if="bookings.length === 0" class="text-sm text-muted-foreground">No bookings yet.</p>
          <div 
            v-for="b in bookings" 
            :key="b.id" 
            class="flex items-center justify-between rounded-xl border border-border bg-card p-4"
          >
            <div>
              <p class="font-medium">{{ b.services?.name ?? "Service" }}</p>
              <p class="text-xs text-muted-foreground">{{ b.booking_date }} at {{ b.booking_time }}</p>
            </div>
            <span :class="['rounded-full px-3 py-1 text-xs font-medium', getStatusBadgeClass(b.status)]">
              {{ b.status }}
            </span>
          </div>
        </div>
      </section>

      <section class="mt-8">
        <h2 class="font-serif text-xl font-semibold">My Orders</h2>
        <div class="mt-3 space-y-2">
          <p v-if="orders.length === 0" class="text-sm text-muted-foreground">No orders yet.</p>
          <div 
            v-for="o in orders" 
            :key="o.id" 
            class="flex items-center justify-between rounded-xl border border-border bg-card p-4"
          >
            <div>
              <p class="font-medium">KES {{ o.total_amount }}</p>
              <p class="text-xs text-muted-foreground">{{ new Date(o.created_at).toLocaleDateString() }}</p>
            </div>
            <span :class="['rounded-full px-3 py-1 text-xs font-medium', getStatusBadgeClass(o.status)]">
              {{ o.status }}
            </span>
          </div>
        </div>
      </section>
    </template>
  </div>
</template>
