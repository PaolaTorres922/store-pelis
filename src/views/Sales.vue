<template>
  <div class="card">
    <TabView>
      <TabPanel header="Historial de Ventas">
        <div class="mb-4">
          <h3>Resumen de Ventas</h3>
          <div class="grid">
            <div class="col-12 md:col-4">
              <div class="surface-card p-4 shadow-2 border-round">
                <div class="text-900 font-medium text-xl mb-2">Total de Ventas</div>
                <div class="text-2xl font-bold text-primary">${{ totalSalesAmount }}</div>
              </div>
            </div>
            <div class="col-12 md:col-4">
              <div class="surface-card p-4 shadow-2 border-round">
                <div class="text-900 font-medium text-xl mb-2">Películas Vendidas</div>
                <div class="text-2xl font-bold text-primary">{{ totalMoviesSold }}</div>
              </div>
            </div>
            <div class="col-12 md:col-4">
              <div class="surface-card p-4 shadow-2 border-round">
                <div class="text-900 font-medium text-xl mb-2">Descuentos Aplicados</div>
                <div class="text-2xl font-bold text-primary">${{ totalDiscounts }}</div>
              </div>
            </div>
          </div>
        </div>

        <DataTable :value="salesWithDetails" 
                  :paginator="true" 
                  :rows="10"
                  :filters="filters"
                  filterDisplay="menu"
                  :globalFilterFields="['movieTitle', 'date']"
                  v-model:filters="filters"
                  class="p-datatable-lg">
          <template #header>
            <div class="flex justify-content-between">
              <Button type="button" icon="pi pi-filter-slash" label="Limpiar" @click="clearFilter()" />
              <span class="p-input-icon-left">
                <i class="pi pi-search" />
                <InputText v-model="filters['global'].value" placeholder="Buscar..." />
              </span>
            </div>
          </template>

          <Column field="date" header="Fecha" sortable>
            <template #body="slotProps">
              {{ formatDate(slotProps.data.date) }}
            </template>
          </Column>
          <Column field="movieTitle" header="Película" sortable></Column>
          <Column field="quantity" header="Cantidad" sortable></Column>
          <Column field="originalPrice" header="Precio Original" sortable>
            <template #body="slotProps">
              ${{ slotProps.data.originalPrice.toFixed(2) }}
            </template>
          </Column>
          <Column field="discount" header="Descuento" sortable>
            <template #body="slotProps">
              {{ slotProps.data.discount }}%
            </template>
          </Column>
          <Column field="finalPrice" header="Precio Final" sortable>
            <template #body="slotProps">
              ${{ slotProps.data.finalPrice.toFixed(2) }}
            </template>
          </Column>
        </DataTable>
      </TabPanel>

      <TabPanel header="Análisis de Ventas">
        <div class="grid">
          <div class="col-12 lg:col-6">
            <Chart type="bar" :data="monthlySalesData" :options="chartOptions" />
          </div>
          <div class="col-12 lg:col-6">
            <Chart type="pie" :data="topMoviesData" :options="pieChartOptions" />
          </div>
        </div>
      </TabPanel>
    </TabView>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useMovieStore } from '../stores/movies';
import { FilterMatchMode } from 'primevue/api';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import TabView from 'primevue/tabview';
import TabPanel from 'primevue/tabpanel';
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import Chart from 'primevue/chart';

const movieStore = useMovieStore();
const filters = ref({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS },
});

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const salesWithDetails = computed(() => {
  return movieStore.sales.map(sale => {
    const movie = movieStore.movieById(sale.movieId);
    const originalPrice = sale.price * sale.quantity;
    const finalPrice = originalPrice * (1 - (sale.discount / 100));
    
    return {
      ...sale,
      movieTitle: movie ? movie.title : 'Película no encontrada',
      originalPrice,
      finalPrice,
      date: new Date(sale.date)
    };
  }).sort((a, b) => b.date - a.date);
});

const totalSalesAmount = computed(() => {
  return salesWithDetails.value.reduce((total, sale) => total + sale.finalPrice, 0).toFixed(2);
});

const totalMoviesSold = computed(() => {
  return salesWithDetails.value.reduce((total, sale) => total + sale.quantity, 0);
});

const totalDiscounts = computed(() => {
  return salesWithDetails.value.reduce((total, sale) => {
    const discount = (sale.originalPrice - sale.finalPrice);
    return total + discount;
  }, 0).toFixed(2);
});

// Datos para el gráfico de barras
const monthlySalesData = computed(() => {
  const monthlyData = {};
  salesWithDetails.value.forEach(sale => {
    const month = sale.date.toLocaleString('es-ES', { month: 'long' });
    monthlyData[month] = (monthlyData[month] || 0) + sale.finalPrice;
  });

  return {
    labels: Object.keys(monthlyData),
    datasets: [{
      label: 'Ventas Mensuales',
      data: Object.values(monthlyData),
      backgroundColor: '#2563eb'
    }]
  };
});

// Datos para el gráfico circular
const topMoviesData = computed(() => {
  const movieSales = {};
  salesWithDetails.value.forEach(sale => {
    movieSales[sale.movieTitle] = (movieSales[sale.movieTitle] || 0) + sale.quantity;
  });

  return {
    labels: Object.keys(movieSales),
    datasets: [{
      data: Object.values(movieSales),
      backgroundColor: [
        '#2563eb',
        '#4f46e5',
        '#7c3aed',
        '#9333ea',
        '#c026d3'
      ]
    }]
  };
});

const chartOptions = {
  plugins: {
    legend: {
      labels: {
        color: '#495057'
      }
    },
    title: {
      display: true,
      text: 'Ventas Mensuales',
      color: '#495057'
    }
  },
  scales: {
    y: {
      beginAtZero: true,
      ticks: {
        color: '#495057'
      },
      grid: {
        color: '#ebedef'
      }
    },
    x: {
      ticks: {
        color: '#495057'
      },
      grid: {
        color: '#ebedef'
      }
    }
  }
};

const pieChartOptions = {
  plugins: {
    legend: {
      labels: {
        color: '#495057'
      }
    },
    title: {
      display: true,
      text: 'Películas Más Vendidas',
      color: '#495057'
    }
  }
};

const clearFilter = () => {
  filters.value = {
    global: { value: null, matchMode: FilterMatchMode.CONTAINS }
  };
};
</script>