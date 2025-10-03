// model.js
class Product {
  constructor({ id, name, price, screen, backCamera, frontCamera, img, desc, type }) {
    this.id = id;
    this.name = name;
    this.price = price;
    this.screen = screen;
    this.backCamera = backCamera;
    this.frontCamera = frontCamera;
    this.img = img;
    this.desc = desc;
    this.type = type.toLowerCase(); // chuẩn hóa chữ thường
  }
}

// CartItem gồm product + quantity
class CartItem {
  constructor(product, quantity = 1) {
    this.product = product;
    this.quantity = quantity;
  }
}
