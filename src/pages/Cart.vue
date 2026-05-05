<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useCartStore } from '@/stores/cart'
import { useAuth } from '@/composables/useAuth'
import { supabase } from '@/integrations/supabase/client'
import { Button } from '@/components/ui/button/index'
import { Trash2 } from 'lucide-vue-next'
import { toast } from 'vue-sonner'

const cart = useCartStore()
const { user } = useAuth()
const router = useRouter()
const busy = ref(false)

const checkout = async () => {
  if (!user.value) return router.push('/auth')
  if (cart.items.length === 0) return
  
  busy.value = true

  // Fetch the public user ID (integer)
  const { data: publicUser, error: userError } = await supabase
    .from('users')
    .select('id')
    .eq('email', user.value.email)
    .single()
    
  if (userError || !publicUser) {
    busy.value = false
    return toast.error('User profile not found. Please try logging in again.')
  }

  const { data: order, error } = await supabase
    .from('orders')
    .insert({ user_id: publicUser.id, total_amount: cart.total })
    .select()
    .single()
  
  if (error || !order) {
    busy.value = false
    return toast.error(error?.message ?? 'Failed to place order')
  }
  
  const { error: itemsErr } = await supabase.from('order_items').insert(
    cart.items.map((i) => ({ 
      order_id: order.id, 
      product_id: Number(i.id), 
      quantity: i.quantity, 
      price: i.price 
    }))
  )
  
  busy.value = false
  if (itemsErr) return toast.error(itemsErr.message)
  
  toast.success('Order placed!')
  cart.clear()
  router.push('/dashboard')
}
</script>

<template>
  <div class="container mx-auto max-w-2xl px-4 py-12">
    <h1 class="font-serif text-3xl font-bold">Your Cart</h1>
    <div v-if="cart.items.length === 0" class="mt-6 rounded-2xl border border-border bg-card p-8 text-center">
      <p class="text-muted-foreground">Cart is empty.</p>
      <router-link to="/shop">
        <Button class="mt-4">Shop now</Button>
      </router-link>
    </div>
    <div v-else class="mt-6 space-y-3">
      <div 
        v-for="i in cart.items" 
        :key="i.id" 
        class="flex items-center gap-3 rounded-xl border border-border bg-card p-4"
      >
        <div class="flex-1">
          <p class="font-medium">{{ i.name }}</p>
          <p class="text-sm text-muted-foreground">KES {{ i.price }}</p>
        </div>
        <input
          type="number"
          min="1"
          :value="i.quantity"
          @change="(e) => cart.setQty(i.id, parseInt((e.target as HTMLInputElement).value) || 1)"
          class="w-16 rounded-md border border-input bg-background px-2 py-1 text-sm"
        />
        <button @click="cart.remove(i.id)" class="text-muted-foreground hover:text-destructive">
          <Trash2 class="h-4 w-4" />
        </button>
      </div>
      <div class="flex items-center justify-between rounded-xl border border-border bg-card p-4">
        <span class="font-semibold">Total</span>
        <span class="text-xl font-bold text-primary">KES {{ cart.total }}</span>
      </div>
      <Button class="w-full" size="lg" :disabled="busy" @click="checkout">
        {{ busy ? 'Placing order...' : 'Place Order' }}
      </Button>
    </div>
  </div>
</template>
