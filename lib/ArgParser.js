'use strict';

class ArgParser {
  /**
   * Parse "get 2.foo bar"
   * @param {string}   search    2.foo
   * @param {Iterable} list      Where to look for the item
   * @param {boolean}  returnKey If `list` is a Map, true to return the KV tuple instead of just the entry
   * @return {*} Boolean on error otherwise an entry from the list
   */
  static parseDot(search, list, returnKey = false) {
    if (!list) {
      return null;
    }

    const parts = search.split('.');
    let findNth = 1;
    let keyword = null;
    if (parts.length > 2) {
      return false;
    }

    if (parts.length === 1) {
      keyword = parts[0];
    } else {
      findNth = parseInt(parts[0], 10);
      keyword = parts[1];
    }

    let encountered = 0;
    for (let entity of list) {
      let key, entry;
      if (Array.isArray(entity)) {
        [key, entry] = entity;
      } else {
        entry = entity;
      }

      if (!('keywords' in entry) && !('name' in entry)) {
        throw new Error('Items in list have no keywords or name');
      }

      // prioritize keywords over item/player names
      if (entry.keywords && (entry.keywords.includes(keyword) || entry.uuid === keyword)) {
        encountered++;
        if (encountered === findNth) {
          return returnKey ? [key, entry] : entry;
        }
        // if the keyword matched skip to next loop so we don't double increment
        // the encountered counter
        continue;
      }

      if (entry.name && entry.name.toLowerCase().includes(keyword.toLowerCase())) {
        encountered++;
        if (encountered === findNth) {
          return returnKey ? [key, entry] : entry;
        }
      }
    }

    return false;
  }
}
module.exports = ArgParser;
