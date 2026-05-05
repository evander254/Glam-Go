<script setup lang="ts">
import { ref } from 'vue'
import { supabase } from '@/integrations/supabase/client'
import { Upload, X, Loader2, Image as ImageIcon } from 'lucide-vue-next'
import { toast } from 'vue-sonner'

const props = withDefaults(defineProps<{
  modelValue: string;
  bucket?: string;
}>(), {
  bucket: 'products'
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

const uploading = ref(false)
const dragActive = ref(false)

const uploadImage = async (file: File) => {
  if (!file.type.startsWith('image/')) {
    toast.error('Please upload an image file')
    return
  }

  uploading.value = true
  try {
    const fileExt = file.name.split('.').pop()
    const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`
    const filePath = `${fileName}`

    const { error: uploadError } = await supabase.storage
      .from(props.bucket)
      .upload(filePath, file)

    if (uploadError) throw uploadError

    const { data } = supabase.storage
      .from(props.bucket)
      .getPublicUrl(filePath)

    emit('update:modelValue', data.publicUrl)
    toast.success('Image uploaded successfully')
  } catch (error: any) {
    toast.error(error.message || 'Error uploading image')
  } finally {
    uploading.value = false
  }
}

const handleFileSelect = (e: Event) => {
  const target = e.target as HTMLInputElement
  if (target.files && target.files[0]) {
    uploadImage(target.files[0])
  }
}

const handleDrop = (e: DragEvent) => {
  dragActive.value = false
  if (e.dataTransfer?.files && e.dataTransfer.files[0]) {
    uploadImage(e.dataTransfer.files[0])
  }
}

const removeImage = () => {
  emit('update:modelValue', '')
}
</script>

<template>
  <div class="space-y-2">
    <div
      @dragover.prevent="dragActive = true"
      @dragleave.prevent="dragActive = false"
      @drop.prevent="handleDrop"
      :class="[
        'relative flex min-h-[160px] cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed transition-all duration-200',
        dragActive ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50 hover:bg-secondary/20',
        props.modelValue ? 'border-solid border-primary/20 bg-secondary/10' : ''
      ]"
    >
      <input
        type="file"
        class="absolute inset-0 z-10 cursor-pointer opacity-0"
        accept="image/*"
        @change="handleFileSelect"
        :disabled="uploading"
      />

      <template v-if="uploading">
        <Loader2 class="h-10 w-10 animate-spin text-primary" />
        <p class="mt-2 text-sm font-medium text-muted-foreground">Uploading image...</p>
      </template>

      <template v-else-if="props.modelValue">
        <div class="relative h-32 w-32 overflow-hidden rounded-xl border border-border shadow-sm">
          <img :src="props.modelValue" class="h-full w-full object-cover" />
          <button
            @click.stop="removeImage"
            class="absolute right-1 top-1 z-20 rounded-full bg-destructive p-1 text-white shadow-lg hover:bg-destructive/90"
          >
            <X class="h-3 w-3" />
          </button>
        </div>
        <p class="mt-2 text-xs text-muted-foreground">Click or drag to replace</p>
      </template>

      <template v-else>
        <div class="flex flex-col items-center p-6 text-center">
          <div class="mb-3 rounded-full bg-primary/10 p-3 text-primary">
            <Upload class="h-6 w-6" />
          </div>
          <p class="text-sm font-semibold">Drop your image here</p>
          <p class="mt-1 text-xs text-muted-foreground">or click to browse files</p>
          <p class="mt-4 text-[10px] uppercase tracking-widest text-muted-foreground">PNG, JPG, WebP up to 5MB</p>
        </div>
      </template>
    </div>
  </div>
</template>
