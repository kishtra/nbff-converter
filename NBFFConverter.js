import convertJSONToNetscape from './JSONToNetscape.js'
import convertNetscapeToJSON from './netscapeToJSON.js'

/** Netscape Bookmarks File Format converter. */
class NBFFConverter {
	#NBFFHeader = `<!DOCTYPE NETSCAPE-Bookmark-file-1>
<!--This is an automatically generated file.
	It will be read and overwritten.
	Do Not Edit! -->
<META HTTP-EQUIV="Content-Type" CONTENT="text/html; charset=UTF-8">
<Title>Bookmarks</Title>
<H1>Bookmarks</H1>\n`

	#NBFFjsonModel = {
		CHILDREN: 'children',
		INNER_TEXT: 'title',
		HREF: 'url',
		ADD_DATE: 'dateAdded',
		LAST_VISIT: 'dateLastVisited',
		LAST_MODIFIED: 'dateModified',
		PERSONAL_TOOLBAR_FOLDER: 'personalToolbarFolder',
	}

	get header() {
		return this.#NBFFHeader
	}

	result = null

	/**
	 * Create a Netscape Bookmarks File Format converter.
	 * @param {Object} NBFFjsonModel Defines created/expected JSON object key names.
	 * Default { KEY: value } pairs are:
	 * - CHILDREN: 'children'
	 * - INNER_TEXT: 'title'
	 * - HREF: 'url'
	 * - ADD_DATE: 'dateAdded'
	 * - LAST_VISIT: 'dateLastVisited'
	 * - LAST_MODIFIED: 'dateModified'
	 * - PERSONAL_TOOLBAR_FOLDER: 'personalToolbarFolder'
	 */
	constructor(NBFFjsonModel = {}) {
		if (typeof NBFFjsonModel !== 'object') {
			throw new Error('Invalid argument type')
		}
		for (const usrKey in NBFFjsonModel) {
			for (const privKey in this.#NBFFjsonModel) {
				if (usrKey === privKey) this.#NBFFjsonModel[privKey] = NBFFjsonModel[usrKey]
			}
		}
	}

	/**
	 * Traverses JSON tree, converts every valid node to an element string and
	 * returns a Netscape Bookmarks File Format string.
	 *
	 * @param {JSON} json - JSON object.
	 * @param {Boolean} header - Decide if netscape header is included. Defaults to true.
	 * @param {Number} tabSpaces - Spaces per tab. Defaults to 4.
	 *
	 * @returns {String}  Netscape Bookmarks File Format string.
	 */
	JSONToNetscape(json, header = true, tabSpaces = 4) {
		let NBFFHeader = ''
		if (header) NBFFHeader = this.#NBFFHeader
		return convertJSONToNetscape(json, NBFFHeader, tabSpaces, this.#NBFFjsonModel)
	}

	/**
	 * Parses Netscape Bookmarks File Format string and returns a JSON parse tree.
	 * Optionaly pass a midFunction which will be invoked for every valid
	 * bookmark/folder tag with corresponding bookmark/folder object node as an argument.
	 *
	 * @param {String} htmlString Netscape Bookmarks File Format string to convert.
	 * @param {Function} midFunction Optional user defined function. Takes one object
	 * 								 argument for every valid bookmark tag.
	 * 								 If not provided, the default function will create
	 * 								 and return a parse tree.
	 *
	 * @returns {Promise} (Promise):
	 * - onResolved: Parse tree object with 'children' and 'numOfNodes' properties.
	 * - onRejected: TO DO!
	 */
	netscapeToJSON(htmlString, midFunction) {
		return convertNetscapeToJSON(htmlString, midFunction, this.#NBFFjsonModel)
	}
}

export default NBFFConverter
