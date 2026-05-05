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
  if (!user.value) return router.push('/auth')
  if (!serviceId.value || !date.value || !time.value) return toast.error('Please fill all fields')
  
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

  const { error } = await supabase.from('bookings').insert({
    user_id: publicUser.id,
    service_id: Number(serviceId.value),
    booking_date: date.value,
    booking_time: time.value,
    notes: notes.value || null,
  })
  
  busy.value = false
  if (error) {
    if (error.code === '23505') toast.error('That slot is already booked. Pick another time.')
    else toast.error(error.message)
  } else {
    toast.success("Booking requested! We'll confirm soon.")
    router.push('/dashboard')
  }
}
</script>

<template>
  <div v-if="!loading" class="container mx-auto max-w-xl px-4 py-12">
    <h1 class="font-serif text-3xl font-bold">Book your appointment</h1>
    <p class="mt-1 text-muted-foreground">Pick your service, date, and time.</p>

    <div v-if="!user" class="mt-6 rounded-2xl border border-border bg-card p-6 text-center">
      <p class="text-sm text-muted-foreground">Please sign in to book.</p>
      <router-link to="/auth">
        <Button class="mt-4">Sign in</Button>
      </router-link>
    </div>
    <div v-else class="mt-6 space-y-4 rounded-2xl border border-border bg-card p-6">
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
      <Button class="w-full" :disabled="busy" @click="submit">
        {{ busy ? 'Booking...' : 'Confirm Booking' }}
      </Button>
    </div>
  </div>
</template>
