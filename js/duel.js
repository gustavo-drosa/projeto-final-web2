/**
 * duel.js — Mentes do Silício
 * Módulo completo do Modo Duelo estilo Super Trunfo (Melhor de 7).
 *
 * Regras estritas:
 * 1. O usuário precisa de exatamente 7 pioneiros na equipe para iniciar.
 * 2. O bot sorteia 7 pioneiros do array original que NÃO estão na equipe do usuário e sem repetições.
 * 3. Melhor de 7: quem vencer 4 rodadas primeiro é o campeão.
 * 4. Turnos alternados: Usuário (rodadas 1, 3, 5, 7) e Bot (rodadas 2, 4, 6, pensando por 3s).
 * 5. Fog of War: os atributos da carta do bot ficam ocultos com (??) até a revelação.
 * 6. Desempate: se os atributos forem iguais, desempata pela média aritmética dos 3 atributos.
 * 7. Punição de Energia: apenas as cartas do usuário que participaram sofrem -15 de energia (mínimo 0), salvas no localStorage.
 */

// ── Utilitários do Duelo ───────────────────────────────────────

/**
 * Embaralha um array usando Fisher-Yates sem mutar o original.
 * @param {Array} arr
 * @returns {Array}
 */
function shuffleArray(arr) {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/**
 * Calcula a média aritmética dos 3 atributos de duelo de uma carta.
 * @param {Object} attrs - { impactoHistorico, poderInovacao, resiliencia }
 * @returns {number}
 */
function calcMediaAtributos(attrs) {
  if (!attrs) return 0;
  const impacto    = Number(attrs.impactoHistorico) || 0;
  const inovacao   = Number(attrs.poderInovacao)    || 0;
  const resiliencia = Number(attrs.resiliencia)     || 0;
  return (impacto + inovacao + resiliencia) / 3;
}

/**
 * Labels descritivos dos atributos para exibição na UI.
 */
const ATTR_LABELS = {
  impactoHistorico: { label: 'Impacto Histórico', icon: '🏆', color: 'gold' },
  poderInovacao:    { label: 'Poder de Inovação', icon: '💡', color: 'purple' },
  resiliencia:      { label: 'Resiliência',       icon: '🛡️', color: 'green' }
};

// ── Objeto DuelManager (Singleton) ─────────────────────────────
const DuelManager = {

  // Estado interno da partida
  userDeck: [],
  botDeck: [],
  currentRound: 1,             // 1 a 7
  userScore: 0,                // 0 a 4
  botScore: 0,                 // 0 a 4
  isResolving: false,          // trava contra múltiplos cliques durante resolução
  isBotThinking: false,        // indicador de bot pensando
  participatingUserCardIds: [],// IDs das cartas do usuário que já entraram na arena
  roundLogs: [],               // histórico detalhado de rodadas
  botTimerId: null,            // referência do setTimeout do bot
  resolveTimerId: null,        // referência do setTimeout da resolução

  /**
   * Inicializa ou reinicia o lobby do duelo.
   * Chamado quando o usuário navega para a aba "Modo Duelo".
   */
  init() {
    this.cleanupTimers();
    this.isResolving = false;
    this.isBotThinking = false;

    // Renderiza a tela de Lobby
    this.renderLobby();
  },

  /**
   * Limpa timers pendentes para evitar memory leaks ou execuções fantasmas.
   */
  cleanupTimers() {
    if (this.botTimerId) {
      clearTimeout(this.botTimerId);
      this.botTimerId = null;
    }
    if (this.resolveTimerId) {
      clearTimeout(this.resolveTimerId);
      this.resolveTimerId = null;
    }
  },

  /**
   * Verifica se o usuário tem exatamente 7 cartas recrutadas na equipe.
   * @returns {boolean}
   */
  canStart() {
    const recrutados = getRecrutados();
    return recrutados.length === 7;
  },

  /**
   * Renderiza a tela de Lobby com a visualização das cartas recrutadas.
   */
  renderLobby() {
    const lobbyEl = $id('duel-lobby');
    const arenaEl = $id('duel-battle-arena');
    const overEl  = $id('duel-gameover');

    if (!lobbyEl) return;

    // Garante que apenas o Lobby está visível
    lobbyEl.classList.remove('hidden');
    if (arenaEl) arenaEl.classList.add('hidden');
    if (overEl)  overEl.classList.add('hidden');

    const recrutados = getRecrutados();
    const count      = recrutados.length;
    const canPlay    = count === 7;

    // 1. Banner de Status da Equipe
    const statusCard = $id('duel-status-card');
    if (statusCard) {
      if (canPlay) {
        statusCard.className = 'duel-status-card duel-status-card--ready';
        statusCard.innerHTML = `
          <div class="duel-status-card__icon" aria-hidden="true">⚔️</div>
          <div class="duel-status-card__info">
            <h3 class="duel-status-card__title">Equipe Pronta para o Combate!</h3>
            <p class="duel-status-card__text">Você possui exatamente <strong>7 pioneiros recrutados</strong>. O adversário bot sorteará 7 cartas exclusivas para disputar a Melhor de 7!</p>
          </div>
          <span class="badge badge--success">7/7 Prontos</span>`;
      } else {
        const faltam = 7 - count;
        statusCard.className = 'duel-status-card duel-status-card--warning';
        statusCard.innerHTML = `
          <div class="duel-status-card__icon" aria-hidden="true">⚠️</div>
          <div class="duel-status-card__info">
            <h3 class="duel-status-card__title">Você precisa recrutar 7 pioneiros para batalhar</h3>
            <p class="duel-status-card__text">
              Sua equipe possui atualmente <strong>${count} de 7 pioneiros</strong>.
              ${count < 7 ? `Faltam <strong>${faltam} pioneiro${faltam > 1 ? 's' : ''}</strong> para desbloquear a Arena.` : 'Sua equipe ultrapassou o limite de 7 pioneiros.'}
            </p>
          </div>
          <button class="btn btn--primary btn--sm" data-tab-link="pioneers">➕ Recrutar Pioneiros</button>`;
      }
    }

    // 2. Contador no subtítulo
    const countSpan = $id('duel-team-count');
    if (countSpan) countSpan.textContent = count;

    // 3. Grid de visualização da equipe (7 slots)
    const gridEl = $id('duel-lobby-cards');
    if (gridEl) {
      let cardsHTML = '';
      for (let i = 0; i < 7; i++) {
        if (i < recrutados.length) {
          const p = recrutados[i];
          const initials = getInitials(p.nome);
          const level = energyLevel(p.energia);
          cardsHTML += `
            <div class="duel-mini-card" data-rarity="${p.raridade}">
              <div class="duel-mini-card__avatar">${initials}</div>
              <div class="duel-mini-card__info">
                <span class="duel-mini-card__slot">Carta ${i + 1}</span>
                <h4 class="duel-mini-card__name">${p.nome}</h4>
                <div class="duel-mini-card__energy">
                  <span>⚡ ${p.energia}/100</span>
                  <div class="energy-bar energy-bar--xs">
                    <div class="energy-bar__fill" data-level="${level}" style="width: ${p.energia}%"></div>
                  </div>
                </div>
              </div>
            </div>`;
        } else {
          // Vaga vazia
          cardsHTML += `
            <div class="duel-mini-card duel-mini-card--empty">
              <div class="duel-mini-card__empty-icon">➕</div>
              <span class="duel-mini-card__empty-label">Vaga ${i + 1} Vazia</span>
              <button class="btn btn--ghost btn--xs" data-tab-link="pioneers">Recrutar</button>
            </div>`;
        }
      }
      gridEl.innerHTML = cardsHTML;
    }

    // 4. Botão de Iniciar Duelo
    const startBtn = $id('btn-start-duel');
    if (startBtn) {
      startBtn.disabled = !canPlay;
      if (canPlay) {
        startBtn.classList.remove('btn--disabled');
        startBtn.setAttribute('title', 'Iniciar a disputa de 7 rodadas contra o adversário');
      } else {
        startBtn.classList.add('btn--disabled');
        startBtn.setAttribute('title', 'Recrute 7 pioneiros para habilitar');
      }
    }
  },

  /**
   * Inicia o duelo sorteando os decks e preparando a rodada 1.
   */
  startDuel() {
    if (!this.canStart()) {
      showToast('Você precisa recrutar exatamente 7 pioneiros para batalhar!', 'warning');
      return;
    }

    // 1. Deck do usuário: cópia dos 7 recrutados, embaralhada para a batalha
    const recrutados = getRecrutados();
    this.userDeck = shuffleArray(recrutados);

    // 2. Deck do bot: 7 cartas sorteadas do array original
    // Regra estrita: nenhuma carta do bot pode ser igual a nenhuma carta do usuário, e sem repetidas!
    const userIds = new Set(this.userDeck.map(p => p.id));
    const candidatosBot = PIONEIROS_INICIAIS.filter(p => !userIds.has(p.id));

    if (candidatosBot.length < 7) {
      showToast('Erro ao sortear adversário: cartas insuficientes.', 'error');
      return;
    }

    this.botDeck = shuffleArray(candidatosBot).slice(0, 7);

    // 3. Reset das variáveis de partida
    this.currentRound = 1;
    this.userScore    = 0;
    this.botScore     = 0;
    this.isResolving  = false;
    this.isBotThinking = false;
    this.participatingUserCardIds = [];
    this.roundLogs = [];

    // 4. Oculta Lobby e Fim de Jogo, exibe a Arena
    const lobbyEl = $id('duel-lobby');
    const arenaEl = $id('duel-battle-arena');
    const overEl  = $id('duel-gameover');

    if (lobbyEl) lobbyEl.classList.add('hidden');
    if (overEl)  overEl.classList.add('hidden');
    if (arenaEl) {
      arenaEl.classList.remove('hidden');
      arenaEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    showToast('⚔️ Duelo Iniciado! Melhor de 7 rodadas. Boa sorte!', 'info', 4000);

    // 5. Prepara a Rodada 1
    this.setupRound();
  },

  /**
   * Verifica se a rodada atual é do usuário.
   * Regra estrita: Usuário joga nas rodadas ímpares (1, 3, 5, 7). Bot joga nas rodadas pares (2, 4, 6).
   * @returns {boolean}
   */
  isUserTurn() {
    return this.currentRound % 2 === 1;
  },

  /**
   * Configura e renderiza a rodada atual.
   */
  setupRound() {
    this.cleanupTimers();
    this.isResolving = false;
    this.isBotThinking = false;

    const roundIdx = this.currentRound - 1;
    const userCard = this.userDeck[roundIdx];
    const botCard  = this.botDeck[roundIdx];

    if (!userCard || !botCard) {
      console.error('[DuelManager] Cartas da rodada inválidas', { roundIdx, userCard, botCard });
      return;
    }

    // Registra que a carta do usuário participou da rodada para punição de energia ao final
    if (!this.participatingUserCardIds.includes(userCard.id)) {
      this.participatingUserCardIds.push(userCard.id);
    }

    const isUserTurn = this.isUserTurn();

    // 1. Atualiza Placar e Indicadores
    this.updateScoreboard();

    // 2. Banner de Turno
    const bannerEl = $id('duel-turn-banner');
    if (bannerEl) {
      if (isUserTurn) {
        bannerEl.className = 'duel-turn-banner duel-turn-banner--user';
        bannerEl.innerHTML = `
          <div class="duel-turn-banner__content">
            <span class="duel-turn-banner__tag">SEU TURNO</span>
            <span class="duel-turn-banner__msg">Escolha um dos 3 atributos da sua carta para duelar contra o adversário!</span>
          </div>`;
      } else {
        bannerEl.className = 'duel-turn-banner duel-turn-banner--bot';
        bannerEl.innerHTML = `
          <div class="duel-turn-banner__content">
            <span class="duel-turn-banner__tag">TURNO DO ADVERSÁRIO</span>
            <span class="duel-turn-banner__msg">O bot está analisando as cartas e escolhendo um atributo... <span class="duel-dots-thinking"><span>.</span><span>.</span><span>.</span></span></span>
          </div>`;
      }
    }

    // 3. Limpa mensagens anteriores no centro do embate
    const msgEl = $id('duel-round-message');
    if (msgEl) {
      msgEl.classList.add('hidden');
      msgEl.innerHTML = '';
    }

    const swordsIcon = $id('duel-swords-icon');
    if (swordsIcon) swordsIcon.classList.remove('is-clashing');

    // 4. Renderiza a Carta do Usuário (à esquerda)
    this.renderUserCard(userCard, isUserTurn);

    // 5. Renderiza a Carta do Adversário (à direita com Fog of War)
    this.renderBotCard(botCard, false); // false = Fog of War ativo

    // 6. Se for o turno do Bot, aciona o setTimeout de 3 segundos
    if (!isUserTurn) {
      this.isBotThinking = true;
      this.botTimerId = setTimeout(() => {
        this.executeBotTurn();
      }, 3000);
    }
  },

  /**
   * Atualiza o placar e os marcadores de rodada.
   */
  updateScoreboard() {
    const roundBadge = $id('duel-round-badge');
    if (roundBadge) {
      roundBadge.textContent = `Rodada ${this.currentRound} de 7`;
    }

    const scoreUserEl = $id('duel-score-user');
    const scoreBotEl  = $id('duel-score-bot');
    if (scoreUserEl) scoreUserEl.textContent = this.userScore;
    if (scoreBotEl)  scoreBotEl.textContent  = this.botScore;

    // Marcadores de vitória (pips)
    const pipsContainer = $id('duel-score-pips');
    if (pipsContainer) {
      let pipsHTML = '<div class="duel-pips-group duel-pips-group--user">';
      for (let i = 0; i < 4; i++) {
        pipsHTML += `<span class="duel-pip ${i < this.userScore ? 'is-won' : ''}" title="Vitória do Usuário ${i + 1}"></span>`;
      }
      pipsHTML += '</div><span class="duel-pips-divider">|</span><div class="duel-pips-group duel-pips-group--bot">';
      for (let i = 0; i < 4; i++) {
        pipsHTML += `<span class="duel-pip ${i < this.botScore ? 'is-won' : ''}" title="Vitória do Adversário ${i + 1}"></span>`;
      }
      pipsHTML += '</div>';
      pipsContainer.innerHTML = pipsHTML;
    }
  },

  /**
   * Renderiza a carta de duelo do usuário.
   * @param {Object} card
   * @param {boolean} interactive - se os botões de atributo são clicáveis
   */
  renderUserCard(card, interactive) {
    const container = $id('duel-card-user');
    if (!container) return;

    const initials = getInitials(card.nome);
    const attrs    = card.atributosDuelo;
    const level    = energyLevel(card.energia);

    const imgHTML = card.imagem
      ? `<img class="duel-card__img" src="${card.imagem}" alt="${card.nome}"
           onload="this.style.display='block'; if(this.nextElementSibling) this.nextElementSibling.style.display='none';"
           onerror="this.style.display='none'; if(this.nextElementSibling) this.nextElementSibling.style.display='flex';"
           style="display:none;" />
         <div class="duel-card__avatar-placeholder">${initials}</div>`
      : `<div class="duel-card__avatar-placeholder">${initials}</div>`;

    container.innerHTML = `
      <div class="duel-battle-card duel-battle-card--user" data-id="${card.id}" data-rarity="${card.raridade}">
        <div class="duel-battle-card__header">
          <span class="duel-battle-card__badge-player">SUA CARTA</span>
          <span class="pioneer-card__rarity-badge" data-rarity="${card.raridade}">${card.raridade}</span>
        </div>

        <div class="duel-battle-card__image-wrap">
          ${imgHTML}
        </div>

        <div class="duel-battle-card__body">
          <h3 class="duel-battle-card__name">${card.nome}</h3>
          <p class="duel-battle-card__specialty">${card.especialidade}</p>

          <div class="duel-battle-card__energy">
            <span>⚡ Energia: <strong>${card.energia}/100</strong></span>
            <div class="energy-bar energy-bar--xs">
              <div class="energy-bar__fill" data-level="${level}" style="width: ${card.energia}%"></div>
            </div>
          </div>

          <div class="duel-battle-card__attrs-title">
            ${interactive ? '👇 CLIQUE EM UM ATRIBUTO PARA DISPUTAR:' : 'ATRIBUTOS DESTA CARTA:'}
          </div>

          <div class="duel-battle-card__attr-buttons" role="group" aria-label="Atributos de duelo">
            <button class="duel-attr-btn ${interactive ? 'is-interactive' : 'is-disabled'}"
                    data-attr="impactoHistorico"
                    ${!interactive ? 'disabled' : ''}
                    title="Impacto Histórico: ${attrs.impactoHistorico}">
              <span class="duel-attr-btn__icon">🏆</span>
              <span class="duel-attr-btn__name">Impacto Histórico</span>
              <span class="duel-attr-btn__val">${attrs.impactoHistorico}</span>
            </button>

            <button class="duel-attr-btn ${interactive ? 'is-interactive' : 'is-disabled'}"
                    data-attr="poderInovacao"
                    ${!interactive ? 'disabled' : ''}
                    title="Poder de Inovação: ${attrs.poderInovacao}">
              <span class="duel-attr-btn__icon">💡</span>
              <span class="duel-attr-btn__name">Poder de Inovação</span>
              <span class="duel-attr-btn__val">${attrs.poderInovacao}</span>
            </button>

            <button class="duel-attr-btn ${interactive ? 'is-interactive' : 'is-disabled'}"
                    data-attr="resiliencia"
                    ${!interactive ? 'disabled' : ''}
                    title="Resiliência: ${attrs.resiliencia}">
              <span class="duel-attr-btn__icon">🛡️</span>
              <span class="duel-attr-btn__name">Resiliência</span>
              <span class="duel-attr-btn__val">${attrs.resiliencia}</span>
            </button>
          </div>
        </div>
      </div>`;
  },

  /**
   * Renderiza a carta de duelo do bot.
   * @param {Object} card
   * @param {boolean} revealed - se true, remove o Fog of War e revela os números
   * @param {string|null} highlightedAttr - atributo a ser destacado
   */
  renderBotCard(card, revealed = false, highlightedAttr = null) {
    const container = $id('duel-card-bot');
    if (!container) return;

    const initials = getInitials(card.nome);
    const attrs    = card.atributosDuelo;
    const level    = energyLevel(card.energia);

    const imgHTML = card.imagem
      ? `<img class="duel-card__img" src="${card.imagem}" alt="${card.nome}"
           onload="this.style.display='block'; if(this.nextElementSibling) this.nextElementSibling.style.display='none';"
           onerror="this.style.display='none'; if(this.nextElementSibling) this.nextElementSibling.style.display='flex';"
           style="display:none;" />
         <div class="duel-card__avatar-placeholder duel-card__avatar-placeholder--bot">${initials}</div>`
      : `<div class="duel-card__avatar-placeholder duel-card__avatar-placeholder--bot">${initials}</div>`;

    // Fog of War: se não revelado, exibe (??)
    const valImpacto     = revealed ? attrs.impactoHistorico : '??';
    const valInovacao    = revealed ? attrs.poderInovacao    : '??';
    const valResiliencia = revealed ? attrs.resiliencia      : '??';

    container.innerHTML = `
      <div class="duel-battle-card duel-battle-card--bot ${revealed ? 'is-revealed' : 'is-fogged'}" data-id="${card.id}" data-rarity="${card.raridade}">
        <div class="duel-battle-card__header">
          <span class="duel-battle-card__badge-player duel-battle-card__badge-player--bot">ADVERSÁRIO</span>
          <span class="pioneer-card__rarity-badge" data-rarity="${card.raridade}">${card.raridade}</span>
        </div>

        <div class="duel-battle-card__image-wrap">
          ${imgHTML}
          ${!revealed ? '<div class="duel-fog-overlay" aria-hidden="true"><span>👁️‍🗨️ Atributos Ocultos</span></div>' : ''}
        </div>

        <div class="duel-battle-card__body">
          <h3 class="duel-battle-card__name">${card.nome}</h3>
          <p class="duel-battle-card__specialty">${card.especialidade}</p>

          <div class="duel-battle-card__energy">
            <span>⚡ Energia: <strong>${card.energia}/100</strong></span>
            <div class="energy-bar energy-bar--xs">
              <div class="energy-bar__fill" data-level="${level}" style="width: ${card.energia}%"></div>
            </div>
          </div>

          <div class="duel-battle-card__attrs-title">
            ${revealed ? 'ATRIBUTOS REVELADOS:' : 'ATRIBUTOS (FOG OF WAR):'}
          </div>

          <div class="duel-battle-card__attr-buttons" role="group" aria-label="Atributos do adversário">
            <div class="duel-attr-display ${highlightedAttr === 'impactoHistorico' ? 'is-highlighted' : ''} ${!revealed ? 'is-fogged' : ''}"
                 data-bot-attr="impactoHistorico">
              <span class="duel-attr-btn__icon">🏆</span>
              <span class="duel-attr-btn__name">Impacto Histórico</span>
              <span class="duel-attr-btn__val duel-attr-btn__val--bot">${valImpacto}</span>
            </div>

            <div class="duel-attr-display ${highlightedAttr === 'poderInovacao' ? 'is-highlighted' : ''} ${!revealed ? 'is-fogged' : ''}"
                 data-bot-attr="poderInovacao">
              <span class="duel-attr-btn__icon">💡</span>
              <span class="duel-attr-btn__name">Poder de Inovação</span>
              <span class="duel-attr-btn__val duel-attr-btn__val--bot">${valInovacao}</span>
            </div>

            <div class="duel-attr-display ${highlightedAttr === 'resiliencia' ? 'is-highlighted' : ''} ${!revealed ? 'is-fogged' : ''}"
                 data-bot-attr="resiliencia">
              <span class="duel-attr-btn__icon">🛡️</span>
              <span class="duel-attr-btn__name">Resiliência</span>
              <span class="duel-attr-btn__val duel-attr-btn__val--bot">${valResiliencia}</span>
            </div>
          </div>
        </div>
      </div>`;
  },

  /**
   * Executa a jogada do Bot após os 3 segundos de pensamento.
   */
  executeBotTurn() {
    if (this.isResolving) return;

    // Sorteia aleatoriamente um dos 3 atributos
    const attrs = ['impactoHistorico', 'poderInovacao', 'resiliencia'];
    const chosen = attrs[Math.floor(Math.random() * attrs.length)];

    const attrInfo = ATTR_LABELS[chosen];
    showToast(`🤖 O adversário escolheu: ${attrInfo.icon} ${attrInfo.label}!`, 'warning', 3000);

    // Resolve a rodada
    this.resolveRound(chosen, 'bot');
  },

  /**
   * Handler de clique do usuário em um dos 3 atributos.
   * @param {string} attrKey
   */
  handleUserClick(attrKey) {
    if (this.isResolving || !this.isUserTurn() || this.isBotThinking) return;

    const attrInfo = ATTR_LABELS[attrKey];
    showToast(`Você escolheu: ${attrInfo.icon} ${attrInfo.label}!`, 'info', 2000);

    this.resolveRound(attrKey, 'user');
  },

  /**
   * Resolve a disputa de uma rodada e lida com o desempate por média se necessário.
   * @param {string} attrKey - 'impactoHistorico' | 'poderInovacao' | 'resiliencia'
   * @param {'user'|'bot'} playedBy
   */
  resolveRound(attrKey, playedBy) {
    if (this.isResolving) return;
    this.isResolving = true;

    const roundIdx = this.currentRound - 1;
    const userCard = this.userDeck[roundIdx];
    const botCard  = this.botDeck[roundIdx];

    const valUser = Number(userCard.atributosDuelo[attrKey]) || 0;
    const valBot  = Number(botCard.atributosDuelo[attrKey])  || 0;
    const attrInfo = ATTR_LABELS[attrKey];

    // 1. Destaca o atributo escolhido na carta do usuário
    const userBtns = $qa('#duel-card-user .duel-attr-btn');
    userBtns.forEach(btn => {
      btn.disabled = true;
      btn.classList.remove('is-interactive');
      if (btn.dataset.attr === attrKey) {
        btn.classList.add('is-chosen');
      }
    });

    // 2. Revela a carta do adversário removendo o Fog of War e destacando o atributo
    this.renderBotCard(botCard, true, attrKey);

    // Anima o ícone de espadas no centro
    const swords = $id('duel-swords-icon');
    if (swords) swords.classList.add('is-clashing');

    // 3. Determina o Vencedor e regras de Desempate
    let winner = null;          // 'user' | 'bot'
    let tiebreakOccurred = false;
    let mediaUser = 0;
    let mediaBot  = 0;

    if (valUser > valBot) {
      winner = 'user';
    } else if (valBot > valUser) {
      winner = 'bot';
    } else {
      // ── REGRA DE DESEMPATE ESTILO SUPER TRUNFO ───────────────────
      // "Caso o valor seja idêntico, o desempate automático é feito
      // pela média aritmética dos 3 atributos da carta de cada jogador"
      tiebreakOccurred = true;
      mediaUser = calcMediaAtributos(userCard.atributosDuelo);
      mediaBot  = calcMediaAtributos(botCard.atributosDuelo);

      if (mediaUser > mediaBot) {
        winner = 'user';
      } else if (mediaBot > mediaUser) {
        winner = 'bot';
      } else {
        // Se até as médias forem idênticas, vantagem de resiliência ou de quem escolheu
        winner = playedBy;
      }
    }

    // 4. Efeitos visuais nas cartas
    const userCardEl = $q('.duel-battle-card--user');
    const botCardEl  = $q('.duel-battle-card--bot');

    if (winner === 'user') {
      if (userCardEl) userCardEl.classList.add('is-winner');
      if (botCardEl)  botCardEl.classList.add('is-loser');
    } else {
      if (botCardEl)  botCardEl.classList.add('is-winner');
      if (userCardEl) userCardEl.classList.add('is-loser');
    }

    // 5. Constrói mensagem de feedback da rodada
    const msgEl = $id('duel-round-message');
    if (msgEl) {
      let resultText = '';
      let resultClass = '';

      if (winner === 'user') {
        resultClass = 'duel-round-message--win';
        if (tiebreakOccurred) {
          resultText = `
            <div class="duel-result-tag duel-result-tag--win">🏆 VOCÊ VENCEU A RODADA NO DESEMPATE!</div>
            <p>Empate em <strong>${attrInfo.label} (${valUser} x ${valBot})</strong>!</p>
            <p class="duel-result-sub">Desempate pela Média Geral dos 3 Atributos: <strong>Você ${mediaUser.toFixed(1)}</strong> vs ${mediaBot.toFixed(1)} Bot</p>`;
        } else {
          resultText = `
            <div class="duel-result-tag duel-result-tag--win">🏆 VOCÊ VENCEU A RODADA!</div>
            <p>Seu <strong>${attrInfo.label} (${valUser})</strong> superou o adversário (${valBot})!</p>`;
        }
      } else {
        resultClass = 'duel-round-message--lose';
        if (tiebreakOccurred) {
          resultText = `
            <div class="duel-result-tag duel-result-tag--lose">💥 O ADVERSÁRIO VENCEU NO DESEMPATE!</div>
            <p>Empate em <strong>${attrInfo.label} (${valUser} x ${valBot})</strong>!</p>
            <p class="duel-result-sub">Desempate pela Média Geral dos 3 Atributos: <strong>Bot ${mediaBot.toFixed(1)}</strong> vs ${mediaUser.toFixed(1)} Você</p>`;
        } else {
          resultText = `
            <div class="duel-result-tag duel-result-tag--lose">💥 O ADVERSÁRIO VENCEU A RODADA!</div>
            <p>O <strong>${attrInfo.label} (${valBot})</strong> do bot superou o seu (${valUser})!</p>`;
        }
      }

      msgEl.className = `duel-round-message ${resultClass}`;
      msgEl.innerHTML = resultText;
      msgEl.classList.remove('hidden');
    }

    // 6. Atualiza pontuação
    if (winner === 'user') {
      this.userScore++;
    } else {
      this.botScore++;
    }

    // Atualiza placar visual após a resolução
    this.updateScoreboard();

    // Registra no histórico
    this.roundLogs.push({
      round: this.currentRound,
      playedBy,
      attrKey,
      valUser,
      valBot,
      winner,
      tiebreakOccurred,
      userCardName: userCard.nome,
      botCardName: botCard.nome
    });

    // 7. Aguarda 2 segundos após a revelação para seguir para a próxima rodada ou fim de jogo
    this.resolveTimerId = setTimeout(() => {
      // Regra: "quem vencer 4 rodadas primeiro ganha o jogo"
      if (this.userScore >= 4) {
        this.finishGame('user');
      } else if (this.botScore >= 4) {
        this.finishGame('bot');
      } else if (this.currentRound >= 7) {
        // Se chegou ao fim das 7 rodadas (ex: 4x3)
        this.finishGame(this.userScore > this.botScore ? 'user' : 'bot');
      } else {
        // Próxima rodada
        this.currentRound++;
        this.setupRound();
      }
    }, 2000);
  },

  /**
   * Finaliza o jogo, aplica a punição de energia e exibe a tela de Fim de Jogo.
   * @param {'user'|'bot'} winner
   */
  finishGame(winner) {
    this.cleanupTimers();

    const arenaEl = $id('duel-battle-arena');
    const overEl  = $id('duel-gameover');

    if (arenaEl) arenaEl.classList.add('hidden');
    if (overEl)  overEl.classList.remove('hidden');

    // ── PUNIÇÃO DE ENERGIA (-15) ──────────────────────────────────
    // Regra estrita: "Apenas as cartas do usuário que efetivamente participaram
    // das rodadas sofrem uma redução de -15 de energia (não abaixo de 0)."
    const updatedCards = [];

    this.participatingUserCardIds.forEach(id => {
      const p = getPioneiroById(id);
      if (p) {
        const oldEnergy = p.energia;
        p.energia = Math.max(0, p.energia - 15);
        updatedCards.push({
          nome: p.nome,
          oldEnergy,
          newEnergy: p.energia,
          diff: p.energia - oldEnergy
        });
      }
    });

    // Salva no localStorage para cumprir o desafio de persistência
    saveState();
    refreshGlobalUI();

    // Renderiza o relatório de Fim de Jogo
    const cardEl = $id('duel-gameover-card');
    if (cardEl) {
      const isUserWin = winner === 'user';
      const roundsPlayed = this.roundLogs.length;

      let energyRowsHTML = updatedCards.map(item => `
        <div class="duel-energy-report-row">
          <span class="duel-energy-report-row__name">⚡ ${item.nome}</span>
          <div class="duel-energy-report-row__values">
            <span class="duel-energy-report-row__old">${item.oldEnergy}</span>
            <span class="duel-energy-report-row__arrow">→</span>
            <span class="duel-energy-report-row__new">${item.newEnergy}/100</span>
            <span class="badge badge--danger">-15</span>
          </div>
        </div>`).join('');

      cardEl.className = `duel-gameover__card ${isUserWin ? 'duel-gameover__card--win' : 'duel-gameover__card--lose'}`;
      cardEl.innerHTML = `
        <div class="duel-gameover__header">
          <div class="duel-gameover__trophy">${isUserWin ? '🏆' : '💀'}</div>
          <h2 class="duel-gameover__title">${isUserWin ? 'VITÓRIA ÉPICA!' : 'DERROTA NO COMBATE!'}</h2>
          <p class="duel-gameover__subtitle">
            ${isUserWin
              ? `Parabéns, Comandante! Você derrotou o bot por <strong>${this.userScore} a ${this.botScore}</strong> em <strong>${roundsPlayed} rodadas</strong>.`
              : `O adversário venceu a partida por <strong>${this.botScore} a ${this.userScore}</strong> em <strong>${roundsPlayed} rodadas</strong>.`}
          </p>
        </div>

        <div class="duel-gameover__score-display">
          <div class="duel-gameover__score-box duel-gameover__score-box--user ${isUserWin ? 'is-winner' : ''}">
            <span class="duel-gameover__score-label">Sua Equipe</span>
            <span class="duel-gameover__score-number">${this.userScore}</span>
          </div>
          <div class="duel-gameover__score-sep">x</div>
          <div class="duel-gameover__score-box duel-gameover__score-box--bot ${!isUserWin ? 'is-winner' : ''}">
            <span class="duel-gameover__score-label">Adversário</span>
            <span class="duel-gameover__score-number">${this.botScore}</span>
          </div>
        </div>

        <div class="duel-gameover__energy-report">
          <h3 class="duel-gameover__energy-title">⚡ Desgaste de Energia de Batalha (−15 por carta utilizada)</h3>
          <p class="duel-gameover__energy-desc">
            Apenas os <strong>${updatedCards.length} pioneiros</strong> que efetivamente entraram em combate nesta Melhor de 7 tiveram sua energia reduzida:
          </p>
          <div class="duel-energy-report-list">
            ${energyRowsHTML}
          </div>
        </div>

        <div class="duel-gameover__actions">
          <button class="btn btn--secondary" id="btn-duel-back-dashboard">
            📊 Voltar ao Painel
          </button>
          <button class="btn btn--ghost" id="btn-duel-back-team">
            👥 Ver Minha Equipe
          </button>
          <button class="btn btn--primary" id="btn-duel-rematch">
            ⚔️ Jogar Novamente
          </button>
        </div>`;

      // Event listeners dos botões de fim de jogo
      const btnDashboard = $id('btn-duel-back-dashboard');
      if (btnDashboard) {
        btnDashboard.addEventListener('click', () => {
          switchTab('dashboard');
          renderTabContent('dashboard');
        });
      }

      const btnTeam = $id('btn-duel-back-team');
      if (btnTeam) {
        btnTeam.addEventListener('click', () => {
          switchTab('team');
          renderTabContent('team');
        });
      }

      const btnRematch = $id('btn-duel-rematch');
      if (btnRematch) {
        btnRematch.addEventListener('click', () => {
          this.init();
        });
      }
    }

    if (winner === 'user') {
      showToast('🎉 Parabéns! Você conquistou a vitória na Melhor de 7!', 'success', 5000);
    } else {
      showToast('💀 Derrota! Descanse seus pioneiros e tente novamente.', 'error', 5000);
    }
  }
};
