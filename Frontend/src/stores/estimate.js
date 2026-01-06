import { defineStore } from 'pinia';
import axios from 'axios';

export const useEstimateStore = defineStore('estimate', {
  state: () => ({
    loading: false
  }),
  actions: {
    async submitEstimate(formData) {
      this.loading = true;
      try {
        const response = await axios.post('https://port-0-absol-mk2l6v1wd9132c30.sel3.cloudtype.app/api/estimates', formData);
        return response.data;
      } finally {
        this.loading = false;
      }
    }
  }
});