export const money = (v) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" })
    .format(+v || 0);

export const $ = (sel, root = document) => root.querySelector(sel);
export function setErrors(errors = {}) {
  document.querySelectorAll(".error[data-err]").forEach(e => e.textContent = "");
  Object.entries(errors).forEach(([k, msg]) => {
    const holder = document.querySelector(`.error[data-err="${k}"]`);
    if (holder) holder.textContent = msg;
  });
}

export function readForm() {
  return {
    id: $("#id").value.trim(),
    name: $("#name").value.trim(),
    price: Number($("#price").value),
    type: $("#type").value.trim(),
    img: $("#img").value.trim(),
    screen: $("#screen").value.trim(),
    frontCamera: $("#frontCamera").value.trim(),
    backCamera: $("#backCamera").value.trim(),
    desc: $("#desc").value.trim(),
  };
}

export function fillForm(p = {}) {
  $("#id").value = p.id || "";
  $("#name").value = p.name || "";
  $("#price").value = p.price ?? "";
  $("#type").value = p.type || "";
  $("#img").value = p.img || "";
  $("#screen").value = p.screen || "";
  $("#frontCamera").value = p.frontCamera || "";
  $("#backCamera").value = p.backCamera || "";
  $("#desc").value = p.desc || "";
}
