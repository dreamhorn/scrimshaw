blueprint
=========

Magical blueprints for procedural generation of content.

- [Installing](#installing)
- [Getting Started](#getting-started)
- [Reference](#reference)


Installing
----------

To install, use `npm`:

```
npm install blueprint
```

Alternately, you can find the source [on Github](https://github.com/dreamhorn/blueprint).


Getting Started
---------------

`blueprint` provides the Blueprint object. You can require it directly:

```
var Blueprint = require('blueprint');
```


Reference
---------

`blueprint` provides a simple interface that is designed to be extensible. In
fact, by itself, the base Blueprint won't do very much at all.


- [The Blueprint object](#blueprint)—Overview and Usage
- [#create()](#create)—for copying a Blueprint
- [#export()](#export)—for reifying a particular Blueprint
- [#extend()](#extend)—for subclassing a Blueprint
- [#generate()](#generate)—for reifying a generic Blueprint
- [#get()](#get)—for accessing static and dynamic attributes


### Blueprint

A Blueprint is a plan for building a procedural data object. You define a
Blueprint "subclass" with static and dynamic members, a list of attributes to
export, and an output type to fill with the results.

    var Blueprint = require('blueprint');

    // We'll use the Ivoire framework for our randomization,
    // but you could use anything:
    var Ivoire = require('ivoire');

    // A simple NPC
    var NPC = function NPC() {};
    NPC.prototype.say = function (message) {
      console.log(this.name + " says " + message);
    }

    var NPCBlueprint = Ivoire.Blueprint.extend({
      export_attributes: [
        'name',
        'sex',
        'job'
      ],

      // Instead of the default vanilla object, make an NPC object. If
      // make_type is a function, it must return the object it is making.
      make_type: function () { return new NPC() },

      // This Ivoire instance isn't in `exported_attributes`, so it won't be copied
      // to the generated object.
      ivoire: new Ivoire(),

      // Static attributes are simple values
      job: "worker",

      // Dynamic attributes are functions
      sex: function () {
        return this.ivoire.pick(['male', 'female'])
      },

      name: function () {

        // We use the special `#get()` function to access other attributes. This
        // ensures that the value we receive will be constant for each instance of the
        // blueprint.
        var sex = this.get('sex');

        if (sex == 'male') {
          return this.ivoire.pick(['Joseph', 'Samuel']);
        } else {
          return this.ivoire.pick(['Josie', 'Samantha']);
        }
      }
    });

    // Pass in an ivoire instance to the generator:
    var npc = NPCBlueprint.generate();

    // Or don't, which will give a randomly-seeded NPC:
    npc = NPCBlueprint.generate();
    console.log(npc.name, npc.sex);
    npc.say("Hello, world!");


    // We can extend an existing blueprint to make new derived blueprints:
    var PoliceNPCBlueprint = NPCBlueprint.extend({
      job: "police"
    });

    var police_npc = PoliceNPCBlueprint.generate();
    console.log(npc.name, npc.sex);
    police_npc.say("Hello, citizen!");


The base Blueprint provides a minimal interface and a pattern for
extension. You create a blueprint by extending another blueprint, or the base
Blueprint. You specify which "attributes" to export (the `export_attributes`
array) and the type to export the attributes to (`make_type`, defaulting to
`{}`). Then you define the attributes as static members or dynamic
functions. Dynamic attributes can depend on other attributes using the `#get()`
method.

### #create()

#### Syntax

    blueprint.create()

#### Usage

`#create()` will create a new copy of the blueprint in question, with a fresh
cache.


### #export()

#### Syntax

    blueprint.export([overrides])

#### Usage

`#export()` will evaluate all `#exported_attributes` and export them to the
result of `#make_type`. `#export()` is idempotent: because `#get()` caches the
results of dynamic attributes, subsequent calls to `#export()` should produce
identical results.

If an `overrides` object is provided to `#export()`, the attributes will be
exported from an extended version of the blueprint instead. This allows
dependent dynamic attributes to be affected by the overrides.

`#export(overrides)` should be idempotent for subsequent calls with identical
overrides.


### #extend()

#### Syntax

    blueprint.extend(body)

#### Usage

To create a new blueprint, `extend` an existing one, or the base
`Blueprint` object, providing attributes and overrides:

    var NPCBlueprint = Blueprint.extend({
      export_attributes: [
        'job'
      ],
      job: "worker"
    });

    var PoliceNPCBlueprint = NPCBlueprint.extend({
      job: "police"
    });

    var SecretaryNPCBlueprint = NPCBlueprint.extend({
      job: "secretary"
    })


### #generate()

#### Syntax

    blueprint.generate([overrides])

#### Usage

Generate a new `make_type`, exporting attributes from a new blueprint with a
fresh cache, and ignoring any existing cache on this blueprint.

    var RandomBlueprint = Blueprint.extend({
      export_attributes: [
        'foo'
      ],
      foo: function () {
        return Math.random();
      }
    });

    // Subsequent calls to `#generate()` produce fresh instances.
    var bar = RandomBlueprint.generate();
    var baz = RandomBlueprint.generate();
    bar.foo != baz.foo;

If `overrides` are provided to `#generate()`, the blueprint will be extended
with the overrides before exporting its attributes. This allows us to specify,
for instance, a custom randomizer object at generation time:

    var RandomBlueprint = Blueprint.extend({
      export_attributes: [
        'foo'
      ],

      foo: function () {
        // Note: `ivoire` will be undefined on the unmodified blueprint.
        ivoire = this.get('ivoire');
        return ivoire.natural();
      }
    });

    // Subsequent calls to `#generate()` produce fresh instances.  Supplying
    // the `ivoire` object in the overrides satisfies the dependency in `foo`.
    var bar = RandomBlueprint.generate({ivoire: new Ivoire({seed: 42})});
    var baz = RandomBlueprint.generate({ivoire: new Ivoire({seed: 43})});

    // If the same seed were used for both calls, the resulting instances would
    // have been the same:
    bar.foo != baz.foo;



### #get(name)

#### Syntax

    blueprint.get(name)

#### Usage

To access a static or dynamic attribute on a blueprint, always use
`#get()`. This will work with either a static or dynamic attribute, and will
ensure that a dynamic variable remains constant for the blueprint instance.

    var RandomBlueprint = Blueprint.extend({
      export_attributes: [
        'foo'
      ],
      foo: function () {
        return Math.random();
      }
    });




Acknowledgements
----------------

The idea and the name comes from the "Blueprints" concept developed by
[Sean Howard](http://www.squidi.net/three/entry.php?id=165), though his ideas
are much richer than currently implemented in `blueprint`.
