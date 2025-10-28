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
          deleteForm.action = "/tickets/" + encodeURIComponent(id) + "/delete";
        }
      }
    });
  });
  // Build a ticket card element (used for optimistic updates and newly inserted cards)
  function buildTicketCard(ticket) {
    const card = document.createElement("div");
    card.className =
      "border shadow border-white/20 rounded-md p-4 bg-white/5 flex flex-col justify-between";
    card.setAttribute("data-ticket-id", ticket.id);

    const inner = document.createElement("div");

    const top = document.createElement("div");
    top.className = "flex items-center justify-between";

    const h3 = document.createElement("h3");
    h3.className = "font-semibold";
    h3.textContent = ticket.title;

    const right = document.createElement("div");
    right.className = "flex items-center gap-2";

    const span = document.createElement("span");
    span.className =
      "px-2 py-1 rounded-full flex items-center justify-center text-xs font-semibold capitalize " +
      (ticket.status === "open"
        ? "bg-green-300/50 text-green-900"
        : ticket.status === "in_progress"
        ? "bg-amber-300/50 text-amber-900"
        : "bg-gray-300/50 text-gray-900");
    span.textContent = (ticket.status || "").replace("_", " ");

    right.appendChild(span);
    top.appendChild(h3);
    top.appendChild(right);

    inner.appendChild(top);

    if (ticket.description) {
      const p = document.createElement("p");
      p.className = "mt-2 text-sm text-gray-400 truncate";
      p.textContent = ticket.description;
      inner.appendChild(p);
    }

    const footer = document.createElement("div");
    footer.className = "flex items-center justify-end gap-2 mt-4";

    const editBtn = document.createElement("button");
    editBtn.className = "px-3 py-2 rounded-md bg-gray-200";
    editBtn.setAttribute("data-modal-target", "create-ticket-modal");
    editBtn.setAttribute("data-ticket-id", ticket.id);
    editBtn.setAttribute("data-ticket-title", ticket.title);
    editBtn.setAttribute("data-ticket-description", ticket.description || "");
    editBtn.setAttribute("data-ticket-status", ticket.status || "open");
    editBtn.textContent = "Edit";

    const delBtn = document.createElement("button");
    delBtn.className = "px-3 py-2 rounded-md bg-red-500 text-white";
    delBtn.setAttribute("data-modal-target", "delete-ticket-modal");
    delBtn.setAttribute("data-ticket-id", ticket.id);
    delBtn.textContent = "Delete";

    footer.appendChild(editBtn);
    footer.appendChild(delBtn);

    card.appendChild(inner);
    card.appendChild(footer);

    // Attach modal handlers to the newly created buttons so they behave the same
    editBtn.addEventListener("click", function (e) {
      e.preventDefault();
      const target = editBtn.getAttribute("data-modal-target");
      const modal = document.getElementById(target);
      if (!modal) return;
      modal.classList.remove("hidden");
      document.body.style.overflow = "hidden";
      // populate form
      const id = editBtn.getAttribute("data-ticket-id");
      const title = editBtn.getAttribute("data-ticket-title") || "";
      const description = editBtn.getAttribute("data-ticket-description") || "";
      const status = editBtn.getAttribute("data-ticket-status") || "open";
      const form = document.getElementById("ticket-form");
      if (form) {
        const idInput = document.getElementById("ticket-id");
        const titleInput = document.getElementById("ticket-title");
        const descInput = document.getElementById("ticket-description");
        const statusInput = document.getElementById("ticket-status");
        const submitBtn = document.getElementById("ticket-submit");
        if (id) {
          idInput.value = id;
          titleInput.value = title;
          descInput.value = description;
          statusInput.value = status;
          form.action = "/tickets/" + encodeURIComponent(id) + "/edit";
          if (submitBtn) submitBtn.textContent = "Update";
          const titleHdr = document.getElementById("create-ticket-title");
          if (titleHdr) titleHdr.textContent = "Edit Ticket";
        }
      }
    });

    delBtn.addEventListener("click", function (e) {
      e.preventDefault();
      const target = delBtn.getAttribute("data-modal-target");
      const modal = document.getElementById(target);
      if (!modal) return;
      modal.classList.remove("hidden");
      document.body.style.overflow = "hidden";
      const id = delBtn.getAttribute("data-ticket-id");
      const deleteForm = document.getElementById("delete-form");
      if (deleteForm && id)
        deleteForm.action = "/tickets/" + encodeURIComponent(id) + "/delete";
    });

    return card;
  }

  // Insert a ticket card into the tickets grid or create the whole tickets list if not present
  function insertTicketCard(ticket) {
    const grid = document.querySelector(".grid.grid-cols-1");
    if (grid) {
      const card = buildTicketCard(ticket);
      // insert at the top
      grid.insertBefore(card, grid.firstChild);
    } else {
      // no grid exists (probably showing the empty SVG). Replace the placeholder with the full tickets layout
      const main = document.querySelector("main");
      if (!main) return;

      // Replace only the empty-state placeholder if present (preserve header/navbar)
      const placeholder = main.querySelector(".text-center");

      const wrapper = document.createElement("div");
      wrapper.className = "w-full";

      const header = document.createElement("div");
      header.className =
        "flex flex-col md:flex-row md:items-center justify-between mb-4";
      const h2 = document.createElement("h2");
      h2.className = "text-lg font-semibold md:mb-4";
      h2.textContent = "Recent Tickets";

      const controls = document.createElement("div");
      controls.className = "flex flex-col md:flex-row md:items-center md:gap-2";

      const goDash = document.createElement("a");
      goDash.className =
        "bg-primary text-white text-center w-full md:w-36 mb-2 mt-2 inline-block px-3 py-2 rounded-md";
      goDash.href = "/dashboard";
      goDash.textContent = "Go to Dashboard";

      const createBtn = document.createElement("button");
      createBtn.className =
        "px-4 py-2 rounded-md bg-primary text-white w-full md:w-32";
      createBtn.textContent = "Create Ticket";
      createBtn.setAttribute("data-modal-target", "create-ticket-modal");
      createBtn.addEventListener("click", function (e) {
        e.preventDefault();
        const modal = document.getElementById("create-ticket-modal");
        if (!modal) return;
        modal.classList.remove("hidden");
        document.body.style.overflow = "hidden";
      });

      controls.appendChild(goDash);
      controls.appendChild(createBtn);

      header.appendChild(h2);
      header.appendChild(controls);

      const gridEl = document.createElement("div");
      gridEl.className = "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4";

      const card = buildTicketCard(ticket);
      gridEl.appendChild(card);

      wrapper.appendChild(header);
      wrapper.appendChild(gridEl);

      if (placeholder) {
        placeholder.replaceWith(wrapper);
      } else {
        main.appendChild(wrapper);
      }
    }
  }

  // AJAX submit for ticket create/edit form to allow inline update
  const ticketForm = document.getElementById("ticket-form");
  if (ticketForm) {
    ticketForm.addEventListener("submit", function (e) {
      e.preventDefault();
      const submitBtn = document.getElementById("ticket-submit");
      submitBtn && (submitBtn.disabled = true);

      const action = ticketForm.getAttribute("action") || "/tickets/create";
      // read form values synchronously to update the UI immediately
      const idInput = document.getElementById("ticket-id");
      const titleInput = document.getElementById("ticket-title");
      const descInput = document.getElementById("ticket-description");
      const statusInput = document.getElementById("ticket-status");

      const payload = {
        id: idInput && idInput.value ? idInput.value : Date.now().toString(),
        title: titleInput ? titleInput.value.trim() : "",
        description: descInput ? descInput.value.trim() : "",
        status: statusInput ? statusInput.value : "open",
      };

      // If editing, update existing card, otherwise insert a new card
      if (idInput && idInput.value) {
        // update card in DOM
        const existing = document.querySelector(
          '[data-ticket-id="' + payload.id + '"]'
        );
        if (existing) {
          const titleEl = existing.querySelector("h3.font-semibold");
          if (titleEl) titleEl.textContent = payload.title;
          const descEl = existing.querySelector("p");
          if (payload.description) {
            if (descEl) descEl.textContent = payload.description;
            else {
              const p = document.createElement("p");
              p.className = "mt-2 text-sm text-gray-400 truncate";
              p.textContent = payload.description;
              existing.querySelector("div")?.appendChild(p);
            }
          } else if (descEl) {
            descEl.remove();
          }
          const statusSpan = existing.querySelector("span");
          if (statusSpan) {
            statusSpan.textContent = payload.status.replace("_", " ");
            statusSpan.className =
              "px-2 py-1 rounded-full flex items-center justify-center text-xs font-semibold capitalize " +
              (payload.status === "open"
                ? "bg-green-300/50 text-green-900"
                : payload.status === "in_progress"
                ? "bg-amber-300/50 text-amber-900"
                : "bg-gray-300/50 text-gray-900");
          }
          // update edit button data attributes
          const editBtn = existing.querySelector(
            'button[data-modal-target="create-ticket-modal"]'
          );
          if (editBtn) {
            editBtn.setAttribute("data-ticket-title", payload.title);
            editBtn.setAttribute(
              "data-ticket-description",
              payload.description
            );
            editBtn.setAttribute("data-ticket-status", payload.status);
          }
        }
      } else {
        insertTicketCard(payload);
      }

      // close modal
      const createModal = document.getElementById("create-ticket-modal");
      if (createModal) {
        createModal.classList.add("hidden");
        document.body.style.overflow = "";
      }

      // send to server in background (best-effort)
      // create FormData BEFORE resetting the form so the values are preserved
      const formData = new FormData(ticketForm);
      // ensure id is present if we generated one
      if (!idInput || !idInput.value) formData.append("id", payload.id);

      // reset form fields after capturing formData
      if (ticketForm) ticketForm.reset();

      // Track pending requests so navigation to dashboard can wait for them
      window.__pendingTicketRequests = window.__pendingTicketRequests || [];
      let req;
      // helper: update dashboard stats in-page if present
      function updateDashboardStats(stats) {
        if (!stats) return;
        const totalEl = document.getElementById("stat-total");
        const openEl = document.getElementById("stat-open");
        const inProgressEl = document.getElementById("stat-in-progress");
        const closedEl = document.getElementById("stat-closed");
        if (totalEl) totalEl.textContent = stats.total ?? 0;
        if (openEl) openEl.textContent = stats.open ?? 0;
        if (inProgressEl) inProgressEl.textContent = stats.in_progress ?? 0;
        if (closedEl) closedEl.textContent = stats.closed ?? 0;
      }

      req = fetch(action, {
        method: "POST",
        body: formData,
        credentials: "same-origin",
        headers: {
          "X-Requested-With": "XMLHttpRequest",
        },
      })
        .then(function (res) {
          const ct = res.headers.get("content-type") || "";
          if (ct.indexOf("application/json") !== -1) {
            return res.json();
          }
          return null;
        })
        .then(function (data) {
          if (data) {
            if (data.stats) updateDashboardStats(data.stats);
            // If server returned the canonical ticket id, reconcile optimistic id
            if (
              data.ticket &&
              payload &&
              payload.id &&
              data.ticket.id &&
              payload.id !== data.ticket.id
            ) {
              const existing = document.querySelector(
                '[data-ticket-id="' + payload.id + '"]'
              );
              if (existing) {
                existing.setAttribute("data-ticket-id", data.ticket.id);
                const editBtn = existing.querySelector(
                  'button[data-modal-target="create-ticket-modal"]'
                );
                if (editBtn)
                  editBtn.setAttribute("data-ticket-id", data.ticket.id);
                const delBtn = existing.querySelector(
                  'button[data-modal-target="delete-ticket-modal"]'
                );
                if (delBtn)
                  delBtn.setAttribute("data-ticket-id", data.ticket.id);
              }
            }
          }
        })
        .catch(function (err) {
          console.error("Background ticket save failed", err);
        })
        .finally(function () {
          submitBtn && (submitBtn.disabled = false);
          // remove this request from pending list
          const idx = window.__pendingTicketRequests.indexOf(req);
          if (idx !== -1) window.__pendingTicketRequests.splice(idx, 1);
        });

      // Intercept navigation to dashboard and wait for pending ticket requests to finish
      document
        .querySelectorAll('a[href="/dashboard"]')
        .forEach(function (link) {
          link.addEventListener("click", function (e) {
            if (
              window.__pendingTicketRequests &&
              window.__pendingTicketRequests.length > 0
            ) {
              e.preventDefault();
              // wait for all pending requests to settle (promises array)
              Promise.allSettled(window.__pendingTicketRequests).then(
                function () {
                  window.location.href = link.href;
                }
              );
            }
          });
        });
      window.__pendingTicketRequests.push(req);
    });
  }

  // AJAX submit for delete form
  const deleteForm = document.getElementById("delete-form");
  if (deleteForm) {
    deleteForm.addEventListener("submit", function (e) {
      e.preventDefault();
      const btn = document.getElementById("delete-confirm-btn");
      btn && (btn.disabled = true);
      const action = deleteForm.getAttribute("action") || "/";

      // Optimistically remove card from DOM if action contains an id
      const match = action.match(/\/tickets\/(.+?)\/delete/);
      if (match && match[1]) {
        const id = decodeURIComponent(match[1]);
        const existing = document.querySelector(
          '[data-ticket-id="' + id + '"]'
        );
        if (existing) existing.remove();
      }

      // close modal
      const deleteModal = document.getElementById("delete-ticket-modal");
      if (deleteModal) {
        deleteModal.classList.add("hidden");
        document.body.style.overflow = "";
      }

      // Track pending delete requests as well
      window.__pendingTicketRequests = window.__pendingTicketRequests || [];
      const delReq = fetch(action, {
        method: "POST",
        credentials: "same-origin",
        headers: { "X-Requested-With": "XMLHttpRequest" },
      })
        .then(function (res) {
          const ct = res.headers.get("content-type") || "";
          if (ct.indexOf("application/json") !== -1) {
            return res.json();
          }
          return null;
        })
        .then(function (data) {
          if (data && data.stats) updateDashboardStats(data.stats);
        })
        .catch(function (err) {
          console.error("Delete failed", err);
          alert("Failed to delete ticket");
        })
        .finally(function () {
          btn && (btn.disabled = false);
          const idx = window.__pendingTicketRequests.indexOf(delReq);
          if (idx !== -1) window.__pendingTicketRequests.splice(idx, 1);
        });
      window.__pendingTicketRequests.push(delReq);
    });
  }
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
