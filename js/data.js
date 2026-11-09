/**
 * data.js — Mentes do Silício
 * Array de dados inicial dos pioneiros importado de pioneiros-v2.json.
 * Contém exatamente as 30 figuras históricas da computação.
 */

const PIONEIROS_INICIAIS = [
  {
    "id": 1,
    "nome": "Ada Lovelace",
    "especialidade": "Linguagens de Programação",
    "energia": 90,
    "personalidade": "Visionária",
    "raridade": "Épico",
    "status": "Disponível",
    "imagem": "assets/pioneiros/ada-lovelace.webp",
    "biografia": "Primeira programadora da história; escreveu o primeiro algoritmo para a Máquina Analítica.",
    "atributosDuelo": {
      "impactoHistorico": 96,
      "poderInovacao": 98,
      "resiliencia": 90
    },
    "favorito": false
  },
  {
    "id": 2,
    "nome": "Alan Turing",
    "especialidade": "Computação Teórica & IA",
    "energia": 88,
    "personalidade": "Genial e Analítico",
    "raridade": "Épico",
    "status": "Disponível",
    "imagem": "assets/pioneiros/alan-turing.webp",
    "biografia": "Pai da ciência da computação teórica e inteligência artificial; decifrou a máquina Enigma.",
    "atributosDuelo": {
      "impactoHistorico": 99,
      "poderInovacao": 97,
      "resiliencia": 95
    },
    "favorito": false
  },
  {
    "id": 3,
    "nome": "Charles Babbage",
    "especialidade": "Hardware & Arquitetura",
    "energia": 82,
    "personalidade": "Inconformado",
    "raridade": "Comum",
    "status": "Disponível",
    "imagem": "assets/pioneiros/charles-babbage.webp",
    "biografia": "Projetou a Máquina Diferencial e a Máquina Analítica, precursoras do computador mecânico.",
    "atributosDuelo": {
      "impactoHistorico": 91,
      "poderInovacao": 95,
      "resiliencia": 80
    },
    "favorito": false
  },
  {
    "id": 4,
    "nome": "Grace Hopper",
    "especialidade": "Linguagens de Programação",
    "energia": 95,
    "personalidade": "Pioneira e Determinada",
    "raridade": "Épico",
    "status": "Disponível",
    "imagem": "assets/pioneiros/grace-hopper.webp",
    "biografia": "Criou o primeiro compilador, popularizou o termo 'bug' e a linguagem COBOL.",
    "atributosDuelo": {
      "impactoHistorico": 95,
      "poderInovacao": 93,
      "resiliencia": 98
    },
    "favorito": false
  },
  {
    "id": 5,
    "nome": "Margaret Hamilton",
    "especialidade": "Engenharia de Software",
    "energia": 92,
    "personalidade": "Meticulosa",
    "raridade": "Épico",
    "status": "Disponível",
    "imagem": "assets/pioneiros/margaret-hamilton.webp",
    "biografia": "Diretora da Divisão de Engenharia de Software da NASA para as missões Apollo.",
    "atributosDuelo": {
      "impactoHistorico": 94,
      "poderInovacao": 91,
      "resiliencia": 96
    },
    "favorito": false
  },
  {
    "id": 6,
    "nome": "John von Neumann",
    "especialidade": "Hardware & Arquitetura",
    "energia": 87,
    "personalidade": "Polímata",
    "raridade": "Épico",
    "status": "Disponível",
    "imagem": "assets/pioneiros/john-von-neumann.webp",
    "biografia": "Formalizou a arquitetura de computadores de programa armazenado que usamos até hoje.",
    "atributosDuelo": {
      "impactoHistorico": 97,
      "poderInovacao": 96,
      "resiliencia": 88
    },
    "favorito": false
  },
  {
    "id": 7,
    "nome": "Dennis Ritchie",
    "especialidade": "Sistemas Operacionais & Linguagens",
    "energia": 86,
    "personalidade": "Pragmático",
    "raridade": "Épico",
    "status": "Disponível",
    "imagem": "assets/pioneiros/dennis-ritchie.webp",
    "biografia": "Criador da linguagem de programação C e co-criador do sistema operacional Unix.",
    "atributosDuelo": {
      "impactoHistorico": 98,
      "poderInovacao": 94,
      "resiliencia": 92
    },
    "favorito": false
  },
  {
    "id": 8,
    "nome": "Ken Thompson",
    "especialidade": "Sistemas Operacionais",
    "energia": 85,
    "personalidade": "Minimalista",
    "raridade": "Raro",
    "status": "Disponível",
    "imagem": "assets/pioneiros/ken-thompson.webp",
    "biografia": "Co-criador do Unix, B, Go e do padrão de codificação de texto UTF-8.",
    "atributosDuelo": {
      "impactoHistorico": 93,
      "poderInovacao": 90,
      "resiliencia": 91
    },
    "favorito": false
  },
  {
    "id": 9,
    "nome": "Tim Berners-Lee",
    "especialidade": "Redes & Web",
    "energia": 89,
    "personalidade": "Colaborativo",
    "raridade": "Épico",
    "status": "Disponível",
    "imagem": "assets/pioneiros/tim-berners-lee.webp",
    "biografia": "Inventor da World Wide Web (WWW), do protocolo HTTP e da linguagem HTML.",
    "atributosDuelo": {
      "impactoHistorico": 98,
      "poderInovacao": 95,
      "resiliencia": 89
    },
    "favorito": false
  },
  {
    "id": 10,
    "nome": "Linus Torvalds",
    "especialidade": "Sistemas Operacionais",
    "energia": 88,
    "personalidade": "Direto e Focado",
    "raridade": "Raro",
    "status": "Disponível",
    "imagem": "assets/pioneiros/linus-torvalds.webp",
    "biografia": "Criador do kernel Linux e do sistema de controle de versão distribuído Git.",
    "atributosDuelo": {
      "impactoHistorico": 95,
      "poderInovacao": 89,
      "resiliencia": 94
    },
    "favorito": false
  },
  {
    "id": 11,
    "nome": "Claude Shannon",
    "especialidade": "Teoria da Informação",
    "energia": 84,
    "personalidade": "Genial Curioso",
    "raridade": "Raro",
    "status": "Disponível",
    "imagem": "assets/pioneiros/claude-shannon.webp",
    "biografia": "Pai da Teoria da Informação; fundamentou os circuitos digitais em lógica booleana.",
    "atributosDuelo": {
      "impactoHistorico": 96,
      "poderInovacao": 97,
      "resiliencia": 85
    },
    "favorito": false
  },
  {
    "id": 12,
    "nome": "Donald Knuth",
    "especialidade": "Algoritmos & Estruturas de Dados",
    "energia": 91,
    "personalidade": "Perfeccionista",
    "raridade": "Raro",
    "status": "Disponível",
    "imagem": "assets/pioneiros/donald-knuth.webp",
    "biografia": "Autor da obra 'The Art of Computer Programming' e criador do sistema TeX.",
    "atributosDuelo": {
      "impactoHistorico": 90,
      "poderInovacao": 92,
      "resiliencia": 97
    },
    "favorito": false
  },
  {
    "id": 13,
    "nome": "Edsger Dijkstra",
    "especialidade": "Algoritmos & Programação Estruturada",
    "energia": 83,
    "personalidade": "Rigoroso",
    "raridade": "Comum",
    "status": "Disponível",
    "imagem": "assets/pioneiros/edsger-dijkstra.webp",
    "biografia": "Pioneiro da programação estruturada e criador do algoritmo de caminho mínimo.",
    "atributosDuelo": {
      "impactoHistorico": 89,
      "poderInovacao": 91,
      "resiliencia": 86
    },
    "favorito": false
  },
  {
    "id": 14,
    "nome": "Barbara Liskov",
    "especialidade": "Engenharia de Software & POO",
    "energia": 87,
    "personalidade": "Inovadora",
    "raridade": "Raro",
    "status": "Disponível",
    "imagem": "assets/pioneiros/barbara-liskov.webp",
    "biografia": "Desenvolveu o Princípio de Substituição de Liskov e contribuiu para abstração de dados.",
    "atributosDuelo": {
      "impactoHistorico": 91,
      "poderInovacao": 90,
      "resiliencia": 92
    },
    "favorito": false
  },
  {
    "id": 15,
    "nome": "Alonzo Church",
    "especialidade": "Computação Teórica & Lógica",
    "energia": 80,
    "personalidade": "Metódico",
    "raridade": "Comum",
    "status": "Disponível",
    "imagem": "assets/pioneiros/alonzo-church.webp",
    "biografia": "Criador do Cálculo Lambda, base teórica essencial para a programação funcional.",
    "atributosDuelo": {
      "impactoHistorico": 92,
      "poderInovacao": 94,
      "resiliencia": 83
    },
    "favorito": false
  },
  {
    "id": 16,
    "nome": "Hedy Lamarr",
    "especialidade": "Redes & Comunicação Sem Fio",
    "energia": 86,
    "personalidade": "Criativa e Destemida",
    "raridade": "Raro",
    "status": "Disponível",
    "imagem": "assets/pioneiros/hedy-lamarr.webp",
    "biografia": "Co-inventora da tecnologia de salto em frequência, base do Wi-Fi, Bluetooth e GPS.",
    "atributosDuelo": {
      "impactoHistorico": 93,
      "poderInovacao": 95,
      "resiliencia": 91
    },
    "favorito": false
  },
  {
    "id": 17,
    "nome": "Steve Wozniak",
    "especialidade": "Hardware & Computação Pessoal",
    "energia": 88,
    "personalidade": "Engenhoso e Entusiasta",
    "raridade": "Comum",
    "status": "Disponível",
    "imagem": "assets/pioneiros/steve-wozniak.webp",
    "biografia": "Projetou manualmente os computadores Apple I e Apple II, popularizando os PCs.",
    "atributosDuelo": {
      "impactoHistorico": 90,
      "poderInovacao": 93,
      "resiliencia": 89
    },
    "favorito": false
  },
  {
    "id": 18,
    "nome": "Steve Jobs",
    "especialidade": "Interface & Produto",
    "energia": 94,
    "personalidade": "Perfeccionista e Persuasivo",
    "raridade": "Épico",
    "status": "Disponível",
    "imagem": "assets/pioneiros/steve-jobs.webp",
    "biografia": "Revolucionou a computação pessoal, interfaces gráficas e dispositivos móveis.",
    "atributosDuelo": {
      "impactoHistorico": 96,
      "poderInovacao": 89,
      "resiliencia": 95
    },
    "favorito": false
  },
  {
    "id": 19,
    "nome": "Bill Gates",
    "especialidade": "Sistemas Operacionais & Software",
    "energia": 92,
    "personalidade": "Estratégico",
    "raridade": "Raro",
    "status": "Disponível",
    "imagem": "assets/pioneiros/bill-gates.webp",
    "biografia": "Co-fundador da Microsoft; liderou a popularização global do MS-DOS e do Windows.",
    "atributosDuelo": {
      "impactoHistorico": 95,
      "poderInovacao": 85,
      "resiliencia": 93
    },
    "favorito": false
  },
  {
    "id": 20,
    "nome": "Joan Clarke",
    "especialidade": "Criptografia",
    "energia": 85,
    "personalidade": "Perspicaz",
    "raridade": "Comum",
    "status": "Disponível",
    "imagem": "assets/pioneiros/joan-clarke.webp",
    "biografia": "Criptoanalista em Bletchley Park; desempenhou papel crucial no projeto Enigma.",
    "atributosDuelo": {
      "impactoHistorico": 88,
      "poderInovacao": 87,
      "resiliencia": 94
    },
    "favorito": false
  },
  {
    "id": 21,
    "nome": "Dorothy Vaughan",
    "especialidade": "Linguagens de Programação & Cálculo",
    "energia": 90,
    "personalidade": "Líder Resiliente",
    "raridade": "Raro",
    "status": "Disponível",
    "imagem": "assets/pioneiros/dorothy-vaughan.webp",
    "biografia": "Primeira supervisora negra da NASA; pioneira no aprendizado e ensino de FORTRAN.",
    "atributosDuelo": {
      "impactoHistorico": 89,
      "poderInovacao": 86,
      "resiliencia": 98
    },
    "favorito": false
  },
  {
    "id": 22,
    "nome": "Katherine Johnson",
    "especialidade": "Cálculo Orbital & Matemática",
    "energia": 93,
    "personalidade": "Precisa e Obstinada",
    "raridade": "Épico",
    "status": "Disponível",
    "imagem": "assets/pioneiros/katherine-johnson.webp",
    "biografia": "Matemática da NASA cujos cálculos orbitais garantiram o sucesso das missões Apollo.",
    "atributosDuelo": {
      "impactoHistorico": 94,
      "poderInovacao": 91,
      "resiliencia": 97
    },
    "favorito": false
  },
  {
    "id": 23,
    "nome": "Guido van Rossum",
    "especialidade": "Linguagens de Programação",
    "energia": 85,
    "personalidade": "Comunitário",
    "raridade": "Comum",
    "status": "Disponível",
    "imagem": "assets/pioneiros/guido-van-rossum.webp",
    "biografia": "Criador da linguagem de programação Python, focada em legibilidade e simplicidade.",
    "atributosDuelo": {
      "impactoHistorico": 91,
      "poderInovacao": 88,
      "resiliencia": 87
    },
    "favorito": false
  },
  {
    "id": 24,
    "nome": "James Gosling",
    "especialidade": "Linguagens de Programação",
    "energia": 84,
    "personalidade": "Sistemático",
    "raridade": "Comum",
    "status": "Disponível",
    "imagem": "assets/pioneiros/james-gosling.webp",
    "biografia": "Pai da linguagem de programação Java e criador de sua Máquina Virtual (JVM).",
    "atributosDuelo": {
      "impactoHistorico": 92,
      "poderInovacao": 87,
      "resiliencia": 88
    },
    "favorito": false
  },
  {
    "id": 25,
    "nome": "Brendan Eich",
    "especialidade": "Redes & Web",
    "energia": 87,
    "personalidade": "Ágil",
    "raridade": "Comum",
    "status": "Disponível",
    "imagem": "assets/pioneiros/brendan-eich.webp",
    "biografia": "Criador do JavaScript em apenas 10 dias e co-fundador da Mozilla.",
    "atributosDuelo": {
      "impactoHistorico": 95,
      "poderInovacao": 91,
      "resiliencia": 86
    },
    "favorito": false
  },
  {
    "id": 26,
    "nome": "Yann LeCun",
    "especialidade": "Inteligência Artificial & Deep Learning",
    "energia": 88,
    "personalidade": "Visionário Acadêmico",
    "raridade": "Comum",
    "status": "Disponível",
    "imagem": "assets/pioneiros/yann-lecun.webp",
    "biografia": "Pioneiro em Redes Neurais Convolucionais e Visão Computacional.",
    "atributosDuelo": {
      "impactoHistorico": 90,
      "poderInovacao": 94,
      "resiliencia": 89
    },
    "favorito": false
  },
  {
    "id": 27,
    "nome": "Geoffrey Hinton",
    "especialidade": "Inteligência Artificial & Deep Learning",
    "energia": 89,
    "personalidade": "Pai da IA Moderna",
    "raridade": "Épico",
    "status": "Disponível",
    "imagem": "assets/pioneiros/geoffrey-hinton.webp",
    "biografia": "Pioneiro em algoritmos de retropropagação e redes neurais profundas.",
    "atributosDuelo": {
      "impactoHistorico": 94,
      "poderInovacao": 96,
      "resiliencia": 92
    },
    "favorito": false
  },
  {
    "id": 28,
    "nome": "Vint Cerf",
    "especialidade": "Redes & Protocolos",
    "energia": 86,
    "personalidade": "Diplomata da Tecnologia",
    "raridade": "Raro",
    "status": "Disponível",
    "imagem": "assets/pioneiros/vint-cerf.webp",
    "biografia": "Co-inventor do protocolo TCP/IP e da arquitetura fundamental da Internet.",
    "atributosDuelo": {
      "impactoHistorico": 97,
      "poderInovacao": 93,
      "resiliencia": 88
    },
    "favorito": false
  },
  {
    "id": 29,
    "nome": "Bob Kahn",
    "especialidade": "Redes & Protocolos",
    "energia": 85,
    "personalidade": "Arquiteto de Sistemas",
    "raridade": "Raro",
    "status": "Disponível",
    "imagem": "assets/pioneiros/bob-kahn.webp",
    "biografia": "Co-criador do protocolo TCP/IP e pioneiro na comutação de pacotes.",
    "atributosDuelo": {
      "impactoHistorico": 96,
      "poderInovacao": 92,
      "resiliencia": 87
    },
    "favorito": false
  },
  {
    "id": 30,
    "nome": "Radia Perlman",
    "especialidade": "Redes & Segurança",
    "energia": 88,
    "personalidade": "Brilhante e Modesta",
    "raridade": "Comum",
    "status": "Disponível",
    "imagem": "assets/pioneiros/radia-perlman.webp",
    "biografia": "Inventora do protocolo Spanning Tree (STP), fundamental para o funcionamento de redes.",
    "atributosDuelo": {
      "impactoHistorico": 92,
      "poderInovacao": 91,
      "resiliencia": 90
    },
    "favorito": false
  }
];
