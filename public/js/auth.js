document.addEventListener("DOMContentLoaded", () => {

  const loginForm = document.getElementById("loginForm");
  const registerForm = document.getElementById("registerForm");

  const user = window.API.getUser();

  /* ================= AUTO REDIRECT ================= */
  if (user && (window.location.pathname.includes("login") || window.location.pathname.includes("register"))) {
    window.location.href = "/dashboard.html";
  }

  /* ================= LOGIN ================= */
  if (loginForm) {
    const btn = loginForm.querySelector("button");

    loginForm.addEventListener("submit", async (event) => {
      event.preventDefault();

      btn.disabled = true;
      btn.textContent = "Logging in...";

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

        /* 🔥 BETTER UX */
        if (data.user.role === "user" && !data.user.isApproved) {
          window.APP.showToast("Account pending admin approval", "info");
        } else {
          window.APP.showToast("Login successful", "success");
        }

        setTimeout(() => {
          window.location.href =
            data.user.role === "admin"
              ? "/admin.html"
              : "/dashboard.html";
        }, 400);

      } catch (error) {
        if (error.message.includes("Invalid")) {
          window.APP.showToast("Invalid email or password", "error");
        } else {
          window.APP.showToast(error.message, "error");
        }
      } finally {
        btn.disabled = false;
        btn.textContent = "Login";
      }
    });
  }

  /* ================= REGISTER ================= */
  if (registerForm) {
    const btn = registerForm.querySelector("button");

    registerForm.addEventListener("submit", async (event) => {
      event.preventDefault();

      btn.disabled = true;
      btn.textContent = "Creating account...";

      const formData = new FormData(registerForm);
      const payload = {
        name: formData.get("name")?.trim(),
        email: formData.get("email")?.trim(),
        password: formData.get("password"),
        address: formData.get("address")?.trim(),
      };

      /* VALIDATION */
      if (!payload.name || !payload.email || !payload.password || !payload.address) {
        window.APP.showToast("Please fill all fields", "error");
        btn.disabled = false;
        btn.textContent = "Create Account";
        return;
      }

      try {
        await window.API.apiRequest("/register", {
          method: "POST",
          body: payload,
        });

        window.APP.showToast("Registered! Waiting for admin approval.", "success");

        registerForm.reset();

        setTimeout(() => {
          window.location.href = "/login.html";
        }, 800);

      } catch (error) {

        /* 🔥 HANDLE 409 ERROR */
        if (error.message.toLowerCase().includes("exists")) {
          window.APP.showToast("Email already registered. Please login.", "error");
        } else {
          window.APP.showToast(error.message, "error");
        }

      } finally {
        btn.disabled = false;
        btn.textContent = "Create Account";
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