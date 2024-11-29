import { defineStore } from 'pinia';

export const useMovieStore = defineStore('movies', {
  state: () => ({
    movies: [
      {
        id: 1,
        title: 'El Padrino',
        price: 29.99,
        discount: 15,
        stock: 5,
        image: 'https://m.media-amazon.com/images/M/MV5BM2MyNjYxNmUtYTAwNi00MTYxLWJmNWYtYzZlODY3ZTk3OTFlXkEyXkFqcGdeQXVyNzkwMjQ5NzM@._V1_.jpg',
        description: 'La historia épica de la familia Corleone bajo el patriarcado de Don Vito Corleone.'
      },
      {
        id: 2,
        title: 'Pulp Fiction',
        price: 24.99,
        discount: 0,
        stock: 3,
        image: 'https://m.media-amazon.com/images/M/MV5BNGNhMDIzZTUtNTBlZi00MTRlLWFjM2ItYzViMjE3YzI5MjljXkEyXkFqcGdeQXVyNzkwMjQ5NzM@._V1_.jpg',
        description: 'Las vidas de dos asesinos, un boxeador, un gángster y su esposa se entrelazan en cuatro historias de violencia y redención.'
      },
      {
        id: 3,
        title: 'Matrix',
        price: 19.99,
        discount: 20,
        stock: 8,
        image: 'https://m.media-amazon.com/images/M/MV5BNzQzOTk3OTAtNDQ0Zi00ZTVkLWI0MTEtMDllZjNkYzNjNTc4L2ltYWdlXkEyXkFqcGdeQXVyNjU0OTQ0OTY@._V1_.jpg',
        description: 'Un programador descubre que la realidad en la que vive es una simulación creada por máquinas.'
      },
      {
        id: 4,
        title: 'Inception',
        price: 27.99,
        discount: 10,
        stock: 4,
        image: 'https://m.media-amazon.com/images/M/MV5BMjAxMzY3NjcxNF5BMl5BanBnXkFtZTcwNTI5OTM0Mw@@._V1_.jpg',
        description: 'Un ladrón con la rara habilidad de extraer información del subconsciente de las personas mientras sueñan.'
      }
    ],
    sales: []
  }),
  actions: {
    addMovie(movie) {
      this.movies.push({
        id: Date.now(),
        ...movie
      });
    },
    updateMovie(id, updatedMovie) {
      const index = this.movies.findIndex(movie => movie.id === id);
      if (index !== -1) {
        this.movies[index] = { ...this.movies[index], ...updatedMovie };
      }
    },
    deleteMovie(id) {
      this.movies = this.movies.filter(movie => movie.id !== id);
    },
    makeSale(movieId, quantity) {
      const movie = this.movies.find(m => m.id === movieId);
      if (movie && movie.stock >= quantity) {
        movie.stock -= quantity;
        this.sales.push({
          id: Date.now(),
          movieId,
          quantity,
          price: movie.price,
          discount: movie.discount,
          date: new Date().toISOString()
        });
        return true;
      }
      return false;
    }
  },
  getters: {
    availableMovies: (state) => state.movies.filter(movie => movie.stock > 0),
    movieById: (state) => (id) => state.movies.find(movie => movie.id === id),
    totalSales: (state) => state.sales.length,
    discountedMovies: (state) => state.movies.filter(movie => movie.discount > 0)
  }
});