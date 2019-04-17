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
//# sourceMappingURL=directive.js.map

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
//# sourceMappingURL=dom.js.map

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
//# sourceMappingURL=part.js.map

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
//# sourceMappingURL=template.js.map

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
//# sourceMappingURL=template-instance.js.map

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
//# sourceMappingURL=template-result.js.map

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
//# sourceMappingURL=parts.js.map

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
//# sourceMappingURL=default-template-processor.js.map

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
//# sourceMappingURL=template-factory.js.map

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
//# sourceMappingURL=render.js.map

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
//# sourceMappingURL=lit-html.js.map

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
//# sourceMappingURL=modify-template.js.map

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
//# sourceMappingURL=shady-render.js.map

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
//# sourceMappingURL=updating-element.js.map

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
//# sourceMappingURL=decorators.js.map

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
//# sourceMappingURL=css-tag.js.map

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
//# sourceMappingURL=lit-element.js.map

// Sourced from https://gist.github.com/letsgetrandy/1e05a68ea74ba6736eb5

const EXCEPTIONS = {
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

const getPastTense = (verb, exceptions = EXCEPTIONS) => {
    if (exceptions[verb]) {
        return exceptions[verb]
    }
    if ((/e$/i).test(verb)) {
        return verb + 'd'
    }
    if ((/[aeiou]c$/i).test(verb)) {
        return verb + 'ked'
    }
    // for american english only
    if ((/el$/i).test(verb)) {
        return verb + 'ed'
    }
    if ((/[aeio][aeiou][dlmnprst]$/).test(verb)) {
        return verb + 'ed'
    }
    if ((/[aeiou][bdglmnprst]$/i).test(verb)) {
        return verb.replace(/(.+[aeiou])([bdglmnprst])/, '$1$2$2ed')
    }
    return verb + 'ed'
};

const verbs = [
    'abandon', 'abase', 'abate', 'abbreviate', 'abdicate', 'abduct', 'abet', 'abhor', 'abide', 'abjure', 'ablate', 'abolish', 'abominate', 'abort', 'abound', 'abridge', 'abrogate', 'abscond', 'abseil', 'absolve', 'absorb', 'abstain', 'abuse', 'abut', 'accede', 'accelerate', 'accent', 'accentuate', 'accept', 'access', 'accession', 'acclaim', 'acclimatize', 'accommodate', 'accompany', 'accomplish', 'accord', 'accost', 'account', 'accredit', 'accrue', 'accumulate', 'accuse', 'accustom', 'ache', 'achieve', 'acidify', 'acknowledge', 'acquaint', 'acquiesce', 'acquire', 'acquit', 'act', 'activate', 'actuate', 'adapt', 'add', 'addict', 'addle', 'address', 'adduce', 'adhere', 'adjoin', 'adjourn', 'adjudicate', 'adjust', 'administer', 'administrate', 'admire', 'admit', 'admonish', 'adopt', 'adore', 'adorn', 'adulterate', 'adumbrate', 'advance', 'advantage', 'adventure', 'advert', 'advertise', 'advise', 'advocate', 'aerate', 'affect', 'affiliate', 'affirm', 'affix', 'afflict', 'afford', 'affront', 'age', 'aggravate', 'aggregate', 'agitate', 'agonize', 'agree', 'aid', 'aim', 'alarm', 'alert', 'alienate', 'alight', 'align', 'allay', 'allege', 'alleviate', 'allocate', 'allot', 'allow', 'alloy', 'allure', 'ally', 'alter', 'altercate', 'alternate', 'amalgamate', 'amass', 'amaze', 'amble', 'ambuscade', 'ambush', 'ameliorate', 'amend', 'amortize', 'amount', 'amplify', 'amputate', 'amuse', 'anagram', 'analogize', 'anger', 'angle', 'anguish', 'animate', 'anneal', 'annex', 'annihilate', 'annotate', 'announce', 'annoy', 'annul', 'anoint', 'answer', 'antagonize', 'antedate', 'anticipate', 'antidote', 'antique', 'ape', 'apologize', 'apparel', 'appeal', 'appear', 'appease', 'append', 'appertain', 'applaud', 'apply', 'appoint', 'apportion', 'appraise', 'appreciate', 'apprehend', 'apprentice', 'apprise', 'approach', 'appropriate', 'approve', 'approximate', 'arbitrage', 'arbitrate', 'arc', 'arch', 'archive', 'argue', 'arise', 'arm', 'arrange', 'array', 'arrest', 'arrive', 'arrow', 'article', 'articulate', 'ascend', 'ascertain', 'ascribe', 'ask', 'asphyxiate', 'aspire', 'assail', 'assassinate', 'assault', 'assay', 'assemble', 'assent', 'assert', 'assess', 'assign', 'assimilate', 'assist', 'associate', 'assort', 'assuage', 'assume', 'assure', 'astonish', 'astound', 'atone', 'atrophy', 'attach', 'attack', 'attain', 'attempt', 'attend', 'attenuate', 'attest', 'attire', 'attract', 'attribute', 'attune', 'auction', 'audit', 'audition', 'augment', 'augur', 'authenticate', 'author', 'authorize', 'autograph', 'automate', 'autopsy', 'avail', 'avalanche', 'avenge', 'aver', 'average', 'avert', 'avoid', 'await', 'awake', 'awaken', 'award', 'awe', 'babble', 'babysit', 'back', 'backdate', 'backfire', 'background', 'backhand', 'backlight', 'backlog', 'backpack', 'backspace', 'backstroke', 'backtrack', 'badge', 'badger', 'badinage', 'baffle', 'bag', 'bail', 'bait', 'bake', 'balance', 'bald', 'bale', 'ball', 'ballast', 'balloon', 'ballot', 'ballyhoo', 'ban', 'band', 'bandy', 'bang', 'banish', 'bank', 'bankrupt', 'banquet', 'banter', 'baptize', 'bar', 'barb', 'barber', 'bard', 'bare', 'bargain', 'barge', 'bark', 'barn', 'barrack', 'barrage', 'barrel', 'barricade', 'barter', 'base', 'bash', 'bask', 'baste', 'bat', 'batch', 'bathe', 'batten', 'batter', 'battle', 'bawl', 'bay', 'bayonet', 'be', 'beach', 'beacon', 'bead', 'beam', 'bean', 'bear', 'beard', 'beat', 'become', 'bed', 'bedevil', 'beef', 'beep', 'beetle', 'befall', 'befit', 'befriend', 'befuddle', 'beg', 'beget', 'beggar', 'begin', 'begrudge', 'beguile', 'behave', 'behead', 'behold', 'belay', 'belch', 'belie', 'believe', 'belittle', 'bell', 'bellow', 'belly', 'belong', 'belt', 'bemoan', 'bench', 'bend', 'benefit', 'bequeath', 'berate', 'berry', 'beseech', 'beset', 'besiege', 'besmirch', 'bespeak', 'best', 'bestir', 'bestow', 'bestride', 'bet', 'betide', 'betoken', 'betray', 'better', 'bevel', 'bewail', 'beware', 'bewilder', 'bewitch', 'bias', 'bib', 'bicker', 'bicycle', 'bid', 'bide', 'bilge', 'bill', 'billboard', 'billet', 'billow', 'bin', 'bind', 'birdie', 'birth', 'bisect', 'bit', 'bite', 'bitter', 'bivouac', 'blabber', 'black', 'blacken', 'blackguard', 'blackjack', 'blacklist', 'blackmail', 'blame', 'blanch', 'blank', 'blanket', 'blare', 'blaspheme', 'blast', 'blaze', 'bleach', 'bleat', 'bleed', 'bleep', 'blench', 'blend', 'bless', 'blight', 'blind', 'blindfold', 'blink', 'blinker', 'blip', 'bliss', 'blister', 'blitz', 'bloat', 'blob', 'blood', 'bloody', 'bloom', 'blossom', 'blot', 'blotch', 'blow', 'blubber', 'bludgeon', 'blue', 'blueprint', 'bluff', 'blunder', 'blunt', 'blur', 'blurb', 'blurt', 'blush', 'bluster', 'board', 'boast', 'bob', 'bode', 'body', 'bodyguard', 'bog', 'bogey', 'boggle', 'boil', 'bolt', 'bomb', 'bombard', 'bond', 'bone', 'bonnet', 'boo', 'book', 'boom', 'boost', 'boot', 'bootleg', 'bootstrap', 'booze', 'bop', 'bore', 'borrow', 'boss', 'botch', 'bother', 'bottle', 'bottleneck', 'bottom', 'bounce', 'bound', 'bout', 'bow', 'bowel', 'bowl', 'box', 'boycott', 'brace', 'bracket', 'brag', 'braid', 'brainstorm', 'brainwash', 'braise', 'brake', 'branch', 'brand', 'brandish', 'brave', 'brawl', 'bray', 'breach', 'bread', 'break', 'breakfast', 'breathe', 'breed', 'breeze', 'brew', 'bribe', 'brick', 'bridge', 'bridle', 'brief', 'brighten', 'brim', 'brine', 'bring', 'bristle', 'brittle', 'broach', 'broadcast', 'broaden', 'broadside', 'brocade', 'broil', 'bronze', 'brook', 'browbeat', 'brown', 'browse', 'bruise', 'brush', 'brutalize', 'bubble', 'buck', 'bucket', 'buckle', 'bud', 'budge', 'budget', 'buffet', 'bug', 'bugle', 'build', 'bulge', 'bulk', 'bull', 'bulldog', 'bulldoze', 'bulletproof', 'bully', 'bulwark', 'bumble', 'bump', 'bunch', 'bundle', 'bung', 'bungle', 'bunk', 'bunker', 'buoy', 'burble', 'burden', 'burgeon', 'burgle', 'burlesque', 'burn', 'burp', 'burr', 'burrow', 'burst', 'bury', 'bus', 'bush', 'busk', 'bust', 'bustle', 'busy', 'butt', 'butterfly', 'button', 'buttonhole', 'buy', 'buzz', 'bypass', 'cab', 'cabal', 'cabin', 'cable', 'cache', 'cackle', 'cadence', 'cadge', 'cage', 'cajole', 'cake', 'calculate', 'calendar', 'calibrate', 'caliper', 'call', 'callous', 'calm', 'calumniate', 'calve', 'camber', 'camouflage', 'camp', 'campaign', 'can', 'canal', 'cancel', 'candle', 'candy', 'cane', 'cannibalize', 'cannon', 'canoe', 'canonize', 'canopy', 'cant', 'canter', 'cantilever', 'canvass', 'cap', 'caper', 'capitalize', 'capitulate', 'capsize', 'capsule', 'captain', 'caption', 'captivate', 'capture', 'caravan', 'carbonate', 'card', 'care', 'career', 'caress', 'caricature', 'carol', 'carouse', 'carp', 'carpenter', 'carpet', 'carry', 'cart', 'cartwheel', 'carve', 'cascade', 'case', 'cash', 'cashier', 'cast', 'castigate', 'castle', 'castrate', 'cat', 'catapult', 'catch', 'categorize', 'cater', 'caterwaul', 'caucus', 'cause', 'cauterize', 'caution', 'cave', 'cavern', 'cease', 'cede', 'celebrate', 'cellar', 'cement', 'censor', 'censure', 'centralize', 'centrifuge', 'certificate', 'certify', 'chafe', 'chagrin', 'chain', 'chain-smoke', 'chair', 'chalk', 'challenge', 'chamber', 'chamois', 'champ', 'champion', 'chance', 'change', 'channel', 'chant', 'chap', 'chapter', 'char', 'characterize', 'charge', 'chariot', 'charm', 'chart', 'charter', 'chase', 'chastise', 'chat', 'chatter', 'cheapen', 'cheat', 'check', 'checker', 'checkmate', 'cheep', 'cheer', 'cherish', 'chew', 'chicane', 'chide', 'chill', 'chime', 'chin', 'chink', 'chip', 'chirp', 'chisel', 'chock', 'choir', 'choke', 'choose', 'chop', 'chopper', 'chord', 'chortle', 'chorus', 'christen', 'chrome', 'chronicle', 'chuck', 'chuckle', 'chuff', 'chug', 'chum', 'chunk', 'churn', 'chute', 'cinder', 'cipher', 'circle', 'circuit', 'circularize', 'circulate', 'circumcise', 'circumflex', 'circumnavigate', 'circumscribe', 'circumvent', 'cite', 'civilize', 'clad', 'claim', 'clam', 'clamber', 'clamp', 'clang', 'clank', 'clap', 'clarify', 'clash', 'clasp', 'class', 'classify', 'clatter', 'claw', 'clean', 'cleanse', 'clear', 'clear-cut', 'cleat', 'cleave', 'clench', 'clerk', 'click', 'climax', 'climb', 'clinch', 'cling', 'clink', 'clip', 'clique', 'cloak', 'clock', 'clog', 'cloister', 'clone', 'close', 'closet', 'closure', 'clot', 'cloud', 'clout', 'clown', 'club', 'cluck', 'clue', 'clump', 'cluster', 'clutch', 'clutter', 'co-star', 'coach', 'coagulate', 'coal', 'coalesce', 'coast', 'coat', 'coax', 'cobble', 'cobweb', 'cockle', 'cocoon', 'coddle', 'code', 'codify', 'coerce', 'coexist', 'coffer', 'coffin', 'cog', 'cogitate', 'cohere', 'coil', 'coin', 'coincide', 'coke', 'collaborate', 'collapse', 'collar', 'collate', 'collect', 'collide', 'collude', 'colonize', 'comb', 'combat', 'combine', 'come', 'comfort', 'command', 'commandeer', 'commemorate', 'commence', 'commend', 'comment', 'commentate', 'commiserate', 'commission', 'commit', 'commune', 'communicate', 'commute', 'compact', 'companion', 'compare', 'compass', 'compassionate', 'compel', 'compensate', 'compete', 'compile', 'complain', 'complement', 'complete', 'complicate', 'compliment', 'comply', 'comport', 'compose', 'composite', 'compost', 'compound', 'comprehend', 'compress', 'comprise', 'compromise', 'compute', 'con', 'concatenate', 'concave', 'conceal', 'concede', 'conceive', 'concentrate', 'concern', 'conciliate', 'conclude', 'concoct', 'concrete', 'concur', 'condemn', 'condense', 'condescend', 'condition', 'condole', 'condone', 'conduct', 'cone', 'confabulate', 'confederate', 'confer', 'confess', 'confide', 'configure', 'confine', 'confirm', 'confiscate', 'conflict', 'conform', 'confound', 'confront', 'confuse', 'congeal', 'congest', 'conglomerate', 'congratulate', 'congregate', 'congress', 'conjecture', 'conjoin', 'conjugate', 'conjure', 'connect', 'connive', 'connote', 'conquer', 'conscript', 'consecrate', 'consent', 'conserve', 'consider', 'consign', 'consist', 'console', 'consolidate', 'consort', 'conspire', 'constitute', 'constrain', 'constrict', 'construct', 'construe', 'consult', 'consume', 'consummate', 'contact', 'contain', 'contaminate', 'contemplate', 'contend', 'contest', 'continue', 'contort', 'contour', 'contract', 'contradict', 'contrast', 'contravene', 'contribute', 'contrive', 'control', 'contuse', 'convalesce', 'convect', 'convene', 'converge', 'converse', 'convert', 'convey', 'convict', 'convince', 'convolve', 'convoy', 'convulse', 'cook', 'cool', 'cooperate', 'coordinate', 'cope', 'copper', 'copulate', 'copy', 'copycat', 'copyright', 'cord', 'cordon', 'corduroy', 'core', 'cork', 'corkscrew', 'corn', 'corner', 'cornice', 'corral', 'correct', 'correlate', 'correspond', 'corroborate', 'corrode', 'corrupt', 'cosset', 'cost', 'costume', 'cotton', 'couch', 'cough', 'counsel', 'count', 'countenance', 'counter', 'counteract', 'counterbalance', 'counterfeit', 'counterpoint', 'counterpoise', 'countersign', 'counterweight', 'couple', 'course', 'court', 'court-martial', 'covenant', 'cover', 'covet', 'cowl', 'cox', 'crab', 'crack', 'crackle', 'cradle', 'craft', 'cram', 'cramp', 'crane', 'crank', 'crash', 'crate', 'crater', 'crave', 'crawl', 'crayon', 'craze', 'creak', 'cream', 'crease', 'create', 'credit', 'creed', 'creep', 'cremate', 'creosote', 'crescendo', 'crest', 'crew', 'crib', 'crick', 'crimp', 'cringe', 'crinkle', 'cripple', 'crisp', 'criticize', 'critique', 'croak', 'crochet', 'crook', 'croon', 'crop', 'croquet', 'cross', 'cross-check', 'cross-examine', 'cross-refer', 'cross-reference', 'cross-section', 'crouch', 'crowd', 'crown', 'crucify', 'cruise', 'crumble', 'crumple', 'crunch', 'crusade', 'crush', 'crust', 'crutch', 'cry', 'crystallize', 'cube', 'cuckoo', 'cuddle', 'cudgel', 'cue', 'cuff', 'cuirass', 'cull', 'culminate', 'cultivate', 'culture', 'cup', 'curb', 'curd', 'curdle', 'cure', 'curl', 'curry', 'curse', 'curtail', 'curtain', 'curve', 'cuss', 'customize', 'cut', 'cycle', 'dab', 'dabble', 'dagger', 'dally', 'dam', 'damage', 'damn', 'damp', 'dampen', 'dance', 'dangle', 'dapple', 'dare', 'darken', 'darn', 'dart', 'dash', 'date', 'dateline', 'daub', 'daunt', 'dawdle', 'daze', 'dazzle', 'deactivate', 'deaden', 'deadlock', 'deadpan', 'deafen', 'deal', 'debar', 'debase', 'debate', 'debauch', 'debilitate', 'debit', 'debrief', 'debug', 'debut', 'decaffeinate', 'decamp', 'decant', 'decapitate', 'decay', 'decease', 'deceive', 'decelerate', 'decentralize', 'decide', 'decimate', 'decipher', 'deck', 'declaim', 'declare', 'decline', 'decode', 'decommission', 'decompose', 'decompress', 'deconstruct', 'decorate', 'decouple', 'decoy', 'decrease', 'decree', 'decry', 'decrypt', 'dedicate', 'deduce', 'deduct', 'deem', 'deep-freeze', 'deepen', 'deface', 'defame', 'default', 'defeat', 'defecate', 'defect', 'defence', 'defend', 'defer', 'defile', 'define', 'deflate', 'deflect', 'deflower', 'deform', 'defraud', 'defray', 'defrost', 'defuse', 'defy', 'degauss', 'degenerate', 'degrade', 'degrease', 'dehydrate', 'deify', 'deign', 'delay', 'delegate', 'delete', 'deliberate', 'delight', 'delimit', 'delineate', 'deliver', 'delude', 'deluge', 'delve', 'demagnetize', 'demagogue', 'demand', 'demarcate', 'dematerialize', 'demean', 'demise', 'demolish', 'demonstrate', 'demoralize', 'demote', 'demount', 'demur', 'demystify', 'den', 'denigrate', 'denote', 'denounce', 'dent', 'denude', 'deny', 'depart', 'depend', 'depict', 'deplete', 'deplore', 'deploy', 'deport', 'depose', 'deposit', 'deprave', 'deprecate', 'depreciate', 'depress', 'deprive', 'depute', 'derail', 'deregulate', 'deride', 'derive', 'derogate', 'descant', 'descend', 'describe', 'desecrate', 'desert', 'deserve', 'design', 'designate', 'desire', 'desist', 'desolate', 'despair', 'despise', 'despite', 'despoil', 'despond', 'destabilize', 'destine', 'destitute', 'destroy', 'destruct', 'detach', 'detail', 'detain', 'detect', 'deter', 'deteriorate', 'determinate', 'determine', 'detest', 'dethrone', 'detonate', 'detour', 'detract', 'devalue', 'devastate', 'develop', 'deviate', 'devil', 'devise', 'devolve', 'devote', 'devour', 'diagnose', 'diagram', 'dial', 'diaper', 'dice', 'dictate', 'die', 'diet', 'differ', 'differentiate', 'diffract', 'diffuse', 'dig', 'digest', 'digitize', 'dignify', 'digress', 'dilate', 'dilute', 'dim', 'diminish', 'dimple', 'din', 'dine', 'dint', 'dip', 'direct', 'disable', 'disabuse', 'disadvantage', 'disaffiliate', 'disagree', 'disallow', 'disambiguate', 'disappear', 'disappoint', 'disapprove', 'disarm', 'disarray', 'disassemble', 'disassociate', 'disavow', 'disband', 'disbelieve', 'disburse', 'disc', 'discard', 'discern', 'discharge', 'discipline', 'disclaim', 'disclose', 'disco', 'discomfit', 'discomfort', 'disconcert', 'disconnect', 'discontent', 'discontinue', 'discount', 'discourage', 'discourse', 'discover', 'discredit', 'discriminate', 'discuss', 'disdain', 'disembowel', 'disenfranchise', 'disengage', 'disentangle', 'disestablish', 'disfigure', 'disfranchise', 'disgorge', 'disgrace', 'disguise', 'disgust', 'dish', 'disillusion', 'disinfect', 'disinherit', 'disintegrate', 'disinter', 'disinvest', 'disjoint', 'dislike', 'dislocate', 'dislodge', 'dismantle', 'dismay', 'dismember', 'dismiss', 'dismount', 'disobey', 'disorder', 'disorganize', 'disorient', 'disown', 'disparage', 'dispatch', 'dispel', 'dispense', 'disperse', 'displace', 'display', 'displease', 'dispose', 'dispossess', 'disprove', 'dispute', 'disqualify', 'disregard', 'disrespect', 'disrobe', 'disrupt', 'dissatisfy', 'dissect', 'dissemble', 'disseminate', 'dissent', 'dissipate', 'dissociate', 'dissolve', 'dissuade', 'distance', 'distaste', 'distemper', 'distinguish', 'distort', 'distract', 'distress', 'distribute', 'district', 'distrust', 'disturb', 'disuse', 'ditch', 'dither', 'dive', 'diverge', 'diversify', 'divert', 'divest', 'divide', 'divine', 'divorce', 'divulge', 'dizzy', 'do', 'dock', 'docket', 'doctor', 'document', 'dodge', 'dog', 'dogfight', 'dole', 'doll', 'dolly', 'dome', 'dominate', 'donate', 'doodle', 'doom', 'dope', 'dose', 'dot', 'dote', 'double', 'double-cross', 'doubt', 'douse', 'dovetail', 'dowel', 'down', 'downgrade', 'download', 'downplay', 'downsize', 'dowse', 'doze', 'drab', 'draft', 'drag', 'drain', 'dramatize', 'drape', 'draw', 'drawl', 'dray', 'dread', 'dream', 'dredge', 'drench', 'dress', 'dribble', 'drift', 'drill', 'drink', 'drip', 'drip-dry', 'drive', 'drivel', 'drizzle', 'drone', 'drool', 'droop', 'drop', 'drown', 'drowse', 'drudge', 'drug', 'drum', 'dry', 'dub', 'duck', 'duel', 'duet', 'dull', 'dumb', 'dumbfound', 'dummy', 'dump', 'dun', 'dupe', 'duplicate', 'dust', 'dwarf', 'dwell', 'dwindle', 'dye', 'dynamite', 'ear', 'earn', 'ease', 'eat', 'eavesdrop', 'ebb', 'echo', 'eclipse', 'economize', 'eddy', 'edge', 'edify', 'edit', 'educate', 'efface', 'egg', 'egress', 'eighty-six', 'ejaculate', 'eject', 'elaborate', 'elapse', 'elate', 'elbow', 'elect', 'electrify', 'electrocute', 'elevate', 'elicit', 'elide', 'eliminate', 'elongate', 'elope', 'elucidate', 'elude', 'emaciate', 'emanate', 'emancipate', 'emasculate', 'embalm', 'embark', 'embarrass', 'embed', 'embellish', 'embezzle', 'embitter', 'embody', 'embolden', 'embosom', 'emboss', 'embrace', 'embroider', 'embroil', 'emerge', 'emigrate', 'emit', 'empathize', 'emphasize', 'employ', 'empower', 'empty', 'emulate', 'enable', 'enact', 'enamel', 'encamp', 'encapsulate', 'encase', 'enchant', 'encircle', 'enclave', 'enclose', 'encode', 'encompass', 'encore', 'encounter', 'encourage', 'encroach', 'encrust', 'encrypt', 'encumber', 'end', 'endanger', 'endear', 'endorse', 'endow', 'endure', 'energize', 'enervate', 'enfeeble', 'enfold', 'enforce', 'enfranchise', 'engage', 'engender', 'engineer', 'engorge', 'engrave', 'engross', 'engulf', 'enhance', 'enjoin', 'enjoy', 'enlarge', 'enlighten', 'enlist', 'enliven', 'ennoble', 'enquire', 'enrage', 'enrich', 'ensconce', 'enshrine', 'enshroud', 'enslave', 'ensnare', 'ensue', 'ensure', 'entail', 'entangle', 'enter', 'entertain', 'enthuse', 'entice', 'entitle', 'entomb', 'entrain', 'entrap', 'entreat', 'entrench', 'entrust', 'entwine', 'enumerate', 'enunciate', 'envelop', 'envisage', 'envision', 'envy', 'epitomize', 'equal', 'equalize', 'equate', 'equip', 'eradicate', 'erase', 'erect', 'erode', 'err', 'erupt', 'escalate', 'escape', 'eschew', 'escort', 'escrow', 'espouse', 'essay', 'establish', 'esteem', 'estimate', 'etch', 'eulogize', 'evacuate', 'evade', 'evaluate', 'evangelize', 'evaporate', 'evict', 'evidence', 'evince', 'eviscerate', 'evoke', 'evolve', 'exacerbate', 'exact', 'exaggerate', 'exalt', 'examine', 'example', 'exasperate', 'excavate', 'exceed', 'excel', 'except', 'excerpt', 'excess', 'exchange', 'excise', 'excite', 'exclaim', 'exclude', 'excommunicate', 'excrete', 'excuse', 'execrate', 'execute', 'exemplify', 'exempt', 'exercise', 'exert', 'exeunt', 'exhale', 'exhaust', 'exhibit', 'exhilarate', 'exhort', 'exhume', 'exile', 'exist', 'exonerate', 'exorcise', 'expand', 'expect', 'expectorate', 'expel', 'expend', 'expense', 'expiate', 'expire', 'explain', 'explicate', 'explode', 'exploit', 'explore', 'export', 'expose', 'expostulate', 'expound', 'express', 'expropriate', 'expunge', 'expurgate', 'extend', 'extenuate', 'exterminate', 'extinguish', 'extirpate', 'extol', 'extort', 'extract', 'extradite', 'extrapolate', 'extricate', 'extrude', 'exude', 'exult', 'eye', 'eyewitness', 'fable', 'fabricate', 'face', 'facet', 'facilitate', 'facsimile', 'factor', 'fade', 'fail', 'faint', 'fair', 'fake', 'fall', 'falsify', 'falter', 'fame', 'familiarize', 'fan', 'fancy', 'fantasize', 'farce', 'fare', 'farm', 'fascinate', 'fashion', 'fast', 'fasten', 'fat', 'fate', 'father', 'fathom', 'fatigue', 'fatten', 'fault', 'fawn', 'fear', 'feast', 'feature', 'fee', 'feed', 'feel', 'feign', 'fell', 'fence', 'fend', 'ferment', 'ferret', 'ferry', 'fertilize', 'fester', 'fetch', 'fettle', 'feud', 'fever', 'fib', 'fiddle', 'fidget', 'field', 'fife', 'fight', 'figure', 'file', 'filigree', 'fill', 'fillet', 'fillip', 'film', 'filter', 'filtrate', 'fin', 'finalize', 'finance', 'find', 'fine', 'fine-tune', 'finesse', 'finger', 'fingerprint', 'finish', 'fire', 'firm', 'fish', 'fissure', 'fit', 'fitter', 'fix', 'fizz', 'fizzle', 'flack', 'flag', 'flail', 'flake', 'flame', 'flank', 'flap', 'flare', 'flash', 'flat', 'flatten', 'flatter', 'flaunt', 'flaw', 'flay', 'flee', 'fleece', 'fleet', 'flesh', 'flex', 'flick', 'flicker', 'flight', 'flinch', 'fling', 'flint', 'flip', 'flip-flop', 'flit', 'float', 'flock', 'flog', 'flood', 'floodlight', 'floor', 'floorboard', 'flop', 'floss', 'flounce', 'flounder', 'flour', 'flourish', 'flout', 'flow', 'flower', 'fluctuate', 'fluff', 'fluoresce', 'flurry', 'flush', 'fluster', 'flute', 'flutter', 'flux', 'fly', 'foal', 'foam', 'fob', 'focus', 'fodder', 'fog', 'foil', 'foist', 'fold', 'foliate', 'folio', 'follow', 'foment', 'fondle', 'fool', 'foot', 'footnote', 'forage', 'foray', 'forbear', 'forbid', 'force', 'force-feed', 'ford', 'forearm', 'forecast', 'foreclose', 'foregather', 'forego', 'foresee', 'foreshadow', 'forest', 'forestall', 'foretaste', 'foretell', 'forewarn', 'forfeit', 'forge', 'forget', 'forgive', 'fork', 'form', 'formalize', 'format', 'formulate', 'forsake', 'forswear', 'fortify', 'fortune', 'forward', 'fossilize', 'foster', 'foul', 'found', 'founder', 'fowl', 'fox', 'fraction', 'fractionate', 'fracture', 'fragment', 'frame', 'franchise', 'frank', 'fraternize', 'fray', 'frazzle', 'freak', 'free', 'free-fall', 'freelance', 'freeze', 'freight', 'frenzy', 'frequent', 'fresh', 'freshen', 'fret', 'friend', 'fright', 'frighten', 'frill', 'fringe', 'frisk', 'frizzle', 'frock', 'frog', 'frolic', 'front', 'front-page', 'frost', 'frostbite', 'froth', 'frown', 'fruit', 'frustrate', 'fry', 'fudge', 'fuel', 'full', 'fulminate', 'fumble', 'fume', 'fumigate', 'fun', 'function', 'fund', 'funk', 'funnel', 'fur', 'furnish', 'furrow', 'further', 'fuse', 'fuss', 'fuzz', 'gabble', 'gad', 'gaff', 'gag', 'gaggle', 'gain', 'gainsay', 'gait', 'gall', 'gallant', 'gallop', 'galvanize', 'gamble', 'gambol', 'game', 'gang', 'gangrene', 'gap', 'gape', 'garage', 'garble', 'garden', 'gargle', 'garment', 'garner', 'garnish', 'garotte', 'garrison', 'garter', 'gas', 'gash', 'gasp', 'gate', 'gather', 'gauge', 'gavel', 'gaze', 'gazette', 'gear', 'gel', 'gem', 'gender', 'generalize', 'generate', 'gentle', 'genuflect', 'germinate', 'gerrymander', 'gesticulate', 'gesture', 'get', 'ghost', 'gibber', 'gibbet', 'giddy', 'gift', 'gig', 'giggle', 'gimlet', 'gimmick', 'gin', 'ginger', 'gird', 'girdle', 'girth', 'give', 'glad', 'gladden', 'glance', 'glare', 'glass', 'glaze', 'gleam', 'glean', 'glide', 'glimmer', 'glimpse', 'glint', 'glisten', 'glitter', 'gloat', 'globe', 'gloom', 'glorify', 'glory', 'gloss', 'glove', 'glow', 'glower', 'glue', 'glut', 'gnarl', 'gnash', 'gnaw', 'go', 'goad', 'gobble', 'golf', 'gong', 'goose', 'goose-step', 'gore', 'gorge', 'gossip', 'gouge', 'govern', 'gown', 'grab', 'grace', 'grade', 'graduate', 'graft', 'grain', 'grandstand', 'grant', 'graph', 'grapple', 'grasp', 'grass', 'grate', 'gratify', 'grave', 'gravel', 'gravitate', 'graze', 'grease', 'green', 'greet', 'grey', 'gridiron', 'gridlock', 'grieve', 'grill', 'grimace', 'grin', 'grind', 'grip', 'gripe', 'grit', 'groan', 'groin', 'grommet', 'groom', 'groove', 'grope', 'gross', 'grouch', 'ground', 'group', 'grouse', 'grout', 'grovel', 'grow', 'growl', 'grub', 'grudge', 'grumble', 'grunt', 'guarantee', 'guard', 'guess', 'guest', 'guffaw', 'guide', 'guillotine', 'guilt', 'guise', 'gulf', 'gull', 'gully', 'gulp', 'gum', 'gun', 'gurgle', 'gush', 'gust', 'gut', 'gutter', 'guy', 'guzzle', 'gyrate', 'habit', 'habituate', 'hack', 'hackney', 'haft', 'haggle', 'hail', 'hale', 'hallmark', 'hallo', 'hallucinate', 'halo', 'halt', 'halter', 'halve', 'ham', 'hammer', 'hamper', 'hamstring', 'hand', 'handcuff', 'handicap', 'handle', 'hang', 'hanker', 'happen', 'harangue', 'harass', 'harbinger', 'harden', 'hark', 'harm', 'harmonize', 'harness', 'harp', 'harpoon', 'harrow', 'harry', 'harvest', 'hash', 'hasp', 'hassle', 'haste', 'hasten', 'hat', 'hatch', 'hate', 'haul', 'haunt', 'have', 'haven', 'havoc', 'hawk', 'hay', 'hazard', 'haze', 'head', 'headline', 'heal', 'heap', 'hear', 'hearken', 'heart', 'hearten', 'heat', 'heave', 'heckle', 'hector', 'hedge', 'heed', 'heel', 'heft', 'heighten', 'helicopter', 'hell', 'hello', 'helm', 'help', 'hem', 'herald', 'herd', 'hesitate', 'hew', 'hex', 'hibernate', 'hiccough', 'hiccup', 'hide', 'high-grade', 'highlight', 'hijack', 'hike', 'hill', 'hilt', 'hinder', 'hinge', 'hint', 'hip', 'hiss', 'hit', 'hitch', 'hive', 'hoard', 'hoax', 'hob', 'hobble', 'hock', 'hocus-pocus', 'hoe', 'hog', 'hoist', 'hold', 'hole', 'holiday', 'hollow', 'holster', 'home', 'homestead', 'homogenize', 'hone', 'honey', 'honeymoon', 'honk', 'hood', 'hoodwink', 'hoof', 'hook', 'hoop', 'hoot', 'hop', 'hope', 'horde', 'horn', 'horrify', 'horseshoe', 'horsewhip', 'hose', 'host', 'hostel', 'hostess', 'hothouse', 'hound', 'house', 'house-train', 'hovel', 'hover', 'howl', 'huddle', 'huff', 'hug', 'hulk', 'hull', 'hum', 'humanize', 'humble', 'humbug', 'humiliate', 'hump', 'hunch', 'hunger', 'hunt', 'hurdle', 'hurl', 'hurrah', 'hurry', 'hurt', 'hurtle', 'husband', 'hush', 'husk', 'hustle', 'hydrate', 'hymn', 'hyphen', 'hyphenate', 'hypothesize', 'ice', 'ice-skate', 'id', 'idealize', 'identify', 'idle', 'idolize', 'ignite', 'ignore', 'ill-treat', 'illuminate', 'illumine', 'illustrate', 'image', 'imagine', 'imbibe', 'imbue', 'imitate', 'immerse', 'immigrate', 'immobilize', 'immolate', 'imp', 'impact', 'impair', 'impale', 'impart', 'impeach', 'impede', 'impel', 'imperil', 'impersonate', 'impinge', 'implant', 'implement', 'implicate', 'implode', 'implore', 'imply', 'import', 'importune', 'impose', 'impound', 'impoverish', 'impregnate', 'impress', 'imprint', 'imprison', 'improve', 'improvise', 'impugn', 'impute', 'inaugurate', 'incapacitate', 'incarnate', 'incense', 'inch', 'incinerate', 'incite', 'incline', 'include', 'incorporate', 'increase', 'incriminate', 'incubate', 'inculcate', 'incur', 'indemnify', 'indent', 'index', 'indicate', 'indict', 'indispose', 'indoctrinate', 'induce', 'induct', 'indulge', 'industrialize', 'inebriate', 'infatuate', 'infect', 'infer', 'infest', 'infiltrate', 'infix', 'inflame', 'inflate', 'inflect', 'inflict', 'influence', 'inform', 'infringe', 'infuriate', 'infuse', 'ingest', 'ingratiate', 'inhabit', 'inhale', 'inherit', 'inhibit', 'initial', 'initialize', 'initiate', 'inject', 'injure', 'ink', 'inlay', 'inlet', 'innovate', 'inoculate', 'input', 'inquire', 'inscribe', 'insert', 'inset', 'insinuate', 'insist', 'inspect', 'inspire', 'install', 'instance', 'instantiate', 'instigate', 'institute', 'institutionalize', 'instruct', 'instrument', 'insulate', 'insult', 'insure', 'intaglio', 'integrate', 'intend', 'intensify', 'inter', 'interact', 'interbreed', 'intercede', 'intercept', 'interchange', 'intercommunicate', 'interconnect', 'intercut', 'interest', 'interface', 'interfere', 'interject', 'interlace', 'interleave', 'interlock', 'intern', 'internalize', 'interplay', 'interpolate', 'interpose', 'interpret', 'interrelate', 'interrogate', 'interrupt', 'intersect', 'intersperse', 'intertwine', 'intervene', 'interview', 'intimate', 'intimidate', 'intone', 'intoxicate', 'intricate', 'intrigue', 'introduce', 'introvert', 'intrude', 'inundate', 'inure', 'invade', 'invalid', 'invalidate', 'inveigh', 'invent', 'invert', 'invest', 'investigate', 'invigorate', 'invite', 'invoice', 'invoke', 'involute', 'involve', 'ionize', 'iris', 'iron', 'irradiate', 'irrigate', 'irritate', 'island', 'isle', 'isolate', 'issue', 'italicize', 'itch', 'item', 'itemize', 'iterate', 'jab', 'jabber', 'jack', 'jade', 'jag', 'jail', 'jam', 'jangle', 'jape', 'jar', 'jargon', 'jaundice', 'jaunt', 'jaw', 'jawbone', 'jazz', 'jeer', 'jelly', 'jeopardize', 'jerk', 'jest', 'jet', 'jettison', 'jetty', 'jewel', 'jib', 'jibe', 'jig', 'jigsaw', 'jilt', 'jingle', 'jinx', 'jitter', 'jive', 'job', 'jockey', 'jog', 'join', 'joint', 'joke', 'jolly', 'jolt', 'jostle', 'jot', 'journal', 'journey', 'joust', 'joy', 'joyride', 'judge', 'jug', 'juggle', 'juice', 'jumble', 'jump', 'jump-start', 'junk', 'junket', 'just', 'justify', 'jut', 'juxtapose', 'kayak', 'keel', 'keen', 'keep', 'ken', 'kennel', 'kernel', 'key', 'keyboard', 'keynote', 'kick', 'kid', 'kidnap', 'kill', 'kiln', 'kilt', 'kindle', 'king', 'kink', 'kipper', 'kiss', 'kit', 'kite', 'kitten', 'knead', 'knee', 'kneecap', 'kneel', 'knell', 'knife', 'knight', 'knit', 'knock', 'knoll', 'knot', 'know', 'knuckle', 'kosher', 'kowtow', 'laager', 'label', 'lace', 'lacerate', 'lack', 'lackey', 'lacquer', 'lactate', 'ladle', 'lag', 'lame', 'lament', 'laminate', 'lampoon', 'lance', 'land', 'landmark', 'landscape', 'landslide', 'languish', 'lap', 'lapse', 'lard', 'lark', 'lash', 'lasso', 'last', 'latch', 'lateral', 'lathe', 'lather', 'lattice', 'laud', 'laugh', 'launch', 'launder', 'laurel', 'lavish', 'law', 'lay', 'layer', 'laze', 'lazy', 'leach', 'lead', 'leaf', 'leaflet', 'league', 'leak', 'lean', 'leap', 'leapfrog', 'learn', 'lease', 'leash', 'leather', 'leave', 'leaven', 'lecher', 'lecture', 'leech', 'leer', 'leg', 'legislate', 'legitimate', 'legitimize', 'lend', 'lengthen', 'lesion', 'lessen', 'lesson', 'let', 'letter', 'level', 'lever', 'leverage', 'levitate', 'levy', 'libel', 'liberalize', 'liberate', 'licence', 'license', 'lichen', 'lick', 'lid', 'lie', 'lifeguard', 'lift', 'ligature', 'light', 'lighten', 'lightning', 'like', 'liken', 'lilt', 'limb', 'limber', 'lime', 'limit', 'limp', 'line', 'linger', 'link', 'lionize', 'lip', 'liquefy', 'liquidate', 'liquor', 'lisp', 'list', 'listen', 'lithograph', 'litigate', 'litter', 'live', 'liven', 'load', 'loaf', 'loam', 'loan', 'loathe', 'lob', 'lobby', 'local', 'localize', 'locate', 'lock', 'lodge', 'loft', 'log', 'loiter', 'loll', 'long', 'look', 'loom', 'loop', 'loose', 'loosen', 'loot', 'lop', 'lope', 'lord', 'lose', 'lot', 'loth', 'lounge', 'louse', 'lout', 'love', 'lower', 'lubricant', 'lubricate', 'luck', 'lug', 'lull', 'lumber', 'lump', 'lunch', 'lunge', 'lurch', 'lure', 'lurk', 'lust', 'lute', 'luxuriate', 'lynch', 'mace', 'machine', 'mad', 'madden', 'magnetize', 'magnify', 'mail', 'maim', 'mainline', 'mainstream', 'maintain', 'major', 'make', 'malfunction', 'malign', 'malt', 'man', 'manacle', 'manage', 'mandate', 'mangle', 'manhandle', 'manicure', 'manifest', 'manifold', 'manipulate', 'mantle', 'manufacture', 'manure', 'map', 'mar', 'marble', 'march', 'margin', 'marginalize', 'marinade', 'marinate', 'mark', 'market', 'marl', 'maroon', 'marry', 'marshal', 'martyr', 'marvel', 'mascara', 'mash', 'mask', 'mason', 'masquerade', 'mass', 'mass-market', 'massacre', 'massage', 'mast', 'master', 'mastermind', 'masturbate', 'mat', 'match', 'mate', 'materialize', 'matriculate', 'matte', 'matter', 'mature', 'maul', 'maximize', 'maze', 'mean', 'meander', 'measure', 'mechanize', 'medal', 'meddle', 'mediate', 'medicate', 'medicine', 'meet', 'megaphone', 'meld', 'mellow', 'melt', 'memorize', 'menace', 'mend', 'mention', 'mentor', 'merchandise', 'merge', 'merit', 'mesh', 'mess', 'messenger', 'metabolize', 'metal', 'metamorphose', 'meter', 'mew', 'microfilm', 'microwave', 'midwife', 'migrate', 'mildew', 'militate', 'milk', 'mill', 'mimic', 'mince', 'mind', 'mine', 'mingle', 'miniaturize', 'minimize', 'minister', 'minor', 'mint', 'minute', 'mire', 'mirror', 'misapply', 'misbehave', 'miscalculate', 'miscarry', 'miscast', 'misconduct', 'miscount', 'miscue', 'misdirect', 'misfire', 'misfit', 'mishandle', 'mishear', 'misinform', 'misinterpret', 'misjudge', 'mislay', 'mislead', 'mismanage', 'mismatch', 'misplace', 'misprint', 'misquote', 'misread', 'misremember', 'misrepresent', 'misrule', 'miss', 'misspell', 'misspend', 'mist', 'mistake', 'mistreat', 'mistrust', 'mistype', 'misunderstand', 'misuse', 'mitigate', 'mitre', 'mix', 'moan', 'mob', 'mobilize', 'mock', 'model', 'modem', 'moderate', 'modernize', 'modify', 'modulate', 'moisten', 'molest', 'mollify', 'molten', 'monger', 'monitor', 'monkey', 'monogram', 'monograph', 'monopolize', 'montage', 'moon', 'moonlight', 'moor', 'moot', 'mop', 'mope', 'moralize', 'mordant', 'morph', 'morsel', 'mortar', 'mortgage', 'mortice', 'mortify', 'mortise', 'mosaic', 'moss', 'mothball', 'mother', 'motion', 'motivate', 'motive', 'motor', 'motorbike', 'motorcycle', 'mould', 'mound', 'mount', 'mourn', 'mouse', 'mousetrap', 'mousse', 'mouth', 'move', 'mow', 'muck', 'mud', 'muddle', 'muddy', 'muff', 'muffle', 'mug', 'mulch', 'mull', 'multiplex', 'multiply', 'mumble', 'mummy', 'munch', 'munition', 'murder', 'murmur', 'muscle', 'muse', 'mush', 'mushroom', 'must', 'muster', 'mutate', 'mute', 'mutilate', 'mutiny', 'mutter', 'muzzle', 'mystify', 'nag', 'nail', 'name', 'nap', 'narrate', 'narrow', 'nationalize', 'nauseate', 'navigate', 'near', 'neaten', 'necessitate', 'neck', 'necklace', 'necropsy', 'need', 'needle', 'negate', 'negative', 'neglect', 'negotiate', 'neigh', 'nerve', 'nest', 'nestle', 'net', 'nettle', 'network', 'neuter', 'neutralize', 'nibble', 'niche', 'nick', 'nickel', 'nickname', 'niggle', 'nigh', 'nightclub', 'nip', 'nitrate', 'nitride', 'nod', 'noise', 'nominate', 'noodle', 'noose', 'normalize', 'nose', 'nosedive', 'notch', 'note', 'notice', 'notify', 'nourish', 'nudge', 'null', 'nullify', 'numb', 'number', 'numerate', 'nurse', 'nurture', 'nut', 'nuzzle', 'oar', 'obey', 'obfuscate', 'object', 'obligate', 'oblige', 'obliterate', 'obscure', 'observe', 'obstruct', 'obtain', 'obtrude', 'obviate', 'occasion', 'occult', 'occupy', 'occur', 'off', 'offend', 'offer', 'officiate', 'ogle', 'oh', 'oil', 'omen', 'omit', 'one-step', 'ooze', 'open', 'operate', 'opiate', 'oppose', 'oppress', 'opt', 'optimize', 'option', 'orb', 'orbit', 'orchestrate', 'ordain', 'order', 'organize', 'orient', 'orientate', 'originate', 'ornament', 'orphan', 'oscillate', 'ostracize', 'oust', 'out', 'outbid', 'outcrop', 'outdo', 'outfit', 'outflank', 'outgrow', 'outlast', 'outlaw', 'outlay', 'outline', 'outlive', 'outnumber', 'outpace', 'outperform', 'outplay', 'output', 'outrage', 'outreach', 'outrun', 'outshine', 'outspread', 'outstay', 'outstrip', 'outweigh', 'outwit', 'over', 'overact', 'overawe', 'overbalance', 'overburden', 'overcast', 'overcharge', 'overcome', 'overcompensate', 'overcook', 'overcrowd', 'overdo', 'overdose', 'overdraw', 'overdrive', 'overemphasize', 'overestimate', 'overfeed', 'overfill', 'overflow', 'overfly', 'overhand', 'overhang', 'overhaul', 'overhear', 'overheat', 'overlap', 'overlay', 'overlie', 'overload', 'overlord', 'overpass', 'overplay', 'overpower', 'overpressure', 'overprint', 'overrate', 'overreach', 'overreact', 'override', 'overrule', 'overrun', 'oversee', 'overshadow', 'overshoot', 'oversimplify', 'oversleep', 'overspend', 'overstate', 'overstep', 'overstress', 'overstretch', 'oversupply', 'overtake', 'overtax', 'overthrow', 'overture', 'overturn', 'overvalue', 'overweight', 'overwhelm', 'overwinter', 'overwork', 'overwrite', 'owe', 'own', 'oyster', 'pace', 'pacify', 'pack', 'package', 'packet', 'pad', 'paddle', 'paddock', 'padlock', 'page', 'paginate', 'pain', 'paint', 'pair', 'pal', 'palaver', 'pale', 'palisade', 'pall', 'pallet', 'palm', 'palpitate', 'palsy', 'pamper', 'pamphleteer', 'pan', 'pancake', 'pander', 'panel', 'panic', 'pant', 'pantomime', 'paper', 'par', 'parachute', 'parade', 'paraffin', 'paragon', 'paragraph', 'parallel', 'paraphrase', 'parboil', 'parcel', 'parch', 'pardon', 'pare', 'parent', 'parenthesize', 'park', 'parley', 'parody', 'parole', 'parquet', 'parrot', 'parry', 'parse', 'part', 'partake', 'participate', 'particularize', 'partition', 'partner', 'party', 'pass', 'passage', 'paste', 'pastor', 'pasture', 'pat', 'patch', 'patchwork', 'patent', 'patrol', 'patronize', 'patter', 'pattern', 'pause', 'pave', 'paw', 'pawn', 'pay', 'peace', 'peach', 'peacock', 'peak', 'peal', 'pearl', 'pebble', 'peck', 'pedal', 'peddle', 'pedestal', 'peek', 'peel', 'peep', 'peer', 'peg', 'pellet', 'pelt', 'pen', 'penalize', 'pencil', 'penetrate', 'pension', 'people', 'pepper', 'perambulate', 'perceive', 'perch', 'percolate', 'percuss', 'perfect', 'perforate', 'perform', 'perfume', 'peril', 'perish', 'perjure', 'perk', 'perm', 'permeate', 'permit', 'permute', 'peroxide', 'perpetrate', 'perplex', 'persecute', 'persevere', 'persist', 'personalize', 'personify', 'perspire', 'persuade', 'pertain', 'perturb', 'peruse', 'pervade', 'pervert', 'pester', 'pestle', 'pet', 'petition', 'petrify', 'phase', 'philander', 'phone', 'photocopy', 'photograph', 'photostat', 'phrase', 'pi', 'pick', 'pickaxe', 'picket', 'pickle', 'pickpocket', 'picnic', 'picture', 'pie', 'piece', 'pierce', 'piffle', 'pig', 'piggyback', 'pigment', 'pike', 'pile', 'pilfer', 'pill', 'pillage', 'pillar', 'pillory', 'pillow', 'pilot', 'pimp', 'pin', 'pinch', 'pine', 'ping', 'ping-pong', 'pinion', 'pink', 'pinnacle', 'pinpoint', 'pioneer', 'pip', 'pipe', 'pipeline', 'pipette', 'pique', 'pirate', 'pirouette', 'pistol', 'pit', 'pitch', 'pith', 'pity', 'pivot', 'placard', 'place', 'plagiarize', 'plague', 'plait', 'plan', 'plane', 'plank', 'plant', 'plaster', 'plat', 'plate', 'plateau', 'platoon', 'play', 'plead', 'please', 'pleasure', 'pleat', 'pledge', 'plight', 'plod', 'plop', 'plot', 'plough', 'pluck', 'plug', 'plumb', 'plume', 'plummet', 'plump', 'plunder', 'plunge', 'pluralize', 'ply', 'poach', 'pocket', 'pod', 'point', 'poise', 'poison', 'poke', 'polarize', 'pole', 'police', 'polish', 'politicize', 'polka', 'poll', 'pollen', 'pollinate', 'pollute', 'polychrome', 'polygraph', 'pomade', 'pond', 'ponder', 'pontificate', 'pony', 'pooh-pooh', 'pool', 'pop', 'popularize', 'populate', 'pore', 'porpoise', 'port', 'portage', 'portend', 'portion', 'portray', 'pose', 'posit', 'position', 'possess', 'post', 'postmark', 'postpone', 'postulate', 'posture', 'pot', 'potter', 'pouch', 'poultice', 'pounce', 'pound', 'pour', 'pout', 'powder', 'power', 'practice', 'praise', 'prance', 'prank', 'prattle', 'prawn', 'pray', 'preach', 'precaution', 'precede', 'precess', 'precipitate', 'preclude', 'precondition', 'predefine', 'predetermine', 'predicate', 'predict', 'predispose', 'predominate', 'preen', 'prefab', 'preface', 'prefix', 'preheat', 'prejudge', 'prejudice', 'prelude', 'premeditate', 'premier', 'premiere', 'premise', 'preoccupy', 'prepare', 'presage', 'prescribe', 'preselect', 'present', 'preserve', 'preset', 'preside', 'press', 'pressure', 'pressurize', 'presume', 'presuppose', 'pretend', 'pretty', 'prevail', 'prevaricate', 'prevent', 'preview', 'prey', 'price', 'prick', 'prickle', 'pride', 'priest', 'prim', 'prime', 'print', 'prioritize', 'privatize', 'privilege', 'prize', 'probate', 'probe', 'proceed', 'process', 'procession', 'proclaim', 'procrastinate', 'procreate', 'proctor', 'procure', 'prod', 'produce', 'profane', 'profess', 'proffer', 'profile', 'profit', 'prognosticate', 'program', 'progress', 'prohibit', 'project', 'prolapse', 'proliferate', 'prologue', 'prologuize', 'prolong', 'promenade', 'promise', 'promote', 'prompt', 'promulgate', 'prong', 'pronounce', 'proof', 'prop', 'propagate', 'propel', 'prophesy', 'propitiate', 'proportion', 'proportionate', 'propose', 'proposition', 'propound', 'proscribe', 'prose', 'prosecute', 'prospect', 'prosper', 'prostrate', 'protect', 'protocol', 'prototype', 'protract', 'protrude', 'prove', 'provide', 'provision', 'provoke', 'prowl', 'prune', 'pry', 'publicize', 'publish', 'pucker', 'puddle', 'puff', 'pug', 'puke', 'pull', 'pulp', 'pulsate', 'pulse', 'pulverize', 'pumice', 'pummel', 'pump', 'pun', 'punch', 'punctuate', 'puncture', 'punish', 'punt', 'pup', 'puppeteer', 'purchase', 'purge', 'purify', 'purl', 'purloin', 'purple', 'purport', 'purpose', 'purr', 'purse', 'pursue', 'push', 'put', 'putrefy', 'putt', 'putter', 'putty', 'puzzle', 'pyramid', 'quack', 'quadruple', 'quadruplicate', 'quaff', 'quake', 'qualify', 'quantify', 'quantize', 'quarantine', 'quarrel', 'quarry', 'quarter', 'quarterback', 'quash', 'quaver', 'queen', 'queer', 'quell', 'quench', 'query', 'quest', 'question', 'queue', 'quibble', 'quicken', 'quicksilver', 'quiet', 'quieten', 'quill', 'quilt', 'quintuple', 'quip', 'quit', 'quiver', 'quiz', 'quote', 'rabble', 'race', 'rack', 'racket', 'radiate', 'radio', 'radiograph', 'raffle', 'raft', 'rag', 'rage', 'raid', 'rail', 'rain', 'raise', 'rake', 'rally', 'ram', 'ramble', 'ramify', 'ramp', 'rampage', 'rampart', 'ramrod', 'ranch', 'randomize', 'range', 'rank', 'rankle', 'ransack', 'ransom', 'rant', 'rap', 'rapture', 'rasp', 'rat', 'ratchet', 'rate', 'ratify', 'ration', 'rationalize', 'rattle', 'ravage', 'rave', 'ravel', 'raven', 'ravish', 'ray', 'raze', 'reach', 'react', 'reactivate', 'read', 'readjust', 'ready', 'reaffirm', 'realign', 'realize', 'reallocate', 'really', 'ream', 'reap', 'reappear', 'reapply', 'reappoint', 'rear', 'rearrange', 'reason', 'reassemble', 'reassert', 'reassess', 'reassign', 'reassure', 'reattempt', 'reawaken', 'rebate', 'rebel', 'rebind', 'rebook', 'rebound', 'rebuff', 'rebuild', 'rebuke', 'rebut', 'recalculate', 'recalibrate', 'recall', 'recant', 'recap', 'recapitulate', 'recapture', 'recast', 'recede', 'receipt', 'receive', 'recess', 'recharge', 'recheck', 'reciprocate', 'recirculate', 'recite', 'reckon', 'reclaim', 'reclassify', 'recline', 'recode', 'recognize', 'recoil', 'recollect', 'recombine', 'recommend', 'recompense', 'recompile', 'recompute', 'reconcile', 'reconfigure', 'reconnect', 'reconquer', 'reconsider', 'reconstitute', 'reconstruct', 'reconvene', 'reconvert', 'record', 'recount', 'recover', 'recreate', 'recriminate', 'recruit', 'rectify', 'recuperate', 'recur', 'recycle', 'redden', 'redeem', 'redefine', 'redeliver', 'redeploy', 'redesign', 'redevelop', 'redial', 'redirect', 'rediscover', 'redistribute', 'redo', 'redouble', 'redound', 'redraft', 'redraw', 'redress', 'reduce', 'reed', 'reef', 'reek', 'reel', 'reeve', 'refashion', 'refer', 'referee', 'reference', 'refile', 'refill', 'refinance', 'refine', 'refit', 'reflect', 'reflex', 'refocus', 'reform', 'reformat', 'reformulate', 'refract', 'refrain', 'refreeze', 'refresh', 'refuel', 'refuge', 'refund', 'refurbish', 'refuse', 'refute', 'regain', 'regale', 'regard', 'regenerate', 'regiment', 'register', 'regress', 'regret', 'regroup', 'regularize', 'regulate', 'regurgitate', 'rehabilitate', 'rehash', 'rehearse', 'reheat', 'rehouse', 'rehydrate', 'reify', 'reign', 'reimburse', 'reimpose', 'reincarnate', 'reinforce', 'reinsert', 'reinstall', 'reinstate', 'reinterpret', 'reintroduce', 'reinvent', 'reinvest', 'reinvigorate', 'reissue', 'reiterate', 'reject', 'rejoice', 'rejoin', 'rejuvenate', 'rekindle', 'relabel', 'relapse', 'relate', 'relaunch', 'relax', 'relay', 'relearn', 'release', 'relegate', 'relent', 'relieve', 'relight', 'relink', 'relinquish', 'relish', 'relive', 'relocate', 'rely', 'remain', 'remainder', 'remake', 'remand', 'remap', 'remark', 'remarry', 'remaster', 'rematch', 'remedy', 'remember', 'remind', 'reminisce', 'remit', 'remodel', 'remonstrate', 'remount', 'remove', 'remunerate', 'rename', 'rend', 'render', 'rendezvous', 'renege', 'renegotiate', 'renew', 'renounce', 'renovate', 'rent', 'renumber', 'reopen', 'reorder', 'reorganize', 'repack', 'repaint', 'repair', 'repast', 'repatriate', 'repay', 'repeal', 'repeat', 'repel', 'repent', 'rephrase', 'repine', 'replace', 'replant', 'replay', 'replenish', 'replete', 'replicate', 'reply', 'repopulate', 'report', 'repose', 'reposition', 'repossess', 'reprehend', 'represent', 'reprieve', 'reprint', 'reprise', 'reproach', 'reprobate', 'reprocess', 'reproduce', 'reprogram', 'reprove', 'republish', 'repudiate', 'repulse', 'repurchase', 'repute', 'request', 'require', 'requisition', 'requite', 'reread', 'reroute', 'rerun', 'rescind', 'rescue', 'research', 'reselect', 'resell', 'resemble', 'resend', 'resent', 'reserve', 'reset', 'resettle', 'reshape', 'resharpen', 'reshow', 'reshuffle', 'reside', 'resign', 'resin', 'resist', 'resit', 'resolve', 'resonate', 'resort', 'resound', 'respect', 'respite', 'respond', 'rest', 'restart', 'restate', 'restitution', 'restock', 'restore', 'restrain', 'restrict', 'restructure', 'resubmit', 'result', 'resume', 'resupply', 'resurface', 'resurrect', 'resuscitate', 'retail', 'retain', 'retake', 'retaliate', 'retard', 'retch', 'retell', 'retest', 'rethink', 'retire', 'retort', 'retouch', 'retrace', 'retract', 'retrain', 'retransmit', 'retreat', 'retrench', 'retrieve', 'retrofit', 'retrograde', 'retrospect', 'retry', 'retune', 'return', 'retype', 'reunite', 'reuse', 'revalue', 'revamp', 'reveal', 'revel', 'revenge', 'reverberate', 'revere', 'reverence', 'reverse', 'revert', 'review', 'revile', 'revisit', 'revitalize', 'revive', 'revivify', 'revoke', 'revolt', 'revolutionize', 'revolve', 'reward', 'rewind', 'reword', 'rework', 'rewrite', 'rhyme', 'rib', 'ribbon', 'rice', 'rid', 'riddle', 'ride', 'ridge', 'ridicule', 'riff', 'rifle', 'rift', 'rig', 'right', 'rigidify', 'rim', 'rime', 'ring', 'rinse', 'riot', 'rip', 'ripen', 'riposte', 'ripple', 'rise', 'risk', 'rival', 'rivet', 'roach', 'roadblock', 'roam', 'roar', 'roast', 'rob', 'robe', 'rock', 'rocket', 'rogue', 'roister', 'role-play', 'roll', 'romance', 'romp', 'roof', 'rook', 'room', 'roost', 'root', 'rope', 'rosin', 'rot', 'rotate', 'rouge', 'rough', 'roughen', 'roulette', 'round', 'rouse', 'rout', 'route', 'rove', 'row', 'rub', 'ruck', 'rue', 'ruff', 'ruffle', 'ruin', 'rule', 'rumble', 'ruminate', 'rummage', 'rumple', 'run', 'rupture', 'rush', 'rust', 'rusticate', 'rustle', 'rut', 'sabotage', 'sack', 'sacrifice', 'sadden', 'saddle', 'safari', 'safeguard', 'sag', 'sail', 'saint', 'salivate', 'sallow', 'salt', 'salute', 'salvage', 'sample', 'sanctify', 'sanction', 'sand', 'sandal', 'sandbag', 'sandwich', 'sanitize', 'sap', 'sash', 'satiate', 'satirize', 'satisfy', 'saturate', 'sauce', 'sauna', 'saunter', 'savage', 'save', 'saw', 'say', 'scab', 'scabbard', 'scaffold', 'scald', 'scale', 'scallop', 'scalp', 'scamper', 'scan', 'scandal', 'scandalize', 'scant', 'scape', 'scar', 'scare', 'scarf', 'scarify', 'scathe', 'scatter', 'scavenge', 'scent', 'schedule', 'scheme', 'school', 'scintillate', 'scissor', 'scoff', 'scold', 'scoop', 'scoot', 'scope', 'scorch', 'score', 'scorn', 'scotch', 'scour', 'scourge', 'scout', 'scowl', 'scrabble', 'scramble', 'scrap', 'scrape', 'scratch', 'scrawl', 'scream', 'screech', 'screen', 'screw', 'scribble', 'scribe', 'script', 'scroll', 'scrub', 'scrum', 'scruple', 'scrutinize', 'scuba', 'scud', 'scuff', 'scuffle', 'scull', 'sculpt', 'sculpture', 'scum', 'scurry', 'scuttle', 'scythe', 'seal', 'seam', 'sear', 'search', 'season', 'seat', 'secede', 'seclude', 'second', 'secrete', 'section', 'sector', 'secure', 'sedate', 'seduce', 'see', 'seed', 'seek', 'seem', 'seep', 'seethe', 'segment', 'segregate', 'seize', 'select', 'self-destruct', 'sell', 'semaphore', 'send', 'sense', 'sentence', 'sentinel', 'separate', 'sequence', 'serenade', 'serge', 'serialize', 'serrate', 'serve', 'service', 'set', 'settle', 'sever', 'sew', 'shack', 'shackle', 'shade', 'shadow', 'shaft', 'shag', 'shake', 'shallow', 'sham', 'shamble', 'shame', 'shampoo', 'shank', 'shape', 'share', 'shark', 'sharp', 'sharpen', 'shatter', 'shave', 'shear', 'sheathe', 'shed', 'sheer', 'shell', 'shellac', 'shelter', 'shelve', 'shepherd', 'shield', 'shift', 'shimmer', 'shin', 'shine', 'shingle', 'ship', 'shipwreck', 'shirk', 'shiver', 'shoal', 'shock', 'shoe', 'shoehorn', 'shoo', 'shoot', 'shop', 'short', 'short-circuit', 'shorten', 'shot', 'shotgun', 'shoulder', 'shout', 'shove', 'shovel', 'show', 'showcase', 'shower', 'shred', 'shriek', 'shrill', 'shrimp', 'shrine', 'shrink', 'shrivel', 'shroud', 'shrug', 'shudder', 'shuffle', 'shun', 'shunt', 'shut', 'shutter', 'shuttle', 'shy', 'sicken', 'sickly', 'side', 'sideline', 'sidestep', 'sidetrack', 'sidle', 'siege', 'sieve', 'sift', 'sigh', 'sight', 'sight-read', 'sign', 'signal', 'signet', 'signify', 'silence', 'silhouette', 'silk', 'silo', 'silt', 'silver', 'simmer', 'simper', 'simple', 'simplify', 'simulate', 'sin', 'sinew', 'sing', 'single', 'sink', 'sip', 'siphon', 'sire', 'sit', 'site', 'situate', 'size', 'sizzle', 'skate', 'skateboard', 'sketch', 'skew', 'skewer', 'ski', 'skid', 'skim', 'skimp', 'skin', 'skip', 'skipper', 'skirl', 'skirt', 'skulk', 'skunk', 'sky', 'slab', 'slack', 'slacken', 'slag', 'slake', 'slam', 'slander', 'slang', 'slant', 'slap', 'slash', 'slat', 'slate', 'slave', 'slaver', 'slay', 'sleaze', 'sled', 'sledge', 'sledgehammer', 'sleek', 'sleep', 'sleet', 'sleeve', 'sleigh', 'sleuth', 'slice', 'slick', 'slide', 'slight', 'slim', 'slime', 'sling', 'slink', 'slip', 'slit', 'slither', 'sliver', 'slobber', 'slog', 'slop', 'slope', 'slosh', 'slot', 'slouch', 'slough', 'slow', 'slug', 'sluice', 'slum', 'slumber', 'slump', 'slur', 'slurp', 'slurry', 'slush', 'smack', 'smart', 'smarten', 'smash', 'smear', 'smell', 'smelt', 'smile', 'smirk', 'smite', 'smock', 'smoke', 'smooth', 'smother', 'smudge', 'smuggle', 'smut', 'snack', 'snaffle', 'snag', 'snake', 'snap', 'snare', 'snarl', 'snatch', 'sneak', 'sneer', 'sneeze', 'snick', 'sniff', 'sniffle', 'snigger', 'snip', 'snipe', 'snivel', 'snooker', 'snoop', 'snooze', 'snore', 'snorkel', 'snort', 'snow', 'snowball', 'snub', 'snuff', 'snuffle', 'snug', 'snuggle', 'soak', 'soap', 'soar', 'sob', 'sober', 'socialize', 'sock', 'socket', 'sodden', 'soften', 'soil', 'sojourn', 'solace', 'solder', 'soldier', 'sole', 'solicit', 'solidify', 'solo', 'solve', 'somersault', 'soot', 'soothe', 'sop', 'sophisticate', 'sorrow', 'sort', 'sortie', 'sound', 'soundproof', 'soup', 'sour', 'source', 'south', 'sow', 'space', 'spade', 'span', 'spangle', 'spank', 'spar', 'spare', 'spark', 'sparkle', 'spat', 'spatter', 'spawn', 'speak', 'spear', 'spearhead', 'specialize', 'specify', 'speck', 'speckle', 'speculate', 'speed', 'spell', 'spend', 'spew', 'sphere', 'spice', 'spike', 'spill', 'spin', 'spindle', 'spiral', 'spire', 'spirit', 'spit', 'spite', 'splash', 'splatter', 'splice', 'splint', 'split', 'splutter', 'spoil', 'spoke', 'sponge', 'sponsor', 'spoof', 'spool', 'spoon', 'spoon-feed', 'spoor', 'spore', 'sport', 'spot', 'spot-weld', 'spotlight', 'spout', 'sprain', 'sprawl', 'spray', 'spread', 'sprig', 'spring', 'sprinkle', 'sprint', 'sprout', 'spruce', 'spud', 'spume', 'spur', 'spurn', 'spurt', 'sputter', 'spy', 'squabble', 'squad', 'squall', 'squander', 'square', 'squash', 'squat', 'squawk', 'squeak', 'squeal', 'squeegee', 'squelch', 'squib', 'squiggle', 'squint', 'squire', 'squirm', 'squirrel', 'squirt', 'stab', 'stabilize', 'stable', 'stack', 'staff', 'stag', 'stage', 'stagger', 'stagnate', 'stain', 'stake', 'stale', 'stalemate', 'stalk', 'stall', 'stammer', 'stamp', 'stampede', 'stanchion', 'stand', 'standardize', 'staple', 'star', 'starch', 'stare', 'start', 'startle', 'starve', 'state', 'station', 'staunch', 'stave', 'stay', 'stead', 'steal', 'steam', 'steamer', 'steamroller', 'steel', 'steep', 'steepen', 'steeplechase', 'steer', 'stem', 'stencil', 'step', 'stereotype', 'sterilize', 'stet', 'stevedore', 'stew', 'steward', 'stick', 'stiff', 'stiffen', 'stifle', 'stigmatize', 'stiletto', 'still', 'stilt', 'stimulate', 'sting', 'stink', 'stint', 'stipulate', 'stir', 'stir-fry', 'stitch', 'stock', 'stockade', 'stockpile', 'stomach', 'stomp', 'stone', 'stooge', 'stool', 'stoop', 'stop', 'stopper', 'store', 'storm', 'story', 'stow', 'straddle', 'strafe', 'straggle', 'straighten', 'strain', 'straitjacket', 'strand', 'strangle', 'strap', 'stray', 'streak', 'stream', 'streamline', 'strengthen', 'stress', 'stretch', 'strew', 'stricken', 'stride', 'strike', 'string', 'strip', 'stripe', 'strive', 'stroke', 'stroll', 'strop', 'structure', 'struggle', 'strum', 'strut', 'stub', 'stucco', 'stud', 'study', 'stuff', 'stultify', 'stumble', 'stump', 'stun', 'stunt', 'stupefy', 'sturdy', 'stutter', 'sty', 'style', 'stymie', 'subcontract', 'subculture', 'subdivide', 'subdue', 'subject', 'subjugate', 'sublimate', 'sublime', 'submarine', 'submerge', 'submit', 'subordinate', 'subpoena', 'subscribe', 'subside', 'subsidize', 'subsist', 'substantiate', 'substitute', 'subsume', 'subtend', 'subtitle', 'subtotal', 'subtract', 'subvert', 'succeed', 'succumb', 'suck', 'sucker', 'suckle', 'suction', 'suds', 'sue', 'suede', 'suffer', 'suffice', 'suffix', 'suffocate', 'suffuse', 'sugar', 'suggest', 'suicide', 'suit', 'sulk', 'sully', 'sum', 'summarize', 'summer', 'summit', 'summon', 'summons', 'sun', 'sunbathe', 'sunburn', 'sundown', 'suntan', 'sup', 'superannuate', 'superglue', 'superheat', 'superimpose', 'superintend', 'superordinate', 'superpose', 'supersede', 'supervene', 'supervise', 'supplant', 'supple', 'supplement', 'supplicate', 'supply', 'support', 'suppose', 'suppress', 'surcharge', 'surf', 'surface', 'surfboard', 'surfeit', 'surge', 'surmise', 'surmount', 'surname', 'surpass', 'surplus', 'surprise', 'surrender', 'surrogate', 'surround', 'survey', 'survive', 'suspect', 'suspend', 'suspicion', 'sustain', 'suture', 'swab', 'swagger', 'swallow', 'swamp', 'swap', 'swarm', 'swat', 'swathe', 'sway', 'swear', 'sweat', 'sweep', 'sweeten', 'swell', 'swerve', 'swill', 'swim', 'swindle', 'swing', 'swipe', 'swirl', 'swish', 'switch', 'switchback', 'swivel', 'swoon', 'swoop', 'swop', 'symbol', 'symbolize', 'sympathize', 'synapse', 'synchronize', 'syndicate', 'synthesize', 'syringe', 'syrup', 'systematize', 'tab', 'tabby', 'tabernacle', 'table', 'taboo', 'tabulate', 'tack', 'tackle', 'tag', 'tail', 'tailgate', 'tailor', 'tailspin', 'taint', 'take', 'talk', 'tallow', 'tally', 'tame', 'tamp', 'tamper', 'tan', 'tangle', 'tango', 'tank', 'tantalize', 'tap', 'tap-dance', 'tape', 'taper', 'tapestry', 'tar', 'target', 'tariff', 'tarnish', 'tarry', 'tart', 'task', 'tassel', 'taste', 'tattle', 'tattoo', 'taunt', 'tax', 'taxi', 'teach', 'team', 'tear', 'tear-gas', 'tease', 'tee', 'teem', 'teeter', 'teethe', 'teetotal', 'teleconference', 'telegraph', 'telephone', 'telescope', 'teletype', 'televise', 'telex', 'tell', 'temper', 'tempest', 'tempt', 'tenant', 'tend', 'tender', 'tenon', 'tense', 'tension', 'tent', 'tenure', 'term', 'terminate', 'terrace', 'terraform', 'terrify', 'terrorize', 'test', 'test-drive', 'testify', 'tether', 'texture', 'thank', 'thatch', 'thaw', 'theorize', 'thermostat', 'thicken', 'thieve', 'thin', 'think', 'third-degree', 'thirst', 'thorn', 'thou', 'thrall', 'thrash', 'thread', 'threat', 'threaten', 'thresh', 'thrill', 'thrive', 'throat', 'throb', 'throne', 'throng', 'throttle', 'throw', 'thrum', 'thrust', 'thud', 'thumb', 'thump', 'thunder', 'thwack', 'thwart', 'tick', 'ticket', 'tickle', 'tide', 'tidy', 'tie', 'tier', 'tighten', 'tile', 'till', 'tiller', 'tilt', 'timber', 'time', 'tin', 'tin-plate', 'tincture', 'tinge', 'tingle', 'tinker', 'tinkle', 'tinsel', 'tint', 'tip', 'tipple', 'tiptoe', 'tire', 'tissue', 'tithe', 'titillate', 'title', 'titter', 'tittle-tattle', 'toady', 'toast', 'toboggan', 'toddle', 'toe', 'toenail', 'toggle', 'toil', 'token', 'tolerate', 'toll', 'tomahawk', 'tomb', 'tomcat', 'tone', 'tongue', 'tonsure', 'tool', 'toot', 'tooth', 'tootle', 'top', 'topple', 'torch', 'torment', 'torpedo', 'torque', 'torture', 'toss', 'tot', 'total', 'totter', 'touch', 'touch-type', 'tough', 'toughen', 'tour', 'tourney', 'tout', 'tow', 'towel', 'tower', 'toy', 'trace', 'track', 'trade', 'trademark', 'traffic', 'trail', 'trailer', 'train', 'tram', 'trammel', 'tramp', 'trample', 'trance', 'transact', 'transcend', 'transcribe', 'transfer', 'transform', 'transgress', 'transit', 'translate', 'transliterate', 'transmit', 'transmogrify', 'transmute', 'transpire', 'transplant', 'transport', 'transpose', 'trap', 'trash', 'travail', 'travel', 'traverse', 'travesty', 'trawl', 'tread', 'treadle', 'treasure', 'treat', 'treble', 'tree', 'trek', 'trellis', 'tremble', 'trench', 'trend', 'trespass', 'triage', 'triangulate', 'trice', 'trick', 'trickle', 'trigger', 'trill', 'trim', 'trip', 'triple', 'triplicate', 'triumph', 'trivialize', 'troll', 'trolley', 'troop', 'trot', 'trouble', 'trounce', 'troupe', 'trowel', 'truant', 'truck', 'trudge', 'true', 'trumpet', 'truncate', 'truncheon', 'trundle', 'truss', 'trust', 'trustee', 'try', 'tub', 'tube', 'tuck', 'tucker', 'tuft', 'tug', 'tumble', 'tun', 'tune', 'tunnel', 'turf', 'turn', 'turpentine', 'turtle', 'tusk', 'tussle', 'tutor', 'twang', 'tweak', 'tweet', 'twiddle', 'twig', 'twill', 'twin', 'twine', 'twinge', 'twinkle', 'twirl', 'twist', 'twitch', 'twitter', 'two-step', 'type', 'typecast', 'typeset', 'typify', 'tyrannize', 'umpire', 'unable', 'unbalance', 'unbend', 'unbolt', 'unbuckle', 'unburden', 'unbutton', 'unchain', 'unclog', 'uncoil', 'uncouple', 'uncover', 'uncross', 'undercut', 'underestimate', 'undergo', 'underlay', 'underlie', 'underline', 'undermine', 'underpin', 'underplay', 'underrate', 'underscore', 'undersell', 'undershoot', 'understand', 'understate', 'understudy', 'undertake', 'undervalue', 'underwrite', 'undo', 'undress', 'undulate', 'unearth', 'unfasten', 'unfit', 'unfold', 'unfurl', 'unhand', 'unhinge', 'unicycle', 'uniform', 'unify', 'unite', 'unjam', 'unlace', 'unlearn', 'unleash', 'unlink', 'unload', 'unlock', 'unloose', 'unmask', 'unnerve', 'unpack', 'unpick', 'unplug', 'unquote', 'unravel', 'unriddle', 'unroll', 'unscramble', 'unscrew', 'unseal', 'unseat', 'unsettle', 'unsteady', 'untangle', 'untie', 'untwist', 'unveil', 'unwind', 'unwrap', 'unzip', 'up', 'upbraid', 'update', 'upgrade', 'uphold', 'upholster', 'uplift', 'upload', 'uppercut', 'upright', 'uproot', 'upset', 'upstage', 'upstart', 'upsurge', 'upswing', 'upturn', 'urbanize', 'urge', 'urinate', 'use', 'usher', 'usurp', 'utilize', 'utter', 'vacate', 'vaccinate', 'vacillate', 'vacuum', 'valet', 'validate', 'value', 'valve', 'vamp', 'vandalize', 'vanish', 'vanquish', 'vaporize', 'varnish', 'vary', 'vat', 'vault', 'vector', 'veer', 'vegetate', 'veil', 'vein', 'vend', 'veneer', 'venerate', 'vent', 'ventilate', 'venture', 'verge', 'verify', 'verse', 'vest', 'vestibule', 'vet', 'veto', 'vex', 'vial', 'vibrate', 'vice', 'victimize', 'video', 'videotape', 'vie', 'view', 'vilify', 'vindicate', 'violate', 'visa', 'vision', 'visit', 'visor', 'visualize', 'vitiate', 'vituperate', 'vocalize', 'voice', 'void', 'volley', 'volunteer', 'vomit', 'voodoo', 'vote', 'vouch', 'voucher', 'vouchsafe', 'vow', 'voyage', 'vulcanize', 'wad', 'waddle', 'wade', 'wafer', 'waffle', 'waft', 'wag', 'wager', 'waggle', 'wagon', 'wail', 'wainscot', 'wait', 'waitress', 'waive', 'wake', 'waken', 'walk', 'wall', 'wallow', 'wallpaper', 'waltz', 'wan', 'wander', 'wane', 'want', 'wanton', 'war', 'warble', 'ward', 'wardrobe', 'warehouse', 'warm', 'warn', 'warp', 'warrant', 'warranty', 'wash', 'waste', 'watch', 'watchdog', 'water', 'watermark', 'waterproof', 'wattle', 'wave', 'waver', 'wax', 'waylay', 'weaken', 'wean', 'weapon', 'wear', 'weary', 'weasel', 'weather', 'weatherproof', 'weave', 'web', 'wed', 'wedge', 'weed', 'weekend', 'weep', 'weigh', 'weight', 'welcome', 'weld', 'well', 'welt', 'welter', 'wench', 'wend', 'wet', 'wet-nurse', 'whack', 'whale', 'wharf', 'wheedle', 'wheel', 'wheelbarrow', 'wheeze', 'whelp', 'whet', 'whiff', 'while', 'whimper', 'whine', 'whinny', 'whip', 'whir', 'whirl', 'whirr', 'whisk', 'whisper', 'whistle', 'whistle-stop', 'white', 'whiten', 'whitewash', 'whittle', 'whizz', 'wholesale', 'whoop', 'whoosh', 'wick', 'widen', 'widow', 'wield', 'wig', 'wiggle', 'wild', 'wildcat', 'wile', 'will', 'wilt', 'wimple', 'win', 'wince', 'winch', 'wind', 'windlass', 'windmill', 'window', 'window-shop', 'wine', 'wing', 'wink', 'winnow', 'winter', 'wipe', 'wire', 'wish', 'wisp', 'wit', 'witch', 'withdraw', 'wither', 'withhold', 'withstand', 'witness', 'wobble', 'wolf', 'wonder', 'wont', 'woo', 'wood', 'woodshed', 'word', 'work', 'worm', 'worry', 'worsen', 'worship', 'worst', 'wound', 'wow', 'wrack', 'wrangle', 'wrap', 'wreak', 'wreath', 'wreathe', 'wreck', 'wrench', 'wrest', 'wrestle', 'wriggle', 'wring', 'wrinkle', 'write', 'writhe', 'wrong', 'x-ray', 'xerox', 'yacht', 'yak', 'yap', 'yard', 'yaw', 'yawn', 'yearn', 'yeast', 'yell', 'yellow', 'yelp', 'yen', 'yes', 'yield', 'yo-yo', 'yodel', 'yoke', 'zero', 'zigzag', 'zinc', 'zip', 'zipper', 'zone', 'zoom'
];

const nouns = [
    'aardvark', 'abacus', 'abbey', 'abdomen', 'ability', 'abolishment', 'abroad', 'abuse', 'accelerant', 'accelerator', 'access', 'accident', 'accommodation', 'accompanist', 'accordion', 'account', 'accountant', 'achiever', 'acid', 'acknowledgment', 'acoustic', 'acoustics', 'acrylic', 'act', 'action', 'activity', 'actor', 'actress', 'acupuncture', 'ad', 'adapter', 'addiction', 'addition', 'address', 'adjustment', 'administration', 'adrenalin', 'adult', 'adulthood', 'advance', 'advancement', 'advantage', 'advertisement', 'advertising', 'advice', 'affair', 'affect', 'aftermath', 'afternoon', 'aftershave', 'aftershock', 'afterthought', 'age', 'agency', 'agenda', 'agent', 'aggression', 'aglet', 'agreement', 'aid', 'air', 'airbag', 'airbus', 'airfare', 'airforce', 'airline', 'airmail', 'airplane', 'airport', 'airship', 'alarm', 'alb', 'albatross', 'alcohol', 'alcove', 'alder', 'algebra', 'alibi', 'allergist', 'alley', 'alligator', 'alloy', 'almanac', 'almond', 'alpaca', 'alpenglow', 'alpenhorn', 'alpha', 'alphabet', 'alternative', 'altitude', 'alto', 'aluminium', 'aluminum', 'ambassador', 'ambition', 'ambulance', 'amendment', 'amount', 'amusement', 'anagram', 'analgesia', 'analog', 'analogue', 'analogy', 'analysis', 'analyst', 'anatomy', 'anesthesiology', 'anethesiologist', 'anger', 'angiosperm', 'angle', 'angora', 'angstrom', 'anguish', 'animal', 'anime', 'ankle', 'anklet', 'annual', 'anorak', 'answer', 'ant', 'anteater', 'antechamber', 'antelope', 'anthony', 'anthropology', 'antler', 'anxiety', 'anybody', 'anything', 'anywhere', 'apartment', 'ape', 'aperitif', 'apology', 'apparatus', 'apparel', 'appeal', 'appearance', 'appendix', 'applause', 'apple', 'applewood', 'appliance', 'application', 'appointment', 'approval', 'apron', 'apse', 'aquifer', 'arch', 'archaeology', 'archeology', 'archer', 'architect', 'architecture', 'arch-rival', 'area', 'argument', 'arithmetic', 'arm', 'armadillo', 'armament', 'armchair', 'armoire', 'armor', 'arm-rest', 'army', 'arrival', 'arrow', 'art', 'artichoke', 'article', 'artificer', 'ascot', 'ash', 'ashram', 'ashtray', 'aside', 'ask', 'asparagus', 'aspect', 'asphalt', 'assignment', 'assist', 'assistance', 'assistant', 'associate', 'association', 'assumption', 'asterisk', 'astrakhan', 'astrolabe', 'astrologer', 'astrology', 'astronomy', 'atelier', 'athlete', 'athletics', 'atmosphere', 'atom', 'atrium', 'attachment', 'attack', 'attempt', 'attendant', 'attention', 'attenuation', 'attic', 'attitude', 'attorney', 'attraction', 'audience', 'auditorium', 'aunt', 'author', 'authorisation', 'authority', 'authorization', 'automaton', 'avalanche', 'avenue', 'average', 'award', 'awareness', 'azimuth', 'babe', 'baboon', 'babushka', 'baby', 'back', 'backbone', 'backdrop', 'background', 'backpack', 'bacon', 'bad', 'badge', 'badger', 'bafflement', 'bag', 'bagel', 'baggage', 'bagpipe', 'bail', 'bait', 'bake', 'baker', 'bakery', 'bakeware', 'balaclava', 'balalaika', 'balance', 'balcony', 'ball', 'ballet', 'balloon', 'ballpark', 'bamboo', 'banana', 'band', 'bandana', 'bandanna', 'bandolier', 'bangle', 'banjo', 'bank', 'bankbook', 'banker', 'banquette', 'baobab', 'bar', 'barbeque', 'barber', 'barbiturate', 'barge', 'baritone', 'barium', 'barn', 'barometer', 'barracks', 'barstool', 'base', 'baseball', 'basement', 'basin', 'basis', 'basket', 'basketball', 'bass', 'bassinet', 'bassoon', 'bat', 'bath', 'bather', 'bathhouse', 'bathrobe', 'bathroom', 'bathtub', 'batter', 'battery', 'batting', 'battle', 'battleship', 'bay', 'bayou', 'beach', 'bead', 'beak', 'beam', 'bean', 'beanie', 'beanstalk', 'bear', 'beard', 'beast', 'beat', 'beautiful', 'beauty', 'beaver', 'bed', 'bedroom', 'bee', 'beech', 'beef', 'beer', 'beet', 'beetle', 'beggar', 'beginner', 'beginning', 'begonia', 'behavior', 'beheading', 'behest', 'being', 'belfry', 'belief', 'believe', 'bell', 'belligerency', 'bellows', 'belly', 'belt', 'bench', 'bend', 'beneficiary', 'benefit', 'bengal', 'beret', 'berry', 'bestseller', 'best-seller', 'bet', 'beverage', 'beyond', 'bibliography', 'bicycle', 'bid', 'bidet', 'bifocals', 'big', 'big-rig', 'bijou', 'bike', 'bikini', 'bill', 'billboard', 'bin', 'biology', 'biplane', 'birch', 'bird', 'birdbath', 'birdcage', 'birdhouse', 'bird-watcher', 'birth', 'birthday', 'bit', 'bite', 'bitter', 'black', 'blackberry', 'blackboard', 'blackfish', 'bladder', 'blade', 'blame', 'blank', 'blanket', 'blazer', 'blight', 'blind', 'blinker', 'blister', 'blizzard', 'block', 'blocker', 'blood', 'bloodflow', 'bloom', 'bloomers', 'blossom', 'blouse', 'blow', 'blowgun', 'blowhole', 'blue', 'blueberry', 'boar', 'board', 'boat', 'boat-building', 'boatload', 'boatyard', 'bobcat', 'body', 'bog', 'bolero', 'bolt', 'bomb', 'bomber', 'bondsman', 'bone', 'bongo', 'bonnet', 'bonsai', 'bonus', 'boogeyman', 'book', 'bookcase', 'bookend', 'booklet', 'booster', 'boot', 'bootee', 'bootie', 'boots', 'booty', 'border', 'bore', 'bosom', 'boss', 'botany', 'bother', 'bottle', 'bottling', 'bottom', 'bottom-line', 'boudoir', 'bough', 'boundary', 'bow', 'bower', 'bowl', 'bowler', 'bowling', 'bowtie', 'box', 'boxer', 'boxspring', 'boy', 'boyfriend', 'bra', 'brace', 'bracelet', 'bracket', 'brain', 'brake', 'branch', 'brand', 'brandy', 'brass', 'brassiere', 'bratwurst', 'brave', 'bread', 'breadcrumb', 'break', 'breakfast', 'breakpoint', 'breast', 'breastplate', 'breath', 'breeze', 'bribery', 'brick', 'bricklaying', 'bridge', 'brief', 'briefs', 'brilliant', 'british', 'broad', 'broccoli', 'brochure', 'broiler', 'broker', 'brome', 'bronchitis', 'bronco', 'bronze', 'brooch', 'brood', 'brook', 'broom', 'brother', 'brother-in-law', 'brow', 'brown', 'brush', 'brushfire', 'brushing', 'bubble', 'bucket', 'buckle', 'bud', 'buddy', 'budget', 'buffer', 'buffet', 'bug', 'buggy', 'bugle', 'building', 'bulb', 'bull', 'bulldozer', 'bullet', 'bull-fighter', 'bumper', 'bun', 'bunch', 'bungalow', 'bunghole', 'bunkhouse', 'burglar', 'burlesque', 'burn', 'burn-out', 'burst', 'bus', 'bush', 'business', 'bust', 'bustle', 'butane', 'butcher', 'butter', 'button', 'buy', 'buyer', 'buzzard', 'cabana', 'cabbage', 'cabin', 'cabinet', 'cable', 'caboose', 'cacao', 'cactus', 'caddy', 'cadet', 'cafe', 'caftan', 'cake', 'calcification', 'calculation', 'calculator', 'calculus', 'calendar', 'calf', 'calico', 'call', 'calm', 'camel', 'cameo', 'camera', 'camp', 'campaign', 'campanile', 'can', 'canal', 'cancel', 'cancer', 'candelabra', 'candidate', 'candle', 'candy', 'cane', 'cannon', 'canoe', 'canon', 'canopy', 'canteen', 'canvas', 'cap', 'cape', 'capital', 'capitulation', 'capon', 'cappelletti', 'cappuccino', 'captain', 'caption', 'car', 'caravan', 'carbon', 'card', 'cardboard', 'cardigan', 'care', 'career', 'cargo', 'carload', 'carnation', 'carol', 'carotene', 'carp', 'carpenter', 'carpet', 'carport', 'carriage', 'carrier', 'carrot', 'carry', 'cart', 'cartilage', 'cartload', 'cartoon', 'cartridge', 'cascade', 'case', 'casement', 'cash', 'cashier', 'casino', 'casserole', 'cassock', 'cast', 'castanet', 'castanets', 'castle', 'cat', 'catacomb', 'catamaran', 'catch', 'category', 'caterpillar', 'cathedral', 'catsup', 'cattle', 'cauliflower', 'cause', 'caution', 'cave', 'c-clamp', 'cd', 'ceiling', 'celebration', 'celeriac', 'celery', 'celeste', 'cell', 'cellar', 'cello', 'celsius', 'cement', 'cemetery', 'cenotaph', 'census', 'cent', 'center', 'centimeter', 'centurion', 'century', 'cephalopod', 'ceramic', 'cereal', 'certification', 'cesspool', 'chafe', 'chain', 'chainstay', 'chair', 'chairlift', 'chairman', 'chairperson', 'chaise', 'chalet', 'chalice', 'chalk', 'challenge', 'champion', 'championship', 'chance', 'chandelier', 'change', 'channel', 'chaos', 'chap', 'chapel', 'chapter', 'character', 'chard', 'charge', 'charity', 'charlatan', 'charles', 'charm', 'chart', 'chastity', 'chasuble', 'chateau', 'chauffeur', 'chauvinist', 'check', 'checkroom', 'cheek', 'cheetah', 'chef', 'chemical', 'chemistry', 'cheque', 'cherries', 'cherry', 'chess', 'chest', 'chick', 'chicken', 'chicory', 'chief', 'chiffonier', 'child', 'childhood', 'children', 'chill', 'chime', 'chimpanzee', 'chin', 'chino', 'chip', 'chipmunk', 'chit-chat', 'chivalry', 'chive', 'chocolate', 'choice', 'choker', 'chop', 'chopstick', 'chord', 'chowder', 'chrome', 'chromolithograph', 'chronograph', 'chronometer', 'chub', 'chug', 'church', 'churn', 'cicada', 'cigarette', 'cinema', 'circle', 'circulation', 'circumference', 'cirrus', 'citizenship', 'city', 'civilisation', 'claim', 'clam', 'clank', 'clapboard', 'clarinet', 'clasp', 'class', 'classic', 'classroom', 'clause', 'clave', 'clavicle', 'clavier', 'cleaner', 'cleat', 'cleavage', 'clef', 'cleric', 'clerk', 'click', 'client', 'cliff', 'climate', 'climb', 'clip', 'clipper', 'cloak', 'cloakroom', 'clock', 'clockwork', 'clogs', 'cloister', 'close', 'closet', 'cloth', 'clothes', 'clothing', 'cloud', 'cloudburst', 'cloudy', 'clove', 'clover', 'club', 'clue', 'clutch', 'coach', 'coal', 'coast', 'coat', 'cob', 'cobweb', 'cockpit', 'cockroach', 'cocktail', 'cocoa', 'cod', 'code', 'codon', 'codpiece', 'coevolution', 'coffee', 'coffin', 'coil', 'coin', 'coinsurance', 'coke', 'cold', 'coliseum', 'collar', 'collection', 'college', 'collision', 'colloquia', 'colon', 'colonisation', 'colony', 'color', 'colt', 'column', 'columnist', 'comb', 'combat', 'combination', 'combine', 'comfort', 'comfortable', 'comic', 'comma', 'command', 'comment', 'commerce', 'commercial', 'commission', 'committee', 'common', 'communicant', 'communication', 'community', 'company', 'comparison', 'compassion', 'competition', 'competitor', 'complaint', 'complement', 'complex', 'component', 'comportment', 'composer', 'composition', 'compost', 'comprehension', 'compulsion', 'computer', 'comradeship', 'concentrate', 'concept', 'concern', 'concert', 'conclusion', 'concrete', 'condition', 'condominium', 'condor', 'conductor', 'cone', 'confectionery', 'conference', 'confidence', 'confirmation', 'conflict', 'confusion', 'conga', 'congo', 'congress', 'congressman', 'congressperson', 'conifer', 'connection', 'consent', 'consequence', 'consideration', 'consist', 'console', 'consonant', 'conspirator', 'constant', 'constellation', 'construction', 'consul', 'consulate', 'contact', 'contact lens', 'contagion', 'content', 'contest', 'context', 'continent', 'contract', 'contrail', 'contrary', 'contribution', 'control', 'convection', 'conversation', 'convert', 'convertible', 'cook', 'cookie', 'cooking', 'coonskin', 'cope', 'cop-out', 'copper', 'co-producer', 'copy', 'copyright', 'copywriter', 'cord', 'corduroy', 'cork', 'cormorant', 'corn', 'corner', 'cornerstone', 'cornet', 'corral', 'correspondent', 'corridor', 'corruption', 'corsage', 'cost', 'costume', 'cot', 'cottage', 'cotton', 'couch', 'cougar', 'cough', 'council', 'councilman', 'councilor', 'councilperson', 'count', 'counter', 'counter-force', 'countess', 'country', 'county', 'couple', 'courage', 'course', 'court', 'cousin', 'covariate', 'cover', 'coverall', 'cow', 'cowbell', 'cowboy', 'crab', 'crack', 'cracker', 'crackers', 'cradle', 'craft', 'craftsman', 'crash', 'crate', 'cravat', 'craw', 'crawdad', 'crayfish', 'crayon', 'crazy', 'cream', 'creative', 'creator', 'creature', 'creche', 'credenza', 'credit', 'creditor', 'creek', 'creme brulee', 'crest', 'crew', 'crib', 'cribbage', 'cricket', 'cricketer', 'crime', 'criminal', 'crinoline', 'criteria', 'criterion', 'criticism', 'crocodile', 'crocus', 'croissant', 'crook', 'crop', 'cross', 'cross-contamination', 'cross-stitch', 'crotch', 'croup', 'crow', 'crowd', 'crown', 'crude', 'crush', 'cry', 'crystallography', 'cub', 'cuckoo', 'cucumber', 'cuff-links', 'cultivar', 'cultivator', 'culture', 'culvert', 'cummerbund', 'cup', 'cupboard', 'cupcake', 'cupola', 'curio', 'curl', 'curler', 'currency', 'current', 'cursor', 'curtain', 'curve', 'cushion', 'custard', 'customer', 'cut', 'cuticle', 'cutlet', 'cutover', 'cutting', 'cyclamen', 'cycle', 'cyclone', 'cylinder', 'cymbal', 'cymbals', 'cynic', 'cyst', 'cytoplasm', 'dad', 'daffodil', 'dagger', 'dahlia', 'daisy', 'damage', 'dame', 'dance', 'dancer', 'dancing', 'danger', 'daniel', 'dare', 'dark', 'dart', 'dash', 'dashboard', 'data', 'database', 'date', 'daughter', 'david', 'day', 'daybed', 'dead', 'deadline', 'deal', 'dealer', 'dear', 'death', 'deathwatch', 'debate', 'debt', 'debtor', 'decade', 'decimal', 'decision', 'deck', 'declination', 'decongestant', 'decrease', 'decryption', 'dedication', 'deep', 'deer', 'defense', 'deficit', 'definition', 'deformation', 'degree', 'delay', 'delete', 'delight', 'delivery', 'demand', 'demur', 'den', 'denim', 'dentist', 'deodorant', 'department', 'departure', 'dependent', 'deployment', 'deposit', 'depression', 'depressive', 'depth', 'deputy', 'derby', 'derrick', 'description', 'desert', 'design', 'designer', 'desire', 'desk', 'dessert', 'destiny', 'destroyer', 'destruction', 'detail', 'detainment', 'detective', 'detention', 'determination', 'development', 'deviance', 'device', 'devil', 'dew', 'dhow', 'diadem', 'diamond', 'diaphragm', 'diarist', 'dibble', 'dickey', 'dictaphone', 'diction', 'dictionary', 'diet', 'difference', 'differential', 'difficulty', 'dig', 'digestion', 'digger', 'digital', 'dignity', 'dilapidation', 'dill', 'dime', 'dimension', 'dimple', 'diner', 'dinghy', 'dinner', 'dinosaur', 'diploma', 'dipstick', 'direction', 'director', 'dirndl', 'dirt', 'disadvantage', 'disarmament', 'disaster', 'discipline', 'disco', 'disconnection', 'discount', 'discovery', 'discrepancy', 'discussion', 'disease', 'disembodiment', 'disengagement', 'disguise', 'disgust', 'dish', 'dishes', 'dishwasher', 'disk', 'display', 'disposer', 'distance', 'distribution', 'distributor', 'district', 'divan', 'diver', 'divide', 'divider', 'diving', 'division', 'dock', 'doctor', 'document', 'doe', 'dog', 'dogsled', 'dogwood', 'doll', 'dollar', 'dolman', 'dolphin', 'domain', 'donkey', 'door', 'doorknob', 'doorpost', 'dory', 'dot', 'double', 'doubling', 'doubt', 'doubter', 'downforce', 'downgrade', 'downtown', 'draft', 'drag', 'dragon', 'dragonfly', 'dragster', 'drain', 'drake', 'drama', 'dramaturge', 'draw', 'drawbridge', 'drawer', 'drawing', 'dream', 'dredger', 'dress', 'dresser', 'dressing', 'drill', 'drink', 'drive', 'driver', 'driveway', 'driving', 'drizzle', 'dromedary', 'drop', 'drug', 'drum', 'drummer', 'drunk', 'dry', 'dryer', 'duck', 'duckling', 'dud', 'due', 'duffel', 'dugout', 'dulcimer', 'dumbwaiter', 'dump', 'dump truck', 'dune buggy', 'dungarees', 'dungeon', 'duplexer', 'dust', 'dust storm', 'duster', 'duty', 'dwarf', 'dwelling', 'dynamo', 'eagle', 'ear', 'eardrum', 'earmuffs', 'earplug', 'earrings', 'earth', 'earthquake', 'earthworm', 'ease', 'easel', 'east', 'eat', 'eave', 'eavesdropper', 'e-book', 'ecclesia', 'eclipse', 'ecliptic', 'economics', 'economy', 'ecumenist', 'eddy', 'edge', 'edger', 'editor', 'editorial', 'education', 'edward', 'eel', 'effacement', 'effect', 'effective', 'efficacy', 'efficiency', 'effort', 'egg', 'egghead', 'eggnog', 'eggplant', 'eight', 'ejector', 'elbow', 'election', 'electricity', 'electrocardiogram', 'element', 'elephant', 'elevator', 'elixir', 'elk', 'ellipse', 'elm', 'elongation', 'embossing', 'emergence', 'emergency', 'emergent', 'emery', 'emotion', 'emphasis', 'employ', 'employee', 'employer', 'employment', 'empowerment', 'emu', 'encirclement', 'encyclopedia', 'end', 'endothelium', 'enemy', 'energy', 'engine', 'engineer', 'engineering', 'enigma', 'enjoyment', 'enquiry', 'entertainment', 'enthusiasm', 'entrance', 'entry', 'environment', 'envy', 'epauliere', 'epee', 'ephemera', 'ephemeris', 'epoch', 'eponym', 'epoxy', 'equal', 'equinox', 'equipment', 'equivalent', 'era', 'e-reader', 'error', 'escape', 'ese', 'espadrille', 'espalier', 'essay', 'establishment', 'estate', 'estimate', 'estrogen', 'estuary', 'ethernet', 'ethics', 'euphonium', 'eurocentrism', 'europe', 'evaluator', 'evening', 'evening-wear', 'event', 'eviction', 'evidence', 'evocation', 'evolution', 'exam', 'examination', 'examiner', 'example', 'exchange', 'excitement', 'exclamation', 'excuse', 'executor', 'exercise', 'exhaust', 'ex-husband', 'exile', 'existence', 'exit', 'expansion', 'expansionism', 'experience', 'expert', 'explanation', 'exposition', 'expression', 'extension', 'extent', 'external', 'extreme', 'ex-wife', 'eye', 'eyeball', 'eyebrow', 'eyebrows', 'eyeglasses', 'eyelash', 'eyelashes', 'eyelid', 'eyelids', 'eyeliner', 'eyestrain', 'face', 'facelift', 'facet', 'facilities', 'facsimile', 'fact', 'factor', 'factory', 'faculty', 'fahrenheit', 'fail', 'failure', 'fairies', 'fairy', 'faith', 'fall', 'falling-out', 'fame', 'familiar', 'family', 'fan', 'fang', 'fanlight', 'fanny', 'fanny-pack', 'farm', 'farmer', 'fascia', 'fat', 'father', 'father-in-law', 'fatigues', 'faucet', 'fault', 'fawn', 'fax', 'fear', 'feast', 'feather', 'feature', 'fedelini', 'fedora', 'fee', 'feed', 'feedback', 'feel', 'feeling', 'feet', 'felony', 'female', 'fen', 'fence', 'fencing', 'fender', 'ferry', 'ferryboat', 'fertilizer', 'few', 'fiber', 'fiberglass', 'fibre', 'fiction', 'fiddle', 'field', 'fifth', 'fight', 'fighter', 'figure', 'figurine', 'file', 'fill', 'filly', 'film', 'filth', 'final', 'finance', 'find', 'finding', 'fine', 'finger', 'fingernail', 'finish', 'finisher', 'fir', 'fire', 'fireman', 'fireplace', 'firewall', 'fish', 'fishbone', 'fisherman', 'fishery', 'fishing', 'fishmonger', 'fishnet', 'fisting', 'fix', 'fixture', 'flag', 'flame', 'flanker', 'flare', 'flash', 'flat', 'flatboat', 'flavor', 'flax', 'fleck', 'fleece', 'flesh', 'flight', 'flintlock', 'flip-flops', 'flock', 'flood', 'floor', 'floozie', 'flour', 'flow', 'flower', 'flu', 'flugelhorn', 'fluke', 'flute', 'fly', 'flytrap', 'foam', 'fob', 'focus', 'fog', 'fold', 'folder', 'following', 'fondue', 'font', 'food', 'foot', 'football', 'footnote', 'footrest', 'foot-rest', 'footstool', 'foray', 'force', 'forearm', 'forebear', 'forecast', 'forehead', 'forest', 'forestry', 'forever', 'forgery', 'fork', 'form', 'formal', 'format', 'former', 'fort', 'fortnight', 'fortress', 'fortune', 'forum', 'foundation', 'fountain', 'fowl', 'fox', 'foxglove', 'fragrance', 'frame', 'fratricide', 'fraudster', 'frazzle', 'freckle', 'freedom', 'freeplay', 'freeze', 'freezer', 'freight', 'freighter', 'freon', 'fresco', 'friction', 'fridge', 'friend', 'friendship', 'frigate', 'fringe', 'frock', 'frog', 'front', 'frost', 'frown', 'fruit', 'frustration', 'fuel', 'fulfillment', 'full', 'fun', 'function', 'fundraising', 'funeral', 'funny', 'fur', 'furnace', 'furniture', 'fusarium', 'futon', 'future', 'gaffer', 'gain', 'gaiters', 'gale', 'gall-bladder', 'gallery', 'galley', 'gallon', 'galn', 'galoshes', 'game', 'gamebird', 'gamma-ray', 'gander', 'gap', 'garage', 'garb', 'garbage', 'garden', 'garlic', 'garment', 'garter', 'gas', 'gasoline', 'gastropod', 'gate', 'gateway', 'gather', 'gauge', 'gauntlet', 'gazebo', 'gazelle', 'gear', 'gearshift', 'geese', 'gelding', 'gem', 'gemsbok', 'gender', 'gene', 'general', 'genetics', 'geography', 'geology', 'geometry', 'george', 'geranium', 'gerbil', 'geyser', 'gherkin', 'ghost', 'giant', 'gift', 'gigantism', 'ginseng', 'giraffe', 'girdle', 'girl', 'girlfriend', 'git', 'give', 'glad', 'gladiolus', 'gland', 'glass', 'glasses', 'glen', 'glider', 'gliding', 'glockenspiel', 'glove', 'gloves', 'glue', 'glut', 'go', 'goal', 'goat', 'gobbler', 'god', 'godmother', 'goggles', 'go-kart', 'gold', 'goldfish', 'golf', 'gondola', 'gong', 'good', 'goodbye', 'good-bye', 'goodie', 'goose', 'gopher', 'gore-tex', 'gorilla', 'gosling', 'gossip', 'governance', 'government', 'governor', 'gown', 'grab', 'grab-bag', 'grade', 'grain', 'gram', 'grammar', 'grand', 'granddaughter', 'grandfather', 'grandmom', 'grandmother', 'grandson', 'granny', 'grape', 'grapefruit', 'graph', 'graphic', 'grass', 'grasshopper', 'grassland', 'gratitude', 'gray', 'grease', 'great', 'great-grandfather', 'great-grandmother', 'greek', 'green', 'greenhouse', 'grenade', 'grey', 'grief', 'grill', 'grip', 'grit', 'grocery', 'ground', 'group', 'grouper', 'grouse', 'growth', 'guarantee', 'guard', 'guess', 'guest', 'guestbook', 'guidance', 'guide', 'guilt', 'guilty', 'guitar', 'guitarist', 'gum', 'gumshoes', 'gun', 'gutter', 'guy', 'gym', 'gymnast', 'gymnastics', 'gynaecology', 'gyro', 'habit', 'hacienda', 'hacksaw', 'hackwork', 'hail', 'hair', 'haircut', 'half', 'half-brother', 'half-sister', 'halibut', 'hall', 'hallway', 'hamaki', 'hamburger', 'hammer', 'hammock', 'hamster', 'hand', 'handball', 'hand-holding', 'handicap', 'handle', 'handlebar', 'handmaiden', 'handsaw', 'hang', 'happiness', 'harbor', 'harbour', 'hardboard', 'hardcover', 'hardening', 'hardhat', 'hard-hat', 'hardware', 'harm', 'harmonica', 'harmony', 'harp', 'harpooner', 'harpsichord', 'hassock', 'hat', 'hatbox', 'hatchet', 'hate', 'hatred', 'haunt', 'haversack', 'hawk', 'hay', 'head', 'headlight', 'headline', 'headrest', 'health', 'hearing', 'heart', 'heartache', 'hearth', 'hearthside', 'heart-throb', 'heartwood', 'heat', 'heater', 'heaven', 'heavy', 'hedge', 'hedgehog', 'heel', 'height', 'heirloom', 'helen', 'helicopter', 'helium', 'hell', 'hellcat', 'hello', 'helmet', 'helo', 'help', 'hemp', 'hen', 'herb', 'heron', 'herring', 'hexagon', 'heyday', 'hide', 'high', 'highlight', 'high-rise', 'highway', 'hill', 'hip', 'hippodrome', 'hippopotamus', 'hire', 'history', 'hit', 'hive', 'hobbies', 'hobbit', 'hobby', 'hockey', 'hoe', 'hog', 'hold', 'hole', 'holiday', 'home', 'homework', 'homogenate', 'homonym', 'honesty', 'honey', 'honeybee', 'honoree', 'hood', 'hoof', 'hook', 'hope', 'hops', 'horn', 'hornet', 'horror', 'horse', 'hose', 'hosiery', 'hospice', 'hospital', 'hospitality', 'host', 'hostel', 'hostess', 'hot', 'hot-dog', 'hotel', 'hour', 'hourglass', 'house', 'houseboat', 'housework', 'housing', 'hovel', 'hovercraft', 'howitzer', 'hub', 'hubcap', 'hugger', 'human', 'humidity', 'humor', 'humour', 'hunger', 'hunt', 'hurdler', 'hurricane', 'hurry', 'hurt', 'husband', 'hut', 'hutch', 'hyacinth', 'hybridisation', 'hydrant', 'hydraulics', 'hydrofoil', 'hydrogen', 'hyena', 'hygienic', 'hyphenation', 'hypochondria', 'hypothermia', 'ice', 'icebreaker', 'icecream', 'ice-cream', 'icicle', 'icon', 'idea', 'ideal', 'if', 'igloo', 'ikebana', 'illegal', 'image', 'imagination', 'impact', 'implement', 'importance', 'impress', 'impression', 'imprisonment', 'improvement', 'impudence', 'impulse', 'inbox', 'incandescence', 'inch', 'incident', 'income', 'increase', 'independence', 'independent', 'index', 'indication', 'indigence', 'individual', 'industry', 'inevitable', 'infancy', 'inflammation', 'inflation', 'influence', 'information', 'infusion', 'inglenook', 'ingrate', 'initial', 'initiative', 'in-joke', 'injury', 'injustice', 'ink', 'in-laws', 'inlay', 'inn', 'innervation', 'innocence', 'innocent', 'input', 'inquiry', 'inscription', 'insect', 'inside', 'insolence', 'inspection', 'inspector', 'instance', 'instruction', 'instrument', 'instrumentalist', 'instrumentation', 'insulation', 'insurance', 'insurgence', 'intelligence', 'intention', 'interaction', 'interactive', 'interest', 'interferometer', 'interior', 'interloper', 'internal', 'international', 'internet', 'interpreter', 'intervenor', 'interview', 'interviewer', 'intestine', 'intestines', 'introduction', 'invention', 'inventor', 'inventory', 'investment', 'invite', 'invoice', 'iridescence', 'iris', 'iron', 'ironclad', 'irony', 'island', 'issue', 'it', 'item', 'jackal', 'jacket', 'jaguar', 'jail', 'jailhouse', 'jam', 'james', 'jar', 'jasmine', 'jaw', 'jealousy', 'jeans', 'jeep', 'jeff', 'jelly', 'jellyfish', 'jet', 'jewel', 'jewelry', 'jiffy', 'job', 'jockey', 'jodhpurs', 'joey', 'jogging', 'join', 'joint', 'joke', 'jot', 'journey', 'joy', 'judge', 'judgment', 'judo', 'juggernaut', 'juice', 'jumbo', 'jump', 'jumper', 'jumpsuit', 'junior', 'junk', 'junker', 'junket', 'jury', 'justice', 'jute', 'kale', 'kamikaze', 'kangaroo', 'karate', 'karen', 'kayak', 'kazoo', 'keep', 'kendo', 'ketch', 'ketchup', 'kettle', 'kettledrum', 'key', 'keyboard', 'keyboarding', 'keystone', 'kick', 'kick-off', 'kid', 'kidney', 'kidneys', 'kielbasa', 'kill', 'kilogram', 'kilometer', 'kilt', 'kimono', 'kind', 'kindness', 'king', 'kingfish', 'kiosk', 'kiss', 'kitchen', 'kite', 'kitten', 'kitty', 'kleenex', 'klomps', 'knee', 'kneejerk', 'knickers', 'knife', 'knife-edge', 'knight', 'knitting', 'knot', 'knowledge', 'knuckle', 'koala', 'kohlrabi', 'lab', 'laborer', 'labour', 'lace', 'lack', 'lacquerware', 'ladder', 'lady', 'ladybug', 'lake', 'lamb', 'lamp', 'lan', 'lanai', 'land', 'landform', 'landmine', 'landscape', 'language', 'lantern', 'lap', 'laparoscope', 'lapdog', 'laptop', 'larch', 'larder', 'lark', 'laryngitis', 'lasagna', 'latency', 'latex', 'lathe', 'latte', 'laugh', 'laughter', 'laundry', 'lava', 'law', 'lawn', 'lawsuit', 'lawyer', 'lay', 'layer', 'lead', 'leader', 'leadership', 'leading', 'leaf', 'league', 'leaker', 'learning', 'leash', 'leather', 'leave', 'leaver', 'lecture', 'leek', 'leg', 'legal', 'legging', 'legume', 'lei', 'leisure', 'lemon', 'lemonade', 'lemur', 'length', 'lentil', 'leprosy', 'lesson', 'let', 'letter', 'lettuce', 'level', 'lever', 'leverage', 'license', 'lie', 'lier', 'life', 'lift', 'light', 'lighting', 'lightning', 'lilac', 'lily', 'limit', 'limo', 'line', 'linen', 'liner', 'linguistics', 'link', 'linseed', 'lion', 'lip', 'lipstick', 'liquid', 'liquor', 'lisa', 'list', 'listen', 'literature', 'litigation', 'litter', 'liver', 'livestock', 'living', 'lizard', 'llama', 'load', 'loaf', 'loafer', 'loan', 'lobotomy', 'lobster', 'local', 'location', 'lock', 'locker', 'locket', 'locomotive', 'locust', 'loft', 'log', 'loggia', 'logic', 'loincloth', 'loneliness', 'long', 'look', 'loss', 'lot', 'lotion', 'lounge', 'lout', 'love', 'low', 'loyalty', 'luck', 'luggage', 'lumber', 'lumberman', 'lunch', 'luncheonette', 'lunchroom', 'lung', 'lunge', 'lute', 'luttuce', 'lycra', 'lye', 'lymphocyte', 'lynx', 'lyocell', 'lyre', 'lyric', 'macadamia', 'macaroni', 'machine', 'machinery', 'macrame', 'macrofauna', 'maelstrom', 'maestro', 'magazine', 'magic', 'maid', 'maiden', 'mail', 'mailbox', 'mailman', 'main', 'maintenance', 'major', 'major-league', 'make', 'makeup', 'male', 'mall', 'mallet', 'mambo', 'mammoth', 'man', 'management', 'manager', 'mandarin', 'mandolin', 'mangrove', 'manhunt', 'maniac', 'manicure', 'mankind', 'manner', 'manor', 'mansard', 'manservant', 'mansion', 'mantel', 'mantle', 'mantua', 'manufacturer', 'manx', 'many', 'map', 'maple', 'maraca', 'maracas', 'marble', 'mare', 'margin', 'mariachi', 'marimba', 'mark', 'market', 'marketing', 'marksman', 'marriage', 'marsh', 'marshland', 'marxism', 'mascara', 'mask', 'mass', 'massage', 'master', 'mastication', 'mastoid', 'mat', 'match', 'mate', 'material', 'math', 'mathematics', 'matter', 'mattock', 'mattress', 'maximum', 'maybe', 'mayonnaise', 'mayor', 'meal', 'meaning', 'measles', 'measure', 'measurement', 'meat', 'mechanic', 'media', 'medicine', 'medium', 'meet', 'meeting', 'megaliac', 'melody', 'member', 'membership', 'memory', 'men', 'menorah', 'mention', 'menu', 'mercury', 'mess', 'message', 'metal', 'metallurgist', 'meteor', 'meteorology', 'meter', 'methane', 'method', 'methodology', 'metro', 'metronome', 'mezzanine', 'mice', 'microlending', 'microwave', 'mid-course', 'middle', 'middleman', 'midi', 'midline', 'midnight', 'midwife', 'might', 'migrant', 'mile', 'milk', 'milkshake', 'millennium', 'millimeter', 'millisecond', 'mime', 'mimosa', 'mind', 'mine', 'mini', 'minibus', 'minimum', 'minion', 'mini-skirt', 'minister', 'minor', 'minor-league', 'mint', 'minute', 'mirror', 'miscarriage', 'miscommunication', 'misfit', 'misogyny', 'misplacement', 'misreading', 'miss', 'missile', 'mission', 'mist', 'mistake', 'mister', 'miter', 'mitten', 'mix', 'mixer', 'mixture', 'moat', 'mobile', 'moccasins', 'mocha', 'mode', 'model', 'modem', 'mole', 'mom', 'moment', 'monastery', 'monasticism', 'money', 'monger', 'monitor', 'monkey', 'monocle', 'monotheism', 'monsoon', 'monster', 'month', 'mood', 'moon', 'moonscape', 'moonshine', 'mop', 'morning', 'morsel', 'mortgage', 'mortise', 'mosque', 'mosquito', 'most', 'motel', 'moth', 'mother', 'mother-in-law', 'motion', 'motor', 'motorboat', 'motorcar', 'motorcycle', 'mound', 'mountain', 'mouse', 'mouser', 'mousse', 'moustache', 'mouth', 'mouton', 'move', 'mover', 'movie', 'mower', 'mud', 'mug', 'mukluk', 'mule', 'multimedia', 'muscle', 'musculature', 'museum', 'music', 'music-box', 'music-making', 'mustache', 'mustard', 'mutt', 'mycoplasma', 'n', 'nail', 'name', 'naming', 'nanoparticle', 'napkin', 'nasty', 'nation', 'national', 'native', 'natural', 'naturalisation', 'nature', 'neat', 'necessary', 'neck', 'necklace', 'necktie', 'need', 'needle', 'negative', 'negligee', 'negotiation', 'neologism', 'neon', 'nephew', 'nerve', 'nest', 'net', 'netball', 'netbook', 'netsuke', 'network', 'neurobiologist', 'neuropathologist', 'neuropsychiatry', 'news', 'newspaper', 'newsprint', 'newsstand', 'nexus', 'nicety', 'niche', 'nickel', 'niece', 'night', 'nightclub', 'nightgown', 'nightingale', 'nightlight', 'nitrogen', 'nobody', 'node', 'noise', 'nonbeliever', 'nonconformist', 'nondisclosure', 'nonsense', 'noodle', 'normal', 'norse', 'north', 'nose', 'note', 'notebook', 'nothing', 'notice', 'notify', 'notoriety', 'nougat', 'novel', 'nudge', 'number', 'numeracy', 'numeric', 'numismatist', 'nurse', 'nursery', 'nurture', 'nut', 'nutrition', 'nylon', 'oak', 'oar', 'oasis', 'oatmeal', 'obedience', 'obesity', 'obi', 'object', 'objective', 'obligation', 'oboe', 'observation', 'observatory', 'occasion', 'occupation', 'ocean', 'ocelot', 'octagon', 'octave', 'octavo', 'octet', 'octopus', 'odometer', 'oeuvre', 'offence', 'offer', 'office', 'officer', 'official', 'off-ramp', 'oil', 'okra', 'oldie', 'olive', 'omega', 'omelet', 'oncology', 'one', 'onion', 'open', 'opening', 'opera', 'operation', 'ophthalmologist', 'opinion', 'opium', 'opossum', 'opportunist', 'opportunity', 'opposite', 'option', 'orange', 'orangutan', 'orator', 'orchard', 'orchestra', 'orchid', 'order', 'ordinary', 'ordination', 'organ', 'organisation', 'organization', 'original', 'ornament', 'osmosis', 'osprey', 'ostrich', 'other', 'others', 'ott', 'otter', 'ounce', 'outback', 'outcome', 'outfit', 'outhouse', 'outlay', 'output', 'outrigger', 'outset', 'outside', 'oval', 'ovary', 'oven', 'overcharge', 'overclocking', 'overcoat', 'overexertion', 'overflight', 'overnighter', 'overshoot', 'owl', 'owner', 'ox', 'oxen', 'oxford', 'oxygen', 'oyster', 'pace', 'pacemaker', 'pack', 'package', 'packet', 'pad', 'paddle', 'paddock', 'page', 'pagoda', 'pail', 'pain', 'paint', 'painter', 'painting', 'paintwork', 'pair', 'pajama', 'pajamas', 'palm', 'pamphlet', 'pan', 'pancake', 'pancreas', 'panda', 'panic', 'pannier', 'panpipe', 'pansy', 'panther', 'panties', 'pantologist', 'pantology', 'pantry', 'pants', 'pantsuit', 'panty', 'pantyhose', 'paper', 'paperback', 'parable', 'parachute', 'parade', 'parallelogram', 'paramedic', 'parcel', 'parchment', 'pard', 'parent', 'parentheses', 'park', 'parka', 'parking', 'parrot', 'parsnip', 'part', 'participant', 'particle', 'particular', 'partner', 'partridge', 'party', 'pass', 'passage', 'passbook', 'passenger', 'passion', 'passive', 'past', 'pasta', 'paste', 'pastor', 'pastoralist', 'pastry', 'patch', 'path', 'patience', 'patient', 'patina', 'patio', 'patriarch', 'patricia', 'patrimony', 'patriot', 'patrol', 'pattern', 'pause', 'pavement', 'pavilion', 'paw', 'pawnshop', 'pay', 'payee', 'payment', 'pea', 'peace', 'peach', 'peacoat', 'peacock', 'peak', 'peanut', 'pear', 'pearl', 'pedal', 'peen', 'peer', 'peer-to-peer', 'pegboard', 'pelican', 'pelt', 'pen', 'penalty', 'pencil', 'pendant', 'pendulum', 'penicillin', 'pension', 'pentagon', 'peony', 'people', 'pepper', 'percentage', 'perception', 'perch', 'performance', 'perfume', 'period', 'periodical', 'peripheral', 'permafrost', 'permission', 'permit', 'perp', 'person', 'personal', 'personality', 'perspective', 'pest', 'pet', 'petal', 'petticoat', 'pew', 'pha', 'pharmacist', 'pharmacopoeia', 'phase', 'pheasant', 'philosopher', 'philosophy', 'phone', 'photo', 'photographer', 'phrase', 'physical', 'physics', 'pianist', 'piano', 'piccolo', 'pick', 'pickax', 'picket', 'pickle', 'picture', 'pie', 'piece', 'pier', 'piety', 'pig', 'pigeon', 'pike', 'pile', 'pilgrimage', 'pillbox', 'pillow', 'pilot', 'pimp', 'pimple', 'pin', 'pinafore', 'pince-nez', 'pine', 'pineapple', 'pinecone', 'ping', 'pink', 'pinkie', 'pinstripe', 'pint', 'pinto', 'pinworm', 'pioneer', 'pipe', 'piracy', 'piss', 'pitch', 'pitching', 'pith', 'pizza', 'place', 'plain', 'plan', 'plane', 'planet', 'plant', 'plantation', 'planter', 'plaster', 'plasterboard', 'plastic', 'plate', 'platform', 'platinum', 'platypus', 'play', 'player', 'playground', 'playroom', 'pleasure', 'pleated', 'plenty', 'plier', 'plot', 'plough', 'plover', 'plow', 'plowman', 'plume', 'plunger', 'plywood', 'pneumonia', 'pocket', 'pocketbook', 'pocket-watch', 'poem', 'poet', 'poetry', 'poignance', 'point', 'poison', 'poisoning', 'pole', 'polenta', 'police', 'policeman', 'policy', 'polish', 'politics', 'pollution', 'polo', 'polyester', 'pompom', 'poncho', 'pond', 'pony', 'poof', 'pool', 'pop', 'popcorn', 'poppy', 'popsicle', 'population', 'populist', 'porch', 'porcupine', 'port', 'porter', 'portfolio', 'porthole', 'position', 'positive', 'possession', 'possibility', 'possible', 'post', 'postage', 'postbox', 'poster', 'pot', 'potato', 'potential', 'potty', 'pouch', 'poultry', 'pound', 'pounding', 'poverty', 'powder', 'power', 'practice', 'precedent', 'precipitation', 'preface', 'preference', 'prelude', 'premeditation', 'premier', 'preoccupation', 'preparation', 'presence', 'present', 'presentation', 'president', 'press', 'pressroom', 'pressure', 'pressurisation', 'price', 'pride', 'priest', 'priesthood', 'primary', 'primate', 'prince', 'princess', 'principal', 'principle', 'print', 'printer', 'prior', 'priority', 'prison', 'private', 'prize', 'prizefight', 'probation', 'problem', 'procedure', 'process', 'processing', 'produce', 'producer', 'product', 'production', 'profession', 'professional', 'professor', 'profile', 'profit', 'program', 'progress', 'project', 'promise', 'promotion', 'prompt', 'pronunciation', 'proof', 'proof-reader', 'propane', 'property', 'proposal', 'prose', 'prosecution', 'protection', 'protest', 'protocol', 'prow', 'pruner', 'pseudoscience', 'psychiatrist', 'psychoanalyst', 'psychologist', 'psychology', 'ptarmigan', 'public', 'publicity', 'publisher', 'pudding', 'puddle', 'puffin', 'pull', 'pulley', 'puma', 'pump', 'pumpkin', 'pumpkinseed', 'punch', 'punctuation', 'punishment', 'pupa', 'pupil', 'puppy', 'purchase', 'puritan', 'purple', 'purpose', 'purse', 'push', 'pusher', 'put', 'pvc', 'pyjama', 'pyramid', 'quadrant', 'quail', 'quality', 'quantity', 'quart', 'quarter', 'quartz', 'queen', 'question', 'quicksand', 'quiet', 'quill', 'quilt', 'quince', 'quit', 'quiver', 'quotation', 'quote', 'rabbi', 'rabbit', 'raccoon', 'race', 'racer', 'racing', 'racism', 'racist', 'rack', 'radar', 'radiator', 'radio', 'radiosonde', 'radish', 'raffle', 'raft', 'rag', 'rage', 'rail', 'railway', 'raiment', 'rain', 'rainbow', 'raincoat', 'rainmaker', 'rainstorm', 'raise', 'rake', 'ram', 'rambler', 'ramie', 'ranch', 'random', 'randomisation', 'range', 'rank', 'raspberry', 'rat', 'rate', 'ratio', 'raven', 'ravioli', 'raw', 'rawhide', 'ray', 'rayon', 'reach', 'reactant', 'reaction', 'read', 'reading', 'reality', 'reamer', 'rear', 'reason', 'receipt', 'reception', 'recess', 'recipe', 'recliner', 'recognition', 'recommendation', 'record', 'recorder', 'recording', 'recover', 'recreation', 'recruit', 'rectangle', 'red', 'redesign', 'rediscovery', 'reduction', 'reef', 'refectory', 'reference', 'reflection', 'refrigerator', 'refund', 'refuse', 'region', 'register', 'regret', 'regular', 'regulation', 'reindeer', 'reinscription', 'reject', 'relation', 'relationship', 'relative', 'relaxation', 'release', 'reliability', 'relief', 'religion', 'relish', 'reminder', 'remote', 'remove', 'rent', 'repair', 'reparation', 'repeat', 'replace', 'replacement', 'replication', 'reply', 'report', 'representative', 'reprocessing', 'republic', 'reputation', 'request', 'requirement', 'resale', 'research', 'reserve', 'resident', 'resist', 'resolution', 'resolve', 'resort', 'resource', 'respect', 'respite', 'respond', 'response', 'responsibility', 'rest', 'restaurant', 'result', 'retailer', 'rethinking', 'retina', 'retouch', 'return', 'reveal', 'revenant', 'revenge', 'revenue', 'review', 'revolution', 'revolve', 'revolver', 'reward', 'rheumatism', 'rhinoceros', 'rhyme', 'rhythm', 'rice', 'rich', 'riddle', 'ride', 'rider', 'ridge', 'rifle', 'right', 'rim', 'ring', 'ringworm', 'rip', 'ripple', 'rise', 'riser', 'risk', 'river', 'riverbed', 'rivulet', 'road', 'roadway', 'roast', 'robe', 'robin', 'rock', 'rocker', 'rocket', 'rocket-ship', 'rod', 'role', 'roll', 'roller', 'roof', 'room', 'rooster', 'root', 'rope', 'rose', 'rostrum', 'rotate', 'rough', 'round', 'roundabout', 'route', 'router', 'routine', 'row', 'rowboat', 'royal', 'rub', 'rubber', 'rubbish', 'rubric', 'ruckus', 'ruffle', 'rugby', 'ruin', 'rule', 'rum', 'run', 'runaway', 'runner', 'rush', 'rutabaga', 'ruth', 'ry', 'sabre', 'sack', 'sad', 'saddle', 'safe', 'safety', 'sage', 'sail', 'sailboat', 'sailor', 'salad', 'salary', 'sale', 'salesman', 'salmon', 'salon', 'saloon', 'salt', 'samovar', 'sampan', 'sample', 'samurai', 'sand', 'sandals', 'sandbar', 'sandwich', 'sardine', 'sari', 'sarong', 'sash', 'satellite', 'satin', 'satire', 'satisfaction', 'sauce', 'sausage', 'save', 'saving', 'savings', 'savior', 'saviour', 'saw', 'saxophone', 'scale', 'scallion', 'scanner', 'scarecrow', 'scarf', 'scarification', 'scene', 'scenery', 'scent', 'schedule', 'scheme', 'schizophrenic', 'schnitzel', 'school', 'schoolhouse', 'schooner', 'science', 'scimitar', 'scissors', 'scooter', 'score', 'scorn', 'scow', 'scraper', 'scratch', 'screamer', 'screen', 'screenwriting', 'screw', 'screwdriver', 'screw-up', 'scrim', 'scrip', 'script', 'sculpting', 'sculpture', 'sea', 'seafood', 'seagull', 'seal', 'seaplane', 'search', 'seashore', 'seaside', 'season', 'seat', 'second', 'secret', 'secretariat', 'secretary', 'section', 'sectional', 'sector', 'secure', 'security', 'seed', 'seeder', 'segment', 'select', 'selection', 'self', 'sell', 'semicircle', 'semicolon', 'senator', 'senior', 'sense', 'sensitive', 'sentence', 'sepal', 'septicaemia', 'series', 'servant', 'serve', 'server', 'service', 'session', 'set', 'setting', 'settler', 'sewer', 'sex', 'shack', 'shade', 'shadow', 'shadowbox', 'shake', 'shakedown', 'shaker', 'shallot', 'shame', 'shampoo', 'shanty', 'shape', 'share', 'shark', 'sharon', 'shawl', 'she', 'shearling', 'shears', 'sheath', 'shed', 'sheep', 'sheet', 'shelf', 'shell', 'shelter', 'sherry', 'shield', 'shift', 'shin', 'shine', 'shingle', 'ship', 'shirt', 'shirtdress', 'shoat', 'shock', 'shoe', 'shoehorn', 'shoe-horn', 'shoelace', 'shoemaker', 'shoes', 'shoestring', 'shofar', 'shoot', 'shootdown', 'shop', 'shopper', 'shopping', 'shore', 'shortage', 'shorts', 'shortwave', 'shot', 'shoulder', 'shovel', 'show', 'shower', 'show-stopper', 'shred', 'shrimp', 'shrine', 'sibling', 'sick', 'side', 'sideboard', 'sideburns', 'sidecar', 'sidestream', 'sidewalk', 'siding', 'sign', 'signal', 'signature', 'signet', 'significance', 'signup', 'silence', 'silica', 'silk', 'silkworm', 'sill', 'silly', 'silo', 'silver', 'simple', 'sing', 'singer', 'single', 'sink', 'sir', 'sister', 'sister-in-law', 'sitar', 'site', 'situation', 'size', 'skate', 'skiing', 'skill', 'skin', 'skirt', 'skull', 'skullcap', 'skullduggery', 'skunk', 'sky', 'skylight', 'skyscraper', 'skywalk', 'slapstick', 'slash', 'slave', 'sled', 'sledge', 'sleep', 'sleet', 'sleuth', 'slice', 'slide', 'slider', 'slime', 'slip', 'slipper', 'slippers', 'slope', 'sloth', 'smash', 'smell', 'smelting', 'smile', 'smock', 'smog', 'smoke', 'smoking', 'smuggling', 'snail', 'snake', 'snakebite', 'sneakers', 'sneeze', 'snob', 'snorer', 'snow', 'snowboarding', 'snowflake', 'snowman', 'snowmobiling', 'snowplow', 'snowstorm', 'snowsuit', 'snuggle', 'soap', 'soccer', 'society', 'sociology', 'sock', 'socks', 'soda', 'sofa', 'soft', 'softball', 'softdrink', 'softening', 'software', 'soil', 'soldier', 'solid', 'solitaire', 'solution', 'sombrero', 'somersault', 'somewhere', 'son', 'song', 'songbird', 'sonnet', 'soot', 'soprano', 'sorbet', 'sorrow', 'sort', 'soulmate', 'sound', 'soup', 'source', 'sourwood', 'sousaphone', 'south', 'south america', 'south korea', 'sow', 'soy', 'soybean', 'space', 'spacing', 'spade', 'spaghetti', 'spandex', 'spank', 'spare', 'spark', 'sparrow', 'spasm', 'speaker', 'speakerphone', 'spear', 'special', 'specialist', 'specific', 'spectacle', 'spectacles', 'spectrograph', 'speech', 'speed', 'speedboat', 'spell', 'spelling', 'spend', 'sphere', 'sphynx', 'spider', 'spike', 'spinach', 'spine', 'spiral', 'spirit', 'spiritual', 'spite', 'spleen', 'split', 'sponge', 'spoon', 'sport', 'spot', 'spotlight', 'spray', 'spread', 'spring', 'sprinter', 'sprout', 'spruce', 'spume', 'spur', 'spy', 'square', 'squash', 'squatter', 'squeegee', 'squid', 'squirrel', 'stable', 'stack', 'stacking', 'stadium', 'staff', 'stag', 'stage', 'stain', 'stair', 'staircase', 'stallion', 'stamen', 'stamina', 'stamp', 'stance', 'stand', 'standard', 'standoff', 'star', 'start', 'starter', 'state', 'statement', 'station', 'station-wagon', 'statistic', 'status', 'stay', 'steak', 'steal', 'steam', 'steamroller', 'steel', 'steeple', 'stem', 'stencil', 'step', 'step-aunt', 'step-brother', 'stepdaughter', 'step-daughter', 'step-father', 'step-grandfather', 'step-grandmother', 'stepmother', 'step-mother', 'stepping-stone', 'steps', 'step-sister', 'stepson', 'step-son', 'step-uncle', 'stew', 'stick', 'stiletto', 'still', 'stinger', 'stitch', 'stock', 'stocking', 'stockings', 'stock-in-trade', 'stole', 'stomach', 'stone', 'stonework', 'stool', 'stop', 'stopsign', 'stopwatch', 'storage', 'store', 'storey', 'storm', 'story', 'storyboard', 'story-telling', 'stove', 'strain', 'strait', 'stranger', 'strap', 'strategy', 'straw', 'strawberry', 'stream', 'street', 'streetcar', 'strength', 'stress', 'stretch', 'strike', 'string', 'strip', 'stroke', 'structure', 'struggle', 'stud', 'student', 'studio', 'study', 'stuff', 'stumbling', 'stupid', 'stupidity', 'sturgeon', 'style', 'styling', 'stylus', 'subcomponent', 'subconscious', 'subject', 'submarine', 'subroutine', 'subsidence', 'substance', 'suburb', 'subway', 'success', 'suck', 'suede', 'suffocation', 'sugar', 'suggestion', 'suit', 'suitcase', 'sultan', 'summer', 'sun', 'sunbeam', 'sunbonnet', 'sunday', 'sundial', 'sunflower', 'sunglasses', 'sunlamp', 'sunroom', 'sunshine', 'supermarket', 'supply', 'support', 'supporter', 'suppression', 'surface', 'surfboard', 'surgeon', 'surgery', 'surname', 'surprise', 'surround', 'survey', 'sushi', 'suspect', 'suspenders', 'sustainment', 'SUV', 'swallow', 'swamp', 'swan', 'swath', 'sweat', 'sweater', 'sweats', 'sweatshirt', 'sweatshop', 'sweatsuit', 'swedish', 'sweet', 'sweets', 'swell', 'swim', 'swimming', 'swimsuit', 'swing', 'swiss', 'switch', 'switchboard', 'swivel', 'sword', 'swordfish', 'sycamore', 'symmetry', 'sympathy', 'syndicate', 'synergy', 'synod', 'syrup', 'system', 'tabby', 'tabernacle', 'table', 'tablecloth', 'tabletop', 'tachometer', 'tackle', 'tadpole', 'tail', 'tailor', 'tailspin', 'tale', 'talk', 'tam', 'tambour', 'tambourine', "tam-o'-shanter", 'tandem', 'tangerine', 'tank', 'tanker', 'tankful', 'tank-top', 'tap', 'tard', 'target', 'task', 'tassel', 'taste', 'tatami', 'tattler', 'tattoo', 'tavern', 'tax', 'taxi', 'taxicab', 'tea', 'teach', 'teacher', 'teaching', 'team', 'tear', 'technologist', 'technology', 'teen', 'teeth', 'telephone', 'telescreen', 'teletype', 'television', 'tell', 'teller', 'temp', 'temper', 'temperature', 'temple', 'tempo', 'temporariness', 'temporary', 'temptress', 'tendency', 'tenement', 'tennis', 'tenor', 'tension', 'tent', 'tepee', 'term', 'terracotta', 'terrapin', 'territory', 'test', 'text', 'textbook', 'texture', 'thanks', 'thaw', 'theater', 'theism', 'theme', 'theory', 'therapist', 'thermals', 'thermometer', 'thigh', 'thing', 'thinking', 'thirst', 'thistle', 'thomas', 'thong', 'thongs', 'thorn', 'thought', 'thread', 'thrill', 'throat', 'throne', 'thrush', 'thumb', 'thunder', 'thunderbolt', 'thunderhead', 'thunderstorm', 'tiara', 'tic', 'ticket', 'tie', 'tiger', 'tight', 'tights', 'tile', 'till', 'timbale', 'timber', 'time', 'timeline', 'timeout', 'timer', 'timpani', 'tin', 'tinderbox', 'tinkle', 'tintype', 'tip', 'tire', 'tissue', 'titanium', 'title', 'toad', 'toast', 'today', 'toe', 'toenail', 'toga', 'togs', 'toilet', 'tolerance', 'tom', 'tomato', 'tomography', 'tomorrow', 'tom-tom', 'ton', 'tone', 'tongue', 'tonight', 'tool', 'toot', 'tooth', 'toothbrush', 'toothpaste', 'toothpick', 'top', 'top-hat', 'topic', 'topsail', 'toque', 'torchiere', 'toreador', 'tornado', 'torso', 'tortellini', 'tortoise', 'tosser', 'total', 'tote', 'touch', 'tough', 'tough-guy', 'tour', 'tourist', 'towel', 'tower', 'town', 'townhouse', 'tow-truck', 'toy', 'trachoma', 'track', 'tracksuit', 'tractor', 'trade', 'tradition', 'traditionalism', 'traffic', 'trail', 'trailer', 'train', 'trainer', 'training', 'tram', 'tramp', 'transaction', 'transition', 'translation', 'transmission', 'transom', 'transport', 'transportation', 'trapdoor', 'trapezium', 'trapezoid', 'trash', 'travel', 'tray', 'treat', 'treatment', 'tree', 'trellis', 'tremor', 'trench', 'trial', 'triangle', 'tribe', 'trick', 'trigonometry', 'trim', 'trinket', 'trip', 'tripod', 'trolley', 'trombone', 'trooper', 'trouble', 'trousers', 'trout', 'trove', 'trowel', 'truck', 'truckit', 'trumpet', 'trunk', 'trust', 'truth', 'try', 't-shirt', 'tsunami', 'tub', 'tuba', 'tube', 'tugboat', 'tulip', 'tummy', 'tuna', 'tune', 'tune-up', 'tunic', 'tunnel', 'turban', 'turkish', 'turn', 'turnip', 'turnover', 'turnstile', 'turret', 'turtle', 'tussle', 'tutu', 'tuxedo', 'tv', 'twig', 'twilight', 'twine', 'twist', 'twister', 'two', 'type', 'typewriter', 'typhoon', 'tyvek', 'ukulele', 'umbrella', 'unblinking', 'uncle', 'underclothes', 'underground', 'underneath', 'underpants', 'underpass', 'undershirt', 'understanding', 'underwear', 'underwire', 'unemployment', 'unibody', 'uniform', 'union', 'unique', 'unit', 'unity', 'university', 'upper', 'upstairs', 'urn', 'usage', 'use', 'user', 'usher', 'usual', 'utensil', 'vacation', 'vacuum', 'vagrant', 'valance', 'validity', 'valley', 'valuable', 'value', 'van', 'vane', 'vanity', 'variation', 'variety', 'vase', 'vast', 'vault', 'vaulting', 'veal', 'vegetable', 'vegetarianism', 'vegetation', 'vehicle', 'veil', 'vein', 'veldt', 'vellum', 'velodrome', 'velvet', 'vengeance', 'venom', 'veranda', 'verdict', 'vermicelli', 'verse', 'version', 'vertigo', 'verve', 'vessel', 'vest', 'vestment', 'vibe', 'vibraphone', 'vibration', 'video', 'view', 'villa', 'village', 'vineyard', 'vinyl', 'viola', 'violence', 'violet', 'violin', 'virginal', 'virtue', 'virus', 'viscose', 'vise', 'vision', 'visit', 'visitor', 'visor', 'visual', 'vitality', 'vixen', 'voice', 'volcano', 'volleyball', 'volume', 'voyage', 'vulture', 'wad', 'wafer', 'waffle', 'waist', 'waistband', 'wait', 'waiter', 'waitress', 'wake', 'walk', 'walker', 'walkway', 'wall', 'wallaby', 'wallet', 'walnut', 'walrus', 'wampum', 'wannabe', 'war', 'warden', 'warlock', 'warmth', 'warm-up', 'warning', 'wash', 'washbasin', 'washcloth', 'washer', 'washtub', 'wasp', 'waste', 'wastebasket', 'watch', 'watchmaker', 'water', 'waterbed', 'waterfall', 'waterskiing', 'waterspout', 'wave', 'wax', 'way', 'weakness', 'wealth', 'weapon', 'wear', 'weasel', 'weather', 'web', 'wedding', 'wedge', 'weed', 'weeder', 'weedkiller', 'week', 'weekend', 'weekender', 'weight', 'weird', 'welcome', 'welfare', 'well', 'west', 'western', 'wet-bar', 'wetsuit', 'whale', 'wharf', 'wheat', 'wheel', 'whereas', 'while', 'whip', 'whirlpool', 'whirlwind', 'whisker', 'whiskey', 'whistle', 'white', 'whole', 'wholesale', 'wholesaler', 'whorl', 'width', 'wife', 'wilderness', 'wildlife', 'will', 'willow', 'win', 'wind', 'windage', 'wind-chime', 'window', 'windscreen', 'windshield', 'wine', 'wing', 'wingman', 'wingtip', 'winner', 'winter', 'wire', 'wisdom', 'wiseguy', 'wish', 'wisteria', 'witch', 'witch-hunt', 'withdrawal', 'witness', 'wolf', 'wombat', 'women', 'wonder', 'wood', 'woodland', 'woodshed', 'woodwind', 'wool', 'woolen', 'word', 'work', 'workbench', 'worker', 'workhorse', 'working', 'worklife', 'workshop', 'world', 'worm', 'worry', 'worth', 'worthy', 'wound', 'wrap', 'wraparound', 'wrecker', 'wren', 'wrench', 'wrestler', 'wrinkle', 'wrist', 'writer', 'writing', 'wrong', 'xylophone', 'yacht', 'yak', 'yam', 'yard', 'yarmulke', 'yarn', 'yawl', 'year', 'yeast', 'yellow', 'yesterday', 'yew', 'yin', 'yoga', 'yogurt', 'yoke', 'you', 'young', 'youth', 'yurt', 'zampone', 'zebra', 'zebrafish', 'zephyr', 'ziggurat', 'zinc', 'zipper', 'zither', 'zone', 'zoo', 'zoologist', 'zoology', 'zoot-suit', 'zucchini'
];

const adverbs = [
    'abjectly', 'ably', 'abnormally', 'abominably', 'abrasively', 'abruptly', 'absent-mindedly', 'absently', 'absolutely', 'absorbingly', 'abstemiously', 'abstractedly', 'abstractly', 'abstrusely', 'absurdly', 'abundantly', 'abusively', 'abysmally', 'academically', 'acceptably', 'accidentally', 'accordingly', 'accurately', 'accusingly', 'achingly', 'acidly', 'acoustically', 'acrimoniously', 'actively', 'actually', 'acutely', 'adamantly', 'adaptively', 'additionally', 'additively', 'adequately', 'adiabatically', 'adjacently', 'administratively', 'admirably', 'admiringly', 'admittedly', 'adoringly', 'adroitly', 'advantageously', 'adventurously', 'adversely', 'advisedly', 'aerobically', 'aerodynamically', 'aesthetically', 'affably', 'affectedly', 'affectionately', 'affirmatively', 'aggressively', 'aggrievedly', 'agitatedly', 'agonisingly', 'agonizingly', 'agreeably', 'agriculturally', 'aimlessly', 'airily', 'alarmingly', 'alertly', 'algebraically', 'algorithmically', 'allegedly', 'allegorically', 'alluringly', 'ally', 'alphabetically', 'alternately', 'alternatively', 'altruistically', 'amateurishly', 'amazingly', 'ambiguously', 'ambitiously', 'ambivalently', 'amiably', 'amicably', 'amorously', 'amply', 'amusingly', 'anachronistically', 'anaerobically', 'anagrammatically', 'analogously', 'analytically', 'anatomically', 'anciently', 'anecdotally', 'angrily', 'animatedly', 'annoyingly', 'annually', 'anomalously', 'anomaly', 'anonymously', 'anteriorly', 'anthropogenically', 'antithetically', 'anxiously', 'apathetically', 'aperiodically', 'apologetically', 'appallingly', 'apparently', 'appealingly', 'apply', 'appraisingly', 'appreciably', 'appreciatively', 'apprehensively', 'appropriately', 'approvingly', 'approximately', 'aptly', 'arbitrarily', 'arcanely', 'archaeologically', 'architecturally', 'archly', 'ardently', 'arguably', 'argumentatively', 'arithmetically', 'arrogantly', 'artfully', 'articulately', 'artificially', 'artistically', 'artlessly', 'ashamedly', 'assembly', 'assertively', 'assiduously', 'associatively', 'assuredly', 'astonishingly', 'astoundingly', 'astrally', 'astronomically', 'astutely', 'asymmetrically', 'asymptotically', 'asynchronously', 'atheistically', 'athletically', 'atmospherically', 'atomically', 'atrociously', 'attentively', 'attractively', 'atypically', 'audaciously', 'audibly', 'aurally', 'auspiciously', 'austerely', 'authentically', 'authoritatively', 'autobiographically', 'autocratically', 'automatically', 'autonomously', 'averagely', 'avidly', 'avowedly', 'awesomely', 'awfully', 'awkwardly', 'axially', 'axiomatically', 'badly', 'bafflingly', 'baldly', 'balefully', 'barbarically', 'barbarously', 'barely', 'basely', 'bashfully', 'basically', 'bearably', 'beastly', 'beautifully', 'beggarly', 'begrudgingly', 'behaviourally', 'belatedly', 'believably', 'belligerently', 'belly', 'bemusedly', 'beneficially', 'benevolently', 'benightedly', 'benignly', 'beseechingly', 'bewilderingly', 'biblically', 'bilaterally', 'bimonthly', 'biochemically', 'biographically', 'biologically', 'bitingly', 'bitterly', 'biweekly', 'bizarrely', 'blackfly', 'blackly', 'blamelessly', 'blandly', 'blankly', 'blasphemously', 'blatantly', 'bleakly', 'blearily', 'blindingly', 'blindly', 'blissfully', 'blisteringly', 'blithely', 'bloodily', 'blowfly', 'bluntly', 'blushingly', 'boastfully', 'bodily', 'bogglingly', 'boisterously', 'boldly', 'boorishly', 'boringly', 'botanically', 'bountifully', 'boyishly', 'bracingly', 'brainlessly', 'brashly', 'bravely', 'brazenly', 'breathlessly', 'breathtakingly', 'breezily', 'briefly', 'brightly', 'brilliantly', 'briskly', 'bristly', 'broadly', 'brokenly', 'broodingly', 'brotherly', 'brusquely', 'brutally', 'bubbly', 'bully', 'buoyantly', 'bureaucratically', 'burly', 'busily', 'butterfly', 'calamitously', 'calculatedly', 'callously', 'calmly', 'candidly', 'cannily', 'canonically', 'capably', 'capitally', 'capriciously', 'carefully', 'carelessly', 'caressingly', 'carnally', 'casually', 'catastrophically', 'categorically', 'causally', 'caustically', 'cautiously', 'cavalierly', 'ceaselessly', 'celestially', 'centrally', 'centrifugally', 'ceremonially', 'ceremoniously', 'certainly', 'certifiably', 'challengingly', 'chaotically', 'characteristically', 'charismatically', 'charitably', 'charmingly', 'chastely', 'chattily', 'cheaply', 'cheekily', 'cheerfully', 'cheerily', 'chemically', 'chiefly', 'childishly', 'chillingly', 'chilly', 'chivalrously', 'chronically', 'chronologically', 'churlishly', 'circularly', 'circumspectly', 'circumstantially', 'civilly', 'clamorously', 'clandestinely', 'classically', 'cleanly', 'clearly', 'clerically', 'cleverly', 'climatically', 'clinically', 'closely', 'cloyingly', 'clumsily', 'coarsely', 'coaxingly', 'coercively', 'cogently', 'cognitively', 'coherently', 'cohesively', 'coincidentally', 'cold-bloodedly', 'coldly', 'collaboratively', 'collaterally', 'collectively', 'colloquially', 'colossally', 'colourfully', 'comely', 'comfortably', 'comfortingly', 'comically', 'commandingly', 'commendably', 'commensurately', 'commercially', 'commonly', 'communally', 'compactly', 'companionably', 'comparably', 'comparatively', 'compassionately', 'compatibly', 'compellingly', 'competently', 'competitively', 'complacently', 'complainingly', 'completely', 'complexly', 'comply', 'composedly', 'comprehensibly', 'comprehensively', 'compulsively', 'compulsorily', 'computably', 'computationally', 'comradely', 'conceivably', 'conceptually', 'concernedly', 'concisely', 'conclusively', 'concomitantly', 'concretely', 'concurrently', 'condescendingly', 'conditionally', 'confidentially', 'confidently', 'confidingly', 'conflictingly', 'confoundedly', 'confusedly', 'confusingly', 'congenitally', 'conscientiously', 'consciously', 'consecutively', 'consensually', 'consequentially', 'consequently', 'conservatively', 'considerably', 'considerately', 'consistently', 'consolingly', 'conspicuously', 'conspiratorially', 'constantly', 'constitutionally', 'constitutively', 'constructively', 'consummately', 'contemporaneously', 'contemptibly', 'contemptuously', 'contentedly', 'contentiously', 'contextually', 'contiguously', 'contingently', 'continually', 'continuously', 'contractually', 'contradictorily', 'contrarily', 'contrastingly', 'contritely', 'controversially', 'contumely', 'conveniently', 'conventionally', 'conversationally', 'conversely', 'convincingly', 'convulsively', 'coolly', 'cooperatively', 'copiously', 'coquettishly', 'cordially', 'corporately', 'corporeally', 'correctly', 'correspondingly', 'corruptly', 'cosily', 'cosmetically', 'cosmically', 'cosmologically', 'costly', 'countably', 'courageously', 'courteously', 'courtly', 'cousinly', 'covalently', 'covertly', 'cowardly', 'coyly', 'crackly', 'craftily', 'crashingly', 'crassly', 'cravenly', 'crazily', 'creatively', 'credibly', 'creditably', 'criminally', 'crinkly', 'cripplingly', 'crisply', 'critically', 'crookedly', 'crossly', 'crucially', 'crudely', 'cruelly', 'crumbly', 'crushingly', 'cryptically', 'cryptographically', 'cubically', 'cuddly', 'culpably', 'culturally', 'cumbersomely', 'cumulatively', 'cunningly', 'cupidinously', 'curiously', 'curly', 'currently', 'cursorily', 'curtly', 'customarily', 'cuttingly', 'cyclically', 'cylindrically', 'cynically', 'daily', 'daintily', 'dally', 'damagingly', 'damnably', 'damningly', 'damply', 'dangerously', 'daringly', 'darkly', 'dastardly', 'dauntingly', 'dazedly', 'dazzlingly', 'deadly', 'deafeningly', 'dearly', 'deathly', 'decently', 'deceptively', 'decidedly', 'decisively', 'decoratively', 'decorously', 'decreasingly', 'deductively', 'deeply', 'defensively', 'deferentially', 'defiantly', 'definably', 'definitely', 'definitively', 'deftly', 'dejectedly', 'deleteriously', 'deliberately', 'delicately', 'deliciously', 'delightedly', 'delightfully', 'deliriously', 'dementedly', 'democratically', 'demographically', 'demonstrably', 'demonstratively', 'demurely', 'densely', 'departmentally', 'deplorably', 'deprecatingly', 'depressingly', 'derisively', 'derivatively', 'descriptively', 'deservedly', 'designedly', 'desirably', 'despairingly', 'desperately', 'despicably', 'despondently', 'destructively', 'desultorily', 'detectably', 'determinately', 'determinedly', 'deterministically', 'detestably', 'detrimentally', 'devastatingly', 'developmentally', 'devilishly', 'deviously', 'devotedly', 'devoutly', 'dexterously', 'dextrously', 'diabolically', 'diagnostically', 'diagonally', 'diagrammatically', 'dialectically', 'diametrically', 'dictatorially', 'differentially', 'differently', 'diffidently', 'digitally', 'diligently', 'dimensionally', 'dimly', 'diplomatically', 'directionally', 'directly', 'direly', 'dirtily', 'disadvantageously', 'disagreeably', 'disappointingly', 'disapprovingly', 'disarmingly', 'disassembly', 'disastrously', 'disbelievingly', 'discernibly', 'disconcertingly', 'disconsolately', 'discontentedly', 'discontinuously', 'discouragingly', 'discourteously', 'discreetly', 'discretely', 'discursively', 'disdainfully', 'disgracefully', 'disgustedly', 'disgustingly', 'dishonestly', 'dishonourably', 'disingenuously', 'disinterestedly', 'disjointedly', 'dismally', 'dismissively', 'disorderly', 'disparagingly', 'dispassionately', 'dispersively', 'dispiritedly', 'disproportionally', 'disproportionately', 'disrespectfully', 'disruptively', 'dissociatively', 'distally', 'distantly', 'distastefully', 'distinctively', 'distinctly', 'distinguishably', 'distractedly', 'distractingly', 'distressingly', 'distrustfully', 'disturbingly', 'diversely', 'divinely', 'dizzily', 'dizzyingly', 'docilely', 'doctrinally', 'doggedly', 'dogmatically', 'doily', 'dolefully', 'dolly', 'domestically', 'dominantly', 'dorsally', 'doubly', 'doubtfully', 'doubtingly', 'doubtlessly', 'dourly', 'downwardly', 'dragonfly', 'dramatically', 'drastically', 'dreadfully', 'dreamily', 'drearily', 'drily', 'drizzly', 'droopingly', 'drowsily', 'drunkenly', 'dryly', 'dually', 'dubiously', 'dully', 'duly', 'dumbly', 'duopoly', 'dustily', 'dutifully', 'dynamically', 'dyslexically', 'eagerly', 'early', 'earnestly', 'earthly', 'easily', 'easterly', 'eccentrically', 'ecclesiastically', 'ecologically', 'economically', 'ecstatically', 'ecumenically', 'edgily', 'editorially', 'educationally', 'eerily', 'effectively', 'effectually', 'efficiently', 'effortlessly', 'effusively', 'egotistically', 'elaborately', 'elastically', 'elderly', 'electorally', 'electrically', 'electrochemically', 'electrolytically', 'electromagnetically', 'electronically', 'elegantly', 'elementally', 'elementarily', 'eligibly', 'elliptically', 'eloquently', 'elusively', 'embarrassedly', 'embarrassingly', 'eminently', 'emotionally', 'emotively', 'emphatically', 'empirically', 'emptily', 'enchantingly', 'encouragingly', 'endearingly', 'endemically', 'endlessly', 'endogenously', 'energetically', 'engagingly', 'enigmatically', 'enjoyably', 'enormously', 'enquiringly', 'entertainingly', 'enthusiastically', 'enticingly', 'entirely', 'entreatingly', 'enviously', 'environmentally', 'epically', 'episodically', 'equably', 'equally', 'equitably', 'equivalently', 'ergonomically', 'erotically', 'erratically', 'erroneously', 'esoterically', 'especially', 'essentially', 'eternally', 'ethereally', 'ethically', 'ethnically', 'etymologically', 'euphemistically', 'evasively', 'evenly', 'eventually', 'everlastingly', 'evidently', 'evilly', 'evocatively', 'evolutionarily', 'exactly', 'exaggeratedly', 'exasperatedly', 'exceedingly', 'excellently', 'exceptionally', 'excessively', 'excitedly', 'excitingly', 'exclusively', 'excruciatingly', 'exhaustively', 'existentially', 'exogenously', 'exorbitantly', 'exothermically', 'exotically', 'expansively', 'expectantly', 'expeditiously', 'expensively', 'experimentally', 'expertly', 'explicitly', 'explosively', 'exponentially', 'expressionlessly', 'expressively', 'expressly', 'exquisitely', 'extensionally', 'extensively', 'externally', 'extortionately', 'extraordinarily', 'extravagantly', 'extremely', 'extrinsically', 'exuberantly', 'exultantly', 'exultingly', 'fabulously', 'facetiously', 'factually', 'faintly', 'fairly', 'faithfully', 'falsely', 'falteringly', 'familiarly', 'family', 'famously', 'fanatically', 'fancifully', 'fantastically', 'fascinatingly', 'fashionably', 'fastidiously', 'fatalistically', 'fatally', 'fatherly', 'fatuously', 'faultlessly', 'favourably', 'fawningly', 'fearfully', 'fearlessly', 'fearsomely', 'feasibly', 'federally', 'feebly', 'feelingly', 'femininely', 'ferociously', 'fervently', 'fervidly', 'feverishly', 'fiddly', 'fiendishly', 'fiercely', 'fierily', 'fifthly', 'figuratively', 'filly', 'filthily', 'finally', 'financially', 'finely', 'finitely', 'firefly', 'firmly', 'firstly', 'fiscally', 'fitfully', 'fitly', 'fittingly', 'fixedly', 'flagrantly', 'flamboyantly', 'flatly', 'flatteringly', 'flawlessly', 'fleetingly', 'flexibly', 'flimsily', 'flippantly', 'floridly', 'fluently', 'fluidly', 'fly', 'folly', 'fondly', 'foolhardily', 'foolishly', 'forbiddingly', 'forcefully', 'forcibly', 'forensically', 'forlornly', 'formally', 'formerly', 'formidably', 'forthrightly', 'fortnightly', 'fortuitously', 'fortunately', 'forwardly', 'foully', 'fourthly', 'fractionally', 'frailly', 'frankly', 'frantically', 'fraudulently', 'freely', 'frenetically', 'frenziedly', 'frequently', 'freshly', 'fretfully', 'friendlily', 'friendly', 'frighteningly', 'frightfully', 'frilly', 'frivolously', 'frontally', 'frostily', 'frowningly', 'frugally', 'fruitfully', 'fruitlessly', 'frustratedly', 'frustratingly', 'fully', 'fulsomely', 'fumingly', 'functionally', 'fundamentally', 'funnily', 'furiously', 'furtively', 'fussily', 'futilely', 'fuzzily', 'gadfly', 'gaily', 'gainfully', 'gallantly', 'gamely', 'gangly', 'gapingly', 'garishly', 'gaudily', 'gauntly', 'generally', 'generically', 'generously', 'genetically', 'genially', 'genteelly', 'gentlemanly', 'gently', 'genuinely', 'geographically', 'geologically', 'geomagnetically', 'geometrically', 'ghastly', 'ghostly', 'giddily', 'gigantically', 'giggly', 'gingerly', 'girlishly', 'glacially', 'gladly', 'glaringly', 'gleefully', 'glibly', 'globally', 'gloomily', 'gloriously', 'glossily', 'glowingly', 'glumly', 'godly', 'golly', 'good-humouredly', 'good-naturedly', 'goodly', 'googly', 'gorgeously', 'gracefully', 'gracelessly', 'graciously', 'gradually', 'grammatically', 'grandly', 'graphically', 'gratefully', 'gratifyingly', 'gratuitously', 'gravelly', 'gravely', 'gravitationally', 'greatly', 'greedily', 'greenfly', 'greenly', 'gregariously', 'grievously', 'grimly', 'grisly', 'grizzly', 'groggily', 'gropingly', 'grossly', 'grotesquely', 'grudgingly', 'gruesomely', 'gruffly', 'grumpily', 'guardedly', 'guiltily', 'gully', 'gutturally', 'habitually', 'half-heartedly', 'half-hourly', 'half-yearly', 'haltingly', 'handily', 'handsomely', 'haphazardly', 'happily', 'hardily', 'hardly', 'harmfully', 'harmlessly', 'harmonically', 'harmoniously', 'harshly', 'hastily', 'hatefully', 'haughtily', 'hauntingly', 'hazily', 'healthily', 'heartily', 'heartlessly', 'heatedly', 'heavenly', 'heavily', 'hectically', 'heedlessly', 'hellishly', 'helpfully', 'helplessly', 'hermetically', 'heroically', 'hesitantly', 'hesitatingly', 'heuristically', 'hideously', 'hierarchically', 'highly', 'hilariously', 'hilly', 'histologically', 'historically', 'hoarsely', 'holistically', 'hollowly', 'holly', 'holy', 'homely', 'homily', 'homogeneously', 'honestly', 'honourably', 'hopefully', 'hopelessly', 'horizontally', 'hormonally', 'horrendously', 'horribly', 'horridly', 'horrifically', 'horrifyingly', 'hospitably', 'hostilely', 'hotly', 'hourly', 'housewifely', 'huffily', 'hugely', 'humanely', 'humanly', 'humbly', 'humiliatingly', 'humorously', 'hungrily', 'hurly-burly', 'hurriedly', 'huskily', 'hydraulically', 'hydrologically', 'hydroponically', 'hygienically', 'hypnotically', 'hypocritically', 'hypothetically', 'hysterically', 'icily', 'idealistically', 'ideally', 'identically', 'identifiably', 'ideologically', 'idiomatically', 'idiosyncratically', 'idiotically', 'idly', 'idyllically', 'ignobly', 'ignominiously', 'ignorantly', 'ill-advisedly', 'illegally', 'illegibly', 'illegitimately', 'illicitly', 'illogically', 'imaginatively', 'immaculately', 'immanently', 'immaturely', 'immeasurably', 'immediately', 'immensely', 'imminently', 'immoderately', 'immorally', 'immortally', 'immunologically', 'immutably', 'impartially', 'impassively', 'impatiently', 'impeccably', 'impenetrably', 'imperatively', 'imperceptibly', 'imperfectly', 'imperially', 'imperiously', 'impersonally', 'impertinently', 'imperturbably', 'impetuously', 'impishly', 'implacably', 'implausibly', 'implicitly', 'impliedly', 'imploringly', 'imply', 'importantly', 'importunately', 'impossibly', 'impotently', 'impractically', 'imprecisely', 'impregnably', 'impressively', 'improbably', 'improperly', 'imprudently', 'impudently', 'impulsively', 'inaccurately', 'inadequately', 'inadvertently', 'inadvisedly', 'inanely', 'inappropriately', 'inaptly', 'inattentively', 'inaudibly', 'inauspiciously', 'incalculably', 'incandescently', 'incautiously', 'incessantly', 'incidentally', 'incisively', 'inclusively', 'incoherently', 'incomparably', 'incompatibly', 'incompetently', 'incompletely', 'incomprehensibly', 'inconceivably', 'inconclusively', 'incongruously', 'inconsequentially', 'inconsiderately', 'inconsistently', 'inconsolably', 'inconspicuously', 'incontestably', 'incontinently', 'incontrovertibly', 'inconveniently', 'incorrectly', 'incorrigibly', 'increasingly', 'incredibly', 'incredulously', 'incrementally', 'incurably', 'incuriously', 'indecently', 'indecisively', 'indefinably', 'indefinitely', 'indelibly', 'independently', 'indescribably', 'indifferently', 'indignantly', 'indirectly', 'indiscreetly', 'indiscriminately', 'indispensably', 'indisputably', 'indissolubly', 'indistinctly', 'indistinguishably', 'individually', 'indivisibly', 'indolently', 'indubitably', 'inductively', 'indulgently', 'industrially', 'industriously', 'ineffectively', 'ineffectually', 'inefficiently', 'inelegantly', 'ineluctably', 'ineptly', 'ineradicably', 'inescapably', 'inestimably', 'inevitably', 'inexcusably', 'inexhaustibly', 'inexorably', 'inexpensively', 'inexpertly', 'inexplicably', 'inexpressibly', 'inextricably', 'infallibly', 'infamously', 'infectiously', 'infelicitously', 'inferentially', 'infernally', 'infinitely', 'infinitesimally', 'inflexibly', 'informally', 'informatively', 'infrequently', 'infuriatingly', 'ingeniously', 'ingenuously', 'ingratiatingly', 'inherently', 'inhumanely', 'inhumanly', 'inimitably', 'iniquitously', 'initially', 'injudiciously', 'injuriously', 'innately', 'innocently', 'innovatively', 'innumerably', 'inordinately', 'inquiringly', 'inquisitively', 'inquisitorially', 'insanely', 'insatiably', 'inscrutably', 'insecurely', 'insensibly', 'insensitively', 'inseparably', 'insidiously', 'insignificantly', 'insincerely', 'insinuatingly', 'insistently', 'insolently', 'instantaneously', 'instantly', 'instinctively', 'institutionally', 'instrumentally', 'insufferably', 'insufficiently', 'insultingly', 'insurmountably', 'integrally', 'intellectually', 'intelligently', 'intelligibly', 'intensely', 'intensively', 'intentionally', 'intently', 'interactively', 'interchangeably', 'interestedly', 'interestingly', 'interminably', 'intermittently', 'internally', 'internationally', 'interpretively', 'interrogatively', 'interstitially', 'intimately', 'intolerably', 'intractably', 'intravenously', 'intrepidly', 'intricately', 'intriguingly', 'intrinsically', 'introspectively', 'intuitively', 'invariably', 'inventively', 'inversely', 'invigoratingly', 'invisibly', 'invitingly', 'involuntarily', 'inwardly', 'irascibly', 'ironically', 'irrationally', 'irrecoverably', 'irredeemably', 'irreducibly', 'irregularly', 'irrelevantly', 'irreparably', 'irrepressibly', 'irreproachably', 'irresistibly', 'irresolutely', 'irrespectively', 'irresponsibly', 'irretrievably', 'irreverently', 'irreversibly', 'irrevocably', 'irritably', 'irritatedly', 'irritatingly', 'isometrically', 'isothermally', 'isotropically', 'iteratively', 'jadedly', 'jangly', 'jauntily', 'jealously', 'jeeringly', 'jelly', 'jerkily', 'jestingly', 'jocularly', 'jointly', 'jokily', 'jokingly', 'jollily', 'jolly', 'jovially', 'joyfully', 'joyously', 'jubilantly', 'judicially', 'judiciously', 'justifiably', 'justly', 'keenly', 'kindly', 'kinetically', 'kingly', 'knightly', 'knobbly', 'knowingly', 'knowledgeably', 'laboriously', 'laconically', 'lamely', 'lamentably', 'languidly', 'languorously', 'largely', 'lasciviously', 'lastly', 'lately', 'laterally', 'latterly', 'laughably', 'laughingly', 'lavishly', 'lawfully', 'lazily', 'learnedly', 'leeringly', 'left-handedly', 'legally', 'legibly', 'legislatively', 'legitimately', 'leisurely', 'lengthily', 'leniently', 'lethally', 'lethargically', 'levelly', 'lexically', 'lexicographically', 'liberally', 'lifelessly', 'light-heartedly', 'lightly', 'likely', 'lily', 'limply', 'lineally', 'linearly', 'lingeringly', 'linguistically', 'listlessly', 'literally', 'lithely', 'lively', 'loathsomely', 'locally', 'loftily', 'logarithmically', 'logically', 'logistically', 'lolly', 'lonely', 'longingly', 'longitudinally', 'loosely', 'lopsidedly', 'lordly', 'loudly', 'lousily', 'lovely', 'lovingly', 'lowly', 'loyally', 'lucidly', 'luckily', 'ludicrously', 'lugubriously', 'luminously', 'luridly', 'lusciously', 'lustfully', 'lustily', 'luxuriantly', 'luxuriously', 'lyrically', 'macroscopically', 'maddeningly', 'madly', 'magically', 'magisterially', 'magnanimously', 'magnetically', 'magnificently', 'maidenly', 'mainly', 'majestically', 'malevolently', 'maliciously', 'malignantly', 'managerially', 'manfully', 'maniacally', 'manically', 'manifestly', 'manly', 'mannerly', 'manually', 'marginally', 'markedly', 'marvellously', 'masochistically', 'massively', 'masterfully', 'masterly', 'materialistically', 'materially', 'maternally', 'mathematically', 'matrimonially', 'matronly', 'maturely', 'maximally', 'mayfly', 'meagrely', 'mealy', 'meaningfully', 'meaninglessly', 'meanly', 'measly', 'measurably', 'mechanically', 'mechanistically', 'medially', 'medically', 'meditatively', 'meekly', 'melancholy', 'mellifluously', 'melodically', 'melodiously', 'melodramatically', 'memorably', 'menacingly', 'mentally', 'mercifully', 'mercilessly', 'merely', 'merrily', 'messily', 'metabolically', 'metaphorically', 'metaphysically', 'methodically', 'methodologically', 'meticulously', 'metrically', 'microscopically', 'mightily', 'mildly', 'militantly', 'militarily', 'mind-numbingly', 'mindbogglingly', 'mindlessly', 'minimally', 'ministerially', 'minutely', 'miraculously', 'mirthlessly', 'misapply', 'mischievously', 'miserably', 'miserly', 'misguidedly', 'misleadingly', 'mistakenly', 'mistily', 'mistrustfully', 'mnemonically', 'mockingly', 'moderately', 'modestly', 'modishly', 'momentarily', 'monogamously', 'monopoly', 'monotonically', 'monotonously', 'monstrously', 'monthly', 'monumentally', 'moodily', 'morally', 'morbidly', 'moribundly', 'morosely', 'morphologically', 'mortally', 'mostly', 'motherly', 'motionlessly', 'mournfully', 'movingly', 'multiply', 'mundanely', 'munificently', 'murderously', 'musically', 'musingly', 'mustily', 'mutely', 'mutinously', 'mutually', 'myopically', 'mysteriously', 'mystically', 'naively', 'nakedly', 'namely', 'narrowly', 'nasally', 'nastily', 'nationally', 'naturally', 'naughtily', 'nauseatingly', 'nearly', 'neatly', 'nebulously', 'necessarily', 'needlessly', 'negatively', 'negligently', 'negligibly', 'neighbourly', 'nervously', 'neurologically', 'neurotically', 'neutrally', 'newly', 'nicely', 'niftily', 'niggardly', 'nightly', 'nimbly', 'nobly', 'nocturnally', 'noiselessly', 'noisily', 'nominally', 'non-verbally', 'nonchalantly', 'nondescriptly', 'normally', 'north-easterly', 'north-westerly', 'northerly', 'nosily', 'nostalgically', 'notably', 'notationally', 'noticeably', 'notionally', 'notoriously', 'noxiously', 'numbingly', 'numbly', 'numerically', 'nutritionally', 'obdurately', 'obediently', 'objectionably', 'objectively', 'obligatorily', 'obligingly', 'obliquely', 'obnoxiously', 'obscenely', 'obscurely', 'obsequiously', 'observably', 'observationally', 'obsessively', 'obstinately', 'obstructively', 'obtusely', 'obviously', 'occasionally', 'occupationally', 'oddly', 'odiously', 'offensively', 'officially', 'officiously', 'oily', 'oligopoly', 'ominously', 'one-sidedly', 'only', 'ontologically', 'openly', 'operationally', 'opportunely', 'opportunistically', 'oppositely', 'oppressively', 'optically', 'optimally', 'optimistically', 'optionally', 'orally', 'orderly', 'ordinarily', 'organically', 'organisationally', 'organizationally', 'originally', 'ornately', 'orthogonally', 'orthographically', 'ostensibly', 'ostentatiously', 'other-worldly', 'outrageously', 'outspokenly', 'outstandingly', 'outwardly', 'overfly', 'overly', 'overpoweringly', 'oversupply', 'overtly', 'overwhelmingly', 'owlishly', 'ozone-friendly', 'painfully', 'painlessly', 'painstakingly', 'palely', 'palpably', 'panoply', 'paradoxically', 'paralytically', 'parametrically', 'parenthetically', 'partially', 'particularly', 'partly', 'passably', 'passionately', 'passively', 'patchily', 'patently', 'paternally', 'pathetically', 'pathologically', 'patiently', 'patronisingly', 'patronizingly', 'peaceably', 'peacefully', 'pearly', 'pebbly', 'peculiarly', 'pedagogically', 'pedantically', 'peevishly', 'pejoratively', 'penetratingly', 'penitently', 'pensively', 'penultimately', 'perceptibly', 'perceptively', 'perceptually', 'percussively', 'peremptorily', 'perennially', 'perfectly', 'perfidiously', 'perfunctorily', 'perilously', 'periodically', 'peripherally', 'perkily', 'permanently', 'perpendicularly', 'perpetually', 'perplexedly', 'perseveringly', 'persistently', 'personally', 'perspicuously', 'persuasively', 'pertinaciously', 'pertinently', 'pertly', 'perversely', 'pessimally', 'pessimistically', 'pettishly', 'petulantly', 'phenomenally', 'phenomenologically', 'philately', 'philosophically', 'phlegmatically', 'phonemically', 'phonetically', 'phonologically', 'photochemically', 'photoelectrically', 'photographically', 'photometrically', 'photosynthetically', 'phrenologically', 'physically', 'physiologically', 'pictorially', 'picturesquely', 'piercingly', 'pimply', 'piously', 'piteously', 'pithily', 'pitiably', 'pitifully', 'pitilessly', 'pityingly', 'placatingly', 'placidly', 'plainly', 'plaintively', 'plausibly', 'playfully', 'pleadingly', 'pleasantly', 'pleasingly', 'pleasurably', 'plenteously', 'plentifully', 'ply', 'poetically', 'poignantly', 'pointedly', 'pointlessly', 'politely', 'politically', 'polynomially', 'pompously', 'ponderously', 'poorly', 'popularly', 'portentously', 'portly', 'positionally', 'positively', 'possessively', 'possibly', 'post-operatively', 'posthumously', 'potentially', 'potently', 'powerfully', 'practically', 'pragmatically', 'prayerfully', 'pre-eminently', 'pre-emptively', 'precariously', 'preciously', 'precipitately', 'precipitously', 'precisely', 'precociously', 'predictably', 'predominantly', 'preferably', 'preferentially', 'preliminarily', 'prematurely', 'preponderantly', 'preposterously', 'prescriptively', 'presently', 'pressingly', 'presumably', 'presumptively', 'presumptuously', 'pretentiously', 'preternaturally', 'prettily', 'prevalently', 'previously', 'prickly', 'priestly', 'priggishly', 'primarily', 'primitively', 'primly', 'princely', 'principally', 'privately', 'probabilistically', 'probably', 'problematically', 'procedurally', 'prodigally', 'prodigiously', 'productively', 'profanely', 'professedly', 'professionally', 'proficiently', 'profitably', 'profligately', 'profoundly', 'profusely', 'progressively', 'prohibitively', 'projectively', 'prolifically', 'prominently', 'promiscuously', 'promisingly', 'promptly', 'pronouncedly', 'properly', 'prophetically', 'proportionally', 'proportionately', 'proprietorially', 'prosaically', 'prospectively', 'prosperously', 'protectively', 'proudly', 'provably', 'proverbially', 'providentially', 'provisionally', 'provocatively', 'provokingly', 'proximally', 'proximately', 'prudently', 'psychically', 'psychologically', 'psychotically', 'publicly', 'pugnaciously', 'punctiliously', 'punctually', 'pungently', 'punitively', 'purely', 'purportedly', 'purposefully', 'purposelessly', 'purposely', 'pusillanimously', 'putatively', 'puzzlingly', 'quadratically', 'quadruply', 'quaintly', 'qualitatively', 'quantitatively', 'quarterly', 'queenly', 'queerly', 'querulously', 'questionably', 'questioningly', 'quickly', 'quietly', 'quintessentially', 'quiveringly', 'quizzically', 'rabidly', 'racially', 'radially', 'radiantly', 'radiatively', 'radically', 'radioactively', 'raggedly', 'rally', 'rampantly', 'randomly', 'rapidly', 'rapturously', 'rarely', 'rascally', 'rashly', 'rationally', 'raucously', 'ravenously', 'ravingly', 'ravishingly', 'read-only', 'readily', 'realistically', 'really', 'reapply', 'reasonably', 'reassembly', 'reassuringly', 'rebelliously', 'recently', 'reciprocally', 'recklessly', 'recognisably', 'recognizably', 'recurrently', 'recursively', 'redundantly', 'referentially', 'reflectively', 'reflexively', 'refreshingly', 'regally', 'regionally', 'regretfully', 'regrettably', 'regularly', 'relationally', 'relatively', 'relativistically', 'relaxingly', 'relentlessly', 'relevantly', 'reliably', 'religiously', 'reluctantly', 'rely', 'remarkably', 'reminiscently', 'remorsefully', 'remorselessly', 'remotely', 'repeatably', 'repeatedly', 'repellingly', 'repentantly', 'repetitively', 'reply', 'reportedly', 'repressively', 'reproachfully', 'reproducibly', 'reproductively', 'reprovingly', 'repulsively', 'reputably', 'reputedly', 'resentfully', 'resignedly', 'resistively', 'resolutely', 'resonantly', 'resoundingly', 'respectably', 'respectfully', 'respectively', 'responsibly', 'responsively', 'restlessly', 'restrictively', 'resupply', 'retroactively', 'retrospectively', 'revealingly', 'reverentially', 'reverently', 'reversibly', 'revoltingly', 'rhetorically', 'rhythmically', 'richly', 'ridiculously', 'righteously', 'rightfully', 'rightly', 'rigidly', 'rigorously', 'ringingly', 'riotously', 'ripely', 'ritualistically', 'ritually', 'rivetingly', 'robustly', 'rockabilly', 'roguishly', 'roly-poly', 'romantically', 'rosily', 'rotationally', 'roughly', 'roundly', 'routinely', 'royally', 'rudely', 'ruefully', 'ruggedly', 'ruinously', 'ruminatively', 'rurally', 'rustically', 'ruthlessly', 'sadistically', 'sadly', 'safely', 'sagaciously', 'sagely', 'saintly', 'sally', 'sanely', 'sarcastically', 'sardonically', 'sartorially', 'satanically', 'satirically', 'satisfactorily', 'satisfyingly', 'saucily', 'savagely', 'scaly', 'scandalously', 'scantily', 'scarcely', 'scathingly', 'scenically', 'sceptically', 'schematically', 'schizophrenically', 'scholarly', 'scientifically', 'scornfully', 'screamingly', 'scrupulously', 'seamlessly', 'searchingly', 'seasonably', 'seasonally', 'secondarily', 'secondly', 'secretively', 'secretly', 'securely', 'sedately', 'seductively', 'sedulously', 'seemingly', 'seemly', 'selectively', 'self-assembly', 'self-confidently', 'self-consciously', 'self-evidently', 'self-righteously', 'selfishly', 'selflessly', 'semantically', 'semi-officially', 'semi-permanently', 'sensationally', 'senselessly', 'sensibly', 'sensitively', 'sensually', 'sensuously', 'sententiously', 'sentimentally', 'separately', 'sequentially', 'seraphically', 'serendipitously', 'serenely', 'serially', 'seriously', 'servilely', 'severally', 'severely', 'shabbily', 'shadily', 'shakily', 'shallowly', 'shamefacedly', 'shamefully', 'shamelessly', 'shapely', 'sharply', 'shatteringly', 'sheepishly', 'shiftily', 'shiveringly', 'shockingly', 'shoddily', 'short-sightedly', 'shortly', 'shrewdly', 'shrilly', 'shrinkingly', 'shyly', 'sickeningly', 'sickly', 'sightlessly', 'signally', 'significantly', 'silently', 'silkily', 'silly', 'similarly', 'simplistically', 'simply', 'simultaneously', 'sincerely', 'sinfully', 'single-handedly', 'single-mindedly', 'singly', 'singularly', 'sinisterly', 'sinuously', 'sinusoidally', 'sisterly', 'situationally', 'sixthly', 'sketchily', 'skilfully', 'skittishly', 'slackly', 'slavishly', 'sleekly', 'sleepily', 'slenderly', 'slickly', 'slightingly', 'slightly', 'slily', 'sloppily', 'slovenly', 'slowly', 'sluggishly', 'sly', 'slyly', 'smartly', 'smelly', 'smilingly', 'smoothly', 'smugly', 'snappily', 'sneakily', 'sneeringly', 'snobbishly', 'snugly', 'soaringly', 'soberly', 'sociably', 'socially', 'sociologically', 'softly', 'softly-softly', 'soldierly', 'solely', 'solemnly', 'solicitously', 'solidly', 'sombrely', 'sonically', 'sonorously', 'soothingly', 'sordidly', 'sorely', 'sorrowfully', 'soulfully', 'soundlessly', 'soundly', 'sourly', 'south-easterly', 'south-westerly', 'southerly', 'spaciously', 'sparingly', 'sparklingly', 'sparkly', 'sparsely', 'spasmodically', 'spatially', 'specially', 'specifiably', 'specifically', 'spectacularly', 'spectroscopically', 'speculatively', 'speechlessly', 'speedily', 'spherically', 'spicily', 'spindly', 'spirally', 'spiritedly', 'spiritually', 'spitefully', 'splendidly', 'spontaneously', 'sporadically', 'sportingly', 'spotlessly', 'sprightly', 'spuriously', 'squally', 'squarely', 'squeamishly', 'stably', 'staggeringly', 'starkly', 'startlingly', 'stately', 'statically', 'statistically', 'statutorily', 'staunchly', 'steadfastly', 'steadily', 'stealthily', 'steely', 'steeply', 'stereoscopically', 'stereotypically', 'sternly', 'stickily', 'stiffly', 'stiflingly', 'stoically', 'stolidly', 'stonily', 'stoutly', 'straggly', 'straightforwardly', 'strangely', 'strategically', 'stratospherically', 'strenuously', 'strictly', 'stridently', 'strikingly', 'stringently', 'strongly', 'structurally', 'stubbly', 'stubbornly', 'studiously', 'stumblingly', 'stunningly', 'stupefyingly', 'stupendously', 'stupidly', 'sturdily', 'stylishly', 'stylistically', 'suavely', 'subconsciously', 'subcutaneously', 'subfamily', 'subjectively', 'sublimely', 'subliminally', 'submissively', 'subsequently', 'substantially', 'substantively', 'subtly', 'subtractively', 'subversively', 'successfully', 'successively', 'succinctly', 'suddenly', 'sufficiently', 'suffocatingly', 'suggestively', 'suicidally', 'suitably', 'sulkily', 'sullenly', 'sully', 'summarily', 'sumptuously', 'superbly', 'superciliously', 'superfamily', 'superficially', 'superfluously', 'superlatively', 'supernaturally', 'supersonically', 'superstitiously', 'supply', 'supposedly', 'supremely', 'surely', 'surgically', 'surlily', 'surly', 'surprisingly', 'surreptitiously', 'suspiciously', 'sustainably', 'sweatily', 'sweepingly', 'sweetly', 'swiftly', 'swimmingly', 'sycophantically', 'symbiotically', 'symbolically', 'symmetrically', 'sympathetically', 'symptomatically', 'synchronously', 'synonymously', 'syntactically', 'synthetically', 'systematically', 'systemically', 'tacitly', 'tactfully', 'tactically', 'tactlessly', 'tally', 'tamely', 'tangentially', 'tangibly', 'tantalisingly', 'tantalizingly', 'tardily', 'tartly', 'tastefully', 'tastelessly', 'tauntingly', 'tautly', 'tautologically', 'tearfully', 'teasingly', 'technically', 'technologically', 'tectonically', 'tediously', 'telepathically', 'tellingly', 'temperamentally', 'temperately', 'temporally', 'temporarily', 'temptingly', 'tenaciously', 'tendentiously', 'tenderly', 'tensely', 'tentatively', 'tenuously', 'terminally', 'termly', 'terribly', 'terrifically', 'terrifyingly', 'territorially', 'tersely', 'testily', 'tetchily', 'textually', 'texturally', 'thankfully', 'thanklessly', 'theatrically', 'thematically', 'theologically', 'theoretically', 'therapeutically', 'thermally', 'thermodynamically', 'thermostatically', 'thickly', 'thinly', 'thirdly', 'thirstily', 'thoroughly', 'thoughtfully', 'thoughtlessly', 'threateningly', 'thrillingly', 'throatily', 'thunderously', 'tidily', 'tightly', 'timely', 'timidly', 'timorously', 'tingly', 'tinkly', 'tinnily', 'tiredly', 'tirelessly', 'tiresomely', 'titanically', 'tolerably', 'tolerantly', 'tonally', 'tonelessly', 'topically', 'topographically', 'topologically', 'tortuously', 'totally', 'touchingly', 'toughly', 'traditionally', 'tragically', 'traitorously', 'tranquilly', 'transcendentally', 'transfinitely', 'transiently', 'transitively', 'transparently', 'transversely', 'treacherously', 'tremblingly', 'tremendously', 'tremulously', 'trenchantly', 'tribally', 'trickily', 'triply', 'triumphantly', 'trivially', 'tropically', 'truculently', 'truly', 'trustfully', 'trustingly', 'truthfully', 'tumultuously', 'tunefully', 'tunelessly', 'turgidly', 'twiddly', 'typically', 'typographically', 'typologically', 'tyrannically', 'ugly', 'ultimately', 'unabashedly', 'unacceptably', 'unaccountably', 'unaffectedly', 'unalterably', 'unambiguously', 'unanimously', 'unarguably', 'unashamedly', 'unattainably', 'unavailingly', 'unavoidably', 'unbearably', 'unbelievably', 'unbiasedly', 'unbiassedly', 'unblinkingly', 'uncannily', 'unceasingly', 'unceremoniously', 'uncertainly', 'uncharacteristically', 'uncharitably', 'uncleanly', 'uncomfortably', 'uncommonly', 'uncomplainingly', 'uncomprehendingly', 'uncompromisingly', 'unconcernedly', 'unconditionally', 'unconscionably', 'unconsciously', 'unconstitutionally', 'uncontrollably', 'uncontroversially', 'unconventionally', 'unconvincingly', 'uncountably', 'uncritically', 'unctuously', 'undemocratically', 'undeniably', 'underbelly', 'understandably', 'understandingly', 'undeservedly', 'undesirably', 'undetectably', 'undisguisedly', 'undoubtedly', 'unduly', 'unearthly', 'uneasily', 'unemotionally', 'unendingly', 'unenthusiastically', 'unequally', 'unequivocally', 'unerringly', 'unethically', 'unevenly', 'uneventfully', 'unexpectedly', 'unfailingly', 'unfairly', 'unfashionably', 'unfavourably', 'unfeasibly', 'unfeelingly', 'unflinchingly', 'unforgivably', 'unfortunately', 'unfriendly', 'ungainly', 'ungenerously', 'ungentlemanly', 'ungodly', 'ungraciously', 'ungratefully', 'unhappily', 'unhealthily', 'unhelpfully', 'unhesitatingly', 'unholy', 'unhurriedly', 'uniformly', 'unilaterally', 'unimaginably', 'unimaginatively', 'uninformatively', 'uninhibitedly', 'unintentionally', 'uninterestedly', 'uninterruptedly', 'uniquely', 'universally', 'unjustifiably', 'unjustly', 'unkindly', 'unknightly', 'unknowingly', 'unlawfully', 'unlikely', 'unlovely', 'unluckily', 'unmanageably', 'unmanly', 'unmannerly', 'unmercifully', 'unmistakably', 'unmistakeably', 'unmusically', 'unnaturally', 'unnecessarily', 'unnervingly', 'unobtrusively', 'unofficially', 'unpleasantly', 'unprecedentedly', 'unpredictably', 'unprofitably', 'unquestionably', 'unquestioningly', 'unrealistically', 'unreasonably', 'unrecognisably', 'unrelentingly', 'unreliably', 'unremittingly', 'unrepentantly', 'unreservedly', 'unresistingly', 'unruly', 'unsafely', 'unsatisfactorily', 'unseasonably', 'unseeingly', 'unseemly', 'unselfconsciously', 'unselfishly', 'unsightly', 'unsmilingly', 'unspeakably', 'unsteadily', 'unstintingly', 'unstoppably', 'unsubtly', 'unsuccessfully', 'unsuitably', 'unsurprisingly', 'unswervingly', 'unsympathetically', 'unthinkably', 'unthinkingly', 'untidily', 'untimely', 'untruthfully', 'untypically', 'unusably', 'unusually', 'unutterably', 'unvaryingly', 'unwarily', 'unwarrantably', 'unwaveringly', 'unwillingly', 'unwisely', 'unwittingly', 'unwontedly', 'unworldly', 'unworthily', 'uprightly', 'uproariously', 'upwardly', 'urbanely', 'urgently', 'usefully', 'uselessly', 'user-friendly', 'usually', 'utterly', 'vacantly', 'vacuously', 'vaguely', 'vainly', 'valiantly', 'validly', 'vanishingly', 'variably', 'variously', 'vastly', 'vehemently', 'vengefully', 'venomously', 'ventrally', 'verbally', 'verbosely', 'veritably', 'vertically', 'viably', 'vibrantly', 'vibrationally', 'vicariously', 'viciously', 'victoriously', 'vigilantly', 'vigorously', 'vilely', 'vindictively', 'violently', 'virtually', 'virtuously', 'virulently', 'visibly', 'visually', 'vitally', 'vivaciously', 'vividly', 'vocally', 'vocationally', 'vociferously', 'volcanically', 'volubly', 'voluntarily', 'voluptuously', 'voraciously', 'vulgarly', 'waggishly', 'waggly', 'wanly', 'wantonly', 'warily', 'warmly', 'warningly', 'waspishly', 'wastefully', 'watchfully', 'wavily', 'waywardly', 'weakly', 'wearily', 'wearyingly', 'weaselly', 'weekly', 'weightily', 'weightlessly', 'weirdly', 'westerly', 'wetly', 'whimsically', 'whitely', 'wholeheartedly', 'wholesomely', 'wholly', 'wickedly', 'widely', 'wifely', 'wildly', 'wilfully', 'willingly', 'willy-nilly', 'wily', 'windily', 'winningly', 'wisely', 'wishfully', 'wistfully', 'witheringly', 'wittily', 'wittingly', 'wobbly', 'woefully', 'wolfishly', 'womanly', 'wonderfully', 'wonderingly', 'wondrously', 'woodenly', 'woolly', 'wordlessly', 'worldly', 'worriedly', 'worryingly', 'worthily', 'wrathfully', 'wretchedly', 'wrinkly', 'wrongfully', 'wrongly', 'wryly', 'yawningly', 'yearly', 'yearningly', 'zealously', 'zestfully'
];

const interjections = [
    'aha', 'ahem', 'ahh', 'ahoy', 'alas', 'arg', 'aw', 'bam', 'bingo', 'blah', 'boo', 'bravo', 'brrr', 'cheers', 'congratulations', 'dang', 'drat', 'darn', 'duh', 'eek', 'eh', 'encore', 'eureka', 'fiddlesticks', 'gadzooks', 'gee', 'gee whiz', 'golly', 'goodbye', 'goodness', 'good grief', 'gosh', 'haha', 'hallelujah', 'hello', 'hey', 'hmm', 'holy buckets', 'holy cow', 'holy smokes', 'hot dog', 'huh', 'humph', 'hurray', 'oh', 'oh dear', 'oh my', 'oh well', 'oops', 'ouch', 'ow', 'phew', 'phooey', 'pooh', 'pow', 'rats', 'shh', 'shoo', 'thanks', 'there', 'tut-tut', 'uh-huh', 'uh-oh', 'ugh', 'wahoo', 'well', 'whoa', 'whoops', 'wow', 'yeah', 'yes', 'yikes', 'yippee', 'yo', 'yuck'
];

const adjectives = [
    'abandoned', 'abashed', 'abhorrent', 'abiding', 'abject', 'abnormal', 'abominable', 'abortive', 'abrasive', 'abrupt', 'absent', 'absentminded', 'absolute', 'abstruse', 'absurd', 'abundant', 'abusive', 'abysmal', 'academic', 'acceptable', 'accidental', 'accommodating', 'according', 'accurate', 'acrimonious', 'active', 'acute', 'adamant', 'additional', 'adept', 'adequate', 'admirable', 'admonishing', 'adoring', 'adroit', 'advantageous', 'adventurous', 'adverse', 'aerial', 'aesthetic', 'affable', 'affecting', 'affectionate', 'affirmative', 'affluent', 'agile', 'agitated', 'agonizing', 'agreeable', 'aimless', 'airy', 'alarming', 'alert', 'alleged', 'aloof', 'altruistic', 'amazing', 'ambidextrous', 'ambiguous', 'ambitious', 'amenable', 'amiable', 'amicable', 'amoral', 'amphibious', 'amused', 'anagogic', 'anathematic', 'ancient', 'angelic', 'angry', 'animated', 'annoying', 'anonymous', 'antagonistic', 'anticipative', 'anxious', 'apologetic', 'appalling', 'approving', 'apt', 'arbitrary', 'archaic', 'arch', 'ardent', 'arduous', 'arguable', 'aristocratic', 'arousing', 'arrogant', 'artful', 'articulate', 'artificial', 'artistic', 'ashamed', 'asinine', 'assenting', 'assiduous', 'astonishing', 'athletic', 'atrocious', 'attentive', 'attractive', 'audacious', 'audible', 'august', 'aural', 'auspicious', 'austere', 'authentic', 'avaricious', 'avoidable', 'avowed', 'awesome', 'awful', 'awkward', 'bad', 'baleful', 'banal', 'baneful', 'barbarous', 'bashful', 'basic', 'bastard', 'bawdy', 'bearish', 'beauteous', 'begrudging', 'beguiling', 'belated', 'belligerent', 'beneficent', 'benign', 'beseeching', 'bestial', 'bewitching', 'bitter', 'blameless', 'bland', 'blank', 'blatant', 'bleak', 'blessed', 'blind', 'blissful', 'blithe', 'blunt', 'boastful', 'boisterous', 'bombastic', 'boundless', 'boyish', 'brave', 'breathless', 'breezy', 'brief', 'bright', 'brilliant', 'broad', 'broken', 'brusque', 'bucolic', 'buoyant', 'busy', 'cagy', 'cm', 'candid', 'canny', 'cantankerous', 'capable', 'capital', 'capricious', 'cardinal', 'careless', 'carnal', 'casual', 'categorical', 'catty', 'caudal', 'caustic', 'cautious', 'cavalier', 'ceaseless', 'celestial', 'censorious', 'ceremonial', 'certain', 'characteristic', 'charming', 'chaste', 'cheeky', 'cheerful', 'childish', 'chivalrous', 'chromatic', 'circuitous', 'classic', 'clear', 'clever', 'clinic', 'cliquish', 'clumsy', 'coarse', 'coaxing', 'cocky', 'cogent', 'coherent', 'coincidental', 'cold', 'collective', 'comfortable', 'commendable', 'compact', 'comparable', 'compassionate', 'compatible', 'complacent', 'complete', 'composite', 'comprehensive', 'compulsive', 'concentric', 'concentric', 'concise', 'conclusive', 'concomitant', 'concrete', 'concurrent', 'condescending', 'conditional', 'conductive', 'confessed', 'confident', 'confused', 'congenial', 'conic', 'conjoint', 'conscientious', 'conservative', 'considerable', 'consistent', 'consoling', 'conspicuous', 'constant', 'constitutional', 'constructive', 'contagious', 'contemptible', 'continual', 'contrary', 'contrite', 'contumacious', 'convenient', 'convincing', 'convulsive', 'cooperative', 'copious', 'coquettish', 'cordial', 'correct', 'cosmetic', 'courageous', 'courteous', 'covetous', 'coward', 'coy', 'cozy', 'crass', 'craven', 'crazy', 'creative', 'credible', 'creepy', 'criminal', 'crooked', 'crucial', 'crude', 'cumulative', 'cunning', 'curious', 'curt', 'customary', 'cute', 'cutting', 'cynic', 'dainty', 'dangerous', 'dark', 'dashing', 'dauntless', 'dazed', 'dear', 'debonair', 'deceiving', 'decent', 'deceptive', 'decided', 'decisive', 'decorous', 'deep', 'definite', 'deft', 'deliberate', 'delicate', 'delightful', 'delinquent', 'demonstrable', 'demure', 'dense', 'dependent', 'derisive', 'deserved', 'desirable', 'desolate', 'desperate', 'despicable', 'destructive', 'devilish', 'devoted', 'diabolic', 'different', 'diligent', 'dim', 'diplomatic', 'dire', 'disagreeable', 'disconsolate', 'disgraceful', 'dishonest', 'dismal', 'dismissive', 'dispassionate', 'disrespectful', 'dissolute', 'distant', 'distinct', 'diverse', 'divisive', 'dizzy', 'dogged', 'dolorous', 'domestic', 'dominant', 'doubtful', 'dramatic', 'dreadful', 'droll', 'drunken', 'dry', 'dubious', 'dubious', 'dull', 'duteous', 'dutiful', 'dynamic', 'eager', 'earnest', 'easy', 'ebullient', 'eccentric', 'eclectic', 'ecstatic', 'editorial', 'educational', 'eerie', 'effective', 'effortless', 'effusive', 'egotistic', 'egregious', 'elaborate', 'elegant', 'eloquent', 'elusive', 'embarrassing', 'eminent', 'emotional', 'emphatic', 'empiric', 'enchanting', 'endearing', 'endless', 'energetic', 'engaging', 'enormous', 'enthusiastic', 'enticing', 'enviable', 'epidemic', 'equal', 'equitable', 'equivalent', 'erect', 'erotic', 'erratic', 'erroneous', 'esoteric', 'especial', 'essential', 'eternal', 'ethereal', 'ethic', 'euphemistic', 'evasive', 'even', 'evident', 'evil', 'exact', 'exaggerated', 'excellent', 'excited', 'exclusive', 'excruciating', 'excursive', 'execrable', 'exorbitant', 'exotic', 'expansive', 'expectant', 'expedient', 'expeditious', 'experimental', 'explicit', 'express', 'exquisite', 'extensive', 'extraordinary', 'extravagant', 'extrinsic', 'exuberant', 'exulting', 'fabulous', 'facetious', 'factious', 'factual', 'faint', 'faithful', 'fallacious', 'fallible', 'false', 'faltering', 'familiar', 'famous', 'fanatic', 'fanciful', 'fantastic', 'fashionable', 'fastidious', 'fatal', 'fateful', 'fatuous', 'faulty', 'favorable', 'fawning', 'fearless', 'feeble', 'feeling', 'felicitous', 'ferocious', 'festive', 'fetching', 'feverish', 'fiendish', 'firm', 'fishy', 'fitting', 'fixed', 'flabby', 'flagrant', 'flamboyant', 'flashy', 'flat', 'flattering', 'flaunting', 'flawless', 'fleet', 'flexible', 'flimsy', 'flippant', 'flirtatious', 'floppy', 'fluent', 'fluid', 'fond', 'foolhardy', 'foolish', 'forbidding', 'forceful', 'forgetful', 'forlorn', 'formidable', 'forthright', 'fortuitous', 'forward', 'foul', 'fractious', 'fragrant', 'frail', 'frank', 'fraternal', 'fraudulent', 'free', 'frenetic', 'frequent', 'fresh', 'fretful', 'frightening', 'frisky', 'frivolous', 'frowning', 'frugal', 'fruitful', 'fruitless', 'frustrating', 'fulsome', 'fumbling', 'funny', 'furious', 'furtive', 'fussy', 'futile', 'fuzzy', 'gallant', 'game', 'garish', 'garrulous', 'gauche', 'gaudy', 'gawky', 'generous', 'genial', 'gent', 'glad', 'glaring', 'glib', 'glum', 'goodhearted', 'gorgeous', 'graceful', 'gradual', 'grand', 'grateful', 'grave', 'great', 'greedy', 'gregarious', 'grievous', 'grimy', 'groggy', 'gross', 'grotesque', 'grudging', 'guarded', 'guilty', 'habitual', 'haggard', 'halfhearted', 'handsome', 'haphazard', 'happy', 'hardheaded', 'hardy', 'harmful', 'harsh', 'hasty', 'haughty', 'hazardous', 'hazy', 'healthy', 'heartless', 'heated', 'hectic', 'heedless', 'heinous', 'hellish', 'helpful', 'heroic', 'hesitant', 'hideous', 'highhanded', 'hilarious', 'histrionic', 'hoarse', 'hoggish', 'honest', 'honorable', 'hopeful', 'horrendous', 'hot', 'huge', 'humane', 'humble', 'humorous', 'hungry', 'hurried', 'husky', 'hypnotic', 'hypocritical', 'hysteric', 'icy', 'idiotic', 'ignoble', 'ignorant', 'illicit', 'illustrative', 'imaginative', 'imitative', 'immaculate', 'immature', 'immeasurable', 'immediate', 'immense', 'imminent', 'immodest', 'immoral', 'immutable', 'impalpable', 'impartial', 'impassive', 'impatient', 'impeccable', 'imperative', 'impertinent', 'impetuous', 'impious', 'implacable', 'impolite', 'impotent', 'imprecise', 'impressive', 'improper', 'impudent', 'impulsive', 'inadvertent', 'inanimate', 'inappreciable', 'inarticulate', 'inaudible', 'incapable', 'incessant', 'inclusive', 'incoherent', 'incompetent', 'incongruous', 'inconsiderate', 'inconspicuous', 'incorrect', 'incredible', 'indecent', 'indecisive', 'indefatigably', 'indelicate', 'independent', 'indescribable', 'indicative', 'indifferent', 'indignant', 'indirect', 'indiscreet', 'indiscriminate', 'indisputable', 'indistinct', 'indubitable', 'industrious', 'ineffective', 'inept', 'inescapable', 'inexhaustible', 'infallible', 'infectious', 'infinitesimal', 'inflexible', 'informal', 'infuriating', 'ingenuous', 'inimical', 'innocent', 'innocuous', 'inoffensive', 'inoffensive', 'insane', 'inscrutable', 'insecure', 'insincere', 'insincere', 'insistent', 'insolent', 'instantaneous', 'insufferable', 'intellectual', 'intense', 'interminable', 'intimate', 'intolerable', 'intrepid', 'intricate', 'intriguing', 'intuitive', 'invaluable', 'inverse', 'invidious', 'involuntary', 'ireful', 'irksome', 'ironic', 'irrational', 'irresistible', 'irresolute', 'irritable', 'jaded', 'jaunty', 'jealous', 'jeering', 'jerky', 'jocose', 'joking', 'jolly', 'jovial', 'joyful', 'jubilant', 'judicious', 'juicy', 'just', 'keen', 'kindhearted', 'knowing', 'laborious', 'lackadaisical', 'laconic', 'laggard', 'lame', 'laudable', 'laughing', 'lavish', 'lax', 'lazy', 'lecherous', 'legitimate', 'lenient', 'lethargic', 'lewd', 'liberal', 'licentious', 'lighthearted', 'light', 'limp', 'lingering', 'listless', 'literal', 'livid', 'logic', 'longing', 'loose', 'lopsided', 'loud', 'loving', 'loyal', 'lubber', 'lucid', 'lucky', 'lucrative', 'ludicrous', 'lugubrious', 'lurid', 'luscious', 'lusty', 'luxuriant', 'mad', 'magic', 'magnanimous', 'magnificent', 'majestic', 'maladroit', 'malicious', 'manful', 'manifest', 'mannish', 'marginal', 'marked', 'marvelous', 'masochistic', 'massive', 'masterful', 'maternal', 'matter-of-fact', 'mature', 'mawkish', 'meager', 'mean', 'measurable', 'mechanic', 'meek', 'mellifluous', 'melodious', 'memorable', 'menacing', 'menial', 'merciful', 'meretricious', 'merry', 'messy', 'metaphoric', 'methodic', 'meticulous', 'metric', 'mighty', 'mild', 'militant', 'mindful', 'minimal', 'minute', 'miraculous', 'mischievous', 'miser', 'mistaken', 'mocking', 'modest', 'moist', 'momentous', 'monogamous', 'monstrous', 'monumental', 'moody', 'moral', 'morbid', 'moronic', 'mournful', 'mundane', 'murky', 'music', 'mute', 'mysterious', 'naive', 'naked', 'narrow', 'nasty', 'natural', 'naughty', 'nauseating', 'neat', 'necessary', 'needless', 'nefarious', 'negative', 'neglectful', 'nerveless', 'neurotic', 'neutral', 'nice', 'nimble', 'noble', 'noiseless', 'noisy', 'nonchalant', 'nonsensical', 'normal', 'nosy', 'notable', 'noticeable', 'notorious', 'numb', 'oafish', 'obdurate', 'obedient', 'objective', 'oblique', 'obscure', 'obsessive', 'occasional', 'opaque', 'oppressive', 'outrageous', 'overabundant', 'painful', 'palpable', 'paradoxical', 'passable', 'paternal', 'pathetic', 'patient', 'peaceful', 'peculiar', 'peevish', 'perceptible', 'perfect', 'perilous', 'permissive', 'pernicious', 'persistent', 'pert', 'perverse', 'pesky', 'pessimistic', 'petulant', 'physic', 'pious', 'piquant', 'piteous', 'pithy', 'pitiful', 'placid', 'plain', 'playful', 'pleasant', 'plentiful', 'poetic', 'poignant', 'pointed', 'polite', 'pompous', 'ponderous', 'poor', 'popular', 'portentous', 'positive', 'possessive', 'pouting', 'powerless', 'practical', 'pragmatic', 'precarious', 'precise', 'precocious', 'premature', 'prideful', 'prim', 'prissy', 'private', 'prodigious', 'promiscuous', 'proper', 'prosperous', 'proud', 'provident', 'prudent', 'public', 'puerile', 'pugnacious', 'punctilious', 'pungent', 'punitive', 'pure', 'purposeful', 'quaint', 'qualitative', 'queer', 'querulous', 'quick', 'quiet', 'quizzical', 'rabid', 'racy', 'radiant', 'radical', 'raffish', 'raging', 'rakish', 'rampant', 'rancorous', 'random', 'rank', 'rapid', 'rapt', 'rare', 'rash', 'rational', 'raucous', 'raunchy', 'ravenous', 'raving', 'ready', 'realistic', 'reasonable', 'rebellious', 'rebuking', 'reciprocating', 'reckless', 'red-handed', 'redoubtable', 'reflective', 'regal', 'regretful', 'relentless', 'reliable', 'religious', 'reluctant', 'remarkable', 'ruminant', 'remote', 'repeated', 'reprehensive', 'reproachful', 'repulsive', 'resentful', 'reserved', 'resigned', 'resolute', 'respectful', 'resplendent', 'responsible', 'restful', 'retrospective', 'reverent', 'rhythmic', 'rich', 'ridiculous', 'right', 'rigid', 'rigorous', 'ripe', 'ritual', 'robust', 'romantic', 'rosy', 'rough', 'royal', 'rude', 'rueful', 'rugged', 'ruthless', 'sadistic', 'sad', 'safe', 'salacious', 'salient', 'sanctimonious', 'sane', 'sarcastic', 'sardonic', 'satanic', 'satisfactory', 'saucy', 'savage', 'scandalous', 'scant', 'scornful', 'scurrilous', 'secret', 'secure', 'sedate', 'sedulous', 'self-conscious', 'selfish', 'selfless', 'sensational', 'sensible', 'sensitive', 'sensual', 'sentimental', 'serene', 'serious', 'severe', 'sexy', 'sexual', 'shaky', 'shameful', 'sharp', 'sheepish', 'shoddy', 'shortsighted', 'showy', 'shrewd', 'shy', 'significant', 'silent', 'simple', 'sincere', 'single-minded', 'skeptic', 'skillful', 'skimpy', 'slack', 'slattern', 'slavish', 'sleazy', 'sleek', 'slick', 'slight', 'slovene', 'slow', 'sluggish', 'smart', 'smiling', 'smooth', 'smug', 'snarling', 'snooty', 'snug', 'sobbing', 'sober', 'sociable', 'soft', 'soggy', 'solemn', 'solicitous', 'somber', 'soothing', 'sordid', 'sore', 'sorrowful', 'soulful', 'sound', 'sour', 'spacious', 'sparing', 'special', 'speechless', 'spiteful', 'splendid', 'spontaneous', 'sporadic', 'spry', 'spurious', 'square', 'staid', 'stark', 'static', 'staunch', 'steadfast', 'steady', 'stealthy', 'stern', 'stiff', 'stingy', 'stoic', 'stolid', 'stormy', 'stout', 'straight', 'strange', 'strategic', 'strenuous', 'strict', 'strident', 'stringent', 'strong', 'stubborn', 'studied', 'stuffy', 'stunning', 'stupid', 'stylistic', 'suave', 'subconscious', 'submissive', 'subtle', 'subversive', 'successful', 'sudden', 'sudden', 'sufficient', 'suggestive', 'suitable', 'sulky', 'sullen', 'superb', 'supp', 'supportive', 'supreme', 'sure', 'surprising', 'surreptitious', 'suspicious', 'swanky', 'sweeping', 'swift', 'symbolic', 'sympathetic', 'tacit', 'tacky', 'tactful', 'talkative', 'tame', 'tangible', 'tardy', 'tart', 'tasteful', 'taunting', 'taut', 'tearful', 'teasing', 'tedious', 'telepathic', 'telling', 'temperate', 'tenable', 'tenacious', 'tendentious', 'tense', 'tentative', 'tepid', 'terrible', 'terse', 'testy', 'thankful', 'thick', 'thin', 'thirsty', 'thorough', 'thoughtful', 'tidy', 'tight', 'timid', 'timorous', 'tireless', 'titillating', 'tolerable', 'tolerant', 'tonal', 'toneless', 'tough', 'tragic', 'tranquil', 'treacherous', 'tremendous', 'trenchant', 'trim', 'trite', 'triumphant', 'truculent', 'true', 'trustful', 'truthful', 'trying', 'tuneful', 'turbulent', 'turgid', 'tyrannical', 'ubiquitous', 'unaccountable', 'unanimous', 'unavoidable', 'unbearable', 'unblushing', 'unceremonious', 'uncritical', 'understandable', 'uneasy', 'unequivocal', 'unerring', 'unexpected', 'unexplainable', 'unfitting', 'ungraceful', 'unhopeful', 'uninhibited', 'unimaginative', 'uninspiring', 'unintelligible', 'unique', 'unjustifiable', 'unkind', 'unnecessary', 'unobtrusive', 'unproductive', 'unreceptive', 'unsafe', 'unscrupulous', 'unselfish', 'unskillful', 'unsociable', 'unspeakable', 'unstinting', 'unsuccessful', 'untactful', 'unthinking', 'untiring', 'untruthful', 'unwilling', 'unwitting', 'urgent', 'useful', 'useless', 'vacuous', 'vague', 'vain', 'valiant', 'various', 'vehement', 'vengeful', 'vexed', 'vibrant', 'vicarious', 'vicious', 'victorious', 'vigilant', 'vigorous', 'vindictive', 'violent', 'virtuous', 'visceral', 'visual', 'vital', 'vivacious', 'vivid', 'vocal', 'vociferous', 'voluble', 'vulgar', 'vulnerable', 'wan', 'wanton', 'warm', 'waspish', 'wasteful', 'watchful', 'wayward', 'weak', 'wearisome', 'weird', 'whimsical', 'wholehearted', 'wholesome', 'wicked', 'wide', 'wild', 'willful', 'winning', 'winsome', 'wise', 'wishful', 'wistful', 'witless', 'witty', 'woeful', 'wonderful', 'wretched', 'wrong', 'wry', 'youthful', 'zealous'
];

const verbed = new Proxy(verbs, {
    get: (arr, prop) => {
        // Check it's not a property
        if (!(prop in [])) {
            return getPastTense(arr[prop])
        } else {
            return arr[prop]
        }
    }
});

var WORDLISTS = /*#__PURE__*/Object.freeze({
    verbed: verbed,
    verbs: verbs,
    nouns: nouns,
    adverbs: adverbs,
    interjections: interjections,
    adjectives: adjectives
});

// import * as WORDLISTS from WORDLIST_URL
console.log(WORDLISTS);
// Extend the LitElement base class
class RandomSentenceGenerator extends LitElement {
    /**
     * Implement `render` to define a template for your element.
     *
     * You must provide an implementation of `render` for any element
     * that uses LitElement as a base class.
     */
    static get properties () {
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
            }
        }
    }

    constructor () {
        super();

        // Properties
        this.template = 'adjective noun verb adverb.';
        this.parsedString = '';
        this.fetchedWordlistCount = 0;
        this.capitalize = true;
        this.partsOfSpeechMap = {
            'noun': 'nouns',
            'adverb': 'adverbs',
            'adv': 'adverbs',
            'verb': 'verbs',
            'interjection': 'interjections',
            'adjective': 'adjectives',
            'adj': 'adjectives',
            'verbed': 'verbed'
        };
        this.partsOfSpeech = Object.keys(this.partsOfSpeechMap);
    }

    updated (changedProperties) {
        // console.log('changed properties')
        // console.log(changedProperties) // logs previous values
        if (changedProperties.has('template')) {
            this.generate();
        }
        // if (changedProperties.has('templateEntropy')) {
        //     this.
        // }
    }

    _RNG (entropy) {
        if (entropy > 1074) {
            throw new Error('Javascript can not handle that much entropy!')
        }
        let randNum = 0;
        const crypto = window.crypto || window.msCrypto;

        if (crypto) {
            const entropy256 = Math.ceil(entropy / 8);

            let buffer = new Uint8Array(entropy256);
            crypto.getRandomValues(buffer);

            randNum = buffer.reduce((num, value) => {
                return num * value
            }, 1) / Math.pow(256, entropy256);
        } else {
            console.warn('Secure RNG not found. Using Math.random');
            randNum = Math.random();
        }
        return randNum
    }

    setRNG (fn) {
        this._RNG = fn;
    }

    _captitalize (str) {
        return str.charAt(0).toUpperCase() + str.slice(1)
    }

    getWord (partOfSpeech) {
        const words = WORDLISTS[this.partsOfSpeechMap[partOfSpeech]];
        const requiredEntropy = Math.log(words.length) / Math.log(2);
        const index = this._RNG(requiredEntropy) * words.length;

        return {
            word: words[Math.round(index)],
            entropy: words.length
        }
    }

    generate () {
        this.parsedString = this.parse(this.template);
    }

    parse (template) {
        const split = template.split(/[\s]/g);
        let entropy = 1;
        const final = split.map(word => {
            const lower = word.toLowerCase();

            this.partsOfSpeech.some(partOfSpeech => {
                const partOfSpeechIndex = lower.indexOf(partOfSpeech); // Check it exists
                const nextChar = word.charAt(partOfSpeech.length);

                if (partOfSpeechIndex === 0 && !(nextChar && (nextChar.match(/[a-zA-Z]/g) != null))) {
                    const replacement = this.getWord(partOfSpeech);
                    word = replacement.word + word.slice(partOfSpeech.length); // Append the rest of the "word" (punctuation)
                    entropy = entropy * replacement.entropy;
                    return true
                }
            });
            return word
        });
        this.templateEntropy = Math.floor(Math.log(entropy) / Math.log(8));
        // console.log('parsing ' + template)
        return /* this.templateEntropy + ' - ' + */ final.join(' ')
    }

    render () {
        /**
         * `render` must return a lit-html `TemplateResult`.
         *
         * To create a `TemplateResult`, tag a JavaScript template literal
         * with the `html` helper function:
         */
        return html`
            ${this.parsedString}
        `
    }
}
// Register the new element with the browser.
customElements.define('random-sentence-generator', RandomSentenceGenerator);

export default RandomSentenceGenerator;
