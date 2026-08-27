const API = "https://api-u1cj.onrender.com/api";

document.addEventListener("DOMContentLoaded", () => {
  renderNavbar();

  // --- Registro ---
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

  // --- Login ---
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

  // --- Crear Post ---
  const postForm = document.getElementById("postForm");
  if (postForm) {
    postForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const title = document.getElementById("title").value;
      const content = document.getElementById("content").value;
      const category = document.getElementById("category")?.value || "General";
      const image = document.getElementById("image")?.files[0];
      const token = localStorage.getItem("token");

      if (!token) {
        showToast("Debes iniciar sesión para crear un post.", "warning");
        return;
      }

      try {
        const formData = new FormData();
        formData.append("title", title);
        formData.append("content", content);
        formData.append("category", category);
        if (image) formData.append("image", image);

        const res = await fetch(`${API}/posts`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        });

        const data = await res.json();
        if (res.status === 201) {
  showToast("Post creado correctamente", "success");
  setTimeout(() => {
    window.location.href = "index.html";
  }, 2000);
} else {
          showToast(data.error || "Error al crear post", "danger");
        }
      } catch {
        showToast("Error de conexión con el servidor", "danger");
      }
    });
  }

  // --- Cargar posts en index ---
  if (document.getElementById("posts")) loadPosts();

  // --- Cargar detalle en post.html ---
  const params = new URLSearchParams(window.location.search);
  const postId = params.get("id");
  if (postId) {
    loadPostDetail(postId);
    toggleCommentForm(); // 👈 mostrar/ocultar formulario según autenticación

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
          const res = await fetch(`${API}/posts/${postId}/comments`, {
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
            loadPostDetail(postId); // recargar comentarios
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

// --- Funciones auxiliares ---
function renderNavbar() {
  const navLinks = document.getElementById("navLinks");
  if (!navLinks) return;

  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  if (token) {
    navLinks.innerHTML = `
      <li><a class="nav-link" href="index.html">Inicio</a></li>
      ${role === "admin" ? `<li><a class="nav-link" href="dashboard.html">Dashboard</a></li>` : ""}
      <li><a class="nav-link" href="posts.html">Posts</a></li>
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
  toast.className = `toast align-items-center text-bg-${type} border-0`;
  toast.role = "alert";
  toast.innerHTML = `
    <div class="d-flex">
      <div class="toast-body">${message}</div>
      <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
    </div>
  `;
  toastContainer.appendChild(toast);
  new bootstrap.Toast(toast).show();
}

function createToastContainer() {
  const container = document.createElement("div");
  container.id = "toastContainer";
  container.className = "toast-container position-fixed bottom-0 end-0 p-3";
  document.body.appendChild(container);
  return container;
}

// --- Mostrar/ocultar formulario de comentarios ---
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


function renderComments(comments) {
  const commentsList = document.getElementById("comments-list");
  commentsList.innerHTML = "";

  comments.forEach(comment => {
    const div = document.createElement("div");
    div.className = "comment-card";
    div.innerHTML = `
      <span class="author">${comment.user}:</span>
      <span class="text">${comment.text}</span>
      <button class="btn-delete" onclick="deleteComment('${comment._id}')">🗑 Eliminar</button>
    `;
    commentsList.appendChild(div);
  });
}

// --- Eliminar comentarios ---

async function deleteComment(commentId, postId) {
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
      loadPostDetail(postId); // recargar comentarios
    } else {
      showToast(data.error || "Error al eliminar comentario", "danger");
    }
  } catch {
    showToast("Error de conexión con el servidor", "danger");
  }
}


// --- Cargar lista de posts ---
async function loadPosts(page = 1) {
  try {
    const res = await fetch(`${API}/posts?page=${page}&limit=5`);
    const data = await res.json();

    const postsDiv = document.getElementById("posts");
    postsDiv.innerHTML = "";

    if (!data.posts || !Array.isArray(data.posts)) {
      postsDiv.innerHTML = `<div class="custom-alert">No hay posts disponibles.</div>`;
      return;
    }

        data.posts.forEach((post) => {
      if (!post || !post.title) return;

      const div = document.createElement("div");
      div.className = "post-card";

      div.innerHTML = `
        <img src="${post.image || 'img/default-post.jpg'}" 
             alt="Imagen destacada" class="post-img mb-3">
        <h3 class="post-title">
          <a href="post.html?id=${post._id}" class="text-decoration-none">
            ${post.title}
          </a>
        </h3>
        <span class="badge bg-warning text-dark">${post.category || "General"}</span>
        <p class="post-content">
  ${(post.content && post.content.length > 120) 
    ? post.content.substring(0, 120) + "..." 
    : post.content || ""}
</p>
        <div class="post-meta">
          <span>👤 ${post.user?.username || "Desconocido"}</span>
          <span>📅 ${post.createdAt ? new Date(post.createdAt).toLocaleDateString() : ""}</span>
          <span id="likes-${post._id}">❤️ ${post.likes || 0} likes</span>
        </div>
        <div class="post-actions">
          ${localStorage.getItem("token") && localStorage.getItem("userId")
            ? `<button class="btn-like" onclick="likePost('${post._id}')">👍 Like</button>
               <button class="btn-share" onclick="sharePost('${post._id}')">🔗 Compartir</button>`
            : ""}
          ${(localStorage.getItem("role") === "admin" || post.user?._id === localStorage.getItem("userId"))
            ? `<button class="btn-delete" onclick="deletePost('${post._id}')">🗑 Eliminar</button>`
            : ""}
        </div>
      `;

      postsDiv.appendChild(div);
    });

    // Paginación
    const paginationDiv = document.getElementById("pagination");
    paginationDiv.innerHTML = `
      <button onclick="loadPosts(${page - 1})" ${page === 1 ? "disabled" : ""}>Anterior</button>
      <span class="pagination-info">Página ${page} de ${data.pages || 1}</span>
      <button onclick="loadPosts(${page + 1})" ${page === data.pages ? "disabled" : ""}>Siguiente</button>
    `;
  } catch (err) {
    console.error("Error en loadPosts:", err);
    showToast("Error al cargar posts", "danger");
  }
}

// --- Cargar detalle de un post ---
async function loadPostDetail(id) {
  try {
    const res = await fetch(`${API}/posts/${id}`);
    const post = await res.json();

    const detailDiv = document.getElementById("post-detail");
    detailDiv.innerHTML = `
      <img src="${post.image || 'img/default-post.jpg'}" 
           alt="Imagen destacada" 
           class="detail-img">
      <h2 class="post-title">${post.title}</h2>
      <span class="badge bg-warning text-dark">${post.category}</span>
      <p class="post-content">${post.content}</p>
      <div class="post-meta">👤 ${post.user?.username || "Desconocido"}</div>
      <div class="post-meta">📅 ${new Date(post.createdAt).toLocaleDateString()}</div>
    `;

    const commentsDiv = document.getElementById("comments-list");
    commentsDiv.innerHTML = post.comments.map(c => `
      <p>
        <b>${c.user?.username || "Anónimo"}:</b> ${c.content}
        ${(localStorage.getItem("userId") === c.user?._id || localStorage.getItem("role") === "admin")
          ? `<button class="btn btn-sm btn-danger ms-2" onclick="deleteComment('${c._id}', '${id}')">Eliminar</button>`
          : ""}
      </p>
    `).join("");

  } catch (err) {
    console.error("Error al cargar detalle:", err);
    showToast("Error al cargar detalle del post", "danger");
  }
}

async function likePost(id) {
  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("userId");

  if (!token || !userId) {
    showToast("Debes iniciar sesión para dar like.", "warning");
    return;
  }

  try {
    const res = await fetch(`${API}/posts/${id}/like`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ userId })
    });

    const data = await res.json();
    if (res.status === 200) {
      // actualizar contador en pantalla
      const likesSpan = document.getElementById(`likes-${id}`);
      if (likesSpan) likesSpan.textContent = `❤️ ${data.likes} likes`;
      showToast("Like registrado", "success");
    } else {
      showToast(data.error || "Error al dar like", "danger");
    }
  } catch (err) {
    showToast("Error de conexión con el servidor", "danger");
  }
}




function sharePost(id) {
  const url = `${window.location.origin}/post.html?id=${id}`;
  navigator.clipboard.writeText(url).then(() => {
    showToast("Enlace copiado al portapapeles", "info");
  });
}

function savePost(id) {
  // Aquí podrías guardar en la BD o localStorage
  showToast("Post guardado en favoritos", "success");
}

// Toast de Bootstrap para feedback moderno
function showToast(message, type = "info") {
  const toastContainer = document.getElementById("toastContainer") || createToastContainer();
  const toast = document.createElement("div");
  toast.className = `toast align-items-center text-bg-${type} border-0`;
  toast.role = "alert";
  toast.innerHTML = `
    <div class="d-flex">
      <div class="toast-body">${message}</div>
      <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
    </div>
  `;
  toastContainer.appendChild(toast);
  new bootstrap.Toast(toast).show();
}

function createToastContainer() {
  const container = document.createElement("div");
  container.id = "toastContainer";
  container.className = "toast-container position-fixed bottom-0 end-0 p-3";
  document.body.appendChild(container);
  return container;
}


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
      <div class="profile-card text-center">
        <img src="${data.avatar && data.avatar.trim() !== "" 
          ? data.avatar 
          : "img/default-logo.png"}" 
          alt="Avatar" class="avatar-img mb-3"
          onerror="this.src='img/default-logo.png'">
        <h3>${data.firstName} ${data.lastName}</h3>
        <p class="email-text">${data.email}</p>
        <h4 class="username-text">${data.username}</h4>
        <p class="bio-text">${data.bio || "Sin biografía"}</p>
      </div>
    `;
  } catch {
    alert("Error al cargar perfil");
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
    alert(data.message || "Perfil actualizado");
    loadProfile();
  } catch {
    alert("Error al actualizar perfil");
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
                  ? `<button class="btn-form" onclick="updateUserRole('${user._id}', 'user')">Revertir a Usuario</button>`
                  : `<button class="btn-form" onclick="updateUserRole('${user._id}', 'admin')">Administrador</button>`}
                <button class="btn-delete" onclick="deleteUser('${user._id}')">Eliminar</button>
              </td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    `;
  } catch {
    alert("Error de conexión con el servidor");
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
    alert(data.message);
    loadUsers();
  } catch {
    alert("Error al actualizar rol");
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
      alert(data.message);
      loadUsers();
    } else {
      alert(data.error || "Error al eliminar usuario");
    }
  } catch {
    alert("Error de conexión con el servidor");
  }
}

document.addEventListener("DOMContentLoaded", () => {
  if (window.location.pathname.endsWith("profile.html")) {
    loadProfile();
  }
});
