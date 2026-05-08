<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/composables/useAuth'
import { Button } from '@/components/ui/button/index'
import { Input } from '@/components/ui/input/index'
import { Label } from '@/components/ui/label/index'
import { Textarea } from '@/components/ui/textarea/index'
import { toast } from 'vue-sonner'

type Service = { id: number; name: string; price: number }

const TIMES = ['09:00', '10:00', '11:00', '12:00', '14:00', '15:00', '16:00', '17:00']

const { user, loading } = useAuth()
const router = useRouter()
const services = ref<Service[]>([])
const serviceId = ref<number | string>('')
const date = ref('')
const time = ref('')
const notes = ref('')

const guestName = ref('')
const guestEmail = ref('')
const guestPhone = ref('')

const busy = ref(false)

onMounted(async () => {
  const { data } = await supabase
    .from('services')
    .select('id,name,price')
    .order('price')
  
  if (data) {
    services.value = data as Service[]
    serviceId.value = data[0]?.id ?? ''
  }
})

const submit = async () => {
  if (!serviceId.value || !date.value || !time.value) return toast.error('Please fill all fields')
  
  if (!user.value && (!guestName.value || !guestEmail.value || !guestPhone.value)) {
    return toast.error('Please fill in your contact details')
  }

  busy.value = true
  
  let userId = null
  
  if (user.value) {
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
    userId = publicUser.id
  }

  const { error } = await supabase.from('bookings').insert({
    user_id: userId,
    service_id: Number(serviceId.value),
    booking_date: date.value,
    booking_time: time.value,
    notes: notes.value || null,
    guest_name: user.value ? null : guestName.value,
    guest_email: user.value ? null : guestEmail.value,
    guest_phone: user.value ? null : guestPhone.value,
  })
  
  busy.value = false
  if (error) {
    if (error.code === '23505') toast.error('That slot is already booked. Pick another time.')
    else toast.error(error.message)
  } else {
    toast.success("Booking requested! We'll confirm soon.")
    if (user.value) {
      router.push('/dashboard')
    } else {
      toast.info('You can track your booking by creating an account with this email.')
      router.push('/')
    }
  }
}
</script>

<template>
  <div v-if="!loading" class="container mx-auto max-w-xl px-4 py-12">
    <h1 class="font-serif text-3xl font-bold">Book your appointment</h1>
    <p class="mt-1 text-muted-foreground">Pick your service, date, and time.</p>

    <div class="mt-6 space-y-4 rounded-2xl border border-border bg-card p-6">
      <div v-if="!user" class="space-y-4 border-b border-border pb-6 mb-6">
        <h2 class="font-serif text-xl font-bold">Contact Details</h2>
        <p class="text-sm text-muted-foreground">Booking as a guest? Please provide your details.</p>
        <div class="grid gap-4 sm:grid-cols-2">
          <div class="space-y-2">
            <Label>Full Name</Label>
            <Input v-model="guestName" placeholder="Jane Doe" />
          </div>
          <div class="space-y-2">
            <Label>Phone Number</Label>
            <Input v-model="guestPhone" placeholder="+254..." />
          </div>
        </div>
        <div class="space-y-2">
          <Label>Email Address</Label>
          <Input v-model="guestEmail" type="email" placeholder="jane@example.com" />
        </div>
        <p class="text-[10px] text-muted-foreground text-center">
          Have an account? <router-link to="/auth" class="text-primary hover:underline">Sign in instead</router-link>
        </p>
      </div>

      <div class="space-y-4">
        <h2 v-if="!user" class="font-serif text-xl font-bold">Appointment Details</h2>
        <div>
          <Label>Service</Label>
          <select
            v-model="serviceId"
            class="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option v-for="s in services" :key="s.id" :value="s.id">
              {{ s.name }} — KES {{ s.price }}
            </option>
          </select>
        </div>
        <div>
          <Label>Date</Label>
          <Input 
            v-model="date" 
            type="date" 
            :min="new Date().toISOString().slice(0, 10)" 
          />
        </div>
        <div>
          <Label>Time</Label>
          <div class="mt-2 grid grid-cols-4 gap-2">
            <button
              v-for="t in TIMES"
              :key="t"
              type="button"
              @click="time = t"
              :class="[
                'rounded-md border px-2 py-2 text-sm transition',
                time === t 
                  ? 'border-primary bg-primary text-primary-foreground' 
                  : 'border-border bg-background hover:border-primary'
              ]"
            >
              {{ t }}
            </button>
          </div>
        </div>
        <div>
          <Label>Notes (optional)</Label>
          <Textarea 
            v-model="notes" 
            placeholder="Any special requests?" 
          />
        </div>
        <Button class="w-full h-12 text-lg font-bold shadow-lg gold-glow" :disabled="busy" @click="submit">
          {{ busy ? 'Processing...' : 'Confirm Booking' }}
        </Button>
      </div>
    </div>
  </div>
</template>
