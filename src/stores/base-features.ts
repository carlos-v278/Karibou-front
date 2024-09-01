import { defineStore } from 'pinia';
import { environments } from 'src/environements';
interface BaseFeatures {
  loadingAnime:boolean;
  baseUrl:string;
}

export const useStoreBaseFeatures = defineStore('baseFeatures', {
  state: (): BaseFeatures => ({
    loadingAnime:false,
    baseUrl: environments.prod,

  }),
  getters: {
    getLoadingStatus: (state: BaseFeatures): boolean => {
      return state.loadingAnime;
    },
    getBaseUrl: (state: BaseFeatures): string => {
      return state.baseUrl;
    }

  },
  actions: {
    enableLoading(): void {
      this.loadingAnime = true;
    },
    disableLoading(): void {
      this.loadingAnime = false;
    },

  }
});
