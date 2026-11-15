// A pagina. A fila de pinos e os buracos; o computador responde pela
// mesma tabela de Grundy que os testes usam.

import { arruma, pinos, jogadas } from './nucleo.js';
import { sequencia, valor } from './busca.js';

const pista = document.getElementById('pista');
const recado = document.getElementById('recado');
const placar = document.getElementById('placar');
const campo = document.getElementById('quantos');
const btNovo = document.getElementById('novo');
const btDica = document.getElementById('dica');

const G = sequencia(80);

let total = 14;
let derrubados = new Set();
let suaVez = true;
let primeiro = null;   // o primeiro pino marcado nesta jogada
let acabou = false;

/** As filas de pinos em pe, da esquerda para a direita. */
function filas() {
  const fora = [];
  let atual = 0;
  for (let i = 0; i < total; i++) {
    if (derrubados.has(i)) {
      if (atual > 0) fora.push(atual);
      atual = 0;
    } else atual++;
  }
  if (atual > 0) fora.push(atual);
  return arruma(fora);
}

function desenha() {
  pista.replaceChildren();
  for (let i = 0; i < total; i++) {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'pino' + (derrubados.has(i) ? ' caido' : '') + (primeiro === i ? ' marcado' : '');
    b.disabled = derrubados.has(i) || acabou || !suaVez;
    b.setAttribute('aria-label', 'pino ' + (i + 1) + (derrubados.has(i) ? ', derrubado' : ''));
    b.addEventListener('click', () => clique(i));
    pista.append(b);
  }
}

function clique(i) {
  if (primeiro === null) {
    primeiro = i;
    desenha();
    recado.textContent = 'Clique no mesmo pino para derrubar so ele, ou no vizinho para derrubar os dois.';
    return;
  }
  if (primeiro === i) {
    derruba([i]);
  } else if (Math.abs(primeiro - i) === 1) {
    derruba([primeiro, i]);
  } else {
    primeiro = i;
    desenha();
    return;
  }
}

function derruba(quais) {
  for (const q of quais) derrubados.add(q);
  primeiro = null;
  suaVez = false;
  atualiza();
  setTimeout(responde, 240);
}

function responde() {
  const f = filas();
  if (f.length === 0) {
    acabou = true;
    recado.innerHTML = '<span class="ok">Voce ganhou.</span> O computador ficou sem pino para derrubar.';
    suaVez = true;
    desenha();
    return;
  }
  // Procura, pino a pino, uma jogada que deixe Grundy zero.
  let melhor = null;
  for (let i = 0; i < total && melhor === null; i++) {
    if (derrubados.has(i)) continue;
    for (const quais of [[i], [i, i + 1]]) {
      if (quais.some((q) => q >= total || derrubados.has(q))) continue;
      const antes = new Set(derrubados);
      for (const q of quais) derrubados.add(q);
      if (valor(filas(), G) === 0) { melhor = quais; }
      derrubados = antes;
      if (melhor) break;
    }
  }
  if (melhor === null) {
    // ja esta perdido: derruba o primeiro que achar
    for (let i = 0; i < total; i++) if (!derrubados.has(i)) { melhor = [i]; break; }
  }
  for (const q of melhor) derrubados.add(q);
  suaVez = true;
  atualiza();
}

function atualiza() {
  desenha();
  const f = filas();
  if (suaVez && f.length === 0 && !acabou) {
    acabou = true;
    recado.innerHTML = '<span class="aviso">Voce perdeu.</span> Nao sobrou pino nenhum para derrubar.';
  } else if (!acabou) {
    recado.textContent = suaVez ? 'Sua vez: derrube um pino, ou dois vizinhos.' : 'Pensando...';
  }
  const g = valor(f, G);
  placar.innerHTML =
    '<strong>' + pinos(f) + '</strong> pinos em pe · ' +
    '<strong>' + f.length + '</strong> ' + (f.length === 1 ? 'fila' : 'filas') +
    (f.length ? ' de ' + f.join(' e ') : '') +
    ' · Grundy <strong>' + g + '</strong> (' +
    (g === 0 ? 'quem vai jogar perde' : 'quem vai jogar ganha') + ')';
}

btNovo.addEventListener('click', () => {
  total = Math.max(1, Math.min(40, Number(campo.value) || 14));
  derrubados = new Set();
  primeiro = null;
  suaVez = true;
  acabou = false;
  atualiza();
});

btDica.addEventListener('click', () => {
  const f = filas();
  const g = valor(f, G);
  recado.innerHTML = g === 0
    ? 'A posicao vale <strong>0</strong>: quem joga agora — voce — perde com jogo certo. Nao ha dica honesta.'
    : 'A posicao vale <strong>' + g + '</strong>: existe jogada que leva a zero. ' +
      'De ' + jogadas(f).length + ' posicoes possiveis, as que ganham sao as que zeram o XOR.';
});

campo.addEventListener('change', () => btNovo.click());

atualiza();
