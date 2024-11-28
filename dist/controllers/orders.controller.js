"use strict";

function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.updateOrders = exports.updateOrderStatus = exports.placeOrder = exports.getOrdersById = exports.getOrders = exports.deleteOrders = exports.createOrders = void 0;
var _connection = require("../database/connection.js");
var _queriesInterface = require("../database/queries.interface.js");
var _crypto = _interopRequireDefault(require("crypto"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { "default": e }; }
function _regeneratorRuntime() { "use strict"; /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/facebook/regenerator/blob/main/LICENSE */ _regeneratorRuntime = function _regeneratorRuntime() { return e; }; var t, e = {}, r = Object.prototype, n = r.hasOwnProperty, o = Object.defineProperty || function (t, e, r) { t[e] = r.value; }, i = "function" == typeof Symbol ? Symbol : {}, a = i.iterator || "@@iterator", c = i.asyncIterator || "@@asyncIterator", u = i.toStringTag || "@@toStringTag"; function define(t, e, r) { return Object.defineProperty(t, e, { value: r, enumerable: !0, configurable: !0, writable: !0 }), t[e]; } try { define({}, ""); } catch (t) { define = function define(t, e, r) { return t[e] = r; }; } function wrap(t, e, r, n) { var i = e && e.prototype instanceof Generator ? e : Generator, a = Object.create(i.prototype), c = new Context(n || []); return o(a, "_invoke", { value: makeInvokeMethod(t, r, c) }), a; } function tryCatch(t, e, r) { try { return { type: "normal", arg: t.call(e, r) }; } catch (t) { return { type: "throw", arg: t }; } } e.wrap = wrap; var h = "suspendedStart", l = "suspendedYield", f = "executing", s = "completed", y = {}; function Generator() {} function GeneratorFunction() {} function GeneratorFunctionPrototype() {} var p = {}; define(p, a, function () { return this; }); var d = Object.getPrototypeOf, v = d && d(d(values([]))); v && v !== r && n.call(v, a) && (p = v); var g = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(p); function defineIteratorMethods(t) { ["next", "throw", "return"].forEach(function (e) { define(t, e, function (t) { return this._invoke(e, t); }); }); } function AsyncIterator(t, e) { function invoke(r, o, i, a) { var c = tryCatch(t[r], t, o); if ("throw" !== c.type) { var u = c.arg, h = u.value; return h && "object" == _typeof(h) && n.call(h, "__await") ? e.resolve(h.__await).then(function (t) { invoke("next", t, i, a); }, function (t) { invoke("throw", t, i, a); }) : e.resolve(h).then(function (t) { u.value = t, i(u); }, function (t) { return invoke("throw", t, i, a); }); } a(c.arg); } var r; o(this, "_invoke", { value: function value(t, n) { function callInvokeWithMethodAndArg() { return new e(function (e, r) { invoke(t, n, e, r); }); } return r = r ? r.then(callInvokeWithMethodAndArg, callInvokeWithMethodAndArg) : callInvokeWithMethodAndArg(); } }); } function makeInvokeMethod(e, r, n) { var o = h; return function (i, a) { if (o === f) throw Error("Generator is already running"); if (o === s) { if ("throw" === i) throw a; return { value: t, done: !0 }; } for (n.method = i, n.arg = a;;) { var c = n.delegate; if (c) { var u = maybeInvokeDelegate(c, n); if (u) { if (u === y) continue; return u; } } if ("next" === n.method) n.sent = n._sent = n.arg;else if ("throw" === n.method) { if (o === h) throw o = s, n.arg; n.dispatchException(n.arg); } else "return" === n.method && n.abrupt("return", n.arg); o = f; var p = tryCatch(e, r, n); if ("normal" === p.type) { if (o = n.done ? s : l, p.arg === y) continue; return { value: p.arg, done: n.done }; } "throw" === p.type && (o = s, n.method = "throw", n.arg = p.arg); } }; } function maybeInvokeDelegate(e, r) { var n = r.method, o = e.iterator[n]; if (o === t) return r.delegate = null, "throw" === n && e.iterator["return"] && (r.method = "return", r.arg = t, maybeInvokeDelegate(e, r), "throw" === r.method) || "return" !== n && (r.method = "throw", r.arg = new TypeError("The iterator does not provide a '" + n + "' method")), y; var i = tryCatch(o, e.iterator, r.arg); if ("throw" === i.type) return r.method = "throw", r.arg = i.arg, r.delegate = null, y; var a = i.arg; return a ? a.done ? (r[e.resultName] = a.value, r.next = e.nextLoc, "return" !== r.method && (r.method = "next", r.arg = t), r.delegate = null, y) : a : (r.method = "throw", r.arg = new TypeError("iterator result is not an object"), r.delegate = null, y); } function pushTryEntry(t) { var e = { tryLoc: t[0] }; 1 in t && (e.catchLoc = t[1]), 2 in t && (e.finallyLoc = t[2], e.afterLoc = t[3]), this.tryEntries.push(e); } function resetTryEntry(t) { var e = t.completion || {}; e.type = "normal", delete e.arg, t.completion = e; } function Context(t) { this.tryEntries = [{ tryLoc: "root" }], t.forEach(pushTryEntry, this), this.reset(!0); } function values(e) { if (e || "" === e) { var r = e[a]; if (r) return r.call(e); if ("function" == typeof e.next) return e; if (!isNaN(e.length)) { var o = -1, i = function next() { for (; ++o < e.length;) if (n.call(e, o)) return next.value = e[o], next.done = !1, next; return next.value = t, next.done = !0, next; }; return i.next = i; } } throw new TypeError(_typeof(e) + " is not iterable"); } return GeneratorFunction.prototype = GeneratorFunctionPrototype, o(g, "constructor", { value: GeneratorFunctionPrototype, configurable: !0 }), o(GeneratorFunctionPrototype, "constructor", { value: GeneratorFunction, configurable: !0 }), GeneratorFunction.displayName = define(GeneratorFunctionPrototype, u, "GeneratorFunction"), e.isGeneratorFunction = function (t) { var e = "function" == typeof t && t.constructor; return !!e && (e === GeneratorFunction || "GeneratorFunction" === (e.displayName || e.name)); }, e.mark = function (t) { return Object.setPrototypeOf ? Object.setPrototypeOf(t, GeneratorFunctionPrototype) : (t.__proto__ = GeneratorFunctionPrototype, define(t, u, "GeneratorFunction")), t.prototype = Object.create(g), t; }, e.awrap = function (t) { return { __await: t }; }, defineIteratorMethods(AsyncIterator.prototype), define(AsyncIterator.prototype, c, function () { return this; }), e.AsyncIterator = AsyncIterator, e.async = function (t, r, n, o, i) { void 0 === i && (i = Promise); var a = new AsyncIterator(wrap(t, r, n, o), i); return e.isGeneratorFunction(r) ? a : a.next().then(function (t) { return t.done ? t.value : a.next(); }); }, defineIteratorMethods(g), define(g, u, "Generator"), define(g, a, function () { return this; }), define(g, "toString", function () { return "[object Generator]"; }), e.keys = function (t) { var e = Object(t), r = []; for (var n in e) r.push(n); return r.reverse(), function next() { for (; r.length;) { var t = r.pop(); if (t in e) return next.value = t, next.done = !1, next; } return next.done = !0, next; }; }, e.values = values, Context.prototype = { constructor: Context, reset: function reset(e) { if (this.prev = 0, this.next = 0, this.sent = this._sent = t, this.done = !1, this.delegate = null, this.method = "next", this.arg = t, this.tryEntries.forEach(resetTryEntry), !e) for (var r in this) "t" === r.charAt(0) && n.call(this, r) && !isNaN(+r.slice(1)) && (this[r] = t); }, stop: function stop() { this.done = !0; var t = this.tryEntries[0].completion; if ("throw" === t.type) throw t.arg; return this.rval; }, dispatchException: function dispatchException(e) { if (this.done) throw e; var r = this; function handle(n, o) { return a.type = "throw", a.arg = e, r.next = n, o && (r.method = "next", r.arg = t), !!o; } for (var o = this.tryEntries.length - 1; o >= 0; --o) { var i = this.tryEntries[o], a = i.completion; if ("root" === i.tryLoc) return handle("end"); if (i.tryLoc <= this.prev) { var c = n.call(i, "catchLoc"), u = n.call(i, "finallyLoc"); if (c && u) { if (this.prev < i.catchLoc) return handle(i.catchLoc, !0); if (this.prev < i.finallyLoc) return handle(i.finallyLoc); } else if (c) { if (this.prev < i.catchLoc) return handle(i.catchLoc, !0); } else { if (!u) throw Error("try statement without catch or finally"); if (this.prev < i.finallyLoc) return handle(i.finallyLoc); } } } }, abrupt: function abrupt(t, e) { for (var r = this.tryEntries.length - 1; r >= 0; --r) { var o = this.tryEntries[r]; if (o.tryLoc <= this.prev && n.call(o, "finallyLoc") && this.prev < o.finallyLoc) { var i = o; break; } } i && ("break" === t || "continue" === t) && i.tryLoc <= e && e <= i.finallyLoc && (i = null); var a = i ? i.completion : {}; return a.type = t, a.arg = e, i ? (this.method = "next", this.next = i.finallyLoc, y) : this.complete(a); }, complete: function complete(t, e) { if ("throw" === t.type) throw t.arg; return "break" === t.type || "continue" === t.type ? this.next = t.arg : "return" === t.type ? (this.rval = this.arg = t.arg, this.method = "return", this.next = "end") : "normal" === t.type && e && (this.next = e), y; }, finish: function finish(t) { for (var e = this.tryEntries.length - 1; e >= 0; --e) { var r = this.tryEntries[e]; if (r.finallyLoc === t) return this.complete(r.completion, r.afterLoc), resetTryEntry(r), y; } }, "catch": function _catch(t) { for (var e = this.tryEntries.length - 1; e >= 0; --e) { var r = this.tryEntries[e]; if (r.tryLoc === t) { var n = r.completion; if ("throw" === n.type) { var o = n.arg; resetTryEntry(r); } return o; } } throw Error("illegal catch attempt"); }, delegateYield: function delegateYield(e, r, n) { return this.delegate = { iterator: values(e), resultName: r, nextLoc: n }, "next" === this.method && (this.arg = t), y; } }, e; }
function _createForOfIteratorHelper(r, e) { var t = "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (!t) { if (Array.isArray(r) || (t = _unsupportedIterableToArray(r)) || e && r && "number" == typeof r.length) { t && (r = t); var _n = 0, F = function F() {}; return { s: F, n: function n() { return _n >= r.length ? { done: !0 } : { done: !1, value: r[_n++] }; }, e: function e(r) { throw r; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var o, a = !0, u = !1; return { s: function s() { t = t.call(r); }, n: function n() { var r = t.next(); return a = r.done, r; }, e: function e(r) { u = !0, o = r; }, f: function f() { try { a || null == t["return"] || t["return"](); } finally { if (u) throw o; } } }; }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function asyncGeneratorStep(n, t, e, r, o, a, c) { try { var i = n[a](c), u = i.value; } catch (n) { return void e(n); } i.done ? t(u) : Promise.resolve(u).then(r, o); }
function _asyncToGenerator(n) { return function () { var t = this, e = arguments; return new Promise(function (r, o) { var a = n.apply(t, e); function _next(n) { asyncGeneratorStep(a, r, o, _next, _throw, "next", n); } function _throw(n) { asyncGeneratorStep(a, r, o, _next, _throw, "throw", n); } _next(void 0); }); }; }
var placeOrder = exports.placeOrder = /*#__PURE__*/function () {
  var _ref = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee(req, res) {
    var _req$body, userId, cartDetails, shippingMethod, estimatedDelivery, actualDelivery, total, userData, needsElectronicInvoice, companyName, companyNit, trackingNumber, shippingStatusId, client, userResult, productIds, productCheckResult, existingProductIds, invalidProducts, orderResult, orderId, _iterator, _step, item;
    return _regeneratorRuntime().wrap(function _callee$(_context) {
      while (1) switch (_context.prev = _context.next) {
        case 0:
          _req$body = req.body, userId = _req$body.userId, cartDetails = _req$body.cartDetails, shippingMethod = _req$body.shippingMethod, estimatedDelivery = _req$body.estimatedDelivery, actualDelivery = _req$body.actualDelivery, total = _req$body.total, userData = _req$body.userData, needsElectronicInvoice = _req$body.needsElectronicInvoice, companyName = _req$body.companyName, companyNit = _req$body.companyNit;
          trackingNumber = _crypto["default"].randomBytes(5).toString('hex');
          shippingStatusId = 1;
          if (!(!userId || !cartDetails || !total)) {
            _context.next = 5;
            break;
          }
          return _context.abrupt("return", res.status(400).json({
            msg: 'Información incompleta para procesar el pedido.'
          }));
        case 5:
          _context.prev = 5;
          _context.next = 8;
          return (0, _connection.getConnection)();
        case 8:
          client = _context.sent;
          _context.next = 11;
          return client.query("SELECT id FROM users WHERE id = $1", [userId]);
        case 11:
          userResult = _context.sent;
          if (!(userResult.rows.length === 0)) {
            _context.next = 15;
            break;
          }
          client.release();
          return _context.abrupt("return", res.status(404).json({
            msg: 'Usuario no encontrado.'
          }));
        case 15:
          productIds = cartDetails.map(function (item) {
            return item.productId;
          });
          _context.next = 18;
          return client.query("SELECT product_id FROM products WHERE product_id = ANY($1)", [productIds]);
        case 18:
          productCheckResult = _context.sent;
          existingProductIds = productCheckResult.rows.map(function (row) {
            return row.product_id;
          });
          invalidProducts = productIds.filter(function (id) {
            return !existingProductIds.includes(id);
          });
          if (!(invalidProducts.length > 0)) {
            _context.next = 24;
            break;
          }
          client.release();
          return _context.abrupt("return", res.status(400).json({
            msg: 'Algunos productos no existen en el catálogo.',
            invalidProducts: invalidProducts
          }));
        case 24:
          _context.next = 26;
          return client.query(_queriesInterface.queries.orders.createOrder, [userId, new Date(), 1, total, needsElectronicInvoice || false, companyName || null, companyNit || null]);
        case 26:
          orderResult = _context.sent;
          orderId = orderResult.rows[0].id;
          _iterator = _createForOfIteratorHelper(cartDetails);
          _context.prev = 29;
          _iterator.s();
        case 31:
          if ((_step = _iterator.n()).done) {
            _context.next = 37;
            break;
          }
          item = _step.value;
          _context.next = 35;
          return client.query(_queriesInterface.queries.orders.createOrderItem, [orderId, item.productId, item.quantity, item.price]);
        case 35:
          _context.next = 31;
          break;
        case 37:
          _context.next = 42;
          break;
        case 39:
          _context.prev = 39;
          _context.t0 = _context["catch"](29);
          _iterator.e(_context.t0);
        case 42:
          _context.prev = 42;
          _iterator.f();
          return _context.finish(42);
        case 45:
          if (!(shippingMethod && estimatedDelivery && actualDelivery)) {
            _context.next = 48;
            break;
          }
          _context.next = 48;
          return client.query(_queriesInterface.queries.shipping_info.createShippingInfo, [shippingMethod, trackingNumber, estimatedDelivery, actualDelivery, shippingStatusId, orderId]);
        case 48:
          client.release();
          res.status(201).json({
            msg: 'Pedido realizado exitosamente.',
            orderId: orderId
          });
          _context.next = 56;
          break;
        case 52:
          _context.prev = 52;
          _context.t1 = _context["catch"](5);
          console.error('Error al realizar el pedido:', _context.t1);
          res.status(500).json({
            msg: 'Error interno del servidor.'
          });
        case 56:
        case "end":
          return _context.stop();
      }
    }, _callee, null, [[5, 52], [29, 39, 42, 45]]);
  }));
  return function placeOrder(_x, _x2) {
    return _ref.apply(this, arguments);
  };
}();
var getOrders = exports.getOrders = /*#__PURE__*/function () {
  var _ref2 = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee2(req, res) {
    var client, result;
    return _regeneratorRuntime().wrap(function _callee2$(_context2) {
      while (1) switch (_context2.prev = _context2.next) {
        case 0:
          _context2.prev = 0;
          _context2.next = 3;
          return (0, _connection.getConnection)();
        case 3:
          client = _context2.sent;
          _context2.next = 6;
          return client.query(_queriesInterface.queries.orders.getOrders);
        case 6:
          result = _context2.sent;
          client.release();
          res.status(200).json(result.rows);
          _context2.next = 15;
          break;
        case 11:
          _context2.prev = 11;
          _context2.t0 = _context2["catch"](0);
          console.error('Error al obtener los pedidos:', _context2.t0);
          res.status(500).json({
            msg: 'Error al obtener los pedidos.'
          });
        case 15:
        case "end":
          return _context2.stop();
      }
    }, _callee2, null, [[0, 11]]);
  }));
  return function getOrders(_x3, _x4) {
    return _ref2.apply(this, arguments);
  };
}();
var getOrdersById = exports.getOrdersById = /*#__PURE__*/function () {
  var _ref3 = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee3(req, res) {
    var orderId, client, orderResult, orderData, itemsResult, orderItems, shippingResult, shippingInfo;
    return _regeneratorRuntime().wrap(function _callee3$(_context3) {
      while (1) switch (_context3.prev = _context3.next) {
        case 0:
          _context3.prev = 0;
          orderId = req.params.orderId;
          _context3.next = 4;
          return (0, _connection.getConnection)();
        case 4:
          client = _context3.sent;
          _context3.next = 7;
          return client.query(_queriesInterface.queries.orders.getOrdersById, [orderId]);
        case 7:
          orderResult = _context3.sent;
          if (!(orderResult.rows.length === 0)) {
            _context3.next = 11;
            break;
          }
          client.release();
          return _context3.abrupt("return", res.status(404).json({
            msg: 'Pedido no encontrado.'
          }));
        case 11:
          orderData = orderResult.rows[0]; // Productos del pedido
          _context3.next = 14;
          return client.query(_queriesInterface.queries.orders.getOrderItemsByOrderId, [orderId]);
        case 14:
          itemsResult = _context3.sent;
          orderItems = itemsResult.rows; // Información de envío
          _context3.next = 18;
          return client.query(_queriesInterface.queries.orders.getShippingInfoByOrderId, [orderId]);
        case 18:
          shippingResult = _context3.sent;
          shippingInfo = shippingResult.rows.length > 0 ? shippingResult.rows[0] : null;
          client.release();

          // Respuesta estructurada
          res.status(200).json({
            order: orderData,
            items: orderItems,
            shippingInfo: shippingInfo
          });
          _context3.next = 28;
          break;
        case 24:
          _context3.prev = 24;
          _context3.t0 = _context3["catch"](0);
          console.error('Error al obtener el pedido:', _context3.t0);
          res.status(500).json({
            msg: 'Error al obtener el pedido.'
          });
        case 28:
        case "end":
          return _context3.stop();
      }
    }, _callee3, null, [[0, 24]]);
  }));
  return function getOrdersById(_x5, _x6) {
    return _ref3.apply(this, arguments);
  };
}();

/**
 * Crea un nuevo pedido.
 */
var createOrders = exports.createOrders = /*#__PURE__*/function () {
  var _ref4 = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee4(req, res) {
    var _req$body2, customer_id, order_date, status_id, total, client;
    return _regeneratorRuntime().wrap(function _callee4$(_context4) {
      while (1) switch (_context4.prev = _context4.next) {
        case 0:
          _req$body2 = req.body, customer_id = _req$body2.customer_id, order_date = _req$body2.order_date, status_id = _req$body2.status_id, total = _req$body2.total;
          if (!(!customer_id || !order_date || !status_id || !total)) {
            _context4.next = 3;
            break;
          }
          return _context4.abrupt("return", res.status(400).json({
            msg: 'Campos obligatorios incompletos.'
          }));
        case 3:
          _context4.prev = 3;
          _context4.next = 6;
          return (0, _connection.getConnection)();
        case 6:
          client = _context4.sent;
          _context4.next = 9;
          return client.query(_queriesInterface.queries.orders.createOrder, [customer_id, order_date, status_id, total]);
        case 9:
          client.release();
          res.status(201).json({
            msg: 'Pedido creado exitosamente.'
          });
          _context4.next = 17;
          break;
        case 13:
          _context4.prev = 13;
          _context4.t0 = _context4["catch"](3);
          console.error('Error al crear el pedido:', _context4.t0);
          res.status(500).json({
            msg: 'Error interno del servidor.'
          });
        case 17:
        case "end":
          return _context4.stop();
      }
    }, _callee4, null, [[3, 13]]);
  }));
  return function createOrders(_x7, _x8) {
    return _ref4.apply(this, arguments);
  };
}();

/**
 * Actualiza un pedido existente.
 */
var updateOrders = exports.updateOrders = /*#__PURE__*/function () {
  var _ref5 = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee5(req, res) {
    var _req$body3, id, customer_id, order_date, status_id, total, client;
    return _regeneratorRuntime().wrap(function _callee5$(_context5) {
      while (1) switch (_context5.prev = _context5.next) {
        case 0:
          _req$body3 = req.body, id = _req$body3.id, customer_id = _req$body3.customer_id, order_date = _req$body3.order_date, status_id = _req$body3.status_id, total = _req$body3.total;
          if (!(!id || !customer_id || !order_date || !status_id || !total)) {
            _context5.next = 3;
            break;
          }
          return _context5.abrupt("return", res.status(400).json({
            msg: 'Campos obligatorios incompletos.'
          }));
        case 3:
          _context5.prev = 3;
          _context5.next = 6;
          return (0, _connection.getConnection)();
        case 6:
          client = _context5.sent;
          _context5.next = 9;
          return client.query(_queriesInterface.queries.orders.updateOrders, [customer_id, order_date, status_id, total, id]);
        case 9:
          client.release();
          res.status(200).json({
            msg: 'Pedido actualizado exitosamente.'
          });
          _context5.next = 17;
          break;
        case 13:
          _context5.prev = 13;
          _context5.t0 = _context5["catch"](3);
          console.error('Error al actualizar el pedido:', _context5.t0);
          res.status(500).json({
            msg: 'Error interno del servidor.'
          });
        case 17:
        case "end":
          return _context5.stop();
      }
    }, _callee5, null, [[3, 13]]);
  }));
  return function updateOrders(_x9, _x10) {
    return _ref5.apply(this, arguments);
  };
}();

/**
 * Actualiza el estado de un pedido.
 */
var updateOrderStatus = exports.updateOrderStatus = /*#__PURE__*/function () {
  var _ref6 = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee6(req, res) {
    var _req$params, id, status_id, client;
    return _regeneratorRuntime().wrap(function _callee6$(_context6) {
      while (1) switch (_context6.prev = _context6.next) {
        case 0:
          _req$params = req.params, id = _req$params.id, status_id = _req$params.status_id;
          if (!(!id || !status_id)) {
            _context6.next = 3;
            break;
          }
          return _context6.abrupt("return", res.status(400).json({
            msg: 'ID de pedido o estado no proporcionado.'
          }));
        case 3:
          _context6.prev = 3;
          _context6.next = 6;
          return (0, _connection.getConnection)();
        case 6:
          client = _context6.sent;
          _context6.next = 9;
          return client.query(_queriesInterface.queries.orders.updateOrderStatus, [status_id, id]);
        case 9:
          client.release();
          res.status(200).json({
            msg: 'Estado del pedido actualizado exitosamente.'
          });
          _context6.next = 17;
          break;
        case 13:
          _context6.prev = 13;
          _context6.t0 = _context6["catch"](3);
          console.error('Error al actualizar el estado del pedido:', _context6.t0);
          res.status(500).json({
            msg: 'Error interno del servidor.'
          });
        case 17:
        case "end":
          return _context6.stop();
      }
    }, _callee6, null, [[3, 13]]);
  }));
  return function updateOrderStatus(_x11, _x12) {
    return _ref6.apply(this, arguments);
  };
}();

/**
 * Elimina un pedido.
 */
var deleteOrders = exports.deleteOrders = /*#__PURE__*/function () {
  var _ref7 = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee7(req, res) {
    var orderId, client, orderCheck;
    return _regeneratorRuntime().wrap(function _callee7$(_context7) {
      while (1) switch (_context7.prev = _context7.next) {
        case 0:
          orderId = req.params.orderId;
          if (orderId) {
            _context7.next = 3;
            break;
          }
          return _context7.abrupt("return", res.status(400).json({
            msg: 'ID del pedido no proporcionado.'
          }));
        case 3:
          _context7.prev = 3;
          _context7.next = 6;
          return (0, _connection.getConnection)();
        case 6:
          client = _context7.sent;
          _context7.next = 9;
          return client.query('SELECT id FROM orders WHERE id = $1', [orderId]);
        case 9:
          orderCheck = _context7.sent;
          if (!(orderCheck.rowCount === 0)) {
            _context7.next = 13;
            break;
          }
          client.release();
          return _context7.abrupt("return", res.status(404).json({
            msg: 'Pedido no encontrado.'
          }));
        case 13:
          _context7.next = 15;
          return client.query(_queriesInterface.queries.orders.deleteOrders, [orderId]);
        case 15:
          client.release();
          res.status(200).json({
            msg: 'Pedido eliminado exitosamente.'
          });
          _context7.next = 23;
          break;
        case 19:
          _context7.prev = 19;
          _context7.t0 = _context7["catch"](3);
          console.error('Error al eliminar el pedido:', _context7.t0);
          res.status(500).json({
            msg: 'Error interno del servidor.'
          });
        case 23:
        case "end":
          return _context7.stop();
      }
    }, _callee7, null, [[3, 19]]);
  }));
  return function deleteOrders(_x13, _x14) {
    return _ref7.apply(this, arguments);
  };
}();