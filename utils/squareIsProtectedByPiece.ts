import { Chess } from 'chess.js'

// Function returns true if it's legal to move a piece (not a pawn) to the
// square, or capture with a piece on the square, after the move is played.

export default (fen: string, move: string, square: string) => {
  const ch = new Chess(fen)
  if (ch.move(move))
    return ch
      .moves({ verbose: true })
      .some(m => m.to === square && ['k', 'q', 'r', 'b', 'n'].includes(m.piece))
  else return false
}
