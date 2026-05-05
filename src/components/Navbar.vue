<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { useRoute } from 'vue-router';
import { ShoppingBag, Sparkles } from 'lucide-vue-next';
import { useAuth } from '@/composables/useAuth';
import { useCartStore } from '@/stores/cart';
import { Button } from '@/components/ui/button/index';

const route = useRoute();
const { user, isAdmin, signOut } = useAuth();
const cart = useCartStore();

const isScrolled = ref(false);

const handleScroll = () => {
  isScrolled.value = window.scrollY > 20;
};

onMounted(() => {
  window.addEventListener('scroll', handleScroll);
});

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll);
});

const linkCls = "text-sm font-medium text-foreground/80 hover:text-primary transition-colors font-poppins relative after:content-[''] after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-[2px] after:bg-primary after:transition-all hover:after:w-full";
const activeCls = "text-primary after:w-full";

const isActive = (path: string) => route.path === path;
</script>

<template>
  <header 
    :class="[
      'sticky top-0 z-50 w-full transition-all duration-300',
      isScrolled ? 'bg-white/80 backdrop-blur-md shadow-lg border-b border-primary/10 py-2' : 'bg-transparent py-4'
    ]"
  >
    <div class="container mx-auto flex items-center justify-between px-4 lg:px-8">
      <router-link to="/" class="flex items-center gap-3 group">
        <div class="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 shadow-sm transition-transform group-hover:scale-110">
          <Sparkles class="h-6 w-6 text-primary" />
          <div class="absolute -inset-1 bg-primary/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
        <span class="font-serif text-2xl font-bold tracking-tight text-foreground hidden sm:block">
          Glam &amp; Go <span class="text-gradient-gold italic font-medium">by Pam</span>
        </span>
      </router-link>

      <nav class="hidden items-center gap-10 md:flex">
        <router-link to="/" :class="[linkCls, { [activeCls]: isActive('/') }]">
          Home
        </router-link>
        <router-link to="/book" :class="[linkCls, { [activeCls]: isActive('/book') }]">
          Book
        </router-link>
        <router-link to="/shop" :class="[linkCls, { [activeCls]: isActive('/shop') }]">
          Shop
        </router-link>
        <router-link v-if="user" to="/dashboard" :class="[linkCls, { [activeCls]: isActive('/dashboard') }]">
          Dashboard
        </router-link>
        <router-link v-if="isAdmin" to="/admin" :class="[linkCls, { [activeCls]: isActive('/admin') }]">
          Admin
        </router-link>
      </nav>

      <div class="flex items-center gap-4">
        <router-link to="/cart" class="relative inline-flex h-12 w-12 items-center justify-center rounded-full hover:bg-primary/10 transition-all group">
          <ShoppingBag class="h-6 w-6 text-foreground/80 group-hover:text-primary transition-colors" />
          <span v-if="cart.count > 0" class="absolute right-1 top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-white shadow-lg gold-glow">
            {{ cart.count }}
          </span>
        </router-link>
        
        <div class="h-8 w-[1px] bg-border mx-2 hidden sm:block" />

        <template v-if="user">
          <Button size="sm" variant="ghost" class="rounded-full px-6 text-muted-foreground hover:text-primary" @click="signOut">
            Sign out
          </Button>
        </template>
        <template v-else>
          <router-link to="/auth">
            <Button size="sm" class="rounded-full px-8 bg-primary hover:bg-primary/90 text-white shadow-md hover:shadow-lg transition-all">
              Sign in
            </Button>
          </router-link>
        </template>
      </div>
    </div>
  </header>
</template>
