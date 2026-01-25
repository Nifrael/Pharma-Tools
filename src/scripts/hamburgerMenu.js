function init() {
  const btn = document.querySelector(".menu-button");
  const menu = document.querySelector(".menu");
  const body = document.body;
  const html = document.documentElement;

  if (!btn || !menu) return;

  function toggle() {
    const isOpen = menu.classList.contains("show");

    btn.classList.toggle("active");
    menu.classList.toggle("show");
    body.classList.toggle("no-scroll");
    html.classList.toggle("no-scroll");

    const willBeOpen = !isOpen;
    btn.setAttribute("aria-expanded", willBeOpen);
    btn.setAttribute(
      "aria-label",
      willBeOpen ? "Fermer le menu" : "Ouvrir le menu",
    );
    menu.setAttribute("aria-hidden", !willBeOpen);

    if (willBeOpen) {
      setTimeout(() => {
        const firstLink = menu.querySelector("a");
        if (firstLink) firstLink.focus();
      }, 100);
    } else {
      btn.focus();
    }
  }

  function onBtnClick() {
    toggle();
  }

  function onBtnKey(e) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      toggle();
    }
  }

  function onDocKey(e) {
    if (e.key === "Escape" && menu.classList.contains("show")) {
      toggle();
    }
  }

  function onDocClick(e) {
    if (
      menu.classList.contains("show") &&
      !btn.contains(e.target) &&
      !menu.contains(e.target)
    ) {
      toggle();
    }
  }

  btn.addEventListener("click", onBtnClick);
  btn.addEventListener("keydown", onBtnKey);
  document.addEventListener("keydown", onDocKey);
  document.addEventListener("click", onDocClick);

  btn.setAttribute("aria-expanded", "false");
  menu.setAttribute("aria-hidden", "true");

  function cleanup() {
    btn.removeEventListener("click", onBtnClick);
    btn.removeEventListener("keydown", onBtnKey);
    document.removeEventListener("keydown", onDocKey);
    document.removeEventListener("click", onDocClick);

    if (menu.classList.contains("show")) {
      btn.classList.remove("active");
      menu.classList.remove("show");
      body.classList.remove("no-scroll");
      html.classList.remove("no-scroll");
    }
  }

  document.addEventListener("astro:before-swap", cleanup);
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}

document.addEventListener("astro:after-swap", init);