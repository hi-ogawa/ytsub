/**
 * @typedef Entry
 * @property {string} id
 * @property {number} begin
 * @property {number} end
 * @property {string} text1
 * @property {string} text2
 * @property {string} deckId
 * @property {[{ value: string }]} rates
 */

/**
 * @typedef PlayerData
 * @property {string} videoId
 * @property {{ tracks:       [{ name: string, url: string, vssId: string }],
 *              translations: [{ name: string, code: string               }] }} subtitleInfo
 * @property {string} subtitleUrl1
 * @property {string} subtitleUrl2
 * @property {[Entry]} entries
 */
