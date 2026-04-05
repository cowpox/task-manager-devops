lucide.createIcons();

// Configuração da API
const API_URL = 'http://localhost:8080/api';
let usandoBancoDeDados = false; // Flag que indica se o backend esta online

// DADOS MOCK (usado para testes sem o backend)
let categories = [
    { id: 1, nome: 'Trabalho' },
    { id: 2, nome: 'Pessoal' },
    { id: 3, nome: 'Estudos' },
    { id: 4, nome: 'Saúde' }
];
let tasks = [
    { id: 1, title: "Revisar relatório", description: "Preparar apresentação", status: "PENDENTE", categoryId: 1, categoryName: "Trabalho", date: "2026-04-09" },
    { id: 2, title: "Estudar React", description: "Completar módulo", status: "EM_ANDAMENTO", categoryId: 3, categoryName: "Estudos", date: "2026-04-12" },
    { id: 3, title: "Consulta médica", description: "Check-up de rotina", status: "CONCLUIDA", categoryId: 4, categoryName: "Saúde", date: "2026-04-05" }
];

// CONFIGURAÇÕES DE UI E FILTROS
let currentView = 'grid';
let currentStatusFilter = 'all';
let currentCategoryFilter = 'all';
let searchQuery = '';

const statusConfig = {
    PENDENTE: { label: 'A Fazer', color: 'blue', icon: 'circle', bg: 'bg-blue-50', text: 'text-blue-600', dot: 'bg-blue-500' },
    EM_ANDAMENTO: { label: 'Em Andamento', color: 'amber', icon: 'sun', bg: 'bg-amber-50', text: 'text-amber-600', dot: 'bg-amber-500' },
    CONCLUIDA: { label: 'Concluída', color: 'emerald', icon: 'check-circle', bg: 'bg-emerald-50', text: 'text-emerald-600', dot: 'bg-emerald-500' },
    CANCELADA: { label: 'Cancelada', color: 'red', icon: 'x-circle', bg: 'bg-red-50', text: 'text-red-600', dot: 'bg-red-500' }
};

const categoryColors = {
    trabalho: 'text-violet-600 border-violet-200 bg-violet-50',
    pessoal: 'text-pink-600 border-pink-200 bg-pink-50',
    estudos: 'text-cyan-600 border-cyan-200 bg-cyan-50',
    saude: 'text-rose-600 border-rose-200 bg-rose-50'
};

const availableColors = [
    'text-orange-600 border-orange-200 bg-orange-50',
    'text-teal-600 border-teal-200 bg-teal-50',
    'text-lime-600 border-lime-200 bg-lime-50',
    'text-indigo-600 border-indigo-200 bg-indigo-50',
    'text-fuchsia-600 border-fuchsia-200 bg-fuchsia-50'
];

// =====================================
// HELPERS API
// =====================================
function mostrarErroApi(json, fallback = 'Erro na comunicação com a API.') {
    if (!json) return fallback;

    if (json.errors) {
        if (typeof json.errors === 'object') {
            return Object.values(json.errors).join('\n');
        }
        return String(json.errors);
    }

    return json.message || fallback;
}

async function parseApiResponse(response) {
    let json = null;

    try {
        json = await response.json();
    } catch (_) {
        json = null;
    }

    if (!response.ok || (json && json.success === false)) {
        throw new Error(mostrarErroApi(json, `Erro HTTP ${response.status}`));
    }

    return json;
}

// =====================================
// INTEGRAÇÃO COM JAVA (Backend)
// =====================================
async function loadDataDaAPI() {
    try {
        const catRes = await fetch(`${API_URL}/categorias`);
        const catJson = await parseApiResponse(catRes);
        const dbCategories = catJson.data || [];

        categories = dbCategories.map(c => ({
            id: c.id,
            nome: c.nome
        }));

        categories.forEach((cat, index) => {
            const key = normalizeCategoryKey(cat.nome);
            if (!categoryColors[key]) {
                categoryColors[key] = availableColors[index % availableColors.length];
            }
        });

        const taskRes = await fetch(`${API_URL}/tarefas?page=0&size=100&sortBy=dataCriacao&sortDir=desc`);
        const taskJson = await parseApiResponse(taskRes);
        const dbTasks = taskJson.data?.content || [];

        tasks = dbTasks.map(t => ({
            id: t.id,
            title: t.titulo,
            description: t.descricao,
            status: t.status,
            categoryId: t.categoria ? t.categoria.id : null,
            categoryName: t.categoria ? t.categoria.nome : '',
            date: t.dataPrevistaConclusao ? t.dataPrevistaConclusao.split('T')[0] : ''
        }));

        usandoBancoDeDados = true;
        console.log("Conectado ao Banco de Dados com sucesso!");
    } catch (error) {
        usandoBancoDeDados = false;
        console.warn("API offline ou incompatível. Usando os dados mock locais.", error.message);
    }

    renderCategoryFilters();
    preencherSelectCategorias();
    updateStats();
    renderTasks();
}

function normalizeCategoryKey(nome) {
    return (nome || '').trim().toLowerCase();
}

function getCategoryById(id) {
    return categories.find(c => String(c.id) === String(id)) || null;
}

function preencherSelectCategorias() {
    const select = document.getElementById('taskCategory');
    if (!select) return;

    const valorAtual = select.value;
    select.innerHTML = '<option value="">Selecione uma categoria</option>';

    categories.forEach(cat => {
        const option = document.createElement('option');
        option.value = cat.id;
        option.textContent = cat.nome;
        select.appendChild(option);
    });

    if (categories.some(c => String(c.id) === String(valorAtual))) {
        select.value = valorAtual;
    }
}

async function createTask() {
    const title = document.getElementById('taskTitle').value.trim();
    const description = document.getElementById('taskDescription').value.trim();
    const categoryId = document.getElementById('taskCategory').value;
    const date = document.getElementById('taskDate').value;

    if (!title || !description || !categoryId) {
        alert('Por favor, preencha o Título, a Descrição e a Categoria para criar uma tarefa!');
        return;
    }

    const categoriaSelecionada = getCategoryById(categoryId);

    const novaTarefaFrontend = {
        id: Date.now(),
        title,
        description,
        status: 'PENDENTE',
        categoryId: Number(categoryId),
        categoryName: categoriaSelecionada ? categoriaSelecionada.nome : '',
        date
    };

    if (usandoBancoDeDados) {
        try {
            const response = await fetch(`${API_URL}/tarefas`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    titulo: title,
                    descricao: description,
                    status: 'PENDENTE',
                    categoriaId: Number(categoryId),
                    dataPrevistaConclusao: date ? `${date}T12:00:00` : null
                })
            });

            const json = await parseApiResponse(response);
            const dbTask = json.data;

            novaTarefaFrontend.id = dbTask.id;
            novaTarefaFrontend.status = dbTask.status;
            novaTarefaFrontend.categoryId = dbTask.categoria ? dbTask.categoria.id : Number(categoryId);
            novaTarefaFrontend.categoryName = dbTask.categoria ? dbTask.categoria.nome : novaTarefaFrontend.categoryName;
            novaTarefaFrontend.date = dbTask.dataPrevistaConclusao
                ? dbTask.dataPrevistaConclusao.split('T')[0]
                : date;
        } catch (e) {
            alert(`Erro ao salvar tarefa no banco:\n${e.message}`);
            return;
        }
    }

    tasks.push(novaTarefaFrontend);
    updateStats();
    renderTasks();
    closeModal('taskModal');
}

async function updateTaskStatus(taskId, newStatus) {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    if (usandoBancoDeDados) {
        try {
            const response = await fetch(`${API_URL}/tarefas/${taskId}/status`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            });

            const json = await parseApiResponse(response);
            const dbTask = json.data;

            task.status = dbTask.status;
            task.category = dbTask.categoria ? dbTask.categoria.nome.toLowerCase() : task.category;
            task.date = dbTask.dataPrevistaConclusao
                ? dbTask.dataPrevistaConclusao.split('T')[0]
                : '';
        } catch (e) {
            alert(`Erro ao atualizar status:\n${e.message}`);
            return;
        }
    } else {
        task.status = newStatus;
    }

    updateStats();
    renderTasks();
}

async function deleteTask(taskId) {
    if (confirm('Tem certeza que deseja excluir esta tarefa?')) {
        if (usandoBancoDeDados) {
            try {
                const response = await fetch(`${API_URL}/tarefas/${taskId}`, { method: 'DELETE' });
                await parseApiResponse(response);
            } catch (e) {
                alert(`Erro ao excluir tarefa:\n${e.message}`);
                return;
            }
        }

        tasks = tasks.filter(t => t.id !== taskId);
        updateStats();
        renderTasks();
    }
}

async function createCategory() {
    const name = document.getElementById('categoryName').value.trim().toLowerCase();

    if (!name || categories.includes(name)) {
        alert('Categoria inválida ou existente');
        return;
    }

    if (usandoBancoDeDados) {
        try {
            const response = await fetch(`${API_URL}/categorias`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nome: name })
            });

            await parseApiResponse(response);
        } catch (e) {
            alert(`Erro ao salvar categoria:\n${e.message}`);
            return;
        }
    }

    categories.push(name);
    const colorIndex = (categories.length - 1) % availableColors.length;
    categoryColors[name] = availableColors[colorIndex];

    preencherSelectCategorias();
    renderCategoryFilters();
    lucide.createIcons();
    closeModal('categoryModal');
}

// Variável global temporária para saber qual categoria estamos apagando
let categoryToDeleteName = '';

// 1. Função que o botão 'x' da categoria chama
function deleteCategory(categoryName) {
    const tarefasNestaCategoria = tasks.filter(t => t.category === categoryName);

    // Se NÃO tem tarefas, apaga direto
    if (tarefasNestaCategoria.length === 0) {
        if (confirm(`Tem certeza que deseja excluir a categoria "${getCategoryLabel(categoryName)}"?`)) {
            executeCategoryDeletion(categoryName, 'empty');
        }
        return;
    }

    // Se TEM tarefas, abre o Modal perguntando o que fazer
    categoryToDeleteName = categoryName;
    const outrasCategorias = categories.filter(c => c !== categoryName);

    document.getElementById('deleteCategoryMessage').textContent =
        `A categoria "${getCategoryLabel(categoryName)}" possui ${tarefasNestaCategoria.length} tarefa(s). O que deseja fazer com elas?`;

    const select = document.getElementById('transferCategorySelect');
    select.innerHTML = '';

    // Se so existir a categoria que ele esta apagando, sem tarefas atribuidas, ele nao pode transferir, so excluir a categoria
    if (outrasCategorias.length === 0) {
        document.getElementById('transferCategoryDiv').classList.add('hidden');
        document.getElementById('btnTransferAndDelete').classList.add('hidden');
    } else {
        document.getElementById('transferCategoryDiv').classList.remove('hidden');
        document.getElementById('btnTransferAndDelete').classList.remove('hidden');

        // Preenche o select com as outras categorias disponíveis
        outrasCategorias.forEach(cat => {
            const opt = document.createElement('option');
            opt.value = cat;
            opt.textContent = getCategoryLabel(cat);
            select.appendChild(opt);
        });
    }

    openModal('deleteCategoryModal');
}

async function confirmDeleteCategoryAction(actionType) {
    let transferTo = null;

    if (actionType === 'transfer') {
        transferTo = document.getElementById('transferCategorySelect').value;
    } else if (actionType === 'delete') {
        transferTo = 'delete_tasks';
    }

    await executeCategoryDeletion(categoryToDeleteName, transferTo);
    closeModal('deleteCategoryModal');
}

// atualizar a categoria das tarefas ou deletar as tarefas
async function executeCategoryDeletion(categoryName, action) {
    const tarefasNestaCategoria = tasks.filter(t => t.category === categoryName);

    if (usandoBancoDeDados) {
        // Backend atual não suporta transferir tarefas por categoria automaticamente.
        // Então:
        // - se houver tarefas, o usuário precisa transferir manualmente no front primeiro
        //   ou excluir as tarefas antes de apagar a categoria.
        if (tarefasNestaCategoria.length > 0) {
            alert('No backend atual, não é possível excluir a categoria enquanto existirem tarefas vinculadas a ela. Primeiro mova ou exclua essas tarefas.');
            return;
        }

        const categoria = await buscarCategoriaPorNome(categoryName);
        if (!categoria) {
            alert('Categoria não encontrada no backend.');
            return;
        }

        try {
            const response = await fetch(`${API_URL}/categorias/${categoria.id}`, { method: 'DELETE' });
            await parseApiResponse(response);
        } catch (e) {
            alert(`Erro ao excluir categoria:\n${e.message}`);
            return;
        }
    }

    if (action === 'delete_tasks') {
        // Apaga as tarefas junto com a categoria
        tasks = tasks.filter(t => t.category !== categoryName);
    } else if (action !== 'empty') {
        // Transfere as tarefas para a categoria selecionada
        tasks.forEach(task => {
            if (task.category === categoryName) {
                task.category = action;
            }
        });
    }

    // Remove a categoria da lista
    categories = categories.filter(c => c !== categoryName);
    delete categoryColors[categoryName];

    // Remove do select do modal de Nova Tarefa
    const mainSelect = document.getElementById('taskCategory');
    const option = mainSelect.querySelector(`option[value="${categoryName}"]`);
    if (option) option.remove();

    if (currentCategoryFilter === categoryName) {
        currentCategoryFilter = 'all';
    }

    // Atualiza toda a tela
    renderCategoryFilters();
    preencherSelectCategorias();
    updateStats();
    renderTasks();
}

async function buscarCategoriaPorNome(nome) {
    try {
        const response = await fetch(`${API_URL}/categorias`);
        const json = await parseApiResponse(response);
        const lista = json.data || [];
        return lista.find(c => c.nome.toLowerCase() === nome.toLowerCase()) || null;
    } catch (_) {
        return null;
    }
}

// =====================================
// FUNÇÕES DE UI
// =====================================
function formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return new Date(date.getTime() + Math.abs(date.getTimezoneOffset() * 60000)).toLocaleDateString('pt-BR');
}

function getCategoryLabel(cat) {
    if (!cat) return '';
    return cat.charAt(0).toUpperCase() + cat.slice(1);
}

function renderCategoryFilters() {
    const container = document.getElementById('categoryFiltersContainer');
    let html = `
      <button onclick="filterByCategory('all')" class="category-pill ${currentCategoryFilter === 'all' ? 'active bg-primary text-white' : 'bg-white text-gray-600'} border ${currentCategoryFilter === 'all' ? 'border-primary' : 'border-gray-200'} px-4 py-2 rounded-full text-sm font-medium" data-category="all">
        Todas Categorias
      </button>
  `;

    categories.forEach(cat => {
        const isActive = String(currentCategoryFilter) === String(cat.id);

        html += `
          <div onclick="filterByCategory('${cat.id}')" class="category-pill cursor-pointer ${isActive ? 'bg-primary text-white' : 'bg-white text-gray-600'} border ${isActive ? 'border-primary' : 'border-gray-200'} px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 group" data-category="${cat.id}">
            <span>${cat.nome}</span>
            <span onclick="event.stopPropagation(); deleteCategory('${cat.id}')" class="text-gray-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100" title="Excluir categoria">
              <i data-lucide="x" class="w-3.5 h-3.5"></i>
            </span>
          </div>
      `;
    });

    html += `
      <button onclick="openModal('categoryModal')" class="category-pill bg-transparent text-gray-500 border border-dashed border-gray-300 px-4 py-2 rounded-full text-sm font-medium hover:border-primary hover:text-primary">
        <span class="flex items-center gap-1">
          <i data-lucide="plus" class="w-3.5 h-3.5"></i>
          Nova Categoria
        </span>
      </button>
  `;

    container.innerHTML = html;
    lucide.createIcons();
}

function renderTasks() {
    const grid = document.getElementById('taskGrid');
    const emptyState = document.getElementById('emptyState');

    let filtered = tasks.filter(task => {
        const matchesStatus = currentStatusFilter === 'all' || task.status === currentStatusFilter;
        const matchesCategory = currentCategoryFilter === 'all' || String(task.categoryId) === String(currentCategoryFilter);
        const q = searchQuery.toLowerCase();
        const matchesSearch =
            task.title.toLowerCase().includes(q) ||
            task.description.toLowerCase().includes(q);

        return matchesStatus && matchesCategory && matchesSearch;
    });

    if (filtered.length === 0) {
        grid.innerHTML = '';
        emptyState.classList.remove('hidden');
        emptyState.classList.add('flex');
        return;
    }

    emptyState.classList.add('hidden');
    emptyState.classList.remove('flex');
    grid.className = currentView === 'list'
        ? 'flex flex-col gap-3'
        : 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4';

    grid.innerHTML = filtered.map(task => {
        const status = statusConfig[task.status] || statusConfig['PENDENTE'];
        const categoryClass = categoryColors[normalizeCategoryKey(task.categoryName)] || 'text-gray-600 border-gray-200 bg-gray-50';

        const categoryTagHTML = task.category
            ? `<span class="px-2.5 py-1 rounded-lg text-xs font-medium border ${categoryClass} flex items-center gap-1 max-w-[120px]">
                 <i data-lucide="tag" class="w-3 h-3 flex-shrink-0"></i>
                 <span class="truncate">${task.categoryName}</span>
               </span>`
            : `<span></span>`;

        if (currentView === 'list') {
            return `
        <div class="task-card bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items-center gap-4 relative group" style="z-index: 1;">
          <div class="flex-shrink-0 relative">
            <button onclick="toggleTaskMenu(${task.id}, event)" class="status-badge ${status.bg} ${status.text} cursor-pointer hover:opacity-80 transition-opacity">
              <i data-lucide="${status.icon}" class="w-3.5 h-3.5"></i> ${status.label}
            </button>
            <div id="task-menu-${task.id}" class="task-menu hidden absolute z-50 bg-white rounded-xl border border-gray-100 shadow-lg py-2 min-w-[180px] mt-2 left-0">
              ${getStatusMenuItems(task)}
              <div class="border-t border-gray-100 my-2"></div>
              <button onclick="deleteTask(${task.id})" class="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-gray-50 transition-colors flex items-center gap-2">
                <i data-lucide="trash-2" class="w-4 h-4"></i> Excluir
              </button>
            </div>
          </div>
          <div class="flex-1 min-w-0">
            <h3 class="font-semibold text-gray-900 truncate break-words">${task.title}</h3>
            <p class="text-sm text-gray-500 truncate break-words">${task.description}</p>
          </div>
          <div class="flex items-center gap-4 text-sm text-gray-500 flex-shrink-0">
            <span class="flex items-center gap-1.5"><i data-lucide="calendar" class="w-4 h-4"></i>${formatDate(task.date)}</span>
            ${categoryTagHTML}
          </div>
        </div>
      `;
        }

        return `
      <div class="task-card bg-white rounded-2xl p-5 shadow-sm border border-gray-100 relative group" style="z-index: 1;">
        <div class="flex items-start justify-between mb-3 relative">
          <button onclick="toggleTaskMenu(${task.id}, event)" class="status-badge ${status.bg} ${status.text} cursor-pointer hover:opacity-80 transition-opacity">
            <i data-lucide="${status.icon}" class="w-3.5 h-3.5"></i> ${status.label}
          </button>
          <div id="task-menu-${task.id}" class="task-menu hidden absolute z-50 bg-white rounded-xl border border-gray-100 shadow-lg py-2 min-w-[180px] mt-8 left-0">
            ${getStatusMenuItems(task)}
            <div class="border-t border-gray-100 my-2"></div>
            <button onclick="deleteTask(${task.id})" class="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-gray-50 transition-colors flex items-center gap-2">
              <i data-lucide="trash-2" class="w-4 h-4"></i> Excluir
            </button>
          </div>
        </div>
        <h3 class="font-semibold text-gray-900 text-lg mb-2 line-clamp-2 break-words">${task.title}</h3>
        <p class="text-sm text-gray-500 mb-4 line-clamp-2 break-words">${task.description}</p>
        <div class="flex items-center justify-between pt-4 border-t border-gray-50">
          <div class="flex items-center gap-1.5 text-sm text-gray-500 flex-shrink-0">
            <i data-lucide="calendar" class="w-4 h-4"></i> <span>${formatDate(task.date)}</span>
          </div>
          ${categoryTagHTML}
        </div>
      </div>
    `;
    }).join('');

    lucide.createIcons();
}

function getStatusMenuItems(task) {
    const statusOrder = ['PENDENTE', 'EM_ANDAMENTO', 'CONCLUIDA', 'CANCELADA'];

    return statusOrder
        .filter(status => status !== task.status)
        .map(status => {
            const config = statusConfig[status];
            return `
        <button onclick="updateTaskStatus(${task.id}, '${status}')" class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2">
          <i data-lucide="${config.icon}" class="w-4 h-4 ${config.text}"></i> Mover para ${config.label}
        </button>
      `;
        }).join('');
}

function toggleTaskMenu(taskId, event) {
    event.stopPropagation();

    const menu = document.getElementById(`task-menu-${taskId}`);
    document.querySelectorAll('.task-menu').forEach(m => {
        if (m !== menu) m.classList.add('hidden');
    });

    const currentCard = event.currentTarget.closest('.task-card');
    if (currentCard) {
        document.querySelectorAll('.task-card').forEach(card => card.style.zIndex = '1');
        currentCard.style.zIndex = '10';
    }

    menu.classList.toggle('hidden');
}

document.addEventListener('click', (e) => {
    if (!e.target.closest('.task-menu') && !e.target.closest('.status-badge')) {
        document.querySelectorAll('.task-menu').forEach(menu => menu.classList.add('hidden'));
        document.querySelectorAll('.task-card').forEach(card => card.style.zIndex = '1');
    }
});

function updateStats() {
    const counts = {
        all: tasks.length,
        PENDENTE: tasks.filter(t => t.status === 'PENDENTE').length,
        EM_ANDAMENTO: tasks.filter(t => t.status === 'EM_ANDAMENTO').length,
        CONCLUIDA: tasks.filter(t => t.status === 'CONCLUIDA').length,
        CANCELADA: tasks.filter(t => t.status === 'CANCELADA').length
    };

    Object.keys(counts).forEach(key => {
        const element = document.getElementById(`count-${key}`);
        if (element) {
            element.textContent = counts[key];
        }
    });
}

function filterByStatus(status) {
    currentStatusFilter = status;

    document.querySelectorAll('.stat-card').forEach(card => {
        card.classList.remove('active', 'border-2', 'border-primary');
        card.classList.add('border', 'border-gray-100');
        card.style.background = 'white';
    });

    const activeCard = document.querySelector(`.stat-card[onclick="filterByStatus('${status}')"]`);
    if (activeCard) {
        activeCard.classList.add('active', 'border-2', 'border-primary');
        activeCard.classList.remove('border', 'border-gray-100');
    }

    renderTasks();
}

function filterByCategory(category) {
    currentCategoryFilter = category;
    renderCategoryFilters();
    renderTasks();
}

function setView(view) {
    currentView = view;

    const btnGrid = document.getElementById('btn-grid');
    const btnList = document.getElementById('btn-list');

    if (view === 'grid') {
        btnGrid.classList.add('bg-primary', 'text-white');
        btnGrid.classList.remove('text-gray-500');
        btnList.classList.remove('bg-primary', 'text-white');
        btnList.classList.add('text-gray-500');
    } else {
        btnList.classList.add('bg-primary', 'text-white');
        btnList.classList.remove('text-gray-500');
        btnGrid.classList.remove('bg-primary', 'text-white');
        btnGrid.classList.add('text-gray-500');
    }

    renderTasks();
}

function openModal(modalId) {
    document.getElementById(modalId).classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
    document.body.style.overflow = '';

    if (modalId === 'taskModal') {
        ['taskTitle', 'taskDescription', 'taskCategory', 'taskDate'].forEach(id => {
            document.getElementById(id).value = '';
        });
    } else if (modalId === 'categoryModal') {
        document.getElementById('categoryName').value = '';
    }
}

document.getElementById('searchInput').addEventListener('input', (e) => {
    searchQuery = e.target.value;
    renderTasks();
});

document.querySelectorAll('.modal-overlay').forEach(modal => {
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal(modal.id);
    });
});

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        document.querySelectorAll('.modal-overlay.active').forEach(modal => closeModal(modal.id));
    }
});

// Inicialização
loadDataDaAPI();