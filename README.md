scrimshaw
=========

Magical blueprints for procedural generation of content.

- [Installing](#installing)
- [Getting Started](#getting-started)
- [Reference](#reference)
- [Acknowledgements](#acknowledgements)


Installing
----------

To install, use `npm`:

```
npm install scrimshaw
```

Alternately, you can find the source [on Github](https://github.com/dreamhorn/scrimshaw).


Getting Started
---------------

`scrimshaw` provides the Scrimshaw object. You can require it directly:

```
var Scrimshaw = require('scrimshaw');
```


Reference
---------

`scrimshaw` provides a simple interface that is designed to be extensible. In
fact, by itself, the base Scrimshaw won't do very much at all.


- [The `Scrimshaw` object](#scrimshaw)—Overview and Usage
- [`#create()`](#create)—for copying a Scrimshaw
- [`#export()`](#export)—for reifying a particular Scrimshaw
- [`#extend()`](#extend)—for subclassing a Scrimshaw
- [`#generate()`](#generate)—for reifying a generic Scrimshaw
- [`#get()`](#get)—for accessing static and dynamic attributes


### Scrimshaw

A Scrimshaw is a plan for building a procedural data object. You define a
Scrimshaw "subclass" with static and dynamic members, a list of attributes to
export, and an output type to fill with the results.

    var Scrimshaw = require('scrimshaw');

    // We'll use the Ivoire framework for our randomization,
    // but you could use anything:
    var Ivoire = require('ivoire');

    // A simple NPC
    var NPC = function NPC() {};
    NPC.prototype.say = function (message) {
      console.log(this.name + " says " + message);
    }

    var NPCScrimshaw = Ivoire.Scrimshaw.extend({
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
        // scrimshaw.
        var sex = this.get('sex');

        if (sex == 'male') {
          return this.ivoire.pick(['Joseph', 'Samuel']);
        } else {
          return this.ivoire.pick(['Josie', 'Samantha']);
        }
      }
    });

    // Pass in an ivoire instance to the generator:
    var npc = NPCScrimshaw.generate();

    // Or don't, which will give a randomly-seeded NPC:
    npc = NPCScrimshaw.generate();
    console.log(npc.name, npc.sex);
    npc.say("Hello, world!");


    // We can extend an existing scrimshaw to make new derived scrimshaws:
    var PoliceNPCScrimshaw = NPCScrimshaw.extend({
      job: "police"
    });

    var police_npc = PoliceNPCScrimshaw.generate();
    console.log(npc.name, npc.sex);
    police_npc.say("Hello, citizen!");


The base Scrimshaw provides a minimal interface and a pattern for
extension. You create a scrimshaw by extending another scrimshaw, or the base
Scrimshaw. You specify which "attributes" to export (the `export_attributes`
array) and the type to export the attributes to (`make_type`, defaulting to
`{}`). Then you define the attributes as static members or dynamic
functions. Dynamic attributes can depend on other attributes using the `#get()`
method.

### #create()

#### Syntax

    scrimshaw.create()

#### Usage

`#create()` will create a new copy of the scrimshaw in question, with a fresh
cache.


### #export()

#### Syntax

    scrimshaw.export([overrides])

#### Usage

`#export()` will evaluate all `#exported_attributes` and export them to the
result of `#make_type`. `#export()` is idempotent: because `#get()` caches the
results of dynamic attributes, subsequent calls to `#export()` should produce
identical results.

If an `overrides` object is provided to `#export()`, the attributes will be
exported from an extended version of the scrimshaw instead. This allows
dependent dynamic attributes to be affected by the overrides.

`#export(overrides)` should be idempotent for subsequent calls with identical
overrides.


### #extend()

#### Syntax

    scrimshaw.extend(body)

#### Usage

To create a new scrimshaw, `extend` an existing one, or the base
`Scrimshaw` object, providing attributes and overrides:

    var NPCScrimshaw = Scrimshaw.extend({
      export_attributes: [
        'job'
      ],
      job: "worker"
    });

    var PoliceNPCScrimshaw = NPCScrimshaw.extend({
      job: "police"
    });

    var SecretaryNPCScrimshaw = NPCScrimshaw.extend({
      job: "secretary"
    })


### #generate()

#### Syntax

    scrimshaw.generate([overrides])

#### Usage

Generate a new `make_type`, exporting attributes from a new scrimshaw with a
fresh cache, and ignoring any existing cache on this scrimshaw.

    var RandomScrimshaw = Scrimshaw.extend({
      export_attributes: [
        'foo'
      ],
      foo: function () {
        return Math.random();
      }
    });

    // Subsequent calls to `#generate()` produce fresh instances.
    var bar = RandomScrimshaw.generate();
    var baz = RandomScrimshaw.generate();
    bar.foo != baz.foo;

If `overrides` are provided to `#generate()`, the scrimshaw will be extended
with the overrides before exporting its attributes. This allows us to specify,
for instance, a custom randomizer object at generation time:

    var RandomScrimshaw = Scrimshaw.extend({
      export_attributes: [
        'foo'
      ],

      foo: function () {
        // Note: `ivoire` will be undefined on the unmodified scrimshaw.
        ivoire = this.get('ivoire');
        return ivoire.natural();
      }
    });

    // Subsequent calls to `#generate()` produce fresh instances.  Supplying
    // the `ivoire` object in the overrides satisfies the dependency in `foo`.
    var bar = RandomScrimshaw.generate({ivoire: new Ivoire({seed: 42})});
    var baz = RandomScrimshaw.generate({ivoire: new Ivoire({seed: 43})});

    // If the same seed were used for both calls, the resulting instances would
    // have been the same:
    bar.foo != baz.foo;



### #get(name)

#### Syntax

    scrimshaw.get(name)

#### Usage

To access a static or dynamic attribute on a scrimshaw, always use
`#get()`. This will work with either a static or dynamic attribute, and will
ensure that a dynamic variable remains constant for the scrimshaw instance.

    var RandomScrimshaw = Scrimshaw.extend({
      export_attributes: [
        'foo'
      ],
      foo: function () {
        return Math.random();
      }
    });




Acknowledgements
----------------

The idea for Scrimshaw comes from the "Blueprints" concept developed by
[Sean Howard](http://www.squidi.net/three/entry.php?id=165), though his ideas
are much richer than currently implemented in `scrimshaw`. I have also
developed a similar library for Python, called
[`blueprint`](https://github.com/eykd/blueprint).
