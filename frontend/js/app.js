const API = "https://api-u1cj.onrender.com/api";

document.addEventListener("DOMContentLoaded", () => {
  renderNavbar();

  const registerForm = document.getElementById("registerForm");
  if (registerForm) {
    registerForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const firstName = document.getElementById("firstName").value;
      const lastName = document.getElementById("lastName").value;
      const email = document.getElementById("email").value;
      const username = document.getElementById("username").value;
      const password = document.getElementById("password").value;
      const confirmPassword = document.getElementById("confirmPassword").value;

      const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;
      if (!regex.test(password)) {
        alert("La contraseña debe tener mínimo 8 caracteres, incluir mayúscula, minúscula, número y símbolo.");
        return;
      }

      if (password !== confirmPassword) {
        alert("Las contraseñas no coinciden.");
        return;
      }

      try {
        const res = await fetch(`${API}/auth/register`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ firstName, lastName, email, username, password, confirmPassword }),
        });

        const data = await res.json();
        if (res.status === 201) {
          alert("Usuario registrado correctamente.");
          window.location.href = "login.html";
        } else if (res.status === 409) {
          alert(data.error || "El usuario o correo ya existe");
        } else {
          alert(data.error || "Error en el registro");
        }
      } catch {
        alert("Error de conexión con el servidor");
      }
    });
  }

const loginForm = document.getElementById("loginForm");
  if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const identifier = document.getElementById("username").value;
      const password = document.getElementById("password").value;

      try {
        const res = await fetch(`${API}/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ identifier, password }),
        });

        const data = await res.json();
        if (data.token) {
          localStorage.setItem("token", data.token);
          localStorage.setItem("role", data.role);
          localStorage.setItem("userId", data.userId);
          alert("Login exitoso");

          if (data.role === "admin") {
            window.location.href = "dashboard.html";
          } else {
            window.location.href = "vehicles.html";
          }
        } else {
          alert(data.error || "Error en login");
        }
      } catch {
        alert("Error de conexión con el servidor");
      }
    });
  }

  const carForm = document.getElementById("carForm");

if (carForm) {
  carForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const formData = new FormData(carForm);
    const token = localStorage.getItem("token");

    try {
      const res = await fetch(`${API}/vehicles`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });

      const data = await res.json();
      if (res.status === 201) {
        showToast("Vehículo publicado correctamente", "success");
        console.log("Vehicle:", data.vehicle);

        // Redirige al index después de 2 segundos
        setTimeout(() => {
          window.location.href = "index.html";
        }, 2000);
      } else {
        showToast(data.error || "Error al publicar vehículo", "danger");
      }
    } catch (err) {
      showToast("Error de conexión con el servidor", "danger");
    }
  });
}

  if (document.getElementById("posts")) loadVehicles();

  const params = new URLSearchParams(window.location.search);
  const vehicleId = params.get("id");
  if (vehicleId) {
  loadVehicleDetail(vehicleId);
    toggleCommentForm(); 

    const commentForm = document.getElementById("commentForm");
    if (commentForm) {
      commentForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const text = document.getElementById("commentText").value;
        const token = localStorage.getItem("token");

        if (!token) {
          showToast("Debes iniciar sesión para comentar.", "warning");
          return;
        }

        try {
          const res = await fetch(`${API}/vehicles/${vehicleId}/comments`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({ content: text })
          });

          const data = await res.json();
          if (res.status === 201) {
            document.getElementById("commentText").value = "";
            loadVehicleDetail(vehicleId);
            showToast("Comentario agregado", "success");
          } else {
            showToast(data.error || "Error al agregar comentario", "danger");
          }
        } catch {
          showToast("Error de conexión con el servidor", "danger");
        }
      });
    }
  }
});

async function loadVehicles(page = 1) {
  try {

    const res = await fetch(
      `${API}/vehicles?page=${page}&limit=12`
    );

    const data = await res.json();

    const container = document.getElementById("posts");

    if (!container) return;

    container.innerHTML = "";

    if (!data.vehicles) return;

    data.vehicles.forEach(vehicle => {

      const card = document.createElement("div");

      card.className = "post-card";

      card.innerHTML = `
        <img
          src="${vehicle.image || 'img/default-car.jpg'}"
          alt="${vehicle.title}"
          class="post-img"
        >

        <h3>
          <a href="vehicle.html?id=${vehicle._id}">
            ${vehicle.title}
          </a>
        </h3>

        <p><strong>Marca:</strong> ${vehicle.brand}</p>

        <p><strong>Modelo:</strong> ${vehicle.model}</p>

        <p><strong>Año:</strong> ${vehicle.year}</p>

        <p><strong>Precio:</strong>
          $${Number(vehicle.price).toLocaleString()}
        </p>

        <p><strong>Ciudad:</strong> ${vehicle.city}</p>

        <p><strong>Km:</strong>
          ${Number(vehicle.mileage).toLocaleString()}
        </p>

        <p><strong>Estado:</strong>
          ${vehicle.status}
        </p>
      `;

      container.appendChild(card);

    });

  } catch (error) {

    console.error(error);

    showToast(
      "Error cargando vehículos",
      "danger"
    );

  }
}

async function loadVehicleDetail(id) {
  try {

    const res = await fetch(
      `${API}/vehicles/${id}`
    );

    const vehicle = await res.json();

    const container =
      document.getElementById("vehicle-detail");

    if (!container) return;

    container.innerHTML = `
      <img
        src="${vehicle.image}"
        class="detail-img"
        alt="${vehicle.title}"
      >

      <h2>${vehicle.title}</h2>

      <p>
        <strong>Marca:</strong>
        ${vehicle.brand}
      </p>

      <p>
        <strong>Modelo:</strong>
        ${vehicle.model}
      </p>

      <p>
        <strong>Año:</strong>
        ${vehicle.year}
      </p>

      <p>
        <strong>Precio:</strong>
        $${Number(vehicle.price).toLocaleString()}
      </p>

      <p>
        <strong>Kilometraje:</strong>
        ${Number(vehicle.mileage).toLocaleString()} km
      </p>

      <p>
        <strong>Ciudad:</strong>
        ${vehicle.city}
      </p>

      <p>
        <strong>Estado:</strong>
        ${vehicle.status}
      </p>

      <p>
        <strong>Visitas:</strong>
        ${vehicle.views}
      </p>

      <p class="post-content">
        ${vehicle.description}
      </p>

      <a
        href="https://wa.me/57${vehicle.whatsapp}"
        target="_blank"
        class="btn-form"
      >
        Contactar por WhatsApp
      </a>
    `;

    if (vehicle.comments) {
      renderComments(
        vehicle.comments,
        vehicle._id
      );
    }

  } catch (error) {

    console.error(error);

    showToast(
      "Error cargando vehículo",
      "danger"
    );

  }
}

  
function renderNavbar() {
  const navLinks = document.getElementById("navLinks");
  if (!navLinks) return;

  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  if (token) {
    navLinks.innerHTML = `
      <li><a class="nav-link" href="index.html">Inicio</a></li>
      ${role === "admin" ? `<li><a class="nav-link" href="dashboard.html">Dashboard</a></li>` : ""}
      <li><a class="nav-link" href="vehicles.html">Vehículos</a></li>
      <li><a class="nav-link" href="profile.html">Perfil</a></li>
      <li><a class="nav-link" href="#" onclick="logout()">Salir</a></li>
    `;
  } else {
    navLinks.innerHTML = `
      <li><a class="nav-link" href="index.html">Inicio</a></li>
      <li><a class="nav-link" href="login.html">Login</a></li>
      <li><a class="nav-link" href="register.html">Registro</a></li>
    `;
  }
}

function toggleMenu() {
  const menu = document.getElementById("menu");
  const toggle = document.getElementById("menu-toggle");

  menu.classList.toggle("show");
  toggle.classList.toggle("active");
}

function logout() {
  localStorage.clear();
  window.location.href = "login.html";
}

function showToast(message, type = "info") {
  const toastContainer = document.getElementById("toastContainer") || createToastContainer();
  const toast = document.createElement("div");
  toast.className = `custom-toast ${type}`;
  toast.innerHTML = `
    <span class="toast-message">${message}</span>
    <button class="toast-close" onclick="this.parentElement.remove()">×</button>
  `;
  toastContainer.appendChild(toast);

  setTimeout(() => {
    if (toast.parentElement) toast.remove();
  }, 3000);
}

function toggleCommentForm() {
  const token = localStorage.getItem("token");
  const formContainer = document.getElementById("commentFormContainer");

  if (!formContainer) return;

  if (token) {
    formContainer.style.display = "block";
  } else {
    formContainer.style.display = "none";
  }
}


function renderComments(comments, vehicleId) {
  const commentsList = document.getElementById("comments-list");
  commentsList.innerHTML = "";

  comments.forEach(comment => {
    const div = document.createElement("div");
    div.className = "comment-card";
    div.innerHTML = `
      <span class="author">${comment.user?.username || "Anónimo"}:</span>
      <span class="text">${comment.text}</span>
      <button class="btn-delete" onclick="deleteComment('${comment._id}', '${vehicleId}')">Eliminar</button>
    `;
    commentsList.appendChild(div);
  });
}

async function deleteComment(commentId, vehicleId) {
  const token = localStorage.getItem("token");
  if (!token) {
    showToast("Debes iniciar sesión para eliminar comentarios.", "warning");
    return;
  }

  if (!confirm("¿Seguro que deseas eliminar este comentario?")) return;

  try {
    const res = await fetch(`${API}/comments/${commentId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` }
    });

    const data = await res.json();
    if (res.status === 200) {
      showToast(data.message, "success");
      loadVehicleDetail(vehicleId);
    } else {
      showToast(data.error || "Error al eliminar comentario", "danger");
    }
  } catch {
    showToast("Error de conexión con el servidor", "danger");
  }
}

const defaultImage = "https://res.cloudinary.com/tu_cloud/image/upload/v1234567890/default-post.jpg";

function createToastContainer() {
  const container = document.createElement("div");
  container.id = "toastContainer";
  container.className = "toast-container";
  document.body.appendChild(container);
  return container;
}

async function loadProfile() {
  const token = localStorage.getItem("token");
  if (!token) {
    document.getElementById("profile").innerHTML = `
      <div class="custom-alert">Debes iniciar sesión para ver tu perfil.</div>
    `;
    return;
  }

  try {
    const res = await fetch(`${API}/auth/profile`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();

    document.getElementById("profile").innerHTML = `
  <div class="profile-card">
    <img src="${data.avatar && data.avatar.trim() !== "" 
  ? data.avatar 
  : "img/default-logo.png"}" 
  alt="Avatar" class="avatar-img"
  onerror="this.src='img/default-logo.png'">
    <h3>${data.firstName} ${data.lastName}</h3>
    <p class="email-text">${data.email}</p>
    <h4 class="username-text">${data.username}</h4>
    <p class="bio-text">${data.bio || "Sin biografía"}</p>
  </div>
`;

  } catch {
    showToast("Error al cargar perfil", "danger");
  }
}

document.getElementById("editProfileForm")?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const token = localStorage.getItem("token");
  const formData = new FormData(e.target);

  try {
    const res = await fetch(`${API}/auth/profile`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}` },
      body: formData
    });
    const data = await res.json();
    showToast(data.message || "Perfil actualizado", "success");
    loadProfile();
  } catch {
    showToast("Error al actualizar perfil", "danger");
  }
});

async function loadUsers() {
  const usersDiv = document.getElementById("users");
  if (!usersDiv) return;

  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  if (role !== "admin") {
    usersDiv.innerHTML = `
      <div class="custom-alert">No autorizado. Solo los administradores pueden ver esta sección.</div>
    `;
    return;
  }

  try {
    const res = await fetch(`${API}/auth/users`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();

    if (!Array.isArray(data)) {
      usersDiv.innerHTML = `
        <div class="custom-alert">${data.error || "Error al cargar usuarios"}</div>
      `;
      return;
    }

    usersDiv.innerHTML = `
      <h2>Gestión de Usuarios</h2>
      <table>
        <thead>
          <tr>
            <th>Usuario</th>
            <th>Rol</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          ${data.map(user => `
            <tr>
              <td>${user.username}</td>
              <td>${user.role}</td>
              <td>
                ${user.role === "admin"
                  ? `<button class="btn-revert" onclick="updateUserRole('${user._id}', 'user')">Revertir a Usuario</button>`
                  : `<button class="btn-revert" onclick="updateUserRole('${user._id}', 'admin')">Administrador</button>`}
                <button class="btn-delete" onclick="deleteUser('${user._id}')">Eliminar</button>
              </td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    `;
  } catch {
    showToast("Error de conexión con el servidor", "danger");
  }
}

async function updateUserRole(userId, newRole) {
  const token = localStorage.getItem("token");
  try {
    const res = await fetch(`${API}/auth/${userId}/role`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ role: newRole }),
    });
    const data = await res.json();
    showToast(data.message, "success");
    loadUsers();
  } catch {
    showToast("Error al actualizar rol", "danger");
  }
}

async function deleteUser(userId) {
  const token = localStorage.getItem("token");
  if (!confirm("¿Seguro que deseas eliminar este usuario?")) return;

  try {
    const res = await fetch(`${API}/auth/${userId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (res.status === 200) {
      showToast(data.message, "success");
      loadUsers();
    } else {
      showToast(data.error || "Error al eliminar usuario", "danger");
    }
  } catch {
    showToast("Error de conexión con el servidor", "danger");
  }
}

document.addEventListener("DOMContentLoaded", () => {
  if (window.location.pathname.endsWith("profile.html")) {
    loadProfile();
  }
});
