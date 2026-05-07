<script setup lang="ts">
import { Sparkles, Instagram, Phone, MapPin, Mail } from 'lucide-vue-next';
</script>

<template>
  <footer class="bg-white border-t border-primary/10 pt-20 pb-10">
    <div class="container mx-auto px-4 lg:px-8">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
        <!-- Brand Section -->
        <div class="space-y-6">
          <router-link to="/" class="flex items-center gap-3">
            <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-accent/20">
              <Sparkles class="h-6 w-6 text-primary" />
            </div>
            <span class="font-serif text-2xl font-bold tracking-tight text-foreground">
              Glam &amp; Go <span class="text-gradient-gold italic font-medium">by Pam</span>
            </span>
          </router-link>
          <p class="text-muted-foreground leading-relaxed">
            Elegance redefined. Providing luxury makeup artistry for bridal, glam, editorial and special occasions.
          </p>
          <div class="flex items-center gap-4">
            <a href="https://www.instagram.com/glamandgo.by_pam/" class="h-10 w-10 flex items-center justify-center rounded-full bg-primary/5 text-primary hover:bg-primary hover:text-white transition-all shadow-sm">
              <Instagram class="h-5 w-5" />
            </a>
            <a href="mailto:glamandgo.by_pam@gmail.com" class="h-10 w-10 flex items-center justify-center rounded-full bg-primary/5 text-primary hover:bg-primary hover:text-white transition-all shadow-sm">
              <Mail class="h-5 w-5" />
            </a>
          </div>
        </div>

        <!-- Quick Links -->
        <div>
          <h4 class="font-serif text-lg font-bold mb-6">Quick Links</h4>
          <ul class="space-y-4">
            <li><router-link to="/" class="text-muted-foreground hover:text-primary transition-colors">Home</router-link></li>
            <li><router-link to="/book" class="text-muted-foreground hover:text-primary transition-colors">Book Appointment</router-link></li>
            <li><router-link to="/shop" class="text-muted-foreground hover:text-primary transition-colors">Shop Products</router-link></li>
            <li><router-link to="/auth" class="text-muted-foreground hover:text-primary transition-colors">Sign In</router-link></li>
          </ul>
        </div>

        <!-- Services -->
        <div>
          <h4 class="font-serif text-lg font-bold mb-6">Our Services</h4>
          <ul class="space-y-4">
            <li class="text-muted-foreground">Bridal Makeup</li>
            <li class="text-muted-foreground">Soft Glam</li>
            <li class="text-muted-foreground">Full Glam</li>
            <li class="text-muted-foreground">Editorial & Fashion</li>
          </ul>
        </div>

        <!-- Contact Info -->
        <div>
          <h4 class="font-serif text-lg font-bold mb-6">Contact Us</h4>
          <ul class="space-y-4">
            <li class="flex items-start gap-3 text-muted-foreground">
              <Phone class="h-5 w-5 text-primary shrink-0" />
              <span>+254 732 239117</span>
            </li>
            <li class="flex items-start gap-3 text-muted-foreground">
              <MapPin class="h-5 w-5 text-primary shrink-0" />
              <span>Nairobi, Kenya</span>
            </li>
            <li class="flex items-start gap-3 text-muted-foreground">
              <Instagram class="h-5 w-5 text-primary shrink-0" />
              <span>@glamandgo.by_pam</span>
            </li>
          </ul>
        </div>
      </div>

      <div class="pt-8 border-t border-primary/5 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
        <p>&copy; 2024 Glam &amp; Go by Pam. All rights reserved.</p>
        <div class="flex items-center gap-6">
          <a href="#" class="hover:text-primary transition-colors">Privacy Policy</a>
          <a href="#" class="hover:text-primary transition-colors">Terms of Service</a>
        </div>
      </div>
    </div>
  </footer>
</template>
