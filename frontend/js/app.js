const API = "https://api-u1cj.onrender.com/api";

document.addEventListener("DOMContentLoaded", () => {
  renderNavbar();

  // Registro
  const registerForm = document.getElementById("registerForm");
  if (registerForm) {
    registerForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const username = document.getElementById("username").value;
      const password = document.getElementById("password").value;

      try {
        const res = await fetch(`${API}/auth/register`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, password }),
        });

        const data = await res.json();
        if (res.status === 201) {
          alert("Usuario registrado correctamente");
          window.location.href = "login.html";
        } else {
          alert(data.error || "Error en el registro");
        }
      } catch {
        alert("Error de conexión con el servidor");
      }
    });
  }

  // Login
  const loginForm = document.getElementById("loginForm");
  if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const username = document.getElementById("username").value;
      const password = document.getElementById("password").value;

      try {
        const res = await fetch(`${API}/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, password }),
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
            window.location.href = "posts.html";
          }
        } else {
          alert(data.error || "Error en login");
        }
      } catch {
        alert("Error de conexión con el servidor");
      }
    });
  }

  // Crear post
  const postForm = document.getElementById("postForm");
  if (postForm) {
    postForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const title = document.getElementById("title").value;
      const content = document.getElementById("content").value;
      const token = localStorage.getItem("token");

      if (!token) {
        alert("Debes iniciar sesión para crear un post.");
        return;
      }

      try {
        const res = await fetch(`${API}/posts`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ title, content }),
        });

        const data = await res.json();
        if (res.status === 201) {
          alert("Post creado correctamente");
          window.location.href = "index.html";
        } else {
          alert(data.error || "Error al crear post");
        }
      } catch {
        alert("Error de conexión con el servidor");
      }
    });
  }

  // Mostrar posts
  if (document.getElementById("posts")) loadPosts();

  // Perfil
  if (document.getElementById("profile")) loadProfile();

  // Editar perfil
  const profileForm = document.getElementById("profileForm");
  if (profileForm) {
    profileForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const bio = document.getElementById("bio").value;
      const avatar = document.getElementById("avatar").value;
      const token = localStorage.getItem("token");

      if (!token) {
        alert("Debes iniciar sesión para actualizar tu perfil.");
        return;
      }

      try {
        const res = await fetch(`${API}/auth/profile`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ bio, avatar }),
        });

        const data = await res.json();
        if (res.status === 200) {
          alert("Perfil actualizado correctamente");
          loadProfile();
        } else {
          alert(data.error || "Error al actualizar perfil");
        }
      } catch {
        alert("Error de conexión con el servidor");
      }
    });
  }
});

// Navbar dinámico
function renderNavbar() {
  const navLinks = document.getElementById("navLinks");
  if (!navLinks) return;

  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  if (token) {
    navLinks.innerHTML = `
      <li class="nav-item"><a class="nav-link" href="index.html">Inicio</a></li>
      ${
        role === "admin"
          ? `<li class="nav-item"><a class="nav-link" href="dashboard.html">Dashboard</a></li>`
          : ""
      }
      <li class="nav-item"><a class="nav-link" href="posts.html">Posts</a></li>
      <li class="nav-item"><a class="nav-link" href="profile.html">Perfil</a></li>
      <li class="nav-item"><a class="nav-link" href="#" onclick="logout()">Salir</a></li>
    `;
  } else {
    navLinks.innerHTML = `
      <li class="nav-item"><a class="nav-link" href="index.html">Inicio</a></li>
      <li class="nav-item"><a class="nav-link" href="login.html">Login</a></li>
      <li class="nav-item"><a class="nav-link" href="register.html">Registro</a></li>
    `;
  }
}

// Logout
function logout() {
  localStorage.clear();
  window.location.href = "login.html";
}

// Cargar posts
async function loadPosts(page = 1) {
  try {
    const res = await fetch(`${API}/posts?page=${page}&limit=5`);
    const data = await res.json();

    const postsDiv = document.getElementById("posts");
    postsDiv.innerHTML = "";

    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("userId");
    const role = localStorage.getItem("role");

    data.posts.forEach((post) => {
      const div = document.createElement("div");
      div.className = "blog-card";

      div.innerHTML = `
  <article class="blog-card">
    <div class="card-body">
      <h3 class="blog-title">${post.title}</h3>
      <p class="blog-content">${post.content}</p>
      <div class="blog-meta">
        <span class="author">👤 ${post.user?.username || "Desconocido"}</span>
        <span class="date">📅 ${new Date(post.createdAt).toLocaleDateString()}</span>
        <span class="likes">❤️ ${post.likes} likes</span>
      </div>
    </div>
    <div class="card-footer">
      ${localStorage.getItem("token") && localStorage.getItem("userId")
        ? `<button class="btn btn-outline-primary btn-sm" onclick="likePost('${post._id}')">👍 Like</button>`
        : ""}
      ${(localStorage.getItem("role") === "admin" || post.user?._id === localStorage.getItem("userId"))
        ? `<button class="btn btn-danger btn-sm ms-2" onclick="deletePost('${post._id}')">🗑 Eliminar</button>`
        : ""}
    </div>
  </article>
`;

      postsDiv.appendChild(div);
    });

    // Paginación
    const paginationDiv = document.getElementById("pagination");
paginationDiv.innerHTML = `
  <button class="btn btn-secondary" onclick="loadPosts(${page - 1})" ${page === 1 ? "disabled" : ""}>Anterior</button>
  <span class="pagination-info mx-3">Página ${page} de ${data.pages}</span>
  <button class="btn btn-secondary" onclick="loadPosts(${page + 1})" ${page === data.pages ? "disabled" : ""}>Siguiente</button>
`;
postsDiv.parentNode.appendChild(pagination);
  } catch {
    alert("Error al cargar posts");
  }
}

// Dar like con validación
async function likePost(id) {
  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("userId");

  if (!token || !userId) {
    alert("Debes iniciar sesión para dar like.");
    return;
  }

  try {
    const res = await fetch(`${API}/posts/${id}/like`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ userId }),
    });
    const data = await res.json();
    if (res.status === 200) {
      alert(data.message || "Like registrado");
      loadPosts();
    } else {
      alert(data.error || "Error al dar like");
    }
  } catch {
    alert("Error de conexión con el servidor");
  }
}

// Eliminar post
async function deletePost(id) {
  const token = localStorage.getItem("token");
  if (!token) {
    alert("Debes iniciar sesión para eliminar un post.");
    return;
  }

  try {
    const res = await fetch(`${API}/posts/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (res.status === 200) {
      alert(data.message);
      loadPosts();
    } else {
      alert(data.error || "Error al eliminar post");
    }
  } catch {
    alert("Error de conexión con el servidor");
  }
}

// Cargar perfil
async function loadProfile() {
  const token = localStorage.getItem("token");
  if (!token) {
    document.getElementById("profile").innerHTML = `
      <div class="alert alert-warning">Debes iniciar sesión para ver tu perfil.</div>
    `;
    return;
  }

  try {
    const res = await fetch(`${API}/auth/profile`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();

    const profileDiv = document.getElementById("profile");
    profileDiv.innerHTML = `
  <div class="profile-card text-center">
    <img src="${data.avatar || "https://via.placeholder.com/150"}" 
         alt="Avatar" class="avatar-img mb-3">
    <h4 class="fw-bold">${data.username}</h4>
    <p class="bio-text">${data.bio || "Sin biografía"}</p>
  </div>
`;

  } catch {
    alert("Error al cargar perfil");
  }
}

document.getElementById("editProfileForm").addEventListener("submit", async (e) => {
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
    alert(data.message || "Perfil actualizado");
    loadProfile();
  } catch {
    alert("Error al actualizar perfil");
  }
});

// Cargar lista de usuarios (solo admin)
async function loadUsers() {
  const usersDiv = document.getElementById("users");
  if (!usersDiv) return;

  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  if (role !== "admin") {
    usersDiv.innerHTML = `
      <div class="alert alert-danger">No autorizado. Solo los administradores pueden ver esta sección.</div>
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
        <div class="alert alert-danger">${data.error || "Error al cargar usuarios"}</div>
      `;
      return;
    }

    usersDiv.innerHTML = `
      <h2 class="mb-3">Gestión de Usuarios</h2>
      <table class="table table-striped">
        <thead>
          <tr>
            <th>Usuario</th>
            <th>Rol</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          ${data
            .map(
              (user) => `
            <tr>
              <td>${user.username}</td>
              <td>${user.role}</td>
              <td>
                ${
                  user.role === "admin"
                    ? `<button class="btn btn-sm btn-secondary" onclick="updateUserRole('${user._id}', 'user')">Revertir a User</button>`
                    : `<button class="btn btn-sm btn-warning" onclick="updateUserRole('${user._id}', 'admin')">Promover a Admin</button>`
                }
                <button class="btn btn-sm btn-danger ms-2" onclick="deleteUser('${user._id}')">Eliminar</button>
              </td>
            </tr>
          `,
            )
            .join("")}
        </tbody>
      </table>
    `;
  } catch {
    alert("Error de conexión con el servidor");
  }
}

// Actualizar rol de usuario
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
    alert(data.message);
    loadUsers();
  } catch {
    alert("Error al actualizar rol");
  }
}

// Eliminar usuario (solo admin)
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
      alert(data.message);
      loadUsers();
    } else {
      alert(data.error || "Error al eliminar usuario");
    }
  } catch {
    alert("Error de conexión con el servidor");
  }
}
