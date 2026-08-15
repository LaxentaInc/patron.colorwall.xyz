// ensure all three.js classes and constants are available on window scope for standalone execution
if (typeof window !== "undefined" && window.THREE) {
  Object.assign(window, window.THREE);
}
// legacy three.js color space and depth packing constants required by postprocessing and texture loaders
const LinearEncoding = (typeof window !== "undefined" && window.THREE && window.THREE.LinearEncoding) || 3000;
const sRGBEncoding = (typeof window !== "undefined" && window.THREE && window.THREE.sRGBEncoding) || 3001;
const BasicDepthPacking = (typeof window !== "undefined" && window.THREE && window.THREE.BasicDepthPacking) || 3200;
const RGBADepthPacking = (typeof window !== "undefined" && window.THREE && window.THREE.RGBADepthPacking) || 3201;

// core mathematical utility helper consumed by animation and scene coordinators across the engine
class MathHelper {
  clamp(e, t, i) {
    return Math.max(t, Math.min(i, e));
  }
  saturate(e) {
    return this.clamp(e, 0, 1);
  }
  mix(e, t, i) {
    return e * (1 - i) + t * i;
  }
  fit(e, t, i, n, r, o) {
    let s = (e - t) / (i - t);
    return (s = this.saturate(s)), o && (s = o(s)), this.mix(n, r, s);
  }
  unClampedFit(e, t, i, n, r, o) {
    let s = (e - t) / (i - t);
    return o && (s = o(s)), this.mix(n, r, s);
  }
  smoothstep(e, t, i) {
    let n = this.saturate((i - e) / (t - e));
    return n * n * (3 - 2 * n);
  }
  cubicBezier(e, t, i, n, r) {
    let o = 1 - r;
    return (
      o * o * o * e +
      3 * o * o * r * t +
      3 * o * r * r * i +
      r * r * r * n
    );
  }
  powerTwoCeiling(e) {
    return Math.pow(2, Math.ceil(Math.log(e) / Math.LN2));
  }
  powerTwoCeilingBase(e) {
    return Math.ceil(Math.log(e) / Math.LN2);
  }
}
const math = new MathHelper();
if (typeof window !== "undefined") {
  window.math = math;
}
const userAgent = typeof navigator !== "undefined" ? (navigator.userAgent || "").toLowerCase() : "";
const detectUA = (function() {
  const isMobile = /iphone|ipad|ipod|android|blackberry|mini|windows\sce|palm/i.test(userAgent);
  const isTablet = /ipad|tablet|(android(?!.*mobile))/i.test(userAgent);
  const isiOS = /iphone|ipad|ipod/i.test(userAgent);
  const isAndroid = /android/i.test(userAgent);
  const isMacOS = /macintosh|mac os x/i.test(userAgent);
  const isWindows = { version: /windows nt/i.test(userAgent) ? "10" : null };
  return {
    isMobile,
    isTablet,
    isDesktop: !isMobile && !isTablet,
    isiOS,
    isAndroid,
    isMacOS,
    isWindows
  };
})();
const browserName = (function() {
  if (userAgent.indexOf("edg") !== -1) return "Microsoft Edge";
  if (userAgent.indexOf("opr") !== -1 || userAgent.indexOf("opera") !== -1) return "Opera";
  if (userAgent.indexOf("chrome") !== -1) return "Chrome";
  if (userAgent.indexOf("safari") !== -1) return "Safari";
  if (userAgent.indexOf("firefox") !== -1) return "Firefox";
  if (userAgent.indexOf("trident") !== -1 || userAgent.indexOf("msie") !== -1) return "Internet Explorer";
  return "Chrome";
})();

class Browser {
  isMobile = detectUA.isMobile || detectUA.isTablet;
  isDesktop = detectUA.isDesktop;
  device = this.isMobile ? "mobile" : "desktop";
  isAndroid = !!detectUA.isAndroid;
  isIOS = !!detectUA.isiOS;
  isMacOS = !!detectUA.isMacOS;
  isWindows = detectUA.isWindows.version !== null;
  isLinux = userAgent.indexOf("linux") != -1;
  ua = userAgent;
  isEdge = browserName === "Microsoft Edge";
  isIE = browserName === "Internet Explorer";
  isFirefox = browserName === "Firefox";
  isChrome = browserName === "Chrome";
  isOpera = browserName === "Opera";
  isSafari = browserName === "Safari";
  isSupportMSAA = !userAgent.match("version/15.4 ");
  isRetina = typeof window !== "undefined" && window.devicePixelRatio && window.devicePixelRatio >= 1.5;
  devicePixelRatio = typeof window !== "undefined" ? (window.devicePixelRatio || 1) : 1;
  cpuCoreCount = typeof navigator !== "undefined" ? (navigator.hardwareConcurrency || 1) : 1;
  baseUrl = typeof document !== "undefined" ? document.location.origin : "";
  isIFrame = typeof window !== "undefined" ? (window.self !== window.top) : false;
  constructor() {}
}
const browser = new Browser(),
  fromEntries = (a, e) => [...a].reduce((t, [i, n]) => ((t[i] = n), t), {});
class Settings {
  MODEL_PATH = "/assets/";
  IMAGE_PATH = "/assets/images/";
  TEXTURE_PATH = "/assets/textures/";
  AUDIO_PATH = "/assets/audios/";
  RENDER_TARGET_FLOAT_TYPE = null;
  DATA_FLOAT_TYPE = null;
  USE_FLOAT_PACKING = !1;
  USE_WEBGL2 = !0;
  DPR = Math.min(1.5, browser.devicePixelRatio) || 1;
  USE_PIXEL_LIMIT = !0;
  MAX_PIXEL_COUNT = 2560 * 1440;
  UP_SCALE = 1;
  JUMP_SECTION = "";
  JUMP_OFFSET = 0;
  CROSS_ORIGINS = { "https://example.com/": "anonymous" };
  IS_DEV = !1;
  LOG = !1;
  SKIP_ANIMATION = !1;
  LOOK_DEV_MODE = !1;
  HIDE_UI = !1;
  constructor() {
    this.override(this.parseQuery(window.location.search, !0));
  }
  parseQuery(e, t) {
    return fromEntries(new URLSearchParams(e, t));
  }
  override(e) {
    for (const t in e)
      if (this[t] !== void 0) {
        const i = e[t].toString();
        typeof this[t] == "boolean"
          ? (this[t] = !(i === "0" || i === !1))
          : typeof this[t] == "number"
          ? (this[t] = parseFloat(i))
          : typeof this[t] == "string" && (this[t] = i);
      }
  }
}
const settings = new Settings();
function getDefaultExportFromCjs(a) {
  return a && a.__esModule && Object.prototype.hasOwnProperty.call(a, "default")
    ? a.default
    : a;
}
var minSignal$1 = { exports: {} };
(function (a) {
  (function (e) {
    function t() {
      (this._listeners = []), (this.dispatchCount = 0);
    }
    var i = t.prototype;
    (i.add = s), (i.addOnce = l), (i.remove = u), (i.dispatch = h);
    var n = "Callback function is missing!",
      r = Array.prototype.slice;
    function o(d) {
      d.sort(function (c, m) {
        return (c = c.p), (m = m.p), m < c ? 1 : m > c ? -1 : 0;
      });
    }
    function s(d, c, m, _) {
      if (!d) throw n;
      m = m || 0;
      for (var f = this._listeners, p, g, w, x = f.length; x--; )
        if (((p = f[x]), p.f === d && p.c === c)) return !1;
      typeof m == "function" && ((g = m), (m = _), (w = 4)),
        f.unshift({
          f: d,
          c,
          p: m,
          r: g || d,
          a: r.call(arguments, w || 3),
          j: 0,
        }),
        o(f);
    }
    function l(d, c, m, _) {
      if (!d) throw n;
      var f = this,
        p = function () {
          return f.remove.call(f, d, c), d.apply(c, r.call(arguments, 0));
        };
      (_ = r.call(arguments, 0)),
        _.length === 1 && _.push(e),
        _.splice(2, 0, p),
        s.apply(f, _);
    }
    function u(d, c) {
      if (!d) return (this._listeners.length = 0), !0;
      for (var m = this._listeners, _, f = m.length; f--; )
        if (((_ = m[f]), _.f === d && (!c || _.c === c)))
          return (_.j = 0), m.splice(f, 1), !0;
      return !1;
    }
    function h(d) {
      (d = r.call(arguments, 0)), this.dispatchCount++;
      for (
        var c = this.dispatchCount, m = this._listeners, _, f, p = m.length;
        p--;

      )
        if (
          ((_ = m[p]),
          _ && _.j < c && ((_.j = c), _.r.apply(_.c, _.a.concat(d)) === !1))
        ) {
          f = _;
          break;
        }
      for (m = this._listeners, p = m.length; p--; ) m[p].j = 0;
      return f;
    }
    a.exports = t;
  })();
})(minSignal$1);
var minSignalExports$1 = minSignal$1.exports;
const MinSignal$2 = getDefaultExportFromCjs(minSignalExports$1);
var quickLoader$b = { exports: {} },
  minSignal = { exports: {} };
(function (a) {
  (function (e) {
    function t() {
      (this._listeners = []), (this.dispatchCount = 0);
    }
    var i = t.prototype;
    (i.add = s), (i.addOnce = l), (i.remove = u), (i.dispatch = h);
    var n = "Callback function is missing!",
      r = Array.prototype.slice;
    function o(d) {
      d.sort(function (c, m) {
        return (c = c.p), (m = m.p), m < c ? 1 : c > m ? -1 : 0;
      });
    }
    function s(d, c, m, _) {
      if (!d) throw n;
      m = m || 0;
      for (var f = this._listeners, p, g, w, x = f.length; x--; )
        if (((p = f[x]), p.f === d && p.c === c)) return !1;
      typeof m == "function" && ((g = m), (m = _), (w = 4)),
        f.unshift({
          f: d,
          c,
          p: m,
          r: g || d,
          a: r.call(arguments, w || 3),
          j: 0,
        }),
        o(f);
    }
    function l(d, c, m, _) {
      if (!d) throw n;
      var f = this,
        p = function () {
          return f.remove.call(f, d, c), d.apply(c, r.call(arguments, 0));
        };
      (_ = r.call(arguments, 0)),
        _.length === 1 && _.push(e),
        _.splice(2, 0, p),
        s.apply(f, _);
    }
    function u(d, c) {
      if (!d) return (this._listeners.length = 0), !0;
      for (var m = this._listeners, _, f = m.length; f--; )
        if (((_ = m[f]), _.f === d && (!c || _.c === c)))
          return (_.j = 0), m.splice(f, 1), !0;
      return !1;
    }
    function h(d) {
      (d = r.call(arguments, 0)), this.dispatchCount++;
      for (
        var c = this.dispatchCount, m = this._listeners, _, f, p = m.length;
        p--;

      )
        if (
          ((_ = m[p]),
          _ && _.j < c && ((_.j = c), _.r.apply(_.c, _.a.concat(d)) === !1))
        ) {
          f = _;
          break;
        }
      for (m = this._listeners, p = m.length; p--; ) m[p].j = 0;
      return f;
    }
    a.exports = t;
  })();
})(minSignal);
var minSignalExports = minSignal.exports,
  MinSignal$1 = minSignalExports,
  undef$3;
function QuickLoader() {
  (this.isLoading = !1),
    (this.totalWeight = 0),
    (this.loadedWeight = 0),
    (this.itemUrls = {}),
    (this.itemList = []),
    (this.loadingSignal = new MinSignal$1()),
    (this.crossOriginMap = {}),
    (this.queue = []),
    (this.activeItems = []),
    (this.maxActiveItems = 4);
}
var _p$9 = QuickLoader.prototype;
_p$9.addChunk = addChunk;
_p$9.setCrossOrigin = setCrossOrigin;
_p$9.add = add;
_p$9.load = load$7;
_p$9.start = start$1;
_p$9.loadNext = loadNext;
_p$9._createItem = _createItem;
_p$9._onLoading = _onLoading$1;
_p$9.VERSION = "0.1.17";
_p$9.register = register;
_p$9.retrieveAll = retrieveAll;
_p$9.retrieve = retrieve;
_p$9.testExtensions = testExtensions;
_p$9.create = create;
_p$9.check = check;
var addedItems = (_p$9.addedItems = {}),
  loadedItems = (_p$9.loadedItems = {}),
  ITEM_CLASS_LIST = (_p$9.ITEM_CLASS_LIST = []),
  ITEM_CLASSES = (_p$9.ITEM_CLASSES = {});
quickLoader$b.exports = create();
function setCrossOrigin(a, e) {
  this.crossOriginMap[a] = e;
}
function addChunk(a, e) {
  var t,
    i,
    n,
    r,
    o,
    s = retrieveAll(a, e);
  for (t = 0, n = s.length; t < n; t++)
    for (o = s[t], i = 0, r = o.items.length; i < r; i++)
      this.add(o.items[i], { type: o.type });
  return s;
}
function add(a, e) {
  var t = addedItems[a];
  return (
    t || (t = this._createItem(a, e && e.type ? e.type : retrieve(a).type, e)),
    e && e.onLoad && t.onLoaded.addOnce(e.onLoad),
    this.itemUrls[a] ||
      ((this.itemUrls[a] = t),
      this.itemList.push(t),
      (this.totalWeight += t.weight)),
    t
  );
}
function load$7(a, e) {
  var t = addedItems[a];
  return (
    t || (t = this._createItem(a, e && e.type ? e.type : retrieve(a).type, e)),
    e && e.onLoad && t.onLoaded.addOnce(e.onLoad),
    loadedItems[a] ? t.dispatch() : t.isStartLoaded || t.load(),
    t
  );
}
function start$1(a) {
  a && this.loadingSignal.add(a), (this.isLoading = !0);
  var e = this.itemList.length;
  if (e) {
    var t = this.itemList.splice(0, this.itemList.length),
      i;
    for (var n in this.itemUrls) delete this.itemUrls[n];
    for (var r = 0; r < e; r++) {
      i = t[r];
      var o = !!loadedItems[i.url];
      i.onLoaded.addOnce(_onItemLoad, this, -1024, i, t, o),
        i.hasLoading &&
          i.loadingSignal.add(_onLoading$1, this, -1024, i, t, undef$3),
        o ? i.dispatch(_onItemLoad) : i.isStartLoaded || this.queue.push(i);
    }
    this.queue.length && this.loadNext();
  } else _onItemLoad.call(this, undef$3, this.itemList);
}
function loadNext() {
  if (this.queue.length && this.activeItems.length < this.maxActiveItems) {
    var a = this.queue.shift();
    this.activeItems.push(a), this.loadNext(), a.load();
  }
}
function _onLoading$1(a, e, t, i, n) {
  (a && !a.isLoaded && a.getCombinedPercent(i) === 1) ||
    (n === undef$3 &&
      ((this.loadedWeight = _getLoadedWeight(e)),
      (n = this.loadedWeight / this.totalWeight)),
    (t = t || this.loadingSignal),
    t.dispatch(n, a));
}
function _getLoadedWeight(a) {
  for (var e = 0, t = 0, i = a.length; t < i; t++) e += a[t].loadedWeight;
  return e;
}
function _onItemLoad(a, e, t) {
  if (((this.loadedWeight = _getLoadedWeight(e)), !t)) {
    for (var i = this.activeItems, n = i.length; n--; )
      if (i[n] === a) {
        i.splice(n, 1);
        break;
      }
  }
  var r = this.loadingSignal;
  this.loadedWeight === this.totalWeight
    ? ((this.isLoading = !1),
      (this.loadedWeight = 0),
      (this.totalWeight = 0),
      (this.loadingSignal = new MinSignal$1()),
      this._onLoading(a, e, r, 1, 1),
      a && a.noCache && _removeItemCache(a))
    : (this._onLoading(a, e, r, 1, this.loadedWeight / this.totalWeight),
      a && a.noCache && _removeItemCache(a),
      t || this.loadNext());
}
function _removeItemCache(a) {
  var e = a.url;
  (a.content = undef$3), (addedItems[e] = undef$3), (loadedItems[e] = undef$3);
}
function _createItem(a, e, t) {
  if (((t = t || {}), !t.crossOrigin)) {
    for (var i in this.crossOriginMap)
      if (a.indexOf(i) === 0) {
        t.crossOrigin = this.crossOriginMap[i];
        break;
      }
  }
  return new ITEM_CLASSES[e](a, t);
}
function register(a) {
  ITEM_CLASSES[a.type] || (ITEM_CLASS_LIST.push(a), (ITEM_CLASSES[a.type] = a));
}
function retrieveAll(a, e) {
  var t,
    i,
    n = a.length,
    r = [];
  if (n && typeof a != "string")
    for (t = 0; t < n; t++) (i = retrieve(a[t], e)), i && (r = r.concat(i));
  else (i = retrieve(a, e)), i && (r = r.concat(i));
  return r;
}
function retrieve(a, e) {
  var t, i, n, r, o;
  if (e) (r = ITEM_CLASSES[e]), (n = r.retrieve(a));
  else
    for (t = 0, i = ITEM_CLASS_LIST.length; t < i; t++) {
      if (((r = ITEM_CLASS_LIST[t]), (o = r.type), typeof a == "string")) {
        if (testExtensions(a, r)) {
          n = [a];
          break;
        }
      } else if (
        ((n = r.retrieve(a)),
        n && n.length && typeof n[0] == "string" && testExtensions(n[0], r))
      )
        break;
      (n = undef$3), (o = undef$3);
    }
  if (n) return { type: e || o, items: n };
}
function testExtensions(a, e) {
  if (a) {
    for (var t = _getExtension(a), i = e.extensions, n = i.length; n--; )
      if (t === i[n]) return !0;
    return !1;
  }
}
function _getExtension(a) {
  return a.split(".").pop().split(/#|\?/)[0];
}
function create() {
  return new QuickLoader();
}
function check() {
  var a = [],
    e = [];
  for (var t in addedItems) a.push(t), loadedItems[t] || e.push(addedItems[t]);
  console.log({ added: a, notLoaded: e });
}
var quickLoaderExports = quickLoader$b.exports,
  MinSignal = minSignalExports,
  quickLoader$a = quickLoaderExports;
function AbstractItem$6(a, e) {
  if (a) {
    (this.url = a),
      (this.loadedWeight = 0),
      (this.weight = 1),
      (this.postPercent = 0);
    for (var t in e) this[t] = e[t];
    this.type || (this.type = this.constructor.type),
      this.hasLoading &&
        ((this.loadingSignal = new MinSignal()),
        this.loadingSignal.add(_onLoading, this),
        this.onLoading && this.loadingSignal.add(this.onLoading)),
      this.onPost
        ? ((this.onPostLoadingSignal = new MinSignal()),
          this.onPostLoadingSignal.add(this._onPostLoading, this),
          (this.postWeightRatio = this.postWeightRatio || 0.1))
        : (this.postWeightRatio = 0);
    var i = this;
    (this.boundOnLoad = function () {
      i._onLoad();
    }),
      (this.onLoaded = new MinSignal()),
      (quickLoader$a.addedItems[a] = this);
  }
}
var AbstractItem_1 = AbstractItem$6,
  _p$8 = AbstractItem$6.prototype;
_p$8.load = load$6;
_p$8._onLoad = _onLoad$6;
_p$8._onLoading = _onLoading;
_p$8._onPostLoading = _onPostLoading;
_p$8._onLoadComplete = _onLoadComplete;
_p$8.getCombinedPercent = getCombinedPercent;
_p$8.dispatch = dispatch;
AbstractItem$6.extensions = [];
AbstractItem$6.retrieve = function () {
  return !1;
};
function load$6() {
  this.isStartLoaded = !0;
}
function _onLoad$6() {
  this.onPost
    ? this.onPost.call(this, this.content, this.onPostLoadingSignal)
    : this._onLoadComplete();
}
function _onPostLoading(a) {
  (this.postPercent = a),
    this.hasLoading && this.loadingSignal.dispatch(1),
    a === 1 && this._onLoadComplete();
}
function _onLoadComplete() {
  (this.isLoaded = !0),
    (this.loadedWeight = this.weight),
    (quickLoader$a.loadedItems[this.url] = this),
    this.onLoaded.dispatch(this.content);
}
function getCombinedPercent(a) {
  return (
    a * (1 - this.postWeightRatio) + this.postWeightRatio * this.postPercent
  );
}
function _onLoading(a) {
  this.loadedWeight = this.weight * this.getCombinedPercent(a);
}
function dispatch() {
  this.hasLoading && this.loadingSignal.remove(),
    this.onLoaded.dispatch(this.content);
}
var AbstractItem$5 = AbstractItem_1,
  quickLoader$9 = quickLoaderExports;
function __generateFuncName() {
  return "_jsonp" + new Date().getTime() + ~~(Math.random() * 1e8);
}
function JSONPItem(a) {
  a && _super$7.constructor.apply(this, arguments);
}
JSONPItem.type = "jsonp";
JSONPItem.extensions = [];
quickLoader$9.register(JSONPItem);
JSONPItem.retrieve = function (a) {
  return typeof a == "string" && a.indexOf("=") > -1 ? [a] : !1;
};
var _super$7 = AbstractItem$5.prototype,
  _p$7 = (JSONPItem.prototype = new AbstractItem$5());
_p$7.constructor = JSONPItem;
_p$7.load = load$5;
function load$5(a) {
  _super$7.load.apply(this, arguments);
  var e = this,
    t = this.url.lastIndexOf("=") + 1,
    i = this.url.substr(0, t),
    n = this.url.substr(t);
  n.length === 0
    ? ((n = __generateFuncName()), (this.jsonpCallback = a))
    : (this.jsonpCallback = this.jsonpCallback || window[n]),
    (window[n] = function (o) {
      r.parentNode && r.parentNode.removeChild(r), (e.content = o), e._onLoad();
    });
  var r = document.createElement("script");
  (r.type = "text/javascript"),
    (r.src = i + n),
    document.getElementsByTagName("head")[0].appendChild(r);
}
var AbstractItem$4 = AbstractItem_1,
  quickLoader$8 = quickLoaderExports,
  undef$2,
  IS_SUPPORT_XML_HTTP_REQUEST = !!window.XMLHttpRequest;
function XHRItem$2(a) {
  a &&
    (_super$6.constructor.apply(this, arguments),
    (this.responseType = this.responseType || ""),
    (this.method = this.method || "GET"));
}
var XHRItem_1 = XHRItem$2;
XHRItem$2.type = "xhr";
XHRItem$2.extensions = [];
quickLoader$8.register(XHRItem$2);
XHRItem$2.retrieve = function () {
  return !1;
};
var _super$6 = AbstractItem$4.prototype,
  _p$6 = (XHRItem$2.prototype = new AbstractItem$4());
_p$6.constructor = XHRItem$2;
_p$6.load = load$4;
_p$6._onXmlHttpChange = _onXmlHttpChange;
_p$6._onXmlHttpProgress = _onXmlHttpProgress;
_p$6._onLoad = _onLoad$5;
function load$4() {
  _super$6.load.apply(this, arguments);
  var a = this,
    e;
  IS_SUPPORT_XML_HTTP_REQUEST
    ? (e = this.xmlhttp = new XMLHttpRequest())
    : (e = this.xmlhttp = new ActiveXObject("Microsoft.XMLHTTP")),
    this.hasLoading &&
      (e.onprogress = function (t) {
        a._onXmlHttpProgress(t);
      }),
    (e.onreadystatechange = function () {
      a._onXmlHttpChange();
    }),
    e.open(this.method, this.url, !0),
    (this.xmlhttp.responseType = this.responseType),
    IS_SUPPORT_XML_HTTP_REQUEST ? e.send(null) : e.send();
}
function _onXmlHttpProgress(a) {
  this.loadingSignal.dispatch(a.loaded / a.total);
}
function _onXmlHttpChange() {
  this.xmlhttp.readyState === 4 &&
    this.xmlhttp.status === 200 &&
    this._onLoad(this.xmlhttp);
}
function _onLoad$5() {
  this.content || (this.content = this.xmlhttp.response),
    (this.xmlhttp = undef$2),
    _super$6._onLoad.call(this);
}
var XHRItem$1 = XHRItem_1,
  quickLoader$7 = quickLoaderExports;
function TextItem$1(a, e) {
  a && ((e.responseType = "text"), _super$5.constructor.apply(this, arguments));
}
var TextItem_1 = TextItem$1;
TextItem$1.type = "text";
TextItem$1.extensions = ["html", "txt", "svg"];
quickLoader$7.register(TextItem$1);
TextItem$1.retrieve = function () {
  return !1;
};
var _super$5 = XHRItem$1.prototype,
  _p$5 = (TextItem$1.prototype = new XHRItem$1());
_p$5.constructor = TextItem$1;
_p$5._onLoad = _onLoad$4;
function _onLoad$4() {
  this.content || (this.content = this.xmlhttp.responseText),
    _super$5._onLoad.apply(this, arguments);
}
var TextItem = TextItem_1,
  quickLoader$6 = quickLoaderExports;
function JSONItem(a) {
  a && _super$4.constructor.apply(this, arguments);
}
JSONItem.type = "json";
JSONItem.extensions = ["json"];
quickLoader$6.register(JSONItem);
JSONItem.retrieve = function () {
  return !1;
};
var _super$4 = TextItem.prototype,
  _p$4 = (JSONItem.prototype = new TextItem());
_p$4.constructor = JSONItem;
_p$4._onLoad = _onLoad$3;
function _onLoad$3() {
  this.content ||
    (this.content =
      window.JSON && window.JSON.parse
        ? JSON.parse(this.xmlhttp.responseText.toString())
        : eval(this.xmlhttp.responseText.toString())),
    _super$4._onLoad.call(this);
}
var AbstractItem$3 = AbstractItem_1,
  quickLoader$5 = quickLoaderExports,
  undef$1;
function AudioItem(a, e) {
  if (a) {
    (this.loadThrough = !e || e.loadThrough === undef$1 ? !0 : e.loadThrough),
      _super$3.constructor.apply(this, arguments);
    try {
      this.content = this.content || new Audio();
    } catch {
      this.content = this.content || document.createElement("audio");
    }
    this.crossOrigin && (this.content.crossOrigin = this.crossOrigin);
  }
}
AudioItem.type = "audio";
AudioItem.extensions = ["mp3", "ogg"];
quickLoader$5.register(AudioItem);
AudioItem.retrieve = function (a) {
  return !1;
};
var _super$3 = AbstractItem$3.prototype,
  _p$3 = (AudioItem.prototype = new AbstractItem$3());
_p$3.constructor = AudioItem;
_p$3.load = load$3;
_p$3._onLoad = _onLoad$2;
function load$3() {
  _super$3.load.apply(this, arguments);
  var a = this,
    e = a.content;
  (e.src = this.url),
    this.loadThrough
      ? e.addEventListener("canplaythrough", this.boundOnLoad, !1)
      : e.addEventListener("canplay", this.boundOnLoad, !1),
    e.load();
}
function _onLoad$2() {
  this.content.removeEventListener("canplaythrough", this.boundOnLoad, !1),
    this.content.removeEventListener("canplay", this.boundOnLoad, !1),
    !this.isLoaded && _super$3._onLoad.call(this);
}
var AbstractItem$2 = AbstractItem_1,
  quickLoader$4 = quickLoaderExports,
  undef;
function VideoItem(a, e) {
  if (a) {
    (this.loadThrough = !e || e.loadThrough === undef ? !0 : e.loadThrough),
      _super$2.constructor.apply(this, arguments);
    try {
      this.content = this.content || new Video();
    } catch {
      this.content = this.content || document.createElement("video");
    }
    this.crossOrigin && (this.content.crossOrigin = this.crossOrigin);
  }
}
VideoItem.type = "video";
VideoItem.extensions = ["mp4", "webm", "ogv"];
quickLoader$4.register(VideoItem);
VideoItem.retrieve = function (a) {
  return !1;
};
var _super$2 = AbstractItem$2.prototype,
  _p$2 = (VideoItem.prototype = new AbstractItem$2());
_p$2.constructor = VideoItem;
_p$2.load = load$2;
_p$2._onLoad = _onLoad$1;
function load$2() {
  _super$2.load.apply(this, arguments);
  var a = this.content;
  (a.preload = "auto"),
    (a.src = this.url),
    this.loadThrough
      ? a.addEventListener("canplaythrough", this.boundOnLoad, !1)
      : a.addEventListener("canplay", this.boundOnLoad, !1),
    a.load();
}
function _onLoad$1() {
  this.content.removeEventListener("canplaythrough", this.boundOnLoad),
    this.content.removeEventListener("canplay", this.boundOnLoad),
    !this.isLoaded && _super$2._onLoad.call(this);
}
var AbstractItem$1 = AbstractItem_1,
  quickLoader$3 = quickLoaderExports;
function AnyItem$2(a, e) {
  a &&
    (_super$1.constructor.call(this, a, e),
    !this.loadFunc &&
      console &&
      console[console.error || console.log](
        "require loadFunc in the config object.",
      ));
}
AnyItem$2.type = "any";
AnyItem$2.extensions = [];
quickLoader$3.register(AnyItem$2);
AnyItem$2.retrieve = function () {
  return !1;
};
var _super$1 = AbstractItem$1.prototype,
  _p$1 = (AnyItem$2.prototype = new AbstractItem$1());
_p$1.constructor = AnyItem$2;
_p$1.load = load$1;
function load$1() {
  var a = this;
  this.loadFunc(
    this.url,
    function (e) {
      (a.content = e), _super$1._onLoad.call(a);
    },
    this.loadingSignal,
  );
}
function computedStyle$1(a, e, t, i) {
  if (((t = window.getComputedStyle), (i = t ? t(a) : a.currentStyle), i))
    return i[
      e.replace(/-(\w)/gi, function (n, r) {
        return r.toUpperCase();
      })
    ];
}
var computedStyle_commonjs = computedStyle$1,
  AbstractItem = AbstractItem_1,
  computedStyle = computedStyle_commonjs,
  quickLoader$2 = quickLoaderExports;
function ImageItem$1(a, e) {
  a &&
    (_super.constructor.apply(this, arguments),
    (this.content = this.content || new Image()),
    this.crossOrigin && (this.content.crossOrigin = this.crossOrigin));
}
var _super = AbstractItem.prototype,
  _p = (ImageItem$1.prototype = new AbstractItem());
_p.constructor = ImageItem$1;
_p.load = load;
_p._onLoad = _onLoad;
ImageItem$1.retrieve = function (a) {
  if (a.nodeType && a.style) {
    var e = [];
    a.nodeName.toLowerCase() === "img" &&
      a.src.indexOf(";") < 0 &&
      e.push(a.src),
      computedStyle(a, "background-image").replace(
        /s?url\(\s*?['"]?([^;]*?)['"]?\s*?\)/g,
        function (i, n) {
          e.push(n);
        },
      );
    for (var t = e.length; t--; ) _isNotData(e[t]) || e.splice(t, 1);
    return e.length ? e : !1;
  } else return typeof a == "string" ? [a] : !1;
};
ImageItem$1.type = "image";
ImageItem$1.extensions = ["jpg", "gif", "png"];
quickLoader$2.register(ImageItem$1);
function load() {
  _super.load.apply(this, arguments);
  var a = this.content;
  (a.onload = this.boundOnLoad), (a.src = this.url);
}
function _onLoad() {
  delete this.content.onload,
    (this.width = this.content.width),
    (this.height = this.content.height),
    _super._onLoad.call(this);
}
function _isNotData(a) {
  return a.indexOf("data:") !== 0;
}
var quickLoader = quickLoaderExports;
const quickLoader$1 = getDefaultExportFromCjs(quickLoader);
new Color();
class Properties {
  win = window;
  isSecureConnection = window.location.protocol === "https:";
  isResizing = !1;
  loader = quickLoader$1.create();
  percent = 0;
  easedPercent = 0;
  _isSupportedDevice = !1;
  _isSupportedBrowser = !1;
  _isSupportedWebGL = !1;
  _isSupportedMobileOrientation = !1;
  _isSupported = !1;
  time = 0;
  deltaTime = 0;
  hasInitialized = !1;
  hasStarted = !1;
  startTime = 0;
  viewportWidth = 0;
  viewportHeight = 0;
  width = 0;
  height = 0;
  renderer = null;
  scene = null;
  camera = null;
  postprocessing = null;
  resolution = new Vector2();
  viewportResolution = new Vector2();
  bgColor = new Color();
  debugAlpha = !1;
  skipProfileUpdate = !1;
  canvas = null;
  gl = null;
  webglOpts = { antialias: !1, alpha: !1, xrCompatible: !0 };
  sharedUniforms = {
    u_cameraDirection: { value: this.cameraDirection },
    u_time: { value: 0 },
    u_deltaTime: { value: 1 },
    u_resolution: { value: this.resolution },
    u_viewportResolution: { value: this.viewportResolution },
    u_bgColor: { value: this.bgColor },
  };
  initCallFuncList = [];
  cameraLookX = 0;
  cameraLookY = 0;
  cameraDistance = 5;
  cameraLookStrength = 0.01;
  cameraLookEaseDamp = 0.1;
  cameraShakePositionStrength = 0.5;
  cameraShakePositionSpeed = 0.15;
  cameraShakeRotationStrength = 0.003;
  cameraShakeRotationSpeed = 0.3;
  bgColorHex = "#bbbbff";
  opacity = 1;
  isMobileLayout = !1;
  exporterSignal = new MinSignal$2();
  onFirstClicked = new MinSignal$2();
}
const properties = new Properties();
var _populated = !1,
  _ie,
  _firefox,
  _opera,
  _webkit,
  _chrome,
  _ie_real_version,
  _osx,
  _windows,
  _linux,
  _android,
  _win64,
  _iphone,
  _ipad,
  _native,
  _mobile;
function _populate() {
  if (!_populated) {
    _populated = !0;
    var a = navigator.userAgent,
      e =
        /(?:MSIE.(\d+\.\d+))|(?:(?:Firefox|GranParadiso|Iceweasel).(\d+\.\d+))|(?:Opera(?:.+Version.|.)(\d+\.\d+))|(?:AppleWebKit.(\d+(?:\.\d+)?))|(?:Trident\/\d+\.\d+.*rv:(\d+\.\d+))/.exec(
          a,
        ),
      t = /(Mac OS X)|(Windows)|(Linux)/.exec(a);
    if (
      ((_iphone = /\b(iPhone|iP[ao]d)/.exec(a)),
      (_ipad = /\b(iP[ao]d)/.exec(a)),
      (_android = /Android/i.exec(a)),
      (_native = /FBAN\/\w+;/i.exec(a)),
      (_mobile = /Mobile/i.exec(a)),
      (_win64 = !!/Win64/.exec(a)),
      e)
    ) {
      (_ie = e[1] ? parseFloat(e[1]) : e[5] ? parseFloat(e[5]) : NaN),
        _ie &&
          document &&
          document.documentMode &&
          (_ie = document.documentMode);
      var i = /(?:Trident\/(\d+.\d+))/.exec(a);
      (_ie_real_version = i ? parseFloat(i[1]) + 4 : _ie),
        (_firefox = e[2] ? parseFloat(e[2]) : NaN),
        (_opera = e[3] ? parseFloat(e[3]) : NaN),
        (_webkit = e[4] ? parseFloat(e[4]) : NaN),
        _webkit
          ? ((e = /(?:Chrome\/(\d+\.\d+))/.exec(a)),
            (_chrome = e && e[1] ? parseFloat(e[1]) : NaN))
          : (_chrome = NaN);
    } else _ie = _firefox = _opera = _chrome = _webkit = NaN;
    if (t) {
      if (t[1]) {
        var n = /(?:Mac OS X (\d+(?:[._]\d+)?))/.exec(a);
        _osx = n ? parseFloat(n[1].replace("_", ".")) : !0;
      } else _osx = !1;
      (_windows = !!t[2]), (_linux = !!t[3]);
    } else _osx = _windows = _linux = !1;
  }
}
var UserAgent_DEPRECATED$1 = {
    ie: function () {
      return _populate() || _ie;
    },
    ieCompatibilityMode: function () {
      return _populate() || _ie_real_version > _ie;
    },
    ie64: function () {
      return UserAgent_DEPRECATED$1.ie() && _win64;
    },
    firefox: function () {
      return _populate() || _firefox;
    },
    opera: function () {
      return _populate() || _opera;
    },
    webkit: function () {
      return _populate() || _webkit;
    },
    safari: function () {
      return UserAgent_DEPRECATED$1.webkit();
    },
    chrome: function () {
      return _populate() || _chrome;
    },
    windows: function () {
      return _populate() || _windows;
    },
    osx: function () {
      return _populate() || _osx;
    },
    linux: function () {
      return _populate() || _linux;
    },
    iphone: function () {
      return _populate() || _iphone;
    },
    mobile: function () {
      return _populate() || _iphone || _ipad || _android || _mobile;
    },
    nativeApp: function () {
      return _populate() || _native;
    },
    android: function () {
      return _populate() || _android;
    },
    ipad: function () {
      return _populate() || _ipad;
    },
  },
  UserAgent_DEPRECATED_1 = UserAgent_DEPRECATED$1,
  canUseDOM = !!(
    typeof window < "u" &&
    window.document &&
    window.document.createElement
  ),
  ExecutionEnvironment$1 = { canUseDOM },
  ExecutionEnvironment_1 = ExecutionEnvironment$1,
  ExecutionEnvironment = ExecutionEnvironment_1,
  useHasFeature;
ExecutionEnvironment.canUseDOM &&
  (useHasFeature =
    document.implementation &&
    document.implementation.hasFeature &&
    document.implementation.hasFeature("", "") !== !0);
/**
 * Checks if an event is supported in the current execution environment.
 *
 * NOTE: This will not work correctly for non-generic events such as `change`,
 * `reset`, `load`, `error`, and `select`.
 *
 * Borrows from Modernizr.
 *
 * @param {string} eventNameSuffix Event name, e.g. "click".
 * @param {?boolean} capture Check if the capture phase is supported.
 * @return {boolean} True if the event is supported.
 * @internal
 * @license Modernizr 3.0.0pre (Custom Build) | MIT
 */ function isEventSupported$1(a, e) {
  if (
    !ExecutionEnvironment.canUseDOM ||
    (e && !("addEventListener" in document))
  )
    return !1;
  var t = "on" + a,
    i = t in document;
  if (!i) {
    var n = document.createElement("div");
    n.setAttribute(t, "return;"), (i = typeof n[t] == "function");
  }
  return (
    !i &&
      useHasFeature &&
      a === "wheel" &&
      (i = document.implementation.hasFeature("Events.wheel", "3.0")),
    i
  );
}
var isEventSupported_1 = isEventSupported$1,
  UserAgent_DEPRECATED = UserAgent_DEPRECATED_1,
  isEventSupported = isEventSupported_1,
  PIXEL_STEP = 10,
  LINE_HEIGHT = 40,
  PAGE_HEIGHT = 800;
function normalizeWheel$2(a) {
  var e = 0,
    t = 0,
    i = 0,
    n = 0;
  return (
    "detail" in a && (t = a.detail),
    "wheelDelta" in a && (t = -a.wheelDelta / 120),
    "wheelDeltaY" in a && (t = -a.wheelDeltaY / 120),
    "wheelDeltaX" in a && (e = -a.wheelDeltaX / 120),
    "axis" in a && a.axis === a.HORIZONTAL_AXIS && ((e = t), (t = 0)),
    (i = e * PIXEL_STEP),
    (n = t * PIXEL_STEP),
    "deltaY" in a && (n = a.deltaY),
    "deltaX" in a && (i = a.deltaX),
    (i || n) &&
      a.deltaMode &&
      (a.deltaMode == 1
        ? ((i *= LINE_HEIGHT), (n *= LINE_HEIGHT))
        : ((i *= PAGE_HEIGHT), (n *= PAGE_HEIGHT))),
    i && !e && (e = i < 1 ? -1 : 1),
    n && !t && (t = n < 1 ? -1 : 1),
    { spinX: e, spinY: t, pixelX: i, pixelY: n }
  );
}
normalizeWheel$2.getEventType = function () {
  return UserAgent_DEPRECATED.firefox()
    ? "DOMMouseScroll"
    : isEventSupported("wheel")
    ? "wheel"
    : "mousewheel";
};
var normalizeWheel_1 = normalizeWheel$2,
  normalizeWheel = normalizeWheel_1;
const normalizeWheel$1 = getDefaultExportFromCjs(normalizeWheel);
class SecondOrderDynamics {
  target0 = null;
  target = null;
  prevTarget = null;
  value = null;
  valueVel = null;
  k1;
  k2;
  k3;
  _f;
  _z;
  _r;
  _w;
  _z;
  _d;
  _targetVelCache;
  _cache1;
  _cache2;
  _k1Stable;
  _k2Stable;
  isVector = null;
  isRobust = null;
  constructor(e, t = 1.5, i = 0.8, n = 2, r = !0) {
    (this.isRobust = r),
      (this.isVector = typeof e == "object"),
      this.setFZR(t, i, n),
      this.isVector
        ? ((this.target = e),
          (this.target0 = e.clone()),
          (this.prevTarget = e.clone()),
          (this.value = e.clone()),
          (this.valueVel = e.clone().setScalar(0)),
          (this._targetVelCache = this.valueVel.clone()),
          (this._cache1 = this.valueVel.clone()),
          (this._cache2 = this.valueVel.clone()),
          (this.update = this._updateVector),
          (this.reset = this._resetVector))
        : ((this.target0 = e),
          (this.prevTarget = e),
          (this.value = e),
          (this.valueVel = 0),
          (this.update = this._updateNumber),
          (this.reset = this._resetNumber)),
      (this.computeStableCoefficients = r
        ? this._computeRobustStableCoefficients
        : this._computeStableCoefficients);
  }
  update(e, t = 0) {}
  reset(e = null) {}
  _resetVector(e = this.target0) {
    this.valueVel.setScalar(0),
      this.prevTarget.copy(e),
      this.target.copy(e),
      this.value.copy(e);
  }
  _resetNumber(e = this.target0) {
    (this.valueVel = 0),
      (this.prevTarget = e),
      (this.target = e),
      (this.value = e);
  }
  setFZR(e = this._f, t = this._z, i = this._r) {
    let n = Math.PI * 2 * e;
    this.isRobust &&
      ((this._w = n),
      (this._z = t),
      (this._d = this._w * Math.sqrt(Math.abs(this._z * this._z - 1)))),
      (this.k1 = t / (Math.PI * e)),
      (this.k2 = 1 / (n * n)),
      (this.k3 = (i * t) / n);
  }
  _computeStableCoefficients(e) {
    (this._k1Stable = this.k1),
      (this._k2Stable = Math.max(
        this.k2,
        (1.1 * e * e) / 4 + (e * this.k1) / 2,
      ));
  }
  _computeRobustStableCoefficients(e) {
    if (this._w * e < this._z)
      (this._k1Stable = this.k1),
        (this._k2Stable = Math.max(
          this.k2,
          (e * e) / 2 + (e * this.k1) / 2,
          e * this.k1,
        ));
    else {
      let t = Math.exp(-this._z * this._w * e),
        i =
          2 *
          t *
          (this._z <= 1 ? Math.cos(e * this._d) : Math.cosh(e * this._d)),
        n = t * t,
        r = e / (1 + n - i);
      (this._k1Stable = (1 - n) * r), (this._k2Stable = e * r);
    }
  }
  _updateVector(e) {
    e > 0 &&
      (this._targetVelCache
        .copy(this.target)
        .sub(this.prevTarget)
        .divideScalar(e),
      this.prevTarget.copy(this.target),
      this.computeStableCoefficients(e),
      this.value.add(this._cache1.copy(this.valueVel).multiplyScalar(e)),
      this._cache1
        .copy(this.target)
        .add(this._targetVelCache.multiplyScalar(this.k3))
        .sub(this.value)
        .sub(this._cache2.copy(this.valueVel).multiplyScalar(this._k1Stable))
        .multiplyScalar(e / this._k2Stable),
      this.valueVel.add(this._cache1));
  }
  _updateNumber(e, t = this.target) {
    if (e > 0) {
      let i = (t - this.prevTarget) / e;
      (this.prevTarget = t),
        this.computeStableCoefficients(e),
        (this.value += this.valueVel * e),
        (this.valueVel +=
          (t + this.k3 * i - this.value - this._k1Stable * this.valueVel) *
          (e / this._k2Stable));
    }
  }
}
class Input {
  onDowned = new MinSignal$2();
  onMoved = new MinSignal$2();
  onUped = new MinSignal$2();
  onClicked = new MinSignal$2();
  onWheeled = new MinSignal$2();
  onXScrolled = new MinSignal$2();
  onYScrolled = new MinSignal$2();
  wasDown = !1;
  isDown = !1;
  downTime = 0;
  hasClicked = !1;
  hasMoved = !1;
  hadMoved = !1;
  justClicked = !1;
  mouseXY = new Vector2();
  _prevMouseXY = new Vector2();
  prevMouseXY = new Vector2();
  mousePixelXY = new Vector2();
  _prevMousePixelXY = new Vector2();
  prevMousePixelXY = new Vector2();
  downXY = new Vector2();
  downPixelXY = new Vector2();
  deltaXY = new Vector2();
  deltaPixelXY = new Vector2();
  deltaDownXY = new Vector2();
  deltaDownPixelXY = new Vector2();
  deltaDownPixelDistance = 0;
  deltaWheel = 0;
  deltaDragScrollX = 0;
  deltaScrollX = 0;
  deltaDragScrollY = 0;
  deltaScrollY = 0;
  isDragScrollingX = !1;
  isDragScrollingY = !1;
  isWheelScrolling = !1;
  dragScrollXMomentum = 0;
  dragScrollYMomentum = 0;
  dragScrollMomentumMultiplier = 10;
  canDesktopDragScroll = !1;
  needsCheckDragScrollDirection = !1;
  lastScrollXDirection = 0;
  lastScrollYDirection = 0;
  easedMouseDynamics = {};
  dragScrollDynamic;
  downThroughElems = [];
  currThroughElems = [];
  prevThroughElems = [];
  clickThroughElems = [];
  preInit() {
    const e = document.documentElement;
    e.addEventListener("mousedown", this._onDown.bind(this)),
      e.addEventListener("touchstart", this._getTouchBound(this, this._onDown)),
      e.addEventListener("mousemove", this._onMove.bind(this)),
      e.addEventListener("touchmove", this._getTouchBound(this, this._onMove)),
      e.addEventListener("mouseup", this._onUp.bind(this)),
      e.addEventListener("touchend", this._getTouchBound(this, this._onUp)),
      e.addEventListener("wheel", this._onWheel.bind(this)),
      e.addEventListener("mousewheel", this._onWheel.bind(this)),
      this.addEasedInput("default", 1.35, 0.5, 1.25),
      (this.dragScrollDynamic = this.addEasedInput("dragScroll", 2, 1, 1)),
      this.onUped.addOnce(() => {
        properties.onFirstClicked.dispatch();
      }),
      e.addEventListener("dragend", this._onUp.bind(this));
  }
  init() {}
  resize() {
    for (let e in this.easedMouseDynamics) this.easedMouseDynamics[e].reset();
  }
  update(e) {
    for (let t in this.easedMouseDynamics) {
      let i = this.easedMouseDynamics[t];
      i.target.copy(this.mouseXY), i.update(e);
    }
  }
  addEasedInput(e, t = 1.5, i = 0.8, n = 2) {
    return (this.easedMouseDynamics[e] = new SecondOrderDynamics(
      new Vector2(),
      t,
      i,
      n,
    ));
  }
  postUpdate(e) {
    (this.prevThroughElems.length = 0),
      this.prevThroughElems.concat(this.currThroughElems),
      (this.deltaWheel = 0),
      (this.deltaDragScrollX = 0),
      (this.deltaDragScrollY = 0),
      (this.deltaScrollX = 0),
      (this.deltaScrollY = 0),
      (this.dragScrollXMomentum = 0),
      (this.dragScrollYMomentum = 0),
      this.deltaXY.set(0, 0),
      this.deltaPixelXY.set(0, 0),
      this.prevMouseXY.copy(this.mouseXY),
      this.prevMousePixelXY.copy(this.mousePixelXY),
      (this.hadMoved = this.hasMoved),
      (this.wasDown = this.isDown),
      (this.justClicked = !1),
      (this.isWheelScrolling = !1);
  }
  _onWheel(e) {
    let t = normalizeWheel$1(e).pixelY;
    (t = math.clamp(t, -200, 200)),
      (this.deltaWheel += t),
      (this.deltaScrollX = this.deltaDragScrollX + this.deltaWheel),
      (this.deltaScrollY = this.deltaDragScrollY + this.deltaWheel),
      (this.lastScrollXDirection = this.deltaWheel > 0 ? 1 : -1),
      (this.lastScrollYDirection = this.deltaWheel > 0 ? 1 : -1),
      (this.isWheelScrolling = !0),
      this.onWheeled.dispatch(e.target),
      this.onXScrolled.dispatch(e.target),
      this.onYScrolled.dispatch(e.target);
  }
  _onDown(e) {
    e.button === 2 ||
      e.button === 1 ||
      ((this.isDown = !0),
      (this.downTime = +new Date()),
      (this.prevThroughElems.length = 0),
      this._setThroughElementsByEvent(e, this.downThroughElems),
      this._getInputXY(e, this.downXY),
      this._getInputPixelXY(e, this.downPixelXY),
      this._prevMouseXY.copy(this.downXY),
      this._prevMousePixelXY.copy(this.downPixelXY),
      this.deltaXY.set(0, 0),
      this.deltaPixelXY.set(0, 0),
      this._getInputXY(e, this.mouseXY),
      this.dragScrollDynamic.reset(this.mouseXY),
      (this.isDragScrollingX = !1),
      (this.isDragScrollingY = !1),
      (this.needsCheckDragScrollDirection = !1),
      this._onMove(e),
      this.onDowned.dispatch(e),
      (this.needsCheckDragScrollDirection = !0));
  }
  _onMove(e) {
    e.button === 2 ||
      e.button === 1 ||
      (this._getInputXY(e, this.mouseXY),
      this._getInputPixelXY(e, this.mousePixelXY),
      this.deltaXY.copy(this.mouseXY).sub(this._prevMouseXY),
      this.deltaPixelXY.copy(this.mousePixelXY).sub(this._prevMousePixelXY),
      this._prevMouseXY.copy(this.mouseXY),
      this._prevMousePixelXY.copy(this.mousePixelXY),
      (this.hasMoved = this.deltaXY.length() > 0),
      this.isDown &&
        (this.deltaDownXY.copy(this.mouseXY).sub(this.downXY),
        this.deltaDownPixelXY.copy(this.mousePixelXY).sub(this.downPixelXY),
        (this.deltaDownPixelDistance = this.deltaDownPixelXY.length()),
        (browser.isMobile || this.canDesktopDragScroll) &&
          (this.needsCheckDragScrollDirection &&
            ((this.isDragScrollingX =
              Math.abs(this.deltaPixelXY.x) > Math.abs(this.deltaPixelXY.y)),
            (this.isDragScrollingY = !this.isDragScrollingX),
            (this.needsCheckDragScrollDirection = !1)),
          this.isDragScrollingX &&
            ((this.deltaDragScrollX += -this.deltaPixelXY.x),
            (this.deltaScrollX += -this.deltaPixelXY.x + this.deltaWheel),
            (this.lastScrollXDirection = this.deltaDragScrollX > 0 ? 1 : -1),
            this.onXScrolled.dispatch(e.target)),
          this.isDragScrollingY &&
            ((this.deltaDragScrollY += -this.deltaPixelXY.y),
            (this.deltaScrollY += -this.deltaPixelXY.y + this.deltaWheel),
            (this.lastScrollYDirection = this.deltaDragScrollY > 0 ? 1 : -1),
            this.onYScrolled.dispatch(e.target)))),
      this._setThroughElementsByEvent(e, this.currThroughElems),
      this.onMoved.dispatch(e));
  }
  _onUp(e) {
    if (e.button === 2 || e.button === 1 || !this.isDown) return;
    const t = e.clientX - this.downPixelXY.x,
      i = e.clientY - this.downPixelXY.y;
    Math.sqrt(t * t + i * i) < 40 &&
      +new Date() - this.downTime < 300 &&
      (this._setThroughElementsByEvent(e, this.clickThroughElems),
      this._getInputXY(e, this.mouseXY),
      (this.hasClicked = !0),
      (this.justClicked = !0),
      this.onClicked.dispatch(e)),
      this.deltaDownXY.set(0, 0),
      this.deltaDownPixelXY.set(0, 0),
      (this.deltaDownPixelDistance = 0),
      (this.dragScrollXMomentum =
        this.dragScrollDynamic.valueVel.y *
        properties.viewportWidth *
        this.dragScrollMomentumMultiplier *
        properties.deltaTime),
      (this.dragScrollYMomentum =
        this.dragScrollDynamic.valueVel.y *
        properties.viewportHeight *
        this.dragScrollMomentumMultiplier *
        properties.deltaTime),
      (this.isDown = !1),
      (this.needsCheckDragScrollDirection = !1),
      this.onUped.dispatch(e);
  }
  _getTouchBound(e, t, i) {
    return function (n) {
      i && n.preventDefault && n.preventDefault(),
        t.call(e, n.changedTouches[0] || n.touches[0]);
    };
  }
  _getInputXY(e, t) {
    return (
      t.set(
        (e.clientX / properties.viewportWidth) * 2 - 1,
        1 - (e.clientY / properties.viewportHeight) * 2,
      ),
      t
    );
  }
  _getInputPixelXY(e, t) {
    t.set(e.clientX, e.clientY);
  }
  _setThroughElementsByEvent(e, t) {
    let i = e.target;
    for (t.length = 0; i.parentNode; ) t.push(i), (i = i.parentNode);
  }
  hasThroughElem(e, t) {
    let i = this[t + "ThroughElems"] || this.currThroughElems,
      n = i.length;
    for (; n--; ) if (i[n] === e) return !0;
    return !1;
  }
  hasThroughElemWithClass(e, t) {
    let i = this[t + "ThroughElems"] || this.currThroughElems,
      n = i.length;
    for (; n--; ) if (i[n].classList.contains(e)) return i[n];
    return null;
  }
}
const input = new Input();
class ScrollDomRange {
  constructor(e, t) {
    let i = Array.isArray(e);
    (this.refDomFrom = i ? e[0] : e),
      (this.refDomTo = i ? e[1] : e),
      (this.isVertical = t),
      (this.needsUpdate = !0),
      (this.forcedUpdate = !0),
      (this.screenX = 0),
      (this.screenY = 0),
      (this.ratio = 0),
      (this.screenRatio = 0),
      (this.isActive = !1),
      (this._left = 0),
      (this._right = 0),
      (this._top = 0),
      (this._bottom = 0),
      (this.left = 0),
      (this.right = 0),
      (this.top = 0),
      (this.bottom = 0),
      (this.width = 0),
      (this.height = 0),
      (this.showScreenOffset = 0),
      (this.hideScreenOffset = 0),
      (this.viewSize = 0);
  }
  update(e, t, i, n) {
    if (((n = n || this.needsUpdate), n)) {
      let s = this.refDomFrom.getBoundingClientRect(),
        l =
          this.refDomFrom === this.refDomTo
            ? s
            : this.refDomTo.getBoundingClientRect();
      (this.needsUpdate = !1),
        (this._left = s.left),
        (this._right = l.right),
        (this._top = s.top),
        (this._bottom = l.bottom),
        (this.width = l.right - s.left),
        (this.height = l.bottom - s.top),
        (this.forcedUpdate = !1),
        this.isVertical
          ? ((this._top += e), (this._bottom += e))
          : ((this._left += e), (this._right += e));
    }
    (this.left = this._left),
      (this.right = this._right),
      (this.top = this._top),
      (this.bottom = this._bottom),
      this.isVertical
        ? ((this.top += i), (this.bottom += i))
        : ((this.left += i), (this.right += i)),
      (this.screenX = this.left),
      (this.screenY = this.top);
    let r;
    this.isVertical ? (r = this.screenY -= e) : (r = this.screenX -= e);
    let o = this.isVertical ? this.height : this.width;
    (this.viewSize = o / t),
      (this.ratio = Math.min(0, math.unClampedFit(r, t, t - o, -1, 0))),
      (this.ratio += Math.max(0, math.unClampedFit(r, 0, -o, 0, 1))),
      (this.screenRatio = math.fit(r, t, -o, -1, 1)),
      (this.showScreenOffset = -(r - t) / t),
      (this.hideScreenOffset = -(r + o) / t),
      (this.isActive = this.ratio >= -1 && this.ratio <= 1);
  }
}
let instances = [];
class Tween {
  constructor(e, t, i) {
    (this.target = e),
      (this.fromProperties = {}),
      (this.toProperties = {}),
      (this.onComplete = t),
      (this.onUpdate = i),
      (this.t = 0),
      (this.duration = 0),
      (this.autoUpdate = !0),
      instances.push(this);
  }
  static autoUpdate(e) {
    for (let t = 0; t < instances.length; t++) {
      let i = instances[t];
      i.autoUpdate && i.update(e);
    }
  }
  restart() {
    (this.isActive = !0), (this.t = 0);
  }
  kill() {
    this.t = this.duration;
  }
  to(e, t, i = null) {
    let n = {};
    for (let r in t) n[r] = this.target[r];
    this.fromTo(e, n, t, i);
  }
  fromTo(e, t, i, n) {
    (this.duration = e),
      (this.ease = n),
      (this.fromProperties = t),
      (this.toProperties = i),
      this.restart(),
      this.update(0, this.duration == 0);
  }
  update(e = 0, t = !1) {
    if (this.t < this.duration || t) {
      this.t = Math.min(this.duration, this.t + e);
      let i = this.t / this.duration;
      this.ease && (i = this.ease(i));
      for (let n in this.toProperties)
        this.target[n] = math.mix(
          this.fromProperties[n],
          this.toProperties[n],
          i,
        );
      this.onUpdate && this.onUpdate(),
        this.t == this.duration && this.onComplete && this.onComplete();
    }
  }
}
class Page {
  domContainer;
  route = null;
  _showPageTween;
  _hidePageTween;
  preUfxContainer = new Object3D();
  postUfxContainer = new Object3D();
  isActive = !1;
  hasInitialized = !1;
  pageOpacity = 0;
  constructor() {
    (this._showPageTween = new Tween(this)),
      (this._hidePageTween = new Tween(this));
    let e = this._onPageTweenUpdate.bind(this);
    (this._showPageTween.onUpdate = e), (this._hidePageTween.onUpdate = e);
  }
  get isScrollTarget() {
    return pagesManager.scrollTargetPage === this;
  }
  preInit(e) {}
  preInitContent(e) {}
  init(e) {}
  initContent(e) {}
  preShow(e, t) {}
  show(e, t, i) {
    this._showPageTween.kill(),
      (this._showPageTween.onComplete = i),
      this._showPageTween.to(0.3, { pageOpacity: 1 });
  }
  hide(e, t, i) {
    this._hidePageTween && this._hidePageTween.kill(),
      (this._hidePageTween.onComplete = i),
      this._hidePageTween.to(0.2, { pageOpacity: 0 });
  }
  onHideComplete(e, t) {}
  _onPageTweenUpdate() {
    this.domContainer.style.opacity = this.pageOpacity;
  }
  resize(e, t) {}
  update(e) {}
}
class Section {
  preInit(e, t) {
    (this.domParent = t),
      (this.domContainer = t.querySelector(`#${e}`)),
      (this.domContent = this.domContainer.querySelector(".section__content"));
  }
  init() {}
  resize(e, t) {}
  update(e) {}
}
const blitVert = `#define GLSLIFY 1
attribute vec2 position;varying vec2 v_uv;void main(){v_uv=position*0.5+0.5;gl_Position=vec4(position,0.0,1.0);}`,
  blitFrag = `#define GLSLIFY 1
uniform sampler2D u_texture;varying vec2 v_uv;void main(){gl_FragColor=texture2D(u_texture,v_uv);}`,
  uvBlitVert = `#define GLSLIFY 1
attribute vec2 position;attribute vec2 uv;varying vec2 v_uv;void main(){v_uv=uv;gl_Position=vec4(position,0.0,1.0);}`,
  clearFrag = `#define GLSLIFY 1
uniform vec4 u_color;varying vec2 v_uv;void main(){gl_FragColor=u_color;}`,
  debugVert = `#define GLSLIFY 1
attribute vec3 position;attribute vec2 uv;uniform vec4 u_transform;varying vec2 v_uv;void main(){v_uv=uv;gl_Position=vec4(position.xy*u_transform.zw+u_transform.xy,0.0,1.0);}`;
class FboHelper {
  isWebGL2;
  renderer;
  quadGeom;
  triGeom;
  floatType;
  precisionPrefix;
  precisionPrefix2;
  vertexShader;
  _scene;
  _camera;
  _tri;
  copyMaterial;
  uvCopyMaterial;
  clearMaterial;
  _debugScene;
  _debugMesh;
  _debugMaterial;
  init(e, t) {
    (this.renderer = e),
      (this.floatType = t),
      (this.isWebGL2 = this.renderer.capabilities.isWebGL2),
      (this._scene = new Scene()),
      (this._camera = new Camera()),
      (this._camera.position.z = 1),
      (this.triGeom = new BufferGeometry()),
      this.triGeom.setAttribute(
        "position",
        new BufferAttribute(
          new Float32Array([-1, -1, 0, 4, -1, 0, -1, 4, 0]),
          3,
        ),
      ),
      (this.quadGeom = new PlaneGeometry(2, 2)),
      (this._tri = new Mesh(this.triGeom)),
      (this._tri.frustumCulled = !1),
      this._scene.add(this._tri),
      (this.precisionPrefix = `precision ${this.renderer.capabilities.precision} float;
`),
      (this.precisionPrefix2 = `#version 300 es
			precision ${this.renderer.capabilities.precision} float;
			precision ${this.renderer.capabilities.precision} int;
			#define IS_WEBGL2 true
		`),
      this.isWebGL2
        ? ((this.vertexPrefix = `${this.precisionPrefix2}
				precision mediump sampler2DArray;
				#define attribute in
				#define varying out
				#define texture2D texture
			`),
          (this.fragmentPrefix = `${this.precisionPrefix2}
				#define varying in
				out highp vec4 pc_fragColor;
				#define gl_FragColor pc_fragColor
				#define gl_FragDepthEXT gl_FragDepth
				#define texture2D texture
				#define textureCube texture
				#define texture2DProj textureProj
				#define texture2DLodEXT textureLod
				#define texture2DProjLodEXT textureProjLod
				#define textureCubeLodEXT textureLod
				#define texture2DGradEXT textureGrad
				#define texture2DProjGradEXT textureProjGrad
				#define textureCubeGradEXT textureGrad
			`))
        : ((this.vertexPrefix = this.precisionPrefix),
          (this.fragmentPrefix = this.precisionPrefix)),
      this.renderer.getContext().getExtension("OES_standard_derivatives"),
      (this.vertexShader = this.precisionPrefix + blitVert),
      (this.copyMaterial = this.createRawShaderMaterial({
        uniforms: { u_texture: { value: null } },
        fragmentShader: blitFrag,
      })),
      (this.uvCopyMaterial = this.createRawShaderMaterial({
        uniforms: { u_texture: { value: null } },
        vertexShader: uvBlitVert,
        fragmentShader: blitFrag,
      })),
      (this.clearMaterial = this.createRawShaderMaterial({
        uniforms: { u_color: { value: new Vector4(1, 1, 1, 1) } },
        fragmentShader: clearFrag,
      }));
    const i = new PlaneGeometry(1, 1);
    i.translate(0.5, -0.5, 0),
      (this._debugMaterial = this.createRawShaderMaterial({
        uniforms: {
          u_texture: { value: null },
          u_transform: { value: new Vector4(0, 0, 1, 1) },
        },
        vertexShader: debugVert,
        fragmentShader: blitFrag,
      })),
      (this._debugMesh = new Mesh(i, this._debugMaterial)),
      (this._debugScene = new Scene()),
      (this._debugScene.frustumCulled = !1),
      this._debugScene.add(this._debugMesh);
  }
  copy(e, t) {
    const i = this.copyMaterial;
    i && ((i.uniforms.u_texture.value = e), this.render(i, t));
  }
  uvCopy(e, t) {
    const i = this.uvCopyMaterial;
    i && ((i.uniforms.u_texture.value = e), this.render(i, t));
  }
  render(e, t) {
    this._tri &&
      this.renderer &&
      this._scene &&
      this._camera &&
      ((this._tri.material = e),
      t && this.renderer.setRenderTarget(t),
      this.renderer.render(this._scene, this._camera),
      t && this.renderer.setRenderTarget(null));
  }
  renderGeometry(e, t, i) {
    this._tri &&
      this.triGeom &&
      ((this._tri.geometry = e),
      this.render(t, i),
      (this._tri.geometry = this.triGeom));
  }
  renderMesh(e, t, i = this._camera) {
    this._tri &&
      this.renderer &&
      this._scene &&
      i &&
      ((this._tri.visible = !1),
      this._scene.add(e),
      t && this.renderer.setRenderTarget(t || null),
      this.renderer.render(this._scene, i),
      t && this.renderer.setRenderTarget(null),
      this._scene.remove(e),
      (this._tri.visible = !0));
  }
  debugTo(e, t, i, n, r) {
    if (
      !(
        this.renderer &&
        this._debugMaterial &&
        this._debugScene &&
        this._camera
      )
    )
      return;
    (t = t || e.width || e.image.width),
      (i = i || e.height || e.image.height),
      (n = n || 0),
      (r = r || 0);
    const o = this.renderer.getSize(new Vector2());
    (n = (n / o.width) * 2 - 1),
      (r = 1 - (r / o.height) * 2),
      (t = (t / o.width) * 2),
      (i = (i / o.height) * 2),
      (this._debugMaterial.uniforms.u_texture.value = e),
      this._debugMaterial.uniforms.u_transform.value.set(n, r, t, i);
    const s = this.getColorState();
    (this.renderer.autoClearColor = !1),
      this.renderer.setRenderTarget(null),
      this.renderer.render(this._debugScene, this._camera),
      this.setColorState(s);
  }
  parseDefines(e) {
    let t = "";
    for (const i in e) {
      const n = e[i];
      n === !0
        ? (t += `#define ${i}
`)
        : (t += `#define ${i} ${n}
`);
    }
    return t;
  }
  clearColor(e, t, i, n, r) {
    this.clearMaterial &&
      (this.clearMaterial.uniforms.u_color.value.set(e, t, i, n),
      this.render(this.clearMaterial, r));
  }
  getColorState() {
    if (!this.renderer)
      return {
        autoClear: !0,
        autoClearColor: !0,
        autoClearStencil: !0,
        autoClearDepth: !0,
        clearColor: 0,
        clearAlpha: 1,
      };
    const e = new Color();
    return (
      this.renderer.getClearColor(e),
      {
        autoClear: this.renderer.autoClear,
        autoClearColor: this.renderer.autoClearColor,
        autoClearStencil: this.renderer.autoClearStencil,
        autoClearDepth: this.renderer.autoClearDepth,
        clearColor: e.getHex(),
        clearAlpha: this.renderer.getClearAlpha(),
      }
    );
  }
  setColorState(e) {
    this.renderer &&
      (this.renderer.setClearColor(e.clearColor, e.clearAlpha),
      (this.renderer.autoClear = e.autoClear),
      (this.renderer.autoClearColor = e.autoClearColor),
      (this.renderer.autoClearStencil = e.autoClearStencil),
      (this.renderer.autoClearDepth = e.autoClearDepth));
  }
  createRawShaderMaterial(e) {
    (e = Object.assign(
      {
        depthTest: !1,
        depthWrite: !1,
        blending: NoBlending,
        vertexShader: blitVert,
        fragmentShader: blitFrag,
        derivatives: !1,
      },
      e,
    )),
      (e.vertexShader =
        (e.vertexShaderPrefix
          ? e.vertexShaderPrefix
          : e.derivatives
          ? this.vertexPrefix
          : this.precisionPrefix) + e.vertexShader),
      (e.fragmentShader =
        (e.fragmentShaderPrefix
          ? e.fragmentShaderPrefix
          : e.derivatives
          ? this.fragmentPrefix
          : this.precisionPrefix) + e.fragmentShader),
      delete e.vertexShaderPrefix,
      delete e.fragmentShaderPrefix,
      delete e.derivatives;
    let t = new RawShaderMaterial(e);
    return properties.initCallFuncList.push(t), t;
  }
  createDataTexture(e, t, i, n = !1, r = !0) {
    let o = new DataTexture(
      e,
      t,
      i,
      RGBAFormat,
      n ? FloatType : UnsignedByteType,
      UVMapping,
      ClampToEdgeWrapping,
      ClampToEdgeWrapping,
      r ? NearestFilter : LinearFilter,
      r ? NearestFilter : LinearFilter,
      0,
    );
    return (o.needsUpdate = !0), o;
  }
  createRenderTarget(e, t, i = !1, n = !1, r = 0) {
    return new WebGLRenderTarget(e, t, {
      wrapS: ClampToEdgeWrapping,
      wrapT: ClampToEdgeWrapping,
      magFilter: i ? NearestFilter : LinearFilter,
      minFilter: i ? NearestFilter : LinearFilter,
      type: n ? this.floatType : UnsignedByteType,
      anisotropy: 0,
      encoding: LinearEncoding,
      depthBuffer: !1,
      stencilBuffer: !1,
      samples: browser.isSupportMSAA ? r : 0,
    });
  }
  createMultisampleRenderTarget(e, t, i = !1, n = !1, r = 8) {
    return !(this.renderer && this.isWebGL2) || !browser.isSupportMSAA
      ? this.createRenderTarget(e, t, i, n)
      : new WebGLRenderTarget(e, t, {
          wrapS: ClampToEdgeWrapping,
          wrapT: ClampToEdgeWrapping,
          magFilter: i ? NearestFilter : LinearFilter,
          minFilter: i ? NearestFilter : LinearFilter,
          type: n ? this.floatType : UnsignedByteType,
          anisotropy: 0,
          encoding: LinearEncoding,
          depthBuffer: !1,
          stencilBuffer: !1,
          samples: browser.isSupportMSAA ? r : 0,
        });
  }
  clearMultisampleRenderTargetState(e) {
    if (((e = e || this.renderer.getRenderTarget()), e && e.samples > 0)) {
      const t = this.renderer.properties.get(e);
      let i = this.renderer.getContext();
      i.bindFramebuffer(i.READ_FRAMEBUFFER, t.__webglMultisampledFramebuffer),
        i.bindFramebuffer(i.DRAW_FRAMEBUFFER, t.__webglFramebuffer);
      const n = e.width,
        r = e.height;
      let o = i.COLOR_BUFFER_BIT;
      e.depthBuffer && (o |= i.DEPTH_BUFFER_BIT),
        e.stencilBuffer && (o |= i.STENCIL_BUFFER_BIT),
        i.blitFramebuffer(0, 0, n, r, 0, 0, n, r, o, i.NEAREST),
        i.bindFramebuffer(i.FRAMEBUFFER, t.__webglMultisampledFramebuffer);
    }
  }
}
const fboHelper = new FboHelper();
let _c0 = new Color(),
  _c1 = new Color();
class PostProfile {
  bloomAmount = 0;
  bloomRadius = 0.25;
  bloomThreshold = 0.7;
  bloomSmoothWidth = 0.5;
  bloomLumaStrength = 0;
  bloomSelectiveStrength = 0;
  bloomSaturation = 1;
  haloWidth = 0.75;
  haloRGBShift = 0.03;
  haloLeftColorHex = "#ff0000";
  haloMidColorHex = "#00ff00";
  haloRightColorHex = "#0000ff";
  haloStrength = 0.3;
  haloMaskInner = 0.3;
  haloMaskOuter = 0.5;
  vignetteFrom = 0.54278;
  vignetteTo = 1.36986;
  vignetteColorHex = "#000000";
  saturation = 1;
  contrast = 0;
  brightness = 1;
  tintColorHex = "#f4be00";
  tintOpacity = 0;
  screenPaintDistortionAmount = 0;
  screenPaintDistortionRGBShift = 0.2;
  screenPaintDistortionColorMultiplier = 1.75;
  screenPaintDistortionMultiplier = 0.7;
  cameraMotionBlurAmount = 0.35;
  bokehAmount = 1;
  bokehFNumber = 0.181;
  bokehFocusDistance = 4.5;
  bokehFocalLength = 0.344;
  bokehKFilmHeight = 19.26;
  smaaThreshold = 0.05;
  radialBlurAmount = 0;
  radialBlurRadius = 8;
  radialBlurFromRadius = 0;
  radialBlurToRadius = 1;
  radialBlurFromStrength = 1;
  radialBlurToStrength = 0;
  radialBlurCenterX = 0;
  radialBlurCenterY = 0;
  upscalerSharpness = 1;
  blurRatio = 0;
  constructor(e = {}) {
    Object.assign(this, e);
  }
  blend(e, t = 0) {
    t = math.saturate(t);
    for (let i in e)
      if (this.hasOwnProperty(i)) {
        let n = e[i];
        n !== this[i] &&
          (typeof this[i] == "string"
            ? (this[i] =
                "#" +
                _c0.setStyle(this[i]).lerp(_c1.setStyle(n), t).getHexString())
            : typeof this[i] == "number" &&
              (this[i] = math.mix(this[i], n, t)));
      }
  }
  addGui(e) {
    let t = e.addFolder("bloom");
    t.add(this, "bloomAmount", 0, 5, 1e-5).listen(),
      t.add(this, "bloomLumaStrength", 0, 3, 1e-5).listen(),
      t.add(this, "bloomSelectiveStrength", 0, 3, 1e-5).listen(),
      t.add(this, "bloomSaturation", 0, 3, 1e-5).listen(),
      t.add(this, "bloomRadius", -1, 1, 1e-5).listen(),
      t.add(this, "bloomThreshold", 0, 1, 1e-5).listen(),
      t.add(this, "bloomSmoothWidth", 0, 2, 1e-5).listen(),
      t.add(this, "haloWidth", 0, 2, 1e-5).listen(),
      t.add(this, "haloRGBShift", 0, 0.2, 1e-5).listen(),
      t.addColor(this, "haloLeftColorHex").listen(),
      t.addColor(this, "haloMidColorHex").listen(),
      t.addColor(this, "haloRightColorHex").listen(),
      t.add(this, "haloStrength", 0, 3, 1e-5).listen(),
      t.add(this, "haloMaskInner", 0, 1, 1e-5).listen(),
      t.add(this, "haloMaskOuter", 0, 1, 1e-5).listen();
    let i = e.addFolder("bokeh");
    i.add(this, "bokehAmount", 0, 1, 1e-5).listen(),
      i.add(this, "bokehFNumber", 1e-4, 30, 1e-5).listen(),
      i.add(this, "bokehFocusDistance", 0, 2e3, 1e-5).listen(),
      i.add(this, "bokehFocalLength", 0, 100, 1e-5).listen(),
      i.add(this, "bokehKFilmHeight", 1e-5, 90, 1e-5).listen();
    let n = e.addFolder("color");
    n.add(this, "vignetteFrom", 0, 3, 1e-5).listen(),
      n.add(this, "vignetteTo", 0, 3, 1e-5).listen(),
      n.addColor(this, "vignetteColorHex").listen(),
      n.add(this, "saturation", 0, 3, 1e-5).listen(),
      n.add(this, "contrast", -1, 3, 1e-5).listen(),
      n.add(this, "brightness", 0, 2, 1e-5).listen(),
      n.addColor(this, "tintColorHex").listen(),
      n.add(this, "tintOpacity", 0, 1, 1e-5).listen();
    let r = e.addFolder("screenPaintDistortion");
    r.add(this, "screenPaintDistortionAmount", 0, 100, 1e-5).listen(),
      r.add(this, "screenPaintDistortionRGBShift", 0, 3, 1e-5).listen(),
      r.add(this, "screenPaintDistortionColorMultiplier", 0, 50, 1e-5).listen(),
      r.add(this, "screenPaintDistortionMultiplier", 0, 20, 1e-5).listen(),
      e.addFolder("smaa").add(this, "smaaThreshold", 0, 1, 1e-5).listen();
  }
}
const frag$c = `#define GLSLIFY 1
uniform sampler2D u_lowPaintTexture;uniform sampler2D u_prevPaintTexture;uniform vec2 u_paintTexelSize;uniform vec4 u_drawFrom;uniform vec4 u_drawTo;uniform float u_pushStrength;uniform vec3 u_dissipations;uniform vec2 u_vel;varying vec2 v_uv;vec2 sdSegment(in vec2 p,in vec2 a,in vec2 b){vec2 pa=p-a,ba=b-a;float h=clamp(dot(pa,ba)/dot(ba,ba),0.0,1.0);return vec2(length(pa-ba*h),h);}
#ifdef USE_NOISE
uniform float u_curlScale;uniform float u_curlStrength;vec2 hash(vec2 p){vec3 p3=fract(vec3(p.xyx)*vec3(.1031,.1030,.0973));p3+=dot(p3,p3.yzx+33.33);return fract((p3.xx+p3.yz)*p3.zy)*2.0-1.0;}vec3 noised(in vec2 p){vec2 i=floor(p);vec2 f=fract(p);vec2 u=f*f*f*(f*(f*6.0-15.0)+10.0);vec2 du=30.0*f*f*(f*(f-2.0)+1.0);vec2 ga=hash(i+vec2(0.0,0.0));vec2 gb=hash(i+vec2(1.0,0.0));vec2 gc=hash(i+vec2(0.0,1.0));vec2 gd=hash(i+vec2(1.0,1.0));float va=dot(ga,f-vec2(0.0,0.0));float vb=dot(gb,f-vec2(1.0,0.0));float vc=dot(gc,f-vec2(0.0,1.0));float vd=dot(gd,f-vec2(1.0,1.0));return vec3(va+u.x*(vb-va)+u.y*(vc-va)+u.x*u.y*(va-vb-vc+vd),ga+u.x*(gb-ga)+u.y*(gc-ga)+u.x*u.y*(ga-gb-gc+gd)+du*(u.yx*(va-vb-vc+vd)+vec2(vb,vc)-va));}
#endif
void main(){vec2 res=sdSegment(gl_FragCoord.xy,u_drawFrom.xy,u_drawTo.xy);vec2 radiusWeight=mix(u_drawFrom.zw,u_drawTo.zw,res.y);float d=1.0-smoothstep(-0.01,radiusWeight.x,res.x);vec4 lowData=texture2D(u_lowPaintTexture,v_uv);vec2 velInv=(0.5-lowData.xy)*u_pushStrength;
#ifdef USE_NOISE
vec3 noise3=noised(gl_FragCoord.xy*u_curlScale*(1.0-lowData.xy));vec2 noise=noised(gl_FragCoord.xy*u_curlScale*(2.0-lowData.xy*(0.5+noise3.x)+noise3.yz*0.1)).yz;velInv+=noise*(lowData.z+lowData.w)*u_curlStrength;
#endif
vec4 data=texture2D(u_prevPaintTexture,v_uv+velInv*u_paintTexelSize);data.xy-=0.5;vec4 delta=(u_dissipations.xxyz-1.0)*data;vec2 newVel=u_vel*d;delta+=vec4(newVel,radiusWeight.yy*d);delta.zw=sign(delta.zw)*max(vec2(0.004),abs(delta.zw));data+=delta;data.xy+=0.5;gl_FragColor=clamp(data,vec4(0.0),vec4(1.0));}`,
  blur9VaryingVertexShader = `#define GLSLIFY 1
attribute vec3 position;uniform vec2 u_delta;varying vec2 v_uv[9];void main(){vec2 uv=position.xy*0.5+0.5;v_uv[0]=uv;vec2 delta=u_delta;v_uv[1]=uv-delta;v_uv[2]=uv+delta;delta+=u_delta;v_uv[3]=uv-delta;v_uv[4]=uv+delta;delta+=u_delta;v_uv[5]=uv-delta;v_uv[6]=uv+delta;delta+=u_delta;v_uv[7]=uv-delta;v_uv[8]=uv+delta;gl_Position=vec4(position,1.0);}`,
  blur9VaryingFragmentShader = `#define GLSLIFY 1
uniform sampler2D u_texture;varying vec2 v_uv[9];void main(){vec4 color=texture2D(u_texture,v_uv[0])*0.1633;color+=texture2D(u_texture,v_uv[1])*0.1531;color+=texture2D(u_texture,v_uv[2])*0.1531;color+=texture2D(u_texture,v_uv[3])*0.12245;color+=texture2D(u_texture,v_uv[4])*0.12245;color+=texture2D(u_texture,v_uv[5])*0.0918;color+=texture2D(u_texture,v_uv[6])*0.0918;color+=texture2D(u_texture,v_uv[7])*0.051;color+=texture2D(u_texture,v_uv[8])*0.051;gl_FragColor=color;}`,
  blur9FragmentShader = `#define GLSLIFY 1
uniform sampler2D u_texture;uniform vec2 u_delta;varying vec2 v_uv;void main(){vec4 color=texture2D(u_texture,v_uv)*0.1633;vec2 delta=u_delta;color+=texture2D(u_texture,v_uv-delta)*0.1531;color+=texture2D(u_texture,v_uv+delta)*0.1531;delta+=u_delta;color+=texture2D(u_texture,v_uv-delta)*0.12245;color+=texture2D(u_texture,v_uv+delta)*0.12245;delta+=u_delta;color+=texture2D(u_texture,v_uv-delta)*0.0918;color+=texture2D(u_texture,v_uv+delta)*0.0918;delta+=u_delta;color+=texture2D(u_texture,v_uv-delta)*0.051;color+=texture2D(u_texture,v_uv+delta)*0.051;gl_FragColor=color;}`;
class Blur {
  material = null;
  getBlur9Material() {
    let e = fboHelper.MAX_VARYING_VECTORS > 8;
    return (
      this.blur9Material ||
        (this.blur9Material = new RawShaderMaterial({
          uniforms: {
            u_texture: { value: null },
            u_delta: { value: new Vector2() },
          },
          vertexShader: e
            ? fboHelper.precisionPrefix + blur9VaryingVertexShader
            : fboHelper.vertexShader,
          fragmentShader:
            fboHelper.precisionPrefix +
            (e ? blur9VaryingFragmentShader : blur9FragmentShader),
          depthWrite: !1,
          depthTest: !1,
        })),
      this.blur9Material
    );
  }
  blur(e, t, i, n, r, o) {
    let s = 0.25,
      l = Math.ceil(i.width * t) || 0,
      u = Math.ceil(i.height * t) || 0;
    this.material || (this.material = this.getBlur9Material()),
      n || console.warn("You have to pass intermediateRenderTarget to blur"),
      (l !== n.width || u !== n.height) && n.setSize(l, u),
      r ? o || r.setSize(i.width, i.height) : (r = i),
      (this.material.uniforms.u_texture.value = i.texture || i),
      this.material.uniforms.u_delta.value.set((e / l) * s, 0),
      fboHelper.render(this.material, n),
      (this.material.uniforms.u_texture.value = n.texture || n),
      this.material.uniforms.u_delta.value.set(0, (e / u) * s),
      fboHelper.render(this.material, r);
  }
}
const blur$1 = new Blur();
let _v$2 = new Vector2();
class ScreenPaint {
  _lowRenderTarget;
  _lowBlurRenderTarget;
  _prevPaintRenderTarget;
  _currPaintRenderTarget;
  _material;
  _distortionMaterial;
  _fromDrawData;
  _toDrawData;
  drawEnabled = !0;
  needsMouseDown = !1;
  enabled = !0;
  minRadius = 0;
  maxRadius = 100;
  radiusDistanceRange = 100;
  pushStrength = 25;
  accelerationDissipation = 0.8;
  velocityDissipation = 0.985;
  weight1Dissipation = 0.985;
  weight2Dissipation = 0.5;
  useNoise = !1;
  curlScale = 0.1;
  curlStrength = 5;
  _prevUseNoise = null;
  sharedUniforms = {
    u_paintTexelSize: { value: new Vector2() },
    u_prevPaintTexture: { value: null },
    u_currPaintTexture: { value: null },
    u_lowPaintTexture: { value: null },
  };
  init() {
    (this._lowRenderTarget = fboHelper.createRenderTarget(1, 1)),
      (this._lowBlurRenderTarget = fboHelper.createRenderTarget(1, 1)),
      (this._prevPaintRenderTarget = fboHelper.createRenderTarget(1, 1)),
      (this._currPaintRenderTarget = fboHelper.createRenderTarget(1, 1)),
      (this.sharedUniforms.u_lowPaintTexture.value =
        this._lowRenderTarget.texture),
      (this._material = new RawShaderMaterial({
        uniforms: {
          u_lowPaintTexture: { value: this._lowRenderTarget.texture },
          u_prevPaintTexture: this.sharedUniforms.u_prevPaintTexture,
          u_paintTexelSize: this.sharedUniforms.u_paintTexelSize,
          u_drawFrom: { value: (this._fromDrawData = new Vector4(0, 0, 0, 0)) },
          u_drawTo: { value: (this._toDrawData = new Vector4(0, 0, 0, 0)) },
          u_pushStrength: { value: 0 },
          u_curlScale: { value: 0 },
          u_curlStrength: { value: 0 },
          u_vel: { value: new Vector2() },
          u_dissipations: { value: new Vector3() },
        },
        vertexShader: fboHelper.vertexShader,
        fragmentShader: fboHelper.precisionPrefix + frag$c,
      }));
  }
  resize(e, t) {
    let i = e >> 2,
      n = t >> 2,
      r = e >> 4,
      o = t >> 4;
    (i !== this._currPaintRenderTarget.width ||
      n !== this._currPaintRenderTarget.height) &&
      (this._currPaintRenderTarget.setSize(i, n),
      this._prevPaintRenderTarget.setSize(i, n),
      this._lowRenderTarget.setSize(r, o),
      this._lowBlurRenderTarget.setSize(r, o),
      this.sharedUniforms.u_paintTexelSize.value.set(1 / i, 1 / n),
      this.clear());
  }
  clear = () => {
    fboHelper.clearColor(0.5, 0.5, 0, 0, this._lowRenderTarget),
      fboHelper.clearColor(0.5, 0.5, 0, 0, this._lowBlurRenderTarget),
      fboHelper.clearColor(0.5, 0.5, 0, 0, this._currPaintRenderTarget),
      this._material.uniforms.u_vel.value.set(0, 0);
  };
  update(e) {
    if (!this.enabled || !this._material || !this._currPaintRenderTarget) return;
    this.useNoise !== this._prevUseNoise &&
      ((this._material.defines.USE_NOISE = this.useNoise),
      (this._material.needsUpdate = !0),
      (this._prevUseNoise = this.useNoise));
    let t = this._currPaintRenderTarget.width,
      i = this._currPaintRenderTarget.height,
      n = this._prevPaintRenderTarget;
    (this._prevPaintRenderTarget = this._currPaintRenderTarget),
      (this._currPaintRenderTarget = n),
      (this.sharedUniforms.u_prevPaintTexture.value =
        this._prevPaintRenderTarget.texture),
      (this.sharedUniforms.u_currPaintTexture.value =
        this._currPaintRenderTarget.texture),
      (this._material.uniforms.u_drawFrom.value.z =
        this._material.uniforms.u_drawTo.value.z);
    let r = input.mousePixelXY.distanceTo(input.prevMousePixelXY),
      o = math.fit(
        r,
        0,
        this.radiusDistanceRange,
        this.minRadius,
        this.maxRadius,
      );
    (!input.hadMoved ||
      !this.drawEnabled ||
      ((this.needsMouseDown || browser.isMobile) &&
        (!input.isDown || !input.wasDown))) &&
      (o = 0),
      (o = (o / properties.viewportHeight) * i),
      (this._material.uniforms.u_pushStrength.value = this.pushStrength),
      (this._material.uniforms.u_curlScale.value = this.curlScale),
      (this._material.uniforms.u_curlStrength.value = this.curlStrength),
      this._material.uniforms.u_dissipations.value.set(
        this.velocityDissipation,
        this.weight1Dissipation,
        this.weight2Dissipation,
      ),
      this._fromDrawData.copy(this._toDrawData),
      this._toDrawData.set(
        ((input.mouseXY.x + 1) * t) / 2,
        ((input.mouseXY.y + 1) * i) / 2,
        o,
        1,
      ),
      _v$2
        .set(
          this._toDrawData.x - this._fromDrawData.x,
          this._toDrawData.y - this._fromDrawData.y,
        )
        .multiplyScalar(e * 0.8),
      this._material.uniforms.u_vel.value
        .multiplyScalar(this.accelerationDissipation)
        .add(_v$2),
      fboHelper.render(this._material, this._currPaintRenderTarget),
      fboHelper.copy(
        this._currPaintRenderTarget.texture,
        this._lowRenderTarget,
      ),
      blur$1.blur(4, 1, this._lowRenderTarget, this._lowBlurRenderTarget);
  }
}
const screenPaint = new ScreenPaint();
class PostEffect {
  sharedUniforms = {};
  enabled = !0;
  material = null;
  renderOrder = 0;
  _hasShownWarning = !1;
  init(e) {
    Object.assign(this, e);
  }
  needsRender() {
    return !0;
  }
  warn(e) {
    this._hasShownWarning || (console.warn(e), (this._hasShownWarning = !0));
  }
  render(e, t = !1) {
    this.material.uniforms.u_texture &&
      (this.material.uniforms.u_texture.value = e.fromTexture),
      fboHelper.render(this.material, t ? null : e.toRenderTarget),
      e.swap();
  }
}
const smaaBlendVert = `#define GLSLIFY 1
attribute vec3 position;uniform vec2 u_texelSize;varying vec2 v_uv;varying vec4 v_offsets[2];void SMAANeighborhoodBlendingVS(vec2 texcoord){v_offsets[0]=texcoord.xyxy+u_texelSize.xyxy*vec4(-1.0,0.0,0.0,1.0);v_offsets[1]=texcoord.xyxy+u_texelSize.xyxy*vec4(1.0,0.0,0.0,-1.0);}void main(){v_uv=position.xy*0.5+0.5;SMAANeighborhoodBlendingVS(v_uv);gl_Position=vec4(position,1.0);}`,
  smaaBlendFrag = `#define GLSLIFY 1
uniform sampler2D u_weightsTexture;uniform sampler2D u_texture;uniform vec2 u_texelSize;varying vec2 v_uv;varying vec4 v_offsets[2];vec4 SMAANeighborhoodBlendingPS(vec2 texcoord,vec4 offset[2],sampler2D colorTex,sampler2D blendTex){vec4 a;a.xz=texture2D(blendTex,texcoord).xz;a.y=texture2D(blendTex,offset[1].zw).g;a.w=texture2D(blendTex,offset[1].xy).a;if(dot(a,vec4(1.0,1.0,1.0,1.0))<1e-5){return texture2D(colorTex,texcoord,0.0);}else{vec2 offset;offset.x=a.a>a.b ? a.a :-a.b;offset.y=a.g>a.r ?-a.g : a.r;if(abs(offset.x)>abs(offset.y)){offset.y=0.0;}else{offset.x=0.0;}vec4 C=texture2D(colorTex,texcoord,0.0);texcoord+=sign(offset)*u_texelSize;vec4 Cop=texture2D(colorTex,texcoord,0.0);float s=abs(offset.x)>abs(offset.y)? abs(offset.x): abs(offset.y);C.xyz=pow(abs(C.xyz),vec3(2.2));Cop.xyz=pow(abs(Cop.xyz),vec3(2.2));vec4 mixed=mix(C,Cop,s);mixed.xyz=pow(abs(mixed.xyz),vec3(1.0/2.2));return mixed;}}void main(){gl_FragColor=SMAANeighborhoodBlendingPS(v_uv,v_offsets,u_texture,u_weightsTexture);}`,
  smaaEdgesVert = `#define GLSLIFY 1
attribute vec3 position;uniform vec2 u_texelSize;varying vec2 v_uv;varying vec4 v_offsets[3];void SMAAEdgeDetectionVS(vec2 texcoord){v_offsets[0]=texcoord.xyxy+u_texelSize.xyxy*vec4(-1.0,0.0,0.0,1.0);v_offsets[1]=texcoord.xyxy+u_texelSize.xyxy*vec4(1.0,0.0,0.0,-1.0);v_offsets[2]=texcoord.xyxy+u_texelSize.xyxy*vec4(-2.0,0.0,0.0,2.0);}void main(){v_uv=position.xy*0.5+0.5;SMAAEdgeDetectionVS(v_uv);gl_Position=vec4(position,1.0);}`,
  smaaEdgesFrag = `#define GLSLIFY 1
uniform sampler2D u_texture;uniform vec2 u_thresholds;varying vec2 v_uv;varying vec4 v_offsets[3];vec4 SMAAColorEdgeDetectionPS(vec2 texcoord,vec4 offset[3],sampler2D colorTex){vec4 delta;vec3 C=texture2D(colorTex,texcoord).rgb;vec3 Cleft=texture2D(colorTex,offset[0].xy).rgb;vec3 t=abs(C-Cleft);delta.x=max(max(t.r,t.g),t.b);vec3 Ctop=texture2D(colorTex,offset[0].zw).rgb;t=abs(C-Ctop);delta.y=max(max(t.r,t.g),t.b);vec2 edges=step(u_thresholds,delta.xy);if(dot(edges,vec2(1.0,1.0))==0.0)discard;vec3 Cright=texture2D(colorTex,offset[1].xy).rgb;t=abs(C-Cright);delta.z=max(max(t.r,t.g),t.b);vec3 Cbottom=texture2D(colorTex,offset[1].zw).rgb;t=abs(C-Cbottom);delta.w=max(max(t.r,t.g),t.b);float maxDelta=max(max(max(delta.x,delta.y),delta.z),delta.w);vec3 Cleftleft=texture2D(colorTex,offset[2].xy).rgb;t=abs(C-Cleftleft);delta.z=max(max(t.r,t.g),t.b);vec3 Ctoptop=texture2D(colorTex,offset[2].zw).rgb;t=abs(C-Ctoptop);delta.w=max(max(t.r,t.g),t.b);maxDelta=max(max(maxDelta,delta.z),delta.w);edges.xy*=step(0.5*maxDelta,delta.xy);return vec4(edges,0.0,0.0);}void main(){gl_FragColor=SMAAColorEdgeDetectionPS(v_uv,v_offsets,u_texture);}`,
  smaaWeightsVert = `#define GLSLIFY 1
attribute vec3 position;uniform vec2 u_texelSize;varying vec2 v_uv;varying vec4 v_offsets[3];varying vec2 v_pixcoord;void SMAABlendingWeightCalculationVS(vec2 texcoord){v_pixcoord=texcoord/u_texelSize;v_offsets[0]=texcoord.xyxy+u_texelSize.xyxy*vec4(-0.25,0.125,1.25,0.125);v_offsets[1]=texcoord.xyxy+u_texelSize.xyxy*vec4(-0.125,0.25,-0.125,-1.25);v_offsets[2]=vec4(v_offsets[0].xz,v_offsets[1].yw)+vec4(-2.0,2.0,-2.0,2.0)*u_texelSize.xxyy*float(SMAA_MAX_SEARCH_STEPS);}void main(){v_uv=position.xy*0.5+0.5;SMAABlendingWeightCalculationVS(v_uv);gl_Position=vec4(position,1.0);}`,
  smaaWeightsFrag = `#define GLSLIFY 1
#define SMAASampleLevelZeroOffset( tex, coord, offset ) texture2D( tex, coord + float( offset ) * u_texelSize, 0.0 )
uniform sampler2D u_edgesTexture;uniform sampler2D u_areaTexture;uniform sampler2D u_searchTexture;uniform vec2 u_texelSize;varying vec2 v_uv;varying vec4 v_offsets[3];varying vec2 v_pixcoord;vec2 round(vec2 x){return sign(x)*floor(abs(x)+0.5);}float SMAASearchLength(sampler2D searchTex,vec2 e,float bias,float scale){e.r=bias+e.r*scale;return 255.0*texture2D(searchTex,e,0.0).r;}float SMAASearchXLeft(sampler2D edgesTex,sampler2D searchTex,vec2 texcoord,float end){vec2 e=vec2(0.0,1.0);for(int i=0;i<SMAA_MAX_SEARCH_STEPS;i++){e=texture2D(edgesTex,texcoord,0.0).rg;texcoord-=vec2(2.0,0.0)*u_texelSize;if(!(texcoord.x>end&&e.g>0.8281&&e.r==0.0))break;}texcoord.x+=0.25*u_texelSize.x;texcoord.x+=u_texelSize.x;texcoord.x+=2.0*u_texelSize.x;texcoord.x-=u_texelSize.x*SMAASearchLength(searchTex,e,0.0,0.5);return texcoord.x;}float SMAASearchXRight(sampler2D edgesTex,sampler2D searchTex,vec2 texcoord,float end){vec2 e=vec2(0.0,1.0);for(int i=0;i<SMAA_MAX_SEARCH_STEPS;i++){e=texture2D(edgesTex,texcoord,0.0).rg;texcoord+=vec2(2.0,0.0)*u_texelSize;if(!(texcoord.x<end&&e.g>0.8281&&e.r==0.0))break;}texcoord.x-=0.25*u_texelSize.x;texcoord.x-=u_texelSize.x;texcoord.x-=2.0*u_texelSize.x;texcoord.x+=u_texelSize.x*SMAASearchLength(searchTex,e,0.5,0.5);return texcoord.x;}float SMAASearchYUp(sampler2D edgesTex,sampler2D searchTex,vec2 texcoord,float end){vec2 e=vec2(1.0,0.0);for(int i=0;i<SMAA_MAX_SEARCH_STEPS;i++){e=texture2D(edgesTex,texcoord,0.0).rg;texcoord+=vec2(0.0,2.0)*u_texelSize;if(!(texcoord.y>end&&e.r>0.8281&&e.g==0.0))break;}texcoord.y-=0.25*u_texelSize.y;texcoord.y-=u_texelSize.y;texcoord.y-=2.0*u_texelSize.y;texcoord.y+=u_texelSize.y*SMAASearchLength(searchTex,e.gr,0.0,0.5);return texcoord.y;}float SMAASearchYDown(sampler2D edgesTex,sampler2D searchTex,vec2 texcoord,float end){vec2 e=vec2(1.0,0.0);for(int i=0;i<SMAA_MAX_SEARCH_STEPS;i++){e=texture2D(edgesTex,texcoord,0.0).rg;texcoord-=vec2(0.0,2.0)*u_texelSize;if(!(texcoord.y<end&&e.r>0.8281&&e.g==0.0))break;}texcoord.y+=0.25*u_texelSize.y;texcoord.y+=u_texelSize.y;texcoord.y+=2.0*u_texelSize.y;texcoord.y-=u_texelSize.y*SMAASearchLength(searchTex,e.gr,0.5,0.5);return texcoord.y;}vec2 SMAAArea(sampler2D areaTex,vec2 dist,float e1,float e2,float offset){vec2 texcoord=float(SMAA_AREATEX_MAX_DISTANCE)*round(4.0*vec2(e1,e2))+dist;texcoord=SMAA_AREATEX_PIXEL_SIZE*texcoord+(0.5*SMAA_AREATEX_PIXEL_SIZE);texcoord.y+=SMAA_AREATEX_SUBTEX_SIZE*offset;return texture2D(areaTex,texcoord,0.0).rg;}vec4 SMAABlendingWeightCalculationPS(vec2 texcoord,vec2 pixcoord,vec4 offset[3],sampler2D edgesTex,sampler2D areaTex,sampler2D searchTex,ivec4 subsampleIndices){vec4 weights=vec4(0.0,0.0,0.0,0.0);vec2 e=texture2D(edgesTex,texcoord).rg;if(e.g>0.0){vec2 d;vec2 coords;coords.x=SMAASearchXLeft(edgesTex,searchTex,offset[0].xy,offset[2].x);coords.y=offset[1].y;d.x=coords.x;float e1=texture2D(edgesTex,coords,0.0).r;coords.x=SMAASearchXRight(edgesTex,searchTex,offset[0].zw,offset[2].y);d.y=coords.x;d=d/u_texelSize.x-pixcoord.x;vec2 sqrt_d=sqrt(abs(d));coords.y-=1.0*u_texelSize.y;float e2=SMAASampleLevelZeroOffset(edgesTex,coords,ivec2(1,0)).r;weights.rg=SMAAArea(areaTex,sqrt_d,e1,e2,float(subsampleIndices.y));}if(e.r>0.0){vec2 d;vec2 coords;coords.y=SMAASearchYUp(edgesTex,searchTex,offset[1].xy,offset[2].z);coords.x=offset[0].x;d.x=coords.y;float e1=texture2D(edgesTex,coords,0.0).g;coords.y=SMAASearchYDown(edgesTex,searchTex,offset[1].zw,offset[2].w);d.y=coords.y;d=d/u_texelSize.y-pixcoord.y;vec2 sqrt_d=sqrt(abs(d));coords.y-=1.0*u_texelSize.y;float e2=SMAASampleLevelZeroOffset(edgesTex,coords,ivec2(0,1)).g;weights.ba=SMAAArea(areaTex,sqrt_d,e1,e2,float(subsampleIndices.x));}return weights;}void main(){gl_FragColor=SMAABlendingWeightCalculationPS(v_uv,v_pixcoord,v_offsets,u_edgesTexture,u_areaTexture,u_searchTexture,ivec4(0.0));}`;
class Smaa extends PostEffect {
  edgesRenderTarget = null;
  weightsRenderTarget = null;
  edgesMaterial = null;
  weightsMaterial = null;
  threshold = 0.5;
  init(e) {
    Object.assign(
      this,
      {
        sharedUniforms: {
          u_areaTexture: { value: null },
          u_searchTexture: { value: null },
        },
      },
      e,
    ),
      super.init(),
      (this.weightsRenderTarget = fboHelper.createRenderTarget(1, 1)),
      (this.edgesRenderTarget = fboHelper.createRenderTarget(1, 1)),
      (this.edgesMaterial = new RawShaderMaterial({
        uniforms: {
          u_texture: { value: null },
          u_texelSize: null,
          u_thresholds: { value: new Vector2() },
        },
        vertexShader: fboHelper.precisionPrefix + smaaEdgesVert,
        fragmentShader: fboHelper.precisionPrefix + smaaEdgesFrag,
        blending: NoBlending,
        depthTest: !1,
        depthWrite: !1,
      })),
      (this.weightsMaterial = new RawShaderMaterial({
        uniforms: {
          u_edgesTexture: { value: this.edgesRenderTarget.texture },
          u_areaTexture: this.sharedUniforms.u_areaTexture,
          u_searchTexture: this.sharedUniforms.u_searchTexture,
          u_texelSize: null,
        },
        vertexShader: fboHelper.precisionPrefix + smaaWeightsVert,
        fragmentShader: fboHelper.precisionPrefix + smaaWeightsFrag,
        defines: {
          SMAA_MAX_SEARCH_STEPS: "8",
          SMAA_AREATEX_MAX_DISTANCE: "16",
          SMAA_AREATEX_PIXEL_SIZE: "( 1.0 / vec2( 160.0, 560.0 ) )",
          SMAA_AREATEX_SUBTEX_SIZE: "( 1.0 / 7.0 )",
        },
        transparent: !0,
        blending: NoBlending,
        depthTest: !1,
        depthWrite: !1,
      })),
      (this.material = fboHelper.createRawShaderMaterial({
        uniforms: {
          u_texture: { value: null },
          u_weightsTexture: { value: this.weightsRenderTarget.texture },
          u_texelSize: null,
        },
        vertexShader: fboHelper.precisionPrefix + smaaBlendVert,
        fragmentShader: fboHelper.precisionPrefix + smaaBlendFrag,
      }));
  }
  setTextures(e, t) {
    let i = (this.sharedUniforms.u_areaTexture.value = this._createTexture(e));
    i.minFilter = LinearFilter;
    let n = (this.sharedUniforms.u_searchTexture.value =
      this._createTexture(t));
    (n.magFilter = NearestFilter), (n.minFilter = NearestFilter);
  }
  updateTextures() {
    (this.sharedUniforms.u_areaTexture.value.needsUpdate = !0),
      (this.sharedUniforms.u_searchTexture.value.needsUpdate = !0);
  }
  dispose() {
    this.edgesRenderTarget && this.edgesRenderTarget.dispose(),
      this.weightsRenderTarget && this.weightsRenderTarget.dispose();
  }
  needsRender() {
    return !this.sharedUniforms.u_areaTexture.value.needsUpdate;
  }
  render(e, t) {
    let i = e.width,
      n = e.height;
    this.edgesRenderTarget.setSize(i, n),
      this.weightsRenderTarget.setSize(i, n);
    let r = fboHelper.getColorState();
    this.sharedUniforms.u_searchTexture.value ||
      console.warn(
        "You need to use Smaa.setImages() to set the smaa textures manually and assign to this class.",
      );
    let o = fboHelper.renderer;
    o && ((o.autoClear = !0), o.setClearColor(0, 0)),
      this.edgesMaterial.uniforms.u_thresholds.value.setScalar(this.threshold),
      (this.edgesMaterial.uniforms.u_texelSize =
        this.weightsMaterial.uniforms.u_texelSize =
        this.material.uniforms.u_texelSize =
          e.sharedUniforms.u_texelSize),
      (this.edgesMaterial.uniforms.u_texture.value = e.fromTexture),
      fboHelper.render(this.edgesMaterial, this.edgesRenderTarget),
      fboHelper.render(this.weightsMaterial, this.weightsRenderTarget),
      fboHelper.setColorState(r),
      (this.material.uniforms.u_texture.value = e.fromTexture),
      super.render(e, t);
  }
  _createTexture(e) {
    let t = new Texture(e);
    return (t.generateMipmaps = !1), (t.flipY = !1), t;
  }
}
const bokehCocShader = `#define GLSLIFY 1
uniform sampler2D u_texture;uniform sampler2D u_depthTexture;uniform vec2 u_texelSize;uniform float u_focusDistance;uniform float u_lensCoeff;uniform float u_maxCoC;uniform float u_rcpMaxCoC;uniform float u_cameraNear;uniform float u_cameraFar;varying vec2 v_uv;float max3(vec3 xyz){return max(xyz.x,max(xyz.y,xyz.z));}
#ifndef USE_FLOAT
uniform float u_hashNoise;float hash13(vec3 p3){p3=fract(p3*.1031);p3+=dot(p3,p3.yzx+33.33);return fract((p3.x+p3.y)*p3.z);}
#endif
float getViewZ(vec2 uv){float depth=texture2D(u_depthTexture,uv).r*2.0-1.0;return 2.0*u_cameraNear*u_cameraFar/(u_cameraFar+u_cameraNear-depth*(u_cameraFar-u_cameraNear));}void main(){vec3 duv=u_texelSize.xyx*vec3(0.5,0.5,-0.5);vec3 c0=texture2D(u_texture,v_uv-duv.xy).rgb;vec3 c1=texture2D(u_texture,v_uv-duv.zy).rgb;vec3 c2=texture2D(u_texture,v_uv+duv.zy).rgb;vec3 c3=texture2D(u_texture,v_uv+duv.xy).rgb;vec2 uvAlt=v_uv;float d0=getViewZ(uvAlt-duv.xy);float d1=getViewZ(uvAlt-duv.zy);float d2=getViewZ(uvAlt+duv.zy);float d3=getViewZ(uvAlt+duv.xy);vec4 depths=vec4(d0,d1,d2,d3);float focusDistance=u_focusDistance;vec4 cocs=(depths-focusDistance)*u_lensCoeff/depths;cocs=clamp(cocs,-u_maxCoC,u_maxCoC);vec4 weights=clamp(abs(cocs)*u_rcpMaxCoC,vec4(0.0),vec4(1.0));weights.x*=1.0/(max3(c0)+1.0);weights.y*=1.0/(max3(c1)+1.0);weights.z*=1.0/(max3(c2)+1.0);weights.w*=1.0/(max3(c3)+1.0);vec3 avg=c0*weights.x+c1*weights.y+c2*weights.z+c3*weights.w;avg/=dot(weights,vec4(1.0));float coc=dot(cocs,vec4(0.25));avg*=smoothstep(0.0,u_texelSize.y*2.0,abs(coc));gl_FragColor=vec4(avg,coc);
#ifndef USE_FLOAT
gl_FragColor=sign(gl_FragColor)*sqrt(abs(gl_FragColor));gl_FragColor=gl_FragColor*0.5+0.5+hash13(vec3(gl_FragCoord.xy,u_hashNoise))/255.0;
#endif
}`,
  bokehSimShader = `#define GLSLIFY 1
#if QUALITY == 0
const int kSampleCount=16;vec2 kDiskKernel[kSampleCount];void initKernel(){kDiskKernel[0]=vec2(0.0,0.0);kDiskKernel[1]=vec2(0.54545456,0.0);kDiskKernel[2]=vec2(0.16855472,0.5187581);kDiskKernel[3]=vec2(-0.44128203,0.3206101);kDiskKernel[4]=vec2(-0.44128197,-0.3206102);kDiskKernel[5]=vec2(0.1685548,-0.5187581);kDiskKernel[6]=vec2(1.0,0.0);kDiskKernel[7]=vec2(0.809017,0.58778524);kDiskKernel[8]=vec2(0.30901697,0.95105654);kDiskKernel[9]=vec2(-0.30901703,0.9510565);kDiskKernel[10]=vec2(-0.80901706,0.5877852);kDiskKernel[11]=vec2(-1.0,0.0);kDiskKernel[12]=vec2(-0.80901694,-0.58778536);kDiskKernel[13]=vec2(-0.30901664,-0.9510566);kDiskKernel[14]=vec2(0.30901712,-0.9510565);kDiskKernel[15]=vec2(0.80901694,-0.5877853);}
#endif
#if QUALITY == 1
const int kSampleCount=22;vec2 kDiskKernel[kSampleCount];void initKernel(){kDiskKernel[0]=vec2(0.0,0.0);kDiskKernel[1]=vec2(0.53333336,0.0);kDiskKernel[2]=vec2(0.3325279,0.4169768);kDiskKernel[3]=vec2(-0.11867785,0.5199616);kDiskKernel[4]=vec2(-0.48051673,0.2314047);kDiskKernel[5]=vec2(-0.48051673,-0.23140468);kDiskKernel[6]=vec2(-0.11867763,-0.51996166);kDiskKernel[7]=vec2(0.33252785,-0.4169769);kDiskKernel[8]=vec2(1.0,0.0);kDiskKernel[9]=vec2(0.90096885,0.43388376);kDiskKernel[10]=vec2(0.6234898,0.7818315);kDiskKernel[11]=vec2(0.22252098,0.9749279);kDiskKernel[12]=vec2(-0.22252095,0.9749279);kDiskKernel[13]=vec2(-0.62349,0.7818314);kDiskKernel[14]=vec2(-0.90096885,0.43388382);kDiskKernel[15]=vec2(-1.0,0.0);kDiskKernel[16]=vec2(-0.90096885,-0.43388376);kDiskKernel[17]=vec2(-0.6234896,-0.7818316);kDiskKernel[18]=vec2(-0.22252055,-0.974928);kDiskKernel[19]=vec2(0.2225215,-0.9749278);kDiskKernel[20]=vec2(0.6234897,-0.7818316);kDiskKernel[21]=vec2(0.90096885,-0.43388376);}
#endif
#if QUALITY == 2
const int kSampleCount=43;vec2 kDiskKernel[kSampleCount];void initKernel(){kDiskKernel[0]=vec2(0.0,0.0);kDiskKernel[1]=vec2(0.36363637,0.0);kDiskKernel[2]=vec2(0.22672357,0.28430238);kDiskKernel[3]=vec2(-0.08091671,0.35451925);kDiskKernel[4]=vec2(-0.32762504,0.15777594);kDiskKernel[5]=vec2(-0.32762504,-0.15777591);kDiskKernel[6]=vec2(-0.08091656,-0.35451928);kDiskKernel[7]=vec2(0.22672352,-0.2843024);kDiskKernel[8]=vec2(0.6818182,0.0);kDiskKernel[9]=vec2(0.614297,0.29582983);kDiskKernel[10]=vec2(0.42510667,0.5330669);kDiskKernel[11]=vec2(0.15171885,0.6647236);kDiskKernel[12]=vec2(-0.15171883,0.6647236);kDiskKernel[13]=vec2(-0.4251068,0.53306687);kDiskKernel[14]=vec2(-0.614297,0.29582986);kDiskKernel[15]=vec2(-0.6818182,0);kDiskKernel[16]=vec2(-0.614297,-0.29582983);kDiskKernel[17]=vec2(-0.42510656,-0.53306705);kDiskKernel[18]=vec2(-0.15171856,-0.66472363);kDiskKernel[19]=vec2(0.1517192,-0.6647235);kDiskKernel[20]=vec2(0.4251066,-0.53306705);kDiskKernel[21]=vec2(0.614297,-0.29582983);kDiskKernel[22]=vec2(1.0,0.0);kDiskKernel[23]=vec2(0.9555728,0.2947552);kDiskKernel[24]=vec2(0.82623875,0.5633201);kDiskKernel[25]=vec2(0.6234898,0.7818315);kDiskKernel[26]=vec2(0.36534098,0.93087375);kDiskKernel[27]=vec2(0.07473,0.9972038);kDiskKernel[28]=vec2(-0.22252095,0.9749279);kDiskKernel[29]=vec2(-0.50000006,0.8660254);kDiskKernel[30]=vec2(-0.73305196,0.6801727);kDiskKernel[31]=vec2(-0.90096885,0.43388382);kDiskKernel[32]=vec2(-0.98883086,0.14904208);kDiskKernel[33]=vec2(-0.9888308,-0.14904249);kDiskKernel[34]=vec2(-0.90096885,-0.43388376);kDiskKernel[35]=vec2(-0.73305184,-0.6801728);kDiskKernel[36]=vec2(-0.4999999,-0.86602545);kDiskKernel[37]=vec2(-0.222521,-0.9749279);kDiskKernel[38]=vec2(0.07473029,-0.99720377);kDiskKernel[39]=vec2(0.36534148,-0.9308736);kDiskKernel[40]=vec2(0.6234897,-0.7818316);kDiskKernel[41]=vec2(0.8262388,-0.56332);kDiskKernel[42]=vec2(0.9555729,-0.29475483);}
#endif
#if QUALITY == 3
const int kSampleCount=71;vec2 kDiskKernel[kSampleCount];void initKernel(){kDiskKernel[0]=vec2(0,0);kDiskKernel[1]=vec2(0.2758621,0.0);kDiskKernel[2]=vec2(0.1719972,0.21567768);kDiskKernel[3]=vec2(-0.061385095,0.26894566);kDiskKernel[4]=vec2(-0.24854316,0.1196921);kDiskKernel[5]=vec2(-0.24854316,-0.11969208);kDiskKernel[6]=vec2(-0.061384983,-0.2689457);kDiskKernel[7]=vec2(0.17199717,-0.21567771);kDiskKernel[8]=vec2(0.51724136,0.0);kDiskKernel[9]=vec2(0.46601835,0.22442262);kDiskKernel[10]=vec2(0.32249472,0.40439558);kDiskKernel[11]=vec2(0.11509705,0.50427306);kDiskKernel[12]=vec2(-0.11509704,0.50427306);kDiskKernel[13]=vec2(-0.3224948,0.40439552);kDiskKernel[14]=vec2(-0.46601835,0.22442265);kDiskKernel[15]=vec2(-0.51724136,0.0);kDiskKernel[16]=vec2(-0.46601835,-0.22442262);kDiskKernel[17]=vec2(-0.32249463,-0.40439564);kDiskKernel[18]=vec2(-0.11509683,-0.5042731);kDiskKernel[19]=vec2(0.11509732,-0.504273);kDiskKernel[20]=vec2(0.32249466,-0.40439564);kDiskKernel[21]=vec2(0.46601835,-0.22442262);kDiskKernel[22]=vec2(0.7586207,0.0);kDiskKernel[23]=vec2(0.7249173,0.22360738);kDiskKernel[24]=vec2(0.6268018,0.4273463);kDiskKernel[25]=vec2(0.47299224,0.59311354);kDiskKernel[26]=vec2(0.27715522,0.7061801);kDiskKernel[27]=vec2(0.056691725,0.75649947);kDiskKernel[28]=vec2(-0.168809,0.7396005);kDiskKernel[29]=vec2(-0.3793104,0.65698475);kDiskKernel[30]=vec2(-0.55610836,0.51599306);kDiskKernel[31]=vec2(-0.6834936,0.32915324);kDiskKernel[32]=vec2(-0.7501475,0.113066405);kDiskKernel[33]=vec2(-0.7501475,-0.11306671);kDiskKernel[34]=vec2(-0.6834936,-0.32915318);kDiskKernel[35]=vec2(-0.5561083,-0.5159932);kDiskKernel[36]=vec2(-0.37931028,-0.6569848);kDiskKernel[37]=vec2(-0.16880904,-0.7396005);kDiskKernel[38]=vec2(0.056691945,-0.7564994);kDiskKernel[39]=vec2(0.2771556,-0.7061799);kDiskKernel[40]=vec2(0.47299215,-0.59311366);kDiskKernel[41]=vec2(0.62680185,-0.4273462);kDiskKernel[42]=vec2(0.72491735,-0.22360711);kDiskKernel[43]=vec2(1.0,0.0);kDiskKernel[44]=vec2(0.9749279,0.22252093);kDiskKernel[45]=vec2(0.90096885,0.43388376);kDiskKernel[46]=vec2(0.7818315,0.6234898);kDiskKernel[47]=vec2(0.6234898,0.7818315);kDiskKernel[48]=vec2(0.43388364,0.9009689);kDiskKernel[49]=vec2(0.22252098,0.9749279);kDiskKernel[50]=vec2(0.0,1.0);kDiskKernel[51]=vec2(-0.22252095,0.9749279);kDiskKernel[52]=vec2(-0.43388385,0.90096885);kDiskKernel[53]=vec2(-0.62349,0.7818314);kDiskKernel[54]=vec2(-0.7818317,0.62348956);kDiskKernel[55]=vec2(-0.90096885,0.43388382);kDiskKernel[56]=vec2(-0.9749279,0.22252093);kDiskKernel[57]=vec2(-1.0,0.0);kDiskKernel[58]=vec2(-0.9749279,-0.22252087);kDiskKernel[59]=vec2(-0.90096885,-0.43388376);kDiskKernel[60]=vec2(-0.7818314,-0.6234899);kDiskKernel[61]=vec2(-0.6234896,-0.7818316);kDiskKernel[62]=vec2(-0.43388346,-0.900969);kDiskKernel[63]=vec2(-0.22252055,-0.974928);kDiskKernel[64]=vec2(0.0,-1.0);kDiskKernel[65]=vec2(0.2225215,-0.9749278);kDiskKernel[66]=vec2(0.4338835,-0.90096897);kDiskKernel[67]=vec2(0.6234897,-0.7818316);kDiskKernel[68]=vec2(0.78183144,-0.62348986);kDiskKernel[69]=vec2(0.90096885,-0.43388376);kDiskKernel[70]=vec2(0.9749279,-0.22252086);}
#endif
uniform sampler2D u_cocTexture;uniform vec2 u_cocTexelSize;uniform float u_rcpAspect;uniform float u_maxCoC;varying vec2 v_uv;void main(){initKernel();vec4 samp0=texture2D(u_cocTexture,v_uv);
#ifndef USE_FLOAT
samp0=samp0*2.0-1.0;samp0=sign(samp0)*samp0*samp0;
#endif
vec4 bgAcc=vec4(0.0);vec4 fgAcc=vec4(0.0);for(int si=0;si<kSampleCount;si++){vec2 disp=kDiskKernel[si]*u_maxCoC;float dist=length(disp);vec2 duv=vec2(disp.x*u_rcpAspect,disp.y);vec4 samp=texture2D(u_cocTexture,v_uv+duv);
#ifndef USE_FLOAT
samp=samp*2.0-1.0;samp=sign(samp)*samp*samp;
#endif
float bgCoC=max(min(samp0.a,samp.a),0.0);float margin=u_cocTexelSize.y*2.0;float bgWeight=clamp((bgCoC-dist+margin)/margin,0.0,1.0);float fgWeight=clamp((-samp.a-dist+margin)/margin,0.0,1.0);fgWeight*=step(u_cocTexelSize.y,-samp.a);bgAcc+=vec4(samp.rgb,1.0)*bgWeight;fgAcc+=vec4(samp.rgb,1.0)*fgWeight;}bgAcc.rgb/=bgAcc.a+step(bgAcc.a,0.0);fgAcc.rgb/=fgAcc.a+step(fgAcc.a,0.0);bgAcc.a=smoothstep(u_cocTexelSize.y,u_cocTexelSize.y*2.0,samp0.a);fgAcc.a*=3.14159265359/float(kSampleCount);vec3 rgb=vec3(0.0);rgb=mix(rgb,bgAcc.rgb,clamp(bgAcc.a,0.0,1.0));rgb=mix(rgb,fgAcc.rgb,clamp(fgAcc.a,0.0,1.0));float alpha=(1.0-clamp(bgAcc.a,0.0,1.0))*(1.0-clamp(fgAcc.a,0.0,1.0));gl_FragColor=vec4(rgb,alpha);}`,
  bokehBlurShader = `#define GLSLIFY 1
uniform sampler2D u_bokehTexture;uniform vec2 u_bokehTexelSize;varying vec2 v_uv;void main(){vec4 duv=u_bokehTexelSize.xyxy*vec4(1.0,1.0,-1.0,0.0);vec4 acc;acc=texture2D(u_bokehTexture,v_uv-duv.xy);acc+=texture2D(u_bokehTexture,v_uv-duv.wy)*2.0;acc+=texture2D(u_bokehTexture,v_uv-duv.zy);acc+=texture2D(u_bokehTexture,v_uv+duv.zw)*2.0;acc+=texture2D(u_bokehTexture,v_uv)*4.0;acc+=texture2D(u_bokehTexture,v_uv+duv.xw)*2.0;acc+=texture2D(u_bokehTexture,v_uv+duv.zy);acc+=texture2D(u_bokehTexture,v_uv+duv.wy)*2.0;acc+=texture2D(u_bokehTexture,v_uv+duv.xy);gl_FragColor=acc*0.0625;}`,
  bokehFragmentShader = `#define GLSLIFY 1
varying vec2 v_uv;uniform sampler2D u_texture;uniform sampler2D u_blurTexture;uniform float u_amount;void main(){vec4 cs=texture2D(u_texture,v_uv);vec4 cb=texture2D(u_blurTexture,v_uv);vec3 rgb=cs.rgb*cb.a+cb.rgb;gl_FragColor=mix(cs,vec4(rgb,cs.a),u_amount);}`;
class Bokeh extends PostEffect {
  amount = 1;
  fNumber = 0.07;
  focusDistance = 5;
  useCameraFov = !1;
  focalLength = 0.463;
  kFilmHeight = 36;
  quality = 1;
  _prevQuality = -1;
  useFloatTexture = !1;
  _prevUseFloatTexture = null;
  useAdditionalBlur = !0;
  _halfWidth = 0;
  _halfHeight = 0;
  init(e) {
    Object.assign(
      this,
      {
        sharedUniforms: {
          u_depthTexture: { value: null },
          u_texelSize: { value: null },
          u_focusDistance: { value: 0 },
          u_fNumber: { value: 0 },
          u_lensCoeff: { value: 0 },
          u_maxCoC: { value: 0 },
          u_rcpMaxCoC: { value: 0 },
          u_rcpAspect: { value: 0 },
          u_cameraNear: { value: 0 },
          u_cameraFar: { value: 0 },
          u_amount: { value: 0 },
          u_halfTexelSize: { value: new Vector2() },
        },
      },
      e,
    ),
      super.init(),
      (this.rt2 = fboHelper.createRenderTarget(
        1,
        1,
        !1,
        postprocessing$1.useFloatTexture,
      )),
      (this.rt3 = fboHelper.createRenderTarget(
        1,
        1,
        !1,
        postprocessing$1.useFloatTexture,
      )),
      (this.cocMaterial = fboHelper.createRawShaderMaterial({
        uniforms: {
          u_texture: { value: null },
          u_hashNoise: { value: 0 },
          u_depthTexture: this.sharedUniforms.u_depthTexture,
          u_texelSize: this.sharedUniforms.u_texelSize,
          u_focusDistance: this.sharedUniforms.u_focusDistance,
          u_lensCoeff: this.sharedUniforms.u_lensCoeff,
          u_maxCoC: this.sharedUniforms.u_maxCoC,
          u_rcpMaxCoC: this.sharedUniforms.u_rcpMaxCoC,
          u_cameraNear: this.sharedUniforms.u_cameraNear,
          u_cameraFar: this.sharedUniforms.u_cameraFar,
        },
        fragmentShader: bokehCocShader,
      })),
      (this.simMaterial = fboHelper.createRawShaderMaterial({
        uniforms: {
          u_cocTexture: { value: null },
          u_cocTexelSize: this.sharedUniforms.u_halfTexelSize,
          u_rcpAspect: this.sharedUniforms.u_rcpAspect,
          u_maxCoC: this.sharedUniforms.u_maxCoC,
        },
        fragmentShader: bokehSimShader,
      })),
      (this.blurMaterial = fboHelper.createRawShaderMaterial({
        uniforms: {
          u_bokehTexture: { value: null },
          u_bokehTexelSize: this.sharedUniforms.u_halfTexelSize,
        },
        fragmentShader: bokehBlurShader,
      })),
      (this.material = fboHelper.createRawShaderMaterial({
        uniforms: {
          u_texture: { value: null },
          u_blurTexture: { value: null },
          u_amount: this.sharedUniforms.u_amount,
        },
        fragmentShader: fboHelper.precisionPrefix + bokehFragmentShader,
      }));
  }
  dispose() {
    this.rt1 && this.rt1.dispose(), this.rt2.dispose(), this.rt3.dispose();
  }
  needsRender() {
    return this.amount > 0;
  }
  _calculateFocalLength(e, t) {
    return (0.5 * t) / Math.tan(0.5 * e);
  }
  _calculateMaxCoCRadius(e, t) {
    let i = t * 4 + 6;
    return Math.min(0.05, i / e);
  }
  render(e, t = !1) {
    let i = e.width,
      n = e.height,
      r = Math.ceil(i / 2),
      o = Math.ceil(n / 2);
    (this.rt2.width !== r || this.rt2.height !== o) &&
      (this.rt1 && this.rt1.setSize(r, o),
      this.rt2.setSize(r, o),
      this.rt3.setSize(r, o),
      this.sharedUniforms.u_halfTexelSize.value.set(1 / r, 1 / o));
    let s = this._prevQuality !== this.quality,
      l = this._prevUseFloatTexture !== this.useFloatTexture,
      u = this.useCameraFov
        ? this._calculateFocalLength(
            e.sharedUniforms.u_cameraFovRad.value,
            e.camera.getFilmHeight(),
          )
        : this.focalLength,
      h = this.focusDistance,
      d = this.fNumber,
      c = (u * u) / (d * (h - u) * this.kFilmHeight * 2),
      m = this._calculateMaxCoCRadius(e.height, this.quality);
    (this.sharedUniforms.u_amount.value = this.amount),
      (this.sharedUniforms.u_texelSize.value =
        e.sharedUniforms.u_texelSize.value),
      (this.sharedUniforms.u_depthTexture.value =
        e.sharedUniforms.u_sceneDepthTexture.value),
      (this.sharedUniforms.u_cameraNear.value =
        e.sharedUniforms.u_cameraNear.value),
      (this.sharedUniforms.u_cameraFar.value =
        e.sharedUniforms.u_cameraFar.value),
      (this.sharedUniforms.u_focusDistance.value = h),
      (this.sharedUniforms.u_fNumber.value = d),
      (this.sharedUniforms.u_lensCoeff.value = c),
      (this.sharedUniforms.u_maxCoC.value = m),
      (this.sharedUniforms.u_rcpMaxCoC.value = 1 / m),
      (this.sharedUniforms.u_rcpAspect.value = e.height / e.width),
      l &&
        (this.rt1 && this.rt1.dispose(),
        (this.rt1 = fboHelper.createRenderTarget(
          r,
          o,
          !1,
          this.useFloatTexture || e.useFloatTexture,
        ))),
      (e.fromTexture.minFilter = e.fromTexture.magFilter = NearestFilter),
      l &&
        ((this.cocMaterial.defines.USE_FLOAT = this.useFloatTexture),
        (this.cocMaterial.needsUpdate = !0)),
      (this.cocMaterial.uniforms.u_hashNoise.value =
        (this.cocMaterial.uniforms.u_hashNoise.value + 1.2415) % 100),
      (this.cocMaterial.uniforms.u_texture.value = e.fromTexture),
      fboHelper.render(this.cocMaterial, this.rt1),
      (e.fromTexture.minFilter = e.fromTexture.magFilter = LinearFilter),
      (this.simMaterial.defines.QUALITY = this.quality),
      (this.simMaterial.uniforms.u_cocTexture.value = this.rt1.texture),
      s && (this.simMaterial.needsUpdate = !0),
      l &&
        ((this.simMaterial.defines.USE_FLOAT = this.useFloatTexture),
        (this.simMaterial.needsUpdate = !0)),
      fboHelper.render(this.simMaterial, this.rt2),
      this.useAdditionalBlur &&
        ((this.blurMaterial.uniforms.u_bokehTexture.value = this.rt2.texture),
        fboHelper.render(this.blurMaterial, this.rt3)),
      (this.material.uniforms.u_blurTexture.value = this.useAdditionalBlur
        ? this.rt3.texture
        : this.rt2.texture),
      (this._prevQuality = this.quality),
      (this._prevUseFloatTexture = this.useFloatTexture),
      super.render.call(this, e, t);
  }
}
const frag$b = `#define GLSLIFY 1
varying vec2 v_uv;uniform sampler2D u_texture;uniform sampler2D u_blurTexture0;
#if ITERATION > 1
uniform sampler2D u_blurTexture1;
#endif
#if ITERATION > 2
uniform sampler2D u_blurTexture2;
#endif
#if ITERATION > 3
uniform sampler2D u_blurTexture3;
#endif
#if ITERATION > 4
uniform sampler2D u_blurTexture4;
#endif
uniform float u_bloomWeights[ITERATION];uniform float u_saturation;
#include <common>
vec3 dithering(vec3 color){float grid_position=rand(gl_FragCoord.xy);vec3 dither_shift_RGB=vec3(0.25/255.0,-0.25/255.0,0.25/255.0);dither_shift_RGB=mix(2.0*dither_shift_RGB,-2.0*dither_shift_RGB,grid_position);return color+dither_shift_RGB;}void main(){vec4 color=texture2D(u_texture,v_uv);vec3 bloomColor=(u_bloomWeights[0]*texture2D(u_blurTexture0,v_uv)
#if ITERATION > 1
+u_bloomWeights[1]*texture2D(u_blurTexture1,v_uv)
#endif
#if ITERATION > 2
+u_bloomWeights[2]*texture2D(u_blurTexture2,v_uv)
#endif
#if ITERATION > 3
+u_bloomWeights[3]*texture2D(u_blurTexture3,v_uv)
#endif
#if ITERATION > 4
+u_bloomWeights[4]*texture2D(u_blurTexture4,v_uv)
#endif
).rgb;float luma=dot(bloomColor,vec3(0.299,0.587,0.114));color.rgb+=mix(vec3(luma),bloomColor,u_saturation);color.rgb=dithering(color.rgb);gl_FragColor=color;}`,
  highPassFrag = `#define GLSLIFY 1
uniform sampler2D u_texture;uniform float u_luminosityThreshold;uniform float u_smoothWidth;uniform float u_lumaStrength;uniform float u_selectiveStrength;
#ifdef USE_HALO
uniform vec2 u_texelSize;uniform vec2 u_aspect;uniform float u_haloWidth;uniform float u_haloRGBShift;uniform vec3 u_haloLeftColor;uniform vec3 u_haloMidColor;uniform vec3 u_haloRightColor;uniform float u_haloStrength;uniform float u_haloMaskInner;uniform float u_haloMaskOuter;
#ifdef USE_LENS_DIRT
uniform sampler2D u_dirtTexture;uniform vec2 u_dirtAspect;
#endif
#endif
#ifdef USE_CONVOLUTION
uniform float u_convolutionBuffer;
#endif
varying vec2 v_uv;void main(){vec2 uv=v_uv;
#ifdef USE_CONVOLUTION
uv=(uv-0.5)*(1.0+u_convolutionBuffer)+0.5;
#endif
vec4 texel=texture2D(u_texture,uv);float luma=dot(texel.xyz,vec3(0.299,0.587,0.114));float alpha=smoothstep(u_luminosityThreshold,u_luminosityThreshold+u_smoothWidth,luma);vec3 color=texel.rgb*(alpha*u_lumaStrength+texel.a*u_selectiveStrength);gl_FragColor=vec4(color,1.0);
#ifdef USE_HALO
vec2 toCenter=(uv-0.5)*u_aspect;vec2 ghostUv=1.0-(toCenter+0.5);vec2 ghostVec=(vec2(0.5)-ghostUv);vec2 direction=normalize(ghostVec);vec2 haloVec=direction*u_haloWidth;float weight=length(vec2(0.5)-fract(ghostUv+haloVec));weight=pow(1.0-weight,3.0);vec3 distortion=vec3(-u_texelSize.x,0.0,u_texelSize.x)*u_haloRGBShift;float zoomBlurRatio=fract(atan(toCenter.y,toCenter.x)*40.0)*0.05+0.95;ghostUv*=zoomBlurRatio;vec2 haloUv=ghostUv+haloVec;vec3 halo=(texture2D(u_texture,haloUv+direction*distortion.r).rgb*u_haloLeftColor+texture2D(u_texture,haloUv+direction*distortion.g).rgb*u_haloMidColor+texture2D(u_texture,haloUv+direction*distortion.b).rgb*u_haloRightColor)*u_haloStrength*smoothstep(u_haloMaskInner,u_haloMaskOuter,length(toCenter));
#ifdef USE_LENS_DIRT
vec2 dirtUv=(uv-0.5)*u_dirtAspect+0.5;vec3 dirt=texture2D(u_dirtTexture,dirtUv).rgb;gl_FragColor.rgb+=(halo+alpha+0.05*dirt)*dirt;
#else
gl_FragColor.rgb+=halo;
#endif
#endif
#ifdef USE_CONVOLUTION
gl_FragColor.rgb*=max(abs(uv.x-0.5),abs(uv.y-0.5))>0.5 ? 0. : 1.;
#endif
}`,
  blurFrag = `#define GLSLIFY 1
varying vec2 v_uv;uniform sampler2D u_texture;uniform vec2 u_resolution;uniform vec2 u_direction;float gaussianPdf(in float x,in float sigma){return 0.39894*exp(-0.5*x*x/(sigma*sigma))/sigma;}void main(){vec2 invSize=1.0/u_resolution;float fSigma=float(SIGMA);float weightSum=gaussianPdf(0.0,fSigma);vec3 diffuseSum=texture2D(u_texture,v_uv).rgb*weightSum;for(int i=1;i<KERNEL_RADIUS;i++){float x=float(i);float w=gaussianPdf(x,fSigma);vec2 uvOffset=u_direction*invSize*x;vec3 sample1=texture2D(u_texture,v_uv+uvOffset).rgb;vec3 sample2=texture2D(u_texture,v_uv-uvOffset).rgb;diffuseSum+=(sample1+sample2)*w;weightSum+=2.0*w;}gl_FragColor=vec4(diffuseSum/weightSum,1.0);}`,
  fftFrag = `#define GLSLIFY 1
uniform sampler2D u_texture;uniform vec2 u_texelSize;uniform float u_subtransformSize,u_normalization;uniform bool u_isHorizontal,u_isForward;const float TWOPI=6.283185307179586;void main(){float index=(u_isHorizontal ? gl_FragCoord.x : gl_FragCoord.y)-0.5;float evenIndex=floor(index/u_subtransformSize)*(u_subtransformSize*0.5)+mod(index,u_subtransformSize*0.5)+0.5;vec2 evenPos=(u_isHorizontal ? vec2(evenIndex,gl_FragCoord.y): vec2(gl_FragCoord.x,evenIndex))*u_texelSize;vec2 oddPos=evenPos+vec2(u_isHorizontal,!u_isHorizontal)*.5;vec4 even=texture2D(u_texture,evenPos);vec4 odd=texture2D(u_texture,oddPos);float twiddleArgument=(u_isForward ? TWOPI :-TWOPI)*(index/u_subtransformSize);vec2 twiddle=vec2(cos(twiddleArgument),sin(twiddleArgument));gl_FragColor=(even.rgba+vec4(twiddle.x*odd.xz-twiddle.y*odd.yw,twiddle.y*odd.xz+twiddle.x*odd.yw).xzyw)*u_normalization;}`,
  convolutionSrcFrag = `#define GLSLIFY 1
uniform vec2 u_aspect;varying vec2 v_uv;void main(){vec2 toCenter=(fract(v_uv+0.5)-0.5)*0.35*u_aspect;vec2 rotToCenter=mat2(0.7071067811865476,-0.7071067811865476,0.7071067811865476,0.7071067811865476)*toCenter;float res=exp(-length(toCenter)*2.0)*0.02+exp(-length(toCenter)*15.0)*0.5+exp(-length(toCenter)*50.0)*3.+exp(-length(rotToCenter*vec2(1.0,8.0))*75.0)*8.+exp(-length(rotToCenter*vec2(8.0,1.0))*75.0)*8.+exp(-length(rotToCenter*vec2(1.0,20.0))*150.0)*40.+exp(-length(rotToCenter*vec2(20.0,1.0))*150.0)*40.+exp(-length(toCenter*vec2(1.0,10.0))*60.0)*8.+exp(-length(toCenter*vec2(10.0,1.0))*60.0)*8.+exp(-length(toCenter*vec2(1.0,20.0))*120.0)*75.+exp(-length(toCenter*vec2(20.0,1.0))*120.0)*75.;gl_FragColor=vec4(res,0.0,res,0.0);}`,
  convolutionMixFrag = `#define GLSLIFY 1
varying vec2 v_uv;uniform sampler2D u_texture;uniform sampler2D u_kernelTexture;void main(){vec4 a=texture2D(u_texture,v_uv);vec4 b=texture2D(u_kernelTexture,v_uv);gl_FragColor=vec4(a.xz*b.xz-a.yw*b.yw,a.xz*b.yw+a.yw*b.xz).xzyw;}`,
  convolutionCacheFrag = `#define GLSLIFY 1
uniform sampler2D u_texture;uniform float u_amount;varying vec2 v_uv;void main(){gl_FragColor=texture2D(u_texture,v_uv)*u_amount;}`,
  convolutionFrag = `#define GLSLIFY 1
varying vec2 v_uv;uniform sampler2D u_texture;uniform sampler2D u_bloomTexture;uniform float u_convolutionBuffer;uniform float u_saturation;
#include <common>
vec3 dithering(vec3 color){float grid_position=rand(gl_FragCoord.xy);vec3 dither_shift_RGB=vec3(0.25/255.0,-0.25/255.0,0.25/255.0);dither_shift_RGB=mix(2.0*dither_shift_RGB,-2.0*dither_shift_RGB,grid_position);return color+dither_shift_RGB;}void main(){vec4 color=texture2D(u_texture,v_uv);vec2 bloomUv=(v_uv-0.5)*(1.0-u_convolutionBuffer)+0.5;vec3 bloomColor=texture2D(u_bloomTexture,bloomUv).rgb;float luma=dot(bloomColor,vec3(0.299,0.587,0.114));color.rgb+=mix(vec3(luma),bloomColor,u_saturation);color.rgb=dithering(color.rgb);gl_FragColor=color;}`;
let Bloom$1 = class extends PostEffect {
  ITERATION = 5;
  USE_CONVOLUTION = !0;
  USE_HD = !0;
  USE_LENS_DIRT = !1;
  amount = 1;
  radius = 0;
  threshold = 0.1;
  smoothWidth = 1;
  lumaStrength = 0.5;
  selectiveStrength = 1;
  saturation = 1;
  haloWidth = 0.8;
  haloRGBShift = 0.03;
  haloStrength = 0.21;
  haloLeftColorHex = "#ff0000";
  haloMidColorHex = "#00ff00";
  haloRightColorHex = "#0000ff";
  haloLeftColor = new Color();
  haloMidColor = new Color();
  haloRightColor = new Color();
  haloMaskInner = 0.3;
  haloMaskOuter = 0.5;
  highPassMaterial;
  highPassRenderTarget;
  fftMaterial;
  srcMaterial;
  convolutionSrcFrag = convolutionSrcFrag;
  srcSize = 256;
  srcRT;
  fftCacheRT1;
  fftCacheRT2;
  fftSrcRT;
  fftBloomOutCacheMaterial;
  fftBloomOutCacheRT;
  convolutionMixMaterial;
  convolutionMixDownScale = 1;
  convolutionBuffer = 0.1;
  renderTargetsHorizontal = [];
  renderTargetsVertical = [];
  blurMaterials = [];
  directionX = new Vector2(1, 0);
  directionY = new Vector2(0, 1);
  init(e) {
    Object.assign(this, e), super.init();
    let t = this.USE_HD ? HalfFloatType : !1;
    if (
      ((this.highPassRenderTarget = fboHelper.createRenderTarget(
        1,
        1,
        !this.USE_HD,
        t,
      )),
      (this.highPassMaterial = fboHelper.createRawShaderMaterial({
        uniforms: {
          u_texture: { value: null },
          u_luminosityThreshold: { value: 1 },
          u_smoothWidth: { value: 1 },
          u_lumaStrength: { value: 1 },
          u_selectiveStrength: { value: 1 },
          u_haloWidth: { value: 1 },
          u_haloRGBShift: { value: 1 },
          u_haloLeftColor: { value: this.haloLeftColor },
          u_haloMidColor: { value: this.haloMidColor },
          u_haloRightColor: { value: this.haloRightColor },
          u_haloStrength: { value: 1 },
          u_haloMaskInner: { value: 1 },
          u_haloMaskOuter: { value: 1 },
          u_texelSize: null,
          u_aspect: { value: new Vector2() },
          u_dirtTexture: { value: null },
          u_dirtAspect: { value: new Vector2() },
        },
        fragmentShader: highPassFrag,
      })),
      (this.highPassMaterial.defines.USE_LENS_DIRT = this.USE_LENS_DIRT),
      this.USE_CONVOLUTION)
    )
      (this.highPassMaterial.defines.USE_CONVOLUTION = !0),
        (this.highPassMaterial.uniforms.u_convolutionBuffer = { value: 0.15 }),
        (this.fftSrcRT = fboHelper.createRenderTarget(1, 1, !0, t)),
        (this.fftCacheRT1 = fboHelper.createRenderTarget(1, 1, !0, t)),
        (this.fftCacheRT2 = this.fftCacheRT1.clone()),
        (this.fftBloomOutCacheRT = fboHelper.createRenderTarget(1, 1)),
        (this.srcMaterial = fboHelper.createRawShaderMaterial({
          uniforms: { u_aspect: { value: new Vector2() } },
          fragmentShader: this.convolutionSrcFrag,
        })),
        (this.fftMaterial = fboHelper.createRawShaderMaterial({
          uniforms: {
            u_texture: { value: null },
            u_texelSize: { value: new Vector2() },
            u_subtransformSize: { value: 0 },
            u_normalization: { value: 0 },
            u_isHorizontal: { value: 0 },
            u_isForward: { value: 0 },
          },
          fragmentShader: fftFrag,
        })),
        (this.convolutionMixMaterial = fboHelper.createRawShaderMaterial({
          uniforms: {
            u_texture: { value: null },
            u_kernelTexture: { value: this.fftSrcRT.texture },
          },
          fragmentShader: convolutionMixFrag,
        })),
        (this.fftBloomOutCacheMaterial = fboHelper.createRawShaderMaterial({
          uniforms: { u_texture: { value: null }, u_amount: { value: 0 } },
          fragmentShader: convolutionCacheFrag,
        })),
        (this.material = fboHelper.createRawShaderMaterial({
          uniforms: {
            u_texture: { value: null },
            u_bloomTexture: { value: this.fftBloomOutCacheRT.texture },
            u_convolutionBuffer:
              this.highPassMaterial.uniforms.u_convolutionBuffer,
            u_saturation: { value: 0 },
          },
          fragmentShader: convolutionFrag,
          blending: NoBlending,
        }));
    else {
      for (let i = 0; i < this.ITERATION; i++) {
        this.renderTargetsHorizontal.push(
          fboHelper.createRenderTarget(1, 1, !1, t),
        ),
          this.renderTargetsVertical.push(
            fboHelper.createRenderTarget(1, 1, !1, t),
          );
        let n = 3 + i * 2;
        this.blurMaterials[i] = fboHelper.createRawShaderMaterial({
          uniforms: {
            u_texture: { value: null },
            u_resolution: { value: new Vector2() },
            u_direction: { value: null },
          },
          fragmentShader: blurFrag,
          defines: { KERNEL_RADIUS: n, SIGMA: n },
        });
      }
      this.material = fboHelper.createRawShaderMaterial({
        uniforms: {
          u_texture: { value: null },
          u_bloomStrength: { value: 1 },
          u_bloomWeights: { value: [] },
          u_saturation: { value: 0 },
        },
        fragmentShader: frag$b,
        blending: NoBlending,
        defines: { ITERATION: this.ITERATION },
      });
      for (let i = 0; i < this.ITERATION; i++)
        this.material.uniforms["u_blurTexture" + i] = {
          value: this.renderTargetsVertical[i].texture,
        };
    }
  }
  setDirtTexture(e) {
    this.highPassMaterial.uniforms.u_dirtTexture.value = e;
  }
  dispose() {
    if (!this.USE_CONVOLUTION) {
      this.highPassRenderTarget && this.highPassRenderTarget.dispose();
      for (let e = 0; e < this.ITERATION; e++)
        this.renderTargetsHorizontal[e] &&
          this.renderTargetsHorizontal[e].dispose(),
          this.renderTargetsVertical[e] &&
            this.renderTargetsVertical[e].dispose();
    }
  }
  needsRender() {
    return !!this.amount;
  }
  renderFFT(e, t, i) {
    let n = e.width,
      r = e.height,
      o = Math.round(Math.log(n) / Math.log(2)),
      s = Math.round(Math.log(r) / Math.log(2)),
      l = o + s,
      u = l % 2 === 0,
      h = this.fftMaterial,
      d = h.uniforms;
    for (let c = 0; c < l; c++) {
      let m = c < o;
      (d.u_texture.value = e.texture),
        (d.u_normalization.value = c === 0 ? 1 / Math.sqrt(n * r) : 1),
        (d.u_isHorizontal.value = !!m),
        (d.u_isForward.value = !!i),
        d.u_texelSize.value.set(1 / n, 1 / r),
        (d.u_subtransformSize.value = Math.pow(2, (m ? c : c - o) + 1)),
        fboHelper.render(h, t);
      let _ = e;
      (e = t), (t = _);
    }
    u && fboHelper.copy(e.texture, t);
  }
  render(e, t = !1) {
    let i = e.width,
      n = e.height,
      r,
      o;
    if (
      (this.USE_CONVOLUTION
        ? ((r = math.powerTwoCeiling(i / 2) >> this.convolutionMixDownScale),
          (o = math.powerTwoCeiling(n / 2) >> this.convolutionMixDownScale))
        : ((r = Math.ceil(i / 2)), (o = Math.ceil(n / 2))),
      r !== this.highPassRenderTarget.width ||
        o !== this.highPassRenderTarget.height)
    )
      if ((this.highPassRenderTarget.setSize(r, o), this.USE_CONVOLUTION)) {
        this.fftSrcRT.setSize(r, o),
          this.fftCacheRT1.setSize(r, o),
          this.fftCacheRT2.setSize(r, o),
          this.fftBloomOutCacheRT.setSize(r, o);
        let p = n / Math.max(i, n);
        this.srcMaterial.uniforms.u_aspect.value.set((i / n) * p, p),
          fboHelper.render(this.srcMaterial, this.fftCacheRT1),
          this.renderFFT(this.fftCacheRT1, this.fftSrcRT, !0);
      } else
        for (let p = 0; p < this.ITERATION; p++)
          this.renderTargetsHorizontal[p].setSize(r, o),
            this.renderTargetsVertical[p].setSize(r, o),
            this.blurMaterials[p].uniforms.u_resolution.value.set(r, o),
            (r = Math.ceil(r / 2)),
            (o = Math.ceil(o / 2));
    let s = this.highPassMaterial.uniforms;
    (s.u_texture.value = e.fromTexture),
      (s.u_luminosityThreshold.value = this.threshold),
      (s.u_smoothWidth.value = this.smoothWidth),
      (s.u_lumaStrength.value = this.lumaStrength),
      (s.u_selectiveStrength.value = this.selectiveStrength),
      (s.u_haloWidth.value = this.haloWidth),
      (s.u_haloRGBShift.value = this.haloRGBShift * i);
    let l = this.haloLeftColor.setStyle(this.haloLeftColorHex),
      u = this.haloMidColor.setStyle(this.haloMidColorHex),
      h = this.haloRightColor.setStyle(this.haloRightColorHex),
      d = l.r + u.r + h.r,
      c = l.g + u.g + h.g,
      m = l.b + u.b + h.b;
    (l.r = d ? l.r / d : 1),
      (l.g = c ? l.g / c : 0),
      (l.b = m ? l.b / m : 0),
      (u.r = d ? u.r / d : 0),
      (u.g = c ? u.g / c : 1),
      (u.b = m ? u.b / m : 0),
      (h.r = d ? h.r / d : 0),
      (h.g = c ? h.g / c : 0),
      (h.b = m ? h.b / m : 1),
      (s.u_haloStrength.value = this.haloStrength),
      (s.u_haloMaskInner.value = this.haloMaskInner),
      (s.u_haloMaskOuter.value = this.haloMaskOuter),
      (s.u_texelSize = e.sharedUniforms.u_texelSize),
      (s.u_aspect = e.sharedUniforms.u_aspect);
    let _ = this.haloStrength > 0,
      f = (n / Math.sqrt(i * i + n * n)) * 2;
    if (
      (s.u_aspect.value.set((i / n) * f, f),
      (f = n / Math.max(i, n)),
      s.u_dirtAspect.value.set((i / n) * f, f),
      (this.material.uniforms.u_saturation.value = this.saturation),
      this.highPassMaterial.defines.USE_HALO !== _ &&
        ((this.highPassMaterial.defines.USE_HALO = _),
        (this.highPassMaterial.needsUpdate = !0)),
      this.USE_CONVOLUTION &&
        (s.u_convolutionBuffer.value = this.convolutionBuffer),
      fboHelper.render(this.highPassMaterial, this.highPassRenderTarget),
      this.USE_CONVOLUTION)
    ) {
      fboHelper.copy(this.highPassRenderTarget.texture, this.fftCacheRT1),
        this.renderFFT(this.fftCacheRT1, this.fftCacheRT2, !0),
        (this.convolutionMixMaterial.uniforms.u_texture.value =
          this.fftCacheRT2.texture),
        fboHelper.render(this.convolutionMixMaterial, this.fftCacheRT1),
        this.renderFFT(this.fftCacheRT1, this.fftCacheRT2, !1);
      let p = this.amount * 1024;
      (p /= Math.pow(
        math.powerTwoCeilingBase(
          this.fftCacheRT1.width * this.fftCacheRT1.height,
        ),
        4,
      )),
        (this.fftBloomOutCacheMaterial.uniforms.u_amount.value = p),
        (this.fftBloomOutCacheMaterial.uniforms.u_texture.value =
          this.fftCacheRT2.texture),
        fboHelper.render(
          this.fftBloomOutCacheMaterial,
          this.fftBloomOutCacheRT,
        ),
        super.render(e, t);
    } else {
      let p = this.highPassRenderTarget;
      for (let g = 0; g < this.ITERATION; g++) {
        let w = this.blurMaterials[g];
        (w.uniforms.u_texture.value = p.texture),
          (w.uniforms.u_direction.value = this.directionX),
          fboHelper.render(w, this.renderTargetsHorizontal[g]),
          (w.uniforms.u_texture.value =
            this.renderTargetsHorizontal[g].texture),
          (w.uniforms.u_direction.value = this.directionY),
          fboHelper.render(w, this.renderTargetsVertical[g]),
          (p = this.renderTargetsVertical[g]);
      }
      this.material.uniforms.u_texture.value = e.fromTexture;
      for (let g = 0; g < this.ITERATION; g++) {
        let w = (this.ITERATION - g) / this.ITERATION;
        this.material.uniforms.u_bloomWeights.value[g] =
          (this.amount * (w + (1.2 - w * 2) * this.radius)) /
          Math.pow(2, this.ITERATION - g - 1);
      }
      super.render(e, t);
    }
  }
};
class ShaderHelper {
  glslifyStrip(e) {
    return e.replace(/#define\sGLSLIFY\s./, "");
  }
  addChunk(e, t) {
    ShaderChunk[e] = this.glslifyStrip(t);
  }
  _wrapInclude(e) {
    return "#include <" + e + ">";
  }
  insertBefore(e, t, i, n) {
    const r = n ? this._wrapInclude(t) : t;
    return e.replace(
      t,
      this.glslifyStrip(i) +
        `
` +
        r,
    );
  }
  insertAfter(e, t, i, n) {
    const r = n ? this._wrapInclude(t) : t;
    return e.replace(
      r,
      r +
        `
` +
        this.glslifyStrip(i) +
        `
`,
    );
  }
  replace(e, t, i, n) {
    const r = n ? this._wrapInclude(t) : t;
    return e.replace(
      r,
      `
` +
        this.glslifyStrip(i) +
        `
`,
    );
  }
}
const shaderHelper = new ShaderHelper(),
  getBlueNoiseShader = `#define GLSLIFY 1
uniform sampler2D u_blueNoiseTexture;uniform vec2 u_blueNoiseTexelSize;uniform vec2 u_blueNoiseCoordOffset;vec3 getBlueNoise(vec2 coord){return texture2D(u_blueNoiseTexture,coord*u_blueNoiseTexelSize+u_blueNoiseCoordOffset).rgb;}vec3 getStaticBlueNoise(vec2 coord){return texture2D(u_blueNoiseTexture,coord*u_blueNoiseTexelSize).rgb;}`;
class BlueNoise {
  sharedUniforms = {
    u_blueNoiseTexture: { value: null },
    u_blueNoiseLinearTexture: { value: null },
    u_blueNoiseTexelSize: { value: null },
    u_blueNoiseCoordOffset: { value: new Vector2() },
  };
  TEXTURE_SIZE = 128;
  preInit() {
    let e = new Texture();
    (e.generateMipmaps = !1),
      (e.minFilter = e.magFilter = LinearFilter),
      (e.wrapS = e.wrapT = RepeatWrapping);
    let t = new Texture(
      properties.loader.add(settings.TEXTURE_PATH + "LDR_RGB1_0.png", {
        onLoad: function () {
          (t.needsUpdate = !0), (e.needsUpdate = !0);
        },
      }).content,
    );
    (e.image = t.image),
      (t.generateMipmaps = !1),
      (t.minFilter = t.magFilter = NearestFilter),
      (t.wrapS = t.wrapT = RepeatWrapping),
      (this.sharedUniforms.u_blueNoiseTexture.value = t),
      (this.sharedUniforms.u_blueNoiseLinearTexture.value = e),
      (this.sharedUniforms.u_blueNoiseTexelSize.value = new Vector2(
        1 / this.TEXTURE_SIZE,
        1 / this.TEXTURE_SIZE,
      )),
      shaderHelper.addChunk("getBlueNoise", getBlueNoiseShader);
  }
  update(e) {
    this.sharedUniforms.u_blueNoiseCoordOffset.value.set(
      Math.random(),
      Math.random(),
    );
  }
}
const blueNoise = new BlueNoise(),
  frag$a = `#define GLSLIFY 1
uniform sampler2D u_texture;uniform sampler2D u_screenPaintTexture;uniform vec2 u_screenPaintTexelSize;uniform float u_amount;uniform float u_rgbShift;uniform float u_multiplier;uniform float u_colorMultiplier;uniform float u_shade;varying vec2 v_uv;
#include <getBlueNoise>
void main(){vec3 bnoise=getBlueNoise(gl_FragCoord.xy+vec2(17.,29.));vec4 data=texture2D(u_screenPaintTexture,v_uv);float weight=(data.z+data.w)*0.5;vec2 vel=(0.5-data.xy-0.001)*2.*weight;vec4 color=vec4(0.0);vec2 velocity=vel*u_amount/4.0*u_screenPaintTexelSize*u_multiplier;vec2 uv=v_uv+bnoise.xy*velocity;for(int i=0;i<9;i++){color+=texture2D(u_texture,uv);uv+=velocity;}color/=9.;color.rgb+=sin(vec3(vel.x+vel.y)*40.0+vec3(0.0,2.0,4.0)*u_rgbShift)*smoothstep(0.4,-0.9,weight)*u_shade*max(abs(vel.x),abs(vel.y))*u_colorMultiplier;gl_FragColor=color;}`;
class ScreenPaintDistortion extends PostEffect {
  amount = 20;
  rgbShift = 1;
  multiplier = 1.25;
  colorMultiplier = 1;
  shade = 1.25;
  renderOrder = 10;
  init(e) {
    Object.assign(this, e),
      super.init(),
      (this.material = fboHelper.createRawShaderMaterial({
        uniforms: Object.assign(
          {
            u_texture: { value: null },
            u_screenPaintTexture: screenPaint.sharedUniforms.u_currPaintTexture,
            u_screenPaintTexelSize: screenPaint.sharedUniforms.u_paintTexelSize,
            u_amount: { value: 0 },
            u_rgbShift: { value: 0 },
            u_multiplier: { value: 0 },
            u_colorMultiplier: { value: 0 },
            u_shade: { value: 0 },
          },
          blueNoise.sharedUniforms,
        ),
        fragmentShader: frag$a,
      }));
  }
  needsRender() {
    return this.amount > 0;
  }
  syncCamera(e) {
    (this.needsSync = !0),
      e &&
        (e.matrixWorldInverse.decompose(
          this._position,
          this._quaternion,
          this._scale,
        ),
        this.projectionViewMatrix.multiplyMatrices(
          e.projectionMatrix,
          e.matrixWorldInverse,
        ),
        this.projectionViewInverseMatrix
          .copy(this.projectionViewMatrix)
          .invert()),
      this.prevProjectionViewMatrix.copy(this.projectionViewMatrix);
  }
  render(e, t = !1) {
    (this.material.uniforms.u_amount.value = this.amount),
      (this.material.uniforms.u_rgbShift.value = this.rgbShift),
      (this.material.uniforms.u_multiplier.value = this.multiplier),
      (this.material.uniforms.u_colorMultiplier.value = this.colorMultiplier),
      (this.material.uniforms.u_shade.value = this.shade),
      super.render(e, t);
  }
}
const fragmentShader$1 = `#define GLSLIFY 1
uniform sampler2D u_texture;uniform sampler2D u_depthTexture;uniform mat4 u_projectionViewInverseMatrix;uniform mat4 u_prevProjectionViewMatrix;uniform float u_amount;varying vec2 v_uv;
#include <getBlueNoise>
void main(){vec3 bnoise=getBlueNoise(gl_FragCoord.xy);float depth=texture2D(u_depthTexture,v_uv).r;vec4 ndc=vec4(v_uv.xy*2.0-1.0,depth,1.0);vec4 worldPos=u_projectionViewInverseMatrix*ndc;vec4 prevPos=u_prevProjectionViewMatrix*worldPos;prevPos/=prevPos.w;prevPos.xy=prevPos.xy*0.5+0.5;vec2 velocity=(prevPos.xy-v_uv)/9.0*u_amount;vec2 uv=v_uv+bnoise.xy*velocity;vec4 color=vec4(0.0);float weightSum=0.0;float weight=1.0;float weightFalloff=1.0;for(int i=0;i<9;i++){color+=texture2D(u_texture,uv)*weight;uv+=velocity;weightSum+=weight;weight*=weightFalloff;}gl_FragColor=color/weightSum;}`;
class CameraMotionBlur extends PostEffect {
  needsSync = !0;
  amount = 1;
  _position = null;
  _quaternion = null;
  _scale = null;
  _v1 = null;
  _q = null;
  _v2 = null;
  projectionMatrix = null;
  prevProjectionMatrix = null;
  projectionViewMatrix = null;
  prevProjectionViewMatrix = null;
  projectionViewInverseMatrix = null;
  init(e) {
    Object.assign(this, e),
      super.init(),
      (this._position = new Vector3()),
      (this._quaternion = new Quaternion()),
      (this._scale = new Vector3(1, 1, 1)),
      (this._v1 = new Vector3()),
      (this._q = new Quaternion()),
      (this._v2 = new Vector3()),
      (this.projectionViewMatrix = new Matrix4()),
      (this.prevProjectionViewMatrix = new Matrix4()),
      (this.projectionViewInverseMatrix = new Matrix4()),
      (this.material = fboHelper.createRawShaderMaterial({
        uniforms: Object.assign(
          {
            u_texture: { value: null },
            u_depthTexture: { value: null },
            u_amount: { value: 1 },
            u_projectionViewInverseMatrix: {
              value: this.projectionViewInverseMatrix,
            },
            u_prevProjectionViewMatrix: {
              value: this.prevProjectionViewMatrix,
            },
          },
          blueNoise.sharedUniforms,
        ),
        fragmentShader: fragmentShader$1,
      }));
  }
  needsRender() {
    let e = this.amount > 0;
    return (this.needsSync = !e), e;
  }
  syncCamera(e) {
    (this.needsSync = !0),
      e &&
        (e.matrixWorldInverse.decompose(
          this._position,
          this._quaternion,
          this._scale,
        ),
        this.projectionViewMatrix.multiplyMatrices(
          e.projectionMatrix,
          e.matrixWorldInverse,
        ),
        this.projectionViewInverseMatrix
          .copy(this.projectionViewMatrix)
          .invert()),
      this.prevProjectionViewMatrix.copy(this.projectionViewMatrix);
  }
  render(e, t = !1) {
    let i = e.camera;
    (this.material.uniforms.u_depthTexture =
      e.sharedUniforms.u_sceneDepthTexture),
      (this.material.uniforms.u_amount.value = this.amount),
      this.needsSync || e.hasSizeChanged
        ? (this.syncCamera(i), (this.needsSync = !1))
        : this.prevProjectionViewMatrix.copy(this.projectionViewMatrix),
      this.projectionViewMatrix.multiplyMatrices(
        i.projectionMatrix,
        i.matrixWorldInverse,
      ),
      this.projectionViewInverseMatrix.copy(this.projectionViewMatrix).invert(),
      super.render(e, t);
  }
}
class Ease {
  quadIn(e) {
    return e * e;
  }
  quadOut(e) {
    return e * (2 - e);
  }
  quadInOut(e) {
    return (e *= 2) < 1 ? 0.5 * e * e : -0.5 * (--e * (e - 2) - 1);
  }
  cubicIn(e) {
    return e * e * e;
  }
  cubicOut(e) {
    return --e * e * e + 1;
  }
  cubicInOut(e) {
    return (e *= 2) < 1 ? 0.5 * e * e * e : 0.5 * ((e -= 2) * e * e + 2);
  }
  quartIn(e) {
    return e * e * e * e;
  }
  quartOut(e) {
    return 1 - --e * e * e * e;
  }
  quartInOut(e) {
    return (e *= 2) < 1
      ? 0.5 * e * e * e * e
      : -0.5 * ((e -= 2) * e * e * e - 2);
  }
  quintIn(e) {
    return e * e * e * e * e;
  }
  quintOut(e) {
    return --e * e * e * e * e + 1;
  }
  quintInOut(e) {
    return (e *= 2) < 1
      ? 0.5 * e * e * e * e * e
      : 0.5 * ((e -= 2) * e * e * e * e + 2);
  }
  sineIn(e) {
    return 1 - Math.cos((e * Math.PI) / 2);
  }
  sineOut(e) {
    return Math.sin((e * Math.PI) / 2);
  }
  sineInOut(e) {
    return 0.5 * (1 - Math.cos(Math.PI * e));
  }
  expoIn(e) {
    return e === 0 ? 0 : Math.pow(1024, e - 1);
  }
  expoOut(e) {
    return e === 1 ? 1 : 1 - Math.pow(2, -10 * e);
  }
  expoInOut(e) {
    return e === 0
      ? 0
      : e === 1
      ? 1
      : (e *= 2) < 1
      ? 0.5 * Math.pow(1024, e - 1)
      : 0.5 * (-Math.pow(2, -10 * (e - 1)) + 2);
  }
  circIn(e) {
    return 1 - Math.sqrt(1 - e * e);
  }
  circOut(e) {
    return Math.sqrt(1 - --e * e);
  }
  circInOut(e) {
    return (e *= 2) < 1
      ? -0.5 * (Math.sqrt(1 - e * e) - 1)
      : 0.5 * (Math.sqrt(1 - (e -= 2) * e) + 1);
  }
  elasticIn(e) {
    let t,
      i = 0.1,
      n = 0.4;
    return e === 0
      ? 0
      : e === 1
      ? 1
      : (!i || i < 1
          ? ((i = 1), (t = n / 4))
          : (t = (n * Math.asin(1 / i)) / (2 * Math.PI)),
        -(
          i *
          Math.pow(2, 10 * (e -= 1)) *
          Math.sin(((e - t) * 2 * Math.PI) / n)
        ));
  }
  elasticOut(e) {
    let t,
      i = 0.1,
      n = 0.4;
    return e === 0
      ? 0
      : e === 1
      ? 1
      : (!i || i < 1
          ? ((i = 1), (t = n / 4))
          : (t = (n * Math.asin(1 / i)) / (2 * Math.PI)),
        i * Math.pow(2, -10 * e) * Math.sin(((e - t) * 2 * Math.PI) / n) + 1);
  }
  elasticInOut(e) {
    let t,
      i = 0.1,
      n = 0.4;
    return e === 0
      ? 0
      : e === 1
      ? 1
      : (!i || i < 1
          ? ((i = 1), (t = n / 4))
          : (t = (n * Math.asin(1 / i)) / (2 * Math.PI)),
        (e *= 2) < 1
          ? -0.5 *
            i *
            Math.pow(2, 10 * (e -= 1)) *
            Math.sin(((e - t) * 2 * Math.PI) / n)
          : i *
              Math.pow(2, -10 * (e -= 1)) *
              Math.sin(((e - t) * 2 * Math.PI) / n) *
              0.5 +
            1);
  }
  backIn(e) {
    let t = 1.70158;
    return e * e * ((t + 1) * e - t);
  }
  backOut(e) {
    let t = 1.70158;
    return --e * e * ((t + 1) * e + t) + 1;
  }
  backInOut(e) {
    let t = 2.5949095;
    return (e *= 2) < 1
      ? 0.5 * e * e * ((t + 1) * e - t)
      : 0.5 * ((e -= 2) * e * ((t + 1) * e + t) + 2);
  }
  bounceIn(e) {
    return 1 - this.bounceOut(1 - e);
  }
  bounceOut(e) {
    return e < 1 / 2.75
      ? 7.5625 * e * e
      : e < 2 / 2.75
      ? 7.5625 * (e -= 1.5 / 2.75) * e + 0.75
      : e < 2.5 / 2.75
      ? 7.5625 * (e -= 2.25 / 2.75) * e + 0.9375
      : 7.5625 * (e -= 2.625 / 2.75) * e + 0.984375;
  }
  bounceInOut(e) {
    return e < 0.5
      ? this.bounceIn(e * 2) * 0.5
      : this.bounceOut(e * 2 - 1) * 0.5 + 0.5;
  }
  cubicBezier(e, t, i, n, r) {
    if (e <= 0) return 0;
    if (e >= 1) return 1;
    if (t === i && n === r) return e;
    const o = (D, I, N, Y) => 1 / (3 * I * D * D + 2 * N * D + Y),
      s = (D, I, N, Y, j) => I * (D * D * D) + N * (D * D) + Y * D + j,
      l = (D, I, N, Y, j) => {
        let X = D * D;
        return I * (X * D) + N * X + Y * D + j;
      };
    let u = 0,
      h = 0,
      d = t,
      c = i,
      m = n,
      _ = r,
      f = 1,
      p = 1,
      g = f - 3 * m + 3 * d - u,
      w = 3 * m - 6 * d + 3 * u,
      x = 3 * d - 3 * u,
      y = u,
      b = p - 3 * _ + 3 * c - h,
      C = 3 * _ - 6 * c + 3 * h,
      L = 3 * c - 3 * h,
      v = h,
      A = e,
      P,
      V,
      K;
    for (P = 0; P < 100; P++)
      (V = s(A, g, w, x, y)),
        (K = o(A, g, w, x)),
        K === 1 / 0 && (K = e),
        (A -= (V - e) * K),
        (A = Math.min(Math.max(A, 0), 1));
    return l(A, b, C, L, v);
  }
}
const ease = new Ease(),
  fragmentShader = `#define GLSLIFY 1
varying vec2 v_uv;uniform sampler2D u_texture;uniform vec3 u_bgColor;uniform float u_opacity;uniform float u_vignetteFrom;uniform float u_vignetteTo;uniform vec2 u_vignetteAspect;uniform vec3 u_vignetteColor;uniform float u_saturation;uniform float u_contrast;uniform float u_brightness;uniform vec3 u_tintColor;uniform float u_tintOpacity;uniform float u_ditherSeed;uniform float u_debugAlpha;uniform float u_aspect;uniform float u_relayersHide;uniform float u_joinHide;uniform vec3 u_joinMaskColor;uniform float u_evernetTransition;uniform vec3 u_evernetTransitionColor;uniform sampler2D u_cacheTexture;uniform sampler2D u_screenPaintTexture;uniform vec2 u_screenPaintTexelSize;float hash13(vec3 p3){p3=fract(p3*.1031);p3+=dot(p3,p3.yzx+33.33);return fract((p3.x+p3.y)*p3.z);}vec3 screen(vec3 cb,vec3 cs){return cb+cs-(cb*cs);}vec3 colorDodge(vec3 cb,vec3 cs){return mix(min(vec3(1.0),cb/(1.0-cs)),vec3(1.0),step(vec3(1.0),cs));}float ndot(vec2 a,vec2 b){return a.x*b.x-a.y*b.y;}float sdRhombus(in vec2 p,in vec2 b){p=abs(p);float h=clamp(ndot(b-2.0*p,b)/dot(b,b),-1.0,1.0);float d=length(p-0.5*b*vec2(1.0-h,1.0+h));return d*sign(p.x*b.y+p.y*b.x-b.x*b.y);}float linearStep(float edge0,float edge1,float x){return clamp((x-edge0)/(edge1-edge0),0.0,1.0);}
#include <getBlueNoise>
void main(){vec2 uv=v_uv;vec3 blueNoise=getBlueNoise(gl_FragCoord.xy);vec2 aspect=vec2(u_aspect,1.);vec2 planeAspect=vec2(2.,1.);float easedJoinHide=linearStep(0.75,1.,u_joinHide);easedJoinHide=easedJoinHide*easedJoinHide;uv=uv-.5;float scaleTo=max(u_aspect,1.)*3.;uv*=mix(1.,scaleTo,easedJoinHide);uv-=vec2(0.0,scaleTo*0.15*easedJoinHide);uv=uv+.5;float outDist=max(0.,(abs(uv.x-.5)*aspect.x-1.)/planeAspect.x);float clampX=1./u_aspect;uv.x=clamp(uv.x,0.5-clampX,0.5+clampX);uv=uv+(blueNoise.xy-.5)*planeAspect*min(outDist,0.1)*0.2;vec4 texel=texture2D(u_texture,uv);vec3 color=texel.rgb;float dRelayers=sdRhombus((v_uv-0.5)*aspect+vec2(0.0,-0.15),vec2(u_relayersHide*2.0));float innerRelayers=step(0.0,dRelayers)*step(0.00001,u_relayersHide);if(u_relayersHide>0.0){color=mix(color,texture2D(u_cacheTexture,v_uv).rgb,innerRelayers);}float luma=dot(color,vec3(0.299,0.587,0.114));color=mix(vec3(luma),color,1.0+u_saturation);color=0.5+(1.0+u_contrast)*(color-0.5);color+=u_brightness;color=mix(color,screen(colorDodge(color,u_tintColor),u_tintColor),u_tintOpacity);float d=length((v_uv-0.5)*u_vignetteAspect)*2.0;color=mix(color,u_vignetteColor,smoothstep(u_vignetteFrom,u_vignetteTo,d));color=mix(color,u_evernetTransitionColor,u_evernetTransition);float dJoin=sdRhombus((v_uv-0.5)*aspect+vec2(0.0,-0.2*u_joinHide),vec2((1.0-u_joinHide)*2.0));float innerJoin=step(0.0,dJoin);if(u_joinHide>0.0){vec4 screenPaintData=texture2D(u_screenPaintTexture,v_uv);float weight=(screenPaintData.z+screenPaintData.w)*0.5;vec2 vel=(0.5-screenPaintData.xy-0.001)*2.*weight;color=mix(color,u_joinMaskColor,innerJoin);color.rgb+=u_joinHide*innerJoin*(0.025*weight+1.0*sin(vec3(vel.x+vel.y)*40.0+vec3(0.0,2.0,4.0)*10.)*smoothstep(0.4,-0.9,weight)*max(abs(vel.x),abs(vel.y)));}gl_FragColor=vec4(mix(u_bgColor,color,u_opacity)+hash13(vec3(gl_FragCoord.xy,u_ditherSeed))/255.0,1.0);gl_FragColor.rgb=mix(gl_FragColor.rgb,texel.aaa,u_debugAlpha);}`;
class Final extends PostEffect {
  vignetteFrom = 0.6;
  vignetteTo = 1.6;
  vignetteAspect = new Vector2();
  vignetteColor = new Color();
  saturation = 1;
  contrast = 0;
  brightness = 1;
  tintColor = new Color();
  tintOpacity = 1;
  bgColor = new Color();
  opacity = 1;
  debugAlpha = !1;
  relayersHideRatio = 0;
  prevRelayersHideRatio = 0;
  joinHideRatio = 0;
  evernetTransition = 0;
  cacheRenderTarget = null;
  blurCacheRenderTarget = null;
  blurCacheRenderTarget2 = null;
  blurRatio = 0;
  init(e) {
    Object.assign(this, e),
      super.init(),
      (this.cacheRenderTarget = fboHelper.createRenderTarget(1, 1)),
      (this.blurCacheRenderTarget = fboHelper.createRenderTarget(1, 1)),
      (this.blurCacheRenderTarget2 = fboHelper.createRenderTarget(1, 1)),
      (this.material = fboHelper.createRawShaderMaterial({
        uniforms: Object.assign(
          {
            u_texture: { value: null },
            u_vignetteFrom: { value: 0 },
            u_vignetteTo: { value: 0 },
            u_vignetteAspect: { value: this.vignetteAspect },
            u_vignetteColor: { value: this.vignetteColor },
            u_saturation: { value: 0 },
            u_contrast: { value: 0 },
            u_brightness: { value: 0 },
            u_tintColor: { value: this.tintColor },
            u_tintOpacity: { value: 0 },
            u_bgColor: { value: this.bgColor },
            u_opacity: { value: 0 },
            u_ditherSeed: { value: 0 },
            u_debugAlpha: { value: 0 },
            u_aspect: { value: 0 },
            u_relayersHide: { value: 0 },
            u_joinHide: { value: 0 },
            u_joinMaskColor: { value: new Color("#203727") },
            u_evernetTransition: { value: 0 },
            u_evernetTransitionColor: { value: new Color("#8a84d4") },
            u_cacheTexture: { value: this.cacheRenderTarget.texture },
            u_screenPaintTexture: screenPaint.sharedUniforms.u_currPaintTexture,
            u_screenPaintTexelSize: screenPaint.sharedUniforms.u_paintTexelSize,
          },
          blueNoise.sharedUniforms,
        ),
        fragmentShader,
      }));
  }
  startTransition() {
    let e = postprocessing.width,
      t = postprocessing.height;
    (this.cacheRenderTarget.width !== e ||
      this.cacheRenderTarget.height !== t) &&
      this.cacheRenderTarget.setSize(e, t),
      fboHelper.copy(
        postprocessing.fromRenderTarget.texture,
        this.cacheRenderTarget,
      ),
      postprocessing.swap(),
      (this.blurRatio = 0);
  }
  render(e, t = !1) {
    const i = e.width,
      n = e.height;
    let r = this.material.uniforms;
    (r.u_vignetteFrom.value = this.vignetteFrom),
      (r.u_vignetteTo.value = this.vignetteTo);
    const o = n / Math.sqrt(i * i + n * n);
    this.vignetteAspect.set((i / n) * o, o),
      (r.u_saturation.value = this.saturation - 1),
      (r.u_contrast.value = this.contrast),
      (r.u_brightness.value = this.brightness - 1),
      (r.u_tintOpacity.value = this.tintOpacity),
      (r.u_opacity.value = this.opacity),
      (r.u_debugAlpha.value = this.debugAlpha ? 1 : 0),
      (r.u_ditherSeed.value = Math.random() * 1e3),
      (r.u_aspect.value = i / n),
      (r.u_relayersHide.value = this.relayersHideRatio),
      (r.u_cacheTexture.value = this.cacheRenderTarget.texture),
      (r.u_evernetTransition.value = this.evernetTransition),
      this.prevRelayersHideRatio === 0 &&
        this.relayersHideRatio > 0 &&
        (this.cacheRenderTarget.setSize(i, n),
        fboHelper.copy(e.fromTexture, this.cacheRenderTarget)),
      (this.prevRelayersHideRatio = this.relayersHideRatio),
      (r.u_joinHide.value = math.fit(this.joinHideRatio, 0, 1, 0, 0.925));
    let s = Math.max(this.evernetTransition, this.blurRatio),
      l = s > 0;
    if (((this.material.uniforms.u_texture.value = e.fromTexture), l)) {
      fboHelper.render(this.material, e.toRenderTarget);
      let u = math.smoothstep(0.667, 1, s);
      u &&
        blur$1.blur(
          u * 8,
          0.25,
          e.toRenderTarget,
          this.blurCacheRenderTarget,
          e.toRenderTarget,
        );
      let h = math.smoothstep(0.25, 0.667, s);
      h &&
        blur$1.blur(
          h * 4,
          0.5,
          e.toRenderTarget,
          this.blurCacheRenderTarget2,
          e.toRenderTarget,
        ),
        blur$1.blur(
          math.smoothstep(0, 0.333, s) * 4,
          1,
          e.toRenderTarget,
          e.fromRenderTarget,
          e.toRenderTarget,
        ),
        fboHelper.copy(e.toTexture);
    } else
      fboHelper.render(this.material, t ? null : e.toRenderTarget), e.swap();
  }
}
const frag$9 = `#define GLSLIFY 1
uniform sampler2D u_texture;uniform vec2 u_delta;uniform float u_aspect;uniform vec2 u_center;uniform float u_fromRadius;uniform float u_fromStrength;uniform float u_toRadius;uniform float u_toStrength;uniform float u_amount;varying vec2 v_uv;void main(){vec2 xy=v_uv*2.-1.-u_center;xy=xy*vec2(u_aspect,1.);float t=smoothstep(u_fromRadius,u_toRadius,length(xy));float strength=mix(u_fromStrength,u_toStrength,t)*u_amount;vec2 offset=u_delta*strength;vec4 color=texture2D(u_texture,v_uv)*0.1633;vec2 delta=offset;color+=texture2D(u_texture,v_uv-delta)*0.1531;color+=texture2D(u_texture,v_uv+delta)*0.1531;delta+=offset;color+=texture2D(u_texture,v_uv-delta)*0.12245;color+=texture2D(u_texture,v_uv+delta)*0.12245;delta+=offset;color+=texture2D(u_texture,v_uv-delta)*0.0918;color+=texture2D(u_texture,v_uv+delta)*0.0918;delta+=offset;color+=texture2D(u_texture,v_uv-delta)*0.051;color+=texture2D(u_texture,v_uv+delta)*0.051;gl_FragColor=color;}`;
class Bloom extends PostEffect {
  center = new Vector2(0, 0);
  fromRadius = 0;
  fromStrength = 1;
  toRadius = 1;
  toStrength = 0;
  amount = 1;
  blurRadius = 8;
  init(e) {
    Object.assign(this, e),
      super.init(),
      (this.material = fboHelper.createRawShaderMaterial({
        uniforms: {
          u_texture: { value: null },
          u_delta: { value: new Vector2() },
          u_aspect: { value: 1 },
          u_center: { value: this.center },
          u_fromRadius: { value: this.fromRadius },
          u_fromStrength: { value: this.fromStrength },
          u_toRadius: { value: this.toRadius },
          u_toStrength: { value: this.toStrength },
          u_amount: { value: this.amount },
        },
        fragmentShader: frag$9,
      })),
      (this.blurCache = fboHelper.createRenderTarget(1, 1));
  }
  needsRender() {
    return !!this.amount;
  }
  render(e, t = !1) {
    let i = e.width,
      n = e.height,
      r = this.blurRadius / 4,
      o = this.material.uniforms;
    (o.u_aspect.value = i / n),
      (o.u_fromRadius.value = this.fromRadius),
      (o.u_fromStrength.value = this.fromStrength),
      (o.u_toRadius.value = this.toRadius),
      (o.u_toStrength.value = this.toStrength),
      (o.u_amount.value = this.amount),
      o.u_delta.value.set(r / i, 0),
      super.render(e),
      o.u_delta.value.set(0, r / n),
      super.render(e, t);
  }
}
const easuFrag = `#define GLSLIFY 1
uniform sampler2D u_texture;uniform vec2 u_inResolution;uniform vec2 u_outResolution;vec3 FsrEasuCF(vec2 p){return texture2D(u_texture,p).rgb;}void FsrEasuCon(out vec4 con0,out vec4 con1,out vec4 con2,out vec4 con3,vec2 inputViewportInPixels,vec2 inputSizeInPixels,vec2 outputSizeInPixels){con0=vec4(inputViewportInPixels.x/outputSizeInPixels.x,inputViewportInPixels.y/outputSizeInPixels.y,.5*inputViewportInPixels.x/outputSizeInPixels.x-.5,.5*inputViewportInPixels.y/outputSizeInPixels.y-.5);con1=vec4(1,1,1,-1)/inputSizeInPixels.xyxy;con2=vec4(-1,2,1,2)/inputSizeInPixels.xyxy;con3=vec4(0,4,0,0)/inputSizeInPixels.xyxy;}void FsrEasuTapF(inout vec3 aC,inout float aW,vec2 off,vec2 dir,vec2 len,float lob,float clp,vec3 c){vec2 v=vec2(dot(off,dir),dot(off,vec2(-dir.y,dir.x)));v*=len;float d2=min(dot(v,v),clp);float wB=.4*d2-1.;float wA=lob*d2-1.;wB*=wB;wA*=wA;wB=1.5625*wB-.5625;float w=wB*wA;aC+=c*w;aW+=w;}void FsrEasuSetF(inout vec2 dir,inout float len,float w,float lA,float lB,float lC,float lD,float lE){float lenX=max(abs(lD-lC),abs(lC-lB));float dirX=lD-lB;dir.x+=dirX*w;lenX=clamp(abs(dirX)/lenX,0.,1.);lenX*=lenX;len+=lenX*w;float lenY=max(abs(lE-lC),abs(lC-lA));float dirY=lE-lA;dir.y+=dirY*w;lenY=clamp(abs(dirY)/lenY,0.,1.);lenY*=lenY;len+=lenY*w;}void FsrEasuF(out vec3 pix,vec2 ip,vec4 con0,vec4 con1,vec4 con2,vec4 con3){vec2 pp=ip*con0.xy+con0.zw;vec2 fp=floor(pp);pp-=fp;vec2 p0=fp*con1.xy+con1.zw;vec2 p1=p0+con2.xy;vec2 p2=p0+con2.zw;vec2 p3=p0+con3.xy;vec4 off=vec4(-.5,.5,-.5,.5)*con1.xxyy;vec3 bC=FsrEasuCF(p0+off.xw);float bL=bC.g+0.5*(bC.r+bC.b);vec3 cC=FsrEasuCF(p0+off.yw);float cL=cC.g+0.5*(cC.r+cC.b);vec3 iC=FsrEasuCF(p1+off.xw);float iL=iC.g+0.5*(iC.r+iC.b);vec3 jC=FsrEasuCF(p1+off.yw);float jL=jC.g+0.5*(jC.r+jC.b);vec3 fC=FsrEasuCF(p1+off.yz);float fL=fC.g+0.5*(fC.r+fC.b);vec3 eC=FsrEasuCF(p1+off.xz);float eL=eC.g+0.5*(eC.r+eC.b);vec3 kC=FsrEasuCF(p2+off.xw);float kL=kC.g+0.5*(kC.r+kC.b);vec3 lC=FsrEasuCF(p2+off.yw);float lL=lC.g+0.5*(lC.r+lC.b);vec3 hC=FsrEasuCF(p2+off.yz);float hL=hC.g+0.5*(hC.r+hC.b);vec3 gC=FsrEasuCF(p2+off.xz);float gL=gC.g+0.5*(gC.r+gC.b);vec3 oC=FsrEasuCF(p3+off.yz);float oL=oC.g+0.5*(oC.r+oC.b);vec3 nC=FsrEasuCF(p3+off.xz);float nL=nC.g+0.5*(nC.r+nC.b);vec2 dir=vec2(0.);float len=0.;FsrEasuSetF(dir,len,(1.-pp.x)*(1.-pp.y),bL,eL,fL,gL,jL);FsrEasuSetF(dir,len,pp.x*(1.-pp.y),cL,fL,gL,hL,kL);FsrEasuSetF(dir,len,(1.-pp.x)*pp.y,fL,iL,jL,kL,nL);FsrEasuSetF(dir,len,pp.x*pp.y,gL,jL,kL,lL,oL);vec2 dir2=dir*dir;float dirR=dir2.x+dir2.y;bool zro=dirR<(1./32768.);dirR=inversesqrt(dirR);dirR=zro ? 1. : dirR;dir.x=zro ? 1. : dir.x;dir*=vec2(dirR);len=len*.5;len*=len;float stretch=dot(dir,dir)/(max(abs(dir.x),abs(dir.y)));vec2 len2=vec2(1.+(stretch-1.0)*len,1.-.5*len);float lob=.5-.29*len;float clp=1./lob;vec3 min4=min(min(fC,gC),min(jC,kC));vec3 max4=max(max(fC,gC),max(jC,kC));vec3 aC=vec3(0);float aW=0.;FsrEasuTapF(aC,aW,vec2(0.,-1.)-pp,dir,len2,lob,clp,bC);FsrEasuTapF(aC,aW,vec2(1.,-1.)-pp,dir,len2,lob,clp,cC);FsrEasuTapF(aC,aW,vec2(-1.,1.)-pp,dir,len2,lob,clp,iC);FsrEasuTapF(aC,aW,vec2(0.,1.)-pp,dir,len2,lob,clp,jC);FsrEasuTapF(aC,aW,vec2(0.,0.)-pp,dir,len2,lob,clp,fC);FsrEasuTapF(aC,aW,vec2(-1.,0.)-pp,dir,len2,lob,clp,eC);FsrEasuTapF(aC,aW,vec2(1.,1.)-pp,dir,len2,lob,clp,kC);FsrEasuTapF(aC,aW,vec2(2.,1.)-pp,dir,len2,lob,clp,lC);FsrEasuTapF(aC,aW,vec2(2.,0.)-pp,dir,len2,lob,clp,hC);FsrEasuTapF(aC,aW,vec2(1.,0.)-pp,dir,len2,lob,clp,gC);FsrEasuTapF(aC,aW,vec2(1.,2.)-pp,dir,len2,lob,clp,oC);FsrEasuTapF(aC,aW,vec2(0.,2.)-pp,dir,len2,lob,clp,nC);pix=min(max4,max(min4,aC/aW));}void main(){vec3 c;vec4 con0,con1,con2,con3;FsrEasuCon(con0,con1,con2,con3,u_inResolution,u_inResolution,u_outResolution);FsrEasuF(c,gl_FragCoord.xy,con0,con1,con2,con3);gl_FragColor=vec4(c.xyz,1);}`,
  frag$8 = `#define GLSLIFY 1
uniform sampler2D u_texture;uniform vec2 u_outResolution;uniform float u_sharpness;
#define FSR_RCAS_LIMIT (0.25-(1.0/16.0))
vec4 FsrRcasLoadF(vec2 p);void FsrRcasCon(out float con,float sharpness){con=exp2(-sharpness);}vec3 FsrRcasF(vec2 ip,float con){vec2 sp=vec2(ip);vec3 b=FsrRcasLoadF(sp+vec2(0,-1)).rgb;vec3 d=FsrRcasLoadF(sp+vec2(-1,0)).rgb;vec3 e=FsrRcasLoadF(sp).rgb;vec3 f=FsrRcasLoadF(sp+vec2(1,0)).rgb;vec3 h=FsrRcasLoadF(sp+vec2(0,1)).rgb;float bL=b.g+.5*(b.b+b.r);float dL=d.g+.5*(d.b+d.r);float eL=e.g+.5*(e.b+e.r);float fL=f.g+.5*(f.b+f.r);float hL=h.g+.5*(h.b+h.r);float nz=.25*(bL+dL+fL+hL)-eL;nz=clamp(abs(nz)/(max(max(bL,dL),max(eL,max(fL,hL)))-min(min(bL,dL),min(eL,min(fL,hL)))),0.,1.);nz=1.-.5*nz;vec3 mn4=min(b,min(f,h));vec3 mx4=max(b,max(f,h));vec2 peakC=vec2(1.,-4.);vec3 hitMin=mn4/(4.*mx4);vec3 hitMax=(peakC.x-mx4)/(4.*mn4+peakC.y);vec3 lobeRGB=max(-hitMin,hitMax);float lobe=max(-FSR_RCAS_LIMIT,min(max(lobeRGB.r,max(lobeRGB.g,lobeRGB.b)),0.))*con;
#ifdef FSR_RCAS_DENOISE
lobe*=nz;
#endif
return(lobe*(b+d+h+f)+e)/(4.*lobe+1.);}vec4 FsrRcasLoadF(vec2 p){return texture2D(u_texture,p/u_outResolution.xy);}void main(){vec2 uv=gl_FragCoord.xy/u_outResolution.xy;float con;FsrRcasCon(con,u_sharpness);vec3 col=FsrRcasF(gl_FragCoord.xy,con);gl_FragColor=vec4(col,1.);}`;
class Fsr {
  sharpness = 1;
  _easuMaterial;
  _material;
  _inResolution = new Vector2();
  _outResolution = new Vector2();
  _cacheRenderTarget = null;
  constructor() {
    (this._cacheRenderTarget = fboHelper.createRenderTarget(
      1,
      1,
      !1,
      postprocessing$1.useFloatTexture,
    )),
      (this._easuMaterial = fboHelper.createRawShaderMaterial({
        uniforms: {
          u_texture: { value: null },
          u_inResolution: { value: this._inResolution },
          u_outResolution: { value: this._outResolution },
        },
        fragmentShader: easuFrag,
      })),
      (this._material = fboHelper.createRawShaderMaterial({
        uniforms: {
          u_texture: { value: this._cacheRenderTarget.texture },
          u_outResolution: this._easuMaterial.uniforms.u_outResolution,
          u_sharpness: { value: 0 },
        },
        fragmentShader: frag$8,
      }));
  }
  render(e, t) {
    let i = e.image.width,
      n = e.image.height;
    (this._material.uniforms.u_sharpness.value = this.sharpness),
      (this._inResolution.width !== i || this._inResolution.height !== n) &&
        this._inResolution.set(i, n);
    let r, o;
    t
      ? ((r = t.width), (o = t.height))
      : ((r = fboHelper.renderer.domElement.width),
        (o = fboHelper.renderer.domElement.height)),
      (this._outResolution.width !== r || this._outResolution.height !== o) &&
        (this._outResolution.set(r, o), this._cacheRenderTarget.setSize(r, o)),
      (this._easuMaterial.uniforms.u_texture.value = e),
      fboHelper.render(this._easuMaterial, this._cacheRenderTarget),
      t ||
        (fboHelper.renderer.setRenderTarget(null),
        fboHelper.renderer.setViewport(
          0,
          0,
          this._outResolution.x,
          this._outResolution.y,
        )),
      fboHelper.render(this._material, t);
  }
}
class Upscaler extends PostEffect {
  sharpness = 1;
  fsr;
  renderOrder = 100;
  init(e) {
    Object.assign(this, e), super.init(), (this.fsr = new Fsr());
  }
  render(e, t = !1) {
    (this.fsr.sharpness = this.sharpness),
      this.fsr.render(e.fromTexture, t ? null : e.toRenderTarget),
      e.swap();
  }
}
const frag$7 = `#define GLSLIFY 1
uniform sampler2D u_texture;uniform vec2 u_resolution;uniform float u_time;uniform vec3 u_color0;uniform vec3 u_color1;uniform float u_opacity;uniform sampler2D u_screenPaintTexture;uniform vec2 u_screenPaintTexelSize;varying vec2 v_uv;vec2 random2(vec2 p){return fract(sin(vec2(dot(p,vec2(127.1,311.7)),dot(p,vec2(269.5,183.3))))*43758.5453);}void main(){float yOffset=-4.0*(1.0-u_opacity);vec3 N=vec3(0.0,1.0,0.0);vec2 aspect=vec2(u_resolution.x/u_resolution.y,1.0);vec2 uvLow=(v_uv-0.5)*vec2(3.0,10.0+50.0*v_uv.y)*aspect+0.5;uvLow.y+=yOffset;vec4 data=texture2D(u_screenPaintTexture,v_uv);float weight=(data.z+data.w)*0.5;vec2 vel=(0.5-data.xy-0.001)*2.*weight;uvLow+=vel;vec2 i_uv=floor(uvLow);vec2 f_uv=fract(uvLow);float m_distLow=0.25;for(int j=-1;j<=1;j++){for(int i=-1;i<=1;i++){vec2 neighbor=vec2(float(i),float(j));vec2 offset=random2(i_uv+neighbor);offset=0.5+0.5*sin(u_time+6.2831*offset);vec2 pos=neighbor+offset-f_uv;float dist=length(pos);m_distLow=min(m_distLow,m_distLow*dist);}}m_distLow*=smoothstep(0.1,0.2,v_uv.y);vec2 uvHigh=(v_uv-0.5)*vec2(1.0+20.0*v_uv.y,1.0+50.0*v_uv.y)*aspect+0.5;uvHigh.y+=yOffset;uvHigh+=vel;i_uv=floor(uvHigh);f_uv=fract(uvHigh);float m_distHigh=1.;for(int j=-1;j<=1;j++){for(int i=-1;i<=1;i++){vec2 neighbor=vec2(float(i),float(j));vec2 offset=random2(i_uv+neighbor);offset=0.5+0.5*sin(u_time+6.2831*offset);vec2 pos=neighbor+offset-f_uv;float dist=length(pos);m_distHigh=min(m_distHigh,m_distHigh*dist);}}float shade=m_distLow;shade+=smoothstep(0.0,0.5,m_distLow);shade+=pow(smoothstep(0.3,0.0,m_distLow),4.0);vec3 color=mix(u_color0,u_color1,shade);color+=0.025*smoothstep(0.1,0.0,m_distHigh);color+=0.15*pow(smoothstep(0.12,0.2,m_distLow),2.0);color=mix(color,u_color1,v_uv.y*v_uv.y);N.z+=2.0*(4.0*m_distLow-0.5);N=normalize(N);vec3 lightPosition=vec3(-2.0,2.0,25.0);vec3 worldPosition=vec3(uvLow.x,0.0,uvLow.y);vec3 toLight=lightPosition-worldPosition;float lightDistance=length(toLight);vec3 L=toLight/lightDistance;float NdL=clamp(dot(N,L)+1.0,0.0,1.0);float attenuation=1.0-length(vec2(0.8,1.5)*((v_uv-0.5)*aspect+0.5+vec2(0.1,-1.0)));float shadow=0.2*smoothstep(0.0,0.3,attenuation*NdL);vec2 uv=v_uv+0.03*u_opacity*(m_distHigh+m_distLow);vec4 sceneColor=texture2D(u_texture,uv);gl_FragColor=mix(sceneColor,vec4(color-shadow,0.),u_opacity);}`;
class WaterPass extends PostEffect {
  amount = 1;
  init(e) {
    Object.assign(this, e),
      super.init(),
      (this.material = fboHelper.createRawShaderMaterial({
        uniforms: {
          u_texture: { value: null },
          u_resolution: { value: new Vector2() },
          u_time: properties.sharedUniforms.u_time,
          u_color0: { value: new Color("#9370DB") },
          u_color1: { value: new Color("#7447d1") },
          u_opacity: { value: 1 },
          u_screenPaintTexture: screenPaint.sharedUniforms.u_currPaintTexture,
          u_screenPaintTexelSize: screenPaint.sharedUniforms.u_paintTexelSize,
        },
        fragmentShader: frag$7,
      }));
  }
  needsRender() {
    return this.amount > 0;
  }
  render(e, t = !1) {
    let i = e.width,
      n = e.height,
      r = this.material.uniforms;
    r.u_resolution.value.set(i, n),
      (r.u_opacity.value = this.amount),
      super.render(e, t);
  }
}
class Postprocessing {
  width = 1;
  height = 1;
  scene = null;
  camera = null;
  resolution = new Vector2(0, 0);
  texelSize = new Vector2(0, 0);
  aspect = new Vector2(1, 1);
  onBeforeSceneRendered = new MinSignal$2();
  onAfterSceneRendered = new MinSignal$2();
  onAfterRendered = new MinSignal$2();
  sceneCacheRenderTarget = null;
  sceneCacheBlurCacheRenderTarget = null;
  sceneCacheBlurredRenderTarget = null;
  sceneCacheBlurredTextureSize = new Vector2(0, 0);
  sceneRenderTarget = null;
  fromRenderTarget = null;
  toRenderTarget = null;
  useDepthTexture = !0;
  depthTexture = null;
  fromTexture = null;
  toTexture = null;
  sceneTexture = null;
  queue = [];
  hasSizeChanged = !0;
  useMSAA = !1;
  postProfile = new PostProfile();
  useFloatTexture = !1;
  sharedUniforms = {
    u_sceneTexture: { value: null },
    u_sceneCacheTexture: { value: null },
    u_sceneCacheBlurredTexture: { value: null },
    u_sceneCacheBlurredTextureSize: {
      value: this.sceneCacheBlurredTextureSize,
    },
    u_fromTexture: { value: null },
    u_toTexture: { value: null },
    u_sceneDepthTexture: { value: null },
    u_cameraNear: { value: 0 },
    u_cameraFar: { value: 1 },
    u_cameraFovRad: { value: 1 },
    u_resolution: { value: this.resolution },
    u_texelSize: { value: this.texelSize },
    u_aspect: { value: this.aspect },
  };
  init(e, t) {
    if (
      ((this.scene = e),
      (this.camera = t),
      this.useMSAA
        ? (this.sceneRenderTarget = fboHelper.createMultisampleRenderTarget(
            1,
            1,
            !1,
            this.useFloatTexture,
          ))
        : (this.sceneRenderTarget = fboHelper.createRenderTarget(
            1,
            1,
            !1,
            this.useFloatTexture,
          )),
      (this.sharedUniforms.u_sceneTexture.value =
        this.sceneRenderTarget.texture),
      (this.sceneRenderTarget.depthBuffer = !0),
      (this.useMSAA = this.sceneRenderTarget.samples > 0),
      (this.fromRenderTarget = fboHelper.createRenderTarget(
        1,
        1,
        !1,
        this.useFloatTexture,
      )),
      (this.toRenderTarget = this.fromRenderTarget.clone()),
      (this.useDepthTexture =
        !!this.useDepthTexture &&
        fboHelper.renderer &&
        (fboHelper.renderer.capabilities.isWebGL2 ||
          fboHelper.renderer.extensions.get("WEBGL_depth_texture"))),
      (this.fromTexture = this.fromRenderTarget.texture),
      (this.toTexture = this.toRenderTarget.texture),
      (this.sceneTexture = this.sceneRenderTarget.texture),
      (this.sceneCacheRenderTarget = this.fromRenderTarget.clone()),
      (this.sceneCacheBlurCacheRenderTarget = this.fromRenderTarget.clone()),
      (this.sceneCacheBlurredRenderTarget = this.fromRenderTarget.clone()),
      (this.sharedUniforms.u_sceneCacheTexture.value =
        this.sceneCacheRenderTarget.texture),
      (this.sharedUniforms.u_sceneCacheBlurredTexture.value =
        this.sceneCacheBlurredRenderTarget.texture),
      this.useDepthTexture && fboHelper.renderer)
    ) {
      let i = new DepthTexture(this.resolution.width, this.resolution.height);
      fboHelper.renderer.capabilities.isWebGL2
        ? (i.type = UnsignedIntType)
        : ((i.format = DepthStencilFormat), (i.type = UnsignedInt248Type)),
        (i.minFilter = NearestFilter),
        (i.magFilter = NearestFilter),
        (this.sceneRenderTarget.depthTexture = i),
        (this.depthTexture = this.sharedUniforms.u_sceneDepthTexture.value = i);
    }
  }
  addQueue() {
    if (!this.useMSAA) {
      let o = (this.smaa = new Smaa());
      o.init(),
        o.setTextures(
          properties.loader.add(settings.TEXTURE_PATH + "smaa-area.png")
            .content,
          properties.loader.add(settings.TEXTURE_PATH + "smaa-search.png")
            .content,
        ),
        this.queue.push(o);
    }
    if (this.useDepthTexture) {
      let o = (this.bokeh = new Bokeh());
      o.init(), (o.quality = browser.isMobile ? 0 : 1), this.queue.push(o);
    }
    let e = (this.bloom = new Bloom$1());
    e.USE_CONVOLUTION = !1; //!browser.isMobile;
    !properties.renderer.extensions.get("OES_texture_float_linear") &&
      !properties.renderer.extensions.get("OES_texture_half_float_linear") &&
      (e.USE_HD = !1),
      e.init(),
      e.USE_LENS_DIRT &&
        e.setDirtTexture(
          properties.loader.add(settings.TEXTURE_PATH + "lens_dirt.jpg", {
            type: "texture",
          }).content,
        ),
      this.queue.push(e);
    let t = (this.radialBlur = new Bloom());
    t.init(), this.queue.push(t);
    let i = (this.screenPaintDistortion = new ScreenPaintDistortion());
    if ((i.init({ screenPaint }), this.queue.push(i), this.useDepthTexture)) {
      let o = (this.cameraMotionBlur = new CameraMotionBlur());
      o.init(), this.queue.push(o);
    }
    let n = (this.waterPass = new WaterPass());
    n.init(), this.queue.push(n);
    let r = (this.final = new Final());
    if ((r.init(), this.queue.push(r), settings.UP_SCALE > 1)) {
      let o = (this.upscaler = new Upscaler());
      o.init(), this.queue.push(o);
    }
  }
  updateSmaaTextures() {
    this.useMSAA || this.smaa.updateTextures();
  }
  syncProfile() {
    if (!this.bloom || !this.final || !this.postProfile) return;
    let e = this.postProfile,
      t = this.smaa,
      i = this.bokeh,
      n = this.bloom,
      r = this.screenPaintDistortion,
      o = this.cameraMotionBlur,
      s = this.final,
      l = this.radialBlur,
      u = this.upscaler;
    (n.amount = e.bloomAmount),
      (n.radius = e.bloomRadius),
      (n.threshold = e.bloomThreshold),
      (n.smoothWidth = e.bloomSmoothWidth),
      (n.lumaStrength = e.bloomLumaStrength),
      (n.selectiveStrength = e.bloomSelectiveStrength),
      (n.saturation = e.bloomSaturation),
      (n.haloWidth = e.haloWidth),
      (n.haloRGBShift = e.haloRGBShift),
      (n.haloLeftColorHex = e.haloLeftColorHex),
      (n.haloMidColorHex = e.haloMidColorHex),
      (n.haloRightColorHex = e.haloRightColorHex),
      (n.haloStrength = e.haloStrength),
      (n.haloMaskInner = e.haloMaskInner),
      (n.haloMaskOuter = e.haloMaskOuter),
      (r.amount = e.screenPaintDistortionAmount),
      (r.rgbShift = e.screenPaintDistortionRGBShift),
      (r.colorMultiplier = e.screenPaintDistortionColorMultiplier),
      (r.multiplier = e.screenPaintDistortionMultiplier),
      this.smaa && (t.threshold = e.smaaThreshold),
      o && (o.amount = e.cameraMotionBlurAmount),
      (s.vignetteFrom = e.vignetteFrom),
      (s.vignetteTo = e.vignetteTo),
      s.vignetteColor.setStyle(e.vignetteColorHex),
      (s.saturation = e.saturation),
      (s.contrast = e.contrast),
      (s.brightness = e.brightness),
      s.tintColor.setStyle(e.tintColorHex),
      (s.tintOpacity = e.tintOpacity),
      (s.blurRatio = e.blurRatio),
      i &&
        ((i.amount = e.bokehAmount),
        (i.fNumber = e.bokehFNumber),
        (i.focusDistance = e.bokehFocusDistance),
        (i.focalLength = e.bokehFocalLength),
        (i.kFilmHeight = e.bokehKFilmHeight)),
      l &&
        ((l.amount = e.radialBlurAmount),
        (l.fromRadius = e.radialBlurFromRadius),
        (l.toRadius = e.radialBlurToRadius),
        (l.fromStrength = e.radialBlurFromStrength),
        (l.toStrength = e.radialBlurToStrength),
        l.center.set(e.radialBlurCenterX, e.radialBlurCenterY)),
      u && (u.sharpness = e.upscalerSharpness),
      (s.opacity = properties.opacity),
      s.bgColor.setStyle(properties.bgColorHex),
      (s.debugAlpha = properties.debugAlpha);
  }
  swap() {
    let e = this.fromRenderTarget;
    (this.fromRenderTarget = this.toRenderTarget),
      (this.toRenderTarget = e),
      (this.fromTexture = this.fromRenderTarget.texture),
      (this.toTexture = this.toRenderTarget.texture),
      (this.sharedUniforms.u_fromTexture.value = this.fromTexture),
      (this.sharedUniforms.u_toTexture.value = this.toTexture);
  }
  setSize(e, t) {
    if (this.width !== e || this.height !== t) {
      (this.hasSizeChanged = !0),
        (this.width = e),
        (this.height = t),
        this.resolution.set(e, t),
        this.texelSize.set(1 / e, 1 / t);
      let i = (t / Math.sqrt(e * e + t * t)) * 2;
      this.aspect.set((e / t) * i, i),
        this.sceneRenderTarget.setSize(e, t),
        this.fromRenderTarget.setSize(e, t),
        this.toRenderTarget.setSize(e, t);
      let n = e >> 1,
        r = t >> 1;
      this.sceneCacheRenderTarget.setSize(e, t),
        this.sceneCacheBlurCacheRenderTarget.setSize(n, r),
        this.sceneCacheBlurredRenderTarget.setSize(n, r);
    }
  }
  dispose() {
    this.fromRenderTarget && this.fromRenderTarget.dispose(),
      this.toRenderTarget && this.toRenderTarget.dispose(),
      this.sceneRenderTarget && this.sceneRenderTarget.dispose();
  }
  blendProfile(e, t = 0) {
    properties.skipProfileUpdate || this.postProfile.blend(e, t);
  }
  cacheScene(e, t = 4) {
    let i = fboHelper.renderer,
      n = i.getRenderTarget();
    i.setRenderTarget(this.sceneRenderTarget),
      fboHelper.clearMultisampleRenderTargetState(),
      e &&
        (fboHelper.copy(
          this.sceneRenderTarget.texture,
          this.sceneCacheRenderTarget,
        ),
        (this.hasSceneCache = !0)),
      t &&
        (blur.blur(
          t,
          0.5,
          this.sceneRenderTarget,
          this.sceneCacheBlurCacheRenderTarget,
          this.sceneCacheBlurredRenderTarget,
          !0,
        ),
        this.sceneCacheBlurredTextureSize.set(
          this.sceneCacheBlurredRenderTarget.width,
          this.sceneCacheBlurredRenderTarget.height,
        ),
        (this.hasSceneCacheBlurred = !0)),
      i.setRenderTarget(n);
  }
  _filterQueue(e) {
    return e.enabled && e.needsRender();
  }
  render(e, t, i) {
    if (!fboHelper.renderer) return;
    (this.scene = e), (this.camera = t);
    let n = this.queue.filter(this._filterQueue),
      r = this.sharedUniforms;
    if (
      (n.sort((o, s) =>
        o.renderOrder == s.renderOrder ? 0 : o.renderOrder - s.renderOrder,
      ),
      (r.u_sceneTexture.value = this.sceneRenderTarget.texture),
      (r.u_cameraNear.value = t.near),
      (r.u_cameraFar.value = t.far),
      (r.u_cameraFovRad.value = (t.fov / 180) * Math.PI),
      this.onBeforeSceneRendered.dispatch(),
      n.length)
    ) {
      fboHelper.renderer.setClearColor(properties.bgColorHex, 1),
        fboHelper.renderer.setRenderTarget(this.sceneRenderTarget),
        fboHelper.renderer.render(e, t),
        fboHelper.renderer.setRenderTarget(null),
        fboHelper.copy(this.sceneRenderTarget.texture, this.fromRenderTarget),
        this.onAfterSceneRendered.dispatch(this.sceneRenderTarget);
      let o = fboHelper.getColorState();
      fboHelper.renderer.autoClear = !1;
      for (let s = 0, l = n.length; s < l; s++) {
        let u = s === l - 1 && i;
        n[s].render(this, u);
      }
      fboHelper.setColorState(o);
    } else
      fboHelper.renderer.render(e, t), this.onAfterSceneRendered.dispatch();
    this.onAfterRendered.dispatch(), (this.hasSizeChanged = !1);
  }
}
const postprocessing$1 = new Postprocessing();
class Simple1DNoise {
  static MAX_VERTICES = 256;
  static MAX_VERTICES_MASK = Simple1DNoise.MAX_VERTICES - 1;
  _scale = 1;
  _amplitude = 1;
  _r = [];
  constructor() {
    for (let e = 0; e < Simple1DNoise.MAX_VERTICES; ++e)
      this._r.push(Math.random() - 0.5);
  }
  getVal(e) {
    const t = e * this._scale,
      i = Math.floor(t),
      n = t - i,
      r = n * n * (3 - 2 * n),
      o = i & Simple1DNoise.MAX_VERTICES_MASK,
      s = (o + 1) & Simple1DNoise.MAX_VERTICES_MASK;
    return math.mix(this._r[o], this._r[s], r) * this._amplitude;
  }
  get amplitude() {
    return this._amplitude;
  }
  set amplitude(e) {
    this._amplitude = e;
  }
  get scale() {
    return this._scale;
  }
  set scale(e) {
    this._scale = e;
  }
}
const _e$1 = new Euler(),
  _v$1 = new Vector3();
class BrownianMotion {
  _position = new Vector3();
  _rotation = new Quaternion();
  _scale = new Vector3(1, 1, 1);
  _matrix = new Matrix4();
  _enablePositionNoise = !0;
  _enableRotationNoise = !0;
  _positionFrequency = 0.25;
  _rotationFrequency = 0.25;
  _positionAmplitude = 0.3;
  _rotationAmplitude = 0.003;
  _positionScale = new Vector3(1, 1, 1);
  _rotationScale = new Vector3(1, 1, 0);
  _positionFractalLevel = 3;
  _rotationFractalLevel = 3;
  _times = new Float32Array(6);
  _noise = new Simple1DNoise();
  static FBM_NORM = 1 / 0.75;
  constructor() {
    this.rehash();
  }
  rehash() {
    for (let e = 0; e < 6; e++) this._times[e] = Math.random() * -1e4;
  }
  _fbm(e, t) {
    let i = 0,
      n = 0.5;
    for (let r = 0; r < t; r++)
      (i += n * this._noise.getVal(e)), (e *= 2), (n *= 0.5);
    return i;
  }
  update(e) {
    const t = e === void 0 ? 16.666666666666668 : e;
    if (this._enablePositionNoise) {
      for (let i = 0; i < 3; i++) this._times[i] += this._positionFrequency * t;
      _v$1.set(
        this._fbm(this._times[0], this._positionFractalLevel),
        this._fbm(this._times[1], this._positionFractalLevel),
        this._fbm(this._times[2], this._positionFractalLevel),
      ),
        _v$1.multiply(this._positionScale),
        _v$1.multiplyScalar(this._positionAmplitude * BrownianMotion.FBM_NORM),
        this._position.copy(_v$1);
    }
    if (this._enableRotationNoise) {
      for (let i = 0; i < 3; i++)
        this._times[i + 3] += this._rotationFrequency * t;
      _v$1.set(
        this._fbm(this._times[3], this._rotationFractalLevel),
        this._fbm(this._times[4], this._rotationFractalLevel),
        this._fbm(this._times[5], this._rotationFractalLevel),
      ),
        _v$1.multiply(this._rotationScale),
        _v$1.multiplyScalar(this._rotationAmplitude * BrownianMotion.FBM_NORM),
        _e$1.set(_v$1.x, _v$1.y, _v$1.z),
        this._rotation.setFromEuler(_e$1);
    }
    this._matrix.compose(this._position, this._rotation, this._scale);
  }
  get positionAmplitude() {
    return this._positionAmplitude;
  }
  set positionAmplitude(e) {
    this._positionAmplitude = e;
  }
  get positionFrequency() {
    return this._positionFrequency;
  }
  set positionFrequency(e) {
    this._positionFrequency = e;
  }
  get rotationAmplitude() {
    return this._rotationAmplitude;
  }
  set rotationAmplitude(e) {
    this._rotationAmplitude = e;
  }
  get rotationFrequency() {
    return this._rotationFrequency;
  }
  set rotationFrequency(e) {
    this._rotationFrequency = e;
  }
  get matrix() {
    return this._matrix;
  }
  set matrix(e) {
    this._matrix = e;
  }
}
const _changeEvent = { type: "change" },
  _startEvent = { type: "start" },
  _endEvent = { type: "end" };
class OrbitControls extends EventDispatcher {
  constructor(e, t) {
    super(),
      t === void 0 &&
        console.warn(
          'THREE.OrbitControls: The second parameter "domElement" is now mandatory.',
        ),
      t === document &&
        console.error(
          'THREE.OrbitControls: "document" should not be used as the target "domElement". Please use "renderer.domElement" instead.',
        ),
      (this.object = e),
      (this.domElement = t),
      (this.enabled = !0),
      (this.target = new Vector3()),
      (this.minDistance = 0),
      (this.maxDistance = 1 / 0),
      (this.minZoom = 0),
      (this.maxZoom = 1 / 0),
      (this.minPolarAngle = 0),
      (this.maxPolarAngle = Math.PI),
      (this.minAzimuthAngle = -1 / 0),
      (this.maxAzimuthAngle = 1 / 0),
      (this.enableDamping = !1),
      (this.dampingFactor = 0.15),
      (this.enableZoom = !0),
      (this.zoomSpeed = 1),
      (this.enableRotate = !0),
      (this.rotateSpeed = 1),
      (this.enablePan = !0),
      (this.panSpeed = 1),
      (this.screenSpacePanning = !0),
      (this.keyPanSpeed = 7),
      (this.autoRotate = !1),
      (this.autoRotateSpeed = 2),
      (this.keys = {
        LEFT: "ArrowLeft",
        UP: "ArrowUp",
        RIGHT: "ArrowRight",
        BOTTOM: "ArrowDown",
      }),
      (this.mouseButtons = {
        LEFT: MOUSE.ROTATE,
        MIDDLE: MOUSE.DOLLY,
        RIGHT: MOUSE.PAN,
      }),
      (this.touches = { ONE: TOUCH.ROTATE, TWO: TOUCH.DOLLY_PAN }),
      (this.target0 = this.target.clone()),
      (this.position0 = this.object.position.clone()),
      (this.zoom0 = this.object.zoom),
      (this.scale = 1),
      (this._domElementKeyEvents = null),
      (this.getPolarAngle = function () {
        return s.phi;
      }),
      (this.getAzimuthalAngle = function () {
        return s.theta;
      }),
      (this.getDistance = function () {
        return this.object.position.distanceTo(this.target);
      }),
      (this.listenToKeyEvents = function (E) {
        E.addEventListener("keydown", je), (this._domElementKeyEvents = E);
      }),
      (this.saveState = function () {
        i.target0.copy(i.target),
          i.position0.copy(i.object.position),
          (i.zoom0 = i.object.zoom);
      }),
      (this.reset = function () {
        i.target.copy(i.target0),
          i.object.position.copy(i.position0),
          (i.object.zoom = i.zoom0),
          (i.scale = 1),
          i.object.updateProjectionMatrix(),
          i.dispatchEvent(_changeEvent),
          i.update(),
          (r = n.NONE);
      }),
      (this.update = (function () {
        const E = new Vector3(),
          W = new Quaternion().setFromUnitVectors(e.up, new Vector3(0, 1, 0)),
          z = W.clone().invert(),
          se = new Vector3(),
          he = new Quaternion(),
          le = 2 * Math.PI;
        return function () {
          const de = i.object.position;
          E.copy(de).sub(i.target),
            E.applyQuaternion(W),
            s.setFromVector3(E),
            i.autoRotate && r === n.NONE && v(C()),
            i.enableDamping
              ? ((s.theta += l.theta * i.dampingFactor),
                (s.phi += l.phi * i.dampingFactor))
              : ((s.theta += l.theta), (s.phi += l.phi));
          let Se = i.minAzimuthAngle,
            Te = i.maxAzimuthAngle;
          isFinite(Se) &&
            isFinite(Te) &&
            (Se < -Math.PI ? (Se += le) : Se > Math.PI && (Se -= le),
            Te < -Math.PI ? (Te += le) : Te > Math.PI && (Te -= le),
            Se <= Te
              ? (s.theta = Math.max(Se, Math.min(Te, s.theta)))
              : (s.theta =
                  s.theta > (Se + Te) / 2
                    ? Math.max(Se, s.theta)
                    : Math.min(Te, s.theta))),
            (s.phi = Math.max(
              i.minPolarAngle,
              Math.min(i.maxPolarAngle, s.phi),
            )),
            s.makeSafe();
          let Oe = i.enableDamping
            ? (i.scale - 1) * i.dampingFactor + 1
            : i.scale;
          return (
            (s.radius *= Oe),
            (s.radius = Math.max(
              i.minDistance,
              Math.min(i.maxDistance, s.radius),
            )),
            i.enableDamping === !0
              ? i.target.addScaledVector(u, i.dampingFactor)
              : i.target.add(u),
            E.setFromSpherical(s),
            E.applyQuaternion(z),
            de.copy(i.target).add(E),
            i.object.lookAt(i.target),
            i.enableDamping === !0
              ? ((l.theta *= 1 - i.dampingFactor),
                (l.phi *= 1 - i.dampingFactor),
                u.multiplyScalar(1 - i.dampingFactor))
              : (l.set(0, 0, 0), u.set(0, 0, 0)),
            (i.scale = i.scale / Oe),
            h ||
            se.distanceToSquared(i.object.position) > o ||
            8 * (1 - he.dot(i.object.quaternion)) > o
              ? (i.dispatchEvent(_changeEvent),
                se.copy(i.object.position),
                he.copy(i.object.quaternion),
                (h = !1),
                !0)
              : !1
          );
        };
      })()),
      (this.dispose = function () {
        i.domElement.removeEventListener("contextmenu", S),
          i.domElement.removeEventListener("pointerdown", ge),
          i.domElement.removeEventListener("pointercancel", Be),
          i.domElement.removeEventListener("wheel", Pe),
          i.domElement.removeEventListener("pointermove", Ne),
          i.domElement.removeEventListener("pointerup", ke),
          i._domElementKeyEvents !== null &&
            i._domElementKeyEvents.removeEventListener("keydown", je);
      });
    const i = this,
      n = {
        NONE: -1,
        ROTATE: 0,
        DOLLY: 1,
        PAN: 2,
        TOUCH_ROTATE: 3,
        TOUCH_PAN: 4,
        TOUCH_DOLLY_PAN: 5,
        TOUCH_DOLLY_ROTATE: 6,
      };
    let r = n.NONE;
    const o = 1e-6,
      s = new Spherical(),
      l = new Spherical(),
      u = new Vector3();
    let h = !1;
    const d = new Vector2(),
      c = new Vector2(),
      m = new Vector2(),
      _ = new Vector2(),
      f = new Vector2(),
      p = new Vector2(),
      g = new Vector2(),
      w = new Vector2(),
      x = new Vector2(),
      y = [],
      b = {};
    function C() {
      return ((2 * Math.PI) / 60 / 60) * i.autoRotateSpeed;
    }
    function L() {
      return Math.pow(0.95, i.zoomSpeed);
    }
    function v(E) {
      l.theta -= E;
    }
    function A(E) {
      l.phi -= E;
    }
    const P = (function () {
        const E = new Vector3();
        return function (z, se) {
          E.setFromMatrixColumn(se, 0), E.multiplyScalar(-z), u.add(E);
        };
      })(),
      V = (function () {
        const E = new Vector3();
        return function (z, se) {
          i.screenSpacePanning === !0
            ? E.setFromMatrixColumn(se, 1)
            : (E.setFromMatrixColumn(se, 0), E.crossVectors(i.object.up, E)),
            E.multiplyScalar(z),
            u.add(E);
        };
      })(),
      K = (function () {
        const E = new Vector3();
        return function (z, se) {
          const he = i.domElement;
          if (i.object.isPerspectiveCamera) {
            const le = i.object.position;
            E.copy(le).sub(i.target);
            let pe = E.length();
            (pe *= Math.tan(((i.object.fov / 2) * Math.PI) / 180)),
              P((2 * z * pe) / he.clientHeight, i.object.matrix),
              V((2 * se * pe) / he.clientHeight, i.object.matrix);
          } else
            i.object.isOrthographicCamera
              ? (P(
                  (z * (i.object.right - i.object.left)) /
                    i.object.zoom /
                    he.clientWidth,
                  i.object.matrix,
                ),
                V(
                  (se * (i.object.top - i.object.bottom)) /
                    i.object.zoom /
                    he.clientHeight,
                  i.object.matrix,
                ))
              : (console.warn(
                  "WARNING: OrbitControls.js encountered an unknown camera type - pan disabled.",
                ),
                (i.enablePan = !1));
        };
      })();
    function D(E) {
      i.object.isPerspectiveCamera
        ? (i.scale /= E)
        : i.object.isOrthographicCamera
        ? ((i.object.zoom = Math.max(
            i.minZoom,
            Math.min(i.maxZoom, i.object.zoom * E),
          )),
          i.object.updateProjectionMatrix(),
          (h = !0))
        : (console.warn(
            "WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled.",
          ),
          (i.enableZoom = !1));
    }
    function I(E) {
      i.object.isPerspectiveCamera
        ? (i.scale *= E)
        : i.object.isOrthographicCamera
        ? ((i.object.zoom = Math.max(
            i.minZoom,
            Math.min(i.maxZoom, i.object.zoom / E),
          )),
          i.object.updateProjectionMatrix(),
          (h = !0))
        : (console.warn(
            "WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled.",
          ),
          (i.enableZoom = !1));
    }
    function N(E) {
      d.set(E.clientX, E.clientY);
    }
    function Y(E) {
      g.set(E.clientX, E.clientY);
    }
    function j(E) {
      _.set(E.clientX, E.clientY);
    }
    function X(E) {
      c.set(E.clientX, E.clientY),
        m.subVectors(c, d).multiplyScalar(i.rotateSpeed);
      const W = i.domElement;
      v((2 * Math.PI * m.x) / W.clientHeight),
        A((2 * Math.PI * m.y) / W.clientHeight),
        d.copy(c),
        i.update();
    }
    function ie(E) {
      w.set(E.clientX, E.clientY),
        x.subVectors(w, g),
        x.y > 0 ? D(L()) : x.y < 0 && I(L()),
        g.copy(w),
        i.update();
    }
    function ee(E) {
      f.set(E.clientX, E.clientY),
        p.subVectors(f, _).multiplyScalar(i.panSpeed),
        K(p.x, p.y),
        _.copy(f),
        i.update();
    }
    function U(E) {
      E.deltaY < 0 ? I(L()) : E.deltaY > 0 && D(L()), i.update();
    }
    function H(E) {
      let W = !1;
      switch (E.code) {
        case i.keys.UP:
          K(0, i.keyPanSpeed), (W = !0);
          break;
        case i.keys.BOTTOM:
          K(0, -i.keyPanSpeed), (W = !0);
          break;
        case i.keys.LEFT:
          K(i.keyPanSpeed, 0), (W = !0);
          break;
        case i.keys.RIGHT:
          K(-i.keyPanSpeed, 0), (W = !0);
          break;
      }
      W && i.update();
    }
    function Z() {
      if (y.length === 1) d.set(y[0].pageX, y[0].pageY);
      else {
        const E = 0.5 * (y[0].pageX + y[1].pageX),
          W = 0.5 * (y[0].pageY + y[1].pageY);
        d.set(E, W);
      }
    }
    function te() {
      if (y.length === 1) _.set(y[0].pageX, y[0].pageY);
      else {
        const E = 0.5 * (y[0].pageX + y[1].pageX),
          W = 0.5 * (y[0].pageY + y[1].pageY);
        _.set(E, W);
      }
    }
    function re() {
      const E = y[0].pageX - y[1].pageX,
        W = y[0].pageY - y[1].pageY,
        z = Math.sqrt(E * E + W * W);
      g.set(0, z);
    }
    function $() {
      i.enableZoom && re(), i.enablePan && te();
    }
    function Me() {
      i.enableZoom && re(), i.enableRotate && Z();
    }
    function ue(E) {
      if (y.length == 1) c.set(E.pageX, E.pageY);
      else {
        const z = ae(E),
          se = 0.5 * (E.pageX + z.x),
          he = 0.5 * (E.pageY + z.y);
        c.set(se, he);
      }
      m.subVectors(c, d).multiplyScalar(i.rotateSpeed);
      const W = i.domElement;
      v((2 * Math.PI * m.x) / W.clientHeight),
        A((2 * Math.PI * m.y) / W.clientHeight),
        d.copy(c);
    }
    function ve(E) {
      if (y.length === 1) f.set(E.pageX, E.pageY);
      else {
        const W = ae(E),
          z = 0.5 * (E.pageX + W.x),
          se = 0.5 * (E.pageY + W.y);
        f.set(z, se);
      }
      p.subVectors(f, _).multiplyScalar(i.panSpeed), K(p.x, p.y), _.copy(f);
    }
    function ce(E) {
      const W = ae(E),
        z = E.pageX - W.x,
        se = E.pageY - W.y,
        he = Math.sqrt(z * z + se * se);
      w.set(0, he),
        x.set(0, Math.pow(w.y / g.y, i.zoomSpeed)),
        D(x.y),
        g.copy(w);
    }
    function Le(E) {
      i.enableZoom && ce(E), i.enablePan && ve(E);
    }
    function ye(E) {
      i.enableZoom && ce(E), i.enableRotate && ue(E);
    }
    function ge(E) {
      i.enabled !== !1 &&
        (y.length === 0 &&
          (i.domElement.setPointerCapture(E.pointerId),
          i.domElement.addEventListener("pointermove", Ne),
          i.domElement.addEventListener("pointerup", ke)),
        k(E),
        E.pointerType === "touch" ? qe(E) : $e(E));
    }
    function Ne(E) {
      i.enabled !== !1 && (E.pointerType === "touch" ? T(E) : Fe(E));
    }
    function ke(E) {
      Q(E),
        y.length === 0 &&
          (i.domElement.releasePointerCapture(E.pointerId),
          i.domElement.removeEventListener("pointermove", Ne),
          i.domElement.removeEventListener("pointerup", ke)),
        i.dispatchEvent(_endEvent),
        (r = n.NONE);
    }
    function Be(E) {
      Q(E);
    }
    function $e(E) {
      let W;
      switch (E.button) {
        case 0:
          W = i.mouseButtons.LEFT;
          break;
        case 1:
          W = i.mouseButtons.MIDDLE;
          break;
        case 2:
          W = i.mouseButtons.RIGHT;
          break;
        default:
          W = -1;
      }
      switch (W) {
        case MOUSE.DOLLY:
          if (i.enableZoom === !1) return;
          Y(E), (r = n.DOLLY);
          break;
        case MOUSE.ROTATE:
          if (E.ctrlKey || E.metaKey || E.shiftKey) {
            if (i.enablePan === !1) return;
            j(E), (r = n.PAN);
          } else {
            if (i.enableRotate === !1) return;
            N(E), (r = n.ROTATE);
          }
          break;
        case MOUSE.PAN:
          if (E.ctrlKey || E.metaKey || E.shiftKey) {
            if (i.enableRotate === !1) return;
            N(E), (r = n.ROTATE);
          } else {
            if (i.enablePan === !1) return;
            j(E), (r = n.PAN);
          }
          break;
        default:
          r = n.NONE;
      }
      r !== n.NONE && i.dispatchEvent(_startEvent);
    }
    function Fe(E) {
      if (i.enabled !== !1)
        switch (r) {
          case n.ROTATE:
            if (i.enableRotate === !1) return;
            X(E);
            break;
          case n.DOLLY:
            if (i.enableZoom === !1) return;
            ie(E);
            break;
          case n.PAN:
            if (i.enablePan === !1) return;
            ee(E);
            break;
        }
    }
    function Pe(E) {
      i.enabled === !1 ||
        i.enableZoom === !1 ||
        r !== n.NONE ||
        (i.dispatchEvent(_startEvent), U(E), i.dispatchEvent(_endEvent));
    }
    function je(E) {
      i.enabled === !1 || i.enablePan === !1 || H(E);
    }
    function qe(E) {
      switch ((ne(E), y.length)) {
        case 1:
          switch (i.touches.ONE) {
            case TOUCH.ROTATE:
              if (i.enableRotate === !1) return;
              Z(), (r = n.TOUCH_ROTATE);
              break;
            case TOUCH.PAN:
              if (i.enablePan === !1) return;
              te(), (r = n.TOUCH_PAN);
              break;
            default:
              r = n.NONE;
          }
          break;
        case 2:
          switch (i.touches.TWO) {
            case TOUCH.DOLLY_PAN:
              if (i.enableZoom === !1 && i.enablePan === !1) return;
              $(), (r = n.TOUCH_DOLLY_PAN);
              break;
            case TOUCH.DOLLY_ROTATE:
              if (i.enableZoom === !1 && i.enableRotate === !1) return;
              Me(), (r = n.TOUCH_DOLLY_ROTATE);
              break;
            default:
              r = n.NONE;
          }
          break;
        default:
          r = n.NONE;
      }
      r !== n.NONE && i.dispatchEvent(_startEvent);
    }
    function T(E) {
      switch ((ne(E), r)) {
        case n.TOUCH_ROTATE:
          if (i.enableRotate === !1) return;
          ue(E), i.update();
          break;
        case n.TOUCH_PAN:
          if (i.enablePan === !1) return;
          ve(E), i.update();
          break;
        case n.TOUCH_DOLLY_PAN:
          if (i.enableZoom === !1 && i.enablePan === !1) return;
          Le(E), i.update();
          break;
        case n.TOUCH_DOLLY_ROTATE:
          if (i.enableZoom === !1 && i.enableRotate === !1) return;
          ye(E), i.update();
          break;
        default:
          r = n.NONE;
      }
    }
    function S(E) {
      i.enabled;
    }
    function k(E) {
      y.push(E);
    }
    function Q(E) {
      delete b[E.pointerId];
      for (let W = 0; W < y.length; W++)
        if (y[W].pointerId == E.pointerId) {
          y.splice(W, 1);
          return;
        }
    }
    function ne(E) {
      let W = b[E.pointerId];
      W === void 0 && ((W = new Vector2()), (b[E.pointerId] = W)),
        W.set(E.pageX, E.pageY);
    }
    function ae(E) {
      const W = E.pointerId === y[0].pointerId ? y[1] : y[0];
      return b[W.pointerId];
    }
    i.domElement.addEventListener("contextmenu", S),
      i.domElement.addEventListener("pointerdown", ge),
      i.domElement.addEventListener("pointercancel", Be),
      i.domElement.addEventListener("wheel", Pe, { passive: !1 }),
      this.update();
  }
}
const vert$6 = `#define GLSLIFY 1
varying vec3 v_modelPosition;void main(){vec3 transformedPos=position;transformedPos.z*=mix(1.,0.9,max(0.,(transformedPos.y-3.)/20.));gl_Position=projectionMatrix*modelViewMatrix*vec4(transformedPos,1.0);v_modelPosition=position;}`,
  frag$6 = `#define GLSLIFY 1
uniform sampler2D u_texturePrev;uniform sampler2D u_texture;uniform sampler2D u_textureNext;uniform sampler2D u_flowTexture;uniform sampler2D u_trailMaskTexture;uniform vec3 u_trailMaskMixer;uniform float u_flowStrength;uniform float u_flowTime;uniform vec2 u_size;uniform float u_tileIndex;varying vec3 v_modelPosition;vec3 flowUvw(vec2 uv,vec2 flowVector,float time,float phaseOffset){float progress=fract(time+phaseOffset);vec3 uvw;uvw.xy=uv-flowVector*progress;uvw.z=1.-abs(1.-2.*progress);return uvw;}void main(){vec2 fullUv=(v_modelPosition.zx)/u_size;fullUv+=.5;vec2 flowVector=clamp((texture2D(u_flowTexture,fullUv).rg*255.-128.)/127.,-1.,1.);vec3 uvwA=flowUvw(fullUv,flowVector/u_flowStrength,u_flowTime,0.);vec3 uvwB=flowUvw(fullUv,flowVector/u_flowStrength,u_flowTime,0.5);uvwA.y*=6.;uvwA.y-=(5.-u_tileIndex);uvwB.y*=6.;uvwB.y-=(5.-u_tileIndex);vec4 texA=uvwA.y>1. ? texture2D(u_texturePrev,uvwA.xy-vec2(0.,1.)): uvwA.y>=0. ? texture2D(u_texture,uvwA.xy): texture2D(u_textureNext,uvwA.xy+vec2(0.,1.));vec4 texB=uvwB.y>1. ? texture2D(u_texturePrev,uvwB.xy-vec2(0.,1.)): uvwB.y>=0. ? texture2D(u_texture,uvwB.xy): texture2D(u_textureNext,uvwB.xy+vec2(0.,1.));vec3 color=(texA.rgb*uvwA.z+texB.rgb*uvwB.z);float luma=dot(color,vec3(0.299,0.587,0.114));float trail=dot(u_trailMaskMixer,texture2D(u_trailMaskTexture,fullUv).rgb);float maxTrail=max(u_trailMaskMixer.r,max(u_trailMaskMixer.g,u_trailMaskMixer.b));vec3 saturatedColor=mix(vec3(luma),color,1.35);color=mix(color,color*0.2+(saturatedColor*trail)*mix(0.8,3.,clamp(v_modelPosition.y/20.,0.,1.)),maxTrail);color=clamp(color,0.,1.);gl_FragColor=vec4(vec3(color),trail*0.35);gl_FragColor.rgb=pow(gl_FragColor.rgb,vec3(1.0/2.2));}`,
  trailVert = `#define GLSLIFY 1
attribute vec3 offset;attribute float side;attribute float dist;uniform float u_time;uniform float u_index;uniform float u_width;varying vec2 v_uv;varying float v_dist;varying float v_side;varying vec4 v_noises;vec4 mod289(vec4 x){return x-floor(x*(1.0/289.0))*289.0;}float mod289(float x){return x-floor(x*(1.0/289.0))*289.0;}vec4 permute(vec4 x){return mod289(((x*34.0)+1.0)*x);}float permute(float x){return mod289(((x*34.0)+1.0)*x);}vec4 taylorInvSqrt(vec4 r){return 1.79284291400159-0.85373472095314*r;}float taylorInvSqrt(float r){return 1.79284291400159-0.85373472095314*r;}vec4 grad4(float j,vec4 ip){const vec4 ones=vec4(1.0,1.0,1.0,-1.0);vec4 p,s;p.xyz=floor(fract(vec3(j)*ip.xyz)*7.0)*ip.z-1.0;p.w=1.5-dot(abs(p.xyz),ones.xyz);s=vec4(lessThan(p,vec4(0.0)));p.xyz=p.xyz+(s.xyz*2.0-1.0)*s.www;return p;}
#define F4 0.309016994374947451
vec4 simplexNoiseDerivatives(vec4 v){const vec4 C=vec4(0.138196601125011,0.276393202250021,0.414589803375032,-0.447213595499958);vec4 i=floor(v+dot(v,vec4(F4)));vec4 x0=v-i+dot(i,C.xxxx);vec4 i0;vec3 isX=step(x0.yzw,x0.xxx);vec3 isYZ=step(x0.zww,x0.yyz);i0.x=isX.x+isX.y+isX.z;i0.yzw=1.0-isX;i0.y+=isYZ.x+isYZ.y;i0.zw+=1.0-isYZ.xy;i0.z+=isYZ.z;i0.w+=1.0-isYZ.z;vec4 i3=clamp(i0,0.0,1.0);vec4 i2=clamp(i0-1.0,0.0,1.0);vec4 i1=clamp(i0-2.0,0.0,1.0);vec4 x1=x0-i1+C.xxxx;vec4 x2=x0-i2+C.yyyy;vec4 x3=x0-i3+C.zzzz;vec4 x4=x0+C.wwww;i=mod289(i);float j0=permute(permute(permute(permute(i.w)+i.z)+i.y)+i.x);vec4 j1=permute(permute(permute(permute(i.w+vec4(i1.w,i2.w,i3.w,1.0))+i.z+vec4(i1.z,i2.z,i3.z,1.0))+i.y+vec4(i1.y,i2.y,i3.y,1.0))+i.x+vec4(i1.x,i2.x,i3.x,1.0));vec4 ip=vec4(1.0/294.0,1.0/49.0,1.0/7.0,0.0);vec4 p0=grad4(j0,ip);vec4 p1=grad4(j1.x,ip);vec4 p2=grad4(j1.y,ip);vec4 p3=grad4(j1.z,ip);vec4 p4=grad4(j1.w,ip);vec4 norm=taylorInvSqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));p0*=norm.x;p1*=norm.y;p2*=norm.z;p3*=norm.w;p4*=taylorInvSqrt(dot(p4,p4));vec3 values0=vec3(dot(p0,x0),dot(p1,x1),dot(p2,x2));vec2 values1=vec2(dot(p3,x3),dot(p4,x4));vec3 m0=max(0.5-vec3(dot(x0,x0),dot(x1,x1),dot(x2,x2)),0.0);vec2 m1=max(0.5-vec2(dot(x3,x3),dot(x4,x4)),0.0);vec3 temp0=-6.0*m0*m0*values0;vec2 temp1=-6.0*m1*m1*values1;vec3 mmm0=m0*m0*m0;vec2 mmm1=m1*m1*m1;float dx=temp0[0]*x0.x+temp0[1]*x1.x+temp0[2]*x2.x+temp1[0]*x3.x+temp1[1]*x4.x+mmm0[0]*p0.x+mmm0[1]*p1.x+mmm0[2]*p2.x+mmm1[0]*p3.x+mmm1[1]*p4.x;float dy=temp0[0]*x0.y+temp0[1]*x1.y+temp0[2]*x2.y+temp1[0]*x3.y+temp1[1]*x4.y+mmm0[0]*p0.y+mmm0[1]*p1.y+mmm0[2]*p2.y+mmm1[0]*p3.y+mmm1[1]*p4.y;float dz=temp0[0]*x0.z+temp0[1]*x1.z+temp0[2]*x2.z+temp1[0]*x3.z+temp1[1]*x4.z+mmm0[0]*p0.z+mmm0[1]*p1.z+mmm0[2]*p2.z+mmm1[0]*p3.z+mmm1[1]*p4.z;float dw=temp0[0]*x0.w+temp0[1]*x1.w+temp0[2]*x2.w+temp1[0]*x3.w+temp1[1]*x4.w+mmm0[0]*p0.w+mmm0[1]*p1.w+mmm0[2]*p2.w+mmm1[0]*p3.w+mmm1[1]*p4.w;return vec4(dx,dy,dz,dw)*49.0;}void main(){vec3 pos=position;vec4 noises=simplexNoiseDerivatives(vec4(u_index*3.,dist*0.01-u_time*2.,0.,0.));pos+=offset*u_width*(1.+noises.x*0.15);gl_Position=projectionMatrix*modelViewMatrix*vec4(pos,1.0);v_uv=vec2(side*.5+.5,dist/u_width);v_dist=dist;v_side=side;v_noises=noises;}`,
  trailFrag = `#define GLSLIFY 1
uniform sampler2D u_smokeTexture;uniform float u_fadeLength;uniform float u_length;uniform float u_opacity;uniform float u_time;varying vec2 v_uv;varying float v_dist;varying float v_side;varying vec4 v_noises;float linearStep(float edge0,float edge1,float x){return clamp((x-edge0)/(edge1-edge0),0.0,1.0);}void main(){vec2 smokeUv=v_uv;float sideS=1.-abs(v_side);float fadeOpacity=linearStep(0.,u_fadeLength,v_dist)*linearStep(u_length,u_length-u_fadeLength,v_dist);float smokeColorR=texture2D(u_smokeTexture,smokeUv*vec2(1.,0.015)+vec2(0.,u_time*-0.1)).r;float smokeColorG=texture2D(u_smokeTexture,smokeUv*vec2(1.,0.015)+vec2(0.,u_time*-0.05)).g;float smokeColorB=texture2D(u_smokeTexture,smokeUv*vec2(1.,0.015)+vec2(0.,u_time*-0.075)).b;float smoke=(smokeColorR+smokeColorG+smokeColorB)*0.5*(pow(linearStep(0.0,1.,sideS),2.)*.5+pow(linearStep(0.5,1.,sideS),4.)*0.5);gl_FragColor=vec4(vec3(.7,.8,1.),smoke*fadeOpacity*u_opacity);}`,
  WIDTH = 250,
  HEIGHT = WIDTH * 6;
class Scene2 {
  WIDTH = WIDTH;
  HEIGHT = HEIGHT;
  container = new Object3D();
  mesh = null;
  activeRatio = 0;
  flowSpeed = 1;
  trails = [];
  sharedUniforms = {
    u_textures: [],
    u_flowTexture: { value: null },
    u_flowStrength: { value: 50 },
    u_flowTime: { value: 0 },
    u_size: { value: new Vector2(WIDTH, HEIGHT) },
    u_smokeTexture: { value: null },
    u_trailMaskTexture: { value: null },
    u_trailMaskMixer: { value: new Vector3(0, 0, 0) },
  };
  preInit() {
    const e =
      settings.TEXTURE_PATH + "scene2/" + (browser.isMobile ? "mobile/" : "");
    for (let t = 0; t < 6; t++) {
      let i = properties.loader.add(e + "SC_02_P" + (t + 1) + "_TEXTURE.webp", {
        type: "texture",
      }).content;
      this.sharedUniforms.u_textures.push({ value: i }),
        (i.encoding = sRGBEncoding),
        (i.generateMipmaps = !1),
        properties.loader.add(
          settings.MODEL_PATH + `scene2/SC_02_PIECE_${t + 1}.buf`,
          { onLoad: this._onModelLoad.bind(this, t) },
        );
    }
    (this.sharedUniforms.u_flowTexture.value = properties.loader.add(
      e + "FLOW.webp",
      { type: "texture", generateMipmaps: !1 },
    ).content),
      (this.sharedUniforms.u_trailMaskTexture.value = properties.loader.add(
        e + "TRAILS.webp",
        { type: "texture", generateMipmaps: !1 },
      ).content);
    for (let t = 0; t < 3; t++) {
      let i = { index: t, activeRatio: 0, mesh: null };
      this.trails.push(i),
        properties.loader.add(settings.MODEL_PATH + `scene2/TRAIL_${t}.buf`, {
          onLoad: this._onTrailLoad.bind(this, t),
        });
    }
    this.sharedUniforms.u_smokeTexture.value = properties.loader.add(
      e + "SMOKE.webp",
      { type: "texture", wrapT: RepeatWrapping, generateMipmaps: !1 },
    ).content;
  }
  init() {}
  _onModelLoad(e, t) {
    const i = new Mesh(
      t,
      new ShaderMaterial({
        vertexShader: vert$6,
        fragmentShader: frag$6,
        uniforms: {
          u_texturePrev: this.sharedUniforms.u_textures[Math.max(0, e - 1)],
          u_texture: this.sharedUniforms.u_textures[e],
          u_textureNext:
            this.sharedUniforms.u_textures[
              Math.min(this.sharedUniforms.u_textures.length - 1, e + 1)
            ],
          u_flowTexture: this.sharedUniforms.u_flowTexture,
          u_flowStrength: this.sharedUniforms.u_flowStrength,
          u_flowTime: this.sharedUniforms.u_flowTime,
          u_size: this.sharedUniforms.u_size,
          u_tileIndex: { value: e },
          u_trailMaskTexture: this.sharedUniforms.u_trailMaskTexture,
          u_trailMaskMixer: this.sharedUniforms.u_trailMaskMixer,
        },
      }),
    );
    this.container.add(i), properties.initCallFuncList.push(i);
  }
  _onTrailLoad(e, t) {
    let i = (this.trails[e].mesh = new Mesh(
      t,
      new ShaderMaterial({
        uniforms: {
          u_smokeTexture: this.sharedUniforms.u_smokeTexture,
          u_time: properties.sharedUniforms.u_time,
          u_index: { value: e },
          u_width: { value: 15 },
          u_length: {
            value: t.attributes.dist.array[t.attributes.dist.array.length - 1],
          },
          u_fadeLength: { value: 30 },
          u_opacity: { value: 1 },
        },
        vertexShader: trailVert,
        fragmentShader: trailFrag,
        blending: CustomBlending,
        blendEquation: AddEquation,
        blendSrc: SrcAlphaFactor,
        blendDst: OneFactor,
        blendEquationAlpha: ReverseSubtractEquation,
        blendSrcAlpha: OneFactor,
        blendDstAlpha: OneFactor,
      }),
    ));
    (i.frustumCulled = !1),
      this.container.add(i),
      properties.initCallFuncList.push(i);
  }
  resize(e, t) {}
  preUpdate(e) {}
  update(e) {
    const t = this.activeRatio > 0 && this.activeRatio < 1;
    if (((this.container.visible = t), t)) {
      for (let i = 0; i < this.trails.length; i++) {
        let n = this.trails[i];
        n.mesh.material.uniforms.u_opacity.value = n.activeRatio;
      }
      this.sharedUniforms.u_trailMaskMixer.value.set(
        this.trails[0].activeRatio,
        this.trails[1].activeRatio,
        this.trails[2].activeRatio,
      ),
        (this.sharedUniforms.u_flowTime.value += e * this.flowSpeed);
    }
  }
}
const scene2 = new Scene2(),
  aperture = 41.4214,
  viewPixelWidth = 2048,
  viewPixelHeight = 1024,
  apy = (viewPixelHeight * aperture) / viewPixelWidth,
  getFov = (a) => 2 * Math.atan(apy / 2 / a) * (180 / Math.PI),
  viewPixelWidthMobile = 1024,
  viewPixelHeightMobile = 2048,
  apyMobile = (viewPixelHeightMobile * aperture) / viewPixelWidthMobile,
  getFovMobile = (a) => 2 * Math.atan(apyMobile / 2 / a) * (180 / Math.PI);
class CameraControls {
  useOrbitControls = !1;
  scene1AnimationRatio = 0;
  scene2AnimationRatio = 0;
  scene3AnimationRatio = 0;
  bokehFocusDistance = 1e3;
  scene1 = {};
  scene2 = {};
  scene3 = {};
  preInit(e) {
    properties.loader.add(settings.MODEL_PATH + "scene1/SC_01_CAMERA.buf", {
      onLoad: (t) => this._onSceneCameraAnimationLoad(t, this.scene1),
    }),
      properties.loader.add(settings.MODEL_PATH + "scene3/SC_03_CAMERA.buf", {
        onLoad: (t) => this._onSceneCameraAnimationLoad(t, this.scene3),
      }),
      (this.DEFAULT_CAMERA_POSITION = new Vector3(0, -220, 30)),
      (this.DEFAULT_LOOKAT_POSITION = new Vector3(0, -220, 0)),
      (this._brownianMotion = null),
      (this._orbitControls = null),
      (this._orbitCamera = null),
      (this._camera = null),
      (this._q1 = new Quaternion()),
      (this._q2 = new Quaternion()),
      (this._e = new Euler()),
      (this._v1 = new Vector3()),
      (this._v2 = new Vector3()),
      (this._e = new Euler()),
      (this._camera = properties.camera),
      this._camera && this._camera.position && this._camera.position.copy(this.DEFAULT_CAMERA_POSITION),
      (this._brownianMotion = new BrownianMotion()),
      this.useOrbitControls === !0 &&
        ((this._orbitCamera = this._camera.clone()),
        (this._orbitControls = new OrbitControls(
          this._orbitCamera,
          document.body,
        )),
        (this._orbitControls.enableDamping = !0),
        this._orbitControls.target0.copy(this.DEFAULT_LOOKAT_POSITION),
        this._orbitControls.reset());
  }
  _onSceneCameraAnimationLoad(e, t) {
    (t.cameraAnimationPositionArray = e.attributes.position.array),
      (t.cameraAnimationOrientationArray = e.attributes.orient.array),
      (t.cameraAnimationFocalArray = e.attributes.focal.array),
      (t.cameraAnimationMobileFocalArray = e.attributes.mobileFocal.array),
      (t.cameraAnimationDistArray = e.attributes.dist.array),
      (t.cameraAnimationCount = e.attributes.position.count);
  }
  init() {}
  resize(e, t) {}
  _applyCameraAnimation(e, t, i) {
    const n = properties.isMobileLayout,
      r = i * t.cameraAnimationCount,
      o = Math.min(Math.floor(r), t.cameraAnimationCount - 1),
      s = r - o,
      l = Math.min(o + 1, t.cameraAnimationCount - 1);
    this._v1.fromArray(t.cameraAnimationPositionArray, o * 3),
      this._v2.fromArray(t.cameraAnimationPositionArray, l * 3),
      this._v1.lerp(this._v2, s),
      e.position.copy(this._v1),
      this._q1.fromArray(t.cameraAnimationOrientationArray, o * 4),
      this._q2.fromArray(t.cameraAnimationOrientationArray, l * 4),
      this._q1.slerp(this._q2, s),
      e.quaternion.copy(this._q1);
    const u = n
        ? t.cameraAnimationMobileFocalArray[o]
        : t.cameraAnimationFocalArray[o],
      h = n
        ? t.cameraAnimationMobileFocalArray[l]
        : t.cameraAnimationFocalArray[l],
      d = math.mix(u, h, s);
    e.fov = n ? getFovMobile(d) : getFov(d);
    const c = t.cameraAnimationDistArray[o],
      m = t.cameraAnimationDistArray[l],
      _ = math.mix(c, m, s);
    (this.bokehFocusDistance = _), (this.cameraDistance = _ * 0.5);
  }
  update(e) {
    let t = this._camera || properties.camera;
    if (!t) return;
    t.matrix.identity(),
      t.matrix.decompose(t.position, t.quaternion, t.scale),
      (this.cameraDistance = 1),
      this.scene1.cameraAnimationCount &&
        (this._applyCameraAnimation(t, this.scene1, this.scene1AnimationRatio),
        (t.fov += math.fit(properties.startTime, 0.2, 2, 5, 0, ease.cubicOut)),
        t.translateZ(
          math.fit(properties.startTime, 0.2, 2, -200, 0, ease.cubicOut),
        ));
    if (this.scene2AnimationRatio > 0) {
      this.cameraDistance = 300;
      const r = 150,
        s =
          (scene2.WIDTH * properties.viewportHeight) / properties.viewportWidth,
        l = scene2.HEIGHT - s * 2;
      (t.fov = Math.atan(s / 2 / r) * (180 / Math.PI) * 2),
        t.position.set(
          math.fit(this.scene2AnimationRatio, 0, 1, l / 2, -l / 2),
          r,
          0,
        ),
        t.rotation.set(-Math.PI / 2, 0, -Math.PI / 2);
    }
    this.scene3.cameraAnimationCount &&
      this.scene3AnimationRatio > 0 &&
      this._applyCameraAnimation(t, this.scene3, this.scene3AnimationRatio),
      t.updateProjectionMatrix(),
      t.translateZ(this.cameraDistance * -1);
    let i = math.clamp(input.mouseXY.y, -1, 1) * properties.cameraLookStrength,
      n = math.clamp(-input.mouseXY.x, -1, 1) * properties.cameraLookStrength;
    (properties.cameraLookX +=
      (i - properties.cameraLookX) * properties.cameraLookEaseDamp),
      (properties.cameraLookY +=
        (n - properties.cameraLookY) * properties.cameraLookEaseDamp),
      this._e.set(properties.cameraLookX, properties.cameraLookY, 0),
      this._q1.setFromEuler(this._e),
      t.quaternion.multiply(this._q1),
      t.translateZ(this.cameraDistance),
      t.matrix.compose(t.position, t.quaternion, t.scale),
      (this._brownianMotion.positionAmplitude =
        properties.cameraShakePositionStrength),
      (this._brownianMotion.positionFrequency =
        properties.cameraShakePositionSpeed),
      (this._brownianMotion.rotationAmplitude =
        properties.cameraShakeRotationStrength),
      (this._brownianMotion.rotationFrequency =
        properties.cameraShakeRotationSpeed),
      this._brownianMotion.update(e),
      t.matrix.multiply(this._brownianMotion.matrix),
      t.matrix.decompose(t.position, t.quaternion, t.scale);
  }
}
const cameraControls = new CameraControls(),
  vert$5 = `#define GLSLIFY 1
varying vec3 v_worldPosition;varying vec2 v_uv;varying float v_instanceTextureId;varying vec3 v_instancePos;varying vec3 v_instanceRands;varying vec3 v_mvPosition;attribute float a_instanceTextureId;attribute vec3 a_instancePos;attribute vec3 a_instanceRands;uniform float u_time;uniform float u_scale;vec2 rotate(vec2 v,float a){float s=sin(a);float c=cos(a);mat2 m=mat2(c,s,-s,c);return m*v;}float linearStep(float edge0,float edge1,float x){return clamp((x-edge0)/(edge1-edge0),0.0,1.0);}vec4 quaternion(vec3 axis,float halfAngle){return vec4(axis*sin(halfAngle),cos(halfAngle));}vec3 qrotate(vec4 q,vec3 v){return v+2.*cross(q.xyz,cross(q.xyz,v)+q.w*v);}const float PI=3.1415654;vec4 mod289(vec4 x){return x-floor(x*(1.0/289.0))*289.0;}float mod289(float x){return x-floor(x*(1.0/289.0))*289.0;}vec4 permute(vec4 x){return mod289(((x*34.0)+1.0)*x);}float permute(float x){return mod289(((x*34.0)+1.0)*x);}vec4 taylorInvSqrt(vec4 r){return 1.79284291400159-0.85373472095314*r;}float taylorInvSqrt(float r){return 1.79284291400159-0.85373472095314*r;}vec4 grad4(float j,vec4 ip){const vec4 ones=vec4(1.0,1.0,1.0,-1.0);vec4 p,s;p.xyz=floor(fract(vec3(j)*ip.xyz)*7.0)*ip.z-1.0;p.w=1.5-dot(abs(p.xyz),ones.xyz);s=vec4(lessThan(p,vec4(0.0)));p.xyz=p.xyz+(s.xyz*2.0-1.0)*s.www;return p;}
#define F4 0.309016994374947451
vec4 simplexNoiseDerivatives(vec4 v_0){const vec4 C=vec4(0.138196601125011,0.276393202250021,0.414589803375032,-0.447213595499958);vec4 i=floor(v_0+dot(v_0,vec4(F4)));vec4 x0=v_0-i+dot(i,C.xxxx);vec4 i0;vec3 isX=step(x0.yzw,x0.xxx);vec3 isYZ=step(x0.zww,x0.yyz);i0.x=isX.x+isX.y+isX.z;i0.yzw=1.0-isX;i0.y+=isYZ.x+isYZ.y;i0.zw+=1.0-isYZ.xy;i0.z+=isYZ.z;i0.w+=1.0-isYZ.z;vec4 i3=clamp(i0,0.0,1.0);vec4 i2=clamp(i0-1.0,0.0,1.0);vec4 i1=clamp(i0-2.0,0.0,1.0);vec4 x1=x0-i1+C.xxxx;vec4 x2=x0-i2+C.yyyy;vec4 x3=x0-i3+C.zzzz;vec4 x4=x0+C.wwww;i=mod289(i);float j0=permute(permute(permute(permute(i.w)+i.z)+i.y)+i.x);vec4 j1=permute(permute(permute(permute(i.w+vec4(i1.w,i2.w,i3.w,1.0))+i.z+vec4(i1.z,i2.z,i3.z,1.0))+i.y+vec4(i1.y,i2.y,i3.y,1.0))+i.x+vec4(i1.x,i2.x,i3.x,1.0));vec4 ip=vec4(1.0/294.0,1.0/49.0,1.0/7.0,0.0);vec4 p0=grad4(j0,ip);vec4 p1=grad4(j1.x,ip);vec4 p2=grad4(j1.y,ip);vec4 p3=grad4(j1.z,ip);vec4 p4=grad4(j1.w,ip);vec4 norm=taylorInvSqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));p0*=norm.x;p1*=norm.y;p2*=norm.z;p3*=norm.w;p4*=taylorInvSqrt(dot(p4,p4));vec3 values0=vec3(dot(p0,x0),dot(p1,x1),dot(p2,x2));vec2 values1=vec2(dot(p3,x3),dot(p4,x4));vec3 m0=max(0.5-vec3(dot(x0,x0),dot(x1,x1),dot(x2,x2)),0.0);vec2 m1=max(0.5-vec2(dot(x3,x3),dot(x4,x4)),0.0);vec3 temp0=-6.0*m0*m0*values0;vec2 temp1=-6.0*m1*m1*values1;vec3 mmm0=m0*m0*m0;vec2 mmm1=m1*m1*m1;float dx=temp0[0]*x0.x+temp0[1]*x1.x+temp0[2]*x2.x+temp1[0]*x3.x+temp1[1]*x4.x+mmm0[0]*p0.x+mmm0[1]*p1.x+mmm0[2]*p2.x+mmm1[0]*p3.x+mmm1[1]*p4.x;float dy=temp0[0]*x0.y+temp0[1]*x1.y+temp0[2]*x2.y+temp1[0]*x3.y+temp1[1]*x4.y+mmm0[0]*p0.y+mmm0[1]*p1.y+mmm0[2]*p2.y+mmm1[0]*p3.y+mmm1[1]*p4.y;float dz=temp0[0]*x0.z+temp0[1]*x1.z+temp0[2]*x2.z+temp1[0]*x3.z+temp1[1]*x4.z+mmm0[0]*p0.z+mmm0[1]*p1.z+mmm0[2]*p2.z+mmm1[0]*p3.z+mmm1[1]*p4.z;float dw=temp0[0]*x0.w+temp0[1]*x1.w+temp0[2]*x2.w+temp1[0]*x3.w+temp1[1]*x4.w+mmm0[0]*p0.w+mmm0[1]*p1.w+mmm0[2]*p2.w+mmm1[0]*p3.w+mmm1[1]*p4.w;return vec4(dx,dy,dz,dw)*49.0;}void main(){float scale=u_scale*(a_instanceRands.x*0.25+0.75);vec4 noise=simplexNoiseDerivatives(vec4(a_instancePos,0.01*u_time));vec3 localPos=position.xyz*scale;vec3 instancePos=a_instancePos;instancePos+=a_instanceRands.z*noise.xyz*70.0;vec4 mvPosition=modelViewMatrix*vec4(instancePos,1.0);mvPosition.xyz+=localPos;gl_Position=projectionMatrix*mvPosition;v_worldPosition=(modelMatrix*vec4(instancePos,1.)).xyz;v_uv=0.5+rotate(uv-0.5,a_instanceRands.y*1.0+sign(-a_instancePos.x)*u_time*mix(0.025,0.005,a_instanceRands.z));v_instanceTextureId=a_instanceTextureId;v_instanceRands=a_instanceRands;v_instancePos=a_instancePos;v_mvPosition=mvPosition.xyz;}`,
  frag$5 = `#define GLSLIFY 1
varying vec3 v_worldPosition;varying vec2 v_uv;varying float v_instanceTextureId;varying vec3 v_instanceRands;varying vec3 v_instancePos;varying vec3 v_mvPosition;uniform float u_time;uniform sampler2D u_texture0;uniform sampler2D u_texture1;uniform sampler2D u_texture2;uniform vec3 u_color0;uniform vec3 u_color1;uniform float u_alpha;
#define saturate( a ) clamp( a, 0.0, 1.0 )
float linearStep(float edge0,float edge1,float x){return clamp((x-edge0)/(edge1-edge0),0.0,1.0);}vec4 mod289(vec4 x){return x-floor(x*(1.0/289.0))*289.0;}float mod289(float x){return x-floor(x*(1.0/289.0))*289.0;}vec4 permute(vec4 x){return mod289(((x*34.0)+1.0)*x);}float permute(float x){return mod289(((x*34.0)+1.0)*x);}vec4 taylorInvSqrt(vec4 r){return 1.79284291400159-0.85373472095314*r;}float taylorInvSqrt(float r){return 1.79284291400159-0.85373472095314*r;}vec4 grad4(float j,vec4 ip){const vec4 ones=vec4(1.0,1.0,1.0,-1.0);vec4 p,s;p.xyz=floor(fract(vec3(j)*ip.xyz)*7.0)*ip.z-1.0;p.w=1.5-dot(abs(p.xyz),ones.xyz);s=vec4(lessThan(p,vec4(0.0)));p.xyz=p.xyz+(s.xyz*2.0-1.0)*s.www;return p;}
#define F4 0.309016994374947451
vec4 simplexNoiseDerivatives(vec4 v){const vec4 C=vec4(0.138196601125011,0.276393202250021,0.414589803375032,-0.447213595499958);vec4 i=floor(v+dot(v,vec4(F4)));vec4 x0=v-i+dot(i,C.xxxx);vec4 i0;vec3 isX=step(x0.yzw,x0.xxx);vec3 isYZ=step(x0.zww,x0.yyz);i0.x=isX.x+isX.y+isX.z;i0.yzw=1.0-isX;i0.y+=isYZ.x+isYZ.y;i0.zw+=1.0-isYZ.xy;i0.z+=isYZ.z;i0.w+=1.0-isYZ.z;vec4 i3=clamp(i0,0.0,1.0);vec4 i2=clamp(i0-1.0,0.0,1.0);vec4 i1=clamp(i0-2.0,0.0,1.0);vec4 x1=x0-i1+C.xxxx;vec4 x2=x0-i2+C.yyyy;vec4 x3=x0-i3+C.zzzz;vec4 x4=x0+C.wwww;i=mod289(i);float j0=permute(permute(permute(permute(i.w)+i.z)+i.y)+i.x);vec4 j1=permute(permute(permute(permute(i.w+vec4(i1.w,i2.w,i3.w,1.0))+i.z+vec4(i1.z,i2.z,i3.z,1.0))+i.y+vec4(i1.y,i2.y,i3.y,1.0))+i.x+vec4(i1.x,i2.x,i3.x,1.0));vec4 ip=vec4(1.0/294.0,1.0/49.0,1.0/7.0,0.0);vec4 p0=grad4(j0,ip);vec4 p1=grad4(j1.x,ip);vec4 p2=grad4(j1.y,ip);vec4 p3=grad4(j1.z,ip);vec4 p4=grad4(j1.w,ip);vec4 norm=taylorInvSqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));p0*=norm.x;p1*=norm.y;p2*=norm.z;p3*=norm.w;p4*=taylorInvSqrt(dot(p4,p4));vec3 values0=vec3(dot(p0,x0),dot(p1,x1),dot(p2,x2));vec2 values1=vec2(dot(p3,x3),dot(p4,x4));vec3 m0=max(0.5-vec3(dot(x0,x0),dot(x1,x1),dot(x2,x2)),0.0);vec2 m1=max(0.5-vec2(dot(x3,x3),dot(x4,x4)),0.0);vec3 temp0=-6.0*m0*m0*values0;vec2 temp1=-6.0*m1*m1*values1;vec3 mmm0=m0*m0*m0;vec2 mmm1=m1*m1*m1;float dx=temp0[0]*x0.x+temp0[1]*x1.x+temp0[2]*x2.x+temp1[0]*x3.x+temp1[1]*x4.x+mmm0[0]*p0.x+mmm0[1]*p1.x+mmm0[2]*p2.x+mmm1[0]*p3.x+mmm1[1]*p4.x;float dy=temp0[0]*x0.y+temp0[1]*x1.y+temp0[2]*x2.y+temp1[0]*x3.y+temp1[1]*x4.y+mmm0[0]*p0.y+mmm0[1]*p1.y+mmm0[2]*p2.y+mmm1[0]*p3.y+mmm1[1]*p4.y;float dz=temp0[0]*x0.z+temp0[1]*x1.z+temp0[2]*x2.z+temp1[0]*x3.z+temp1[1]*x4.z+mmm0[0]*p0.z+mmm0[1]*p1.z+mmm0[2]*p2.z+mmm1[0]*p3.z+mmm1[1]*p4.z;float dw=temp0[0]*x0.w+temp0[1]*x1.w+temp0[2]*x2.w+temp1[0]*x3.w+temp1[1]*x4.w+mmm0[0]*p0.w+mmm0[1]*p1.w+mmm0[2]*p2.w+mmm1[0]*p3.w+mmm1[1]*p4.w;return vec4(dx,dy,dz,dw)*49.0;}void main(){vec2 uv=v_uv;vec4 noise=simplexNoiseDerivatives(vec4(5.0*v_uv.x+v_instancePos.x,5.0*(v_uv.y+v_instanceRands.z),0.1*u_time,1.0));uv+=noise.xy*0.004;float cloudAlpha=0.0;if(v_instanceTextureId<0.5){cloudAlpha=texture(u_texture0,uv).r;}else if(v_instanceTextureId<1.5){cloudAlpha=texture(u_texture1,uv).r;}else if(v_instanceTextureId<2.5){cloudAlpha=texture(u_texture2,uv).r;}if(cloudAlpha<0.01){discard;}vec3 color=0.3+0.7*mix(u_color0,u_color1,1.0-cloudAlpha);float alpha=u_alpha*(0.2+0.8*abs(v_instanceRands.z))*cloudAlpha;alpha*=smoothstep(1.0,150.0,-v_mvPosition.z);gl_FragColor=vec4(mix(u_color0,u_color1,1.0-cloudAlpha),alpha);}`,
  POSITIONS = [
    { x: -500, y: 500, z: -1e3 },
    { x: -800, y: 200, z: -900 },
    { x: -100, y: 300, z: -800 },
    { x: 300, y: 100, z: -1e3 },
    { x: 700, y: 300, z: -1e3 },
    { x: 1200, y: 200, z: -1300 },
    { x: 1700, y: 500, z: 1e3 },
    { x: 1700, y: 300, z: 200 },
    { x: 1700, y: 500, z: 1500 },
    { x: 1200, y: 300, z: 3e3 },
  ];
let Clouds$1 = class {
  container = new Object3D();
  isVisible = !1;
  INSTANCES_COUNT = POSITIONS.length;
  opacity = 0.25;
  sharedUniforms = {
    u_color0: { value: new Color("#ad899e") },
    u_color1: { value: new Color("#e2bd79") },
    u_alpha: { value: 0 },
  };
  preInit() {
    const e =
      settings.TEXTURE_PATH + "clouds/" + (browser.isMobile ? "mobile/" : "");
    (this.texture0 = properties.loader.add(e + "1.webp", {
      type: "texture",
    }).content),
      (this.texture1 = properties.loader.add(e + "2.webp", {
        type: "texture",
      }).content),
      (this.texture2 = properties.loader.add(e + "3.webp", {
        type: "texture",
      }).content);
  }
  init() {
    const e = new PlaneGeometry(1, 1),
      t = new InstancedBufferGeometry();
    for (let o in e.attributes) t.setAttribute(o, e.attributes[o]);
    t.setIndex(e.index);
    const i = new Float32Array(this.INSTANCES_COUNT),
      n = new Float32Array(this.INSTANCES_COUNT * 3),
      r = new Float32Array(this.INSTANCES_COUNT * 3);
    for (let o = 0, s = 0; o < this.INSTANCES_COUNT; o++)
      (i[o] = o % 3),
        (n[s] = POSITIONS[o].x),
        (n[s + 1] = POSITIONS[o].y),
        (n[s + 2] = POSITIONS[o].z),
        (r[s] = Math.random() * 2 - 1),
        (r[s + 1] = Math.random() * 2 - 1),
        (r[s + 2] = Math.random() * 2 - 1),
        (s += 3);
    t.setAttribute("a_instanceTextureId", new InstancedBufferAttribute(i, 1)),
      t.setAttribute("a_instancePos", new InstancedBufferAttribute(n, 3)),
      t.setAttribute("a_instanceRands", new InstancedBufferAttribute(r, 3)),
      (this.mesh = new Mesh(
        t,
        new ShaderMaterial({
          vertexShader: vert$5,
          fragmentShader: frag$5,
          uniforms: {
            u_texture0: { value: this.texture0 },
            u_texture1: { value: this.texture1 },
            u_texture2: { value: this.texture2 },
            u_time: properties.sharedUniforms.u_time,
            u_scale: { value: browser.isMobile ? 500 : 1e3 },
            ...this.sharedUniforms,
          },
          depthWrite: !1,
          blending: AdditiveBlending,
        }),
      )),
      (this.mesh.frustumCulled = !1),
      (this.mesh.renderOrder = 1),
      this.container.add(this.mesh);
  }
  resize(e, t) {}
  update(e) {
    (this.sharedUniforms.u_alpha.value = this.opacity),
      (this.container.visible = this.isVisible);
  }
};
const clouds$1 = new Clouds$1(),
  vert$4 = `#define GLSLIFY 1
varying vec3 v_worldPosition;varying vec2 v_uv;varying vec3 v_instancePos;varying vec3 v_instanceRands;varying vec3 v_mvPosition;attribute vec3 a_instancePos;attribute vec3 a_instanceRands;uniform float u_time;uniform float u_scale;float linearStep(float edge0,float edge1,float x){return clamp((x-edge0)/(edge1-edge0),0.0,1.0);}const float PI=3.1415654;vec4 mod289(vec4 x){return x-floor(x*(1.0/289.0))*289.0;}float mod289(float x){return x-floor(x*(1.0/289.0))*289.0;}vec4 permute(vec4 x){return mod289(((x*34.0)+1.0)*x);}float permute(float x){return mod289(((x*34.0)+1.0)*x);}vec4 taylorInvSqrt(vec4 r){return 1.79284291400159-0.85373472095314*r;}float taylorInvSqrt(float r){return 1.79284291400159-0.85373472095314*r;}vec4 grad4(float j,vec4 ip){const vec4 ones=vec4(1.0,1.0,1.0,-1.0);vec4 p,s;p.xyz=floor(fract(vec3(j)*ip.xyz)*7.0)*ip.z-1.0;p.w=1.5-dot(abs(p.xyz),ones.xyz);s=vec4(lessThan(p,vec4(0.0)));p.xyz=p.xyz+(s.xyz*2.0-1.0)*s.www;return p;}
#define F4 0.309016994374947451
vec4 simplexNoiseDerivatives(vec4 v){const vec4 C=vec4(0.138196601125011,0.276393202250021,0.414589803375032,-0.447213595499958);vec4 i=floor(v+dot(v,vec4(F4)));vec4 x0=v-i+dot(i,C.xxxx);vec4 i0;vec3 isX=step(x0.yzw,x0.xxx);vec3 isYZ=step(x0.zww,x0.yyz);i0.x=isX.x+isX.y+isX.z;i0.yzw=1.0-isX;i0.y+=isYZ.x+isYZ.y;i0.zw+=1.0-isYZ.xy;i0.z+=isYZ.z;i0.w+=1.0-isYZ.z;vec4 i3=clamp(i0,0.0,1.0);vec4 i2=clamp(i0-1.0,0.0,1.0);vec4 i1=clamp(i0-2.0,0.0,1.0);vec4 x1=x0-i1+C.xxxx;vec4 x2=x0-i2+C.yyyy;vec4 x3=x0-i3+C.zzzz;vec4 x4=x0+C.wwww;i=mod289(i);float j0=permute(permute(permute(permute(i.w)+i.z)+i.y)+i.x);vec4 j1=permute(permute(permute(permute(i.w+vec4(i1.w,i2.w,i3.w,1.0))+i.z+vec4(i1.z,i2.z,i3.z,1.0))+i.y+vec4(i1.y,i2.y,i3.y,1.0))+i.x+vec4(i1.x,i2.x,i3.x,1.0));vec4 ip=vec4(1.0/294.0,1.0/49.0,1.0/7.0,0.0);vec4 p0=grad4(j0,ip);vec4 p1=grad4(j1.x,ip);vec4 p2=grad4(j1.y,ip);vec4 p3=grad4(j1.z,ip);vec4 p4=grad4(j1.w,ip);vec4 norm=taylorInvSqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));p0*=norm.x;p1*=norm.y;p2*=norm.z;p3*=norm.w;p4*=taylorInvSqrt(dot(p4,p4));vec3 values0=vec3(dot(p0,x0),dot(p1,x1),dot(p2,x2));vec2 values1=vec2(dot(p3,x3),dot(p4,x4));vec3 m0=max(0.5-vec3(dot(x0,x0),dot(x1,x1),dot(x2,x2)),0.0);vec2 m1=max(0.5-vec2(dot(x3,x3),dot(x4,x4)),0.0);vec3 temp0=-6.0*m0*m0*values0;vec2 temp1=-6.0*m1*m1*values1;vec3 mmm0=m0*m0*m0;vec2 mmm1=m1*m1*m1;float dx=temp0[0]*x0.x+temp0[1]*x1.x+temp0[2]*x2.x+temp1[0]*x3.x+temp1[1]*x4.x+mmm0[0]*p0.x+mmm0[1]*p1.x+mmm0[2]*p2.x+mmm1[0]*p3.x+mmm1[1]*p4.x;float dy=temp0[0]*x0.y+temp0[1]*x1.y+temp0[2]*x2.y+temp1[0]*x3.y+temp1[1]*x4.y+mmm0[0]*p0.y+mmm0[1]*p1.y+mmm0[2]*p2.y+mmm1[0]*p3.y+mmm1[1]*p4.y;float dz=temp0[0]*x0.z+temp0[1]*x1.z+temp0[2]*x2.z+temp1[0]*x3.z+temp1[1]*x4.z+mmm0[0]*p0.z+mmm0[1]*p1.z+mmm0[2]*p2.z+mmm1[0]*p3.z+mmm1[1]*p4.z;float dw=temp0[0]*x0.w+temp0[1]*x1.w+temp0[2]*x2.w+temp1[0]*x3.w+temp1[1]*x4.w+mmm0[0]*p0.w+mmm0[1]*p1.w+mmm0[2]*p2.w+mmm1[0]*p3.w+mmm1[1]*p4.w;return vec4(dx,dy,dz,dw)*49.0;}void main(){float scale=u_scale*(a_instanceRands.x*0.25+0.75);vec4 noise=simplexNoiseDerivatives(vec4(a_instancePos,0.015*u_time));vec3 localPos=position.xyz*scale;vec3 instancePos=a_instancePos;instancePos+=a_instanceRands.z*noise.xyz*100.0;vec4 mvPosition=modelViewMatrix*vec4(instancePos,1.0);v_mvPosition=-mvPosition.xyz;mvPosition.xyz+=localPos;gl_Position=projectionMatrix*mvPosition;v_worldPosition=(modelMatrix*vec4(instancePos,1.)).xyz;v_uv=uv;v_instanceRands=a_instanceRands;v_instancePos=a_instancePos;}`,
  frag$4 = `#define GLSLIFY 1
varying vec3 v_worldPosition;varying vec2 v_uv;varying vec3 v_instanceRands;varying vec3 v_instancePos;varying vec3 v_mvPosition;uniform float u_time;uniform vec3 u_color;uniform float u_alpha;
#define saturate( a ) clamp( a, 0.0, 1.0 )
float linearStep(float edge0,float edge1,float x){return clamp((x-edge0)/(edge1-edge0),0.0,1.0);}void main(){vec2 uv=v_uv;float d=length(2.0*(v_uv-0.5));float alpha=linearStep(1.0,0.25,d);gl_FragColor=vec4(u_color,u_alpha*alpha);}`;
let Particles$1 = class {
  container = new Object3D();
  isVisible = !1;
  INSTANCES_COUNT = 256;
  sharedUniforms = {
    u_color: { value: new Color("#55ff00") },
    u_alpha: { value: 0.05 },
  };
  preInit() {}
  init() {
    const e = new PlaneGeometry(1, 1),
      t = new InstancedBufferGeometry();
    for (let r in e.attributes) t.setAttribute(r, e.attributes[r]);
    t.setIndex(e.index);
    const i = new Float32Array(this.INSTANCES_COUNT * 3),
      n = new Float32Array(this.INSTANCES_COUNT * 3);
    for (let r = 0, o = 0; r < this.INSTANCES_COUNT; r++)
      (i[o] = -1e3 + 4e3 * Math.random()),
        (i[o + 1] = 100 + 500 * Math.random()),
        (i[o + 2] = -1e3 + 2e3 * Math.random()),
        (n[o] = Math.random() * 2 - 1),
        (n[o + 1] = Math.random() * 2 - 1),
        (n[o + 2] = Math.random() * 2 - 1),
        (o += 3);
    t.setAttribute("a_instancePos", new InstancedBufferAttribute(i, 3)),
      t.setAttribute("a_instanceRands", new InstancedBufferAttribute(n, 3)),
      (this.mesh = new Mesh(
        t,
        new ShaderMaterial({
          vertexShader: vert$4,
          fragmentShader: frag$4,
          uniforms: {
            u_time: properties.sharedUniforms.u_time,
            u_resolution: properties.sharedUniforms.u_resolution,
            u_scale: { value: 10 },
            ...this.sharedUniforms,
          },
          depthWrite: !1,
          depthTest: !1,
          blending: AdditiveBlending,
        }),
      )),
      (this.mesh.frustumCulled = !1),
      (this.mesh.renderOrder = 5),
      this.container.add(this.mesh);
  }
  resize(e, t) {}
  update(e) {
    this.mesh && (this.container.visible = this.isVisible);
  }
};
const particles$1 = new Particles$1(),
  vert$3 = `#define GLSLIFY 1
varying vec2 v_uv;varying vec3 v_worldPosition;varying vec3 v_viewPosition;varying vec3 v_viewNormal;
#ifdef IS_WATER
attribute float mask;varying float v_mask;
#endif
#ifdef HAS_ALPHA
attribute float alpha;varying float v_alpha;
#endif
#ifdef IS_SCENE_1
attribute float shadowmask;attribute float trailRatio;uniform float u_dimRatio;uniform float u_trailRatio;varying float v_dimRatio;
#endif
#ifdef IS_CRACKS
attribute vec3 OP;attribute float side;attribute float dist;attribute float curveu;attribute float Cd;uniform float u_crackRatio;varying float v_crackRatio;varying float v_dist;varying float v_side;varying float v_shade;float linearStep(float edge0,float edge1,float x){return clamp((x-edge0)/(edge1-edge0),0.0,1.0);}float backOut(float e){float t=1.70158;return--e*e*((t+1.)*e+t)+1.;}
#endif
void main(){vec3 pos=position;
#ifdef IS_CRACKS
float crackRatio=u_crackRatio;crackRatio=linearStep(curveu,curveu+0.15,crackRatio*1.15);crackRatio=backOut(crackRatio);pos=mix(OP,pos,crackRatio);v_crackRatio=crackRatio;v_dist=dist;v_side=side;v_shade=Cd;
#endif
vec4 viewPosition=modelViewMatrix*vec4(pos,1.0);gl_Position=projectionMatrix*viewPosition;v_uv=uv;
#ifdef IS_WATER
v_mask=mask;
#endif
#ifdef HAS_ALPHA
v_alpha=alpha;
#endif
#ifdef IS_SCENE_1
v_dimRatio=min(u_dimRatio,1.-(shadowmask*smoothstep(trailRatio-0.1,trailRatio,u_trailRatio)));
#endif
v_worldPosition=(modelMatrix*vec4(pos,1.0)).xyz;v_viewPosition=-viewPosition.xyz;vec3 viewNormal=normalMatrix*normal;v_viewNormal=normalize(viewNormal);}`,
  frag$3 = `#define GLSLIFY 1
varying vec2 v_uv;varying vec3 v_worldPosition;varying vec3 v_viewPosition;varying vec3 v_viewNormal;
#ifdef IS_WATER
varying float v_mask;vec4 mod289(vec4 x){return x-floor(x*(1.0/289.0))*289.0;}float mod289(float x){return x-floor(x*(1.0/289.0))*289.0;}vec4 permute(vec4 x){return mod289(((x*34.0)+1.0)*x);}float permute(float x){return mod289(((x*34.0)+1.0)*x);}vec4 taylorInvSqrt(vec4 r){return 1.79284291400159-0.85373472095314*r;}float taylorInvSqrt(float r){return 1.79284291400159-0.85373472095314*r;}vec4 grad4(float j,vec4 ip){const vec4 ones=vec4(1.0,1.0,1.0,-1.0);vec4 p,s;p.xyz=floor(fract(vec3(j)*ip.xyz)*7.0)*ip.z-1.0;p.w=1.5-dot(abs(p.xyz),ones.xyz);s=vec4(lessThan(p,vec4(0.0)));p.xyz=p.xyz+(s.xyz*2.0-1.0)*s.www;return p;}
#define F4 0.309016994374947451
vec4 simplexNoiseDerivatives(vec4 v){const vec4 C=vec4(0.138196601125011,0.276393202250021,0.414589803375032,-0.447213595499958);vec4 i=floor(v+dot(v,vec4(F4)));vec4 x0=v-i+dot(i,C.xxxx);vec4 i0;vec3 isX=step(x0.yzw,x0.xxx);vec3 isYZ=step(x0.zww,x0.yyz);i0.x=isX.x+isX.y+isX.z;i0.yzw=1.0-isX;i0.y+=isYZ.x+isYZ.y;i0.zw+=1.0-isYZ.xy;i0.z+=isYZ.z;i0.w+=1.0-isYZ.z;vec4 i3=clamp(i0,0.0,1.0);vec4 i2=clamp(i0-1.0,0.0,1.0);vec4 i1=clamp(i0-2.0,0.0,1.0);vec4 x1=x0-i1+C.xxxx;vec4 x2=x0-i2+C.yyyy;vec4 x3=x0-i3+C.zzzz;vec4 x4=x0+C.wwww;i=mod289(i);float j0=permute(permute(permute(permute(i.w)+i.z)+i.y)+i.x);vec4 j1=permute(permute(permute(permute(i.w+vec4(i1.w,i2.w,i3.w,1.0))+i.z+vec4(i1.z,i2.z,i3.z,1.0))+i.y+vec4(i1.y,i2.y,i3.y,1.0))+i.x+vec4(i1.x,i2.x,i3.x,1.0));vec4 ip=vec4(1.0/294.0,1.0/49.0,1.0/7.0,0.0);vec4 p0=grad4(j0,ip);vec4 p1=grad4(j1.x,ip);vec4 p2=grad4(j1.y,ip);vec4 p3=grad4(j1.z,ip);vec4 p4=grad4(j1.w,ip);vec4 norm=taylorInvSqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));p0*=norm.x;p1*=norm.y;p2*=norm.z;p3*=norm.w;p4*=taylorInvSqrt(dot(p4,p4));vec3 values0=vec3(dot(p0,x0),dot(p1,x1),dot(p2,x2));vec2 values1=vec2(dot(p3,x3),dot(p4,x4));vec3 m0=max(0.5-vec3(dot(x0,x0),dot(x1,x1),dot(x2,x2)),0.0);vec2 m1=max(0.5-vec2(dot(x3,x3),dot(x4,x4)),0.0);vec3 temp0=-6.0*m0*m0*values0;vec2 temp1=-6.0*m1*m1*values1;vec3 mmm0=m0*m0*m0;vec2 mmm1=m1*m1*m1;float dx=temp0[0]*x0.x+temp0[1]*x1.x+temp0[2]*x2.x+temp1[0]*x3.x+temp1[1]*x4.x+mmm0[0]*p0.x+mmm0[1]*p1.x+mmm0[2]*p2.x+mmm1[0]*p3.x+mmm1[1]*p4.x;float dy=temp0[0]*x0.y+temp0[1]*x1.y+temp0[2]*x2.y+temp1[0]*x3.y+temp1[1]*x4.y+mmm0[0]*p0.y+mmm0[1]*p1.y+mmm0[2]*p2.y+mmm1[0]*p3.y+mmm1[1]*p4.y;float dz=temp0[0]*x0.z+temp0[1]*x1.z+temp0[2]*x2.z+temp1[0]*x3.z+temp1[1]*x4.z+mmm0[0]*p0.z+mmm0[1]*p1.z+mmm0[2]*p2.z+mmm1[0]*p3.z+mmm1[1]*p4.z;float dw=temp0[0]*x0.w+temp0[1]*x1.w+temp0[2]*x2.w+temp1[0]*x3.w+temp1[1]*x4.w+mmm0[0]*p0.w+mmm0[1]*p1.w+mmm0[2]*p2.w+mmm1[0]*p3.w+mmm1[1]*p4.w;return vec4(dx,dy,dz,dw)*49.0;}
#endif
#ifdef HAS_ALPHA
varying float v_alpha;
#endif
uniform sampler2D u_texture;uniform float u_time;
#ifdef IS_CRACKS
varying float v_crackRatio;varying float v_dist;varying float v_shade;varying float v_side;
#endif
#ifdef IS_SCENE_1
varying float v_dimRatio;
#endif
#include <skyAndFog>
void main(){vec2 uv=v_uv;float bloom=0.;vec3 N=normalize(v_viewNormal);vec3 V=normalize(v_viewPosition);vec3 reflection=normalize(reflect(-V,N));float NdV=clamp(abs(dot(N,V)),0.001,1.0);float fresnel=pow(1.0-NdV,5.0);
#ifdef IS_WATER
vec4 noise=simplexNoiseDerivatives(vec4(0.02*v_worldPosition*vec3(1.,0.,2.5),0.4*u_time));uv+=0.01*v_mask*v_mask*v_mask*noise.xy;
#endif
vec3 color=pow(texture2D(u_texture,uv).rgb,vec3(2.2));bloom=fresnel*color.g;
#ifdef IS_SCENE_1
color*=mix(1.,0.25,v_dimRatio);
#endif
vec3 skyColor=pow(getSkyColor(v_worldPosition),vec3(2.2));vec4 fogColor=getFogColor(color,skyColor,v_viewPosition.z);color=fogColor.rgb;
#ifdef HAS_ALPHA
float alpha=pow(clamp(v_alpha,0.,1.),.5);color=mix(skyColor,color,alpha);
#endif
#ifdef IS_CRACKS
color=clamp(color,0.,1.);color=mix(color,color*0.5*(0.3+v_shade*0.7)+(1.-abs(v_viewNormal.z))*(color*0.5),v_crackRatio*(1.-v_dist*0.8));color+=pow(1.-v_shade,5.)*v_crackRatio*vec3(0.6,.6,1.)*5.;bloom=mix(bloom,1.-v_shade,v_crackRatio);
#endif
gl_FragColor=vec4(color,fogColor.a*bloom);gl_FragColor.rgb=pow(gl_FragColor.rgb,vec3(1.0/2.2));}`,
  skyVert = `#define GLSLIFY 1
varying vec2 v_uv;varying vec3 v_worldPosition;varying vec3 v_modelPosition;void main(){vec3 pos=position;vec4 viewPosition=modelViewMatrix*vec4(pos,1.0);gl_Position=projectionMatrix*viewPosition;v_uv=uv;v_worldPosition=(modelMatrix*vec4(pos,1.0)).xyz;v_modelPosition=pos;}`,
  skyFrag = `#define GLSLIFY 1
varying vec2 v_uv;varying vec3 v_worldPosition;varying vec3 v_modelPosition;
#include <skyAndFog>
void main(){vec3 skyColor=getSkyColor(v_worldPosition);gl_FragColor=vec4(skyColor,0.0);}`,
  positionFrag = `#define GLSLIFY 1
uniform sampler2D u_splineTexture;uniform vec2 u_simSize;uniform float u_trailTime;varying vec2 v_uv;vec4 hash42(vec2 p){vec4 p4=fract(vec4(p.xyxy)*vec4(.1031,.1030,.0973,.1099));p4+=dot(p4,p4.wzxy+33.33);return fract((p4.xxyz+p4.yzzw)*p4.zywx);}float linearStep(float edge0,float edge1,float x){return clamp((x-edge0)/(edge1-edge0),0.0,1.0);}float fit(float value,float min0,float max0,float min1,float max1){return min1+(max1-min1)*(value-min0)/(max0-min0);}vec3 qrotate(vec4 q,vec3 v){return v+2.*cross(q.xyz,cross(q.xyz,v)+q.w*v);}vec4 quaternion(vec3 axis,float halfAngle){return vec4(axis*sin(halfAngle),cos(halfAngle));}vec3 mod289(vec3 x){return x-floor(x*(1.0/289.0))*289.0;}vec4 mod289(vec4 x){return x-floor(x*(1.0/289.0))*289.0;}vec4 permute(vec4 x){return mod289(((x*34.0)+1.0)*x);}vec4 taylorInvSqrt(vec4 r){return 1.79284291400159-0.85373472095314*r;}float snoise(vec3 v){const vec2 C=vec2(1.0/6.0,1.0/3.0);const vec4 D=vec4(0.0,0.5,1.0,2.0);vec3 i=floor(v+dot(v,C.yyy));vec3 x0=v-i+dot(i,C.xxx);vec3 g=step(x0.yzx,x0.xyz);vec3 l=1.0-g;vec3 i1=min(g.xyz,l.zxy);vec3 i2=max(g.xyz,l.zxy);vec3 x1=x0-i1+C.xxx;vec3 x2=x0-i2+C.yyy;vec3 x3=x0-D.yyy;i=mod289(i);vec4 p=permute(permute(permute(i.z+vec4(0.0,i1.z,i2.z,1.0))+i.y+vec4(0.0,i1.y,i2.y,1.0))+i.x+vec4(0.0,i1.x,i2.x,1.0));float n_=0.142857142857;vec3 ns=n_*D.wyz-D.xzx;vec4 j=p-49.0*floor(p*ns.z*ns.z);vec4 x_=floor(j*ns.z);vec4 y_=floor(j-7.0*x_);vec4 x=x_*ns.x+ns.yyyy;vec4 y=y_*ns.x+ns.yyyy;vec4 h=1.0-abs(x)-abs(y);vec4 b0=vec4(x.xy,y.xy);vec4 b1=vec4(x.zw,y.zw);vec4 s0=floor(b0)*2.0+1.0;vec4 s1=floor(b1)*2.0+1.0;vec4 sh=-step(h,vec4(0.0));vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy;vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;vec3 p0=vec3(a0.xy,h.x);vec3 p1=vec3(a0.zw,h.y);vec3 p2=vec3(a1.xy,h.z);vec3 p3=vec3(a1.zw,h.w);vec4 norm=taylorInvSqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));p0*=norm.x;p1*=norm.y;p2*=norm.z;p3*=norm.w;vec4 m=max(0.6-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.0);m=m*m;return 42.0*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));}void main(){float instanceId=floor(v_uv.y*u_simSize.y);vec4 rands=hash42(vec2(instanceId,0.));vec4 splinePositionCurveu=texture2D(u_splineTexture,vec2(v_uv.x,.25));vec4 splineOrient=texture2D(u_splineTexture,vec2(v_uv.x,.75));float curveu=splinePositionCurveu.w*1.+u_trailTime*mix(0.06,0.2,rands.z)-1000.;float curveu2=splinePositionCurveu.w*3.+u_trailTime*mix(0.2,0.4,rands.y)-1000.;float spin=curveu*fit(rands.y,0.,1.,30.,60.)*(rands.z>.5 ? 1. :-1.)+rands.x*6.2831853;float radius=pow(fit(snoise(vec3(curveu2,instanceId*2.,0.)),-1.7,1.7,0.2,1.),1.5)*fit(pow(rands.w,1.5),0.,1.,5.,15.);vec4 spinQ=quaternion(vec3(0.,0.,1.),spin*.5);vec3 pos=splinePositionCurveu.xyz+qrotate(splineOrient,qrotate(spinQ,vec3(radius,0.,0.)))*(instanceId>.5 ? 1. : 0.25);gl_FragColor=vec4(pos,splinePositionCurveu.w);}`,
  vert$2 = `#define GLSLIFY 1
attribute float instanceId;uniform sampler2D u_splinePositionTexture;uniform vec2 u_simSize;uniform vec2 u_nodeDeltaUv;uniform float u_ratio;uniform float u_activeRatio;uniform float u_scale;varying vec3 v_viewNormal;varying float v_opacity;vec4 hash42(vec2 p){vec4 p4=fract(vec4(p.xyxy)*vec4(.1031,.1030,.0973,.1099));p4+=dot(p4,p4.wzxy+33.33);return fract((p4.xxyz+p4.yzzw)*p4.zywx);}void main(){vec2 simUv=vec2(position.z-1.+u_ratio,(instanceId+.5)/u_simSize.y);vec4 rands=hash42(vec2(instanceId,1.5));vec4 prevPositionCurveu=texture2D(u_splinePositionTexture,simUv-u_nodeDeltaUv);vec4 positionCurveu=texture2D(u_splinePositionTexture,simUv);vec4 nextPositionCurveu=texture2D(u_splinePositionTexture,simUv+u_nodeDeltaUv);vec3 T=normalize(nextPositionCurveu.xyz-prevPositionCurveu.xyz);vec3 B=vec3(0.,1.,0.);vec3 N=normalize(cross(T,B));B=normalize(cross(N,T));float radius=instanceId>.5 ? 0.1+rands.x*rands.x*1. : 3.;mat3 TBN=mat3(T,B,N);vec3 localPos=vec3(0.,position.xy)*radius*u_scale;vec3 pos=localPos+positionCurveu.xyz;gl_Position=projectionMatrix*modelViewMatrix*vec4(pos,1.0);v_viewNormal=normalMatrix*(TBN*vec3(0.,position.xy));v_opacity=instanceId>.5 ? 0.2+rands.y*0.5 : 1.;v_opacity*=u_activeRatio*smoothstep(1.,0.975,position.z)*smoothstep(1.-u_activeRatio*0.9,1.,position.z);}`,
  frag$2 = `#define GLSLIFY 1
varying vec3 v_viewNormal;varying float v_opacity;void main(){vec3 viewNormal=normalize(v_viewNormal);gl_FragColor=vec4(vec3(0.6,.6,1.)*viewNormal.y*viewNormal.y*viewNormal.y,1.)*v_opacity;}`,
  TRAIL_COUNT = 24,
  TRAIL_NODE_COUNT = 256,
  TUBE_RADIAL_SEGMENTS = 3;
class Scene1Trails {
  container = new Object3D();
  splinePositionRenderTarget;
  ratio = 0;
  trailTime = 0;
  activeRatio = 0;
  sharedUniforms = {
    u_splineTexture: { value: null },
    u_splinePositionTexture: { value: null },
    u_simSize: { value: new Vector2(TRAIL_NODE_COUNT, TRAIL_COUNT) },
    u_trailTime: { value: 0 },
    u_ratio: { value: 0 },
    u_activeRatio: { value: 0 },
    u_scale: { value: 1 },
  };
  isVisible = !1;
  preInit() {
    properties.loader.add(
      settings.MODEL_PATH + "scene1/SC_01_TRAIL_SPLINE.buf",
      { onLoad: (e) => this._onSplineLoad(e) },
    ),
      (this.splinePositionRenderTarget = fboHelper.createRenderTarget(
        TRAIL_NODE_COUNT,
        TRAIL_COUNT,
        !1,
        !0,
      )),
      (this.splinePositionRenderTarget.texture.type = FloatType),
      (this.sharedUniforms.u_splinePositionTexture.value =
        this.splinePositionRenderTarget.texture),
      (this.positionMaterial = fboHelper.createRawShaderMaterial({
        uniforms: {
          u_splineTexture: this.sharedUniforms.u_splineTexture,
          u_simSize: this.sharedUniforms.u_simSize,
          u_trailTime: this.sharedUniforms.u_trailTime,
        },
        fragmentShader: positionFrag,
      }));
  }
  _onSplineLoad(e) {
    let t = new Float32Array(TRAIL_NODE_COUNT * 4 * 2),
      i = e.attributes.position.array,
      n = e.attributes.curveu.array,
      r = e.attributes.orient.array,
      o = TRAIL_NODE_COUNT * 4;
    for (let d = 0, c = 0, m = 0; d < TRAIL_NODE_COUNT; d++, c += 3, m += 4)
      (t[m + 0] = i[c + 0]),
        (t[m + 1] = i[c + 1]),
        (t[m + 2] = i[c + 2]),
        (t[m + 3] = n[d]),
        (t[o + m + 0] = r[m + 0]),
        (t[o + m + 1] = r[m + 1]),
        (t[o + m + 2] = r[m + 2]),
        (t[o + m + 3] = r[m + 3]);
    this.sharedUniforms.u_splineTexture.value = fboHelper.createDataTexture(
      t,
      TRAIL_NODE_COUNT,
      2,
      !0,
      !0,
    );
    let s = new InstancedBufferGeometry(),
      l = new Float32Array(TRAIL_NODE_COUNT * TUBE_RADIAL_SEGMENTS * 3),
      u = new Uint16Array((TRAIL_NODE_COUNT - 1) * TUBE_RADIAL_SEGMENTS * 6);
    for (let d = 0, c = 0; d < TRAIL_NODE_COUNT; d++) {
      let m = (d + 0.5) / TRAIL_NODE_COUNT;
      for (let _ = 0; _ < TUBE_RADIAL_SEGMENTS; _++) {
        let f = (_ / TUBE_RADIAL_SEGMENTS) * 2 * Math.PI;
        (l[c + 0] = Math.cos(f)),
          (l[c + 1] = Math.sin(f)),
          (l[c + 2] = m),
          (c += 3);
      }
    }
    for (let d = 0, c = 0; d < TRAIL_NODE_COUNT - 1; d++)
      for (let m = 0; m < TUBE_RADIAL_SEGMENTS; m++)
        (u[c + 0] = d * TUBE_RADIAL_SEGMENTS + m),
          (u[c + 1] =
            d * TUBE_RADIAL_SEGMENTS + ((m + 1) % TUBE_RADIAL_SEGMENTS)),
          (u[c + 2] = (d + 1) * TUBE_RADIAL_SEGMENTS + m),
          (u[c + 3] = (d + 1) * TUBE_RADIAL_SEGMENTS + m),
          (u[c + 4] =
            d * TUBE_RADIAL_SEGMENTS + ((m + 1) % TUBE_RADIAL_SEGMENTS)),
          (u[c + 5] =
            (d + 1) * TUBE_RADIAL_SEGMENTS + ((m + 1) % TUBE_RADIAL_SEGMENTS)),
          (c += 6);
    s.setAttribute("position", new BufferAttribute(l, 3)),
      s.setAttribute("normal", new BufferAttribute(l, 3));
    let h = new Uint16Array(TRAIL_COUNT);
    for (let d = 0; d < TRAIL_COUNT; d++) h[d] = d;
    s.setAttribute("instanceId", new InstancedBufferAttribute(h, 1)),
      s.setIndex(new BufferAttribute(u, 1)),
      (this.mesh = new Mesh(
        s,
        new ShaderMaterial({
          vertexShader: vert$2,
          fragmentShader: frag$2,
          uniforms: {
            u_splinePositionTexture:
              this.sharedUniforms.u_splinePositionTexture,
            u_simSize: this.sharedUniforms.u_simSize,
            u_nodeDeltaUv: { value: new Vector2(1 / TRAIL_NODE_COUNT, 0) },
            u_ratio: this.sharedUniforms.u_ratio,
            u_activeRatio: this.sharedUniforms.u_activeRatio,
            u_scale: this.sharedUniforms.u_scale,
          },
          transparent: !0,
          blending: AdditiveBlending,
          depthWrite: !1,
        }),
      )),
      (this.mesh.frustumCulled = !1),
      this.container.add(this.mesh);
  }
  resize(e, t) {}
  init() {}
  update(e) {
    this.isVisible
      ? (fboHelper.render(
          this.positionMaterial,
          this.splinePositionRenderTarget,
        ),
        (this.sharedUniforms.u_ratio.value = this.ratio),
        (this.trailTime += e * 0.1),
        (this.sharedUniforms.u_trailTime.value =
          this.ratio * 2 + this.trailTime),
        (this.sharedUniforms.u_activeRatio.value = this.activeRatio),
        (this.sharedUniforms.u_scale.value = properties.isMobileLayout ? 2 : 1))
      : (this.trailTime = 0),
      (this.container.visible = this.isVisible);
  }
}
const scene1Trails = new Scene1Trails(),
  vert$1 = `#define GLSLIFY 1
attribute vec2 boneIndices;attribute vec2 boneWeights;attribute float Cd;uniform sampler2D u_positionTexture;uniform sampler2D u_orientTexture;uniform float u_boneCount;uniform float u_animationFrameCount;uniform float u_animationFrame;uniform float u_ndcZ;uniform float u_centerNdcZ;varying vec3 v_viewPosition;varying vec3 v_viewNormal;varying float v_ao;varying vec2 v_uv;vec3 qrotate(vec4 q,vec3 v){return v+2.*cross(q.xyz,cross(q.xyz,v)+q.w*v);}void applyAnimation(inout vec3 pos,inout vec3 nor,in float frame){vec2 uv=vec2(boneIndices[0]+.5,frame+.5)/vec2(u_boneCount,u_animationFrameCount);vec4 tmpOrient=texture2D(u_orientTexture,uv);pos+=(qrotate(tmpOrient,position)+texture2D(u_positionTexture,uv).xyz)*boneWeights[0];nor+=(qrotate(tmpOrient,normal))*boneWeights[0];uv=vec2(boneIndices[1]+.5,frame+.5)/vec2(u_boneCount,u_animationFrameCount);tmpOrient=texture2D(u_orientTexture,uv);pos+=(qrotate(tmpOrient,position)+texture2D(u_positionTexture,uv).xyz)*boneWeights[1];nor+=(qrotate(tmpOrient,normal))*boneWeights[1];nor=normalize(nor);}void main(){vec3 pos0=vec3(0.);vec3 nor0=vec3(0.);vec3 pos1=vec3(0.);vec3 nor1=vec3(0.);float frame0=floor(mod(u_animationFrame,u_animationFrameCount));float frame1=floor(mod(u_animationFrame+1.,u_animationFrameCount));float frameRatio=fract(u_animationFrame);applyAnimation(pos0,nor0,frame0);applyAnimation(pos1,nor1,frame1);vec3 pos=mix(pos0,pos1,frameRatio);vec3 nor=normalize(mix(nor0,nor1,frameRatio));vec4 viewPosition=modelViewMatrix*vec4(pos,1.0);v_viewPosition=-viewPosition.xyz;gl_Position=projectionMatrix*viewPosition;gl_Position.z=(u_ndcZ+(gl_Position.z/gl_Position.w-u_centerNdcZ)*0.003)*gl_Position.w;v_viewNormal=normalMatrix*nor;v_ao=Cd;v_uv=uv;}`,
  frag$1 = `#define GLSLIFY 1
uniform sampler2D u_texture;varying vec3 v_viewPosition;varying vec3 v_viewNormal;varying float v_ao;varying vec2 v_uv;void main(){vec3 N=normalize(v_viewNormal);vec3 V=normalize(v_viewPosition);vec3 reflection=normalize(reflect(-V,N));float NdV=clamp(abs(dot(N,V)),0.001,1.0);float fresnel=pow(1.0-NdV,3.0)*max(0.,dot(N,vec3(0.5773)));vec4 tex=texture2D(u_texture,v_uv);tex.rgb=pow(tex.rgb,vec3(2.2));tex.rgb=tex.rgb*v_ao+fresnel*v_ao*v_ao;tex.rgb=pow(tex.rgb,vec3(1.0/2.2));gl_FragColor=tex;}`,
  channelMixerFrag = `#define GLSLIFY 1
uniform sampler2D u_texture;uniform vec4 u_channelMixerR;uniform vec4 u_channelMixerG;uniform vec4 u_channelMixerB;uniform vec4 u_channelMixerA;varying vec2 v_uv;void main(){vec4 color=texture2D(u_texture,v_uv);gl_FragColor=vec4(dot(color,u_channelMixerR),dot(color,u_channelMixerG),dot(color,u_channelMixerB),dot(color,u_channelMixerA));}`;
class TextureHelper {
  blackTexture;
  whiteTexture;
  transparentTexture;
  channelMixerMaterial;
  init() {
    (this.blackTexture = this._createPixelTexture([0, 0, 0, 255])),
      (this.whiteTexture = this._createPixelTexture([255, 255, 255, 255])),
      (this.transparentTexture = this._createPixelTexture([0, 0, 0, 0]));
  }
  _createPixelTexture(e) {
    return fboHelper.createDataTexture(new Uint8Array(e), 1, 1, !1, !0);
  }
  mixChannels(e, t, i = -1, n = -1, r = -1, o = -1) {
    this.channelMixerMaterial ||
      (this.channelMixerMaterial = new RawShaderMaterial({
        uniforms: {
          u_texture: { value: null },
          u_channelMixerR: { value: new Vector4() },
          u_channelMixerG: { value: new Vector4() },
          u_channelMixerB: { value: new Vector4() },
          u_channelMixerA: { value: new Vector4() },
        },
        vertexShader: fboHelper.vertexShader,
        fragmentShader: fboHelper.precisionPrefix + channelMixerFrag,
        blending: CustomBlending,
        blendEquation: AddEquation,
        blendDst: OneFactor,
        blendSrc: OneFactor,
        blendEquationAlpha: AddEquation,
        blendDstAlpha: OneFactor,
        blendSrcAlpha: OneFactor,
      })),
      (this.channelMixerMaterial.uniforms.u_texture.value = e),
      this.channelMixerMaterial.uniforms.u_channelMixerR.value
        .set(+(i % 4 == 0), +(i % 4 == 1), +(i % 4 == 2), +(i % 4 == 3))
        .multiplyScalar(i < 0 ? 0 : 1),
      this.channelMixerMaterial.uniforms.u_channelMixerG.value
        .set(+(n % 4 == 0), +(n % 4 == 1), +(n % 4 == 2), +(n % 4 == 3))
        .multiplyScalar(n < 0 ? 0 : 1),
      this.channelMixerMaterial.uniforms.u_channelMixerB.value
        .set(+(r % 4 == 0), +(r % 4 == 1), +(r % 4 == 2), +(r % 4 == 3))
        .multiplyScalar(r < 0 ? 0 : 1),
      this.channelMixerMaterial.uniforms.u_channelMixerA.value
        .set(+(o % 4 == 0), +(o % 4 == 1), +(o % 4 == 2), +(o % 4 == 3))
        .multiplyScalar(o < 0 ? 0 : 1);
    let s = fboHelper.getColorState();
    (fboHelper.renderer.autoClear = !1),
      fboHelper.render(this.channelMixerMaterial, t),
      fboHelper.setColorState(s);
  }
  loadRGBATexture(e, t, i = {}) {
    i = Object.assign(
      {
        isAdd: !0,
        minFilter: LinearFilter,
        callback: () => {},
        anisotropy: 0,
        rt: null,
        dispose: !0,
      },
      i,
    );
    let n = 0,
      r = i.isAdd ? "add" : "get",
      o = {},
      s = fboHelper.createRenderTarget(1, 1);
    (s.texture.minFilter = i.minFilter), (s.texture.generateMipmaps = !1);
    let l = () => {
      if ((n++, n == 2)) {
        switch (
          (s.setSize(o.rgb.image.width, o.rgb.image.height),
          fboHelper.copy(this.transparentTexture, s),
          this.mixChannels(o.rgb, s, 0, 1, 2, -1),
          s.texture.minFilter)
        ) {
          case NearestMipMapNearestFilter:
          case NearestMipMapLinearFilter:
          case LinearMipMapNearestFilter:
          case LinearMipMapLinearFilter:
            (s.texture.generateMipmaps = !0),
              (s.texture.anisotropy =
                i.anisotropy ||
                properties.renderer.capabilities.getMaxAnisotropy());
            break;
          default:
            s.texture.generateMipmaps = !1;
        }
        this.mixChannels(o.alpha, s, -1, -1, -1, 0),
          i.dispose && (o.rgb.dispose(), o.alpha.dispose()),
          i.isAdd ? setTimeout(i.callback, 4) : i.callback();
      }
    };
    return (
      properties.loader[r](e, {
        type: "texture",
        minFilter: LinearFilter,
        onLoad: (u) => {
          (o.rgb = u), l();
        },
      }),
      properties.loader[r](t, {
        type: "texture",
        minFilter: LinearFilter,
        onLoad: (u) => {
          (o.alpha = u), l();
        },
      }),
      s.texture
    );
  }
}
const textureHelper = new TextureHelper();
let _geometry,
  _positionTexture,
  _orientTexture,
  _pathPositionArray,
  _pathOrientArray,
  _pathFrameCount,
  _v = new Vector3(),
  _q = new Quaternion(),
  _e = new Euler(),
  animationTime = 0;
const BONE_COUNT = 21,
  ANIMATION_FRAME_COUNT = 158,
  ANIMATION_PIXEL_COUNT = ANIMATION_FRAME_COUNT * BONE_COUNT;
let _texture;
class Scene1Bird {
  container = new Object3D();
  preInit() {
    const e =
      settings.TEXTURE_PATH + "scene1/" + (browser.isMobile ? "mobile/" : "");
    (_texture = textureHelper.loadRGBATexture(
      e + "BIRD_TEXTURE_01.webp",
      e + "BIRD_ALPHA.webp",
    )),
      properties.loader.add(settings.MODEL_PATH + "scene1/BIRD.buf", {
        onLoad: (t) => {
          _geometry = t;
        },
      }),
      properties.loader.add(settings.MODEL_PATH + "scene1/BIRD_ANIMATION.buf", {
        onLoad: (t) => {
          let i = new Float32Array(ANIMATION_PIXEL_COUNT * 4),
            n = t.attributes.position.array;
          for (
            let r = 0, o = 0, s = 0;
            r < ANIMATION_PIXEL_COUNT;
            r++, o += 3, s += 4
          )
            (i[s + 0] = n[o + 0]), (i[s + 1] = n[o + 1]), (i[s + 2] = n[o + 2]);
          (_positionTexture = fboHelper.createDataTexture(
            i,
            BONE_COUNT,
            ANIMATION_FRAME_COUNT,
            !0,
            !0,
          )),
            (_orientTexture = fboHelper.createDataTexture(
              t.attributes.orient.array,
              BONE_COUNT,
              ANIMATION_FRAME_COUNT,
              !0,
              !0,
            ));
        },
      }),
      properties.loader.add(settings.MODEL_PATH + "scene1/BIRD_PATH.buf", {
        onLoad: (t) => {
          (_pathFrameCount = t.attributes.position.count),
            (_pathPositionArray = t.attributes.position.array),
            (_pathOrientArray = t.attributes.orient.array);
        },
      });
  }
  init() {
    (this.mesh = new Mesh(
      _geometry,
      new ShaderMaterial({
        uniforms: {
          u_positionTexture: { value: _positionTexture },
          u_orientTexture: { value: _orientTexture },
          u_boneCount: { value: BONE_COUNT },
          u_animationFrameCount: { value: ANIMATION_FRAME_COUNT },
          u_animationFrame: { value: 0 },
          u_ndcZ: { value: 0 },
          u_centerNdcZ: { value: 0 },
          u_texture: { value: _texture },
        },
        vertexShader: vert$1,
        fragmentShader: frag$1,
        transparent: !0,
        blending: CustomBlending,
        blendEquation: AddEquation,
        blendSrc: SrcAlphaFactor,
        blendDst: OneMinusSrcAlphaFactor,
        blendEquationAlpha: AddEquation,
        blendSrcAlpha: ZeroFactor,
        blendDstAlpha: OneFactor,
      }),
    )),
      (this.mesh.frustumCulled = !1),
      (this.mesh.renderOrder = 10),
      this.container.add(this.mesh),
      (this.container.visible = !1);
  }
  resize(e, t) {}
  update(e) {
    if (!properties.hasInitialized) return;
    let t = math.unClampedFit(scene1.activeRatio * 449, 19, 187, 0, 1);
    if (((this.container.visible = t >= 0 && t <= 1), this.container.visible)) {
      let i = t * (_pathFrameCount - 1),
        n = Math.floor(i),
        r = Math.ceil(i),
        o = i - n;
      this.mesh.position
        .copy(_v.fromArray(_pathPositionArray, n * 3))
        .lerp(_v.fromArray(_pathPositionArray, r * 3), o),
        this.mesh.quaternion
          .copy(_q.fromArray(_pathOrientArray, n * 4))
          .slerp(_q.fromArray(_pathOrientArray, r * 4), o),
        this.container.position.copy(properties.camera.position),
        this.container.quaternion.copy(properties.camera.quaternion);
      let s = 1;
      this.container.translateZ(s * -1),
        _e.set(properties.cameraLookX, properties.cameraLookY, 0),
        _q.setFromEuler(_e),
        this.container.quaternion.multiply(_q),
        this.mesh.quaternion.multiply(_q),
        this.container.translateZ(s),
        (animationTime = scrollManager.scrollView * 2 + 2),
        (this.mesh.material.uniforms.u_animationFrame.value =
          animationTime * 30);
      let l = properties.camera.near,
        u = properties.camera.far,
        h = math.fit(scene1.activeRatio, 0.15, 0.19, 0.6, 0.35);
      (h = math.fit(scene1.activeRatio, 0.245, 0.275, h, 1)),
        (h = math.fit(scene1.activeRatio, 0.32, 0.33, h, 0.8)),
        (h *= -cameraControls.bokehFocusDistance);
      let d = (h * (u + l) + 2 * u * l) / (h * (u - l));
      (this.mesh.material.uniforms.u_ndcZ.value = d),
        (h = -_v
          .copy(this.mesh.position)
          .sub(properties.camera.position)
          .applyQuaternion(properties.camera.quaternion).z),
        (d = (h * (u + l) + 2 * u * l) / (h * (u - l))),
        (this.mesh.material.uniforms.u_centerNdcZ.value = d);
    }
  }
}
const scene1Bird = new Scene1Bird(),
  vert = `#define GLSLIFY 1
uniform float u_endRatio;varying vec2 v_pos2;varying float v_shade;void main(){vec3 pos=position;pos.z*=u_endRatio;gl_Position=projectionMatrix*modelViewMatrix*vec4(pos,1.0);v_pos2=position.xy;vec3 viewNormal=normalize(normalMatrix*normal);float d=dot(normal,vec3(-0.5773,0.5773,0.5773));v_shade=normal.z>.5 ? 1. : d*0.3+0.7;}`,
  frag = `#define GLSLIFY 1
uniform float u_showRatio;uniform float u_endRatio2;uniform sampler2D u_screenPaintTexture;uniform vec2 u_resolution;varying vec2 v_pos2;varying float v_shade;void main(){vec2 screenUv=gl_FragCoord.xy/u_resolution;vec4 screenPaint=texture2D(u_screenPaintTexture,screenUv);float d=v_pos2.y+v_pos2.x;float alpha=smoothstep(d-2.,d,mix(-0.56-2.,0.55,u_showRatio));alpha*=max(u_endRatio2,1.-smoothstep(0.2,0.5,(screenPaint.z+screenPaint.w)*0.5));vec3 color=vec3(v_shade);gl_FragColor=vec4(color,alpha);}`,
  outlineVert = `#define GLSLIFY 1
attribute vec3 OP;attribute float curveu;attribute float perimeter;attribute float radius;attribute float id;uniform float u_thickness;uniform float u_showRatio;varying float v_curveu;varying float v_perimeter;varying float v_radius;varying vec2 v_pos2;varying float v_showRatio;vec4 hash42(vec2 p){vec4 p4=fract(vec4(p.xyxy)*vec4(.1031,.1030,.0973,.1099));p4+=dot(p4,p4.wzxy+33.33);return fract((p4.xxyz+p4.yzzw)*p4.zywx);}float linearStep(float edge0,float edge1,float x){return clamp((x-edge0)/(edge1-edge0),0.0,1.0);}void main(){vec3 pos=position;pos=mix(OP,pos,u_thickness);gl_Position=projectionMatrix*modelViewMatrix*vec4(pos,1.0);v_curveu=curveu;v_perimeter=perimeter;v_radius=radius;v_pos2=pos.xy;vec4 rands=hash42(vec2(id*10.,20.));v_showRatio=linearStep(0.,0.7,u_showRatio-rands.x*0.3);}`,
  outlineFrag = `#define GLSLIFY 1
uniform float u_time;uniform float u_showRatio;uniform float u_hideRatio;uniform float u_endRatio2;uniform sampler2D u_screenPaintTexture;uniform vec2 u_resolution;varying float v_curveu;varying float v_perimeter;varying float v_radius;varying vec2 v_pos2;varying float v_showRatio;float exponentialOut(float t){return t==1.0 ? t : 1.0-pow(2.0,-3.0*t);}void main(){vec2 screenUv=gl_FragCoord.xy/u_resolution;vec4 screenPaint=texture2D(u_screenPaintTexture,screenUv);float radiusAlpha=1.-v_radius;float easedShowRatio=exponentialOut(v_showRatio);float t=-fract(v_curveu-v_showRatio*0.2+0.15)+easedShowRatio;float alpha=max(v_showRatio,step(0.,t));alpha*=1.-u_hideRatio;t=u_time/v_perimeter*0.2-v_curveu;t=mod(t,1.);float mouseAlpha=smoothstep(0.,0.05,t)*smoothstep(0.8,0.5,t);alpha+=smoothstep(0.2,0.5,(screenPaint.z+screenPaint.w)*0.5)*mouseAlpha*u_hideRatio*(1.-u_endRatio2);alpha*=radiusAlpha;gl_FragColor=vec4(vec3(1.),alpha*u_showRatio*(1.-u_endRatio2));}`;
let camera,
  ASPECT = 4.10935537;
class Scene1Title {
  container = new Object3D();
  splinePositionRenderTarget;
  ratio = 0;
  trailTime = 0;
  activeRatio = 0;
  x = 0;
  y = 0;
  width = 0;
  height = 0;
  sharedUniforms = {};
  isVisible = !1;
  ANIMATION_THRESHOLD = 0.112;
  sharedUniforms = {
    u_expandRatio: { value: 0 },
    u_thickness: { value: 0 },
    u_endRatio: { value: 0 },
    u_endRatio2: { value: 0 },
  };
  preInit() {
    (camera = properties.camera ? properties.camera.clone() : new PerspectiveCamera()),
      properties.loader.add(settings.MODEL_PATH + "scene1/TITLE.buf", {
        onLoad: (e) => this._onGeometryLoad("TITLE", e),
      }),
      properties.loader.add(settings.MODEL_PATH + "scene1/TITLE_OUTLINE.buf", {
        onLoad: (e) => this._onGeometryLoad("TITLE_OUTLINE", e),
      });
  }
  _onGeometryLoad(e, t) {
    let i;
    switch (e) {
      case "TITLE":
        (i = new Mesh(
          t,
          new ShaderMaterial({
            uniforms: Object.assign(
              {
                u_time: properties.sharedUniforms.u_time,
                u_showRatio: { value: 0 },
                u_screenPaintTexture:
                  screenPaint.sharedUniforms.u_currPaintTexture,
                u_resolution: properties.sharedUniforms.u_resolution,
              },
              this.sharedUniforms,
            ),
            vertexShader: vert,
            fragmentShader: frag,
            transparent: !0,
            blending: CustomBlending,
            blendEquation: AddEquation,
            blendSrc: SrcAlphaFactor,
            blendDst: OneMinusSrcAlphaFactor,
            blendEquationAlpha: AddEquation,
            blendSrcAlpha: ZeroFactor,
            blendDstAlpha: OneFactor,
          }),
        )),
          (this.mesh = i);
        break;
      case "TITLE_OUTLINE":
        (i = new Mesh(
          t,
          new ShaderMaterial({
            uniforms: Object.assign(
              {
                u_time: properties.sharedUniforms.u_time,
                u_showRatio: { value: 0 },
                u_hideRatio: { value: 0 },
                u_screenPaintTexture:
                  screenPaint.sharedUniforms.u_currPaintTexture,
                u_resolution: properties.sharedUniforms.u_resolution,
              },
              this.sharedUniforms,
            ),
            extensions: { derivatives: !0 },
            vertexShader: outlineVert,
            fragmentShader: outlineFrag,
            depthTest: !1,
            depthWrite: !1,
            transparent: !0,
          }),
        )),
          (this.outlineMesh = i),
          (i.renderOrder = 10);
        break;
    }
    (i.frustumCulled = !1), this.container.add(i);
  }
  resize(e, t) {}
  init() {}
  update(e) {
    if (!properties.hasInitialized) return;
    let t = cameraControls.scene1AnimationRatio,
      i = t < 0.233;
    if (((this.container.visible = i), i)) {
      let n = properties.camera,
        r = this.ANIMATION_THRESHOLD;
      (camera.near = n.near),
        (camera.far = n.far),
        (camera.aspect = n.aspect),
        cameraControls._applyCameraAnimation(
          camera,
          cameraControls.scene1,
          Math.min(r, t),
        ),
        camera.translateZ(cameraControls.cameraDistance * -1);
      let o =
          math.clamp(input.mouseXY.y, -1, 1) * properties.cameraLookStrength,
        s = math.clamp(-input.mouseXY.x, -1, 1) * properties.cameraLookStrength;
      (properties.cameraLookX +=
        (o - properties.cameraLookX) * properties.cameraLookEaseDamp),
        (properties.cameraLookY +=
          (s - properties.cameraLookY) * properties.cameraLookEaseDamp),
        cameraControls._e.set(
          properties.cameraLookX,
          properties.cameraLookY,
          0,
        ),
        cameraControls._q1.setFromEuler(cameraControls._e),
        camera.quaternion.multiply(cameraControls._q1),
        camera.translateZ(cameraControls.cameraDistance),
        camera.matrix.compose(camera.position, camera.quaternion, camera.scale),
        camera.matrix.multiply(cameraControls._brownianMotion.matrix),
        camera.matrix.decompose(
          camera.position,
          camera.quaternion,
          camera.scale,
        );
      let l =
          properties.viewportHeight /
          2 /
          Math.tan(((camera.fov / 180) * Math.PI) / 2),
        u = math.fit(t, r * 0.5, r, 850, 1e3),
        h = (((this.width * properties.viewportWidth * 2) / ASPECT) * u) / l;
      this.container.position.copy(camera.position),
        this.container.quaternion.copy(camera.quaternion),
        this.container.translateZ(-u),
        this.container.translateY((this.y * h) / 2),
        this.container.scale.setScalar(h),
        (this.sharedUniforms.u_thickness.value = math.fit(
          (this.width * properties.viewportWidth) / 2,
          650,
          320,
          1,
          1.75,
        )),
        (this.outlineMesh.material.uniforms.u_showRatio.value = math.fit(
          properties.startTime,
          0.75,
          2.75,
          0,
          1,
        )),
        (this.outlineMesh.material.uniforms.u_hideRatio.value = math.fit(
          properties.startTime,
          2.75,
          3.5,
          0,
          1,
        )),
        (this.mesh.material.uniforms.u_showRatio.value = math.fit(
          properties.startTime,
          2,
          3.5,
          0,
          1,
        )),
        (this.sharedUniforms.u_endRatio.value = math.fit(t, r, r + 0.1, 0, 1)),
        (this.sharedUniforms.u_endRatio2.value = math.fit(
          t,
          r,
          r + 0.025,
          0,
          1,
        ));
    }
  }
}
const scene1Title = new Scene1Title(),
  SKY_COLOR_0 = new Color("#ADD8E6"),
  SKY_COLOR_1 = new Color("#6495ED"),
  DIMMED_SKY_COLOR_0 = new Color("#536970"),
  DIMMED_SKY_COLOR_1 = new Color("#081733");
class Scene1 {
  container = new Object3D();
  sharedUniforms = {
    u_skyColor0: { value: new Color() },
    u_skyColor1: { value: new Color() },
    u_crackRatio: { value: 0 },
    u_fogNear: { value: 1800 },
    u_fogFar: { value: 2500 },
    u_dimRatio: { value: 1 },
    u_trailRatio: { value: 0 },
  };
  crackRatio = 0;
  trailRatio = 0;
  dimRatio = 0;
  trailActiveRatio = 0;
  mesh = null;
  activeRatio = 0;
  preInit() {
    const e =
      settings.TEXTURE_PATH + "scene1/" + (browser.isMobile ? "mobile/" : "");
    (this.textureRidge = properties.loader.add(e + "SC_01_RIDGE_TEXTURE.webp", {
      type: "texture",
    }).content),
      (this.textureBackgroundMountains = properties.loader.add(
        e + "SC_01_BACKGROUND_MOUNTAINS_TEXTURE.webp",
        { type: "texture" },
      ).content),
      properties.loader.add(
        settings.MODEL_PATH + "scene1/SC_01_BACKGROUND_MOUNTAINS.buf",
        { onLoad: (t) => this._onModelLoad(t, "SC_01_BACKGROUND_MOUNTAINS") },
      ),
      properties.loader.add(
        settings.MODEL_PATH + "scene1/SC_01_MOUNTAIN_RIDGE.buf",
        { onLoad: (t) => this._onModelLoad(t, "SC_01_MOUNTAIN_RIDGE") },
      ),
      clouds$1.preInit(),
      particles$1.preInit(),
      scene1Trails.preInit(),
      scene1Bird.preInit(),
      scene1Title.preInit();
  }
  init() {
    (this.skyDome = new Mesh(
      new SphereGeometry(2e3, 8, 8),
      new ShaderMaterial({
        vertexShader: skyVert,
        fragmentShader: skyFrag,
        uniforms: Object.assign({}, this.sharedUniforms),
        depthWrite: !1,
        depthTest: !1,
        side: 1,
      }),
    )),
      (this.skyDome.renderOrder = -1),
      (this.skyDome.frustumCulled = !1),
      this.container.add(this.skyDome),
      clouds$1.init(),
      this.container.add(clouds$1.container),
      particles$1.init(),
      this.container.add(particles$1.container),
      scene1Trails.init(),
      this.container.add(scene1Trails.container),
      scene1Bird.init(),
      this.container.add(scene1Bird.container),
      scene1Title.init(),
      this.container.add(scene1Title.container),
      properties.initCallFuncList.push(this.skyDome),
      properties.initCallFuncList.push(clouds$1.container),
      properties.initCallFuncList.push(particles$1.container),
      properties.initCallFuncList.push(scene1Trails.container),
      properties.initCallFuncList.push(scene1Bird.container),
      properties.initCallFuncList.push(scene1Title.container);
  }
  _onModelLoad(e, t) {
    e.computeVertexNormals();
    let i = null,
      n = 0;
    switch (t) {
      case "SC_01_BACKGROUND_MOUNTAINS":
        (n = 0),
          (i = new ShaderMaterial({
            vertexShader: vert$3,
            fragmentShader: frag$3,
            uniforms: Object.assign(
              {
                u_texture: { value: this.textureBackgroundMountains },
                u_time: properties.sharedUniforms.u_time,
              },
              this.sharedUniforms,
            ),
            defines: { HAS_ALPHA: 1, IS_SCENE_1: 1 },
          }));
        break;
      case "SC_01_MOUNTAIN_RIDGE":
        (n = 2),
          (i = new ShaderMaterial({
            vertexShader: vert$3,
            fragmentShader: frag$3,
            uniforms: Object.assign(
              { u_texture: { value: this.textureRidge } },
              this.sharedUniforms,
            ),
            defines: { IS_SCENE_1: 1 },
          }));
        break;
      case "CRACKS":
        (n = 3),
          (i = new ShaderMaterial({
            vertexShader: vert$3,
            fragmentShader: frag$3,
            uniforms: Object.assign(
              { u_texture: { value: this.textureRidge } },
              this.sharedUniforms,
            ),
            defines: { IS_CRACKS: 1, IS_SCENE_1: 1 },
          }));
        break;
    }
    const r = new Mesh(e, i);
    (r.renderOrder = n), this.container.add(r);
  }
  resize(e, t) {
    clouds$1.resize(e, t),
      particles$1.resize(e, t),
      scene1Trails.resize(e, t),
      scene1Bird.resize(e, t),
      scene1Title.resize(e, t);
  }
  preUpdate(e) {}
  update(e) {
    const t = this.activeRatio < 1;
    (this.container.visible = t),
      this.sharedUniforms.u_skyColor0.value
        .copy(SKY_COLOR_0)
        .lerp(DIMMED_SKY_COLOR_0, this.dimRatio),
      this.sharedUniforms.u_skyColor1.value
        .copy(SKY_COLOR_1)
        .lerp(DIMMED_SKY_COLOR_1, this.dimRatio),
      (this.sharedUniforms.u_crackRatio.value = this.crackRatio),
      (this.sharedUniforms.u_trailRatio.value = this.trailRatio),
      (this.sharedUniforms.u_dimRatio.value = this.dimRatio),
      (clouds$1.isVisible = t),
      (clouds$1.opacity = math.fit(this.dimRatio, 0, 1, 0.25, 0.1)),
      clouds$1.update(e),
      (particles$1.isVisible = t),
      particles$1.update(e),
      (scene1Trails.isVisible =
        t && this.trailRatio > 0 && this.trailActiveRatio > 0),
      (scene1Trails.ratio = this.trailRatio),
      (scene1Trails.activeRatio = this.trailActiveRatio),
      scene1Trails.update(e),
      scene1Bird.update(e),
      scene1Title.update(e);
  }
}
const scene1 = new Scene1();
function makeLineGradient(a, e, t, i, n, r) {
  const o = a.createLinearGradient(e, t, i, n);
  return (
    o.addColorStop(0, "rgba(255,255,255,0)"),
    o.addColorStop(0.2, `rgba(255,255,255,${r})`),
    o.addColorStop(0.8, `rgba(255,255,255,${r})`),
    o.addColorStop(1, "rgba(255,255,255,0)"),
    o
  );
}
function drawLine(a, e, t, i, n) {
  (a.strokeStyle = i),
    (a.lineWidth = n),
    a.beginPath(),
    a.moveTo(e[0], e[1]),
    a.lineTo(t[0], t[1]),
    a.closePath(),
    a.stroke();
}
function makeStaggerRatios(a) {
  const t = 1 / (1 + 3 * (1 - a)),
    i = t * (1 - a);
  return Array.from({ length: 4 }, (n, r) => {
    const o = r * i,
      s = o + t;
    return [o, s];
  });
}
const STAGGER_RATIOS = makeStaggerRatios(0.2);
function drawSquareLine(a, e = 1, t = 0, i = 1) {
  let n = 0.05 * e;
  const r = 1,
    o = math.fit(t, STAGGER_RATIOS[0][0], STAGGER_RATIOS[0][1], -1, 1),
    s = math.fit(t, STAGGER_RATIOS[1][0], STAGGER_RATIOS[1][1], -1, 1),
    l = math.fit(t, STAGGER_RATIOS[2][0], STAGGER_RATIOS[2][1], -1, 1),
    u = math.fit(t, STAGGER_RATIOS[3][0], STAGGER_RATIOS[3][1], -1, 1),
    h = { start: [-e / 2 + n, -e / 2], end: [-e / 2 + n, (o * e) / 2] },
    d = { start: [e / 2 - n, e / 2], end: [e / 2 - n, (-s * e) / 2] },
    c = { start: [-e / 2, e / 2 - n], end: [(l * e) / 2, e / 2 - n] },
    m = { start: [e / 2, -e / 2 + n], end: [(-u * e) / 2, -e / 2 + n] };
  let _ = makeLineGradient(a, 0, h.start[1], 0, h.end[1], i);
  drawLine(a, h.start, h.end, _, r),
    (_ = makeLineGradient(a, 0, d.start[1], 0, d.end[1], i)),
    drawLine(a, d.start, d.end, _, r),
    (_ = makeLineGradient(a, c.start[0], 0, c.end[0], 0, i)),
    drawLine(a, c.start, c.end, _, r),
    (_ = makeLineGradient(a, m.start[0], 0, m.end[0], 0, i)),
    drawLine(a, m.start, m.end, _, r);
}
(function () {
  function a() {
    for (var i = arguments.length, n = 0; n < i; n++) {
      var r = n < 0 || arguments.length <= n ? void 0 : arguments[n];
      r.nodeType === 1 || r.nodeType === 11
        ? this.appendChild(r)
        : this.appendChild(document.createTextNode(String(r)));
    }
  }
  function e() {
    for (; this.lastChild; ) this.removeChild(this.lastChild);
    arguments.length && this.append.apply(this, arguments);
  }
  function t() {
    for (
      var i = this.parentNode, n = arguments.length, r = new Array(n), o = 0;
      o < n;
      o++
    )
      r[o] = arguments[o];
    var s = r.length;
    if (i)
      for (s || i.removeChild(this); s--; ) {
        var l = r[s];
        typeof l != "object"
          ? (l = this.ownerDocument.createTextNode(l))
          : l.parentNode && l.parentNode.removeChild(l),
          s ? i.insertBefore(this.previousSibling, l) : i.replaceChild(l, this);
      }
  }
  typeof Element < "u" &&
    (Element.prototype.append ||
      ((Element.prototype.append = a), (DocumentFragment.prototype.append = a)),
    Element.prototype.replaceChildren ||
      ((Element.prototype.replaceChildren = e),
      (DocumentFragment.prototype.replaceChildren = e)),
    Element.prototype.replaceWith ||
      ((Element.prototype.replaceWith = t),
      (DocumentFragment.prototype.replaceWith = t)));
})();
function _classCallCheck(a, e) {
  if (!(a instanceof e))
    throw new TypeError("Cannot call a class as a function");
}
function _defineProperties(a, e) {
  for (var t = 0; t < e.length; t++) {
    var i = e[t];
    (i.enumerable = i.enumerable || !1),
      (i.configurable = !0),
      "value" in i && (i.writable = !0),
      Object.defineProperty(a, i.key, i);
  }
}
function _createClass(a, e, t) {
  return (
    e && _defineProperties(a.prototype, e), t && _defineProperties(a, t), a
  );
}
function _defineProperty(a, e, t) {
  return (
    e in a
      ? Object.defineProperty(a, e, {
          value: t,
          enumerable: !0,
          configurable: !0,
          writable: !0,
        })
      : (a[e] = t),
    a
  );
}
function ownKeys(a, e) {
  var t = Object.keys(a);
  if (Object.getOwnPropertySymbols) {
    var i = Object.getOwnPropertySymbols(a);
    e &&
      (i = i.filter(function (n) {
        return Object.getOwnPropertyDescriptor(a, n).enumerable;
      })),
      t.push.apply(t, i);
  }
  return t;
}
function _objectSpread2(a) {
  for (var e = 1; e < arguments.length; e++) {
    var t = arguments[e] != null ? arguments[e] : {};
    e % 2
      ? ownKeys(Object(t), !0).forEach(function (i) {
          _defineProperty(a, i, t[i]);
        })
      : Object.getOwnPropertyDescriptors
      ? Object.defineProperties(a, Object.getOwnPropertyDescriptors(t))
      : ownKeys(Object(t)).forEach(function (i) {
          Object.defineProperty(a, i, Object.getOwnPropertyDescriptor(t, i));
        });
  }
  return a;
}
function _slicedToArray(a, e) {
  return (
    _arrayWithHoles(a) ||
    _iterableToArrayLimit(a, e) ||
    _unsupportedIterableToArray(a, e) ||
    _nonIterableRest()
  );
}
function _toConsumableArray(a) {
  return (
    _arrayWithoutHoles(a) ||
    _iterableToArray(a) ||
    _unsupportedIterableToArray(a) ||
    _nonIterableSpread()
  );
}
function _arrayWithoutHoles(a) {
  if (Array.isArray(a)) return _arrayLikeToArray(a);
}
function _arrayWithHoles(a) {
  if (Array.isArray(a)) return a;
}
function _iterableToArray(a) {
  if (typeof Symbol < "u" && Symbol.iterator in Object(a)) return Array.from(a);
}
function _iterableToArrayLimit(a, e) {
  if (!(typeof Symbol > "u" || !(Symbol.iterator in Object(a)))) {
    var t = [],
      i = !0,
      n = !1,
      r = void 0;
    try {
      for (
        var o = a[Symbol.iterator](), s;
        !(i = (s = o.next()).done) && (t.push(s.value), !(e && t.length === e));
        i = !0
      );
    } catch (l) {
      (n = !0), (r = l);
    } finally {
      try {
        !i && o.return != null && o.return();
      } finally {
        if (n) throw r;
      }
    }
    return t;
  }
}
function _unsupportedIterableToArray(a, e) {
  if (a) {
    if (typeof a == "string") return _arrayLikeToArray(a, e);
    var t = Object.prototype.toString.call(a).slice(8, -1);
    if (
      (t === "Object" && a.constructor && (t = a.constructor.name),
      t === "Map" || t === "Set")
    )
      return Array.from(a);
    if (t === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t))
      return _arrayLikeToArray(a, e);
  }
}
function _arrayLikeToArray(a, e) {
  (e == null || e > a.length) && (e = a.length);
  for (var t = 0, i = new Array(e); t < e; t++) i[t] = a[t];
  return i;
}
function _nonIterableSpread() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function _nonIterableRest() {
  throw new TypeError(`Invalid attempt to destructure non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function extend(a, e) {
  return Object.getOwnPropertyNames(Object(a)).reduce(function (t, i) {
    var n = Object.getOwnPropertyDescriptor(Object(a), i),
      r = Object.getOwnPropertyDescriptor(Object(e), i);
    return Object.defineProperty(t, i, r || n);
  }, {});
}
function isString(a) {
  return typeof a == "string";
}
function isArray(a) {
  return Array.isArray(a);
}
function parseSettings() {
  var a = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {},
    e = extend(a),
    t;
  return (
    e.types !== void 0 ? (t = e.types) : e.split !== void 0 && (t = e.split),
    t !== void 0 &&
      (e.types = (isString(t) || isArray(t) ? String(t) : "")
        .split(",")
        .map(function (i) {
          return String(i).trim();
        })
        .filter(function (i) {
          return /((line)|(word)|(char))/i.test(i);
        })),
    (e.absolute || e.position) &&
      (e.absolute = e.absolute || /absolute/.test(a.position)),
    e
  );
}
function parseTypes(a) {
  var e = isString(a) || isArray(a) ? String(a) : "";
  return {
    none: !e,
    lines: /line/i.test(e),
    words: /word/i.test(e),
    chars: /char/i.test(e),
  };
}
function isObject(a) {
  return a !== null && typeof a == "object";
}
function isNode(a) {
  return isObject(a) && /^(1|3|11)$/.test(a.nodeType);
}
function isLength(a) {
  return typeof a == "number" && a > -1 && a % 1 === 0;
}
function isArrayLike(a) {
  return isObject(a) && isLength(a.length);
}
function toArray(a) {
  return isArray(a)
    ? a
    : a == null
    ? []
    : isArrayLike(a)
    ? Array.prototype.slice.call(a)
    : [a];
}
function getTargetElements(a) {
  var e = a;
  return (
    isString(a) &&
      (/^(#[a-z]\w+)$/.test(a.trim())
        ? (e = document.getElementById(a.trim().slice(1)))
        : (e = document.querySelectorAll(a))),
    toArray(e).reduce(function (t, i) {
      return [].concat(
        _toConsumableArray(t),
        _toConsumableArray(toArray(i).filter(isNode)),
      );
    }, [])
  );
}
var entries = Object.entries,
  expando = "_splittype",
  cache = {},
  uid = 0;
function set(a, e, t) {
  if (!isObject(a))
    return console.warn("[data.set] owner is not an object"), null;
  var i = a[expando] || (a[expando] = ++uid),
    n = cache[i] || (cache[i] = {});
  return (
    t === void 0
      ? e &&
        Object.getPrototypeOf(e) === Object.prototype &&
        (cache[i] = _objectSpread2(_objectSpread2({}, n), e))
      : e !== void 0 && (n[e] = t),
    t
  );
}
function get(a, e) {
  var t = isObject(a) ? a[expando] : null,
    i = (t && cache[t]) || {};
  return i;
}
function remove(a) {
  var e = a && a[expando];
  e && (delete a[e], delete cache[e]);
}
function clear() {
  Object.keys(cache).forEach(function (a) {
    delete cache[a];
  });
}
function cleanup() {
  entries(cache).forEach(function (a) {
    var e = _slicedToArray(a, 2),
      t = e[0],
      i = e[1],
      n = i.isRoot,
      r = i.isSplit;
    (!n || !r) && ((cache[t] = null), delete cache[t]);
  });
}
function toWords(a) {
  var e = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : " ",
    t = a ? String(a) : "";
  return t.trim().replace(/\s+/g, " ").split(e);
}
var rsAstralRange = "\\ud800-\\udfff",
  rsComboMarksRange = "\\u0300-\\u036f\\ufe20-\\ufe23",
  rsComboSymbolsRange = "\\u20d0-\\u20f0",
  rsVarRange = "\\ufe0e\\ufe0f",
  rsAstral = "[".concat(rsAstralRange, "]"),
  rsCombo = "[".concat(rsComboMarksRange).concat(rsComboSymbolsRange, "]"),
  rsFitz = "\\ud83c[\\udffb-\\udfff]",
  rsModifier = "(?:".concat(rsCombo, "|").concat(rsFitz, ")"),
  rsNonAstral = "[^".concat(rsAstralRange, "]"),
  rsRegional = "(?:\\ud83c[\\udde6-\\uddff]){2}",
  rsSurrPair = "[\\ud800-\\udbff][\\udc00-\\udfff]",
  rsZWJ = "\\u200d",
  reOptMod = "".concat(rsModifier, "?"),
  rsOptVar = "[".concat(rsVarRange, "]?"),
  rsOptJoin =
    "(?:" +
    rsZWJ +
    "(?:" +
    [rsNonAstral, rsRegional, rsSurrPair].join("|") +
    ")" +
    rsOptVar +
    reOptMod +
    ")*",
  rsSeq = rsOptVar + reOptMod + rsOptJoin,
  rsSymbol = "(?:".concat(
    [
      "".concat(rsNonAstral).concat(rsCombo, "?"),
      rsCombo,
      rsRegional,
      rsSurrPair,
      rsAstral,
    ].join("|"),
    `
)`,
  ),
  reUnicode = RegExp(
    ""
      .concat(rsFitz, "(?=")
      .concat(rsFitz, ")|")
      .concat(rsSymbol)
      .concat(rsSeq),
    "g",
  ),
  unicodeRange = [
    rsZWJ,
    rsAstralRange,
    rsComboMarksRange,
    rsComboSymbolsRange,
    rsVarRange,
  ],
  reHasUnicode = RegExp("[".concat(unicodeRange.join(""), "]"));
function asciiToArray(a) {
  return a.split("");
}
function hasUnicode(a) {
  return reHasUnicode.test(a);
}
function unicodeToArray(a) {
  return a.match(reUnicode) || [];
}
function stringToArray(a) {
  return hasUnicode(a) ? unicodeToArray(a) : asciiToArray(a);
}
function toString(a) {
  return a == null ? "" : String(a);
}
function toChars(a) {
  var e = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "";
  return (
    (a = toString(a)),
    a && isString(a) && !e && hasUnicode(a) ? stringToArray(a) : a.split(e)
  );
}
function createElement(a, e) {
  var t = document.createElement(a);
  return (
    e &&
      Object.keys(e).forEach(function (i) {
        var n = e[i],
          r = isString(n) ? n.trim() : n;
        r === null ||
          r === "" ||
          (i === "children"
            ? t.append.apply(t, _toConsumableArray(toArray(r)))
            : t.setAttribute(i, r));
      }),
    t
  );
}
var defaults = {
  splitClass: "",
  lineClass: "line",
  wordClass: "word",
  charClass: "char",
  types: ["lines", "words", "chars"],
  absolute: !1,
  tagName: "div",
};
function splitWordsAndChars(a, e) {
  e = extend(defaults, e);
  var t = parseTypes(e.types),
    i = e.tagName,
    n = a.nodeValue,
    r = document.createDocumentFragment(),
    o = [],
    s = [];
  return (
    /^\s/.test(n) && r.append(" "),
    (o = toWords(n).reduce(function (l, u, h, d) {
      var c, m;
      return (
        t.chars &&
          (m = toChars(u).map(function (_) {
            var f = createElement(i, {
              class: "".concat(e.splitClass, " ").concat(e.charClass),
              style: "display: inline-block;",
              children: _,
            });
            return (
              set(f, "isChar", !0),
              (s = [].concat(_toConsumableArray(s), [f])),
              f
            );
          })),
        t.words || t.lines
          ? ((c = createElement(i, {
              class: "".concat(e.wordClass, " ").concat(e.splitClass),
              style: "display: inline-block; ".concat(
                t.words && e.absolute ? "position: relative;" : "",
              ),
              children: t.chars ? m : u,
            })),
            set(c, { isWord: !0, isWordStart: !0, isWordEnd: !0 }),
            r.appendChild(c))
          : m.forEach(function (_) {
              r.appendChild(_);
            }),
        h < d.length - 1 && r.append(" "),
        t.words ? l.concat(c) : l
      );
    }, [])),
    /\s$/.test(n) && r.append(" "),
    a.replaceWith(r),
    { words: o, chars: s }
  );
}
function split(a, e) {
  var t = a.nodeType,
    i = { words: [], chars: [] };
  if (!/(1|3|11)/.test(t)) return i;
  if (t === 3 && /\S/.test(a.nodeValue)) return splitWordsAndChars(a, e);
  var n = toArray(a.childNodes);
  if (n.length && (set(a, "isSplit", !0), !get(a).isRoot)) {
    (a.style.display = "inline-block"), (a.style.position = "relative");
    var r = a.nextSibling,
      o = a.previousSibling,
      s = a.textContent || "",
      l = r ? r.textContent : " ",
      u = o ? o.textContent : " ";
    set(a, {
      isWordEnd: /\s$/.test(s) || /^\s/.test(l),
      isWordStart: /^\s/.test(s) || /\s$/.test(u),
    });
  }
  return n.reduce(function (h, d) {
    var c = split(d, e),
      m = c.words,
      _ = c.chars;
    return {
      words: [].concat(_toConsumableArray(h.words), _toConsumableArray(m)),
      chars: [].concat(_toConsumableArray(h.chars), _toConsumableArray(_)),
    };
  }, i);
}
function getPosition(a, e, t, i) {
  if (!t.absolute) return { top: e ? a.offsetTop : null };
  var n = a.offsetParent,
    r = _slicedToArray(i, 2),
    o = r[0],
    s = r[1],
    l = 0,
    u = 0;
  if (n && n !== document.body) {
    var h = n.getBoundingClientRect();
    (l = h.x + o), (u = h.y + s);
  }
  var d = a.getBoundingClientRect(),
    c = d.width,
    m = d.height,
    _ = d.x,
    f = d.y,
    p = f + s - u,
    g = _ + o - l;
  return { width: c, height: m, top: p, left: g };
}
function unSplitWords(a) {
  get(a).isWord
    ? (remove(a), a.replaceWith.apply(a, _toConsumableArray(a.childNodes)))
    : toArray(a.children).forEach(function (e) {
        return unSplitWords(e);
      });
}
var createFragment = function a() {
  return document.createDocumentFragment();
};
function repositionAfterSplit(a, e, t) {
  var i = parseTypes(e.types),
    n = e.tagName,
    r = a.getElementsByTagName("*"),
    o = [],
    s = [],
    l = null,
    u,
    h,
    d,
    c = [],
    m = a.parentElement,
    _ = a.nextElementSibling,
    f = createFragment(),
    p = window.getComputedStyle(a),
    g = p.textAlign,
    w = parseFloat(p.fontSize),
    x = w * 0.2;
  return (
    e.absolute &&
      ((d = { left: a.offsetLeft, top: a.offsetTop, width: a.offsetWidth }),
      (h = a.offsetWidth),
      (u = a.offsetHeight),
      set(a, { cssWidth: a.style.width, cssHeight: a.style.height })),
    toArray(r).forEach(function (y) {
      var b = y.parentElement === a,
        C = getPosition(y, b, e, t),
        L = C.width,
        v = C.height,
        A = C.top,
        P = C.left;
      /^br$/i.test(y.nodeName) ||
        (i.lines &&
          b &&
          ((l === null || A - l >= x) && ((l = A), o.push((s = []))),
          s.push(y)),
        e.absolute && set(y, { top: A, left: P, width: L, height: v }));
    }),
    m && m.removeChild(a),
    i.lines &&
      ((c = o.map(function (y) {
        var b = createElement(n, {
          class: "".concat(e.splitClass, " ").concat(e.lineClass),
          style: "display: block; text-align: ".concat(g, "; width: 100%;"),
        });
        set(b, "isLine", !0);
        var C = { height: 0, top: 1e4 };
        return (
          f.appendChild(b),
          y.forEach(function (L, v, A) {
            var P = get(L),
              V = P.isWordEnd,
              K = P.top,
              D = P.height,
              I = A[v + 1];
            (C.height = Math.max(C.height, D)),
              (C.top = Math.min(C.top, K)),
              b.appendChild(L),
              V && get(I).isWordStart && b.append(" ");
          }),
          e.absolute && set(b, { height: C.height, top: C.top }),
          b
        );
      })),
      i.words || unSplitWords(f),
      a.replaceChildren(f)),
    e.absolute &&
      ((a.style.width = "".concat(a.style.width || h, "px")),
      (a.style.height = "".concat(u, "px")),
      toArray(r).forEach(function (y) {
        var b = get(y),
          C = b.isLine,
          L = b.top,
          v = b.left,
          A = b.width,
          P = b.height,
          V = get(y.parentElement),
          K = !C && V.isLine;
        (y.style.top = "".concat(K ? L - V.top : L, "px")),
          (y.style.left = C
            ? "".concat(d.left, "px")
            : "".concat(v - (K ? d.left : 0), "px")),
          (y.style.height = "".concat(P, "px")),
          (y.style.width = C ? "".concat(d.width, "px") : "".concat(A, "px")),
          (y.style.position = "absolute");
      })),
    m && (_ ? m.insertBefore(a, _) : m.appendChild(a)),
    c
  );
}
var _defaults = extend(defaults, {}),
  SplitType = (function () {
    _createClass(a, null, [
      {
        key: "clearData",
        value: function () {
          clear();
        },
      },
      {
        key: "setDefaults",
        value: function (t) {
          return (_defaults = extend(_defaults, parseSettings(t))), defaults;
        },
      },
      {
        key: "revert",
        value: function (t) {
          getTargetElements(t).forEach(function (i) {
            var n = get(i),
              r = n.isSplit,
              o = n.html,
              s = n.cssWidth,
              l = n.cssHeight;
            r &&
              ((i.innerHTML = o),
              (i.style.width = s || ""),
              (i.style.height = l || ""),
              remove(i));
          });
        },
      },
      {
        key: "create",
        value: function (t, i) {
          return new a(t, i);
        },
      },
      {
        key: "data",
        get: function () {
          return cache;
        },
      },
      {
        key: "defaults",
        get: function () {
          return _defaults;
        },
        set: function (t) {
          _defaults = extend(_defaults, parseSettings(t));
        },
      },
    ]);
    function a(e, t) {
      _classCallCheck(this, a),
        (this.isSplit = !1),
        (this.settings = extend(_defaults, parseSettings(t))),
        (this.elements = getTargetElements(e)),
        this.split();
    }
    return (
      _createClass(a, [
        {
          key: "split",
          value: function (t) {
            var i = this;
            this.revert(),
              this.elements.forEach(function (o) {
                set(o, "html", o.innerHTML);
              }),
              (this.lines = []),
              (this.words = []),
              (this.chars = []);
            var n = [window.pageXOffset, window.pageYOffset];
            t !== void 0 &&
              (this.settings = extend(this.settings, parseSettings(t)));
            var r = parseTypes(this.settings.types);
            r.none ||
              (this.elements.forEach(function (o) {
                set(o, "isRoot", !0);
                var s = split(o, i.settings),
                  l = s.words,
                  u = s.chars;
                (i.words = [].concat(
                  _toConsumableArray(i.words),
                  _toConsumableArray(l),
                )),
                  (i.chars = [].concat(
                    _toConsumableArray(i.chars),
                    _toConsumableArray(u),
                  ));
              }),
              this.elements.forEach(function (o) {
                if (r.lines || i.settings.absolute) {
                  var s = repositionAfterSplit(o, i.settings, n);
                  i.lines = [].concat(
                    _toConsumableArray(i.lines),
                    _toConsumableArray(s),
                  );
                }
              }),
              (this.isSplit = !0),
              window.scrollTo(n[0], n[1]),
              cleanup());
          },
        },
        {
          key: "revert",
          value: function () {
            this.isSplit &&
              ((this.lines = null),
              (this.words = null),
              (this.chars = null),
              (this.isSplit = !1)),
              a.revert(this.elements);
          },
        },
      ]),
      a
    );
  })();
class TextBlurAnimation {
  prevRatio = 0;
  constructor(e) {
    (this.domElement = e), this.update(0, !0);
  }
  update(e, t = !1) {
    if (this.prevRatio === e && !t) return;
    this.prevRatio = e;
    const i = this.domElement;
    if (!i || !i.style) return;
    if (e === 1) {
      (i.style.opacity = 1), (i.style.filter = "none");
      return;
    }
    (i.style.opacity = e), (i.style.filter = `blur(${(1 - e) * 0.25}em)`);
  }
}
let _needsUpdate = !1;
class HomeEverblade extends Section {
  static id = "home-everblade";
  preInit(e) {
    super.preInit(HomeEverblade.id, e),
      (this.domTitle = this.domContainer.querySelector(".title")),
      (this.domTitleLeft = this.domTitle.querySelector(
        ".title span:nth-child(1)",
      )),
      (this.domTitleLeftChild = this.domTitleLeft.querySelector("span")),
      (this.domTitleRight = this.domTitle.querySelector(
        ".title span:nth-child(2)",
      )),
      (this.domTitleRightChild = this.domTitleRight.querySelector("span")),
      (this.domDescription = this.domContainer.querySelector(".description")),
      (this.domSubtitle = this.domContainer.querySelector(".subtitle")),
      (this.domLogoBg = this.domContainer.querySelector(
        "#home-everblade__logo",
      )),
      (this.domSubtitleSpans = Array.from(
        this.domSubtitle.querySelectorAll("span"),
      )),
      this.domSubtitleSpans.forEach((t) => {
        t._animation = new TextBlurAnimation(t);
      }),
      (this.canvas = document.getElementById("home-everblade__logo-canvas")),
      (this.canvasSize = new Vector2()),
      (this.canvasSizeDpr = new Vector2()),
      (this.ctx = this.canvas.getContext("2d")),
      (this.animationsRatio = 0),
      (this.canvasAnimationsRatio = 0);
  }
  init() {}
  resize(e, t) {
    // safely reset transform and opacity properties if elements exist in the dom tree
    if (this.domDescription?.style) {
      this.domDescription.style.removeProperty("opacity");
      this.domDescription.style.removeProperty("transform");
    }
    if (this.domTitle?.style) this.domTitle.style.removeProperty("transform");
    if (this.domSubtitle?.style) this.domSubtitle.style.removeProperty("transform");
    if (this.domTitleLeft?.style) this.domTitleLeft.style.removeProperty("transform");
    if (this.domTitleRight?.style) this.domTitleRight.style.removeProperty("transform");
    if (this.domTitleLeftChild?.style) this.domTitleLeftChild.style.removeProperty("transform");
    if (this.domTitleRightChild?.style) this.domTitleRightChild.style.removeProperty("transform");
    const i = this.domSubtitle ? this.domSubtitle.getBoundingClientRect() : { width: 0, height: 0 };
    if (this.domSubtitle) {
      (this.domSubtitle._width = i.width), (this.domSubtitle._height = i.height);
    }
    const n = this.canvas ? this.canvas.getBoundingClientRect() : { width: 0, height: 0 };
    this.canvasSize.set(n.width, n.height),
      this.canvasSizeDpr.copy(this.canvasSize).multiplyScalar(settings.DPR);
    if (this.canvas) {
      (this.canvas.width = this.canvasSizeDpr.x),
      (this.canvas.height = this.canvasSizeDpr.y);
    }
    if (this.domDescription && typeof SplitType !== "undefined") {
      this.domDescription._splitted = new SplitType(this.domDescription, {
        types: "lines",
      });
      const r = properties.isMobileLayout ? 0.12 : 0.32,
        o = properties.isMobileLayout ? 0.21 : 0.4,
        linesCount = this.domDescription._splitted?.lines?.length || 1,
        l = (o - r) / linesCount,
        u = properties.isMobileLayout ? 0.75 : 0.82,
        h = properties.isMobileLayout ? 0.84 : 0.9,
        c = (h - u) / linesCount;
      this.domDescription._splitted?.lines?.forEach((m, _) => {
        (m._animation = new TextBlurAnimation(m)),
          (m._updateAnimation = (f) => {
            const p = math.fit(f, r + _ * l, o + _ * l, 0, 1),
              g = math.fit(f, u + _ * c, h + _ * c, 0, 1);
            m._animation && m._animation.update(p * (1 - g));
          });
      });
    }
    _needsUpdate = true;
  }
  update(e) {
    const t = scrollManager.getDomRange(this.domContainer),
      { screenY: i, showScreenOffset: n, viewSize: r } = t,
      o = math.fit(n, 0, r, 0, 1),
      s = math.fit(n, r - 0.5, r, 0, 1),
      l = o > 0 && o < 1;
    if (this.domContent?.style) {
      this.domContent.style.visibility = l ? "visible" : "hidden";
      this.domContent.style.transform = `translateY(${-i}px)`;
    }
    if (this.animationsRatio === o && !_needsUpdate)
      return;
    this.animationsRatio = o;
    const u = math.fit(o, 0.14, 0.23, 0, 1) * math.fit(o, 0.76, 0.85, 1, 0),
      h = math.fit(o, 0.3, 0.4, 0, 1) * math.fit(o, 0.66, 0.76, 1, 0),
      d = math.fit(o, 0.35, 0.4, 0, 1) * math.fit(o, 0.63, 0.67, 1, 0);
    this.domSubtitleSpans?.forEach((c) => c._animation?.update(d));
    this.domDescription?._splitted?.lines?.forEach((c) => {
      c._updateAnimation && c._updateAnimation(o);
    });
    if (properties.isMobileLayout) {
      const c = 0.45 * math.fit(h, 0, 1, 0, this.canvasSize.y);
      if (this.domDescription?.style) this.domDescription.style.transform = `translate(0%, ${c}px)`;
      if (this.domTitle?.style) this.domTitle.style.transform = `translate(0, -${c}px)`;
      if (this.domTitleLeftChild?.style) {
        this.domTitleLeftChild.style.transform = `translate(0, calc(0.15ex + ${(1 - u + s) * 180}%))`;
      }
      if (this.domTitleRightChild?.style) {
        this.domTitleRightChild.style.transform = `translate(0, calc(0.15ex + ${(1 - u + s) * 180}%))`;
      }
    } else {
      const subWidth = this.domSubtitle?._width || 0;
      if (this.domSubtitle?.style) {
        this.domSubtitle.style.transform = `translate(-50%, -50%) translateY(-1em) scale(${0.8 + 0.2 * h})`;
      }
      if (this.domTitleLeft?.style) {
        this.domTitleLeft.style.transform = `translate(calc(0.2ex - ${subWidth * 0.8 * h}px), 0ex)`;
      }
      if (this.domTitleRight?.style) {
        this.domTitleRight.style.transform = `translate(calc(-0.1ex + ${subWidth * 0.8 * h}px), 0ex)`;
      }
      if (this.domTitleLeftChild?.style) {
        this.domTitleLeftChild.style.transform = `translate(calc(${(1 - u + s) * 110}%), 0.15ex)`;
      }
      if (this.domTitleRightChild?.style) {
        this.domTitleRightChild.style.transform = `translate(calc(${-(1 - u + s) * 110}%), 0.15ex)`;
      }
    }
    this.drawCanvasLogo(o, _needsUpdate),
      (scene1.crackRatio = math.fit(n, 0.5, 2.4, 0, 1)),
      (scene1.trailRatio = math.fit(n, 0.45, 4.5, 0, 1)),
      (scene1.dimRatio =
        math.fit(n, 0.25, 0.75, 0, 1) * math.fit(n, 3.5, 4.5, 1, 0)),
      (scene1.trailActiveRatio =
        scene1.trailRatio > 0 ? math.fit(n, 3.5, 4.5, 1, 0, ease.quadIn) : 0),
      (_needsUpdate = !1);
  }
  drawCanvasLogo(e, t = !1) {
    if (this.canvasAnimationsRatio === e && !t) return;
    this.canvasAnimationsRatio = e;
    const i = this.ctx,
      r = this.canvasSize.x,
      o = r * 0.5,
      s = r * Math.SQRT2;
    i.save(),
      i.scale(settings.DPR, settings.DPR),
      i.clearRect(0, 0, this.canvasSize.x, this.canvasSize.y),
      i.translate(o, o);
    let l = math.fit(e, 0.25, 0.33, -o, o);
    l = math.fit(e, 0.65, 0.75, l, -o);
    let u = math.fit(e, 0.08, 0.16, l, o);
    if (((u = math.fit(e, 0.85, 0.9, u, -o)), properties.isMobileLayout)) {
      let m = makeLineGradient(i, l, 0, u, 0, 1);
      drawLine(i, [l, 0], [u, 0], m, 1);
    } else {
      let m = makeLineGradient(i, 0, l, 0, u, 1);
      drawLine(i, [0, l], [0, u], m, 1);
    }
    i.restore();
    const h = math.fit(e, 0.35, 0.45, 0, 1),
      c = 1 - math.fit(e, 0.65, 0.7, 0, 1);
    i.save(),
      i.scale(settings.DPR, settings.DPR),
      i.translate(o, o),
      i.save(),
      i.scale(c, c),
      i.rotate(-Math.PI * 0.25 * c),
      drawSquareLine(i, 0.5 * s, h, c),
      i.restore(),
      i.restore(),
      this.domLogoBg.style.setProperty(
        "--opacity",
        math.fit(e, 0.4, 0.45, 0, 1) * math.fit(e, 0.64, 0.66, 1, 0),
      );
  }
}
const homeEverbladeSection = new HomeEverblade();
let _domTitle;
class HomeHero extends Section {
  id = "home-hero";
  hasResized = !1;
  preInit(e) {
    super.preInit(this.id, e),
      (this.domSubtitleCTA = this.domContainer.querySelector(".subtitle")),
      (this.domSubtitleCTA._animation = new TextBlurAnimation(
        this.domSubtitleCTA,
      )),
      (this.domKicker = this.domContainer.querySelector(".kicker")),
      (this.domKicker._animation = new TextBlurAnimation(this.domKicker)),
      (_domTitle = this.domContainer.querySelector(".title"));
  }
  init() {}
  resize(e, t) {
    this.hasResized = !0;
  }
  update(e) {
    const t = scrollManager.getDomRange(this.domContainer),
      {
        screenY: i,
        showScreenOffset: n,
        viewSize: r,
        ratio: o,
        screenRatio: s,
        hideScreenOffset: l,
      } = t,
      u = math.fit(n, 1, r, 0, 1),
      d = 1 - math.fit(n, r - 0.5, r, 0, 1),
      c = u < 1;
    if (this.domContent?.style) {
      this.domContent.style.visibility = c ? "visible" : "hidden";
      this.domContent.style.transform = `translateY(${-i}px)`;
    }
    let m = math.fit(properties.startTime, 1.75, 2.75, 0, 1, ease.cubicOut);
    const _ = d * m;
    if (this.domKicker) {
      this.domKicker._animation?.update(_);
      if (this.domKicker.style) {
        this.domKicker.style.transform = `translate3d(-50%,${math.mix(
          -100,
          0,
          m,
        )}%,0)`;
      }
    }
    const f =
      math.fit(u, 0, 0.25, 1, 0) * math.fit(properties.startTime, 2, 2.5, 0, 1);
    this.domSubtitleCTA?._animation?.update(f);
    const p = scrollManager.getDomRange([
      this.domContainer,
      homeEverbladeSection.domContainer,
    ]);
    if (
      ((scene1.activeRatio = cameraControls.scene1AnimationRatio =
        math.fit(p.showScreenOffset, 1, p.viewSize, 0, 1)),
      (properties.cameraLookStrength = 0.01),
      this.hasResized)
    ) {
      this.hasResized = !1;
      if (typeof _domTitle !== "undefined" && _domTitle) {
        const g = _domTitle.getBoundingClientRect();
        (scene1Title.x =
          ((g.left + g.width / 2) / properties.viewportWidth) * 2 - 1),
          (scene1Title.y =
            1 - ((g.top + g.height / 2) / properties.viewportHeight) * 2),
          (scene1Title.width = (g.width / properties.viewportWidth) * 2),
          (scene1Title.height = (g.height / properties.viewportHeight) * 2);
      }
    }
  }
}
const homeHero = new HomeHero();
class Clouds {
  container = new Object3D();
  isVisible = !1;
  INSTANCES_COUNT = browser.isMobile ? 8 : 12;
  preInit() {
    const e =
      settings.TEXTURE_PATH + "clouds/" + (browser.isMobile ? "mobile/" : "");
    (this.texture0 = properties.loader.add(e + "1.webp", {
      type: "texture",
    }).content),
      (this.texture1 = properties.loader.add(e + "2.webp", {
        type: "texture",
      }).content),
      (this.texture2 = properties.loader.add(e + "3.webp", {
        type: "texture",
      }).content);
  }
  init() {
    const e = new PlaneGeometry(1, 1),
      t = new InstancedBufferGeometry();
    for (let o in e.attributes) t.setAttribute(o, e.attributes[o]);
    t.setIndex(e.index);
    const i = new Float32Array(this.INSTANCES_COUNT),
      n = new Float32Array(this.INSTANCES_COUNT * 3),
      r = new Float32Array(this.INSTANCES_COUNT * 3);
    for (let o = 0, s = 0; o < this.INSTANCES_COUNT; o++)
      (i[o] = o % 3),
        (n[s] = 800 * math.fit(o, 0, this.INSTANCES_COUNT - 1, -1, 1)),
        (n[s + 1] = 150 + 200 * Math.random()),
        (n[s + 2] = -100 - 200 * Math.random()),
        (r[s] = Math.random() * 2 - 1),
        (r[s + 1] = Math.random() * 2 - 1),
        (r[s + 2] = Math.random() * 2 - 1),
        (s += 3);
    t.setAttribute("a_instanceTextureId", new InstancedBufferAttribute(i, 1)),
      t.setAttribute("a_instancePos", new InstancedBufferAttribute(n, 3)),
      t.setAttribute("a_instanceRands", new InstancedBufferAttribute(r, 3)),
      (this.mesh = new Mesh(
        t,
        new ShaderMaterial({
          vertexShader: vert$5,
          fragmentShader: frag$5,
          uniforms: {
            u_texture0: { value: this.texture0 },
            u_texture1: { value: this.texture1 },
            u_texture2: { value: this.texture2 },
            u_time: properties.sharedUniforms.u_time,
            u_scale: { value: browser.isMobile ? 300 : 500 },
            u_color0: { value: new Color("#ccccff") },
            u_color1: { value: new Color("#e2bd79") },
            u_alpha: { value: 0.25 },
          },
          depthWrite: !1,
          depthTest: !1,
          blending: AdditiveBlending,
        }),
      )),
      (this.mesh.frustumCulled = !1),
      (this.mesh.renderOrder = 2),
      this.container.add(this.mesh);
  }
  resize(e, t) {}
  update(e) {
    this.container.visible = this.isVisible;
  }
}
const clouds = new Clouds();
class Particles {
  container = new Object3D();
  isVisible = !1;
  INSTANCES_COUNT = 256;
  preInit() {}
  init() {
    const e = new PlaneGeometry(1, 1),
      t = new InstancedBufferGeometry();
    for (let r in e.attributes) t.setAttribute(r, e.attributes[r]);
    t.setIndex(e.index);
    const i = new Float32Array(this.INSTANCES_COUNT * 3),
      n = new Float32Array(this.INSTANCES_COUNT * 3);
    for (let r = 0, o = 0; r < this.INSTANCES_COUNT; r++)
      (i[o] = -1e3 * (Math.random() * 2 - 1)),
        (i[o + 1] = 150 + 500 * (Math.random() * 2 - 1)),
        (i[o + 2] = -100 - 100 * Math.random()),
        (n[o] = Math.random() * 2 - 1),
        (n[o + 1] = Math.random() * 2 - 1),
        (n[o + 2] = Math.random() * 2 - 1),
        (o += 3);
    t.setAttribute("a_instancePos", new InstancedBufferAttribute(i, 3)),
      t.setAttribute("a_instanceRands", new InstancedBufferAttribute(n, 3)),
      (this.mesh = new Mesh(
        t,
        new ShaderMaterial({
          vertexShader: vert$4,
          fragmentShader: frag$4,
          uniforms: {
            u_time: properties.sharedUniforms.u_time,
            u_resolution: properties.sharedUniforms.u_resolution,
            u_scale: { value: 10 },
            u_color: { value: new Color("#55ff00") },
            u_alpha: { value: 0.05 },
          },
          depthWrite: !1,
          depthTest: !1,
          blending: AdditiveBlending,
        }),
      )),
      (this.mesh.frustumCulled = !1),
      (this.mesh.renderOrder = 4),
      this.container.add(this.mesh);
  }
  resize(e, t) {}
  update(e) {
    this.mesh && (this.container.visible = this.isVisible);
  }
}
const particles = new Particles();
class Scene3 {
  container = new Object3D();
  mesh = null;
  texture = null;
  textureAlpha = null;
  activeRatio = 0;
  meshes = [];
  material = null;
  joinRatio = 0;
  sharedUniforms = {
    u_skyColor0: { value: new Color("#ADD8E6") },
    u_skyColor1: { value: new Color("#6495ED") },
    u_fogNear: { value: 1900 },
    u_fogFar: { value: 2800 },
  };
  preInit() {
    const e =
      settings.TEXTURE_PATH + "scene3/" + (browser.isMobile ? "mobile/" : "");
    (this.texture = properties.loader.add(e + "SC_03_LAKE_TEXTURE.webp", {
      type: "texture",
    }).content),
      (this.waterNormal = properties.loader.add(
        settings.TEXTURE_PATH + "waterNormal.jpg",
        { type: "texture" },
      ).content),
      (this.waterNormal.wrapS = RepeatWrapping),
      (this.waterNormal.wrapT = RepeatWrapping),
      properties.loader.add(settings.MODEL_PATH + "scene3/SC_03_LAND.buf", {
        onLoad: (t) => this._onModelLoad(t, "land"),
      }),
      properties.loader.add(settings.MODEL_PATH + "scene3/SC_03_WATER.buf", {
        onLoad: (t) => this._onModelLoad(t, "water"),
      }),
      clouds.preInit(),
      particles.preInit();
  }
  init() {
    (this.skyDome = new Mesh(
      new SphereGeometry(1800, 8, 8),
      new ShaderMaterial({
        vertexShader: skyVert,
        fragmentShader: skyFrag,
        uniforms: Object.assign({}, this.sharedUniforms),
        depthWrite: !1,
        depthTest: !1,
        side: 1,
      }),
    )),
      (this.skyDome.renderOrder = -1),
      (this.skyDome.frustumCulled = !1),
      this.container.add(this.skyDome),
      clouds.init(),
      this.container.add(clouds.container),
      properties.initCallFuncList.push(clouds.container),
      particles.init(),
      this.container.add(particles.container),
      properties.initCallFuncList.push(particles.container),
      properties.initCallFuncList.push(this.skyDome);
  }
  _onModelLoad(e, t) {
    let i = new ShaderMaterial({
      uniforms: Object.assign(
        {
          u_texture: { value: this.texture },
          u_waterNormal: { value: this.waterNormal },
          u_time: properties.sharedUniforms.u_time,
        },
        this.sharedUniforms,
        blueNoise.sharedUniforms,
      ),
      vertexShader: vert$3,
      fragmentShader: frag$3,
      defines: { IS_WATER: t === "water" },
    });
    const n = new Mesh(e, i);
    (n.renderOrder = t === "water" ? 1 : 3),
      this.container.add(n),
      this.meshes.push(n),
      properties.initCallFuncList.push(n);
  }
  resize(e, t) {
    clouds.resize(e, t), particles.resize(e, t);
  }
  preUpdate(e) {}
  update(e) {
    const t = this.activeRatio > 0;
    (this.container.visible = t),
      (clouds.isVisible = t),
      clouds.update(e),
      (particles.isVisible = t),
      particles.update(e);
  }
}
const scene3 = new Scene3();
class HomePool extends Section {
  id = "home-pool";
  charArray = [];
  titleAnimation = null;
  preInit(e) {
    super.preInit(this.id, e),
      (this.domTitle = this.domContainer.querySelector(".title")),
      (this.domTitleSpans = Array.from(this.domTitle.querySelectorAll("span"))),
      (this.domDescription = this.domContainer.querySelector(".description")),
      (this.domCta = this.domContainer.querySelector("#home-pool__cta")),
      (this.domCta._isActive = !1),
      (this.domCta._activeRatio = 0),
      (this.domCtaText = this.domCta.querySelector("span")),
      (this.domCtaIcon = this.domCta.querySelector("svg")),
      (this.animationsRatio = 0);
  }
  init() {}
  resize(e, t) {
    (this.charArray = []),
      this.domTitleSpans.forEach((c) => {
        (c._splitted = new SplitType(c, {})),
          this.charArray.push(...c._splitted.chars);
      });
    for (let c = this.charArray.length - 1; c > 0; c--) {
      const m = Math.floor(Math.random() * (c + 1));
      [this.charArray[c], this.charArray[m]] = [
        this.charArray[m],
        this.charArray[c],
      ];
    }
    const i = 0.975,
      n = this.charArray.length,
      r = 1 / (1 + (n - 1) * (1 - i)),
      o = r * (1 - i);
    for (let c = 0; c < n; c++)
      (this.charArray[c]._animation = new TextBlurAnimation(this.charArray[c])),
        (this.charArray[c]._updateAnimation = (m, _) => {
          const f = math.fit(m, c * o, c * o + r, 0, 1);
          this.charArray[c]._animation.update(f * (1 - _));
        });
    this.domDescription._splitted = new SplitType(this.domDescription, {
      types: "lines",
    });
    const s = 0.5,
      u = 1 / (1 + (this.domDescription._splitted.lines.length - 1) * (1 - s)),
      h = u * (1 - s);
    this.domDescription._splitted.lines.forEach((c, m) => {
      (c._animation = new TextBlurAnimation(c)),
        (c._updateAnimation = (_) => {
          const f = math.fit(_, m * h, m * h + u, 0, 1);
          c._animation.update(f);
        });
    });
    const d = this.domCta.getBoundingClientRect();
    (this.domCta._width = d.width), (this.domCta._height = d.height);
  }
  update(e, t = !1) {
    const i = scrollManager.getDomRange(this.domContainer),
      { screenY: n, showScreenOffset: r, viewSize: o } = i,
      s = math.fit(r, 0.5, o + 1, 0, 1),
      l = s > 0 && s < 1;
    if (this.domContent?.style) {
      this.domContent.style.transform = `translateY(${-n}px)`;
      this.domContent.style.visibility = l ? "visible" : "hidden";
    }
    const u = math.fit(s, 0.2, 0.4, 0, 1),
      h = math.fit(s, 0.9, 0.975, 0, 1);
    if (this.domTitle?.style) {
      this.domTitle.style.transform = `translate3d(0,${
        (-h * properties.viewportHeight * 1) / 5
      }px,${-h * 300}px) rotate3d(-1, 0, 0, ${h * -25}deg)`;
      this.domTitle.style.opacity = 1 - h;
    }
    if (this.charArray) {
      for (let w = 0; w < this.charArray.length; w++)
        this.charArray[w]._updateAnimation && this.charArray[w]._updateAnimation(u, 0);
    }
    const d = math.fit(s, 0.35, 0.5, 0, 1);
    if (this.domDescription?.style) {
      this.domDescription.style.transform = `translate3d(0,${
        (-h * properties.viewportHeight * 1) / 5
      }px,${-h * 300}px) rotate3d(-1, 0, 0, ${h * -25}deg)`;
      this.domDescription.style.opacity = 1 - h;
      this.domDescription._splitted?.lines?.forEach((w, x) => {
        w._updateAnimation && w._updateAnimation(d);
      });
    }
    if (this.domCta) {
      const _ = 1 * math.fit(s, 0.45, 0.6, 0, 1) > 0,
        f = math.saturate((this.domCta._activeRatio || 0) + 4 * e * (_ ? 1 : -2));
      this.domCta._activeRatio = f;
      const p = ease.quadIn(f),
        g = 1 - ease.sineIn(f);
      if (this.domCta.style) {
        this.domCta.style.transform = `translateY(${
          (-h * properties.viewportHeight * 1) / 5
        }px) translate3d(0, ${g * 2}em, ${h * -300}px) rotate3d(-1, 0, 0, ${
          g * 25 + h * -25
        }deg)`;
        this.domCta.style.opacity = p * (1 - h);
      }
    }
      (cameraControls.scene3AnimationRatio = math.fit(
        i.ratio,
        -0.75,
        0.5,
        cameraControls.scene3AnimationRatio,
        1,
      )),
      (scene3.activeRatio = math.fit(
        i.ratio,
        -0.75,
        0.75,
        scene3.activeRatio,
        1,
      )),
      (postprocessing$1.waterPass.amount = math.fit(
        r,
        0.5,
        1,
        postprocessing$1.waterPass.amount,
        0,
      ));
  }
}
const homePoolSection = new HomePool();
class HomeEveryone extends Section {
  static id = "home-everyone";
  preInit(e) {
    super.preInit(HomeEveryone.id, e),
      (this.plsDomContainer = this.domContainer.querySelector(
        "#home-everyone__lps",
      )),
      (this.borrowersDomContainer = this.domContainer.querySelector(
        "#home-everyone__borrowers",
      )),
      (this.tradersDomContainer = this.domContainer.querySelector(
        "#home-everyone__traders",
      )),
      [
        this.plsDomContainer,
        this.borrowersDomContainer,
        this.tradersDomContainer,
      ].forEach((t) => {
        (t._iconWrapper = t.querySelector(".icon-wrapper")),
          (t._titleWrapper = t.querySelector(".title-wrapper")),
          (t._title = t.querySelector(".title")),
          (t._subtitle = t.querySelector(".subtitle"));
      }),
      (this.domKicker = this.domContainer.querySelector(".kicker")),
      (this.domKicker._splitted = Array.from(
        this.domKicker.querySelectorAll("span"),
      )),
      this.domKicker._splitted.forEach((t) => {
        t._animation = new TextBlurAnimation(t);
      }),
      (this.animationsRatio = 0);
  }
  init() {}
  resize(e, t) {
    [
      this.plsDomContainer,
      this.borrowersDomContainer,
      this.tradersDomContainer,
    ].forEach((i) => {
      i._titleArray = new SplitType(i._title, {}).chars;
      for (let c = i._titleArray.length - 1; c > 0; c--) {
        const m = Math.floor(Math.random() * (c + 1));
        [i._titleArray[c], i._titleArray[m]] = [
          i._titleArray[m],
          i._titleArray[c],
        ];
      }
      const n = 0.95,
        r = i._titleArray.length,
        o = 1 / (1 + (r - 1) * (1 - n)),
        s = o * (1 - n);
      for (let c = 0; c < r; c++)
        (i._titleArray[c]._animation = new TextBlurAnimation(i._titleArray[c])),
          (i._titleArray[c]._updateAnimation = (m) => {
            const _ = math.fit(m, c * s, c * s + o, 0, 1);
            i._titleArray[c]._animation.update(_);
          });
      i._subtitleSplitted = new SplitType(i._subtitle, { types: "lines" });
      const l = 0.75,
        h = 1 / (1 + (i._subtitleSplitted.lines.length - 1) * (1 - l)),
        d = h * (1 - l);
      i._subtitleSplitted.lines.forEach((c, m) => {
        (c._animation = new TextBlurAnimation(c)),
          (c._updateAnimation = (_) => {
            const f = math.fit(_, m * d, m * s + h, 0, 1);
            c._animation.update(f);
          });
      });
    });
  }
  update(e, t = !1) {
    const i = scrollManager.getDomRange(this.domContainer),
      { showScreenOffset: n, viewSize: r } = i,
      o = math.fit(n, -0.5, r, 0, 1),
      s = math.fit(o, 0, 0.15, 0, 1),
      u = 1 - math.fit(o, 0.85, 1, 0, 1),
      h = s * u,
      d = h > 0;
    if (this.domContent?.style) {
      this.domContent.style.transform = `translateY(${-i.screenY}px)`;
      this.domContent.style.visibility = d ? "visible" : "hidden";
    }
    const c = h * math.fit(o, 0.18, 0.3333, 1, 0),
      m = h * math.fit(o, 0.3333, 0.48, 0, 1) * math.fit(o, 0.51, 0.6666, 1, 0),
      _ = h * math.fit(o, 0.6666, 0.81, 0, 1);
    if (scene2?.trails) {
      if (scene2.trails[0]) scene2.trails[0].activeRatio = c;
      if (scene2.trails[1]) scene2.trails[1].activeRatio = m;
      if (scene2.trails[2]) scene2.trails[2].activeRatio = _;
    }
    if (this.animationsRatio === o && !t)
      return;
    this.animationsRatio = o;
    const f = [
        this.plsDomContainer,
        this.borrowersDomContainer,
        this.tradersDomContainer,
      ],
      p = [c, m, _];
    f.forEach((g, w) => {
      if (!g) return;
      const x = p[w];
      if (g.style) g.style.visibility = x > 0 ? "visible" : "hidden";
      const y = math.fit(x, 0.4, 0.7, 0, 1, ease.cubicInOut);
      if (g._iconWrapper?.style) {
        g._iconWrapper.style.setProperty("--opacity", y);
        g._iconWrapper.style.transform = `rotate(${(1 - y) * -45}deg) scale(${0.5 + 0.5 * y})`;
      }
      const b = math.fit(x, 0, 0.5, 0, 1);
      g._titleArray?.forEach((L, v) => {
        L._updateAnimation && L._updateAnimation(b);
      });
      const C = math.fit(x, 0.4, 1, 0, 1);
      g._subtitleSplitted?.lines?.forEach((L, v) => {
        L._updateAnimation && L._updateAnimation(C);
      });
    });
    this.domKicker?._splitted?.forEach((g, w) => {
      g._animation?.update(math.fit(h, w * 0.05, 0.2 + w * 0.05, 0, 1));
    });
  }
}
const homeEveryoneSection = new HomeEveryone();
class HomeEvernet extends Section {
  static id = "home-evernet";
  preInit(e) {
    super.preInit(HomeEvernet.id, e),
      (this.domLogo = this.domContainer.querySelector("#home-evernet__logo")),
      (this.domLogoSVG = this.domLogo.querySelector("svg")),
      (this.domTitleWrapper =
        this.domContainer.querySelector(".title-wrapper")),
      (this.domTitle = this.domTitleWrapper.querySelector(".title")),
      (this.domTitleSpan = this.domTitle.querySelector("span")),
      (this.domTitleSpan._animation = new TextBlurAnimation(this.domTitleSpan)),
      this.domTitleSpan._animation.update(1),
      (this.domDescription = this.domContainer.querySelector(".description")),
      (this.domSubtitle = this.domContainer.querySelector(".subtitle")),
      (this.domSubtitle._animation = new TextBlurAnimation(this.domSubtitle)),
      (this.canvas = document.getElementById("home-evernet__logo-canvas")),
      (this.canvasSize = new Vector2()),
      (this.canvasSizeDpr = new Vector2()),
      (this.ctx = this.canvas.getContext("2d")),
      (this.logoImg = new Image()),
      (this.logoImgSize = new Vector2()),
      (this.logoImg.src = "images/logos/evernet.png"),
      (this.canvasSizeReferenceForImageLogo = 800),
      (this.logoImg.onload = () => {
        this.logoImgSize.set(this.logoImg.width, this.logoImg.height);
      }),
      (this.animationsRatio = 0),
      (this.canvasAnimationsRatio = 0);
  }
  init() {}
  resize(e, t) {
    const i = this.domLogo.getBoundingClientRect();
    (this.domLogo._width = i.width), (this.domLogo._height = i.height);
    const n = this.canvas.getBoundingClientRect();
    this.canvasSize.set(n.width, n.height),
      this.canvasSizeDpr.copy(this.canvasSize).multiplyScalar(settings.DPR),
      (this.canvas.width = this.canvasSizeDpr.x),
      (this.canvas.height = this.canvasSizeDpr.y),
      (this.domDescription._splitted = new SplitType(this.domDescription, {
        types: "lines",
      }));
    const r = 0.25,
      o = 0.35,
      l = (o - r) / this.domDescription._splitted.lines.length,
      u = 0.85,
      h = 0.95,
      c = (h - u) / this.domDescription._splitted.lines.length;
    this.domDescription._splitted.lines.forEach((m, _) => {
      (m._animation = new TextBlurAnimation(m)),
        (m._updateAnimation = (f) => {
          const p = math.fit(f, r + _ * l, o + _ * l, 0, 1),
            g = math.fit(f, u + _ * c, h + _ * c, 0, 1);
          m._animation.update(p * (1 - g));
        });
    }),
      this.update(0, !0);
  }
  update(e, t = !1) {
    const i = scrollManager.getDomRange(this.domContainer),
      { screenY: n, showScreenOffset: r, viewSize: o } = i,
      s = scrollManager.getDomRange([
        this.domContainer,
        homeEveryoneSection.domContainer,
      ]);
    (scene2.activeRatio = cameraControls.scene2AnimationRatio =
      math.fit(s.showScreenOffset, 0, s.viewSize, 0, 0.9999)),
      (postprocessing$1.final.evernetTransition =
        math.fit(r, -0.5, -0.25, 0, 1) * math.fit(r, 0, 0.25, 1, 0));
    const l = math.fit(r, -0.5, o - 0.25, 0, 1);
    math.fit(r, o - 1, o - 0.5, 0, 1);
    const u = l > 0 && l < 1;
    if (this.domContent?.style) {
      this.domContent.style.transform = `translateY(${-n}px)`;
      this.domContent.style.visibility = u ? "visible" : "hidden";
    }
    if (this.animationsRatio === l && !t)
      return;
    this.animationsRatio = l;
    const h = math.fit(l, 0.1, 0.3, 0, 1);
    if (this.domTitle?.style) {
      this.domTitle.style.overflow = h < 1 ? "hidden" : "visible";
    }
    if (this.domTitleSpan?.style) {
      this.domTitleSpan.style.transform = `translate(0, calc(${
        (1 - h) * 175
      }% + 0.15ex))`;
    }
    const d = math.fit(l, 0.9, 1, 0, 1);
    this.domTitleSpan?._animation?.update(1 - d);
    const c = math.fit(l, 0.15, 0.3, 0, 1),
      m = math.fit(l, 0.9, 1, 0, 1);
    this.domSubtitle?._animation?.update(c * (1 - m));
    this.domDescription?._splitted?.lines?.forEach((g) => {
      g._updateAnimation && g._updateAnimation(l);
    });
    const logoHeight = this.domLogo?._height || 0;
    const _ = math.fit(l, 0.5, 0.6, 0, logoHeight * 0.55);
    if (this.domTitle?.style) this.domTitle.style.transform = `translate(0, -${_}px)`;
    const f = math.fit(l, 0.475, 0.6, 0, logoHeight * 0.55);
    if (this.domSubtitle?.style) this.domSubtitle.style.transform = `translate(0, -${f}px)`;
    const p = math.fit(l, 0.5, 0.6, 0, logoHeight * 0.55);
    if (this.domDescription?.style) {
      this.domDescription.style.transform = `translate(0, ${p}px)`;
    }
    this.drawCanvasLogo(l, t);
  }
  drawCanvasLogo(e, t = !1) {
    if (this.canvasAnimationsRatio === e && !t) return;
    this.canvasAnimationsRatio = e;
    const i = this.ctx;
    if (!i) return;
    const r = this.canvasSize.x,
      o = r * 0.5,
      s = r * Math.SQRT2;
    i.save(),
      i.scale(settings.DPR, settings.DPR),
      i.clearRect(0, 0, this.canvasSize.x, this.canvasSize.y),
      i.translate(o, o);
    let l = math.fit(e, 0.27, 0.37, -o, o),
      u = math.fit(e, 0, 0.1, l, o),
      h = makeLineGradient(i, l, 0, u, 0, 1);
    drawLine(i, [l, 0], [u, 0], h, 1),
      i.restore(),
      i.save(),
      i.scale(settings.DPR, settings.DPR),
      i.translate(o, o);
    const d = math.fit(e, 0.85, 1, 0, 1),
      c = 1 - d;
    if (
      (i.save(),
      i.rotate(-Math.PI * 0.25),
      drawSquareLine(
        i,
        0.5 * s * 0.52 * math.fit(d, 0, 0.5, 1, 0),
        math.fit(e, 0.5, 0.65, 0, 1),
        c,
      ),
      drawSquareLine(
        i,
        0.5 * s * 0.752 * math.fit(d, 0.25, 0.75, 1, 0),
        math.fit(e, 0.525, 0.675, 0, 1),
        c,
      ),
      drawSquareLine(
        i,
        0.5 * s * math.fit(d, 0.5, 1, 1, 0),
        math.fit(e, 0.55, 0.7, 0, 1),
        c,
      ),
      i.restore(),
      i.restore(),
      this.domLogo?.style?.setProperty(
        "--opacity",
        math.fit(e, 0.65, 0.7, 0, 1) * math.fit(e, 0.8, 0.9, 1, 0),
      ),
      this.logoImgSize?.x > 0 && this.logoImgSize?.y > 0)
    ) {
      const m = this.canvasSize.x / this.canvasSizeReferenceForImageLogo;
      i.save(),
        i.scale(settings.DPR, settings.DPR),
        i.translate(o, o),
        (i.globalAlpha =
          math.fit(e, 0.55, 0.65, 0, 1) * math.fit(e, 0.85, 0.88, 1, 0));
      const _ = this.logoImgSize.x * m,
        f = this.logoImgSize.y * m;
      i.drawImage(this.logoImg, -_ * 0.5, -f * 0.5, _, f),
        (i.globalAlpha = 1),
        i.restore();
    }
  }
}
const homeEvernetSection = new HomeEvernet();
class HomeRelayers extends Section {
  static id = "home-relayers";
  preInit(e) {
    super.preInit(HomeRelayers.id, e),
      (this.domTitleWrapper =
        this.domContainer.querySelector(".title-wrapper")),
      (this.domTitle = this.domTitleWrapper ? this.domTitleWrapper.querySelector(".title") : null),
      (this.domTitle && (this.domTitle._animation = new TextBlurAnimation(this.domTitle))),
      (this.domDescription = this.domContainer.querySelector(".description")),
      (this.domLogo = this.domContainer.querySelector(".logo")),
      (this.canvas = document.getElementById("home-relayers__logo-canvas")),
      (this.canvasSize = new Vector2()),
      (this.canvasSizeDpr = new Vector2()),
      (this.ctx = this.canvas ? this.canvas.getContext("2d") : null),
      (this.logoImg = new Image()),
      (this.logoImgSize = new Vector2()),
      (this.logoImg.src = "images/logos/relayers.png"),
      (this.canvasSizeReferenceForImageLogo = 1e3),
      (this.logoImg.onload = () => {
        this.logoImgSize.set(this.logoImg.width, this.logoImg.height);
      }),
      (this.canvasAnimationsRatio = 0);
  }
  init() {}
  resize(e, t) {
    const i = this.canvas ? this.canvas.getBoundingClientRect() : { width: 0, height: 0 };
    this.canvasSize.set(i.width, i.height),
      this.canvasSizeDpr.copy(this.canvasSize).multiplyScalar(settings.DPR);
    if (this.canvas) {
      (this.canvas.width = this.canvasSizeDpr.x),
      (this.canvas.height = this.canvasSizeDpr.y);
    }
    if (this.domDescription && typeof SplitType !== "undefined") {
      this.domDescription._splitted = new SplitType(this.domDescription, {
        types: "lines",
      });
      const linesCount = this.domDescription._splitted?.lines?.length || 1;
      const n = 0.5,
        o = 1 / (1 + (linesCount - 1) * (1 - n)),
        s = o * (1 - n);
      this.domDescription._splitted?.lines?.forEach((l, u) => {
        (l._animation = new TextBlurAnimation(l)),
          (l._updateAnimation = (h) => {
            const d = math.fit(h, u * s, u * s + o, 0, 1);
            l._animation && l._animation.update(d);
          });
      });
    }
    this.update(0, !0);
  }
  update(e, t = !1) {
    const i = scrollManager.getDomRange(this.domContainer),
      { screenY: n, showScreenOffset: r, viewSize: o } = i,
      s = math.fit(r, 0.5, o + 0.5, 0, 1),
      l = s > 0 && s < 1;
    if (this.domContent?.style) {
      this.domContent.style.visibility = l ? "visible" : "hidden";
      this.domContent.style.transform = `translateY(${-n}px)`;
    }
    const u = properties.viewportHeight * (properties.isMobileLayout, 0.15);
    if (this.domLogo?.style) {
      this.domLogo.style.transform = `translate(-50%, calc(-50% - ${u}px)) scale(${
        properties.isMobileLayout ? 0.8 : 1
      })`;
    }
    const h = math.fit(s, 0.075, 0.125, 0, 1) * math.fit(s, 0.75, 0.95, 1, 0);
    this.domTitle?._animation?.update(h);
    if (this.domTitleWrapper?.style) {
      this.domTitleWrapper.style.transform = `translate(0, ${
        this.canvasSize.y * 0.35
      }px)`;
    }
    this.domDescription?._splitted?.lines?.forEach((m, _) => {
      m._updateAnimation && m._updateAnimation(
        math.fit(s, 0.12, 0.22, 0, 1) * math.fit(s, 0.655, 0.755, 1, 0),
      );
    });
    const d = math.fit(r, 0.5, 1, 0, 1),
      c = d > 0 && postprocessing$1.final.relayersHideRatio === 0;
    (postprocessing$1.final.relayersHideRatio = d),
      c
        ? ((scene2.activeRatio = 0.99999),
          (postprocessing$1.waterPass.amount = 0),
          (scene3.activeRatio = 0),
          (cameraControls.scene2AnimationRatio = 1),
          (cameraControls.scene3AnimationRatio = 0))
        : ((scene2.activeRatio = math.fit(r, 0.5, 0.51, scene2.activeRatio, 1)),
          (cameraControls.scene2AnimationRatio = math.fit(
            r,
            0.5,
            0.51,
            cameraControls.scene2AnimationRatio,
            1,
          )),
          (scene3.activeRatio = math.fit(r, 0.51, 1, 0, 1e-4)),
          (postprocessing$1.waterPass.amount = math.fit(r, 0.5, 0.51, 0, 1)),
          (cameraControls.scene3AnimationRatio = math.fit(
            r,
            0.51,
            1,
            0,
            1e-4,
          ))),
      this.drawCanvasLogo(s, t);
  }
  drawCanvasLogo(e, t = !1) {
    if (this.canvasAnimationsRatio === e && !t) return;
    this.canvasAnimationsRatio = e;
    const i = this.ctx,
      r = this.canvasSize.x,
      o = r * 0.5,
      s = r * Math.SQRT2;
    if (
      (i.save(),
      i.scale(settings.DPR, settings.DPR),
      i.clearRect(0, 0, this.canvasSize.x, this.canvasSize.y),
      i.translate(o, o),
      i.rotate(-Math.PI * 0.25),
      drawSquareLine(
        i,
        0.5 * s,
        math.fit(e, 0.035, 0.2, 0, 1) * math.fit(e, 0.8, 1, 1, 0),
      ),
      i.restore(),
      this.logoImgSize.x > 0 && this.logoImgSize.y > 0)
    ) {
      const l = this.canvasSize.x / this.canvasSizeReferenceForImageLogo;
      i.save(),
        i.scale(settings.DPR, settings.DPR),
        i.translate(o, o),
        (i.globalAlpha =
          math.fit(e, 0.1, 0.2, 0, 1) * math.fit(e, 0.8, 0.95, 1, 0));
      const u = this.logoImgSize.x * l,
        h = this.logoImgSize.y * l;
      i.drawImage(this.logoImg, -u * 0.5, -h * 0.5, u, h),
        (i.globalAlpha = 1),
        i.restore();
    }
  }
}
const homeRelayersSection = new HomeRelayers();
class HomeJoin extends Section {
  static id = "home-join";
  showRatio = 0;
  mainRatio = 0;
  preInit(e) {
    super.preInit(HomeJoin.id, e),
      (this.domTitle = this.domContainer.querySelector(".title")),
      (this.domTitleSpans = Array.from(this.domTitle.querySelectorAll("span")));
    const t = 0.5,
      n = 1 / (1 + (this.domTitleSpans.length - 1) * (1 - t)),
      r = n * (1 - t);
    this.domTitleSpans.forEach((o, s) => {
      (o._animation = new TextBlurAnimation(o)),
        (o._updateAnimation = (l) => {
          math.fit(l, s * r, s * r + n, 0, 1), o._animation.update(l);
        });
    }),
      (this.domSubtitle = this.domContainer.querySelector(".subtitle")),
      (this.domSubtitle._animation = new TextBlurAnimation(this.domSubtitle)),
      (this.domButtonsWrapper = this.domContainer.querySelector(
        "#home-join__buttons",
      )),
      (this.domButtons = this.domButtonsWrapper.querySelectorAll("a"));
  }
  init() {}
  resize(e, t) {}
  update(e) {
    const t = scrollManager.getDomRange(this.domContainer),
      { screenY: i, showScreenOffset: n, viewSize: r } = t,
      o = n > 0.95;
    this.mainRatio = math.saturate(this.mainRatio + e * (o ? 1 : -2));
    const s = math.fit(this.mainRatio, 0, 1, 0, 1);
    if (this.domContent?.style) {
      this.domContent.style.transform = `translateY(${-i}px)`;
      this.domContent.style.visibility = n > 0 ? "visible" : "hidden";
    }
    const l = math.fit(s, 0.2, 0.6, 0, 1);
    this.domSubtitle?._animation?.update(l);
    const u = math.fit(s, 0.3, 0.85, 0, 1);
    this.domTitleSpans?.forEach((c) => {
      c._updateAnimation && c._updateAnimation(u);
    });
    const h = math.fit(s, 0.6, 0.95, 0, 1);
    if (this.domButtonsWrapper?.style) {
      this.domButtonsWrapper.style.opacity = math.fit(h, 0, 0.5, 0, 1);
      this.domButtonsWrapper.style.transform = `scale(${math.fit(
        h,
        0,
        0.5,
        0.5,
        1,
      )})`;
    }
    const d = math.fit(h, 0.25, 1, 0, 1);
    this.domButtons?.forEach((c, m) => {
      const _ = math.fit(d, m * 0.2, m * 0.2 + 0.6, 0, 1);
      if (c?.style) {
        c.style.opacity = _;
        c.style.transform = `translateY(${(1 - _) * 20}%)`;
      }
    });
    if (this.domContainer?.style) {
      this.domContainer.style.pointerEvents = s > 0.25 ? "auto" : "none";
    }
      (scene3.joinRatio = postprocessing$1.final.joinHideRatio =
        math.fit(n, 0, 0.95, 0, 1));
  }
}
const homeJoinSection = new HomeJoin();
class HomePage extends Page {
  path = "";
  id = "home";
  sections = [
    homeHero,
    homeEverbladeSection,
    homeEvernetSection,
    homeEveryoneSection,
    homeRelayersSection,
    homePoolSection,
    homeJoinSection,
  ];
  transitionCanvas = null;
  transitionCtx = null;
  isCanvasVisible = !1;
  transitionRatio = 0;
  preInit() {
    for (let e of this.sections) e.preInit(this.domContainer);
    (this.transitionCanvas = document.getElementById("transition-canvas")),
      (this.transitionCtx = this.transitionCanvas.getContext("2d"));
  }
  init() {
    for (let e of this.sections) e.init();
  }
  resize(e, t) {
    for (let i of this.sections) i.resize(e, t);
    (this.transitionCanvas.width = e * settings.DPR),
      (this.transitionCanvas.height = t * settings.DPR),
      (this.transitionRatio = -1);
  }
  update(e) {
    for (let y of this.sections) y.update(e);
    let t =
        postprocessing$1.final.relayersHideRatio > 0 &&
        postprocessing$1.final.relayersHideRatio < 1,
      i = postprocessing$1.final.joinHideRatio > 0,
      n = t || i;
    if (
      (n !== this.isCanvasVisible &&
        ((this.isCanvasVisible = n),
        n
          ? (this.transitionCanvas.style.display = "block")
          : (this.transitionCanvas.style.display = "none")),
      !this.isCanvasVisible)
    )
      return;
    let r = t
        ? postprocessing$1.final.relayersHideRatio
        : 1 - postprocessing$1.final.joinHideRatio,
      o = r !== this.transitionRatio;
    if (((this.transitionRatio = r), !o)) return;
    let s = this.transitionCtx,
      l = properties.viewportWidth,
      u = properties.viewportHeight,
      h = settings.DPR,
      d = l / h,
      c = u / h,
      m = c * 1.414;
    s.save(),
      s.scale(h, h),
      (s.fillStyle = "rgba(0,0,0,1)"),
      (s.globalCompositeOperation = "destination-out"),
      s.fillRect(0, 0, l, u),
      (s.globalCompositeOperation = "source-over");
    let _ = t ? c * 0.15 : c * 0.2 * math.fit(r, 1, 0, 0, 0.925);
    s.translate(d / 2, c / 2 - _), s.rotate(Math.PI * 0.25);
    let f = 2.25 * m * (t ? r : math.fit(r, 0, 1, 0.075, 1)),
      p = t ? math.fit(r, 0, 0.25, 0, 1) : math.fit(r, 0, 0.25, 0.25, 0),
      g = 0,
      w = t ? 100 * r : 10 * (1 - r),
      x = s.createLinearGradient(0, -f / 2 - w, 0, f / 2 + w);
    x.addColorStop(0, "rgba(255,255,255,0)"),
      x.addColorStop(0.25, "rgba(255,255,255," + p + ")"),
      x.addColorStop(0.75, "rgba(255,255,255," + p + ")"),
      x.addColorStop(1, "rgba(255,255,255,0)"),
      (s.strokeStyle = x),
      (s.lineWidth = 1),
      s.beginPath(),
      s.moveTo(-f / 2 - g, -f / 2 - w),
      s.lineTo(-f / 2 - g, f / 2 + w),
      s.closePath(),
      s.stroke(),
      s.beginPath(),
      s.moveTo(f / 2 + g, -f / 2 - w),
      s.lineTo(f / 2 + g, f / 2 + w),
      s.closePath(),
      s.stroke(),
      (g = t ? 100 * r : 10 * (1 - r)),
      (w = 0),
      (x = s.createLinearGradient(-f / 2 - g, 0, f / 2 + g, 0)),
      x.addColorStop(0, "rgba(255,255,255,0)"),
      x.addColorStop(0.25, "rgba(255,255,255," + p + ")"),
      x.addColorStop(0.75, "rgba(255,255,255," + p + ")"),
      x.addColorStop(1, "rgba(255,255,255,0)"),
      (s.strokeStyle = x),
      s.beginPath(),
      s.moveTo(-f / 2 - g, -f / 2 - w),
      s.lineTo(f / 2 + g, -f / 2 - w),
      s.closePath(),
      s.stroke(),
      s.beginPath(),
      s.moveTo(-f / 2 - g, f / 2 + w),
      s.lineTo(f / 2 + g, f / 2 + w),
      s.closePath(),
      s.stroke(),
      s.restore();
  }
}
const homePage = new HomePage();
class Route {
  constructor(e) {
    (this.path = e),
      (this.target = null),
      (this.title = ""),
      (this.dom = null),
      (this.hasContentPreloaded = !1),
      (this.content = {});
  }
  setTitleDom(e, t) {
    (this.title = e), (this.dom = t);
  }
  setTarget(e) {
    let t = null;
    for (let i = 0; i < e.length; i++) {
      let n = e[i];
      if (n.regExp.test(this.path)) {
        t = n;
        break;
      }
    }
    // if route is not matched explicitly (e.g. running under /world in next.js), fallback to first available target
    if (!t && e && e.length > 0) {
      t = e[0];
    }
    this.target = t ? t.target : null;
  }
}
let loc = window.location,
  ORIGIN = window.location.origin,
  URL_PREFIX_REGEX = new RegExp("^" + ORIGIN.replace(/\//g, "\\/"));
class RouteManager {
  routes = {};
  matchList = [];
  currPath = null;
  _pendingPath = null;
  queryStr;
  onRouteChanged = new MinSignal$2();
  get currRoute() {
    return this.routes[this.currPath];
  }
  init() {
    let e = this.parseUrl();
    (this.queryStr = e.query),
      window.addEventListener("popstate", this._onStatePop.bind(this)),
      this.setUrl();
  }
  addPath(e, t) {
    this.matchList.push({
      regExp: e instanceof RegExp ? e : new RegExp("^" + e + "$"),
      target: t,
    });
  }
  _createRoute(e) {
    let t = (this.routes[e] = new Route(e));
    return t.setTarget(this.matchList), t;
  }
  _fetchHtml(e) {
    let t = this.routes[e] || this._createRoute(e);
    // in next.js SPA mode the DOM structure is already available under document body
    this._initDom(t);
  }
  _initDom(e, t) {
    if (!t)
      e.setTitleDom(document.title, document.querySelector(".page")),
        this._attachEvents(document.documentElement);
    else {
      let i = document.implementation.createHTMLDocument();
      i.body.innerHTML = /<body[^>]*>((.|[\n\r])*)<\/body>/im.exec(t)[1];
      let n = /<title[^>]*>((.|[\n\r])*)<\/title>/im.exec(t);
      e.setTitleDom(n ? n[1] : "", i.querySelector(".page")),
        this._attachEvents(e.dom);
    }
    this._onDomReady(e);
  }
  _attachEvents(e) {
    if (!e || !e.querySelectorAll) return;
    let t = e.querySelectorAll("a");
    for (let i = 0, n = t.length; i < n; i++) {
      let r = t[i];
      if (!r || !r.href || typeof r.href !== "string") continue;
      if (!r.__hasClickParsed) {
        r.__hasClickParsed = !0;
        let o =
          r.href.indexOf(window.location.origin) === 0 ||
          (r.href.indexOf("https://") !== 0 &&
            r.href.indexOf("http://") !== 0) ||
          r.href.indexOf("/") === 0;
        (o = o && !r.href.includes("mailto:") && !r.href.match(/\.[\w\d]+$/g)),
          o &&
            (r.addEventListener("mouseenter", (s) => {
              this.preFetch(this.parseUrl(r.href).path);
            }),
            r.addEventListener("click", (s) => {
              s.preventDefault(), this.setUrl(r.href);
            }));
      }
    }
  }
  _onDomReady(e) {
    this._pendingPath == e.path &&
      ((this._pendingPath = null), this.onRouteChanged.dispatch(e));
  }
  parseUrl(e = loc.href) {
    let t = e.replace(URL_PREFIX_REGEX, ""),
      i = t.split("#"),
      n = i[1];
    i = i[0].split("?");
    let r = i[1];
    return (t = this.parsePath(i[0])), { path: t, query: r, hash: n };
  }
  parsePath(e) {
    return (e = e.replace(/^\/|\/$/g, "")), e;
  }
  setUrl(e = loc.href) {
    let t = this.parseUrl(e);
    this.setPath(t.path, t.query, t.hash);
  }
  setPath(e, t, i) {
    (e = this.parsePath(e)),
      (t = this.mergeQueryStr(this.queryStr, t)),
      (i = i),
      e !== this.currPath &&
        (history.pushState(
          null,
          null,
          (e || "/") + (t ? "?" + t : "") + (i ? "#" + i : ""),
        ),
        this._onStatePop());
  }
  mergeQueryStr(e, t) {
    let i = Object.assign(
        settings.parseQuery(e ? "?" + e : ""),
        settings.parseQuery(t ? "?" + t : ""),
      ),
      n = "";
    for (let r in i) n += r + "=" + i[r] + "&";
    return n ? n.slice(0, -1) : "";
  }
  preFetch(e) {
    (e = this.parsePath(e)), this._fetchHtml(e);
  }
  _onStatePop(e) {
    e && e.preventDefault();
    let t = this.parseUrl().path;
    t !== this.currPath &&
      ((this.currPath = t),
      (this._pendingPath = t),
      properties.hasInitialized
        ? this._fetchHtml(t)
        : this._initDom(this._createRoute(t)));
  }
}
const routeManager = new RouteManager();
class Ufx extends PostEffect {
  scene;
  camera = new PerspectiveCamera(60, 1);
  frameIdx = -1;
  sectionLayer = new Object3D();
  projectDetailsLayer = new Object3D();
  sharedUniforms = { u_fromTexture: { value: null } };
  init() {
    (this.scene = new Scene()),
      this.scene.add(this.sectionLayer),
      this.scene.add(this.projectDetailsLayer);
  }
  render(e, t = !1) {
    let i = this.camera,
      n = properties.viewportWidth,
      r = properties.viewportHeight;
    i.position.set(n / 2, -r / 2, r / (2 * Math.tan((i.fov * Math.PI) / 360))),
      (i.aspect = n / r),
      (i.far = i.position.z * 2),
      (i.near = i.far / 1e3),
      i.updateProjectionMatrix();
    let o = fboHelper.getColorState(),
      s = properties.renderer;
    fboHelper.copy(e.fromTexture, e.sceneRenderTarget),
      s.setRenderTarget(e.sceneRenderTarget),
      (fboHelper.renderer.autoClear = !1),
      (fboHelper.renderer.autoClearColor = !1),
      (fboHelper.renderer.autoClearStencil = !0),
      (fboHelper.renderer.autoClearDepth = !0),
      fboHelper.renderer.clear(!1, !0, !0),
      s.render(this.scene, this.camera),
      s.setRenderTarget(null);
    let l = t ? null : e.toRenderTarget;
    fboHelper.copy(e.sceneTexture, l), fboHelper.setColorState(o), e.swap();
  }
}
class PreUfx extends Ufx {
  renderOrder = 5;
}
const preUfx = new PreUfx();
class PostUfx extends Ufx {
  renderOrder = 20;
}
const postUfx = new PostUfx();
class PageManager {
  pages = {};
  pageList = [homePage];
  scrollTargetPage = null;
  domContainer = null;
  prevRoute = null;
  currRoute = null;
  _defaultRoute;
  _pendingRoute;
  _isHiding = !1;
  _isShowing = !1;
  _hasPreloaded = !0;
  onIdled = new MinSignal$2();
  NEEDS_LOG = !1;
  constructor() {
    (this._defaultRoute = new Route(void 0)),
      (this.prevRoute = this.currRoute = this._defaultRoute);
    for (let e = 0; e < this.pageList.length; e++) {
      let t = this.pageList[e];
      (this.pages[t.id] = t), routeManager.addPath(t.path, t);
    }
    // ensure next.js /world route or any generic subpath points to homePage
    routeManager.addPath("world", homePage);
    routeManager.addPath(/^(world|.*)$/, homePage);
  }
  preInit() {
    (this.domContainer = document.getElementById("pages-container")),
      routeManager.onRouteChanged.add(this._onRouteChanged, this),
      this._onRouteChanged(routeManager.currRoute);
  }
  get isIdle() {
    return !this._isHiding && this._hasPreloaded && !this._isShowing;
  }
  _onRouteChanged(e) {
    if (!e) e = routeManager.currRoute || this._defaultRoute;
    if (!this.isIdle) this._pendingRoute = e;
    else if (this.currRoute !== e) {
      (this.prevRoute = this.currRoute), (this.currRoute = e);
      let t = (this.currRoute && this.currRoute.target) || homePage;
      if (
        (t.domContainer ||
          ((t.domContainer = (this.currRoute && this.currRoute.dom) || document.querySelector(".page")),
          this._log("preInit: " + (this.currRoute ? this.currRoute.path : "")),
          preUfx.scene.add(t.preUfxContainer),
          postUfx.scene.add(t.postUfxContainer),
          t.preInit(this.currRoute)),
        properties.hasInitialized
          ? (this._hasPreloaded = !1)
          : (this.scrollTargetPage = t),
        (this.currRoute && this.currRoute.hasContentPreloaded) ||
          (this._log("preInitContent: " + (this.currRoute ? this.currRoute.path : "")),
          t.preInitContent(this.currRoute)),
        properties.hasInitialized)
      ) {
        let i = this.prevRoute.target;
        (this._isHiding = !0),
          this._log("hide page: " + this.prevRoute.path),
          i.hide(this.prevRoute, this.currRoute, () => {
            (this._isHiding = !1), this._hasPreloaded && this._onHideComplete();
          }),
          properties.loader.start((n) => {
            n == 1 &&
              ((this._hasPreloaded = !0),
              this._isHiding || this._onHideComplete());
          });
      }
    }
  }
  init() {
    this._initPage();
  }
  _initPage() {
    let e = this.currRoute.target;
    e.hasInitialized ||
      (this._log("init: " + this.currRoute.path),
      e.init(this.currRoute),
      (e.hasInitialized = !0)),
      this.currRoute.hasContentPreloaded ||
        ((this.currRoute.hasContentPreloaded = !0),
        this._log("initContent: " + this.currRoute.path),
        e.initContent(this.currRoute));
  }
  _onHideComplete() {
    if ((this._initPage(), (this._isShowing = !0), this.prevRoute.target)) {
      let e = this.prevRoute.target;
      this._log("hide page complete: " + this.prevRoute.path),
        (e.isActive = !1),
        e !== this.currRoute.target &&
          (e.domContainer.remove(),
          (e.preUfxContainer.visible = !1),
          (e.postUfxContainer.visible = !1)),
        e.onHideComplete(this.prevRoute, this.currRoute);
    }
    this._showPage();
  }
  resize(e, t) {
    this.prevRoute.target &&
      this.prevRoute.target.isActive &&
      this.prevRoute.target !== this.currRoute.target &&
      this.prevRoute.target.resize(e, t),
      this.currRoute &&
        this.currRoute.target.isActive &&
        this.currRoute.target.resize(e, t);
  }
  start() {
    (this._isShowing = !0), this._showPage();
  }
  _showPage() {
    let e = this.currRoute.target;
    (e.isActive = !0),
      properties.hasInitialized &&
        e !== this.prevRoute.target &&
        this.domContainer.prepend(e.domContainer),
      (document.title = this.currRoute.title),
      (this.scrollTargetPage = e),
      (e.preUfxContainer.visible = !0),
      (e.postUfxContainer.visible = !0),
      this._log("show page: " + this.currRoute.path),
      scrollManager.resize(properties.viewportWidth, properties.viewportHeight),
      scrollManager.scrollToPixel(0, !0),
      e.preShow(this.prevRoute, this.currRoute),
      e.resize(properties.viewportWidth, properties.viewportHeight),
      e.show(this.prevRoute, this.currRoute, this._onShowComplete.bind(this));
  }
  _onShowComplete() {
    if (
      ((this._isShowing = !1), this._log("==============="), this._pendingRoute)
    ) {
      let e = this._pendingRoute;
      (this._pendingRoute = null), this._onRouteChanged(e);
    } else this.onIdled.dispatch();
  }
  update(e) {
    this.prevRoute.target &&
      this.prevRoute.target.isActive &&
      this.prevRoute.target !== this.currRoute.target &&
      this.prevRoute.target.update(e),
      this.currRoute &&
        this.currRoute.target.isActive &&
        this.currRoute.target.update(e);
  }
  _log(e) {
    this.NEEDS_LOG &&
      console.log("%cPageManager: " + e, "color: #fff;background-color:#00f");
  }
}
const pagesManager = new PageManager();
let uuidHash = 1;
class ScrollPane {
  id = 0;
  lockOnDirection = !0;
  isActive = !1;
  x;
  y;
  viewDom;
  contentDom;
  isVertical = !0;
  targetScrollPixel = 0;
  scrollViewDelta = 0;
  viewWidthPixel = 0;
  viewHeightPixel = 0;
  contentSize = 0;
  contentSizePixel = 0;
  scrollView = 0;
  progress = 0;
  minScrollPixel = 0.1;
  viewSizePixel = 1;
  scrollMultiplier = 1;
  domRanges = new Map();
  useResizeObserver = !0;
  tick = -1;
  lastResizeTick = -1;
  resizeObserveTick = -1;
  hasResizeObserved = !1;
  dragHistory = [];
  dragHistoryMaxTime = 0.1;
  isWheelScrolling = !1;
  frictionCoeffFrom = 2.1;
  frictionCoeffTo = 1.9;
  frictionCoeffWeightDivisor = 5;
  minVelocity = -1;
  wheelEaseCoeff = 12;
  scrollPixel = 0;
  init(e = {}) {
    Object.assign(this, e),
      this.contentDom &&
        this.useResizeObserver &&
        window.ResizeObserver &&
        new ResizeObserver(this._onResizeObserve.bind(this)).observe(
          this.contentDom,
        ),
      document.documentElement.addEventListener("keydown", (t) => {
        t.key === "ArrowUp"
          ? this.scrollToPixel(this.scrollPixel - 100)
          : t.key === "ArrowDown"
          ? this.scrollToPixel(this.scrollPixel + 100)
          : t.key === "PageUp"
          ? this.scrollToPixel(this.scrollPixel - this.viewSizePixel)
          : t.key === "PageDown" &&
            this.scrollToPixel(this.scrollPixel + this.viewSizePixel);
      });
  }
  _onResizeObserve() {
    (this.hasResizeObserved = !0), (this.resizeObserveTick = this.tick);
  }
  getDomRange(e, t = 0, i = !1) {
    if (!e) return { start: 0, end: 0, top: 0, bottom: 0, height: 0, ratio: 0, isVisible: !1, update: () => {} };
    let n = Array.isArray(e);
    if (n && (!e[0] || !e[1])) return { start: 0, end: 0, top: 0, bottom: 0, height: 0, ratio: 0, isVisible: !1, update: () => {} };
    n
      ? ((e[0].__uuid = e[0].__uuid || uuidHash++),
        (e[1].__uuid = e[1].__uuid || uuidHash++))
      : (e.__uuid = e.__uuid || uuidHash++);
    let r = n ? e[0].__uuid + "_" + e[1].__uuid : e.__uuid,
      o = this.domRanges.get(r);
    return (
      o || this.domRanges.set(r, (o = new ScrollDomRange(e, this.isVertical))),
      o.update(this.scrollPixel, this.viewSizePixel, t, i),
      o
    );
  }
  scrollTo(e, t = 0, i = !1) {
    if (((e = typeof e == "string" ? document.getElementById(e) : e), e)) {
      let n = this.getDomRange(e);
      this.scrollToPixel(n.top + t * this.viewSizePixel, i);
    }
  }
  scrollToPixel(e = 0, t = !1) {
    (e = this._clampScrollPixel(e)),
      t
        ? (this.resetScroll(e),
          (this.progress =
            this.contentSize > 0 ? e / this.contentSizePixel : 0))
        : (this.resetScroll(this.scrollPixel),
          (this.targetScrollPixel = e),
          (this.isWheelScrolling = !0)),
      this.syncDom();
  }
  getEaseInOutOffset(e, t, i = 0, n = 0.5) {
    let r = 1.5 + n,
      o = (r - 1) * 2 + i,
      s = 0,
      l = r,
      u = l + i,
      h = u + r,
      d = (t * h) / o,
      c = e + d * 0.5 - t * 0.5,
      m = Math.min(1, c / d);
    if (m > 0) {
      let f = m * h;
      var _ = f;
      if (f > s && f <= l) {
        let p = (f - s) / (l - s);
        _ = math.cubicBezier(s, (l - s) / 3 + s, 1, 1, p);
      } else if (f > l && f <= u) _ = 1;
      else if (f > u && f <= h) {
        let p = (f - u) / (h - u);
        _ = math.cubicBezier(1, 1, -(h - u) / 3 + 2, 2, p);
      } else f > h && (_ = f - o);
      return ((f - _) / o) * t;
    }
    return 0;
  }
  resize(e, t) {
    if (
      (this.domRanges.forEach((n) => {
        n.needsUpdate = !0;
      }),
      this.viewDom)
    ) {
      let n = this.viewDom.getBoundingClientRect();
      (e = n.width), (t = n.height);
    }
    (this.viewWidthPixel = e), (this.viewHeightPixel = t);
    let i = this.isVertical ? t : e;
    if (this.contentDom) {
      let n = this.contentDom.getBoundingClientRect();
      this.contentSize = Math.max(
        0,
        (this.isVertical ? n.height : n.width) / i - 1,
      );
    }
    (this.contentSizePixel = Math.floor(this.contentSize * i)),
      (this.targetScrollPixel = this.contentSizePixel * this.progress),
      this.resetScroll(this.targetScrollPixel),
      (this.viewSizePixel = i),
      (this.lastResizeTick = this.tick),
      this.syncDom();
  }
  _clampScrollPixel(e) {
    return math.clamp(e, 0, this.contentSizePixel);
  }
  resetScroll(e) {
    (this.targetScrollPixel = this.scrollPixel = e),
      (this.velocityPixel = 0),
      (this.dragHistory.length = 0);
  }
  update(e) {
    this.hasResizeObserved &&
      ((this.hasResizeObserved = !1),
      this.resizeObserveTick !== this.lastResizeTick &&
        this.resize(this.viewWidthPixel, this.viewHeightPixel));
    let t = this.scrollView,
      i =
        input.isDown &&
        ((!this.lockOnDirection &&
          (input.isDragScrollingY || input.isDragScrollingX)) ||
          (this.isVertical && input.isDragScrollingY) ||
          (!this.isVertical && input.isDragScrollingX)),
      n = 0;
    if (
      (input.isDown && !input.wasDown && (this.dragHistory.length = 0),
      this.isMoveable)
    ) {
      let r = 0;
      this.isVertical
        ? input.isWheelScrolling || input.isDragScrollingY
          ? (r = input.deltaScrollY)
          : !this.lockOnDirection &&
            input.isDragScrollingX &&
            (r = -input.deltaPixelXY.y + input.deltaWheel)
        : input.isWheelScrolling || input.isDragScrollingX
        ? (r = input.deltaScrollX)
        : !this.lockOnDirection &&
          input.isDragScrollingY &&
          (r = -input.deltaPixelXY.x + input.deltaWheel),
        input.isWheelScrolling && (this.isWheelScrolling = !0);
      let o = properties.time;
      if (i) {
        for (
          this.dragHistory.push({ time: o, deltaTime: e, deltaPixel: r });
          this.dragHistory.length > 0 &&
          o - this.dragHistory[0].time > this.dragHistoryMaxTime;

        )
          this.dragHistory.shift();
        (this.targetScrollPixel = this.scrollPixel),
          (this.isWheelScrolling = !1),
          (n = r);
      } else if (
        (input.isDown && this.resetScroll(this.scrollPixel),
        this.isWheelScrolling)
      ) {
        (this.dragHistory.length = 0),
          (this.velocityPixel = 0),
          (this.targetScrollPixel += r),
          (this.targetScrollPixel = this._clampScrollPixel(
            this.targetScrollPixel,
          ));
        let s = this.targetScrollPixel - this.scrollPixel;
        (n = s * (1 - Math.exp(-this.wheelEaseCoeff * e))),
          Math.abs(s) < this.minScrollPixel &&
            ((n = s), (this.isWheelScrolling = !1));
      } else {
        if (this.dragHistory.length > 0) {
          let u = 0,
            h = 0;
          for (let d = 0; d < this.dragHistory.length; d++) {
            let c = this.dragHistory[d];
            if (c.time > 0) {
              let m = c.deltaPixel / c.deltaTime,
                _ = c.deltaTime,
                f =
                  this.dragHistory.length == 1
                    ? 1
                    : (c.time - this.dragHistory[0].time) /
                      this.dragHistoryMaxTime,
                p = _ * f;
              (h += m * p), (u += p);
            }
          }
          (this.velocityPixel = h / u), (this.dragHistory.length = 0);
        }
        let l =
          -math.mix(
            this.frictionCoeffFrom,
            this.frictionCoeffTo,
            math.clamp(
              Math.abs(
                this.velocityPixel /
                  this.viewSizePixel /
                  this.frictionCoeffWeightDivisor,
              ),
              0,
              1,
            ),
          ) * this.velocityPixel;
        (this.velocityPixel += l * e), (n = this.velocityPixel * e);
      }
    }
    (this.scrollPixel = this._clampScrollPixel(this.scrollPixel + n)),
      (this.scrollView = this.scrollPixel / this.viewSizePixel),
      (this.scrollViewDelta = this.scrollView - t),
      (this.progress =
        this.contentSize > 0 ? this.scrollPixel / this.contentSizePixel : 0),
      Math.abs(this.targetScrollPixel - this.scrollPixel) <
        this.minScrollPixel && (this.scrollPixel = this.targetScrollPixel),
      Math.abs(this.velocityPixel) <= this.minVelocity &&
        (this.velocityPixel = 0),
      (this.isScrolling =
        this.targetScrollPixel !== this.scrollPixel ||
        Math.abs(this.velocityPixel) > 0),
      this.syncDom(),
      this.tick++;
  }
  syncDom() {
    this.contentDom &&
      ((this.x = 0),
      (this.y = 0),
      this.isVertical
        ? (this.y = -this.scrollPixel)
        : (this.x = -this.scrollPixel),
      (this.contentDom.style.transform = `translate3d(${this.x}px, ${this.y}px, 0px)`));
  }
  get isMoveable() {
    return (
      this.isActive &&
      pagesManager.isIdle &&
      this.contentSize > 0 &&
      (!this.viewDom || input.hasThroughElem(this.viewDom, "down"))
    );
  }
}
const fogVert = `#define GLSLIFY 1
attribute vec3 toPos;attribute float curveu;attribute float edgeRatio;varying vec2 v_uv;varying vec3 v_worldPosition;varying vec3 v_viewPosition;varying vec3 v_viewNormal;varying float v_curveu;varying float v_edgeRatio;uniform float u_flowTime;vec4 mod289(vec4 x){return x-floor(x*(1.0/289.0))*289.0;}float mod289(float x){return x-floor(x*(1.0/289.0))*289.0;}vec4 permute(vec4 x){return mod289(((x*34.0)+1.0)*x);}float permute(float x){return mod289(((x*34.0)+1.0)*x);}vec4 taylorInvSqrt(vec4 r){return 1.79284291400159-0.85373472095314*r;}float taylorInvSqrt(float r){return 1.79284291400159-0.85373472095314*r;}vec4 grad4(float j,vec4 ip){const vec4 ones=vec4(1.0,1.0,1.0,-1.0);vec4 p,s;p.xyz=floor(fract(vec3(j)*ip.xyz)*7.0)*ip.z-1.0;p.w=1.5-dot(abs(p.xyz),ones.xyz);s=vec4(lessThan(p,vec4(0.0)));p.xyz=p.xyz+(s.xyz*2.0-1.0)*s.www;return p;}
#define F4 0.309016994374947451
vec4 simplexNoiseDerivatives(vec4 v){const vec4 C=vec4(0.138196601125011,0.276393202250021,0.414589803375032,-0.447213595499958);vec4 i=floor(v+dot(v,vec4(F4)));vec4 x0=v-i+dot(i,C.xxxx);vec4 i0;vec3 isX=step(x0.yzw,x0.xxx);vec3 isYZ=step(x0.zww,x0.yyz);i0.x=isX.x+isX.y+isX.z;i0.yzw=1.0-isX;i0.y+=isYZ.x+isYZ.y;i0.zw+=1.0-isYZ.xy;i0.z+=isYZ.z;i0.w+=1.0-isYZ.z;vec4 i3=clamp(i0,0.0,1.0);vec4 i2=clamp(i0-1.0,0.0,1.0);vec4 i1=clamp(i0-2.0,0.0,1.0);vec4 x1=x0-i1+C.xxxx;vec4 x2=x0-i2+C.yyyy;vec4 x3=x0-i3+C.zzzz;vec4 x4=x0+C.wwww;i=mod289(i);float j0=permute(permute(permute(permute(i.w)+i.z)+i.y)+i.x);vec4 j1=permute(permute(permute(permute(i.w+vec4(i1.w,i2.w,i3.w,1.0))+i.z+vec4(i1.z,i2.z,i3.z,1.0))+i.y+vec4(i1.y,i2.y,i3.y,1.0))+i.x+vec4(i1.x,i2.x,i3.x,1.0));vec4 ip=vec4(1.0/294.0,1.0/49.0,1.0/7.0,0.0);vec4 p0=grad4(j0,ip);vec4 p1=grad4(j1.x,ip);vec4 p2=grad4(j1.y,ip);vec4 p3=grad4(j1.z,ip);vec4 p4=grad4(j1.w,ip);vec4 norm=taylorInvSqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));p0*=norm.x;p1*=norm.y;p2*=norm.z;p3*=norm.w;p4*=taylorInvSqrt(dot(p4,p4));vec3 values0=vec3(dot(p0,x0),dot(p1,x1),dot(p2,x2));vec2 values1=vec2(dot(p3,x3),dot(p4,x4));vec3 m0=max(0.5-vec3(dot(x0,x0),dot(x1,x1),dot(x2,x2)),0.0);vec2 m1=max(0.5-vec2(dot(x3,x3),dot(x4,x4)),0.0);vec3 temp0=-6.0*m0*m0*values0;vec2 temp1=-6.0*m1*m1*values1;vec3 mmm0=m0*m0*m0;vec2 mmm1=m1*m1*m1;float dx=temp0[0]*x0.x+temp0[1]*x1.x+temp0[2]*x2.x+temp1[0]*x3.x+temp1[1]*x4.x+mmm0[0]*p0.x+mmm0[1]*p1.x+mmm0[2]*p2.x+mmm1[0]*p3.x+mmm1[1]*p4.x;float dy=temp0[0]*x0.y+temp0[1]*x1.y+temp0[2]*x2.y+temp1[0]*x3.y+temp1[1]*x4.y+mmm0[0]*p0.y+mmm0[1]*p1.y+mmm0[2]*p2.y+mmm1[0]*p3.y+mmm1[1]*p4.y;float dz=temp0[0]*x0.z+temp0[1]*x1.z+temp0[2]*x2.z+temp1[0]*x3.z+temp1[1]*x4.z+mmm0[0]*p0.z+mmm0[1]*p1.z+mmm0[2]*p2.z+mmm1[0]*p3.z+mmm1[1]*p4.z;float dw=temp0[0]*x0.w+temp0[1]*x1.w+temp0[2]*x2.w+temp1[0]*x3.w+temp1[1]*x4.w+mmm0[0]*p0.w+mmm0[1]*p1.w+mmm0[2]*p2.w+mmm1[0]*p3.w+mmm1[1]*p4.w;return vec4(dx,dy,dz,dw)*49.0;}void main(){vec4 noise=simplexNoiseDerivatives(vec4(position*0.003,u_flowTime*0.3));float flowRatio=clamp(noise.x*0.2+0.5,0.,1.);vec3 pos=mix(position,toPos,flowRatio);vec4 viewPosition=modelViewMatrix*vec4(pos,1.0);gl_Position=projectionMatrix*viewPosition;v_uv=uv;v_worldPosition=(modelMatrix*vec4(pos,1.0)).xyz;v_viewPosition=-viewPosition.xyz;vec3 viewNormal=normalMatrix*normal;v_viewNormal=normalize(viewNormal);v_curveu=curveu;v_edgeRatio=edgeRatio;}`,
  fogFrag = `#define GLSLIFY 1
varying vec2 v_uv;varying vec3 v_worldPosition;varying vec3 v_viewPosition;varying vec3 v_viewNormal;varying float v_curveu;varying float v_edgeRatio;uniform sampler2D u_texture;uniform sampler2D u_flowTexture;uniform float u_time;uniform float u_flowStrength;uniform float u_flowTime;vec3 flowUvwInfo(vec2 flowVector,float time,float phaseOffset){float progress=fract(time+phaseOffset);vec3 uvw;uvw.xy=flowVector*progress;uvw.z=1.-abs(1.-2.*progress);return uvw;}void main(){vec3 viewDir=normalize(v_viewPosition);vec3 viewNormal=normalize(v_viewNormal);vec2 flowUv=v_uv;vec3 flow=pow(texture2D(u_texture,flowUv).rgb,vec3(2.2));vec2 uv=v_uv*1.;vec2 flowVector=clamp((texture2D(u_flowTexture,flowUv).rg*255.-128.)/127.,-1.,1.);vec3 uvwA=flowUvwInfo(flowVector/u_flowStrength,u_flowTime,0.);vec3 uvwB=flowUvwInfo(flowVector/u_flowStrength,u_flowTime,0.5);vec4 texA=texture2D(u_texture,uv-uvwA.xy);vec4 texB=texture2D(u_texture,uv-uvwB.xy);vec3 tex=(texA.rgb*uvwA.z+texB.rgb*uvwB.z);tex*=pow(1.-v_edgeRatio,2.)*0.5;gl_FragColor=vec4(1.,1.,1.,tex.r);gl_FragColor=vec4(1.,1.,1.,dot(viewDir,viewNormal)*tex.r);gl_FragColor.rgb=pow(gl_FragColor.rgb,vec3(1.0/2.2));}`;
class HeroMountain {
  container = new Object3D();
  isVisible = !1;
  sharedUniforms = { u_flowStrength: { value: 20 }, u_flowTime: { value: 0 } };
  preInit() {
    properties.loader.add(settings.MODEL_PATH + "scene1/SC_01_MOUNTAIN.buf", {
      onLoad: (t) => (this.geometry = t),
    });
    const e =
      settings.TEXTURE_PATH + "scene1/" + (browser.isMobile ? "mobile/" : "");
    (this.texture = properties.loader.add(e + "SC_01_MOUNTAIN_TEXTURE.webp", {
      type: "texture",
    }).content),
      properties.loader.add(settings.MODEL_PATH + "scene1/SC_01_HERO_FOG.buf", {
        onLoad: (t) => (this.fogGeometry = t),
      }),
      (this.fogTexture = properties.loader.add(
        settings.TEXTURE_PATH + "scene1/fog.webp",
        { type: "texture" },
      ).content),
      (this.fogTexture.wrapS = RepeatWrapping),
      (this.fogTexture.wrapT = RepeatWrapping),
      (this.fogFlowTexture = properties.loader.add(
        settings.TEXTURE_PATH + "scene1/fog_flow.webp",
        { type: "texture" },
      ).content);
  }
  init() {
    (this.mesh = new Mesh(
      this.geometry,
      new ShaderMaterial({
        vertexShader: vert$3,
        fragmentShader: frag$3,
        uniforms: {
          u_texture: { value: this.texture },
          u_time: properties.sharedUniforms.u_time,
          u_skyColor0: { value: new Color() },
          u_skyColor1: { value: new Color() },
          u_fogNear: { value: 1 },
          u_fogFar: { value: 1 },
          u_dimRatio: { value: 0 },
          u_trailRatio: { value: 0 },
        },
        defines: { IS_SCENE_1: 1 },
      }),
    )),
      this.container.add(this.mesh),
      (this.fogMesh = new Mesh(
        this.fogGeometry,
        new ShaderMaterial({
          vertexShader: fogVert,
          fragmentShader: fogFrag,
          uniforms: {
            u_texture: { value: this.fogTexture },
            u_flowTexture: { value: this.fogFlowTexture },
            u_flowStrength: this.sharedUniforms.u_flowStrength,
            u_flowTime: this.sharedUniforms.u_flowTime,
          },
          transparent: !0,
          blending: CustomBlending,
          blendEquation: AddEquation,
          blendSrc: SrcAlphaFactor,
          blendDst: OneMinusSrcAlphaFactor,
          blendEquationAlpha: AddEquation,
          blendSrcAlpha: ZeroFactor,
          blendDstAlpha: OneFactor,
          depthWrite: !1,
        }),
      )),
      this.container.add(this.fogMesh);
  }
  resize(e, t) {}
  preUpdate(e) {}
  update(e) {
    if (!this.mesh) return;
    const t = scene1.activeRatio < 1,
      i = scene3.activeRatio > 0;
    (this.sharedUniforms.u_flowTime.value += e * 0.5),
      (this.mesh.visible = this.fogMesh.visible = t || i);
    const n = this.mesh.material.uniforms;
    t
      ? ((n.u_skyColor0.value = scene1.sharedUniforms.u_skyColor0.value),
        (n.u_skyColor1.value = scene1.sharedUniforms.u_skyColor1.value),
        (n.u_fogNear.value = scene1.sharedUniforms.u_fogNear.value),
        (n.u_fogFar.value = scene1.sharedUniforms.u_fogFar.value),
        (n.u_dimRatio.value = scene1.dimRatio),
        (n.u_trailRatio.value = scene1.trailRatio),
        (this.mesh.renderOrder = 4))
      : i &&
        ((n.u_skyColor0.value = scene3.sharedUniforms.u_skyColor0.value),
        (n.u_skyColor1.value = scene3.sharedUniforms.u_skyColor1.value),
        (n.u_fogNear.value = scene3.sharedUniforms.u_fogNear.value),
        (n.u_fogFar.value = scene3.sharedUniforms.u_fogFar.value),
        (n.u_dimRatio.value = 0),
        (this.mesh.renderOrder = 0));
  }
}
const heroMountain = new HeroMountain(),
  skyAndFog = `#define GLSLIFY 1
uniform vec3 u_skyColor0;uniform vec3 u_skyColor1;uniform float u_fogNear;uniform float u_fogFar;vec3 getSkyColor(vec3 worldPosition){vec3 eyeDirection=normalize(cameraPosition-worldPosition);float fade=-eyeDirection.y;vec3 color=mix(u_skyColor0,u_skyColor1,smoothstep(-0.2,0.6,fade));color-=0.5*smoothstep(0.3,0.8,fade);return color;}vec4 getFogColor(vec3 color,vec3 skyColor,float viewPositionZ){float fogFactor=smoothstep(u_fogNear,u_fogFar,viewPositionZ);float a=0.015;float b=0.03;vec3 v=v_worldPosition-cameraPosition;float t=length(v);vec3 rd=v/t;float heightFogFactor=(a/b)*exp(-(cameraPosition.y+100.)*b)*(1.0-exp(-t*rd.y*b))/rd.y;fogFactor=clamp(max(fogFactor,heightFogFactor),0.0,1.0);return vec4(mix(color,skyColor,fogFactor),1.0-fogFactor);}`;
let DEFAULT_POST_PROFILE = new PostProfile();
shaderHelper.addChunk("skyAndFog", skyAndFog);
class Visuals {
  container = new Object3D();
  isStartAnimationFinished = !1;
  preInit() {
    scene1.preInit(),
      scene2.preInit(),
      scene3.preInit(),
      heroMountain.preInit(),
      this.container.add(scene1.container),
      this.container.add(scene2.container),
      this.container.add(scene3.container),
      this.container.add(heroMountain.container);
  }
  init() {
    scene1.init(), scene2.init(), scene3.init(), heroMountain.init();
  }
  resize(e, t) {
    scene1.resize(e, t),
      scene2.resize(e, t),
      scene3.resize(e, t),
      heroMountain.resize(e, t);
  }
  preUpdate(e) {
    if (
      ((this.isStartAnimationFinished = properties.startTime > 1.5),
      (DEFAULT_POST_PROFILE.screenPaintDistortionAmount = math.fit(
        scene3.joinRatio,
        0,
        1,
        0,
        1,
      )),
      (DEFAULT_POST_PROFILE.cameraMotionBlurAmount = 0.35),
      (DEFAULT_POST_PROFILE.blurRatio = 0),
      (DEFAULT_POST_PROFILE.radialBlurAmount = 0),
      (DEFAULT_POST_PROFILE.bokehFocusDistance =
        cameraControls.bokehFocusDistance),
      (DEFAULT_POST_PROFILE.haloStrength = 0.15),
      (DEFAULT_POST_PROFILE.vignetteFrom = math.fit(
        properties.startTime,
        0.5,
        1.5,
        1,
        0.54278,
        ease.cubicOut,
      )),
      scene1.activeRatio < 1)
    ) {
      (DEFAULT_POST_PROFILE.bloomAmount = 1.5663),
        (DEFAULT_POST_PROFILE.bloomSelectiveStrength = math.fit(
          scene1.dimRatio,
          0,
          1,
          1,
          2.5,
        )),
        (DEFAULT_POST_PROFILE.haloStrength = math.fit(
          scene1.dimRatio,
          0,
          1,
          0.15,
          0.4,
        )),
        (DEFAULT_POST_PROFILE.bloomSaturation = 0.80744),
        (DEFAULT_POST_PROFILE.bloomRadius = 0.08969),
        (DEFAULT_POST_PROFILE.bloomThreshold = 0.72129),
        (DEFAULT_POST_PROFILE.bloomSmoothWidth = 0.56035),
        (DEFAULT_POST_PROFILE.bokehAmount = 1),
        (DEFAULT_POST_PROFILE.bokehFNumber = 3),
        (DEFAULT_POST_PROFILE.bokehFocalLength = 16),
        (DEFAULT_POST_PROFILE.bokehKFilmHeight = 25),
        (DEFAULT_POST_PROFILE.blurRatio = math.fit(
          scene1.activeRatio,
          0.85,
          0.95,
          0,
          1,
        )),
        (DEFAULT_POST_PROFILE.radialBlurAmount = math.fit(
          scene1.activeRatio,
          0,
          0.2,
          1,
          0,
        )),
        (DEFAULT_POST_PROFILE.radialBlurCenterX = 0),
        (DEFAULT_POST_PROFILE.radialBlurCenterY = 0),
        (DEFAULT_POST_PROFILE.radialBlurFromRadius = 1),
        (DEFAULT_POST_PROFILE.radialBlurFromStrength = 0),
        (DEFAULT_POST_PROFILE.radialBlurToRadius = 2),
        (DEFAULT_POST_PROFILE.radialBlurToStrength = 2);
      let t = math.fit(
        scene1.activeRatio,
        scene1Title.ANIMATION_THRESHOLD,
        scene1Title.ANIMATION_THRESHOLD + 0.05,
        1e-5,
        0.35,
      );
      (t = math.fit(scene1.activeRatio, 0.36, 0.37, t, 1e-5)),
        (t = math.fit(scene1.activeRatio, 0.39, 0.4, t, 0.35)),
        (DEFAULT_POST_PROFILE.cameraMotionBlurAmount = t);
    } else if (scene2.activeRatio < 1) {
      if (
        ((DEFAULT_POST_PROFILE.bokehAmount = 0),
        (DEFAULT_POST_PROFILE.bloomAmount = 1),
        (DEFAULT_POST_PROFILE.bloomSelectiveStrength = 2),
        (DEFAULT_POST_PROFILE.bloomSaturation = 0.80744),
        (DEFAULT_POST_PROFILE.bloomRadius = 0.08969),
        (DEFAULT_POST_PROFILE.bloomThreshold = 0.72129),
        (DEFAULT_POST_PROFILE.haloStrength = 0),
        properties.hasInitialized)
      ) {
        let t = math.fit(scene2.activeRatio, 0.1, 0.15, 1, 0);
        DEFAULT_POST_PROFILE.radialBlurAmount = Math.max(
          t,
          scene2.trails[0].activeRatio,
          scene2.trails[1].activeRatio,
          scene2.trails[2].activeRatio,
        );
        let i = (properties.width / properties.height) * 2;
        t
          ? ((DEFAULT_POST_PROFILE.radialBlurCenterX = 0),
            (DEFAULT_POST_PROFILE.radialBlurCenterY = 0),
            (DEFAULT_POST_PROFILE.radialBlurFromRadius = 0.5),
            (DEFAULT_POST_PROFILE.radialBlurFromStrength = 1),
            (DEFAULT_POST_PROFILE.radialBlurToRadius = 1.5),
            (DEFAULT_POST_PROFILE.radialBlurToStrength = 0))
          : scene2.trails[0].activeRatio
          ? ((DEFAULT_POST_PROFILE.radialBlurCenterX = 0),
            (DEFAULT_POST_PROFILE.radialBlurCenterY = -2),
            (DEFAULT_POST_PROFILE.radialBlurFromRadius = 1),
            (DEFAULT_POST_PROFILE.radialBlurFromStrength = 1),
            (DEFAULT_POST_PROFILE.radialBlurToRadius = 2),
            (DEFAULT_POST_PROFILE.radialBlurToStrength = 0))
          : scene2.trails[1].activeRatio
          ? ((DEFAULT_POST_PROFILE.radialBlurCenterX = 1),
            (DEFAULT_POST_PROFILE.radialBlurCenterY = 1),
            (DEFAULT_POST_PROFILE.radialBlurFromRadius = Math.sqrt(
              ((i / 2) * i) / 2 + 1.25 * 1.25,
            )),
            (DEFAULT_POST_PROFILE.radialBlurFromStrength = 0),
            (DEFAULT_POST_PROFILE.radialBlurToRadius = Math.sqrt(
              i * i + 2 * 2,
            )),
            (DEFAULT_POST_PROFILE.radialBlurToStrength = 1))
          : scene2.trails[2].activeRatio &&
            ((DEFAULT_POST_PROFILE.radialBlurCenterX = -1),
            (DEFAULT_POST_PROFILE.radialBlurCenterY = 1),
            (DEFAULT_POST_PROFILE.radialBlurFromRadius = Math.sqrt(
              ((i / 2) * i) / 2 + 1.25 * 1.25,
            )),
            (DEFAULT_POST_PROFILE.radialBlurFromStrength = 0),
            (DEFAULT_POST_PROFILE.radialBlurToRadius = Math.sqrt(
              i * i + 2 * 2,
            )),
            (DEFAULT_POST_PROFILE.radialBlurToStrength = 1));
      }
    } else
      (DEFAULT_POST_PROFILE.bloomAmount = 0.95977),
        (DEFAULT_POST_PROFILE.bloomSelectiveStrength = 1),
        (DEFAULT_POST_PROFILE.bloomSaturation = 0.77436),
        (DEFAULT_POST_PROFILE.bloomRadius = 0),
        (DEFAULT_POST_PROFILE.bloomThreshold = 0.61101),
        (DEFAULT_POST_PROFILE.bloomSmoothWidth = 0.33979),
        (DEFAULT_POST_PROFILE.bokehAmount = 1),
        (DEFAULT_POST_PROFILE.bokehFNumber = 10),
        (DEFAULT_POST_PROFILE.bokehFocalLength = 100),
        (DEFAULT_POST_PROFILE.bokehKFilmHeight = 40),
        (DEFAULT_POST_PROFILE.radialBlurAmount = math.fit(
          scene3.activeRatio,
          0.5,
          1,
          0,
          1,
        )),
        (DEFAULT_POST_PROFILE.radialBlurCenterX = 0),
        (DEFAULT_POST_PROFILE.radialBlurCenterY = 0),
        (DEFAULT_POST_PROFILE.radialBlurFromRadius = 0.75),
        (DEFAULT_POST_PROFILE.radialBlurFromStrength = 0),
        (DEFAULT_POST_PROFILE.radialBlurToRadius = 2),
        (DEFAULT_POST_PROFILE.radialBlurToStrength = 2);
    postprocessing$1.blendProfile(DEFAULT_POST_PROFILE, 1),
      scene1.preUpdate(e),
      scene2.preUpdate(e),
      scene3.preUpdate(e),
      postprocessing$1.syncProfile();
  }
  update(e) {
    scene1.update(e),
      scene2.update(e),
      scene3.update(e),
      heroMountain.update(e);
  }
}
const visuals = new Visuals();
class ScrollManager extends ScrollPane {
  domScrollIndicator;
  domScrollIndicatorHeight = 1;
  domScrollIndicatorBar;
  scrollIndicatorActiveRatio = 0;
  lastMouseInteractiveTime = -1 / 0;
  isIndicatorActive = void 0;
  frameIdx = -1;
  MIN_BAR_SCALE_Y = 1 / 10;
  init() {
    super.init({
      contentDom: document.getElementById("pages-container"),
      domScrollIndicator: document.getElementById("scroll-indicator"),
      domScrollIndicatorBar: document.getElementById("scroll-indicator__bar"),
      canOvershoot: !1,
    });
  }
  resize(e, t) {
    super.resize(e, t);
    if (this.domScrollIndicator) {
      this.domScrollIndicatorHeight = this.domScrollIndicator.getBoundingClientRect().height;
    }
  }
  update(e) {
    super.update(e, this.scrollValue);
    if (this.domScrollIndicator && this.domScrollIndicatorBar) {
      Math.abs(this.scrollViewDelta) > 0
        ? ((this.lastMouseInteractiveTime = properties.time),
          (this.isIndicatorActive = !0))
        : properties.time > this.lastMouseInteractiveTime + 0.5 &&
          (this.isIndicatorActive = !1),
      (this.scrollIndicatorActiveRatio = math.clamp(
        this.scrollIndicatorActiveRatio + (this.isIndicatorActive ? 2 : -2) * e,
        0,
        1,
      )),
      (this.domScrollIndicator.style.opacity = this.scrollIndicatorActiveRatio);
      let i = 1,
        n = 0;
      this.contentSize > 0 &&
        ((i = Math.max(this.MIN_BAR_SCALE_Y, 1 / (1 + this.contentSize))),
        (n = (this.scrollView / this.contentSize) * (1 - i))),
      (this.domScrollIndicatorBar.style.height =
        this.domScrollIndicatorHeight * i + "px"),
      (this.domScrollIndicatorBar.style.transform =
        "translate3d(0," + this.domScrollIndicatorHeight * n + "px,0)");
    }
    this.frameIdx++;
  }
  get isMoveable() {
    return (
      super.isMoveable &&
      pagesManager.isIdle &&
      visuals.isStartAnimationFinished
    );
  }
}
const scrollManager = new ScrollManager(),
  XHRItem = properties.loader.ITEM_CLASSES.xhr;
class BufItem extends XHRItem {
  constructor(e, t) {
    super(e, { ...t, responseType: "arraybuffer" });
  }
  retrieve() {
    return !1;
  }
  _onLoad() {
    if (!this.content) {
      const e = this.xmlhttp.response;
      let t = new Uint32Array(e, 0, 1)[0],
        i = JSON.parse(
          String.fromCharCode.apply(null, new Uint8Array(e, 4, t)),
        ),
        n = i.vertexCount,
        r = i.indexCount,
        o = 4 + t,
        s = new BufferGeometry(),
        l = i.attributes,
        u = !1,
        h = {};
      for (let m = 0, _ = l.length; m < _; m++) {
        let f = l[m],
          p = f.id,
          g = p === "indices" ? r : n,
          w = f.componentSize,
          x = window[f.storageType],
          y = new x(e, o, g * w),
          b = x.BYTES_PER_ELEMENT,
          C;
        if (f.needsPack) {
          let L = f.packedComponents,
            v = L.length,
            A = f.storageType.indexOf("Int") === 0,
            P = 1 << (b * 8),
            V = A ? P * 0.5 : 0,
            K = 1 / P;
          C = new Float32Array(g * w);
          for (let D = 0, I = 0; D < g; D++)
            for (let N = 0; N < v; N++) {
              let Y = L[N];
              (C[I] = (y[I] + V) * K * Y.delta + Y.from), I++;
            }
        } else (h[p] = o), (C = y);
        p === "normal" && (u = !0),
          p === "indices"
            ? s.setIndex(new BufferAttribute(C, 1))
            : s.setAttribute(p, new BufferAttribute(C, w)),
          (o += g * w * b);
      }
      let d = i.meshType,
        c = [];
      if (i.sceneData) {
        let m = i.sceneData,
          _ = new Object3D(),
          f = [],
          p = d === "Mesh" ? 3 : d === "LineSegments" ? 2 : 1;
        for (let g = 0, w = m.length; g < w; g++) {
          let x = m[g],
            y;
          if (!x.vertexCount) y = new Object3D();
          else {
            let b = new BufferGeometry(),
              C,
              L,
              v,
              A = s.index;
            if (A) {
              (C = A.array),
                (L = C.constructor),
                (v = L.BYTES_PER_ELEMENT),
                b.setIndex(
                  new BufferAttribute(
                    new C.constructor(
                      C.buffer,
                      x.faceIndex * A.itemSize * v * p + (h.indices || 0),
                      x.faceCount * A.itemSize * p,
                    ),
                    A.itemSize,
                  ),
                );
              for (let P = 0, V = b.index.array.length; P < V; P++)
                b.index.array[P] -= x.vertexIndex;
            }
            for (let P in s.attributes)
              (A = s.attributes[P]),
                (C = A.array),
                (L = C.constructor),
                (v = L.BYTES_PER_ELEMENT),
                b.setAttribute(
                  P,
                  new BufferAttribute(
                    new C.constructor(
                      C.buffer,
                      x.vertexIndex * A.itemSize * v + (h[P] || 0),
                      x.vertexCount * A.itemSize,
                    ),
                    A.itemSize,
                  ),
                );
            d === "Mesh"
              ? (y = new Mesh(b, new MeshNormalMaterial({ flatShading: !u })))
              : d === "LineSegments"
              ? (y = new LineSegments(b, new LineBasicMaterial()))
              : (y = new Points(
                  b,
                  new PointsMaterial({ sizeAttenuation: !1, size: 2 }),
                )),
              f.push(y);
          }
          x.parentIndex > -1 ? c[x.parentIndex].add(y) : _.add(y),
            x.position && y.position.fromArray(x.position),
            x.quaternion && y.quaternion.fromArray(x.quaternion),
            x.scale && y.scale.fromArray(x.scale),
            (y.name = x.name),
            (y.userData.material = x.material);
          for (let b in x.data) y.userData[b] = x.data[b];
          c[g] = y;
        }
        (s.userData.meshList = f), (s.userData.sceneObject = _);
      }
      this.content = s;
    }
    (this.xmlhttp = void 0), super._onLoad(this);
  }
}
BufItem.type = "buf";
BufItem.extensions = ["buf"];
BufItem.responseType = "arraybuffer";
const ImageItem = properties.loader.ITEM_CLASSES.image;
class TextureItem extends ImageItem {
  constructor(e, t) {
    let i = t.content || new Texture(new Image());
    switch (
      ((t.content = i.image),
      (i.minFilter = t.minFilter || LinearMipMapLinearFilter),
      (i.magFilter = t.magFilter || LinearFilter),
      i.minFilter)
    ) {
      case NearestMipMapNearestFilter:
      case NearestMipMapLinearFilter:
      case LinearMipMapNearestFilter:
      case LinearMipMapLinearFilter:
        (i.generateMipmaps = !0),
          (i.anisotropy =
            t.anisotropy ||
            (properties.renderer?.capabilities?.getMaxAnisotropy?.() || 1));
        break;
      default:
        i.generateMipmaps = !1;
    }
    (i.flipY = t.flipY === void 0 ? !0 : t.flipY),
      t.wrap
        ? (i.wrapS = i.wrapT = t.wrap)
        : (t.wrapS && (i.wrapS = t.wrapS), t.wrapT && (i.wrapT = t.wrapT)),
      super(e, t),
      (this.content = i);
  }
  retrieve() {
    return !1;
  }
  load() {
    this.isStartLoaded = !0;
    let e = this.content.image;
    (e.onload = this.boundOnLoad), (e.src = this.url);
  }
  _onLoad() {
    delete this.content.image.onload,
      (this.width = this.content.image.width),
      (this.height = this.content.image.height),
      (this.content.needsUpdate = !0),
      this.onPost
        ? this.onPost.call(this, this.content, this.onPostLoadingSignal)
        : this._onLoadComplete();
  }
}
TextureItem.type = "texture";
TextureItem.extensions = [];
const AnyItem$1 = properties.loader.ITEM_CLASSES.any;
class ThreeLoaderItem extends AnyItem$1 {
  constructor(e, t) {
    (t.loadFunc = () => {}),
      (t.hasLoading = t.hasLoading === void 0 ? !0 : t.hasLoading),
      super(e, t),
      !t.loader &&
        console &&
        (console.error || console.log)("loader is required."),
      (this.loadFunc = this._loadFunc.bind(this));
  }
  _loadFunc(e, t, i) {
    this.loader.load(
      e,
      this._onLoaderLoad.bind(this, t),
      this._onLoaderLoading.bind(this, i),
    );
  }
  _onLoaderLoad(e, t) {
    (this.content = t), e(t);
  }
  _onLoaderLoading(e, t) {
    e.dispatch(t.loaded / t.total);
  }
}
ThreeLoaderItem.type = "three-loader";
ThreeLoaderItem.extensions = [];
const shader = `#define GLSLIFY 1
uniform vec2 u_glPositionOffset;vec4 glPositionOffset(vec4 glPosition){return glPosition+vec4(u_glPositionOffset*glPosition.w,0.0,0.0);}`;
class GlPositionOffset {
  offset = new Vector2();
  sharedUniforms = { u_glPositionOffset: { value: null } };
  init() {
    (this.sharedUniforms.u_glPositionOffset.value = this.offset),
      shaderHelper.addChunk("glPositionOffset", shader);
  }
  setOffset(e, t) {
    return this.offset.set(e, t);
  }
}
const glPositionOffset = new GlPositionOffset();
class Support {
  isSupported() {
    (properties._isSupportedDevice = !0),
      (properties._isSupportedBrowser =
        (browser.isChrome ||
          browser.isSafari ||
          browser.isEdge ||
          browser.isFirefox ||
          browser.isOpera) &&
        !browser.isIE),
      (properties._isSupportedWebGL = this.checkSupportWebGL()),
      browser.isMobile && this.checkSupportMobileOrientation();
    let e =
      properties._isSupportedDevice &&
      properties._isSupportedBrowser &&
      properties._isSupportedWebGL;
    return e === !1 && this.notSupported(), e;
  }
  notSupported() {
    if (!properties._isSupportedDevice) {
      this._addNotSupported("device");
      return;
    }
    if (!properties._isSupportedBrowser) {
      this._addNotSupported("browser");
      return;
    }
    if (!properties._isSupportedWebGL) {
      this._addNotSupported("webgl");
      return;
    }
  }
  checkSupportWebGL() {
    if (!(properties.canvas instanceof HTMLCanvasElement)) return !1;
    if (settings.USE_WEBGL2 && window.WebGL2RenderingContext)
      try {
        return (
          (properties.gl = properties.canvas.getContext(
            "webgl2",
            properties.webglOpts,
          )),
          (settings.RENDER_TARGET_FLOAT_TYPE = HalfFloatType),
          (settings.DATA_FLOAT_TYPE = FloatType),
          !0
        );
      } catch (e) {
        return console.error(e), !1;
      }
    if (((settings.USE_WEBGL2 = !1), window.WebGLRenderingContext))
      try {
        let e = (properties.gl =
          properties.canvas.getContext("webgl", properties.webglOpts) ||
          properties.canvas.getContext(
            "experimental-webgl",
            properties.webglOpts,
          ));
        if (
          (e.getExtension("OES_texture_float") ||
            e.getExtension("OES_texture_half_float")) &&
          e.getParameter(e.MAX_VERTEX_TEXTURE_IMAGE_UNITS)
        )
          (settings.RENDER_TARGET_FLOAT_TYPE =
            browser.isIOS || e.getExtension("OES_texture_half_float")
              ? HalfFloatType
              : FloatType),
            (settings.DATA_FLOAT_TYPE = FloatType);
        else
          return (
            (settings.USE_FLOAT_PACKING = !0),
            (settings.RENDER_TARGET_FLOAT_TYPE = settings.DATA_FLOAT_TYPE =
              UnsignedByteType),
            !1
          );
        return !0;
      } catch (e) {
        return console.error(e), !1;
      }
    return !1;
  }
  checkSupportMobileOrientation() {
    const e = window.matchMedia("(orientation: portrait)"),
      t = (i) => {
        const n = i.matches ? "portrait" : "landscape";
        n === "portrait"
          ? (properties._isSupportedMobileOrientation = !0)
          : n === "landscape" &&
            (properties._isSupportedMobileOrientation = !1),
          properties._isSupported && !properties._isSupportedMobileOrientation
            ? this._addNotSupported("orientation")
            : this._removeNotSupported("orientation");
      };
    window.addEventListener("load", () => {
      t(e);
    }),
      e.addEventListener("change", (i) => {
        t(i);
      });
  }
  _removeNotSupported(e) {
    properties._isSupported &&
      document.documentElement.classList.remove("not-supported"),
      e && document.documentElement.classList.remove(`not-supported--${e}`);
  }
  _addNotSupported(e) {
    document.documentElement.classList.add("not-supported"),
      e && document.documentElement.classList.add(`not-supported--${e}`);
  }
}
const support = new Support();
class ImageExporter {
  outRenderTarget = null;
  outMaterial = null;
  canvas = null;
  ctx = null;
  width = 0;
  height = 0;
  exporterProgress = 0;
  isExporting = !1;
  buffer = new Uint8Array();
  imageData = null;
  waitingForExport = !1;
  link = document.createElement("a");
  constructor() {}
  preInit() {
    (this.canvas = document.createElement("canvas")),
      (this.ctx = this.canvas.getContext("2d")),
      (this.outRenderTarget = fboHelper.createRenderTarget(1, 1, !0)),
      (this.outMaterial = new RawShaderMaterial({
        uniforms: { u_texture: { value: null } },
        vertexShader: `${fboHelper.precisionPrefix}
				attribute vec2 position;
				varying vec2 v_uv;

				void main() {
					v_uv = position * 0.5 + 0.5;
					v_uv.y = 1.0 - v_uv.y;
					gl_Position = vec4(position, 0.0, 1.0);
				}
			`,
        fragmentShader: `${fboHelper.precisionPrefix}${blitFrag}`,
        depthTest: !1,
        depthWrite: !1,
        blending: NoBlending,
      })),
      properties.exporterSignal.add(() => {
        this.waitingForExport = !0;
      });
  }
  init() {}
  exportImage() {
    (this.width = properties.width),
      (this.height = properties.height),
      this.outRenderTarget.setSize(properties.width, properties.height),
      (this.exporterProgress = 0),
      (this.isExporting = !0),
      this.isExporting &&
        ((this.exporterProgress = 1),
        (this.outMaterial.uniforms.u_texture.value =
          postprocessing$1.fromRenderTarget.texture),
        fboHelper.render(this.outMaterial, this.outRenderTarget),
        (this.canvas.width !== this.width ||
          this.canvas.height !== this.height) &&
          ((this.canvas.width = this.width),
          (this.canvas.height = this.height),
          (this.imageData = this.ctx.getImageData(
            0,
            0,
            this.width,
            this.height,
          )),
          (this.buffer = new Uint8Array(this.imageData.data.length))),
        fboHelper.renderer.readRenderTargetPixels(
          this.outRenderTarget,
          0,
          0,
          this.width,
          this.height,
          this.buffer,
        ),
        this.imageData.data.set(this.buffer),
        this.ctx.putImageData(this.imageData, 0, 0),
        (this.link.download = "Lusion_exported_image.png"),
        (this.link.href = this.canvas.toDataURL()),
        this.link.click(),
        (this.isExporting = !1));
  }
  update(e) {
    this.waitingForExport && (this.exportImage(), (this.waitingForExport = !1));
  }
}
const imageExporter = new ImageExporter();
class App {
  initEngine() {
    (properties.canvas = document.getElementById("canvas")),
      (properties.isSupported = support.isSupported()),
      properties.isSupported &&
        (properties.loader.register(BufItem),
        properties.loader.register(TextureItem),
        properties.loader.register(ThreeLoaderItem),
        (properties.renderer = new WebGLRenderer({
          canvas: properties.canvas,
          context: properties.gl,
        })),
        (properties.scene = new Scene()),
        (properties.camera = new PerspectiveCamera(60, 1, 1, 4e3)),
        properties.scene.add(properties.camera),
        fboHelper.init(properties.renderer, settings.RENDER_TARGET_FLOAT_TYPE),
        textureHelper.init(),
        postprocessing$1.init(properties.scene, properties.camera),
        blueNoise.preInit(),
        glPositionOffset.init(),
        screenPaint.init(),
        postprocessing$1.addQueue());
  }
  preInit() {
    cameraControls.preInit(), visuals.preInit(), imageExporter.preInit();
  }
  init() {
    postprocessing$1.updateSmaaTextures(),
      cameraControls.init(),
      visuals.init(),
      imageExporter.init(),
      properties.scene.add(visuals.container),
      settings.IS_DEV === !1 &&
        console.log(
          "%c Created by Lusion: https://lusion.co",
          "border:2px solid gray; padding:5px; font-family:monospace; font-size:11px;",
        );
  }
  start() {}
  resize(e, t) {
    if (!properties.isSupported || !properties.renderer) return;
    properties.renderer.setSize(e, t),
      properties.canvas && (properties.canvas.style.width = `${properties.viewportWidth}px`),
      properties.canvas && (properties.canvas.style.height = `${properties.viewportHeight}px`),
      properties.camera && (properties.camera.aspect = properties.width / properties.height),
      properties.camera && properties.camera.updateProjectionMatrix(),
      postprocessing$1.setSize(properties.width, properties.height),
      screenPaint.resize(properties.width, properties.height),
      visuals.resize(properties.width, properties.height);
  }
  update(e = 0) {
    (properties.time = properties.sharedUniforms.u_time.value += e),
      (properties.deltaTime = properties.sharedUniforms.u_deltaTime.value = e),
      blueNoise.update(e),
      visuals.preUpdate(e),
      screenPaint.update(e),
      cameraControls.update(e),
      visuals.update(e),
      postprocessing$1.render(properties.scene, properties.camera, !0),
      imageExporter.update(),
      window.__debugTexture &&
        fboHelper.debugTo(window.__debugTexture, 500, 500);
  }
}
const app = new App();
let _initCallFuncList = [],
  _totalInitCallFuncCount = 0;
const MIN_PRELOAD_DURATION = 1,
  PERCENT_BETWEEN_INIT_AND_START = 0.15,
  MIN_DURATION_BETWEEN_INIT_AND_START = 0.25,
  HIDE_DURATION = 1;
class Preloader {
  isActive = !1;
  targetPercent = 0;
  percent = 0;
  initToStartPercent = 0;
  domContainer;
  domCanvas;
  domPercent;
  ctx;
  _tmpCamera = new Camera();
  preInit() {
    this.domContainer = document.getElementById("preloader");
    this.domCanvas = document.getElementById("preloader-canvas");
    this.domPercent = document.getElementById("preloader-percent");
    if (this.domCanvas && this.domCanvas.getContext) this.ctx = this.domCanvas.getContext("2d");
    this.isActive = !1;
    this.domLogoContainer = document.getElementById("preloader-logo");
    this.domLogo = this.domLogoContainer ? this.domLogoContainer.querySelector("svg") : null;
    this.domLogoPaths = Array.from(this.domLogo ? this.domLogo.querySelectorAll("path") : []);
    this.domLogoLines = Array.from(this.domLogo ? this.domLogo.querySelectorAll("rect") : []);
  }
  show(e, t) {
    (this._initCallback = e),
      (this._startCallback = t),
      (this.isActive = !0),
      properties.loader.start((i) => {
        this.targetPercent = i;
      });
  }
  hide() {
    settings.SKIP_ANIMATION &&
      ((this.isActive = !1), (this.domContainer.style.display = "none"));
  }
  resize(e, t) {
    this.isActive &&
      ((this.domCanvas.width = e * settings.DPR),
      (this.domCanvas.height = t * settings.DPR));
  }
  update(e) {
    if (!this.isActive) return;
    if (
      ((this.percent = Math.min(
        this.targetPercent,
        this.percent +
          (settings.SKIP_ANIMATION
            ? 1
            : this.targetPercent > this.percent
            ? e * 2
            : 0) /
            MIN_PRELOAD_DURATION,
      )),
      this.targetPercent == 1)
    ) {
      properties.hasInitialized ||
        (this._initCallback(),
        (_initCallFuncList = properties.initCallFuncList.splice(
          0,
          properties.initCallFuncList.length,
        )),
        (_totalInitCallFuncCount = Math.max(1, _initCallFuncList.length)));
      let b =
        Math.max(0, _totalInitCallFuncCount - _initCallFuncList.length) /
        _totalInitCallFuncCount;
      if (
        ((this.initToStartPercent = Math.min(
          b,
          this.initToStartPercent +
            (settings.SKIP_ANIMATION ? 1 : this.percent == 1 ? e : 0) /
              MIN_DURATION_BETWEEN_INIT_AND_START,
        )),
        _initCallFuncList.length)
      ) {
        let C = _initCallFuncList.shift();
        C.isRawShaderMaterial
          ? ((fboHelper._tri.material = C),
            properties.renderer.compile(fboHelper._tri, this._tmpCamera))
          : properties.renderer.compile(C, this._tmpCamera);
      }
      !properties.hasStarted &&
        this.initToStartPercent == 1 &&
        this._startCallback();
    }
    let t =
      this.initToStartPercent * PERCENT_BETWEEN_INIT_AND_START +
      this.percent * (1 - PERCENT_BETWEEN_INIT_AND_START);
    t = math.fit(t, 0.1, 1, 0, 1);
    let i = math.fit(
        properties.startTime,
        0,
        HIDE_DURATION,
        0,
        1,
        ease.quartInOut,
      ),
      n = this.ctx,
      r = properties.viewportWidth,
      o = properties.viewportHeight,
      s = settings.DPR,
      l = r / s,
      u = o / s,
      h = Math.sqrt(l * l + u * u);
    if (!n) return;
    n.save(),
      n.scale(s, s),
      (n.fillStyle = "#203727"),
      n.fillRect(0, 0, r, o),
      n.translate(l / 2, u / 2),
      n.rotate(Math.PI * 0.25);
    const d = math.fit(properties.width, 375, 1440, 0.25, 0.1);
    let c = h * (math.fit(t, 0, 1, 0.075, d) + math.fit(i, 0, 1, 0, 1 - d));
    n.save(),
      (n.globalCompositeOperation = "destination-out"),
      (n.fillStyle = "rgba(255,255,255," + i + ")"),
      n.fillRect(-c / 2, -c / 2, c, c),
      (n.globalCompositeOperation = "source-over"),
      n.restore();
    let m = n.createRadialGradient(0, 0, c / 3, 0, 0, 2 * c);
    m.addColorStop(0, "#ffffff00"),
      m.addColorStop(1, "rgba(255,255,255," + 0.5 * t + ")"),
      (n.fillStyle = m),
      n.fillRect(-c / 2, -c / 2, c, c);
    let _ = 0,
      f = 15 * t;
    (m = n.createLinearGradient(0, -c / 2 - f, 0, c / 2 + f)),
      m.addColorStop(0, "#ffffff00"),
      m.addColorStop(0.25, "rgba(255,255,255," + t + ")"),
      m.addColorStop(0.75, "rgba(255,255,255," + t + ")"),
      m.addColorStop(1, "#ffffff00"),
      (n.strokeStyle = m),
      (n.lineWidth = 1),
      n.beginPath(),
      n.moveTo(-c / 2 - _, -c / 2 - f),
      n.lineTo(-c / 2 - _, c / 2 + f),
      n.closePath(),
      n.stroke(),
      n.beginPath(),
      n.moveTo(c / 2 + _, -c / 2 - f),
      n.lineTo(c / 2 + _, c / 2 + f),
      n.closePath(),
      n.stroke(),
      (_ = 15 * t),
      (f = 0),
      (m = n.createLinearGradient(-c / 2 - _, 0, c / 2 + _, 0)),
      m.addColorStop(0, "#ffffff00"),
      m.addColorStop(0.25, "rgba(255,255,255," + t + ")"),
      m.addColorStop(0.75, "rgba(255,255,255," + t + ")"),
      m.addColorStop(1, "#ffffff00"),
      (n.strokeStyle = m),
      n.beginPath(),
      n.moveTo(-c / 2 - _, -c / 2 - f),
      n.lineTo(c / 2 + _, -c / 2 - f),
      n.closePath(),
      n.stroke(),
      n.beginPath(),
      n.moveTo(-c / 2 - _, c / 2 + f),
      n.lineTo(c / 2 + _, c / 2 + f),
      n.closePath(),
      n.stroke(),
      n.restore(),
      (this.domPercent.textContent = Math.round(t * 100) + "%"),
      (this.domPercent.style.opacity = math.fit(i, 0, 0.25, 1, 0)),
      (this.domPercent.style.transform =
        "translate3d(-50%," + (math.fit(i, 0, 0.25, 0, 1) + "em") + ",0)"),
      (this.domLogoContainer.style.transform = `translate(-50%, -50%) scale(${math.fit(
        t,
        0.25,
        1,
        0.45,
        0.75,
      )})`),
      (this.domLogoContainer.style.opacity = math.fit(i, 0, 1, 1, 0));
    const p = this.domLogoPaths.length;
    let g = 0,
      w = 0.05,
      x = 0.5;
    for (let b = 0; b < p; b++) {
      const C = g + w * b,
        L = C + x,
        v = math.fit(t, C, L, 0, 1);
      this.domLogoPaths[b].style.opacity = v;
    }
    const y = this.domLogoLines.length;
    (g = 0.25), (w = 0.05), (x = 0.5);
    for (let b = 0; b < y; b++) {
      const C = g + w * b,
        L = C + x,
        v = math.fit(t, C, L, 0, 1);
      this.domLogoLines[b].style.opacity = v;
    }
    i == 1 &&
      ((this.isActive = !1), (this.domContainer.style.display = "none"));
  }
}
const preloader = new Preloader();
class Navbar {
  domContainer;
  domWrapper;
  domItems;
  isActive = !1;
  activeRatio = 0;
  activeItemIndex = -1;
  hoverIndex = -1;
  sections = [];
  preInit() {
    this.domContainer = document.getElementById("navbar");
    if (!this.domContainer) {
      this.domItems = [];
      return;
    }
    this.domWrapper = this.domContainer.querySelector("ul");
    this.domItems = this.domContainer.querySelectorAll("li");
    for (let e = 0; e < this.domItems.length; e++) {
      let t = this.domItems[e];
      if (!t) continue;
      (t._opacity = 1);
      if (t.addEventListener) {
        t.addEventListener("click", (n) => this._onItemClick(e));
        t.addEventListener("mouseenter", (n) => this._onItemMouseEnter(e));
        t.addEventListener("mouseleave", (n) => this._onItemMouseLeave(e));
      }
      const i = (t.dataset && t.dataset.section) ? t.dataset.section.split("|") : [""];
      this.sections.push({
        id: i[0],
        secondaryId: i[1],
        domElement: i[0] ? document.getElementById(i[0]) : null,
        secondaryDomElement: i[1] ? document.getElementById(i[1]) : null,
        offset: parseFloat((t.dataset && t.dataset.offset) || "0"),
      });
    }
  }
  _onItemMouseEnter(e) {
    this.hoverIndex = e;
  }
  _onItemMouseLeave(e) {
    this.hoverIndex = -1;
  }
  _onItemClick(e) {
    const t = this.sections[e].offset,
      i = this.sections[e].domElement;
    i && scrollManager.scrollTo(i, t);
  }
  _updateActiveItem(e) {
    this.activeItemIndex = e;
    if (!this.domItems || this.domItems.length === 0) return;
    for (let t = 0; t < this.domItems.length; t++) {
      if (this.domItems[t] && this.domItems[t].classList) {
        this.domItems[t].classList.remove("is-active");
      }
    }
    if (this.domItems[e] && this.domItems[e].classList) {
      this.domItems[e].classList.add("is-active");
    }
  }
  show() {
    this.isActive = !0;
  }
  hide() {
    this.isActive = !1;
  }
  resize(e, t) {}
  update(e) {
    if (!this.domContainer || !this.domItems || this.domItems.length === 0) return;
    let t = 0;
    for (let r = 0; r < this.sections.length; r++) {
      const o = this.sections[r].domElement,
        s = scrollManager.getDomRange(o),
        { hideScreenOffset: l, isActive: u } = s;
      if ((u && (t = r), this.sections[r].secondaryDomElement)) {
        const h = scrollManager.getDomRange(
            this.sections[r].secondaryDomElement,
          ),
          { isActive: d } = h;
        d && (t = r);
      }
      r === this.sections.length - 1 && (this.isActive = l < -0.5);
    }
    this.activeItemIndex !== t &&
      ((this.activeItemIndex = t), this._updateActiveItem(t)),
      properties.isMobileLayout &&
        (this.isActive = this.isActive && this.activeItemIndex > 0),
      (this.isActive = this.isActive && properties.startTime > 2),
      (this.activeRatio = math.saturate(
        this.activeRatio + e * (this.isActive ? 1 : -1),
      ));
    const i = 0.8,
      n = (i / (this.domItems.length - 1)) * 0.3;
    this.domItems.forEach((r, o) => {
      const s = math.fit(
        this.activeRatio,
        Math.abs(o - 2) * n,
        Math.abs(o - 2) * n + i,
        1,
        0,
        ease.cubicOut,
      );
      if (
        (properties.isMobileLayout
          ? (r.style.transform = `translate(0, calc(-50% + ${
              4 * s
            } * var(--site-padding-y)))`)
          : (r.style.transform = `translate(calc(-50% + ${
              -2 * s
            } * var(--site-padding-x)), 0)`),
        !browser.isMobile)
      ) {
        const l = r._opacity;
        o === this.hoverIndex || this.hoverIndex < 0
          ? (r._opacity = Math.min(1, l + 2 * e))
          : (r._opacity = Math.max(0.5, l - 2 * e)),
          (r.style.opacity = r._opacity);
      }
    });
  }
}
const navbar = new Navbar();
class Header {
  isActive = !0;
  domContainer;
  domLogo;
  domCTA;
  isDarkTheme = !1;
  preInit() {
    this.domContainer = document.getElementById("site-header");
    if (!this.domContainer) return;
    this.domLogo = this.domContainer.querySelector("#site-header__logo");
    this.donLogoAnchor = this.domLogo ? this.domLogo.querySelector("a") : null;
    this.domMobileLogo = this.domContainer.querySelector(
      "#site-header__mobile-logo",
    );
    this.domMobileLogoAnchor = this.domMobileLogo ? this.domMobileLogo.querySelector("a") : null;
    this.domCTA = this.domContainer.querySelector("#site-header__cta");
    this.domMobileCTA = this.domContainer.querySelector(
      "#site-header__mobile-cta",
    );
    this.domMobileWrapper = this.domContainer.querySelector(
      "#site-header__mobile",
    );
    if (this.donLogoAnchor) {
      this.donLogoAnchor.addEventListener("click", () => {
        typeof homeHero !== "undefined" && homeHero && homeHero.domContainer && scrollManager.scrollTo(homeHero.domContainer);
      });
    }
    if (this.domMobileLogoAnchor) {
      this.domMobileLogoAnchor.addEventListener("click", () => {
        typeof homeHero !== "undefined" && homeHero && homeHero.domContainer && scrollManager.scrollTo(homeHero.domContainer);
      });
    }
  }
  show() {}
  hide() {}
  resize(e, t) {}
  update(e) {
    if (!this.domContainer || !this.domLogo) return;
    const t = math.fit(properties.startTime, 2, 3, 0, 1, ease.cubicOut),
      i = math.fit(properties.startTime, 3, 4, 0, 1, ease.cubicOut),
      n = math.mix(-100, 0, t);
    (this.domLogo.style.transform = `translateY(${n}%)`),
      (this.domLogo.style.opacity = t),
      (this.domMobileLogo.style.transform = `translateY(${n}%)`),
      (this.domMobileLogo.style.opacity = t),
      (this.domCTA.style.transform = `translateY(${n}%)`),
      (this.domCTA.style.opacity = t),
      (this.domMobileCTA.style.transform = `translateY(${n}%)`),
      (this.domMobileCTA.style.opacity = t),
      this.domMobileWrapper.style.setProperty("--bg-opacity", i);
  }
}
const header = new Header();
class UI {
  preInit() {
    if (
      (document.documentElement.classList.add("is-ready"),
      preUfx.init(),
      postprocessing$1.queue.push(preUfx),
      postUfx.init(),
      postprocessing$1.queue.push(postUfx),
      preloader.preInit(),
      navbar.preInit(),
      header.preInit(),
      settings.HIDE_UI)
    ) {
      let e = document.getElementById("ui");
      e.classList.add("is-hidden"),
        (e.style.opacity = 0),
        (e.style.visibility = "hidden");
    }
  }
  preload(e, t) {
    preloader.show(e, t);
  }
  init() {}
  start() {
    preloader.hide();
  }
  resize(e, t) {
    document.documentElement.style.setProperty(
      "--vh",
      properties.viewportHeight * 0.01 + "px",
    ),
      preloader.resize(e, t),
      navbar.resize(e, t),
      header.resize(e, t);
  }
  update(e) {
    preloader.update(e), navbar.update(e), header.update(e);
  }
}
const ui = new UI();
class GUI {
  preInit() {
    window.dat && this._addTextureHelper();
  }
  init() {
    window.dat && this._post();
  }
  _post() {
    const e = new dat.GUI();
    e.add(properties, "skipProfileUpdate"),
      e.add(properties, "debugAlpha"),
      postprocessing$1.postProfile.addGui(e);
    let t = e.addFolder("screenPaint");
    t.add(screenPaint, "minRadius", 0, 200, 1).listen(),
      t.add(screenPaint, "maxRadius", 0, 300, 1).listen(),
      t.add(screenPaint, "radiusDistanceRange", 0, 300, 1).listen(),
      t.add(screenPaint, "pushStrength", 0, 100, 1e-5).listen(),
      t.add(screenPaint, "accelerationDissipation", 0, 0.999, 1e-5).listen(),
      t.add(screenPaint, "velocityDissipation", 0, 0.999, 1e-5).listen(),
      t.add(screenPaint, "weight1Dissipation", 0, 0.999, 1e-5).listen(),
      t.add(screenPaint, "weight2Dissipation", 0, 0.999, 1e-5).listen(),
      t.add(screenPaint, "curlScale", 0, 0.5, 1e-5).listen(),
      t.add(screenPaint, "curlStrength", 0, 5, 1e-5).listen(),
      e.add(
        {
          exportImage: function () {
            properties.exporterSignal.dispatch();
          },
        },
        "exportImage",
      );
  }
  _addTextureHelper() {
    let e = dat.GUI.prototype.add;
    dat.GUI.prototype.add = function (t, i) {
      let n = t[i];
      if (n && n.isTexture) {
        let c = function (f) {
            (l.onload = function () {
              (n.image = l), (n.needsUpdate = !0);
            }),
              (l.src = URL.createObjectURL(f));
          },
          m = function () {
            if (+new Date() - d < 100) return;
            d = +new Date();
            let f = document.createElement("input");
            (f.type = "file"),
              (f.style.display = "none"),
              (f.onchange = function () {
                document.body.removeChild(f);
                let p = f.files[0];
                c(p);
              }),
              document.body.appendChild(f),
              f.click();
          },
          _ = function (f) {
            f.stopPropagation(), f.preventDefault();
          };
        var r = c,
          o = m,
          s = _;
        let l = new Image(),
          u,
          h = {},
          d = 0;
        return (
          (l.src = n.image.src),
          (h[i] = m),
          (u = e.call(this, h, i)),
          (u.domElement.innerHTML = ""),
          u.domElement.appendChild(l),
          (l.style.width = l.style.height = "26px"),
          (u.domElement.dragover = (f) => {
            f.preventDefault();
          }),
          (u.domElement.parentNode.parentNode.style.position = "relative"),
          (u.domElement.parentNode.parentNode.ondragenter =
            u.domElement.parentNode.parentNode.ondragleave =
            u.domElement.parentNode.parentNode.ondragover =
              _),
          u.domElement.parentNode.parentNode.addEventListener(
            "drop",
            function (f) {
              f.stopPropagation(), f.preventDefault();
              let p = f.dataTransfer.files[0];
              c(p);
            },
          ),
          u
        );
      } else return e.apply(this, arguments);
    };
  }
}
const gui = new GUI();
class DevGrid {
  static keyCode = 103;
  static html = `
	<div id="dev-grid">
		<style>
		  #dev-grid {
			position: fixed;
			top: 0;
			left: 0;
			right: 0;
			bottom: 0;
			pointer-events: none;
			z-index: 100000;
		  }

		  #dev-grid .o-grid > * {
			height: calc(var(--vh) * 100);
			display: flex;
			background-color: rgba(255,0,0,.15);
			--grid-column-span: 1;
		  }
		</style>

		<div class="o-container">
		  <div class="o-grid">
			<div class="o-col-1"></div>
			<div class="o-col-1"></div>
			<div class="o-col-1"></div>
			<div class="o-col-1"></div>
			<div class="o-col-1"></div>
			<div class="o-col-1"></div>
			<div class="o-col-1"></div>
			<div class="o-col-1"></div>
			<div class="o-col-1"></div>
			<div class="o-col-1"></div>
			<div class="o-col-1"></div>
			<div class="o-col-1"></div>
			<div class="o-col-1"></div>
			<div class="o-col-1"></div>
			<div class="o-col-1"></div>
			<div class="o-col-1"></div>
		  </div>
		</div>
	  </div>
	</div>
  `;
  constructor() {
    (this.isActive = localStorage.getItem("isDevActive") === "true"),
      document.addEventListener("keypress", this.onKeyPress.bind(this)),
      this.isActive && this.show();
  }
  onKeyPress(e) {
    settings.LOOK_DEV_MODE &&
      e.keyCode == DevGrid.keyCode &&
      e.target.tagName.toLowerCase() != "input" &&
      e.target.tagName.toLowerCase() != "textarea" &&
      ((this.isActive = !this.isActive),
      localStorage.setItem("isDevActive", this.isActive),
      this.isActive ? this.show() : this.hide());
  }
  show() {
    document.body.insertAdjacentHTML("beforeend", DevGrid.html);
  }
  hide() {
    document.getElementById("dev-grid").remove();
  }
}
new DevGrid();
const AnyItem = properties.loader.ITEM_CLASSES.any;
class FontItem extends AnyItem {
  constructor(e, t) {
    FontItem.canvas || FontItem.initCanvas(),
      (t.loadFunc = () => {}),
      (t.hasLoading = t.hasLoading === void 0 ? !0 : t.hasLoading),
      (t.refText = "refing something..."),
      (t.refFontSize = t.refFontSize || 120),
      (t.refFont = t.refFont || "monospace:400:italic"),
      (t.interval = t.interval || 20),
      (t.refTextWidth = 0),
      super(e, t),
      (this.loadFunc = this._loadFunc.bind(this));
  }
  static canvas;
  static ctx;
  static initCanvas() {
    let e = document.createElement("canvas");
    (e.width = e.height = 1),
      (FontItem.canvas = e),
      (FontItem.ctx = e.getContext("2d"));
  }
  _loadFunc(e, t, i) {
    let n = e.split(","),
      r = [];
    for (let c = 0; c < n.length; c++) r.push(n[c].trim());
    n = this.refFont.split(":");
    let o = n[0],
      s = n[1] || "normal",
      l = n[2] || "normal",
      u = o;
    this.refTextWidth = this._getTextWidth(o, s, l);
    let h,
      d = r.length;
    h = setInterval(() => {
      (n = r[0].split(":")),
        (o = n[0]),
        (s = n[1] || "normal"),
        (l = n[2] || "normal"),
        this._getTextWidth(o, s, l, u) !== this.refTextWidth &&
          (r.shift(),
          i.dispatch((d - r.length) / d),
          r.length === 0 && (clearInterval(h), t()));
    }, this.refInterval);
  }
  _getTextWidth = (e, t, i, n) => {
    let r = FontItem.ctx;
    return (
      (r.font =
        i + " " + t + " " + this.refFontSize + "px " + e + (n ? ", " + n : "")),
      r.measureText(this.refText).width
    );
  };
  _onLoaderLoad(e, t) {
    (this.content = t), e(t);
  }
  _onLoaderLoading(e, t) {
    e.dispatch(t.loaded / t.total);
  }
}
FontItem.type = "font";
FontItem.extensions = [];
let dateTime = performance.now(),
  _needsResize = !1;
function preRun() {
  for (const [a, e] of Object.entries(settings.CROSS_ORIGINS))
    properties.loader.setCrossOrigin(a, e);
  routeManager.init(),
    properties.loader.register(FontItem),
    properties.loader.register(BufItem),
    properties.loader.register(TextureItem),
    properties.loader.register(ThreeLoaderItem),
    properties.loader.start((a) => {
      a === 1 && run();
    });
}
function run() {
  let a = (properties.viewportWidth = window.innerWidth),
    e = (properties.viewportHeight = window.innerHeight);
  (properties.width = a),
    (properties.height = e),
    app.initEngine(),
    settings.LOOK_DEV_MODE && gui.preInit(),
    input.preInit(),
    scrollManager.init(),
    ui.preInit(),
    pagesManager.preInit(),
    app.preInit(),
    window.addEventListener("resize", onResize),
    _onResize(),
    loop(),
    ui.preload(init, start);
}
function init() {
  settings.LOOK_DEV_MODE && gui.init(),
    input.init(),
    ui.init(),
    pagesManager.init(),
    app.init(),
    (properties.hasInitialized = !0);
}
function start() {
  ui.start(),
    pagesManager.start(),
    app.start(),
    (properties.hasStarted = !0),
    _onResize();
  let a = document.querySelectorAll(
    "#site-header__cta, #site-header__mobile-cta, #home-pool__cta",
  );
  for (let e of a)
    e.addEventListener("click", () => {
      e.classList.add("tooltip-enabled");
    });
  (scrollManager.isActive = !0),
    settings.JUMP_SECTION !== "" &&
      scrollManager.scrollTo(settings.JUMP_SECTION, settings.JUMP_OFFSET, !0);
}
function onResize() {
  _needsResize = !0;
}
function _onResize(a) {
  properties.isResizing = !0;
  let e = (properties.viewportWidth = window.innerWidth),
    t = (properties.viewportHeight = window.innerHeight);
  properties.viewportResolution.set(e, window.innerHeight),
    document.documentElement.style.setProperty("--vh", t * 0.01 + "px");
  let i = settings.UP_SCALE,
    n = e * settings.DPR,
    r = t * settings.DPR;
  if (settings.USE_PIXEL_LIMIT === !0 && n * r > settings.MAX_PIXEL_COUNT) {
    let o = n / r;
    (r = Math.sqrt(settings.MAX_PIXEL_COUNT / o)),
      (n = Math.ceil(r * o)),
      (r = Math.ceil(r));
  }
  (properties.width = Math.ceil(n / i)),
    (properties.height = Math.ceil(r / i)),
    properties.resolution.set(properties.width, properties.height),
    scrollManager.resize(e, t),
    pagesManager.resize(e, t),
    ui.resize(e, t),
    app.resize(properties.width, properties.height),
    scrollManager.resize(e, t),
    (properties.isResizing = !1),
    (properties.isMobileLayout = e < 992);
}
function update(a) {
  input.update(a),
    scrollManager.update(a),
    pagesManager.update(a),
    ui.update(a),
    app.update(a),
    input.postUpdate(a);
}
document.querySelector("#pages-container");
document.querySelector("#home");
function loop(a) {
  (properties.timestamp = a), window.requestAnimationFrame(loop);
  let e = performance.now(),
    t = (e - dateTime) / 1e3;
  (dateTime = e),
    (t = Math.min(t, 1 / 20)),
    _needsResize && _onResize(),
    properties.hasStarted && (properties.startTime += t),
    Tween.autoUpdate(t),
    update(t),
    (_needsResize = !1);
}
window.__bootWorldEngine = function() {
  if (window.__worldEngineActive) return;
  window.__worldEngineActive = true;
  document.documentElement.classList.remove("no-js");
  preRun();
};
function preventZoom(a) {
  a.preventDefault(), (document.body.style.zoom = 1);
}
