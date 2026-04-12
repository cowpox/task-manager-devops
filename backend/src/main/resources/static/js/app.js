lucide.createIcons();

// Configuração da API
const API_URL = 'http://localhost:8080/api';
let usandoBancoDeDados = false; // Flag que indica se o backend esta online

// Mapeamento de Status:
const statusToBackend = {
  'todo': 'PENDENTE',
  'inprogress': 'EM_ANDAMENTO',
  'completed': 'CONCLUIDA',
  'cancelled': 'CANCELADA'
};
const backendToStatus = {
  'PENDENTE': 'todo',
  'EM_ANDAMENTO': 'inprogress',
  'CONCLUIDA': 'completed',
  'CANCELADA': 'cancelled'
};

// DADOS MOCK (usado para testes sem o backend)
let categories = ['trabalho', 'pessoal', 'estudos', 'saude'];
let categoryMap = {};

let tasks = [
  { id: 1, title: "Revisar relatório", description: "Preparar apresentação", status: "todo", category: "trabalho", date: "2026-04-09" },
  { id: 2, title: "Estudar React", description: "Completar módulo", status: "inprogress", category: "estudos", date: "2026-04-12" },
  { id: 3, title: "Consulta médica", description: "Check-up de rotina", status: "completed", category: "saude", date: "2026-04-05" }
];

// CONFIGURAÇÕES DE UI E FILTROS
let currentView = 'grid';
let currentStatusFilter = 'all';
let currentCategoryFilter = 'all';
let searchQuery = '';

const statusConfig = {
  todo: { label: 'A Fazer', color: 'blue', icon: 'circle', bg: 'bg-blue-50', text: 'text-blue-600', dot: 'bg-blue-500' },
  inprogress: { label: 'Em Andamento', color: 'amber', icon: 'sun', bg: 'bg-amber-50', text: 'text-amber-600', dot: 'bg-amber-500' },
  completed: { label: 'Concluída', color: 'emerald', icon: 'check-circle', bg: 'bg-emerald-50', text: 'text-emerald-600', dot: 'bg-emerald-500' },
  cancelled: { label: 'Cancelada', color: 'red', icon: 'x-circle', bg: 'bg-red-50', text: 'text-red-600', dot: 'bg-red-500' }
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


// INTEGRAÇÃO COM JAVA (Backend)

async function loadDataDaAPI() {
  try {
    // Busca as categorias do Banco
    const catRes = await fetch(`${API_URL}/categorias`, { cache: 'no-store' });
    if (catRes.ok) {
      const json = await catRes.json();
      const dbCategories = json.data; 
      
      categories = [];
      categoryMap = {};
      
      const selectModal = document.getElementById('taskCategory');
      selectModal.innerHTML = '<option value="" disabled selected>Selecione uma categoria</option>';

      dbCategories.forEach(c => {
        const name = c.nome.toLowerCase();
        categories.push(name);
        categoryMap[name] = c.id; 
        
        if (!categoryColors[name]) {
          const colorIndex = Object.keys(categoryColors).length % availableColors.length;
          categoryColors[name] = availableColors[colorIndex];
        }
        
        const option = document.createElement('option');
        option.value = name;
        option.textContent = c.nome;
        selectModal.appendChild(option);
      });
      selectModal.value = '';
      usandoBancoDeDados = true;
    }

    // Busca as tarefas do Banco
    const taskRes = await fetch(`${API_URL}/tarefas?size=100`, { cache: 'no-store' });
    if (taskRes.ok) {
      const json = await taskRes.json();
      const dbTasks = json.data.content; 
      
      tasks = dbTasks.map(t => {
        const catName = t.categoriaNome || (t.categoria ? t.categoria.nome : '');
        
        return {
          id: t.id,
          title: t.titulo,
          description: t.descricao || '',
          status: backendToStatus[t.status] || 'todo', 
          category: catName.toLowerCase(),
          date: t.dataPrevistaConclusao ? t.dataPrevistaConclusao.split('T')[0] : ''
        };
      });
    }
    console.log("Conectado ao Banco de Dados com sucesso!");
  } catch (error) {
    console.warn("API offline. Usando os dados Mock locais.");
    
    const selectModal = document.getElementById('taskCategory');
    selectModal.innerHTML = '<option value="" disabled selected>Selecione uma categoria</option>';
    categories.forEach(cat => {
      const option = document.createElement('option');
      option.value = cat;
      option.textContent = cat.charAt(0).toUpperCase() + cat.slice(1);
      selectModal.appendChild(option);
    });
    const selectModalToReset = document.getElementById('taskCategory');
    selectModalToReset.value = '';
  }
  
  renderCategoryFilters();
  updateStats();
  renderTasks();
}

async function createTask() {
  const title = document.getElementById('taskTitle').value.trim();
  const description = document.getElementById('taskDescription').value.trim();
  const category = document.getElementById('taskCategory').value;
  const date = document.getElementById('taskDate').value;

  if (!title || !description || !category) {
    alert('Por favor, preencha o Título, a Descrição e a Categoria para criar uma tarefa!!');
    return;
  }

  const novaTarefaFrontend = { id: Date.now(), title, description, status: 'todo', category, date };

  if (usandoBancoDeDados) {
    try {
      const catId = categoryMap[category];
      
      const response = await fetch(`${API_URL}/tarefas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          titulo: title,
          descricao: description,
          status: 'PENDENTE',
          categoriaId: catId,
          dataPrevistaConclusao: date ? date + "T12:00:00" : null
        })
      });
      
      if (!response.ok) throw new Error("Falha ao salvar");
      const json = await response.json();
      novaTarefaFrontend.id = json.data.id; 
    } catch (e) {
      console.error("Erro ao salvar no banco", e);
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
      await fetch(`${API_URL}/tarefas/${taskId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: statusToBackend[newStatus] }) 
      });
    } catch (e) {
      console.error("Erro ao atualizar status no banco", e);
    }
  }

  task.status = newStatus;
  updateStats();
  renderTasks();
}

async function deleteTask(taskId) {
  if (confirm('Tem certeza que deseja excluir esta tarefa?')) {
    if (usandoBancoDeDados) {
      try {
        await fetch(`${API_URL}/tarefas/${taskId}`, { method: 'DELETE' });
      } catch (e) {
        console.error("Erro ao excluir no banco", e);
      }
    }

    tasks = tasks.filter(t => t.id !== taskId);
    updateStats();
    renderTasks();
  }
}

async function createCategory() {
  const name = document.getElementById('categoryName').value.trim().toLowerCase();
  
  if (!name || categories.includes(name)) return alert('Categoria inválida ou existente');

  if (usandoBancoDeDados) {
    try {
      const response = await fetch(`${API_URL}/categorias`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome: name })
      });
      const json = await response.json();
      if(json.data && json.data.id) {
          categoryMap[name] = json.data.id;
      }
    } catch (e) {
      console.error("Erro ao salvar categoria", e);
    }
  }

  categories.push(name);
  const colorIndex = (categories.length - 5) % availableColors.length;
  categoryColors[name] = availableColors[colorIndex < 0 ? 0 : colorIndex];
  
  const select = document.getElementById('taskCategory');
  const option = document.createElement('option');
  option.value = name;
  option.textContent = name.charAt(0).toUpperCase() + name.slice(1);
  select.appendChild(option);

  renderCategoryFilters(); 
  lucide.createIcons();
  closeModal('categoryModal');
}


// LOGICA DE EXCLUSAO DE CATEGORIA

let categoryToDeleteName = '';

function deleteCategory(categoryName) {
  const tarefasNestaCategoria = tasks.filter(t => t.category === categoryName);

  if (tarefasNestaCategoria.length === 0) {
    if (confirm(`Tem certeza que deseja excluir a categoria "${getCategoryLabel(categoryName)}"?`)) {
      executeCategoryDeletion(categoryName, 'empty');
    }
    return;
  }

  categoryToDeleteName = categoryName;
  const outrasCategorias = categories.filter(c => c !== categoryName);

  document.getElementById('deleteCategoryMessage').textContent = `A categoria "${getCategoryLabel(categoryName)}" possui ${tarefasNestaCategoria.length} tarefa(s). O que deseja fazer com elas?`;

  const select = document.getElementById('transferCategorySelect');
  select.innerHTML = '<option value="" disabled selected>Selecione uma categoria de destino</option>';

  if (outrasCategorias.length === 0) {
    document.getElementById('transferCategoryDiv').classList.add('hidden');
    document.getElementById('btnTransferAndDelete').classList.add('hidden');
  } else {
    document.getElementById('transferCategoryDiv').classList.remove('hidden');
    document.getElementById('btnTransferAndDelete').classList.remove('hidden');
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
    if (!transferTo) {
      alert('Por favor, selecione uma categoria de destino antes de transferir!');
      return;
    }
  } else if (actionType === 'delete') {
    transferTo = 'delete_tasks';
  }
  await executeCategoryDeletion(categoryToDeleteName, transferTo);
  closeModal('deleteCategoryModal');
}

async function executeCategoryDeletion(categoryName, action) {
  const tarefasNestaCategoria = tasks.filter(t => t.category === categoryName);

  if (usandoBancoDeDados) {
    const catId = categoryMap[categoryName]; // Pega o ID numérico correto da categoria
    
    if (!catId) {
        alert('Categoria não encontrada no banco de dados.');
        return;
    }

    try {
      if (action === 'delete_tasks') {
        for (const task of tarefasNestaCategoria) {
          await fetch(`${API_URL}/tarefas/${task.id}`, { method: 'DELETE' });
        }
      } else if (action !== 'empty') {
        const newCatId = categoryMap[action];
        for (const task of tarefasNestaCategoria) {
          const taskToUpdate = {
            titulo: task.title,
            descricao: task.description,
            status: statusToBackend[task.status] || 'PENDENTE',
            categoriaId: newCatId, // ID da nova categoria de destino
            dataPrevistaConclusao: task.date ? task.date + "T12:00:00" : null
          };
          
          await fetch(`${API_URL}/tarefas/${task.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(taskToUpdate)
          });
        }
      }

      const response = await fetch(`${API_URL}/categorias/${catId}`, { method: 'DELETE' });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Erro ao deletar categoria");
      }
    } catch (e) {
      console.error("Erro na API ao deletar categoria ou tarefas", e);
      alert("Erro ao processar a exclusão no banco de dados: " + e.message);
      return;
    }
  }

  if (action === 'delete_tasks') {
    tasks = tasks.filter(t => t.category !== categoryName);
  } else if (action !== 'empty') {
    tasks.forEach(task => {
      if (task.category === categoryName) {
        task.category = action;
      }
    });
  }

  categories = categories.filter(c => c !== categoryName);
  delete categoryColors[categoryName];
  delete categoryMap[categoryName];
  
  const mainSelect = document.getElementById('taskCategory');
  const option = mainSelect.querySelector(`option[value="${categoryName}"]`);
  if (option) option.remove();

  if (currentCategoryFilter === categoryName) currentCategoryFilter = 'all';

  renderCategoryFilters(); 
  updateStats();
  renderTasks();
}


// FUNÇÕES DE UI

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
      const isActive = currentCategoryFilter === cat;
      html += `
          <div onclick="filterByCategory('${cat}')" class="category-pill cursor-pointer ${isActive ? 'bg-primary text-white' : 'bg-white text-gray-600'} border ${isActive ? 'border-primary' : 'border-gray-200'} px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 group" data-category="${cat}">
            <span>${getCategoryLabel(cat)}</span>
            <span onclick="event.stopPropagation(); deleteCategory('${cat}')" class="text-gray-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100" title="Excluir categoria">
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
    const matchesCategory = currentCategoryFilter === 'all' || task.category === currentCategoryFilter;
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          task.description.toLowerCase().includes(searchQuery.toLowerCase());
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
  grid.className = currentView === 'list' ? 'flex flex-col gap-3' : 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4';

  grid.innerHTML = filtered.map(task => {
    const status = statusConfig[task.status] || statusConfig['todo'];
    const categoryClass = categoryColors[task.category] || 'text-gray-600 border-gray-200 bg-gray-50';
    const titleStyle = task.status === 'completed' ? 'text-gray-900 line-through' : 'text-gray-900';
    const descStyle = 'text-gray-500';

    const categoryTagHTML = task.category 
      ? `<span class="px-2.5 py-1 rounded-lg text-xs font-medium border ${categoryClass} flex items-center gap-1">
           <i data-lucide="tag" class="w-3 h-3 flex-shrink-0"></i>
           <span>${getCategoryLabel(task.category)}</span>
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
            <h3 class="font-semibold ${titleStyle} truncate break-words">${task.title}</h3>
            <p class="text-sm ${descStyle} truncate break-words">${task.description}</p>
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
        <h3 class="font-semibold ${titleStyle} text-lg mb-2 line-clamp-2 break-words">${task.title}</h3>
        <p class="text-sm ${descStyle} mb-4 line-clamp-2 break-words">${task.description}</p>
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
  const statusOrder = ['todo', 'inprogress', 'completed', 'cancelled'];
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
  document.querySelectorAll('.task-menu').forEach(m => { if (m !== menu) m.classList.add('hidden'); });
  
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
    todo: tasks.filter(t => t.status === 'todo').length,
    inprogress: tasks.filter(t => t.status === 'inprogress').length,
    completed: tasks.filter(t => t.status === 'completed').length,
    cancelled: tasks.filter(t => t.status === 'cancelled').length
  };
  Object.keys(counts).forEach(key => { document.getElementById(`count-${key}`).textContent = counts[key]; });
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
  if (modalId === 'taskModal') {
    document.getElementById('taskTitle').value = '';
    document.getElementById('taskDescription').value = '';
    document.getElementById('taskDate').value = '';
    document.getElementById('taskCategory').value = '';
  }
}

function closeModal(modalId) {
  document.getElementById(modalId).classList.remove('active');
  document.body.style.overflow = '';
  if (modalId === 'taskModal') {
    ['taskTitle', 'taskDescription', 'taskCategory', 'taskDate'].forEach(id => document.getElementById(id).value = '');
  } else {
    document.getElementById('categoryName').value = '';
  }
}

document.getElementById('searchInput').addEventListener('input', (e) => { searchQuery = e.target.value; renderTasks(); });

document.querySelectorAll('.modal-overlay').forEach(modal => {
  modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(modal.id); });
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') document.querySelectorAll('.modal-overlay.active').forEach(modal => closeModal(modal.id));
});

// Inicialização
loadDataDaAPI();
