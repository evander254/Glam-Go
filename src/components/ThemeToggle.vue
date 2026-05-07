<script setup lang="ts">
import { Sun, Moon } from 'lucide-vue-next';
import { useDark, useToggle } from '@vueuse/core';
import { Button } from '@/components/ui/button/index';

const isDark = useDark();
const toggleDark = useToggle(isDark);
</script>

<template>
  <Button
    variant="ghost"
    size="icon"
    class="rounded-full h-10 w-10 text-foreground/80 hover:text-primary hover:bg-primary/10 transition-all"
    @click="toggleDark()"
    aria-label="Toggle theme"
  >
    <Sun v-if="isDark" class="h-5 w-5" />
    <Moon v-else class="h-5 w-5" />
  </Button>
</template>
