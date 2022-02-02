import readFile from './readFile'

export default (path: string) => readFile(path).split(/\s(?=\[Event .*\])/)
