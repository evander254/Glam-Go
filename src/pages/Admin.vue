<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/composables/useAuth'
import { Button } from '@/components/ui/button/index'
import { Input } from '@/components/ui/input/index'
import { Label } from '@/components/ui/label/index'
import { Textarea } from '@/components/ui/textarea/index'
import { 
  Trash2, 
  Plus, 
  Star, 
  Camera, 
  Search, 
  Filter,
  MoreVertical,
  DollarSign,
  Calendar as CalendarIcon,
  Users as UsersIcon,
  ShoppingBag,
  TrendingUp,
  ArrowRight
} from 'lucide-vue-next'
import { toast } from 'vue-sonner'
import ImageUpload from '@/components/ImageUpload.vue'
import AdminSidebar from '@/components/AdminSidebar.vue'
import AdminTopBar from '@/components/AdminTopBar.vue'
import KPICard from '@/components/KPICard.vue'

const { user, isAdmin, loading } = useAuth()
const activeTab = ref('dashboard')

// --- KPI State ---
const kpis = ref({
  revenue: { value: 0, trend: '12%', isUp: true },
  bookings: { value: 0, trend: '5%', isUp: true },
  users: { value: 0, trend: '8%', isUp: true },
  products: { value: 0, trend: '2%', isUp: false }
})

const loadKPIs = async () => {
  // Revenue
  const { data: completedOrders } = await supabase
    .from('orders')
    .select('total_amount')
    .eq('status', 'completed')
  
  if (completedOrders) {
    kpis.value.revenue.value = completedOrders.reduce((acc, curr) => acc + (curr.total_amount || 0), 0)
  }

  // Pending Bookings
  const { count: pendingCount } = await supabase
    .from('bookings')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'pending')
  
  kpis.value.bookings.value = pendingCount || 0

  // Total Users
  const { count: usersCount } = await supabase
    .from('users')
    .select('*', { count: 'exact', head: true })
  
  kpis.value.users.value = usersCount || 0

  // Products
  const { count: productsCount } = await supabase
    .from('products')
    .select('*', { count: 'exact', head: true })
  
  kpis.value.products.value = productsCount || 0
}

// --- Bookings State ---
type Booking = { 
  id: number; 
  booking_date: string; 
  booking_time: string; 
  status: string; 
  user_id: number | null; 
  guest_name: string | null;
  guest_email: string | null;
  guest_phone: string | null;
  services: { name: string } | null 
}
const bookings = ref<Booking[]>([])
const loadBookings = async () => {
  const { data } = await supabase
    .from('bookings')
    .select('id,booking_date,booking_time,status,user_id,guest_name,guest_email,guest_phone,services(name)')
    .order('booking_date', { ascending: false })
  if (data) bookings.value = data as unknown as Booking[]
}
const updateBooking = async (id: number | string, status: string) => {
  const { error } = await supabase.from('bookings').update({ status }).eq('id', id)
  if (error) toast.error(error.message)
  else { toast.success('Updated'); loadBookings(); loadKPIs() }
}

// --- Orders State ---
type Order = { id: number; total_amount: number; status: string; created_at: string; user_id: number }
const orders = ref<Order[]>([])
const loadOrders = async () => {
  const { data } = await supabase.from('orders').select('*').order('created_at', { ascending: false })
  if (data) orders.value = data as Order[]
}
const updateOrder = async (id: number | string, status: string) => {
  const { error } = await supabase.from('orders').update({ status }).eq('id', id)
  if (error) toast.error(error.message)
  else { toast.success('Updated'); loadOrders(); loadKPIs() }
}

// --- Products State ---
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
    loadKPIs()
  }
}
const removeProduct = async (id: number | string) => {
  const { error } = await supabase.from('products').delete().eq('id', id)
  if (error) toast.error(error.message)
  else { toast.success('Deleted'); loadProducts(); loadKPIs() }
}

// --- Users State ---
type UserProfile = { 
  id: number; 
  full_name: string; 
  email: string; 
  role: string; 
  created_at: string;
  booking_count?: number;
}
const usersList = ref<UserProfile[]>([])
const userSearch = ref('')
const loadUsers = async () => {
  const { data: usersData, error } = await supabase
    .from('users')
    .select('*, bookings(count)')
    .order('created_at', { ascending: false })
  
  if (error) toast.error(error.message)
  if (usersData) {
    usersList.value = usersData.map(u => ({
      ...u,
      booking_count: u.bookings?.[0]?.count || 0
    }))
  }
}
const filteredUsers = computed(() => {
  if (!userSearch.value) return usersList.value
  return usersList.value.filter(u => 
    u.full_name?.toLowerCase().includes(userSearch.value.toLowerCase()) ||
    u.email?.toLowerCase().includes(userSearch.value.toLowerCase())
  )
})

// --- Testimonials & Portfolio ---
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
  if (isAdmin.value) {
    loadKPIs()
    loadBookings()
    loadOrders()
    loadProducts()
    loadUsers()
    loadTestimonials()
    loadPortfolio()
  }
})
</script>

<template>
  <div v-if="!loading" class="min-h-screen bg-[#050505] text-foreground font-sans">
    <div v-if="!user || !isAdmin" class="flex h-screen items-center justify-center text-center">
      <div class="max-w-md space-y-6 px-4">
        <div class="inline-flex h-20 w-20 items-center justify-center rounded-3xl bg-primary/10 text-primary">
          <CalendarIcon class="h-10 w-10" />
        </div>
        <h1 class="font-serif text-3xl font-bold tracking-tight">Access Restricted</h1>
        <p class="text-muted-foreground">{{ !user ? 'Please sign in to access the administrative dashboard.' : 'You do not have the required permissions to view this page.' }}</p>
        <router-link to="/">
          <Button class="w-full rounded-2xl py-6 font-semibold gold-glow">Return Home</Button>
        </router-link>
      </div>
    </div>

    <template v-else>
      <!-- Navigation Sidebar -->
      <AdminSidebar v-model:activeTab="activeTab" />

      <!-- Main Content -->
      <main class="transition-all duration-300 sm:ml-64">
        <AdminTopBar :userName="user.email?.split('@')[0] || 'Admin'" />

        <div class="p-8 lg:p-12">
          <!-- Dashboard View -->
          <div v-if="activeTab === 'dashboard'" class="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div>
              <h2 class="font-serif text-4xl font-bold tracking-tight">Command Center</h2>
              <p class="mt-2 text-muted-foreground">Overview of your luxury beauty business performance.</p>
            </div>

            <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              <KPICard 
                title="Total Revenue" 
                :value="'KES ' + kpis.revenue.value.toLocaleString()" 
                :icon="DollarSign"
                :trend="{ value: kpis.revenue.trend, isUp: kpis.revenue.isUp }"
              />
              <KPICard 
                title="Pending Bookings" 
                :value="kpis.bookings.value" 
                :icon="CalendarIcon"
                :trend="{ value: kpis.bookings.trend, isUp: kpis.bookings.isUp }"
              />
              <KPICard 
                title="Active Clients" 
                :value="kpis.users.value" 
                :icon="UsersIcon"
                :trend="{ value: kpis.users.trend, isUp: kpis.users.isUp }"
              />
              <KPICard 
                title="Product Catalog" 
                :value="kpis.products.value" 
                :icon="ShoppingBag"
                :trend="{ value: kpis.products.trend, isUp: kpis.products.isUp }"
              />
            </div>

            <div class="grid gap-8 lg:grid-cols-3">
              <!-- Recent Bookings Mini List -->
              <div class="lg:col-span-2 rounded-3xl border border-border bg-card/30 p-8 backdrop-blur-sm">
                <div class="mb-6 flex items-center justify-between">
                  <h3 class="font-serif text-2xl font-bold">Recent Bookings</h3>
                  <button @click="activeTab = 'bookings'" class="flex items-center gap-1 text-sm font-medium text-primary hover:underline">
                    View All <ArrowRight class="h-4 w-4" />
                  </button>
                </div>
                <div class="space-y-4">
                  <div v-for="b in bookings.slice(0, 5)" :key="b.id" class="flex items-center justify-between rounded-2xl bg-secondary/20 p-4 transition-all hover:bg-secondary/30">
                    <div class="flex items-center gap-4">
                      <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        <CalendarIcon class="h-5 w-5" />
                      </div>
                      <div>
                        <p class="font-semibold">{{ b.services?.name ?? "Premium Service" }}</p>
                        <p class="text-xs text-muted-foreground">{{ b.guest_name || 'Registered Client' }} · {{ b.booking_date }}</p>
                      </div>
                    </div>
                    <span :class="['rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider', 
                      b.status === 'confirmed' ? 'bg-emerald-500/10 text-emerald-500' : 
                      b.status === 'pending' ? 'bg-amber-500/10 text-amber-500' : 'bg-muted text-muted-foreground']">
                      {{ b.status }}
                    </span>
                  </div>
                  <p v-if="bookings.length === 0" class="py-10 text-center text-muted-foreground">No recent bookings found.</p>
                </div>
              </div>

              <!-- Quick Actions / Performance -->
              <div class="space-y-6">
                <div class="rounded-3xl border border-border bg-gradient-to-br from-primary/10 to-accent/5 p-8">
                  <h3 class="font-serif text-xl font-bold text-primary">Quick Actions</h3>
                  <div class="mt-6 space-y-3">
                    <Button @click="activeTab = 'products'" variant="outline" class="w-full justify-start gap-3 rounded-2xl border-primary/20 bg-transparent hover:bg-primary/10">
                      <Plus class="h-4 w-4" /> Add New Product
                    </Button>
                    <Button @click="activeTab = 'portfolio'" variant="outline" class="w-full justify-start gap-3 rounded-2xl border-primary/20 bg-transparent hover:bg-primary/10">
                      <Camera class="h-4 w-4" /> Update Portfolio
                    </Button>
                  </div>
                </div>

                <div class="rounded-3xl border border-border bg-card/30 p-8">
                  <div class="flex items-center gap-3">
                    <TrendingUp class="h-5 w-5 text-emerald-500" />
                    <h3 class="font-bold">Growth Insight</h3>
                  </div>
                  <p class="mt-4 text-sm text-muted-foreground leading-relaxed">
                    Your revenue is up <span class="font-bold text-emerald-500">12%</span> this month. Bridal services are your top performer.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <!-- Users View -->
          <div v-if="activeTab === 'users'" class="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 class="font-serif text-4xl font-bold tracking-tight">Client Management</h2>
                <p class="mt-1 text-muted-foreground">Maintain and grow your premium clientele list.</p>
              </div>
            </div>

            <div class="rounded-3xl border border-border bg-card/30 overflow-hidden">
              <div class="border-b border-border p-6 flex flex-col sm:flex-row gap-4 items-center justify-between">
                <div class="relative w-full sm:w-80">
                  <Search class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input 
                    v-model="userSearch"
                    placeholder="Search by name or email..." 
                    class="pl-10 rounded-2xl bg-secondary/20 border-transparent focus-visible:border-primary/50"
                  />
                </div>
                <Button variant="ghost" class="rounded-xl gap-2">
                  <Filter class="h-4 w-4" /> Filter
                </Button>
              </div>

              <div class="overflow-x-auto">
                <table class="w-full text-left">
                  <thead class="bg-secondary/10 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    <tr>
                      <th class="px-6 py-4">Name</th>
                      <th class="px-6 py-4">Email</th>
                      <th class="px-6 py-4 text-center">Total Bookings</th>
                      <th class="px-6 py-4">Status</th>
                      <th class="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-border/50">
                    <tr v-for="u in filteredUsers" :key="u.id" class="group hover:bg-primary/5 transition-colors">
                      <td class="px-6 py-4">
                        <div class="flex items-center gap-3">
                          <div class="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[10px] font-bold">
                            {{ u.full_name?.charAt(0).toUpperCase() }}
                          </div>
                          <span class="font-medium text-foreground">{{ u.full_name }}</span>
                        </div>
                      </td>
                      <td class="px-6 py-4 text-sm text-muted-foreground">{{ u.email }}</td>
                      <td class="px-6 py-4 text-center">
                        <span class="inline-flex h-6 w-10 items-center justify-center rounded-full bg-secondary/50 text-xs font-bold">
                          {{ u.booking_count }}
                        </span>
                      </td>
                      <td class="px-6 py-4">
                        <span class="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-bold uppercase text-emerald-500">
                          <span class="h-1.5 w-1.5 rounded-full bg-emerald-500"></span> Active
                        </span>
                      </td>
                      <td class="px-6 py-4 text-right">
                        <button class="text-muted-foreground hover:text-primary transition-colors">
                          <MoreVertical class="h-5 w-5" />
                        </button>
                      </td>
                    </tr>
                    <tr v-if="filteredUsers.length === 0">
                      <td colspan="5" class="px-6 py-20 text-center text-muted-foreground">
                        No clients matching your search.
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <!-- Bookings View -->
          <div v-if="activeTab === 'bookings'" class="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
             <div class="flex items-center justify-between">
                <h2 class="font-serif text-4xl font-bold tracking-tight">Appointments</h2>
                <div class="flex gap-2">
                  <Button variant="outline" class="rounded-2xl border-primary/20">Upcoming</Button>
                  <Button variant="outline" class="rounded-2xl">History</Button>
                </div>
             </div>
             
             <div class="grid gap-4">
                <div 
                  v-for="b in bookings" 
                  :key="b.id" 
                  class="group flex flex-wrap items-center justify-between gap-6 rounded-3xl border border-border bg-card/40 p-6 transition-all hover:border-primary/30"
                >
                  <div class="flex items-center gap-6 min-w-[300px]">
                    <div class="flex h-14 w-14 flex-col items-center justify-center rounded-2xl bg-secondary/30 text-primary">
                      <span class="text-[10px] font-bold uppercase">{{ b.booking_date.split('-')[1] }}</span>
                      <span class="text-xl font-bold">{{ b.booking_date.split('-')[2] }}</span>
                    </div>
                    <div>
                      <h4 class="text-lg font-bold text-foreground">{{ b.services?.name ?? "Glam Session" }}</h4>
                      <div class="mt-1 flex items-center gap-3 text-sm text-muted-foreground">
                        <span class="flex items-center gap-1"><CalendarIcon class="h-3 w-3" /> {{ b.booking_time }}</span>
                        <span class="h-1 w-1 rounded-full bg-border"></span>
                        <span class="font-medium text-primary/80">{{ b.guest_name || 'Member' }}</span>
                      </div>
                    </div>
                  </div>

                  <div class="flex items-center gap-6">
                    <div class="text-right hidden sm:block">
                      <p class="text-xs text-muted-foreground">{{ b.guest_email || 'No email provided' }}</p>
                      <p class="text-xs text-muted-foreground">{{ b.guest_phone || 'No phone' }}</p>
                    </div>
                    <select 
                      :value="b.status" 
                      @change="(e) => updateBooking(b.id, (e.target as HTMLSelectElement).value)"
                      class="rounded-xl border border-border bg-secondary/20 px-4 py-2 text-xs font-bold uppercase tracking-wider text-foreground focus:ring-2 focus:ring-primary/20 outline-none"
                    >
                      <option value="pending">pending</option>
                      <option value="confirmed">confirmed</option>
                      <option value="completed">completed</option>
                      <option value="cancelled">cancelled</option>
                    </select>
                  </div>
                </div>
                <p v-if="bookings.length === 0" class="py-20 text-center text-muted-foreground">No appointments scheduled.</p>
             </div>
          </div>

          <!-- Orders View -->
          <div v-if="activeTab === 'orders'" class="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 class="font-serif text-4xl font-bold tracking-tight">Sales & Orders</h2>
            <div class="grid gap-4">
              <div 
                v-for="o in orders" 
                :key="o.id" 
                class="flex flex-wrap items-center justify-between gap-6 rounded-3xl border border-border bg-card/40 p-6 transition-all hover:border-primary/30"
              >
                <div class="flex items-center gap-4">
                   <div class="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-500">
                      <ShoppingBag class="h-6 w-6" />
                   </div>
                   <div>
                      <p class="text-lg font-bold">Order #{{ o.id }}</p>
                      <p class="text-xs text-muted-foreground">{{ new Date(o.created_at).toLocaleString() }}</p>
                   </div>
                </div>
                
                <div class="flex items-center gap-8">
                   <p class="text-xl font-bold text-primary">KES {{ o.total_amount.toLocaleString() }}</p>
                   <select 
                    :value="o.status" 
                    @change="(e) => updateOrder(o.id, (e.target as HTMLSelectElement).value)"
                    class="rounded-xl border border-border bg-secondary/20 px-4 py-2 text-xs font-bold uppercase tracking-wider text-foreground focus:ring-2 focus:ring-primary/20 outline-none"
                  >
                    <option value="pending">pending</option>
                    <option value="processing">processing</option>
                    <option value="completed">completed</option>
                    <option value="cancelled">cancelled</option>
                  </select>
                </div>
              </div>
              <p v-if="orders.length === 0" class="py-20 text-center text-muted-foreground">No orders recorded.</p>
            </div>
          </div>

          <!-- Products View -->
          <div v-if="activeTab === 'products'" class="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div class="flex items-center justify-between">
              <h2 class="font-serif text-4xl font-bold tracking-tight">Inventory</h2>
              <Button class="rounded-2xl px-6 gold-glow gap-2">
                <Plus class="h-4 w-4" /> New Product
              </Button>
            </div>

            <div class="rounded-3xl border border-border bg-card/30 p-8 backdrop-blur-sm">
              <div class="mb-8 flex items-center gap-3">
                <div class="h-10 w-1 rounded-full bg-primary"></div>
                <h3 class="font-serif text-2xl font-bold">Add Product</h3>
              </div>
              
              <div class="grid gap-10 lg:grid-cols-4">
                <div class="lg:col-span-1">
                  <Label class="mb-4 block text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Product Image</Label>
                  <ImageUpload v-model="productForm.image_url" />
                </div>
                
                <div class="lg:col-span-3">
                  <div class="grid gap-6 sm:grid-cols-2">
                    <div class="space-y-2">
                      <Label class="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Product Name</Label>
                      <Input v-model="productForm.name" placeholder="e.g. Silk Foundation" class="rounded-2xl h-12 bg-secondary/20 border-transparent" />
                    </div>
                    <div class="space-y-2">
                      <Label class="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Category</Label>
                      <Input v-model="productForm.category" placeholder="e.g. Complexion" class="rounded-2xl h-12 bg-secondary/20 border-transparent" />
                    </div>
                    <div class="space-y-2">
                      <Label class="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Price (KES)</Label>
                      <Input type="number" v-model.number="productForm.price" class="rounded-2xl h-12 bg-secondary/20 border-transparent" />
                    </div>
                    <div class="space-y-2">
                      <Label class="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Stock Level</Label>
                      <Input type="number" v-model.number="productForm.stock" class="rounded-2xl h-12 bg-secondary/20 border-transparent" />
                    </div>
                    <div class="sm:col-span-2 space-y-2">
                      <Label class="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Product Description</Label>
                      <Textarea v-model="productForm.description" placeholder="Describe the luxury features..." class="rounded-2xl bg-secondary/20 border-transparent min-h-[100px]" />
                    </div>
                  </div>
                  
                  <Button class="mt-8 w-full rounded-2xl py-7 font-bold gold-glow text-lg" @click="createProduct">
                    Create Luxury Product
                  </Button>
                </div>
              </div>
            </div>

            <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <div 
                v-for="p in products" 
                :key="p.id" 
                class="group relative rounded-3xl border border-border bg-card/40 p-6 transition-all hover:border-primary/40"
              >
                <div class="flex items-start justify-between">
                   <div class="h-16 w-16 overflow-hidden rounded-2xl bg-secondary/30">
                      <img v-if="p.image_url" :src="p.image_url" class="h-full w-full object-cover" />
                      <div v-else class="flex h-full w-full items-center justify-center text-primary/40"><Package class="h-8 w-8" /></div>
                   </div>
                   <button @click="removeProduct(p.id)" class="text-muted-foreground hover:text-destructive transition-colors">
                    <Trash2 class="h-5 w-5" />
                  </button>
                </div>
                <div class="mt-4">
                  <p class="font-bold text-lg">{{ p.name }}</p>
                  <p class="text-xs text-muted-foreground mt-1">{{ p.category || 'Beauty' }}</p>
                  <div class="mt-4 flex items-center justify-between">
                     <p class="font-bold text-primary">KES {{ p.price.toLocaleString() }}</p>
                     <span class="text-[10px] font-bold uppercase text-muted-foreground">{{ p.stock }} in stock</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Testimonials View -->
          <div v-if="activeTab === 'testimonials'" class="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 class="font-serif text-4xl font-bold tracking-tight">Client Love</h2>
            
            <div class="rounded-3xl border border-border bg-card/30 p-8 backdrop-blur-sm">
              <div class="grid gap-8">
                <div class="grid gap-6 sm:grid-cols-2">
                  <div class="space-y-2">
                    <Label class="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Client Name</Label>
                    <Input v-model="testimonialForm.name" placeholder="e.g. Grace M." class="rounded-2xl h-12 bg-secondary/20 border-transparent" />
                  </div>
                  <div class="space-y-2">
                    <Label class="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Rating (1-5)</Label>
                    <div class="flex gap-2 items-center h-12 px-4 rounded-2xl bg-secondary/20">
                       <Star v-for="i in 5" :key="i" @click="testimonialForm.rate = i" 
                        :class="['h-5 w-5 cursor-pointer transition-colors', i <= testimonialForm.rate ? 'fill-primary text-primary' : 'text-muted-foreground/30']" />
                    </div>
                  </div>
                </div>
                <div class="space-y-2">
                  <Label class="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Their Experience</Label>
                  <Textarea v-model="testimonialForm.quote" placeholder="What did they say about the service?" class="rounded-2xl bg-secondary/20 border-transparent min-h-[120px]" />
                </div>
                <Button class="w-full rounded-2xl py-7 font-bold gold-glow" @click="createTestimonial">
                  Add Testimonial
                </Button>
              </div>
            </div>

            <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <div v-for="t in testimonials" :key="t.id" class="relative rounded-3xl border border-border bg-card/40 p-8">
                <button @click="removeTestimonial(t.id)" class="absolute right-6 top-6 text-muted-foreground hover:text-destructive">
                  <Trash2 class="h-4 w-4" />
                </button>
                <div class="flex gap-0.5 mb-4">
                  <Star v-for="i in t.rate" :key="i" class="h-4 w-4 fill-primary text-primary" />
                </div>
                <p class="text-sm italic text-muted-foreground leading-relaxed">"{{ t.quote }}"</p>
                <p class="mt-6 font-bold text-foreground">— {{ t.name }}</p>
              </div>
            </div>
          </div>

          <!-- Portfolio View -->
          <div v-if="activeTab === 'portfolio'" class="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 class="font-serif text-4xl font-bold tracking-tight">Artist Portfolio</h2>
            
            <div class="rounded-3xl border border-border bg-card/30 p-8 backdrop-blur-sm">
              <div class="grid gap-10 lg:grid-cols-4">
                <div class="lg:col-span-1">
                  <Label class="mb-4 block text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Work Sample</Label>
                  <ImageUpload v-model="portfolioForm.image_url" bucket="portfolio" />
                </div>
                
                <div class="lg:col-span-3 space-y-6">
                  <div class="grid gap-6 sm:grid-cols-2">
                    <div class="space-y-2">
                      <Label class="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Look Title</Label>
                      <Input v-model="portfolioForm.title" placeholder="e.g. Royal Bridal Glam" class="rounded-2xl h-12 bg-secondary/20 border-transparent" />
                    </div>
                    <div class="space-y-2">
                      <Label class="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Category</Label>
                      <Input v-model="portfolioForm.category" placeholder="e.g. Bridal" class="rounded-2xl h-12 bg-secondary/20 border-transparent" />
                    </div>
                  </div>
                  <Button class="w-full rounded-2xl py-7 font-bold gold-glow" @click="createPortfolioItem">
                    Feature in Gallery
                  </Button>
                </div>
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              <div v-for="item in portfolio" :key="item.id" class="group relative aspect-[4/5] overflow-hidden rounded-[2rem] border border-border">
                <img :src="item.image_url" class="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" />
                <div class="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100 flex flex-col items-center justify-end p-8 text-center">
                  <p class="font-serif text-xl font-bold text-white">{{ item.title }}</p>
                  <p class="mt-1 text-sm font-medium text-primary">{{ item.category }}</p>
                  <button @click="removePortfolioItem(item.id)" class="mt-6 rounded-full bg-destructive/90 p-3 text-white backdrop-blur-md transition-transform hover:scale-110">
                    <Trash2 class="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </template>
  </div>
</template>

<style scoped>
.gold-glow {
  background: linear-gradient(135deg, var(--color-accent), var(--color-primary));
  color: white;
  box-shadow: 0 10px 30px -10px rgba(212, 175, 55, 0.5);
  border: none;
  transition: all 0.3s ease;
}

.gold-glow:hover {
  transform: translateY(-2px);
  box-shadow: 0 15px 35px -10px rgba(212, 175, 55, 0.7);
  opacity: 0.95;
}

/* Custom scrollbar for dark mode */
::-webkit-scrollbar {
  width: 6px;
}
::-webkit-scrollbar-track {
  background: #050505;
}
::-webkit-scrollbar-thumb {
  background: #222;
  border-radius: 10px;
}
::-webkit-scrollbar-thumb:hover {
  background: var(--color-primary);
}
</style>
