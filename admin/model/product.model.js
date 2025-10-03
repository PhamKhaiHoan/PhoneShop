export class Product {
  constructor(p = {}) {
    this.id = p.id || "";
    this.name = p.name || "";
    this.price = +p.price || 0;
    this.screen = p.screen || "";
    this.backCamera = p.backCamera || "";
    this.frontCamera = p.frontCamera || "";
    this.img = p.img || "";
    this.desc = p.desc || "";
    this.type = p.type || "";
  }
}
