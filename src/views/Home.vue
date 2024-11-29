<template>
  <div>
    <!-- Hero Section -->
    <section class="hero-section">
      <h1 class="hero-title">Bienvenido a CineStore</h1>
      <p class="hero-subtitle">Las mejores películas a un solo clic</p>
      <div v-if="!authStore.isAuthenticated" class="auth-buttons mt-4">
        <Button label="Iniciar Sesión" icon="pi pi-user" @click="router.push('/login')" />
        <Button label="Registrarse" icon="pi pi-user-plus" severity="secondary" @click="router.push('/registro')" />
      </div>
    </section>

    <!-- Ofertas Destacadas -->
    <div class="container" v-if="discountedMovies.length > 0">
      <div class="flex justify-content-between align-items-center mb-4">
        <h2 class="text-3xl font-bold m-0">
          <i class="pi pi-tag mr-2"></i>
          Ofertas Especiales
        </h2>
      </div>
      <Carousel :value="discountedMovies" :numVisible="4" :numScroll="1" :responsiveOptions="carouselResponsiveOptions"
        class="mb-5">
        <template #item="slotProps">
          <div class="border-1 surface-border border-round m-2 text-center py-5 px-3">
            <div class="relative">
              <img :src="slotProps.data.image" :alt="slotProps.data.title" class="w-full h-12rem object-cover mb-3" />
              <span class="discount-badge">-{{ slotProps.data.discount }}%</span>
            </div>
            <div class="text-2xl font-bold">{{ slotProps.data.title }}</div>
            <div class="mb-3">
              <span class="text-xl line-through text-500">${{ slotProps.data.price }}</span>
              <span class="text-xl text-primary font-bold ml-2">${{ calculateDiscountedPrice(slotProps.data) }}</span>
            </div>
            <Button :disabled="slotProps.data.stock === 0" @click="handlePurchase(slotProps.data)"
              :label="slotProps.data.stock > 0 ? 'Comprar Ahora' : 'Sin Stock'" class="p-button-rounded" />
          </div>
        </template>
      </Carousel>
    </div>

    <!-- Catálogo Principal -->
    <div class="container">
      <div class="category-section">
        <TabView>
          <TabPanel header="Todas las Películas">
            <div class="grid">
              <div v-for="movie in movies" :key="movie.id" class="col-12 sm:col-6 lg:col-4 xl:col-3 p-2">
                <div class="movie-card">
                  <Card class="h-full">
                    <template #header>
                      <div class="movie-image">
                        <img :src="movie.image" :alt="movie.title" class="w-full h-12rem object-cover" />
                        <span class="price-tag" v-if="movie.discount > 0">
                          -{{ movie.discount }}%
                        </span>
                      </div>
                    </template>
                    <template #title>
                      <div class="text-xl font-bold mb-2">{{ movie.title }}</div>
                    </template>
                    <template #subtitle>
                      <div class="flex align-items-center gap-2 mb-3">
                        <span class="text-xl" :class="{ 'line-through text-500': movie.discount > 0 }">
                          ${{ movie.price }}
                        </span>
                        <span v-if="movie.discount > 0" class="text-xl text-primary font-bold">
                          ${{ calculateDiscountedPrice(movie) }}
                        </span>
                      </div>
                    </template>
                    <template #content>
                      <p class="text-700">{{ movie.description }}</p>
                      <Tag :severity="getStockSeverity(movie.stock)" :value="getStockLabel(movie.stock)" class="mt-3" />
                    </template>
                    <template #footer>
                      <Button v-if="!authStore.isAuthenticated" label="Iniciar sesión para comprar" icon="pi pi-sign-in"
                        @click="router.push('/login')" class="w-full p-button-outlined" />
                      <Button v-else :label="movie.stock > 0 ? 'Comprar ahora' : 'Sin Stock'"
                        :icon="movie.stock > 0 ? 'pi pi-shopping-cart' : 'pi pi-times-circle'" :disabled="movie.stock === 0"
                        @click="handlePurchase(movie)" class="w-full" />
                    </template>
                  </Card>
                </div>
              </div>
            </div>
          </TabPanel>
        </TabView>
      </div>
    </div>

    <!-- Purchase Dialog -->
    <Dialog v-model:visible="confirmDialog" header="Confirmar compra" modal :style="{ width: '450px' }" class="p-fluid">
      <div class="flex flex-column align-items-center">
        <i class="pi pi-shopping-cart text-6xl text-primary mb-4"></i>
        <p class="text-center">
          ¿Estás seguro de que deseas comprar "{{ selectedMovie?.title }}"?
        </p>
        <p class="text-center text-primary text-xl font-bold">
          Precio final: ${{ calculateDiscountedPrice(selectedMovie) }}
        </p>
      </div>
      <template #footer>
        <Button label="Cancelar" icon="pi pi-times" class="p-button-text" @click="confirmDialog = false" />
        <Button label="Confirmar" icon="pi pi-check" @click="confirmPurchase" autofocus />
      </template>
    </Dialog>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useMovieStore } from '../stores/movies';
import { useAuthStore } from '../stores/auth';
import Card from 'primevue/card';
import Button from 'primevue/button';
import Dialog from 'primevue/dialog';
import TabView from 'primevue/tabview';
import TabPanel from 'primevue/tabpanel';
import Tag from 'primevue/tag';
import Carousel from 'primevue/carousel';
import { useToast } from 'primevue/usetoast';

const router = useRouter();
const movieStore = useMovieStore();
const authStore = useAuthStore();
const toast = useToast();

const movies = computed(() => movieStore.availableMovies);
const discountedMovies = computed(() => 
  movies.value.filter(movie => movie.discount > 0)
);

const confirmDialog = ref(false);
const selectedMovie = ref(null);

const carouselResponsiveOptions = [
  {
    breakpoint: '1400px',
    numVisible: 3,
    numScroll: 1
  },
  {
    breakpoint: '1199px',
    numVisible: 2,
    numScroll: 1
  },
  {
    breakpoint: '767px',
    numVisible: 1,
    numScroll: 1
  }
];

const getStockSeverity = (stock) => {
  if (stock === 0) return 'danger';
  if (stock < 3) return 'warning';
  return 'success';
};

const getStockLabel = (stock) => {
  if (stock === 0) return 'Sin Stock';
  if (stock < 3) return `¡Solo ${stock} disponibles!`;
  return `${stock} en stock`;
};

const calculateDiscountedPrice = (movie) => {
  if (!movie) return 0;
  return (movie.price * (1 - movie.discount / 100)).toFixed(2);
};

const handlePurchase = (movie) => {
  selectedMovie.value = movie;
  confirmDialog.value = true;
};

const confirmPurchase = () => {
  if (movieStore.makeSale(selectedMovie.value.id, 1)) {
    toast.add({
      severity: 'success',
      summary: '¡Compra exitosa!',
      detail: `Has comprado "${selectedMovie.value.title}"`,
      life: 3000
    });
  }
  confirmDialog.value = false;
  selectedMovie.value = null;
};
</script>

<style scoped>
.discount-badge {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: var(--primary-color);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 2rem;
  font-weight: bold;
  animation: bounce 0.5s ease;
}
</style>