import axios from "https://cdn.jsdelivr.net/npm/axios@1.6.8/+esm";

export const http = axios.create({
  baseURL: "https://68dc06217cd1948060a9377f.mockapi.io",
  timeout: 10000,
  headers: { "Content-Type": "application/json" },
});

http.interceptors.response.use(
  (r) => r,
  (err) => {
    console.error(
      "[HTTP ERROR]",
      err?.response?.status,
      err?.response?.data || err?.message
    );
    return Promise.reject(err);
  }
);
