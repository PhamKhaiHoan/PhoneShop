// controller.js
let products = []; // danh sách sản phẩm
let cart = []; // giỏ hàng

// Key để lưu giỏ hàng trong localStorage
const CART_STORAGE_KEY = "phoneShop_cart";

// Hàm lưu giỏ hàng vào localStorage
function saveCartToStorage() {
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    console.log("Đã lưu giỏ hàng vào localStorage");

    // Hiển thị thông báo ngắn (optional)
    showNotification("Giỏ hàng đã được cập nhật !!!", "success");
  } catch (error) {
    console.error("Lỗi khi lưu giỏ hàng:", error);
  }
}

// Hàm hiển thị thông báo tổng quát
function showNotification(message, type = "success") {
  // Định nghĩa màu sắc theo loại thông báo
  const colors = {
    success: "#28a745",
    warning: "#ffc107",
    error: "#dc3545",
    info: "#17a2b8",
  };

  // Tạo thông báo
  const notification = document.createElement("div");
  notification.innerHTML = message.replace(/\n/g, "<br>");
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: ${colors[type] || colors.success};
    color: ${type === "warning" ? "#000" : "#fff"};
    padding: 12px 18px;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 500;
    z-index: 1000;
    opacity: 0;
    transition: opacity 0.3s;
    max-width: 350px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  `;

  document.body.appendChild(notification);

  // Hiển thị và tự động ẩn
  setTimeout(() => (notification.style.opacity = "1"), 100);
  const hideDelay =
    type === "success" && message.includes("THANH TOÁN") ? 4000 : 2500;
  setTimeout(() => {
    notification.style.opacity = "0";
    setTimeout(() => {
      if (document.body.contains(notification)) {
        document.body.removeChild(notification);
      }
    }, 300);
  }, hideDelay);
}

// Hàm tải giỏ hàng từ localStorage
function loadCartFromStorage() {
  try {
    const storedCart = localStorage.getItem(CART_STORAGE_KEY);
    if (storedCart) {
      const parsedCart = JSON.parse(storedCart);
      // Khôi phục lại đối tượng CartItem với Product instances
      cart = parsedCart.map((item) => {
        const product = new Product(item.product);
        return new CartItem(product, item.quantity);
      });
      console.log("Đã tải giỏ hàng từ localStorage:", cart.length, "sản phẩm");
    }
  } catch (error) {
    console.error("Lỗi khi tải giỏ hàng:", error);
    cart = []; // Reset giỏ hàng nếu có lỗi
  }
}

async function init() {
  products = await ProductService.getAllProducts();
  products = products.map((p) => new Product(p));

  // Tải giỏ hàng từ localStorage
  loadCartFromStorage();

  renderProducts(products);
  renderCart(); // Hiển thị giỏ hàng đã lưu
  updateCartCount(); // Cập nhật số lượng ban đầu

  // gắn sự kiện cho dropdown filter
  const filterSelect = document.getElementById("filter");
  filterSelect.addEventListener("change", handleFilterChange);
}

// render sản phẩm ra màn hình
function renderProducts(list) {
  const container = document.getElementById("product-list");
  container.innerHTML = "";

  list.forEach((p) => {
    const productCard = document.createElement("div");
    productCard.className = "product-card";
    productCard.innerHTML = `
      <img src="${p.img}" alt="${p.name}" class="product-image">
      <div class="product-info">
        <div class="product-name">${p.name}</div>
        <div class="product-type">${p.type}</div>
        <div class="product-price">${p.price}$</div>
        <div class="product-desc">${p.desc}</div>
        <button class="add-to-cart-btn" onclick="addToCart('${p.id}')">
          🛒 Thêm vào giỏ
        </button>
      </div>
    `;
    container.appendChild(productCard);
  });
}

// render giỏ hàng
function renderCart() {
  const cartList = document.getElementById("cart-list");
  const cartTable = document.getElementById("cart-table");
  const cartActions = document.getElementById("cart-actions");
  const emptyCart = document.getElementById("empty-cart");
  const totalAmountElement = document.getElementById("total-amount");

  // Xóa nội dung cũ
  cartList.innerHTML = "";

  if (cart.length === 0) {
    // Hiển thị thông báo giỏ hàng trống
    cartTable.style.display = "none";
    cartActions.style.display = "none";
    emptyCart.style.display = "block";
    return;
  }

  // Ẩn thông báo trống, hiển thị bảng và nút actions
  emptyCart.style.display = "none";
  cartTable.style.display = "table";
  cartActions.style.display = "block";

  let totalAmount = 0;

  // Duyệt mảng giỏ hàng và tạo tr cho mỗi sản phẩm
  cart.forEach((item) => {
    const itemTotal = item.product.price * item.quantity;
    totalAmount += itemTotal;

    // Tạo thẻ tr cho mỗi sản phẩm
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td style="text-align: center;">
        <img src="${item.product.img}" alt="${item.product.name}" width="60" style="border-radius: 5px;">
      </td>
      <td><strong>${item.product.name}</strong></td>
      <td>${item.product.price}$</td>
      <td style="text-align: center;">
        <div class="quantity-controls">
          <button class="btn btn-sm btn-danger" onclick="decreaseQuantity('${item.product.id}')">-</button>
          <span>${item.quantity}</span>
          <button class="btn btn-sm btn-success" onclick="increaseQuantity('${item.product.id}')">+</button>
        </div>
      </td>
      <td style="text-align: right;"><strong>${itemTotal}$</strong></td>
      <td style="text-align: center;">
        <button class="btn btn-sm btn-outline-danger" onclick="removeFromCart('${item.product.id}')" title="Xóa sản phẩm">
          🗑️
        </button>
      </td>
    `;

    cartList.appendChild(tr);
  });

  // Cập nhật tổng tiền
  totalAmountElement.textContent = `${totalAmount}$`;

  // Cập nhật số lượng sản phẩm trên nút giỏ hàng
  updateCartCount();
}

// xử lý thêm vào giỏ hàng
function addToCart(productId) {
  // Tìm sản phẩm theo ID
  const product = products.find((p) => p.id === productId);
  if (!product) {
    console.error("Không tìm thấy sản phẩm với ID:", productId);
    return;
  }

  // Kiểm tra xem sản phẩm đã có trong giỏ hàng chưa
  const existingItem = cart.find((c) => c.product.id === productId);

  if (existingItem) {
    // Nếu đã có trong giỏ hàng, không push nữa mà chỉ tăng quantity lên 1 đơn vị
    existingItem.quantity += 1;
    console.log(`Tăng số lượng "${product.name}" lên ${existingItem.quantity}`);
  } else {
    // Nếu chưa có trong giỏ hàng, tạo CartItem mới với quantity = 1 và push vào cart
    const newCartItem = new CartItem(product, 1);
    cart.push(newCartItem);
    console.log(`Thêm sản phẩm mới "${product.name}" vào giỏ hàng`);
  }

  // Cập nhật giao diện giỏ hàng
  renderCart();

  // Lưu giỏ hàng vào localStorage
  saveCartToStorage();
}

// hàm tăng số lượng sản phẩm trong giỏ hàng
function increaseQuantity(productId) {
  // Tìm sản phẩm trong mảng giỏ hàng theo ID
  const cartItem = cart.find((item) => item.product.id === productId);

  if (cartItem) {
    // Tăng quantity lên 1 đơn vị
    cartItem.quantity += 1;
    console.log(
      `Tăng số lượng "${cartItem.product.name}" lên ${cartItem.quantity}`
    );

    // Render lại giao diện
    renderCart();

    // Lưu giỏ hàng vào localStorage
    saveCartToStorage();
  } else {
    console.error("Không tìm thấy sản phẩm trong giỏ hàng với ID:", productId);
  }
}

// hàm giảm số lượng sản phẩm trong giỏ hàng
function decreaseQuantity(productId) {
  // Tìm sản phẩm trong mảng giỏ hàng theo ID
  const cartItem = cart.find((item) => item.product.id === productId);

  if (cartItem) {
    if (cartItem.quantity > 1) {
      // Giảm quantity xuống 1 đơn vị (nếu > 1)
      cartItem.quantity -= 1;
      console.log(
        `Giảm số lượng "${cartItem.product.name}" xuống ${cartItem.quantity}`
      );
    } else {
      // Nếu quantity = 1, xóa sản phẩm khỏi giỏ hàng
      const index = cart.findIndex((item) => item.product.id === productId);
      if (index !== -1) {
        cart.splice(index, 1);
        console.log(`Xóa "${cartItem.product.name}" khỏi giỏ hàng`);
      }
    }

    // Render lại giao diện
    renderCart();

    // Lưu giỏ hàng vào localStorage
    saveCartToStorage();
  } else {
    console.error("Không tìm thấy sản phẩm trong giỏ hàng với ID:", productId);
  }
}

// hàm xóa sản phẩm hoàn toàn khỏi giỏ hàng
function removeFromCart(productId) {
  // Tìm vị trí sản phẩm trong mảng giỏ hàng
  const index = cart.findIndex((item) => item.product.id === productId);

  if (index !== -1) {
    const productName = cart[index].product.name;
    // Xóa sản phẩm khỏi mảng cart
    cart.splice(index, 1);
    console.log(`Đã xóa "${productName}" khỏi giỏ hàng`);

    // Render lại giao diện
    renderCart();

    // Lưu giỏ hàng vào localStorage
    saveCartToStorage();
  } else {
    console.error("Không tìm thấy sản phẩm trong giỏ hàng với ID:", productId);
  }
}

// hàm thanh toán
function checkout() {
  if (cart.length === 0) {
    showNotification(
      "Giỏ hàng trống! Vui lòng thêm sản phẩm trước khi thanh toán.",
      "warning"
    );
    return;
  }

  // Tính tổng tiền
  const totalAmount = cart.reduce((total, item) => {
    return total + item.product.price * item.quantity;
  }, 0);

  // Tạo thông tin đơn hàng
  const orderInfo = cart
    .map(
      (item) =>
        `${item.product.name} x${item.quantity} = ${
          item.product.price * item.quantity
        }$`
    )
    .join("\n");

  // Hiển thị thông tin thanh toán
  const confirmMessage = `🛒 THÔNG TIN ĐƠN HÀNG:\n\n${orderInfo}\n\n💰 TỔNG CỘNG: ${totalAmount}$\n\nBạn có muốn thanh toán không?`;

  if (confirm(confirmMessage)) {
    // Xử lý thanh toán thành công
    showNotification(
      `✅ THANH TOÁN THÀNH CÔNG!\n\nCảm ơn bạn đã mua hàng!\nTổng tiền: ${totalAmount}$`,
      "success"
    );

    // Clear giỏ hàng và lưu vào localStorage
    cart = [];
    renderCart();
    updateCartCount(); // Cập nhật số lượng trên nút popup
    saveCartToStorage();

    console.log("Thanh toán thành công, đã xóa giỏ hàng");
  } else {
    console.log("Người dùng hủy thanh toán");
  }
}

// hàm xóa toàn bộ giỏ hàng
function clearCart() {
  if (cart.length === 0) {
    showNotification("Giỏ hàng đã trống!", "info");
    return;
  }

  if (confirm("Bạn có chắc chắn muốn xóa toàn bộ giỏ hàng không?")) {
    cart = [];
    renderCart();
    updateCartCount(); // Cập nhật số lượng trên nút popup
    saveCartToStorage();
    showNotification("Đã xóa toàn bộ giỏ hàng!", "info");
    console.log("Đã xóa toàn bộ giỏ hàng");
  }
}

// hàm toggle cart modal
function toggleCartModal() {
  const modal = document.getElementById("cart-modal");
  if (modal.classList.contains("show")) {
    // Thêm class closing để kích hoạt animation chìm xuống
    modal.classList.add("closing");

    setTimeout(() => {
      modal.style.display = "none";
      modal.classList.remove("show");
      modal.classList.remove("closing");
    }, 300);
  } else {
    modal.style.display = "flex";
    setTimeout(() => {
      modal.classList.add("show");
    }, 10);
  }
}

// hàm cập nhật số lượng sản phẩm trong giỏ hàng (hiển thị trên nút)
function updateCartCount() {
  const cartCount = document.getElementById("cart-count");
  const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
  cartCount.textContent = totalItems;
}

// đóng modal khi click outside
window.onclick = function (event) {
  const modal = document.getElementById("cart-modal");
  if (event.target === modal) {
    toggleCartModal();
  }
};

// xử lý filter dropdown
function handleFilterChange(event) {
  const value = event.target.value;

  if (value === "all") {
    renderProducts(products);
  } else {
    const filtered = products.filter((p) => p.type === value);
    renderProducts(filtered);
  }
}

document.addEventListener("DOMContentLoaded", init);
