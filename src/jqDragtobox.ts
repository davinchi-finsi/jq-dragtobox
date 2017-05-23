
( function (root, factory) {
    if (typeof define === "function" && define.amd) {
        // AMD. Register as an anonymous module.
        define([
                   "jquery",
                   "jquery-ui",
                   "dragula"
               ], factory);
    } else if (typeof require === "function") {
        // commonjs require
        var depNames = [
            "jquery",
            "jquery-ui",
            "dragula"
        ],
        deps = [];
        //get dependencies by require
        for (let depIndex = 0, depsLength = depNames.length; depIndex < depsLength; depIndex++) {
            let current = depNames[depIndex];
            deps.push(require(current));
        }
        if (typeof module === 'object' && module.exports) {
            // Node. Does not work with strict CommonJS, but
            // only CommonJS-like environments that support module.exports,
            // like Node.
            module.exports = factory.apply(root,deps);
        }else{
            factory.apply(root,deps);
        }
    } else {
        // Browser globals
        factory(jQuery, null,root.dragula);
    }
}(this, function ($, $ui, dragula) {
    /**
     * @class dragtobox
     */
    $.widget("hz.dragtobox", {
        /**
         * @memberof dragtobox
         */
        NAMESPACE: "dragtobox",
        ELEMENT_STATE: {
            KO: 0,
            OK: 1
        },
        ON_DRAGTOBOX_START: "dragtobox:start",
        ON_DRAGTOBOX_OVER: 'dragtobox:over',
        ON_DRAGTOBOX_COMPLETED: 'dragtobox:completed',
        ON_DRAGTOBOX_OK: 'dragtobox:ok',

        CLASS_BOX: 'hz-dragtobox__box',
        CLASS_BOX_HOVER: 'hz-dragtobox__box--hover',
        CLASS_ELEMENT: 'hz-dragtobox__element',
        CLASS_ELEMENTS: 'hz-dragtobox__elements',
        CLASS_ELEMENT_PLACED: 'hz-dragtobox__element--placed',
        CLASS_ELEMENT_STATE_OK: 'hz-dragtobox__element--ok',
        CLASS_ELEMENT_STATE_KO: 'hz-dragtobox__element--ko',
        CLASS_ORIGIN: "hz-dragtobox__origin",

        QUERY_BOX: '.hz-dragtobox__box',
        QUERY_ELEMENT: '.hz-dragtobox__element',
        QUERY_ELEMENTS: '.hz-dragtobox__elements',
        QUERY_ELEMENT_STATE_KO: '.hz-dragtobox__element--ko',
        QUERY_ELEMENT_STATE_OK: '.hz-dragtobox__element--ok',
        QUERY_ELEMENT_PLACED: '.hz-dragtobox__element--placed',
        QUERY_ORIGIN: ".hz-dragtobox__origin",
        // Default options
        options: {
            origin: ".hz-dragtobox__origin",
            boxes: ".hz-dragtobox__box",
            elements: ".hz-dragtobox__element",
            allowDropInInvalid: true,
            mirrorContainer: document.body
        },
        /**
         * @memberof dragtobox
         * Función de creación del widget
         * @function
         */
        _create: function () {
        },
        /**
         * Inicia el componente
         */
        _init: function () {
            this._correct = 0;
            this._boxes = [];
            this._elements = [];
            this._getElements();
            this._parseItems();
            this._start();
        },
        _getElements: function () {
            this._$boxes = this.element.find(this.options.boxes);
            if (this._$boxes.length < 1) {
                throw 'No se ha encontrado ningunna caja de destino. Necesitas usar la clase ' + this.CLASS_BOX;
            }
            this._$origin = this.element.find(this.options.origin);
            if (this._$origin.length < 1) {
                throw 'No se ha encontrado ningunna caja de origen. Necesitas usar la clase ' + this.CLASS_ORIGIN;
            }
            this._$boxes.addClass(this.CLASS_BOX);
            this._$origin.addClass(this.CLASS_ORIGIN);
        },
        _parseItems: function () {
            let idElement = 0;

            //Recorremos los box
            for (let boxIndex = 0; boxIndex < this._$boxes.length; boxIndex++) {
                let currentBox = $(this._$boxes[boxIndex]);
                let _elements = currentBox.find(this.options.elements);
                let _elementsInBox = [];

                for (let elementIndex = 0; elementIndex < _elements.length; elementIndex++) {
                    let currentElement = $(_elements[elementIndex])
                        .detach();
                    let newElement = {
                        'idElement': idElement,
                        'idBox': boxIndex,
                        '$element': currentElement,
                        'isCorrect': null
                    };
                    this._elements.push(newElement);
                    _elementsInBox.push(newElement);
                    idElement++;
                }
                let newBox = {
                    'idBox': boxIndex,
                    '$box': currentBox,
                    'elements': _elementsInBox,
                    '$elements': _elements
                };
                this._boxes.push(newBox);
            }
        },
        _getElementsOf: function (items = []) {
            let result = [];
            for (let itemIndex = 0, itemsLength = items.length; itemIndex < itemsLength; itemIndex++) {
                let currentItem = items[itemIndex];
                result.push(currentItem.$element);
            }
            return $.makeArray(result);
        },
        _start: function () {
            this._$origin.append(this._getElementsOf(this._shuffleArray(this._elements)));
            this._dragulaInstance = dragula(this._$origin.toArray()
                                                .concat(this._$boxes.toArray()), {
                                                isContainer: this._isContainer.bind(this),
                                                moves: this._moves.bind(this),
                                                accepts: this._accepts.bind(this),
                                                invalid: this._invalid.bind(this),
                                                revertOnSpill: true,              // spilling will put the element back where it was dragged from, if this is true
                                                mirrorContainer: this.options.mirrorContainer,    // set the element that gets mirror elements appended
                                            });
            this._assignEvents();
        },
        _isContainer: function (el) {
            return $(el)
                .hasClass(this.CLASS_BOX);
        },
        _moves: function (el, source, handle, sibling) {
            return true;
        },
        _accepts: function (el, target, source, sibling) {
            let allow = false;
            if (!this._$origin.is(target)) {
                if (this.options.allowDropInInvalid != true) {
                    let boxes = this._boxes;
                    //por cada caja
                    allow = this._validate(el, target);
                } else {
                    allow = true;
                }
            }
            return allow;
        },
        _invalid: function (el, handle) {
            return this.options.disabled || !$(el)
                .hasClass(this.CLASS_ELEMENT);
        },
        _assignEvents: function () {
            this._dragulaInstance.on("drop", this._onDrop.bind(this));
        },
        _onDrop: function (el, target, source, sibling) {
            let isCorrect = this._validate(el, target),
                $el = $(el),
                element = this._elements[this._getElementIndexFor($el)];
            if (isCorrect) {
                $el.removeClass(this.CLASS_ELEMENT_STATE_KO);
                $el.addClass(this.CLASS_ELEMENT_STATE_OK);
                if (element.isCorrect != true) {
                    this._correct++;
                }
            } else {
                $el.removeClass(this.CLASS_ELEMENT_STATE_OK);
                $el.addClass(this.CLASS_ELEMENT_STATE_KO);
                if (element.isCorrect == true) {
                    this._correct--;
                }
            }
            element.isCorrect = isCorrect;
            if (this._correct == this._elements.length) {
                this._end();
            }
        },
        _end: function () {
            this.element.trigger(this.ON_DRAGTOBOX_COMPLETED);
        },
        _getBoxIndexFor: function ($box) {
            let boxes = this._boxes,
                result = -1;
            for (let boxIndex = 0, boxesLength = boxes.length; boxIndex < boxesLength; boxIndex++) {
                let currentBox = boxes[boxIndex];
                if (currentBox.$box.is($box)) {
                    result = boxIndex;
                    boxIndex = boxesLength;
                }
            }
            return result;
        },
        _getElementIndexFor: function ($element, box?) {
            let result = -1;
            if (box) {
                result = box.$elements.index($element);
            } else {
                let elements = this._elements;
                for (let elementIndex = 0, elementsLength = elements.length; elementIndex < elementsLength; elementIndex++) {
                    let currentElement = elements[elementIndex];
                    if ($element.is(currentElement.$element)) {
                        result = elementIndex;
                        elementIndex = elementsLength
                    }
                }
            }
            return result;
        },
        _validate: function (el, box) {
            let boxIndex = this._getBoxIndexFor($(box)),
                result = false;
            if (boxIndex != -1) {
                let box = this._boxes[boxIndex],
                    elemIndex = this._getElementIndexFor($(el), box);
                result = elemIndex != -1;
            }
            return result;
        },
        isDisabled: function () {
            return this.options.disabled;
        },
        destroy: function () {
            if (this._dragulaInstance) {
                this._dragulaInstance.destroy();
            }
            this._super();
        },
        /*
         *  Devuelve un orden aleatorio del array que se le pasa
         *  @params array
         */
        _shuffleArray: function (array) {
            for (let positionIndex = array.length - 1; positionIndex > 0; positionIndex--) {
                let j = Math.floor(Math.random() * (positionIndex + 1));
                let temp = array[positionIndex];
                array[positionIndex] = array[j];
                array[j] = temp;
            }
            return array;
        }
    });
}));