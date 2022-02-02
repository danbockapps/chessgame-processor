import fs from 'fs'

export default (path: string) => fs.readFileSync(path, 'utf-8')
