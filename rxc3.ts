import { Chess } from 'chess.js'
import { spawn } from 'child_process'
import fs from 'fs'
import getGamesFromPgnFile from './utils/getGamesFromPgnFile'

export default async (argv: string[]) => {
  console.time('rxc3.ts')
  const games = getGamesFromPgnFile(argv[3])
  const ch = new Chess()
  let najCount = 0
  const uniqueLegalRxc3Games = new Set()

  const positions = games.flatMap((game, i) => {
    if (i % 10000 === 0) console.log(`Loading game ${i} of ${games.length}`)
    ch.load_pgn(game)
    const history = ch.history()
    if (isNajdorf(history)) {
      najCount++
      const ch2 = new Chess()
      return history
        .map((move, zeroBasedPly) => {
          ch2.move(move)
          if (
            ch2.turn() === 'b' &&
            ch2.moves().includes('Rxc3') &&
            ['n', 'b'].includes(ch2.get('c3')?.type || '')
          ) {
            uniqueLegalRxc3Games.add(ch.header().Site)
            const returnable = { fen: ch2.fen(), site: `${ch.header().Site}#${zeroBasedPly + 1}` }
            console.log(returnable)
            return returnable
          }
        })
        .filter(m => m)
    } else return []
  })

  const st = spawn('stockfish')
  st.stdin.write('setoption name multipv value 2')
  st.stdin.write('setoption name Threads value 4')

  interface ScoredMove {
    move: string
    score: number
  }

  const stPromise = (fen: string) =>
    new Promise<ScoredMove[]>(resolve => {
      let bestMoves = [
        { move: '', score: 0 },
        { move: '', score: 0 },
      ]
      st.stdout.on('data', chunk => {
        const outputString: string = chunk.toString('utf-8')

        outputString.split('\n').forEach(o => {
          const output: string[] = o.split(/\s+/)

          if (o.includes('multipv 1'))
            bestMoves[0] = {
              move: output[output.findIndex(m => m === 'pv') + 1],
              score: Number(output[output.findIndex(m => m === 'cp') + 1]),
            }

          if (o.includes('multipv 2'))
            bestMoves[1] = {
              move: output[output.findIndex(m => m === 'pv') + 1],
              score: Number(output[output.findIndex(m => m === 'cp') + 1]),
            }
        })

        if (outputString.includes('bestmove')) {
          st.stdout.removeAllListeners('data')
          resolve(bestMoves)
        }
      })

      st.stdin.write(`position fen ${fen}\ngo wtime 50000 btime 50000\n`)
    })

  let bmCount = 0
  for (const position of positions) {
    if (position) {
      const result = await stPromise(position.fen)

      if (
        result[0].score > -200 &&
        result[0].score < 300 &&
        (result[0].move === 'c8c3' ||
          (result[1].move === 'c8c3' && Math.abs(result[0].score - result[1].score) < 100))
      ) {
        bmCount++
        console.log(position.site)
        console.log(result)
      }
    }
  }

  console.log('Total games', games.length)
  console.log('Total Najdorf games', najCount)
  console.log('Games with Rxc3 legal', uniqueLegalRxc3Games.size)
  console.log('Positions that meet our criteria', bmCount)

  console.timeEnd('rxc3.ts')
}

const isNajdorf = (history: string[]) =>
  ['c5', 'd6', 'cxd4', 'Nf6', 'a6'].every(m => history.slice(0, 16).includes(m)) &&
  !history.slice(0, 16).includes('g6')
