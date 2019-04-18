(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = global || self, global.RandomSentenceGenerator = factory());
}(this, function () { 'use strict';

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  function _defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  function _createClass(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties(Constructor.prototype, protoProps);
    if (staticProps) _defineProperties(Constructor, staticProps);
    return Constructor;
  }

  function _defineProperty(obj, key, value) {
    if (key in obj) {
      Object.defineProperty(obj, key, {
        value: value,
        enumerable: true,
        configurable: true,
        writable: true
      });
    } else {
      obj[key] = value;
    }

    return obj;
  }

  function _objectSpread(target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i] != null ? arguments[i] : {};
      var ownKeys = Object.keys(source);

      if (typeof Object.getOwnPropertySymbols === 'function') {
        ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) {
          return Object.getOwnPropertyDescriptor(source, sym).enumerable;
        }));
      }

      ownKeys.forEach(function (key) {
        _defineProperty(target, key, source[key]);
      });
    }

    return target;
  }

  function _inherits(subClass, superClass) {
    if (typeof superClass !== "function" && superClass !== null) {
      throw new TypeError("Super expression must either be null or a function");
    }

    subClass.prototype = Object.create(superClass && superClass.prototype, {
      constructor: {
        value: subClass,
        writable: true,
        configurable: true
      }
    });
    if (superClass) _setPrototypeOf(subClass, superClass);
  }

  function _getPrototypeOf(o) {
    _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) {
      return o.__proto__ || Object.getPrototypeOf(o);
    };
    return _getPrototypeOf(o);
  }

  function _setPrototypeOf(o, p) {
    _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) {
      o.__proto__ = p;
      return o;
    };

    return _setPrototypeOf(o, p);
  }

  function _assertThisInitialized(self) {
    if (self === void 0) {
      throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
    }

    return self;
  }

  function _possibleConstructorReturn(self, call) {
    if (call && (typeof call === "object" || typeof call === "function")) {
      return call;
    }

    return _assertThisInitialized(self);
  }

  function _taggedTemplateLiteral(strings, raw) {
    if (!raw) {
      raw = strings.slice(0);
    }

    return Object.freeze(Object.defineProperties(strings, {
      raw: {
        value: Object.freeze(raw)
      }
    }));
  }

  var anObject = require('./_an-object');
  var toLength = require('./_to-length');
  var advanceStringIndex = require('./_advance-string-index');
  var regExpExec = require('./_regexp-exec-abstract');

  // @@match logic
  require('./_fix-re-wks')('match', 1, function (defined, MATCH, $match, maybeCallNative) {
    return [
      // `String.prototype.match` method
      // https://tc39.github.io/ecma262/#sec-string.prototype.match
      function match(regexp) {
        var O = defined(this);
        var fn = regexp == undefined ? undefined : regexp[MATCH];
        return fn !== undefined ? fn.call(regexp, O) : new RegExp(regexp)[MATCH](String(O));
      },
      // `RegExp.prototype[@@match]` method
      // https://tc39.github.io/ecma262/#sec-regexp.prototype-@@match
      function (regexp) {
        var res = maybeCallNative($match, regexp, this);
        if (res.done) return res.value;
        var rx = anObject(regexp);
        var S = String(this);
        if (!rx.global) return regExpExec(rx, S);
        var fullUnicode = rx.unicode;
        rx.lastIndex = 0;
        var A = [];
        var n = 0;
        var result;
        while ((result = regExpExec(rx, S)) !== null) {
          var matchStr = String(result[0]);
          A[n] = matchStr;
          if (matchStr === '') rx.lastIndex = advanceStringIndex(S, toLength(rx.lastIndex), fullUnicode);
          n++;
        }
        return n === 0 ? null : A;
      }
    ];
  });

  var isRegExp = require('./_is-regexp');
  var anObject$1 = require('./_an-object');
  var speciesConstructor = require('./_species-constructor');
  var advanceStringIndex$1 = require('./_advance-string-index');
  var toLength$1 = require('./_to-length');
  var callRegExpExec = require('./_regexp-exec-abstract');
  var regexpExec = require('./_regexp-exec');
  var fails = require('./_fails');
  var $min = Math.min;
  var $push = [].push;
  var $SPLIT = 'split';
  var LENGTH = 'length';
  var LAST_INDEX = 'lastIndex';
  var MAX_UINT32 = 0xffffffff;

  // babel-minify transpiles RegExp('x', 'y') -> /x/y and it causes SyntaxError
  var SUPPORTS_Y = !fails(function () { });

  // @@split logic
  require('./_fix-re-wks')('split', 2, function (defined, SPLIT, $split, maybeCallNative) {
    var internalSplit;
    if (
      'abbc'[$SPLIT](/(b)*/)[1] == 'c' ||
      'test'[$SPLIT](/(?:)/, -1)[LENGTH] != 4 ||
      'ab'[$SPLIT](/(?:ab)*/)[LENGTH] != 2 ||
      '.'[$SPLIT](/(.?)(.?)/)[LENGTH] != 4 ||
      '.'[$SPLIT](/()()/)[LENGTH] > 1 ||
      ''[$SPLIT](/.?/)[LENGTH]
    ) {
      // based on es5-shim implementation, need to rework it
      internalSplit = function (separator, limit) {
        var string = String(this);
        if (separator === undefined && limit === 0) return [];
        // If `separator` is not a regex, use native split
        if (!isRegExp(separator)) return $split.call(string, separator, limit);
        var output = [];
        var flags = (separator.ignoreCase ? 'i' : '') +
                    (separator.multiline ? 'm' : '') +
                    (separator.unicode ? 'u' : '') +
                    (separator.sticky ? 'y' : '');
        var lastLastIndex = 0;
        var splitLimit = limit === undefined ? MAX_UINT32 : limit >>> 0;
        // Make `global` and avoid `lastIndex` issues by working with a copy
        var separatorCopy = new RegExp(separator.source, flags + 'g');
        var match, lastIndex, lastLength;
        while (match = regexpExec.call(separatorCopy, string)) {
          lastIndex = separatorCopy[LAST_INDEX];
          if (lastIndex > lastLastIndex) {
            output.push(string.slice(lastLastIndex, match.index));
            if (match[LENGTH] > 1 && match.index < string[LENGTH]) $push.apply(output, match.slice(1));
            lastLength = match[0][LENGTH];
            lastLastIndex = lastIndex;
            if (output[LENGTH] >= splitLimit) break;
          }
          if (separatorCopy[LAST_INDEX] === match.index) separatorCopy[LAST_INDEX]++; // Avoid an infinite loop
        }
        if (lastLastIndex === string[LENGTH]) {
          if (lastLength || !separatorCopy.test('')) output.push('');
        } else output.push(string.slice(lastLastIndex));
        return output[LENGTH] > splitLimit ? output.slice(0, splitLimit) : output;
      };
    // Chakra, V8
    } else if ('0'[$SPLIT](undefined, 0)[LENGTH]) {
      internalSplit = function (separator, limit) {
        return separator === undefined && limit === 0 ? [] : $split.call(this, separator, limit);
      };
    } else {
      internalSplit = $split;
    }

    return [
      // `String.prototype.split` method
      // https://tc39.github.io/ecma262/#sec-string.prototype.split
      function split(separator, limit) {
        var O = defined(this);
        var splitter = separator == undefined ? undefined : separator[SPLIT];
        return splitter !== undefined
          ? splitter.call(separator, O, limit)
          : internalSplit.call(String(O), separator, limit);
      },
      // `RegExp.prototype[@@split]` method
      // https://tc39.github.io/ecma262/#sec-regexp.prototype-@@split
      //
      // NOTE: This cannot be properly polyfilled in engines that don't support
      // the 'y' flag.
      function (regexp, limit) {
        var res = maybeCallNative(internalSplit, regexp, this, limit, internalSplit !== $split);
        if (res.done) return res.value;

        var rx = anObject$1(regexp);
        var S = String(this);
        var C = speciesConstructor(rx, RegExp);

        var unicodeMatching = rx.unicode;
        var flags = (rx.ignoreCase ? 'i' : '') +
                    (rx.multiline ? 'm' : '') +
                    (rx.unicode ? 'u' : '') +
                    (SUPPORTS_Y ? 'y' : 'g');

        // ^(? + rx + ) is needed, in combination with some S slicing, to
        // simulate the 'y' flag.
        var splitter = new C(SUPPORTS_Y ? rx : '^(?:' + rx.source + ')', flags);
        var lim = limit === undefined ? MAX_UINT32 : limit >>> 0;
        if (lim === 0) return [];
        if (S.length === 0) return callRegExpExec(splitter, S) === null ? [S] : [];
        var p = 0;
        var q = 0;
        var A = [];
        while (q < S.length) {
          splitter.lastIndex = SUPPORTS_Y ? q : 0;
          var z = callRegExpExec(splitter, SUPPORTS_Y ? S : S.slice(q));
          var e;
          if (
            z === null ||
            (e = $min(toLength$1(splitter.lastIndex + (SUPPORTS_Y ? 0 : q)), S.length)) === p
          ) {
            q = advanceStringIndex$1(S, q, unicodeMatching);
          } else {
            A.push(S.slice(p, q));
            if (A.length === lim) return A;
            for (var i = 1; i <= z.length - 1; i++) {
              A.push(z[i]);
              if (A.length === lim) return A;
            }
            q = p = e;
          }
        }
        A.push(S.slice(p));
        return A;
      }
    ];
  });

  require('./_typed-array')('Uint8', 1, function (init) {
    return function Uint8Array(data, byteOffset, length) {
      return init(this, data, byteOffset, length);
    };
  });

  var $iterators = require('./es6.array.iterator');
  var getKeys = require('./_object-keys');
  var redefine = require('./_redefine');
  var global = require('./_global');
  var hide = require('./_hide');
  var Iterators = require('./_iterators');
  var wks = require('./_wks');
  var ITERATOR = wks('iterator');
  var TO_STRING_TAG = wks('toStringTag');
  var ArrayValues = Iterators.Array;

  var DOMIterables = {
    CSSRuleList: true, // TODO: Not spec compliant, should be false.
    CSSStyleDeclaration: false,
    CSSValueList: false,
    ClientRectList: false,
    DOMRectList: false,
    DOMStringList: false,
    DOMTokenList: true,
    DataTransferItemList: false,
    FileList: false,
    HTMLAllCollection: false,
    HTMLCollection: false,
    HTMLFormElement: false,
    HTMLSelectElement: false,
    MediaList: true, // TODO: Not spec compliant, should be false.
    MimeTypeArray: false,
    NamedNodeMap: false,
    NodeList: true,
    PaintRequestList: false,
    Plugin: false,
    PluginArray: false,
    SVGLengthList: false,
    SVGNumberList: false,
    SVGPathSegList: false,
    SVGPointList: false,
    SVGStringList: false,
    SVGTransformList: false,
    SourceBufferList: false,
    StyleSheetList: true, // TODO: Not spec compliant, should be false.
    TextTrackCueList: false,
    TextTrackList: false,
    TouchList: false
  };

  for (var collections = getKeys(DOMIterables), i = 0; i < collections.length; i++) {
    var NAME = collections[i];
    var explicit = DOMIterables[NAME];
    var Collection = global[NAME];
    var proto = Collection && Collection.prototype;
    var key;
    if (proto) {
      if (!proto[ITERATOR]) hide(proto, ITERATOR, ArrayValues);
      if (!proto[TO_STRING_TAG]) hide(proto, TO_STRING_TAG, NAME);
      Iterators[NAME] = ArrayValues;
      if (explicit) for (key in $iterators) if (!proto[key]) redefine(proto, key, $iterators[key], true);
    }
  }

  // 19.1.3.6 Object.prototype.toString()
  var classof = require('./_classof');
  var test = {};
  test[require('./_wks')('toStringTag')] = 'z';
  if (test + '' != '[object z]') {
    require('./_redefine')(Object.prototype, 'toString', function toString() {
      return '[object ' + classof(this) + ']';
    }, true);
  }

  /**
   * @license
   * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
   * This code may only be used under the BSD style license found at
   * http://polymer.github.io/LICENSE.txt
   * The complete set of authors may be found at
   * http://polymer.github.io/AUTHORS.txt
   * The complete set of contributors may be found at
   * http://polymer.github.io/CONTRIBUTORS.txt
   * Code distributed by Google as part of the polymer project is also
   * subject to an additional IP rights grant found at
   * http://polymer.github.io/PATENTS.txt
   */
  const directives = new WeakMap();
  const isDirective = (o) => {
      return typeof o === 'function' && directives.has(o);
  };

  /**
   * @license
   * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
   * This code may only be used under the BSD style license found at
   * http://polymer.github.io/LICENSE.txt
   * The complete set of authors may be found at
   * http://polymer.github.io/AUTHORS.txt
   * The complete set of contributors may be found at
   * http://polymer.github.io/CONTRIBUTORS.txt
   * Code distributed by Google as part of the polymer project is also
   * subject to an additional IP rights grant found at
   * http://polymer.github.io/PATENTS.txt
   */
  /**
   * True if the custom elements polyfill is in use.
   */
  const isCEPolyfill = window.customElements !== undefined &&
      window.customElements.polyfillWrapFlushCallback !==
          undefined;
  /**
   * Removes nodes, starting from `startNode` (inclusive) to `endNode`
   * (exclusive), from `container`.
   */
  const removeNodes = (container, startNode, endNode = null) => {
      let node = startNode;
      while (node !== endNode) {
          const n = node.nextSibling;
          container.removeChild(node);
          node = n;
      }
  };

  /**
   * @license
   * Copyright (c) 2018 The Polymer Project Authors. All rights reserved.
   * This code may only be used under the BSD style license found at
   * http://polymer.github.io/LICENSE.txt
   * The complete set of authors may be found at
   * http://polymer.github.io/AUTHORS.txt
   * The complete set of contributors may be found at
   * http://polymer.github.io/CONTRIBUTORS.txt
   * Code distributed by Google as part of the polymer project is also
   * subject to an additional IP rights grant found at
   * http://polymer.github.io/PATENTS.txt
   */
  /**
   * A sentinel value that signals that a value was handled by a directive and
   * should not be written to the DOM.
   */
  const noChange = {};
  /**
   * A sentinel value that signals a NodePart to fully clear its content.
   */
  const nothing = {};

  /**
   * @license
   * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
   * This code may only be used under the BSD style license found at
   * http://polymer.github.io/LICENSE.txt
   * The complete set of authors may be found at
   * http://polymer.github.io/AUTHORS.txt
   * The complete set of contributors may be found at
   * http://polymer.github.io/CONTRIBUTORS.txt
   * Code distributed by Google as part of the polymer project is also
   * subject to an additional IP rights grant found at
   * http://polymer.github.io/PATENTS.txt
   */
  /**
   * An expression marker with embedded unique key to avoid collision with
   * possible text in templates.
   */
  const marker = `{{lit-${String(Math.random()).slice(2)}}}`;
  /**
   * An expression marker used text-positions, multi-binding attributes, and
   * attributes with markup-like text values.
   */
  const nodeMarker = `<!--${marker}-->`;
  const markerRegex = new RegExp(`${marker}|${nodeMarker}`);
  /**
   * Suffix appended to all bound attribute names.
   */
  const boundAttributeSuffix = '$lit$';
  /**
   * An updateable Template that tracks the location of dynamic parts.
   */
  class Template {
      constructor(result, element) {
          this.parts = [];
          this.element = element;
          let index = -1;
          let partIndex = 0;
          const nodesToRemove = [];
          const _prepareTemplate = (template) => {
              const content = template.content;
              // Edge needs all 4 parameters present; IE11 needs 3rd parameter to be
              // null
              const walker = document.createTreeWalker(content, 133 /* NodeFilter.SHOW_{ELEMENT|COMMENT|TEXT} */, null, false);
              // Keeps track of the last index associated with a part. We try to delete
              // unnecessary nodes, but we never want to associate two different parts
              // to the same index. They must have a constant node between.
              let lastPartIndex = 0;
              while (walker.nextNode()) {
                  index++;
                  const node = walker.currentNode;
                  if (node.nodeType === 1 /* Node.ELEMENT_NODE */) {
                      if (node.hasAttributes()) {
                          const attributes = node.attributes;
                          // Per
                          // https://developer.mozilla.org/en-US/docs/Web/API/NamedNodeMap,
                          // attributes are not guaranteed to be returned in document order.
                          // In particular, Edge/IE can return them out of order, so we cannot
                          // assume a correspondance between part index and attribute index.
                          let count = 0;
                          for (let i = 0; i < attributes.length; i++) {
                              if (attributes[i].value.indexOf(marker) >= 0) {
                                  count++;
                              }
                          }
                          while (count-- > 0) {
                              // Get the template literal section leading up to the first
                              // expression in this attribute
                              const stringForPart = result.strings[partIndex];
                              // Find the attribute name
                              const name = lastAttributeNameRegex.exec(stringForPart)[2];
                              // Find the corresponding attribute
                              // All bound attributes have had a suffix added in
                              // TemplateResult#getHTML to opt out of special attribute
                              // handling. To look up the attribute value we also need to add
                              // the suffix.
                              const attributeLookupName = name.toLowerCase() + boundAttributeSuffix;
                              const attributeValue = node.getAttribute(attributeLookupName);
                              const strings = attributeValue.split(markerRegex);
                              this.parts.push({ type: 'attribute', index, name, strings });
                              node.removeAttribute(attributeLookupName);
                              partIndex += strings.length - 1;
                          }
                      }
                      if (node.tagName === 'TEMPLATE') {
                          _prepareTemplate(node);
                      }
                  }
                  else if (node.nodeType === 3 /* Node.TEXT_NODE */) {
                      const data = node.data;
                      if (data.indexOf(marker) >= 0) {
                          const parent = node.parentNode;
                          const strings = data.split(markerRegex);
                          const lastIndex = strings.length - 1;
                          // Generate a new text node for each literal section
                          // These nodes are also used as the markers for node parts
                          for (let i = 0; i < lastIndex; i++) {
                              parent.insertBefore((strings[i] === '') ? createMarker() :
                                  document.createTextNode(strings[i]), node);
                              this.parts.push({ type: 'node', index: ++index });
                          }
                          // If there's no text, we must insert a comment to mark our place.
                          // Else, we can trust it will stick around after cloning.
                          if (strings[lastIndex] === '') {
                              parent.insertBefore(createMarker(), node);
                              nodesToRemove.push(node);
                          }
                          else {
                              node.data = strings[lastIndex];
                          }
                          // We have a part for each match found
                          partIndex += lastIndex;
                      }
                  }
                  else if (node.nodeType === 8 /* Node.COMMENT_NODE */) {
                      if (node.data === marker) {
                          const parent = node.parentNode;
                          // Add a new marker node to be the startNode of the Part if any of
                          // the following are true:
                          //  * We don't have a previousSibling
                          //  * The previousSibling is already the start of a previous part
                          if (node.previousSibling === null || index === lastPartIndex) {
                              index++;
                              parent.insertBefore(createMarker(), node);
                          }
                          lastPartIndex = index;
                          this.parts.push({ type: 'node', index });
                          // If we don't have a nextSibling, keep this node so we have an end.
                          // Else, we can remove it to save future costs.
                          if (node.nextSibling === null) {
                              node.data = '';
                          }
                          else {
                              nodesToRemove.push(node);
                              index--;
                          }
                          partIndex++;
                      }
                      else {
                          let i = -1;
                          while ((i = node.data.indexOf(marker, i + 1)) !==
                              -1) {
                              // Comment node has a binding marker inside, make an inactive part
                              // The binding won't work, but subsequent bindings will
                              // TODO (justinfagnani): consider whether it's even worth it to
                              // make bindings in comments work
                              this.parts.push({ type: 'node', index: -1 });
                          }
                      }
                  }
              }
          };
          _prepareTemplate(element);
          // Remove text binding nodes after the walk to not disturb the TreeWalker
          for (const n of nodesToRemove) {
              n.parentNode.removeChild(n);
          }
      }
  }
  const isTemplatePartActive = (part) => part.index !== -1;
  // Allows `document.createComment('')` to be renamed for a
  // small manual size-savings.
  const createMarker = () => document.createComment('');
  /**
   * This regex extracts the attribute name preceding an attribute-position
   * expression. It does this by matching the syntax allowed for attributes
   * against the string literal directly preceding the expression, assuming that
   * the expression is in an attribute-value position.
   *
   * See attributes in the HTML spec:
   * https://www.w3.org/TR/html5/syntax.html#attributes-0
   *
   * "\0-\x1F\x7F-\x9F" are Unicode control characters
   *
   * " \x09\x0a\x0c\x0d" are HTML space characters:
   * https://www.w3.org/TR/html5/infrastructure.html#space-character
   *
   * So an attribute is:
   *  * The name: any character except a control character, space character, ('),
   *    ("), ">", "=", or "/"
   *  * Followed by zero or more space characters
   *  * Followed by "="
   *  * Followed by zero or more space characters
   *  * Followed by:
   *    * Any character except space, ('), ("), "<", ">", "=", (`), or
   *    * (") then any non-("), or
   *    * (') then any non-(')
   */
  const lastAttributeNameRegex = /([ \x09\x0a\x0c\x0d])([^\0-\x1F\x7F-\x9F \x09\x0a\x0c\x0d"'>=/]+)([ \x09\x0a\x0c\x0d]*=[ \x09\x0a\x0c\x0d]*(?:[^ \x09\x0a\x0c\x0d"'`<>=]*|"[^"]*|'[^']*))$/;

  /**
   * @license
   * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
   * This code may only be used under the BSD style license found at
   * http://polymer.github.io/LICENSE.txt
   * The complete set of authors may be found at
   * http://polymer.github.io/AUTHORS.txt
   * The complete set of contributors may be found at
   * http://polymer.github.io/CONTRIBUTORS.txt
   * Code distributed by Google as part of the polymer project is also
   * subject to an additional IP rights grant found at
   * http://polymer.github.io/PATENTS.txt
   */
  /**
   * An instance of a `Template` that can be attached to the DOM and updated
   * with new values.
   */
  class TemplateInstance {
      constructor(template, processor, options) {
          this._parts = [];
          this.template = template;
          this.processor = processor;
          this.options = options;
      }
      update(values) {
          let i = 0;
          for (const part of this._parts) {
              if (part !== undefined) {
                  part.setValue(values[i]);
              }
              i++;
          }
          for (const part of this._parts) {
              if (part !== undefined) {
                  part.commit();
              }
          }
      }
      _clone() {
          // When using the Custom Elements polyfill, clone the node, rather than
          // importing it, to keep the fragment in the template's document. This
          // leaves the fragment inert so custom elements won't upgrade and
          // potentially modify their contents by creating a polyfilled ShadowRoot
          // while we traverse the tree.
          const fragment = isCEPolyfill ?
              this.template.element.content.cloneNode(true) :
              document.importNode(this.template.element.content, true);
          const parts = this.template.parts;
          let partIndex = 0;
          let nodeIndex = 0;
          const _prepareInstance = (fragment) => {
              // Edge needs all 4 parameters present; IE11 needs 3rd parameter to be
              // null
              const walker = document.createTreeWalker(fragment, 133 /* NodeFilter.SHOW_{ELEMENT|COMMENT|TEXT} */, null, false);
              let node = walker.nextNode();
              // Loop through all the nodes and parts of a template
              while (partIndex < parts.length && node !== null) {
                  const part = parts[partIndex];
                  // Consecutive Parts may have the same node index, in the case of
                  // multiple bound attributes on an element. So each iteration we either
                  // increment the nodeIndex, if we aren't on a node with a part, or the
                  // partIndex if we are. By not incrementing the nodeIndex when we find a
                  // part, we allow for the next part to be associated with the current
                  // node if neccessasry.
                  if (!isTemplatePartActive(part)) {
                      this._parts.push(undefined);
                      partIndex++;
                  }
                  else if (nodeIndex === part.index) {
                      if (part.type === 'node') {
                          const part = this.processor.handleTextExpression(this.options);
                          part.insertAfterNode(node.previousSibling);
                          this._parts.push(part);
                      }
                      else {
                          this._parts.push(...this.processor.handleAttributeExpressions(node, part.name, part.strings, this.options));
                      }
                      partIndex++;
                  }
                  else {
                      nodeIndex++;
                      if (node.nodeName === 'TEMPLATE') {
                          _prepareInstance(node.content);
                      }
                      node = walker.nextNode();
                  }
              }
          };
          _prepareInstance(fragment);
          if (isCEPolyfill) {
              document.adoptNode(fragment);
              customElements.upgrade(fragment);
          }
          return fragment;
      }
  }

  /**
   * @license
   * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
   * This code may only be used under the BSD style license found at
   * http://polymer.github.io/LICENSE.txt
   * The complete set of authors may be found at
   * http://polymer.github.io/AUTHORS.txt
   * The complete set of contributors may be found at
   * http://polymer.github.io/CONTRIBUTORS.txt
   * Code distributed by Google as part of the polymer project is also
   * subject to an additional IP rights grant found at
   * http://polymer.github.io/PATENTS.txt
   */
  /**
   * The return type of `html`, which holds a Template and the values from
   * interpolated expressions.
   */
  class TemplateResult {
      constructor(strings, values, type, processor) {
          this.strings = strings;
          this.values = values;
          this.type = type;
          this.processor = processor;
      }
      /**
       * Returns a string of HTML used to create a `<template>` element.
       */
      getHTML() {
          const endIndex = this.strings.length - 1;
          let html = '';
          for (let i = 0; i < endIndex; i++) {
              const s = this.strings[i];
              // This exec() call does two things:
              // 1) Appends a suffix to the bound attribute name to opt out of special
              // attribute value parsing that IE11 and Edge do, like for style and
              // many SVG attributes. The Template class also appends the same suffix
              // when looking up attributes to create Parts.
              // 2) Adds an unquoted-attribute-safe marker for the first expression in
              // an attribute. Subsequent attribute expressions will use node markers,
              // and this is safe since attributes with multiple expressions are
              // guaranteed to be quoted.
              const match = lastAttributeNameRegex.exec(s);
              if (match) {
                  // We're starting a new bound attribute.
                  // Add the safe attribute suffix, and use unquoted-attribute-safe
                  // marker.
                  html += s.substr(0, match.index) + match[1] + match[2] +
                      boundAttributeSuffix + match[3] + marker;
              }
              else {
                  // We're either in a bound node, or trailing bound attribute.
                  // Either way, nodeMarker is safe to use.
                  html += s + nodeMarker;
              }
          }
          return html + this.strings[endIndex];
      }
      getTemplateElement() {
          const template = document.createElement('template');
          template.innerHTML = this.getHTML();
          return template;
      }
  }

  /**
   * @license
   * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
   * This code may only be used under the BSD style license found at
   * http://polymer.github.io/LICENSE.txt
   * The complete set of authors may be found at
   * http://polymer.github.io/AUTHORS.txt
   * The complete set of contributors may be found at
   * http://polymer.github.io/CONTRIBUTORS.txt
   * Code distributed by Google as part of the polymer project is also
   * subject to an additional IP rights grant found at
   * http://polymer.github.io/PATENTS.txt
   */
  const isPrimitive = (value) => {
      return (value === null ||
          !(typeof value === 'object' || typeof value === 'function'));
  };
  /**
   * Sets attribute values for AttributeParts, so that the value is only set once
   * even if there are multiple parts for an attribute.
   */
  class AttributeCommitter {
      constructor(element, name, strings) {
          this.dirty = true;
          this.element = element;
          this.name = name;
          this.strings = strings;
          this.parts = [];
          for (let i = 0; i < strings.length - 1; i++) {
              this.parts[i] = this._createPart();
          }
      }
      /**
       * Creates a single part. Override this to create a differnt type of part.
       */
      _createPart() {
          return new AttributePart(this);
      }
      _getValue() {
          const strings = this.strings;
          const l = strings.length - 1;
          let text = '';
          for (let i = 0; i < l; i++) {
              text += strings[i];
              const part = this.parts[i];
              if (part !== undefined) {
                  const v = part.value;
                  if (v != null &&
                      (Array.isArray(v) ||
                          // tslint:disable-next-line:no-any
                          typeof v !== 'string' && v[Symbol.iterator])) {
                      for (const t of v) {
                          text += typeof t === 'string' ? t : String(t);
                      }
                  }
                  else {
                      text += typeof v === 'string' ? v : String(v);
                  }
              }
          }
          text += strings[l];
          return text;
      }
      commit() {
          if (this.dirty) {
              this.dirty = false;
              this.element.setAttribute(this.name, this._getValue());
          }
      }
  }
  class AttributePart {
      constructor(comitter) {
          this.value = undefined;
          this.committer = comitter;
      }
      setValue(value) {
          if (value !== noChange && (!isPrimitive(value) || value !== this.value)) {
              this.value = value;
              // If the value is a not a directive, dirty the committer so that it'll
              // call setAttribute. If the value is a directive, it'll dirty the
              // committer if it calls setValue().
              if (!isDirective(value)) {
                  this.committer.dirty = true;
              }
          }
      }
      commit() {
          while (isDirective(this.value)) {
              const directive = this.value;
              this.value = noChange;
              directive(this);
          }
          if (this.value === noChange) {
              return;
          }
          this.committer.commit();
      }
  }
  class NodePart {
      constructor(options) {
          this.value = undefined;
          this._pendingValue = undefined;
          this.options = options;
      }
      /**
       * Inserts this part into a container.
       *
       * This part must be empty, as its contents are not automatically moved.
       */
      appendInto(container) {
          this.startNode = container.appendChild(createMarker());
          this.endNode = container.appendChild(createMarker());
      }
      /**
       * Inserts this part between `ref` and `ref`'s next sibling. Both `ref` and
       * its next sibling must be static, unchanging nodes such as those that appear
       * in a literal section of a template.
       *
       * This part must be empty, as its contents are not automatically moved.
       */
      insertAfterNode(ref) {
          this.startNode = ref;
          this.endNode = ref.nextSibling;
      }
      /**
       * Appends this part into a parent part.
       *
       * This part must be empty, as its contents are not automatically moved.
       */
      appendIntoPart(part) {
          part._insert(this.startNode = createMarker());
          part._insert(this.endNode = createMarker());
      }
      /**
       * Appends this part after `ref`
       *
       * This part must be empty, as its contents are not automatically moved.
       */
      insertAfterPart(ref) {
          ref._insert(this.startNode = createMarker());
          this.endNode = ref.endNode;
          ref.endNode = this.startNode;
      }
      setValue(value) {
          this._pendingValue = value;
      }
      commit() {
          while (isDirective(this._pendingValue)) {
              const directive = this._pendingValue;
              this._pendingValue = noChange;
              directive(this);
          }
          const value = this._pendingValue;
          if (value === noChange) {
              return;
          }
          if (isPrimitive(value)) {
              if (value !== this.value) {
                  this._commitText(value);
              }
          }
          else if (value instanceof TemplateResult) {
              this._commitTemplateResult(value);
          }
          else if (value instanceof Node) {
              this._commitNode(value);
          }
          else if (Array.isArray(value) ||
              // tslint:disable-next-line:no-any
              value[Symbol.iterator]) {
              this._commitIterable(value);
          }
          else if (value === nothing) {
              this.value = nothing;
              this.clear();
          }
          else {
              // Fallback, will render the string representation
              this._commitText(value);
          }
      }
      _insert(node) {
          this.endNode.parentNode.insertBefore(node, this.endNode);
      }
      _commitNode(value) {
          if (this.value === value) {
              return;
          }
          this.clear();
          this._insert(value);
          this.value = value;
      }
      _commitText(value) {
          const node = this.startNode.nextSibling;
          value = value == null ? '' : value;
          if (node === this.endNode.previousSibling &&
              node.nodeType === 3 /* Node.TEXT_NODE */) {
              // If we only have a single text node between the markers, we can just
              // set its value, rather than replacing it.
              // TODO(justinfagnani): Can we just check if this.value is primitive?
              node.data = value;
          }
          else {
              this._commitNode(document.createTextNode(typeof value === 'string' ? value : String(value)));
          }
          this.value = value;
      }
      _commitTemplateResult(value) {
          const template = this.options.templateFactory(value);
          if (this.value instanceof TemplateInstance &&
              this.value.template === template) {
              this.value.update(value.values);
          }
          else {
              // Make sure we propagate the template processor from the TemplateResult
              // so that we use its syntax extension, etc. The template factory comes
              // from the render function options so that it can control template
              // caching and preprocessing.
              const instance = new TemplateInstance(template, value.processor, this.options);
              const fragment = instance._clone();
              instance.update(value.values);
              this._commitNode(fragment);
              this.value = instance;
          }
      }
      _commitIterable(value) {
          // For an Iterable, we create a new InstancePart per item, then set its
          // value to the item. This is a little bit of overhead for every item in
          // an Iterable, but it lets us recurse easily and efficiently update Arrays
          // of TemplateResults that will be commonly returned from expressions like:
          // array.map((i) => html`${i}`), by reusing existing TemplateInstances.
          // If _value is an array, then the previous render was of an
          // iterable and _value will contain the NodeParts from the previous
          // render. If _value is not an array, clear this part and make a new
          // array for NodeParts.
          if (!Array.isArray(this.value)) {
              this.value = [];
              this.clear();
          }
          // Lets us keep track of how many items we stamped so we can clear leftover
          // items from a previous render
          const itemParts = this.value;
          let partIndex = 0;
          let itemPart;
          for (const item of value) {
              // Try to reuse an existing part
              itemPart = itemParts[partIndex];
              // If no existing part, create a new one
              if (itemPart === undefined) {
                  itemPart = new NodePart(this.options);
                  itemParts.push(itemPart);
                  if (partIndex === 0) {
                      itemPart.appendIntoPart(this);
                  }
                  else {
                      itemPart.insertAfterPart(itemParts[partIndex - 1]);
                  }
              }
              itemPart.setValue(item);
              itemPart.commit();
              partIndex++;
          }
          if (partIndex < itemParts.length) {
              // Truncate the parts array so _value reflects the current state
              itemParts.length = partIndex;
              this.clear(itemPart && itemPart.endNode);
          }
      }
      clear(startNode = this.startNode) {
          removeNodes(this.startNode.parentNode, startNode.nextSibling, this.endNode);
      }
  }
  /**
   * Implements a boolean attribute, roughly as defined in the HTML
   * specification.
   *
   * If the value is truthy, then the attribute is present with a value of
   * ''. If the value is falsey, the attribute is removed.
   */
  class BooleanAttributePart {
      constructor(element, name, strings) {
          this.value = undefined;
          this._pendingValue = undefined;
          if (strings.length !== 2 || strings[0] !== '' || strings[1] !== '') {
              throw new Error('Boolean attributes can only contain a single expression');
          }
          this.element = element;
          this.name = name;
          this.strings = strings;
      }
      setValue(value) {
          this._pendingValue = value;
      }
      commit() {
          while (isDirective(this._pendingValue)) {
              const directive = this._pendingValue;
              this._pendingValue = noChange;
              directive(this);
          }
          if (this._pendingValue === noChange) {
              return;
          }
          const value = !!this._pendingValue;
          if (this.value !== value) {
              if (value) {
                  this.element.setAttribute(this.name, '');
              }
              else {
                  this.element.removeAttribute(this.name);
              }
          }
          this.value = value;
          this._pendingValue = noChange;
      }
  }
  /**
   * Sets attribute values for PropertyParts, so that the value is only set once
   * even if there are multiple parts for a property.
   *
   * If an expression controls the whole property value, then the value is simply
   * assigned to the property under control. If there are string literals or
   * multiple expressions, then the strings are expressions are interpolated into
   * a string first.
   */
  class PropertyCommitter extends AttributeCommitter {
      constructor(element, name, strings) {
          super(element, name, strings);
          this.single =
              (strings.length === 2 && strings[0] === '' && strings[1] === '');
      }
      _createPart() {
          return new PropertyPart(this);
      }
      _getValue() {
          if (this.single) {
              return this.parts[0].value;
          }
          return super._getValue();
      }
      commit() {
          if (this.dirty) {
              this.dirty = false;
              // tslint:disable-next-line:no-any
              this.element[this.name] = this._getValue();
          }
      }
  }
  class PropertyPart extends AttributePart {
  }
  // Detect event listener options support. If the `capture` property is read
  // from the options object, then options are supported. If not, then the thrid
  // argument to add/removeEventListener is interpreted as the boolean capture
  // value so we should only pass the `capture` property.
  let eventOptionsSupported = false;
  try {
      const options = {
          get capture() {
              eventOptionsSupported = true;
              return false;
          }
      };
      // tslint:disable-next-line:no-any
      window.addEventListener('test', options, options);
      // tslint:disable-next-line:no-any
      window.removeEventListener('test', options, options);
  }
  catch (_e) {
  }
  class EventPart {
      constructor(element, eventName, eventContext) {
          this.value = undefined;
          this._pendingValue = undefined;
          this.element = element;
          this.eventName = eventName;
          this.eventContext = eventContext;
          this._boundHandleEvent = (e) => this.handleEvent(e);
      }
      setValue(value) {
          this._pendingValue = value;
      }
      commit() {
          while (isDirective(this._pendingValue)) {
              const directive = this._pendingValue;
              this._pendingValue = noChange;
              directive(this);
          }
          if (this._pendingValue === noChange) {
              return;
          }
          const newListener = this._pendingValue;
          const oldListener = this.value;
          const shouldRemoveListener = newListener == null ||
              oldListener != null &&
                  (newListener.capture !== oldListener.capture ||
                      newListener.once !== oldListener.once ||
                      newListener.passive !== oldListener.passive);
          const shouldAddListener = newListener != null && (oldListener == null || shouldRemoveListener);
          if (shouldRemoveListener) {
              this.element.removeEventListener(this.eventName, this._boundHandleEvent, this._options);
          }
          if (shouldAddListener) {
              this._options = getOptions(newListener);
              this.element.addEventListener(this.eventName, this._boundHandleEvent, this._options);
          }
          this.value = newListener;
          this._pendingValue = noChange;
      }
      handleEvent(event) {
          if (typeof this.value === 'function') {
              this.value.call(this.eventContext || this.element, event);
          }
          else {
              this.value.handleEvent(event);
          }
      }
  }
  // We copy options because of the inconsistent behavior of browsers when reading
  // the third argument of add/removeEventListener. IE11 doesn't support options
  // at all. Chrome 41 only reads `capture` if the argument is an object.
  const getOptions = (o) => o &&
      (eventOptionsSupported ?
          { capture: o.capture, passive: o.passive, once: o.once } :
          o.capture);

  /**
   * @license
   * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
   * This code may only be used under the BSD style license found at
   * http://polymer.github.io/LICENSE.txt
   * The complete set of authors may be found at
   * http://polymer.github.io/AUTHORS.txt
   * The complete set of contributors may be found at
   * http://polymer.github.io/CONTRIBUTORS.txt
   * Code distributed by Google as part of the polymer project is also
   * subject to an additional IP rights grant found at
   * http://polymer.github.io/PATENTS.txt
   */
  /**
   * Creates Parts when a template is instantiated.
   */
  class DefaultTemplateProcessor {
      /**
       * Create parts for an attribute-position binding, given the event, attribute
       * name, and string literals.
       *
       * @param element The element containing the binding
       * @param name  The attribute name
       * @param strings The string literals. There are always at least two strings,
       *   event for fully-controlled bindings with a single expression.
       */
      handleAttributeExpressions(element, name, strings, options) {
          const prefix = name[0];
          if (prefix === '.') {
              const comitter = new PropertyCommitter(element, name.slice(1), strings);
              return comitter.parts;
          }
          if (prefix === '@') {
              return [new EventPart(element, name.slice(1), options.eventContext)];
          }
          if (prefix === '?') {
              return [new BooleanAttributePart(element, name.slice(1), strings)];
          }
          const comitter = new AttributeCommitter(element, name, strings);
          return comitter.parts;
      }
      /**
       * Create parts for a text-position binding.
       * @param templateFactory
       */
      handleTextExpression(options) {
          return new NodePart(options);
      }
  }
  const defaultTemplateProcessor = new DefaultTemplateProcessor();

  /**
   * @license
   * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
   * This code may only be used under the BSD style license found at
   * http://polymer.github.io/LICENSE.txt
   * The complete set of authors may be found at
   * http://polymer.github.io/AUTHORS.txt
   * The complete set of contributors may be found at
   * http://polymer.github.io/CONTRIBUTORS.txt
   * Code distributed by Google as part of the polymer project is also
   * subject to an additional IP rights grant found at
   * http://polymer.github.io/PATENTS.txt
   */
  /**
   * The default TemplateFactory which caches Templates keyed on
   * result.type and result.strings.
   */
  function templateFactory(result) {
      let templateCache = templateCaches.get(result.type);
      if (templateCache === undefined) {
          templateCache = {
              stringsArray: new WeakMap(),
              keyString: new Map()
          };
          templateCaches.set(result.type, templateCache);
      }
      let template = templateCache.stringsArray.get(result.strings);
      if (template !== undefined) {
          return template;
      }
      // If the TemplateStringsArray is new, generate a key from the strings
      // This key is shared between all templates with identical content
      const key = result.strings.join(marker);
      // Check if we already have a Template for this key
      template = templateCache.keyString.get(key);
      if (template === undefined) {
          // If we have not seen this key before, create a new Template
          template = new Template(result, result.getTemplateElement());
          // Cache the Template for this key
          templateCache.keyString.set(key, template);
      }
      // Cache all future queries for this TemplateStringsArray
      templateCache.stringsArray.set(result.strings, template);
      return template;
  }
  const templateCaches = new Map();

  /**
   * @license
   * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
   * This code may only be used under the BSD style license found at
   * http://polymer.github.io/LICENSE.txt
   * The complete set of authors may be found at
   * http://polymer.github.io/AUTHORS.txt
   * The complete set of contributors may be found at
   * http://polymer.github.io/CONTRIBUTORS.txt
   * Code distributed by Google as part of the polymer project is also
   * subject to an additional IP rights grant found at
   * http://polymer.github.io/PATENTS.txt
   */
  const parts = new WeakMap();
  /**
   * Renders a template to a container.
   *
   * To update a container with new values, reevaluate the template literal and
   * call `render` with the new result.
   *
   * @param result a TemplateResult created by evaluating a template tag like
   *     `html` or `svg`.
   * @param container A DOM parent to render to. The entire contents are either
   *     replaced, or efficiently updated if the same result type was previous
   *     rendered there.
   * @param options RenderOptions for the entire render tree rendered to this
   *     container. Render options must *not* change between renders to the same
   *     container, as those changes will not effect previously rendered DOM.
   */
  const render = (result, container, options) => {
      let part = parts.get(container);
      if (part === undefined) {
          removeNodes(container, container.firstChild);
          parts.set(container, part = new NodePart(Object.assign({ templateFactory }, options)));
          part.appendInto(container);
      }
      part.setValue(result);
      part.commit();
  };

  /**
   * @license
   * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
   * This code may only be used under the BSD style license found at
   * http://polymer.github.io/LICENSE.txt
   * The complete set of authors may be found at
   * http://polymer.github.io/AUTHORS.txt
   * The complete set of contributors may be found at
   * http://polymer.github.io/CONTRIBUTORS.txt
   * Code distributed by Google as part of the polymer project is also
   * subject to an additional IP rights grant found at
   * http://polymer.github.io/PATENTS.txt
   */
  // IMPORTANT: do not change the property name or the assignment expression.
  // This line will be used in regexes to search for lit-html usage.
  // TODO(justinfagnani): inject version number at build time
  (window['litHtmlVersions'] || (window['litHtmlVersions'] = [])).push('1.0.0');
  /**
   * Interprets a template literal as an HTML template that can efficiently
   * render to and update a container.
   */
  const html = (strings, ...values) => new TemplateResult(strings, values, 'html', defaultTemplateProcessor);

  /**
   * @license
   * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
   * This code may only be used under the BSD style license found at
   * http://polymer.github.io/LICENSE.txt
   * The complete set of authors may be found at
   * http://polymer.github.io/AUTHORS.txt
   * The complete set of contributors may be found at
   * http://polymer.github.io/CONTRIBUTORS.txt
   * Code distributed by Google as part of the polymer project is also
   * subject to an additional IP rights grant found at
   * http://polymer.github.io/PATENTS.txt
   */
  const walkerNodeFilter = 133 /* NodeFilter.SHOW_{ELEMENT|COMMENT|TEXT} */;
  /**
   * Removes the list of nodes from a Template safely. In addition to removing
   * nodes from the Template, the Template part indices are updated to match
   * the mutated Template DOM.
   *
   * As the template is walked the removal state is tracked and
   * part indices are adjusted as needed.
   *
   * div
   *   div#1 (remove) <-- start removing (removing node is div#1)
   *     div
   *       div#2 (remove)  <-- continue removing (removing node is still div#1)
   *         div
   * div <-- stop removing since previous sibling is the removing node (div#1,
   * removed 4 nodes)
   */
  function removeNodesFromTemplate(template, nodesToRemove) {
      const { element: { content }, parts } = template;
      const walker = document.createTreeWalker(content, walkerNodeFilter, null, false);
      let partIndex = nextActiveIndexInTemplateParts(parts);
      let part = parts[partIndex];
      let nodeIndex = -1;
      let removeCount = 0;
      const nodesToRemoveInTemplate = [];
      let currentRemovingNode = null;
      while (walker.nextNode()) {
          nodeIndex++;
          const node = walker.currentNode;
          // End removal if stepped past the removing node
          if (node.previousSibling === currentRemovingNode) {
              currentRemovingNode = null;
          }
          // A node to remove was found in the template
          if (nodesToRemove.has(node)) {
              nodesToRemoveInTemplate.push(node);
              // Track node we're removing
              if (currentRemovingNode === null) {
                  currentRemovingNode = node;
              }
          }
          // When removing, increment count by which to adjust subsequent part indices
          if (currentRemovingNode !== null) {
              removeCount++;
          }
          while (part !== undefined && part.index === nodeIndex) {
              // If part is in a removed node deactivate it by setting index to -1 or
              // adjust the index as needed.
              part.index = currentRemovingNode !== null ? -1 : part.index - removeCount;
              // go to the next active part.
              partIndex = nextActiveIndexInTemplateParts(parts, partIndex);
              part = parts[partIndex];
          }
      }
      nodesToRemoveInTemplate.forEach((n) => n.parentNode.removeChild(n));
  }
  const countNodes = (node) => {
      let count = (node.nodeType === 11 /* Node.DOCUMENT_FRAGMENT_NODE */) ? 0 : 1;
      const walker = document.createTreeWalker(node, walkerNodeFilter, null, false);
      while (walker.nextNode()) {
          count++;
      }
      return count;
  };
  const nextActiveIndexInTemplateParts = (parts, startIndex = -1) => {
      for (let i = startIndex + 1; i < parts.length; i++) {
          const part = parts[i];
          if (isTemplatePartActive(part)) {
              return i;
          }
      }
      return -1;
  };
  /**
   * Inserts the given node into the Template, optionally before the given
   * refNode. In addition to inserting the node into the Template, the Template
   * part indices are updated to match the mutated Template DOM.
   */
  function insertNodeIntoTemplate(template, node, refNode = null) {
      const { element: { content }, parts } = template;
      // If there's no refNode, then put node at end of template.
      // No part indices need to be shifted in this case.
      if (refNode === null || refNode === undefined) {
          content.appendChild(node);
          return;
      }
      const walker = document.createTreeWalker(content, walkerNodeFilter, null, false);
      let partIndex = nextActiveIndexInTemplateParts(parts);
      let insertCount = 0;
      let walkerIndex = -1;
      while (walker.nextNode()) {
          walkerIndex++;
          const walkerNode = walker.currentNode;
          if (walkerNode === refNode) {
              insertCount = countNodes(node);
              refNode.parentNode.insertBefore(node, refNode);
          }
          while (partIndex !== -1 && parts[partIndex].index === walkerIndex) {
              // If we've inserted the node, simply adjust all subsequent parts
              if (insertCount > 0) {
                  while (partIndex !== -1) {
                      parts[partIndex].index += insertCount;
                      partIndex = nextActiveIndexInTemplateParts(parts, partIndex);
                  }
                  return;
              }
              partIndex = nextActiveIndexInTemplateParts(parts, partIndex);
          }
      }
  }

  /**
   * @license
   * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
   * This code may only be used under the BSD style license found at
   * http://polymer.github.io/LICENSE.txt
   * The complete set of authors may be found at
   * http://polymer.github.io/AUTHORS.txt
   * The complete set of contributors may be found at
   * http://polymer.github.io/CONTRIBUTORS.txt
   * Code distributed by Google as part of the polymer project is also
   * subject to an additional IP rights grant found at
   * http://polymer.github.io/PATENTS.txt
   */
  // Get a key to lookup in `templateCaches`.
  const getTemplateCacheKey = (type, scopeName) => `${type}--${scopeName}`;
  let compatibleShadyCSSVersion = true;
  if (typeof window.ShadyCSS === 'undefined') {
      compatibleShadyCSSVersion = false;
  }
  else if (typeof window.ShadyCSS.prepareTemplateDom === 'undefined') {
      console.warn(`Incompatible ShadyCSS version detected.` +
          `Please update to at least @webcomponents/webcomponentsjs@2.0.2 and` +
          `@webcomponents/shadycss@1.3.1.`);
      compatibleShadyCSSVersion = false;
  }
  /**
   * Template factory which scopes template DOM using ShadyCSS.
   * @param scopeName {string}
   */
  const shadyTemplateFactory = (scopeName) => (result) => {
      const cacheKey = getTemplateCacheKey(result.type, scopeName);
      let templateCache = templateCaches.get(cacheKey);
      if (templateCache === undefined) {
          templateCache = {
              stringsArray: new WeakMap(),
              keyString: new Map()
          };
          templateCaches.set(cacheKey, templateCache);
      }
      let template = templateCache.stringsArray.get(result.strings);
      if (template !== undefined) {
          return template;
      }
      const key = result.strings.join(marker);
      template = templateCache.keyString.get(key);
      if (template === undefined) {
          const element = result.getTemplateElement();
          if (compatibleShadyCSSVersion) {
              window.ShadyCSS.prepareTemplateDom(element, scopeName);
          }
          template = new Template(result, element);
          templateCache.keyString.set(key, template);
      }
      templateCache.stringsArray.set(result.strings, template);
      return template;
  };
  const TEMPLATE_TYPES = ['html', 'svg'];
  /**
   * Removes all style elements from Templates for the given scopeName.
   */
  const removeStylesFromLitTemplates = (scopeName) => {
      TEMPLATE_TYPES.forEach((type) => {
          const templates = templateCaches.get(getTemplateCacheKey(type, scopeName));
          if (templates !== undefined) {
              templates.keyString.forEach((template) => {
                  const { element: { content } } = template;
                  // IE 11 doesn't support the iterable param Set constructor
                  const styles = new Set();
                  Array.from(content.querySelectorAll('style')).forEach((s) => {
                      styles.add(s);
                  });
                  removeNodesFromTemplate(template, styles);
              });
          }
      });
  };
  const shadyRenderSet = new Set();
  /**
   * For the given scope name, ensures that ShadyCSS style scoping is performed.
   * This is done just once per scope name so the fragment and template cannot
   * be modified.
   * (1) extracts styles from the rendered fragment and hands them to ShadyCSS
   * to be scoped and appended to the document
   * (2) removes style elements from all lit-html Templates for this scope name.
   *
   * Note, <style> elements can only be placed into templates for the
   * initial rendering of the scope. If <style> elements are included in templates
   * dynamically rendered to the scope (after the first scope render), they will
   * not be scoped and the <style> will be left in the template and rendered
   * output.
   */
  const prepareTemplateStyles = (renderedDOM, template, scopeName) => {
      shadyRenderSet.add(scopeName);
      // Move styles out of rendered DOM and store.
      const styles = renderedDOM.querySelectorAll('style');
      // If there are no styles, skip unnecessary work
      if (styles.length === 0) {
          // Ensure prepareTemplateStyles is called to support adding
          // styles via `prepareAdoptedCssText` since that requires that
          // `prepareTemplateStyles` is called.
          window.ShadyCSS.prepareTemplateStyles(template.element, scopeName);
          return;
      }
      const condensedStyle = document.createElement('style');
      // Collect styles into a single style. This helps us make sure ShadyCSS
      // manipulations will not prevent us from being able to fix up template
      // part indices.
      // NOTE: collecting styles is inefficient for browsers but ShadyCSS
      // currently does this anyway. When it does not, this should be changed.
      for (let i = 0; i < styles.length; i++) {
          const style = styles[i];
          style.parentNode.removeChild(style);
          condensedStyle.textContent += style.textContent;
      }
      // Remove styles from nested templates in this scope.
      removeStylesFromLitTemplates(scopeName);
      // And then put the condensed style into the "root" template passed in as
      // `template`.
      insertNodeIntoTemplate(template, condensedStyle, template.element.content.firstChild);
      // Note, it's important that ShadyCSS gets the template that `lit-html`
      // will actually render so that it can update the style inside when
      // needed (e.g. @apply native Shadow DOM case).
      window.ShadyCSS.prepareTemplateStyles(template.element, scopeName);
      if (window.ShadyCSS.nativeShadow) {
          // When in native Shadow DOM, re-add styling to rendered content using
          // the style ShadyCSS produced.
          const style = template.element.content.querySelector('style');
          renderedDOM.insertBefore(style.cloneNode(true), renderedDOM.firstChild);
      }
      else {
          // When not in native Shadow DOM, at this point ShadyCSS will have
          // removed the style from the lit template and parts will be broken as a
          // result. To fix this, we put back the style node ShadyCSS removed
          // and then tell lit to remove that node from the template.
          // NOTE, ShadyCSS creates its own style so we can safely add/remove
          // `condensedStyle` here.
          template.element.content.insertBefore(condensedStyle, template.element.content.firstChild);
          const removes = new Set();
          removes.add(condensedStyle);
          removeNodesFromTemplate(template, removes);
      }
  };
  /**
   * Extension to the standard `render` method which supports rendering
   * to ShadowRoots when the ShadyDOM (https://github.com/webcomponents/shadydom)
   * and ShadyCSS (https://github.com/webcomponents/shadycss) polyfills are used
   * or when the webcomponentsjs
   * (https://github.com/webcomponents/webcomponentsjs) polyfill is used.
   *
   * Adds a `scopeName` option which is used to scope element DOM and stylesheets
   * when native ShadowDOM is unavailable. The `scopeName` will be added to
   * the class attribute of all rendered DOM. In addition, any style elements will
   * be automatically re-written with this `scopeName` selector and moved out
   * of the rendered DOM and into the document `<head>`.
   *
   * It is common to use this render method in conjunction with a custom element
   * which renders a shadowRoot. When this is done, typically the element's
   * `localName` should be used as the `scopeName`.
   *
   * In addition to DOM scoping, ShadyCSS also supports a basic shim for css
   * custom properties (needed only on older browsers like IE11) and a shim for
   * a deprecated feature called `@apply` that supports applying a set of css
   * custom properties to a given location.
   *
   * Usage considerations:
   *
   * * Part values in `<style>` elements are only applied the first time a given
   * `scopeName` renders. Subsequent changes to parts in style elements will have
   * no effect. Because of this, parts in style elements should only be used for
   * values that will never change, for example parts that set scope-wide theme
   * values or parts which render shared style elements.
   *
   * * Note, due to a limitation of the ShadyDOM polyfill, rendering in a
   * custom element's `constructor` is not supported. Instead rendering should
   * either done asynchronously, for example at microtask timing (for example
   * `Promise.resolve()`), or be deferred until the first time the element's
   * `connectedCallback` runs.
   *
   * Usage considerations when using shimmed custom properties or `@apply`:
   *
   * * Whenever any dynamic changes are made which affect
   * css custom properties, `ShadyCSS.styleElement(element)` must be called
   * to update the element. There are two cases when this is needed:
   * (1) the element is connected to a new parent, (2) a class is added to the
   * element that causes it to match different custom properties.
   * To address the first case when rendering a custom element, `styleElement`
   * should be called in the element's `connectedCallback`.
   *
   * * Shimmed custom properties may only be defined either for an entire
   * shadowRoot (for example, in a `:host` rule) or via a rule that directly
   * matches an element with a shadowRoot. In other words, instead of flowing from
   * parent to child as do native css custom properties, shimmed custom properties
   * flow only from shadowRoots to nested shadowRoots.
   *
   * * When using `@apply` mixing css shorthand property names with
   * non-shorthand names (for example `border` and `border-width`) is not
   * supported.
   */
  const render$1 = (result, container, options) => {
      const scopeName = options.scopeName;
      const hasRendered = parts.has(container);
      const needsScoping = container instanceof ShadowRoot &&
          compatibleShadyCSSVersion && result instanceof TemplateResult;
      // Handle first render to a scope specially...
      const firstScopeRender = needsScoping && !shadyRenderSet.has(scopeName);
      // On first scope render, render into a fragment; this cannot be a single
      // fragment that is reused since nested renders can occur synchronously.
      const renderContainer = firstScopeRender ? document.createDocumentFragment() : container;
      render(result, renderContainer, Object.assign({ templateFactory: shadyTemplateFactory(scopeName) }, options));
      // When performing first scope render,
      // (1) We've rendered into a fragment so that there's a chance to
      // `prepareTemplateStyles` before sub-elements hit the DOM
      // (which might cause them to render based on a common pattern of
      // rendering in a custom element's `connectedCallback`);
      // (2) Scope the template with ShadyCSS one time only for this scope.
      // (3) Render the fragment into the container and make sure the
      // container knows its `part` is the one we just rendered. This ensures
      // DOM will be re-used on subsequent renders.
      if (firstScopeRender) {
          const part = parts.get(renderContainer);
          parts.delete(renderContainer);
          if (part.value instanceof TemplateInstance) {
              prepareTemplateStyles(renderContainer, part.value.template, scopeName);
          }
          removeNodes(container, container.firstChild);
          container.appendChild(renderContainer);
          parts.set(container, part);
      }
      // After elements have hit the DOM, update styling if this is the
      // initial render to this container.
      // This is needed whenever dynamic changes are made so it would be
      // safest to do every render; however, this would regress performance
      // so we leave it up to the user to call `ShadyCSSS.styleElement`
      // for dynamic changes.
      if (!hasRendered && needsScoping) {
          window.ShadyCSS.styleElement(container.host);
      }
  };

  /**
   * @license
   * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
   * This code may only be used under the BSD style license found at
   * http://polymer.github.io/LICENSE.txt
   * The complete set of authors may be found at
   * http://polymer.github.io/AUTHORS.txt
   * The complete set of contributors may be found at
   * http://polymer.github.io/CONTRIBUTORS.txt
   * Code distributed by Google as part of the polymer project is also
   * subject to an additional IP rights grant found at
   * http://polymer.github.io/PATENTS.txt
   */
  /**
   * When using Closure Compiler, JSCompiler_renameProperty(property, object) is
   * replaced at compile time by the munged name for object[property]. We cannot
   * alias this function, so we have to use a small shim that has the same
   * behavior when not compiling.
   */
  window.JSCompiler_renameProperty =
      (prop, _obj) => prop;
  const defaultConverter = {
      toAttribute(value, type) {
          switch (type) {
              case Boolean:
                  return value ? '' : null;
              case Object:
              case Array:
                  // if the value is `null` or `undefined` pass this through
                  // to allow removing/no change behavior.
                  return value == null ? value : JSON.stringify(value);
          }
          return value;
      },
      fromAttribute(value, type) {
          switch (type) {
              case Boolean:
                  return value !== null;
              case Number:
                  return value === null ? null : Number(value);
              case Object:
              case Array:
                  return JSON.parse(value);
          }
          return value;
      }
  };
  /**
   * Change function that returns true if `value` is different from `oldValue`.
   * This method is used as the default for a property's `hasChanged` function.
   */
  const notEqual = (value, old) => {
      // This ensures (old==NaN, value==NaN) always returns false
      return old !== value && (old === old || value === value);
  };
  const defaultPropertyDeclaration = {
      attribute: true,
      type: String,
      converter: defaultConverter,
      reflect: false,
      hasChanged: notEqual
  };
  const microtaskPromise = Promise.resolve(true);
  const STATE_HAS_UPDATED = 1;
  const STATE_UPDATE_REQUESTED = 1 << 2;
  const STATE_IS_REFLECTING_TO_ATTRIBUTE = 1 << 3;
  const STATE_IS_REFLECTING_TO_PROPERTY = 1 << 4;
  const STATE_HAS_CONNECTED = 1 << 5;
  /**
   * Base element class which manages element properties and attributes. When
   * properties change, the `update` method is asynchronously called. This method
   * should be supplied by subclassers to render updates as desired.
   */
  class UpdatingElement extends HTMLElement {
      constructor() {
          super();
          this._updateState = 0;
          this._instanceProperties = undefined;
          this._updatePromise = microtaskPromise;
          this._hasConnectedResolver = undefined;
          /**
           * Map with keys for any properties that have changed since the last
           * update cycle with previous values.
           */
          this._changedProperties = new Map();
          /**
           * Map with keys of properties that should be reflected when updated.
           */
          this._reflectingProperties = undefined;
          this.initialize();
      }
      /**
       * Returns a list of attributes corresponding to the registered properties.
       * @nocollapse
       */
      static get observedAttributes() {
          // note: piggy backing on this to ensure we're finalized.
          this.finalize();
          const attributes = [];
          // Use forEach so this works even if for/of loops are compiled to for loops
          // expecting arrays
          this._classProperties.forEach((v, p) => {
              const attr = this._attributeNameForProperty(p, v);
              if (attr !== undefined) {
                  this._attributeToPropertyMap.set(attr, p);
                  attributes.push(attr);
              }
          });
          return attributes;
      }
      /**
       * Ensures the private `_classProperties` property metadata is created.
       * In addition to `finalize` this is also called in `createProperty` to
       * ensure the `@property` decorator can add property metadata.
       */
      /** @nocollapse */
      static _ensureClassProperties() {
          // ensure private storage for property declarations.
          if (!this.hasOwnProperty(JSCompiler_renameProperty('_classProperties', this))) {
              this._classProperties = new Map();
              // NOTE: Workaround IE11 not supporting Map constructor argument.
              const superProperties = Object.getPrototypeOf(this)._classProperties;
              if (superProperties !== undefined) {
                  superProperties.forEach((v, k) => this._classProperties.set(k, v));
              }
          }
      }
      /**
       * Creates a property accessor on the element prototype if one does not exist.
       * The property setter calls the property's `hasChanged` property option
       * or uses a strict identity check to determine whether or not to request
       * an update.
       * @nocollapse
       */
      static createProperty(name, options = defaultPropertyDeclaration) {
          // Note, since this can be called by the `@property` decorator which
          // is called before `finalize`, we ensure storage exists for property
          // metadata.
          this._ensureClassProperties();
          this._classProperties.set(name, options);
          // Do not generate an accessor if the prototype already has one, since
          // it would be lost otherwise and that would never be the user's intention;
          // Instead, we expect users to call `requestUpdate` themselves from
          // user-defined accessors. Note that if the super has an accessor we will
          // still overwrite it
          if (options.noAccessor || this.prototype.hasOwnProperty(name)) {
              return;
          }
          const key = typeof name === 'symbol' ? Symbol() : `__${name}`;
          Object.defineProperty(this.prototype, name, {
              // tslint:disable-next-line:no-any no symbol in index
              get() {
                  return this[key];
              },
              set(value) {
                  // tslint:disable-next-line:no-any no symbol in index
                  const oldValue = this[name];
                  // tslint:disable-next-line:no-any no symbol in index
                  this[key] = value;
                  this._requestUpdate(name, oldValue);
              },
              configurable: true,
              enumerable: true
          });
      }
      /**
       * Creates property accessors for registered properties and ensures
       * any superclasses are also finalized.
       * @nocollapse
       */
      static finalize() {
          if (this.hasOwnProperty(JSCompiler_renameProperty('finalized', this)) &&
              this.finalized) {
              return;
          }
          // finalize any superclasses
          const superCtor = Object.getPrototypeOf(this);
          if (typeof superCtor.finalize === 'function') {
              superCtor.finalize();
          }
          this.finalized = true;
          this._ensureClassProperties();
          // initialize Map populated in observedAttributes
          this._attributeToPropertyMap = new Map();
          // make any properties
          // Note, only process "own" properties since this element will inherit
          // any properties defined on the superClass, and finalization ensures
          // the entire prototype chain is finalized.
          if (this.hasOwnProperty(JSCompiler_renameProperty('properties', this))) {
              const props = this.properties;
              // support symbols in properties (IE11 does not support this)
              const propKeys = [
                  ...Object.getOwnPropertyNames(props),
                  ...(typeof Object.getOwnPropertySymbols === 'function') ?
                      Object.getOwnPropertySymbols(props) :
                      []
              ];
              // This for/of is ok because propKeys is an array
              for (const p of propKeys) {
                  // note, use of `any` is due to TypeSript lack of support for symbol in
                  // index types
                  // tslint:disable-next-line:no-any no symbol in index
                  this.createProperty(p, props[p]);
              }
          }
      }
      /**
       * Returns the property name for the given attribute `name`.
       * @nocollapse
       */
      static _attributeNameForProperty(name, options) {
          const attribute = options.attribute;
          return attribute === false ?
              undefined :
              (typeof attribute === 'string' ?
                  attribute :
                  (typeof name === 'string' ? name.toLowerCase() : undefined));
      }
      /**
       * Returns true if a property should request an update.
       * Called when a property value is set and uses the `hasChanged`
       * option for the property if present or a strict identity check.
       * @nocollapse
       */
      static _valueHasChanged(value, old, hasChanged = notEqual) {
          return hasChanged(value, old);
      }
      /**
       * Returns the property value for the given attribute value.
       * Called via the `attributeChangedCallback` and uses the property's
       * `converter` or `converter.fromAttribute` property option.
       * @nocollapse
       */
      static _propertyValueFromAttribute(value, options) {
          const type = options.type;
          const converter = options.converter || defaultConverter;
          const fromAttribute = (typeof converter === 'function' ? converter : converter.fromAttribute);
          return fromAttribute ? fromAttribute(value, type) : value;
      }
      /**
       * Returns the attribute value for the given property value. If this
       * returns undefined, the property will *not* be reflected to an attribute.
       * If this returns null, the attribute will be removed, otherwise the
       * attribute will be set to the value.
       * This uses the property's `reflect` and `type.toAttribute` property options.
       * @nocollapse
       */
      static _propertyValueToAttribute(value, options) {
          if (options.reflect === undefined) {
              return;
          }
          const type = options.type;
          const converter = options.converter;
          const toAttribute = converter && converter.toAttribute ||
              defaultConverter.toAttribute;
          return toAttribute(value, type);
      }
      /**
       * Performs element initialization. By default captures any pre-set values for
       * registered properties.
       */
      initialize() {
          this._saveInstanceProperties();
          // ensures first update will be caught by an early access of `updateComplete`
          this._requestUpdate();
      }
      /**
       * Fixes any properties set on the instance before upgrade time.
       * Otherwise these would shadow the accessor and break these properties.
       * The properties are stored in a Map which is played back after the
       * constructor runs. Note, on very old versions of Safari (<=9) or Chrome
       * (<=41), properties created for native platform properties like (`id` or
       * `name`) may not have default values set in the element constructor. On
       * these browsers native properties appear on instances and therefore their
       * default value will overwrite any element default (e.g. if the element sets
       * this.id = 'id' in the constructor, the 'id' will become '' since this is
       * the native platform default).
       */
      _saveInstanceProperties() {
          // Use forEach so this works even if for/of loops are compiled to for loops
          // expecting arrays
          this.constructor
              ._classProperties.forEach((_v, p) => {
              if (this.hasOwnProperty(p)) {
                  const value = this[p];
                  delete this[p];
                  if (!this._instanceProperties) {
                      this._instanceProperties = new Map();
                  }
                  this._instanceProperties.set(p, value);
              }
          });
      }
      /**
       * Applies previously saved instance properties.
       */
      _applyInstanceProperties() {
          // Use forEach so this works even if for/of loops are compiled to for loops
          // expecting arrays
          // tslint:disable-next-line:no-any
          this._instanceProperties.forEach((v, p) => this[p] = v);
          this._instanceProperties = undefined;
      }
      connectedCallback() {
          this._updateState = this._updateState | STATE_HAS_CONNECTED;
          // Ensure first connection completes an update. Updates cannot complete before
          // connection and if one is pending connection the `_hasConnectionResolver`
          // will exist. If so, resolve it to complete the update, otherwise
          // requestUpdate.
          if (this._hasConnectedResolver) {
              this._hasConnectedResolver();
              this._hasConnectedResolver = undefined;
          }
      }
      /**
       * Allows for `super.disconnectedCallback()` in extensions while
       * reserving the possibility of making non-breaking feature additions
       * when disconnecting at some point in the future.
       */
      disconnectedCallback() {
      }
      /**
       * Synchronizes property values when attributes change.
       */
      attributeChangedCallback(name, old, value) {
          if (old !== value) {
              this._attributeToProperty(name, value);
          }
      }
      _propertyToAttribute(name, value, options = defaultPropertyDeclaration) {
          const ctor = this.constructor;
          const attr = ctor._attributeNameForProperty(name, options);
          if (attr !== undefined) {
              const attrValue = ctor._propertyValueToAttribute(value, options);
              // an undefined value does not change the attribute.
              if (attrValue === undefined) {
                  return;
              }
              // Track if the property is being reflected to avoid
              // setting the property again via `attributeChangedCallback`. Note:
              // 1. this takes advantage of the fact that the callback is synchronous.
              // 2. will behave incorrectly if multiple attributes are in the reaction
              // stack at time of calling. However, since we process attributes
              // in `update` this should not be possible (or an extreme corner case
              // that we'd like to discover).
              // mark state reflecting
              this._updateState = this._updateState | STATE_IS_REFLECTING_TO_ATTRIBUTE;
              if (attrValue == null) {
                  this.removeAttribute(attr);
              }
              else {
                  this.setAttribute(attr, attrValue);
              }
              // mark state not reflecting
              this._updateState = this._updateState & ~STATE_IS_REFLECTING_TO_ATTRIBUTE;
          }
      }
      _attributeToProperty(name, value) {
          // Use tracking info to avoid deserializing attribute value if it was
          // just set from a property setter.
          if (this._updateState & STATE_IS_REFLECTING_TO_ATTRIBUTE) {
              return;
          }
          const ctor = this.constructor;
          const propName = ctor._attributeToPropertyMap.get(name);
          if (propName !== undefined) {
              const options = ctor._classProperties.get(propName) || defaultPropertyDeclaration;
              // mark state reflecting
              this._updateState = this._updateState | STATE_IS_REFLECTING_TO_PROPERTY;
              this[propName] =
                  // tslint:disable-next-line:no-any
                  ctor._propertyValueFromAttribute(value, options);
              // mark state not reflecting
              this._updateState = this._updateState & ~STATE_IS_REFLECTING_TO_PROPERTY;
          }
      }
      /**
       * This private version of `requestUpdate` does not access or return the
       * `updateComplete` promise. This promise can be overridden and is therefore
       * not free to access.
       */
      _requestUpdate(name, oldValue) {
          let shouldRequestUpdate = true;
          // If we have a property key, perform property update steps.
          if (name !== undefined) {
              const ctor = this.constructor;
              const options = ctor._classProperties.get(name) || defaultPropertyDeclaration;
              if (ctor._valueHasChanged(this[name], oldValue, options.hasChanged)) {
                  if (!this._changedProperties.has(name)) {
                      this._changedProperties.set(name, oldValue);
                  }
                  // Add to reflecting properties set.
                  // Note, it's important that every change has a chance to add the
                  // property to `_reflectingProperties`. This ensures setting
                  // attribute + property reflects correctly.
                  if (options.reflect === true &&
                      !(this._updateState & STATE_IS_REFLECTING_TO_PROPERTY)) {
                      if (this._reflectingProperties === undefined) {
                          this._reflectingProperties = new Map();
                      }
                      this._reflectingProperties.set(name, options);
                  }
              }
              else {
                  // Abort the request if the property should not be considered changed.
                  shouldRequestUpdate = false;
              }
          }
          if (!this._hasRequestedUpdate && shouldRequestUpdate) {
              this._enqueueUpdate();
          }
      }
      /**
       * Requests an update which is processed asynchronously. This should
       * be called when an element should update based on some state not triggered
       * by setting a property. In this case, pass no arguments. It should also be
       * called when manually implementing a property setter. In this case, pass the
       * property `name` and `oldValue` to ensure that any configured property
       * options are honored. Returns the `updateComplete` Promise which is resolved
       * when the update completes.
       *
       * @param name {PropertyKey} (optional) name of requesting property
       * @param oldValue {any} (optional) old value of requesting property
       * @returns {Promise} A Promise that is resolved when the update completes.
       */
      requestUpdate(name, oldValue) {
          this._requestUpdate(name, oldValue);
          return this.updateComplete;
      }
      /**
       * Sets up the element to asynchronously update.
       */
      async _enqueueUpdate() {
          // Mark state updating...
          this._updateState = this._updateState | STATE_UPDATE_REQUESTED;
          let resolve;
          let reject;
          const previousUpdatePromise = this._updatePromise;
          this._updatePromise = new Promise((res, rej) => {
              resolve = res;
              reject = rej;
          });
          try {
              // Ensure any previous update has resolved before updating.
              // This `await` also ensures that property changes are batched.
              await previousUpdatePromise;
          }
          catch (e) {
              // Ignore any previous errors. We only care that the previous cycle is
              // done. Any error should have been handled in the previous update.
          }
          // Make sure the element has connected before updating.
          if (!this._hasConnected) {
              await new Promise((res) => this._hasConnectedResolver = res);
          }
          try {
              const result = this.performUpdate();
              // If `performUpdate` returns a Promise, we await it. This is done to
              // enable coordinating updates with a scheduler. Note, the result is
              // checked to avoid delaying an additional microtask unless we need to.
              if (result != null) {
                  await result;
              }
          }
          catch (e) {
              reject(e);
          }
          resolve(!this._hasRequestedUpdate);
      }
      get _hasConnected() {
          return (this._updateState & STATE_HAS_CONNECTED);
      }
      get _hasRequestedUpdate() {
          return (this._updateState & STATE_UPDATE_REQUESTED);
      }
      get hasUpdated() {
          return (this._updateState & STATE_HAS_UPDATED);
      }
      /**
       * Performs an element update. Note, if an exception is thrown during the
       * update, `firstUpdated` and `updated` will not be called.
       *
       * You can override this method to change the timing of updates. If this
       * method is overridden, `super.performUpdate()` must be called.
       *
       * For instance, to schedule updates to occur just before the next frame:
       *
       * ```
       * protected async performUpdate(): Promise<unknown> {
       *   await new Promise((resolve) => requestAnimationFrame(() => resolve()));
       *   super.performUpdate();
       * }
       * ```
       */
      performUpdate() {
          // Mixin instance properties once, if they exist.
          if (this._instanceProperties) {
              this._applyInstanceProperties();
          }
          let shouldUpdate = false;
          const changedProperties = this._changedProperties;
          try {
              shouldUpdate = this.shouldUpdate(changedProperties);
              if (shouldUpdate) {
                  this.update(changedProperties);
              }
          }
          catch (e) {
              // Prevent `firstUpdated` and `updated` from running when there's an
              // update exception.
              shouldUpdate = false;
              throw e;
          }
          finally {
              // Ensure element can accept additional updates after an exception.
              this._markUpdated();
          }
          if (shouldUpdate) {
              if (!(this._updateState & STATE_HAS_UPDATED)) {
                  this._updateState = this._updateState | STATE_HAS_UPDATED;
                  this.firstUpdated(changedProperties);
              }
              this.updated(changedProperties);
          }
      }
      _markUpdated() {
          this._changedProperties = new Map();
          this._updateState = this._updateState & ~STATE_UPDATE_REQUESTED;
      }
      /**
       * Returns a Promise that resolves when the element has completed updating.
       * The Promise value is a boolean that is `true` if the element completed the
       * update without triggering another update. The Promise result is `false` if
       * a property was set inside `updated()`. If the Promise is rejected, an
       * exception was thrown during the update. This getter can be implemented to
       * await additional state. For example, it is sometimes useful to await a
       * rendered element before fulfilling this Promise. To do this, first await
       * `super.updateComplete` then any subsequent state.
       *
       * @returns {Promise} The Promise returns a boolean that indicates if the
       * update resolved without triggering another update.
       */
      get updateComplete() {
          return this._updatePromise;
      }
      /**
       * Controls whether or not `update` should be called when the element requests
       * an update. By default, this method always returns `true`, but this can be
       * customized to control when to update.
       *
       * * @param _changedProperties Map of changed properties with old values
       */
      shouldUpdate(_changedProperties) {
          return true;
      }
      /**
       * Updates the element. This method reflects property values to attributes.
       * It can be overridden to render and keep updated element DOM.
       * Setting properties inside this method will *not* trigger
       * another update.
       *
       * * @param _changedProperties Map of changed properties with old values
       */
      update(_changedProperties) {
          if (this._reflectingProperties !== undefined &&
              this._reflectingProperties.size > 0) {
              // Use forEach so this works even if for/of loops are compiled to for
              // loops expecting arrays
              this._reflectingProperties.forEach((v, k) => this._propertyToAttribute(k, this[k], v));
              this._reflectingProperties = undefined;
          }
      }
      /**
       * Invoked whenever the element is updated. Implement to perform
       * post-updating tasks via DOM APIs, for example, focusing an element.
       *
       * Setting properties inside this method will trigger the element to update
       * again after this update cycle completes.
       *
       * * @param _changedProperties Map of changed properties with old values
       */
      updated(_changedProperties) {
      }
      /**
       * Invoked when the element is first updated. Implement to perform one time
       * work on the element after update.
       *
       * Setting properties inside this method will trigger the element to update
       * again after this update cycle completes.
       *
       * * @param _changedProperties Map of changed properties with old values
       */
      firstUpdated(_changedProperties) {
      }
  }
  /**
   * Marks class as having finished creating properties.
   */
  UpdatingElement.finalized = true;

  /**
   * @license
   * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
   * This code may only be used under the BSD style license found at
   * http://polymer.github.io/LICENSE.txt
   * The complete set of authors may be found at
   * http://polymer.github.io/AUTHORS.txt
   * The complete set of contributors may be found at
   * http://polymer.github.io/CONTRIBUTORS.txt
   * Code distributed by Google as part of the polymer project is also
   * subject to an additional IP rights grant found at
   * http://polymer.github.io/PATENTS.txt
   */

  /**
  @license
  Copyright (c) 2019 The Polymer Project Authors. All rights reserved.
  This code may only be used under the BSD style license found at
  http://polymer.github.io/LICENSE.txt The complete set of authors may be found at
  http://polymer.github.io/AUTHORS.txt The complete set of contributors may be
  found at http://polymer.github.io/CONTRIBUTORS.txt Code distributed by Google as
  part of the polymer project is also subject to an additional IP rights grant
  found at http://polymer.github.io/PATENTS.txt
  */
  const supportsAdoptingStyleSheets = ('adoptedStyleSheets' in Document.prototype) &&
      ('replace' in CSSStyleSheet.prototype);

  /**
   * @license
   * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
   * This code may only be used under the BSD style license found at
   * http://polymer.github.io/LICENSE.txt
   * The complete set of authors may be found at
   * http://polymer.github.io/AUTHORS.txt
   * The complete set of contributors may be found at
   * http://polymer.github.io/CONTRIBUTORS.txt
   * Code distributed by Google as part of the polymer project is also
   * subject to an additional IP rights grant found at
   * http://polymer.github.io/PATENTS.txt
   */
  // IMPORTANT: do not change the property name or the assignment expression.
  // This line will be used in regexes to search for LitElement usage.
  // TODO(justinfagnani): inject version number at build time
  (window['litElementVersions'] || (window['litElementVersions'] = []))
      .push('2.0.1');
  /**
   * Minimal implementation of Array.prototype.flat
   * @param arr the array to flatten
   * @param result the accumlated result
   */
  function arrayFlat(styles, result = []) {
      for (let i = 0, length = styles.length; i < length; i++) {
          const value = styles[i];
          if (Array.isArray(value)) {
              arrayFlat(value, result);
          }
          else {
              result.push(value);
          }
      }
      return result;
  }
  /** Deeply flattens styles array. Uses native flat if available. */
  const flattenStyles = (styles) => styles.flat ? styles.flat(Infinity) : arrayFlat(styles);
  class LitElement extends UpdatingElement {
      /** @nocollapse */
      static finalize() {
          super.finalize();
          // Prepare styling that is stamped at first render time. Styling
          // is built from user provided `styles` or is inherited from the superclass.
          this._styles =
              this.hasOwnProperty(JSCompiler_renameProperty('styles', this)) ?
                  this._getUniqueStyles() :
                  this._styles || [];
      }
      /** @nocollapse */
      static _getUniqueStyles() {
          // Take care not to call `this.styles` multiple times since this generates
          // new CSSResults each time.
          // TODO(sorvell): Since we do not cache CSSResults by input, any
          // shared styles will generate new stylesheet objects, which is wasteful.
          // This should be addressed when a browser ships constructable
          // stylesheets.
          const userStyles = this.styles;
          const styles = [];
          if (Array.isArray(userStyles)) {
              const flatStyles = flattenStyles(userStyles);
              // As a performance optimization to avoid duplicated styling that can
              // occur especially when composing via subclassing, de-duplicate styles
              // preserving the last item in the list. The last item is kept to
              // try to preserve cascade order with the assumption that it's most
              // important that last added styles override previous styles.
              const styleSet = flatStyles.reduceRight((set, s) => {
                  set.add(s);
                  // on IE set.add does not return the set.
                  return set;
              }, new Set());
              // Array.from does not work on Set in IE
              styleSet.forEach((v) => styles.unshift(v));
          }
          else if (userStyles) {
              styles.push(userStyles);
          }
          return styles;
      }
      /**
       * Performs element initialization. By default this calls `createRenderRoot`
       * to create the element `renderRoot` node and captures any pre-set values for
       * registered properties.
       */
      initialize() {
          super.initialize();
          this.renderRoot =
              this.createRenderRoot();
          // Note, if renderRoot is not a shadowRoot, styles would/could apply to the
          // element's getRootNode(). While this could be done, we're choosing not to
          // support this now since it would require different logic around de-duping.
          if (window.ShadowRoot && this.renderRoot instanceof window.ShadowRoot) {
              this.adoptStyles();
          }
      }
      /**
       * Returns the node into which the element should render and by default
       * creates and returns an open shadowRoot. Implement to customize where the
       * element's DOM is rendered. For example, to render into the element's
       * childNodes, return `this`.
       * @returns {Element|DocumentFragment} Returns a node into which to render.
       */
      createRenderRoot() {
          return this.attachShadow({ mode: 'open' });
      }
      /**
       * Applies styling to the element shadowRoot using the `static get styles`
       * property. Styling will apply using `shadowRoot.adoptedStyleSheets` where
       * available and will fallback otherwise. When Shadow DOM is polyfilled,
       * ShadyCSS scopes styles and adds them to the document. When Shadow DOM
       * is available but `adoptedStyleSheets` is not, styles are appended to the
       * end of the `shadowRoot` to [mimic spec
       * behavior](https://wicg.github.io/construct-stylesheets/#using-constructed-stylesheets).
       */
      adoptStyles() {
          const styles = this.constructor._styles;
          if (styles.length === 0) {
              return;
          }
          // There are three separate cases here based on Shadow DOM support.
          // (1) shadowRoot polyfilled: use ShadyCSS
          // (2) shadowRoot.adoptedStyleSheets available: use it.
          // (3) shadowRoot.adoptedStyleSheets polyfilled: append styles after
          // rendering
          if (window.ShadyCSS !== undefined && !window.ShadyCSS.nativeShadow) {
              window.ShadyCSS.ScopingShim.prepareAdoptedCssText(styles.map((s) => s.cssText), this.localName);
          }
          else if (supportsAdoptingStyleSheets) {
              this.renderRoot.adoptedStyleSheets =
                  styles.map((s) => s.styleSheet);
          }
          else {
              // This must be done after rendering so the actual style insertion is done
              // in `update`.
              this._needsShimAdoptedStyleSheets = true;
          }
      }
      connectedCallback() {
          super.connectedCallback();
          // Note, first update/render handles styleElement so we only call this if
          // connected after first update.
          if (this.hasUpdated && window.ShadyCSS !== undefined) {
              window.ShadyCSS.styleElement(this);
          }
      }
      /**
       * Updates the element. This method reflects property values to attributes
       * and calls `render` to render DOM via lit-html. Setting properties inside
       * this method will *not* trigger another update.
       * * @param _changedProperties Map of changed properties with old values
       */
      update(changedProperties) {
          super.update(changedProperties);
          const templateResult = this.render();
          if (templateResult instanceof TemplateResult) {
              this.constructor
                  .render(templateResult, this.renderRoot, { scopeName: this.localName, eventContext: this });
          }
          // When native Shadow DOM is used but adoptedStyles are not supported,
          // insert styling after rendering to ensure adoptedStyles have highest
          // priority.
          if (this._needsShimAdoptedStyleSheets) {
              this._needsShimAdoptedStyleSheets = false;
              this.constructor._styles.forEach((s) => {
                  const style = document.createElement('style');
                  style.textContent = s.cssText;
                  this.renderRoot.appendChild(style);
              });
          }
      }
      /**
       * Invoked on each update to perform rendering tasks. This method must return
       * a lit-html TemplateResult. Setting properties inside this method will *not*
       * trigger the element to update.
       */
      render() {
      }
  }
  /**
   * Ensure this class is marked as `finalized` as an optimization ensuring
   * it will not needlessly try to `finalize`.
   */
  LitElement.finalized = true;
  /**
   * Render method used to render the lit-html TemplateResult to the element's
   * DOM.
   * @param {TemplateResult} Template to render.
   * @param {Element|DocumentFragment} Node into which to render.
   * @param {String} Element name.
   * @nocollapse
   */
  LitElement.render = render$1;

  var anObject$2 = require('./_an-object');
  var toObject = require('./_to-object');
  var toLength$2 = require('./_to-length');
  var toInteger = require('./_to-integer');
  var advanceStringIndex$2 = require('./_advance-string-index');
  var regExpExec$1 = require('./_regexp-exec-abstract');
  var max = Math.max;
  var min = Math.min;
  var floor = Math.floor;
  var SUBSTITUTION_SYMBOLS = /\$([$&`']|\d\d?|<[^>]*>)/g;
  var SUBSTITUTION_SYMBOLS_NO_NAMED = /\$([$&`']|\d\d?)/g;

  var maybeToString = function (it) {
    return it === undefined ? it : String(it);
  };

  // @@replace logic
  require('./_fix-re-wks')('replace', 2, function (defined, REPLACE, $replace, maybeCallNative) {
    return [
      // `String.prototype.replace` method
      // https://tc39.github.io/ecma262/#sec-string.prototype.replace
      function replace(searchValue, replaceValue) {
        var O = defined(this);
        var fn = searchValue == undefined ? undefined : searchValue[REPLACE];
        return fn !== undefined
          ? fn.call(searchValue, O, replaceValue)
          : $replace.call(String(O), searchValue, replaceValue);
      },
      // `RegExp.prototype[@@replace]` method
      // https://tc39.github.io/ecma262/#sec-regexp.prototype-@@replace
      function (regexp, replaceValue) {
        var res = maybeCallNative($replace, regexp, this, replaceValue);
        if (res.done) return res.value;

        var rx = anObject$2(regexp);
        var S = String(this);
        var functionalReplace = typeof replaceValue === 'function';
        if (!functionalReplace) replaceValue = String(replaceValue);
        var global = rx.global;
        if (global) {
          var fullUnicode = rx.unicode;
          rx.lastIndex = 0;
        }
        var results = [];
        while (true) {
          var result = regExpExec$1(rx, S);
          if (result === null) break;
          results.push(result);
          if (!global) break;
          var matchStr = String(result[0]);
          if (matchStr === '') rx.lastIndex = advanceStringIndex$2(S, toLength$2(rx.lastIndex), fullUnicode);
        }
        var accumulatedResult = '';
        var nextSourcePosition = 0;
        for (var i = 0; i < results.length; i++) {
          result = results[i];
          var matched = String(result[0]);
          var position = max(min(toInteger(result.index), S.length), 0);
          var captures = [];
          // NOTE: This is equivalent to
          //   captures = result.slice(1).map(maybeToString)
          // but for some reason `nativeSlice.call(result, 1, result.length)` (called in
          // the slice polyfill when slicing native arrays) "doesn't work" in safari 9 and
          // causes a crash (https://pastebin.com/N21QzeQA) when trying to debug it.
          for (var j = 1; j < result.length; j++) captures.push(maybeToString(result[j]));
          var namedCaptures = result.groups;
          if (functionalReplace) {
            var replacerArgs = [matched].concat(captures, position, S);
            if (namedCaptures !== undefined) replacerArgs.push(namedCaptures);
            var replacement = String(replaceValue.apply(undefined, replacerArgs));
          } else {
            replacement = getSubstitution(matched, S, position, captures, namedCaptures, replaceValue);
          }
          if (position >= nextSourcePosition) {
            accumulatedResult += S.slice(nextSourcePosition, position) + replacement;
            nextSourcePosition = position + matched.length;
          }
        }
        return accumulatedResult + S.slice(nextSourcePosition);
      }
    ];

      // https://tc39.github.io/ecma262/#sec-getsubstitution
    function getSubstitution(matched, str, position, captures, namedCaptures, replacement) {
      var tailPos = position + matched.length;
      var m = captures.length;
      var symbols = SUBSTITUTION_SYMBOLS_NO_NAMED;
      if (namedCaptures !== undefined) {
        namedCaptures = toObject(namedCaptures);
        symbols = SUBSTITUTION_SYMBOLS;
      }
      return $replace.call(replacement, symbols, function (match, ch) {
        var capture;
        switch (ch.charAt(0)) {
          case '$': return '$';
          case '&': return matched;
          case '`': return str.slice(0, position);
          case "'": return str.slice(tailPos);
          case '<':
            capture = namedCaptures[ch.slice(1, -1)];
            break;
          default: // \d\d?
            var n = +ch;
            if (n === 0) return match;
            if (n > m) {
              var f = floor(n / 10);
              if (f === 0) return match;
              if (f <= m) return captures[f - 1] === undefined ? ch.charAt(1) : captures[f - 1] + ch.charAt(1);
              return match;
            }
            capture = captures[n - 1];
        }
        return capture === undefined ? '' : capture;
      });
    }
  });

  // Sourced from https://gist.github.com/letsgetrandy/1e05a68ea74ba6736eb5
  var EXCEPTIONS = {
    'are': 'were',
    'eat': 'ate',
    'go': 'went',
    'have': 'had',
    'inherit': 'inherited',
    'is': 'was',
    'run': 'ran',
    'sit': 'sat',
    'visit': 'visited'
  };
  var getPastTense = function getPastTense(verb) {
    var exceptions = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : EXCEPTIONS;

    if (exceptions[verb]) {
      return exceptions[verb];
    }

    if (/e$/i.test(verb)) {
      return verb + 'd';
    }

    if (/[aeiou]c$/i.test(verb)) {
      return verb + 'ked';
    } // for american english only


    if (/el$/i.test(verb)) {
      return verb + 'ed';
    }

    if (/[aeio][aeiou][dlmnprst]$/.test(verb)) {
      return verb + 'ed';
    }

    if (/[aeiou][bdglmnprst]$/i.test(verb)) {
      return verb.replace(/(.+[aeiou])([bdglmnprst])/, '$1$2$2ed');
    }

    return verb + 'ed';
  };

  var verbs = ['abase', 'abate', 'abduct', 'abet', 'abhor', 'abide', 'abjure', 'ablate', 'abort', 'abound', 'abseil', 'absorb', 'abuse', 'abut', 'accede', 'accent', 'accept', 'access', 'accord', 'accost', 'accrue', 'accuse', 'ache', 'acquit', 'act', 'adapt', 'add', 'addict', 'addle', 'adduce', 'adhere', 'adjoin', 'adjust', 'admire', 'admit', 'adopt', 'adore', 'adorn', 'advert', 'advise', 'aerate', 'affect', 'affirm', 'affix', 'afford', 'age', 'agree', 'aid', 'aim', 'alarm', 'alert', 'alight', 'align', 'allay', 'allege', 'allot', 'allow', 'alloy', 'allure', 'ally', 'alter', 'amass', 'amaze', 'amble', 'ambush', 'amend', 'amount', 'amuse', 'anger', 'angle', 'anneal', 'annex', 'annoy', 'annul', 'anoint', 'answer', 'ape', 'appeal', 'appear', 'append', 'apply', 'arc', 'arch', 'argue', 'arise', 'arm', 'array', 'arrest', 'arrive', 'arrow', 'ascend', 'ask', 'aspire', 'assail', 'assay', 'assent', 'assert', 'assess', 'assign', 'assist', 'assort', 'assume', 'assure', 'atone', 'attach', 'attack', 'attain', 'attend', 'attest', 'attire', 'attune', 'audit', 'augur', 'author', 'avail', 'avenge', 'aver', 'avert', 'avoid', 'await', 'awake', 'awaken', 'award', 'awe', 'babble', 'back', 'badge', 'badger', 'baffle', 'bag', 'bail', 'bait', 'bake', 'bald', 'bale', 'ball', 'ballot', 'ban', 'band', 'bandy', 'bang', 'banish', 'bank', 'banter', 'bar', 'barb', 'barber', 'bard', 'bare', 'barge', 'bark', 'barn', 'barrel', 'barter', 'base', 'bash', 'bask', 'baste', 'bat', 'batch', 'bathe', 'batten', 'batter', 'battle', 'bawl', 'bay', 'be', 'beach', 'beacon', 'bead', 'beam', 'bean', 'bear', 'beard', 'beat', 'become', 'bed', 'beef', 'beep', 'beetle', 'befall', 'befit', 'beg', 'beget', 'beggar', 'begin', 'behave', 'behead', 'behold', 'belay', 'belch', 'belie', 'bell', 'bellow', 'belly', 'belong', 'belt', 'bemoan', 'bench', 'bend', 'berate', 'berry', 'beset', 'best', 'bestir', 'bestow', 'bet', 'betide', 'betray', 'better', 'bevel', 'bewail', 'beware', 'bias', 'bib', 'bicker', 'bid', 'bide', 'bilge', 'bill', 'billet', 'billow', 'bin', 'bind', 'birdie', 'birth', 'bisect', 'bit', 'bite', 'bitter', 'black', 'blame', 'blanch', 'blank', 'blare', 'blast', 'blaze', 'bleach', 'bleat', 'bleed', 'bleep', 'blench', 'blend', 'bless', 'blight', 'blind', 'blink', 'blip', 'bliss', 'blitz', 'bloat', 'blob', 'blood', 'bloody', 'bloom', 'blot', 'blotch', 'blow', 'blue', 'bluff', 'blunt', 'blur', 'blurb', 'blurt', 'blush', 'board', 'boast', 'bob', 'bode', 'body', 'bog', 'bogey', 'boggle', 'boil', 'bolt', 'bomb', 'bond', 'bone', 'bonnet', 'boo', 'book', 'boom', 'boost', 'boot', 'booze', 'bop', 'bore', 'borrow', 'boss', 'botch', 'bother', 'bottle', 'bottom', 'bounce', 'bound', 'bout', 'bow', 'bowel', 'bowl', 'box', 'brace', 'brag', 'braid', 'braise', 'brake', 'branch', 'brand', 'brave', 'brawl', 'bray', 'breach', 'bread', 'break', 'breed', 'breeze', 'brew', 'bribe', 'brick', 'bridge', 'bridle', 'brief', 'brim', 'brine', 'bring', 'broach', 'broil', 'bronze', 'brook', 'brown', 'browse', 'bruise', 'brush', 'bubble', 'buck', 'bucket', 'buckle', 'bud', 'budge', 'budget', 'buffet', 'bug', 'bugle', 'build', 'bulge', 'bulk', 'bull', 'bully', 'bumble', 'bump', 'bunch', 'bundle', 'bung', 'bungle', 'bunk', 'bunker', 'buoy', 'burble', 'burden', 'burgle', 'burn', 'burp', 'burr', 'burrow', 'burst', 'bury', 'bus', 'bush', 'busk', 'bust', 'bustle', 'busy', 'butt', 'button', 'buy', 'buzz', 'bypass', 'cab', 'cabal', 'cabin', 'cable', 'cache', 'cackle', 'cadge', 'cage', 'cajole', 'cake', 'call', 'calm', 'calve', 'camber', 'camp', 'can', 'canal', 'cancel', 'candle', 'candy', 'cane', 'cannon', 'canoe', 'canopy', 'cant', 'canter', 'cap', 'caper', 'card', 'care', 'career', 'caress', 'carol', 'carp', 'carpet', 'carry', 'cart', 'carve', 'case', 'cash', 'cast', 'castle', 'cat', 'catch', 'cater', 'caucus', 'cause', 'cave', 'cavern', 'cease', 'cede', 'cellar', 'cement', 'censor', 'chafe', 'chain', 'chair', 'chalk', 'champ', 'chance', 'change', 'chant', 'chap', 'char', 'charge', 'charm', 'chart', 'chase', 'chat', 'cheat', 'check', 'cheep', 'cheer', 'chew', 'chide', 'chill', 'chime', 'chin', 'chink', 'chip', 'chirp', 'chisel', 'chock', 'choir', 'choke', 'choose', 'chop', 'chord', 'chorus', 'chrome', 'chuck', 'chuff', 'chug', 'chum', 'chunk', 'churn', 'chute', 'cinder', 'cipher', 'circle', 'cite', 'clad', 'claim', 'clam', 'clamp', 'clang', 'clank', 'clap', 'clash', 'clasp', 'class', 'claw', 'clean', 'clear', 'cleat', 'cleave', 'clench', 'clerk', 'click', 'climax', 'climb', 'clinch', 'cling', 'clink', 'clip', 'clique', 'cloak', 'clock', 'clog', 'clone', 'close', 'closet', 'clot', 'cloud', 'clout', 'clown', 'club', 'cluck', 'clue', 'clump', 'clutch', 'coach', 'coal', 'coast', 'coat', 'coax', 'cobble', 'cobweb', 'cockle', 'cocoon', 'coddle', 'code', 'codify', 'coerce', 'coffer', 'coffin', 'cog', 'cohere', 'coil', 'coin', 'coke', 'collar', 'comb', 'combat', 'come', 'commit', 'compel', 'comply', 'con', 'concur', 'cone', 'confer', 'convey', 'convoy', 'cook', 'cool', 'cope', 'copper', 'copy', 'cord', 'cordon', 'core', 'cork', 'corn', 'corner', 'corral', 'cosset', 'cost', 'cotton', 'couch', 'cough', 'count', 'couple', 'course', 'court', 'cover', 'covet', 'cowl', 'cox', 'crab', 'crack', 'cradle', 'craft', 'cram', 'cramp', 'crane', 'crank', 'crash', 'crate', 'crater', 'crave', 'crawl', 'crayon', 'craze', 'creak', 'cream', 'crease', 'create', 'credit', 'creed', 'creep', 'crest', 'crew', 'crib', 'crick', 'crimp', 'cringe', 'crisp', 'croak', 'crook', 'croon', 'crop', 'cross', 'crouch', 'crowd', 'crown', 'cruise', 'crunch', 'crush', 'crust', 'crutch', 'cry', 'cube', 'cuckoo', 'cuddle', 'cudgel', 'cue', 'cuff', 'cull', 'cup', 'curb', 'curd', 'curdle', 'cure', 'curl', 'curry', 'curse', 'curve', 'cuss', 'cut', 'cycle', 'dab', 'dabble', 'dagger', 'dally', 'dam', 'damage', 'damn', 'damp', 'dampen', 'dance', 'dangle', 'dapple', 'dare', 'darken', 'darn', 'dart', 'dash', 'date', 'daub', 'daunt', 'dawdle', 'daze', 'dazzle', 'deaden', 'deafen', 'deal', 'debar', 'debase', 'debate', 'debit', 'debug', 'debut', 'decamp', 'decant', 'decay', 'decide', 'deck', 'decode', 'decoy', 'decree', 'decry', 'deduce', 'deduct', 'deem', 'deepen', 'deface', 'defame', 'defeat', 'defect', 'defend', 'defer', 'defile', 'define', 'deform', 'defray', 'defuse', 'defy', 'deify', 'deign', 'delay', 'delete', 'delude', 'deluge', 'delve', 'demand', 'demean', 'demise', 'demote', 'demur', 'den', 'denote', 'dent', 'denude', 'deny', 'depart', 'depend', 'depict', 'deploy', 'deport', 'depose', 'depute', 'derail', 'deride', 'derive', 'desert', 'design', 'desire', 'desist', 'detach', 'detail', 'detain', 'detect', 'deter', 'detest', 'detour', 'devil', 'devise', 'devote', 'devour', 'dial', 'diaper', 'dice', 'die', 'diet', 'differ', 'dig', 'digest', 'dilate', 'dilute', 'dim', 'dimple', 'din', 'dine', 'dint', 'dip', 'direct', 'disarm', 'disc', 'disco', 'dish', 'dismay', 'disown', 'dispel', 'disuse', 'ditch', 'dither', 'dive', 'divert', 'divest', 'divide', 'divine', 'dizzy', 'do', 'dock', 'docket', 'doctor', 'dodge', 'dog', 'dole', 'doll', 'dolly', 'dome', 'donate', 'doodle', 'doom', 'dope', 'dose', 'dot', 'dote', 'double', 'doubt', 'douse', 'dowel', 'down', 'dowse', 'doze', 'drab', 'draft', 'drag', 'drain', 'drape', 'draw', 'drawl', 'dray', 'dread', 'dream', 'dredge', 'drench', 'dress', 'drift', 'drill', 'drink', 'drip', 'drive', 'drivel', 'drone', 'drool', 'droop', 'drop', 'drown', 'drowse', 'drudge', 'drug', 'drum', 'dry', 'dub', 'duck', 'duel', 'duet', 'dull', 'dumb', 'dummy', 'dump', 'dun', 'dupe', 'dust', 'dwarf', 'dwell', 'dye', 'ear', 'earn', 'ease', 'eat', 'ebb', 'echo', 'eddy', 'edge', 'edify', 'edit', 'efface', 'egg', 'egress', 'eject', 'elapse', 'elate', 'elbow', 'elect', 'elicit', 'elide', 'elope', 'elude', 'embalm', 'embark', 'embed', 'embody', 'emboss', 'emerge', 'emit', 'employ', 'empty', 'enable', 'enact', 'enamel', 'encamp', 'encase', 'encode', 'encore', 'end', 'endear', 'endow', 'endure', 'enfold', 'engage', 'engulf', 'enjoin', 'enjoy', 'enlist', 'enrage', 'enrich', 'ensue', 'ensure', 'entail', 'enter', 'entice', 'entomb', 'entrap', 'envy', 'equal', 'equate', 'equip', 'erase', 'erect', 'erode', 'err', 'erupt', 'escape', 'eschew', 'escort', 'escrow', 'essay', 'esteem', 'etch', 'evade', 'evict', 'evince', 'evoke', 'evolve', 'exact', 'exalt', 'exceed', 'excel', 'except', 'excess', 'excise', 'excite', 'excuse', 'exempt', 'exert', 'exeunt', 'exhale', 'exhort', 'exhume', 'exile', 'exist', 'expand', 'expect', 'expel', 'expend', 'expire', 'export', 'expose', 'extend', 'extol', 'extort', 'exude', 'exult', 'eye', 'fable', 'face', 'facet', 'factor', 'fade', 'fail', 'faint', 'fair', 'fake', 'fall', 'falter', 'fame', 'fan', 'fancy', 'farce', 'fare', 'farm', 'fast', 'fasten', 'fat', 'fate', 'father', 'fathom', 'fatten', 'fault', 'fawn', 'fear', 'feast', 'fee', 'feed', 'feel', 'feign', 'fell', 'fence', 'fend', 'ferret', 'ferry', 'fester', 'fetch', 'fettle', 'feud', 'fever', 'fib', 'fiddle', 'fidget', 'field', 'fife', 'fight', 'figure', 'file', 'fill', 'fillet', 'fillip', 'film', 'filter', 'fin', 'find', 'fine', 'finger', 'finish', 'fire', 'firm', 'fish', 'fit', 'fitter', 'fix', 'fizz', 'fizzle', 'flack', 'flag', 'flail', 'flake', 'flame', 'flank', 'flap', 'flare', 'flash', 'flat', 'flaunt', 'flaw', 'flay', 'flee', 'fleece', 'fleet', 'flesh', 'flex', 'flick', 'flight', 'flinch', 'fling', 'flint', 'flip', 'flit', 'float', 'flock', 'flog', 'flood', 'floor', 'flop', 'floss', 'flour', 'flout', 'flow', 'flower', 'fluff', 'flurry', 'flush', 'flute', 'flux', 'fly', 'foal', 'foam', 'fob', 'focus', 'fodder', 'fog', 'foil', 'foist', 'fold', 'folio', 'follow', 'foment', 'fondle', 'fool', 'foot', 'forage', 'foray', 'forbid', 'force', 'ford', 'forego', 'forest', 'forge', 'forget', 'fork', 'form', 'format', 'foster', 'foul', 'found', 'fowl', 'fox', 'frame', 'frank', 'fray', 'freak', 'free', 'freeze', 'frenzy', 'fresh', 'fret', 'friend', 'fright', 'frill', 'fringe', 'frisk', 'frock', 'frog', 'frolic', 'front', 'frost', 'froth', 'frown', 'fruit', 'fry', 'fudge', 'fuel', 'full', 'fumble', 'fume', 'fun', 'fund', 'funk', 'funnel', 'fur', 'furrow', 'fuse', 'fuss', 'fuzz', 'gabble', 'gad', 'gaff', 'gag', 'gaggle', 'gain', 'gait', 'gall', 'gallop', 'gamble', 'gambol', 'game', 'gang', 'gap', 'gape', 'garage', 'garble', 'garden', 'gargle', 'garner', 'garter', 'gas', 'gash', 'gasp', 'gate', 'gather', 'gauge', 'gavel', 'gaze', 'gear', 'gel', 'gem', 'gender', 'gentle', 'get', 'ghost', 'gibber', 'gibbet', 'giddy', 'gift', 'gig', 'giggle', 'gimlet', 'gin', 'ginger', 'gird', 'girdle', 'girth', 'give', 'glad', 'glance', 'glare', 'glass', 'glaze', 'gleam', 'glean', 'glide', 'glint', 'gloat', 'globe', 'gloom', 'glory', 'gloss', 'glove', 'glow', 'glower', 'glue', 'glut', 'gnarl', 'gnash', 'gnaw', 'go', 'goad', 'gobble', 'golf', 'gong', 'goose', 'gore', 'gorge', 'gossip', 'gouge', 'govern', 'gown', 'grab', 'grace', 'grade', 'graft', 'grain', 'grant', 'graph', 'grasp', 'grass', 'grate', 'grave', 'gravel', 'graze', 'grease', 'green', 'greet', 'grey', 'grieve', 'grill', 'grin', 'grind', 'grip', 'gripe', 'grit', 'groan', 'groin', 'groom', 'groove', 'grope', 'gross', 'grouch', 'ground', 'group', 'grouse', 'grout', 'grovel', 'grow', 'growl', 'grub', 'grudge', 'grunt', 'guard', 'guess', 'guest', 'guffaw', 'guide', 'guilt', 'guise', 'gulf', 'gull', 'gully', 'gulp', 'gum', 'gun', 'gurgle', 'gush', 'gust', 'gut', 'gutter', 'guy', 'guzzle', 'gyrate', 'habit', 'hack', 'haft', 'haggle', 'hail', 'hale', 'hallo', 'halo', 'halt', 'halter', 'halve', 'ham', 'hammer', 'hamper', 'hand', 'handle', 'hang', 'hanker', 'happen', 'harass', 'harden', 'hark', 'harm', 'harp', 'harrow', 'harry', 'hash', 'hasp', 'hassle', 'haste', 'hasten', 'hat', 'hatch', 'hate', 'haul', 'haunt', 'have', 'haven', 'havoc', 'hawk', 'hay', 'hazard', 'haze', 'head', 'heal', 'heap', 'hear', 'heart', 'heat', 'heave', 'heckle', 'hector', 'hedge', 'heed', 'heel', 'heft', 'hell', 'hello', 'helm', 'help', 'hem', 'herald', 'herd', 'hew', 'hex', 'hiccup', 'hide', 'hijack', 'hike', 'hill', 'hilt', 'hinder', 'hinge', 'hint', 'hip', 'hiss', 'hit', 'hitch', 'hive', 'hoard', 'hoax', 'hob', 'hobble', 'hock', 'hoe', 'hog', 'hoist', 'hold', 'hole', 'hollow', 'home', 'hone', 'honey', 'honk', 'hood', 'hoof', 'hook', 'hoop', 'hoot', 'hop', 'hope', 'horde', 'horn', 'hose', 'host', 'hostel', 'hound', 'house', 'hovel', 'hover', 'howl', 'huddle', 'huff', 'hug', 'hulk', 'hull', 'hum', 'humble', 'humbug', 'hump', 'hunch', 'hunger', 'hunt', 'hurdle', 'hurl', 'hurrah', 'hurry', 'hurt', 'hurtle', 'hush', 'husk', 'hustle', 'hymn', 'hyphen', 'ice', 'id', 'idle', 'ignite', 'ignore', 'image', 'imbibe', 'imbue', 'imp', 'impact', 'impair', 'impale', 'impart', 'impede', 'impel', 'imply', 'import', 'impose', 'impugn', 'impute', 'inch', 'incite', 'incur', 'indent', 'index', 'indict', 'induce', 'induct', 'infect', 'infer', 'infest', 'infix', 'inform', 'infuse', 'ingest', 'inhale', 'inject', 'injure', 'ink', 'inlay', 'inlet', 'input', 'insert', 'inset', 'insist', 'insult', 'insure', 'intend', 'inter', 'intern', 'intone', 'inure', 'invade', 'invent', 'invert', 'invest', 'invite', 'invoke', 'ionize', 'iris', 'iron', 'island', 'isle', 'issue', 'itch', 'item', 'jab', 'jabber', 'jack', 'jade', 'jag', 'jail', 'jam', 'jangle', 'jape', 'jar', 'jargon', 'jaunt', 'jaw', 'jazz', 'jeer', 'jelly', 'jerk', 'jest', 'jet', 'jetty', 'jewel', 'jib', 'jibe', 'jig', 'jigsaw', 'jilt', 'jingle', 'jinx', 'jitter', 'jive', 'job', 'jockey', 'jog', 'join', 'joint', 'joke', 'jolly', 'jolt', 'jostle', 'jot', 'joust', 'joy', 'judge', 'jug', 'juggle', 'juice', 'jumble', 'jump', 'junk', 'junket', 'just', 'jut', 'kayak', 'keel', 'keen', 'keep', 'ken', 'kennel', 'kernel', 'key', 'kick', 'kid', 'kidnap', 'kill', 'kiln', 'kilt', 'kindle', 'king', 'kink', 'kipper', 'kiss', 'kit', 'kite', 'kitten', 'knead', 'knee', 'kneel', 'knell', 'knife', 'knight', 'knit', 'knock', 'knoll', 'knot', 'know', 'kosher', 'kowtow', 'laager', 'label', 'lace', 'lack', 'lackey', 'ladle', 'lag', 'lame', 'lament', 'lance', 'land', 'lap', 'lapse', 'lard', 'lark', 'lash', 'lasso', 'last', 'latch', 'lathe', 'lather', 'laud', 'laugh', 'launch', 'laurel', 'lavish', 'law', 'lay', 'layer', 'laze', 'lazy', 'leach', 'lead', 'leaf', 'league', 'leak', 'lean', 'leap', 'learn', 'lease', 'leash', 'leave', 'leaven', 'lecher', 'leech', 'leer', 'leg', 'lend', 'lesion', 'lessen', 'lesson', 'let', 'letter', 'level', 'lever', 'levy', 'libel', 'lichen', 'lick', 'lid', 'lie', 'lift', 'light', 'like', 'liken', 'lilt', 'limb', 'limber', 'lime', 'limit', 'limp', 'line', 'linger', 'link', 'lip', 'liquor', 'lisp', 'list', 'listen', 'litter', 'live', 'liven', 'load', 'loaf', 'loam', 'loan', 'loathe', 'lob', 'lobby', 'local', 'locate', 'lock', 'lodge', 'loft', 'log', 'loiter', 'loll', 'long', 'look', 'loom', 'loop', 'loose', 'loosen', 'loot', 'lop', 'lope', 'lord', 'lose', 'lot', 'loth', 'lounge', 'louse', 'lout', 'love', 'lower', 'luck', 'lug', 'lull', 'lumber', 'lump', 'lunch', 'lunge', 'lurch', 'lure', 'lurk', 'lust', 'lute', 'lynch', 'mace', 'mad', 'madden', 'mail', 'maim', 'major', 'make', 'malign', 'malt', 'man', 'manage', 'mangle', 'mantle', 'manure', 'map', 'mar', 'marble', 'march', 'margin', 'mark', 'market', 'marl', 'maroon', 'marry', 'martyr', 'marvel', 'mash', 'mask', 'mason', 'mass', 'mast', 'master', 'mat', 'match', 'mate', 'matte', 'matter', 'mature', 'maul', 'maze', 'mean', 'medal', 'meddle', 'meet', 'meld', 'mellow', 'melt', 'menace', 'mend', 'mentor', 'merge', 'merit', 'mesh', 'mess', 'metal', 'meter', 'mew', 'mildew', 'milk', 'mill', 'mimic', 'mince', 'mind', 'mine', 'mingle', 'minor', 'mint', 'minute', 'mire', 'mirror', 'miscue', 'misfit', 'mislay', 'miss', 'mist', 'misuse', 'mitre', 'mix', 'moan', 'mob', 'mock', 'model', 'modem', 'modify', 'molest', 'molten', 'monger', 'monkey', 'moon', 'moor', 'moot', 'mop', 'mope', 'morph', 'morsel', 'mortar', 'mosaic', 'moss', 'mother', 'motion', 'motive', 'motor', 'mould', 'mound', 'mount', 'mourn', 'mouse', 'mousse', 'mouth', 'move', 'mow', 'muck', 'mud', 'muddle', 'muddy', 'muff', 'muffle', 'mug', 'mulch', 'mull', 'mumble', 'mummy', 'munch', 'murder', 'murmur', 'muscle', 'muse', 'mush', 'must', 'muster', 'mutate', 'mute', 'mutiny', 'mutter', 'muzzle', 'nag', 'nail', 'name', 'nap', 'narrow', 'near', 'neaten', 'neck', 'need', 'needle', 'negate', 'neigh', 'nerve', 'nest', 'nestle', 'net', 'nettle', 'neuter', 'nibble', 'niche', 'nick', 'nickel', 'niggle', 'nigh', 'nip', 'nod', 'noise', 'noodle', 'noose', 'nose', 'notch', 'note', 'notice', 'notify', 'nudge', 'null', 'numb', 'number', 'nurse', 'nut', 'nuzzle', 'oar', 'obey', 'object', 'oblige', 'obtain', 'occult', 'occupy', 'occur', 'off', 'offend', 'offer', 'ogle', 'oh', 'oil', 'omen', 'omit', 'ooze', 'open', 'opiate', 'oppose', 'opt', 'option', 'orb', 'orbit', 'ordain', 'order', 'orient', 'orphan', 'oust', 'out', 'outbid', 'outdo', 'outfit', 'outlaw', 'outlay', 'output', 'outrun', 'outwit', 'over', 'overdo', 'owe', 'own', 'oyster', 'pace', 'pacify', 'pack', 'packet', 'pad', 'paddle', 'page', 'pain', 'paint', 'pair', 'pal', 'pale', 'pall', 'pallet', 'palm', 'palsy', 'pamper', 'pan', 'pander', 'panel', 'panic', 'pant', 'paper', 'par', 'parade', 'parcel', 'parch', 'pardon', 'pare', 'parent', 'park', 'parley', 'parody', 'parole', 'parrot', 'parry', 'parse', 'part', 'party', 'pass', 'paste', 'pastor', 'pat', 'patch', 'patent', 'patrol', 'patter', 'pause', 'pave', 'paw', 'pawn', 'pay', 'peace', 'peach', 'peak', 'peal', 'pearl', 'pebble', 'peck', 'pedal', 'peddle', 'peek', 'peel', 'peep', 'peer', 'peg', 'pellet', 'pelt', 'pen', 'pencil', 'people', 'pepper', 'perch', 'peril', 'perish', 'perk', 'perm', 'permit', 'peruse', 'pester', 'pestle', 'pet', 'phase', 'phone', 'phrase', 'pi', 'pick', 'picket', 'pickle', 'picnic', 'pie', 'piece', 'pierce', 'piffle', 'pig', 'pike', 'pile', 'pilfer', 'pill', 'pillar', 'pillow', 'pilot', 'pimp', 'pin', 'pinch', 'pine', 'ping', 'pinion', 'pink', 'pip', 'pipe', 'pique', 'pirate', 'pistol', 'pit', 'pitch', 'pith', 'pity', 'pivot', 'place', 'plague', 'plait', 'plan', 'plane', 'plank', 'plant', 'plat', 'plate', 'play', 'plead', 'please', 'pleat', 'pledge', 'plight', 'plod', 'plop', 'plot', 'plough', 'pluck', 'plug', 'plumb', 'plume', 'plump', 'plunge', 'ply', 'poach', 'pocket', 'pod', 'point', 'poise', 'poison', 'poke', 'pole', 'police', 'polish', 'polka', 'poll', 'pollen', 'pomade', 'pond', 'ponder', 'pony', 'pool', 'pop', 'pore', 'port', 'pose', 'posit', 'post', 'pot', 'potter', 'pouch', 'pounce', 'pound', 'pour', 'pout', 'powder', 'power', 'praise', 'prance', 'prank', 'prawn', 'pray', 'preach', 'preen', 'prefab', 'prefix', 'preset', 'press', 'pretty', 'prey', 'price', 'prick', 'pride', 'priest', 'prim', 'prime', 'print', 'prize', 'probe', 'prod', 'profit', 'prompt', 'prong', 'proof', 'prop', 'propel', 'prose', 'prove', 'prowl', 'prune', 'pry', 'pucker', 'puddle', 'puff', 'pug', 'puke', 'pull', 'pulp', 'pulse', 'pumice', 'pummel', 'pump', 'pun', 'punch', 'punish', 'punt', 'pup', 'purge', 'purify', 'purl', 'purple', 'purr', 'purse', 'pursue', 'push', 'put', 'putt', 'putter', 'putty', 'puzzle', 'quack', 'quaff', 'quake', 'quarry', 'quash', 'quaver', 'queen', 'queer', 'quell', 'quench', 'query', 'quest', 'queue', 'quiet', 'quill', 'quilt', 'quip', 'quit', 'quiver', 'quiz', 'quote', 'rabble', 'race', 'rack', 'racket', 'radio', 'raffle', 'raft', 'rag', 'rage', 'raid', 'rail', 'rain', 'raise', 'rake', 'rally', 'ram', 'ramble', 'ramify', 'ramp', 'ramrod', 'ranch', 'range', 'rank', 'rankle', 'ransom', 'rant', 'rap', 'rasp', 'rat', 'rate', 'ratify', 'ration', 'rattle', 'ravage', 'rave', 'ravel', 'raven', 'ravish', 'ray', 'raze', 'reach', 'react', 'read', 'ready', 'really', 'ream', 'reap', 'rear', 'reason', 'rebate', 'rebel', 'rebind', 'rebook', 'rebuff', 'rebuke', 'rebut', 'recall', 'recant', 'recap', 'recast', 'recede', 'recess', 'recite', 'reckon', 'recode', 'recoil', 'record', 'recur', 'redden', 'redeem', 'redial', 'redo', 'redraw', 'reduce', 'reed', 'reef', 'reek', 'reel', 'reeve', 'refer', 'refile', 'refill', 'refine', 'refit', 'reflex', 'reform', 'refuel', 'refuge', 'refund', 'refuse', 'refute', 'regain', 'regale', 'regard', 'regret', 'rehash', 'reheat', 'reify', 'reign', 'reject', 'rejoin', 'relate', 'relax', 'relay', 'relent', 'relink', 'relish', 'relive', 'rely', 'remain', 'remake', 'remand', 'remap', 'remark', 'remedy', 'remind', 'remit', 'remove', 'rename', 'rend', 'render', 'renege', 'renew', 'rent', 'reopen', 'repack', 'repair', 'repast', 'repay', 'repeal', 'repeat', 'repel', 'repent', 'repine', 'replay', 'reply', 'report', 'repose', 'repute', 'reread', 'rerun', 'rescue', 'resell', 'resend', 'resent', 'reset', 'reshow', 'reside', 'resign', 'resin', 'resist', 'resit', 'resort', 'rest', 'result', 'resume', 'retail', 'retain', 'retake', 'retard', 'retch', 'retell', 'retest', 'retire', 'retort', 'retry', 'retune', 'return', 'retype', 'reuse', 'revamp', 'reveal', 'revel', 'revere', 'revert', 'review', 'revile', 'revive', 'revoke', 'revolt', 'reward', 'rewind', 'reword', 'rework', 'rhyme', 'rib', 'ribbon', 'rice', 'rid', 'riddle', 'ride', 'ridge', 'riff', 'rifle', 'rift', 'rig', 'right', 'rim', 'rime', 'ring', 'rinse', 'riot', 'rip', 'ripen', 'ripple', 'rise', 'risk', 'rival', 'rivet', 'roach', 'roam', 'roar', 'roast', 'rob', 'robe', 'rock', 'rocket', 'rogue', 'roll', 'romp', 'roof', 'rook', 'room', 'roost', 'root', 'rope', 'rosin', 'rot', 'rotate', 'rouge', 'rough', 'round', 'rouse', 'rout', 'route', 'rove', 'row', 'rub', 'ruck', 'rue', 'ruff', 'ruffle', 'ruin', 'rule', 'rumble', 'rumple', 'run', 'rush', 'rust', 'rustle', 'rut', 'sack', 'sadden', 'saddle', 'safari', 'sag', 'sail', 'saint', 'sallow', 'salt', 'salute', 'sample', 'sand', 'sandal', 'sap', 'sash', 'sauce', 'sauna', 'savage', 'save', 'saw', 'say', 'scab', 'scald', 'scale', 'scalp', 'scan', 'scant', 'scape', 'scar', 'scare', 'scarf', 'scathe', 'scent', 'scheme', 'school', 'scoff', 'scold', 'scoop', 'scoot', 'scope', 'scorch', 'score', 'scorn', 'scotch', 'scour', 'scout', 'scowl', 'scrap', 'scrape', 'scrawl', 'scream', 'screen', 'screw', 'scribe', 'script', 'scroll', 'scrub', 'scrum', 'scuba', 'scud', 'scuff', 'scull', 'sculpt', 'scum', 'scurry', 'scythe', 'seal', 'seam', 'sear', 'search', 'season', 'seat', 'secede', 'second', 'sector', 'secure', 'sedate', 'seduce', 'see', 'seed', 'seek', 'seem', 'seep', 'seethe', 'seize', 'select', 'sell', 'send', 'sense', 'serge', 'serve', 'set', 'settle', 'sever', 'sew', 'shack', 'shade', 'shadow', 'shaft', 'shag', 'shake', 'sham', 'shame', 'shank', 'shape', 'share', 'shark', 'sharp', 'shave', 'shear', 'shed', 'sheer', 'shell', 'shelve', 'shield', 'shift', 'shin', 'shine', 'ship', 'shirk', 'shiver', 'shoal', 'shock', 'shoe', 'shoo', 'shoot', 'shop', 'short', 'shot', 'shout', 'shove', 'shovel', 'show', 'shower', 'shred', 'shriek', 'shrill', 'shrimp', 'shrine', 'shrink', 'shroud', 'shrug', 'shun', 'shunt', 'shut', 'shy', 'sicken', 'sickly', 'side', 'sidle', 'siege', 'sieve', 'sift', 'sigh', 'sight', 'sign', 'signal', 'signet', 'silk', 'silo', 'silt', 'silver', 'simmer', 'simper', 'simple', 'sin', 'sinew', 'sing', 'single', 'sink', 'sip', 'siphon', 'sire', 'sit', 'site', 'size', 'sizzle', 'skate', 'sketch', 'skew', 'skewer', 'ski', 'skid', 'skim', 'skimp', 'skin', 'skip', 'skirl', 'skirt', 'skulk', 'skunk', 'sky', 'slab', 'slack', 'slag', 'slake', 'slam', 'slang', 'slant', 'slap', 'slash', 'slat', 'slate', 'slave', 'slaver', 'slay', 'sleaze', 'sled', 'sledge', 'sleek', 'sleep', 'sleet', 'sleeve', 'sleigh', 'sleuth', 'slice', 'slick', 'slide', 'slight', 'slim', 'slime', 'sling', 'slink', 'slip', 'slit', 'sliver', 'slog', 'slop', 'slope', 'slosh', 'slot', 'slouch', 'slough', 'slow', 'slug', 'sluice', 'slum', 'slump', 'slur', 'slurp', 'slurry', 'slush', 'smack', 'smart', 'smash', 'smear', 'smell', 'smelt', 'smile', 'smirk', 'smite', 'smock', 'smoke', 'smooth', 'smudge', 'smut', 'snack', 'snag', 'snake', 'snap', 'snare', 'snarl', 'snatch', 'sneak', 'sneer', 'sneeze', 'snick', 'sniff', 'snip', 'snipe', 'snivel', 'snoop', 'snooze', 'snore', 'snort', 'snow', 'snub', 'snuff', 'snug', 'soak', 'soap', 'soar', 'sob', 'sober', 'sock', 'socket', 'sodden', 'soften', 'soil', 'solace', 'solder', 'sole', 'solo', 'solve', 'soot', 'soothe', 'sop', 'sorrow', 'sort', 'sortie', 'sound', 'soup', 'sour', 'source', 'south', 'sow', 'space', 'spade', 'span', 'spank', 'spar', 'spare', 'spark', 'spat', 'spawn', 'speak', 'spear', 'speck', 'speed', 'spell', 'spend', 'spew', 'sphere', 'spice', 'spike', 'spill', 'spin', 'spiral', 'spire', 'spirit', 'spit', 'spite', 'splash', 'splice', 'splint', 'split', 'spoil', 'spoke', 'sponge', 'spoof', 'spool', 'spoon', 'spoor', 'spore', 'sport', 'spot', 'spout', 'sprain', 'sprawl', 'spray', 'spread', 'sprig', 'spring', 'sprint', 'sprout', 'spruce', 'spud', 'spume', 'spur', 'spurn', 'spurt', 'spy', 'squad', 'squall', 'square', 'squash', 'squat', 'squawk', 'squeak', 'squeal', 'squib', 'squint', 'squire', 'squirm', 'squirt', 'stab', 'stable', 'stack', 'staff', 'stag', 'stage', 'stain', 'stake', 'stale', 'stalk', 'stall', 'stamp', 'stand', 'staple', 'star', 'starch', 'stare', 'start', 'starve', 'state', 'stave', 'stay', 'stead', 'steal', 'steam', 'steel', 'steep', 'steer', 'stem', 'step', 'stet', 'stew', 'stick', 'stiff', 'stifle', 'still', 'stilt', 'sting', 'stink', 'stint', 'stir', 'stitch', 'stock', 'stomp', 'stone', 'stooge', 'stool', 'stoop', 'stop', 'store', 'storm', 'story', 'stow', 'strafe', 'strain', 'strand', 'strap', 'stray', 'streak', 'stream', 'stress', 'strew', 'stride', 'strike', 'string', 'strip', 'stripe', 'strive', 'stroke', 'stroll', 'strop', 'strum', 'strut', 'stub', 'stucco', 'stud', 'study', 'stuff', 'stump', 'stun', 'stunt', 'sturdy', 'sty', 'style', 'stymie', 'subdue', 'submit', 'suck', 'sucker', 'suckle', 'suds', 'sue', 'suede', 'suffer', 'suffix', 'sugar', 'suit', 'sulk', 'sully', 'sum', 'summer', 'summit', 'summon', 'sun', 'suntan', 'sup', 'supple', 'supply', 'surf', 'surge', 'survey', 'suture', 'swab', 'swamp', 'swap', 'swarm', 'swat', 'swathe', 'sway', 'swear', 'sweat', 'sweep', 'swell', 'swerve', 'swill', 'swim', 'swing', 'swipe', 'swirl', 'swish', 'switch', 'swivel', 'swoon', 'swoop', 'swop', 'symbol', 'syrup', 'tab', 'tabby', 'table', 'taboo', 'tack', 'tackle', 'tag', 'tail', 'tailor', 'taint', 'take', 'talk', 'tallow', 'tally', 'tame', 'tamp', 'tamper', 'tan', 'tangle', 'tango', 'tank', 'tap', 'tape', 'taper', 'tar', 'target', 'tariff', 'tarry', 'tart', 'task', 'tassel', 'taste', 'tattle', 'tattoo', 'taunt', 'tax', 'taxi', 'teach', 'team', 'tear', 'tease', 'tee', 'teem', 'teeter', 'teethe', 'telex', 'tell', 'temper', 'tempt', 'tenant', 'tend', 'tender', 'tenon', 'tense', 'tent', 'tenure', 'term', 'test', 'tether', 'thank', 'thatch', 'thaw', 'thieve', 'thin', 'think', 'thirst', 'thorn', 'thou', 'thrall', 'thrash', 'thread', 'threat', 'thresh', 'thrill', 'thrive', 'throat', 'throb', 'throne', 'throng', 'throw', 'thrum', 'thrust', 'thud', 'thumb', 'thump', 'thwack', 'thwart', 'tick', 'ticket', 'tickle', 'tide', 'tidy', 'tie', 'tier', 'tile', 'till', 'tiller', 'tilt', 'timber', 'time', 'tin', 'tinge', 'tingle', 'tinker', 'tinkle', 'tinsel', 'tint', 'tip', 'tipple', 'tiptoe', 'tire', 'tissue', 'tithe', 'title', 'titter', 'toady', 'toast', 'toddle', 'toe', 'toggle', 'toil', 'token', 'toll', 'tomb', 'tomcat', 'tone', 'tongue', 'tool', 'toot', 'tooth', 'tootle', 'top', 'topple', 'torch', 'torque', 'toss', 'tot', 'total', 'totter', 'touch', 'tough', 'tour', 'tout', 'tow', 'towel', 'tower', 'toy', 'trace', 'track', 'trade', 'trail', 'train', 'tram', 'tramp', 'trance', 'trap', 'trash', 'travel', 'trawl', 'tread', 'treat', 'treble', 'tree', 'trek', 'trench', 'trend', 'triage', 'trice', 'trick', 'trill', 'trim', 'trip', 'triple', 'troll', 'troop', 'trot', 'troupe', 'trowel', 'truant', 'truck', 'trudge', 'true', 'truss', 'trust', 'try', 'tub', 'tube', 'tuck', 'tucker', 'tuft', 'tug', 'tumble', 'tun', 'tune', 'tunnel', 'turf', 'turn', 'turtle', 'tusk', 'tussle', 'tutor', 'twang', 'tweak', 'tweet', 'twig', 'twill', 'twin', 'twine', 'twinge', 'twirl', 'twist', 'twitch', 'type', 'typify', 'umpire', 'unable', 'unbend', 'unbolt', 'unclog', 'uncoil', 'undo', 'unfit', 'unfold', 'unfurl', 'unhand', 'unify', 'unite', 'unjam', 'unlace', 'unlink', 'unload', 'unlock', 'unmask', 'unpack', 'unpick', 'unplug', 'unroll', 'unseal', 'unseat', 'untie', 'unveil', 'unwind', 'unwrap', 'unzip', 'up', 'update', 'uphold', 'uplift', 'upload', 'uproot', 'upset', 'upturn', 'urge', 'use', 'usher', 'usurp', 'utter', 'vacate', 'vacuum', 'valet', 'value', 'valve', 'vamp', 'vanish', 'vary', 'vat', 'vault', 'vector', 'veer', 'veil', 'vein', 'vend', 'veneer', 'vent', 'verge', 'verify', 'verse', 'vest', 'vet', 'veto', 'vex', 'vial', 'vice', 'video', 'vie', 'view', 'vilify', 'visa', 'vision', 'visit', 'visor', 'voice', 'void', 'volley', 'vomit', 'voodoo', 'vote', 'vouch', 'vow', 'voyage', 'wad', 'waddle', 'wade', 'wafer', 'waffle', 'waft', 'wag', 'wager', 'waggle', 'wagon', 'wail', 'wait', 'waive', 'wake', 'waken', 'walk', 'wall', 'wallow', 'waltz', 'wan', 'wander', 'wane', 'want', 'wanton', 'war', 'warble', 'ward', 'warm', 'warn', 'warp', 'wash', 'waste', 'watch', 'water', 'wattle', 'wave', 'waver', 'wax', 'waylay', 'weaken', 'wean', 'weapon', 'wear', 'weary', 'weasel', 'weave', 'web', 'wed', 'wedge', 'weed', 'weep', 'weigh', 'weight', 'weld', 'well', 'welt', 'welter', 'wench', 'wend', 'wet', 'whack', 'whale', 'wharf', 'wheel', 'wheeze', 'whelp', 'whet', 'whiff', 'while', 'whine', 'whinny', 'whip', 'whir', 'whirl', 'whirr', 'whisk', 'white', 'whiten', 'whizz', 'whoop', 'whoosh', 'wick', 'widen', 'widow', 'wield', 'wig', 'wiggle', 'wild', 'wile', 'will', 'wilt', 'wimple', 'win', 'wince', 'winch', 'wind', 'window', 'wine', 'wing', 'wink', 'winnow', 'winter', 'wipe', 'wire', 'wish', 'wisp', 'wit', 'witch', 'wither', 'wobble', 'wolf', 'wonder', 'wont', 'woo', 'wood', 'word', 'work', 'worm', 'worry', 'worsen', 'worst', 'wound', 'wow', 'wrack', 'wrap', 'wreak', 'wreath', 'wreck', 'wrench', 'wrest', 'wring', 'write', 'writhe', 'wrong', 'x-ray', 'xerox', 'yacht', 'yak', 'yap', 'yard', 'yaw', 'yawn', 'yearn', 'yeast', 'yell', 'yellow', 'yelp', 'yen', 'yes', 'yield', 'yo-yo', 'yodel', 'yoke', 'zero', 'zigzag', 'zinc', 'zip', 'zipper', 'zone', 'zoom'];
  var nouns = ['abacus', 'abbey', 'abroad', 'abuse', 'access', 'acid', 'act', 'action', 'actor', 'ad', 'adult', 'advice', 'affair', 'affect', 'age', 'agency', 'agenda', 'agent', 'aglet', 'aid', 'air', 'airbag', 'airbus', 'alarm', 'alb', 'alcove', 'alder', 'alibi', 'alley', 'alloy', 'almond', 'alpaca', 'alpha', 'alto', 'amount', 'analog', 'anger', 'angle', 'angora', 'animal', 'anime', 'ankle', 'anklet', 'annual', 'anorak', 'answer', 'ant', 'antler', 'ape', 'appeal', 'apple', 'apron', 'apse', 'arch', 'archer', 'area', 'arm', 'armor', 'army', 'arrow', 'art', 'ascot', 'ash', 'ashram', 'aside', 'ask', 'aspect', 'assist', 'atom', 'atrium', 'attack', 'attic', 'aunt', 'author', 'avenue', 'award', 'babe', 'baboon', 'baby', 'back', 'bacon', 'bad', 'badge', 'badger', 'bag', 'bagel', 'bail', 'bait', 'bake', 'baker', 'bakery', 'ball', 'ballet', 'bamboo', 'banana', 'band', 'bangle', 'banjo', 'bank', 'banker', 'baobab', 'bar', 'barber', 'barge', 'barium', 'barn', 'base', 'basin', 'basis', 'basket', 'bass', 'bat', 'bath', 'bather', 'batter', 'battle', 'bay', 'bayou', 'beach', 'bead', 'beak', 'beam', 'bean', 'beanie', 'bear', 'beard', 'beast', 'beat', 'beauty', 'beaver', 'bed', 'bee', 'beech', 'beef', 'beer', 'beet', 'beetle', 'beggar', 'behest', 'being', 'belfry', 'belief', 'bell', 'belly', 'belt', 'bench', 'bend', 'bengal', 'beret', 'berry', 'bet', 'beyond', 'bid', 'bidet', 'big', 'bijou', 'bike', 'bikini', 'bill', 'bin', 'birch', 'bird', 'birth', 'bit', 'bite', 'bitter', 'black', 'blade', 'blame', 'blank', 'blazer', 'blight', 'blind', 'block', 'blood', 'bloom', 'blouse', 'blow', 'blue', 'boar', 'board', 'boat', 'bobcat', 'body', 'bog', 'bolero', 'bolt', 'bomb', 'bomber', 'bone', 'bongo', 'bonnet', 'bonsai', 'bonus', 'book', 'boot', 'bootee', 'bootie', 'boots', 'booty', 'border', 'bore', 'bosom', 'boss', 'botany', 'bother', 'bottle', 'bottom', 'bough', 'bow', 'bower', 'bowl', 'bowler', 'bowtie', 'box', 'boxer', 'boy', 'bra', 'brace', 'brain', 'brake', 'branch', 'brand', 'brandy', 'brass', 'brave', 'bread', 'break', 'breast', 'breath', 'breeze', 'brick', 'bridge', 'brief', 'briefs', 'broad', 'broker', 'brome', 'bronco', 'bronze', 'brooch', 'brood', 'brook', 'broom', 'brow', 'brown', 'brush', 'bubble', 'bucket', 'buckle', 'bud', 'buddy', 'budget', 'buffer', 'buffet', 'bug', 'buggy', 'bugle', 'bulb', 'bull', 'bullet', 'bumper', 'bun', 'bunch', 'burn', 'burst', 'bus', 'bush', 'bust', 'bustle', 'butane', 'butter', 'button', 'buy', 'buyer', 'cabana', 'cabin', 'cable', 'cacao', 'cactus', 'caddy', 'cadet', 'cafe', 'caftan', 'cake', 'calf', 'calico', 'call', 'calm', 'camel', 'cameo', 'camera', 'camp', 'can', 'canal', 'cancel', 'cancer', 'candle', 'candy', 'cane', 'cannon', 'canoe', 'canon', 'canopy', 'canvas', 'cap', 'cape', 'capon', 'car', 'carbon', 'card', 'care', 'career', 'cargo', 'carol', 'carp', 'carpet', 'carrot', 'carry', 'cart', 'case', 'cash', 'casino', 'cast', 'castle', 'cat', 'catch', 'catsup', 'cattle', 'cause', 'cave', 'cd', 'celery', 'cell', 'cellar', 'cello', 'cement', 'census', 'cent', 'center', 'cereal', 'chafe', 'chain', 'chair', 'chaise', 'chalet', 'chalk', 'chance', 'change', 'chaos', 'chap', 'chapel', 'chard', 'charge', 'charm', 'chart', 'check', 'cheek', 'chef', 'cheque', 'cherry', 'chess', 'chest', 'chick', 'chief', 'child', 'chill', 'chime', 'chin', 'chino', 'chip', 'chive', 'choice', 'choker', 'chop', 'chord', 'chrome', 'chub', 'chug', 'church', 'churn', 'cicada', 'cinema', 'circle', 'cirrus', 'city', 'claim', 'clam', 'clank', 'clasp', 'class', 'clause', 'clave', 'cleat', 'clef', 'cleric', 'clerk', 'click', 'client', 'cliff', 'climb', 'clip', 'cloak', 'clock', 'clogs', 'close', 'closet', 'cloth', 'cloud', 'cloudy', 'clove', 'clover', 'club', 'clue', 'clutch', 'coach', 'coal', 'coast', 'coat', 'cob', 'cobweb', 'cocoa', 'cod', 'code', 'codon', 'coffee', 'coffin', 'coil', 'coin', 'coke', 'cold', 'collar', 'colon', 'colony', 'color', 'colt', 'column', 'comb', 'combat', 'comic', 'comma', 'common', 'condor', 'cone', 'conga', 'congo', 'consul', 'cook', 'cookie', 'cope', 'copper', 'copy', 'cord', 'cork', 'corn', 'corner', 'cornet', 'corral', 'cost', 'cot', 'cotton', 'couch', 'cougar', 'cough', 'count', 'county', 'couple', 'course', 'court', 'cousin', 'cover', 'cow', 'cowboy', 'crab', 'crack', 'cradle', 'craft', 'crash', 'crate', 'cravat', 'craw', 'crayon', 'crazy', 'cream', 'creche', 'credit', 'creek', 'crest', 'crew', 'crib', 'crime', 'crocus', 'crook', 'crop', 'cross', 'crotch', 'croup', 'crow', 'crowd', 'crown', 'crude', 'crush', 'cry', 'cub', 'cuckoo', 'cup', 'cupola', 'curio', 'curl', 'curler', 'cursor', 'curve', 'cut', 'cutlet', 'cycle', 'cymbal', 'cynic', 'cyst', 'dad', 'dagger', 'dahlia', 'daisy', 'damage', 'dame', 'dance', 'dancer', 'danger', 'daniel', 'dare', 'dark', 'dart', 'dash', 'data', 'date', 'david', 'day', 'daybed', 'dead', 'deal', 'dealer', 'dear', 'death', 'debate', 'debt', 'debtor', 'decade', 'deck', 'deep', 'deer', 'degree', 'delay', 'delete', 'demand', 'demur', 'den', 'denim', 'depth', 'deputy', 'derby', 'desert', 'design', 'desire', 'desk', 'detail', 'device', 'devil', 'dew', 'dhow', 'diadem', 'dibble', 'dickey', 'diet', 'dig', 'digger', 'dill', 'dime', 'dimple', 'diner', 'dinghy', 'dinner', 'dirndl', 'dirt', 'disco', 'dish', 'dishes', 'disk', 'divan', 'diver', 'divide', 'diving', 'dock', 'doctor', 'doe', 'dog', 'doll', 'dollar', 'dolman', 'domain', 'donkey', 'door', 'dory', 'dot', 'double', 'doubt', 'draft', 'drag', 'dragon', 'drain', 'drake', 'drama', 'draw', 'drawer', 'dream', 'dress', 'drill', 'drink', 'drive', 'driver', 'drop', 'drug', 'drum', 'drunk', 'dry', 'dryer', 'duck', 'dud', 'due', 'duffel', 'dugout', 'dump', 'dust', 'duster', 'duty', 'dwarf', 'dynamo', 'eagle', 'ear', 'earth', 'ease', 'easel', 'east', 'eat', 'eave', 'e-book', 'eddy', 'edge', 'edger', 'editor', 'edward', 'eel', 'effect', 'effort', 'egg', 'eggnog', 'eight', 'elbow', 'elixir', 'elk', 'elm', 'emery', 'employ', 'emu', 'end', 'enemy', 'energy', 'engine', 'enigma', 'entry', 'envy', 'epee', 'epoch', 'eponym', 'epoxy', 'equal', 'era', 'error', 'escape', 'ese', 'essay', 'estate', 'ethics', 'europe', 'event', 'exam', 'excuse', 'exile', 'exit', 'expert', 'extent', 'eye', 'eyelid', 'face', 'facet', 'fact', 'factor', 'fail', 'fairy', 'faith', 'fall', 'fame', 'family', 'fan', 'fang', 'fanny', 'farm', 'farmer', 'fascia', 'fat', 'father', 'faucet', 'fault', 'fawn', 'fax', 'fear', 'feast', 'fedora', 'fee', 'feed', 'feel', 'feet', 'felony', 'female', 'fen', 'fence', 'fender', 'ferry', 'few', 'fiber', 'fibre', 'fiddle', 'field', 'fifth', 'fight', 'figure', 'file', 'fill', 'filly', 'film', 'filth', 'final', 'find', 'fine', 'finger', 'finish', 'fir', 'fire', 'fish', 'fix', 'flag', 'flame', 'flare', 'flash', 'flat', 'flavor', 'flax', 'fleck', 'fleece', 'flesh', 'flight', 'flock', 'flood', 'floor', 'flour', 'flow', 'flower', 'flu', 'fluke', 'flute', 'fly', 'foam', 'fob', 'focus', 'fog', 'fold', 'folder', 'fondue', 'font', 'food', 'foot', 'foray', 'force', 'forest', 'fork', 'form', 'formal', 'format', 'former', 'fort', 'forum', 'fowl', 'fox', 'frame', 'freeze', 'freon', 'fresco', 'fridge', 'friend', 'fringe', 'frock', 'frog', 'front', 'frost', 'frown', 'fruit', 'fuel', 'full', 'fun', 'funny', 'fur', 'futon', 'future', 'gaffer', 'gain', 'gale', 'galley', 'gallon', 'galn', 'game', 'gander', 'gap', 'garage', 'garb', 'garden', 'garlic', 'garter', 'gas', 'gate', 'gather', 'gauge', 'gazebo', 'gear', 'geese', 'gem', 'gender', 'gene', 'george', 'gerbil', 'geyser', 'ghost', 'giant', 'gift', 'girdle', 'girl', 'git', 'give', 'glad', 'gland', 'glass', 'glen', 'glider', 'glove', 'gloves', 'glue', 'glut', 'go', 'goal', 'goat', 'god', 'gold', 'golf', 'gong', 'good', 'goodie', 'goose', 'gopher', 'gossip', 'gown', 'grab', 'grade', 'grain', 'gram', 'grand', 'granny', 'grape', 'graph', 'grass', 'gray', 'grease', 'great', 'greek', 'green', 'grey', 'grief', 'grill', 'grip', 'grit', 'ground', 'group', 'grouse', 'growth', 'guard', 'guess', 'guest', 'guide', 'guilt', 'guilty', 'guitar', 'gum', 'gun', 'gutter', 'guy', 'gym', 'gyro', 'habit', 'hail', 'hair', 'half', 'hall', 'hamaki', 'hammer', 'hand', 'handle', 'hang', 'harbor', 'harm', 'harp', 'hat', 'hatbox', 'hate', 'hatred', 'haunt', 'hawk', 'hay', 'head', 'health', 'heart', 'hearth', 'heat', 'heater', 'heaven', 'heavy', 'hedge', 'heel', 'height', 'helen', 'helium', 'hell', 'hello', 'helmet', 'helo', 'help', 'hemp', 'hen', 'herb', 'heron', 'heyday', 'hide', 'high', 'hill', 'hip', 'hire', 'hit', 'hive', 'hobbit', 'hobby', 'hockey', 'hoe', 'hog', 'hold', 'hole', 'home', 'honey', 'hood', 'hoof', 'hook', 'hope', 'hops', 'horn', 'hornet', 'horror', 'horse', 'hose', 'host', 'hostel', 'hot', 'hotel', 'hour', 'house', 'hovel', 'hub', 'hubcap', 'hugger', 'human', 'humor', 'humour', 'hunger', 'hunt', 'hurry', 'hurt', 'hut', 'hutch', 'hyena', 'ice', 'icicle', 'icon', 'idea', 'ideal', 'if', 'igloo', 'image', 'impact', 'inbox', 'inch', 'income', 'index', 'injury', 'ink', 'inlay', 'inn', 'input', 'insect', 'inside', 'invite', 'iris', 'iron', 'irony', 'island', 'issue', 'it', 'item', 'jackal', 'jacket', 'jaguar', 'jail', 'jam', 'james', 'jar', 'jaw', 'jeans', 'jeep', 'jeff', 'jelly', 'jet', 'jewel', 'jiffy', 'job', 'jockey', 'joey', 'join', 'joint', 'joke', 'jot', 'joy', 'judge', 'judo', 'juice', 'jumbo', 'jump', 'jumper', 'junior', 'junk', 'junker', 'junket', 'jury', 'jute', 'kale', 'karate', 'karen', 'kayak', 'kazoo', 'keep', 'kendo', 'ketch', 'kettle', 'key', 'kick', 'kid', 'kidney', 'kill', 'kilt', 'kimono', 'kind', 'king', 'kiosk', 'kiss', 'kite', 'kitten', 'kitty', 'klomps', 'knee', 'knife', 'knight', 'knot', 'koala', 'lab', 'labour', 'lace', 'lack', 'ladder', 'lady', 'lake', 'lamb', 'lamp', 'lan', 'lanai', 'land', 'lap', 'lapdog', 'laptop', 'larch', 'larder', 'lark', 'latex', 'lathe', 'latte', 'laugh', 'lava', 'law', 'lawn', 'lawyer', 'lay', 'layer', 'lead', 'leader', 'leaf', 'league', 'leaker', 'leash', 'leave', 'leaver', 'leek', 'leg', 'legal', 'legume', 'lei', 'lemon', 'lemur', 'length', 'lentil', 'lesson', 'let', 'letter', 'level', 'lever', 'lie', 'lier', 'life', 'lift', 'light', 'lilac', 'lily', 'limit', 'limo', 'line', 'linen', 'liner', 'link', 'lion', 'lip', 'liquid', 'liquor', 'lisa', 'list', 'listen', 'litter', 'liver', 'living', 'lizard', 'llama', 'load', 'loaf', 'loafer', 'loan', 'local', 'lock', 'locker', 'locket', 'locust', 'loft', 'log', 'loggia', 'logic', 'long', 'look', 'loss', 'lot', 'lotion', 'lounge', 'lout', 'love', 'low', 'luck', 'lumber', 'lunch', 'lung', 'lunge', 'lute', 'lycra', 'lye', 'lynx', 'lyre', 'lyric', 'magic', 'maid', 'maiden', 'mail', 'main', 'major', 'make', 'makeup', 'male', 'mall', 'mallet', 'mambo', 'man', 'maniac', 'manner', 'manor', 'mantel', 'mantle', 'mantua', 'manx', 'many', 'map', 'maple', 'maraca', 'marble', 'mare', 'margin', 'mark', 'market', 'marsh', 'mask', 'mass', 'master', 'mat', 'match', 'mate', 'math', 'matter', 'maybe', 'mayor', 'meal', 'meat', 'media', 'medium', 'meet', 'melody', 'member', 'memory', 'men', 'menu', 'mess', 'metal', 'meteor', 'meter', 'method', 'metro', 'mice', 'middle', 'midi', 'might', 'mile', 'milk', 'mime', 'mimosa', 'mind', 'mine', 'mini', 'minion', 'minor', 'mint', 'minute', 'mirror', 'misfit', 'miss', 'mist', 'mister', 'miter', 'mitten', 'mix', 'mixer', 'moat', 'mobile', 'mocha', 'mode', 'model', 'modem', 'mole', 'mom', 'moment', 'money', 'monger', 'monkey', 'month', 'mood', 'moon', 'mop', 'morsel', 'mosque', 'most', 'motel', 'moth', 'mother', 'motion', 'motor', 'mound', 'mouse', 'mouser', 'mousse', 'mouth', 'mouton', 'move', 'mover', 'movie', 'mower', 'mud', 'mug', 'mukluk', 'mule', 'muscle', 'museum', 'music', 'mutt', 'n', 'nail', 'name', 'naming', 'napkin', 'nasty', 'nation', 'native', 'nature', 'neat', 'neck', 'need', 'needle', 'neon', 'nephew', 'nerve', 'nest', 'net', 'news', 'nexus', 'nicety', 'niche', 'nickel', 'niece', 'night', 'nobody', 'node', 'noise', 'noodle', 'normal', 'norse', 'north', 'nose', 'note', 'notice', 'notify', 'nougat', 'novel', 'nudge', 'number', 'nurse', 'nut', 'nylon', 'oak', 'oar', 'oasis', 'obi', 'object', 'oboe', 'ocean', 'ocelot', 'octave', 'octavo', 'octet', 'oeuvre', 'offer', 'office', 'oil', 'okra', 'oldie', 'olive', 'omega', 'omelet', 'one', 'onion', 'open', 'opera', 'opium', 'option', 'orange', 'orator', 'orchid', 'order', 'organ', 'osprey', 'other', 'others', 'ott', 'otter', 'ounce', 'outfit', 'outlay', 'output', 'outset', 'oval', 'ovary', 'oven', 'owl', 'owner', 'ox', 'oxen', 'oxford', 'oxygen', 'oyster', 'pace', 'pack', 'packet', 'pad', 'paddle', 'page', 'pagoda', 'pail', 'pain', 'paint', 'pair', 'pajama', 'palm', 'pan', 'panda', 'panic', 'pansy', 'pantry', 'pants', 'panty', 'paper', 'parade', 'parcel', 'pard', 'parent', 'park', 'parka', 'parrot', 'part', 'party', 'pass', 'past', 'pasta', 'paste', 'pastor', 'pastry', 'patch', 'path', 'patina', 'patio', 'patrol', 'pause', 'paw', 'pay', 'payee', 'pea', 'peace', 'peach', 'peak', 'peanut', 'pear', 'pearl', 'pedal', 'peen', 'peer', 'pelt', 'pen', 'pencil', 'peony', 'people', 'pepper', 'perch', 'period', 'permit', 'perp', 'person', 'pest', 'pet', 'petal', 'pew', 'pha', 'phase', 'phone', 'photo', 'phrase', 'piano', 'pick', 'pickax', 'picket', 'pickle', 'pie', 'piece', 'pier', 'piety', 'pig', 'pigeon', 'pike', 'pile', 'pillow', 'pilot', 'pimp', 'pimple', 'pin', 'pine', 'ping', 'pink', 'pinkie', 'pint', 'pinto', 'pipe', 'piracy', 'piss', 'pitch', 'pith', 'pizza', 'place', 'plain', 'plan', 'plane', 'planet', 'plant', 'plate', 'play', 'player', 'plenty', 'plier', 'plot', 'plough', 'plover', 'plow', 'plume', 'pocket', 'poem', 'poet', 'poetry', 'point', 'poison', 'pole', 'police', 'policy', 'polish', 'polo', 'pompom', 'poncho', 'pond', 'pony', 'poof', 'pool', 'pop', 'poppy', 'porch', 'port', 'porter', 'post', 'poster', 'pot', 'potato', 'potty', 'pouch', 'pound', 'powder', 'power', 'press', 'price', 'pride', 'priest', 'prince', 'print', 'prior', 'prison', 'prize', 'profit', 'prompt', 'proof', 'prose', 'prow', 'pruner', 'public', 'puddle', 'puffin', 'pull', 'pulley', 'puma', 'pump', 'punch', 'pupa', 'pupil', 'puppy', 'purple', 'purse', 'push', 'pusher', 'put', 'pvc', 'pyjama', 'quail', 'quart', 'quartz', 'queen', 'quiet', 'quill', 'quilt', 'quince', 'quit', 'quiver', 'quote', 'rabbi', 'rabbit', 'race', 'racer', 'racing', 'racism', 'racist', 'rack', 'radar', 'radio', 'radish', 'raffle', 'raft', 'rag', 'rage', 'rail', 'rain', 'raise', 'rake', 'ram', 'ramie', 'ranch', 'random', 'range', 'rank', 'rat', 'rate', 'ratio', 'raven', 'raw', 'ray', 'rayon', 'reach', 'read', 'reamer', 'rear', 'reason', 'recess', 'recipe', 'record', 'red', 'reef', 'refund', 'refuse', 'region', 'regret', 'reject', 'relief', 'relish', 'remote', 'remove', 'rent', 'repair', 'repeat', 'reply', 'report', 'resale', 'resist', 'resort', 'rest', 'result', 'retina', 'return', 'reveal', 'review', 'reward', 'rhyme', 'rhythm', 'rice', 'rich', 'riddle', 'ride', 'rider', 'ridge', 'rifle', 'right', 'rim', 'ring', 'rip', 'ripple', 'rise', 'riser', 'risk', 'river', 'road', 'roast', 'robe', 'robin', 'rock', 'rocker', 'rocket', 'rod', 'role', 'roll', 'roller', 'roof', 'room', 'root', 'rope', 'rose', 'rotate', 'rough', 'round', 'route', 'router', 'row', 'royal', 'rub', 'rubber', 'rubric', 'ruckus', 'ruffle', 'rugby', 'ruin', 'rule', 'rum', 'run', 'runner', 'rush', 'ruth', 'ry', 'sabre', 'sack', 'sad', 'saddle', 'safe', 'safety', 'sage', 'sail', 'sailor', 'salad', 'salary', 'sale', 'salmon', 'salon', 'saloon', 'salt', 'sampan', 'sample', 'sand', 'sari', 'sarong', 'sash', 'satin', 'satire', 'sauce', 'save', 'saving', 'savior', 'saw', 'scale', 'scarf', 'scene', 'scent', 'scheme', 'school', 'score', 'scorn', 'scow', 'screen', 'screw', 'scrim', 'scrip', 'script', 'sea', 'seal', 'search', 'season', 'seat', 'second', 'secret', 'sector', 'secure', 'seed', 'seeder', 'select', 'self', 'sell', 'senior', 'sense', 'sepal', 'series', 'serve', 'server', 'set', 'sewer', 'sex', 'shack', 'shade', 'shadow', 'shake', 'shaker', 'shame', 'shanty', 'shape', 'share', 'shark', 'sharon', 'shawl', 'she', 'shears', 'sheath', 'shed', 'sheep', 'sheet', 'shelf', 'shell', 'sherry', 'shield', 'shift', 'shin', 'shine', 'ship', 'shirt', 'shoat', 'shock', 'shoe', 'shoes', 'shofar', 'shoot', 'shop', 'shore', 'shorts', 'shot', 'shovel', 'show', 'shower', 'shred', 'shrimp', 'shrine', 'sick', 'side', 'siding', 'sign', 'signal', 'signet', 'signup', 'silica', 'silk', 'sill', 'silly', 'silo', 'silver', 'simple', 'sing', 'singer', 'single', 'sink', 'sir', 'sister', 'sitar', 'site', 'size', 'skate', 'skiing', 'skill', 'skin', 'skirt', 'skull', 'skunk', 'sky', 'slash', 'slave', 'sled', 'sledge', 'sleep', 'sleet', 'sleuth', 'slice', 'slide', 'slider', 'slime', 'slip', 'slope', 'sloth', 'smash', 'smell', 'smile', 'smock', 'smog', 'smoke', 'snail', 'snake', 'sneeze', 'snob', 'snorer', 'snow', 'soap', 'soccer', 'sock', 'socks', 'soda', 'sofa', 'soft', 'soil', 'solid', 'son', 'song', 'sonnet', 'soot', 'sorbet', 'sorrow', 'sort', 'sound', 'soup', 'source', 'south', 'sow', 'soy', 'space', 'spade', 'spank', 'spare', 'spark', 'spasm', 'spear', 'speech', 'speed', 'spell', 'spend', 'sphere', 'sphynx', 'spider', 'spike', 'spine', 'spiral', 'spirit', 'spite', 'spleen', 'split', 'sponge', 'spoon', 'sport', 'spot', 'spray', 'spread', 'spring', 'sprout', 'spruce', 'spume', 'spur', 'spy', 'square', 'squash', 'squid', 'stable', 'stack', 'staff', 'stag', 'stage', 'stain', 'stair', 'stamen', 'stamp', 'stance', 'stand', 'star', 'start', 'state', 'status', 'stay', 'steak', 'steal', 'steam', 'steel', 'stem', 'step', 'steps', 'stew', 'stick', 'still', 'stitch', 'stock', 'stole', 'stone', 'stool', 'stop', 'store', 'storey', 'storm', 'story', 'stove', 'strain', 'strait', 'strap', 'straw', 'stream', 'street', 'stress', 'strike', 'string', 'strip', 'stroke', 'stud', 'studio', 'study', 'stuff', 'stupid', 'style', 'stylus', 'suburb', 'subway', 'suck', 'suede', 'sugar', 'suit', 'sultan', 'summer', 'sun', 'sunday', 'supply', 'survey', 'sushi', 'SUV', 'swamp', 'swan', 'swath', 'sweat', 'sweats', 'sweet', 'sweets', 'swell', 'swim', 'swing', 'swiss', 'switch', 'swivel', 'sword', 'synod', 'syrup', 'system', 'tabby', 'table', 'tackle', 'tail', 'tailor', 'tale', 'talk', 'tam', 'tandem', 'tank', 'tanker', 'tap', 'tard', 'target', 'task', 'tassel', 'taste', 'tatami', 'tattoo', 'tavern', 'tax', 'taxi', 'tea', 'teach', 'team', 'tear', 'teen', 'teeth', 'tell', 'teller', 'temp', 'temper', 'temple', 'tempo', 'tennis', 'tenor', 'tent', 'tepee', 'term', 'test', 'text', 'thanks', 'thaw', 'theism', 'theme', 'theory', 'thigh', 'thing', 'thirst', 'thomas', 'thong', 'thongs', 'thorn', 'thread', 'thrill', 'throat', 'throne', 'thrush', 'thumb', 'tiara', 'tic', 'ticket', 'tie', 'tiger', 'tight', 'tights', 'tile', 'till', 'timber', 'time', 'timer', 'tin', 'tinkle', 'tip', 'tire', 'tissue', 'title', 'toad', 'toast', 'today', 'toe', 'toga', 'togs', 'toilet', 'tom', 'tomato', 'ton', 'tone', 'tongue', 'tool', 'toot', 'tooth', 'top', 'topic', 'toque', 'torso', 'tosser', 'total', 'tote', 'touch', 'tough', 'tour', 'towel', 'tower', 'town', 'toy', 'track', 'trade', 'trail', 'train', 'tram', 'tramp', 'trash', 'travel', 'tray', 'treat', 'tree', 'tremor', 'trench', 'trial', 'tribe', 'trick', 'trim', 'trip', 'tripod', 'trout', 'trove', 'trowel', 'truck', 'trunk', 'trust', 'truth', 'try', 'tub', 'tuba', 'tube', 'tulip', 'tummy', 'tuna', 'tune', 'tunic', 'tunnel', 'turban', 'turn', 'turnip', 'turret', 'turtle', 'tussle', 'tutu', 'tuxedo', 'tv', 'twig', 'twine', 'twist', 'two', 'type', 'tyvek', 'uncle', 'union', 'unique', 'unit', 'unity', 'upper', 'urn', 'usage', 'use', 'user', 'usher', 'usual', 'vacuum', 'valley', 'value', 'van', 'vane', 'vanity', 'vase', 'vast', 'vault', 'veal', 'veil', 'vein', 'veldt', 'vellum', 'velvet', 'venom', 'verse', 'verve', 'vessel', 'vest', 'vibe', 'video', 'view', 'villa', 'vinyl', 'viola', 'violet', 'violin', 'virtue', 'virus', 'vise', 'vision', 'visit', 'visor', 'visual', 'vixen', 'voice', 'volume', 'voyage', 'wad', 'wafer', 'waffle', 'waist', 'wait', 'waiter', 'wake', 'walk', 'walker', 'wall', 'wallet', 'walnut', 'walrus', 'wampum', 'war', 'warden', 'warmth', 'wash', 'washer', 'wasp', 'waste', 'watch', 'water', 'wave', 'wax', 'way', 'wealth', 'weapon', 'wear', 'weasel', 'web', 'wedge', 'weed', 'weeder', 'week', 'weight', 'weird', 'well', 'west', 'whale', 'wharf', 'wheat', 'wheel', 'while', 'whip', 'white', 'whole', 'whorl', 'width', 'wife', 'will', 'willow', 'win', 'wind', 'window', 'wine', 'wing', 'winner', 'winter', 'wire', 'wisdom', 'wish', 'witch', 'wolf', 'wombat', 'women', 'wonder', 'wood', 'wool', 'woolen', 'word', 'work', 'worker', 'world', 'worm', 'worry', 'worth', 'worthy', 'wound', 'wrap', 'wren', 'wrench', 'wrist', 'writer', 'wrong', 'yacht', 'yak', 'yam', 'yard', 'yarn', 'yawl', 'year', 'yeast', 'yellow', 'yew', 'yin', 'yoga', 'yogurt', 'yoke', 'you', 'young', 'youth', 'yurt', 'zebra', 'zephyr', 'zinc', 'zipper', 'zither', 'zone', 'zoo'];
  var adverbs = ['ably', 'acidly', 'airily', 'ally', 'amply', 'apply', 'aptly', 'archly', 'avidly', 'badly', 'baldly', 'barely', 'basely', 'belly', 'bodily', 'boldly', 'bubbly', 'bully', 'burly', 'busily', 'calmly', 'chilly', 'coldly', 'comely', 'comply', 'coolly', 'cosily', 'costly', 'coyly', 'cuddly', 'curly', 'curtly', 'daily', 'dally', 'damply', 'darkly', 'deadly', 'dearly', 'deeply', 'deftly', 'dimly', 'direly', 'doily', 'dolly', 'doubly', 'dourly', 'drily', 'dryly', 'dually', 'dully', 'duly', 'dumbly', 'early', 'easily', 'edgily', 'eerily', 'evenly', 'evilly', 'fairly', 'family', 'feebly', 'fiddly', 'filly', 'finely', 'firmly', 'fitly', 'flatly', 'fly', 'folly', 'fondly', 'foully', 'freely', 'frilly', 'fully', 'gadfly', 'gaily', 'gamely', 'gangly', 'gently', 'giggly', 'gladly', 'glibly', 'glumly', 'godly', 'golly', 'goodly', 'googly', 'grimly', 'grisly', 'gully', 'hardly', 'hazily', 'highly', 'hilly', 'holly', 'holy', 'homely', 'homily', 'hotly', 'hourly', 'hugely', 'humbly', 'icily', 'idly', 'imply', 'jangly', 'jelly', 'jokily', 'jolly', 'justly', 'keenly', 'kindly', 'kingly', 'lamely', 'lastly', 'lately', 'lazily', 'likely', 'lily', 'limply', 'lively', 'lolly', 'lonely', 'lordly', 'loudly', 'lovely', 'lowly', 'madly', 'mainly', 'manly', 'mayfly', 'mealy', 'meanly', 'measly', 'meekly', 'merely', 'mildly', 'mostly', 'mutely', 'namely', 'nearly', 'neatly', 'newly', 'nicely', 'nimbly', 'nobly', 'nosily', 'numbly', 'oddly', 'oily', 'only', 'openly', 'orally', 'overly', 'palely', 'partly', 'pearly', 'pebbly', 'pertly', 'pimply', 'ply', 'poorly', 'portly', 'primly', 'purely', 'rally', 'rarely', 'rashly', 'really', 'rely', 'reply', 'richly', 'ripely', 'rosily', 'rudely', 'sadly', 'safely', 'sagely', 'sally', 'sanely', 'scaly', 'seemly', 'shyly', 'sickly', 'silly', 'simply', 'singly', 'slily', 'slowly', 'sly', 'slyly', 'smelly', 'smugly', 'snugly', 'softly', 'solely', 'sorely', 'sourly', 'stably', 'steely', 'subtly', 'sully', 'supply', 'surely', 'surly', 'tally', 'tamely', 'tartly', 'tautly', 'termly', 'thinly', 'tidily', 'timely', 'tingly', 'tinkly', 'triply', 'truly', 'ugly', 'unduly', 'unholy', 'unruly', 'vainly', 'vastly', 'viably', 'vilely', 'waggly', 'wanly', 'warily', 'warmly', 'wavily', 'weakly', 'weekly', 'wetly', 'wholly', 'widely', 'wifely', 'wildly', 'wily', 'wisely', 'wobbly', 'woolly', 'wryly', 'yearly'];
  var interjections = ['aha', 'ahem', 'ahh', 'ahoy', 'alas', 'arg', 'aw', 'bam', 'bingo', 'blah', 'boo', 'bravo', 'brrr', 'cheers', 'dang', 'drat', 'darn', 'duh', 'eek', 'eh', 'encore', 'eureka', 'gee', 'golly', 'gosh', 'haha', 'hello', 'hey', 'hmm', 'huh', 'humph', 'hurray', 'oh', 'oh my', 'oops', 'ouch', 'ow', 'phew', 'phooey', 'pooh', 'pow', 'rats', 'shh', 'shoo', 'thanks', 'there', 'uh-huh', 'uh-oh', 'ugh', 'wahoo', 'well', 'whoa', 'whoops', 'wow', 'yeah', 'yes', 'yikes', 'yippee', 'yo', 'yuck'];
  var adjectives = ['abject', 'abrupt', 'absent', 'absurd', 'active', 'acute', 'adept', 'adroit', 'aerial', 'agile', 'airy', 'alert', 'aloof', 'amoral', 'amused', 'angry', 'apt', 'arch', 'ardent', 'artful', 'august', 'aural', 'avowed', 'awful', 'bad', 'banal', 'basic', 'bawdy', 'benign', 'bitter', 'bland', 'blank', 'bleak', 'blind', 'blithe', 'blunt', 'boyish', 'brave', 'breezy', 'brief', 'bright', 'broad', 'broken', 'busy', 'cagy', 'cm', 'candid', 'canny', 'carnal', 'casual', 'catty', 'caudal', 'chaste', 'cheeky', 'clear', 'clever', 'clinic', 'clumsy', 'coarse', 'cocky', 'cogent', 'cold', 'conic', 'coward', 'coy', 'cozy', 'crass', 'craven', 'crazy', 'creepy', 'crude', 'curt', 'cute', 'cynic', 'dainty', 'dark', 'dazed', 'dear', 'decent', 'deep', 'deft', 'demure', 'dense', 'dim', 'dire', 'dismal', 'dizzy', 'dogged', 'droll', 'dry', 'dull', 'eager', 'easy', 'eerie', 'equal', 'erect', 'erotic', 'ethic', 'even', 'evil', 'exact', 'exotic', 'faint', 'false', 'famous', 'fatal', 'faulty', 'feeble', 'firm', 'fishy', 'fixed', 'flabby', 'flashy', 'flat', 'fleet', 'flimsy', 'floppy', 'fluent', 'fluid', 'fond', 'foul', 'frail', 'frank', 'free', 'fresh', 'frisky', 'frugal', 'funny', 'fussy', 'futile', 'fuzzy', 'game', 'garish', 'gauche', 'gaudy', 'gawky', 'genial', 'gent', 'glad', 'glib', 'glum', 'grand', 'grave', 'great', 'greedy', 'grimy', 'groggy', 'gross', 'guilty', 'happy', 'hardy', 'harsh', 'hasty', 'hazy', 'heated', 'hectic', 'heroic', 'hoarse', 'honest', 'hot', 'huge', 'humane', 'humble', 'hungry', 'husky', 'icy', 'inept', 'insane', 'ireful', 'ironic', 'jaded', 'jaunty', 'jerky', 'jocose', 'joking', 'jolly', 'jovial', 'joyful', 'juicy', 'just', 'keen', 'lame', 'lavish', 'lax', 'lazy', 'lewd', 'light', 'limp', 'livid', 'logic', 'loose', 'loud', 'loving', 'loyal', 'lubber', 'lucid', 'lucky', 'lurid', 'lusty', 'mad', 'magic', 'manful', 'marked', 'mature', 'meager', 'mean', 'meek', 'menial', 'merry', 'messy', 'metric', 'mighty', 'mild', 'minute', 'miser', 'modest', 'moist', 'moody', 'moral', 'morbid', 'murky', 'music', 'mute', 'naive', 'naked', 'narrow', 'nasty', 'neat', 'nice', 'nimble', 'noble', 'noisy', 'normal', 'nosy', 'numb', 'oafish', 'opaque', 'pert', 'pesky', 'physic', 'pious', 'pithy', 'placid', 'plain', 'poetic', 'polite', 'poor', 'prim', 'prissy', 'proper', 'proud', 'public', 'pure', 'quaint', 'queer', 'quick', 'quiet', 'rabid', 'racy', 'raging', 'rakish', 'random', 'rank', 'rapid', 'rapt', 'rare', 'rash', 'raving', 'ready', 'regal', 'remote', 'rich', 'right', 'rigid', 'ripe', 'ritual', 'robust', 'rosy', 'rough', 'royal', 'rude', 'rueful', 'rugged', 'sad', 'safe', 'sane', 'saucy', 'savage', 'scant', 'secret', 'secure', 'sedate', 'serene', 'severe', 'sexy', 'sexual', 'shaky', 'sharp', 'shoddy', 'showy', 'shrewd', 'shy', 'silent', 'simple', 'skimpy', 'slack', 'sleazy', 'sleek', 'slick', 'slight', 'slow', 'smart', 'smooth', 'smug', 'snooty', 'snug', 'sober', 'soft', 'soggy', 'solemn', 'somber', 'sordid', 'sore', 'sound', 'sour', 'spry', 'square', 'staid', 'stark', 'static', 'steady', 'stern', 'stiff', 'stingy', 'stoic', 'stolid', 'stormy', 'stout', 'strict', 'strong', 'stuffy', 'stupid', 'suave', 'subtle', 'sudden', 'sudden', 'sulky', 'sullen', 'superb', 'supp', 'sure', 'swanky', 'swift', 'tacit', 'tacky', 'tame', 'tardy', 'tart', 'taut', 'tense', 'tepid', 'terse', 'testy', 'thick', 'thin', 'tidy', 'tight', 'timid', 'tonal', 'tough', 'tragic', 'trim', 'trite', 'true', 'trying', 'turgid', 'uneasy', 'unique', 'unkind', 'unsafe', 'urgent', 'useful', 'vague', 'vain', 'vexed', 'visual', 'vital', 'vivid', 'vocal', 'vulgar', 'wan', 'wanton', 'warm', 'weak', 'weird', 'wicked', 'wide', 'wild', 'wise', 'witty', 'woeful', 'wrong', 'wry'];
  var verbed = new Proxy(verbs, {
    get: function get(arr, prop) {
      // Check it's not a property
      if (!(prop in [])) {
        return getPastTense(arr[prop]);
      } else {
        return arr[prop];
      }
    }
  });

  var WORDLISTS = /*#__PURE__*/Object.freeze({
    verbs: verbs,
    nouns: nouns,
    adverbs: adverbs,
    interjections: interjections,
    adjectives: adjectives,
    verbed: verbed
  });

  // import * as WORDLISTS from WORDLIST_URL

  function _templateObject() {
    var data = _taggedTemplateLiteral(["\n            ", "\n        "]);

    _templateObject = function _templateObject() {
      return data;
    };

    return data;
  }

  console.log(WORDLISTS); // Extend the LitElement base class

  var RandomSentenceGenerator =
  /*#__PURE__*/
  function (_LitElement) {
    _inherits(RandomSentenceGenerator, _LitElement);

    _createClass(RandomSentenceGenerator, null, [{
      key: "properties",

      /**
       * Implement `render` to define a template for your element.
       *
       * You must provide an implementation of `render` for any element
       * that uses LitElement as a base class.
       */
      get: function get() {
        return {
          template: {
            type: String,
            attribute: 'template'
          },
          parsedString: {
            type: String
            /*,
            computed: 'parse(template)' */

          },
          fetchedWordlistCount: {
            type: Number,
            value: 0
          },
          capitalize: {
            type: Boolean
          },
          partsOfSpeechMap: {
            type: Object
          },
          templateEntropy: {
            type: Number,
            reflect: true,
            attribute: 'template-entropy'
          },
          maxWordLength: {
            type: Number,
            attribute: 'max-word-length'
          }
        };
      }
    }]);

    function RandomSentenceGenerator() {
      var _this;

      _classCallCheck(this, RandomSentenceGenerator);

      _this = _possibleConstructorReturn(this, _getPrototypeOf(RandomSentenceGenerator).call(this)); // Properties

      _this.template = 'adjective noun verb adverb.';
      _this.maxWordLength = 0; // disabled

      _this.parsedString = '';
      _this.fetchedWordlistCount = 0;
      _this.capitalize = true;
      _this.partsOfSpeechMap = {
        'noun': 'nouns',
        'adverb': 'adverbs',
        'adv': 'adverbs',
        'verb': 'verbs',
        'interjection': 'interjections',
        'adjective': 'adjectives',
        'adj': 'adjectives',
        'verbed': 'verbed'
      };
      _this.partsOfSpeech = Object.keys(_this.partsOfSpeechMap);
      _this._wordlists = WORDLISTS;
      return _this;
    }

    _createClass(RandomSentenceGenerator, [{
      key: "updated",
      value: function updated(changedProperties) {
        var _this2 = this;

        // console.log('changed properties')
        // console.log(changedProperties) // logs previous values
        var regen = false;

        if (changedProperties.has('template')) {
          regen = true;
        }

        if (changedProperties.has('maxWordLength')) {
          console.dir(this.maxWordLength);

          if (this.maxWordLength) {
            var wl = _objectSpread({}, this._wordlists);

            for (var partOfSpeech in this._wordlists) {
              console.log(this._wordlists[partOfSpeech]);

              if (Array.isArray(this._wordlists[partOfSpeech])) {
                wl[partOfSpeech] = this._wordlists[partOfSpeech].filter(function (word) {
                  return word.length <= _this2.maxWordLength;
                });
              }
            }

            this._wordlists = wl;
          }

          regen = true;
        }

        if (regen) this.generate(); // if (changedProperties.has('templateEntropy')) {
        //     this.
        // }
      }
    }, {
      key: "_RNG",
      value: function _RNG(entropy) {
        if (entropy > 1074) {
          throw new Error('Javascript can not handle that much entropy!');
        }

        var randNum = 0;
        var crypto = window.crypto || window.msCrypto;

        if (crypto) {
          var entropy256 = Math.ceil(entropy / 8);
          var buffer = new Uint8Array(entropy256);
          crypto.getRandomValues(buffer);
          randNum = buffer.reduce(function (num, value) {
            return num * value;
          }, 1) / Math.pow(256, entropy256);
        } else {
          console.warn('Secure RNG not found. Using Math.random');
          randNum = Math.random();
        }

        return randNum;
      }
    }, {
      key: "setRNG",
      value: function setRNG(fn) {
        this._RNG = fn;
      }
    }, {
      key: "_captitalize",
      value: function _captitalize(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
      }
    }, {
      key: "getWord",
      value: function getWord(partOfSpeech) {
        var words = this._wordlists[this.partsOfSpeechMap[partOfSpeech]];
        var requiredEntropy = Math.log(words.length) / Math.log(2);
        var index = this._RNG(requiredEntropy) * words.length;
        return {
          word: words[Math.round(index)],
          entropy: words.length
        };
      }
    }, {
      key: "generate",
      value: function generate() {
        this.parsedString = this.parse(this.template);
      }
    }, {
      key: "parse",
      value: function parse(template) {
        var _this3 = this;

        var split = template.split(/[\s]/g);
        var entropy = 1;
        var final = split.map(function (word) {
          var lower = word.toLowerCase();

          _this3.partsOfSpeech.some(function (partOfSpeech) {
            var partOfSpeechIndex = lower.indexOf(partOfSpeech); // Check it exists

            var nextChar = word.charAt(partOfSpeech.length);

            if (partOfSpeechIndex === 0 && !(nextChar && nextChar.match(/[a-zA-Z]/g) != null)) {
              var replacement = _this3.getWord(partOfSpeech);

              word = replacement.word + word.slice(partOfSpeech.length); // Append the rest of the "word" (punctuation)

              entropy = entropy * replacement.entropy;
              return true;
            }
          });

          return word;
        });
        this.templateEntropy = Math.floor(Math.log(entropy) / Math.log(8)); // console.log('parsing ' + template)

        return (
          /* this.templateEntropy + ' - ' + */
          final.join(' ')
        );
      }
    }, {
      key: "render",
      value: function render() {
        /**
         * `render` must return a lit-html `TemplateResult`.
         *
         * To create a `TemplateResult`, tag a JavaScript template literal
         * with the `html` helper function:
         */
        return html(_templateObject(), this.parsedString);
      }
    }]);

    return RandomSentenceGenerator;
  }(LitElement); // Register the new element with the browser.


  customElements.define('random-sentence-generator', RandomSentenceGenerator);

  return RandomSentenceGenerator;

}));
