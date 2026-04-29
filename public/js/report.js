document.addEventListener("DOMContentLoaded", () => {
  window.APP.redirectIfNoAuth();

  const reportForm = document.getElementById("reportForm");
  if (!reportForm) return;

  const submitBtn = reportForm.querySelector("button");

  /* ================= IMAGE PREVIEW ================= */
  const imageInput = reportForm.querySelector('input[name="image"]');
  const previewBox = document.getElementById("imagePreview");

  if (imageInput && previewBox) {
    imageInput.addEventListener("input", () => {
      const url = imageInput.value.trim();

      if (!url) {
        previewBox.innerHTML = "";
        return;
      }

      previewBox.innerHTML = `
        <p class="muted">Preview:</p>
        <img src="${url}" alt="Preview" />
      `;
    });
  }

  /* ================= SUBMIT ================= */
  reportForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    submitBtn.disabled = true;
    submitBtn.textContent = "Submitting...";

    const formData = new FormData(reportForm);

    const payload = {
      title: formData.get("title")?.trim(),
      description: formData.get("description")?.trim(),
      type: formData.get("type"),
      location: formData.get("location")?.trim(),
      image: formData.get("image"),
    };

    /* ================= VALIDATION ================= */
    if (!payload.title || !payload.description || !payload.location) {
      window.APP.showToast("Please fill all required fields", "error");
      submitBtn.disabled = false;
      submitBtn.textContent = "Submit Report";
      return;
    }

    try {
      await window.API.apiRequest("/incidents", {
        method: "POST",
        auth: true,
        body: payload,
      });

      window.APP.showToast("Report submitted successfully", "success");

      reportForm.reset();
      previewBox.innerHTML = ""; // ✅ clear preview

      setTimeout(() => {
        window.location.href = "/dashboard.html";
      }, 600);

    } catch (error) {
      window.APP.showToast(error.message || "Submission failed", "error");
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = "Submit Report";
    }
  });
});