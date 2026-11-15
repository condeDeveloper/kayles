import test from 'node:test';
import assert from 'node:assert/strict';

import {
  ATE, tabela, linhaPeriodo, quaseComecouAntes, linhaValores, linhaPerdedoras,
  linhaAberturas, linhaFamilia, qualCodigoEhKayles, deslocamento,
  linhaJuizDireto, linhaCusto,
} from '../js/medidas.js';

// Os numeros do README, presos.

const MINUTOS = 10 * 60 * 1000;

/* ------------------------------------------------------------- o periodo */

test('o periodo de Kayles e 12, a partir de n = 71, conferido ate 2.000', { timeout: MINUTOS }, () => {
  assert.equal(ATE, 2000);
  const p = linhaPeriodo();
  assert.equal(p.periodo, 12);
  assert.equal(p.inicio, 71);
  assert.equal(p.conferidoAte, 2000);
});

test('abaixo do inicio, 16 valores nao obedecem o periodo', { timeout: MINUTOS }, () => {
  const p = linhaPeriodo();
  assert.equal(p.quantasExcecoes, 16);
  assert.deepEqual(p.excecoes,
    [0, 3, 10, 11, 15, 16, 18, 21, 27, 28, 34, 39, 45, 57, 58, 70]);
});

test('o periodo quase comecou doze casas antes: falta um termo so', { timeout: MINUTOS }, () => {
  const q = quaseComecouAntes();
  assert.equal(q.periodo, 12);
  assert.equal(q.inicio, 71);
  assert.equal(q.diferencas, 1);
  assert.deepEqual(q.onde, [70]);
  assert.deepEqual(q.antes, [7, 4, 1, 2, 8, 1, 4, 7, 2, 1, 8, 6]);
  assert.deepEqual(q.depois, [7, 4, 1, 2, 8, 1, 4, 7, 2, 1, 8, 2]);
});

/* ------------------------------------------------------------- os valores */

test('uma fila unica NUNCA e perdedora, tirando a fila vazia', { timeout: MINUTOS }, () => {
  const p = linhaPerdedoras();
  assert.deepEqual(p.perdedoras, [0]);
  assert.equal(p.ate, 2000);
});

test('so nove valores diferentes aparecem em 2.001 termos', { timeout: MINUTOS }, () => {
  const v = linhaValores();
  assert.deepEqual(v.histograma,
    [[0, 1], [1, 500], [2, 497], [3, 4], [4, 336], [5, 1], [6, 4], [7, 331], [8, 327]]);
  assert.equal(v.maior.maior, 8);
  assert.equal(v.maior.onde, 27);
});

test('o valor 5 aparece UMA vez em 2.001 termos, em n = 28', { timeout: MINUTOS }, () => {
  const v = linhaValores();
  const cinco = v.raros.find((r) => r.valor === 5);
  assert.equal(cinco.vezes, 1);
  assert.deepEqual(cinco.onde, [28]);
  const tres = v.raros.find((r) => r.valor === 3);
  assert.deepEqual(tres.onde, [3, 6, 18, 39]);
  const seis = v.raros.find((r) => r.valor === 6);
  assert.deepEqual(seis.onde, [11, 22, 34, 70]);
});

test('os tres valores raros so aparecem antes do periodo comecar', { timeout: MINUTOS }, () => {
  const v = linhaValores();
  const inicio = linhaPeriodo().inicio;
  for (const r of v.raros) {
    if (r.valor === 0) continue;
    for (const n of r.onde) assert.ok(n < inicio, 'valor ' + r.valor + ' em n=' + n);
  }
});

/* -------------------------------------------------------------- a familia */

const FAM = {
  '.77': ['Kayles', 12, 71, 16],
  '.137': ['xadrez de Dawson', 34, 52, 5],
  '.07': ['Kayles de Dawson', 34, 53, 6],
  '.4': ['so partir em duas, sem tirar nada', 34, 54, 7],
  '.17': ['Mock Turtles curto', 34, 33, 4],
  '.33': ['tirar uma ou duas pecas de uma ponta', 3, 0, 0],
  '.7': ['tirar uma peca de onde quiser', 2, 0, 0],
};

test('o periodo medido de cada jogo da familia', { timeout: MINUTOS }, () => {
  const lista = linhaFamilia();
  assert.equal(lista.length, 7);
  for (const f of lista) {
    const alvo = FAM[f.codigo];
    assert.ok(alvo, 'codigo inesperado: ' + f.codigo);
    assert.equal(f.nome, alvo[0], f.codigo);
    assert.equal(f.periodo, alvo[1], f.codigo + ' periodo');
    assert.equal(f.inicio, alvo[2], f.codigo + ' inicio');
    assert.equal(f.quantasExcecoes, alvo[3], f.codigo + ' excecoes');
  }
});

test('tres jogos da familia tem o mesmo periodo 34 e comecos consecutivos', { timeout: MINUTOS }, () => {
  const lista = linhaFamilia();
  const trinta = lista.filter((f) => ['.137', '.07', '.4'].includes(f.codigo));
  assert.equal(trinta.length, 3);
  assert.deepEqual(trinta.map((f) => f.periodo), [34, 34, 34]);
  assert.deepEqual(trinta.map((f) => f.inicio).sort((a, b) => a - b), [52, 53, 54]);
});

test('os tres sao o mesmo jogo deslocado, sem uma divergencia', { timeout: MINUTOS }, () => {
  assert.equal(deslocamento('137', '07', 1).divergencias, 0);
  assert.equal(deslocamento('137', '4', 2).divergencias, 0);
  assert.equal(deslocamento('07', '4', 1).divergencias, 0);
  // e NAO sao o mesmo sem deslocar
  assert.ok(deslocamento('137', '07', 0).divergencias > 0);
});

test('entre oito codigos octais, so o .77 e Kayles', { timeout: MINUTOS }, () => {
  const r = qualCodigoEhKayles();
  assert.equal(r.length, 8);
  assert.deepEqual(r.filter((x) => x.bate).map((x) => x.codigo), ['.77']);
});

/* ----------------------------------------------------------- o jogo direto */

test('o jogo direto nao discorda de Grundy em 273 posicoes', { timeout: MINUTOS }, () => {
  const r = linhaJuizDireto();
  assert.equal(r.casos, 273);
  assert.equal(r.divergencias, 0);
  assert.equal(r.nos, 777);
});

const CUSTO = { 10: 51, 14: 171, 18: 434, 22: 1147, 26: 2973, 30: 6639 };

test('o preco de jogar sem a tabela de Grundy', { timeout: MINUTOS }, () => {
  for (const n of Object.keys(CUSTO)) {
    const c = linhaCusto(Number(n));
    assert.equal(c.nosDoDireto, CUSTO[n], 'n=' + n);
    assert.equal(c.entradasDeGrundy, Number(n) + 1);
  }
});

test('a razao entre os dois caminhos explode: de 5x para 214x', { timeout: MINUTOS }, () => {
  assert.equal(Math.round(linhaCusto(10).razao), 5);
  assert.equal(Math.round(linhaCusto(30).razao), 214);
  // e cresce em toda a faixa, sem recuo
  let anterior = 0;
  for (const n of [10, 14, 18, 22, 26, 30]) {
    const r = linhaCusto(n).razao;
    assert.ok(r > anterior, 'recuou em n=' + n);
    anterior = r;
  }
});

/* ------------------------------------------------------------ as aberturas */

test('de uma fila de n saem n posicoes, e quantas delas ganham', { timeout: MINUTOS }, () => {
  const esperado = { 12: 1, 18: 6, 20: 1, 22: 8, 24: 2 };
  for (const n of Object.keys(esperado)) {
    const a = linhaAberturas(Number(n));
    assert.equal(a.total, Number(n), 'fila de ' + n);
    assert.equal(a.ganham, esperado[n], 'fila de ' + n);
  }
});

test('a fila de 20 tem vinte jogadas e so uma ganha', { timeout: MINUTOS }, () => {
  const a = linhaAberturas(20);
  assert.equal(a.total, 20);
  assert.equal(a.ganham, 1);
  assert.notEqual(tabela()[20], 0, 'mesmo assim o primeiro ganha');
});
