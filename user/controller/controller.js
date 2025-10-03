// controller.js
let products = []; // danh sách sản phẩm
let cart = [];     // giỏ hàng

async function init() {
  products = await ProductService.getAllProducts();
  products = products.map(p => new Product(p));

  renderProducts(products);

  // gắn sự kiện cho dropdown filter
  const filterSelect = document.getElementById("filter");
  filterSelect.addEventListener("change", handleFilterChange);
}

// render sản phẩm ra màn hình
function renderProducts(list) {
  const container = document.getElementById("product-list");
  container.innerHTML = "";

  list.forEach(p => {
    const li = document.createElement("li");
    li.style.marginBottom = "20px";
    li.innerHTML = `
      <img src="${p.img}" alt="${p.name}" width="100" style="border-radius:8px"><br>
      <strong>${p.name}</strong> (${p.type})<br>
      Giá: ${p.price}$<br>
      <em>${p.desc}</em><br>
      <button onclick="addToCart('${p.id}')">Thêm vào giỏ</button>
    `;
    container.appendChild(li);
  });
}

// render giỏ hàng
function renderCart() {
  const cartList = document.getElementById("cart-list");
  cartList.innerHTML = "";

  if (cart.length === 0) {
    cartList.innerHTML = "<li>Giỏ hàng trống</li>";
    return;
  }

  cart.forEach(item => {
    const li = document.createElement("li");
    li.innerHTML = `
      <strong>${item.product.name}</strong> - SL: ${item.quantity} - Tổng: ${item.product.price * item.quantity}$
    `;
    cartList.appendChild(li);
  });
}

// xử lý thêm vào giỏ hàng
function addToCart(productId) {
  const product = products.find(p => p.id === productId);
  if (!product) return;

  const existingItem = cart.find(c => c.product.id === productId);
  if (existingItem) {
    existingItem.quantity++;
  } else {
    cart.push(new CartItem(product, 1));
  }

  renderCart();
}

// xử lý filter dropdown
function handleFilterChange(event) {
  const value = event.target.value;

  if (value === "all") {
    renderProducts(products);
  } else {
    const filtered = products.filter(p => p.type === value);
    renderProducts(filtered);
  }
}

document.addEventListener("DOMContentLoaded", init);
