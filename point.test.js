var test = 0;
function assert(truth, error) {
   if (!truth) {
      console.error('FAILED test', test + ':', error);
   }
   test ++;
}

var creations = 0;
var allocations = 0;

var _pool_Point = [];
var TEMP = 'temporary';

var Point = function(x, y, temporary) {
   this.x = x = x || 0;
   this.y = y || (y === 0 ? 0 : x);
   if (temporary) {
      _pool_Point.push(this);
   }
};

Point.create = function(x, y, temporary) {
   creations ++;
   if (_pool_Point.length > 0) {
      var point = _pool_Point[0];
      if (!temporary) {
         _pool_Point.shift();
      }

      point.x = x;
      point.y = y;

      return point;
   }
   else {
      allocations ++;
      return new Point(x, y, temporary);
   }
};

Point.temp = function(x, y) { return Point.create(x, y, TEMP); };
function OperateAndFreeThis(fn) { 
   return function() {
      var result = fn.apply(this, arguments);
      this.free();
      return result;
   };
}
function OperateAndFree(fn) { 
   return function() {
      return fn.apply(this, arguments).free();
   };
}

Point.prototype.free = function() {
   if (this.freed) throw 'Point already freed';
   _pool_Point.push(this);
   return this; // Enable ...chaining...
}

Point.prototype.equal = function(other) {
   return this.x === other.x && this.y === other.y;
};

Point.prototype.add = function(other, y) {
   if (typeof(y) !== 'undefined') {
      other = Point.temp(other, y);
   }
   return Point.create(this.x + other.x, this.y + other.y);
};

Point.prototype.mult = function(other) {
   return Point.create(this.x * (other.x || other), this.y * (other.y || other));
};

Point.prototype.sub = function(other) {
   return this.add(other.mult(-1, TEMP));
};

Point.prototype.length = function(other) {
   return Math.sqrt(this.x * this.x + this.y * this.y);
};

Point.prototype.rotate = function(angle) {
   var sin = Math.sin(angle);
   var cos = Math.cos(angle);

   return new Point(cos * this.x - sin * this.y,
                          sin * this.x + cos * this.y);
};

Point.prototype.distance = function(other) {
   return this.sub(other)._length();
};

Point.prototype._ = Point.prototype.free;
Point.prototype._add = OperateAndFreeThis(Point.prototype.add);
Point.prototype._sub = OperateAndFreeThis(Point.prototype.mult);
Point.prototype._mult = OperateAndFreeThis(Point.prototype.mult);
Point.prototype._rotate = OperateAndFreeThis(Point.prototype.rotate);
Point.prototype._equal = OperateAndFreeThis(Point.prototype.equal);
Point.prototype._length = OperateAndFreeThis(Point.prototype.length);

console.log('Beginning test...\n');

var pointA = Point.create(10, 8);
var pointB = Point.create(10, 8);
assert( pointA.equal(pointB), 'equal an equivalent point');
assert(!pointA.equal(Point.temp(10, 9)), 'not equal a different point');
assert(!pointA.equal(Point.temp(9,  8)), 'not equal a different point');

assert(pointB.free() === pointB, 'not lose reference on free()');
assert((allocations - _pool_Point.length) === 1 /* pointA */, 'have been freed');

var pointB = Point.create(8, 6);
assert(pointB.equal(Point.temp(8, 6)), 'be { 8, 6 }');

assert(pointA.equal(Point.temp(10, 8)), 'equal { 10, 8 }');
assert(pointB.equal(Point.temp(8, 6)), 'equal { 8, 6 }');

assert(pointA.add(pointB)._equal(pointB.add(pointA).free()), 'add commutatively');
assert(!pointA.add(pointA)._equal(pointB.mult(2).free()), 'perform basic point testing');
assert(pointA.add(pointA)._equal(pointA.mult(2).free()), 'multiply by 2 correctly');
assert(pointA.add(pointA)
            ._add(pointB)
            ._add(pointB)
            ._equal(pointB.mult(2)
                          ._add(pointA.mult(2)
                                      .free()).free()), 'multiply by 2 correctly');

assert(pointA.equal(Point.temp(10, 8)), 'equal { 10, 8 }');
assert(pointB.equal(Point.temp(8, 6)), 'equal { 8, 6 }');

assert((allocations - _pool_Point.length) === 2 /* pointA, pointB */, 'have 2 references left');

pointA.free();
pointB.free();

console.log('\nTest complete.');
console.log('Point creations: ', creations);
console.log('Point allocations: ', allocations);
console.log('Remaining point objects: ', allocations - _pool_Point.length);
