"use strict";

function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.updateProduct = exports.getProducts = exports.getProductById = exports.deleteProduct = exports.createProduct = void 0;
var _connection = require("../database/connection.js");
var _uploadImage = require("../helpers/uploadImage.js");
var _queriesInterface = require("../database/queries.interface.js");
function _createForOfIteratorHelper(r, e) { var t = "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (!t) { if (Array.isArray(r) || (t = _unsupportedIterableToArray(r)) || e && r && "number" == typeof r.length) { t && (r = t); var _n = 0, F = function F() {}; return { s: F, n: function n() { return _n >= r.length ? { done: !0 } : { done: !1, value: r[_n++] }; }, e: function e(r) { throw r; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var o, a = !0, u = !1; return { s: function s() { t = t.call(r); }, n: function n() { var r = t.next(); return a = r.done, r; }, e: function e(r) { u = !0, o = r; }, f: function f() { try { a || null == t["return"] || t["return"](); } finally { if (u) throw o; } } }; }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
function _regeneratorRuntime() { "use strict"; /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/facebook/regenerator/blob/main/LICENSE */ _regeneratorRuntime = function _regeneratorRuntime() { return e; }; var t, e = {}, r = Object.prototype, n = r.hasOwnProperty, o = Object.defineProperty || function (t, e, r) { t[e] = r.value; }, i = "function" == typeof Symbol ? Symbol : {}, a = i.iterator || "@@iterator", c = i.asyncIterator || "@@asyncIterator", u = i.toStringTag || "@@toStringTag"; function define(t, e, r) { return Object.defineProperty(t, e, { value: r, enumerable: !0, configurable: !0, writable: !0 }), t[e]; } try { define({}, ""); } catch (t) { define = function define(t, e, r) { return t[e] = r; }; } function wrap(t, e, r, n) { var i = e && e.prototype instanceof Generator ? e : Generator, a = Object.create(i.prototype), c = new Context(n || []); return o(a, "_invoke", { value: makeInvokeMethod(t, r, c) }), a; } function tryCatch(t, e, r) { try { return { type: "normal", arg: t.call(e, r) }; } catch (t) { return { type: "throw", arg: t }; } } e.wrap = wrap; var h = "suspendedStart", l = "suspendedYield", f = "executing", s = "completed", y = {}; function Generator() {} function GeneratorFunction() {} function GeneratorFunctionPrototype() {} var p = {}; define(p, a, function () { return this; }); var d = Object.getPrototypeOf, v = d && d(d(values([]))); v && v !== r && n.call(v, a) && (p = v); var g = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(p); function defineIteratorMethods(t) { ["next", "throw", "return"].forEach(function (e) { define(t, e, function (t) { return this._invoke(e, t); }); }); } function AsyncIterator(t, e) { function invoke(r, o, i, a) { var c = tryCatch(t[r], t, o); if ("throw" !== c.type) { var u = c.arg, h = u.value; return h && "object" == _typeof(h) && n.call(h, "__await") ? e.resolve(h.__await).then(function (t) { invoke("next", t, i, a); }, function (t) { invoke("throw", t, i, a); }) : e.resolve(h).then(function (t) { u.value = t, i(u); }, function (t) { return invoke("throw", t, i, a); }); } a(c.arg); } var r; o(this, "_invoke", { value: function value(t, n) { function callInvokeWithMethodAndArg() { return new e(function (e, r) { invoke(t, n, e, r); }); } return r = r ? r.then(callInvokeWithMethodAndArg, callInvokeWithMethodAndArg) : callInvokeWithMethodAndArg(); } }); } function makeInvokeMethod(e, r, n) { var o = h; return function (i, a) { if (o === f) throw Error("Generator is already running"); if (o === s) { if ("throw" === i) throw a; return { value: t, done: !0 }; } for (n.method = i, n.arg = a;;) { var c = n.delegate; if (c) { var u = maybeInvokeDelegate(c, n); if (u) { if (u === y) continue; return u; } } if ("next" === n.method) n.sent = n._sent = n.arg;else if ("throw" === n.method) { if (o === h) throw o = s, n.arg; n.dispatchException(n.arg); } else "return" === n.method && n.abrupt("return", n.arg); o = f; var p = tryCatch(e, r, n); if ("normal" === p.type) { if (o = n.done ? s : l, p.arg === y) continue; return { value: p.arg, done: n.done }; } "throw" === p.type && (o = s, n.method = "throw", n.arg = p.arg); } }; } function maybeInvokeDelegate(e, r) { var n = r.method, o = e.iterator[n]; if (o === t) return r.delegate = null, "throw" === n && e.iterator["return"] && (r.method = "return", r.arg = t, maybeInvokeDelegate(e, r), "throw" === r.method) || "return" !== n && (r.method = "throw", r.arg = new TypeError("The iterator does not provide a '" + n + "' method")), y; var i = tryCatch(o, e.iterator, r.arg); if ("throw" === i.type) return r.method = "throw", r.arg = i.arg, r.delegate = null, y; var a = i.arg; return a ? a.done ? (r[e.resultName] = a.value, r.next = e.nextLoc, "return" !== r.method && (r.method = "next", r.arg = t), r.delegate = null, y) : a : (r.method = "throw", r.arg = new TypeError("iterator result is not an object"), r.delegate = null, y); } function pushTryEntry(t) { var e = { tryLoc: t[0] }; 1 in t && (e.catchLoc = t[1]), 2 in t && (e.finallyLoc = t[2], e.afterLoc = t[3]), this.tryEntries.push(e); } function resetTryEntry(t) { var e = t.completion || {}; e.type = "normal", delete e.arg, t.completion = e; } function Context(t) { this.tryEntries = [{ tryLoc: "root" }], t.forEach(pushTryEntry, this), this.reset(!0); } function values(e) { if (e || "" === e) { var r = e[a]; if (r) return r.call(e); if ("function" == typeof e.next) return e; if (!isNaN(e.length)) { var o = -1, i = function next() { for (; ++o < e.length;) if (n.call(e, o)) return next.value = e[o], next.done = !1, next; return next.value = t, next.done = !0, next; }; return i.next = i; } } throw new TypeError(_typeof(e) + " is not iterable"); } return GeneratorFunction.prototype = GeneratorFunctionPrototype, o(g, "constructor", { value: GeneratorFunctionPrototype, configurable: !0 }), o(GeneratorFunctionPrototype, "constructor", { value: GeneratorFunction, configurable: !0 }), GeneratorFunction.displayName = define(GeneratorFunctionPrototype, u, "GeneratorFunction"), e.isGeneratorFunction = function (t) { var e = "function" == typeof t && t.constructor; return !!e && (e === GeneratorFunction || "GeneratorFunction" === (e.displayName || e.name)); }, e.mark = function (t) { return Object.setPrototypeOf ? Object.setPrototypeOf(t, GeneratorFunctionPrototype) : (t.__proto__ = GeneratorFunctionPrototype, define(t, u, "GeneratorFunction")), t.prototype = Object.create(g), t; }, e.awrap = function (t) { return { __await: t }; }, defineIteratorMethods(AsyncIterator.prototype), define(AsyncIterator.prototype, c, function () { return this; }), e.AsyncIterator = AsyncIterator, e.async = function (t, r, n, o, i) { void 0 === i && (i = Promise); var a = new AsyncIterator(wrap(t, r, n, o), i); return e.isGeneratorFunction(r) ? a : a.next().then(function (t) { return t.done ? t.value : a.next(); }); }, defineIteratorMethods(g), define(g, u, "Generator"), define(g, a, function () { return this; }), define(g, "toString", function () { return "[object Generator]"; }), e.keys = function (t) { var e = Object(t), r = []; for (var n in e) r.push(n); return r.reverse(), function next() { for (; r.length;) { var t = r.pop(); if (t in e) return next.value = t, next.done = !1, next; } return next.done = !0, next; }; }, e.values = values, Context.prototype = { constructor: Context, reset: function reset(e) { if (this.prev = 0, this.next = 0, this.sent = this._sent = t, this.done = !1, this.delegate = null, this.method = "next", this.arg = t, this.tryEntries.forEach(resetTryEntry), !e) for (var r in this) "t" === r.charAt(0) && n.call(this, r) && !isNaN(+r.slice(1)) && (this[r] = t); }, stop: function stop() { this.done = !0; var t = this.tryEntries[0].completion; if ("throw" === t.type) throw t.arg; return this.rval; }, dispatchException: function dispatchException(e) { if (this.done) throw e; var r = this; function handle(n, o) { return a.type = "throw", a.arg = e, r.next = n, o && (r.method = "next", r.arg = t), !!o; } for (var o = this.tryEntries.length - 1; o >= 0; --o) { var i = this.tryEntries[o], a = i.completion; if ("root" === i.tryLoc) return handle("end"); if (i.tryLoc <= this.prev) { var c = n.call(i, "catchLoc"), u = n.call(i, "finallyLoc"); if (c && u) { if (this.prev < i.catchLoc) return handle(i.catchLoc, !0); if (this.prev < i.finallyLoc) return handle(i.finallyLoc); } else if (c) { if (this.prev < i.catchLoc) return handle(i.catchLoc, !0); } else { if (!u) throw Error("try statement without catch or finally"); if (this.prev < i.finallyLoc) return handle(i.finallyLoc); } } } }, abrupt: function abrupt(t, e) { for (var r = this.tryEntries.length - 1; r >= 0; --r) { var o = this.tryEntries[r]; if (o.tryLoc <= this.prev && n.call(o, "finallyLoc") && this.prev < o.finallyLoc) { var i = o; break; } } i && ("break" === t || "continue" === t) && i.tryLoc <= e && e <= i.finallyLoc && (i = null); var a = i ? i.completion : {}; return a.type = t, a.arg = e, i ? (this.method = "next", this.next = i.finallyLoc, y) : this.complete(a); }, complete: function complete(t, e) { if ("throw" === t.type) throw t.arg; return "break" === t.type || "continue" === t.type ? this.next = t.arg : "return" === t.type ? (this.rval = this.arg = t.arg, this.method = "return", this.next = "end") : "normal" === t.type && e && (this.next = e), y; }, finish: function finish(t) { for (var e = this.tryEntries.length - 1; e >= 0; --e) { var r = this.tryEntries[e]; if (r.finallyLoc === t) return this.complete(r.completion, r.afterLoc), resetTryEntry(r), y; } }, "catch": function _catch(t) { for (var e = this.tryEntries.length - 1; e >= 0; --e) { var r = this.tryEntries[e]; if (r.tryLoc === t) { var n = r.completion; if ("throw" === n.type) { var o = n.arg; resetTryEntry(r); } return o; } } throw Error("illegal catch attempt"); }, delegateYield: function delegateYield(e, r, n) { return this.delegate = { iterator: values(e), resultName: r, nextLoc: n }, "next" === this.method && (this.arg = t), y; } }, e; }
function asyncGeneratorStep(n, t, e, r, o, a, c) { try { var i = n[a](c), u = i.value; } catch (n) { return void e(n); } i.done ? t(u) : Promise.resolve(u).then(r, o); }
function _asyncToGenerator(n) { return function () { var t = this, e = arguments; return new Promise(function (r, o) { var a = n.apply(t, e); function _next(n) { asyncGeneratorStep(a, r, o, _next, _throw, "next", n); } function _throw(n) { asyncGeneratorStep(a, r, o, _next, _throw, "throw", n); } _next(void 0); }); }; }
var getProducts = exports.getProducts = /*#__PURE__*/function () {
  var _ref = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee(req, res) {
    var _req$query, _req$query$page, page, _req$query$limit, limit, offset, client, productsResult, productsWithVariations;
    return _regeneratorRuntime().wrap(function _callee$(_context) {
      while (1) switch (_context.prev = _context.next) {
        case 0:
          _req$query = req.query, _req$query$page = _req$query.page, page = _req$query$page === void 0 ? 1 : _req$query$page, _req$query$limit = _req$query.limit, limit = _req$query$limit === void 0 ? 10 : _req$query$limit;
          offset = (page - 1) * limit;
          _context.prev = 2;
          _context.next = 5;
          return (0, _connection.getConnection)();
        case 5:
          client = _context.sent;
          _context.next = 8;
          return client.query(_queriesInterface.queries.products.getProducts, [offset, limit]);
        case 8:
          productsResult = _context.sent;
          if (!(productsResult.rows.length === 0)) {
            _context.next = 11;
            break;
          }
          return _context.abrupt("return", res.status(404).json({
            message: 'No hay productos disponibles'
          }));
        case 11:
          productsWithVariations = [];
          productsResult.rows.forEach(function (row) {
            var existingProduct = productsWithVariations.find(function (product) {
              return product.product_id === row.product_id;
            });
            if (existingProduct) {
              existingProduct.variations.push({
                variation_id: row.variation_id,
                quality: row.quality,
                quantity: row.quantity,
                price_home: row.price_home,
                price_supermarket: row.price_supermarket,
                price_restaurant: row.price_restaurant,
                price_fruver: row.price_fruver
              });
            } else {
              productsWithVariations.push({
                product_id: row.product_id,
                name: row.name,
                description: row.description,
                category: row.category,
                stock: row.stock,
                photo_url: row.photo_url,
                variations: row.variation_id ? [{
                  variation_id: row.variation_id,
                  quality: row.quality,
                  quantity: row.quantity,
                  price_home: row.price_home,
                  price_supermarket: row.price_supermarket,
                  price_restaurant: row.price_restaurant,
                  price_fruver: row.price_fruver
                }] : []
              });
            }
          });
          res.status(200).json(productsWithVariations);
          _context.next = 20;
          break;
        case 16:
          _context.prev = 16;
          _context.t0 = _context["catch"](2);
          console.error('Error al obtener los productos:', _context.t0);
          res.status(500).json({
            message: 'Error al obtener los productos'
          });
        case 20:
          _context.prev = 20;
          if (client) client.release();
          return _context.finish(20);
        case 23:
        case "end":
          return _context.stop();
      }
    }, _callee, null, [[2, 16, 20, 23]]);
  }));
  return function getProducts(_x, _x2) {
    return _ref.apply(this, arguments);
  };
}();
var getProductById = exports.getProductById = /*#__PURE__*/function () {
  var _ref2 = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee2(req, res) {
    var id, client, productResult, variationsResult, productWithVariations;
    return _regeneratorRuntime().wrap(function _callee2$(_context2) {
      while (1) switch (_context2.prev = _context2.next) {
        case 0:
          id = req.params.id;
          _context2.prev = 1;
          _context2.next = 4;
          return (0, _connection.getConnection)();
        case 4:
          client = _context2.sent;
          _context2.next = 7;
          return client.query(_queriesInterface.queries.products.getProductById, [id]);
        case 7:
          productResult = _context2.sent;
          if (!(productResult.rows.length === 0)) {
            _context2.next = 10;
            break;
          }
          return _context2.abrupt("return", res.status(404).json({
            message: 'Producto no encontrado'
          }));
        case 10:
          _context2.next = 12;
          return client.query(_queriesInterface.queries.products.getProductVariations, [id]);
        case 12:
          variationsResult = _context2.sent;
          productWithVariations = _objectSpread(_objectSpread({}, productResult.rows[0]), {}, {
            variations: variationsResult.rows
          });
          res.status(200).json(productWithVariations);
          _context2.next = 21;
          break;
        case 17:
          _context2.prev = 17;
          _context2.t0 = _context2["catch"](1);
          console.error('Error al obtener el producto por ID:', _context2.t0);
          res.status(500).json({
            message: 'Error al obtener el producto'
          });
        case 21:
          _context2.prev = 21;
          if (client) client.release();
          return _context2.finish(21);
        case 24:
        case "end":
          return _context2.stop();
      }
    }, _callee2, null, [[1, 17, 21, 24]]);
  }));
  return function getProductById(_x3, _x4) {
    return _ref2.apply(this, arguments);
  };
}();
var createProduct = exports.createProduct = /*#__PURE__*/function () {
  var _ref3 = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee3(req, res) {
    var _req$file;
    var client, _req$body, name, description, category, stock, variations, photoBuffer, defaultPhotoUrl, photoUrl, validatedStock, result, productId, _iterator, _step, variation, quality, quantity, price_home, price_supermarket, price_restaurant, price_fruver;
    return _regeneratorRuntime().wrap(function _callee3$(_context3) {
      while (1) switch (_context3.prev = _context3.next) {
        case 0:
          _req$body = req.body, name = _req$body.name, description = _req$body.description, category = _req$body.category, stock = _req$body.stock, variations = _req$body.variations;
          photoBuffer = ((_req$file = req.file) === null || _req$file === void 0 ? void 0 : _req$file.buffer) || null;
          defaultPhotoUrl = 'https://example.com/default-image.jpg';
          photoUrl = null;
          if (!photoBuffer) {
            _context3.next = 16;
            break;
          }
          _context3.prev = 5;
          _context3.next = 8;
          return (0, _uploadImage.uploadImage)(photoBuffer, req.file.originalname);
        case 8:
          photoUrl = _context3.sent;
          _context3.next = 14;
          break;
        case 11:
          _context3.prev = 11;
          _context3.t0 = _context3["catch"](5);
          return _context3.abrupt("return", res.status(500).json({
            message: 'Error al subir la imagen a S3'
          }));
        case 14:
          _context3.next = 17;
          break;
        case 16:
          photoUrl = defaultPhotoUrl;
        case 17:
          validatedStock = stock ? parseInt(stock, 10) : 0;
          _context3.prev = 18;
          _context3.next = 21;
          return (0, _connection.getConnection)();
        case 21:
          client = _context3.sent;
          _context3.next = 24;
          return client.query(_queriesInterface.queries.products.createProduct, [name, description, category, validatedStock, photoUrl]);
        case 24:
          result = _context3.sent;
          productId = result.rows[0].product_id;
          if (!(Array.isArray(variations) && variations.length > 0)) {
            _context3.next = 47;
            break;
          }
          _iterator = _createForOfIteratorHelper(variations);
          _context3.prev = 28;
          _iterator.s();
        case 30:
          if ((_step = _iterator.n()).done) {
            _context3.next = 39;
            break;
          }
          variation = _step.value;
          quality = variation.quality, quantity = variation.quantity, price_home = variation.price_home, price_supermarket = variation.price_supermarket, price_restaurant = variation.price_restaurant, price_fruver = variation.price_fruver;
          if (!(!quality || !quantity)) {
            _context3.next = 35;
            break;
          }
          return _context3.abrupt("continue", 37);
        case 35:
          _context3.next = 37;
          return client.query(_queriesInterface.queries.products.createProductVariation, [productId, quality, quantity, parseFloat(price_home || 0), parseFloat(price_supermarket || 0), parseFloat(price_restaurant || 0), parseFloat(price_fruver || 0)]);
        case 37:
          _context3.next = 30;
          break;
        case 39:
          _context3.next = 44;
          break;
        case 41:
          _context3.prev = 41;
          _context3.t1 = _context3["catch"](28);
          _iterator.e(_context3.t1);
        case 44:
          _context3.prev = 44;
          _iterator.f();
          return _context3.finish(44);
        case 47:
          res.status(201).json({
            message: 'Producto creado exitosamente',
            product_id: productId
          });
          _context3.next = 53;
          break;
        case 50:
          _context3.prev = 50;
          _context3.t2 = _context3["catch"](18);
          res.status(500).json({
            message: 'Error al crear el producto',
            error: _context3.t2.message
          });
        case 53:
          _context3.prev = 53;
          if (client) client.release();
          return _context3.finish(53);
        case 56:
        case "end":
          return _context3.stop();
      }
    }, _callee3, null, [[5, 11], [18, 50, 53, 56], [28, 41, 44, 47]]);
  }));
  return function createProduct(_x5, _x6) {
    return _ref3.apply(this, arguments);
  };
}();
var uploadImageSafe = /*#__PURE__*/function () {
  var _ref4 = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee4(buffer, filename) {
    return _regeneratorRuntime().wrap(function _callee4$(_context4) {
      while (1) switch (_context4.prev = _context4.next) {
        case 0:
          _context4.prev = 0;
          _context4.next = 3;
          return (0, _uploadImage.uploadImage)(buffer, filename);
        case 3:
          return _context4.abrupt("return", _context4.sent);
        case 6:
          _context4.prev = 6;
          _context4.t0 = _context4["catch"](0);
          console.error('Error al subir la imagen:', _context4.t0);
          return _context4.abrupt("return", null);
        case 10:
        case "end":
          return _context4.stop();
      }
    }, _callee4, null, [[0, 6]]);
  }));
  return function uploadImageSafe(_x7, _x8) {
    return _ref4.apply(this, arguments);
  };
}();
var updateProduct = exports.updateProduct = /*#__PURE__*/function () {
  var _ref5 = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee5(req, res) {
    var client, id, _req$body2, name, description, category, stock, photo_url, variations, parsedProductId, updatedPhotoUrl, result, _iterator2, _step2, variation;
    return _regeneratorRuntime().wrap(function _callee5$(_context5) {
      while (1) switch (_context5.prev = _context5.next) {
        case 0:
          id = req.params.id;
          _req$body2 = req.body, name = _req$body2.name, description = _req$body2.description, category = _req$body2.category, stock = _req$body2.stock, photo_url = _req$body2.photo_url, variations = _req$body2.variations;
          parsedProductId = parseInt(id, 10);
          if (!isNaN(parsedProductId)) {
            _context5.next = 5;
            break;
          }
          return _context5.abrupt("return", res.status(400).json({
            message: 'ID del producto inválido'
          }));
        case 5:
          _context5.prev = 5;
          _context5.next = 8;
          return (0, _connection.getConnection)();
        case 8:
          client = _context5.sent;
          updatedPhotoUrl = photo_url || null;
          if (_queriesInterface.queries.products.updateProduct) {
            _context5.next = 12;
            break;
          }
          return _context5.abrupt("return", res.status(500).json({
            message: 'Error en la consulta SQL'
          }));
        case 12:
          _context5.next = 14;
          return client.query(_queriesInterface.queries.products.updateProduct, [name, description, category, stock, updatedPhotoUrl, parsedProductId]);
        case 14:
          result = _context5.sent;
          if (!(result.rowCount === 0)) {
            _context5.next = 17;
            break;
          }
          return _context5.abrupt("return", res.status(404).json({
            message: 'Producto no encontrado'
          }));
        case 17:
          if (!(Array.isArray(variations) && variations.length > 0)) {
            _context5.next = 37;
            break;
          }
          _context5.next = 20;
          return client.query(_queriesInterface.queries.products.deleteProductVariation, [parsedProductId]);
        case 20:
          _iterator2 = _createForOfIteratorHelper(variations);
          _context5.prev = 21;
          _iterator2.s();
        case 23:
          if ((_step2 = _iterator2.n()).done) {
            _context5.next = 29;
            break;
          }
          variation = _step2.value;
          _context5.next = 27;
          return client.query(_queriesInterface.queries.products.createProductVariation, [parsedProductId, variation.quality, variation.quantity, parseFloat(variation.price_home || 0), parseFloat(variation.price_supermarket || 0), parseFloat(variation.price_restaurant || 0), parseFloat(variation.price_fruver || 0)]);
        case 27:
          _context5.next = 23;
          break;
        case 29:
          _context5.next = 34;
          break;
        case 31:
          _context5.prev = 31;
          _context5.t0 = _context5["catch"](21);
          _iterator2.e(_context5.t0);
        case 34:
          _context5.prev = 34;
          _iterator2.f();
          return _context5.finish(34);
        case 37:
          res.status(200).json({
            message: 'Producto actualizado exitosamente'
          });
          _context5.next = 44;
          break;
        case 40:
          _context5.prev = 40;
          _context5.t1 = _context5["catch"](5);
          console.error('Error al actualizar el producto:', _context5.t1);
          res.status(500).json({
            message: 'Error al actualizar el producto'
          });
        case 44:
          _context5.prev = 44;
          if (client) client.release();
          return _context5.finish(44);
        case 47:
        case "end":
          return _context5.stop();
      }
    }, _callee5, null, [[5, 40, 44, 47], [21, 31, 34, 37]]);
  }));
  return function updateProduct(_x9, _x10) {
    return _ref5.apply(this, arguments);
  };
}();
var deleteProduct = exports.deleteProduct = /*#__PURE__*/function () {
  var _ref6 = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee6(req, res) {
    var id, client, result;
    return _regeneratorRuntime().wrap(function _callee6$(_context6) {
      while (1) switch (_context6.prev = _context6.next) {
        case 0:
          id = req.params.id;
          if (id) {
            _context6.next = 3;
            break;
          }
          return _context6.abrupt("return", res.status(400).json({
            message: 'El ID del producto es requerido'
          }));
        case 3:
          _context6.prev = 3;
          _context6.next = 6;
          return (0, _connection.getConnection)();
        case 6:
          client = _context6.sent;
          _context6.next = 9;
          return client.query(_queriesInterface.queries.products.deleteProduct, [id]);
        case 9:
          result = _context6.sent;
          if (!(result.rowCount === 0)) {
            _context6.next = 12;
            break;
          }
          return _context6.abrupt("return", res.status(404).json({
            message: 'Producto no encontrado o ya eliminado'
          }));
        case 12:
          res.status(200).json({
            message: 'Producto eliminado correctamente'
          });
          _context6.next = 19;
          break;
        case 15:
          _context6.prev = 15;
          _context6.t0 = _context6["catch"](3);
          console.error('Error al eliminar el producto:', _context6.t0);
          res.status(500).json({
            message: 'Error al eliminar el producto'
          });
        case 19:
          _context6.prev = 19;
          if (client) client.release();
          return _context6.finish(19);
        case 22:
        case "end":
          return _context6.stop();
      }
    }, _callee6, null, [[3, 15, 19, 22]]);
  }));
  return function deleteProduct(_x11, _x12) {
    return _ref6.apply(this, arguments);
  };
}();