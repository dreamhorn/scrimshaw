var chai = require('chai');
var _ = require('lodash');
var Scrimshaw = require("./lib/scrimshaw");

var expect = chai.expect;

describe('scrimshaw', function () {
  var TestScrimshaw = Scrimshaw.extend({
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
    it('should create a new instance of the scrimshaw', function () {
      var scsh = TestScrimshaw.create();
      expect(scsh).to.not.equal(TestScrimshaw);
    });
  });

  describe('#extend()', function () {
    it('should extend the Scrimshaw with custom attributes', function () {
      var Extended = Scrimshaw.extend({
        foo: 'bar'
      });
      expect(Extended.foo).to.equal('bar');
      expect(Scrimshaw.foo).to.be.undefined;
    });
  });

  describe('#get()', function () {
    it('should get an attribute and cache it', function () {
      var result = TestScrimshaw.get('foo');
      expect(result).to.be.within(0, 10);
      expect(TestScrimshaw.get('foo')).to.equal(result);
      expect(TestScrimshaw.get('bar')).to.equal(result + TestScrimshaw.incr);
    });
  });

  describe('#generate()', function () {
    it('should generate an object from the scrimshaw', function () {
      var result = TestScrimshaw.generate();
      expect(result.foo).to.be.within(0, 10);
      expect(result.bar).to.be.within(5, 15);
      expect(result.incr).to.be.undefined;
    });

    it('should generate an object from a scrimshaw extended by overrides', function () {
      var result = TestScrimshaw.generate({foo: 5});
      expect(result.foo).to.equal(5);
      expect(result.bar).to.equal(10);
      expect(result.incr).to.be.undefined;
    });
  });

});
