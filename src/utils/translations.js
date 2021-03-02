const { derived, writable } = require('svelte/store');

class Translator {
  constructor() {
    this.dictionary = {};
    this.stores = {};
    this.locale = writable();
    this.lng = '';
    this.__ = derived(this.locale, () => this.t.bind(this));
  }
  addMessages(lng, dic) {
    this.dictionary[lng] = dic;
  }
  setLocale(lng) {
    this._checkLocaleExists(lng);
    this.lng = lng;
    this.locale.set(lng);
  }
  changeLocale(newLocale) {
    this._checkLocaleExists(newLocale);
    this.locale.set(newLocale);
    this.lng = newLocale;
  }
  t(key) {
    return (
      key
        .split('.')
        .reduce(
          (dictionary, key) => dictionary[key],
          this.dictionary[this.lng]
        ) || key
    );
  }
  _checkLocaleExists(lng) {
    if (!this.dictionary[lng])
      throw new Error(`No translations loaded for ${lng}!`);
  }
}

const translator = new Translator();
translator.addMessages('ru', require('../../locale/ru.json'));
translator.addMessages('en', require('../../locale/en.json'));
translator.setLocale('ru');

module.exports = translator;
