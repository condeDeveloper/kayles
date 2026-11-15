# Kayles

Uma fila de pinos. Cada jogada derruba **um** pino ou **dois vizinhos**, e o buraco
parte a fila em duas, que seguem como jogos independentes. Quem não tem o que
derrubar, perde.

É o exemplo clássico de jogo imparcial que vira uma tabela de números: o valor de
Grundy de uma fila de `n`, e o XOR para somar filas. Aqui a tabela está calculada até
`n = 2.000` e **medida** — o período não é citado de lugar nenhum, é procurado.

**Página:** <https://condedeveloper.github.io/kayles/>

## Os quatro achados

1. **O período 12 quase começa doze casas antes, e um único termo o adia.** Ele vale a
   partir de `n = 71`. O bloco `n = 59…70` é **idêntico** ao bloco periódico — exceto
   pelo último valor: G(70) = **6**, onde o período pediria 2. Uma casa em dois mil.
2. **O valor 5 aparece uma única vez em 2.001 termos**, em `n = 28`. Os outros dois
   raros, 3 e 6, aparecem quatro vezes cada — e **nenhum dos três volta depois que o
   período começa**. De 71 em diante, a sequência usa só 1, 2, 4, 7 e 8.
3. **Uma fila única nunca é perdedora.** Em 2.000 valores, o único zero é `n = 0`.
   Seja qual for o tamanho da fila, quem começa ganha — e às vezes por um fio: na fila
   de 20 pinos, das **20** jogadas possíveis só **uma** ganha.
4. **Três jogos diferentes da família octal são o mesmo jogo deslocado.** O xadrez de
   Dawson (.137), o Kayles de Dawson (.07) e o .4 têm todos período **34**, começando
   em 52, 53 e 54 — porque `.07` é o `.137` andado uma casa e `.4` é o `.137` andado
   duas, com **zero** divergências em 499 termos.

## O período

```
periodo: 12, valendo a partir de n = 71, conferido ate n = 2.000
abaixo do inicio, 16 valores nao obedecem G(n) = G(n+12):
   0, 3, 10, 11, 15, 16, 18, 21, 27, 28, 34, 39, 45, 57, 58, 70
```

E o bloco imediatamente anterior ao começo:

| bloco | os doze valores |
|---|---|
| n = 59…70 | 7 4 1 2 8 1 4 7 2 1 8 **6** |
| n = 71…82 | 7 4 1 2 8 1 4 7 2 1 8 **2** |

## Que valores aparecem

| valor | vezes em 2.001 termos | onde |
|---:|---:|---|
| 0 | 1 | só n = 0 |
| 1 | 500 | por toda parte |
| 2 | 497 | por toda parte |
| 3 | 4 | 3, 6, 18, 39 |
| 4 | 336 | por toda parte |
| **5** | **1** | **só n = 28** |
| 6 | 4 | 11, 22, 34, 70 |
| 7 | 331 | por toda parte |
| 8 | 327 | por toda parte |

Nove valores, e o maior é 8 — que aparece pela primeira vez em `n = 27`.

## A família octal

Um jogo octal `.d1 d2 d3…` diz, para cada número de peças removidas, se a jogada pode
deixar zero, uma ou duas filas. O motor recebe os dígitos e obedece.

| código | jogo | período | a partir de | exceções |
|---|---|---:|---:|---:|
| **.77** | **Kayles** | **12** | **71** | 16 |
| .137 | xadrez de Dawson | 34 | 52 | 5 |
| .07 | Kayles de Dawson | 34 | 53 | 6 |
| .4 | só partir em duas, sem tirar nada | 34 | 54 | 7 |
| .17 | Mock Turtles curto | 34 | 33 | 4 |
| .33 | tirar uma ou duas peças de uma ponta | 3 | 0 | 0 |
| .7 | tirar uma peça de onde quiser | 2 | 0 | 0 |

## Os dois juízes

1. **O jogo direto.** Um negamax sobre a **posição inteira** — a lista de filas — que só
   responde ganha ou perde. Não soma jogos, não faz XOR, não tem tabela de fila. Em
   **273** posições de até três filas somando até 18 pinos, **zero** divergências entre
   "Grundy diferente de zero" e "o primeiro ganha".
2. **O motor octal genérico**, que não sabe o que é pino. Reproduz Kayles termo a termo
   com o código `.77` — e com nenhum dos outros sete testados.

O preço de jogar sem a tabela de Grundy, numa fila única:

| n | posições do jogo direto | entradas de Grundy | razão |
|---:|---:|---:|---:|
| 10 | 51 | 11 | 5× |
| 14 | 171 | 15 | 11× |
| 18 | 434 | 19 | 23× |
| 22 | 1.147 | 23 | 50× |
| 26 | 2.973 | 27 | 110× |
| 30 | 6.639 | 31 | 214× |

## As aberturas

De uma fila de `n` pinos saem exatamente **n** posições diferentes — e não `2n − 1`,
porque a fila é simétrica e derrubar o primeiro pino é o mesmo que derrubar o último.
Quantas delas ganham varia muito:

| n | jogadas | ganham |
|---:|---:|---:|
| 12 | 12 | 1 |
| 18 | 18 | 6 |
| 20 | 20 | 1 |
| 22 | 22 | 8 |
| 24 | 24 | 2 |

## O que as medidas me corrigiram

- **Escrevi no código que Kayles era o jogo octal `.137`.** Não é: `.137` é o **xadrez
  de Dawson**. Kayles é o `.77`. Quem apontou isso foi a comparação termo a termo com a
  busca pelos pinos, que não sabe o que é código octal — de oito candidatos testados,
  só um bate.
- **Quase escrevi "o período começa em 72".** A medida diz **71**: o bloco que começa
  em 71 já é o periódico. Um lugar onde o começo do intervalo e o "a partir de" se
  confundem com uma casa de diferença — e uma casa aqui é exatamente o tamanho do
  achado.
- **Copiei a sequência para a página olhando a saída do medidor**, sete linhas de doze
  números. Antes de publicar, conferi linha a linha por programa. Passou — mas o hábito
  é o que salva: no acervo já houve número de tabela copiado torto.

## Rodando

```bash
node --test testes/*.test.js       # 36 testes
node ferramentas/medidor.js        # todas as tabelas
node ferramentas/medidor.js periodo
```

A página é JavaScript puro: sem framework, sem build, sem dependência.

## Arquivos

| arquivo | o que faz |
|---|---|
| `js/nucleo.js` | a fila de pinos e a regra |
| `js/busca.js` | a sequência de Grundy e a procura do período |
| `js/juiz.js` | o jogo direto e o motor octal genérico |
| `js/medidas.js` | as tabelas deste README |

## Licença

MIT.
