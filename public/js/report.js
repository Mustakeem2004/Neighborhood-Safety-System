document.addEventListener("DOMContentLoaded", () => {
  window.APP.redirectIfNoAuth();

  const reportForm = document.getElementById("reportForm");

  if (!reportForm) return; // ✅ prevents crash on other pages

  const submitBtn = reportForm.querySelector("button");

  reportForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    // 🔒 Prevent multiple clicks
    submitBtn.disabled = true;
    submitBtn.textContent = "Submitting...";

    const formData = new FormData(reportForm);

    const payload = {
      title: formData.get("title")?.trim(),
      description: formData.get("description")?.trim(),
      type: formData.get("type"),
      location: formData.get("location")?.trim(),
      image: formData.get("image"), // file or URL
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