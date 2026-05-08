import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth'
import { supabase } from '@/integrations/supabase/client'
import { Button } from '@/components/ui/button/index'
import { Input } from '@/components/ui/input/index'
import { Label } from '@/components/ui/label/index'
import { toast } from 'vue-sonner'
import { KeyRound, ShieldCheck, AlertCircle } from 'lucide-vue-next'

const { updatePassword, initAuth } = useAuth()
const router = useRouter()
const password = ref('')
const confirmPassword = ref('')
const busy = ref(false)
const checking = ref(true)

onMounted(async () => {
  await initAuth()
  const { data } = await supabase.auth.getSession()
  
  if (!data.session) {
    toast.error('Session expired or invalid link. Please request a new password reset.')
    router.push('/auth')
  }
  checking.value = false
})

const handleUpdate = async () => {
  if (!password.value || password.value !== confirmPassword.value) {
    toast.error('Passwords do not match')
    return
  }
  
  busy.value = true
  const { error } = await updatePassword(password.value)
  busy.value = false
  
  if (error) {
    toast.error(error)
  } else {
    toast.success('Password updated successfully!')
    router.push('/auth')
  }
}
</script>

<template>
  <div class="relative flex min-h-[calc(100vh-5rem)] items-center justify-center px-4 py-12 overflow-hidden bg-secondary/20">
    <div class="absolute left-0 top-0 h-96 w-96 bg-primary/10 blur-[120px] rounded-full -ml-48 -mt-48" />
    <div class="absolute right-0 bottom-0 h-96 w-96 bg-accent/10 blur-[120px] rounded-full -mr-48 -mb-48" />
    
    <div class="relative w-full max-w-md">
      <div class="mb-8 text-center">
        <div class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-card shadow-md gold-glow">
          <KeyRound class="h-8 w-8 text-primary" />
        </div>
        <h1 class="font-serif text-3xl font-bold">New Password</h1>
        <p class="mt-2 text-muted-foreground">Secure your account with a new password.</p>
      </div>

      <div class="overflow-hidden rounded-3xl border border-border bg-card/70 p-8 shadow-xl backdrop-blur-sm">
        <div v-if="checking" class="flex flex-col items-center justify-center py-12 space-y-4">
          <div class="h-10 w-10 animate-spin rounded-full border-4 border-primary/30 border-t-primary" />
          <p class="text-sm text-muted-foreground">Verifying security session...</p>
        </div>

        <div v-else class="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div class="flex items-center gap-2 rounded-xl bg-green-500/10 p-4 text-green-700 dark:bg-green-500/20 dark:text-green-400">
            <ShieldCheck class="h-5 w-5 shrink-0" />
            <p class="text-xs font-medium">Reset link verified. You can now choose a new password.</p>
          </div>

          <div class="space-y-2">
            <Label class="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">New Password</Label>
            <Input v-model="password" type="password" placeholder="••••••••" class="rounded-xl border-secondary/50 bg-background/50 focus:ring-primary/20" />
          </div>
          <div class="space-y-2">
            <Label class="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">Confirm Password</Label>
            <Input v-model="confirmPassword" type="password" placeholder="••••••••" class="rounded-xl border-secondary/50 bg-background/50 focus:ring-primary/20" />
          </div>
          <Button class="w-full rounded-xl py-6 shadow-lg shadow-primary/20 gold-glow" :disabled="busy" @click="handleUpdate">
            <KeyRound v-if="!busy" class="mr-2 h-4 w-4" />
            {{ busy ? 'Updating...' : 'Set New Password' }}
          </Button>
        </div>
      </div>
    </div>
  </div>
</template>
