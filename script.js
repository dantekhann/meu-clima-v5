const weatherConfig = {
  0: { label: "Céu Limpo", icon: "☀️", color: "#00d2ff" },
  1: { label: "Quase Limpo", icon: "🌤️", color: "#00d2ff" },
  2: { label: "Parcialmente Nublado", icon: "⛅", color: "#00d2ff" },
  3: { label: "Nublado", icon: "☁️", color: "#00d2ff" },
  45: { label: "Névoa", icon: "🌫️", color: "#a8a8b3" },
  61: { label: "Chuva Fraca", icon: "🌧️", color: "#00d2ff" },
  80: { label: "Pancadas", icon: "🌦️", color: "#00d2ff" },
};

const EXPIRATION_TIME = 60 * 60 * 1000; // Cache de 1 Hora
let unidadeAtual = "C"; // Estado global da unidade

// Inicialização
document.addEventListener("DOMContentLoaded", carregarMemoriaComFiltro);

document.getElementById("cidadeInput").addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    buscarClimaReal();
  }
});

// --- LÓGICA DE BUSCA E GEOLOCALIZAÇÃO ---
async function buscarClimaReal() {
  const input = document.getElementById("cidadeInput");
  const notificacao = document.getElementById("notificacao-container");

  let busca = input.value
    .replace(/[^\p{L}\p{N}\s-]/gu, "")
    .trim()
    .replace(/\s+/g, " ");

  if (!busca) return;

  notificacao.innerHTML = `<p style="color: #a8a8b3">Localizando...</p>`;

  try {
    let geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(busca)}&count=10&language=pt&format=json`;
    let geoRes = await fetch(geoUrl);
    let geoData = await geoRes.json();

    if (
      (!geoData.results || geoData.results.length === 0) &&
      busca.includes("-")
    ) {
      const resAlt = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(busca.replace(/-/g, " "))}&count=10&language=pt&format=json`,
      );
      geoData = await resAlt.json();
    }

    if (!geoData.results || geoData.results.length === 0)
      throw new Error("Localidade não encontrada.");

    notificacao.innerHTML = '<div class="lista-selecao"></div>';
    const lista = notificacao.querySelector(".lista-selecao");

    geoData.results.forEach((local) => {
      const item = document.createElement("div");
      item.className = "item-local";
      const infoTexto = `${local.admin1 ? local.admin1 + ", " : ""}${local.country}`;
      item.innerHTML = `<strong>${local.name}</strong> <br> <small style="color:#666">${infoTexto}</small>`;

      item.onclick = () => {
        salvarCidadeNaMemoria(local);
        adicionarCardAoGrid(local);
        notificacao.innerHTML = "";
        input.value = "";
      };
      lista.appendChild(item);
    });
  } catch (e) {
    notificacao.innerHTML = `<p style="color: #ff5555">${e.message}</p>`;
  }
}

// --- LÓGICA DE UNIDADE (C/F) ---
function alternarUnidade() {
  unidadeAtual = unidadeAtual === "C" ? "F" : "C";
  const btn = document.getElementById("btnAlternarUnidade");
  btn.innerText = `Mudar para °${unidadeAtual === "C" ? "F" : "C"}`;

  // Atualiza o texto de todos os cards na tela
  const cards = document.querySelectorAll(".weather-box");
  cards.forEach((card) => {
    const tempC = parseFloat(card.getAttribute("data-temp-c"));
    const displayTemp = card.querySelector(".temp-grande");
    displayTemp.innerText = `${converterValor(tempC)}°${unidadeAtual}`;
  });
}

function converterValor(celsius) {
  if (unidadeAtual === "F") {
    return Math.round((celsius * 9) / 5 + 32);
  }
  return Math.round(celsius);
}

// --- LÓGICA DE MEMÓRIA (LOCALSTORAGE) ---
function salvarCidadeNaMemoria(local) {
  let salvas = JSON.parse(localStorage.getItem("climaHub_data")) || [];
  const cidadeComTempo = { ...local, timestamp: new Date().getTime() };

  salvas = salvas.filter(
    (c) => c.latitude !== local.latitude || c.longitude !== local.longitude,
  );
  salvas.push(cidadeComTempo);
  localStorage.setItem("climaHub_data", JSON.stringify(salvas));
  atualizarVisibilidadeControles();
}

function carregarMemoriaComFiltro() {
  let salvas = JSON.parse(localStorage.getItem("climaHub_data")) || [];
  const agora = new Date().getTime();

  const validas = salvas.filter((c) => agora - c.timestamp < EXPIRATION_TIME);
  localStorage.setItem("climaHub_data", JSON.stringify(validas));

  validas.forEach((local) => adicionarCardAoGrid(local));
  atualizarVisibilidadeControles();
}

function removerDaMemoria(lat, lon, elementoCard) {
  let salvas = JSON.parse(localStorage.getItem("climaHub_data")) || [];
  salvas = salvas.filter((c) => c.latitude !== lat || c.longitude !== lon);
  localStorage.setItem("climaHub_data", JSON.stringify(salvas));
  elementoCard.remove();
  atualizarVisibilidadeControles();
}

function limparTodaMemoria() {
  localStorage.removeItem("climaHub_data");
  document.getElementById("weather-container").innerHTML = "";
  atualizarVisibilidadeControles();
}

function atualizarVisibilidadeControles() {
    const btnLimpar = document.getElementById("btnLimparTudo");
    const containerMetrica = document.querySelector(".toggle-container");
    const salvas = JSON.parse(localStorage.getItem("climaHub_data")) || [];
    
    if (salvas.length > 0) {
        btnLimpar.style.display = "inline-block";
        containerMetrica.style.display = "block";
    } else {
        btnLimpar.style.display = "none";
        containerMetrica.style.display = "none";
    }
}

// --- RENDERIZAÇÃO DO CARD ---
async function adicionarCardAoGrid(local) {
  const container = document.getElementById("weather-container");
  try {
    const res = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${local.latitude}&longitude=${local.longitude}&current_weather=true`,
    );
    const clm = await res.json();
    const data = clm.current_weather;

    const config = weatherConfig[data.weathercode] || {
      label: "Estável",
      icon: "🌤️",
      color: "#00d2ff",
    };
    const emojiEstado = data.is_day === 1 ? "☀️" : "🌙";
    const subLocal = `${local.admin1 ? local.admin1 + ", " : ""}${local.country}`;

    const card = document.createElement("div");
    card.className = "weather-box";
    card.style.borderTop = `5px solid ${config.color}`;

    // Atributo crucial para o conversor funcionar sem perder precisão
    card.setAttribute("data-temp-c", data.temperature);

    // AQUI ESTÁ A INVERSÃO SOLICITADA: Temperatura em cima, Lua embaixo
    card.innerHTML = `
            <button class="btn-fechar" onclick="removerDaMemoria(${local.latitude}, ${local.longitude}, this.parentElement)">✕</button>
            <h2 style="margin: 0;">${local.name}</h2>
            <p class="local-info">${subLocal}</p>
            
            <div class="temp-grande" style="color: ${config.color}">${converterValor(data.temperature)}°${unidadeAtual}</div>
            
            <div style="font-size: 1.8rem; margin: 15px 0;">${emojiEstado}</div>
            
            <p style="font-weight: bold;">${config.label} ${config.icon}</p>
            <p class="vento-texto">Vento: ${data.windspeed} km/h</p>
        `;

    container.appendChild(card);
  } catch (e) {
    console.error("Erro ao carregar clima.");
  }
}
