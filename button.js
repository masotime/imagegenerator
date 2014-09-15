;(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){


//
// The shims in this file are not fully implemented shims for the ES5
// features, but do work for the particular usecases there is in
// the other modules.
//

var toString = Object.prototype.toString;
var hasOwnProperty = Object.prototype.hasOwnProperty;

// Array.isArray is supported in IE9
function isArray(xs) {
  return toString.call(xs) === '[object Array]';
}
exports.isArray = typeof Array.isArray === 'function' ? Array.isArray : isArray;

// Array.prototype.indexOf is supported in IE9
exports.indexOf = function indexOf(xs, x) {
  if (xs.indexOf) return xs.indexOf(x);
  for (var i = 0; i < xs.length; i++) {
    if (x === xs[i]) return i;
  }
  return -1;
};

// Array.prototype.filter is supported in IE9
exports.filter = function filter(xs, fn) {
  if (xs.filter) return xs.filter(fn);
  var res = [];
  for (var i = 0; i < xs.length; i++) {
    if (fn(xs[i], i, xs)) res.push(xs[i]);
  }
  return res;
};

// Array.prototype.forEach is supported in IE9
exports.forEach = function forEach(xs, fn, self) {
  if (xs.forEach) return xs.forEach(fn, self);
  for (var i = 0; i < xs.length; i++) {
    fn.call(self, xs[i], i, xs);
  }
};

// Array.prototype.map is supported in IE9
exports.map = function map(xs, fn) {
  if (xs.map) return xs.map(fn);
  var out = new Array(xs.length);
  for (var i = 0; i < xs.length; i++) {
    out[i] = fn(xs[i], i, xs);
  }
  return out;
};

// Array.prototype.reduce is supported in IE9
exports.reduce = function reduce(array, callback, opt_initialValue) {
  if (array.reduce) return array.reduce(callback, opt_initialValue);
  var value, isValueSet = false;

  if (2 < arguments.length) {
    value = opt_initialValue;
    isValueSet = true;
  }
  for (var i = 0, l = array.length; l > i; ++i) {
    if (array.hasOwnProperty(i)) {
      if (isValueSet) {
        value = callback(value, array[i], i, array);
      }
      else {
        value = array[i];
        isValueSet = true;
      }
    }
  }

  return value;
};

// String.prototype.substr - negative index don't work in IE8
if ('ab'.substr(-1) !== 'b') {
  exports.substr = function (str, start, length) {
    // did we get a negative start, calculate how much it is from the beginning of the string
    if (start < 0) start = str.length + start;

    // call the original function
    return str.substr(start, length);
  };
} else {
  exports.substr = function (str, start, length) {
    return str.substr(start, length);
  };
}

// String.prototype.trim is supported in IE9
exports.trim = function (str) {
  if (str.trim) return str.trim();
  return str.replace(/^\s+|\s+$/g, '');
};

// Function.prototype.bind is supported in IE9
exports.bind = function () {
  var args = Array.prototype.slice.call(arguments);
  var fn = args.shift();
  if (fn.bind) return fn.bind.apply(fn, args);
  var self = args.shift();
  return function () {
    fn.apply(self, args.concat([Array.prototype.slice.call(arguments)]));
  };
};

// Object.create is supported in IE9
function create(prototype, properties) {
  var object;
  if (prototype === null) {
    object = { '__proto__' : null };
  }
  else {
    if (typeof prototype !== 'object') {
      throw new TypeError(
        'typeof prototype[' + (typeof prototype) + '] != \'object\''
      );
    }
    var Type = function () {};
    Type.prototype = prototype;
    object = new Type();
    object.__proto__ = prototype;
  }
  if (typeof properties !== 'undefined' && Object.defineProperties) {
    Object.defineProperties(object, properties);
  }
  return object;
}
exports.create = typeof Object.create === 'function' ? Object.create : create;

// Object.keys and Object.getOwnPropertyNames is supported in IE9 however
// they do show a description and number property on Error objects
function notObject(object) {
  return ((typeof object != "object" && typeof object != "function") || object === null);
}

function keysShim(object) {
  if (notObject(object)) {
    throw new TypeError("Object.keys called on a non-object");
  }

  var result = [];
  for (var name in object) {
    if (hasOwnProperty.call(object, name)) {
      result.push(name);
    }
  }
  return result;
}

// getOwnPropertyNames is almost the same as Object.keys one key feature
//  is that it returns hidden properties, since that can't be implemented,
//  this feature gets reduced so it just shows the length property on arrays
function propertyShim(object) {
  if (notObject(object)) {
    throw new TypeError("Object.getOwnPropertyNames called on a non-object");
  }

  var result = keysShim(object);
  if (exports.isArray(object) && exports.indexOf(object, 'length') === -1) {
    result.push('length');
  }
  return result;
}

var keys = typeof Object.keys === 'function' ? Object.keys : keysShim;
var getOwnPropertyNames = typeof Object.getOwnPropertyNames === 'function' ?
  Object.getOwnPropertyNames : propertyShim;

if (new Error().hasOwnProperty('description')) {
  var ERROR_PROPERTY_FILTER = function (obj, array) {
    if (toString.call(obj) === '[object Error]') {
      array = exports.filter(array, function (name) {
        return name !== 'description' && name !== 'number' && name !== 'message';
      });
    }
    return array;
  };

  exports.keys = function (object) {
    return ERROR_PROPERTY_FILTER(object, keys(object));
  };
  exports.getOwnPropertyNames = function (object) {
    return ERROR_PROPERTY_FILTER(object, getOwnPropertyNames(object));
  };
} else {
  exports.keys = keys;
  exports.getOwnPropertyNames = getOwnPropertyNames;
}

// Object.getOwnPropertyDescriptor - supported in IE8 but only on dom elements
function valueObject(value, key) {
  return { value: value[key] };
}

if (typeof Object.getOwnPropertyDescriptor === 'function') {
  try {
    Object.getOwnPropertyDescriptor({'a': 1}, 'a');
    exports.getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;
  } catch (e) {
    // IE8 dom element issue - use a try catch and default to valueObject
    exports.getOwnPropertyDescriptor = function (value, key) {
      try {
        return Object.getOwnPropertyDescriptor(value, key);
      } catch (e) {
        return valueObject(value, key);
      }
    };
  }
} else {
  exports.getOwnPropertyDescriptor = valueObject;
}

},{}],2:[function(require,module,exports){

// not implemented
// The reason for having an empty file and not throwing is to allow
// untraditional implementation of this module.

},{}],3:[function(require,module,exports){
var process=require("__browserify_process");// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

var util = require('util');
var shims = require('_shims');

// resolves . and .. elements in a path array with directory names there
// must be no slashes, empty elements, or device names (c:\) in the array
// (so also no leading and trailing slashes - it does not distinguish
// relative and absolute paths)
function normalizeArray(parts, allowAboveRoot) {
  // if the path tries to go above the root, `up` ends up > 0
  var up = 0;
  for (var i = parts.length - 1; i >= 0; i--) {
    var last = parts[i];
    if (last === '.') {
      parts.splice(i, 1);
    } else if (last === '..') {
      parts.splice(i, 1);
      up++;
    } else if (up) {
      parts.splice(i, 1);
      up--;
    }
  }

  // if the path is allowed to go above the root, restore leading ..s
  if (allowAboveRoot) {
    for (; up--; up) {
      parts.unshift('..');
    }
  }

  return parts;
}

// Split a filename into [root, dir, basename, ext], unix version
// 'root' is just a slash, or nothing.
var splitPathRe =
    /^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/;
var splitPath = function(filename) {
  return splitPathRe.exec(filename).slice(1);
};

// path.resolve([from ...], to)
// posix version
exports.resolve = function() {
  var resolvedPath = '',
      resolvedAbsolute = false;

  for (var i = arguments.length - 1; i >= -1 && !resolvedAbsolute; i--) {
    var path = (i >= 0) ? arguments[i] : process.cwd();

    // Skip empty and invalid entries
    if (!util.isString(path)) {
      throw new TypeError('Arguments to path.resolve must be strings');
    } else if (!path) {
      continue;
    }

    resolvedPath = path + '/' + resolvedPath;
    resolvedAbsolute = path.charAt(0) === '/';
  }

  // At this point the path should be resolved to a full absolute path, but
  // handle relative paths to be safe (might happen when process.cwd() fails)

  // Normalize the path
  resolvedPath = normalizeArray(shims.filter(resolvedPath.split('/'), function(p) {
    return !!p;
  }), !resolvedAbsolute).join('/');

  return ((resolvedAbsolute ? '/' : '') + resolvedPath) || '.';
};

// path.normalize(path)
// posix version
exports.normalize = function(path) {
  var isAbsolute = exports.isAbsolute(path),
      trailingSlash = shims.substr(path, -1) === '/';

  // Normalize the path
  path = normalizeArray(shims.filter(path.split('/'), function(p) {
    return !!p;
  }), !isAbsolute).join('/');

  if (!path && !isAbsolute) {
    path = '.';
  }
  if (path && trailingSlash) {
    path += '/';
  }

  return (isAbsolute ? '/' : '') + path;
};

// posix version
exports.isAbsolute = function(path) {
  return path.charAt(0) === '/';
};

// posix version
exports.join = function() {
  var paths = Array.prototype.slice.call(arguments, 0);
  return exports.normalize(shims.filter(paths, function(p, index) {
    if (!util.isString(p)) {
      throw new TypeError('Arguments to path.join must be strings');
    }
    return p;
  }).join('/'));
};


// path.relative(from, to)
// posix version
exports.relative = function(from, to) {
  from = exports.resolve(from).substr(1);
  to = exports.resolve(to).substr(1);

  function trim(arr) {
    var start = 0;
    for (; start < arr.length; start++) {
      if (arr[start] !== '') break;
    }

    var end = arr.length - 1;
    for (; end >= 0; end--) {
      if (arr[end] !== '') break;
    }

    if (start > end) return [];
    return arr.slice(start, end - start + 1);
  }

  var fromParts = trim(from.split('/'));
  var toParts = trim(to.split('/'));

  var length = Math.min(fromParts.length, toParts.length);
  var samePartsLength = length;
  for (var i = 0; i < length; i++) {
    if (fromParts[i] !== toParts[i]) {
      samePartsLength = i;
      break;
    }
  }

  var outputParts = [];
  for (var i = samePartsLength; i < fromParts.length; i++) {
    outputParts.push('..');
  }

  outputParts = outputParts.concat(toParts.slice(samePartsLength));

  return outputParts.join('/');
};

exports.sep = '/';
exports.delimiter = ':';

exports.dirname = function(path) {
  var result = splitPath(path),
      root = result[0],
      dir = result[1];

  if (!root && !dir) {
    // No dirname whatsoever
    return '.';
  }

  if (dir) {
    // It has a dirname, strip trailing slash
    dir = dir.substr(0, dir.length - 1);
  }

  return root + dir;
};


exports.basename = function(path, ext) {
  var f = splitPath(path)[2];
  // TODO: make this comparison case-insensitive on windows?
  if (ext && f.substr(-1 * ext.length) === ext) {
    f = f.substr(0, f.length - ext.length);
  }
  return f;
};


exports.extname = function(path) {
  return splitPath(path)[3];
};

},{"__browserify_process":5,"_shims":1,"util":4}],4:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

var shims = require('_shims');

var formatRegExp = /%[sdj%]/g;
exports.format = function(f) {
  if (!isString(f)) {
    var objects = [];
    for (var i = 0; i < arguments.length; i++) {
      objects.push(inspect(arguments[i]));
    }
    return objects.join(' ');
  }

  var i = 1;
  var args = arguments;
  var len = args.length;
  var str = String(f).replace(formatRegExp, function(x) {
    if (x === '%%') return '%';
    if (i >= len) return x;
    switch (x) {
      case '%s': return String(args[i++]);
      case '%d': return Number(args[i++]);
      case '%j':
        try {
          return JSON.stringify(args[i++]);
        } catch (_) {
          return '[Circular]';
        }
      default:
        return x;
    }
  });
  for (var x = args[i]; i < len; x = args[++i]) {
    if (isNull(x) || !isObject(x)) {
      str += ' ' + x;
    } else {
      str += ' ' + inspect(x);
    }
  }
  return str;
};

/**
 * Echos the value of a value. Trys to print the value out
 * in the best way possible given the different types.
 *
 * @param {Object} obj The object to print out.
 * @param {Object} opts Optional options object that alters the output.
 */
/* legacy: obj, showHidden, depth, colors*/
function inspect(obj, opts) {
  // default options
  var ctx = {
    seen: [],
    stylize: stylizeNoColor
  };
  // legacy...
  if (arguments.length >= 3) ctx.depth = arguments[2];
  if (arguments.length >= 4) ctx.colors = arguments[3];
  if (isBoolean(opts)) {
    // legacy...
    ctx.showHidden = opts;
  } else if (opts) {
    // got an "options" object
    exports._extend(ctx, opts);
  }
  // set default options
  if (isUndefined(ctx.showHidden)) ctx.showHidden = false;
  if (isUndefined(ctx.depth)) ctx.depth = 2;
  if (isUndefined(ctx.colors)) ctx.colors = false;
  if (isUndefined(ctx.customInspect)) ctx.customInspect = true;
  if (ctx.colors) ctx.stylize = stylizeWithColor;
  return formatValue(ctx, obj, ctx.depth);
}
exports.inspect = inspect;


// http://en.wikipedia.org/wiki/ANSI_escape_code#graphics
inspect.colors = {
  'bold' : [1, 22],
  'italic' : [3, 23],
  'underline' : [4, 24],
  'inverse' : [7, 27],
  'white' : [37, 39],
  'grey' : [90, 39],
  'black' : [30, 39],
  'blue' : [34, 39],
  'cyan' : [36, 39],
  'green' : [32, 39],
  'magenta' : [35, 39],
  'red' : [31, 39],
  'yellow' : [33, 39]
};

// Don't use 'blue' not visible on cmd.exe
inspect.styles = {
  'special': 'cyan',
  'number': 'yellow',
  'boolean': 'yellow',
  'undefined': 'grey',
  'null': 'bold',
  'string': 'green',
  'date': 'magenta',
  // "name": intentionally not styling
  'regexp': 'red'
};


function stylizeWithColor(str, styleType) {
  var style = inspect.styles[styleType];

  if (style) {
    return '\u001b[' + inspect.colors[style][0] + 'm' + str +
           '\u001b[' + inspect.colors[style][1] + 'm';
  } else {
    return str;
  }
}


function stylizeNoColor(str, styleType) {
  return str;
}


function arrayToHash(array) {
  var hash = {};

  shims.forEach(array, function(val, idx) {
    hash[val] = true;
  });

  return hash;
}


function formatValue(ctx, value, recurseTimes) {
  // Provide a hook for user-specified inspect functions.
  // Check that value is an object with an inspect function on it
  if (ctx.customInspect &&
      value &&
      isFunction(value.inspect) &&
      // Filter out the util module, it's inspect function is special
      value.inspect !== exports.inspect &&
      // Also filter out any prototype objects using the circular check.
      !(value.constructor && value.constructor.prototype === value)) {
    var ret = value.inspect(recurseTimes);
    if (!isString(ret)) {
      ret = formatValue(ctx, ret, recurseTimes);
    }
    return ret;
  }

  // Primitive types cannot have properties
  var primitive = formatPrimitive(ctx, value);
  if (primitive) {
    return primitive;
  }

  // Look up the keys of the object.
  var keys = shims.keys(value);
  var visibleKeys = arrayToHash(keys);

  if (ctx.showHidden) {
    keys = shims.getOwnPropertyNames(value);
  }

  // Some type of object without properties can be shortcutted.
  if (keys.length === 0) {
    if (isFunction(value)) {
      var name = value.name ? ': ' + value.name : '';
      return ctx.stylize('[Function' + name + ']', 'special');
    }
    if (isRegExp(value)) {
      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
    }
    if (isDate(value)) {
      return ctx.stylize(Date.prototype.toString.call(value), 'date');
    }
    if (isError(value)) {
      return formatError(value);
    }
  }

  var base = '', array = false, braces = ['{', '}'];

  // Make Array say that they are Array
  if (isArray(value)) {
    array = true;
    braces = ['[', ']'];
  }

  // Make functions say that they are functions
  if (isFunction(value)) {
    var n = value.name ? ': ' + value.name : '';
    base = ' [Function' + n + ']';
  }

  // Make RegExps say that they are RegExps
  if (isRegExp(value)) {
    base = ' ' + RegExp.prototype.toString.call(value);
  }

  // Make dates with properties first say the date
  if (isDate(value)) {
    base = ' ' + Date.prototype.toUTCString.call(value);
  }

  // Make error with message first say the error
  if (isError(value)) {
    base = ' ' + formatError(value);
  }

  if (keys.length === 0 && (!array || value.length == 0)) {
    return braces[0] + base + braces[1];
  }

  if (recurseTimes < 0) {
    if (isRegExp(value)) {
      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
    } else {
      return ctx.stylize('[Object]', 'special');
    }
  }

  ctx.seen.push(value);

  var output;
  if (array) {
    output = formatArray(ctx, value, recurseTimes, visibleKeys, keys);
  } else {
    output = keys.map(function(key) {
      return formatProperty(ctx, value, recurseTimes, visibleKeys, key, array);
    });
  }

  ctx.seen.pop();

  return reduceToSingleString(output, base, braces);
}


function formatPrimitive(ctx, value) {
  if (isUndefined(value))
    return ctx.stylize('undefined', 'undefined');
  if (isString(value)) {
    var simple = '\'' + JSON.stringify(value).replace(/^"|"$/g, '')
                                             .replace(/'/g, "\\'")
                                             .replace(/\\"/g, '"') + '\'';
    return ctx.stylize(simple, 'string');
  }
  if (isNumber(value))
    return ctx.stylize('' + value, 'number');
  if (isBoolean(value))
    return ctx.stylize('' + value, 'boolean');
  // For some reason typeof null is "object", so special case here.
  if (isNull(value))
    return ctx.stylize('null', 'null');
}


function formatError(value) {
  return '[' + Error.prototype.toString.call(value) + ']';
}


function formatArray(ctx, value, recurseTimes, visibleKeys, keys) {
  var output = [];
  for (var i = 0, l = value.length; i < l; ++i) {
    if (hasOwnProperty(value, String(i))) {
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
          String(i), true));
    } else {
      output.push('');
    }
  }

  shims.forEach(keys, function(key) {
    if (!key.match(/^\d+$/)) {
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
          key, true));
    }
  });
  return output;
}


function formatProperty(ctx, value, recurseTimes, visibleKeys, key, array) {
  var name, str, desc;
  desc = shims.getOwnPropertyDescriptor(value, key) || { value: value[key] };
  if (desc.get) {
    if (desc.set) {
      str = ctx.stylize('[Getter/Setter]', 'special');
    } else {
      str = ctx.stylize('[Getter]', 'special');
    }
  } else {
    if (desc.set) {
      str = ctx.stylize('[Setter]', 'special');
    }
  }

  if (!hasOwnProperty(visibleKeys, key)) {
    name = '[' + key + ']';
  }
  if (!str) {
    if (shims.indexOf(ctx.seen, desc.value) < 0) {
      if (isNull(recurseTimes)) {
        str = formatValue(ctx, desc.value, null);
      } else {
        str = formatValue(ctx, desc.value, recurseTimes - 1);
      }
      if (str.indexOf('\n') > -1) {
        if (array) {
          str = str.split('\n').map(function(line) {
            return '  ' + line;
          }).join('\n').substr(2);
        } else {
          str = '\n' + str.split('\n').map(function(line) {
            return '   ' + line;
          }).join('\n');
        }
      }
    } else {
      str = ctx.stylize('[Circular]', 'special');
    }
  }
  if (isUndefined(name)) {
    if (array && key.match(/^\d+$/)) {
      return str;
    }
    name = JSON.stringify('' + key);
    if (name.match(/^"([a-zA-Z_][a-zA-Z_0-9]*)"$/)) {
      name = name.substr(1, name.length - 2);
      name = ctx.stylize(name, 'name');
    } else {
      name = name.replace(/'/g, "\\'")
                 .replace(/\\"/g, '"')
                 .replace(/(^"|"$)/g, "'");
      name = ctx.stylize(name, 'string');
    }
  }

  return name + ': ' + str;
}


function reduceToSingleString(output, base, braces) {
  var numLinesEst = 0;
  var length = shims.reduce(output, function(prev, cur) {
    numLinesEst++;
    if (cur.indexOf('\n') >= 0) numLinesEst++;
    return prev + cur.replace(/\u001b\[\d\d?m/g, '').length + 1;
  }, 0);

  if (length > 60) {
    return braces[0] +
           (base === '' ? '' : base + '\n ') +
           ' ' +
           output.join(',\n  ') +
           ' ' +
           braces[1];
  }

  return braces[0] + base + ' ' + output.join(', ') + ' ' + braces[1];
}


// NOTE: These type checking functions intentionally don't use `instanceof`
// because it is fragile and can be easily faked with `Object.create()`.
function isArray(ar) {
  return shims.isArray(ar);
}
exports.isArray = isArray;

function isBoolean(arg) {
  return typeof arg === 'boolean';
}
exports.isBoolean = isBoolean;

function isNull(arg) {
  return arg === null;
}
exports.isNull = isNull;

function isNullOrUndefined(arg) {
  return arg == null;
}
exports.isNullOrUndefined = isNullOrUndefined;

function isNumber(arg) {
  return typeof arg === 'number';
}
exports.isNumber = isNumber;

function isString(arg) {
  return typeof arg === 'string';
}
exports.isString = isString;

function isSymbol(arg) {
  return typeof arg === 'symbol';
}
exports.isSymbol = isSymbol;

function isUndefined(arg) {
  return arg === void 0;
}
exports.isUndefined = isUndefined;

function isRegExp(re) {
  return isObject(re) && objectToString(re) === '[object RegExp]';
}
exports.isRegExp = isRegExp;

function isObject(arg) {
  return typeof arg === 'object' && arg;
}
exports.isObject = isObject;

function isDate(d) {
  return isObject(d) && objectToString(d) === '[object Date]';
}
exports.isDate = isDate;

function isError(e) {
  return isObject(e) && objectToString(e) === '[object Error]';
}
exports.isError = isError;

function isFunction(arg) {
  return typeof arg === 'function';
}
exports.isFunction = isFunction;

function isPrimitive(arg) {
  return arg === null ||
         typeof arg === 'boolean' ||
         typeof arg === 'number' ||
         typeof arg === 'string' ||
         typeof arg === 'symbol' ||  // ES6 symbol
         typeof arg === 'undefined';
}
exports.isPrimitive = isPrimitive;

function isBuffer(arg) {
  return arg && typeof arg === 'object'
    && typeof arg.copy === 'function'
    && typeof arg.fill === 'function'
    && typeof arg.binarySlice === 'function'
  ;
}
exports.isBuffer = isBuffer;

function objectToString(o) {
  return Object.prototype.toString.call(o);
}


function pad(n) {
  return n < 10 ? '0' + n.toString(10) : n.toString(10);
}


var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep',
              'Oct', 'Nov', 'Dec'];

// 26 Feb 16:19:34
function timestamp() {
  var d = new Date();
  var time = [pad(d.getHours()),
              pad(d.getMinutes()),
              pad(d.getSeconds())].join(':');
  return [d.getDate(), months[d.getMonth()], time].join(' ');
}


// log is just a thin wrapper to console.log that prepends a timestamp
exports.log = function() {
  console.log('%s - %s', timestamp(), exports.format.apply(exports, arguments));
};


/**
 * Inherit the prototype methods from one constructor into another.
 *
 * The Function.prototype.inherits from lang.js rewritten as a standalone
 * function (not on Function.prototype). NOTE: If this file is to be loaded
 * during bootstrapping this function needs to be rewritten using some native
 * functions as prototype setup using normal JavaScript does not work as
 * expected during bootstrapping (see mirror.js in r114903).
 *
 * @param {function} ctor Constructor function which needs to inherit the
 *     prototype.
 * @param {function} superCtor Constructor function to inherit prototype from.
 */
exports.inherits = function(ctor, superCtor) {
  ctor.super_ = superCtor;
  ctor.prototype = shims.create(superCtor.prototype, {
    constructor: {
      value: ctor,
      enumerable: false,
      writable: true,
      configurable: true
    }
  });
};

exports._extend = function(origin, add) {
  // Don't do anything if add isn't an object
  if (!add || !isObject(add)) return origin;

  var keys = shims.keys(add);
  var i = keys.length;
  while (i--) {
    origin[keys[i]] = add[keys[i]];
  }
  return origin;
};

function hasOwnProperty(obj, prop) {
  return Object.prototype.hasOwnProperty.call(obj, prop);
}

},{"_shims":1}],5:[function(require,module,exports){
// shim for using process in browser

var process = module.exports = {};

process.nextTick = (function () {
    var canSetImmediate = typeof window !== 'undefined'
    && window.setImmediate;
    var canPost = typeof window !== 'undefined'
    && window.postMessage && window.addEventListener
    ;

    if (canSetImmediate) {
        return function (f) { return window.setImmediate(f) };
    }

    if (canPost) {
        var queue = [];
        window.addEventListener('message', function (ev) {
            var source = ev.source;
            if ((source === window || source === null) && ev.data === 'process-tick') {
                ev.stopPropagation();
                if (queue.length > 0) {
                    var fn = queue.shift();
                    fn();
                }
            }
        }, true);

        return function nextTick(fn) {
            queue.push(fn);
            window.postMessage('process-tick', '*');
        };
    }

    return function nextTick(fn) {
        setTimeout(fn, 0);
    };
})();

process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];

process.binding = function (name) {
    throw new Error('process.binding is not supported');
}

// TODO(shtylman)
process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};

},{}],6:[function(require,module,exports){
'use strict';


module.exports = {
	css: require('./lib/css'),
	events: require('./lib/events'),
	Storage: require('./lib/storage')
};
},{"./lib/css":7,"./lib/events":8,"./lib/storage":9}],7:[function(require,module,exports){
/* jshint quotmark:double */

"use strict";



module.exports.add = function add(el, str) {
    var re;

    if (!el) { return false; }

    if (el && el.classList && el.classList.add) {
        el.classList.add(str);
    } else {
        re = new RegExp("\\b" + str + "\\b");

        if (!re.test(el.className)) {
            el.className += " " + str;
        }
    }
};


module.exports.remove = function remove(el, str) {
    var re;

    if (!el) { return false; }

    if (el.classList && el.classList.remove) {
        el.classList.remove(str);
    } else {
        re = new RegExp("\\b" + str + "\\b");

        if (re.test(el.className)) {
            el.className = el.className.replace(re, "");
        }
    }
};


module.exports.inject = function inject(el, str) {
    var style;

    if (!el) { return false; }

    if (str) {
        style = document.createElement("style");
        style.type = "text/css";

        if (style.styleSheet) {
            style.styleSheet.cssText = str;
        } else {
            style.appendChild(document.createTextNode(str));
        }

        el.appendChild(style);
    }
};

},{}],8:[function(require,module,exports){
'use strict';


module.exports = (function (window, document) {

    var cache = [];


    // NOOP for Node
    if (!document) {
        return {
            add: function () {},
            remove: function () {}
        };
    // Non-IE events
    } else if (document.addEventListener) {
        return {

            add: function (obj, type, fn, scope) {
                scope = scope || obj;

                var wrappedFn = function (e) { fn.call(scope, e); };

                obj.addEventListener(type, wrappedFn, false);
                cache.push([obj, type, fn, wrappedFn]);
            },

            remove: function (obj, type, fn) {
                var wrappedFn, item, len = cache.length, i;

                for (i = 0; i < len; i++) {
                    item = cache[i];

                    if (item[0] === obj && item[1] === type && item[2] === fn) {
                        wrappedFn = item[3];

                        if (wrappedFn) {
                            obj.removeEventListener(type, wrappedFn, false);
                            delete cache[i];
                        }
                    }
                }
            }
        };

    // IE events
    } else if (document.attachEvent) {
        return {

            add: function (obj, type, fn, scope) {
                scope = scope || obj;

                var wrappedFn = function () {
                    var e = window.event;
                    e.target = e.target || e.srcElement;

                    e.preventDefault = function () {
                        e.returnValue = false;
                    };

                    fn.call(scope, e);
                };

                obj.attachEvent('on' + type, wrappedFn);
                cache.push([obj, type, fn, wrappedFn]);
            },

            remove: function (obj, type, fn) {
                var wrappedFn, item, len = cache.length, i;

                for (i = 0; i < len; i++) {
                    item = cache[i];

                    if (item[0] === obj && item[1] === type && item[2] === fn) {
                        wrappedFn = item[3];

                        if (wrappedFn) {
                            obj.detachEvent('on' + type, wrappedFn);
                            delete cache[i];
                        }
                    }
                }
            }
        };
    }

})(typeof window === 'undefined' ? null : window, typeof document === 'undefined' ? null : document);
},{}],9:[function(require,module,exports){
'use strict';


var Storage = module.exports = function Storage(name, duration) {
    this._name = name;
    this._duration = duration || 30;
};


var proto = Storage.prototype;


proto.load = function () {
    if (typeof window === 'object' && window.localStorage) {
        var data = window.localStorage.getItem(this._name), today, expires;

        if (data) {
            data = JSON.parse(decodeURIComponent(data));
        }

        if (data && data.expires) {
            today = new Date();
            expires = new Date(data.expires);

            if (today > expires) {
                this.destroy();
                return;
            }
        }

        return data && data.value;
    }
};


proto.save = function (data) {
    if (typeof window === 'object' && window.localStorage) {
        var expires = new Date(), wrapped;

        expires.setTime(expires.getTime() + this._duration * 24 * 60 * 60 * 1000);

        wrapped = {
            value: data,
            expires: expires.toGMTString()
        };

        window.localStorage.setItem(this._name, encodeURIComponent(JSON.stringify(wrapped)));
    }
};


proto.destroy = function () {
    if (typeof window === 'object' && window.localStorage) {
        window.localStorage.removeItem(this._name);
    }
};

},{}],10:[function(require,module,exports){

/*!
 * EJS
 * Copyright(c) 2012 TJ Holowaychuk <tj@vision-media.ca>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var utils = require('./utils')
  , path = require('path')
  , dirname = path.dirname
  , extname = path.extname
  , join = path.join
  , fs = require('fs')
  , read = fs.readFileSync;

/**
 * Filters.
 *
 * @type Object
 */

var filters = exports.filters = require('./filters');

/**
 * Intermediate js cache.
 *
 * @type Object
 */

var cache = {};

/**
 * Clear intermediate js cache.
 *
 * @api public
 */

exports.clearCache = function(){
  cache = {};
};

/**
 * Translate filtered code into function calls.
 *
 * @param {String} js
 * @return {String}
 * @api private
 */

function filtered(js) {
  return js.substr(1).split('|').reduce(function(js, filter){
    var parts = filter.split(':')
      , name = parts.shift()
      , args = parts.join(':') || '';
    if (args) args = ', ' + args;
    return 'filters.' + name + '(' + js + args + ')';
  });
};

/**
 * Re-throw the given `err` in context to the
 * `str` of ejs, `filename`, and `lineno`.
 *
 * @param {Error} err
 * @param {String} str
 * @param {String} filename
 * @param {String} lineno
 * @api private
 */

function rethrow(err, str, filename, lineno){
  var lines = str.split('\n')
    , start = Math.max(lineno - 3, 0)
    , end = Math.min(lines.length, lineno + 3);

  // Error context
  var context = lines.slice(start, end).map(function(line, i){
    var curr = i + start + 1;
    return (curr == lineno ? ' >> ' : '    ')
      + curr
      + '| '
      + line;
  }).join('\n');

  // Alter exception message
  err.path = filename;
  err.message = (filename || 'ejs') + ':'
    + lineno + '\n'
    + context + '\n\n'
    + err.message;
  
  throw err;
}

/**
 * Parse the given `str` of ejs, returning the function body.
 *
 * @param {String} str
 * @return {String}
 * @api public
 */

var parse = exports.parse = function(str, options){
  var options = options || {}
    , open = options.open || exports.open || '<%'
    , close = options.close || exports.close || '%>'
    , filename = options.filename
    , compileDebug = options.compileDebug !== false
    , buf = "";

  buf += 'var buf = [];';
  if (false !== options._with) buf += '\nwith (locals || {}) { (function(){ ';
  buf += '\n buf.push(\'';

  var lineno = 1;

  var consumeEOL = false;
  for (var i = 0, len = str.length; i < len; ++i) {
    var stri = str[i];
    if (str.slice(i, open.length + i) == open) {
      i += open.length
  
      var prefix, postfix, line = (compileDebug ? '__stack.lineno=' : '') + lineno;
      switch (str[i]) {
        case '=':
          prefix = "', escape((" + line + ', ';
          postfix = ")), '";
          ++i;
          break;
        case '-':
          prefix = "', (" + line + ', ';
          postfix = "), '";
          ++i;
          break;
        default:
          prefix = "');" + line + ';';
          postfix = "; buf.push('";
      }

      var end = str.indexOf(close, i)
        , js = str.substring(i, end)
        , start = i
        , include = null
        , n = 0;

      if ('-' == js[js.length-1]){
        js = js.substring(0, js.length - 2);
        consumeEOL = true;
      }

      if (0 == js.trim().indexOf('include')) {
        var name = js.trim().slice(7).trim();
        if (!filename) throw new Error('filename option is required for includes');
        var path = resolveInclude(name, filename);
        include = read(path, 'utf8');
        include = exports.parse(include, { filename: path, _with: false, open: open, close: close, compileDebug: compileDebug });
        buf += "' + (function(){" + include + "})() + '";
        js = '';
      }

      while (~(n = js.indexOf("\n", n))) n++, lineno++;
      if (js.substr(0, 1) == ':') js = filtered(js);
      if (js) {
        if (js.lastIndexOf('//') > js.lastIndexOf('\n')) js += '\n';
        buf += prefix;
        buf += js;
        buf += postfix;
      }
      i += end - start + close.length - 1;

    } else if (stri == "\\") {
      buf += "\\\\";
    } else if (stri == "'") {
      buf += "\\'";
    } else if (stri == "\r") {
      // ignore
    } else if (stri == "\n") {
      if (consumeEOL) {
        consumeEOL = false;
      } else {
        buf += "\\n";
        lineno++;
      }
    } else {
      buf += stri;
    }
  }

  if (false !== options._with) buf += "'); })();\n} \nreturn buf.join('');";
  else buf += "');\nreturn buf.join('');";
  return buf;
};

/**
 * Compile the given `str` of ejs into a `Function`.
 *
 * @param {String} str
 * @param {Object} options
 * @return {Function}
 * @api public
 */

var compile = exports.compile = function(str, options){
  options = options || {};
  var escape = options.escape || utils.escape;
  
  var input = JSON.stringify(str)
    , compileDebug = options.compileDebug !== false
    , client = options.client
    , filename = options.filename
        ? JSON.stringify(options.filename)
        : 'undefined';
  
  if (compileDebug) {
    // Adds the fancy stack trace meta info
    str = [
      'var __stack = { lineno: 1, input: ' + input + ', filename: ' + filename + ' };',
      rethrow.toString(),
      'try {',
      exports.parse(str, options),
      '} catch (err) {',
      '  rethrow(err, __stack.input, __stack.filename, __stack.lineno);',
      '}'
    ].join("\n");
  } else {
    str = exports.parse(str, options);
  }
  
  if (options.debug) console.log(str);
  if (client) str = 'escape = escape || ' + escape.toString() + ';\n' + str;

  try {
    var fn = new Function('locals, filters, escape, rethrow', str);
  } catch (err) {
    if ('SyntaxError' == err.name) {
      err.message += options.filename
        ? ' in ' + filename
        : ' while compiling ejs';
    }
    throw err;
  }

  if (client) return fn;

  return function(locals){
    return fn.call(this, locals, filters, escape, rethrow);
  }
};

/**
 * Render the given `str` of ejs.
 *
 * Options:
 *
 *   - `locals`          Local variables object
 *   - `cache`           Compiled functions are cached, requires `filename`
 *   - `filename`        Used by `cache` to key caches
 *   - `scope`           Function execution context
 *   - `debug`           Output generated function body
 *   - `open`            Open tag, defaulting to "<%"
 *   - `close`           Closing tag, defaulting to "%>"
 *
 * @param {String} str
 * @param {Object} options
 * @return {String}
 * @api public
 */

exports.render = function(str, options){
  var fn
    , options = options || {};

  if (options.cache) {
    if (options.filename) {
      fn = cache[options.filename] || (cache[options.filename] = compile(str, options));
    } else {
      throw new Error('"cache" option requires "filename".');
    }
  } else {
    fn = compile(str, options);
  }

  options.__proto__ = options.locals;
  return fn.call(options.scope, options);
};

/**
 * Render an EJS file at the given `path` and callback `fn(err, str)`.
 *
 * @param {String} path
 * @param {Object|Function} options or callback
 * @param {Function} fn
 * @api public
 */

exports.renderFile = function(path, options, fn){
  var key = path + ':string';

  if ('function' == typeof options) {
    fn = options, options = {};
  }

  options.filename = path;

  var str;
  try {
    str = options.cache
      ? cache[key] || (cache[key] = read(path, 'utf8'))
      : read(path, 'utf8');
  } catch (err) {
    fn(err);
    return;
  }
  fn(null, exports.render(str, options));
};

/**
 * Resolve include `name` relative to `filename`.
 *
 * @param {String} name
 * @param {String} filename
 * @return {String}
 * @api private
 */

function resolveInclude(name, filename) {
  var path = join(dirname(filename), name);
  var ext = extname(name);
  if (!ext) path += '.ejs';
  return path;
}

// express support

exports.__express = exports.renderFile;

/**
 * Expose to require().
 */

if (require.extensions) {
  require.extensions['.ejs'] = function (module, filename) {
    filename = filename || module.filename;
    var options = { filename: filename, client: true }
      , template = fs.readFileSync(filename).toString()
      , fn = compile(template, options);
    module._compile('module.exports = ' + fn.toString() + ';', filename);
  };
} else if (require.registerExtension) {
  require.registerExtension('.ejs', function(src) {
    return compile(src, {});
  });
}

},{"./filters":11,"./utils":12,"fs":2,"path":3}],11:[function(require,module,exports){
/*!
 * EJS - Filters
 * Copyright(c) 2010 TJ Holowaychuk <tj@vision-media.ca>
 * MIT Licensed
 */

/**
 * First element of the target `obj`.
 */

exports.first = function(obj) {
  return obj[0];
};

/**
 * Last element of the target `obj`.
 */

exports.last = function(obj) {
  return obj[obj.length - 1];
};

/**
 * Capitalize the first letter of the target `str`.
 */

exports.capitalize = function(str){
  str = String(str);
  return str[0].toUpperCase() + str.substr(1, str.length);
};

/**
 * Downcase the target `str`.
 */

exports.downcase = function(str){
  return String(str).toLowerCase();
};

/**
 * Uppercase the target `str`.
 */

exports.upcase = function(str){
  return String(str).toUpperCase();
};

/**
 * Sort the target `obj`.
 */

exports.sort = function(obj){
  return Object.create(obj).sort();
};

/**
 * Sort the target `obj` by the given `prop` ascending.
 */

exports.sort_by = function(obj, prop){
  return Object.create(obj).sort(function(a, b){
    a = a[prop], b = b[prop];
    if (a > b) return 1;
    if (a < b) return -1;
    return 0;
  });
};

/**
 * Size or length of the target `obj`.
 */

exports.size = exports.length = function(obj) {
  return obj.length;
};

/**
 * Add `a` and `b`.
 */

exports.plus = function(a, b){
  return Number(a) + Number(b);
};

/**
 * Subtract `b` from `a`.
 */

exports.minus = function(a, b){
  return Number(a) - Number(b);
};

/**
 * Multiply `a` by `b`.
 */

exports.times = function(a, b){
  return Number(a) * Number(b);
};

/**
 * Divide `a` by `b`.
 */

exports.divided_by = function(a, b){
  return Number(a) / Number(b);
};

/**
 * Join `obj` with the given `str`.
 */

exports.join = function(obj, str){
  return obj.join(str || ', ');
};

/**
 * Truncate `str` to `len`.
 */

exports.truncate = function(str, len, append){
  str = String(str);
  if (str.length > len) {
    str = str.slice(0, len);
    if (append) str += append;
  }
  return str;
};

/**
 * Truncate `str` to `n` words.
 */

exports.truncate_words = function(str, n){
  var str = String(str)
    , words = str.split(/ +/);
  return words.slice(0, n).join(' ');
};

/**
 * Replace `pattern` with `substitution` in `str`.
 */

exports.replace = function(str, pattern, substitution){
  return String(str).replace(pattern, substitution || '');
};

/**
 * Prepend `val` to `obj`.
 */

exports.prepend = function(obj, val){
  return Array.isArray(obj)
    ? [val].concat(obj)
    : val + obj;
};

/**
 * Append `val` to `obj`.
 */

exports.append = function(obj, val){
  return Array.isArray(obj)
    ? obj.concat(val)
    : obj + val;
};

/**
 * Map the given `prop`.
 */

exports.map = function(arr, prop){
  return arr.map(function(obj){
    return obj[prop];
  });
};

/**
 * Reverse the given `obj`.
 */

exports.reverse = function(obj){
  return Array.isArray(obj)
    ? obj.reverse()
    : String(obj).split('').reverse().join('');
};

/**
 * Get `prop` of the given `obj`.
 */

exports.get = function(obj, prop){
  return obj[prop];
};

/**
 * Packs the given `obj` into json string
 */
exports.json = function(obj){
  return JSON.stringify(obj);
};

},{}],12:[function(require,module,exports){

/*!
 * EJS
 * Copyright(c) 2010 TJ Holowaychuk <tj@vision-media.ca>
 * MIT Licensed
 */

/**
 * Escape the given string of `html`.
 *
 * @param {String} html
 * @return {String}
 * @api private
 */

exports.escape = function(html){
  return String(html)
    .replace(/&(?!#?[a-zA-Z0-9]+;)/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/'/g, '&#39;')
    .replace(/"/g, '&quot;');
};
 

},{}],13:[function(require,module,exports){
'use strict';


var template = require('./util/template'),
    constants = require('./constants');


module.exports = function button(label, data, config) {
    var model, locale, style, wordmarkData, logoData, svgSupported;

    config = config || {};
    locale = data.get('lc') || constants.DEFAULT_LOCALE;
    style = config.style || constants.DEFAULT_STYLE;
    svgSupported = document.implementation.hasFeature("http://www.w3.org/TR/SVG11/feature#Image", "1.1");

    // if a custom height or width is specified
    if (data.get('height') || data.get('width')) {
        config.size = 'custom-'+data.get('width')+'-'+data.get('height');
    }

    // prefer SVG logo if supported
    if (svgSupported) {
        wordmarkData = constants.WORDMARK['vector_' + style ];
        logoData = constants.VECTOR_LOGO;
    } else {
        wordmarkData = constants.WORDMARK[style];
        logoData = constants.LOGO;
    }

    // if a custom label is defined, use it
    if (data.get('label')) {
        // escape to be safe
        label = data.get('label').replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    } else {

        if (data.get('wordmark') === 'false') {
            label = label + '_nowordmark';
        }

        label = constants.STRINGS[locale][label];
    }

    label = label.replace('{wordmark}', '<img src="' + wordmarkData + '" alt="PayPal" />');

    model = {
        style: style,
        size: config.size || constants.DEFAULT_SIZE,
        logo: logoData,
        label: label
    };
    
    return template(constants.TEMPLATES.button, model);
};

},{"./constants":14,"./util/template":21}],14:[function(require,module,exports){
'use strict';


module.exports = {

	BN_CODE: 'JavaScriptButtons_{label}',

	PAYPAL_URL: 'https://{host}/cgi-bin/webscr',

	QR_URL: 'https://{host}/webapps/ppint/qrcode?data={url}&pattern={pattern}&height={size}',

	QR_PATTERN: 13,

	QR_SIZE: 250,

	PRETTY_PARAMS: {
		name: 'item_name',
		number: 'item_number',
		locale: 'lc',
		currency: 'currency_code',
		recurrence: 'p3',
		period: 't3',
		callback: 'notify_url',
		button_id: 'hosted_button_id'
	},

	WIDGET_NAME: 'paypal-button-widget',

	DEFAULT_HOST: 'www.paypal.com',

	DEFAULT_TYPE: 'button',

	DEFAULT_LABEL: 'buynow',

	DEFAULT_SIZE: 'large',

	DEFAULT_STYLE: 'primary',

	DEFAULT_LOCALE: 'en_US',

	DEFAULT_ENV: 'www',

	TEMPLATES: {"button":"<button class=\"paypal-button paypal-style-<%= style %> paypal-size-<%= size %>\" type=\"submit\">\t<span class=\"paypal-button-logo\">\t\t<img src=\"<%= logo %>\" />\t</span><span class=\"paypal-button-content\"><%- label %></span></button>","form":"<form method=\"post\" action=\"<%= url %>\" target=\"_top\">\t<% var optionIdx = 0; %>\t<% for (var key in data) { %>\t\t<% \t\t\tvar item = data[key];\t\t\tvar renderable = (item.editable || item.value instanceof Array);\t\t%>\t\t<% if (renderable) { %>\t\t\t\t\t<p class=\"paypal-group\">\t\t\t\t<label class=\"paypal-label\">\t\t\t\t\t<%= item.label || content[key] || key %>\t\t\t\t\t\t\t\t\t<% if (item.value instanceof Array) { %>\t\t\t\t\t\t<select class=\"paypal-select\" name=\"os<%= optionIdx %>\">\t\t\t\t\t\t\t<% for (var i = 0, len = item.value.length; i < len; i++) { %>\t\t\t\t\t\t\t\t<% var option = item.value[i].split(':') %>\t\t\t\t\t\t\t\t<option value=\"<%= option[0] %>\"><%= option.join(' ') %></option>\t\t\t\t\t\t\t<% } %>\t\t\t\t\t\t</select>\t\t\t\t\t\t<input type=\"hidden\" name=\"on<%= optionIdx %>\" value=\"<%= item.label %>\">\t\t\t\t\t\t<% ++optionIdx; %>\t\t\t\t\t<% } else { %>\t\t\t\t\t\t\t\t\t\t\t<input type=\"text\" id=\"<%= key %>\" name=\"<%= key %>\" value=\"<%= item.value %>\" class=\"paypal-input\" />\t\t\t\t\t\t\t\t\t\t<% } %>\t\t\t\t</label>\t\t\t</p>\t\t<% } else { %>\t\t\t<input type=\"hidden\" name=\"<%= key %>\" value=\"<%= item.value %>\" />\t\t<% } %>\t<% } %>\t<%- button %></form>","qr":"<img src=\"<%= url %>\" alt=\"PayPal QR code\" />"},

	CSS_TEMPLATES: {"css/dynamic":"/* Custom <%= width %> by <%= height %> */.paypal-button.paypal-size-custom-<%= width %>-<%= height %> .paypal-button-logo { \twidth: <%= logoWidth %>px;\theight: <%= logoHeight %>px;}.paypal-button.paypal-size-custom-<%= width %>-<%= height %> .paypal-button-logo img { \twidth: <%= logo_imgWidth %>px;\theight: <%= logo_imgHeight %>px;\tmargin: <%= logo_marginTop %>px 0 0 0;}.paypal-button.paypal-size-custom-<%= width %>-<%= height %> .paypal-button-content { \theight: <%= contentHeight %>px;\tfont-size: <%= contentFontSize %>px !important;\tline-height: <%= contentLineHeight %>px !important;\tpadding: <%= contentPaddingTop %>px <%= contentPaddingRight %>px <%= contentPaddingBottom %>px <%= contentPaddingLeft %>px;\tmin-width: <%= contentMinWidth %>px !important;}.paypal-button.paypal-size-custom-<%= width %>-<%= height %> .paypal-button-content img { \twidth: <%= content_imgWidth %>px;\theight: <%= content_imgHeight %>px;\tmargin: <%= content_imgMarginTop %>px 0 0 <%= content_imgMarginLeft %>px;}","css/index":".paypal-button { \twhite-space: nowrap;\toverflow: hidden;\tmargin: 0;\tpadding: 0;\tbackground: 0;\tborder: 0;\tfont-family: \"Helvetica Neue\", Helvetica, Arial, sans-serif !important;\tfont-weight: bold;\t-webkit-font-smoothing: antialiased;\tfont-smoothing: antialiased;\tcursor: pointer;\tz-index: 0;}.paypal-button-logo { \tdisplay: inline-block;\tborder: 1px solid #aaa;\tborder-right: 0;\tborder-radius: 3px 0 0 3px;\tvertical-align: top;}.paypal-button-content { \tpadding: 4px 8px 4px;\tborder: 1px solid transparent;\tborder-radius: 0 3px 3px 0;\tmin-width: 57px !important;}.paypal-button-content img { \tvertical-align: middle;}/* Small */.paypal-button-logo { \twidth: 24px;\theight: 24px;}.paypal-button-logo img { \twidth: 18px;\theight: 18px;\tmargin: 3px 0 0 -1px;}.paypal-button-content { \theight: 16px;\tdisplay:inline-block;\tfont-size: 10px !important;\tline-height: 16px !important;}.paypal-button-content img { \twidth: 60px;\theight: 16px;\tmargin: 1px 0 0 1px;}        /* Medium */.paypal-button.paypal-size-medium .paypal-button-logo { \twidth: 30px;\theight: 30px;}.paypal-button.paypal-size-medium .paypal-button-logo img { \twidth: 22px;\theight: 22px;\tmargin: 4px 0 0 0px;}.paypal-button.paypal-size-medium .paypal-button-content { \theight: 19px;\tfont-size: 10px !important;\tline-height: 19px !important;\tpadding: 5px 8px 6px;\tmin-width: 71px !important;}.paypal-button.paypal-size-medium .paypal-button-content img { \twidth: 71px;\theight: 19px;\tmargin: 2px 0 0 1px;}        /* Large */.paypal-button.paypal-size-large .paypal-button-logo { \twidth: 42px;\theight: 42px;}.paypal-button.paypal-size-large .paypal-button-logo img { \twidth: 30px;\theight: 30px;\tmargin: 6px 0 0 -1px;}.paypal-button.paypal-size-large .paypal-button-content { \theight: 25px;\tfont-size: 13px !important;\tline-height: 25px !important;\tpadding: 8px 13px 9px;\tmin-width: 109px !important;}.paypal-button.paypal-size-large .paypal-button-content img { \twidth: 93px;\theight: 25px;\tmargin: 2px 0 0 2px;}    /* Primary */.paypal-button.paypal-style-primary .paypal-button-content { \tbackground: #009cde;\tborder-color: #009cde;\tcolor: #fff;}    /* Secondary */.paypal-button.paypal-style-secondary .paypal-button-logo { \tborder: 1px solid #cfcfcf;\tborder-right: 0;}.paypal-button.paypal-style-secondary .paypal-button-content { \tbackground: #eee;\tborder-color: #cfcfcf;\tcolor: #333;}"},

	STRINGS: {"en_AU":{"buynow":"Buy with {wordmark}","cart":"Add to Cart","donate":"Donate with {wordmark}","subscribe":"Subscribe with {wordmark}","paynow":"Pay now with {wordmark}","item_name":"Item","number":"Number","amount":"Amount","quantity":"Quantity"},"pt_BR":{"buynow":"Comprar com {wordmark}","cart":"Adicionar ao carrinho","donate":"Doar com {wordmark}","subscribe":"Fazer assinatura com {wordmark}","paynow":"Pagar agora com {wordmark}","item_name":"Item","number":"Número","amount":"Valor","quantity":"Quantidade"},"fr_CA":{"buynow":"Achetez avec {wordmark}","cart":"Ajouter au panier","donate":"Faire un don avec {wordmark}","subscribe":"Souscrire avec {wordmark}","paynow":"Payez maintenant avec {wordmark}","item_name":"Objet","number":"Numéro","amount":"Montant","quantity":"Quantité"},"zh_CN":{"buynow":"使用{wordmark}购买","cart":"添加到购物车","donate":"使用{wordmark}捐赠","subscribe":"使用{wordmark}订用","paynow":"利用{wordmark}立即付款","item_name":"物品","number":"号码","amount":"金额","quantity":"数量"},"de_DE":{"buynow":"Kaufen mit {wordmark}","cart":"In den Warenkorb","donate":"Spenden mit {wordmark}","subscribe":"Abonnieren mit {wordmark}","paynow":"Jetzt bezahlen mit {wordmark}","item_name":"Artikel","number":"Nummer","amount":"Betrag","quantity":"Anzahl"},"da_DK":{"buynow":"Køb med {wordmark}","cart":"Læg i indkøbsvogn","donate":"Doner med {wordmark}","subscribe":"Abonner med {wordmark}","paynow":"Betal nu med {wordmark}","item_name":"Vare","number":"Nummer","amount":"Beløb","quantity":"Antal"},"es_ES":{"buynow":"Comprar con {wordmark}","cart":"Añadir al carro","donate":"Donar con {wordmark}","subscribe":"Suscribirse con {wordmark}","paynow":"Pagar ahora con {wordmark}","item_name":"Artículo","number":"Número","amount":"Importe","quantity":"Cantidad"},"fr_FR":{"buynow":"Acheter avec {wordmark}","cart":"Ajouter au panier","donate":"Faire un don avec {wordmark}","subscribe":"S'abonner avec {wordmark}","paynow":"Payer maintenant avec {wordmark}","item_name":"Objet","number":"Numéro","amount":"Montant","quantity":"Quantité"},"en_GB":{"buynow":"Buy with {wordmark}","cart":"Add to Cart","donate":"Donate with {wordmark}","subscribe":"Subscribe with {wordmark}","paynow":"Pay now with {wordmark}","item_name":"Item","number":"Number","amount":"Amount","quantity":"Quantity"},"zh_HK":{"buynow":"{wordmark} 購物","cart":"加到購物車","donate":"{wordmark} 捐款","subscribe":"{wordmark} 訂用","paynow":"{wordmark} 立即付款","item_name":"物品","number":"號碼","amount":"金額","quantity":"數量"},"id_ID":{"buynow":"Beli dengan {wordmark}","cart":"Tambah ke Keranjang","donate":"Donasikan dengan {wordmark}","subscribe":"Berlangganan dengan {wordmark}","paynow":"Bayar sekarang dengan {wordmark}","item_name":"Barang","number":"Nomor","amount":"Jumlah","quantity":"Jumlah"},"he_IL":{"buynow":"קנה באמצעות {wordmark}","cart":"הוסף לסל הקניות","donate":"תרום באמצעות {wordmark}","subscribe":"הצטרף כמנוי באמצעות {wordmark}","paynow":"שלם עכשיו באמצעות {wordmark}","item_name":"פריט","number":"מספר","amount":"סכום","quantity":"כמות"},"it_IT":{"buynow":"Compra con {wordmark}","cart":"Aggiungi al carrello","donate":"Fai una donazione con {wordmark}","subscribe":"Iscriviti con {wordmark}","paynow":"Paga adesso con {wordmark}","item_name":"Oggetto","number":"Numero","amount":"Importo","quantity":"Quantità"},"ja_JP":{"buynow":"{wordmark}で購入手続きに進む","cart":"カートに入れる","donate":"{wordmark}で寄付する","subscribe":"{wordmark}で定期購入","paynow":"{wordmark}で購入手続きに進む","item_name":"商品","number":"番号","amount":"金額","quantity":"数量"},"nl_NL":{"buynow":"Kopen met {wordmark}","cart":"Toevoegen aan winkelwagentje","donate":"Doneren met {wordmark}","subscribe":"Abonneren met {wordmark}","paynow":"Nu betalen met {wordmark}","item_name":"Object","number":"Nummer","amount":"Bedrag","quantity":"Hoeveelheid"},"no_NO":{"buynow":"Kjøp med {wordmark}","cart":"Legg i kurven","donate":"Doner med {wordmark}","subscribe":"Abonner med {wordmark}","paynow":"Betal nå med {wordmark}","item_name":"Artikkel","number":"Nummer","amount":"Beløp","quantity":"Antall"},"pl_PL":{"buynow":"Kup w systemie {wordmark}","cart":"Dodaj do koszyka","donate":"Przekaż darowiznę w systemie {wordmark}","subscribe":"Subskrybuj w systemie {wordmark}","paynow":"Zapłać teraz w systemie {wordmark}","item_name":"Przedmiot","number":"Numer","amount":"Kwota","quantity":"Ilość"},"pt_PT":{"buynow":"Compre com {wordmark}","cart":"Adicionar ao carrinho de compras","donate":"Doar com {wordmark}","subscribe":"Subscrever com {wordmark}","paynow":"Pague agora com {wordmark}","item_name":"Artigo","number":"Número","amount":"Valor","quantity":"Quantidade"},"ru_RU":{"buynow":"Совершайте покупки с {wordmark}","cart":"Добавить в корзину","donate":"Пожертвование с {wordmark}","subscribe":"Подписка с {wordmark}","paynow":"Оплатить сейчас с помощью {wordmark}","item_name":"Товар","number":"Номер","amount":"Сумма","quantity":"Количество"},"sv_SE":{"buynow":"Betala med {wordmark}","cart":"Lägg till i kundvagn","donate":"Donera med {wordmark}","subscribe":"Abonnera med {wordmark}","paynow":"Betala nu med {wordmark}","item_name":"Objekt","number":"Nummer","amount":"Belopp","quantity":"Antal"},"th_TH":{"buynow":"ซื้อด้วย {wordmark}","cart":"เพิ่มสินค้าลงในตะกร้า","donate":"บริจาคด้วย {wordmark}","subscribe":"บอกรับสมาชิกด้วย {wordmark}","paynow":"ชำระทันทีด้วย {wordmark}","item_name":"รายการสินค้า","number":"หมายเลข","amount":"จำนวนเงิน","quantity":"ปริมาณ"},"tr_TR":{"buynow":"{wordmark} ile Satın Alın","cart":"Sepete Ekleyin","donate":"{wordmark} ile Bağışta Bulunun","subscribe":"{wordmark} ile Abone Olun","paynow":"{wordmark} ile Şimdi Ödeyin","item_name":"Ürün","number":"Numarası","amount":"Tutar","quantity":"Miktar"},"zh_TW":{"buynow":"使用 {wordmark} 購買","cart":"加到購物車","donate":"使用 {wordmark} 捐款","subscribe":"使用 {wordmark} 訂閱","paynow":"使用 {wordmark} 立即付款","item_name":"商品","number":"號碼","amount":"金額","quantity":"數量"},"en_US":{"buynow":"Buy with {wordmark}","buynow_nowordmark":"Buy","cart":"Add to Cart","donate":"Donate with {wordmark}","donate_nowordmark":"Donate","subscribe":"Subscribe with {wordmark}","subscribe_nowordmark":"Subscribe","paynow":"Pay now with {wordmark}","paynow_nowordmark":"Pay now","item_name":"Item","number":"Number","amount":"Amount","quantity":"Quantity"},"es_US":{"buynow":"Compre con {wordmark}","cart":"Añadir al carro","donate":"Donar con {wordmark}","subscribe":"Suscribir con {wordmark}","paynow":"Pagar ahora con {wordmark}","item_name":"Artículo","number":"Número","amount":"Importe","quantity":"Cantidad"},"fr_US":{"buynow":"Acheter avec {wordmark}","cart":"Ajouter au panier","donate":"Faire un don avec {wordmark}","subscribe":"S'abonner avec {wordmark}","paynow":"Payer maintenant avec {wordmark}","item_name":"Objet","number":"Numéro","amount":"Montant","quantity":"Quantité"},"zh_US":{"buynow":"使用{wordmark}购买","cart":"添加到购物车","donate":"使用{wordmark}捐赠","subscribe":"使用{wordmark}订用","paynow":"使用{wordmark}立即付款","item_name":"物品","number":"号码","amount":"金额","quantity":"数量"}},

	STYLES: '.paypal-button { 	white-space: nowrap;	overflow: hidden;	margin: 0;	padding: 0;	background: 0;	border: 0;	font-family: "Helvetica Neue", Helvetica, Arial, sans-serif !important;	font-weight: bold;	-webkit-font-smoothing: antialiased;	font-smoothing: antialiased;	cursor: pointer;	z-index: 0;}.paypal-button-logo { 	display: inline-block;	border: 1px solid #aaa;	border-right: 0;	border-radius: 3px 0 0 3px;	vertical-align: top;}.paypal-button-content { 	padding: 4px 8px 4px;	border: 1px solid transparent;	border-radius: 0 3px 3px 0;	min-width: 57px !important;}.paypal-button-content img { 	vertical-align: middle;}/* Small */.paypal-button-logo { 	width: 24px;	height: 24px;}.paypal-button-logo img { 	width: 18px;	height: 18px;	margin: 3px 0 0 -1px;}.paypal-button-content { 	height: 16px;	display:inline-block;	font-size: 10px !important;	line-height: 16px !important;}.paypal-button-content img { 	width: 60px;	height: 16px;	margin: 1px 0 0 1px;}        /* Medium */.paypal-button.paypal-size-medium .paypal-button-logo { 	width: 30px;	height: 30px;}.paypal-button.paypal-size-medium .paypal-button-logo img { 	width: 22px;	height: 22px;	margin: 4px 0 0 0px;}.paypal-button.paypal-size-medium .paypal-button-content { 	height: 19px;	font-size: 10px !important;	line-height: 19px !important;	padding: 5px 8px 6px;	min-width: 71px !important;}.paypal-button.paypal-size-medium .paypal-button-content img { 	width: 71px;	height: 19px;	margin: 2px 0 0 1px;}        /* Large */.paypal-button.paypal-size-large .paypal-button-logo { 	width: 42px;	height: 42px;}.paypal-button.paypal-size-large .paypal-button-logo img { 	width: 30px;	height: 30px;	margin: 6px 0 0 -1px;}.paypal-button.paypal-size-large .paypal-button-content { 	height: 25px;	font-size: 13px !important;	line-height: 25px !important;	padding: 8px 13px 9px;	min-width: 109px !important;}.paypal-button.paypal-size-large .paypal-button-content img { 	width: 93px;	height: 25px;	margin: 2px 0 0 2px;}    /* Primary */.paypal-button.paypal-style-primary .paypal-button-content { 	background: #009cde;	border-color: #009cde;	color: #fff;}    /* Secondary */.paypal-button.paypal-style-secondary .paypal-button-logo { 	border: 1px solid #cfcfcf;	border-right: 0;}.paypal-button.paypal-style-secondary .paypal-button-content { 	background: #eee;	border-color: #cfcfcf;	color: #333;}',

	LOGO: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADwAAAA8CAYAAAA6/NlyAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAA1RJREFUeNrkmr9v01AQx99LoC1SAatCpQgJ0krQSkjgKUOllg4wIsFfABmYaTa2wMZI5g7lPyD9CxoWZnfrBJm7YFja2LHNnUlQVdWJ794PO8pXerLS1ok/vfP37l4sBVNrm+/fwKEmzKoLy//x/ZOn6w0lE/YDHFrCnvwh/AGsDvwDfNvAv+DgiGKEsB1YTQ64ZMBiGv8UxQthGwDdoZxUYXxQTZRDmGFfh15iFNgV5dI+QO+YBL4vyieMtDMrER6l9+4sAaPemQJ2Sgrs5LmXScAUcyhIru4I10oO7Mwa8ERdIf79U9anJLEQcajvqqvz1oDphpVEQp6e/IPWKQnJWbkqkuoCUFyD11UjwOSSJIM/+mFHWRP1hYQlgt9p1Af3HugrS+DQvPoLEbYiAA9ct7W8d7wPy9FhWjXuhdhSdDftenGYOMyCrphMZyOpPB72/LW2VIHpQ4NOZ6YBo3Yhyjt2U9oicLj28LIfv1YBJreV0pJhxTduivjW7ct+9ZIFPNzWEWWNcPikntk3QFq7nAgzgQfGYZP5BRFuPM7dLOUFLm0NxugidF7lBaY7tIX6i/dtv75FOsdchC1E9/TZC/I5xoBNO/QZwGY480X5HGD6lBQFRmEnGNV/nbzd8EjTEntbx0CE0Zz6W89zw4I8znhYihqMreMZwOZMY8vAGmGxiwrq25SontcBB5i+raM4JWHqDqA3Hqyup0cFdTnAZMOScUBK1fQIqZpANAfwmpi2WfoChuVzgOk1GFpKNJcgu8e1oTa5DnO3dcL1R0XDdi+Wo7x1mOXQ/c3tImHTL8q5nRY5wsncHKmZN6CPEN0eF5g8NMRLS0XColF9Vumla1MEjLAN1eGB3FbG1xeLgG3mgR1blrjbOpYjjI1FY9w9S6nDLOBk0XiER89ptbNKDxeYVYNjvcDeEBAjeDSuvuoAJjt0tLKiErVXANM1nR4VrTWYH92mDVjtwAoObQV2EjB5SuI6NMVljQBzt3WYhuUJi6roLEnMCPemElih4TgqAzB5WwenJIVaWzgwWdEdpRpcOHCbeiHcGmyr/o4kdb3R8t7xIWO66gHw6lSmNLP3turQ2oCHjwhxHiv+NpXAgv/QuD9rwN60ArNgbTs06q8AAwC1swu0LaowrwAAAABJRU5ErkJggg==',

	VECTOR_LOGO: 'data:image/svg+xml;base64,PCEtLSBDcmVhdGVkIHdpdGggSW5rc2NhcGUgKGh0dHA6Ly93d3cuaW5rc2NhcGUub3JnLykgLS0+DQo8c3ZnIHZlcnNpb249IjEuMSIgeG1sOnNwYWNlPSJwcmVzZXJ2ZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczpjYz0iaHR0cDovL2NyZWF0aXZlY29tbW9ucy5vcmcvbnMjIiB4bWxuczpkYz0iaHR0cDovL3B1cmwub3JnL2RjL2VsZW1lbnRzLzEuMS8iIHhtbG5zOnJkZj0iaHR0cDovL3d3dy53My5vcmcvMTk5OS8wMi8yMi1yZGYtc3ludGF4LW5zIyIgdmlld0JveD0iMCAwIDM1IDMwIj4NCj4NCgk8bWV0YWRhdGE+DQoJCTxyZGY6UkRGPg0KCQkJPGNjOldvcmsgcmRmOmFib3V0PSIiPg0KCQkJCTxkYzpmb3JtYXQ+aW1hZ2Uvc3ZnK3htbDwvZGM6Zm9ybWF0Pg0KCQkJCTxkYzp0eXBlIHJkZjpyZXNvdXJjZT0iaHR0cDovL3B1cmwub3JnL2RjL2RjbWl0eXBlL1N0aWxsSW1hZ2UiLz4NCgkJCQk8ZGM6dGl0bGUvPg0KCQkJPC9jYzpXb3JrPg0KCQk8L3JkZjpSREY+DQoJPC9tZXRhZGF0YT4NCgk8ZyB0cmFuc2Zvcm09Im1hdHJpeCgxLDAsMCwtMSwtNS45MTY5NDQ4LDg2LjUyMzEwMykiPg0KCQk8ZyB0cmFuc2Zvcm09Im1hdHJpeCgwLjk3LDAsMCwwLjk3LDIuNSw0Ni41KSI+DQoJCQk8Zz4NCgkJCQk8ZyB0cmFuc2Zvcm09InRyYW5zbGF0ZSgzMi40MTg3LDQwLjk4MTYpIj4NCgkJCQkJPHBhdGggZD0ibTAsMGMtMS42NzQsMS45MDgtNC43LDIuNzI2LTguNTcxLDIuNzI2aC0xMS4yMzVjLTAuNzkyLDAtMS40NjUtMC41NzYtMS41ODktMS4zNTdsLTQuNjc4LTI5LjY2OWMtMC4wOTMtMC41ODUsMC4zNi0xLjExNSwwLjk1My0xLjExNWg2LjkzNmwxLjc0MiwxMS4wNDktMC4wNTQtMC4zNDZjMC4xMjQsMC43ODEsMC43OTIsMS4zNTcsMS41ODMsMS4zNTdoMy4yOTZjNi40NzUsMCwxMS41NDUsMi42MywxMy4wMjYsMTAuMjM4LDAuMDQ0LDAuMjI1LDAuMDgyLDAuNDQ0LDAuMTE1LDAuNjU4LDAuNDQxLDIuODEyLTAuMDAzLDQuNzI2LTEuNTI0LDYuNDU5IiBmaWxsPSIjMDAzMDg3IiBmaWxsLXJ1bGU9Im5vbnplcm8iLz4NCgkJCQk8L2c+DQoJCQkJPGcgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMzIuNDE4Nyw0MC45ODE2KSI+DQoJCQkJCTxwYXRoIGQ9Im0wLDBjLTEuNjc0LDEuOTA4LTQuNywyLjcyNi04LjU3MSwyLjcyNmgtMTEuMjM1Yy0wLjc5MiwwLTEuNDY1LTAuNTc2LTEuNTg5LTEuMzU3bC00LjY3OC0yOS42NjljLTAuMDkzLTAuNTg1LDAuMzYtMS4xMTUsMC45NTMtMS4xMTVoNi45MzZsMS43NDIsMTEuMDQ5LTAuMDU0LTAuMzQ2YzAuMTI0LDAuNzgxLDAuNzkyLDEuMzU3LDEuNTgzLDEuMzU3aDMuMjk2YzYuNDc1LDAsMTEuNTQ1LDIuNjMsMTMuMDI2LDEwLjIzOCwwLjA0NCwwLjIyNSwwLjA4MiwwLjQ0NCwwLjExNSwwLjY1OCwwLjQ0MSwyLjgxMi0wLjAwMyw0LjcyNi0xLjUyNCw2LjQ1OSIgZmlsbD0iIzAwMzA4NyIgZmlsbC1ydWxlPSJub256ZXJvIi8+DQoJCQkJPC9nPg0KCQkJCTxnIHRyYW5zZm9ybT0idHJhbnNsYXRlKDE3Ljg0ODksMzQuNDg1MykiPg0KCQkJCQk8cGF0aCBkPSJtMCwwYzAuMDc0LDAuNDcsMC4zNzYsMC44NTUsMC43ODIsMS4wNSwwLjE4NSwwLjA4OCwwLjM5MSwwLjEzNywwLjYwNywwLjEzN2g4LjgwOGMxLjA0MywwLDIuMDE2LTAuMDY4LDIuOTA1LTAuMjExLDAuMjU1LTAuMDQxLDAuNTAyLTAuMDg4LDAuNzQyLTAuMTQyLDAuMjQtMC4wNTMsMC40NzMtMC4xMTMsMC42OTktMC4xNzksMC4xMTMtMC4wMzMsMC4yMjQtMC4wNjcsMC4zMzMtMC4xMDMsMC40MzctMC4xNDYsMC44NDQtMC4zMTYsMS4yMTgtMC41MTUsMC40NDEsMi44MTMtMC4wMDMsNC43MjYtMS41MjQsNi40NTktMS42NzUsMS45MDgtNC43LDIuNzI2LTguNTcxLDIuNzI2aC0xMS4yMzZjLTAuNzkxLDAtMS40NjQtMC41NzYtMS41ODgtMS4zNTdsLTQuNjc4LTI5LjY2OGMtMC4wOTMtMC41ODYsMC4zNi0xLjExNSwwLjk1Mi0xLjExNWg2LjkzN2wxLjc0MiwxMS4wNDksMS44NzIsMTEuODY5eiIgZmlsbD0iIzAwMzA4NyIgZmlsbC1ydWxlPSJub256ZXJvIi8+DQoJCQkJPC9nPg0KCQkJCTxnIHRyYW5zZm9ybT0idHJhbnNsYXRlKDMzLjk0MjksMzQuNTIyNikiPg0KCQkJCQk8cGF0aCBkPSJtMCwwLDAsMGMtMC4wMzQtMC4yMTUtMC4wNzEtMC40MzMtMC4xMTUtMC42NTgtMS40ODEtNy42MDctNi41NTEtMTAuMjM4LTEzLjAyNi0xMC4yMzhoLTMuMjk3Yy0wLjc5MSwwLTEuNDU5LTAuNTc2LTEuNTgyLTEuMzU3bC0xLjY4OC0xMC43MDItMC40NzktMy4wMzZjLTAuMDgxLTAuNTEyLDAuMzE1LTAuOTc2LDAuODMzLTAuOTc2aDUuODQ3YzAuNjkyLDAsMS4yODEsMC41MDQsMS4zODksMS4xODdsMC4wNTcsMC4yOTgsMS4xMDIsNi45ODQsMC4wNzEsMC4zODZjMC4xMDgsMC42ODMsMC42OTcsMS4xODcsMS4zODksMS4xODdoMC44NzVjNS42NjQsMCwxMC4wOTksMi4zMDEsMTEuMzk1LDguOTU2LDAuNTQxLDIuNzgxLDAuMjYxLDUuMTAzLTEuMTcsNi43MzQtMC40MzQsMC40OTQtMC45NzMsMC45MDItMS42MDEsMS4yMzUiIGZpbGw9IiMwMDljZGUiIGZpbGwtcnVsZT0ibm9uemVybyIvPg0KCQkJCTwvZz4NCgkJCQk8ZyB0cmFuc2Zvcm09InRyYW5zbGF0ZSgzMi4zOTIyLDM1LjE0MDcpIj4NCgkJCQkJPHBhdGggZD0ibTAsMGMtMC4yMjYsMC4wNjYtMC40NTksMC4xMjYtMC42OTksMC4xNzlzLTAuNDg4LDAuMS0wLjc0MiwwLjE0MWMtMC44OSwwLjE0NC0xLjg2MiwwLjIxMi0yLjkwNiwwLjIxMmgtOC44MDdjLTAuMjE3LDAtMC40MjMtMC4wNDktMC42MDctMC4xMzgtMC40MDctMC4xOTUtMC43MDgtMC41NzktMC43ODItMS4wNWwtMS44NzItMTEuODY5LTAuMDU0LTAuMzQ2YzAuMTIzLDAuNzgxLDAuNzkxLDEuMzU3LDEuNTgyLDEuMzU3aDMuMjk3YzYuNDc1LDAsMTEuNTQ1LDIuNjMsMTMuMDI2LDEwLjIzOCwwLjA0NCwwLjIyNSwwLjA4MSwwLjQ0MywwLjExNSwwLjY1OC0wLjM3NSwwLjE5OC0wLjc4MSwwLjM2OS0xLjIxOCwwLjUxNC0wLjEwOSwwLjAzNi0wLjIyLDAuMDcxLTAuMzMzLDAuMTA0IiBmaWxsPSIjMDEyMTY5IiBmaWxsLXJ1bGU9Im5vbnplcm8iLz4NCgkJCQk8L2c+DQoJCQk8L2c+DQoJCTwvZz4NCgk8L2c+DQo8L3N2Zz4=',

	WORDMARK: {
		primary: 'data:image/png;base64,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',
		secondary: 'data:image/png;base64,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',
		vector_primary: 'data:image/svg+xml;base64,PCEtLSBDcmVhdGVkIHdpdGggSW5rc2NhcGUgKGh0dHA6Ly93d3cuaW5rc2NhcGUub3JnLykgLS0+DQo8c3ZnDQogICAgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIg0KICAgIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sOnNwYWNlPSJwcmVzZXJ2ZSIgdmVyc2lvbj0iMS4xIg0KICAgIHhtbG5zOmNjPSJodHRwOi8vY3JlYXRpdmVjb21tb25zLm9yZy9ucyMiDQogICAgeG1sbnM6ZGM9Imh0dHA6Ly9wdXJsLm9yZy9kYy9lbGVtZW50cy8xLjEvIg0KICAgIHZpZXdCb3g9IjAgMCAzNSAzMCI+DQogICAgPG1ldGFkYXRhPg0KICAgICAgICA8cmRmOlJERj4NCiAgICAgICAgICAgIDxjYzpXb3JrIHJkZjphYm91dD0iIj4NCiAgICAgICAgICAgICAgICA8ZGM6Zm9ybWF0PmltYWdlL3N2Zyt4bWw8L2RjOmZvcm1hdD4NCiAgICAgICAgICAgICAgICA8ZGM6dHlwZSByZGY6cmVzb3VyY2U9Imh0dHA6Ly9wdXJsLm9yZy9kYy9kY21pdHlwZS9TdGlsbEltYWdlIi8+DQogICAgICAgICAgICAgICAgPGRjOnRpdGxlLz4NCiAgICAgICAgICAgIDwvY2M6V29yaz4NCiAgICAgICAgPC9yZGY6UkRGPg0KICAgIDwvbWV0YWRhdGE+DQogICAgPGcgdHJhbnNmb3JtPSJtYXRyaXgoMSwwLDAsLTEsLTUuOTE2OTQ0OCw4Ni41MjMxMDMpIj4NCiAgICAgICAgPGcgdHJhbnNmb3JtPSJtYXRyaXgoMS4xMSwwLDAsMS4xMSwtODYuNSw0OC41KSI+DQogICAgICAgICAgICA8Zz4NCiAgICAgICAgICAgICAgICA8IS0tIFAgLS0+DQogICAgICAgICAgICAgICAgPGcgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMTE3LjMzMTIsMjYuODYzMikiPg0KICAgICAgICAgICAgICAgICAgICA8cGF0aCBmaWxsLXJ1bGU9Im5vbnplcm8iIGZpbGw9IiNmZmZmZmYiIGQ9Im0wLDBjLTAuNDI0LTIuNzg0LTIuNTUtMi43ODQtNC42MDctMi43ODRoLTEuMTdsMC44MjEsNS4xOThjMC4wNDksMC4zMTQsMC4zMiwwLjU0NSwwLjYzOCwwLjU0NWgwLjUzN2MxLjQsMCwyLjcyMiwwLDMuNDA0LTAuNzk3LDAuNDA4LTAuNDc3LDAuNTMxLTEuMTg1LDAuMzc3LTIuMTYybS0wLjg5NSw3LjI2NC03Ljc1NiwwYy0wLjUzMSwwLTAuOTgyLTAuMzg2LTEuMDY1LTAuOTFsLTMuMTM2LTE5Ljg4OGMtMC4wNjItMC4zOTIsMC4yNDItMC43NDcsMC42MzgtMC43NDdoMy45OGMwLjM3MSwwLDAuNjg3LDAuMjcsMC43NDUsMC42MzZsMC44OSw1LjYzOWMwLjA4MiwwLjUyNCwwLjUzNCwwLjkxLDEuMDY0LDAuOTFoMi40NTRjNS4xMDksMCw4LjA1OCwyLjQ3Miw4LjgyOCw3LjM3MywwLjM0NywyLjE0MiwwLjAxNCwzLjgyNi0wLjk4OSw1LjAwNS0xLjEwMywxLjI5Ni0zLjA1OCwxLjk4Mi01LjY1MywxLjk4MiIvPg0KICAgICAgICAgICAgICAgIDwvZz4NCiAgICAgICAgICAgICAgICA8IS0tIFAgLS0+DQogICAgICAgICAgICAgICAgPGcgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoNjIuMDExNSwyNi44NjMyKSI+DQogICAgICAgICAgICAgICAgICAgIDxwYXRoIGZpbGwtcnVsZT0ibm9uemVybyIgZmlsbD0iI2ZmZmZmZiIgZD0ibTAsMGMtMC40MjQtMi43ODQtMi41NS0yLjc4NC00LjYwNy0yLjc4NGgtMS4xN2wwLjgyMSw1LjE5OGMwLjA0OSwwLjMxNCwwLjMyLDAuNTQ1LDAuNjM4LDAuNTQ1aDAuNTM3YzEuNCwwLDIuNzIyLDAsMy40MDQtMC43OTcsMC40MDgtMC40NzcsMC41MzEtMS4xODUsMC4zNzctMi4xNjJtLTAuODk1LDcuMjY0LTcuNzU2LDBjLTAuNTMxLDAtMC45ODItMC4zODYtMS4wNjUtMC45MWwtMy4xMzYtMTkuODg4Yy0wLjA2Mi0wLjM5MiwwLjI0MS0wLjc0NywwLjYzOC0wLjc0N2gzLjcwNGMwLjUzLDAsMC45ODEsMC4zODYsMS4wNjQsMC45MDlsMC44NDcsNS4zNjZjMC4wODIsMC41MjQsMC41MzQsMC45MSwxLjA2NCwwLjkxaDIuNDU0YzUuMTA5LDAsOC4wNTgsMi40NzIsOC44MjgsNy4zNzMsMC4zNDcsMi4xNDIsMC4wMTQsMy44MjYtMC45ODksNS4wMDUtMS4xMDMsMS4yOTYtMy4wNTgsMS45ODItNS42NTMsMS45ODIiLz4NCiAgICAgICAgICAgICAgICA8L2c+DQogICAgICAgICAgICAgICAgPCEtLSBhIC0tPg0KICAgICAgICAgICAgICAgIDxnIHRyYW5zZm9ybT0idHJhbnNsYXRlKDc5LjEyMjgsMTkuNzIzNCkiPg0KICAgICAgICAgICAgICAgICAgICA8cGF0aCBmaWxsLXJ1bGU9Im5vbnplcm8iIGZpbGw9IiNmZmZmZmYiIGQ9Im0wLDBjLTAuMzU5LTIuMTIyLTIuMDQzLTMuNTQ3LTQuMTkyLTMuNTQ3LTEuMDc3LDAtMS45NCwwLjM0Ny0yLjQ5NCwxLjAwMy0wLjU0OSwwLjY1LTAuNzU2LDEuNTc3LTAuNTgyLDIuNjA4LDAuMzM0LDIuMTA0LDIuMDQ2LDMuNTc0LDQuMTYyLDMuNTc0LDEuMDU1LDAsMS45MTEtMC4zNSwyLjQ3Ni0xLjAxMiwwLjU2OS0wLjY2NywwLjc5My0xLjU5OSwwLjYzLTIuNjI2bTUuMTc2LDcuMjI5LTMuNzE0LDBjLTAuMzE4LDAtMC41ODktMC4yMzEtMC42MzktMC41NDZsLTAuMTYzLTEuMDM4LTAuMjU5LDAuMzc2Yy0wLjgwNSwxLjE2Ny0yLjU5OCwxLjU1OC00LjM4OCwxLjU1OC00LjEwMywwLTcuNjA4LTMuMTEtOC4yOS03LjQ3MS0wLjM1NS0yLjE3NiwwLjE0OS00LjI1NSwxLjM4My01LjcwNiwxLjEzMy0xLjMzMywyLjc1LTEuODg4LDQuNjc3LTEuODg4LDMuMzA4LDAsNS4xNDIsMi4xMjQsNS4xNDIsMi4xMjRsLTAuMTY2LTEuMDMyYy0wLjA2Mi0wLjM5MiwwLjI0MS0wLjc0NywwLjYzOS0wLjc0N2gzLjM0NGMwLjUzMSwwLDAuOTgyLDAuMzg1LDEuMDY1LDAuOTA5bDIuMDA4LDEyLjcxNGMwLjA2MiwwLjM5Mi0wLjI0MiwwLjc0Ny0wLjYzOSwwLjc0NyIvPg0KICAgICAgICAgICAgICAgIDwvZz4NCiAgICAgICAgICAgICAgICA8IS0tIGEgLS0+DQogICAgICAgICAgICAgICAgPGcgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMTM0LjQ0MjYsMTkuNzIzNCkiPg0KICAgICAgICAgICAgICAgICAgICA8cGF0aCBmaWxsLXJ1bGU9Im5vbnplcm8iIGZpbGw9IiNmZmZmZmYiIGQ9Im0wLDBjLTAuMzU5LTIuMTIyLTIuMDQzLTMuNTQ3LTQuMTkyLTMuNTQ3LTEuMDc3LDAtMS45NCwwLjM0Ny0yLjQ5NCwxLjAwMy0wLjU1LDAuNjUtMC43NTYsMS41NzctMC41ODIsMi42MDgsMC4zMzQsMi4xMDQsMi4wNDYsMy41NzQsNC4xNjIsMy41NzQsMS4wNTUsMCwxLjkxMS0wLjM1LDIuNDc2LTEuMDEyLDAuNTY5LTAuNjY3LDAuNzkzLTEuNTk5LDAuNjMtMi42MjZtNS4xNzYsNy4yMjktMy43MTQsMGMtMC4zMTgsMC0wLjU4OS0wLjIzMS0wLjYzOS0wLjU0NmwtMC4xNjMtMS4wMzgtMC4yNiwwLjM3NmMtMC44MDQsMS4xNjctMi41OTcsMS41NTgtNC4zODcsMS41NTgtNC4xMDMsMC03LjYwOC0zLjExLTguMjktNy40NzEtMC4zNTUtMi4xNzYsMC4xNDktNC4yNTUsMS4zODMtNS43MDYsMS4xMzMtMS4zMzMsMi43NS0xLjg4OCw0LjY3Ny0xLjg4OCwzLjMwOCwwLDUuMTQyLDIuMTI0LDUuMTQyLDIuMTI0bC0wLjE2Ni0xLjAzMmMtMC4wNjItMC4zOTIsMC4yNDEtMC43NDcsMC42MzktMC43NDdoMy4zNDRjMC41MzEsMCwwLjk4MiwwLjM4NSwxLjA2NSwwLjkwOWwyLjAwOCwxMi43MTRjMC4wNjIsMC4zOTItMC4yNDIsMC43NDctMC42MzksMC43NDciLz4NCiAgICAgICAgICAgICAgICA8L2c+DQogICAgICAgICAgICAgICAgPCEtLSB5IC0tPg0KICAgICAgICAgICAgICAgIDxnIHRyYW5zZm9ybT0idHJhbnNsYXRlKDEwNC4wNzk1LDI2Ljk1MjMpIj4NCiAgICAgICAgICAgICAgICAgICAgPHBhdGggZmlsbC1ydWxlPSJub256ZXJvIiBmaWxsPSIjZmZmZmZmIiBkPSJNMCwwLTMuNzMzLDBjLTAuMzU3LDAtMC42OTEtMC4xNzctMC44OTEtMC40NzNsLTUuMTUtNy41ODQtMi4xODIsNy4yODhjLTAuMTM3LDAuNDU2LTAuNTU3LDAuNzY5LTEuMDMzLDAuNzY5aC0zLjY2OWMtMC40NDMsMC0wLjc1NS0wLjQzNi0wLjYxMi0wLjg1NWw0LjExLTEyLjA2Ni0zLjg2Ni01LjQ1NWMtMC4zMDMtMC40MjgsMC4wMDMtMS4wMiwwLjUyOC0xLjAyaDMuNzI5YzAuMzUzLDAsMC42ODQsMC4xNzMsMC44ODYsMC40NjNsMTIuNDE0LDE3LjkxOGMwLjI5NywwLjQyOS0wLjAwOSwxLjAxNS0wLjUzMSwxLjAxNSIvPg0KICAgICAgICAgICAgICAgIDwvZz4NCiAgICAgICAgICAgICAgICA8IS0tIGwgLS0+DQogICAgICAgICAgICAgICAgPGcgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMTQzLjk5NiwzMy41ODA3KSI+DQogICAgICAgICAgICAgICAgICAgIDxwYXRoIGZpbGwtcnVsZT0ibm9uemVybyIgZmlsbD0iI2ZmZmZmZiIgZD0ibTAsMC0zLjE4My0yMC4yNTJjLTAuMDYyLTAuMzkyLDAuMjQxLTAuNzQ3LDAuNjM4LTAuNzQ3aDMuMjAyYzAuNTMsMCwwLjk4MiwwLjM4NiwxLjA2NCwwLjkxbDMuMTM5LDE5Ljg4OGMwLjA2MiwwLjM5Mi0wLjI0MSwwLjc0Ny0wLjYzOSwwLjc0N2gtMy41ODJjLTAuMzE5LDAtMC41OS0wLjIzMS0wLjYzOS0wLjU0NiIvPg0KICAgICAgICAgICAgICAgIDwvZz4NCiAgICAgICAgICAgIDwvZz4NCiAgICAgICAgPC9nPg0KICAgIDwvZz4NCjwvc3ZnPg==',
		vector_secondary: 'data:image/svg+xml;base64,PCEtLSBDcmVhdGVkIHdpdGggSW5rc2NhcGUgKGh0dHA6Ly93d3cuaW5rc2NhcGUub3JnLykgLS0+DQo8c3ZnDQogICAgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIg0KICAgIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sOnNwYWNlPSJwcmVzZXJ2ZSIgdmVyc2lvbj0iMS4xIg0KICAgIHhtbG5zOmNjPSJodHRwOi8vY3JlYXRpdmVjb21tb25zLm9yZy9ucyMiDQogICAgeG1sbnM6ZGM9Imh0dHA6Ly9wdXJsLm9yZy9kYy9lbGVtZW50cy8xLjEvIg0KICAgIHZpZXdCb3g9IjAgMCAzNSAzMCI+DQogICAgPG1ldGFkYXRhPg0KICAgICAgICA8cmRmOlJERj4NCiAgICAgICAgICAgIDxjYzpXb3JrIHJkZjphYm91dD0iIj4NCiAgICAgICAgICAgICAgICA8ZGM6Zm9ybWF0PmltYWdlL3N2Zyt4bWw8L2RjOmZvcm1hdD4NCiAgICAgICAgICAgICAgICA8ZGM6dHlwZSByZGY6cmVzb3VyY2U9Imh0dHA6Ly9wdXJsLm9yZy9kYy9kY21pdHlwZS9TdGlsbEltYWdlIi8+DQogICAgICAgICAgICAgICAgPGRjOnRpdGxlLz4NCiAgICAgICAgICAgIDwvY2M6V29yaz4NCiAgICAgICAgPC9yZGY6UkRGPg0KICAgIDwvbWV0YWRhdGE+DQogICAgPGcgdHJhbnNmb3JtPSJtYXRyaXgoMSwwLDAsLTEsLTUuOTE2OTQ0OCw4Ni41MjMxMDMpIj4NCiAgICAgICAgPGcgdHJhbnNmb3JtPSJtYXRyaXgoMS4xMSwwLDAsMS4xMSwtODYuNSw0OC41KSI+DQogICAgICAgICAgICA8Zz4NCiAgICAgICAgICAgICAgICA8IS0tIFAgLS0+DQogICAgICAgICAgICAgICAgPGcgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMTE3LjMzMTIsMjYuODYzMikiPg0KICAgICAgICAgICAgICAgICAgICA8cGF0aCBmaWxsLXJ1bGU9Im5vbnplcm8iIGZpbGw9IiMwMDljZGUiIGQ9Im0wLDBjLTAuNDI0LTIuNzg0LTIuNTUtMi43ODQtNC42MDctMi43ODRoLTEuMTdsMC44MjEsNS4xOThjMC4wNDksMC4zMTQsMC4zMiwwLjU0NSwwLjYzOCwwLjU0NWgwLjUzN2MxLjQsMCwyLjcyMiwwLDMuNDA0LTAuNzk3LDAuNDA4LTAuNDc3LDAuNTMxLTEuMTg1LDAuMzc3LTIuMTYybS0wLjg5NSw3LjI2NC03Ljc1NiwwYy0wLjUzMSwwLTAuOTgyLTAuMzg2LTEuMDY1LTAuOTFsLTMuMTM2LTE5Ljg4OGMtMC4wNjItMC4zOTIsMC4yNDItMC43NDcsMC42MzgtMC43NDdoMy45OGMwLjM3MSwwLDAuNjg3LDAuMjcsMC43NDUsMC42MzZsMC44OSw1LjYzOWMwLjA4MiwwLjUyNCwwLjUzNCwwLjkxLDEuMDY0LDAuOTFoMi40NTRjNS4xMDksMCw4LjA1OCwyLjQ3Miw4LjgyOCw3LjM3MywwLjM0NywyLjE0MiwwLjAxNCwzLjgyNi0wLjk4OSw1LjAwNS0xLjEwMywxLjI5Ni0zLjA1OCwxLjk4Mi01LjY1MywxLjk4MiIvPg0KICAgICAgICAgICAgICAgIDwvZz4NCiAgICAgICAgICAgICAgICA8IS0tIFAgLS0+DQogICAgICAgICAgICAgICAgPGcgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoNjIuMDExNSwyNi44NjMyKSI+DQogICAgICAgICAgICAgICAgICAgIDxwYXRoIGZpbGwtcnVsZT0ibm9uemVybyIgZmlsbD0iIzAwMzA4NyIgZD0ibTAsMGMtMC40MjQtMi43ODQtMi41NS0yLjc4NC00LjYwNy0yLjc4NGgtMS4xN2wwLjgyMSw1LjE5OGMwLjA0OSwwLjMxNCwwLjMyLDAuNTQ1LDAuNjM4LDAuNTQ1aDAuNTM3YzEuNCwwLDIuNzIyLDAsMy40MDQtMC43OTcsMC40MDgtMC40NzcsMC41MzEtMS4xODUsMC4zNzctMi4xNjJtLTAuODk1LDcuMjY0LTcuNzU2LDBjLTAuNTMxLDAtMC45ODItMC4zODYtMS4wNjUtMC45MWwtMy4xMzYtMTkuODg4Yy0wLjA2Mi0wLjM5MiwwLjI0MS0wLjc0NywwLjYzOC0wLjc0N2gzLjcwNGMwLjUzLDAsMC45ODEsMC4zODYsMS4wNjQsMC45MDlsMC44NDcsNS4zNjZjMC4wODIsMC41MjQsMC41MzQsMC45MSwxLjA2NCwwLjkxaDIuNDU0YzUuMTA5LDAsOC4wNTgsMi40NzIsOC44MjgsNy4zNzMsMC4zNDcsMi4xNDIsMC4wMTQsMy44MjYtMC45ODksNS4wMDUtMS4xMDMsMS4yOTYtMy4wNTgsMS45ODItNS42NTMsMS45ODIiLz4NCiAgICAgICAgICAgICAgICA8L2c+DQogICAgICAgICAgICAgICAgPCEtLSBhIC0tPg0KICAgICAgICAgICAgICAgIDxnIHRyYW5zZm9ybT0idHJhbnNsYXRlKDc5LjEyMjgsMTkuNzIzNCkiPg0KICAgICAgICAgICAgICAgICAgICA8cGF0aCBmaWxsLXJ1bGU9Im5vbnplcm8iIGZpbGw9IiMwMDMwODciIGQ9Im0wLDBjLTAuMzU5LTIuMTIyLTIuMDQzLTMuNTQ3LTQuMTkyLTMuNTQ3LTEuMDc3LDAtMS45NCwwLjM0Ny0yLjQ5NCwxLjAwMy0wLjU0OSwwLjY1LTAuNzU2LDEuNTc3LTAuNTgyLDIuNjA4LDAuMzM0LDIuMTA0LDIuMDQ2LDMuNTc0LDQuMTYyLDMuNTc0LDEuMDU1LDAsMS45MTEtMC4zNSwyLjQ3Ni0xLjAxMiwwLjU2OS0wLjY2NywwLjc5My0xLjU5OSwwLjYzLTIuNjI2bTUuMTc2LDcuMjI5LTMuNzE0LDBjLTAuMzE4LDAtMC41ODktMC4yMzEtMC42MzktMC41NDZsLTAuMTYzLTEuMDM4LTAuMjU5LDAuMzc2Yy0wLjgwNSwxLjE2Ny0yLjU5OCwxLjU1OC00LjM4OCwxLjU1OC00LjEwMywwLTcuNjA4LTMuMTEtOC4yOS03LjQ3MS0wLjM1NS0yLjE3NiwwLjE0OS00LjI1NSwxLjM4My01LjcwNiwxLjEzMy0xLjMzMywyLjc1LTEuODg4LDQuNjc3LTEuODg4LDMuMzA4LDAsNS4xNDIsMi4xMjQsNS4xNDIsMi4xMjRsLTAuMTY2LTEuMDMyYy0wLjA2Mi0wLjM5MiwwLjI0MS0wLjc0NywwLjYzOS0wLjc0N2gzLjM0NGMwLjUzMSwwLDAuOTgyLDAuMzg1LDEuMDY1LDAuOTA5bDIuMDA4LDEyLjcxNGMwLjA2MiwwLjM5Mi0wLjI0MiwwLjc0Ny0wLjYzOSwwLjc0NyIvPg0KICAgICAgICAgICAgICAgIDwvZz4NCiAgICAgICAgICAgICAgICA8IS0tIGEgLS0+DQogICAgICAgICAgICAgICAgPGcgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMTM0LjQ0MjYsMTkuNzIzNCkiPg0KICAgICAgICAgICAgICAgICAgICA8cGF0aCBmaWxsLXJ1bGU9Im5vbnplcm8iIGZpbGw9IiMwMDljZGUiIGQ9Im0wLDBjLTAuMzU5LTIuMTIyLTIuMDQzLTMuNTQ3LTQuMTkyLTMuNTQ3LTEuMDc3LDAtMS45NCwwLjM0Ny0yLjQ5NCwxLjAwMy0wLjU1LDAuNjUtMC43NTYsMS41NzctMC41ODIsMi42MDgsMC4zMzQsMi4xMDQsMi4wNDYsMy41NzQsNC4xNjIsMy41NzQsMS4wNTUsMCwxLjkxMS0wLjM1LDIuNDc2LTEuMDEyLDAuNTY5LTAuNjY3LDAuNzkzLTEuNTk5LDAuNjMtMi42MjZtNS4xNzYsNy4yMjktMy43MTQsMGMtMC4zMTgsMC0wLjU4OS0wLjIzMS0wLjYzOS0wLjU0NmwtMC4xNjMtMS4wMzgtMC4yNiwwLjM3NmMtMC44MDQsMS4xNjctMi41OTcsMS41NTgtNC4zODcsMS41NTgtNC4xMDMsMC03LjYwOC0zLjExLTguMjktNy40NzEtMC4zNTUtMi4xNzYsMC4xNDktNC4yNTUsMS4zODMtNS43MDYsMS4xMzMtMS4zMzMsMi43NS0xLjg4OCw0LjY3Ny0xLjg4OCwzLjMwOCwwLDUuMTQyLDIuMTI0LDUuMTQyLDIuMTI0bC0wLjE2Ni0xLjAzMmMtMC4wNjItMC4zOTIsMC4yNDEtMC43NDcsMC42MzktMC43NDdoMy4zNDRjMC41MzEsMCwwLjk4MiwwLjM4NSwxLjA2NSwwLjkwOWwyLjAwOCwxMi43MTRjMC4wNjIsMC4zOTItMC4yNDIsMC43NDctMC42MzksMC43NDciLz4NCiAgICAgICAgICAgICAgICA8L2c+DQogICAgICAgICAgICAgICAgPCEtLSB5IC0tPg0KICAgICAgICAgICAgICAgIDxnIHRyYW5zZm9ybT0idHJhbnNsYXRlKDEwNC4wNzk1LDI2Ljk1MjMpIj4NCiAgICAgICAgICAgICAgICAgICAgPHBhdGggZmlsbC1ydWxlPSJub256ZXJvIiBmaWxsPSIjMDAzMDg3IiBkPSJNMCwwLTMuNzMzLDBjLTAuMzU3LDAtMC42OTEtMC4xNzctMC44OTEtMC40NzNsLTUuMTUtNy41ODQtMi4xODIsNy4yODhjLTAuMTM3LDAuNDU2LTAuNTU3LDAuNzY5LTEuMDMzLDAuNzY5aC0zLjY2OWMtMC40NDMsMC0wLjc1NS0wLjQzNi0wLjYxMi0wLjg1NWw0LjExLTEyLjA2Ni0zLjg2Ni01LjQ1NWMtMC4zMDMtMC40MjgsMC4wMDMtMS4wMiwwLjUyOC0xLjAyaDMuNzI5YzAuMzUzLDAsMC42ODQsMC4xNzMsMC44ODYsMC40NjNsMTIuNDE0LDE3LjkxOGMwLjI5NywwLjQyOS0wLjAwOSwxLjAxNS0wLjUzMSwxLjAxNSIvPg0KICAgICAgICAgICAgICAgIDwvZz4NCiAgICAgICAgICAgICAgICA8IS0tIGwgLS0+DQogICAgICAgICAgICAgICAgPGcgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMTQzLjk5NiwzMy41ODA3KSI+DQogICAgICAgICAgICAgICAgICAgIDxwYXRoIGZpbGwtcnVsZT0ibm9uemVybyIgZmlsbD0iIzAwOWNkZSIgZD0ibTAsMC0zLjE4My0yMC4yNTJjLTAuMDYyLTAuMzkyLDAuMjQxLTAuNzQ3LDAuNjM4LTAuNzQ3aDMuMjAyYzAuNTMsMCwwLjk4MiwwLjM4NiwxLjA2NCwwLjkxbDMuMTM5LDE5Ljg4OGMwLjA2MiwwLjM5Mi0wLjI0MSwwLjc0Ny0wLjYzOSwwLjc0N2gtMy41ODJjLTAuMzE5LDAtMC41OS0wLjIzMS0wLjYzOS0wLjU0NiIvPg0KICAgICAgICAgICAgICAgIDwvZz4NCiAgICAgICAgICAgIDwvZz4NCiAgICAgICAgPC9nPg0KICAgIDwvZz4NCjwvc3ZnPg=='
	}

};

},{}],15:[function(require,module,exports){
'use strict';


var DataStore = require('./util/datastore'),
    constants = require('./constants'),
    button = require('./button'),
    css = require('browserlib').css,
    form = require('./form'),
    QR = require('./qr'),
    dynamic = require('./util/dynamic'),    
    hasCss = false;

module.exports = function factory(business, raw, config, parent) {
    var data, wrapper, html, key, label, type;
    var buttonEl, requestedHeight, requestedWidth, finalHeight, finalWidth, renderedWidth, heightWidthRatio, dynamicCssModel;

    if (!business) {
        return false;
    }


    // Normalize incoming data if needed
    if (raw.items) {
        data = raw;
    } else {
        data = new DataStore();

        for (key in raw) {
            if (raw.hasOwnProperty(key)) {
                data.add(key, raw[key]);
            }
        }
    }


    // Defaults
    config = config || {};
    label = config.label || constants.DEFAULT_LABEL;
    type = config.type || constants.DEFAULT_TYPE;


    // Cart
    if (type === 'cart') {
        data.add('cmd', '_cart');
        data.add('add', true);
    // Donation
    } else if (type === 'donate') {
        data.add('cmd', '_donations');
    // Subscribe
    } else if (type === 'subscribe') {
        data.add('cmd', '_xclick-subscriptions');

        if (data.get('amount') && !data.get('a3')) {
            data.add('a3', data.pluck('amount'));
        }
    // Buy Now
    } else if (data.get('hosted_button_id')) {
        data.add('cmd', '_s-xclick');
    } else {
        data.add('cmd', '_xclick');
    }

    // Add common data
    data.add('business', business);
    data.add('bn', constants.BN_CODE.replace(/\{label\}/, label));

    // If there is *either* a custom width or height,
    // then set the size to large and calculate an approximate ratio
    // first with the given label
    if (type !== 'qr' && (data.get('height') || data.get('width'))) {
        requestedHeight = data.pluck('height');
        requestedWidth = data.pluck('width');
        config.size = 'large'; // baseline for ratio

        wrapper = document.createElement('div');
        wrapper.className = constants.WIDGET_NAME;
        wrapper.innerHTML = button(label, data, config);
        wrapper.style.visibility = 'hidden';

        parent.appendChild(wrapper);
        buttonEl = wrapper.children[0];

        heightWidthRatio = (buttonEl.offsetHeight - 2) / buttonEl.offsetWidth; // -2 because borders
        parent.removeChild(wrapper);

        // now, if the height is not given, we calculate an optimal height given the width
        // otherwise we just use the supplied height
        finalHeight = requestedHeight || Math.floor(requestedWidth * heightWidthRatio);
        data.add('height', finalHeight.toString());

        // the width is either what's specified or interpolated
        finalWidth = requestedWidth || Math.floor(finalHeight / heightWidthRatio);
        data.add('width', finalWidth.toString());

        // we generate some dynamic CSS largely based on the height
        dynamicCssModel = dynamic.cssModelUsing(finalHeight, finalWidth);
        css.inject(document.getElementsByTagName('head')[0], dynamic.generateCssUsing(dynamicCssModel));

        // we again re-insert the element to determine the actual width
        wrapper.innerHTML = button(label, data, config);
        parent.appendChild(wrapper);
        buttonEl = wrapper.children[0];
        renderedWidth = buttonEl.offsetWidth;
        parent.removeChild(wrapper);

        // if the final result is not as long as requested, we pad it
        if (requestedWidth && requestedWidth > renderedWidth) {
            dynamicCssModel.contentPaddingRight = dynamicCssModel.contentPaddingRight + Math.floor((finalWidth - renderedWidth) / 2);
            dynamicCssModel.contentPaddingLeft = dynamicCssModel.contentPaddingLeft + Math.ceil((finalWidth - renderedWidth) / 2);            
        }

        // we are done, and inject the corrected CSS
        css.inject(document.getElementsByTagName('head')[0], dynamic.generateCssUsing(dynamicCssModel));

    }

    // Build the UI components
    if (type === 'qr') {
        html = QR(data, config);
    } else if (type === 'button') {
        html = button(label, data, config);
    } else {
        html = form(label, data, config);
    }


    // Inject the CSS onto the page
    if (!hasCss) {
        hasCss = true;
        css.inject(document.getElementsByTagName('head')[0], constants.STYLES);
    }


    // Wrap it up all nice and neat and return it
    wrapper = document.createElement('div');
    wrapper.className = constants.WIDGET_NAME;
    wrapper.innerHTML = html;

    return {
        label: label,
        type: type,
        el: wrapper
    };
};

},{"./button":13,"./constants":14,"./form":16,"./qr":18,"./util/datastore":19,"./util/dynamic":20,"browserlib":6}],16:[function(require,module,exports){
'use strict';


var constants = require('./constants'),
    template = require('./util/template'),
    button = require('./button');


module.exports = function form(type, data, config) {
    var model, btn, url, locale;

    btn = button(type, data, config);
    locale = data.get('lc') || constants.DEFAULT_LOCALE;
    
    url = constants.PAYPAL_URL;
    url = url.replace('{host}', config.host || constants.DEFAULT_HOST);

    model = {
        data: data.items,
        button: btn,
        url: url,
        content: constants.STRINGS[locale]
    };

    return template(constants.TEMPLATES.form, model);
};



},{"./button":13,"./constants":14,"./util/template":21}],17:[function(require,module,exports){
'use strict';


var DataStore = require('./util/datastore'),
    factory = require('./factory'),
    app = {};


app.counter = {
    buynow: 0,
    cart: 0,
    donate: 0,
    subscribe: 0
};


app.create = function (business, data, config, parent) {
    var result = factory(business, data, config, parent);

    if (result) {
        // Log how many buttons were created
        app.counter[result.label] += 1;

        // Add it to the page
        if (parent) {
            parent.appendChild(result.el);
        }
    }

    return result;
};


app.process = function (el) {
    var nodes = el.getElementsByTagName('script'),
        node, data, business, i, len;

    for (i = 0, len = nodes.length; i < len; i++) {
        node = nodes[i];

        if (!node || !node.src) {
            continue;
        }

        data = new DataStore();
        data.parse(node);

        // If there's a merchant ID attached then it's a button of interest
        if ((business = data.pluck('merchant') || node.src.split('?merchant=')[1])) {
            app.create(
                business,
                data,
                {
                    type: data.pluck('type'),
                    label: data.pluck('button'),
                    size: data.pluck('size'),
                    style: data.pluck('style'),
                    host: data.pluck('host')
                },
                node.parentNode
            );

            // Clean up
            node.parentNode.removeChild(node);
        }
    }
};



// Support node and the browser
if (typeof window === 'undefined') {
    module.exports = app;
} else {
    // Make the API available
    if (!window.paypal) {
        window.paypal = {};
        window.paypal.button = app;
    }

    // Bind to existing scripts
    window.paypal.button.process(document);
}

},{"./factory":15,"./util/datastore":19}],18:[function(require,module,exports){
'use strict';


var constants = require('./constants'),
    template = require('./util/template');


module.exports = function Qr(data, config) {
    var model = {}, url, key;
    
    // Defaults
    config = config || {};
    config.size = config.size || constants.QR_SIZE;
    config.host = config.host || constants.DEFAULT_HOST;

    // Construct URL
    url = constants.PAYPAL_URL;
    url = url.replace('{host}', config.host);
    url = url + '?';

    for (key in data.items) {
        if (data.items.hasOwnProperty(key)) {
            url += key + '=' + encodeURIComponent(data.get(key)) + '&';
        }
    }

    url = encodeURIComponent(url);

    // Render
    model.url = constants.QR_URL
		.replace('{host}', config.host)
		.replace('{url}', url)
		.replace('{pattern}', constants.QR_PATTERN)
		.replace('{size}', config.size);


    return template(constants.TEMPLATES.qr, model);
};

},{"./constants":14,"./util/template":21}],19:[function(require,module,exports){
'use strict';


var constants = require('../constants');


function DataStore() {
    this.items = {};
}


DataStore.prototype.add = function addData(key, val) {
    // Remap nice values
    key = constants.PRETTY_PARAMS[key] || key;

    // Wrap strings in the value object
    if (typeof val === 'string') {
        val = {
            value: val
        };
    }

    this.items[key] = {
        label: val.label || '',
        value: val.value || '',
        editable: !!val.editable
    };
};


DataStore.prototype.get = function getData(key) {
    var item = this.items[key];

    return item && item.value;
};


DataStore.prototype.remove = function removeData(key) {
    delete this.items[key];
};


DataStore.prototype.pluck = function pluckData(key) {
    var val = this.get(key);
    this.remove(key);

    return val;
};


DataStore.prototype.parse = function parseData(el) {
    var attrs, attr, matches, key, label, value, editable, len, i;

    if ((attrs = el.attributes)) {

        for (i = 0, len = attrs.length; i < len; i++) {
            attr = attrs[i];

            if ((matches = attr.name.match(/^data-([a-z0-9_]+)(-editable)?/i))) {
                key = matches[1];
                editable = !!matches[2];
                value = attr.value;

                if (key.indexOf('option') === 0) {
                    value = value.split('=');
                    label = value[0];
                    value = value[1].split(',');
                }

                this.add(key, {
                    label: label,
                    value: value,
                    editable: editable
                });
            }


        }
    }
};



module.exports = DataStore;

},{"../constants":14}],20:[function(require,module,exports){
'use strict';

var template = require('./template'),
	constants = require('../constants');

function cssModelUsing(height,width) {

	var dynamicCssModel, h, w;

    h = parseInt(height,10);
    w = parseInt(width, 10);
    dynamicCssModel = {
        width: w,
        height: h,
        logoWidth: h,
        logoHeight: h,
        logo_imgWidth: h - 2 * Math.floor((h - 6) / 6),
        logo_imgHeight: h - 2 * Math.floor((h - 6) / 6),
        logo_marginTop: Math.floor((h - 6) / 6),
        contentHeight: Math.floor((h + 8) / 2),
        contentFontSize: Math.floor((h + 36) / 6),
        contentLineHeight: Math.floor((h + 8) / 2),
        contentPaddingTop: Math.floor((h - 8) / 4),
        contentPaddingRight: Math.floor((5 * h + 24) / 18),
        contentPaddingBottom: h - Math.floor((h + 8) / 2) - Math.floor((h - 8) / 4),
        contentPaddingLeft: Math.floor((5 * h + 24) / 18),
        contentMinWidth: 0,
        content_imgWidth: Math.floor((11 * h + 96) / 6),
        content_imgHeight: Math.floor((h + 8) / 2),
        content_imgMarginTop: Math.floor((h + 8) / 20),
        content_imgMarginLeft: Math.floor((h + 8) / 20)
    };

    return dynamicCssModel;

}

function generateCssUsing(cssModel) {
	return template(constants.CSS_TEMPLATES['css/dynamic'], cssModel);
}

module.exports = {
	cssModelUsing: cssModelUsing,
	generateCssUsing: generateCssUsing
};
},{"../constants":14,"./template":21}],21:[function(require,module,exports){
'use strict';


var ejs = require('ejs');


module.exports = function template(str, data) {
    return ejs.render(str, data);
};


// Workaround for IE 8's lack of support
if (!String.prototype.trim) {
    String.prototype.trim = function () {
        return this.replace(/^\s+|\s+$/g, '');
    };
}
},{"ejs":10}]},{},[13,14,15,16,17,18,19,20,21])
;