/**
 * state.js — Mentes do Silício
 * Gerenciamento de estado da aplicação e persistência no localStorage.
 *
 * Em uma migração para React, este módulo seria substituído por
 * Context API + useReducer, ou por Zustand/Redux.
 */

// ── Constantes ────────────────────────────────────────────────
const STORAGE_KEY     = 'mentes-do-silicio-v3';
const MAX_ID_KEY      = 'mentes-do-silicio-max-id';

/**
 * Estado global da aplicação.
 * Funciona como um "store" centralizado (similar ao Redux Store).
 * @type {{ pioneiros: Array, activeTab: string }}
 */
const AppState = {
  pioneiros: [],
  activeTab: 'pioneers'
};

// ── Funções de Persistência ───────────────────────────────────

/**
 * Salva o array de pioneiros no localStorage.
 * Chamado sempre que há uma mutação de estado.
 */
function saveState() {
  try {
    const payload = JSON.stringify(AppState.pioneiros);
    localStorage.setItem(STORAGE_KEY, payload);
  } catch (err) {
    console.error('[State] Erro ao salvar no localStorage:', err);
  }
}

/**
 * Carrega o estado a partir do localStorage.
 * Se não houver dados salvos ou se a lista estiver incompleta,
 * inicializa com os 30 pioneiros originais do pioneiros-v2.json (via data.js).
 * @returns {boolean} true se carregou do localStorage, false se usou dados iniciais.
 */
function loadState() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      // Garante que o estado tenha pelo menos as cartas originais
      if (Array.isArray(parsed) && parsed.length >= PIONEIROS_INICIAIS.length) {
        AppState.pioneiros = parsed;
        console.info('[State] Estado carregado do localStorage. Total:', parsed.length);
        return true;
      }
    }
  } catch (err) {
    console.warn('[State] Erro ao ler localStorage, usando dados iniciais:', err);
  }

  // Fallback: clonar deep dos dados originais do data.js (pioneiros-v2.json)
  AppState.pioneiros = PIONEIROS_INICIAIS.map(p => ({ ...p, favorito: false }));
  saveState();
  console.info('[State] Estado inicializado com todos os 30 pioneiros de pioneiros-v2.json.');
  return false;
}

/**
 * Reseta o estado para os dados originais (usado em testes ou reset manual).
 */
function resetState() {
  localStorage.removeItem(STORAGE_KEY);
  loadState();
}

// ── Geração de IDs ─────────────────────────────────────────────

/**
 * Gera um ID único para novos pioneiros.
 * @returns {number}
 */
function generateId() {
  const ids = AppState.pioneiros.map(p => p.id);
  return ids.length > 0 ? Math.max(...ids) + 1 : 1;
}

// ── Seletores (Funções de leitura do estado) ──────────────────
// Seguindo o padrão de "selectors" do Redux

/**
 * Retorna todos os pioneiros.
 * @returns {Array}
 */
function getAllPioneiros() {
  return AppState.pioneiros;
}

/**
 * Retorna um pioneiro pelo ID.
 * @param {number} id
 * @returns {Object|undefined}
 */
function getPioneiroById(id) {
  return AppState.pioneiros.find(p => p.id === Number(id));
}

/**
 * Retorna apenas os pioneiros recrutados.
 * @returns {Array}
 */
function getRecrutados() {
  return AppState.pioneiros.filter(p => p.status === 'Recrutado');
}

/**
 * Retorna apenas os pioneiros favoritados.
 * @returns {Array}
 */
function getFavoritos() {
  return AppState.pioneiros.filter(p => p.favorito === true);
}

/**
 * Calcula estatísticas do dashboard.
 * @returns {Object}
 */
function getStats() {
  const todos      = AppState.pioneiros;
  const recrutados = todos.filter(p => p.status === 'Recrutado');
  const favoritos  = todos.filter(p => p.favorito === true);
  const disponiveis = todos.filter(p => p.status === 'Disponível');

  // Contagem por especialidade
  const porEspecialidade = todos.reduce((acc, p) => {
    acc[p.especialidade] = (acc[p.especialidade] || 0) + 1;
    return acc;
  }, {});

  // Contagem por raridade
  const porRaridade = todos.reduce((acc, p) => {
    acc[p.raridade] = (acc[p.raridade] || 0) + 1;
    return acc;
  }, {});

  return {
    total:         todos.length,
    recrutados:    recrutados.length,
    disponiveis:   disponiveis.length,
    favoritos:     favoritos.length,
    porEspecialidade,
    porRaridade
  };
}

// ── Mutações de Estado ─────────────────────────────────────────
// Cada função de mutação chama saveState() ao final.

/**
 * Recruta um pioneiro (muda status para "Recrutado").
 * @param {number} id
 * @returns {Object|null} O pioneiro atualizado ou null se não encontrado.
 */
function recrutar(id) {
  const pioneiro = getPioneiroById(id);
  if (!pioneiro) return null;
  pioneiro.status = 'Recrutado';
  saveState();
  return pioneiro;
}

/**
 * Remove um pioneiro da equipe (muda status para "Disponível").
 * @param {number} id
 * @returns {Object|null} O pioneiro atualizado ou null se não encontrado.
 */
function removerDaEquipe(id) {
  const pioneiro = getPioneiroById(id);
  if (!pioneiro) return null;
  pioneiro.status = 'Disponível';
  saveState();
  return pioneiro;
}

/**
 * Alterna o status de favorito de um pioneiro.
 * @param {number} id
 * @returns {Object|null} O pioneiro atualizado ou null se não encontrado.
 */
function toggleFavorito(id) {
  const pioneiro = getPioneiroById(id);
  if (!pioneiro) return null;
  pioneiro.favorito = !pioneiro.favorito;
  saveState();
  return pioneiro;
}

/**
 * Aumenta a energia de um pioneiro em +10 (máximo 100).
 * @param {number} id
 * @returns {{ pioneiro: Object, maxReached: boolean }|null}
 */
function estudarBiografia(id) {
  const pioneiro = getPioneiroById(id);
  if (!pioneiro) return null;

  const maxReached = pioneiro.energia >= 100;
  if (!maxReached) {
    pioneiro.energia = Math.min(100, pioneiro.energia + 10);
    saveState();
  }
  return { pioneiro, maxReached };
}

/**
 * Reduz a energia de um pioneiro em -15 (mínimo 0).
 * @param {number} id
 * @returns {Object|null} O pioneiro atualizado ou null se não encontrado.
 */
function disputarDuelo(id) {
  const pioneiro = getPioneiroById(id);
  if (!pioneiro) return null;
  pioneiro.energia = Math.max(0, pioneiro.energia - 15);
  saveState();
  return pioneiro;
}

/**
 * Adiciona um novo pioneiro ao array.
 * @param {Object} dados — dados do formulário (sem `id` e `status`).
 * @returns {Object} O pioneiro recém-criado.
 */
function adicionarPioneiro(dados) {
  const novoPioneiro = {
    id:            generateId(),
    nome:          dados.nome.trim(),
    especialidade: dados.especialidade.trim(),
    energia:       Number(dados.energia),
    personalidade: dados.personalidade.trim(),
    raridade:      dados.raridade,
    status:        'Disponível',
    favorito:      false,
    imagem:        dados.imagem ? dados.imagem.trim() : '',
    biografia:     dados.biografia.trim(),
    atributosDuelo: {
      impactoHistorico: Number(dados.impactoHistorico),
      poderInovacao:    Number(dados.poderInovacao),
      resiliencia:      Number(dados.resiliencia)
    }
  };
  AppState.pioneiros.push(novoPioneiro);
  saveState();
  return novoPioneiro;
}

/**
 * Edita os dados de um pioneiro existente.
 * Apenas os campos editáveis podem ser modificados.
 * @param {number} id
 * @param {Object} dados — campos a serem atualizados.
 * @returns {Object|null} O pioneiro atualizado ou null se não encontrado.
 */
function editarPioneiro(id, dados) {
  const pioneiro = getPioneiroById(id);
  if (!pioneiro) return null;

  // Campos permitidos para edição
  pioneiro.nome          = dados.nome.trim();
  pioneiro.especialidade = dados.especialidade.trim();
  pioneiro.personalidade = dados.personalidade.trim();
  pioneiro.raridade      = dados.raridade;
  pioneiro.energia       = Number(dados.energia);
  pioneiro.biografia     = dados.biografia.trim();
  pioneiro.atributosDuelo = {
    impactoHistorico: Number(dados.impactoHistorico),
    poderInovacao:    Number(dados.poderInovacao),
    resiliencia:      Number(dados.resiliencia)
  };
  if (dados.imagem !== undefined) {
    pioneiro.imagem = dados.imagem.trim();
  }

  saveState();
  return pioneiro;
}

/**
 * Remove um pioneiro permanentemente do array.
 * @param {number} id
 * @returns {boolean} true se removido, false se não encontrado.
 */
function removerPioneiro(id) {
  const idx = AppState.pioneiros.findIndex(p => p.id === Number(id));
  if (idx === -1) return false;
  AppState.pioneiros.splice(idx, 1);
  saveState();
  return true;
}

/**
 * Filtra pioneiros de acordo com os critérios fornecidos.
 * @param {Object} filtros — { busca, raridade, personalidade, especialidade }
 * @returns {Array}
 */
function filtrarPioneiros({ busca = '', raridade = '', personalidade = '', especialidade = '' }) {
  const termo = busca.toLowerCase().trim();
  return AppState.pioneiros.filter(p => {
    const matchBusca = !termo ||
      p.nome.toLowerCase().includes(termo) ||
      p.especialidade.toLowerCase().includes(termo);
    const matchRaridade     = !raridade     || p.raridade     === raridade;
    const matchPersonalidade = !personalidade || p.personalidade === personalidade;
    const matchEspecialidade = !especialidade || p.especialidade === especialidade;
    return matchBusca && matchRaridade && matchPersonalidade && matchEspecialidade;
  });
}
