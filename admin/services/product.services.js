import { http } from "./http.js";

const PATH_CANDIDATES = ["/Products", "/products", "/api/v1/products"];
let ACTIVE_PATH = null;

async function resolvePath() {
  if (ACTIVE_PATH) return ACTIVE_PATH;
  for (const p of PATH_CANDIDATES) {
    try {
      await http.get(p, { params: { page: 1, limit: 1 } });
      ACTIVE_PATH = p;
      return p;
    } catch (e) {
      if (e?.response?.status === 404) continue;
      throw e;
    }
  }
  throw new Error(
    "Không tìm thấy endpoint MockAPI cho 'Products'. Hãy kiểm tra resource name."
  );
}

export const productService = {
  async list(params = {}) {
    const PATH = await resolvePath();
    const r = await http.get(PATH, { params });
    return r.data;
  },
  async detail(id) {
    const PATH = await resolvePath();
    const r = await http.get(`${PATH}/${id}`);
    return r.data;
  },
  async create(data) {
    const PATH = await resolvePath();
    const r = await http.post(PATH, data);
    return r.data;
  },
  async update(id, data) {
    const PATH = await resolvePath();
    const r = await http.put(`${PATH}/${id}`, data);
    return r.data;
  },
  async remove(id) {
    const PATH = await resolvePath();
    const r = await http.delete(`${PATH}/${id}`);
    return r.data;
  },
};
