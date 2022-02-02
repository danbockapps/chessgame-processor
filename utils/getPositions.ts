import { Chess, ChessInstance } from 'chess.js'
export default (
  games: string[],
  includeGame: (ch: ChessInstance) => boolean,
  includePosition: (ch: ChessInstance, ply: number) => boolean,
) => {
  const ch = new Chess()
  let numGamesIncluded = 0
  const uniqueGamesWithPositionIncluded = new Set()

  const positions = games.flatMap((game, i) => {
    ch.load_pgn(game)
    const history = ch.history()
    if (includeGame(ch)) {
      numGamesIncluded++
      const ch2 = new Chess()
      return history
        .map((move, zeroBasedPly) => {
          ch2.move(move)
          if (includePosition(ch2, zeroBasedPly + 1)) {
            uniqueGamesWithPositionIncluded.add(ch.header().Site)
            const returnable = {
              fen: ch2.fen(),
              site: `${ch.header().Site}#${zeroBasedPly + 1}`,
              opening: ch.header().Opening,
            }
            return returnable
          }
        })
        .filter(m => m)
    } else return []
  })

  return {
    totalGames: games.length,
    numGamesIncluded,
    numGamesWithPositionIncluded: uniqueGamesWithPositionIncluded.size,
    positions,
  }
}
