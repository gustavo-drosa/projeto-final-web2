/**
 * ui.js — Mentes do Silício
 * Funções de renderização de interface, manipulação do DOM e modais.
 *
 * Em uma migração para React, cada função de renderização aqui se tornaria
 * um componente React (ex: renderCard → <PioneerCard />, renderModal → <DetailsModal />).
 */

// ══════════════════════════════════════════════════════════════
// 1. HELPERS DE DOM
// ══════════════════════════════════════════════════════════════

/**
 * Atalho para document.getElementById.
 * @param {string} id
 * @returns {HTMLElement|null}
 */
function $id(id) {
  return document.getElementById(id);
}

/**
 * Atalho para querySelector.
 * @param {string} selector
 * @param {HTMLElement} [root=document]
 * @returns {Element|null}
 */
function $q(selector, root = document) {
  return root.querySelector(selector);
}

/**
 * Atalho para querySelectorAll → Array.
 * @param {string} selector
 * @param {HTMLElement} [root=document]
 * @returns {Element[]}
 */
function $qa(selector, root = document) {
  return Array.from(root.querySelectorAll(selector));
}

/**
 * Injeta HTML em um elemento, limpando o conteúdo anterior.
 * @param {HTMLElement} el
 * @param {string} html
 */
function setHTML(el, html) {
  if (el) el.innerHTML = html;
}

/**
 * Calcula o nível de energia para estilização da barra.
 * @param {number} val — 0 a 100
 * @returns {'high'|'medium'|'low'}
 */
function energyLevel(val) {
  if (val >= 70) return 'high';
  if (val >= 35) return 'medium';
  return 'low';
}

/**
 * Gera HTML para uma barra de energia.
 * @param {number} energia
 * @returns {string} HTML
 */
function buildEnergyBarHTML(energia) {
  const level = energyLevel(energia);
  return `
    <div class="pioneer-card__energy-wrap">
      <div class="pioneer-card__energy-label">
        <span>⚡ Energia</span>
        <strong>${energia}/100</strong>
      </div>
      <div class="energy-bar" role="progressbar" aria-valuenow="${energia}" aria-valuemin="0" aria-valuemax="100" aria-label="Energia: ${energia} de 100">
        <div class="energy-bar__fill" data-level="${level}" style="width: ${energia}%"></div>
      </div>
    </div>`;
}

/**
 * Gera HTML do badge de raridade para o card.
 * @param {string} raridade
 * @returns {string}
 */
function buildRarityBadgeHTML(raridade) {
  const icons = { 'Comum': '◆', 'Raro': '◈', 'Épico': '★' };
  return `<span class="pioneer-card__rarity-badge" data-rarity="${raridade}">${icons[raridade] || '◆'} ${raridade}</span>`;
}

/**
 * Extrai iniciais do nome do pioneiro para o avatar placeholder.
 * @param {string} name
 * @returns {string}
 */
function getInitials(name) {
  if (!name) return '??';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/**
 * Gera HTML da imagem (ou placeholder se não houver imagem).
 * Mantém os badges intactos mesmo se a imagem der erro 404.
 * @param {Object} pioneiro
 * @returns {string}
 */
function buildImageHTML(pioneiro) {
  const initials = getInitials(pioneiro.nome);
  const placeholder = `
    <div class="pioneer-card__image-placeholder" aria-hidden="true">
      <div class="pioneer-card__avatar">${initials}</div>
      <span class="pioneer-card__placeholder-label">Mente do Silício</span>
    </div>`;

  if (pioneiro.imagem) {
    return `
      <img
        class="pioneer-card__image"
        src="${pioneiro.imagem}"
        alt="Fotografia ou retrato de ${pioneiro.nome}"
        loading="lazy"
        onload="this.style.display='block'; if (this.nextElementSibling) this.nextElementSibling.style.display='none';"
        onerror="this.style.display='none'; if (this.nextElementSibling) this.nextElementSibling.style.display='flex';"
        style="display:none;"
      />
      ${placeholder}`;
  }
  return placeholder;
}

// ══════════════════════════════════════════════════════════════
// 2. TOAST NOTIFICATIONS
// ══════════════════════════════════════════════════════════════

/**
 * Exibe uma notificação toast.
 * Possui timer padrão de 5 segundos e botão para fechar manualmente.
 *
 * @param {string} mensagem
 * @param {'success'|'error'|'info'|'warning'} [tipo='info']
 * @param {number} [duracao=5000]
 */
function showToast(mensagem, tipo = 'info', duracao = 5000) {
  const container = $id('toast-container');
  if (!container) return;

  const icons = { success: '✅', error: '❌', info: 'ℹ️', warning: '⚠️' };
  const toast = document.createElement('div');
  toast.className = `toast toast--${tipo}`;
  toast.setAttribute('role', 'status');

  toast.innerHTML = `
    <div class="toast__content">
      <span class="toast__icon" aria-hidden="true">${icons[tipo] || 'ℹ️'}</span>
      <span class="toast__message">${mensagem}</span>
    </div>
    <button class="toast__close" aria-label="Fechar notificação" title="Fechar">✕</button>`;

  container.appendChild(toast);

  let timer = null;

  function dismiss() {
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
    if (toast.classList.contains('fade-out')) return;
    toast.classList.add('fade-out');

    // Remoção garantida com fallback de tempo
    const fallbackTimer = setTimeout(() => {
      if (toast.parentElement) toast.remove();
    }, 350);

    toast.addEventListener('animationend', () => {
      clearTimeout(fallbackTimer);
      if (toast.parentElement) toast.remove();
    }, { once: true });
  }

  // Timer automático de 5 segundos
  timer = setTimeout(dismiss, duracao);

  // Opção para fechar manualmente
  const closeBtn = toast.querySelector('.toast__close');
  if (closeBtn) {
    closeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      dismiss();
    });
  }
}

// ══════════════════════════════════════════════════════════════
// 3. CONSTRUÇÃO DO CARD DO PIONEIRO
// ══════════════════════════════════════════════════════════════

/**
 * Constrói o elemento DOM completo de um card de pioneiro.
 *
 * Funções por aba:
 * - 'pioneers'  : Recrutar/Já na equipe, Detalhes, Editar, Remover e Favorito
 * - 'team'      : Estudar (+10), Remover da equipe, Detalhes e Favorito
 * - 'favorites' : Detalhes, Favorito e ações de acordo com o status
 *
 * @param {Object} pioneiro
 * @param {'pioneers'|'team'|'favorites'} [mode='pioneers']
 * @returns {HTMLElement}
 */
function buildCard(pioneiro, mode = 'pioneers') {
  const article = document.createElement('article');
  article.className = `pioneer-card${pioneiro.status === 'Recrutado' ? ' is-recruited' : ''}`;
  article.dataset.id      = pioneiro.id;
  article.dataset.rarity  = pioneiro.raridade;
  article.setAttribute('role', 'listitem');
  article.setAttribute('aria-label', `Card de ${pioneiro.nome}`);

  const isRecrutado = pioneiro.status === 'Recrutado';
  const isFavorito  = pioneiro.favorito === true;

  // Botão de Recrutar / Já na Equipe
  let recrutarBtnHTML = '';
  if (isRecrutado) {
    recrutarBtnHTML = `
      <button class="btn btn--recruited" disabled aria-label="${pioneiro.nome} já está na equipe">
        ✅ Já na Equipe
      </button>`;
  } else {
    recrutarBtnHTML = `
      <button class="btn btn--recruit" data-action="recrutar" data-id="${pioneiro.id}" aria-label="Recrutar ${pioneiro.nome}">
        ⚔️ Recrutar
      </button>`;
  }

  // Ações específicas conforme a aba
  let actionsHTML = '';

  if (mode === 'team') {
    // ── ABA MINHA EQUIPE ─────────────────────────────────────────
    // Funções: Estudar, Remover da equipe, Detalhes e favorito
    actionsHTML = `
      <div class="pioneer-card__actions">
        <div class="pioneer-card__actions-row">
          <button class="btn btn--study" data-action="estudar" data-id="${pioneiro.id}" aria-label="Estudar biografia de ${pioneiro.nome} (+10 de energia)">
            📚 Estudar (+10)
          </button>
          <button class="btn btn--secondary btn--sm" data-action="detalhes" data-id="${pioneiro.id}" aria-haspopup="dialog" aria-label="Ver detalhes de ${pioneiro.nome}">
            🔍 Detalhes
          </button>
        </div>
        <button class="btn btn--remove-team" data-action="remover-equipe" data-id="${pioneiro.id}" aria-label="Remover ${pioneiro.nome} da equipe">
          🚪 Remover da Equipe
        </button>
      </div>`;
  } else if (mode === 'favorites') {
    // ── ABA FAVORITOS ────────────────────────────────────────────
    if (isRecrutado) {
      actionsHTML = `
        <div class="pioneer-card__actions">
          <div class="pioneer-card__actions-row">
            <button class="btn btn--study" data-action="estudar" data-id="${pioneiro.id}" aria-label="Estudar biografia de ${pioneiro.nome} (+10 de energia)">
              📚 Estudar (+10)
            </button>
            <button class="btn btn--secondary btn--sm" data-action="detalhes" data-id="${pioneiro.id}" aria-haspopup="dialog" aria-label="Ver detalhes de ${pioneiro.nome}">
              🔍 Detalhes
            </button>
          </div>
          <button class="btn btn--remove-team" data-action="remover-equipe" data-id="${pioneiro.id}" aria-label="Remover ${pioneiro.nome} da equipe">
            🚪 Remover da Equipe
          </button>
        </div>`;
    } else {
      actionsHTML = `
        <div class="pioneer-card__actions">
          <div class="pioneer-card__actions-row">
            ${recrutarBtnHTML}
            <button class="btn btn--secondary btn--sm" data-action="detalhes" data-id="${pioneiro.id}" aria-haspopup="dialog" aria-label="Ver detalhes de ${pioneiro.nome}">
              🔍 Detalhes
            </button>
          </div>
        </div>`;
    }
  } else {
    // ── ABA PIONEIROS (Coleção Geral) ────────────────────────────
    // Funções: Recrutar/Já na equipe, Detalhes, Editar, Remover e favorito
    actionsHTML = `
      <div class="pioneer-card__actions">
        <div class="pioneer-card__actions-row">
          ${recrutarBtnHTML}
          <button class="btn btn--secondary btn--sm" data-action="detalhes" data-id="${pioneiro.id}" aria-haspopup="dialog" aria-label="Ver detalhes de ${pioneiro.nome}">
            🔍 Detalhes
          </button>
        </div>
        <div class="pioneer-card__actions-row">
          <button class="btn btn--ghost btn--sm" data-action="editar" data-id="${pioneiro.id}" aria-label="Editar ${pioneiro.nome}">
            ✏️ Editar
          </button>
          <button class="btn btn--ghost btn--sm" data-action="remover" data-id="${pioneiro.id}" aria-label="Remover ${pioneiro.nome} da coleção">
            🗑️ Remover
          </button>
        </div>
      </div>`;
  }

  article.innerHTML = `
    <div class="pioneer-card__image-wrap">
      ${buildImageHTML(pioneiro)}
      ${buildRarityBadgeHTML(pioneiro.raridade)}
      ${isRecrutado ? '<span class="pioneer-card__seal" aria-label="Recrutado">Na Equipe</span>' : ''}
    </div>
    <div class="pioneer-card__body">
      <div class="pioneer-card__header">
        <div>
          <h3 class="pioneer-card__name">${pioneiro.nome}</h3>
          <p class="pioneer-card__specialty">${pioneiro.especialidade}</p>
        </div>
        <button
          class="btn-favorite${isFavorito ? ' is-favorited' : ''}"
          data-action="favoritar"
          data-id="${pioneiro.id}"
          aria-label="${isFavorito ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}: ${pioneiro.nome}"
          aria-pressed="${isFavorito}"
        >${isFavorito ? '★' : '☆'}</button>
      </div>

      ${buildEnergyBarHTML(pioneiro.energia)}

      ${actionsHTML}
    </div>`;

  return article;
}

// ══════════════════════════════════════════════════════════════
// 4. RENDERIZAÇÃO DAS GRADES DE CARDS
// ══════════════════════════════════════════════════════════════

/**
 * Renderiza os cards filtrados na grade de Pioneiros.
 * @param {Array} pioneiros — lista já filtrada
 */
function renderPioneersGrid(pioneiros) {
  const grid  = $id('pioneers-grid');
  const empty = $id('pioneers-empty');
  if (!grid) return;

  grid.innerHTML = '';

  if (pioneiros.length === 0) {
    grid.classList.add('hidden');
    empty.classList.remove('hidden');
    return;
  }

  grid.classList.remove('hidden');
  empty.classList.add('hidden');

  const fragment = document.createDocumentFragment();
  pioneiros.forEach((p, i) => {
    const card = buildCard(p, 'pioneers');
    card.style.animationDelay = `${i * 30}ms`;
    fragment.appendChild(card);
  });
  grid.appendChild(fragment);
}

/**
 * Renderiza os cards na grade "Minha Equipe".
 * @param {Array} recrutados
 */
function renderTeamGrid(recrutados) {
  const grid  = $id('team-grid');
  const empty = $id('team-empty');
  const badge = $id('team-count-badge');
  if (!grid) return;

  if (badge) badge.textContent = `${recrutados.length} recrutado${recrutados.length !== 1 ? 's' : ''}`;

  grid.innerHTML = '';

  if (recrutados.length === 0) {
    grid.classList.add('hidden');
    empty.classList.remove('hidden');
    return;
  }

  grid.classList.remove('hidden');
  empty.classList.add('hidden');

  const fragment = document.createDocumentFragment();
  recrutados.forEach((p, i) => {
    const card = buildCard(p, 'team');
    card.style.animationDelay = `${i * 30}ms`;
    fragment.appendChild(card);
  });
  grid.appendChild(fragment);
}

/**
 * Renderiza os cards na grade "Favoritos".
 * @param {Array} favoritos
 */
function renderFavoritesGrid(favoritos) {
  const grid  = $id('favorites-grid');
  const empty = $id('favorites-empty');
  const badge = $id('fav-count-badge');
  if (!grid) return;

  if (badge) badge.textContent = `${favoritos.length} favoritado${favoritos.length !== 1 ? 's' : ''}`;

  grid.innerHTML = '';

  if (favoritos.length === 0) {
    grid.classList.add('hidden');
    empty.classList.remove('hidden');
    return;
  }

  grid.classList.remove('hidden');
  empty.classList.add('hidden');

  const fragment = document.createDocumentFragment();
  favoritos.forEach((p, i) => {
    const card = buildCard(p, 'favorites');
    card.style.animationDelay = `${i * 30}ms`;
    fragment.appendChild(card);
  });
  grid.appendChild(fragment);
}

// ══════════════════════════════════════════════════════════════
// 5. NAVBAR — CONTADOR DE RECRUTADOS
// ══════════════════════════════════════════════════════════════

/**
 * Atualiza o contador de recrutados na navbar.
 * @param {number} count
 */
function updateNavbarRecruits(count) {
  const el = $id('recruits-count');
  if (el) el.textContent = count;
}

// ══════════════════════════════════════════════════════════════
// 6. HERO — ESTATÍSTICAS RÁPIDAS
// ══════════════════════════════════════════════════════════════

/**
 * Renderiza os cards de estatísticas rápidas na Hero section.
 * @param {Object} stats — resultado de getStats()
 */
function renderHeroStats(stats) {
  const container = $id('hero-stats');
  if (!container) return;

  const items = [
    { label: 'Pioneiros',   value: stats.total,       icon: '🧠' },
    { label: 'Recrutados',  value: stats.recrutados,  icon: '⚔️' },
    { label: 'Favoritos',   value: stats.favoritos,   icon: '⭐' },
    { label: 'Disponíveis', value: stats.disponiveis, icon: '✨' }
  ];

  container.innerHTML = items.map(item => `
    <div class="hero-stat-card">
      <div class="hero-stat-card__value">${item.value}</div>
      <div class="hero-stat-card__label">${item.icon} ${item.label}</div>
    </div>`).join('');
}

// ══════════════════════════════════════════════════════════════
// 7. DASHBOARD
// ══════════════════════════════════════════════════════════════

/**
 * Renderiza o dashboard completo com estatísticas.
 * @param {Object} stats — resultado de getStats()
 */
function renderDashboard(stats) {
  renderDashboardStats(stats);
  renderSpecialtyList(stats.porEspecialidade, stats.total);
  renderRarityBars(stats.porRaridade, stats.total);
}

/**
 * Renderiza os cards de contadores do dashboard.
 * @param {Object} stats
 */
function renderDashboardStats(stats) {
  const container = $id('dashboard-stats');
  if (!container) return;

  const cards = [
    { label: 'Total de Pioneiros', value: stats.total,       icon: '🧠', mod: 'total'     },
    { label: 'Disponíveis',        value: stats.disponiveis, icon: '✨', mod: 'available'  },
    { label: 'Recrutados',         value: stats.recrutados,  icon: '⚔️', mod: 'recruited'  },
    { label: 'Favoritados',        value: stats.favoritos,   icon: '⭐', mod: 'favorited'  }
  ];

  container.innerHTML = cards.map(c => `
    <div class="stat-card stat-card--${c.mod}">
      <div class="stat-card__icon">${c.icon}</div>
      <div class="stat-card__value">${c.value}</div>
      <div class="stat-card__label">${c.label}</div>
    </div>`).join('');
}

/**
 * Renderiza as barras de distribuição por especialidade.
 * @param {Object} porEspecialidade — { especialidade: count }
 * @param {number} total
 */
function renderSpecialtyList(porEspecialidade, total) {
  const container = $id('specialty-list');
  if (!container) return;

  const sorted = Object.entries(porEspecialidade)
    .sort((a, b) => b[1] - a[1]);

  const maxCount = sorted.length > 0 ? sorted[0][1] : 1;

  container.innerHTML = sorted.map(([label, count]) => {
    const pct = (count / maxCount) * 100;
    return `
      <div class="specialty-row">
        <span class="specialty-row__label" title="${label}">${label}</span>
        <div class="specialty-row__bar-wrap">
          <div class="specialty-row__bar-fill" style="width: ${pct}%"></div>
        </div>
        <span class="specialty-row__count">${count}</span>
      </div>`;
  }).join('');
}

/**
 * Renderiza as barras de distribuição por raridade.
 * @param {Object} porRaridade — { raridade: count }
 * @param {number} total
 */
function renderRarityBars(porRaridade, total) {
  const container = $id('rarity-bars');
  if (!container) return;

  const raridades = ['Comum', 'Raro', 'Épico'];
  container.innerHTML = raridades.map(r => {
    const count = porRaridade[r] || 0;
    const pct   = total > 0 ? (count / total) * 100 : 0;
    return `
      <div class="rarity-row">
        <span class="rarity-row__label rarity-row__label--${r}">${r}</span>
        <div class="rarity-row__bar-wrap">
          <div class="rarity-row__bar-fill rarity-row__bar-fill--${r}" style="width: ${pct.toFixed(1)}%"></div>
        </div>
        <span class="rarity-row__count">${count}</span>
      </div>`;
  }).join('');
}

// ══════════════════════════════════════════════════════════════
// 8. MODAL DE DETALHES
// ══════════════════════════════════════════════════════════════

/**
 * Abre o modal de detalhes de um pioneiro.
 * @param {Object} pioneiro
 */
function openDetailsModal(pioneiro) {
  const modal = $id('modal-details');
  const body  = $id('modal-details-body');
  if (!modal || !body) return;

  const { nome, especialidade, raridade, personalidade, energia, biografia, atributosDuelo } = pioneiro;

  const initials = getInitials(nome);
  const modalPlaceholder = `
    <div class="detail-modal__image-placeholder" aria-hidden="true" style="display:flex; flex-direction:column; align-items:center; justify-content:center; width:100%; height:100%; background:var(--color-bg-600); font-weight:800; font-size:2rem; color:var(--color-accent-blue);">
      ${initials}
    </div>`;

  const imgHTML = pioneiro.imagem
    ? `<img
        class="detail-modal__image"
        src="${pioneiro.imagem}"
        alt="Retrato de ${nome}"
        onload="this.style.display='block'; if (this.nextElementSibling) this.nextElementSibling.style.display='none';"
        onerror="this.style.display='none'; if (this.nextElementSibling) this.nextElementSibling.style.display='flex';"
        style="display:none;"
      />
      ${modalPlaceholder}`
    : modalPlaceholder;

  const rarityIconMap = { 'Comum': '◆', 'Raro': '◈', 'Épico': '★' };

  body.innerHTML = `
    <div class="detail-modal__header">
      <div class="detail-modal__image-wrap">
        ${imgHTML}
      </div>
      <div class="detail-modal__info">
        <h2 class="detail-modal__title" id="modal-details-title">${nome}</h2>
        <p class="detail-modal__specialty">${especialidade}</p>
        <div class="detail-modal__tags">
          <span class="detail-modal__tag pioneer-card__rarity-badge" data-rarity="${raridade}" style="font-size:0.75rem">
            ${rarityIconMap[raridade] || '◆'} ${raridade}
          </span>
          <span class="detail-modal__tag detail-modal__tag--personality">💬 ${personalidade}</span>
        </div>
        ${buildEnergyBarHTML(energia)}
      </div>
    </div>

    <blockquote class="detail-modal__biography">
      <p>${biografia}</p>
    </blockquote>

    <div class="duel-attributes">
      <p class="duel-attributes__title">⚔️ Atributos de Duelo — Super Trunfo</p>
      <div class="duel-attributes__list">
        <div class="duel-attr-row">
          <span class="duel-attr-row__label">🏆 Impacto Histórico</span>
          <div class="duel-attr-row__bar">
            <div class="duel-attr-row__fill duel-attr-row__fill--impact" style="width: ${atributosDuelo.impactoHistorico}%"></div>
          </div>
          <span class="duel-attr-row__value">${atributosDuelo.impactoHistorico}</span>
        </div>
        <div class="duel-attr-row">
          <span class="duel-attr-row__label">💡 Poder de Inovação</span>
          <div class="duel-attr-row__bar">
            <div class="duel-attr-row__fill duel-attr-row__fill--innovation" style="width: ${atributosDuelo.poderInovacao}%"></div>
          </div>
          <span class="duel-attr-row__value">${atributosDuelo.poderInovacao}</span>
        </div>
        <div class="duel-attr-row">
          <span class="duel-attr-row__label">🛡️ Resiliência</span>
          <div class="duel-attr-row__bar">
            <div class="duel-attr-row__fill duel-attr-row__fill--resilience" style="width: ${atributosDuelo.resiliencia}%"></div>
          </div>
          <span class="duel-attr-row__value">${atributosDuelo.resiliencia}</span>
        </div>
      </div>
    </div>`;

  modal.showModal();
}

/**
 * Fecha o modal de detalhes.
 */
function closeDetailsModal() {
  const modal = $id('modal-details');
  if (modal) modal.close();
}

// ══════════════════════════════════════════════════════════════
// 9. MODAL DE FORMULÁRIO (ADICIONAR / EDITAR)
// ══════════════════════════════════════════════════════════════

/**
 * Abre o modal de formulário para adicionar um novo pioneiro.
 */
function openAddModal() {
  const modal    = $id('modal-form');
  const title    = $id('modal-form-title');
  const form     = $id('pioneer-form');
  const idField  = $id('form-id');
  const submitBtn = $id('submit-form-btn');

  if (!modal || !form) return;

  form.reset();
  clearFormErrors();
  if (idField)   idField.value = '';
  if (title)     title.textContent = 'Adicionar Pioneiro';
  if (submitBtn) submitBtn.textContent = 'Salvar Pioneiro';

  // Reset do display de energia
  const energiaInput   = $id('form-energia');
  const energiaDisplay = $id('energia-display');
  if (energiaInput)   energiaInput.value = 50;
  if (energiaDisplay) energiaDisplay.textContent = '50';

  modal.showModal();
}

/**
 * Abre o modal de formulário para editar um pioneiro existente.
 * @param {Object} pioneiro
 */
function openEditModal(pioneiro) {
  const modal    = $id('modal-form');
  const title    = $id('modal-form-title');
  const form     = $id('pioneer-form');
  const submitBtn = $id('submit-form-btn');

  if (!modal || !form) return;

  form.reset();
  clearFormErrors();

  if (title)     title.textContent = `Editar: ${pioneiro.nome}`;
  if (submitBtn) submitBtn.textContent = 'Atualizar Pioneiro';

  // Preenche os campos
  $id('form-id').value            = pioneiro.id;
  $id('form-nome').value          = pioneiro.nome;
  $id('form-especialidade').value = pioneiro.especialidade;
  $id('form-personalidade').value = pioneiro.personalidade;
  $id('form-raridade').value      = pioneiro.raridade;
  $id('form-energia').value       = pioneiro.energia;
  $id('energia-display').textContent = pioneiro.energia;
  $id('form-biografia').value     = pioneiro.biografia;
  $id('form-imagem').value        = pioneiro.imagem || '';

  if (pioneiro.atributosDuelo) {
    $id('form-impacto').value     = pioneiro.atributosDuelo.impactoHistorico;
    $id('form-inovacao').value    = pioneiro.atributosDuelo.poderInovacao;
    $id('form-resiliencia').value = pioneiro.atributosDuelo.resiliencia;
  }

  modal.showModal();
}

/**
 * Fecha o modal de formulário.
 */
function closeFormModal() {
  const modal = $id('modal-form');
  if (modal) modal.close();
}

/**
 * Remove todas as mensagens de erro do formulário.
 */
function clearFormErrors() {
  $qa('.form__error').forEach(el => el.textContent = '');
  $qa('.input.invalid').forEach(el => el.classList.remove('invalid'));
  $qa('.select.invalid').forEach(el => el.classList.remove('invalid'));
}

/**
 * Valida o formulário de pioneiro.
 * @returns {{ valid: boolean, dados: Object|null }}
 */
function validatePioneerForm() {
  clearFormErrors();
  let valid = true;

  /**
   * Exibe um erro em um campo específico.
   * @param {string} fieldId — id do input
   * @param {string} errorId — id do span de erro
   * @param {string} msg
   */
  function showError(fieldId, errorId, msg) {
    const field = $id(fieldId);
    const error = $id(errorId);
    if (field)  field.classList.add('invalid');
    if (error)  error.textContent = msg;
    valid = false;
  }

  const nome          = $id('form-nome')?.value.trim();
  const especialidade = $id('form-especialidade')?.value.trim();
  const personalidade = $id('form-personalidade')?.value.trim();
  const raridade      = $id('form-raridade')?.value;
  const energia       = Number($id('form-energia')?.value);
  const biografia     = $id('form-biografia')?.value.trim();
  const impacto       = Number($id('form-impacto')?.value);
  const inovacao      = Number($id('form-inovacao')?.value);
  const resiliencia   = Number($id('form-resiliencia')?.value);

  if (!nome)          showError('form-nome',           'error-nome',          'Nome é obrigatório.');
  if (!especialidade) showError('form-especialidade',  'error-especialidade', 'Especialidade é obrigatória.');
  if (!personalidade) showError('form-personalidade',  'error-personalidade', 'Personalidade é obrigatória.');
  if (!raridade)      showError('form-raridade',       'error-raridade',      'Selecione uma raridade.');
  if (!biografia)     showError('form-biografia',      'error-biografia',     'Biografia é obrigatória.');

  if (!$id('form-impacto')?.value || isNaN(impacto) || impacto < 0 || impacto > 100) {
    showError('form-impacto', 'error-impacto', 'Valor entre 0 e 100.');
  }
  if (!$id('form-inovacao')?.value || isNaN(inovacao) || inovacao < 0 || inovacao > 100) {
    showError('form-inovacao', 'error-inovacao', 'Valor entre 0 e 100.');
  }
  if (!$id('form-resiliencia')?.value || isNaN(resiliencia) || resiliencia < 0 || resiliencia > 100) {
    showError('form-resiliencia', 'error-resiliencia', 'Valor entre 0 e 100.');
  }

  if (!valid) return { valid: false, dados: null };

  return {
    valid: true,
    dados: {
      nome,
      especialidade,
      personalidade,
      raridade,
      energia,
      biografia,
      imagem:            $id('form-imagem')?.value.trim() || '',
      impactoHistorico:  impacto,
      poderInovacao:     inovacao,
      resiliencia:       resiliencia
    }
  };
}

// ══════════════════════════════════════════════════════════════
// 10. NAVEGAÇÃO POR ABAS
// ══════════════════════════════════════════════════════════════

/**
 * Alterna a aba ativa.
 * @param {string} tabName — 'home' | 'pioneers' | 'team' | 'favorites' | 'duel' | 'dashboard'
 */
function switchTab(tabName) {
  const target = (tabName === 'home') ? 'pioneers' : tabName;

  // Desativa todas as seções
  $qa('.tab-section').forEach(section => section.classList.add('hidden'));

  // Desativa todos os botões da nav
  $qa('.nav-btn').forEach(btn => {
    btn.classList.remove('active');
    btn.removeAttribute('aria-current');
  });

  // Ativa a seção correta
  const section = $id(`tab-${target}`);
  if (section) section.classList.remove('hidden');

  // Ativa o(s) botão(ões) correspondente(s) na nav
  $qa(`.nav-btn[data-tab="${target}"]`).forEach(btn => {
    btn.classList.add('active');
    btn.setAttribute('aria-current', 'page');
  });

  // Fecha o menu mobile se estiver aberto
  const hamburger = $id('hamburger-btn');
  const nav       = $id('main-nav');
  if (hamburger && nav) {
    hamburger.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
    nav.classList.remove('is-open');
  }

  // Atualiza o estado interno
  AppState.activeTab = target;
}

// ══════════════════════════════════════════════════════════════
// 11. DROPDOWNS DE FILTRO
// ══════════════════════════════════════════════════════════════

/**
 * Preenche os dropdowns de filtro com os valores únicos do array de pioneiros.
 * @param {Array} pioneiros
 */
function populateFilterDropdowns(pioneiros) {
  const personalities = [...new Set(pioneiros.map(p => p.personalidade))].sort();
  const specialties   = [...new Set(pioneiros.map(p => p.especialidade))].sort();

  const personalSelect = $id('filter-personality');
  if (personalSelect) {
    const existing = personalSelect.options[0];
    personalSelect.innerHTML = '';
    personalSelect.appendChild(existing || Object.assign(document.createElement('option'), { value: '', textContent: 'Todas as personalidades' }));
    personalities.forEach(val => {
      personalSelect.appendChild(Object.assign(document.createElement('option'), { value: val, textContent: val }));
    });
  }

  const specialtySelect = $id('filter-specialty');
  if (specialtySelect) {
    const existing = specialtySelect.options[0];
    specialtySelect.innerHTML = '';
    specialtySelect.appendChild(existing || Object.assign(document.createElement('option'), { value: '', textContent: 'Todas as especialidades' }));
    specialties.forEach(val => {
      specialtySelect.appendChild(Object.assign(document.createElement('option'), { value: val, textContent: val }));
    });
  }
}

// ══════════════════════════════════════════════════════════════
// 12. MODO DUELO — RENDERIZAÇÃO
// ══════════════════════════════════════════════════════════════

/**
 * Preenche os selects do Modo Duelo com todos os pioneiros.
 * @param {Array} pioneiros
 */
function populateDuelSelects(pioneiros) {
  const selA = $id('duel-select-a');
  const selB = $id('duel-select-b');
  if (!selA || !selB) return;

  const optionsHTML = pioneiros
    .sort((a, b) => a.nome.localeCompare(b.nome))
    .map(p => `<option value="${p.id}">${p.nome} (${p.raridade})</option>`)
    .join('');

  const placeholder = '<option value="">— Escolha um pioneiro —</option>';
  selA.innerHTML = placeholder + optionsHTML;
  selB.innerHTML = placeholder + optionsHTML;
}

/**
 * Renderiza o preview de um pioneiro no painel de duelo.
 * @param {Object} pioneiro
 * @param {'a'|'b'} slot
 */
function renderDuelPreview(pioneiro, slot) {
  const container = $id(`duel-preview-${slot}`);
  if (!container) return;

  if (!pioneiro) {
    container.innerHTML = '';
    return;
  }

  const { nome, especialidade, atributosDuelo } = pioneiro;
  container.innerHTML = `
    <p class="duel-preview__name">${nome}</p>
    <p class="duel-preview__specialty">${especialidade}</p>
    <div class="duel-preview__attrs">
      <div class="duel-preview__attr">🏆 Impacto Histórico <strong>${atributosDuelo.impactoHistorico}</strong></div>
      <div class="duel-preview__attr">💡 Poder de Inovação <strong>${atributosDuelo.poderInovacao}</strong></div>
      <div class="duel-preview__attr">🛡️ Resiliência       <strong>${atributosDuelo.resiliencia}</strong></div>
    </div>`;
}

/**
 * Exibe o resultado de um duelo.
 * @param {Object} pionA
 * @param {Object} pionB
 * @param {string} attr — chave do atributo
 */
function renderDuelResult(pionA, pionB, attr) {
  const container = $id('duel-result');
  if (!container) return;

  const valA = pionA.atributosDuelo[attr];
  const valB = pionB.atributosDuelo[attr];

  const attrLabels = {
    impactoHistorico: '🏆 Impacto Histórico',
    poderInovacao:    '💡 Poder de Inovação',
    resiliencia:      '🛡️ Resiliência'
  };

  let titulo, subtitulo, classA, classB;

  if (valA > valB) {
    titulo    = `🏆 ${pionA.nome} vence!`;
    subtitulo = `${pionA.nome} domina este atributo.`;
    classA    = 'duel-result__score-value--winner';
    classB    = 'duel-result__score-value--loser';
  } else if (valB > valA) {
    titulo    = `🏆 ${pionB.nome} vence!`;
    subtitulo = `${pionB.nome} domina este atributo.`;
    classA    = 'duel-result__score-value--loser';
    classB    = 'duel-result__score-value--winner';
  } else {
    titulo    = '🤝 Empate!';
    subtitulo = 'Ambos os pioneiros são igualmente poderosos neste atributo!';
    classA    = 'duel-result__score-value--draw';
    classB    = 'duel-result__score-value--draw';
  }

  container.classList.remove('hidden');
  container.innerHTML = `
    <h3 class="duel-result__title duel-result__title--${valA === valB ? 'draw' : 'win'}">${titulo}</h3>
    <p class="duel-result__attr-name">Atributo: ${attrLabels[attr]}</p>
    <div class="duel-result__scores">
      <div class="duel-result__score">
        <span class="duel-result__score-name">${pionA.nome}</span>
        <span class="duel-result__score-value ${classA}">${valA}</span>
      </div>
      <span style="font-size:1.5rem; color: var(--color-text-muted)">vs</span>
      <div class="duel-result__score">
        <span class="duel-result__score-name">${pionB.nome}</span>
        <span class="duel-result__score-value ${classB}">${valB}</span>
      </div>
    </div>
    <p class="duel-result__detail">${subtitulo}</p>
    <button class="btn btn--ghost btn-duel-again" id="duel-again-btn">↩️ Novo Duelo</button>`;
}

/**
 * Reseta a tela de Duelo (esconde resultado e seção de atributos).
 */
function resetDuelUI() {
  const result    = $id('duel-result');
  const attrSection = $id('duel-attr-section');
  if (result)      result.classList.add('hidden');
  if (attrSection) attrSection.classList.add('hidden');

  const selA = $id('duel-select-a');
  const selB = $id('duel-select-b');
  if (selA) selA.value = '';
  if (selB) selB.value = '';

  renderDuelPreview(null, 'a');
  renderDuelPreview(null, 'b');
}

/**
 * Verifica se ambos os slots do duelo estão preenchidos e exibe a seleção de atributo.
 * @param {Object|null} pionA
 * @param {Object|null} pionB
 */
function checkAndShowDuelAttrSection(pionA, pionB) {
  const attrSection = $id('duel-attr-section');
  if (!attrSection) return;
  if (pionA && pionB) {
    attrSection.classList.remove('hidden');
  } else {
    attrSection.classList.add('hidden');
    const result = $id('duel-result');
    if (result) result.classList.add('hidden');
  }
}

// ══════════════════════════════════════════════════════════════
// 13. ATUALIZAÇÃO PARCIAL DO CARD (sem re-renderizar a grade inteira)
// ══════════════════════════════════════════════════════════════

/**
 * Atualiza a barra de energia de um card específico já renderizado.
 * Evita re-renderizar toda a grade (otimização de performance).
 * Em React, isso seria o setState do componente → React reconcilia o DOM.
 * @param {number} id
 * @param {number} novaEnergia
 */
function updateCardEnergy(id, novaEnergia) {
  $qa(`.pioneer-card[data-id="${id}"] .pioneer-card__energy-wrap`).forEach(wrap => {
    wrap.outerHTML = buildEnergyBarHTML(novaEnergia);
  });
}

/**
 * Atualiza o botão de favorito de um card específico.
 * @param {number} id
 * @param {boolean} isFavorito
 */
function updateCardFavoriteButton(id, isFavorito) {
  $qa(`.pioneer-card[data-id="${id}"] .btn-favorite`).forEach(btn => {
    btn.textContent = isFavorito ? '★' : '☆';
    btn.setAttribute('aria-label', `${isFavorito ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}`);
    btn.setAttribute('aria-pressed', String(isFavorito));
    btn.classList.toggle('is-favorited', isFavorito);
  });
}

/**
 * Atualiza o botão de recrutar/já na equipe de um card.
 * @param {number} id
 * @param {boolean} isRecrutado
 */
function updateCardRecruitButton(id, isRecrutado) {
  $qa(`.pioneer-card[data-id="${id}"]`).forEach(card => {
    // Atualiza classe is-recruited no card
    card.classList.toggle('is-recruited', isRecrutado);

    // Busca o botão de recrutar na primeira linha de ações
    const actionsRow = $q('.pioneer-card__actions-row', card);
    if (actionsRow) {
      const btn = actionsRow.querySelector('[data-action="recrutar"], [data-action="remover-equipe"]');
      if (!btn) return;
      if (isRecrutado) {
        btn.className = 'btn btn--recruited';
        btn.disabled = true;
        btn.textContent = '✅ Já na Equipe';
        btn.removeAttribute('data-action');
      } else {
        btn.className = 'btn btn--recruit';
        btn.disabled = false;
        btn.textContent = '⚔️ Recrutar';
        btn.dataset.action = 'recrutar';
      }
    }

    // Atualiza/adiciona o selo
    const seal = $q('.pioneer-card__seal', card);
    const wrap = $q('.pioneer-card__image-wrap', card);
    if (isRecrutado && !seal && wrap) {
      const newSeal = document.createElement('span');
      newSeal.className = 'pioneer-card__seal';
      newSeal.textContent = 'Na Equipe';
      newSeal.setAttribute('aria-label', 'Recrutado');
      wrap.appendChild(newSeal);
    } else if (!isRecrutado && seal) {
      seal.remove();
    }
  });
}
