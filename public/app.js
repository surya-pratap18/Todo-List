const tokenKey = "todo_token";
const userKey = "todo_user";
const statuses = ["pending", "in progress", "done"];

const state = {
  token: localStorage.getItem(tokenKey),
  user: JSON.parse(localStorage.getItem(userKey) || "null"),
  tasks: [],
  filter: "all",
};

const authView = document.getElementById("auth-view");
const taskView = document.getElementById("task-view");
const loginTab = document.getElementById("login-tab");
const registerTab = document.getElementById("register-tab");
const loginForm = document.getElementById("login-form");
const registerForm = document.getElementById("register-form");
const authMessage = document.getElementById("auth-message");
const taskMessage = document.getElementById("task-message");
const taskList = document.getElementById("task-list");
const addTaskBtn = document.getElementById("add-task-btn");
const logoutBtn = document.getElementById("logout-btn");
const modalRoot = document.getElementById("modal-root");

const apiRequest = async (url, options = {}) => {
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  if (state.token) {
    headers.Authorization = `Bearer ${state.token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || "Something went wrong");
  }

  return data;
};

const setMessage = (element, message, type = "") => {
  element.textContent = message;
  element.className = `form-message ${type}`.trim();
};

const setAuthMode = (mode) => {
  const isLogin = mode === "login";

  loginTab.classList.toggle("active", isLogin);
  registerTab.classList.toggle("active", !isLogin);
  loginForm.classList.toggle("hidden", !isLogin);
  registerForm.classList.toggle("hidden", isLogin);
  setMessage(authMessage, "");
};

const saveSession = ({ token, user }) => {
  state.token = token;
  state.user = user;
  localStorage.setItem(tokenKey, token);
  localStorage.setItem(userKey, JSON.stringify(user));
};

const clearSession = () => {
  state.token = null;
  state.user = null;
  state.tasks = [];
  localStorage.removeItem(tokenKey);
  localStorage.removeItem(userKey);
};

const showView = () => {
  const isLoggedIn = Boolean(state.token);

  authView.classList.toggle("hidden", isLoggedIn);
  taskView.classList.toggle("hidden", !isLoggedIn);

  if (isLoggedIn) {
    loadTasks();
  }
};

const getFormData = (form) => Object.fromEntries(new FormData(form).entries());

const renderTasks = () => {
  const visibleTasks = state.filter === "all"
    ? state.tasks
    : state.tasks.filter((task) => task.status === state.filter);

  if (!visibleTasks.length) {
    taskList.innerHTML = `<div class="empty-state">No tasks found.</div>`;
    return;
  }

  taskList.innerHTML = visibleTasks.map((task) => {
    const statusClass = task.status === "in progress" ? "in-progress" : task.status;
    const description = task.description || "No description added.";

    return `
      <article class="task-card">
        <div>
          <div class="task-meta">
            <button class="badge status-button ${statusClass}" type="button" data-action="status" data-id="${task._id}">
              ${task.status}
            </button>
          </div>
          <h2>${escapeHtml(task.title)}</h2>
        </div>
        <p>${escapeHtml(description)}</p>
        <div class="task-actions">
          <button class="small-btn" type="button" data-action="edit" data-id="${task._id}">Edit</button>
          <button class="small-btn" type="button" data-action="delete" data-id="${task._id}">Delete</button>
        </div>
      </article>
    `;
  }).join("");
};

const escapeHtml = (value) => {
  const div = document.createElement("div");
  div.textContent = value;
  return div.innerHTML;
};

const loadTasks = async () => {
  try {
    setMessage(taskMessage, "Loading tasks...");
    const data = await apiRequest("/tasks");
    state.tasks = data.tasks || [];
    setMessage(taskMessage, "");
    renderTasks();
  } catch (error) {
    setMessage(taskMessage, error.message, "error");

    if (error.message.toLowerCase().includes("token")) {
      clearSession();
      showView();
    }
  }
};

const openModal = (content) => {
  modalRoot.innerHTML = `
    <div class="modal-backdrop" role="presentation">
      <section class="modal-panel" role="dialog" aria-modal="true">
        ${content}
      </section>
    </div>
  `;

  modalRoot.querySelector(".modal-backdrop").addEventListener("click", (event) => {
    if (event.target.classList.contains("modal-backdrop")) {
      closeModal();
    }
  });

  document.addEventListener("keydown", handleModalKeydown);
};

const closeModal = () => {
  modalRoot.innerHTML = "";
  document.removeEventListener("keydown", handleModalKeydown);
};

const handleModalKeydown = (event) => {
  if (event.key === "Escape") {
    closeModal();
  }
};

const taskFormTemplate = (task = null) => {
  const isEdit = Boolean(task);

  return `
    <div class="modal-header">
      <h2>${isEdit ? "Update task" : "Add task"}</h2>
      <button class="close-btn" type="button" data-close aria-label="Close modal">&times;</button>
    </div>
    <form id="task-form" class="task-form">
      <label for="task-title">Title</label>
      <input id="task-title" name="title" type="text" value="${escapeAttribute(task?.title || "")}" required>

      <label for="task-description">Description</label>
      <textarea id="task-description" name="description">${escapeHtml(task?.description || "")}</textarea>

      ${isEdit ? `
        <label for="task-status">Status</label>
        <select id="task-status" name="status">
          ${statuses.map((status) => `
            <option value="${status}" ${task?.status === status ? "selected" : ""}>${status}</option>
          `).join("")}
        </select>
      ` : ""}

      <div class="modal-actions">
        <button class="ghost-btn" type="button" data-close>Cancel</button>
        <button class="primary-btn" type="submit">${isEdit ? "Save changes" : "Create task"}</button>
      </div>
    </form>
  `;
};

const escapeAttribute = (value) => escapeHtml(value).replaceAll("\"", "&quot;");

const openTaskModal = (task = null) => {
  openModal(taskFormTemplate(task));

  modalRoot.querySelectorAll("[data-close]").forEach((button) => {
    button.addEventListener("click", closeModal);
  });

  modalRoot.querySelector("#task-form").addEventListener("submit", async (event) => {
    event.preventDefault();

    try {
      const body = getFormData(event.currentTarget);
      const url = task ? `/tasks/${task._id}` : "/tasks";
      const method = task ? "PUT" : "POST";

      await apiRequest(url, {
        method,
        body: JSON.stringify(body),
      });

      closeModal();
      await loadTasks();
      setMessage(taskMessage, task ? "Task updated." : "Task created.", "success");
    } catch (error) {
      setMessage(taskMessage, error.message, "error");
    }
  });
};

const openDeleteModal = (task) => {
  openModal(`
    <div class="modal-header">
      <h2>Delete task?</h2>
      <button class="close-btn" type="button" data-close aria-label="Close modal">&times;</button>
    </div>
    <p>This will remove "${escapeHtml(task.title)}" from your task list.</p>
    <div class="modal-actions">
      <button class="ghost-btn" type="button" data-close>Cancel</button>
      <button class="danger-btn" type="button" id="confirm-delete">Delete</button>
    </div>
  `);

  modalRoot.querySelectorAll("[data-close]").forEach((button) => {
    button.addEventListener("click", closeModal);
  });

  modalRoot.querySelector("#confirm-delete").addEventListener("click", async () => {
    try {
      await apiRequest(`/tasks/${task._id}`, { method: "DELETE" });
      closeModal();
      await loadTasks();
      setMessage(taskMessage, "Task deleted.", "success");
    } catch (error) {
      setMessage(taskMessage, error.message, "error");
    }
  });
};

loginTab.addEventListener("click", () => setAuthMode("login"));
registerTab.addEventListener("click", () => setAuthMode("register"));

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  try {
    setMessage(authMessage, "Logging in...");
    const data = await apiRequest("/users/login", {
      method: "POST",
      body: JSON.stringify(getFormData(loginForm)),
    });

    saveSession(data);
    loginForm.reset();
    showView();
  } catch (error) {
    setMessage(authMessage, error.message, "error");
  }
});

registerForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  try {
    setMessage(authMessage, "Creating account...");
    const data = await apiRequest("/users/register", {
      method: "POST",
      body: JSON.stringify(getFormData(registerForm)),
    });

    saveSession(data);
    registerForm.reset();
    showView();
  } catch (error) {
    setMessage(authMessage, error.message, "error");
  }
});

addTaskBtn.addEventListener("click", () => openTaskModal());

logoutBtn.addEventListener("click", () => {
  clearSession();
  setAuthMode("login");
  showView();
});

taskList.addEventListener("click", async (event) => {
  const button = event.target.closest("button[data-action]");

  if (!button) {
    return;
  }

  const task = state.tasks.find((item) => item._id === button.dataset.id);

  if (!task) {
    return;
  }

  if (button.dataset.action === "edit") {
    openTaskModal(task);
    return;
  }

  if (button.dataset.action === "delete") {
    openDeleteModal(task);
    return;
  }

  if (button.dataset.action === "status") {
    try {
      await apiRequest(`/tasks/${task._id}/status`, { method: "PATCH" });
      await loadTasks();
      setMessage(taskMessage, "Task status moved forward.", "success");
    } catch (error) {
      setMessage(taskMessage, error.message, "error");
    }
  }
});

document.querySelectorAll(".filter-btn").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".filter-btn").forEach((item) => item.classList.remove("active"));
    button.classList.add("active");
    state.filter = button.dataset.filter;
    renderTasks();
  });
});

showView();
