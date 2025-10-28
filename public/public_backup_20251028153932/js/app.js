document.addEventListener("DOMContentLoaded", function () {
  const trigger = document.getElementById("logout-trigger");
  const modal = document.getElementById("logout-modal");
  const overlay = document.getElementById("logout-overlay");
  const confirmBtn = document.getElementById("logout-confirm");
  const cancelBtn = document.getElementById("logout-cancel");

  if (!modal) return;

  function openModal(e) {
    if (e) e.preventDefault();
    modal.classList.remove("hidden");
    document.body.style.overflow = "hidden";
    // focus cancel for accessibility
    setTimeout(() => cancelBtn?.focus(), 0);
  }

  function closeModal() {
    modal.classList.add("hidden");
    document.body.style.overflow = "";
  }

  if (trigger) {
    trigger.addEventListener("click", openModal);
  }

  overlay?.addEventListener("click", closeModal);
  cancelBtn?.addEventListener("click", closeModal);

  confirmBtn?.addEventListener("click", function () {
    // navigate to logout url
    const url =
      (trigger && trigger.getAttribute("data-logout-url")) || "/auth/logout";
    window.location.href = url;
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && !modal.classList.contains("hidden")) {
      closeModal();
    }
  });
});
