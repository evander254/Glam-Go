<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { Sparkles, Calendar, ShoppingBag, Star, CheckCircle2, ArrowRight, Instagram, Phone, MapPin } from 'lucide-vue-next';
import { Button } from '@/components/ui/button/index';
import { supabase } from '@/integrations/supabase/client';

// Fallback images for static sections
import heroImg from '@/assets/hero.jpg';
import pamImg from '@/assets/pam.jpg';

const services = [
  { name: "Soft Glam", price: 1000, desc: "Flawless natural finish for daytime events or professional photos." },
  { name: "Full Glam", price: 1200, desc: "High impact evening look with dramatic eyes and perfect contouring." },
  { name: "Natural Look", price: 800, desc: "Enhancing your natural features for a fresh, effortless glow." },
  { name: "Bridal Trial", price: 1500, desc: "A detailed consultation to perfect your wedding day look." },
  { name: "Bridal Glam", price: 2500, desc: "Premium wedding day service including long-wear finish and lashes." },
  { name: "Editorial", price: 2000, desc: "Creative and artistic looks for fashion shoots and magazines." },
];

const testimonials = ref<any[]>([]);
const portfolio = ref<any[]>([]);

onMounted(async () => {
  // Fetch testimonials
  const { data: tData } = await supabase.from('testimonials').select('*').order('created_at', { ascending: false });
  if (tData) testimonials.value = tData;

  // Fetch portfolio
  const { data: pData } = await supabase.from('portfolio').select('*').order('created_at', { ascending: false });
  if (pData) portfolio.value = pData;
});
</script>

<template>
  <div class="overflow-x-hidden">
    <!-- HERO SECTION -->
    <section class="relative min-h-[90vh] flex items-center justify-center overflow-hidden pt-20">
      <!-- Background Image with Overlay -->
      <div class="absolute inset-0 z-0">
        <img :src="heroImg" alt="Luxury Makeup Artistry" class="w-full h-full object-cover" />
        <div class="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-background" />
      </div>

      <div class="container relative z-10 mx-auto px-4 text-center">
        <div class="animate-in fade-in slide-in-from-bottom-8 duration-1000">
          <span class="inline-flex items-center gap-2 rounded-full bg-primary/20 backdrop-blur-md px-6 py-2 text-xs font-bold tracking-[0.2em] text-white uppercase border border-white/20 mb-8">
            <Sparkles class="h-4 w-4 text-accent" /> Professional Artistry
          </span>
          <h1 class="font-serif text-6xl md:text-8xl font-bold text-white mb-6 leading-tight">
            Elegance, <span class="text-gradient-pink italic">Redefined.</span>
          </h1>
          <p class="max-w-2xl mx-auto text-lg md:text-xl text-white/80 mb-12 font-sans leading-relaxed">
            Luxury makeup artistry for bridal, glam, editorial & special occasions. Experience beauty tailored just for you.
          </p>
          <div class="flex flex-col sm:flex-row items-center justify-center gap-6">
            <router-link to="/book">
              <Button size="lg" class="rounded-full px-10 h-14 text-base shadow-xl gold-glow hover-lift bg-primary hover:bg-primary/90 text-white">
                <Calendar class="mr-2 h-5 w-5" /> Book Appointment
              </Button>
            </router-link>
            <a href="#services">
              <Button size="lg" variant="outline" class="rounded-full px-10 h-14 text-base border-white/30 text-white bg-leopard hover:bg-white/10 backdrop-blur-sm transition-all shadow-lg">
                View Services
              </Button>
            </a>
          </div>
        </div>
      </div>
      
      <!-- Scroll Indicator -->
      <div class="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce opacity-50 hidden md:block">
        <div class="w-[1px] h-12 bg-white/50 mx-auto" />
      </div>
    </section>

    <!-- SERVICES SECTION -->
    <section id="services" class="py-32 bg-background relative overflow-hidden">
      <!-- Subtle leopard accent -->
      <div class="absolute -right-20 top-40 h-80 w-80 bg-leopard opacity-5 blur-3xl rounded-full" />
      
      <div class="container mx-auto px-4 relative z-10">
        <div class="text-center mb-20">
          <h2 class="font-serif text-4xl md:text-5xl font-bold mb-4">Signature Services</h2>
          <p class="text-muted-foreground max-w-2xl mx-auto text-lg">Expertly crafted looks for every occasion. Each session includes premium products and a personalized consultation.</p>
          <div class="mt-8 flex justify-center items-center gap-3">
            <div class="h-[1px] w-12 bg-primary/30" />
            <Sparkles class="h-4 w-4 text-primary" />
            <div class="h-[1px] w-12 bg-primary/30" />
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div 
            v-for="service in services" 
            :key="service.name" 
            class="group glass-card rounded-3xl p-8 hover-lift border-primary/5 hover:border-primary/20 transition-all"
          >
            <div class="flex justify-between items-start mb-6">
              <h3 class="font-serif text-2xl font-bold">{{ service.name }}</h3>
              <span class="bg-primary/10 text-primary px-4 py-1 rounded-full text-sm font-bold">KES {{ service.price }}</span>
            </div>
            <p class="text-muted-foreground mb-10 leading-relaxed">{{ service.desc }}</p>
            <router-link to="/book">
              <Button variant="ghost" class="w-full rounded-2xl group-hover:bg-primary group-hover:text-white transition-all py-6 border border-primary/10">
                Book Now <ArrowRight class="ml-2 h-4 w-4" />
              </Button>
            </router-link>
          </div>
        </div>
      </div>
    </section>

    <!-- ABOUT SECTION -->
    <section class="py-32 bg-secondary/20">
      <div class="container mx-auto px-4">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <div class="relative group">
            <div class="absolute -inset-4 bg-gradient-to-tr from-primary/30 to-accent/30 blur-2xl opacity-40 group-hover:opacity-60 transition-opacity" />
            <div class="relative rounded-[2.5rem] overflow-hidden shadow-2xl border-8 border-card">
              <img :src="pamImg" alt="Pam - Makeup Artist" class="w-full aspect-[4/5] object-cover" />
            </div>
            <!-- Experience Badge -->
            <div class="absolute -bottom-6 -right-6 bg-card p-6 rounded-2xl shadow-xl border border-primary/10 flex items-center gap-4 animate-in fade-in zoom-in duration-700">
              <div class="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Sparkles class="h-6 w-6 text-primary" />
              </div>
              <div>
                <p class="text-xs font-bold uppercase tracking-widest text-muted-foreground">Certified</p>
                <p class="font-serif text-lg font-bold">Makeup Artist</p>
              </div>
            </div>
          </div>
          
          <div class="space-y-8">
            <span class="text-primary font-bold tracking-[0.2em] uppercase text-sm">Meet Your Artist</span>
            <h2 class="font-serif text-4xl md:text-5xl font-bold">Beauty with a Personal Touch</h2>
            <p class="text-lg text-muted-foreground leading-relaxed">
              Hi, I'm Pam! Certified makeup artist specializing in bridal and glam looks. With years of experience in the beauty industry, my goal is to make every client feel like the most beautiful version of themselves.
            </p>
            <ul class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <li v-for="item in ['Experienced Professional', 'High-quality Products', 'Personalized Service', 'Attention to Detail']" :key="item" class="flex items-center gap-3 text-muted-foreground font-medium">
                <CheckCircle2 class="h-5 w-5 text-primary" />
                {{ item }}
              </li>
            </ul>
            <div class="pt-6">
              <router-link to="/book">
                <Button class="rounded-full px-8 h-12">Learn More About My Process</Button>
              </router-link>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- PORTFOLIO SECTION -->
    <section class="py-32 bg-background">
      <div class="container mx-auto px-4">
        <div class="text-center mb-20">
          <h2 class="font-serif text-4xl md:text-5xl font-bold mb-4">My Portfolio</h2>
          <p class="text-muted-foreground max-w-2xl mx-auto text-lg">A showcase of recent transformations and artistic work.</p>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div 
            v-for="item in portfolio" 
            :key="item.id" 
            class="group relative overflow-hidden rounded-[2rem] shadow-md aspect-[3/4]"
          >
            <img :src="item.image_url" :alt="item.title" class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
            <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-end p-8 text-white">
              <p class="text-xs font-bold uppercase tracking-widest text-primary mb-2">{{ item.category }}</p>
              <h4 class="font-serif text-xl font-bold">{{ item.title }}</h4>
            </div>
          </div>
        </div>
        
        <div class="text-center mt-16">
          <a href="https://www.instagram.com/glamandgo.by_pam/" target="_blank" rel="noopener noreferrer">
            <Button variant="outline" class="rounded-full px-10 h-12 border-primary/20 hover:border-primary transition-all">
              Follow on Instagram <Instagram class="ml-2 h-4 w-4" />
            </Button>
          </a>
        </div>
      </div>
    </section>

    <!-- TESTIMONIALS SECTION -->
    <section class="py-32 bg-primary/5 relative">
      <div class="container mx-auto px-4">
        <div class="text-center mb-20">
          <h2 class="font-serif text-4xl md:text-5xl font-bold mb-4">Client Love</h2>
          <div class="flex justify-center gap-1 text-accent">
            <Star v-for="i in 5" :key="i" class="h-5 w-5 fill-current" />
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div 
            v-for="t in testimonials" 
            :key="t.id" 
            class="bg-card p-10 rounded-3xl shadow-sm border border-primary/5 relative hover-lift"
          >
            <div class="absolute top-0 left-10 -translate-y-1/2 bg-primary h-12 w-12 rounded-2xl flex items-center justify-center text-white shadow-lg">
              <span class="text-2xl font-serif">"</span>
            </div>
            <div class="flex gap-1 text-accent mb-6">
              <Star v-for="i in t.rate" :key="i" class="h-4 w-4 fill-current" />
            </div>
            <p class="text-muted-foreground mb-8 italic leading-relaxed">"{{ t.quote }}"</p>
            <p class="font-bold text-foreground">{{ t.name }}</p>
            <p class="text-xs text-muted-foreground uppercase tracking-widest mt-1">Verified Client</p>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA SECTION -->
    <section class="py-32 relative overflow-hidden">
      <!-- Background Decorations -->
      <div class="absolute inset-0 bg-primary/90 z-0" />
      <div class="absolute top-0 right-0 w-1/3 h-full bg-leopard opacity-10 z-1" />
      
      <div class="container relative z-10 mx-auto px-4 text-center text-white">
        <div class="max-w-3xl mx-auto space-y-10">
          <h2 class="font-serif text-5xl md:text-7xl font-bold leading-tight">Ready to Get Glam?</h2>
          <p class="text-xl text-white/80 leading-relaxed font-sans">
            Book your appointment today and let's create a look you'll love. Limited slots available for the upcoming season.
          </p>
          <div class="flex flex-col sm:flex-row items-center justify-center gap-6 pt-4">
            <router-link to="/book">
              <Button size="lg" class="bg-foreground text-background hover:bg-secondary rounded-full px-12 h-16 text-lg font-bold shadow-2xl hover-lift">
                Book Your Session Now
              </Button>
            </router-link>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.animate-in {
  animation: animate-in 1s ease-out;
}

@keyframes animate-in {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
