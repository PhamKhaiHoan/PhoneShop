import axios from "https://cdn.jsdelivr.net/npm/axios@1.6.8/+esm";

export const http = axios.create({
  baseURL: "https://68b2bc29c28940c9e69d3801.mockapi.io",
  timeout: 10000,
  headers: { "Content-Type": "application/json" },
});

http.interceptors.response.use(
  (r) => r,
  (err) => {
    console.error("[HTTP ERROR]", err?.response?.status, err?.response?.data || err?.message);
    return Promise.reject(err);
  }
);

