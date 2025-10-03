// services.js
const API_URL = "https://68dc06217cd1948060a9377f.mockapi.io/Products";

const ProductService = {
  async getAllProducts() {
    try {
      const res = await axios.get(API_URL);
      return res.data;
    } catch (err) {
      console.error("Lỗi API:", err);
      return [];
    }
  }
};
