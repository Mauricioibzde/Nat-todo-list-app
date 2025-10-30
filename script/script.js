// Estado da aplicação
const state = {
    lists: [
        { id: "1", name: "Pessoal", icon: "🏠", gradient: "from-violet-500 to-purple-500" },
        { id: "2", name: "Trabalho", icon: "💼", gradient: "from-blue-500 to-cyan-500" },
        { id: "3", name: "Compras", icon: "🛒", gradient: "from-emerald-500 to-teal-500" },
        { id: "4", name: "Fitness", icon: "💪", gradient: "from-orange-500 to-red-500" },
    ],
    todos: [
        { id: "1", text: "Comprar mantimentos para a semana", completed: false, listId: "3", priority: "high" },
        { id: "2", text: "Finalizar relatório trimestral", completed: false, listId: "2", priority: "high" },
        { id: "3", text: "Ligar para o dentista", completed: true, listId: "1", priority: "medium" },
        { id: "4", text: "Revisar código do projeto", completed: false, listId: "2", priority: "medium" },
        { id: "5", text: "Treino de cardio 30min", completed: false, listId: "4", priority: "low" },
    ],
    deletedTodos: [],
    activeListId: "1",
    searchQuery: "",
    theme: localStorage.getItem("theme") || "light",
    selectedEmoji: "📝"
};

const emojis = ["📝", "💼", "🏠", "🛒", "💪", "📚", "🎨", "🎮", "✈️", "🎵", "🍕", "💡"];
const gradients = [
    "from-pink-500 to-rose-500",
    "from-violet-500 to-purple-500",
    "from-blue-500 to-cyan-500",
    "from-emerald-500 to-teal-500",
    "from-orange-500 to-red-500",
    "from-yellow-500 to-orange-500",
    "from-indigo-500 to-blue-500",
];

// Inicializar tema
function initTheme() {
    if (state.theme === "dark") {
        document.documentElement.classList.add("dark");
    } else {
        document.documentElement.classList.remove("dark");
    }
}

// Toggle tema
function toggleTheme() {
    state.theme = state.theme === "light" ? "dark" : "light";
    localStorage.setItem("theme", state.theme);
    initTheme();
}

// Salvar estado no localStorage
function saveState() {
    localStorage.setItem("todoLists", JSON.stringify(state.lists));
    localStorage.setItem("todos", JSON.stringify(state.todos));
    localStorage.setItem("deletedTodos", JSON.stringify(state.deletedTodos));
    localStorage.setItem("activeListId", state.activeListId);
}

// Carregar estado do localStorage
function loadState() {
    const savedLists = localStorage.getItem("todoLists");
    const savedTodos = localStorage.getItem("todos");
    const savedDeletedTodos = localStorage.getItem("deletedTodos");
    const savedActiveListId = localStorage.getItem("activeListId");
    
    if (savedLists) state.lists = JSON.parse(savedLists);
    if (savedTodos) state.todos = JSON.parse(savedTodos);
    if (savedDeletedTodos) state.deletedTodos = JSON.parse(savedDeletedTodos);
    if (savedActiveListId) state.activeListId = savedActiveListId;
}

// Render listas na sidebar
function renderLists() {
    const container = document.getElementById("listsContainer");
    container.innerHTML = "";
    
    state.lists.forEach((list, index) => {
        const taskCount = state.todos.filter(t => t.listId === list.id && !t.completed).length;
        const totalCount = state.todos.filter(t => t.listId === list.id).length;
        const isActive = list.id === state.activeListId;
        
        const listItem = document.createElement("div");
        listItem.className = `relative overflow-hidden h-14 mb-2 rounded-md cursor-pointer group transition-all slide-in ${isActive ? 'list-item-active' : ''}`;
        listItem.style.animationDelay = `${index * 50}ms`;
        
        listItem.innerHTML = `
            <div class="flex items-center gap-3 p-3 h-full">
                <div class="w-10 h-10 rounded-lg bg-gradient-to-br ${list.gradient} flex items-center justify-center shadow-sm text-lg">
                    ${list.icon}
                </div>
                <div class="flex-1">
                    <div class="flex items-center gap-2">
                        <span class="font-medium text-gray-900 dark:text-gray-100">${list.name}</span>
                        ${taskCount > 0 ? `<span class="text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">${taskCount}</span>` : ''}
                    </div>
                    <p class="text-xs text-gray-500 dark:text-gray-400">${totalCount} ${totalCount === 1 ? 'tarefa' : 'tarefas'}</p>
                </div>
                ${state.lists.length > 1 ? `
                    <button class="delete-list-btn h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50 dark:hover:bg-red-950/30 rounded flex items-center justify-center" data-list-id="${list.id}">
                        <svg class="h-4 w-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                        </svg>
                    </button>
                ` : ''}
            </div>
        `;
        
        listItem.addEventListener("click", (e) => {
            if (!e.target.closest('.delete-list-btn')) {
                state.activeListId = list.id;
                renderLists();
                renderTasks();
            }
        });
        
        const deleteBtn = listItem.querySelector('.delete-list-btn');
        if (deleteBtn) {
            deleteBtn.addEventListener("click", (e) => {
                e.stopPropagation();
                deleteList(list.id);
            });
        }
        
        container.appendChild(listItem);
    });
    
    // Adicionar item da lixeira
    const trashItem = document.createElement("div");
    const isTrashActive = state.activeListId === "trash";
    trashItem.className = `relative overflow-hidden h-14 mb-2 rounded-md cursor-pointer group transition-all mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 ${isTrashActive ? 'list-item-active' : ''}`;
    
    trashItem.innerHTML = `
        <div class="flex items-center gap-3 p-3 h-full">
            <div class="w-10 h-10 rounded-lg bg-gradient-to-br from-gray-500 to-gray-600 flex items-center justify-center shadow-sm text-lg">
                🗑️
            </div>
            <div class="flex-1">
                <div class="flex items-center gap-2">
                    <span class="font-medium text-gray-900 dark:text-gray-100">Lixeira</span>
                    ${state.deletedTodos.length > 0 ? `<span class="text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">${state.deletedTodos.length}</span>` : ''}
                </div>
                <p class="text-xs text-gray-500 dark:text-gray-400">${state.deletedTodos.length} ${state.deletedTodos.length === 1 ? 'item' : 'itens'}</p>
            </div>
        </div>
    `;
    
    trashItem.addEventListener("click", () => {
        state.activeListId = "trash";
        renderLists();
        renderTasks();
    });
    
    container.appendChild(trashItem);
}

// Render header da lista ativa
function renderListHeader() {
    const container = document.getElementById("listHeader");
    const isTrashView = state.activeListId === "trash";
    const activeList = state.lists.find(l => l.id === state.activeListId);
    
    if (!activeList && !isTrashView) {
        container.innerHTML = '<p class="text-gray-400">Nenhuma lista selecionada</p>';
        return;
    }
    
    if (isTrashView) {
        const deletedCount = state.deletedTodos.length;
        container.innerHTML = `
            <div class="w-16 h-16 rounded-2xl bg-gradient-to-br from-gray-500 to-gray-600 flex items-center justify-center shadow-xl text-3xl">
                🗑️
            </div>
            <div class="flex-1">
                <h2 class="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">Lixeira</h2>
                <div class="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                    <span>${deletedCount} ${deletedCount === 1 ? 'item' : 'itens'} excluídos</span>
                </div>
            </div>
            ${deletedCount > 0 ? `
                <button id="emptyTrashBtn" class="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg flex items-center gap-2 transition-colors">
                    <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                    </svg>
                    Esvaziar Lixeira
                </button>
            ` : ''}
        `;
        
        const emptyBtn = document.getElementById("emptyTrashBtn");
        if (emptyBtn) {
            emptyBtn.addEventListener("click", emptyTrash);
        }
        return;
    }
    
    const activeTodos = getFilteredTodos().filter(t => !t.completed);
    const completedTodos = getFilteredTodos().filter(t => t.completed);
    const totalTodos = getFilteredTodos();
    const completionRate = totalTodos.length > 0 ? Math.round((completedTodos.length / totalTodos.length) * 100) : 0;
    
    container.innerHTML = `
        <div class="w-16 h-16 rounded-2xl bg-gradient-to-br ${activeList.gradient} flex items-center justify-center shadow-xl text-3xl">
            ${activeList.icon}
        </div>
        <div class="flex-1">
            <h2 class="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">${activeList.name}</h2>
            <div class="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                <span>${activeTodos.length} ativas</span>
                <span>•</span>
                <span>${completedTodos.length} concluídas</span>
                <span>•</span>
                <span>${completionRate}% completo</span>
            </div>
        </div>
    `;
}

// Filtrar tarefas por busca
function getFilteredTodos() {
    const isTrashView = state.activeListId === "trash";
    
    if (isTrashView) {
        return state.deletedTodos.filter(todo => {
            const matchesSearch = state.searchQuery 
                ? todo.text.toLowerCase().includes(state.searchQuery.toLowerCase())
                : true;
            return matchesSearch;
        });
    }
    
    return state.todos.filter(todo => {
        const matchesList = todo.listId === state.activeListId;
        const matchesSearch = state.searchQuery 
            ? todo.text.toLowerCase().includes(state.searchQuery.toLowerCase())
            : true;
        return matchesList && matchesSearch;
    });
}

// Render tarefas
function renderTasks() {
    renderListHeader();
    updateAddTaskButtonVisibility();
    const container = document.getElementById("tasksContainer");
    const isTrashView = state.activeListId === "trash";
    const filteredTodos = getFilteredTodos();
    const activeTodos = isTrashView ? filteredTodos : filteredTodos.filter(t => !t.completed);
    const completedTodos = isTrashView ? [] : filteredTodos.filter(t => t.completed);
    
    if (filteredTodos.length === 0) {
        container.innerHTML = `
            <div class="flex flex-col items-center justify-center h-64 text-gray-400 dark:text-gray-500 fade-in">
                <div class="text-7xl mb-4">${isTrashView ? '🗑️' : '✨'}</div>
                <p class="text-lg font-medium">${isTrashView ? 'Lixeira vazia' : 'Nenhuma tarefa ainda'}</p>
                <p class="text-sm">${isTrashView ? 'Itens excluídos aparecerão aqui' : 'Adicione uma para começar!'}</p>
            </div>
        `;
        return;
    }
    
    let html = '<div class="space-y-8">';
    
    if (isTrashView) {
        html += `
            <div>
                <h3 class="mb-4 text-gray-600 dark:text-gray-400 font-medium flex items-center gap-2">
                    <div class="w-2 h-2 rounded-full bg-gray-500"></div>
                    Itens Excluídos
                    <span class="text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">${filteredTodos.length}</span>
                </h3>
                <div class="space-y-3">
                    ${filteredTodos.map((todo, index) => renderTrashItem(todo, index)).join('')}
                </div>
            </div>
        `;
    } else {
        if (activeTodos.length > 0) {
            html += `
                <div>
                    <h3 class="mb-4 text-gray-600 dark:text-gray-400 font-medium flex items-center gap-2">
                        <div class="w-2 h-2 rounded-full bg-violet-500"></div>
                        Tarefas Ativas
                        <span class="text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">${activeTodos.length}</span>
                    </h3>
                    <div class="space-y-3">
                        ${activeTodos.map((todo, index) => renderTaskItem(todo, index)).join('')}
                    </div>
                </div>
            `;
        }
        
        if (completedTodos.length > 0) {
            html += `
                <div>
                    <h3 class="mb-4 text-gray-600 dark:text-gray-400 font-medium flex items-center gap-2">
                        <div class="w-2 h-2 rounded-full bg-green-500"></div>
                        Concluídas
                        <span class="text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">${completedTodos.length}</span>
                    </h3>
                    <div class="space-y-3">
                        ${completedTodos.map((todo, index) => renderTaskItem(todo, index)).join('')}
                    </div>
                </div>
            `;
        }
    }
    
    html += '</div>';
    container.innerHTML = html;
    
    // Adicionar event listeners
    if (!isTrashView) {
        document.querySelectorAll('.task-checkbox').forEach(cb => {
            cb.addEventListener('change', (e) => {
                toggleTodo(e.target.dataset.todoId);
            });
        });
        
        document.querySelectorAll('.delete-task-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                deleteTodo(e.target.closest('.delete-task-btn').dataset.todoId);
            });
        });
    } else {
        document.querySelectorAll('.restore-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                restoreTodo(e.target.closest('.restore-btn').dataset.todoId);
            });
        });
        
        document.querySelectorAll('.delete-permanent-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                deletePermanently(e.target.closest('.delete-permanent-btn').dataset.todoId);
            });
        });
    }
}

// Render item de tarefa
function renderTaskItem(todo, index) {
    const priorityLabels = {
        high: { label: "Alta", dot: "bg-red-500", class: "priority-high" },
        medium: { label: "Média", dot: "bg-yellow-500", class: "priority-medium" },
        low: { label: "Baixa", dot: "bg-green-500", class: "priority-low" }
    };
    
    const priority = priorityLabels[todo.priority];
    
    return `
        <div class="task-item group flex items-start gap-4 p-4 rounded-xl border-2 ${
            todo.completed 
                ? 'border-gray-200 dark:border-gray-700' 
                : 'border-gray-100 dark:border-gray-700 hover:border-violet-200 dark:hover:border-violet-900'
        } bg-white dark:bg-slate-800 shadow-sm hover:shadow-md transition-all fade-in" style="animation-delay: ${index * 50}ms">
            <input type="checkbox" class="task-checkbox mt-1" ${todo.completed ? 'checked' : ''} data-todo-id="${todo.id}">
            
            <div class="flex-1 min-w-0">
                <p class="mb-2 ${todo.completed ? 'line-through text-gray-400 dark:text-gray-500' : 'text-gray-900 dark:text-gray-100'}">
                    ${todo.text}
                </p>
                <div class="flex items-center gap-2 flex-wrap">
                    <div class="inline-flex items-center gap-1.5 px-2 py-1 rounded-md ${priority.class}">
                        <div class="w-1.5 h-1.5 rounded-full ${priority.dot}"></div>
                        <span class="text-xs font-medium">${priority.label}</span>
                    </div>
                </div>
            </div>
            
            <button class="delete-task-btn delete-btn h-8 w-8 hover:bg-red-50 dark:hover:bg-red-950/30 rounded flex items-center justify-center transition-colors" data-todo-id="${todo.id}">
                <svg class="h-4 w-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                </svg>
            </button>
        </div>
    `;
}

// Render item da lixeira
function renderTrashItem(todo, index) {
    const priorityLabels = {
        high: { label: "Alta", dot: "bg-red-500", class: "priority-high" },
        medium: { label: "Média", dot: "bg-yellow-500", class: "priority-medium" },
        low: { label: "Baixa", dot: "bg-green-500", class: "priority-low" }
    };
    
    const priority = priorityLabels[todo.priority];
    
    return `
        <div class="task-item group flex items-start gap-4 p-4 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-800 shadow-sm hover:shadow-md transition-all fade-in" style="animation-delay: ${index * 50}ms">
            <div class="flex-1 min-w-0">
                <p class="mb-2 text-gray-500 dark:text-gray-400 line-through">
                    ${todo.text}
                </p>
                <div class="flex items-center gap-2 flex-wrap">
                    <div class="inline-flex items-center gap-1.5 px-2 py-1 rounded-md ${priority.class}">
                        <div class="w-1.5 h-1.5 rounded-full ${priority.dot}"></div>
                        <span class="text-xs font-medium">${priority.label}</span>
                    </div>
                </div>
            </div>
            
            <div class="flex gap-2">
                <button class="restore-btn px-3 py-1.5 text-sm border border-blue-200 dark:border-blue-800 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950 rounded flex items-center gap-2 transition-colors" data-todo-id="${todo.id}">
                    <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"></path>
                    </svg>
                    Restaurar
                </button>
                <button class="delete-permanent-btn px-3 py-1.5 text-sm border border-red-200 dark:border-red-800 text-red-600 hover:bg-red-50 dark:hover:bg-red-950 rounded flex items-center gap-2 transition-colors" data-todo-id="${todo.id}">
                    <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                    </svg>
                    Excluir
                </button>
            </div>
        </div>
    `;
}

// Adicionar tarefa
function addTodo() {
    const input = document.getElementById("newTaskInput");
    const prioritySelect = document.getElementById("prioritySelect");
    const text = input.value.trim();
    
    if (!text) return;
    
    const newTodo = {
        id: Date.now().toString(),
        text: text,
        completed: false,
        listId: state.activeListId,
        priority: prioritySelect.value
    };
    
    state.todos.unshift(newTodo);
    input.value = "";
    prioritySelect.value = "medium";
    
    hideAddTaskForm();
    saveState();
    renderTasks();
}

// Toggle tarefa completa
function toggleTodo(id) {
    const todo = state.todos.find(t => t.id === id);
    if (todo) {
        todo.completed = !todo.completed;
        saveState();
        renderTasks();
    }
}

// Deletar tarefa (mover para lixeira)
function deleteTodo(id) {
    const todoToDelete = state.todos.find(t => t.id === id);
    if (todoToDelete) {
        state.deletedTodos.push(todoToDelete);
        state.todos = state.todos.filter(t => t.id !== id);
        saveState();
        renderLists();
        renderTasks();
    }
}

// Restaurar tarefa da lixeira
function restoreTodo(id) {
    const todoToRestore = state.deletedTodos.find(t => t.id === id);
    if (todoToRestore) {
        state.todos.push(todoToRestore);
        state.deletedTodos = state.deletedTodos.filter(t => t.id !== id);
        saveState();
        renderLists();
        renderTasks();
    }
}

// Deletar permanentemente
function deletePermanently(id) {
    state.deletedTodos = state.deletedTodos.filter(t => t.id !== id);
    saveState();
    renderLists();
    renderTasks();
}

// Esvaziar lixeira
function emptyTrash() {
    if (confirm('Tem certeza que deseja esvaziar a lixeira? Esta ação não pode ser desfeita.')) {
        state.deletedTodos = [];
        saveState();
        renderLists();
        renderTasks();
    }
}

// Adicionar lista
function addList() {
    const input = document.getElementById("newListNameInput");
    const name = input.value.trim();
    
    if (!name) return;
    
    const newList = {
        id: Date.now().toString(),
        name: name,
        icon: state.selectedEmoji,
        gradient: gradients[Math.floor(Math.random() * gradients.length)]
    };
    
    state.lists.push(newList);
    state.activeListId = newList.id;
    
    input.value = "";
    state.selectedEmoji = "📝";
    
    hideNewListModal();
    saveState();
    renderLists();
    renderTasks();
}

// Deletar lista
function deleteList(id) {
    if (state.lists.length <= 1) return;
    
    state.lists = state.lists.filter(l => l.id !== id);
    state.todos = state.todos.filter(t => t.listId !== id);
    
    if (state.activeListId === id) {
        state.activeListId = state.lists[0].id;
    }
    
    saveState();
    renderLists();
    renderTasks();
}

// Mostrar modal de nova lista
function showNewListModal() {
    const modal = document.getElementById("newListModal");
    const emojiGrid = document.getElementById("emojiGrid");
    
    emojiGrid.innerHTML = emojis.map(emoji => `
        <button class="emoji-btn text-2xl p-3 rounded-lg border-2 ${
            emoji === state.selectedEmoji 
                ? 'border-violet-500 bg-violet-50 dark:bg-violet-950/30 selected' 
                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
        }" data-emoji="${emoji}">
            ${emoji}
        </button>
    `).join('');
    
    modal.classList.remove("hidden");
    
    // Event listeners para emojis
    document.querySelectorAll('.emoji-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            state.selectedEmoji = e.target.dataset.emoji;
            document.querySelectorAll('.emoji-btn').forEach(b => b.classList.remove('selected', 'border-violet-500', 'bg-violet-50', 'dark:bg-violet-950/30'));
            e.target.classList.add('selected', 'border-violet-500', 'bg-violet-50', 'dark:bg-violet-950/30');
        });
    });
}


// Inicializa sidebar para mobile
const sideBar = document.querySelector(".aside-menu");

if (!sideBar.classList.contains("-translate-x-full")) {
  sideBar.classList.add(
    "-translate-x-full",  // escondida no mobile
    "fixed",
    "top-0",
    "left-0",
    "h-full",
    "w-64",
    "z-40",
    "bg-white",
    "dark:bg-slate-900",
    "transition-transform",
    "duration-300",
    "md:translate-x-0", // visível no desktop
    "md:static"
  );
}

// Função de toggle
function toggleSidebar() {
  sideBar.classList.toggle("-translate-x-full");
}

// Botão sempre visível
document.querySelector(".aside-menu-btn").style.zIndex = "50"; 
document.querySelector(".aside-menu-btn").addEventListener("click", toggleSidebar);



document.querySelector('.aside-menu-btn').addEventListener('click', toggleSidebar);


// Esconder modal de nova lista
function hideNewListModal() {
    document.getElementById("newListModal").classList.add("hidden");
}

// Mostrar formulário de adicionar tarefa
function showAddTaskForm() {
    if (state.activeListId === "trash") return;
    document.getElementById("addTaskBtn").classList.add("hidden");
    document.getElementById("addTaskForm").classList.remove("hidden");
    document.getElementById("newTaskInput").focus();
}

// Esconder formulário de adicionar tarefa
function hideAddTaskForm() {
    document.getElementById("addTaskBtn").classList.remove("hidden");
    document.getElementById("addTaskForm").classList.add("hidden");
    document.getElementById("newTaskInput").value = "";
}

// Atualizar visibilidade do botão de adicionar tarefa
function updateAddTaskButtonVisibility() {
    const addTaskBtn = document.getElementById("addTaskBtn");
    const addTaskForm = document.getElementById("addTaskForm");
    const isTrashView = state.activeListId === "trash";
    
    if (isTrashView) {
        addTaskBtn.classList.add("hidden");
        addTaskForm.classList.add("hidden");
    } else {
        addTaskBtn.classList.remove("hidden");
    }
}

// Event Listeners
document.getElementById("themeToggle").addEventListener("click", toggleTheme);
document.getElementById("newListBtn").addEventListener("click", showNewListModal);
document.getElementById("confirmNewList").addEventListener("click", addList);
document.getElementById("cancelNewList").addEventListener("click", hideNewListModal);
document.getElementById("addTaskBtn").addEventListener("click", showAddTaskForm);
document.getElementById("confirmAddTask").addEventListener("click", addTodo);
document.getElementById("cancelAddTask").addEventListener("click", hideAddTaskForm);


document.getElementById("searchInput").addEventListener("input", (e) => {
    state.searchQuery = e.target.value;
    renderTasks();
});

document.getElementById("newTaskInput").addEventListener("keypress", (e) => {
    if (e.key === "Enter") addTodo();
});

document.getElementById("newListNameInput").addEventListener("keypress", (e) => {
    if (e.key === "Enter") addList();
});

// Fechar modal ao clicar fora
document.getElementById("newListModal").addEventListener("click", (e) => {
    if (e.target.id === "newListModal") {
        hideNewListModal();
    }
});

// Inicializar app
initTheme();
loadState();
renderLists();
renderTasks();
