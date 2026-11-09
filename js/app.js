/**
 * app.js — Mentes do Silício
 * Ponto de entrada principal da aplicação.
 * Inicializa o estado, registra event listeners e orquestra a UI.
 *
 * Em uma migração para React, este arquivo seria substituído por:
 *   - main.jsx (ReactDOM.createRoot)
 *   - App.jsx  (componente raiz com Context providers e roteamento)
 */

// ══════════════════════════════════════════════════════════════
// 1. ESTADO LOCAL DOS FILTROS (não persistido)
// ══════════════════════════════════════════════════════════════
const FilterState = {
  busca:         '',
  raridade:      '',
  personalidade: '',
  especialidade: ''
};



// ══════════════════════════════════════════════════════════════
// 2. FUNÇÕES DE ATUALIZAÇÃO GLOBAL DA UI
// ══════════════════════════════════════════════════════════════

/**
 * Aplica filtros e re-renderiza a grade de pioneiros.
 * Chamado sempre que FilterState é alterado.
 */
function applyFiltersAndRender() {
  const filtrados = filtrarPioneiros(FilterState);
  renderPioneersGrid(filtrados);
}

/**
 * Atualiza todos os elementos globais da UI:
 * navbar de recrutados, hero stats e dashboard.
 */
function refreshGlobalUI() {
  const stats = getStats();
  updateNavbarRecruits(stats.recrutados);
  renderHeroStats(stats);

  // Só re-renderiza o dashboard se estiver ativo
  if (AppState.activeTab === 'dashboard') {
    renderDashboard(stats);
  }
}

/**
 * Re-renderiza a aba atualmente ativa.
 * Chamada após qualquer mutação de estado.
 */
function refreshCurrentTab() {
  refreshGlobalUI();

  switch (AppState.activeTab) {
    case 'home':
      // renderHeroStats já chamado em refreshGlobalUI
      break;

    case 'pioneers':
      applyFiltersAndRender();
      break;

    case 'team':
      renderTeamGrid(getRecrutados());
      break;

    case 'favorites':
      renderFavoritesGrid(getFavoritos());
      break;

    case 'duel':
      DuelManager.init();
      break;

    case 'dashboard':
      renderDashboard(getStats());
      break;
  }
}

// ══════════════════════════════════════════════════════════════
// 3. HANDLERS DE AÇÕES DOS CARDS (Delegação de Eventos)
// ══════════════════════════════════════════════════════════════

/**
 * Handler central para cliques dentro do <main>.
 * Usa delegação de evento para gerenciar todos os cards dinamicamente.
 * @param {MouseEvent} e
 */
function handleMainClick(e) {
  // Busca o botão mais próximo com data-action
  const btn    = e.target.closest('[data-action]');
  const tabLink = e.target.closest('[data-tab-link]');

  // Navegação por links internos (botões do Hero, estados vazios)
  if (tabLink) {
    const targetTab = tabLink.dataset.tabLink;
    switchTab(targetTab);
    renderTabContent(targetTab);
    return;
  }

  if (!btn) return;

  const action = btn.dataset.action;
  const id     = Number(btn.dataset.id);

  switch (action) {

    // ── Recrutar ─────────────────────────────────────────────
    case 'recrutar': {
      const stats = getStats();
      if (stats.recrutados >= 7) {
        showToast('Equipe cheia! Máximo de 7 pioneiros recrutados.', 'warning');
        return;
      }
      const p = recrutar(id);
      if (p) {
        if (AppState.activeTab === 'favorites') {
          renderFavoritesGrid(getFavoritos());
        } else {
          updateCardRecruitButton(id, true);
        }
        refreshGlobalUI();
        showToast(`${p.nome} recrutado para a equipe! ⚔️`, 'success');
      }
      break;
    }

    // ── Remover da Equipe ─────────────────────────────────────
    case 'remover-equipe': {
      const p = removerDaEquipe(id);
      if (p) {
        if (AppState.activeTab === 'team') {
          renderTeamGrid(getRecrutados());
        } else if (AppState.activeTab === 'favorites') {
          renderFavoritesGrid(getFavoritos());
        } else {
          updateCardRecruitButton(id, false);
        }
        refreshGlobalUI();
        showToast(`${p.nome} removido da equipe.`, 'info');
      }
      break;
    }

    // ── Favoritar / Desfavoritar ──────────────────────────────
    case 'favoritar': {
      const p = toggleFavorito(id);
      if (p) {
        updateCardFavoriteButton(id, p.favorito);
        refreshGlobalUI();
        const msg = p.favorito
          ? `${p.nome} adicionado aos favoritos! ⭐`
          : `${p.nome} removido dos favoritos.`;
        showToast(msg, p.favorito ? 'success' : 'info');

        // Se estiver na aba favoritos e desfavoritou, re-renderiza
        if (AppState.activeTab === 'favorites' && !p.favorito) {
          renderFavoritesGrid(getFavoritos());
        }
      }
      break;
    }

    // ── Estudar Biografia (+10 energia) ──────────────────────
    case 'estudar': {
      const result = estudarBiografia(id);
      if (!result) return;
      if (result.maxReached) {
        showToast('Energia máxima atingida! ⚡', 'warning');
      } else {
        // Atualiza a barra de energia em todos os cards com este ID
        refreshCurrentTab();
        showToast(`${result.pioneiro.nome} estudou e ganhou +10 de energia! 📚`, 'success');
      }
      break;
    }

    // ── Disputar Duelo (−15 energia) ─────────────────────────
    case 'duelo-energia': {
      const p = disputarDuelo(id);
      if (p) {
        refreshCurrentTab();
        showToast(`${p.nome} disputou um duelo! Energia: ${p.energia}/100 ⚔️`, 'info');
      }
      break;
    }

    // ── Ver Detalhes (abre modal) ─────────────────────────────
    case 'detalhes': {
      const p = getPioneiroById(id);
      if (p) openDetailsModal(p);
      break;
    }

    // ── Editar (abre formulário pré-preenchido) ───────────────
    case 'editar': {
      const p = getPioneiroById(id);
      if (p) openEditModal(p);
      break;
    }

    // ── Remover permanentemente ───────────────────────────────
    case 'remover': {
      const p = getPioneiroById(id);
      if (!p) return;

      const confirmado = window.confirm(
        `Tem certeza que deseja remover ${p.nome} do Hall?\n\nEsta ação não pode ser desfeita.`
      );

      if (confirmado) {
        removerPioneiro(id);
        populateFilterDropdowns(getAllPioneiros());
        populateDuelSelects(getAllPioneiros());
        refreshCurrentTab();
        showToast(`${p.nome} foi removido do Hall. 🗑️`, 'info');
      }
      break;
    }

    // ── Novo Duelo (dentro do resultado) ────────────────────
    case 'novo-duelo':
      resetDuelUI();
      break;
  }
}

// ══════════════════════════════════════════════════════════════
// 4. RENDERIZAÇÃO POR ABA
// ══════════════════════════════════════════════════════════════

/**
 * Renderiza o conteúdo necessário para uma aba específica.
 * @param {string} tabName
 */
function renderTabContent(tabName) {
  const stats = getStats();

  switch (tabName) {
    case 'home':
    case 'pioneers':
      renderHeroStats(stats);
      applyFiltersAndRender();
      break;

    case 'team':
      renderTeamGrid(getRecrutados());
      break;

    case 'favorites':
      renderFavoritesGrid(getFavoritos());
      break;

    case 'duel':
      DuelManager.init();
      break;

    case 'dashboard':
      renderDashboard(stats);
      break;
  }

  updateNavbarRecruits(stats.recrutados);
}

// ══════════════════════════════════════════════════════════════
// 5. EVENT LISTENERS
// ══════════════════════════════════════════════════════════════

/**
 * Registra todos os event listeners da aplicação.
 * Em React, cada componente gerenciaria seus próprios handlers.
 */
function registerEventListeners() {

  // ── Clique no Logo/Marca da Navbar ─────────────────────────
  $q('.navbar__brand')?.addEventListener('click', () => {
    switchTab('pioneers');
    renderTabContent('pioneers');
  });

  // ── Navegação (Navbar) ────────────────────────────────────
  $qa('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const tab = btn.dataset.tab;
      switchTab(tab);
      renderTabContent(tab);
    });
  });

  // ── Hambúrguer (Mobile) ───────────────────────────────────
  const hamburger = $id('hamburger-btn');
  const mainNav   = $id('main-nav');
  if (hamburger && mainNav) {
    hamburger.addEventListener('click', () => {
      const isOpen = mainNav.classList.toggle('is-open');
      hamburger.classList.toggle('open', isOpen);
      hamburger.setAttribute('aria-expanded', String(isOpen));
    });
  }

  // ── Delegação de eventos no conteúdo principal ────────────
  const mainContent = $id('main-content');
  if (mainContent) {
    mainContent.addEventListener('click', handleMainClick);
  }

  // ── Botão "Adicionar Pioneiro" ─────────────────────────────
  const addBtn = $id('add-pioneer-btn');
  if (addBtn) {
    addBtn.addEventListener('click', openAddModal);
  }

  // ── Fechar modais (botão ✕) ───────────────────────────────
  $id('close-details-modal')?.addEventListener('click', closeDetailsModal);
  $id('close-form-modal')?.addEventListener('click', closeFormModal);
  $id('cancel-form-btn')?.addEventListener('click', closeFormModal);

  // ── Fechar modal clicando no backdrop ─────────────────────
  [$id('modal-details'), $id('modal-form')].forEach(modal => {
    if (!modal) return;
    modal.addEventListener('click', (e) => {
      // O <dialog> em si é o backdrop; o conteúdo está em modal__content
      if (e.target === modal) modal.close();
    });
  });

  // ── Tecla ESC para fechar modais (já suportado pelo <dialog>) ──
  // O elemento <dialog> nativo já suporta ESC por padrão.

  // ── Formulário de Pioneiro ────────────────────────────────
  const form = $id('pioneer-form');
  if (form) {
    form.addEventListener('submit', handleFormSubmit);
  }

  // ── Slider de Energia no Formulário ──────────────────────
  const energiaInput   = $id('form-energia');
  const energiaDisplay = $id('energia-display');
  if (energiaInput && energiaDisplay) {
    energiaInput.addEventListener('input', () => {
      energiaDisplay.textContent = energiaInput.value;
    });
  }

  // ── Filtros (busca dinâmica) ───────────────────────────────
  const searchInput = $id('search-input');
  if (searchInput) {
    // Debounce para não filtrar a cada keystroke
    let debounceTimer;
    searchInput.addEventListener('input', () => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        FilterState.busca = searchInput.value;
        applyFiltersAndRender();
      }, 200);
    });
  }

  $id('filter-rarity')?.addEventListener('change', (e) => {
    FilterState.raridade = e.target.value;
    applyFiltersAndRender();
  });

  $id('filter-personality')?.addEventListener('change', (e) => {
    FilterState.personalidade = e.target.value;
    applyFiltersAndRender();
  });

  $id('filter-specialty')?.addEventListener('change', (e) => {
    FilterState.especialidade = e.target.value;
    applyFiltersAndRender();
  });

  // ── Botões de Limpar Filtros ──────────────────────────────
  const clearBtn = $id('clear-filters-btn');
  if (clearBtn) {
    clearBtn.addEventListener('click', clearFilters);
  }

  const clearEmptyBtn = $id('clear-filters-empty-btn');
  if (clearEmptyBtn) {
    clearEmptyBtn.addEventListener('click', clearFilters);
  }

  // ── Modo Duelo (Super Trunfo) ─────────────────────────────
  $id('btn-start-duel')?.addEventListener('click', () => {
    DuelManager.startDuel();
  });

  // Delegação de cliques nos atributos de duelo da carta do usuário
  $id('duel-battle-arena')?.addEventListener('click', (e) => {
    const btn = e.target.closest('.duel-attr-btn[data-attr]');
    if (btn && btn.classList.contains('is-interactive')) {
      const attr = btn.dataset.attr;
      DuelManager.handleUserClick(attr);
    }
  });
}

// ══════════════════════════════════════════════════════════════
// 6. HANDLERS DE FORMULÁRIO
// ══════════════════════════════════════════════════════════════

/**
 * Submissão do formulário de adicionar/editar pioneiro.
 * @param {SubmitEvent} e
 */
function handleFormSubmit(e) {
  e.preventDefault();
  const { valid, dados } = validatePioneerForm();

  if (!valid) {
    showToast('Por favor, corrija os campos destacados.', 'error');
    return;
  }

  const idField = $id('form-id');
  const isEditing = idField && idField.value !== '';

  if (isEditing) {
    // EDITAR
    const id = Number(idField.value);
    const updated = editarPioneiro(id, dados);
    if (updated) {
      closeFormModal();
      populateFilterDropdowns(getAllPioneiros());
      refreshCurrentTab();
      showToast(`${updated.nome} atualizado com sucesso! ✏️`, 'success');
    }
  } else {
    // ADICIONAR
    const novo = adicionarPioneiro(dados);
    closeFormModal();
    populateFilterDropdowns(getAllPioneiros());
    populateDuelSelects(getAllPioneiros());

    // Navega para a aba de pioneiros para ver o novo card
    switchTab('pioneers');
    FilterState.busca = '';
    FilterState.raridade = '';
    FilterState.personalidade = '';
    FilterState.especialidade = '';
    resetFilterUI();
    applyFiltersAndRender();
    refreshGlobalUI();
    showToast(`${novo.nome} adicionado ao Hall! 🎉`, 'success');
  }
}

// ══════════════════════════════════════════════════════════════
// 7. HELPERS DE FILTRO
// ══════════════════════════════════════════════════════════════

/**
 * Limpa todos os filtros e re-renderiza.
 */
function clearFilters() {
  FilterState.busca = '';
  FilterState.raridade = '';
  FilterState.personalidade = '';
  FilterState.especialidade = '';
  resetFilterUI();
  applyFiltersAndRender();
}

/**
 * Reseta visualmente os controles de filtro.
 */
function resetFilterUI() {
  const searchInput      = $id('search-input');
  const filterRarity     = $id('filter-rarity');
  const filterPersonality = $id('filter-personality');
  const filterSpecialty  = $id('filter-specialty');

  if (searchInput)       searchInput.value       = '';
  if (filterRarity)      filterRarity.value      = '';
  if (filterPersonality) filterPersonality.value = '';
  if (filterSpecialty)   filterSpecialty.value   = '';
}

// ══════════════════════════════════════════════════════════════
// 8. INICIALIZAÇÃO DA APLICAÇÃO
// ══════════════════════════════════════════════════════════════

/**
 * Ponto de entrada: chamado quando o DOM está pronto.
 * Equivalente ao ReactDOM.createRoot(...).render(<App />).
 */
function init() {
  console.info('🚀 Mentes do Silício — Iniciando aplicação...');

  // 1. Carrega/inicializa o estado (localStorage ou dados padrão)
  const fromStorage = loadState();
  console.info(fromStorage
    ? '💾 Estado restaurado do localStorage.'
    : '📦 Dados padrão carregados.');

  // 2. Preenche dropdowns de filtro
  populateFilterDropdowns(getAllPioneiros());

  // 3. Registra todos os event listeners
  registerEventListeners();

  // 4. Renderiza a aba inicial (Coleção de Pioneiros)
  switchTab('pioneers');
  renderTabContent('pioneers');

  console.info('✅ Aplicação inicializada com sucesso!');
  console.info(`   Total de pioneiros: ${getAllPioneiros().length}`);
  console.info(`   Recrutados: ${getRecrutados().length}`);
  console.info(`   Favoritos: ${getFavoritos().length}`);
}

// ── Aguarda o DOM estar pronto antes de inicializar ───────────
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  // DOM já carregado (script carregado de forma diferida ou no final do <body>)
  init();
}
