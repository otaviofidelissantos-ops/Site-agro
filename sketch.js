// ===== EcoAgro Dash — Engine =====
const state = { prod: 50, money: 50, env: 50, turn: 1, ended: false };

const ACTIONS = {
  agrotoxico: {
    delta: { prod: +20, money: +15, env: -30 },
    icon: "⚠️",
    tone: "warn",
    msg: "<strong>Alerta:</strong> a produção disparou e o lucro veio rápido, mas os rios e polinizadores sofreram um impacto severo."
  },
  biologico: {
    delta: { prod: +10, money: -10, env: +20 },
    icon: "🐞",
    tone: "success",
    msg: "<strong>Sucesso!</strong> O controle biológico eliminou pragas preservando a fauna local."
  },
  irrigacao: {
    delta: { prod: +15, money: -20, env: +15 },
    icon: "💧",
    tone: "success",
    msg: "<strong>Ótima escolha!</strong> A irrigação gota a gota economizou água e garantiu a colheita."
  },
  floresta: {
    delta: { prod: -5, money: -15, env: +30 },
    icon: "🌲",
    tone: "success",
    msg: "<strong>Incrível!</strong> Recuperar as matas ciliares protege água e solo para o futuro da fazenda."
  }
};

const $ = (id) => document.getElementById(id);

function clamp(v) { return Math.max(0, Math.min(100, v)); }

function render() {
  $("bar-prod").style.width  = state.prod  + "%";
  $("bar-money").style.width = state.money + "%";
  $("bar-env").style.width   = state.env   + "%";

  animateNumber("val-prod",  state.prod);
  animateNumber("val-money", state.money);
  animateNumber("val-env",   state.env);

  const score = Math.round((state.prod * 0.3) + (state.money * 0.3) + (state.env * 0.4));
  animateNumber("score", score);

  $("turn").innerText = String(state.turn).padStart(2, "0");
}

function animateNumber(id, target) {
  const el = $(id);
  const current = parseInt(el.innerText, 10) || 0;
  const diff = target - current;
  if (diff === 0) return;
  const step = diff / 12;
  let i = 0;
  const tick = () => {
    i++;
    const val = Math.round(current + step * i);
    el.innerText = i >= 12 ? target : val;
    if (i < 12) requestAnimationFrame(tick);
  };
  tick();
}

function setFeedback(tone, icon, html) {
  const panel = document.querySelector(".feedback");
  panel.classList.remove("success", "warn", "danger", "win");
  if (tone) panel.classList.add(tone);
  const ico = $("feedback-ico");
  ico.innerText = icon;
  ico.classList.remove("flash"); void ico.offsetWidth; ico.classList.add("flash");
  $("mensagem-alerta").innerHTML = html;
}

function tomarDecisao(action) {
  if (state.ended) return;
  const cfg = ACTIONS[action];
  if (!cfg) return;

  state.prod  = clamp(state.prod  + cfg.delta.prod);
  state.money = clamp(state.money + cfg.delta.money);
  state.env   = clamp(state.env   + cfg.delta.env);
  state.turn += 1;

  render();
  setFeedback(cfg.tone, cfg.icon, cfg.msg);
  verificarFimDeJogo();
}

function verificarFimDeJogo() {
  if (state.env <= 10) {
    state.ended = true;
    setFeedback("danger", "❌",
      "<strong>Fim de jogo.</strong> O meio ambiente entrou em colapso e a fazenda faliu devido à seca extrema. Clique em <em>Reiniciar</em> para tentar de novo.");
  } else if (state.money <= 5) {
    state.ended = true;
    setFeedback("danger", "💸",
      "<strong>Fim de jogo.</strong> O orçamento esgotou — sem capital, a fazenda parou de operar.");
  } else if (state.env >= 80 && state.prod >= 75 && state.money >= 60) {
    state.ended = true;
    setFeedback("win", "🏆",
      "<strong>Equilíbrio Perfeito!</strong> Agro forte, lucro estável e ecossistema saudável. Você é o futuro do campo. 🌱");
  }
}

function reset() {
  Object.assign(state, { prod: 50, money: 50, env: 50, turn: 1, ended: false });
  render();
  setFeedback(null, "🌱",
    "Bem-vindo, agricultor. Tome decisões para manter sua fazenda próspera <strong>e</strong> sustentável.");
}

// Bind
document.querySelectorAll(".action").forEach(btn => {
  btn.addEventListener("click", () => tomarDecisao(btn.dataset.action));
});
$("reset").addEventListener("click", reset);

// Expor para compatibilidade
window.tomarDecisao = tomarDecisao;

render();
