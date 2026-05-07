<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { supabase } from '@/integrations/supabase/client'
import { useCartStore } from '@/stores/cart'
import { Button } from '@/components/ui/button/index'
import { Input } from '@/components/ui/input/index'
import { toast } from 'vue-sonner'
import { LayoutGrid, List, Search, X, ShoppingCart, Info } from 'lucide-vue-next'

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
const searchQuery = ref('')
const viewMode = ref<'grid' | 'list'>('grid')
const selectedProduct = ref<Product | null>(null)

onMounted(async () => {
  const { data } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false })
  
  if (data) {
    products.value = data as Product[]
  }
})

const filteredProducts = computed(() => {
  if (!searchQuery.value) return products.value
  const q = searchQuery.value.toLowerCase()
  return products.value.filter(p => 
    p.name.toLowerCase().includes(q) || 
    (p.category && p.category.toLowerCase().includes(q))
  )
})

const handleAddToCart = (p: Product) => {
  cart.add({ id: p.id, name: p.name, price: p.price })
  toast.success('Added to cart')
}

const openDetails = (p: Product) => {
  selectedProduct.value = p
}

const closeDetails = () => {
  selectedProduct.value = null
}
</script>

<template>
  <div class="container mx-auto px-4 py-12 min-h-screen">
    <div class="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
      <div>
        <h1 class="font-serif text-4xl md:text-5xl font-bold">Beauty Shop</h1>
        <p class="mt-2 text-muted-foreground text-lg">Pro-grade products curated by Pam for your perfect glow.</p>
      </div>

      <div class="flex flex-col sm:flex-row gap-4 items-center w-full md:w-auto">
        <div class="relative w-full sm:w-64">
          <Search class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            v-model="searchQuery" 
            placeholder="Search products..." 
            class="pl-10 rounded-full bg-card/50 border-primary/10 focus:border-primary/30"
          />
        </div>
        
        <div class="flex bg-card/50 p-1 rounded-full border border-primary/10">
          <button 
            @click="viewMode = 'grid'"
            :class="[
              'p-2 rounded-full transition-all',
              viewMode === 'grid' ? 'bg-primary text-white shadow-md' : 'text-muted-foreground hover:text-primary'
            ]"
          >
            <LayoutGrid class="h-4 w-4" />
          </button>
          <button 
            @click="viewMode = 'list'"
            :class="[
              'p-2 rounded-full transition-all',
              viewMode === 'list' ? 'bg-primary text-white shadow-md' : 'text-muted-foreground hover:text-primary'
            ]"
          >
            <List class="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-if="filteredProducts.length === 0" class="py-20 text-center">
      <div class="inline-flex h-16 w-16 items-center justify-center rounded-full bg-primary/5 text-primary mb-4">
        <Search class="h-8 w-8" />
      </div>
      <h3 class="text-xl font-bold">No products found</h3>
      <p class="text-muted-foreground mt-2">Try adjusting your search or category.</p>
      <Button variant="ghost" class="mt-4" @click="searchQuery = ''">Clear search</Button>
    </div>

    <!-- Grid View -->
    <div 
      v-if="viewMode === 'grid'"
      class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
    >
      <div 
        v-for="p in filteredProducts" 
        :key="p.id" 
        class="group flex flex-col overflow-hidden rounded-3xl border border-border bg-card transition-all hover:shadow-xl hover:-translate-y-1 cursor-pointer"
        @click="openDetails(p)"
      >
        <div class="aspect-square w-full bg-gradient-to-br from-accent/20 to-secondary/20 relative overflow-hidden">
          <img 
            v-if="p.image_url" 
            :src="p.image_url" 
            :alt="p.name" 
            class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" 
          />
          <div class="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
             <Button variant="secondary" size="sm" class="rounded-full shadow-lg">
                View Details
             </Button>
          </div>
          <div v-if="p.category" class="absolute top-4 left-4 bg-white/90 dark:bg-black/90 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest">
            {{ p.category }}
          </div>
        </div>
        <div class="p-6 flex-1 flex flex-col">
          <h3 class="font-serif text-xl font-bold line-clamp-1">{{ p.name }}</h3>
          <p v-if="p.description" class="mt-2 line-clamp-2 text-sm text-muted-foreground leading-relaxed">
            {{ p.description }}
          </p>
          <div class="mt-auto pt-6 flex items-center justify-between">
            <span class="text-lg font-bold text-primary">KES {{ p.price }}</span>
            <Button size="sm" class="rounded-xl shadow-md gold-glow" @click.stop="handleAddToCart(p)">
              <ShoppingCart class="h-4 w-4 mr-2" /> Add
            </Button>
          </div>
        </div>
      </div>
    </div>

    <!-- List View -->
    <div 
      v-else
      class="flex flex-col gap-4"
    >
      <div 
        v-for="p in filteredProducts" 
        :key="p.id" 
        class="group flex flex-col sm:flex-row overflow-hidden rounded-2xl border border-border bg-card transition-all hover:shadow-lg cursor-pointer"
        @click="openDetails(p)"
      >
        <div class="h-48 sm:w-48 sm:h-auto bg-gradient-to-br from-accent/20 to-secondary/20 shrink-0 relative">
          <img 
            v-if="p.image_url" 
            :src="p.image_url" 
            :alt="p.name" 
            class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" 
          />
        </div>
        <div class="p-6 flex-1 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div class="flex-1">
            <div class="flex items-center gap-3 mb-1">
               <h3 class="font-serif text-2xl font-bold">{{ p.name }}</h3>
               <span v-if="p.category" class="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-bold uppercase tracking-widest">
                {{ p.category }}
              </span>
            </div>
            <p v-if="p.description" class="line-clamp-2 text-muted-foreground max-w-xl">
              {{ p.description }}
            </p>
          </div>
          <div class="flex items-center gap-6 shrink-0">
            <span class="text-xl font-bold text-primary">KES {{ p.price }}</span>
            <Button class="rounded-xl shadow-md gold-glow px-6" @click.stop="handleAddToCart(p)">
              <ShoppingCart class="h-4 w-4 mr-2" /> Add to Cart
            </Button>
          </div>
        </div>
      </div>
    </div>

    <!-- Product Details Modal -->
    <Teleport to="body">
      <Transition 
        enter-active-class="transition duration-300 ease-out"
        enter-from-class="opacity-0"
        enter-to-class="opacity-100"
        leave-active-class="transition duration-200 ease-in"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
      >
        <div v-if="selectedProduct" class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" @click.self="closeDetails">
          <div class="bg-card w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-[2rem] shadow-2xl border border-primary/10 relative">
            <button @click="closeDetails" class="absolute top-6 right-6 z-10 p-2 rounded-full bg-background/80 hover:bg-primary hover:text-white transition-all shadow-md">
              <X class="h-5 w-5" />
            </button>

            <div class="grid md:grid-cols-2 gap-0">
              <div class="aspect-square bg-gradient-to-br from-accent/20 to-secondary/20">
                <img 
                  v-if="selectedProduct.image_url" 
                  :src="selectedProduct.image_url" 
                  :alt="selectedProduct.name" 
                  class="h-full w-full object-cover" 
                />
              </div>
              <div class="p-8 md:p-12 flex flex-col">
                <div class="mb-6">
                  <span v-if="selectedProduct.category" class="text-xs font-bold text-primary uppercase tracking-[0.2em] mb-2 block">
                    {{ selectedProduct.category }}
                  </span>
                  <h2 class="font-serif text-3xl md:text-4xl font-bold mb-4">{{ selectedProduct.name }}</h2>
                  <div class="h-1 w-12 bg-primary/30 mb-6" />
                  <p class="text-muted-foreground leading-relaxed text-lg">
                    {{ selectedProduct.description || 'No description available for this premium product.' }}
                  </p>
                </div>

                <div class="mt-auto space-y-6">
                  <div class="flex items-baseline gap-2">
                    <span class="text-3xl font-bold text-primary">KES {{ selectedProduct.price }}</span>
                    <span v-if="selectedProduct.stock > 0" class="text-xs text-green-500 font-medium">In Stock ({{ selectedProduct.stock }} left)</span>
                    <span v-else class="text-xs text-destructive font-medium">Out of Stock</span>
                  </div>

                  <div class="flex gap-4">
                    <Button 
                      class="flex-1 rounded-2xl h-14 text-lg font-bold shadow-xl gold-glow"
                      @click="handleAddToCart(selectedProduct)"
                      :disabled="selectedProduct.stock <= 0"
                    >
                      <ShoppingCart class="mr-2 h-5 w-5" /> Add to Cart
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<style scoped>
/* Custom leopard print for special button */
.bg-leopard {
  background-color: #f4d0a2;
  background-image: url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='f'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.05' numOctaves='2'/%3E%3CfeDisplacementMap in='SourceGraphic' scale='5'/%3E%3C/filter%3E%3Cg filter='url(%23f)'%3E%3Ccircle cx='20' cy='20' r='8' fill='%234a3427'/%3E%3Ccircle cx='20' cy='20' r='4' fill='%238b5e3c'/%3E%3Ccircle cx='50' cy='50' r='10' fill='%234a3427'/%3E%3Ccircle cx='50' cy='50' r='5' fill='%238b5e3c'/%3E%3Ccircle cx='80' cy='20' r='7' fill='%234a3427'/%3E%3Ccircle cx='80' cy='20' r='3' fill='%238b5e3c'/%3E%3Ccircle cx='20' cy='80' r='9' fill='%234a3427'/%3E%3Ccircle cx='20' cy='80' r='4' fill='%238b5e3c'/%3E%3Ccircle cx='80' cy='80' r='8' fill='%234a3427'/%3E%3Ccircle cx='80' cy='80' r='4' fill='%238b5e3c'/%3E%3C/g%3E%3C/svg%3E");
  background-size: 60px 60px;
}
</style>
