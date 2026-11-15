// Kayles: a fila de pinos, e a regra.
//
// Uma jogada derruba UM pino, ou DOIS pinos vizinhos. O pino derrubado
// parte a fila em duas, e o jogo segue nas duas metades ao mesmo tempo.
// Quem nao tem o que derrubar, perde.
//
// Uma posicao e um conjunto de filas: [7] e uma fila de sete, [3, 2] sao
// duas filas que nao se tocam. A ordem nao importa e fila de tamanho zero
// nao conta, entao a posicao canonica e a lista ordenada sem zeros.

export function arruma(filas) {
  return filas.filter((x) => x > 0).sort((a, b) => b - a);
}

export function chave(filas) {
  return arruma(filas).join(',');
}

export function pinos(filas) {
  let s = 0;
  for (const x of filas) s += x;
  return s;
}

/**
 * As jogadas de UMA fila de n pinos: derrubar um pino na posicao i deixa
 * [i, n-1-i]; derrubar dois vizinhos a partir de i deixa [i, n-2-i].
 * Devolve os pares, com repeticao removida — derrubar o pino 0 de uma fila
 * de 5 e derrubar o pino 4 dao a mesma posicao.
 */
export function jogadasDaFila(n) {
  const vistas = new Set();
  const fora = [];
  const poe = (a, b) => {
    const p = arruma([a, b]);
    const c = p.join(',');
    if (vistas.has(c)) return;
    vistas.add(c);
    fora.push(p);
  };
  for (let i = 0; i <= n - 1; i++) poe(i, n - 1 - i);
  for (let i = 0; i <= n - 2; i++) poe(i, n - 2 - i);
  return fora;
}

/** Todas as posicoes a que se chega de uma posicao, sem repeticao. */
export function jogadas(filas) {
  const base = arruma(filas);
  const vistas = new Set();
  const fora = [];
  for (let k = 0; k < base.length; k++) {
    for (const resto of jogadasDaFila(base[k])) {
      const nova = arruma([...base.slice(0, k), ...base.slice(k + 1), ...resto]);
      const c = nova.join(',');
      if (vistas.has(c)) continue;
      vistas.add(c);
      fora.push(nova);
    }
  }
  return fora;
}

export function acabou(filas) {
  return arruma(filas).length === 0;
}

/** O menor inteiro que nao esta no conjunto. */
export function mex(vistos) {
  let v = 0;
  while (vistos.has(v)) v++;
  return v;
}
