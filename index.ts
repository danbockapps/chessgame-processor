import analyzePgn from './analyzePgn'
import listGoodBad from './listGoodBad'
import rxc3 from './rxc3'
import getGamesFromPgnFile from './utils/getGamesFromPgnFile'
import getPositions from './utils/getPositions'
import squareIsProtectedByPiece from './utils/squareIsProtectedByPiece'

switch (process.argv[2]) {
  case 'analyze-pgn':
    analyzePgn(process.argv)
    break

  case 'rxc3':
    rxc3(process.argv)
    break

  case 'grp':
    console.log(
      JSON.stringify(
        getPositions(
          getGamesFromPgnFile(process.argv[3]),
          ch => ch.header().Opening?.includes('Najdorf') || false,
          ch =>
            ch.turn() === 'b' &&
            ch.moves().includes('Rxc3') &&
            ['n', 'b'].includes(ch.get('c3')?.type || '') &&
            !squareIsProtectedByPiece(ch.fen(), 'Rxc3', 'c3'),
        ),
      ),
    )
    break

  case 'lgb':
    listGoodBad(process.argv)
    break
}
