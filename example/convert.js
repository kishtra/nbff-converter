import fs from 'fs'
import NBFFConverter from '../src/nbff-converter.js'

// Default example

const nbffString = fs.readFileSync('./dummy.html', 'utf8')
const nbffConverterDefault = new NBFFConverter()

nbffConverterDefault.netscapeToJSON(nbffString).then((result) => {
	fs.writeFileSync('result1.json', JSON.stringify(result, null, 4))
})

// Simple midFunction example:
const myMidFunction = (node) => node.title

nbffConverterDefault.netscapeToJSON(nbffString, myMidFunction).then((result) => {
	const jsonString2 = JSON.stringify(result, null, 4)
	fs.writeFileSync('result2.json', jsonString2)
})

// Custom example

const jsonString = fs.readFileSync('./dummy.json', 'utf8')
const jsonData = JSON.parse(jsonString)

const myCustomModel = { CHILDREN: 'content', INNER_TEXT: 'name', HREF: 'shortcut' }
const nbffConverterCustom = new NBFFConverter(myCustomModel)

nbffConverterCustom.jsonToNetscape(jsonData, true, 4).then((result) => {
	fs.writeFileSync('result.html', result.nbffStr)
})
