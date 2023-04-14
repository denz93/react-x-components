import path from 'path'
import fs from 'fs'

type Country = {
  code: string 
  name: string 
  emoji: string
  dial_code: string 
}
const inputPath = process.argv.length >= 3 ? process.argv[2] : ''
const absPath = path.resolve(path.join(process.cwd(), inputPath))

if (inputPath.length === 0 || !fs.existsSync(absPath)) {
  console.error(`Input file "${inputPath}" not exist`)
  process.exit(1)
}

const raw = fs.readFileSync(absPath, {encoding: 'utf-8'} )

let countryList: Country[] = []

try {
  countryList = JSON.parse(raw) as Country[]
} catch (err) {
  console.error(err)
  process.exit(1)
}

const countryMap = countryList.reduce((map, country) => {
  map[country.code.toLowerCase()] = country
  return map
}, {})

const outputPath = absPath + '.generated'
fs.writeFileSync(outputPath, JSON.stringify(countryMap))