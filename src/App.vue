<template>
  <div class="min-h-screen">
    <Menubar v-if="authStore.isAuthenticated" :model="menuItems" class="mb-4">
      <template #end>
        <Button label="Cerrar Sesión" icon="pi pi-power-off" @click="logout" class="p-button-text" />
      </template>
    </Menubar>
    
    <div class="container">
      <router-view v-slot="{ Component }">
        <transition
          enter-active-class="animate__animated animate__fadeIn"
          leave-active-class="animate__animated animate__fadeOut"
          mode="out-in"
        >
          <component :is="Component" />
        </transition>
      </router-view>
    </div>
    <Toast />
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from './stores/auth';
import Menubar from 'primevue/menubar';
import Button from 'primevue/button';
import Toast from 'primevue/toast';

const router = useRouter();
const authStore = useAuthStore();

const menuItems = computed(() => {
  const items = [
    {
      label: 'Inicio',
      icon: 'pi pi-home',
      to: '/'
    }
  ];

  if (authStore.isAdmin) {
    items.push({
      label: 'Administración',
      icon: 'pi pi-cog',
      to: '/admin'
    });
  }

  items.push({
    label: 'Ventas',
    icon: 'pi pi-shopping-cart',
    to: '/ventas'
  });

  return items;
});

const logout = () => {
  authStore.logout();
  router.push('/login');
};
</script>

<style>
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}
</style>