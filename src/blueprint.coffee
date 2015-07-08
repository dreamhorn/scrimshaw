"use strict"
_ = require('lodash')


Blueprint = {
  make_type: {}

  export_attributes: []

  cache: {}

  create: () ->
    bp = Object.create this
    bp.cache = {}
    return bp

  extend: (body) ->
    bp = this.create()
    _.assign bp, body
    return bp

  get: (name) ->
    if name of @cache
      return @cache[name]

    value = this[name]
    if _.isFunction value
      value = value.apply(this)

    @cache[name] = value
    return value

  export: (overrides) ->
    if overrides is undefined
      overrides = {}

    # If a function, it should be a function that returns an instantiated object.
    if _.isFunction this.make_type
      result = this.make_type()
    else
      result = Object.create this.make_type

    for name in this.export_attributes
      if name of overrides
        result[name] = overrides[name]
      else
        result[name] = this.get name

    return result

  generate: (overrides) ->
    bp = this.create()
    return bp.export overrides

}


module.exports = Blueprint
