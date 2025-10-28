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
    document.querySelectorAll("[data-modal-target]").forEach(function (btn) {
      btn.addEventListener("click", function (e) {
        e.preventDefault();
        const target = btn.getAttribute("data-modal-target");
        const modal = document.getElementById(target);
        if (!modal) return;
        modal.classList.remove("hidden");
        document.body.style.overflow = "hidden";
        // focus first focusable element if present
        setTimeout(
          () => modal.querySelector("input,button,select,textarea")?.focus(),
          0
        );
        // If this button carries ticket data for editing, populate the create modal
        if (target === "create-ticket-modal") {
          const id = btn.getAttribute("data-ticket-id");
          const title = btn.getAttribute("data-ticket-title") || "";
          const description = btn.getAttribute("data-ticket-description") || "";
          const status = btn.getAttribute("data-ticket-status") || "open";
          const form = document.getElementById("ticket-form");
          if (form) {
            const idInput = document.getElementById("ticket-id");
            const titleInput = document.getElementById("ticket-title");
            const descInput = document.getElementById("ticket-description");
            const statusInput = document.getElementById("ticket-status");
            const submitBtn = document.getElementById("ticket-submit");
            if (id) {
              // editing
              idInput.value = id;
              titleInput.value = title;
              descInput.value = description;
              statusInput.value = status;
              form.action = "/tickets/" + encodeURIComponent(id) + "/edit";
              if (submitBtn) submitBtn.textContent = "Update";
              const titleHdr = document.getElementById("create-ticket-title");
              if (titleHdr) titleHdr.textContent = "Edit Ticket";
            } else {
              // creating
              idInput.value = "";
              titleInput.value = "";
              descInput.value = "";
              statusInput.value = "open";
              form.action = "/tickets/create";
              if (submitBtn) submitBtn.textContent = "Create";
              const titleHdr = document.getElementById("create-ticket-title");
              if (titleHdr) titleHdr.textContent = "Create New Ticket";
            }
          }
        }
        // If this button is for delete, set the delete form action
        if (target === "delete-ticket-modal") {
          const id = btn.getAttribute("data-ticket-id");
          const deleteForm = document.getElementById("delete-form");
          if (deleteForm && id) {
            deleteForm.action =
              "/tickets/" + encodeURIComponent(id) + "/delete";
          }
        }
      });
    });

    document.querySelectorAll("[data-modal-close]").forEach(function (el) {
      el.addEventListener("click", function (e) {
        // if clicked on overlay or cancel button
        const modal = el.closest(".fixed.inset-0");
        if (modal) {
          modal.classList.add("hidden");
          document.body.style.overflow = "";
        }
      });
    });

    // close modal on Escape key
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") {
        document
          .querySelectorAll(".fixed.inset-0:not(.hidden)")
          .forEach(function (m) {
            m.classList.add("hidden");
            document.body.style.overflow = "";
          });
      }
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
