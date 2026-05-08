<script setup lang="ts">
import { ref, watchEffect } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth'
import { Button } from '@/components/ui/button/index'
import { Input } from '@/components/ui/input/index'
import { Label } from '@/components/ui/label/index'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs/index'
import { toast } from 'vue-sonner'
import { Sparkles } from 'lucide-vue-next'

const { user, signIn, signUp, resetPassword } = useAuth()
const router = useRouter()
const email = ref('')
const fullName = ref('')
const phone = ref('')
const password = ref('')
const busy = ref(false)
const showReset = ref(false)

watchEffect(() => {
  if (user.value) {
    router.push('/dashboard')
  }
})

const handle = async (mode: 'in' | 'up') => {
  if (!email.value || !password.value) {
    toast.error('Please fill in all fields')
    return
  }
  
  busy.value = true
  const { error } = mode === 'in' 
    ? await signIn(email.value, password.value) 
    : await signUp(email.value, password.value, fullName.value, phone.value)
  
  busy.value = false
  if (error) {
    toast.error(error)
  } else if (mode === 'up') {
    toast.success('Account created! Check your email to confirm.')
  } else {
    toast.success('Welcome back!')
  }
}

const handleReset = async () => {
  if (!email.value) {
    toast.error('Please enter your email')
    return
  }
  busy.value = true
  const { error } = await resetPassword(email.value)
  busy.value = false
  if (error) {
    toast.error(error)
  } else {
    toast.success('Password reset email sent!')
    showReset.value = false
  }
}
</script>

<template>
  <div class="relative flex min-h-[calc(100vh-5rem)] items-center justify-center px-4 py-12 overflow-hidden bg-secondary/20">
    <!-- Background accents -->
    <div class="absolute left-0 top-0 h-96 w-96 bg-primary/10 blur-[120px] rounded-full -ml-48 -mt-48" />
    <div class="absolute right-0 bottom-0 h-96 w-96 bg-accent/10 blur-[120px] rounded-full -mr-48 -mb-48" />
    
    <div class="relative w-full max-w-md">
      <div class="mb-8 text-center">
        <div class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-card shadow-md gold-glow">
          <Sparkles class="h-8 w-8 text-primary" />
        </div>
        <h1 class="font-serif text-3xl font-bold">{{ showReset ? 'Reset Password' : 'Join Glam & Go' }}</h1>
        <p class="mt-2 text-muted-foreground">
          {{ showReset ? 'Enter your email to receive a reset link.' : 'Elegance is just a few clicks away.' }}
        </p>
      </div>

      <div class="overflow-hidden rounded-3xl border border-border bg-card/70 p-8 shadow-xl backdrop-blur-sm">
        <div v-if="showReset" class="space-y-5 animate-in fade-in slide-in-from-bottom-2">
          <div class="space-y-2">
            <Label class="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">Email Address</Label>
            <Input v-model="email" type="email" placeholder="pam@example.com" class="rounded-xl border-secondary/50 bg-background/50 focus:ring-primary/20" />
          </div>
          <Button class="w-full rounded-xl py-6 shadow-lg shadow-primary/20 gold-glow" :disabled="busy" @click="handleReset">
            {{ busy ? 'Sending...' : 'Send Reset Link' }}
          </Button>
          <button @click="showReset = false" class="w-full text-center text-sm text-primary hover:underline">
            Back to Sign in
          </button>
        </div>

        <Tabs v-else default-value="in" class="w-full">
          <TabsList class="grid w-full grid-cols-2 rounded-xl bg-secondary/30 p-1">
            <TabsTrigger value="in" class="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">Sign in</TabsTrigger>
            <TabsTrigger value="up" class="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">Sign up</TabsTrigger>
          </TabsList>
          
          <TabsContent value="in" class="mt-8 space-y-5 animate-in fade-in slide-in-from-bottom-2">
            <div class="space-y-2">
              <Label class="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">Email or Username</Label>
              <Input v-model="email" type="text" placeholder="Enter Email Address" class="rounded-xl border-secondary/50 bg-background/50 focus:ring-primary/20" />
            </div>
            <div class="space-y-2">
              <div class="flex justify-between items-center px-1">
                <Label class="text-xs font-bold uppercase tracking-wider text-muted-foreground">Password</Label>
                <button @click="showReset = true" class="text-[10px] text-primary hover:underline">Forgot password?</button>
              </div>
              <Input v-model="password" type="password" placeholder="Enter Password" class="rounded-xl border-secondary/50 bg-background/50 focus:ring-primary/20" />
            </div>
            <Button class="w-full rounded-xl py-6 shadow-lg shadow-primary/20 gold-glow" :disabled="busy" @click="handle('in')">
              {{ busy ? 'Signing in...' : 'Sign in' }}
            </Button>
          </TabsContent>

          <TabsContent value="up" class="mt-8 space-y-5 animate-in fade-in slide-in-from-bottom-2">
            <div class="space-y-2">
              <Label class="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">Email Address</Label>
              <Input v-model="email" type="email" placeholder="pam@example.com" class="rounded-xl border-secondary/50 bg-white/50 focus:ring-primary/20" />
            </div>
            <div class="space-y-2">
              <Label class="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">Full Name</Label>
              <Input v-model="fullName" placeholder="Jane Doe" class="rounded-xl border-secondary/50 bg-white/50 focus:ring-primary/20" />
            </div>
            <div class="space-y-2">
              <Label class="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">Phone Number</Label>
              <Input v-model="phone" placeholder="+254..." class="rounded-xl border-secondary/50 bg-white/50 focus:ring-primary/20" />
            </div>
            <div class="space-y-2">
              <Label class="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">Password</Label>
              <Input v-model="password" type="password" placeholder="Create a strong password" class="rounded-xl border-secondary/50 bg-white/50 focus:ring-primary/20" />
            </div>
            <Button class="w-full rounded-xl py-6 shadow-lg shadow-primary/20 gold-glow" :disabled="busy" @click="handle('up')">
              {{ busy ? 'Creating account...' : 'Create account' }}
            </Button>
            <p class="text-center text-[10px] text-muted-foreground px-4">
              By creating an account, you agree to our Terms and Service and Privacy Policy.
            </p>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  </div>
</template>
