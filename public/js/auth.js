document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("loginForm");
  const registerForm = document.getElementById("registerForm");

  /* ================= LOGIN ================= */
  if (loginForm) {
    loginForm.addEventListener("submit", async (event) => {
      event.preventDefault();

      const formData = new FormData(loginForm);
      const payload = {
        email: formData.get("email"),
        password: formData.get("password"),
      };

      try {
        const data = await window.API.apiRequest("/login", {
          method: "POST",
          body: payload,
        });

        window.API.setAuth(data.token, data.user);

        if (data.user.role === "user" && data.user.isApproved) {
          window.APP.showToast("Approved by admin. Welcome.", "success");
        } else {
          window.APP.showToast("Login successful", "success");
        }

        setTimeout(() => {
          window.location.href =
            data.user.role === "admin"
              ? "/admin.html"
              : "/dashboard.html";
        }, 300);
      } catch (error) {
        window.APP.showToast(error.message, "error");
      }
    });
  }

  /* ================= REGISTER ================= */
  if (registerForm) {
    registerForm.addEventListener("submit", async (event) => {
      event.preventDefault();

      const formData = new FormData(registerForm);
      const payload = {
        name: formData.get("name"),
        email: formData.get("email"),
        password: formData.get("password"),
        address: formData.get("address"),
      };

      try {
        await window.API.apiRequest("/register", {
          method: "POST",
          body: payload,
        });

        window.APP.showToast("Registration submitted for approval", "success");
        registerForm.reset();

        setTimeout(() => {
          window.location.href = "/login.html";
        }, 700);
      } catch (error) {
        window.APP.showToast(error.message, "error");
      }
    });
  }

  /* ================= PASSWORD TOGGLE ================= */
  document.querySelectorAll(".toggle-password").forEach((toggle) => {
    toggle.addEventListener("click", () => {
      const input = toggle.previousElementSibling;
      const icon = toggle.querySelector("i");

      if (input.type === "password") {
        input.type = "text";
        icon.classList.replace("fa-eye", "fa-eye-slash");
      } else {
        input.type = "password";
        icon.classList.replace("fa-eye-slash", "fa-eye");
      }
    });
  });

}); 