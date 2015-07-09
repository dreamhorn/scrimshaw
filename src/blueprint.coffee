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
    if overrides is undefined or _.isEmpty overrides
      bp = this
    else
      bp = this.extend(overrides)

    # If a function, it should be a function that returns an instantiated object.
    if _.isFunction bp.make_type
      result = bp.make_type()
    else
      result = Object.create bp.make_type

    for name in bp.export_attributes
      result[name] = bp.get name

    return result

  generate: (overrides) ->
    bp = this.create()
    return bp.export()

}


module.exports = Blueprint
