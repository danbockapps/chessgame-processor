import { spawn } from 'child_process'
import fs from 'fs'

interface Position {
  fen: string
  site: string
  opening: string
}

interface PositionFile {
  totalGames: number
  numGamesIncluded: number
  numGamesWithPositionIncluded: number
  positions: Position[]
}

export interface ScoredMove {
  move: string
  score: number
}

export default async (argv: string[]) => {
  const file: PositionFile = JSON.parse(fs.readFileSync(argv[3], 'utf-8'))

  const st = spawn('stockfish')
  st.stdin.write('setoption name multipv value 2')
  st.stdin.write('setoption name Threads value 4')

  const getScoredMove = (fen: string) =>
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

      st.stdin.write(`position fen ${fen}\ngo wtime 100000 btime 100000\n`)
    })

  const evaluatedPositions = []
  for (const position of file.positions) {
    if (position) {
      const result = await getScoredMove(position.fen)

      if (result[0].score > -200 && result[0].score < 300) {
        evaluatedPositions.push({
          site: position.site,
          result,
          rxc3IsGood:
            result[0].move === 'c8c3' ||
            (result[1].move === 'c8c3' && Math.abs(result[0].score - result[1].score) < 100),
        })
      }

      process.stdout.write('.')
      if (Math.random() < 0.02) process.stdout.write('\n')
    }
  }

  evaluatedPositions.sort(a => (a.rxc3IsGood ? 1 : -1))

  console.log(JSON.stringify(evaluatedPositions))

  console.log('Total games', file.totalGames)
  console.log('Total Najdorf games', file.numGamesIncluded)
  console.log('Games with Rxc3 legal', file.numGamesWithPositionIncluded)
  console.log('Positions with Rxc3 legal', file.positions.length)
  console.log('Close positions with Rxc3 legal', evaluatedPositions.length)
  console.log('Close positions with Rxc3 good', evaluatedPositions.filter(e => e.rxc3IsGood).length)
}
