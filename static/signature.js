(function () {
  const wrapper = document.getElementById("signature-pad");
  const canvas = document.getElementById("canvas");
  const clearBtn = document.getElementById("clearBtn");
  const saveBtn = document.getElementById("saveBtn");
  const status = document.getElementById("status");
  const signatureCountSpan = document.getElementById("signature-count");
  const signatureList = document.getElementById("signature-list");
  const submitBtn = document.getElementById("submit-password");
  const toastContainer = document.getElementById("toast-container");

  document.getElementById("memberForm").addEventListener("submit", e => e.preventDefault());

  const FIXED_CANVAS_HEIGHT = 150; // px

  // ---- Canvas setup ----
  function resizeCanvas() {
    const ratio = window.devicePixelRatio || 1;

    // Set canvas width/height in actual pixels
    canvas.width = wrapper.offsetWidth * ratio;
    canvas.height = FIXED_CANVAS_HEIGHT * ratio;

    // Set CSS width/height to match wrapper (so touch coordinates match)
    canvas.style.width = `${wrapper.offsetWidth}px`;
    canvas.style.height = `${FIXED_CANVAS_HEIGHT}px`;

    const ctx = canvas.getContext("2d");
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(ratio, ratio);

    // Do NOT clear on scroll
  }

  function initSignaturePad() {
    window.signaturePad = new SignaturePad(canvas, {
      backgroundColor: "rgba(255,255,255,0)",
      penColor: "black",
      minWidth: 1,
      maxWidth: 2.5,
    });
  }

  // ---- Initialize ----
  resizeCanvas();
  initSignaturePad();
  window.addEventListener("orientationchange", resizeCanvas);
  window.addEventListener("resize", resizeCanvas);

  // ---- Clear button ----
  clearBtn.addEventListener("click", () => {
    if (window.signaturePad) window.signaturePad.clear();
    status.innerHTML = "";
  });

  // ---- Save signature ----
  saveBtn.addEventListener("click", async () => {
    if (!window.signaturePad || window.signaturePad.isEmpty()) {
      status.innerHTML = '<div class="alert alert-warning">Please provide your signature.</div>';
      return;
    }

    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const phone_number = document.getElementById("phone_number").value.trim();
    const agreeTerms = document.getElementById("agreeTerms").checked;

    if (!name || !email || !agreeTerms) {
      status.innerHTML = '<div class="alert alert-warning">Fill all fields and agree to terms.</div>';
      return;
    }

    const dataURL = window.signaturePad.toDataURL("image/png");
    status.innerHTML = '<div class="alert alert-info">Saving…</div>';

    try {
      const res = await fetch("/api/signatures", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, phone_number, signature: dataURL }),
      });
      const json = await res.json();
      if (!res.ok) {
        status.innerHTML = `<div class="alert alert-danger">Error: ${json.error || JSON.stringify(json)}</div>`;
        return;
      }

      status.innerHTML = `<div class="alert alert-success">Saved successfully.</div>`;
      window.signaturePad.clear();
      document.getElementById("name").value = "";
      document.getElementById("email").value = "";
      document.getElementById("phone_number").value = "";
      document.getElementById("agreeTerms").checked = false;

      if (document.getElementById("signature-table-section").style.display === "block") {
        loadSignatures();
      }

      showToast(`${email} has successfully signed!`);
      updateSignatureCount();
    } catch (err) {
      status.innerHTML = `<div class="alert alert-danger">Network error</div>`;
      console.error(err);
    }
  });

  // ---- Signature count ----
  function updateSignatureCount() {
    fetch('/api/signatures')
      .then(res => res.json())
      .then(signatures => {
        signatureCountSpan.textContent = `Total Signatures: ${signatures.length}`;
      });
  }
  updateSignatureCount();

  // ---- Load signatures ----
  function loadSignatures() {
    fetch('/api/signatures')
      .then(res => res.json())
      .then(signatures => {
        signatureList.innerHTML = '';
        signatures.forEach(sig => {
          const imgUrl = `/uploads/${sig.filename}`;
          const tr = document.createElement("tr"); // ✅ create the tr element
          tr.innerHTML = `
          <td>${sig.name}</td>
          <td>${sig.phone_number}</td>
          <td>${sig.email}</td>
          <td><img src="${imgUrl}" width="200"></td>
          <td>${sig.created_at}</td>
        `;
          signatureList.appendChild(tr);
        });
      });
  }


  // ---- Toast ----
  function showToast(message) {
    const toastEl = document.createElement("div");
    toastEl.className = "toast align-items-center text-bg-success border-0";
    toastEl.setAttribute("role", "alert");
    toastEl.setAttribute("aria-live", "assertive");
    toastEl.setAttribute("aria-atomic", "true");

    toastEl.innerHTML = `
      <div class="d-flex">
        <div class="toast-body">${message}</div>
        <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
      </div>
    `;
    toastContainer.appendChild(toastEl);
    const toast = new bootstrap.Toast(toastEl, { delay: 3000 });
    toast.show();
    toastEl.addEventListener('hidden.bs.toast', () => toastEl.remove());
  }

  // ---- Password-protected table ----
  submitBtn.addEventListener("click", () => {
    const password = document.getElementById("password-input").value.trim();
    if (password === "dangote001") {
      document.getElementById("password-section").style.display = "none";
      document.getElementById("signature-table-section").style.display = "block";
      loadSignatures();
    } else {
      alert("Incorrect password!");
    }
  });

})();
