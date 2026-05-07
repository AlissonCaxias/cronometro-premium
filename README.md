# ⏱️ Cronômetro de Estudo — Foco 2.0

> Cronômetro de produtividade premium com fundo nebulosa animado, sessões totalmente configuráveis, pausas inteligentes e controle avançado de ciclos de estudo.

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)

---

## 📋 Sobre o Projeto

O **Cronômetro de Estudo 2.0** é a versão premium da aplicação, com visual totalmente reformulado e funcionalidades expandidas. Mantém a base sólida da v1 — timestamps de sistema, pausas automáticas e persistência via `localStorage` — e adiciona um fundo nebulosa animado em camadas, controle manual de duração de pausas e intervalos de estudo, acumulação de tempo real de foco e correção automática de sincronia.

---

## ✨ O que há de novo na v2.0

### 🎨 Visual Premium — Fundo Nebulosa
A maior mudança visual da versão: o fundo deixou de ser um grid estático e passou a ser uma cena dinâmica composta por múltiplas camadas animadas, construída inteiramente em CSS puro.

- **5 Blobs orgânicos** com gradientes radiais coloridos (vermelho, azul, roxo, âmbar, ciano), animação `morph` contínua que deforma forma e posição
- **4 Linhas diagonais** semi-transparentes que cruzam o fundo, criando profundidade geométrica
- **3 Rings circulares** com bordas azuladas e animação `pulse-ring` de respiração (escala + opacidade)
- **6 Dots flutuantes** com animação `float-dot` independente por delay escalonado
- **Grain overlay** — textura de ruído SVG com opacidade sutil para profundidade analógica
- **Glassmorphism no card** — `backdrop-filter: blur` com fundo semi-transparente `rgba(10,10,20,0.38)`

### ⚙️ Sessões Totalmente Configuráveis
Antes, pausa e intervalo eram fixos em 7 min e 30 min respectivamente. Agora o usuário define:

| Campo | Intervalo válido | Padrão |
|-------|-----------------|--------|
| **Pausa Rápida** | 1 – 20 minutos | 7 min |
| **Intervalo de Estudo** | 1 – 60 minutos | 30 min |

Ambos possuem validação em tempo real — campo fica vermelho com glow de alerta se o valor estiver fora do range.

### 🕐 Limite de Descanso por Tempo Acumulado
O descanso obrigatório não é mais baseado em contagem de sessões. A v2.0 rastreia o **tempo efetivo de foco** em segundos (`tempoEstudoAcumuladoSegundos`) e aciona o descanso ao atingir **3 horas reais de estudo** — descontando pausas automáticas e manuais.

### 🔄 Auto-Resume com Correção de Sincronia
Novo listener `window.addEventListener("focus")` detecta quando a aba volta ao foco após ficar em segundo plano. Se mais de 3 segundos se passaram sem tick, o timer recalcula `studyBlockStart` e chama `atualizar()` imediatamente, eliminando drift visual.

### ✅ Validação Visual de Campos
O CSS v2.0 inclui a pseudo-classe `:invalid` nos campos numéricos de pausa e intervalo, exibindo borda vermelha com `box-shadow` de alerta sempre que um valor inválido é digitado — sem precisar submeter o formulário.

---

## ✨ Funcionalidades (completo)

- ⏳ **Temporizador por timestamps** — sem drift por `setInterval`, máxima precisão
- 🔄 **Pausas automáticas inteligentes:**
  - Pausa configurável (padrão 7 min) a cada intervalo de foco configurado (padrão 30 min)
  - Pausa de 5 min se restar menos tempo do que um intervalo completo
  - Encerra automaticamente se restar menos de 14 min
- 🎯 **Entrada flexível de tempo:**
  - `25` → 25 minutos
  - `1:30` → 1 hora e 30 minutos
  - `1;2;3` → sessões separadas somadas
  - Seletor de unidade: **Minutos** ou **Horas**
- ⚙️ **Pausa e intervalo configuráveis** — campos dedicados no card
- 📊 **Rastreamento de sessões e ciclos** com marcadores visuais (dots) — até 30 sessões / 30 ciclos
- 🔔 **Alertas sonoros** no início, fim e pausas (via Google Sounds)
- 💤 **Descanso obrigatório:** após **3 horas reais de foco**, a aplicação bloqueia por **2 horas** com contagem regressiva visível
- 🎉 **Finalização automática** ao atingir 30 ciclos com resumo da jornada
- 💾 **Persistência via `localStorage`** — descanso obrigatório e último fim de sessão sobrevivem ao fechamento do navegador
- 🔁 **Correção automática de sincronia** ao retomar a aba
- ✅ **Validação visual de campos inválidos** com feedback imediato
- 📱 **Totalmente responsivo** — desktop, tablet e mobile (até 360px)

---

## 🎨 Design

- Fundo nebulosa animado com 5 blobs, 4 linhas, 3 rings e 6 dots — 100% CSS
- Grain overlay via SVG inline para textura analógica
- Glassmorphism no card com `backdrop-filter: blur`
- Paleta premium: `#c8f04a` (verde-limão) + `#7fffd4` (aquamarine) sobre `#0a0a12`
- Corner accents com gradiente accent nos cantos superior-direito e inferior-esquerdo do card
- Fontes: **Syne** (display) + **DM Mono** (dados)
- Indicador dot com 4 estados: `inactive` → `running` → `pause` → `done`
- Animação de entrada do card com `fadeIn` suave
- Campos com `:invalid` visual para feedback de erro

---

## 🗂️ Estrutura do Projeto

```
Cronometrador/
├── index.html       # Estrutura da interface + canvas nebulosa
├── styles.css       # Design system premium, nebulosa, glassmorphism, responsivo
├── scripts.js       # Lógica do timer, sessões, configuração e auto-resume
└── README.md        # Documentação
```

---

## 🚀 Como Usar

### ▶️ Rodando no Navegador (sem instalação)

Visualizar Agora!, Clique no Botão abaixo:<br>
<a href='https://alissoncaxias.github.io/cronometro-premium'>
    <img src='https://img.shields.io/badge/-Cronometro%20Digital%20Premium-168f89?style=for-the-badge'>
</a>

1. **Baixe ou clone** este repositório:
   ```bash
   git clone https://github.com/seu-usuario/cronometrador.git
   ```
2. Abra a pasta do projeto
3. Dê **dois cliques** em `index.html`  
   → O arquivo abrirá diretamente no seu navegador padrão

> **Nenhuma instalação ou dependência necessária.** O projeto usa apenas HTML, CSS e JavaScript puro.

---

### 💻 Instalando no PC (acesso rápido)

Para acessar o cronômetro como se fosse um aplicativo instalado no Windows:

1. Abra o arquivo `index.html` no **Google Chrome** ou **Microsoft Edge**
2. Clique nos **três pontos** (menu do navegador) → **Mais ferramentas** → **Criar atalho...**
3. Marque a opção **"Abrir como janela"** e clique em **Criar**

O cronômetro aparecerá no seu Desktop e na barra de tarefas como um app nativo, sem barra de endereços!

---

## 🕹️ Como Funciona

| Ação | Resultado |
|------|-----------|
| Configure pausa e intervalo (opcional) | Define os tempos automáticos da sessão |
| Digite o tempo e clique **Iniciar** | Começa a sessão de foco |
| A cada intervalo configurado (padrão 30 min) | Pausa automática configurada (padrão 7 min) |
| Clique **Pausar** | Congela o timer e libera Reset |
| Clique **Retomar** | Continua de onde parou |
| Clique **Resetar** | Zera tudo (bloqueado durante descanso obrigatório) |
| 3 horas reais de foco acumuladas | Descanso obrigatório de 2 horas |
| 30 ciclos concluídos | Encerramento da jornada de estudo com resumo |

---

## 🔊 Sons

| Evento | Som |
|--------|-----|
| Início / Retomada | Beep curto |
| Fim de sessão | Despertador |
| Pausa / Descanso | Sino suave |

> Os sons são carregados via URL do Google Actions Sounds. É necessária conexão com a internet para que funcionem.

---

## 📱 Compatibilidade

| Plataforma | Suporte |
|------------|---------|
| Desktop (Chrome, Edge, Firefox) | ✅ Total |
| Tablet | ✅ Total |
| Mobile (≥ 360px) | ✅ Total |
| Modo offline | ✅ (exceto sons) |

---

## 🛠️ Tecnologias Utilizadas

| Tecnologia | Uso |
|------------|-----|
| HTML5 | Estrutura semântica + canvas nebulosa |
| CSS3 | Design system, nebulosa animada, glassmorphism, responsividade |
| JavaScript (ES6+) | Lógica de timer, configuração, DOM, localStorage |
| SVG | Anel de progresso circular + grain texture overlay |
| CSS Animations | Blobs morph, rings pulse, dots float — sem JS |
| Google Fonts | Tipografia (Syne + DM Mono) |
| localStorage API | Persistência do descanso obrigatório e último fim |

---

## 👩‍💻 Autora

Desenvolvido por **Alisson** como parte da jornada **Rumo a Fullstack** — Abril/2026.

---

## 📄 Licença

Este projeto está sob a licença **MIT**. Sinta-se livre para usar, modificar e distribuir.
