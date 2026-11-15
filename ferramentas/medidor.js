#!/usr/bin/env node
// O medidor: roda as tabelas e cospe os numeros que vao para o README.
//
//   node ferramentas/medidor.js           todas
//   node ferramentas/medidor.js periodo   so uma

import {
  ATE, tabela, linhaPeriodo, quaseComecouAntes, linhaValores, linhaPerdedoras,
  linhaAberturas, linhaFamilia, qualCodigoEhKayles, deslocamento,
  linhaJuizDireto, linhaCusto,
} from '../js/medidas.js';

const n = (x) => x.toLocaleString('pt-BR');

function titulo(t) {
  console.log('');
  console.log(t);
  console.log('-'.repeat(t.length));
}

function sequenciaT() {
  titulo('A sequencia de Grundy de Kayles');
  const g = tabela();
  for (let i = 0; i < 84; i += 12) {
    console.log(String(i).padStart(4) + ': ' +
      g.slice(i, i + 12).map((x) => String(x).padStart(2)).join(' '));
  }
  console.log('');
  const p = linhaPerdedoras();
  console.log('n em que uma fila unica PERDE (Grundy zero), ate ' + n(ATE) + ': ' +
    (p.perdedoras.join(', ') || 'nenhum'));
}

function periodoT() {
  titulo('O periodo, medido');
  const p = linhaPeriodo();
  console.log('periodo: ' + p.periodo + ', valendo a partir de n = ' + p.inicio +
    ', conferido ate n = ' + n(p.conferidoAte));
  console.log('abaixo do inicio, ' + p.quantasExcecoes + ' valores nao obedecem G(n) = G(n+' +
    p.periodo + '):');
  console.log('   ' + p.excecoes.join(', '));
  const q = quaseComecouAntes();
  console.log('');
  console.log('o bloco de ' + q.periodo + ' logo antes do inicio, contra o primeiro bloco periodico:');
  console.log('   n=' + (q.inicio - q.periodo) + '..' + (q.inicio - 1) + ':  ' + q.antes.join(' '));
  console.log('   n=' + q.inicio + '..' + (q.inicio + q.periodo - 1) + ':  ' + q.depois.join(' '));
  console.log('   diferencas: ' + q.diferencas + ' (em n = ' + q.onde.join(', ') + ')');
}

function valoresT() {
  titulo('Que valores aparecem, e quantas vezes');
  const v = linhaValores();
  console.log('valor   vezes em ' + n(v.ate + 1) + ' termos');
  for (const par of v.histograma) {
    console.log(String(par[0]).padStart(5) + n(par[1]).padStart(10));
  }
  console.log('');
  console.log('maior valor: ' + v.maior.maior + ', a primeira vez em n = ' + v.maior.onde);
  console.log('os raros:');
  for (const r of v.raros) {
    console.log('   valor ' + r.valor + ': ' + r.vezes + ' vez(es), em n = ' + r.onde.join(', '));
  }
}

function familiaT() {
  titulo('A familia octal, com cada periodo MEDIDO');
  console.log('codigo  nome                                   periodo   a partir de   excecoes');
  for (const f of linhaFamilia()) {
    console.log(
      f.codigo.padEnd(8) +
      f.nome.padEnd(39) +
      String(f.periodo === null ? '-' : f.periodo).padStart(7) +
      String(f.inicio === null ? '-' : f.inicio).padStart(14) +
      String(f.quantasExcecoes === null ? '-' : f.quantasExcecoes).padStart(11));
  }
  console.log('');
  console.log('qual codigo octal e Kayles:');
  for (const c of qualCodigoEhKayles()) {
    console.log('   ' + c.codigo.padEnd(6) + (c.bate ? 'BATE termo a termo' : 'nao bate'));
  }
  console.log('');
  console.log('os que sao o mesmo jogo deslocado:');
  const pares = [['137', '07', 1], ['137', '4', 2], ['07', '4', 1]];
  for (const par of pares) {
    const r = deslocamento(par[0], par[1], par[2]);
    console.log('   ' + r.a + ' deslocado de ' + r.deslocamento + ' contra ' + r.b +
      ': ' + r.divergencias + ' divergencias em ' + n(r.conferidoAte) + ' termos');
  }
}

function juizT() {
  titulo('O jogo direto, que nao conhece a palavra Grundy');
  const r = linhaJuizDireto();
  console.log('posicoes de ate 3 filas somando ate ' + r.maximoDePinos + ': ' + n(r.casos));
  console.log('divergencias entre "Grundy diferente de zero" e "o primeiro ganha": ' + r.divergencias);
  console.log('posicoes visitadas pelo jogo direto: ' + n(r.nos));
  console.log('');
  console.log('o preco de responder sem a tabela de Grundy, numa fila unica:');
  console.log('  n   posicoes do direto   entradas de Grundy   razao');
  for (const i of [10, 14, 18, 22, 26, 30]) {
    const c = linhaCusto(i);
    console.log(
      String(c.n).padStart(3) +
      n(c.nosDoDireto).padStart(21) +
      String(c.entradasDeGrundy).padStart(21) +
      (Math.round(c.razao) + 'x').padStart(8));
  }
}

function aberturasT() {
  titulo('Quantas primeiras jogadas ganham, numa fila de n pinos');
  console.log('  n   jogadas   ganham   fracao');
  for (let i = 1; i <= 24; i++) {
    const a = linhaAberturas(i);
    console.log(
      String(a.n).padStart(3) +
      String(a.total).padStart(10) +
      String(a.ganham).padStart(9) +
      ((100 * a.ganham / a.total).toFixed(0) + '%').padStart(9));
  }
}

const NOMES = {
  sequencia: sequenciaT, periodo: periodoT, valores: valoresT,
  familia: familiaT, juiz: juizT, aberturas: aberturasT,
};

const pedido = process.argv[2];
if (pedido) {
  if (!NOMES[pedido]) {
    console.error('nao conheco a tabela "' + pedido + '". tenho: ' + Object.keys(NOMES).join(', '));
    process.exit(1);
  }
  NOMES[pedido]();
} else {
  for (const f of Object.values(NOMES)) f();
}
console.log('');
