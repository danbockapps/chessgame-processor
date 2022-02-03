import { ScoredMove } from './rxc3'
import readFile from './utils/readFile'

interface EvalResult {
  site: string
  result: ScoredMove[]
  rxc3IsGood: boolean
}

export default (argv: string[]) => {
  const evals: EvalResult[] = JSON.parse(readFile(argv[3]))

  const good = evals.filter(e => e.rxc3IsGood)
  const bad = evals.filter(e => !e.rxc3IsGood)

  const sorter = (a: EvalResult, b: EvalResult) =>
    Number(a.site.split('#')[1]) > Number(b.site.split('#')[1]) ? 1 : -1

  good.sort(sorter)
  bad.sort(sorter)

  console.log('Good')
  good.forEach(g => {
    console.log(g.site)
  })

  console.log('\nBad')
  bad.forEach(b => {
    console.log(b.site)
  })
}
