<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/composables/useAuth'
import { Button } from '@/components/ui/button/index'
import { Input } from '@/components/ui/input/index'
import { Label } from '@/components/ui/label/index'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs/index'
import { Trash2, Plus, Star, Camera } from 'lucide-vue-next'
import { toast } from 'vue-sonner'
import ImageUpload from '@/components/ImageUpload.vue'
import { Textarea } from '@/components/ui/textarea/index'

const { user, isAdmin, loading } = useAuth()

// Bookings Admin State
type Booking = { id: number; booking_date: string; booking_time: string; status: string; user_id: number; services: { name: string } | null }
const bookings = ref<Booking[]>([])
const loadBookings = async () => {
  const { data } = await supabase
    .from('bookings')
    .select('id,booking_date,booking_time,status,user_id,services(name)')
    .order('booking_date', { ascending: false })
  if (data) bookings.value = data as unknown as Booking[]
}
const updateBooking = async (id: number | string, status: string) => {
  const { error } = await supabase.from('bookings').update({ status }).eq('id', id)
  if (error) toast.error(error.message)
  else { toast.success('Updated'); loadBookings() }
}

// Orders Admin State
type Order = { id: number; total_amount: number; status: string; created_at: string; user_id: number }
const orders = ref<Order[]>([])
const loadOrders = async () => {
  const { data } = await supabase.from('orders').select('*').order('created_at', { ascending: false })
  if (data) orders.value = data as Order[]
}
const updateOrder = async (id: number | string, status: string) => {
  const { error } = await supabase.from('orders').update({ status }).eq('id', id)
  if (error) toast.error(error.message)
  else { toast.success('Updated'); loadOrders() }
}

// Products Admin State
type Product = { id: number; name: string; category: string | null; price: number; stock: number; description: string | null; image_url: string | null }
const products = ref<Product[]>([])
const productForm = ref({ name: '', category: '', price: 0, stock: 0, description: '', image_url: '' })
const loadProducts = async () => {
  const { data } = await supabase.from('products').select('*').order('created_at', { ascending: false })
  if (data) products.value = data as Product[]
}
const createProduct = async () => {
  if (!productForm.value.name || !productForm.value.price) return toast.error('Name and price required')
  const { error } = await supabase.from('products').insert(productForm.value)
  if (error) toast.error(error.message)
  else {
    toast.success('Product added')
    productForm.value = { name: '', category: '', price: 0, stock: 0, description: '', image_url: '' }
    loadProducts()
  }
}
const removeProduct = async (id: number | string) => {
  const { error } = await supabase.from('products').delete().eq('id', id)
  if (error) toast.error(error.message)
  else { toast.success('Deleted'); loadProducts() }
}

// Testimonials Admin State
type Testimonial = { id: string; name: string; rate: number; quote: string }
const testimonials = ref<Testimonial[]>([])
const testimonialForm = ref({ name: '', rate: 5, quote: '' })
const loadTestimonials = async () => {
  const { data } = await supabase.from('testimonials').select('*').order('created_at', { ascending: false })
  if (data) testimonials.value = data as Testimonial[]
}
const createTestimonial = async () => {
  if (!testimonialForm.value.name || !testimonialForm.value.quote) return toast.error('Name and quote required')
  const { error } = await supabase.from('testimonials').insert(testimonialForm.value)
  if (error) toast.error(error.message)
  else {
    toast.success('Testimonial added')
    testimonialForm.value = { name: '', rate: 5, quote: '' }
    loadTestimonials()
  }
}
const removeTestimonial = async (id: string) => {
  const { error } = await supabase.from('testimonials').delete().eq('id', id)
  if (error) toast.error(error.message)
  else { toast.success('Deleted'); loadTestimonials() }
}

// Portfolio Admin State
type PortfolioItem = { id: string; title: string; category: string; image_url: string }
const portfolio = ref<PortfolioItem[]>([])
const portfolioForm = ref({ title: '', category: '', image_url: '' })
const loadPortfolio = async () => {
  const { data } = await supabase.from('portfolio').select('*').order('created_at', { ascending: false })
  if (data) portfolio.value = data as PortfolioItem[]
}
const createPortfolioItem = async () => {
  if (!portfolioForm.value.title || !portfolioForm.value.image_url) return toast.error('Title and image required')
  const { error } = await supabase.from('portfolio').insert(portfolioForm.value)
  if (error) toast.error(error.message)
  else {
    toast.success('Portfolio item added')
    portfolioForm.value = { title: '', category: '', image_url: '' }
    loadPortfolio()
  }
}
const removePortfolioItem = async (id: string) => {
  const { error } = await supabase.from('portfolio').delete().eq('id', id)
  if (error) toast.error(error.message)
  else { toast.success('Deleted'); loadPortfolio() }
}

onMounted(() => {
  loadBookings()
  loadOrders()
  loadProducts()
  loadTestimonials()
  loadPortfolio()
})
</script>

<template>
  <div v-if="!loading" class="container mx-auto max-w-5xl px-4 py-12">
    <div v-if="!user || !isAdmin" class="max-w-md mx-auto text-center">
      <p class="text-muted-foreground">{{ !user ? 'Sign in required.' : 'Admin access only.' }}</p>
      <router-link to="/">
        <Button class="mt-4">Home</Button>
      </router-link>
    </div>

    <template v-else>
      <h1 class="font-serif text-3xl font-bold">Admin Dashboard</h1>
      <Tabs default-value="bookings" class="mt-6">
        <TabsList>
          <TabsTrigger value="bookings">Bookings</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="testimonials">Testimonials</TabsTrigger>
          <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
        </TabsList>
        
        <TabsContent value="bookings" class="mt-4 space-y-2">
          <p v-if="bookings.length === 0" class="text-sm text-muted-foreground">No bookings.</p>
          <div 
            v-for="b in bookings" 
            :key="b.id" 
            class="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card p-4"
          >
            <div>
              <p class="font-medium">{{ b.services?.name ?? "Service" }}</p>
              <p class="text-xs text-muted-foreground">{{ b.booking_date }} at {{ b.booking_time }}</p>
            </div>
            <select 
              :value="b.status" 
              @change="(e) => updateBooking(b.id, (e.target as HTMLSelectElement).value)"
              class="rounded-md border border-input bg-background px-3 py-1.5 text-sm"
            >
              <option value="pending">pending</option>
              <option value="confirmed">confirmed</option>
              <option value="completed">completed</option>
              <option value="cancelled">cancelled</option>
            </select>
          </div>
        </TabsContent>

        <TabsContent value="orders" class="mt-4 space-y-2">
          <p v-if="orders.length === 0" class="text-sm text-muted-foreground">No orders.</p>
          <div 
            v-for="o in orders" 
            :key="o.id" 
            class="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card p-4"
          >
            <div>
              <p class="font-medium">KES {{ o.total_amount }}</p>
              <p class="text-xs text-muted-foreground">{{ new Date(o.created_at).toLocaleString() }}</p>
            </div>
            <select 
              :value="o.status" 
              @change="(e) => updateOrder(o.id, (e.target as HTMLSelectElement).value)"
              class="rounded-md border border-input bg-background px-3 py-1.5 text-sm"
            >
              <option value="pending">pending</option>
              <option value="processing">processing</option>
              <option value="completed">completed</option>
              <option value="cancelled">cancelled</option>
            </select>
          </div>
        </TabsContent>

        <TabsContent value="products" class="mt-4 space-y-6">
          <div class="rounded-xl border border-border bg-card p-6 shadow-sm">
            <div class="mb-4 flex items-center gap-2">
              <Plus class="h-5 w-5 text-primary" />
              <h3 class="font-serif text-lg font-bold">Add New Product</h3>
            </div>
            
            <div class="grid gap-6 lg:grid-cols-3">
              <div class="lg:col-span-1">
                <Label class="mb-2 block text-xs font-bold uppercase tracking-wider text-muted-foreground">Product Image</Label>
                <ImageUpload v-model="productForm.image_url" />
              </div>
              
              <div class="lg:col-span-2">
                <div class="grid gap-4 sm:grid-cols-2">
                  <div class="space-y-2">
                    <Label class="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">Name</Label>
                    <Input v-model="productForm.name" placeholder="e.g. Matte Lipstick" class="rounded-xl" />
                  </div>
                  <div class="space-y-2">
                    <Label class="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">Category</Label>
                    <Input v-model="productForm.category" placeholder="e.g. Lips" class="rounded-xl" />
                  </div>
                  <div class="space-y-2">
                    <Label class="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">Price (KES)</Label>
                    <Input type="number" v-model.number="productForm.price" class="rounded-xl" />
                  </div>
                  <div class="space-y-2">
                    <Label class="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">Stock</Label>
                    <Input type="number" v-model.number="productForm.stock" class="rounded-xl" />
                  </div>
                  <div class="sm:col-span-2 space-y-2">
                    <Label class="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">Description</Label>
                    <Input v-model="productForm.description" placeholder="Short description of the product" class="rounded-xl" />
                  </div>
                </div>
                
                <Button class="mt-6 w-full rounded-xl py-6 font-semibold shadow-lg shadow-primary/20 gold-glow" @click="createProduct">
                  Create Product
                </Button>
              </div>
            </div>
          </div>

          <div class="space-y-2">
            <div 
              v-for="p in products" 
              :key="p.id" 
              class="flex items-center justify-between rounded-xl border border-border bg-card p-4"
            >
              <div>
                <p class="font-medium">{{ p.name }}</p>
                <p class="text-xs text-muted-foreground">KES {{ p.price }} · stock {{ p.stock }}</p>
              </div>
              <button @click="removeProduct(p.id)" class="text-muted-foreground hover:text-destructive">
                <Trash2 class="h-4 w-4" />
              </button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="testimonials" class="mt-4 space-y-6">
          <div class="rounded-xl border border-border bg-card p-6 shadow-sm">
            <div class="mb-4 flex items-center gap-2">
              <Star class="h-5 w-5 text-primary" />
              <h3 class="font-serif text-lg font-bold">Add New Testimonial</h3>
            </div>
            <div class="grid gap-4">
              <div class="grid gap-4 sm:grid-cols-2">
                <div class="space-y-2">
                  <Label class="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">Client Name</Label>
                  <Input v-model="testimonialForm.name" placeholder="e.g. Sarah W." class="rounded-xl" />
                </div>
                <div class="space-y-2">
                  <Label class="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">Rating (1-5)</Label>
                  <Input type="number" min="1" max="5" v-model.number="testimonialForm.rate" class="rounded-xl" />
                </div>
              </div>
              <div class="space-y-2">
                <Label class="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">Quote</Label>
                <Textarea v-model="testimonialForm.quote" placeholder="Client feedback..." class="rounded-xl min-h-[100px]" />
              </div>
              <Button class="w-full rounded-xl py-6 font-semibold shadow-lg shadow-primary/20 gold-glow" @click="createTestimonial">
                Add Testimonial
              </Button>
            </div>
          </div>

          <div class="space-y-2">
            <div v-for="t in testimonials" :key="t.id" class="flex items-center justify-between rounded-xl border border-border bg-card p-4">
              <div class="max-w-[80%]">
                <div class="flex items-center gap-2">
                  <p class="font-medium">{{ t.name }}</p>
                  <div class="flex gap-0.5">
                    <Star v-for="i in t.rate" :key="i" class="h-3 w-3 fill-primary text-primary" />
                  </div>
                </div>
                <p class="text-xs text-muted-foreground italic mt-1 line-clamp-1">"{{ t.quote }}"</p>
              </div>
              <button @click="removeTestimonial(t.id)" class="text-muted-foreground hover:text-destructive">
                <Trash2 class="h-4 w-4" />
              </button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="portfolio" class="mt-4 space-y-6">
          <div class="rounded-xl border border-border bg-card p-6 shadow-sm">
            <div class="mb-4 flex items-center gap-2">
              <Camera class="h-5 w-5 text-primary" />
              <h3 class="font-serif text-lg font-bold">Add Portfolio Item</h3>
            </div>
            
            <div class="grid gap-6 lg:grid-cols-3">
              <div class="lg:col-span-1">
                <Label class="mb-2 block text-xs font-bold uppercase tracking-wider text-muted-foreground">Portfolio Image</Label>
                <ImageUpload v-model="portfolioForm.image_url" bucket="portfolio" />
              </div>
              
              <div class="lg:col-span-2 space-y-4">
                <div class="grid gap-4 sm:grid-cols-2">
                  <div class="space-y-2">
                    <Label class="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">Title</Label>
                    <Input v-model="portfolioForm.title" placeholder="e.g. Bridal Elegance" class="rounded-xl" />
                  </div>
                  <div class="space-y-2">
                    <Label class="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">Category</Label>
                    <Input v-model="portfolioForm.category" placeholder="e.g. Bridal" class="rounded-xl" />
                  </div>
                </div>
                <Button class="w-full rounded-xl py-6 font-semibold shadow-lg shadow-primary/20 gold-glow" @click="createPortfolioItem">
                  Add to Portfolio
                </Button>
              </div>
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div v-for="item in portfolio" :key="item.id" class="group relative overflow-hidden rounded-2xl border border-border bg-card aspect-square">
              <img :src="item.image_url" class="h-full w-full object-cover" />
              <div class="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white p-4">
                <p class="font-bold text-center">{{ item.title }}</p>
                <p class="text-xs opacity-80">{{ item.category }}</p>
                <button @click="removePortfolioItem(item.id)" class="mt-4 bg-destructive hover:bg-destructive/90 text-white p-2 rounded-full transition-transform hover:scale-110">
                  <Trash2 class="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </template>
  </div>
</template>
