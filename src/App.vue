<script setup lang="ts">
import { Toaster } from '@/components/ui/sonner/index';
import Navbar from '@/components/Navbar.vue';
import Footer from '@/components/Footer.vue';
import { useAuth } from '@/composables/useAuth';

// Initialize auth
const { initAuth } = useAuth();
initAuth();
</script>

<template>
  <div class="flex min-h-screen flex-col">
    <Navbar />
    <main class="flex-1">
      <router-view />
    </main>
    <Footer />
  </div>
  <Toaster />
</template>

<style>
/* Global styles are in styles.css */
</style>
