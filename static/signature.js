// static/signature.js
(function () {
  const canvas = document.getElementById("canvas");
  const signaturePad = new SignaturePad(canvas, {
    backgroundColor: "rgba(255,255,255,0)",
    penColor: "black",
  });

  // resize canvas to device pixel ratio for crisp lines
  function resizeCanvas() {
    const ratio = Math.max(window.devicePixelRatio || 1, 1);
    const w = canvas.offsetWidth;
    const h = canvas.offsetHeight;
    canvas.width = w * ratio;
    canvas.height = h * ratio;
    canvas.getContext("2d").scale(ratio, ratio);
    signaturePad.clear(); // clear after resize
  }
  window.addEventListener("resize", resizeCanvas);
  resizeCanvas();

  const clearBtn = document.getElementById("clearBtn");
  const saveBtn = document.getElementById("saveBtn");
  const status = document.getElementById("status");

  clearBtn.addEventListener("click", () => {
    signaturePad.clear();
    status.innerHTML = "";
  });

  saveBtn.addEventListener("click", async () => {
    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();

    if (!name || !email) {
      status.innerHTML = '<div class="alert alert-warning">Please enter name and email.</div>';
      return;
    }

    if (signaturePad.isEmpty()) {
      status.innerHTML = '<div class="alert alert-warning">Please sign the pad before saving.</div>';
      return;
    }

    // get dataURL (PNG)
    const dataURL = signaturePad.toDataURL("image/png");

    status.innerHTML = '<div class="alert alert-info">Saving…</div>';

    try {
      const res = await fetch("/api/signatures", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, signature: dataURL }),
      });

      const json = await res.json();
      if (!res.ok) {
        status.innerHTML = `<div class="alert alert-danger">Error: ${json.error || JSON.stringify(json)}</div>`;
        return;
      }
      status.innerHTML = `<div class="alert alert-success">Saved successfully.</div>`;
      signaturePad.clear();
      document.getElementById("name").value = "";
      document.getElementById("email").value = "";
    } catch (err) {
      status.innerHTML = `<div class="alert alert-danger">Network error</div>`;
      console.error(err);
    }
  });
})();
