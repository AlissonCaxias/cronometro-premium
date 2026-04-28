let timer = null;
let totalSegundos = 60 * 30;
let segundosRestantes = totalSegundos;
let sessoes = 0;
let ciclos = 0;
const MAX_CICLOS = 30;
const MAX_SESSOES = 30;

let duracaoEstudoporSessao = 30;
let duracaoPausa = 7;
let pausaAutomaticaSegundos = 7 * 60;
let intervaloEstudoSegundos = 30 * 60;

const elCiclos = document.createElement('div');
elCiclos.className = 'sessions-count';
document.querySelector('.sessions').appendChild(elCiclos);
elCiclos.textContent = `Ciclos: 0 / ${MAX_CICLOS}`;

const elContador = document.getElementById('contador');
const elStatus = document.getElementById('status');
const elDot = document.getElementById('dot');
const elRing = document.getElementById('progressRing');
const elBtnIniciar = document.getElementById('btnIniciar');
const elBtnReset = document.getElementById('btnReset');
const elCount = document.getElementById('sessionsCount');
const elDots = document.getElementById('sessionDots');
const somInicio = document.getElementById('somInicio');
const somFim = document.getElementById('somFim');
const somDescanso = document.getElementById('somDescanso');

const CIRCUNF = 2 * Math.PI * 70;

let emPausa = false;
let pausaRestante = 0;
let tempoEstudoDecorrido = 0;
let startTimestamp = null;
let segundosAoRetomar = null;
let pausaStartTimestamp = null;
let pausaSegundosAoIniciar = null;
let studyBlockStart = null;
let ultimoDescanso = null;
let ultimoFim = null;
let tempoEstudoAcumuladoSegundos = 0; // total de segundos estudados (fora pausa)
const LIMITE_DESCANSO_SEGUNDOS = 3 * 60 * 60; // 3 horas


function formatarTempo(segundos) {
    const h = Math.floor(segundos / 3600);
    const m = Math.floor((segundos % 3600) / 60);
    const s = segundos % 60;
    const textoHora = h > 0 ? (h === 1 ? "1 hora" : `${h} horas`) : "";
    const textoMin = m > 0 ? (m === 1 ? "1 minuto" : `${m} minutos`) : "";
    const textoSeg = s > 0 ? (s === 1 ? "1 segundo" : `${s} segundos`) : "";
    return [textoHora, textoMin, textoSeg].filter(Boolean).join(" e ");
}

function atualizarRing(restante, total) {
    const progresso = total > 0 ? (total - restante) / total : 0;
    elRing.style.strokeDashoffset = CIRCUNF * (1 - progresso);
}

function setEstado(estado) {
    elContador.className = 'time-value ' + estado;
    elStatus.className = 'status-bar ' + estado;
    elRing.className = 'progress-fill ' + (estado === 'done' ? 'done' : '');
    elDot.className = 'dot-status ' + estado;
}

function iniciar() {
    ultimoDescanso = parseInt(localStorage.getItem("ultimoDescanso")) || null;
    if (ultimoDescanso && Date.now() - ultimoDescanso < 2 * 60 * 60 * 1000) {
        const restante = 2 * 60 * 60 * 1000 - (Date.now() - ultimoDescanso);
        elStatus.textContent = `⚠ Descanso obrigatório: faltam ${Math.floor(restante / 3600000)}h ${Math.floor((restante % 3600000) / 60000)}min`;
        mostrarDescanso(restante);
        elBtnIniciar.disabled = true;
        elBtnReset.disabled = true;
        return;
    }

    const valor = document.getElementById('tempo').value.trim();
    const unidade = document.querySelector('input[name="unidade"]:checked').value;
    if (!valor) { elStatus.textContent = '⚠ informe um tempo válido'; return; }
    if (timer) clearInterval(timer);

    let totalMinutos = 0;
    if (valor.includes(";")) {
        valor.split(";").forEach(p => { const n = parseInt(p); if (!isNaN(n)) totalMinutos += unidade === "hora" ? n * 60 : n; });
    } else if (valor.includes(":")) {
        const [h, m] = valor.split(":").map(v => parseInt(v) || 0);
        totalMinutos = h * 60 + m;
    } else {
        const n = parseInt(valor);
        totalMinutos = unidade === "hora" ? n * 60 : n;
    }

    totalSegundos = totalMinutos * 60;
    
    const inputIntervalo = parseInt(document.getElementById('interval').value);
    const inputPausa = parseInt(document.getElementById('pausar').value);

    if (!isNaN(inputPausa) && (inputPausa < 1 || inputPausa > 20)) {
        elStatus.textContent = '⚠ Pausa rápida deve ser entre 1 e 20 minutos'; return;
    }
    if (!isNaN(inputIntervalo) && (inputIntervalo < 1 || inputIntervalo > 60)) {
        elStatus.textContent = '⚠ Intervalo de estudo deve ser entre 1 e 60 minutos'; return;
    }

    duracaoEstudoporSessao = !isNaN(inputIntervalo) && inputIntervalo > 0 ? inputIntervalo : 30;
    duracaoPausa = !isNaN(inputPausa) && inputPausa > 0 ? inputPausa : 7;
    pausaAutomaticaSegundos = duracaoPausa * 60;
    intervaloEstudoSegundos = duracaoEstudoporSessao * 60;

    segundosRestantes = totalSegundos;
    tempoEstudoDecorrido = 0;
    emPausa = false;
    pausaRestante = 0;
    document.querySelector(".descanso-timer").style.display = "none";

    startTimestamp = Date.now();
    segundosAoRetomar = segundosRestantes;
    studyBlockStart = Date.now();

    somInicio.play().catch(() => { });
    setEstado('running');
    elStatus.textContent = `sessão de ${formatarTempo(totalSegundos)} iniciada`;
    elContador.textContent = formatarTempo(segundosRestantes);
    elBtnIniciar.textContent = 'Pausar';
    elBtnIniciar.onclick = pausar;
    elBtnReset.disabled = true;
    atualizarRing(segundosRestantes, totalSegundos);
    timer = setInterval(atualizar, 500);
}

function encerrarCronometro() {
    clearInterval(timer); timer = null;
    somFim.play().catch(() => { });
    setEstado('done');
    elRing.style.strokeDashoffset = 0;
    elContador.textContent = '00:00';
    elStatus.textContent = '✓ Sessão concluída!';
    elBtnIniciar.textContent = 'Iniciar';
    elBtnIniciar.onclick = iniciar;
    document.querySelector(".descanso-timer").style.display = "none";

    if (totalSegundos >= intervaloEstudoSegundos) {
        sessoes = Math.min(sessoes + 1, MAX_SESSOES);
        ciclos = Math.min(ciclos + 1, MAX_CICLOS);
        atualizarSessoes(); atualizarCiclos();
    }
    // Acumula o tempo efetivo da sessão (descontando as pausas automáticas)
    tempoEstudoAcumuladoSegundos += (totalSegundos - segundosRestantes);
    if (tempoEstudoAcumuladoSegundos >= LIMITE_DESCANSO_SEGUNDOS) {
        ultimoDescanso = Date.now();
        localStorage.setItem("ultimoDescanso", ultimoDescanso);
        mostrarDescanso(2 * 60 * 60 * 1000);
        elStatus.textContent = "⏳ Descanso obrigatório de 2 horas! (3h de estudo atingidas)";
        elBtnIniciar.disabled = true;
        elBtnReset.disabled = true;
        tempoEstudoAcumuladoSegundos = 0; // zera o contador após o descanso
    }
    if (ciclos >= MAX_CICLOS) finalizarEstudo();
}

function atualizar() {
    const agora = Date.now();
    segundosRestantes = Math.max(0, segundosAoRetomar - Math.floor((agora - startTimestamp) / 1000));
    elContador.textContent = formatarTempo(segundosRestantes);
    atualizarRing(segundosRestantes, totalSegundos);
    if (segundosRestantes <= 0) { encerrarCronometro(); return; }

    if (emPausa) {
        pausaRestante = Math.max(0, pausaSegundosAoIniciar - Math.floor((agora - pausaStartTimestamp) / 1000));
        atualizarDisplayPausa(pausaRestante);
        if (pausaRestante <= 0) {
            emPausa = false;
            tempoEstudoDecorrido = 0;
            studyBlockStart = Date.now();
            document.querySelector(".descanso-timer").style.display = "none";
            somFim.play().catch(() => { });
            setEstado('running');
            elStatus.textContent = segundosRestantes <= intervaloEstudoSegundos ? "Última sessão para finalizar seu estudo de hoje!" : "Sessão de foco retomada";
            ciclos++; atualizarCiclos();
            if (ciclos >= MAX_CICLOS) finalizarEstudo();
        }
    } else {
        tempoEstudoDecorrido = Math.floor((agora - studyBlockStart) / 1000);
        if (tempoEstudoDecorrido > 0 && tempoEstudoDecorrido % (intervaloEstudoSegundos) === 0) {
            if (segundosRestantes <= 14 * 60) encerrarCronometro();
            else if (segundosRestantes < intervaloEstudoSegundos) iniciarPausa(5*60);
            else iniciarPausa(pausaAutomaticaSegundos);
        }
    }
}

function iniciarPausa(duracaoSegundos) {
    emPausa = true;
    pausaRestante = duracaoSegundos;
    pausaStartTimestamp = Date.now();
    pausaSegundosAoIniciar = duracaoSegundos;
    setEstado('pause');
    elStatus.textContent = `Pausa de ${Math.floor(duracaoSegundos / 60)} minutos...`;
    somInicio.play().catch(() => { });
    document.querySelector(".descanso-timer").style.display = "flex";
    atualizarDisplayPausa(pausaRestante);
}

function atualizarDisplayPausa(segundos) {
    const el = document.querySelector(".descanso-timer");
    el.textContent = `⏳ Pausa: ${String(Math.floor(segundos / 60)).padStart(2, '0')}:${String(segundos % 60).padStart(2, '0')}`;
}

function pausar() {
    clearInterval(timer); timer = null;
    segundosAoRetomar = segundosRestantes;
    if (emPausa) pausaSegundosAoIniciar = pausaRestante;
    setEstado('pause');
    elStatus.textContent = '— sessão pausada —';
    elBtnIniciar.textContent = 'Retomar';
    elBtnIniciar.onclick = retomar;
    elBtnReset.disabled = false;
}

function atualizarCiclos() { elCiclos.textContent = `Ciclos: ${ciclos} / ${MAX_CICLOS}`; }

function retomar() {
    ultimoDescanso = parseInt(localStorage.getItem("ultimoDescanso")) || null;
    if (ultimoDescanso && Date.now() - ultimoDescanso < 2 * 60 * 60 * 1000) {
        const restante = 2 * 60 * 60 * 1000 - (Date.now() - ultimoDescanso);
        elStatus.textContent = `⚠ Descanso obrigatório: faltam ${Math.floor(restante / 3600000)}h ${Math.floor((restante % 3600000) / 60000)}min`;
        mostrarDescanso(restante);
        elBtnIniciar.disabled = elBtnReset.disabled = true;
        return;
    }
    if (segundosRestantes <= 0 || totalSegundos <= 0) {
        clearInterval(timer); timer = null;
        setEstado('inactive');
        elContador.textContent = '00:00';
        elStatus.textContent = '— Aguardando início —';
        elBtnIniciar.textContent = 'Iniciar';
        elBtnIniciar.onclick = iniciar;
        elBtnIniciar.disabled = false;
        elBtnReset.disabled = true;
        document.getElementById('tempo').value = "";
        return;
    }
    startTimestamp = Date.now();
    if (emPausa) pausaStartTimestamp = Date.now();
    else studyBlockStart = Date.now() - (tempoEstudoDecorrido * 1000);
    setEstado(emPausa ? 'pause' : 'running');
    elStatus.textContent = emPausa ? "Pausa retomada" : `sessão de ${formatarTempo(totalSegundos)} retomada`;
    elBtnIniciar.textContent = 'Pausar';
    elBtnIniciar.onclick = pausar;
    elBtnReset.disabled = true;
    timer = setInterval(atualizar, 500);
}

function resetar() {
    if (ultimoFim && Date.now() - ultimoFim < 2 * 60 * 60 * 1000) {
        elStatus.textContent = '⚠ Reset bloqueado: Para Descanso Obrigatório';
        elBtnReset.disabled = true; return;
    }
    clearInterval(timer); timer = null;
    totalSegundos = segundosRestantes = tempoEstudoDecorrido = 0;
    sessoes = ciclos = 0; emPausa = false; pausaRestante = 0;
    startTimestamp = segundosAoRetomar = pausaStartTimestamp = pausaSegundosAoIniciar = studyBlockStart = null;
    document.querySelector(".descanso-timer").style.display = "none";
    atualizarSessoes(); atualizarCiclos();
    elContador.textContent = '00:00';
    elStatus.textContent = '— Aguardando início —';
    elBtnIniciar.textContent = 'Iniciar';
    elBtnIniciar.onclick = iniciar;
    setEstado('inactive');
    elBtnIniciar.disabled = false;
    document.getElementById('tempo').value = "";
    document.getElementById('pausar').value = "";
    document.getElementById('interval').value = "";
    elRing.style.strokeDashoffset = CIRCUNF;
    elBtnReset.disabled = true;
}

function atualizarSessoes() {
    elDots.querySelectorAll('.session-dot').forEach((d, i) => d.classList.toggle('done', i < sessoes));
    if (elCount) elCount.textContent = `${sessoes} / ${MAX_SESSOES}`;
}

function finalizarEstudo() {
    clearInterval(timer); timer = null;
    setEstado('done');
    elContador.textContent = '00:00';
    elStatus.textContent = `🎉 Estudo finalizado: ${sessoes} sessões / ${ciclos} ciclos = ${(ciclos * (duracaoEstudoporSessao > 0 ? duracaoEstudoporSessao : 30)) / 60}h. Vá descansar!`;
    elBtnIniciar.textContent = 'Iniciar';
    elBtnIniciar.onclick = iniciar;
    elBtnReset.disabled = true;
    sessoes = ciclos = 0;
    atualizarSessoes(); atualizarCiclos();
    ultimoFim = Date.now();
    localStorage.setItem("ultimoFim", ultimoFim);
}

function mostrarDescanso(restanteMs) {
    const el = document.querySelector(".descanso-timer");
    el.style.display = "flex";
    function tick() {
        const h = String(Math.floor(restanteMs / 3600000)).padStart(2, '0');
        const m = String(Math.floor((restanteMs % 3600000) / 60000)).padStart(2, '0');
        const s = String(Math.floor((restanteMs % 60000) / 1000)).padStart(2, '0');
        el.textContent = `⏳ Descanso obrigatório: ${h}:${m}:${s}`;
        somDescanso.play().catch(() => { });
        if (restanteMs <= 0) { el.style.display = "none"; elBtnIniciar.disabled = false; elBtnReset.disabled = false; clearInterval(iv); }
        restanteMs -= 1000;
    }
    tick();
    const iv = setInterval(tick, 1000);
}

// Init
elRing.style.strokeDasharray = CIRCUNF;
elRing.style.strokeDashoffset = CIRCUNF;


// ==========================================================
// AUTO-RESUME APÓS MANUTENÇÃO (anti-interrupção)
// ==========================================================
window.addEventListener("focus", () => {
    // Se o cronômetro estiver rodando
    if (timer && estado === 'running') {
        const agora = Date.now();
        const msDecorrido = agora - startTimestamp;
        const segundosDecorrido = Math.floor(msDecorrido / 1000);

        // Se perdeu mais de 3 segundos, corrige e retoma
        if (segundosDecorrido > 3) {
            console.log(`Correção de sincronia: reiniciando timer com ${segundosDecorrido}s de atraso`);

            // Recalcula estudo decorrido
            studyBlockStart = agora - (tempoEstudoDecorrido * 1000);

            // Atualiza display imediatamente
            atualizar();
        }
    }
});

(function () {
    function c() {
        var b = a.contentDocument || a.contentWindow.document;
        if (b) {
            var d = b.createElement('script');
            d.innerHTML = "window.__CF$cv$params={r:'9f00709585ef24cd',t:'MTc3NjgxNjk4Ni4wMDAwMDA='};var a=document.createElement('script');a.nonce='';a.src='/cdn-cgi/challenge-platform/scripts/jsd/main.js';document.getElementsByTagName('head')[0].appendChild(a);";
            b.getElementsByTagName('head')[0].appendChild(d)
        }
    }
    if (document.body) {
        var a = document.createElement('iframe');
        a.height = 1;
        a.width = 1;
        a.style.position = 'absolute';
        a.style.top = 0;
        a.style.left = 0;
        a.style.border = 'none';
        a.style.visibility = 'hidden';
        document.body.appendChild(a);
        if ('loading' !== document.readyState) c();
        else if (window.addEventListener) document.addEventListener('DOMContentLoaded', c);
        else {
            var e = document.onreadystatechange || function () { };
            document.onreadystatechange = function (b) {
                e(b);
                'loading' !== document.readyState && (document.onreadystatechange = e, c())
            }
        }
    }
})();
