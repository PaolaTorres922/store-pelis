<template>
  <div class="card">
    <Toolbar class="mb-4">
      <template #start>
        <h2 class="m-0">Gestión de Películas</h2>
      </template>
      <template #end>
        <Button label="Nueva Película" icon="pi pi-plus" @click="openNew" />
      </template>
    </Toolbar>

    <DataTable :value="movies" :paginator="true" :rows="10">
      <Column field="title" header="Título"></Column>
      <Column field="price" header="Precio">
        <template #body="slotProps">
          ${{ slotProps.data.price }}
        </template>
      </Column>
      <Column field="stock" header="Stock"></Column>
      <Column header="Acciones">
        <template #body="slotProps">
          <Button icon="pi pi-pencil" class="p-button-text mr-2" @click="editMovie(slotProps.data)" />
          <Button icon="pi pi-trash" class="p-button-text p-button-danger" @click="deleteMovie(slotProps.data)" />
        </template>
      </Column>
    </DataTable>

    <Dialog v-model:visible="movieDialog" :header="dialogTitle" modal class="p-fluid">
      <div class="field">
        <label for="title">Título</label>
        <InputText id="title" v-model="movie.title" required />
      </div>
      <div class="field">
        <label for="price">Precio</label>
        <InputNumber id="price" v-model="movie.price" mode="currency" currency="USD" />
      </div>
      <div class="field">
        <label for="stock">Stock</label>
        <InputNumber id="stock" v-model="movie.stock" />
      </div>
      <div class="field">
        <label for="description">Descripción</label>
        <Textarea id="description" v-model="movie.description" rows="3" />
      </div>
      <template #footer>
        <Button label="Cancelar" icon="pi pi-times" class="p-button-text" @click="hideDialog" />
        <Button label="Guardar" icon="pi pi-check" @click="saveMovie" />
      </template>
    </Dialog>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useMovieStore } from '../stores/movies';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Button from 'primevue/button';
import Dialog from 'primevue/dialog';
import InputText from 'primevue/inputtext';
import InputNumber from 'primevue/inputnumber';
import Textarea from 'primevue/textarea';
import Toolbar from 'primevue/toolbar';

const movieStore = useMovieStore();
const movies = computed(() => movieStore.movies);
const movieDialog = ref(false);
const movie = ref({});

const dialogTitle = computed(() => movie.value.id ? 'Editar Película' : 'Nueva Película');

const openNew = () => {
  movie.value = {};
  movieDialog.value = true;
};

const hideDialog = () => {
  movieDialog.value = false;
};

const saveMovie = () => {
  if (movie.value.id) {
    movieStore.updateMovie(movie.value.id, movie.value);
  } else {
    movieStore.addMovie(movie.value);
  }
  hideDialog();
};

const editMovie = (data) => {
  movie.value = { ...data };
  movieDialog.value = true;
};

const deleteMovie = (data) => {
  movieStore.deleteMovie(data.id);
};
</script>