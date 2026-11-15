// As tabelas do README. Nenhum numero deste projeto e digitado a mao.

import { jogadasDaFila } from './nucleo.js';
import {
  sequencia, valor, periodo, excecoes, perdedoras, aberturas, maiorValor,
  histograma,
} from './busca.js';
import { JogoDireto, custoDireto, octal, FAMILIA } from './juiz.js';

/** Ate onde a sequencia e calculada nas tabelas. */
export const ATE = 2000;

// A sequencia de 2.001 termos e pedida por cinco tabelas diferentes.
const guardado = new Map();
const umaVez = (ch, f) => {
  if (!guardado.has(ch)) guardado.set(ch, f());
  return guardado.get(ch);
};

export function tabela(ate = ATE) {
  return umaVez('seq:' + ate, () => sequencia(ate));
}

/** O periodo de Kayles, as excecoes e onde ele comeca. */
export function linhaPeriodo(ate = ATE) {
  return umaVez('per:' + ate, () => {
    const g = tabela(ate);
    const p = periodo(g);
    const ex = excecoes(g, p.periodo, p.inicio);
    return { ...p, excecoes: ex, quantasExcecoes: ex.length };
  });
}

/**
 * O bloco de 12 logo ANTES do inicio do periodo, contra o primeiro bloco
 * periodico. Se eles diferem em poucas casas, o periodo quase comecou
 * antes — e quantas casas e a medida disso.
 */
export function quaseComecouAntes(ate = ATE) {
  const g = tabela(ate);
  const { periodo: p, inicio } = linhaPeriodo(ate);
  const antes = g.slice(inicio - p, inicio);
  const depois = g.slice(inicio, inicio + p);
  const onde = [];
  for (let i = 0; i < p; i++) if (antes[i] !== depois[i]) onde.push(inicio - p + i);
  return { periodo: p, inicio, antes, depois, diferencas: onde.length, onde };
}

/** Quantas vezes cada valor de Grundy aparece, e os raros. */
export function linhaValores(ate = ATE) {
  const g = tabela(ate);
  const h = histograma(g);
  const onde = new Map();
  for (let n = 0; n < g.length; n++) {
    if (!onde.has(g[n])) onde.set(g[n], []);
    if (onde.get(g[n]).length < 8) onde.get(g[n]).push(n);
  }
  return {
    ate,
    histograma: h,
    maior: maiorValor(g),
    raros: h.filter((par) => par[1] <= 5).map((par) => ({
      valor: par[0], vezes: par[1], onde: onde.get(par[0]),
    })),
  };
}

/** Em quais n uma fila unica perde: os zeros da sequencia. */
export function linhaPerdedoras(ate = ATE) {
  return { ate, perdedoras: perdedoras(tabela(ate)) };
}

/** As aberturas de uma fila de n. */
export function linhaAberturas(n) {
  return aberturas(n, tabela());
}

/** A familia octal, com o periodo de cada um MEDIDO. */
export function linhaFamilia(ate = 2000) {
  return umaVez('fam:' + ate, () => FAMILIA.map((par) => {
    const g = octal(par[0], ate);
    const p = periodo(g);
    return {
      codigo: '.' + par[0],
      nome: par[1],
      ...p,
      quantasExcecoes: p.periodo === null ? null : excecoes(g, p.periodo, p.inicio).length,
      comeco: g.slice(0, 16),
    };
  }));
}

/** Kayles pelos pinos contra cada codigo octal: qual bate? */
export function qualCodigoEhKayles(ate = 200) {
  const k = sequencia(ate);
  const candidatos = ['77', '137', '07', '7', '17', '33', '3', '4'];
  return candidatos.map((cod) => ({
    codigo: '.' + cod,
    bate: octal(cod, ate).every((x, i) => x === k[i]),
  }));
}

/**
 * Dois jogos octais que sao o MESMO com um deslocamento: conta em quantas
 * casas eles divergem depois de deslocar.
 */
export function deslocamento(a, b, d, ate = 500) {
  const x = octal(a, ate);
  const y = octal(b, ate);
  let dif = 0;
  for (let i = 0; i + d < x.length; i++) if (x[i] !== y[i + d]) dif++;
  return { a: '.' + a, b: '.' + b, deslocamento: d, divergencias: dif, conferidoAte: ate - d };
}

/** O jogo direto contra a tabela de Grundy, em todas as posicoes pequenas. */
export function linhaJuizDireto(maximoDePinos = 18) {
  return umaVez('direto:' + maximoDePinos, () => {
    const g = tabela();
    const direto = new JogoDireto();
    let casos = 0;
    let divergencias = 0;
    for (let a = 0; a <= maximoDePinos; a++) {
      for (let b = 0; b <= a; b++) {
        for (let c = 0; c <= b; c++) {
          if (a + b + c === 0 || a + b + c > maximoDePinos) continue;
          casos++;
          if ((valor([a, b, c], g) !== 0) !== direto.ganha([a, b, c])) divergencias++;
        }
      }
    }
    return { maximoDePinos, casos, divergencias, nos: direto.nos };
  });
}

/** O preco de responder sem a tabela de Grundy. */
export function linhaCusto(n) {
  return umaVez('custo:' + n, () => {
    const c = custoDireto([n]);
    return { n, nosDoDireto: c.nos, entradasDeGrundy: n + 1, razao: c.nos / (n + 1) };
  });
}

export { jogadasDaFila };
