import analyzePgn from './analyzePgn'
import rxc3 from './rxc3'

switch (process.argv[2]) {
  case 'analyze-pgn':
    analyzePgn(process.argv)
    break

  case 'rxc3':
    rxc3(process.argv)
    break
}
