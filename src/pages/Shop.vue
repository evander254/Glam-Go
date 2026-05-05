<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { supabase } from '@/integrations/supabase/client'
import { useCartStore } from '@/stores/cart'
import { Button } from '@/components/ui/button/index'
import { toast } from 'vue-sonner'

type Product = {
  id: number
  name: string
  category: string | null
  price: number
  stock: number
  image_url: string | null
  description: string | null
}

const products = ref<Product[]>([])
const cart = useCartStore()

onMounted(async () => {
  const { data } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false })
  
  if (data) {
    products.value = data as Product[]
  }
})

const handleAddToCart = (p: Product) => {
  cart.add({ id: p.id, name: p.name, price: p.price })
  toast.success('Added to cart')
}
</script>

<template>
  <div class="container mx-auto px-4 py-12">
    <h1 class="font-serif text-3xl font-bold">Beauty Shop</h1>
    <p class="mt-1 text-muted-foreground">Pro-grade products curated by Pam.</p>
    <div class="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <div 
        v-for="p in products" 
        :key="p.id" 
        class="overflow-hidden rounded-2xl border border-border bg-card transition hover:shadow-lg"
      >
        <div class="aspect-square w-full bg-gradient-to-br from-accent to-secondary">
          <img 
            v-if="p.image_url" 
            :src="p.image_url" 
            :alt="p.name" 
            class="h-full w-full object-cover" 
          />
        </div>
        <div class="p-4">
          <p v-if="p.category" class="text-xs uppercase text-muted-foreground">{{ p.category }}</p>
          <h3 class="mt-1 font-semibold">{{ p.name }}</h3>
          <p v-if="p.description" class="mt-1 line-clamp-2 text-xs text-muted-foreground">{{ p.description }}</p>
          <div class="mt-3 flex items-center justify-between">
            <span class="font-bold text-primary">KES {{ p.price }}</span>
            <Button size="sm" @click="handleAddToCart(p)">
              Add
            </Button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
