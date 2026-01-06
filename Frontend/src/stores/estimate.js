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
        const response = await axios.post('http://svc.sel3.cloudtype.app:30209/api/estimates', formData);
        return response.data;
      } finally {
        this.loading = false;
      }
    }
  }
});