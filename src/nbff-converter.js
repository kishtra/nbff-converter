import jsonToNBFF from './json-to-nbff.js'
import nbffToJSON from './nbff-to-json.js'

/** Netscape Bookmark File Format converter. */
class NBFFConverter {
	#NBFF_HEADER = `<!DOCTYPE NETSCAPE-Bookmark-file-1>
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
		return this.#NBFF_HEADER
	}

	/**
	 * Create a Netscape Bookmark File Format converter.
	 * See
	 * {@link https://github.com/kishtra/nbff-converter/blob/main/README.md documentation}.
	 *
	 * @param {Object} NBFFjsonModel Defines created/expected JSON node key names.
	 * Default property values are:
	 * - CHILDREN: 'children'
	 * - INNER_TEXT: 'title'
	 * - HREF: 'url'
	 * - ADD_DATE: 'dateAdded'
	 * - LAST_VISIT: 'dateLastVisited'
	 * - LAST_MODIFIED: 'dateModified'
	 * - PERSONAL_TOOLBAR_FOLDER: 'personalToolbarFolder'
	 */
	constructor(NBFFjsonModel = {}) {
		if (typeof NBFFjsonModel !== 'object')
			throw new TypeError('Invalid constructor argument type. Expected an Object.')

		for (const usrModelKey in NBFFjsonModel) {
			if (this.#NBFFjsonModel[usrModelKey] === undefined)
				throw new ReferenceError(
					`Invalid NBFFjsonModel property key: { ${usrModelKey} }`
				)
			if (typeof NBFFjsonModel[usrModelKey] !== 'string')
				throw new TypeError(
					`Invalid type of NBFFjsonModel property value. Given '${typeof NBFFjsonModel[
						usrModelKey
					]}' but expected a 'string'.`
				)

			this.#NBFFjsonModel[usrModelKey] = NBFFjsonModel[usrModelKey]
		}
	}

	/**
	 * Traverses a JSON tree, converts individual nodes to an element string and
	 * returns an object containing a Netscape Bookmark File Format string
	 * and the number of nodes converted.
	 *
	 * @param {JSON} jsonTree
	 * @param {Boolean} addHeader - Decide if NBFF header is included. Defaults to true.
	 * @param {Number} tabSpaces - Spaces per tab. Defaults to 4.
	 *
	 * @returns {Promise}
	 * - resolve: { nbffStr, numOfNodes }
	 * - reject: TypeError | ReferenceError | RangeError
	 */
	async jsonToNetscape(jsonTree, addHeader = true, tabSpaces = 4) {
		return new Promise((resolve, reject) => {
			if (typeof jsonTree !== 'object')
				reject(new TypeError('(jsonTree) argument must be an Object'))
			else if (Array.isArray(jsonTree))
				reject(
					new TypeError('(jsonTree) argument is an Array but expecting an Object')
				)
			else if (jsonTree[this.#NBFFjsonModel.CHILDREN] === undefined)
				reject(
					new ReferenceError('(jsonTree) argument must have "CHILDREN" property')
				)
			else if (!Array.isArray(jsonTree[this.#NBFFjsonModel.CHILDREN]))
				reject(
					new TypeError('(jsonTree) argument "CHILDREN" property must be an Array')
				)
			else if (typeof addHeader !== 'boolean')
				reject(new TypeError('(addHeader) argument must be a Boolean'))
			else if (typeof tabSpaces !== 'number')
				reject(new TypeError('(tabSpaces) argument must be a Number'))
			else if (tabSpaces < 0)
				reject(new RangeError('(tabSpaces) argument must be greater than zero'))

			let nbffHeader = ''
			if (addHeader) nbffHeader = this.#NBFF_HEADER

			resolve(jsonToNBFF(jsonTree, nbffHeader, tabSpaces, this.#NBFFjsonModel))
		})
	}

	/**
	 * Parses Netscape Bookmark File Format string and returns a JSON tree.
	 * Optionaly pass a midFunction which will be invoked for every valid
	 * subfolder/shortcut item with corresponding subfolder/shortcut object
	 * node as an argument.
	 *
	 * @param {String} nbffString Netscape Bookmark File Format string to convert.
	 * @param {Function} midFunction Optional user defined function. Takes one JSON
	 * 								 node argument for every valid subfolder/shortcut item.
	 * 								 If not provided, the default function will create
	 * 								 and return a JSON tree.
	 *
	 * @returns {Promise}
	 * - resolve: { level, id, numOfNodes, [NBFFjsonModel.CHILDREN] }
	 * - reject: TypeError
	 */
	netscapeToJSON(nbffString, midFunction) {
		return new Promise((resolve, reject) => {
			if (typeof nbffString !== 'string')
				reject(new TypeError('(nbffString) argument must be a String'))
			else if (midFunction !== undefined && typeof midFunction !== 'function')
				reject(new TypeError('(midFunction) argument must be a Function'))

			resolve(nbffToJSON(nbffString, midFunction, this.#NBFFjsonModel))
		})
	}
}

export default NBFFConverter
