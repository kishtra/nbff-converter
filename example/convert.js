import fs from 'fs'
import NBFFConverter from '../src/nbff-converter.js'

fs.readFile('./dummy.html', 'utf8', async (err, data) => {
	let nbffConverterDefault = new NBFFConverter()
	console.log(await nbffConverterDefault.netscapeToJSON(data))
})

fs.readFile('./dummy.json', 'utf8', async (err, data) => {
	let dummyJSON = JSON.parse(data)
	let nbffConverterCustom = new NBFFConverter({ CHILDREN: 'content', INNER_TEXT: 'name' })

	console.log(await nbffConverterCustom.jsonToNetscape(dummyJSON[0], true, 4))
})
