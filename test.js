var chai = require('chai');
var _ = require('lodash');
var Blueprint = require("./lib/blueprint");

var expect = chai.expect;

describe('blueprint', function () {
  var TestBlueprint = Blueprint.extend({
    export_attributes: [
      'foo',
      'bar',
    ],

    foo: function () {
      var max = 10;
      var min = 0;
      return Math.floor(Math.random() * (max - min + 1)) + min;
    },

    incr: 5,

    bar: function () {
      return this.get('foo') + this.get('incr');
    }
  });

  describe('#create()', function () {
    it('should create a new instance of the blueprint', function () {
      var bp = TestBlueprint.create();
      expect(bp).to.not.equal(TestBlueprint);
    });
  });

  describe('#extend()', function () {
    it('should extend the Blueprint with custom attributes', function () {
      var Extended = Blueprint.extend({
        foo: 'bar'
      });
      expect(Extended.foo).to.equal('bar');
      expect(Blueprint.foo).to.be.undefined;
    });
  });

  describe('#get()', function () {
    it('should get an attribute and cache it', function () {
      var result = TestBlueprint.get('foo');
      expect(result).to.be.within(0, 10);
      expect(TestBlueprint.get('foo')).to.equal(result);
      expect(TestBlueprint.get('bar')).to.equal(result + TestBlueprint.incr);
    });
  });

  describe('#generate()', function () {
    it('should generate an object from the blueprint', function () {
      var result = TestBlueprint.generate();
      expect(result.foo).to.be.within(0, 10);
      expect(result.bar).to.be.within(5, 15);
      expect(result.incr).to.be.undefined;
    });

    it('should generate an object from a blueprint extended by overrides', function () {
      var result = TestBlueprint.generate({foo: 5});
      expect(result.foo).to.equal(5);
      expect(result.bar).to.equal(10);
      expect(result.incr).to.be.undefined;
    });
  });

});
