import { Chess } from 'chess.js'
import { spawn } from 'child_process'
import getGamesFromPgnFile from './utils/getGamesFromPgnFile'

export default (argv: string[]) => {
  const games = getGamesFromPgnFile(argv[3])

  const ch = new Chess()

  const fens = games.flatMap(game => {
    ch.load_pgn(game)
    const ch2 = new Chess()
    return ch.history().map(move => {
      ch2.move(move)
      return { move, fen: ch2.fen() }
    })
  })

  let i = 0

  const nextMove = () => {
    if (i >= fens.length) process.exit()
    console.log('Now evaluating ' + fens[i].move)
    console.time('Evaluation time')
    st.stdin.write(`position fen ${fens[i].fen}\ngo wtime 10000 btime 10000\n`)
    i++
  }

  const st = spawn('stockfish')
  st.stdout.on('data', chunk => {
    const output: string = chunk.toString('utf-8')
    const split = output.split('bestmove')
    if (output.includes('Stockfish') || split[1]) {
      console.timeEnd('Evaluation time')
      console.log('Best move:', split[1])
      nextMove()
    }
  })
}
