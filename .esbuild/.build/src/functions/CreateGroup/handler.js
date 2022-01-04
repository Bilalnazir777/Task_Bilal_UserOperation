var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __markAsModule = (target) => __defProp(target, "__esModule", { value: true });
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __reExport = (target, module2, copyDefault, desc) => {
  if (module2 && typeof module2 === "object" || typeof module2 === "function") {
    for (let key of __getOwnPropNames(module2))
      if (!__hasOwnProp.call(target, key) && (copyDefault || key !== "default"))
        __defProp(target, key, { get: () => module2[key], enumerable: !(desc = __getOwnPropDesc(module2, key)) || desc.enumerable });
  }
  return target;
};
var __toESM = (module2, isNodeMode) => {
  return __reExport(__markAsModule(__defProp(module2 != null ? __create(__getProtoOf(module2)) : {}, "default", !isNodeMode && module2 && module2.__esModule ? { get: () => module2.default, enumerable: true } : { value: module2, enumerable: true })), module2);
};
var __toCommonJS = /* @__PURE__ */ ((cache) => {
  return (module2, temp) => {
    return cache && cache.get(module2) || (temp = __reExport(__markAsModule({}), module2, 1), cache && cache.set(module2, temp), temp);
  };
})(typeof WeakMap !== "undefined" ? /* @__PURE__ */ new WeakMap() : 0);

// node_modules/@middy/core/isPromise.js
var require_isPromise = __commonJS({
  "node_modules/@middy/core/isPromise.js"(exports2, module2) {
    module2.exports = (val) => {
      return val && typeof val.then === "function" && typeof val.catch === "function";
    };
  }
});

// node_modules/wrappy/wrappy.js
var require_wrappy = __commonJS({
  "node_modules/wrappy/wrappy.js"(exports2, module2) {
    module2.exports = wrappy;
    function wrappy(fn2, cb) {
      if (fn2 && cb)
        return wrappy(fn2)(cb);
      if (typeof fn2 !== "function")
        throw new TypeError("need wrapper function");
      Object.keys(fn2).forEach(function(k) {
        wrapper[k] = fn2[k];
      });
      return wrapper;
      function wrapper() {
        var args2 = new Array(arguments.length);
        for (var i = 0; i < args2.length; i++) {
          args2[i] = arguments[i];
        }
        var ret = fn2.apply(this, args2);
        var cb2 = args2[args2.length - 1];
        if (typeof ret === "function" && ret !== cb2) {
          Object.keys(cb2).forEach(function(k) {
            ret[k] = cb2[k];
          });
        }
        return ret;
      }
    }
  }
});

// node_modules/once/once.js
var require_once = __commonJS({
  "node_modules/once/once.js"(exports2, module2) {
    var wrappy = require_wrappy();
    module2.exports = wrappy(once);
    module2.exports.strict = wrappy(onceStrict);
    once.proto = once(function() {
      Object.defineProperty(Function.prototype, "once", {
        value: function() {
          return once(this);
        },
        configurable: true
      });
      Object.defineProperty(Function.prototype, "onceStrict", {
        value: function() {
          return onceStrict(this);
        },
        configurable: true
      });
    });
    function once(fn2) {
      var f = function() {
        if (f.called)
          return f.value;
        f.called = true;
        return f.value = fn2.apply(this, arguments);
      };
      f.called = false;
      return f;
    }
    function onceStrict(fn2) {
      var f = function() {
        if (f.called)
          throw new Error(f.onceError);
        f.called = true;
        return f.value = fn2.apply(this, arguments);
      };
      var name = fn2.name || "Function wrapped with `once`";
      f.onceError = name + " shouldn't be called more than once";
      f.called = false;
      return f;
    }
  }
});

// node_modules/@middy/core/index.js
var require_core = __commonJS({
  "node_modules/@middy/core/index.js"(exports2, module2) {
    var isPromise = require_isPromise();
    var once = require_once();
    var runMiddlewares = (middlewares, request, done) => {
      const stack2 = Array.from(middlewares);
      const runNext = (err) => {
        try {
          if (err) {
            return done(err);
          }
          const nextMiddleware = stack2.shift();
          if (nextMiddleware) {
            const retVal = nextMiddleware(request, runNext);
            if (retVal) {
              if (!isPromise(retVal)) {
                throw new Error("Unexpected return value in middleware");
              }
              retVal.then(runNext).catch(done);
            }
            return;
          }
          return done();
        } catch (err2) {
          return done(err2);
        }
      };
      runNext();
    };
    var runErrorMiddlewares = (middlewares, request, done) => {
      const stack2 = Array.from(middlewares);
      request.__handledError = false;
      const runNext = (err) => {
        try {
          if (!err) {
            request.__handledError = true;
          }
          const nextMiddleware = stack2.shift();
          if (nextMiddleware) {
            const retVal = nextMiddleware(request, runNext);
            if (retVal) {
              if (!isPromise(retVal)) {
                const invalidMiddlewareReturnError = new Error("Unexpected return value in onError middleware");
                invalidMiddlewareReturnError.originalError = err;
                throw invalidMiddlewareReturnError;
              }
              retVal.then(runNext).catch(done);
            }
            return;
          }
          return done(request.__handledError ? null : err);
        } catch (err2) {
          return done(err2);
        }
      };
      runNext(request.error);
    };
    var middy2 = (handler) => {
      const beforeMiddlewares = [];
      const afterMiddlewares = [];
      const errorMiddlewares = [];
      const instance = (event, context, callback) => {
        const request = {};
        request.event = event;
        request.context = context;
        request.callback = callback;
        request.response = null;
        request.error = null;
        const middyPromise = new Promise((resolve, reject) => {
          const terminate = (err) => {
            if (err) {
              return callback ? callback(err) : reject(err);
            }
            return callback ? callback(null, request.response) : resolve(request.response);
          };
          const errorHandler = (err) => {
            request.error = err;
            return runErrorMiddlewares(errorMiddlewares, request, terminate);
          };
          runMiddlewares(beforeMiddlewares, request, (err) => {
            if (err)
              return errorHandler(err);
            const onHandlerError = once((err2) => {
              request.response = null;
              errorHandler(err2);
            });
            const onHandlerSuccess = once((response) => {
              request.response = response;
              runMiddlewares(afterMiddlewares, request, (err2) => {
                if (err2)
                  return errorHandler(err2);
                terminate();
              });
            });
            const handlerReturnValue = handler.call(request, request.event, request.context, (err2, response) => {
              if (err2)
                return onHandlerError(err2);
              onHandlerSuccess(response);
            });
            if (handlerReturnValue) {
              if (!isPromise(handlerReturnValue)) {
                throw new Error("Unexpected return value in handler");
              }
              handlerReturnValue.then(onHandlerSuccess).catch(onHandlerError);
            }
          });
        });
        if (!request.callback)
          return middyPromise;
      };
      instance.use = (middlewares) => {
        if (Array.isArray(middlewares)) {
          middlewares.forEach((middleware) => instance.applyMiddleware(middleware));
          return instance;
        } else if (typeof middlewares === "object") {
          return instance.applyMiddleware(middlewares);
        } else {
          throw new Error("Middy.use() accepts an object or an array of objects");
        }
      };
      instance.applyMiddleware = (middleware) => {
        if (typeof middleware !== "object") {
          throw new Error("Middleware must be an object");
        }
        const { before, after, onError } = middleware;
        if (!before && !after && !onError) {
          throw new Error('Middleware must contain at least one key among "before", "after", "onError"');
        }
        if (before) {
          instance.before(before);
        }
        if (after) {
          instance.after(after);
        }
        if (onError) {
          instance.onError(onError);
        }
        return instance;
      };
      instance.before = (beforeMiddleware) => {
        beforeMiddlewares.push(beforeMiddleware);
        return instance;
      };
      instance.after = (afterMiddleware) => {
        afterMiddlewares.unshift(afterMiddleware);
        return instance;
      };
      instance.onError = (errorMiddleware) => {
        errorMiddlewares.push(errorMiddleware);
        return instance;
      };
      instance.__middlewares = {
        before: beforeMiddlewares,
        after: afterMiddlewares,
        onError: errorMiddlewares
      };
      return instance;
    };
    module2.exports = middy2;
  }
});

// node_modules/depd/lib/compat/callsite-tostring.js
var require_callsite_tostring = __commonJS({
  "node_modules/depd/lib/compat/callsite-tostring.js"(exports2, module2) {
    "use strict";
    module2.exports = callSiteToString2;
    function callSiteFileLocation(callSite) {
      var fileName;
      var fileLocation = "";
      if (callSite.isNative()) {
        fileLocation = "native";
      } else if (callSite.isEval()) {
        fileName = callSite.getScriptNameOrSourceURL();
        if (!fileName) {
          fileLocation = callSite.getEvalOrigin();
        }
      } else {
        fileName = callSite.getFileName();
      }
      if (fileName) {
        fileLocation += fileName;
        var lineNumber = callSite.getLineNumber();
        if (lineNumber != null) {
          fileLocation += ":" + lineNumber;
          var columnNumber = callSite.getColumnNumber();
          if (columnNumber) {
            fileLocation += ":" + columnNumber;
          }
        }
      }
      return fileLocation || "unknown source";
    }
    function callSiteToString2(callSite) {
      var addSuffix = true;
      var fileLocation = callSiteFileLocation(callSite);
      var functionName = callSite.getFunctionName();
      var isConstructor = callSite.isConstructor();
      var isMethodCall = !(callSite.isToplevel() || isConstructor);
      var line = "";
      if (isMethodCall) {
        var methodName = callSite.getMethodName();
        var typeName = getConstructorName(callSite);
        if (functionName) {
          if (typeName && functionName.indexOf(typeName) !== 0) {
            line += typeName + ".";
          }
          line += functionName;
          if (methodName && functionName.lastIndexOf("." + methodName) !== functionName.length - methodName.length - 1) {
            line += " [as " + methodName + "]";
          }
        } else {
          line += typeName + "." + (methodName || "<anonymous>");
        }
      } else if (isConstructor) {
        line += "new " + (functionName || "<anonymous>");
      } else if (functionName) {
        line += functionName;
      } else {
        addSuffix = false;
        line += fileLocation;
      }
      if (addSuffix) {
        line += " (" + fileLocation + ")";
      }
      return line;
    }
    function getConstructorName(obj) {
      var receiver = obj.receiver;
      return receiver.constructor && receiver.constructor.name || null;
    }
  }
});

// node_modules/depd/lib/compat/event-listener-count.js
var require_event_listener_count = __commonJS({
  "node_modules/depd/lib/compat/event-listener-count.js"(exports2, module2) {
    "use strict";
    module2.exports = eventListenerCount2;
    function eventListenerCount2(emitter, type) {
      return emitter.listeners(type).length;
    }
  }
});

// node_modules/depd/lib/compat/index.js
var require_compat = __commonJS({
  "node_modules/depd/lib/compat/index.js"(exports2, module2) {
    "use strict";
    var EventEmitter = require("events").EventEmitter;
    lazyProperty(module2.exports, "callSiteToString", function callSiteToString2() {
      var limit = Error.stackTraceLimit;
      var obj = {};
      var prep = Error.prepareStackTrace;
      function prepareObjectStackTrace2(obj2, stack3) {
        return stack3;
      }
      Error.prepareStackTrace = prepareObjectStackTrace2;
      Error.stackTraceLimit = 2;
      Error.captureStackTrace(obj);
      var stack2 = obj.stack.slice();
      Error.prepareStackTrace = prep;
      Error.stackTraceLimit = limit;
      return stack2[0].toString ? toString : require_callsite_tostring();
    });
    lazyProperty(module2.exports, "eventListenerCount", function eventListenerCount2() {
      return EventEmitter.listenerCount || require_event_listener_count();
    });
    function lazyProperty(obj, prop, getter) {
      function get() {
        var val = getter();
        Object.defineProperty(obj, prop, {
          configurable: true,
          enumerable: true,
          value: val
        });
        return val;
      }
      Object.defineProperty(obj, prop, {
        configurable: true,
        enumerable: true,
        get
      });
    }
    function toString(obj) {
      return obj.toString();
    }
  }
});

// node_modules/depd/index.js
var require_depd = __commonJS({
  "node_modules/depd/index.js"(exports, module) {
    var callSiteToString = require_compat().callSiteToString;
    var eventListenerCount = require_compat().eventListenerCount;
    var relative = require("path").relative;
    module.exports = depd;
    var basePath = process.cwd();
    function containsNamespace(str, namespace) {
      var vals = str.split(/[ ,]+/);
      var ns = String(namespace).toLowerCase();
      for (var i = 0; i < vals.length; i++) {
        var val = vals[i];
        if (val && (val === "*" || val.toLowerCase() === ns)) {
          return true;
        }
      }
      return false;
    }
    function convertDataDescriptorToAccessor(obj, prop, message2) {
      var descriptor = Object.getOwnPropertyDescriptor(obj, prop);
      var value = descriptor.value;
      descriptor.get = function getter() {
        return value;
      };
      if (descriptor.writable) {
        descriptor.set = function setter(val) {
          return value = val;
        };
      }
      delete descriptor.value;
      delete descriptor.writable;
      Object.defineProperty(obj, prop, descriptor);
      return descriptor;
    }
    function createArgumentsString(arity) {
      var str = "";
      for (var i = 0; i < arity; i++) {
        str += ", arg" + i;
      }
      return str.substr(2);
    }
    function createStackString(stack2) {
      var str = this.name + ": " + this.namespace;
      if (this.message) {
        str += " deprecated " + this.message;
      }
      for (var i = 0; i < stack2.length; i++) {
        str += "\n    at " + callSiteToString(stack2[i]);
      }
      return str;
    }
    function depd(namespace) {
      if (!namespace) {
        throw new TypeError("argument namespace is required");
      }
      var stack2 = getStack();
      var site2 = callSiteLocation(stack2[1]);
      var file = site2[0];
      function deprecate2(message2) {
        log.call(deprecate2, message2);
      }
      deprecate2._file = file;
      deprecate2._ignored = isignored(namespace);
      deprecate2._namespace = namespace;
      deprecate2._traced = istraced(namespace);
      deprecate2._warned = Object.create(null);
      deprecate2.function = wrapfunction;
      deprecate2.property = wrapproperty;
      return deprecate2;
    }
    function isignored(namespace) {
      if (process.noDeprecation) {
        return true;
      }
      var str = process.env.NO_DEPRECATION || "";
      return containsNamespace(str, namespace);
    }
    function istraced(namespace) {
      if (process.traceDeprecation) {
        return true;
      }
      var str = process.env.TRACE_DEPRECATION || "";
      return containsNamespace(str, namespace);
    }
    function log(message2, site2) {
      var haslisteners = eventListenerCount(process, "deprecation") !== 0;
      if (!haslisteners && this._ignored) {
        return;
      }
      var caller;
      var callFile;
      var callSite;
      var depSite;
      var i = 0;
      var seen = false;
      var stack2 = getStack();
      var file = this._file;
      if (site2) {
        depSite = site2;
        callSite = callSiteLocation(stack2[1]);
        callSite.name = depSite.name;
        file = callSite[0];
      } else {
        i = 2;
        depSite = callSiteLocation(stack2[i]);
        callSite = depSite;
      }
      for (; i < stack2.length; i++) {
        caller = callSiteLocation(stack2[i]);
        callFile = caller[0];
        if (callFile === file) {
          seen = true;
        } else if (callFile === this._file) {
          file = this._file;
        } else if (seen) {
          break;
        }
      }
      var key = caller ? depSite.join(":") + "__" + caller.join(":") : void 0;
      if (key !== void 0 && key in this._warned) {
        return;
      }
      this._warned[key] = true;
      var msg = message2;
      if (!msg) {
        msg = callSite === depSite || !callSite.name ? defaultMessage(depSite) : defaultMessage(callSite);
      }
      if (haslisteners) {
        var err = DeprecationError(this._namespace, msg, stack2.slice(i));
        process.emit("deprecation", err);
        return;
      }
      var format = process.stderr.isTTY ? formatColor : formatPlain;
      var output = format.call(this, msg, caller, stack2.slice(i));
      process.stderr.write(output + "\n", "utf8");
    }
    function callSiteLocation(callSite) {
      var file = callSite.getFileName() || "<anonymous>";
      var line = callSite.getLineNumber();
      var colm = callSite.getColumnNumber();
      if (callSite.isEval()) {
        file = callSite.getEvalOrigin() + ", " + file;
      }
      var site2 = [file, line, colm];
      site2.callSite = callSite;
      site2.name = callSite.getFunctionName();
      return site2;
    }
    function defaultMessage(site2) {
      var callSite = site2.callSite;
      var funcName = site2.name;
      if (!funcName) {
        funcName = "<anonymous@" + formatLocation(site2) + ">";
      }
      var context = callSite.getThis();
      var typeName = context && callSite.getTypeName();
      if (typeName === "Object") {
        typeName = void 0;
      }
      if (typeName === "Function") {
        typeName = context.name || typeName;
      }
      return typeName && callSite.getMethodName() ? typeName + "." + funcName : funcName;
    }
    function formatPlain(msg, caller, stack2) {
      var timestamp = new Date().toUTCString();
      var formatted = timestamp + " " + this._namespace + " deprecated " + msg;
      if (this._traced) {
        for (var i = 0; i < stack2.length; i++) {
          formatted += "\n    at " + callSiteToString(stack2[i]);
        }
        return formatted;
      }
      if (caller) {
        formatted += " at " + formatLocation(caller);
      }
      return formatted;
    }
    function formatColor(msg, caller, stack2) {
      var formatted = "[36;1m" + this._namespace + "[22;39m [33;1mdeprecated[22;39m [0m" + msg + "[39m";
      if (this._traced) {
        for (var i = 0; i < stack2.length; i++) {
          formatted += "\n    [36mat " + callSiteToString(stack2[i]) + "[39m";
        }
        return formatted;
      }
      if (caller) {
        formatted += " [36m" + formatLocation(caller) + "[39m";
      }
      return formatted;
    }
    function formatLocation(callSite) {
      return relative(basePath, callSite[0]) + ":" + callSite[1] + ":" + callSite[2];
    }
    function getStack() {
      var limit = Error.stackTraceLimit;
      var obj = {};
      var prep = Error.prepareStackTrace;
      Error.prepareStackTrace = prepareObjectStackTrace;
      Error.stackTraceLimit = Math.max(10, limit);
      Error.captureStackTrace(obj);
      var stack2 = obj.stack.slice(1);
      Error.prepareStackTrace = prep;
      Error.stackTraceLimit = limit;
      return stack2;
    }
    function prepareObjectStackTrace(obj, stack2) {
      return stack2;
    }
    function wrapfunction(fn, message) {
      if (typeof fn !== "function") {
        throw new TypeError("argument fn must be a function");
      }
      var args = createArgumentsString(fn.length);
      var deprecate = this;
      var stack = getStack();
      var site = callSiteLocation(stack[1]);
      site.name = fn.name;
      var deprecatedfn = eval("(function (" + args + ') {\n"use strict"\nlog.call(deprecate, message, site)\nreturn fn.apply(this, arguments)\n})');
      return deprecatedfn;
    }
    function wrapproperty(obj, prop, message2) {
      if (!obj || typeof obj !== "object" && typeof obj !== "function") {
        throw new TypeError("argument obj must be object");
      }
      var descriptor = Object.getOwnPropertyDescriptor(obj, prop);
      if (!descriptor) {
        throw new TypeError("must call property on owner object");
      }
      if (!descriptor.configurable) {
        throw new TypeError("property must be configurable");
      }
      var deprecate2 = this;
      var stack2 = getStack();
      var site2 = callSiteLocation(stack2[1]);
      site2.name = prop;
      if ("value" in descriptor) {
        descriptor = convertDataDescriptorToAccessor(obj, prop, message2);
      }
      var get = descriptor.get;
      var set = descriptor.set;
      if (typeof get === "function") {
        descriptor.get = function getter() {
          log.call(deprecate2, message2, site2);
          return get.apply(this, arguments);
        };
      }
      if (typeof set === "function") {
        descriptor.set = function setter() {
          log.call(deprecate2, message2, site2);
          return set.apply(this, arguments);
        };
      }
      Object.defineProperty(obj, prop, descriptor);
    }
    function DeprecationError(namespace, message2, stack2) {
      var error = new Error();
      var stackString;
      Object.defineProperty(error, "constructor", {
        value: DeprecationError
      });
      Object.defineProperty(error, "message", {
        configurable: true,
        enumerable: false,
        value: message2,
        writable: true
      });
      Object.defineProperty(error, "name", {
        enumerable: false,
        configurable: true,
        value: "DeprecationError",
        writable: true
      });
      Object.defineProperty(error, "namespace", {
        configurable: true,
        enumerable: false,
        value: namespace,
        writable: true
      });
      Object.defineProperty(error, "stack", {
        configurable: true,
        enumerable: false,
        get: function() {
          if (stackString !== void 0) {
            return stackString;
          }
          return stackString = createStackString.call(this, stack2);
        },
        set: function setter(val) {
          stackString = val;
        }
      });
      return error;
    }
  }
});

// node_modules/setprototypeof/index.js
var require_setprototypeof = __commonJS({
  "node_modules/setprototypeof/index.js"(exports2, module2) {
    "use strict";
    module2.exports = Object.setPrototypeOf || ({ __proto__: [] } instanceof Array ? setProtoOf : mixinProperties);
    function setProtoOf(obj, proto) {
      obj.__proto__ = proto;
      return obj;
    }
    function mixinProperties(obj, proto) {
      for (var prop in proto) {
        if (!Object.prototype.hasOwnProperty.call(obj, prop)) {
          obj[prop] = proto[prop];
        }
      }
      return obj;
    }
  }
});

// node_modules/statuses/codes.json
var require_codes = __commonJS({
  "node_modules/statuses/codes.json"(exports2, module2) {
    module2.exports = {
      "100": "Continue",
      "101": "Switching Protocols",
      "102": "Processing",
      "103": "Early Hints",
      "200": "OK",
      "201": "Created",
      "202": "Accepted",
      "203": "Non-Authoritative Information",
      "204": "No Content",
      "205": "Reset Content",
      "206": "Partial Content",
      "207": "Multi-Status",
      "208": "Already Reported",
      "226": "IM Used",
      "300": "Multiple Choices",
      "301": "Moved Permanently",
      "302": "Found",
      "303": "See Other",
      "304": "Not Modified",
      "305": "Use Proxy",
      "306": "(Unused)",
      "307": "Temporary Redirect",
      "308": "Permanent Redirect",
      "400": "Bad Request",
      "401": "Unauthorized",
      "402": "Payment Required",
      "403": "Forbidden",
      "404": "Not Found",
      "405": "Method Not Allowed",
      "406": "Not Acceptable",
      "407": "Proxy Authentication Required",
      "408": "Request Timeout",
      "409": "Conflict",
      "410": "Gone",
      "411": "Length Required",
      "412": "Precondition Failed",
      "413": "Payload Too Large",
      "414": "URI Too Long",
      "415": "Unsupported Media Type",
      "416": "Range Not Satisfiable",
      "417": "Expectation Failed",
      "418": "I'm a teapot",
      "421": "Misdirected Request",
      "422": "Unprocessable Entity",
      "423": "Locked",
      "424": "Failed Dependency",
      "425": "Unordered Collection",
      "426": "Upgrade Required",
      "428": "Precondition Required",
      "429": "Too Many Requests",
      "431": "Request Header Fields Too Large",
      "451": "Unavailable For Legal Reasons",
      "500": "Internal Server Error",
      "501": "Not Implemented",
      "502": "Bad Gateway",
      "503": "Service Unavailable",
      "504": "Gateway Timeout",
      "505": "HTTP Version Not Supported",
      "506": "Variant Also Negotiates",
      "507": "Insufficient Storage",
      "508": "Loop Detected",
      "509": "Bandwidth Limit Exceeded",
      "510": "Not Extended",
      "511": "Network Authentication Required"
    };
  }
});

// node_modules/statuses/index.js
var require_statuses = __commonJS({
  "node_modules/statuses/index.js"(exports2, module2) {
    "use strict";
    var codes = require_codes();
    module2.exports = status;
    status.STATUS_CODES = codes;
    status.codes = populateStatusesMap(status, codes);
    status.redirect = {
      300: true,
      301: true,
      302: true,
      303: true,
      305: true,
      307: true,
      308: true
    };
    status.empty = {
      204: true,
      205: true,
      304: true
    };
    status.retry = {
      502: true,
      503: true,
      504: true
    };
    function populateStatusesMap(statuses, codes2) {
      var arr = [];
      Object.keys(codes2).forEach(function forEachCode(code) {
        var message2 = codes2[code];
        var status2 = Number(code);
        statuses[status2] = message2;
        statuses[message2] = status2;
        statuses[message2.toLowerCase()] = status2;
        arr.push(status2);
      });
      return arr;
    }
    function status(code) {
      if (typeof code === "number") {
        if (!status[code])
          throw new Error("invalid status code: " + code);
        return code;
      }
      if (typeof code !== "string") {
        throw new TypeError("code must be a number or string");
      }
      var n = parseInt(code, 10);
      if (!isNaN(n)) {
        if (!status[n])
          throw new Error("invalid status code: " + n);
        return n;
      }
      n = status[code.toLowerCase()];
      if (!n)
        throw new Error('invalid status message: "' + code + '"');
      return n;
    }
  }
});

// node_modules/inherits/inherits_browser.js
var require_inherits_browser = __commonJS({
  "node_modules/inherits/inherits_browser.js"(exports2, module2) {
    if (typeof Object.create === "function") {
      module2.exports = function inherits(ctor, superCtor) {
        if (superCtor) {
          ctor.super_ = superCtor;
          ctor.prototype = Object.create(superCtor.prototype, {
            constructor: {
              value: ctor,
              enumerable: false,
              writable: true,
              configurable: true
            }
          });
        }
      };
    } else {
      module2.exports = function inherits(ctor, superCtor) {
        if (superCtor) {
          ctor.super_ = superCtor;
          var TempCtor = function() {
          };
          TempCtor.prototype = superCtor.prototype;
          ctor.prototype = new TempCtor();
          ctor.prototype.constructor = ctor;
        }
      };
    }
  }
});

// node_modules/inherits/inherits.js
var require_inherits = __commonJS({
  "node_modules/inherits/inherits.js"(exports2, module2) {
    try {
      util = require("util");
      if (typeof util.inherits !== "function")
        throw "";
      module2.exports = util.inherits;
    } catch (e) {
      module2.exports = require_inherits_browser();
    }
    var util;
  }
});

// node_modules/toidentifier/index.js
var require_toidentifier = __commonJS({
  "node_modules/toidentifier/index.js"(exports2, module2) {
    "use strict";
    module2.exports = toIdentifier;
    function toIdentifier(str) {
      return str.split(" ").map(function(token) {
        return token.slice(0, 1).toUpperCase() + token.slice(1);
      }).join("").replace(/[^ _0-9a-z]/gi, "");
    }
  }
});

// node_modules/http-errors/index.js
var require_http_errors = __commonJS({
  "node_modules/http-errors/index.js"(exports2, module2) {
    "use strict";
    var deprecate2 = require_depd()("http-errors");
    var setPrototypeOf = require_setprototypeof();
    var statuses = require_statuses();
    var inherits = require_inherits();
    var toIdentifier = require_toidentifier();
    module2.exports = createError;
    module2.exports.HttpError = createHttpErrorConstructor();
    module2.exports.isHttpError = createIsHttpErrorFunction(module2.exports.HttpError);
    populateConstructorExports(module2.exports, statuses.codes, module2.exports.HttpError);
    function codeClass(status) {
      return Number(String(status).charAt(0) + "00");
    }
    function createError() {
      var err;
      var msg;
      var status = 500;
      var props = {};
      for (var i = 0; i < arguments.length; i++) {
        var arg = arguments[i];
        if (arg instanceof Error) {
          err = arg;
          status = err.status || err.statusCode || status;
          continue;
        }
        switch (typeof arg) {
          case "string":
            msg = arg;
            break;
          case "number":
            status = arg;
            if (i !== 0) {
              deprecate2("non-first-argument status code; replace with createError(" + arg + ", ...)");
            }
            break;
          case "object":
            props = arg;
            break;
        }
      }
      if (typeof status === "number" && (status < 400 || status >= 600)) {
        deprecate2("non-error status code; use only 4xx or 5xx status codes");
      }
      if (typeof status !== "number" || !statuses[status] && (status < 400 || status >= 600)) {
        status = 500;
      }
      var HttpError = createError[status] || createError[codeClass(status)];
      if (!err) {
        err = HttpError ? new HttpError(msg) : new Error(msg || statuses[status]);
        Error.captureStackTrace(err, createError);
      }
      if (!HttpError || !(err instanceof HttpError) || err.status !== status) {
        err.expose = status < 500;
        err.status = err.statusCode = status;
      }
      for (var key in props) {
        if (key !== "status" && key !== "statusCode") {
          err[key] = props[key];
        }
      }
      return err;
    }
    function createHttpErrorConstructor() {
      function HttpError() {
        throw new TypeError("cannot construct abstract class");
      }
      inherits(HttpError, Error);
      return HttpError;
    }
    function createClientErrorConstructor(HttpError, name, code) {
      var className = toClassName(name);
      function ClientError(message2) {
        var msg = message2 != null ? message2 : statuses[code];
        var err = new Error(msg);
        Error.captureStackTrace(err, ClientError);
        setPrototypeOf(err, ClientError.prototype);
        Object.defineProperty(err, "message", {
          enumerable: true,
          configurable: true,
          value: msg,
          writable: true
        });
        Object.defineProperty(err, "name", {
          enumerable: false,
          configurable: true,
          value: className,
          writable: true
        });
        return err;
      }
      inherits(ClientError, HttpError);
      nameFunc(ClientError, className);
      ClientError.prototype.status = code;
      ClientError.prototype.statusCode = code;
      ClientError.prototype.expose = true;
      return ClientError;
    }
    function createIsHttpErrorFunction(HttpError) {
      return function isHttpError(val) {
        if (!val || typeof val !== "object") {
          return false;
        }
        if (val instanceof HttpError) {
          return true;
        }
        return val instanceof Error && typeof val.expose === "boolean" && typeof val.statusCode === "number" && val.status === val.statusCode;
      };
    }
    function createServerErrorConstructor(HttpError, name, code) {
      var className = toClassName(name);
      function ServerError(message2) {
        var msg = message2 != null ? message2 : statuses[code];
        var err = new Error(msg);
        Error.captureStackTrace(err, ServerError);
        setPrototypeOf(err, ServerError.prototype);
        Object.defineProperty(err, "message", {
          enumerable: true,
          configurable: true,
          value: msg,
          writable: true
        });
        Object.defineProperty(err, "name", {
          enumerable: false,
          configurable: true,
          value: className,
          writable: true
        });
        return err;
      }
      inherits(ServerError, HttpError);
      nameFunc(ServerError, className);
      ServerError.prototype.status = code;
      ServerError.prototype.statusCode = code;
      ServerError.prototype.expose = false;
      return ServerError;
    }
    function nameFunc(func, name) {
      var desc = Object.getOwnPropertyDescriptor(func, "name");
      if (desc && desc.configurable) {
        desc.value = name;
        Object.defineProperty(func, "name", desc);
      }
    }
    function populateConstructorExports(exports3, codes, HttpError) {
      codes.forEach(function forEachCode(code) {
        var CodeError;
        var name = toIdentifier(statuses[code]);
        switch (codeClass(code)) {
          case 400:
            CodeError = createClientErrorConstructor(HttpError, name, code);
            break;
          case 500:
            CodeError = createServerErrorConstructor(HttpError, name, code);
            break;
        }
        if (CodeError) {
          exports3[code] = CodeError;
          exports3[name] = CodeError;
        }
      });
      exports3["I'mateapot"] = deprecate2.function(exports3.ImATeapot, `"I'mateapot"; use "ImATeapot" instead`);
    }
    function toClassName(name) {
      return name.substr(-5) !== "Error" ? name + "Error" : name;
    }
  }
});

// node_modules/content-type/index.js
var require_content_type = __commonJS({
  "node_modules/content-type/index.js"(exports2) {
    "use strict";
    var PARAM_REGEXP = /; *([!#$%&'*+.^_`|~0-9A-Za-z-]+) *= *("(?:[\u000b\u0020\u0021\u0023-\u005b\u005d-\u007e\u0080-\u00ff]|\\[\u000b\u0020-\u00ff])*"|[!#$%&'*+.^_`|~0-9A-Za-z-]+) */g;
    var TEXT_REGEXP = /^[\u000b\u0020-\u007e\u0080-\u00ff]+$/;
    var TOKEN_REGEXP = /^[!#$%&'*+.^_`|~0-9A-Za-z-]+$/;
    var QESC_REGEXP = /\\([\u000b\u0020-\u00ff])/g;
    var QUOTE_REGEXP = /([\\"])/g;
    var TYPE_REGEXP = /^[!#$%&'*+.^_`|~0-9A-Za-z-]+\/[!#$%&'*+.^_`|~0-9A-Za-z-]+$/;
    exports2.format = format;
    exports2.parse = parse2;
    function format(obj) {
      if (!obj || typeof obj !== "object") {
        throw new TypeError("argument obj is required");
      }
      var parameters = obj.parameters;
      var type = obj.type;
      if (!type || !TYPE_REGEXP.test(type)) {
        throw new TypeError("invalid type");
      }
      var string = type;
      if (parameters && typeof parameters === "object") {
        var param;
        var params = Object.keys(parameters).sort();
        for (var i = 0; i < params.length; i++) {
          param = params[i];
          if (!TOKEN_REGEXP.test(param)) {
            throw new TypeError("invalid parameter name");
          }
          string += "; " + param + "=" + qstring(parameters[param]);
        }
      }
      return string;
    }
    function parse2(string) {
      if (!string) {
        throw new TypeError("argument string is required");
      }
      var header = typeof string === "object" ? getcontenttype(string) : string;
      if (typeof header !== "string") {
        throw new TypeError("argument string is required to be a string");
      }
      var index = header.indexOf(";");
      var type = index !== -1 ? header.substr(0, index).trim() : header.trim();
      if (!TYPE_REGEXP.test(type)) {
        throw new TypeError("invalid media type");
      }
      var obj = new ContentType(type.toLowerCase());
      if (index !== -1) {
        var key;
        var match;
        var value;
        PARAM_REGEXP.lastIndex = index;
        while (match = PARAM_REGEXP.exec(header)) {
          if (match.index !== index) {
            throw new TypeError("invalid parameter format");
          }
          index += match[0].length;
          key = match[1].toLowerCase();
          value = match[2];
          if (value[0] === '"') {
            value = value.substr(1, value.length - 2).replace(QESC_REGEXP, "$1");
          }
          obj.parameters[key] = value;
        }
        if (index !== header.length) {
          throw new TypeError("invalid parameter format");
        }
      }
      return obj;
    }
    function getcontenttype(obj) {
      var header;
      if (typeof obj.getHeader === "function") {
        header = obj.getHeader("content-type");
      } else if (typeof obj.headers === "object") {
        header = obj.headers && obj.headers["content-type"];
      }
      if (typeof header !== "string") {
        throw new TypeError("content-type header is missing from object");
      }
      return header;
    }
    function qstring(val) {
      var str = String(val);
      if (TOKEN_REGEXP.test(str)) {
        return str;
      }
      if (str.length > 0 && !TEXT_REGEXP.test(str)) {
        throw new TypeError("invalid parameter value");
      }
      return '"' + str.replace(QUOTE_REGEXP, "\\$1") + '"';
    }
    function ContentType(type) {
      this.parameters = Object.create(null);
      this.type = type;
    }
  }
});

// node_modules/@middy/http-json-body-parser/index.js
var require_http_json_body_parser = __commonJS({
  "node_modules/@middy/http-json-body-parser/index.js"(exports2, module2) {
    var createError = require_http_errors();
    var contentType = require_content_type();
    module2.exports = (opts) => ({
      before: (handler, next) => {
        opts = opts || {};
        if (handler.event.headers) {
          const contentTypeHeader = handler.event.headers["content-type"] || handler.event.headers["Content-Type"];
          if (contentTypeHeader) {
            const { type } = contentType.parse(contentTypeHeader);
            if (type.match(/^application\/(.*\+)?json$/)) {
              try {
                const data = handler.event.isBase64Encoded ? Buffer.from(handler.event.body, "base64").toString() : handler.event.body;
                handler.event.body = JSON.parse(data, opts.reviver);
              } catch (err) {
                throw new createError.UnprocessableEntity("Content type defined as JSON but an invalid JSON was provided");
              }
            }
          }
        }
        next();
      }
    });
  }
});

// node_modules/uuid/dist/rng.js
var require_rng = __commonJS({
  "node_modules/uuid/dist/rng.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", {
      value: true
    });
    exports2.default = rng;
    var _crypto = _interopRequireDefault(require("crypto"));
    function _interopRequireDefault(obj) {
      return obj && obj.__esModule ? obj : { default: obj };
    }
    var rnds8Pool = new Uint8Array(256);
    var poolPtr = rnds8Pool.length;
    function rng() {
      if (poolPtr > rnds8Pool.length - 16) {
        _crypto.default.randomFillSync(rnds8Pool);
        poolPtr = 0;
      }
      return rnds8Pool.slice(poolPtr, poolPtr += 16);
    }
  }
});

// node_modules/uuid/dist/regex.js
var require_regex = __commonJS({
  "node_modules/uuid/dist/regex.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", {
      value: true
    });
    exports2.default = void 0;
    var _default = /^(?:[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}|00000000-0000-0000-0000-000000000000)$/i;
    exports2.default = _default;
  }
});

// node_modules/uuid/dist/validate.js
var require_validate = __commonJS({
  "node_modules/uuid/dist/validate.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", {
      value: true
    });
    exports2.default = void 0;
    var _regex = _interopRequireDefault(require_regex());
    function _interopRequireDefault(obj) {
      return obj && obj.__esModule ? obj : { default: obj };
    }
    function validate2(uuid2) {
      return typeof uuid2 === "string" && _regex.default.test(uuid2);
    }
    var _default = validate2;
    exports2.default = _default;
  }
});

// node_modules/uuid/dist/stringify.js
var require_stringify = __commonJS({
  "node_modules/uuid/dist/stringify.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", {
      value: true
    });
    exports2.default = void 0;
    var _validate = _interopRequireDefault(require_validate());
    function _interopRequireDefault(obj) {
      return obj && obj.__esModule ? obj : { default: obj };
    }
    var byteToHex = [];
    for (let i = 0; i < 256; ++i) {
      byteToHex.push((i + 256).toString(16).substr(1));
    }
    function stringify2(arr, offset = 0) {
      const uuid2 = (byteToHex[arr[offset + 0]] + byteToHex[arr[offset + 1]] + byteToHex[arr[offset + 2]] + byteToHex[arr[offset + 3]] + "-" + byteToHex[arr[offset + 4]] + byteToHex[arr[offset + 5]] + "-" + byteToHex[arr[offset + 6]] + byteToHex[arr[offset + 7]] + "-" + byteToHex[arr[offset + 8]] + byteToHex[arr[offset + 9]] + "-" + byteToHex[arr[offset + 10]] + byteToHex[arr[offset + 11]] + byteToHex[arr[offset + 12]] + byteToHex[arr[offset + 13]] + byteToHex[arr[offset + 14]] + byteToHex[arr[offset + 15]]).toLowerCase();
      if (!(0, _validate.default)(uuid2)) {
        throw TypeError("Stringified UUID is invalid");
      }
      return uuid2;
    }
    var _default = stringify2;
    exports2.default = _default;
  }
});

// node_modules/uuid/dist/v1.js
var require_v1 = __commonJS({
  "node_modules/uuid/dist/v1.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", {
      value: true
    });
    exports2.default = void 0;
    var _rng = _interopRequireDefault(require_rng());
    var _stringify = _interopRequireDefault(require_stringify());
    function _interopRequireDefault(obj) {
      return obj && obj.__esModule ? obj : { default: obj };
    }
    var _nodeId;
    var _clockseq;
    var _lastMSecs = 0;
    var _lastNSecs = 0;
    function v12(options, buf, offset) {
      let i = buf && offset || 0;
      const b = buf || new Array(16);
      options = options || {};
      let node = options.node || _nodeId;
      let clockseq = options.clockseq !== void 0 ? options.clockseq : _clockseq;
      if (node == null || clockseq == null) {
        const seedBytes = options.random || (options.rng || _rng.default)();
        if (node == null) {
          node = _nodeId = [seedBytes[0] | 1, seedBytes[1], seedBytes[2], seedBytes[3], seedBytes[4], seedBytes[5]];
        }
        if (clockseq == null) {
          clockseq = _clockseq = (seedBytes[6] << 8 | seedBytes[7]) & 16383;
        }
      }
      let msecs = options.msecs !== void 0 ? options.msecs : Date.now();
      let nsecs = options.nsecs !== void 0 ? options.nsecs : _lastNSecs + 1;
      const dt = msecs - _lastMSecs + (nsecs - _lastNSecs) / 1e4;
      if (dt < 0 && options.clockseq === void 0) {
        clockseq = clockseq + 1 & 16383;
      }
      if ((dt < 0 || msecs > _lastMSecs) && options.nsecs === void 0) {
        nsecs = 0;
      }
      if (nsecs >= 1e4) {
        throw new Error("uuid.v1(): Can't create more than 10M uuids/sec");
      }
      _lastMSecs = msecs;
      _lastNSecs = nsecs;
      _clockseq = clockseq;
      msecs += 122192928e5;
      const tl = ((msecs & 268435455) * 1e4 + nsecs) % 4294967296;
      b[i++] = tl >>> 24 & 255;
      b[i++] = tl >>> 16 & 255;
      b[i++] = tl >>> 8 & 255;
      b[i++] = tl & 255;
      const tmh = msecs / 4294967296 * 1e4 & 268435455;
      b[i++] = tmh >>> 8 & 255;
      b[i++] = tmh & 255;
      b[i++] = tmh >>> 24 & 15 | 16;
      b[i++] = tmh >>> 16 & 255;
      b[i++] = clockseq >>> 8 | 128;
      b[i++] = clockseq & 255;
      for (let n = 0; n < 6; ++n) {
        b[i + n] = node[n];
      }
      return buf || (0, _stringify.default)(b);
    }
    var _default = v12;
    exports2.default = _default;
  }
});

// node_modules/uuid/dist/parse.js
var require_parse = __commonJS({
  "node_modules/uuid/dist/parse.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", {
      value: true
    });
    exports2.default = void 0;
    var _validate = _interopRequireDefault(require_validate());
    function _interopRequireDefault(obj) {
      return obj && obj.__esModule ? obj : { default: obj };
    }
    function parse2(uuid2) {
      if (!(0, _validate.default)(uuid2)) {
        throw TypeError("Invalid UUID");
      }
      let v;
      const arr = new Uint8Array(16);
      arr[0] = (v = parseInt(uuid2.slice(0, 8), 16)) >>> 24;
      arr[1] = v >>> 16 & 255;
      arr[2] = v >>> 8 & 255;
      arr[3] = v & 255;
      arr[4] = (v = parseInt(uuid2.slice(9, 13), 16)) >>> 8;
      arr[5] = v & 255;
      arr[6] = (v = parseInt(uuid2.slice(14, 18), 16)) >>> 8;
      arr[7] = v & 255;
      arr[8] = (v = parseInt(uuid2.slice(19, 23), 16)) >>> 8;
      arr[9] = v & 255;
      arr[10] = (v = parseInt(uuid2.slice(24, 36), 16)) / 1099511627776 & 255;
      arr[11] = v / 4294967296 & 255;
      arr[12] = v >>> 24 & 255;
      arr[13] = v >>> 16 & 255;
      arr[14] = v >>> 8 & 255;
      arr[15] = v & 255;
      return arr;
    }
    var _default = parse2;
    exports2.default = _default;
  }
});

// node_modules/uuid/dist/v35.js
var require_v35 = __commonJS({
  "node_modules/uuid/dist/v35.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", {
      value: true
    });
    exports2.default = _default;
    exports2.URL = exports2.DNS = void 0;
    var _stringify = _interopRequireDefault(require_stringify());
    var _parse = _interopRequireDefault(require_parse());
    function _interopRequireDefault(obj) {
      return obj && obj.__esModule ? obj : { default: obj };
    }
    function stringToBytes(str) {
      str = unescape(encodeURIComponent(str));
      const bytes = [];
      for (let i = 0; i < str.length; ++i) {
        bytes.push(str.charCodeAt(i));
      }
      return bytes;
    }
    var DNS = "6ba7b810-9dad-11d1-80b4-00c04fd430c8";
    exports2.DNS = DNS;
    var URL = "6ba7b811-9dad-11d1-80b4-00c04fd430c8";
    exports2.URL = URL;
    function _default(name, version2, hashfunc) {
      function generateUUID(value, namespace, buf, offset) {
        if (typeof value === "string") {
          value = stringToBytes(value);
        }
        if (typeof namespace === "string") {
          namespace = (0, _parse.default)(namespace);
        }
        if (namespace.length !== 16) {
          throw TypeError("Namespace must be array-like (16 iterable integer values, 0-255)");
        }
        let bytes = new Uint8Array(16 + value.length);
        bytes.set(namespace);
        bytes.set(value, namespace.length);
        bytes = hashfunc(bytes);
        bytes[6] = bytes[6] & 15 | version2;
        bytes[8] = bytes[8] & 63 | 128;
        if (buf) {
          offset = offset || 0;
          for (let i = 0; i < 16; ++i) {
            buf[offset + i] = bytes[i];
          }
          return buf;
        }
        return (0, _stringify.default)(bytes);
      }
      try {
        generateUUID.name = name;
      } catch (err) {
      }
      generateUUID.DNS = DNS;
      generateUUID.URL = URL;
      return generateUUID;
    }
  }
});

// node_modules/uuid/dist/md5.js
var require_md5 = __commonJS({
  "node_modules/uuid/dist/md5.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", {
      value: true
    });
    exports2.default = void 0;
    var _crypto = _interopRequireDefault(require("crypto"));
    function _interopRequireDefault(obj) {
      return obj && obj.__esModule ? obj : { default: obj };
    }
    function md5(bytes) {
      if (Array.isArray(bytes)) {
        bytes = Buffer.from(bytes);
      } else if (typeof bytes === "string") {
        bytes = Buffer.from(bytes, "utf8");
      }
      return _crypto.default.createHash("md5").update(bytes).digest();
    }
    var _default = md5;
    exports2.default = _default;
  }
});

// node_modules/uuid/dist/v3.js
var require_v3 = __commonJS({
  "node_modules/uuid/dist/v3.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", {
      value: true
    });
    exports2.default = void 0;
    var _v = _interopRequireDefault(require_v35());
    var _md = _interopRequireDefault(require_md5());
    function _interopRequireDefault(obj) {
      return obj && obj.__esModule ? obj : { default: obj };
    }
    var v32 = (0, _v.default)("v3", 48, _md.default);
    var _default = v32;
    exports2.default = _default;
  }
});

// node_modules/uuid/dist/v4.js
var require_v4 = __commonJS({
  "node_modules/uuid/dist/v4.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", {
      value: true
    });
    exports2.default = void 0;
    var _rng = _interopRequireDefault(require_rng());
    var _stringify = _interopRequireDefault(require_stringify());
    function _interopRequireDefault(obj) {
      return obj && obj.__esModule ? obj : { default: obj };
    }
    function v42(options, buf, offset) {
      options = options || {};
      const rnds = options.random || (options.rng || _rng.default)();
      rnds[6] = rnds[6] & 15 | 64;
      rnds[8] = rnds[8] & 63 | 128;
      if (buf) {
        offset = offset || 0;
        for (let i = 0; i < 16; ++i) {
          buf[offset + i] = rnds[i];
        }
        return buf;
      }
      return (0, _stringify.default)(rnds);
    }
    var _default = v42;
    exports2.default = _default;
  }
});

// node_modules/uuid/dist/sha1.js
var require_sha1 = __commonJS({
  "node_modules/uuid/dist/sha1.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", {
      value: true
    });
    exports2.default = void 0;
    var _crypto = _interopRequireDefault(require("crypto"));
    function _interopRequireDefault(obj) {
      return obj && obj.__esModule ? obj : { default: obj };
    }
    function sha1(bytes) {
      if (Array.isArray(bytes)) {
        bytes = Buffer.from(bytes);
      } else if (typeof bytes === "string") {
        bytes = Buffer.from(bytes, "utf8");
      }
      return _crypto.default.createHash("sha1").update(bytes).digest();
    }
    var _default = sha1;
    exports2.default = _default;
  }
});

// node_modules/uuid/dist/v5.js
var require_v5 = __commonJS({
  "node_modules/uuid/dist/v5.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", {
      value: true
    });
    exports2.default = void 0;
    var _v = _interopRequireDefault(require_v35());
    var _sha = _interopRequireDefault(require_sha1());
    function _interopRequireDefault(obj) {
      return obj && obj.__esModule ? obj : { default: obj };
    }
    var v52 = (0, _v.default)("v5", 80, _sha.default);
    var _default = v52;
    exports2.default = _default;
  }
});

// node_modules/uuid/dist/nil.js
var require_nil = __commonJS({
  "node_modules/uuid/dist/nil.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", {
      value: true
    });
    exports2.default = void 0;
    var _default = "00000000-0000-0000-0000-000000000000";
    exports2.default = _default;
  }
});

// node_modules/uuid/dist/version.js
var require_version = __commonJS({
  "node_modules/uuid/dist/version.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", {
      value: true
    });
    exports2.default = void 0;
    var _validate = _interopRequireDefault(require_validate());
    function _interopRequireDefault(obj) {
      return obj && obj.__esModule ? obj : { default: obj };
    }
    function version2(uuid2) {
      if (!(0, _validate.default)(uuid2)) {
        throw TypeError("Invalid UUID");
      }
      return parseInt(uuid2.substr(14, 1), 16);
    }
    var _default = version2;
    exports2.default = _default;
  }
});

// node_modules/uuid/dist/index.js
var require_dist = __commonJS({
  "node_modules/uuid/dist/index.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", {
      value: true
    });
    Object.defineProperty(exports2, "v1", {
      enumerable: true,
      get: function() {
        return _v.default;
      }
    });
    Object.defineProperty(exports2, "v3", {
      enumerable: true,
      get: function() {
        return _v2.default;
      }
    });
    Object.defineProperty(exports2, "v4", {
      enumerable: true,
      get: function() {
        return _v3.default;
      }
    });
    Object.defineProperty(exports2, "v5", {
      enumerable: true,
      get: function() {
        return _v4.default;
      }
    });
    Object.defineProperty(exports2, "NIL", {
      enumerable: true,
      get: function() {
        return _nil.default;
      }
    });
    Object.defineProperty(exports2, "version", {
      enumerable: true,
      get: function() {
        return _version.default;
      }
    });
    Object.defineProperty(exports2, "validate", {
      enumerable: true,
      get: function() {
        return _validate.default;
      }
    });
    Object.defineProperty(exports2, "stringify", {
      enumerable: true,
      get: function() {
        return _stringify.default;
      }
    });
    Object.defineProperty(exports2, "parse", {
      enumerable: true,
      get: function() {
        return _parse.default;
      }
    });
    var _v = _interopRequireDefault(require_v1());
    var _v2 = _interopRequireDefault(require_v3());
    var _v3 = _interopRequireDefault(require_v4());
    var _v4 = _interopRequireDefault(require_v5());
    var _nil = _interopRequireDefault(require_nil());
    var _version = _interopRequireDefault(require_version());
    var _validate = _interopRequireDefault(require_validate());
    var _stringify = _interopRequireDefault(require_stringify());
    var _parse = _interopRequireDefault(require_parse());
    function _interopRequireDefault(obj) {
      return obj && obj.__esModule ? obj : { default: obj };
    }
  }
});

// src/functions/CreateGroup/handler.ts
var handler_exports = {};
__export(handler_exports, {
  main: () => main
});

// src/libs/apiGateway.ts
var formatJSONResponse = (response, status) => {
  return {
    statusCode: status,
    body: JSON.stringify(response)
  };
};

// src/libs/lambda.ts
var import_core = __toESM(require_core());
var import_http_json_body_parser = __toESM(require_http_json_body_parser());
var middyfy = (handler) => {
  return (0, import_core.default)(handler).use((0, import_http_json_body_parser.default)());
};

// node_modules/uuid/wrapper.mjs
var import_dist = __toESM(require_dist(), 1);
var v1 = import_dist.default.v1;
var v3 = import_dist.default.v3;
var v4 = import_dist.default.v4;
var v5 = import_dist.default.v5;
var NIL = import_dist.default.NIL;
var version = import_dist.default.version;
var validate = import_dist.default.validate;
var stringify = import_dist.default.stringify;
var parse = import_dist.default.parse;

// src/libs/dynamodb.ts
var AWS = __toESM(require("aws-sdk"));
var DynamoDB2 = process.env.IS_OFFLINE ? new AWS.DynamoDB.DocumentClient({
  region: "localhost",
  endpoint: "http://localhost:8000"
}) : new AWS.DynamoDB.DocumentClient({});
var savetodb = async (body) => {
  const db_response = await DynamoDB2.put(body).promise();
  return db_response;
};

// src/functions/CreateGroup/handler.ts
var CreateGroup = async (event) => {
  try {
    if (!event.body) {
      return formatJSONResponse({
        error: "Forbidden"
      }, 403);
    }
    if (event.body.systemID == "") {
      return formatJSONResponse({
        error: "unauthorized"
      }, 401);
    }
    if (!event.body.name || !event.body.systemID || !event.body.userNames || !event.body.policyNames) {
      return formatJSONResponse({
        error: "Bad request"
      }, 400);
    }
    const { name, systemID, userNames, policyNames } = event.body;
    const id = "group" + v4();
    const body = {
      TableName: "DynamoTable",
      Item: {
        name,
        systemID,
        userNames,
        policyNames,
        id
      }
    };
    if (name == "" && systemID == "" && userNames == "" && policyNames == "") {
      return formatJSONResponse({
        error: "Bad Request"
      }, 400);
    } else {
      const response = await savetodb(body);
      if (response) {
        return formatJSONResponse({
          taskUri: "group created"
        }, 202);
      }
    }
  } catch (error) {
    if (error.response.status === 503) {
      return formatJSONResponse({
        message: "service unavailable"
      }, 503);
    } else {
      return formatJSONResponse({
        error: "internal server error / unexpected error"
      }, 500);
    }
  }
};
var main = middyfy(CreateGroup);
module.exports = __toCommonJS(handler_exports);
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  main
});
/*!
 * content-type
 * Copyright(c) 2015 Douglas Christopher Wilson
 * MIT Licensed
 */
/*!
 * depd
 * Copyright(c) 2014 Douglas Christopher Wilson
 * MIT Licensed
 */
/*!
 * depd
 * Copyright(c) 2014-2015 Douglas Christopher Wilson
 * MIT Licensed
 */
/*!
 * depd
 * Copyright(c) 2014-2017 Douglas Christopher Wilson
 * MIT Licensed
 */
/*!
 * depd
 * Copyright(c) 2015 Douglas Christopher Wilson
 * MIT Licensed
 */
/*!
 * http-errors
 * Copyright(c) 2014 Jonathan Ong
 * Copyright(c) 2016 Douglas Christopher Wilson
 * MIT Licensed
 */
/*!
 * statuses
 * Copyright(c) 2014 Jonathan Ong
 * Copyright(c) 2016 Douglas Christopher Wilson
 * MIT Licensed
 */
/*!
 * toidentifier
 * Copyright(c) 2016 Douglas Christopher Wilson
 * MIT Licensed
 */
//# sourceMappingURL=handler.js.map
