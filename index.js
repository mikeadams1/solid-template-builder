const fs = require('fs-extra')
const regex = require('./regex')
const { has, forEach, set, get } = require('lodash')

class SolidTemplateBuilder {
  constructor (_template, _data) {
    let variables, components

    variables = has(_data, 'variables') ? _data.variables : {}
    components = has(_data, 'components') ? _data.components : {}

    forEach(components, (component, name) => {
      set(components, name, fs.readFileSync(component, 'utf8'))
    })

    this.variables = variables
    this.components = components
    this.template = _template
    this.name = _template.match(regex.get.name)[0]
  }

  parseComponents (_template, _components) {
    let components, template

    // Load the template in a local variable
    template = _template

    // Match all the components inside the template
    components = template.match(regex.get.component)

    // Cycle through all the components that have been found
    forEach(components, (component, index) => {
      let name, cycle

      // Get the name of the component
      name = component.replace(regex.clear.component, '')

      // Get the variable name for the for cycle
      cycle = component.match(regex.get.for) || []
      cycle = cycle.length > 0 ? cycle[0].replace(regex.clear.for, '') : false

      if (cycle) {
        let multiples = ''; let temporaryComponent

        // Replace the single <Component /> element with multiple elements like this <Component1 />..<Component2 />
        get(this.variables, cycle).forEach((v, i) => { multiples += `<${name}${i} />` })

        // Replace the single <Component /> in the template with the multiples
        template = template.replace(component, multiples)

        // Cycle through the cycle variable
        forEach(get(this.variables, cycle), (variable, index) => {
          // Isolate the component inside a temporary one
          temporaryComponent = get(_components, name)

          // Parse the variables of this component with the current variables
          temporaryComponent = this.parseVariables(temporaryComponent, variable)

          // Replace the <Component$N /> with the component code
          template = template.replace(`<${name}${index} />`, temporaryComponent)
        })
      } else {
      // Replace the component declaration with its code
        template = template.replace(component, get(_components, name))
      }
    })

    return template
  }

  parseVariables (_template, _variables) {
    let template, variables

    template = _template

    // Match all the variables inside the template
    variables = template.match(regex.get.variable)

    // Cycle through all the variables that have been found
    forEach(variables, (variable, index) => {
      let key

      // Get the key of the variable
      key = variable.replace(regex.clear.variable, '')

      // Replace the variable declaration with its key
      template = template.replace(variable, get(_variables, key))
    })

    return template
  }

  compile () {
    let source, build

    source = fs.readFileSync(this.template, 'utf8')

    build = this.parseComponents(source, this.components)
    build = this.parseVariables(build, this.variables)

    if (!fs.existsSync('./build')) fs.mkdirSync('./build')

    fs.writeFileSync(`./build/${this.name}`, build, 'utf8')

    return build
  }
}

module.exports = SolidTemplateBuilder
