import { productService } from "../services/product.services.js";
import { validateProduct } from "./validation.js";

const $ = (sel, root=document) => root.querySelector(sel);
const $$ = (sel, root=document) => [...root.querySelectorAll(sel)];

const usd = (v) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(+v || 0);

// ====== STATE ======
const state = {
  raw: [],
  q: "",
  sort: "none", 
};

// ====== FORM HELPERS ======
function readForm() {
  return {
    id: $("#id").value.trim(),
    name: $("#name").value.trim(),
    price: Number($("#price").value),
    type: $("#type").value,
    img: $("#img").value.trim(),
    screen: $("#screen").value.trim(),
    frontCamera: $("#frontCamera").value.trim(),
    backCamera: $("#backCamera").value.trim(),
    desc: $("#desc").value.trim(),
  };
}

function fillForm(p = {}) {
  $("#id").value = p.id || "";
  $("#name").value = p.name || "";
  $("#price").value = p.price ?? "";
  $("#type").value = p.type || "";
  $("#img").value = p.img || "";
  $("#screen").value = p.screen || "";
  $("#frontCamera").value = p.frontCamera || "";
  $("#backCamera").value = p.backCamera || "";
  $("#desc").value = p.desc || "";
  $("#btnSubmit").textContent = p.id ? "Update" : "Add Phone";
}

function clearErrors() {
  $$(".error").forEach((el) => (el.textContent = ""));
}
function setErrors(errors = {}) {
  clearErrors();
  Object.entries(errors).forEach(([k, msg]) => {
    const el = $(`.error[data-err="${k}"]`);
    if (el) el.textContent = msg;
  });
}

// ====== RENDER ======
function render(list = []) {
  const tb = $("#tblDanhSachSanPham");
  tb.innerHTML = "";
  const frag = document.createDocumentFragment();

  list.forEach((p) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td class="text-center">${p.id ?? ""}</td>
      <td>${p.name || ""}</td>
      <td class="text-end">${usd(p.price)}</td>
      <td>
        ${p.img ? `<img src="${p.img}" alt="${p.name || "phone"}" style="width:96px;height:64px;object-fit:cover;border-radius:8px">` : ""}
      </td>
      <td>${p.desc || ""}</td>
      <td class="text-center">
        <button class="btn btn-sm btn-primary me-1" data-act="edit" data-id="${p.id}">Edit</button>
        <button class="btn btn-sm btn-danger" data-act="del" data-id="${p.id}">Del</button>
      </td>
    `;
    frag.appendChild(tr);
  });

  tb.appendChild(frag);
}

function applyView() {
  let list = [...state.raw];
  if (state.q) {
    const k = state.q.toLowerCase();
    list = list.filter((p) => (p.name || "").toLowerCase().includes(k));
  }
  if (state.sort === "price_asc") list.sort((a, b) => (+a.price || 0) - (+b.price || 0));
  else if (state.sort === "price_desc") list.sort((a, b) => (+b.price || 0) - (+a.price || 0));

  render(list);
}

// ====== API ======
async function fetchList() {
  const data = await productService.list();
  state.raw = Array.isArray(data) ? data : [];
  applyView();
}

async function createProduct(data) {
  const saved = await productService.create(data);
  state.raw.push(saved);
  applyView();
}

async function updateProduct(id, data) {
  const saved = await productService.update(id, data);
  const i = state.raw.findIndex((x) => x.id == id);
  if (i >= 0) state.raw[i] = saved;
  applyView();
}

async function deleteProduct(id) {
  await productService.remove(id);
  state.raw = state.raw.filter((x) => x.id != id);
  applyView();
}

// ====== DIALOG ======
function openCreate() {
  fillForm({});
  $("#productModal").showModal();
}
function openEdit(p) {
  fillForm(p);
  $("#productModal").showModal();
}
function closeDialog() {
  $("#productModal").close();
}

// ====== EVENTS ======
function bindEvents() {
  $("#btnOpenCreate")?.addEventListener("click", (e) => {
    e.preventDefault();
    openCreate();
  });

  $("#btnCancel")?.addEventListener("click", () => closeDialog());
  $("#productModal")?.addEventListener("click", (e) => {
    const form = $("#productForm");
    const r = form.getBoundingClientRect();
    const out = e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom;
    if (out) closeDialog();
  });

  $("#productForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const data = readForm();
    const errors = validateProduct(data);
    if (Object.keys(errors).length) return setErrors(errors);

    try {
      if (data.id) await updateProduct(data.id, data);
      else await createProduct(data);
      closeDialog();
      clearErrors();
    } catch (err) {
      alert("Request failed. Please check MockAPI / network.");
    }
  });

  $("#tblDanhSachSanPham").addEventListener("click", (e) => {
    const btn = e.target.closest("button[data-act]");
    if (!btn) return;
    const id = btn.dataset.id;
    const act = btn.dataset.act;

    if (act === "edit") {
      const p = state.raw.find((x) => x.id == id);
      if (p) openEdit(p);
    } else if (act === "del") {
      if (confirm("Delete this product?")) deleteProduct(id);
    }
  });

  $("#qSearch")?.addEventListener("input", (e) => {
    state.q = e.target.value.trim();
    applyView();
  });

  $("#selSort")?.addEventListener("change", (e) => {
    state.sort = e.target.value;
    applyView();
  });
}

// ====== INIT ======
(async function init() {
  bindEvents();
  try {
    await fetchList();
  } catch (err) {
    alert("Không lấy được danh sách từ MockAPI. Kiểm tra baseURL/PATH trong services.");
    console.error(err);
  }
})();
