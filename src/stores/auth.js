import { defineStore } from 'pinia';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    isAuthenticated: false,
    users: [
      {
        id: 1,
        email: 'admin@example.com',
        password: 'admin',
        role: 'admin',
        name: 'Administrador'
      },
      {
        id: 2,
        email: 'cliente@example.com',
        password: 'cliente',
        role: 'client',
        name: 'Cliente'
      }
    ]
  }),
  actions: {
    login(credentials) {
      const user = this.users.find(u => 
        u.email === credentials.email && 
        u.password === credentials.password
      );
      
      if (user) {
        const { password, ...userWithoutPassword } = user;
        this.user = userWithoutPassword;
        this.isAuthenticated = true;
        return true;
      }
      return false;
    },
    register(userData) {
      if (this.users.some(u => u.email === userData.email)) {
        return false;
      }
      
      const newUser = {
        id: this.users.length + 1,
        email: userData.email,
        password: userData.password,
        name: userData.name,
        role: 'client'
      };
      
      this.users.push(newUser);
      const { password, ...userWithoutPassword } = newUser;
      this.user = userWithoutPassword;
      this.isAuthenticated = true;
      return true;
    },
    logout() {
      this.user = null;
      this.isAuthenticated = false;
    }
  },
  getters: {
    isAdmin: (state) => state.user?.role === 'admin',
    isClient: (state) => state.user?.role === 'client'
  }
});