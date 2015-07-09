"use strict"
_ = require('lodash')


Scrimshaw = {
  make_type: {}

  export_attributes: []

  cache: {}

  create: () ->
    scsh = Object.create this
    scsh.cache = {}
    return scsh

  extend: (body) ->
    scsh = this.create()
    _.assign scsh, body
    return scsh

  get: (name) ->
    if name of @cache
      return @cache[name]

    value = this[name]
    if _.isFunction value
      value = value.apply(this)

    @cache[name] = value
    return value

  export: (overrides) ->
    if overrides is undefined or _.isEmpty overrides
      scsh = this
    else
      scsh = this.extend(overrides)

    # If a function, it should be a function that returns an instantiated object.
    if _.isFunction scsh.make_type
      result = scsh.make_type()
    else
      result = Object.create scsh.make_type

    for name in scsh.export_attributes
      result[name] = scsh.get name

    return result

  generate: (overrides) ->
    scsh = this.create()
    return scsh.export(overrides)

}


module.exports = Scrimshaw
