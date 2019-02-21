module.exports = {
  'get': {
    'variable': new RegExp(/\{.+\}/gm),
    'component': new RegExp(/<[A-Z].+\/>/gm),
    'for': new RegExp(/for=('|").+('|")/gm)
  },
  'clear': {
    'variable': new RegExp(/\{\s|\s\}/gm),
    'component': new RegExp(/(<|\s.+\/>)/gm),
    'for': new RegExp(/(for=('|")|('|"))/gm)
  }
}
