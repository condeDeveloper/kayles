// A varredura: a sequencia de Grundy de Kayles, e a procura do periodo.
//
// Uma fila de n pinos vale um numero — o valor de Grundy — e uma posicao
// com varias filas vale o XOR dos valores delas. Entao a tabela de uma
// fila so resolve o jogo inteiro, e e essa tabela que este arquivo
// calcula, de n = 0 ate onde se pedir.

import { jogadasDaFila, mex } from './nucleo.js';

/**
 * A sequencia de Grundy de Kayles, de 0 ate `ate`.
 *
 * G(n) = mex sobre todas as jogadas de G(a) XOR G(b), com [a, b] o que
 * sobra depois de derrubar. Cada valor usa so os anteriores, entao uma
 * passagem basta.
 */
export function sequencia(ate) {
  const g = new Array(ate + 1).fill(0);
  for (let n = 1; n <= ate; n++) {
    const vistos = new Set();
    for (let i = 0; i <= n - 1; i++) vistos.add(g[i] ^ g[n - 1 - i]);
    for (let i = 0; i <= n - 2; i++) vistos.add(g[i] ^ g[n - 2 - i]);
    g[n] = mex(vistos);
  }
  return g;
}

/** O valor de Grundy de uma posicao com varias filas: o XOR das filas. */
export function valor(filas, g) {
  let fora = 0;
  for (const x of filas) fora ^= g[x];
  return fora;
}

/**
 * Procura periodo: o menor p tal que, a partir de algum inicio, a
 * sequencia se repete ate o fim do que foi calculado. Exige
 * `repeticoesMinimas` voltas inteiras, para nao chamar de periodo uma
 * coincidencia curta no fim da tabela.
 *
 * Isto NAO e prova de periodicidade eterna: e o que foi medido, e a tabela
 * diz ate onde.
 */
export function periodo(g, repeticoesMinimas = 3) {
  const fim = g.length - 1;
  for (let p = 1; p <= Math.floor(fim / (repeticoesMinimas + 1)); p++) {
    for (let inicio = 0; inicio + p * (repeticoesMinimas + 1) <= fim; inicio++) {
      let vale = true;
      for (let i = inicio; i + p <= fim; i++) {
        if (g[i] !== g[i + p]) { vale = false; break; }
      }
      if (vale) return { periodo: p, inicio, conferidoAte: fim };
    }
  }
  return { periodo: null, inicio: null, conferidoAte: fim };
}

/**
 * As EXCECOES: os n menores que o inicio do periodo que ja teriam o valor
 * certo se o periodo valesse desde cedo, e os que nao teriam. A conta so
 * faz sentido depois que o periodo foi achado.
 */
export function excecoes(g, p, inicio) {
  const fora = [];
  for (let n = 0; n < inicio; n++) {
    if (n + p <= g.length - 1 && g[n] !== g[n + p]) fora.push(n);
  }
  return fora;
}

/** Os n em que o primeiro jogador PERDE: valor de Grundy zero. */
export function perdedoras(g) {
  const fora = [];
  for (let n = 0; n < g.length; n++) if (g[n] === 0) fora.push(n);
  return fora;
}

/** Quantas primeiras jogadas ganham numa fila de n. */
export function aberturas(n, g) {
  let total = 0;
  let ganham = 0;
  for (const [a, b] of jogadasDaFila(n)) {
    total++;
    if ((g[a] ^ g[b]) === 0) ganham++;
  }
  return { n, total, ganham };
}

/** O maior valor de Grundy que aparece ate `ate`, e onde. */
export function maiorValor(g) {
  let maior = -1;
  let onde = -1;
  for (let n = 0; n < g.length; n++) if (g[n] > maior) { maior = g[n]; onde = n; }
  return { maior, onde };
}

/** Quantas vezes cada valor aparece. */
export function histograma(g) {
  const conta = new Map();
  for (const v of g) conta.set(v, (conta.get(v) || 0) + 1);
  return [...conta.entries()].sort((a, b) => a[0] - b[0]);
}
