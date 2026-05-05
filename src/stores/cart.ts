import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export type CartItem = {
  id: number | string;
  name: string;
  price: number;
  quantity: number;
};

export const useCartStore = defineStore('cart', () => {
  const items = ref<CartItem[]>([]);

  const add = (item: Omit<CartItem, 'quantity'>) => {
    const existing = items.value.find((i) => i.id === item.id);
    if (existing) {
      existing.quantity += 1;
    } else {
      items.value.push({ ...item, quantity: 1 });
    }
  };

  const remove = (id: number | string) => {
    items.value = items.value.filter((i) => i.id !== id);
  };

  const setQty = (id: number | string, qty: number) => {
    const item = items.value.find((i) => i.id === id);
    if (item) {
      item.quantity = Math.max(1, qty);
    }
  };

  const clear = () => {
    items.value = [];
  };

  const total = computed(() => items.value.reduce((s, i) => s + i.price * i.quantity, 0));
  const count = computed(() => items.value.reduce((s, i) => s + i.quantity, 0));

  return {
    items,
    add,
    remove,
    setQty,
    clear,
    total,
    count,
  };
});
