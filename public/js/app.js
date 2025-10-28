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

  // Generic modal handling: open by [data-modal-target] attribute, close via [data-modal-close]
  document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('[data-modal-target]').forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        const target = btn.getAttribute('data-modal-target');
        const modal = document.getElementById(target);
        if (!modal) return;
        modal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
        // focus first focusable element if present
        setTimeout(() => modal.querySelector('input,button,select,textarea')?.focus(), 0);
      });
    });

    document.querySelectorAll('[data-modal-close]').forEach(function (el) {
      el.addEventListener('click', function (e) {
        // if clicked on overlay or cancel button
        const modal = el.closest('.fixed.inset-0');
        if (modal) {
          modal.classList.add('hidden');
          document.body.style.overflow = '';
        }
      });
    });

    // close modal on Escape key
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        document.querySelectorAll('.fixed.inset-0:not(.hidden)').forEach(function (m) {
          m.classList.add('hidden');
          document.body.style.overflow = '';
        });
      }
    });
  });
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
