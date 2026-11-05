/**
 * DecodeLabs DevOps Project 4: Containerization with Docker
 * Application Logic: Interactive Task Management, Stats & Docker Helpers
 */

document.addEventListener("DOMContentLoaded", () => {
  // Initial default tasks matching DecodeLabs DevOps Project 4 curriculum
  const defaultTasks = [
    {
      id: "task-1",
      title: "Select minimal base image (nginx:alpine) for lightweight footprint",
      category: "Docker",
      priority: "High",
      status: "completed",
      createdAt: new Date().toISOString()
    },
    {
      id: "task-2",
      title: "Configure .dockerignore shield to prevent context bloat and secret leaks",
      category: "Security",
      priority: "High",
      status: "completed",
      createdAt: new Date().toISOString()
    },
    {
      id: "task-3",
      title: "Build immutable image using 'docker build -t devops-project-4:v1 .'",
      category: "Docker",
      priority: "High",
      status: "in-progress",
      createdAt: new Date().toISOString()
    },
    {
      id: "task-4",
      title: "Launch background container with port mapping (-p 8080:80)",
      category: "Architecture",
      priority: "High",
      status: "in-progress",
      createdAt: new Date().toISOString()
    },
    {
      id: "task-5",
      title: "Verify container execution and inspect live logs with 'docker logs'",
      category: "Testing",
      priority: "Medium",
      status: "todo",
      createdAt: new Date().toISOString()
    },
    {
      id: "task-6",
      title: "Perform container lifecycle test: stop, restart, and inspect states",
      category: "Testing",
      priority: "Medium",
      status: "todo",
      createdAt: new Date().toISOString()
    },
    {
      id: "task-7",
      title: "Document Dockerfile instructions, port bridge, and layer caching",
      category: "Documentation",
      priority: "Low",
      status: "todo",
      createdAt: new Date().toISOString()
    }
  ];

  // State Management
  const STORAGE_KEY = "decodelabs_devops_tasks_v1";
  let tasks = [];
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    tasks = saved ? JSON.parse(saved) : defaultTasks;
  } catch (e) {
    console.warn("LocalStorage access error, using default memory state:", e);
    tasks = defaultTasks;
  }

  let currentFilter = "all";
  let searchQuery = "";

  // DOM Elements
  const taskGrid = document.getElementById("task-grid-container");
  const statTotal = document.getElementById("stat-total-tasks");
  const statInProgress = document.getElementById("stat-in-progress");
  const statCompleted = document.getElementById("stat-completed");
  const statRate = document.getElementById("stat-completion-rate");

  const countAll = document.getElementById("count-all");
  const countTodo = document.getElementById("count-todo");
  const countInProgress = document.getElementById("count-in-progress");
  const countCompleted = document.getElementById("count-completed");

  const filterTabs = document.querySelectorAll(".filter-tab");
  const searchInput = document.getElementById("task-search-input");

  // Modal Elements
  const modalBackdrop = document.getElementById("modal-backdrop");
  const btnOpenModal = document.getElementById("btn-open-modal");
  const btnCloseModal = document.getElementById("btn-close-modal");
  const btnCancelModal = document.getElementById("btn-cancel-modal");
  const addTaskForm = document.getElementById("add-task-form");
  const taskTitleInput = document.getElementById("task-title-input");
  const taskCategorySelect = document.getElementById("task-category-select");
  const taskPrioritySelect = document.getElementById("task-priority-select");
  const taskStatusSelect = document.getElementById("task-status-select");

  // Copy Buttons & Toasts
  const copyButtons = document.querySelectorAll(".btn-copy");
  const toastContainer = document.getElementById("toast-container");

  // Save tasks to LocalStorage
  function saveTasks() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    } catch (e) {
      console.warn("Unable to save tasks to LocalStorage:", e);
    }
  }

  // Show Toast Notification
  function showToast(message, type = "info") {
    if (!toastContainer) return;
    const toast = document.createElement("div");
    toast.className = `toast toast-${type}`;
    toast.setAttribute("role", "status");
    
    const icon = type === "success" ? "✓" : "ℹ";
    toast.innerHTML = `<span class="toast-icon">${icon}</span> <span>${escapeHtml(message)}</span>`;
    
    toastContainer.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = "0";
      toast.style.transform = "translateX(100%)";
      toast.style.transition = "all 250ms ease";
      setTimeout(() => toast.remove(), 250);
    }, 3000);
  }

  // Sanitize HTML helper
  function escapeHtml(str) {
    if (!str) return "";
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  // Update Statistics & Counters
  function updateMetrics() {
    const total = tasks.length;
    const todo = tasks.filter(t => t.status === "todo").length;
    const inProgress = tasks.filter(t => t.status === "in-progress").length;
    const completed = tasks.filter(t => t.status === "completed").length;
    const rate = total > 0 ? Math.round((completed / total) * 100) : 0;

    statTotal.textContent = total;
    statInProgress.textContent = inProgress;
    statCompleted.textContent = completed;
    statRate.textContent = `${rate}%`;

    countAll.textContent = total;
    countTodo.textContent = todo;
    countInProgress.textContent = inProgress;
    countCompleted.textContent = completed;
  }

  // Render Tasks to DOM
  function renderTasks() {
    updateMetrics();

    // Filter tasks based on status tab and search query
    const filtered = tasks.filter(t => {
      const matchesFilter = currentFilter === "all" || t.status === currentFilter;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q || 
        t.title.toLowerCase().includes(q) || 
        t.category.toLowerCase().includes(q) || 
        t.priority.toLowerCase().includes(q);
      return matchesFilter && matchesSearch;
    });

    if (filtered.length === 0) {
      taskGrid.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">🔍</div>
          <h3>No DevOps tasks found</h3>
          <p>No tasks match the active filter or search query. Click "Add New Task" to create one.</p>
        </div>
      `;
      return;
    }

    taskGrid.innerHTML = filtered.map(task => {
      const priorityClass = `pill-priority-${task.priority.toLowerCase()}`;
      return `
        <div class="task-card ${task.status}" data-id="${task.id}" id="card-${task.id}">
          <div class="task-card-header">
            <h3 class="task-title">${escapeHtml(task.title)}</h3>
          </div>
          
          <div class="task-badges">
            <span class="task-pill pill-category">${escapeHtml(task.category)}</span>
            <span class="task-pill ${priorityClass}">${escapeHtml(task.priority)}</span>
          </div>

          <div class="task-card-footer">
            <select class="status-dropdown" data-id="${task.id}" aria-label="Change status for ${escapeHtml(task.title)}">
              <option value="todo" ${task.status === "todo" ? "selected" : ""}>To Do</option>
              <option value="in-progress" ${task.status === "in-progress" ? "selected" : ""}>In Progress</option>
              <option value="completed" ${task.status === "completed" ? "selected" : ""}>Completed</option>
            </select>
            <button class="btn-delete-task" data-id="${task.id}" title="Delete task" aria-label="Delete ${escapeHtml(task.title)}">
              🗑
            </button>
          </div>
        </div>
      `;
    }).join("");

    attachCardEventListeners();
  }

  // Card Event Listeners
  function attachCardEventListeners() {
    // Dropdown change
    document.querySelectorAll(".status-dropdown").forEach(dropdown => {
      dropdown.addEventListener("change", (e) => {
        const id = e.target.getAttribute("data-id");
        const newStatus = e.target.value;
        const task = tasks.find(t => t.id === id);
        if (task) {
          task.status = newStatus;
          saveTasks();
          renderTasks();
          showToast(`Task status updated to "${newStatus}"`, "success");
        }
      });
    });

    // Delete button
    document.querySelectorAll(".btn-delete-task").forEach(btn => {
      btn.addEventListener("click", (e) => {
        const id = e.currentTarget.getAttribute("data-id");
        const taskIndex = tasks.findIndex(t => t.id === id);
        if (taskIndex !== -1) {
          const removed = tasks.splice(taskIndex, 1)[0];
          saveTasks();
          renderTasks();
          showToast(`Deleted task: "${removed.title.substring(0, 25)}..."`, "info");
        }
      });
    });
  }

  // Filter Tabs Event
  filterTabs.forEach(tab => {
    tab.addEventListener("click", () => {
      filterTabs.forEach(t => {
        t.classList.remove("active");
        t.setAttribute("aria-selected", "false");
      });
      tab.classList.add("active");
      tab.setAttribute("aria-selected", "true");
      currentFilter = tab.getAttribute("data-filter");
      renderTasks();
    });
  });

  // Search Input Event
  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      searchQuery = e.target.value;
      renderTasks();
    });
  }

  // Modal Open / Close Handlers
  function openModal() {
    modalBackdrop.classList.add("open");
    modalBackdrop.setAttribute("aria-hidden", "false");
    taskTitleInput.focus();
  }

  function closeModal() {
    modalBackdrop.classList.remove("open");
    modalBackdrop.setAttribute("aria-hidden", "true");
    addTaskForm.reset();
  }

  if (btnOpenModal) btnOpenModal.addEventListener("click", openModal);
  if (btnCloseModal) btnCloseModal.addEventListener("click", closeModal);
  if (btnCancelModal) btnCancelModal.addEventListener("click", closeModal);

  // Close modal when clicking outside dialog
  modalBackdrop.addEventListener("click", (e) => {
    if (e.target === modalBackdrop) {
      closeModal();
    }
  });

  // Escape key closes modal
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modalBackdrop.classList.contains("open")) {
      closeModal();
    }
  });

  // Add Task Form Submit
  addTaskForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const title = taskTitleInput.value.trim();
    if (!title) return;

    const newTask = {
      id: "task-" + Date.now(),
      title: title,
      category: taskCategorySelect.value,
      priority: taskPrioritySelect.value,
      status: taskStatusSelect.value,
      createdAt: new Date().toISOString()
    };

    tasks.unshift(newTask);
    saveTasks();
    closeModal();
    renderTasks();
    showToast("New DevOps task created successfully!", "success");
  });

  // Copy command buttons
  copyButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      const textToCopy = btn.getAttribute("data-copy");
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(textToCopy).then(() => {
          const original = btn.textContent;
          btn.textContent = "Copied!";
          btn.style.background = "var(--success)";
          btn.style.borderColor = "var(--success)";
          btn.style.color = "#ffffff";
          showToast(`Copied to clipboard: ${textToCopy}`, "success");
          setTimeout(() => {
            btn.textContent = original;
            btn.style.background = "";
            btn.style.borderColor = "";
            btn.style.color = "";
          }, 2000);
        }).catch(err => {
          console.error("Clipboard copy failed:", err);
          showToast("Copy failed. Please copy manually.", "info");
        });
      } else {
        // Fallback
        showToast(`Command: ${textToCopy}`, "info");
      }
    });
  });

  // Initial render
  renderTasks();
});
