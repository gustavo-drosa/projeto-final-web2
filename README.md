# ⚡ Mentes do Silício

> Sistema interativo de cartas colecionáveis das figuras históricas da computação.

## 🗂️ Estrutura de Arquivos

```
/
├── index.html              # Estrutura base com contêineres vazios para injeção via JS
├── css/
│   ├── style.css           # Estilos globais, variáveis CSS (design tokens) e tipografia
│   └── layout.css          # Grid, Navbar, Cards, Modais e componentes de layout
├── js/
│   ├── data.js             # Array PIONEIROS_INICIAIS — fonte de dados original
│   ├── state.js            # Gerenciamento de estado, localStorage e lógica de negócio
│   ├── ui.js               # Funções de renderização de interface e manipulação do DOM
│   └── app.js              # Ponto de entrada, inicialização e event listeners
└── assets/
    └── pioneiros/          # Imagens dos pioneiros (formato .webp recomendado)
```

## ✨ Funcionalidades

| Funcionalidade | Descrição |
|---|---|
| 🃏 **Cards Colecionáveis** | 30 pioneiros históricos da computação com raridades Comum, Raro e Épico |
| 🔍 **Busca Dinâmica** | Filtro em tempo real por nome, especialidade, raridade e personalidade |
| ⚔️ **Recrutar** | Adicione até 7 pioneiros à sua equipe |
| ⭐ **Favoritos** | Marque e gerencie seus favoritos |
| ⚡ **Gestão de Energia** | Estudar (+10) e Duelo (−15) modificam a barra de energia |
| ⚔️ **Modo Duelo** | Confronte dois pioneiros em atributos estilo Super Trunfo |
| 📊 **Dashboard** | Painel com estatísticas calculadas em tempo real |
| 💾 **Persistência** | Todo o estado é salvo no localStorage automaticamente |
| ➕ **CRUD Completo** | Adicione, edite e remova pioneiros com validação de formulário |
| 📱 **Responsivo** | Menu hambúrguer no mobile, grid adaptativo e modais em 90% da tela |

## 🛠️ Como Usar

Basta abrir o `index.html` no navegador. Nenhuma instalação necessária.

```bash
# Se tiver o Python instalado:
python3 -m http.server 8080
# Acesse: http://localhost:8080
```

## 🖼️ Imagens dos Pioneiros

Coloque as imagens no formato `.webp` na pasta `assets/pioneiros/` com os nomes:
- `ada-lovelace.webp`
- `alan-turing.webp`
- `charles-babbage.webp`
- ... (seguindo o padrão do campo `imagem` em `data.js`)

Se a imagem não for encontrada, o card exibe o placeholder 🧠.

## 🔄 Migração para React

O código foi estruturado pensando na migração futura:

| Vanilla JS | React Equivalente |
|---|---|
| `PIONEIROS_INICIAIS` em `data.js` | Módulo ES6 com `export const` |
| `AppState` + funções em `state.js` | `Context API + useReducer` ou Zustand |
| Funções de render em `ui.js` | Componentes React (`.jsx`) |
| Event listeners em `app.js` | Handlers inline / hooks customizados |
| `switchTab()` | `React Router` |

## 🧠 Pioneiros Incluídos (30)

Ada Lovelace, Alan Turing, Charles Babbage, Grace Hopper, Margaret Hamilton,
John von Neumann, Dennis Ritchie, Ken Thompson, Tim Berners-Lee, Linus Torvalds,
Claude Shannon, Donald Knuth, Edsger Dijkstra, Barbara Liskov, Alonzo Church,
Hedy Lamarr, Steve Wozniak, Steve Jobs, Bill Gates, Joan Clarke,
Dorothy Vaughan, Katherine Johnson, Guido van Rossum, James Gosling, Brendan Eich,
Yann LeCun, Geoffrey Hinton, Vint Cerf, Bob Kahn, Radia Perlman.
# projeto-final-web2
