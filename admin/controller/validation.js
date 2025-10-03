export function validateProduct(p = {}) {
  const errors = {};

  const urlOk = (s) => /^https?:\/\/.+/i.test(String(s || "").trim());

  if (!p.name || !p.name.trim()) errors.name = "Please enter product name.";
  if (p.price == null || p.price === "" || isNaN(+p.price) || +p.price <= 0)
    errors.price = "Price must be a positive number.";
  if (!p.screen || !p.screen.trim()) errors.screen = "Screen is required.";
  if (!p.frontCamera || !p.frontCamera.trim()) errors.frontCamera = "Front camera is required.";
  if (!p.backCamera || !p.backCamera.trim()) errors.backCamera = "Back camera is required.";
  if (!p.img || !urlOk(p.img)) errors.img = "Image URL must start with http(s)://";
  if (!p.desc || !p.desc.trim()) errors.desc = "Description is required.";
  if (!p.type) errors.type = "Please select a brand.";

  return errors;
}
