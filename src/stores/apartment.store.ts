import { defineStore } from 'pinia';
interface ApartmentStoreInt {
  isChange: boolean;
}

export const ApartmentStore = defineStore('ApartmentStore', {
  state: (): ApartmentStoreInt => ({
    isChange: false,
  }),
  getters: {
    getApartmentsChange: (state: ApartmentStoreInt): boolean => {
      return state.isChange;
    },
  },
  actions: {
    updateApartmentChange(): void {
      this.isChange = !this.isChange;
    },
  },
});
