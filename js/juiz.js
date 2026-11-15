// Os juizes. Dois, e nenhum deles conhece a palavra "Grundy".
//
// 1. O JOGO DIRETO. Um negamax sobre a POSICAO INTEIRA — a lista de filas
//    — que so responde ganha ou perde. Ele nao soma jogos, nao faz XOR e
//    nao tem tabela de fila: visita a posicao toda. Se "Grundy diferente
//    de zero" e "o primeiro ganha" discordarem numa so posicao, uma das
//    duas coisas esta errada.
//
// 2. O MOTOR OCTAL GENERICO. Kayles tem um nome fora de Kayles: e o jogo
//    octal .137. Um solucionador de jogo octal escrito do zero, que recebe
//    os digitos e nao sabe o que e pino, tem que devolver exatamente a
//    mesma sequencia. De quebra, ele da os outros jogos da familia de
//    graca, e os periodos deles entram na mesma tabela.

import { arruma, chave, jogadas, acabou, mex } from './nucleo.js';

/* ------------------------------------------------------- 1. o jogo direto */

export class JogoDireto {
  constructor() {
    this.memoria = new Map();
    this.nos = 0;
  }

  /** true se quem esta na vez GANHA. */
  ganha(filas) {
    const base = arruma(filas);
    const c = chave(base);
    const pronto = this.memoria.get(c);
    if (pronto !== undefined) return pronto;
    this.nos++;
    if (acabou(base)) { this.memoria.set(c, false); return false; }
    let fora = false;
    for (const prox of jogadas(base)) {
      if (!this.ganha(prox)) { fora = true; break; }
    }
    this.memoria.set(c, fora);
    return fora;
  }
}

export function quemGanha(filas) {
  return new JogoDireto().ganha(filas) ? 'primeiro' : 'segundo';
}

export function custoDireto(filas) {
  const j = new JogoDireto();
  const g = j.ganha(filas);
  return { ganha: g, nos: j.nos, memoria: j.memoria.size };
}

/* ----------------------------------------------------- 2. o motor octal */

/**
 * Um jogo octal e descrito por digitos d1 d2 d3..., um por numero de pecas
 * removidas. O digito e lido em binario:
 *   bit 0 (valor 1): pode deixar NADA, ou seja, so se a fila acabar;
 *   bit 1 (valor 2): pode deixar UMA fila;
 *   bit 2 (valor 4): pode deixar DUAS filas.
 *
 * Este motor nao decide qual codigo e Kayles: ele recebe os digitos e
 * obedece. Eu escrevi aqui, antes de rodar, que Kayles era o .137 — e
 * .137 e o XADREZ DE DAWSON. A comparacao com a busca pelos pinos e que
 * apontou o .77, que e o unico codigo da lista a bater termo a termo.
 */
export function octal(digitos, ate) {
  const d = digitos.split('').map((x) => parseInt(x, 10));
  const g = new Array(ate + 1).fill(0);
  for (let n = 1; n <= ate; n++) {
    const vistos = new Set();
    for (let k = 1; k <= Math.min(d.length, n); k++) {
      const bits = d[k - 1];
      const resto = n - k;
      if ((bits & 1) && resto === 0) vistos.add(0);
      if (bits & 2) {
        if (resto > 0) vistos.add(g[resto]);
      }
      if (bits & 4) {
        for (let a = 1; a <= resto - 1; a++) vistos.add(g[a] ^ g[resto - a]);
      }
    }
    g[n] = mex(vistos);
  }
  return g;
}

/** Os jogos octais da familia, para a tabela de periodos. */
export const FAMILIA = [
  ['77', 'Kayles'],
  ['137', 'xadrez de Dawson'],
  ['07', 'Kayles de Dawson'],
  ['4', 'so partir em duas, sem tirar nada'],
  ['17', 'Mock Turtles curto'],
  ['33', 'tirar uma ou duas pecas de uma ponta'],
  ['7', 'tirar uma peca de onde quiser'],
];
