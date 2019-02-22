const fs = require('fs-extra')
const regex = require('./regex')
const _ = require('lodash')

class SolidTemplateBuilder {
  constructor (_template, _data) {
    let variables, components

    variables = _.has(_data, 'variables') ? _data.variables : {}
    components = _.has(_data, 'components') ? _data.components : {}

    _.forEach(components, (component, name) => {
      _.set(components, name, fs.readFileSync(component, 'utf8'))
    })

    this.variables = variables
    this.components = components
    this.template = fs.readFileSync(`./${_template}`, 'utf8')
    this.name = _template
  }

  parseComponents (_template, _components) {
    let components, template

    // Load the template in a local variable
    template = _template

    // Match all the components inside the template
    components = template.match(regex.get.component)

    // Cycle through all the components that have been found
    _.forEach(components, (component, index) => {
      let name, cycle

      // Get the name of the component
      name = component.replace(regex.clear.component, '')

      // Get the variable name for the for cycle
      cycle = component.match(regex.get.for)
      cycle = cycle.length > 0 ? cycle[0].replace(regex.clear.for, '') : false

      if (cycle) {
        let multiples = ''; let temporaryComponent

        // Replace the single <Component /> element with multiple elements like this <Component1 />..<Component2 />
        this.variables[cycle].forEach((v, i) => { multiples += `<${name}${i} />` })

        // Replace the single <Component /> in the template with the multiples
        template = template.replace(component, multiples)

        // Cycle through the cycle variable
        _.forEach(this.variables[cycle], (variable, index) => {
          // Isolate the component inside a temporary one
          temporaryComponent = _components[name]

          // Parse the variables of this component with the current variables
          temporaryComponent = this.parseVariables(temporaryComponent, variable)

          // Replace the <Component$N /> with the component code
          template = template.replace(`<${name}${index} />`, temporaryComponent)
        })
      } else {
      // Replace the component declaration with its code
        template = template.replace(component, _components[name])
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
    _.forEach(variables, (variable, index) => {
      let key

      // Get the key of the variable
      key = variable.replace(regex.clear.variable, '')

      // Replace the variable declaration with its key
      template = template.replace(variable, _variables[key])
    })

    return template
  }

  compile () {
    let build, path

    build = this.parseComponents(this.template, this.components)
    build = this.parseVariables(build, this.variables)

    path = `./build/${this.name}`

    if (!fs.existsSync(path)) fs.mkdirSync(path)

    fs.writeFileSync(path, build, 'utf8')
  }
}

module.exports = SolidTemplateBuilder
