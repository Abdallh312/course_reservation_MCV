/* ============================================================
   ui.js — small shared helpers: toast, modal, formatting
   ============================================================ */

function toast(message) {
  let el = document.getElementById("toast");
  if (!el) {
    el = document.createElement("div");
    el.id = "toast";
    document.body.appendChild(el);
  }
  el.textContent = message;
  el.classList.add("show");
  clearTimeout(toast._t);
  toast._t = setTimeout(() => el.classList.remove("show"), 2600);
}

function fmtDate(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" }) +
    " · " + d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
}

function escapeHtml(str) {
  return String(str ?? "").replace(/[&<>"']/g, s => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[s]));
}

function statusStamp(status) {
  const label = { pending: "Pending", accepted: "Accepted", rejected: "Rejected" }[status] || status;
  return `<span class="stamp ${status}">${label}</span>`;
}

/* ---- lightweight modal ---- */
function openModal(title, sub, bodyHtml, onRender) {
  let backdrop = document.getElementById("modalBackdrop");
  if (!backdrop) {
    backdrop = document.createElement("div");
    backdrop.id = "modalBackdrop";
    backdrop.className = "modal-backdrop-custom";
    backdrop.innerHTML = `<div class="modal-box" id="modalBox"></div>`;
    document.body.appendChild(backdrop);
    backdrop.addEventListener("click", e => { if (e.target === backdrop) closeModal(); });
  }
  document.getElementById("modalBox").innerHTML = `
    <h2>${title}</h2>
    ${sub ? `<p class="modal-sub">${sub}</p>` : ""}
    ${bodyHtml}
  `;
  backdrop.classList.add("show");
  if (onRender) onRender(document.getElementById("modalBox"));
}

function closeModal() {
  const backdrop = document.getElementById("modalBackdrop");
  if (backdrop) backdrop.classList.remove("show");
}

document.addEventListener("keydown", e => { if (e.key === "Escape") closeModal(); });

/* ---- sidebar drawer (mobile / tablet) ---- */
function initSidebarToggle() {
  const sidebar = document.querySelector(".sidebar");
  const toggle = document.getElementById("sidebarToggle");
  const backdrop = document.getElementById("sidebarBackdrop");
  if (!sidebar || !toggle || !backdrop) return;

  function openSidebar() {
    sidebar.classList.add("open");
    backdrop.classList.add("show");
    toggle.setAttribute("aria-expanded", "true");
  }
  function closeSidebar() {
    sidebar.classList.remove("open");
    backdrop.classList.remove("show");
    toggle.setAttribute("aria-expanded", "false");
  }

  toggle.addEventListener("click", () => {
    sidebar.classList.contains("open") ? closeSidebar() : openSidebar();
  });
  backdrop.addEventListener("click", closeSidebar);
  sidebar.querySelectorAll(".nav-btn, .exit a").forEach(el => el.addEventListener("click", closeSidebar));
  document.addEventListener("keydown", e => { if (e.key === "Escape") closeSidebar(); });
}
