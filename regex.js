module.exports = {
  'get': {
    'variable': new RegExp(/\{.+\}/gm),
    'component': new RegExp(/<[A-Z].+\/>/gm),
    'for': new RegExp(/for=('|").+('|")/gm),
    'name': new RegExp(/[a-zA-Z]+.html/gm)
  },
  'clear': {
    'variable': new RegExp(/\{\s|\s\}/gm),
    'component': new RegExp(/(<|\s.{0,}\/>)/gm),
    'for': new RegExp(/(for=('|")|('|"))/gm)
  }
}
