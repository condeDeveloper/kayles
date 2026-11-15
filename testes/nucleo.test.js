import test from 'node:test';
import assert from 'node:assert/strict';

import {
  arruma, chave, pinos, jogadasDaFila, jogadas, acabou, mex,
} from '../js/nucleo.js';
import { sequencia, valor, periodo, excecoes, aberturas } from '../js/busca.js';
import { JogoDireto, quemGanha, octal, FAMILIA } from '../js/juiz.js';

/* --------------------------------------------------------------- a regra */

test('arruma tira zeros e ordena, e a chave nao depende da ordem', () => {
  assert.deepEqual(arruma([0, 3, 0, 5, 1]), [5, 3, 1]);
  assert.equal(chave([3, 5, 1]), chave([1, 3, 5]));
  assert.equal(chave([3, 0, 5, 1]), '5,3,1');
});

test('toda jogada tira um ou dois pinos, e nunca mais', () => {
  for (let n = 1; n <= 20; n++) {
    for (const resto of jogadasDaFila(n)) {
      const tirados = n - pinos(resto);
      assert.ok(tirados === 1 || tirados === 2, 'fila ' + n + ' tirou ' + tirados);
    }
  }
});

test('de uma fila de n saem exatamente n posicoes diferentes', () => {
  // Sao 2n-1 jogadas, mas a fila e simetrica: derrubar o pino 0 e
  // derrubar o ultimo dao a mesma posicao.
  for (let n = 1; n <= 30; n++) {
    assert.equal(jogadasDaFila(n).length, n, 'fila de ' + n);
  }
});

test('a fila vazia e a de um pino', () => {
  assert.deepEqual(jogadasDaFila(0), []);
  assert.deepEqual(jogadasDaFila(1), [[]]);
  assert.deepEqual(jogadasDaFila(2).map((x) => x.join(',')).sort(), ['', '1']);
});

test('jogadas de varias filas nao repete posicao', () => {
  for (const pos of [[5], [4, 4], [6, 3, 1], [7, 2]]) {
    const lista = jogadas(pos);
    assert.equal(new Set(lista.map((x) => x.join(','))).size, lista.length, pos.join(','));
    for (const p of lista) {
      const tirados = pinos(pos) - pinos(p);
      assert.ok(tirados === 1 || tirados === 2, pos.join(',') + ' tirou ' + tirados);
    }
  }
});

test('jogada nenhuma aumenta o numero de pinos', () => {
  for (const pos of [[9], [5, 5], [4, 3, 2]]) {
    for (const p of jogadas(pos)) {
      assert.ok(pinos(p) < pinos(pos), pos.join(',') + ' -> ' + p.join(','));
    }
  }
});

test('acabou e mex', () => {
  assert.equal(acabou([]), true);
  assert.equal(acabou([0, 0]), true);
  assert.equal(acabou([1]), false);
  assert.equal(mex(new Set([0, 1, 2])), 3);
  assert.equal(mex(new Set([1, 2])), 0);
  assert.equal(mex(new Set()), 0);
});

/* ------------------------------------------------------------- a sequencia */

test('o comeco da sequencia de Grundy, termo a termo', () => {
  const g = sequencia(24);
  assert.deepEqual(g.slice(0, 25),
    [0, 1, 2, 3, 1, 4, 3, 2, 1, 4, 2, 6, 4, 1, 2, 7, 1, 4, 3, 2, 1, 4, 6, 7, 4]);
});

test('o valor de uma posicao e o XOR das filas', () => {
  const g = sequencia(20);
  assert.equal(valor([5, 5], g), 0);
  assert.equal(valor([3, 2], g), g[3] ^ g[2]);
  assert.equal(valor([], g), 0);
});

test('duas filas iguais sempre valem zero', () => {
  const g = sequencia(30);
  for (let n = 1; n <= 30; n++) assert.equal(valor([n, n], g), 0, 'n=' + n);
});

/* ---------------------------------------------------------------- o juiz */

test('o jogo direto concorda com Grundy em toda posicao de ate 16 pinos', () => {
  const g = sequencia(20);
  const direto = new JogoDireto();
  for (let a = 1; a <= 16; a++) {
    for (let b = 0; b <= a; b++) {
      for (let c = 0; c <= b; c++) {
        if (a + b + c > 16) continue;
        const porGrundy = valor([a, b, c], g) !== 0;
        assert.equal(direto.ganha([a, b, c]), porGrundy, [a, b, c].join(','));
      }
    }
  }
});

test('posicao sem jogada perde, e o jogo direto sabe disso sozinho', () => {
  assert.equal(quemGanha([]), 'segundo');
  assert.equal(quemGanha([1]), 'primeiro');
  assert.equal(quemGanha([1, 1]), 'segundo');
});

/* ---------------------------------------------------------------- o octal */

test('o motor octal reproduz Kayles com o codigo .77', () => {
  const k = sequencia(120);
  assert.deepEqual(octal('77', 120), k);
});

test('e NAO reproduz com o .137, que e outro jogo', () => {
  // Eu tinha escrito que Kayles era o .137. O .137 e o xadrez de Dawson.
  const k = sequencia(60);
  assert.notDeepEqual(octal('137', 60), k);
});

test('.07 e o .137 deslocado de um termo', () => {
  const a = octal('137', 200);
  const b = octal('07', 200);
  for (let i = 0; i + 1 < a.length; i++) assert.equal(a[i], b[i + 1], 'i=' + i);
});

test('o .7, tirar um pino de onde quiser, alterna 0 e 1', () => {
  const g = octal('7', 40);
  for (let n = 0; n <= 40; n++) assert.equal(g[n], n % 2, 'n=' + n);
});

test('a familia tem sete jogos e nenhum codigo repetido', () => {
  assert.equal(FAMILIA.length, 7);
  assert.equal(new Set(FAMILIA.map((x) => x[0])).size, 7);
});

/* ---------------------------------------------------------- o buscador de periodo */

test('o buscador de periodo acha o periodo de uma sequencia armada', () => {
  const g = [9, 9, 9, 1, 2, 3, 1, 2, 3, 1, 2, 3, 1, 2, 3, 1, 2, 3];
  const p = periodo(g);
  assert.equal(p.periodo, 3);
  assert.equal(p.inicio, 3);
  assert.deepEqual(excecoes(g, p.periodo, p.inicio), [0, 1, 2]);
});

test('o buscador exige voltas inteiras antes de chamar de periodo', () => {
  // dois termos iguais no fim nao fazem periodo
  const g = [1, 2, 3, 4, 5, 6, 7, 7];
  assert.equal(periodo(g, 3).periodo, null);
});

test('as aberturas de uma fila: sao n, e as que ganham levam a Grundy zero', () => {
  const g = sequencia(30);
  for (let n = 1; n <= 24; n++) {
    const a = aberturas(n, g);
    assert.equal(a.total, n, 'fila de ' + n);
    assert.equal(a.ganham > 0, g[n] !== 0, 'fila de ' + n);
  }
});
