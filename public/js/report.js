document.addEventListener("DOMContentLoaded", () => {
  window.APP.redirectIfNoAuth();

  const reportForm = document.getElementById("reportForm");

  reportForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const formData = new FormData(reportForm);
    const payload = {
      title: formData.get("title"),
      description: formData.get("description"),
      type: formData.get("type"),
      location: formData.get("location"),
      image: formData.get("image"),
    };

    try {
      await window.API.apiRequest("/incidents", {
        method: "POST",
        auth: true,
        body: payload,
      });

      window.APP.showToast("Report submitted", "success");
      reportForm.reset();

      setTimeout(() => {
        window.location.href = "/dashboard.html";
      }, 500);
    } catch (error) {
      window.APP.showToast(error.message, "error");
    }
  });
});
