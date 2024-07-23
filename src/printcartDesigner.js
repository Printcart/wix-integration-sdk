const PrintcartDesigner = (function () {
  "use strict";
  var He = Object.defineProperty;
  var ze = (L, p, v) =>
    p in L
      ? He(L, p, { enumerable: !0, configurable: !0, writable: !0, value: v })
      : (L[p] = v);
  var te = (L, p, v) => (ze(L, typeof p != "symbol" ? p + "" : p, v), v);
  var L = Object.defineProperty,
    p = (t, e, n) =>
      e in t
        ? L(t, e, { enumerable: !0, configurable: !0, writable: !0, value: n })
        : (t[e] = n),
    v = (t, e, n) => (p(t, typeof e != "symbol" ? e + "" : e, n), n),
    H = (t, e, n) => {
      if (!e.has(t)) throw TypeError("Cannot " + n);
    },
    R = (t, e, n) => (
      H(t, e, "read from private field"), n ? n.call(t) : e.get(t)
    ),
    w = (t, e, n) => {
      if (e.has(t))
        throw TypeError("Cannot add the same private member more than once");
      e instanceof WeakSet ? e.add(t) : e.set(t, n);
    },
    ne = (t, e, n, r) => (
      H(t, e, "write to private field"), r ? r.call(t, n) : e.set(t, n), n
    ),
    l = (t, e, n) => (H(t, e, "access private method"), n),
    E,
    P,
    z,
    re,
    G,
    ie,
    U,
    V,
    d,
    m,
    Z = { exports: {} },
    b = typeof Reflect == "object" ? Reflect : null,
    se =
      b && typeof b.apply == "function"
        ? b.apply
        : function (e, n, r) {
            return Function.prototype.apply.call(e, n, r);
          },
    F;
  b && typeof b.ownKeys == "function"
    ? (F = b.ownKeys)
    : Object.getOwnPropertySymbols
    ? (F = function (e) {
        return Object.getOwnPropertyNames(e).concat(
          Object.getOwnPropertySymbols(e)
        );
      })
    : (F = function (e) {
        return Object.getOwnPropertyNames(e);
      });
  function xe(t) {
    console && console.warn && console.warn(t);
  }
  var oe =
    Number.isNaN ||
    function (e) {
      return e !== e;
    };
  function a() {
    a.init.call(this);
  }
  (Z.exports = a),
    (Z.exports.once = $e),
    (a.EventEmitter = a),
    (a.prototype._events = void 0),
    (a.prototype._eventsCount = 0),
    (a.prototype._maxListeners = void 0);
  var ae = 10;
  function S(t) {
    if (typeof t != "function")
      throw new TypeError(
        'The "listener" argument must be of type Function. Received type ' +
          typeof t
      );
  }
  Object.defineProperty(a, "defaultMaxListeners", {
    enumerable: !0,
    get: function () {
      return ae;
    },
    set: function (t) {
      if (typeof t != "number" || t < 0 || oe(t))
        throw new RangeError(
          'The value of "defaultMaxListeners" is out of range. It must be a non-negative number. Received ' +
            t +
            "."
        );
      ae = t;
    },
  }),
    (a.init = function () {
      (this._events === void 0 ||
        this._events === Object.getPrototypeOf(this)._events) &&
        ((this._events = Object.create(null)), (this._eventsCount = 0)),
        (this._maxListeners = this._maxListeners || void 0);
    }),
    (a.prototype.setMaxListeners = function (e) {
      if (typeof e != "number" || e < 0 || oe(e))
        throw new RangeError(
          'The value of "n" is out of range. It must be a non-negative number. Received ' +
            e +
            "."
        );
      return (this._maxListeners = e), this;
    });
  function fe(t) {
    return t._maxListeners === void 0 ? a.defaultMaxListeners : t._maxListeners;
  }
  (a.prototype.getMaxListeners = function () {
    return fe(this);
  }),
    (a.prototype.emit = function (e) {
      for (var n = [], r = 1; r < arguments.length; r++) n.push(arguments[r]);
      var i = e === "error",
        o = this._events;
      if (o !== void 0) i = i && o.error === void 0;
      else if (!i) return !1;
      if (i) {
        var s;
        if ((n.length > 0 && (s = n[0]), s instanceof Error)) throw s;
        var c = new Error(
          "Unhandled error." + (s ? " (" + s.message + ")" : "")
        );
        throw ((c.context = s), c);
      }
      var h = o[e];
      if (h === void 0) return !1;
      if (typeof h == "function") se(h, this, n);
      else
        for (var N = h.length, ee = de(h, N), r = 0; r < N; ++r)
          se(ee[r], this, n);
      return !0;
    });
  function ce(t, e, n, r) {
    var i, o, s;
    if (
      (S(n),
      (o = t._events),
      o === void 0
        ? ((o = t._events = Object.create(null)), (t._eventsCount = 0))
        : (o.newListener !== void 0 &&
            (t.emit("newListener", e, n.listener ? n.listener : n),
            (o = t._events)),
          (s = o[e])),
      s === void 0)
    )
      (s = o[e] = n), ++t._eventsCount;
    else if (
      (typeof s == "function"
        ? (s = o[e] = r ? [n, s] : [s, n])
        : r
        ? s.unshift(n)
        : s.push(n),
      (i = fe(t)),
      i > 0 && s.length > i && !s.warned)
    ) {
      s.warned = !0;
      var c = new Error(
        "Possible EventEmitter memory leak detected. " +
          s.length +
          " " +
          String(e) +
          " listeners added. Use emitter.setMaxListeners() to increase limit"
      );
      (c.name = "MaxListenersExceededWarning"),
        (c.emitter = t),
        (c.type = e),
        (c.count = s.length),
        xe(c);
    }
    return t;
  }
  (a.prototype.addListener = function (e, n) {
    return ce(this, e, n, !1);
  }),
    (a.prototype.on = a.prototype.addListener),
    (a.prototype.prependListener = function (e, n) {
      return ce(this, e, n, !0);
    });
  function Me() {
    if (!this.fired)
      return (
        this.target.removeListener(this.type, this.wrapFn),
        (this.fired = !0),
        arguments.length === 0
          ? this.listener.call(this.target)
          : this.listener.apply(this.target, arguments)
      );
  }
  function ue(t, e, n) {
    var r = { fired: !1, wrapFn: void 0, target: t, type: e, listener: n },
      i = Me.bind(r);
    return (i.listener = n), (r.wrapFn = i), i;
  }
  (a.prototype.once = function (e, n) {
    return S(n), this.on(e, ue(this, e, n)), this;
  }),
    (a.prototype.prependOnceListener = function (e, n) {
      return S(n), this.prependListener(e, ue(this, e, n)), this;
    }),
    (a.prototype.removeListener = function (e, n) {
      var r, i, o, s, c;
      if ((S(n), (i = this._events), i === void 0)) return this;
      if (((r = i[e]), r === void 0)) return this;
      if (r === n || r.listener === n)
        --this._eventsCount === 0
          ? (this._events = Object.create(null))
          : (delete i[e],
            i.removeListener &&
              this.emit("removeListener", e, r.listener || n));
      else if (typeof r != "function") {
        for (o = -1, s = r.length - 1; s >= 0; s--)
          if (r[s] === n || r[s].listener === n) {
            (c = r[s].listener), (o = s);
            break;
          }
        if (o < 0) return this;
        o === 0 ? r.shift() : Re(r, o),
          r.length === 1 && (i[e] = r[0]),
          i.removeListener !== void 0 && this.emit("removeListener", e, c || n);
      }
      return this;
    }),
    (a.prototype.off = a.prototype.removeListener),
    (a.prototype.removeAllListeners = function (e) {
      var n, r, i;
      if (((r = this._events), r === void 0)) return this;
      if (r.removeListener === void 0)
        return (
          arguments.length === 0
            ? ((this._events = Object.create(null)), (this._eventsCount = 0))
            : r[e] !== void 0 &&
              (--this._eventsCount === 0
                ? (this._events = Object.create(null))
                : delete r[e]),
          this
        );
      if (arguments.length === 0) {
        var o = Object.keys(r),
          s;
        for (i = 0; i < o.length; ++i)
          (s = o[i]), s !== "removeListener" && this.removeAllListeners(s);
        return (
          this.removeAllListeners("removeListener"),
          (this._events = Object.create(null)),
          (this._eventsCount = 0),
          this
        );
      }
      if (((n = r[e]), typeof n == "function")) this.removeListener(e, n);
      else if (n !== void 0)
        for (i = n.length - 1; i >= 0; i--) this.removeListener(e, n[i]);
      return this;
    });
  function le(t, e, n) {
    var r = t._events;
    if (r === void 0) return [];
    var i = r[e];
    return i === void 0
      ? []
      : typeof i == "function"
      ? n
        ? [i.listener || i]
        : [i]
      : n
      ? Pe(i)
      : de(i, i.length);
  }
  (a.prototype.listeners = function (e) {
    return le(this, e, !0);
  }),
    (a.prototype.rawListeners = function (e) {
      return le(this, e, !1);
    }),
    (a.listenerCount = function (t, e) {
      return typeof t.listenerCount == "function"
        ? t.listenerCount(e)
        : he.call(t, e);
    }),
    (a.prototype.listenerCount = he);
  function he(t) {
    var e = this._events;
    if (e !== void 0) {
      var n = e[t];
      if (typeof n == "function") return 1;
      if (n !== void 0) return n.length;
    }
    return 0;
  }
  a.prototype.eventNames = function () {
    return this._eventsCount > 0 ? F(this._events) : [];
  };
  function de(t, e) {
    for (var n = new Array(e), r = 0; r < e; ++r) n[r] = t[r];
    return n;
  }
  function Re(t, e) {
    for (; e + 1 < t.length; e++) t[e] = t[e + 1];
    t.pop();
  }
  function Pe(t) {
    for (var e = new Array(t.length), n = 0; n < e.length; ++n)
      e[n] = t[n].listener || t[n];
    return e;
  }
  function $e(t, e) {
    return new Promise(function (n, r) {
      function i(s) {
        t.removeListener(e, o), r(s);
      }
      function o() {
        typeof t.removeListener == "function" && t.removeListener("error", i),
          n([].slice.call(arguments));
      }
      pe(t, e, o, { once: !0 }), e !== "error" && Te(t, i, { once: !0 });
    });
  }
  function Te(t, e, n) {
    typeof t.on == "function" && pe(t, "error", e, n);
  }
  function pe(t, e, n, r) {
    if (typeof t.on == "function") r.once ? t.once(e, n) : t.on(e, n);
    else if (typeof t.addEventListener == "function")
      t.addEventListener(e, function i(o) {
        r.once && t.removeEventListener(e, i), n(o);
      });
    else
      throw new TypeError(
        'The "emitter" argument must be of type EventEmitter. Received type ' +
          typeof t
      );
  }
  var We = Z.exports;
  const $ = "pc-designer-iframe-wrapper",
    j = "pc-designer-iframe";
  class Ae {
    constructor(e) {
      w(this, z),
        w(this, G),
        w(this, U),
        w(this, d),
        v(this, "token"),
        v(this, "productId"),
        v(this, "options"),
        w(this, E, void 0),
        w(this, P, void 0);
      var n;
      if (
        ((this.token = e.token),
        (this.productId = e.productId),
        (this.options = e.options),
        ne(
          this,
          E,
          (n = this.options) != null && n.designerUrl
            ? this.options.designerUrl
            : {}.VITE_CUSTOMIZER_URL
            ? {}.VITE_CUSTOMIZER_URL
            : "https://customizer.printcart.com"
        ),
        ne(this, P, new We()),
        !this.token || !this.productId)
      ) {
        console.error("Missing Config Params");
        return;
      }
      l(this, z, re).call(this), l(this, G, ie).call(this);
    }
    render() {
      const e = document.getElementById($),
        n = document.getElementById(j);
      if (!n || !(n instanceof HTMLIFrameElement) || !e) {
        console.error("Can not find iframe element");
        return;
      }
      const r = l(this, U, V).call(this);
      (n.src = r.href),
        (e.style.opacity = "1"),
        (e.style.visibility = "visible"),
        l(this, d, m).call(this, "rendered");
    }
    close() {
      const e = document.getElementById($);
      if (!e) {
        console.error("Can not find iframe element");
        return;
      }
      (e.style.opacity = "0"),
        (e.style.visibility = "hidden"),
        l(this, d, m).call(this, "closed");
    }
    editDesign(e) {
      const n = l(this, U, V).call(this);
      n.searchParams.set("design_id", e), n.searchParams.set("task", "edit");
      const r = document.getElementById($),
        i = document.getElementById(j);
      if (!i || !(i instanceof HTMLIFrameElement) || !r) {
        console.error("Can not find iframe element");
        return;
      }
      (i.src = n.href),
        (r.style.opacity = "1"),
        (r.style.visibility = "visible"),
        l(this, d, m).call(this, "edit");
    }
    on(e, n) {
      return R(this, P).on(e, n), this;
    }
  }
  (E = new WeakMap()),
    (P = new WeakMap()),
    (z = new WeakSet()),
    (re = function () {
      const t = document.createElement("div");
      (t.id = $),
        (t.style.cssText =
          "position:fixed;top:0;left:0;width:100vw;height:100vh;opacity:0;visibility:hidden;z-index:99999");
      const e = document.createElement("iframe");
      (e.id = j),
        (e.width = "100%"),
        (e.height = "100%"),
        t.appendChild(e),
        document.body.appendChild(t);
    }),
    (G = new WeakSet()),
    (ie = function () {
      window.addEventListener(
        "message",
        (t) => {
          if (t.origin === R(this, E) && t.data.message === "closeDesignTool") {
            const e = document.getElementById($);
            if (!e) return;
            (e.style.opacity = "0"),
              (e.style.visibility = "hidden"),
              l(this, d, m).call(this, "closed");
          }
          if (t.data.message === "finishLoad") {
            const e = document.getElementById(j);
            l(this, d, m).call(this, "render-finish"),
              e &&
                e instanceof HTMLIFrameElement &&
                e.contentWindow &&
                e.contentWindow.postMessage(
                  { message: "customSettings", settings: this.options },
                  R(this, E)
                );
          }
          t.data.message === "finishProcess" &&
            l(this, d, m).call(this, "upload-success", t.data.data.data),
            t.data.message === "finishUpdate" &&
              l(this, d, m).call(this, "edit-success", t.data.data.data),
            t.data.message === "uploadError" &&
              l(this, d, m).call(this, "upload-error", t.data);
        },
        !1
      );
    }),
    (U = new WeakSet()),
    (V = function () {
      const t = new URL(R(this, E));
      return (
        t.searchParams.set("api_key", this.token),
        t.searchParams.set("product_id", this.productId),
        t.searchParams.set("parentUrl", window.location.href),
        t
      );
    }),
    (d = new WeakSet()),
    (m = function (t, ...e) {
      R(this, P).emit(t, ...e);
    });
  var q = (t, e, n) => {
      if (!e.has(t)) throw TypeError("Cannot " + n);
    },
    u = (t, e, n) => (
      q(t, e, "read from private field"), n ? n.call(t) : e.get(t)
    ),
    y = (t, e, n) => {
      if (e.has(t))
        throw TypeError("Cannot add the same private member more than once");
      e instanceof WeakSet ? e.add(t) : e.set(t, n);
    },
    I = (t, e, n, r) => (
      q(t, e, "write to private field"), r ? r.call(t, n) : e.set(t, n), n
    ),
    _ = (t, e, n) => (q(t, e, "access private method"), n),
    T,
    O,
    C,
    W,
    A,
    k,
    g,
    x,
    J,
    ve,
    Q,
    me,
    X = { exports: {} },
    M = typeof Reflect == "object" ? Reflect : null,
    ye =
      M && typeof M.apply == "function"
        ? M.apply
        : function (e, n, r) {
            return Function.prototype.apply.call(e, n, r);
          },
    B;
  M && typeof M.ownKeys == "function"
    ? (B = M.ownKeys)
    : Object.getOwnPropertySymbols
    ? (B = function (e) {
        return Object.getOwnPropertyNames(e).concat(
          Object.getOwnPropertySymbols(e)
        );
      })
    : (B = function (e) {
        return Object.getOwnPropertyNames(e);
      });
  function ke(t) {
    console && console.warn && console.warn(t);
  }
  var Le =
    Number.isNaN ||
    function (e) {
      return e !== e;
    };
  function f() {
    f.init.call(this);
  }
  (X.exports = f),
    (X.exports.once = Se),
    (f.EventEmitter = f),
    (f.prototype._events = void 0),
    (f.prototype._eventsCount = 0),
    (f.prototype._maxListeners = void 0);
  var _e = 10;
  function D(t) {
    if (typeof t != "function")
      throw new TypeError(
        'The "listener" argument must be of type Function. Received type ' +
          typeof t
      );
  }
  Object.defineProperty(f, "defaultMaxListeners", {
    enumerable: !0,
    get: function () {
      return _e;
    },
    set: function (t) {
      if (typeof t != "number" || t < 0 || Le(t))
        throw new RangeError(
          'The value of "defaultMaxListeners" is out of range. It must be a non-negative number. Received ' +
            t +
            "."
        );
      _e = t;
    },
  }),
    (f.init = function () {
      (this._events === void 0 ||
        this._events === Object.getPrototypeOf(this)._events) &&
        ((this._events = Object.create(null)), (this._eventsCount = 0)),
        (this._maxListeners = this._maxListeners || void 0);
    }),
    (f.prototype.setMaxListeners = function (e) {
      if (typeof e != "number" || e < 0 || Le(e))
        throw new RangeError(
          'The value of "n" is out of range. It must be a non-negative number. Received ' +
            e +
            "."
        );
      return (this._maxListeners = e), this;
    });
  function ge(t) {
    return t._maxListeners === void 0 ? f.defaultMaxListeners : t._maxListeners;
  }
  (f.prototype.getMaxListeners = function () {
    return ge(this);
  }),
    (f.prototype.emit = function (e) {
      for (var n = [], r = 1; r < arguments.length; r++) n.push(arguments[r]);
      var i = e === "error",
        o = this._events;
      if (o !== void 0) i = i && o.error === void 0;
      else if (!i) return !1;
      if (i) {
        var s;
        if ((n.length > 0 && (s = n[0]), s instanceof Error)) throw s;
        var c = new Error(
          "Unhandled error." + (s ? " (" + s.message + ")" : "")
        );
        throw ((c.context = s), c);
      }
      var h = o[e];
      if (h === void 0) return !1;
      if (typeof h == "function") ye(h, this, n);
      else
        for (var N = h.length, ee = Oe(h, N), r = 0; r < N; ++r)
          ye(ee[r], this, n);
      return !0;
    });
  function we(t, e, n, r) {
    var i, o, s;
    if (
      (D(n),
      (o = t._events),
      o === void 0
        ? ((o = t._events = Object.create(null)), (t._eventsCount = 0))
        : (o.newListener !== void 0 &&
            (t.emit("newListener", e, n.listener ? n.listener : n),
            (o = t._events)),
          (s = o[e])),
      s === void 0)
    )
      (s = o[e] = n), ++t._eventsCount;
    else if (
      (typeof s == "function"
        ? (s = o[e] = r ? [n, s] : [s, n])
        : r
        ? s.unshift(n)
        : s.push(n),
      (i = ge(t)),
      i > 0 && s.length > i && !s.warned)
    ) {
      s.warned = !0;
      var c = new Error(
        "Possible EventEmitter memory leak detected. " +
          s.length +
          " " +
          String(e) +
          " listeners added. Use emitter.setMaxListeners() to increase limit"
      );
      (c.name = "MaxListenersExceededWarning"),
        (c.emitter = t),
        (c.type = e),
        (c.count = s.length),
        ke(c);
    }
    return t;
  }
  (f.prototype.addListener = function (e, n) {
    return we(this, e, n, !1);
  }),
    (f.prototype.on = f.prototype.addListener),
    (f.prototype.prependListener = function (e, n) {
      return we(this, e, n, !0);
    });
  function Ne() {
    if (!this.fired)
      return (
        this.target.removeListener(this.type, this.wrapFn),
        (this.fired = !0),
        arguments.length === 0
          ? this.listener.call(this.target)
          : this.listener.apply(this.target, arguments)
      );
  }
  function Ee(t, e, n) {
    var r = { fired: !1, wrapFn: void 0, target: t, type: e, listener: n },
      i = Ne.bind(r);
    return (i.listener = n), (r.wrapFn = i), i;
  }
  (f.prototype.once = function (e, n) {
    return D(n), this.on(e, Ee(this, e, n)), this;
  }),
    (f.prototype.prependOnceListener = function (e, n) {
      return D(n), this.prependListener(e, Ee(this, e, n)), this;
    }),
    (f.prototype.removeListener = function (e, n) {
      var r, i, o, s, c;
      if ((D(n), (i = this._events), i === void 0)) return this;
      if (((r = i[e]), r === void 0)) return this;
      if (r === n || r.listener === n)
        --this._eventsCount === 0
          ? (this._events = Object.create(null))
          : (delete i[e],
            i.removeListener &&
              this.emit("removeListener", e, r.listener || n));
      else if (typeof r != "function") {
        for (o = -1, s = r.length - 1; s >= 0; s--)
          if (r[s] === n || r[s].listener === n) {
            (c = r[s].listener), (o = s);
            break;
          }
        if (o < 0) return this;
        o === 0 ? r.shift() : Ue(r, o),
          r.length === 1 && (i[e] = r[0]),
          i.removeListener !== void 0 && this.emit("removeListener", e, c || n);
      }
      return this;
    }),
    (f.prototype.off = f.prototype.removeListener),
    (f.prototype.removeAllListeners = function (e) {
      var n, r, i;
      if (((r = this._events), r === void 0)) return this;
      if (r.removeListener === void 0)
        return (
          arguments.length === 0
            ? ((this._events = Object.create(null)), (this._eventsCount = 0))
            : r[e] !== void 0 &&
              (--this._eventsCount === 0
                ? (this._events = Object.create(null))
                : delete r[e]),
          this
        );
      if (arguments.length === 0) {
        var o = Object.keys(r),
          s;
        for (i = 0; i < o.length; ++i)
          (s = o[i]), s !== "removeListener" && this.removeAllListeners(s);
        return (
          this.removeAllListeners("removeListener"),
          (this._events = Object.create(null)),
          (this._eventsCount = 0),
          this
        );
      }
      if (((n = r[e]), typeof n == "function")) this.removeListener(e, n);
      else if (n !== void 0)
        for (i = n.length - 1; i >= 0; i--) this.removeListener(e, n[i]);
      return this;
    });
  function be(t, e, n) {
    var r = t._events;
    if (r === void 0) return [];
    var i = r[e];
    return i === void 0
      ? []
      : typeof i == "function"
      ? n
        ? [i.listener || i]
        : [i]
      : n
      ? Fe(i)
      : Oe(i, i.length);
  }
  (f.prototype.listeners = function (e) {
    return be(this, e, !0);
  }),
    (f.prototype.rawListeners = function (e) {
      return be(this, e, !1);
    }),
    (f.listenerCount = function (t, e) {
      return typeof t.listenerCount == "function"
        ? t.listenerCount(e)
        : Ie.call(t, e);
    }),
    (f.prototype.listenerCount = Ie);
  function Ie(t) {
    var e = this._events;
    if (e !== void 0) {
      var n = e[t];
      if (typeof n == "function") return 1;
      if (n !== void 0) return n.length;
    }
    return 0;
  }
  f.prototype.eventNames = function () {
    return this._eventsCount > 0 ? B(this._events) : [];
  };
  function Oe(t, e) {
    for (var n = new Array(e), r = 0; r < e; ++r) n[r] = t[r];
    return n;
  }
  function Ue(t, e) {
    for (; e + 1 < t.length; e++) t[e] = t[e + 1];
    t.pop();
  }
  function Fe(t) {
    for (var e = new Array(t.length), n = 0; n < e.length; ++n)
      e[n] = t[n].listener || t[n];
    return e;
  }
  function Se(t, e) {
    return new Promise(function (n, r) {
      function i(s) {
        t.removeListener(e, o), r(s);
      }
      function o() {
        typeof t.removeListener == "function" && t.removeListener("error", i),
          n([].slice.call(arguments));
      }
      Ce(t, e, o, { once: !0 }), e !== "error" && je(t, i, { once: !0 });
    });
  }
  function je(t, e, n) {
    typeof t.on == "function" && Ce(t, "error", e, n);
  }
  function Ce(t, e, n, r) {
    if (typeof t.on == "function") r.once ? t.once(e, n) : t.on(e, n);
    else if (typeof t.addEventListener == "function")
      t.addEventListener(e, function i(o) {
        r.once && t.removeEventListener(e, i), n(o);
      });
    else
      throw new TypeError(
        'The "emitter" argument must be of type EventEmitter. Received type ' +
          typeof t
      );
  }
  var Be = X.exports;
  const K = "pc-uploader-iframe-wrapper",
    Y = "pc-uploader-iframe";
  class De {
    constructor(e) {
      if (
        (y(this, g),
        y(this, J),
        y(this, Q),
        y(this, T, void 0),
        y(this, O, void 0),
        y(this, C, void 0),
        y(this, W, void 0),
        y(this, A, void 0),
        y(this, k, void 0),
        I(this, T, e.token),
        I(this, O, e.sideId || e.productId),
        I(this, k, e.productId ? "product" : "side"),
        I(
          this,
          C,
          e.uploaderUrl ? e.uploaderUrl : "https://upload-tool.pages.dev"
        ),
        I(this, W, new Be()),
        I(this, A, e.locale),
        !u(this, T) || !u(this, O))
      ) {
        console.warn("Missing Config Params.");
        return;
      }
      _(this, J, ve).call(this), _(this, Q, me).call(this);
    }
    get locale() {
      return u(this, A);
    }
    open() {
      let e = document.getElementById(K),
        n = document.getElementById(Y);
      const r = new URL(u(this, C));
      if (
        (r.searchParams.set("token", u(this, T)),
        u(this, k) === "side"
          ? r.searchParams.set("sideId", u(this, O))
          : u(this, k) === "product" &&
            r.searchParams.set("productId", u(this, O)),
        r.searchParams.set("parentUrl", window.location.href),
        !n || !(n instanceof HTMLIFrameElement) || !e)
      ) {
        console.warn("Can not find iframe element.");
        return;
      }
      (n.src = r.href),
        (e.style.opacity = "1"),
        (e.style.visibility = "visible"),
        _(this, g, x).call(this, "open");
    }
    close() {
      let e = document.getElementById(K);
      if (!e) {
        console.error("Can not find iframe element");
        return;
      }
      (e.style.opacity = "0"), (e.style.visibility = "hidden");
    }
    on(e, n) {
      return u(this, W).on(e, n), this;
    }
  }
  (T = new WeakMap()),
    (O = new WeakMap()),
    (C = new WeakMap()),
    (W = new WeakMap()),
    (A = new WeakMap()),
    (k = new WeakMap()),
    (g = new WeakSet()),
    (x = function (t, ...e) {
      u(this, W).emit(t, ...e);
    }),
    (J = new WeakSet()),
    (ve = function () {
      let t = document.createElement("div");
      (t.id = K),
        (t.style.cssText =
          "position:fixed;top:0;left:0;width:100vw;height:100vh;opacity:0;visibility:hidden;z-index:99999");
      let e = document.createElement("iframe");
      (e.id = Y),
        (e.width = "100%"),
        (e.height = "100%"),
        (e.style.borderWidth = "0"),
        t.appendChild(e),
        document.body.appendChild(t);
    }),
    (Q = new WeakSet()),
    (me = function () {
      let t = document.getElementById(K);
      window.addEventListener(
        "message",
        (e) => {
          var n;
          const r = new URL(e.origin),
            i = new URL(u(this, C));
          if (r.host === i.host) {
            e.data.uploaderEvent === "close" &&
              t &&
              ((t.style.opacity = "0"),
              (t.style.visibility = "hidden"),
              _(this, g, x).call(this, "close")),
              e.data.uploaderEvent === "upload-success" &&
                _(this, g, x).call(this, "upload-success", e.data.data),
              e.data.uploaderEvent === "upload-error" &&
                _(this, g, x).call(this, "upload-error", e.data.error);
            const o = u(this, A),
              s = document.getElementById(Y);
            s &&
              s instanceof HTMLIFrameElement &&
              (_(this, g, x).call(this, "onload"),
              o &&
                e.data.uploaderEvent === "loaded" &&
                e.data.finished &&
                (console.log("test"),
                s.focus(),
                (n = s.contentWindow) == null ||
                  n.postMessage({ locale: o }, u(this, C))));
          }
        },
        !1
      );
    });
  class Ke {
    constructor() {
      te(this, "initDesignTool", (e) => new Ae(e));
      te(this, "initUploader", (e) => new De(e));
    }
  }
  return Ke;
})();

export default PrintcartDesigner;
