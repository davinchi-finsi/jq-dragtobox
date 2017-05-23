(function (root, factory) {
    if (typeof define === "function" && define.amd) {
        // AMD. Register as an anonymous module.
        define([
            "jquery",
            "jquery-ui",
            "dragula"
        ], factory);
    }
    else if (typeof require === "function") {
        // commonjs require
        var depNames = [
            "jquery",
            "jquery-ui",
            "dragula"
        ], deps = [];
        //get dependencies by require
        for (var depIndex = 0, depsLength = depNames.length; depIndex < depsLength; depIndex++) {
            var current = depNames[depIndex];
            deps.push(require(current));
        }
        if (typeof module === 'object' && module.exports) {
            // Node. Does not work with strict CommonJS, but
            // only CommonJS-like environments that support module.exports,
            // like Node.
            module.exports = factory.apply(root, deps);
        }
        else {
            factory.apply(root, deps);
        }
    }
    else {
        // Browser globals
        factory(jQuery, null, root.dragula);
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
            var idElement = 0;
            //Recorremos los box
            for (var boxIndex = 0; boxIndex < this._$boxes.length; boxIndex++) {
                var currentBox = $(this._$boxes[boxIndex]);
                var _elements = currentBox.find(this.options.elements);
                var _elementsInBox = [];
                for (var elementIndex = 0; elementIndex < _elements.length; elementIndex++) {
                    var currentElement = $(_elements[elementIndex])
                        .detach();
                    var newElement = {
                        'idElement': idElement,
                        'idBox': boxIndex,
                        '$element': currentElement,
                        'isCorrect': null
                    };
                    this._elements.push(newElement);
                    _elementsInBox.push(newElement);
                    idElement++;
                }
                var newBox = {
                    'idBox': boxIndex,
                    '$box': currentBox,
                    'elements': _elementsInBox,
                    '$elements': _elements
                };
                this._boxes.push(newBox);
            }
        },
        _getElementsOf: function (items) {
            if (items === void 0) { items = []; }
            var result = [];
            for (var itemIndex = 0, itemsLength = items.length; itemIndex < itemsLength; itemIndex++) {
                var currentItem = items[itemIndex];
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
                revertOnSpill: true,
                mirrorContainer: this.options.mirrorContainer,
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
            var allow = false;
            if (!this._$origin.is(target)) {
                if (this.options.allowDropInInvalid != true) {
                    var boxes = this._boxes;
                    //por cada caja
                    allow = this._validate(el, target);
                }
                else {
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
            var isCorrect = this._validate(el, target), $el = $(el), element = this._elements[this._getElementIndexFor($el)];
            if (isCorrect) {
                $el.removeClass(this.CLASS_ELEMENT_STATE_KO);
                $el.addClass(this.CLASS_ELEMENT_STATE_OK);
                if (element.isCorrect != true) {
                    this._correct++;
                }
            }
            else {
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
            var boxes = this._boxes, result = -1;
            for (var boxIndex = 0, boxesLength = boxes.length; boxIndex < boxesLength; boxIndex++) {
                var currentBox = boxes[boxIndex];
                if (currentBox.$box.is($box)) {
                    result = boxIndex;
                    boxIndex = boxesLength;
                }
            }
            return result;
        },
        _getElementIndexFor: function ($element, box) {
            var result = -1;
            if (box) {
                result = box.$elements.index($element);
            }
            else {
                var elements = this._elements;
                for (var elementIndex = 0, elementsLength = elements.length; elementIndex < elementsLength; elementIndex++) {
                    var currentElement = elements[elementIndex];
                    if ($element.is(currentElement.$element)) {
                        result = elementIndex;
                        elementIndex = elementsLength;
                    }
                }
            }
            return result;
        },
        _validate: function (el, box) {
            var boxIndex = this._getBoxIndexFor($(box)), result = false;
            if (boxIndex != -1) {
                var box_1 = this._boxes[boxIndex], elemIndex = this._getElementIndexFor($(el), box_1);
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
            for (var positionIndex = array.length - 1; positionIndex > 0; positionIndex--) {
                var j = Math.floor(Math.random() * (positionIndex + 1));
                var temp = array[positionIndex];
                array[positionIndex] = array[j];
                array[j] = temp;
            }
            return array;
        }
    });
}));

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJqcURyYWd0b2JveC5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gKHJvb3QsIGZhY3RvcnkpIHtcbiAgICBpZiAodHlwZW9mIGRlZmluZSA9PT0gXCJmdW5jdGlvblwiICYmIGRlZmluZS5hbWQpIHtcbiAgICAgICAgLy8gQU1ELiBSZWdpc3RlciBhcyBhbiBhbm9ueW1vdXMgbW9kdWxlLlxuICAgICAgICBkZWZpbmUoW1xuICAgICAgICAgICAgXCJqcXVlcnlcIixcbiAgICAgICAgICAgIFwianF1ZXJ5LXVpXCIsXG4gICAgICAgICAgICBcImRyYWd1bGFcIlxuICAgICAgICBdLCBmYWN0b3J5KTtcbiAgICB9XG4gICAgZWxzZSBpZiAodHlwZW9mIHJlcXVpcmUgPT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgICAvLyBjb21tb25qcyByZXF1aXJlXG4gICAgICAgIHZhciBkZXBOYW1lcyA9IFtcbiAgICAgICAgICAgIFwianF1ZXJ5XCIsXG4gICAgICAgICAgICBcImpxdWVyeS11aVwiLFxuICAgICAgICAgICAgXCJkcmFndWxhXCJcbiAgICAgICAgXSwgZGVwcyA9IFtdO1xuICAgICAgICAvL2dldCBkZXBlbmRlbmNpZXMgYnkgcmVxdWlyZVxuICAgICAgICBmb3IgKHZhciBkZXBJbmRleCA9IDAsIGRlcHNMZW5ndGggPSBkZXBOYW1lcy5sZW5ndGg7IGRlcEluZGV4IDwgZGVwc0xlbmd0aDsgZGVwSW5kZXgrKykge1xuICAgICAgICAgICAgdmFyIGN1cnJlbnQgPSBkZXBOYW1lc1tkZXBJbmRleF07XG4gICAgICAgICAgICBkZXBzLnB1c2gocmVxdWlyZShjdXJyZW50KSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHR5cGVvZiBtb2R1bGUgPT09ICdvYmplY3QnICYmIG1vZHVsZS5leHBvcnRzKSB7XG4gICAgICAgICAgICAvLyBOb2RlLiBEb2VzIG5vdCB3b3JrIHdpdGggc3RyaWN0IENvbW1vbkpTLCBidXRcbiAgICAgICAgICAgIC8vIG9ubHkgQ29tbW9uSlMtbGlrZSBlbnZpcm9ubWVudHMgdGhhdCBzdXBwb3J0IG1vZHVsZS5leHBvcnRzLFxuICAgICAgICAgICAgLy8gbGlrZSBOb2RlLlxuICAgICAgICAgICAgbW9kdWxlLmV4cG9ydHMgPSBmYWN0b3J5LmFwcGx5KHJvb3QsIGRlcHMpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgZmFjdG9yeS5hcHBseShyb290LCBkZXBzKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgLy8gQnJvd3NlciBnbG9iYWxzXG4gICAgICAgIGZhY3RvcnkoalF1ZXJ5LCBudWxsLCByb290LmRyYWd1bGEpO1xuICAgIH1cbn0odGhpcywgZnVuY3Rpb24gKCQsICR1aSwgZHJhZ3VsYSkge1xuICAgIC8qKlxuICAgICAqIEBjbGFzcyBkcmFndG9ib3hcbiAgICAgKi9cbiAgICAkLndpZGdldChcImh6LmRyYWd0b2JveFwiLCB7XG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAbWVtYmVyb2YgZHJhZ3RvYm94XG4gICAgICAgICAqL1xuICAgICAgICBOQU1FU1BBQ0U6IFwiZHJhZ3RvYm94XCIsXG4gICAgICAgIEVMRU1FTlRfU1RBVEU6IHtcbiAgICAgICAgICAgIEtPOiAwLFxuICAgICAgICAgICAgT0s6IDFcbiAgICAgICAgfSxcbiAgICAgICAgT05fRFJBR1RPQk9YX1NUQVJUOiBcImRyYWd0b2JveDpzdGFydFwiLFxuICAgICAgICBPTl9EUkFHVE9CT1hfT1ZFUjogJ2RyYWd0b2JveDpvdmVyJyxcbiAgICAgICAgT05fRFJBR1RPQk9YX0NPTVBMRVRFRDogJ2RyYWd0b2JveDpjb21wbGV0ZWQnLFxuICAgICAgICBPTl9EUkFHVE9CT1hfT0s6ICdkcmFndG9ib3g6b2snLFxuICAgICAgICBDTEFTU19CT1g6ICdoei1kcmFndG9ib3hfX2JveCcsXG4gICAgICAgIENMQVNTX0JPWF9IT1ZFUjogJ2h6LWRyYWd0b2JveF9fYm94LS1ob3ZlcicsXG4gICAgICAgIENMQVNTX0VMRU1FTlQ6ICdoei1kcmFndG9ib3hfX2VsZW1lbnQnLFxuICAgICAgICBDTEFTU19FTEVNRU5UUzogJ2h6LWRyYWd0b2JveF9fZWxlbWVudHMnLFxuICAgICAgICBDTEFTU19FTEVNRU5UX1BMQUNFRDogJ2h6LWRyYWd0b2JveF9fZWxlbWVudC0tcGxhY2VkJyxcbiAgICAgICAgQ0xBU1NfRUxFTUVOVF9TVEFURV9PSzogJ2h6LWRyYWd0b2JveF9fZWxlbWVudC0tb2snLFxuICAgICAgICBDTEFTU19FTEVNRU5UX1NUQVRFX0tPOiAnaHotZHJhZ3RvYm94X19lbGVtZW50LS1rbycsXG4gICAgICAgIENMQVNTX09SSUdJTjogXCJoei1kcmFndG9ib3hfX29yaWdpblwiLFxuICAgICAgICBRVUVSWV9CT1g6ICcuaHotZHJhZ3RvYm94X19ib3gnLFxuICAgICAgICBRVUVSWV9FTEVNRU5UOiAnLmh6LWRyYWd0b2JveF9fZWxlbWVudCcsXG4gICAgICAgIFFVRVJZX0VMRU1FTlRTOiAnLmh6LWRyYWd0b2JveF9fZWxlbWVudHMnLFxuICAgICAgICBRVUVSWV9FTEVNRU5UX1NUQVRFX0tPOiAnLmh6LWRyYWd0b2JveF9fZWxlbWVudC0ta28nLFxuICAgICAgICBRVUVSWV9FTEVNRU5UX1NUQVRFX09LOiAnLmh6LWRyYWd0b2JveF9fZWxlbWVudC0tb2snLFxuICAgICAgICBRVUVSWV9FTEVNRU5UX1BMQUNFRDogJy5oei1kcmFndG9ib3hfX2VsZW1lbnQtLXBsYWNlZCcsXG4gICAgICAgIFFVRVJZX09SSUdJTjogXCIuaHotZHJhZ3RvYm94X19vcmlnaW5cIixcbiAgICAgICAgLy8gRGVmYXVsdCBvcHRpb25zXG4gICAgICAgIG9wdGlvbnM6IHtcbiAgICAgICAgICAgIG9yaWdpbjogXCIuaHotZHJhZ3RvYm94X19vcmlnaW5cIixcbiAgICAgICAgICAgIGJveGVzOiBcIi5oei1kcmFndG9ib3hfX2JveFwiLFxuICAgICAgICAgICAgZWxlbWVudHM6IFwiLmh6LWRyYWd0b2JveF9fZWxlbWVudFwiLFxuICAgICAgICAgICAgYWxsb3dEcm9wSW5JbnZhbGlkOiB0cnVlLFxuICAgICAgICAgICAgbWlycm9yQ29udGFpbmVyOiBkb2N1bWVudC5ib2R5XG4gICAgICAgIH0sXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAbWVtYmVyb2YgZHJhZ3RvYm94XG4gICAgICAgICAqIEZ1bmNpw7NuIGRlIGNyZWFjacOzbiBkZWwgd2lkZ2V0XG4gICAgICAgICAqIEBmdW5jdGlvblxuICAgICAgICAgKi9cbiAgICAgICAgX2NyZWF0ZTogZnVuY3Rpb24gKCkge1xuICAgICAgICB9LFxuICAgICAgICAvKipcbiAgICAgICAgICogSW5pY2lhIGVsIGNvbXBvbmVudGVcbiAgICAgICAgICovXG4gICAgICAgIF9pbml0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB0aGlzLl9jb3JyZWN0ID0gMDtcbiAgICAgICAgICAgIHRoaXMuX2JveGVzID0gW107XG4gICAgICAgICAgICB0aGlzLl9lbGVtZW50cyA9IFtdO1xuICAgICAgICAgICAgdGhpcy5fZ2V0RWxlbWVudHMoKTtcbiAgICAgICAgICAgIHRoaXMuX3BhcnNlSXRlbXMoKTtcbiAgICAgICAgICAgIHRoaXMuX3N0YXJ0KCk7XG4gICAgICAgIH0sXG4gICAgICAgIF9nZXRFbGVtZW50czogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdGhpcy5fJGJveGVzID0gdGhpcy5lbGVtZW50LmZpbmQodGhpcy5vcHRpb25zLmJveGVzKTtcbiAgICAgICAgICAgIGlmICh0aGlzLl8kYm94ZXMubGVuZ3RoIDwgMSkge1xuICAgICAgICAgICAgICAgIHRocm93ICdObyBzZSBoYSBlbmNvbnRyYWRvIG5pbmd1bm5hIGNhamEgZGUgZGVzdGluby4gTmVjZXNpdGFzIHVzYXIgbGEgY2xhc2UgJyArIHRoaXMuQ0xBU1NfQk9YO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5fJG9yaWdpbiA9IHRoaXMuZWxlbWVudC5maW5kKHRoaXMub3B0aW9ucy5vcmlnaW4pO1xuICAgICAgICAgICAgaWYgKHRoaXMuXyRvcmlnaW4ubGVuZ3RoIDwgMSkge1xuICAgICAgICAgICAgICAgIHRocm93ICdObyBzZSBoYSBlbmNvbnRyYWRvIG5pbmd1bm5hIGNhamEgZGUgb3JpZ2VuLiBOZWNlc2l0YXMgdXNhciBsYSBjbGFzZSAnICsgdGhpcy5DTEFTU19PUklHSU47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLl8kYm94ZXMuYWRkQ2xhc3ModGhpcy5DTEFTU19CT1gpO1xuICAgICAgICAgICAgdGhpcy5fJG9yaWdpbi5hZGRDbGFzcyh0aGlzLkNMQVNTX09SSUdJTik7XG4gICAgICAgIH0sXG4gICAgICAgIF9wYXJzZUl0ZW1zOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgaWRFbGVtZW50ID0gMDtcbiAgICAgICAgICAgIC8vUmVjb3JyZW1vcyBsb3MgYm94XG4gICAgICAgICAgICBmb3IgKHZhciBib3hJbmRleCA9IDA7IGJveEluZGV4IDwgdGhpcy5fJGJveGVzLmxlbmd0aDsgYm94SW5kZXgrKykge1xuICAgICAgICAgICAgICAgIHZhciBjdXJyZW50Qm94ID0gJCh0aGlzLl8kYm94ZXNbYm94SW5kZXhdKTtcbiAgICAgICAgICAgICAgICB2YXIgX2VsZW1lbnRzID0gY3VycmVudEJveC5maW5kKHRoaXMub3B0aW9ucy5lbGVtZW50cyk7XG4gICAgICAgICAgICAgICAgdmFyIF9lbGVtZW50c0luQm94ID0gW107XG4gICAgICAgICAgICAgICAgZm9yICh2YXIgZWxlbWVudEluZGV4ID0gMDsgZWxlbWVudEluZGV4IDwgX2VsZW1lbnRzLmxlbmd0aDsgZWxlbWVudEluZGV4KyspIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGN1cnJlbnRFbGVtZW50ID0gJChfZWxlbWVudHNbZWxlbWVudEluZGV4XSlcbiAgICAgICAgICAgICAgICAgICAgICAgIC5kZXRhY2goKTtcbiAgICAgICAgICAgICAgICAgICAgdmFyIG5ld0VsZW1lbnQgPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAnaWRFbGVtZW50JzogaWRFbGVtZW50LFxuICAgICAgICAgICAgICAgICAgICAgICAgJ2lkQm94JzogYm94SW5kZXgsXG4gICAgICAgICAgICAgICAgICAgICAgICAnJGVsZW1lbnQnOiBjdXJyZW50RWxlbWVudCxcbiAgICAgICAgICAgICAgICAgICAgICAgICdpc0NvcnJlY3QnOiBudWxsXG4gICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX2VsZW1lbnRzLnB1c2gobmV3RWxlbWVudCk7XG4gICAgICAgICAgICAgICAgICAgIF9lbGVtZW50c0luQm94LnB1c2gobmV3RWxlbWVudCk7XG4gICAgICAgICAgICAgICAgICAgIGlkRWxlbWVudCsrO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB2YXIgbmV3Qm94ID0ge1xuICAgICAgICAgICAgICAgICAgICAnaWRCb3gnOiBib3hJbmRleCxcbiAgICAgICAgICAgICAgICAgICAgJyRib3gnOiBjdXJyZW50Qm94LFxuICAgICAgICAgICAgICAgICAgICAnZWxlbWVudHMnOiBfZWxlbWVudHNJbkJveCxcbiAgICAgICAgICAgICAgICAgICAgJyRlbGVtZW50cyc6IF9lbGVtZW50c1xuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgdGhpcy5fYm94ZXMucHVzaChuZXdCb3gpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICBfZ2V0RWxlbWVudHNPZjogZnVuY3Rpb24gKGl0ZW1zKSB7XG4gICAgICAgICAgICBpZiAoaXRlbXMgPT09IHZvaWQgMCkgeyBpdGVtcyA9IFtdOyB9XG4gICAgICAgICAgICB2YXIgcmVzdWx0ID0gW107XG4gICAgICAgICAgICBmb3IgKHZhciBpdGVtSW5kZXggPSAwLCBpdGVtc0xlbmd0aCA9IGl0ZW1zLmxlbmd0aDsgaXRlbUluZGV4IDwgaXRlbXNMZW5ndGg7IGl0ZW1JbmRleCsrKSB7XG4gICAgICAgICAgICAgICAgdmFyIGN1cnJlbnRJdGVtID0gaXRlbXNbaXRlbUluZGV4XTtcbiAgICAgICAgICAgICAgICByZXN1bHQucHVzaChjdXJyZW50SXRlbS4kZWxlbWVudCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gJC5tYWtlQXJyYXkocmVzdWx0KTtcbiAgICAgICAgfSxcbiAgICAgICAgX3N0YXJ0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB0aGlzLl8kb3JpZ2luLmFwcGVuZCh0aGlzLl9nZXRFbGVtZW50c09mKHRoaXMuX3NodWZmbGVBcnJheSh0aGlzLl9lbGVtZW50cykpKTtcbiAgICAgICAgICAgIHRoaXMuX2RyYWd1bGFJbnN0YW5jZSA9IGRyYWd1bGEodGhpcy5fJG9yaWdpbi50b0FycmF5KClcbiAgICAgICAgICAgICAgICAuY29uY2F0KHRoaXMuXyRib3hlcy50b0FycmF5KCkpLCB7XG4gICAgICAgICAgICAgICAgaXNDb250YWluZXI6IHRoaXMuX2lzQ29udGFpbmVyLmJpbmQodGhpcyksXG4gICAgICAgICAgICAgICAgbW92ZXM6IHRoaXMuX21vdmVzLmJpbmQodGhpcyksXG4gICAgICAgICAgICAgICAgYWNjZXB0czogdGhpcy5fYWNjZXB0cy5iaW5kKHRoaXMpLFxuICAgICAgICAgICAgICAgIGludmFsaWQ6IHRoaXMuX2ludmFsaWQuYmluZCh0aGlzKSxcbiAgICAgICAgICAgICAgICByZXZlcnRPblNwaWxsOiB0cnVlLFxuICAgICAgICAgICAgICAgIG1pcnJvckNvbnRhaW5lcjogdGhpcy5vcHRpb25zLm1pcnJvckNvbnRhaW5lcixcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgdGhpcy5fYXNzaWduRXZlbnRzKCk7XG4gICAgICAgIH0sXG4gICAgICAgIF9pc0NvbnRhaW5lcjogZnVuY3Rpb24gKGVsKSB7XG4gICAgICAgICAgICByZXR1cm4gJChlbClcbiAgICAgICAgICAgICAgICAuaGFzQ2xhc3ModGhpcy5DTEFTU19CT1gpO1xuICAgICAgICB9LFxuICAgICAgICBfbW92ZXM6IGZ1bmN0aW9uIChlbCwgc291cmNlLCBoYW5kbGUsIHNpYmxpbmcpIHtcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9LFxuICAgICAgICBfYWNjZXB0czogZnVuY3Rpb24gKGVsLCB0YXJnZXQsIHNvdXJjZSwgc2libGluZykge1xuICAgICAgICAgICAgdmFyIGFsbG93ID0gZmFsc2U7XG4gICAgICAgICAgICBpZiAoIXRoaXMuXyRvcmlnaW4uaXModGFyZ2V0KSkge1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLm9wdGlvbnMuYWxsb3dEcm9wSW5JbnZhbGlkICE9IHRydWUpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGJveGVzID0gdGhpcy5fYm94ZXM7XG4gICAgICAgICAgICAgICAgICAgIC8vcG9yIGNhZGEgY2FqYVxuICAgICAgICAgICAgICAgICAgICBhbGxvdyA9IHRoaXMuX3ZhbGlkYXRlKGVsLCB0YXJnZXQpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgYWxsb3cgPSB0cnVlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBhbGxvdztcbiAgICAgICAgfSxcbiAgICAgICAgX2ludmFsaWQ6IGZ1bmN0aW9uIChlbCwgaGFuZGxlKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5vcHRpb25zLmRpc2FibGVkIHx8ICEkKGVsKVxuICAgICAgICAgICAgICAgIC5oYXNDbGFzcyh0aGlzLkNMQVNTX0VMRU1FTlQpO1xuICAgICAgICB9LFxuICAgICAgICBfYXNzaWduRXZlbnRzOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB0aGlzLl9kcmFndWxhSW5zdGFuY2Uub24oXCJkcm9wXCIsIHRoaXMuX29uRHJvcC5iaW5kKHRoaXMpKTtcbiAgICAgICAgfSxcbiAgICAgICAgX29uRHJvcDogZnVuY3Rpb24gKGVsLCB0YXJnZXQsIHNvdXJjZSwgc2libGluZykge1xuICAgICAgICAgICAgdmFyIGlzQ29ycmVjdCA9IHRoaXMuX3ZhbGlkYXRlKGVsLCB0YXJnZXQpLCAkZWwgPSAkKGVsKSwgZWxlbWVudCA9IHRoaXMuX2VsZW1lbnRzW3RoaXMuX2dldEVsZW1lbnRJbmRleEZvcigkZWwpXTtcbiAgICAgICAgICAgIGlmIChpc0NvcnJlY3QpIHtcbiAgICAgICAgICAgICAgICAkZWwucmVtb3ZlQ2xhc3ModGhpcy5DTEFTU19FTEVNRU5UX1NUQVRFX0tPKTtcbiAgICAgICAgICAgICAgICAkZWwuYWRkQ2xhc3ModGhpcy5DTEFTU19FTEVNRU5UX1NUQVRFX09LKTtcbiAgICAgICAgICAgICAgICBpZiAoZWxlbWVudC5pc0NvcnJlY3QgIT0gdHJ1ZSkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLl9jb3JyZWN0Kys7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgJGVsLnJlbW92ZUNsYXNzKHRoaXMuQ0xBU1NfRUxFTUVOVF9TVEFURV9PSyk7XG4gICAgICAgICAgICAgICAgJGVsLmFkZENsYXNzKHRoaXMuQ0xBU1NfRUxFTUVOVF9TVEFURV9LTyk7XG4gICAgICAgICAgICAgICAgaWYgKGVsZW1lbnQuaXNDb3JyZWN0ID09IHRydWUpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fY29ycmVjdC0tO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsZW1lbnQuaXNDb3JyZWN0ID0gaXNDb3JyZWN0O1xuICAgICAgICAgICAgaWYgKHRoaXMuX2NvcnJlY3QgPT0gdGhpcy5fZWxlbWVudHMubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fZW5kKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIF9lbmQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHRoaXMuZWxlbWVudC50cmlnZ2VyKHRoaXMuT05fRFJBR1RPQk9YX0NPTVBMRVRFRCk7XG4gICAgICAgIH0sXG4gICAgICAgIF9nZXRCb3hJbmRleEZvcjogZnVuY3Rpb24gKCRib3gpIHtcbiAgICAgICAgICAgIHZhciBib3hlcyA9IHRoaXMuX2JveGVzLCByZXN1bHQgPSAtMTtcbiAgICAgICAgICAgIGZvciAodmFyIGJveEluZGV4ID0gMCwgYm94ZXNMZW5ndGggPSBib3hlcy5sZW5ndGg7IGJveEluZGV4IDwgYm94ZXNMZW5ndGg7IGJveEluZGV4KyspIHtcbiAgICAgICAgICAgICAgICB2YXIgY3VycmVudEJveCA9IGJveGVzW2JveEluZGV4XTtcbiAgICAgICAgICAgICAgICBpZiAoY3VycmVudEJveC4kYm94LmlzKCRib3gpKSB7XG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdCA9IGJveEluZGV4O1xuICAgICAgICAgICAgICAgICAgICBib3hJbmRleCA9IGJveGVzTGVuZ3RoO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICAgIH0sXG4gICAgICAgIF9nZXRFbGVtZW50SW5kZXhGb3I6IGZ1bmN0aW9uICgkZWxlbWVudCwgYm94KSB7XG4gICAgICAgICAgICB2YXIgcmVzdWx0ID0gLTE7XG4gICAgICAgICAgICBpZiAoYm94KSB7XG4gICAgICAgICAgICAgICAgcmVzdWx0ID0gYm94LiRlbGVtZW50cy5pbmRleCgkZWxlbWVudCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICB2YXIgZWxlbWVudHMgPSB0aGlzLl9lbGVtZW50cztcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBlbGVtZW50SW5kZXggPSAwLCBlbGVtZW50c0xlbmd0aCA9IGVsZW1lbnRzLmxlbmd0aDsgZWxlbWVudEluZGV4IDwgZWxlbWVudHNMZW5ndGg7IGVsZW1lbnRJbmRleCsrKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBjdXJyZW50RWxlbWVudCA9IGVsZW1lbnRzW2VsZW1lbnRJbmRleF07XG4gICAgICAgICAgICAgICAgICAgIGlmICgkZWxlbWVudC5pcyhjdXJyZW50RWxlbWVudC4kZWxlbWVudCkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc3VsdCA9IGVsZW1lbnRJbmRleDtcbiAgICAgICAgICAgICAgICAgICAgICAgIGVsZW1lbnRJbmRleCA9IGVsZW1lbnRzTGVuZ3RoO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgICAgfSxcbiAgICAgICAgX3ZhbGlkYXRlOiBmdW5jdGlvbiAoZWwsIGJveCkge1xuICAgICAgICAgICAgdmFyIGJveEluZGV4ID0gdGhpcy5fZ2V0Qm94SW5kZXhGb3IoJChib3gpKSwgcmVzdWx0ID0gZmFsc2U7XG4gICAgICAgICAgICBpZiAoYm94SW5kZXggIT0gLTEpIHtcbiAgICAgICAgICAgICAgICB2YXIgYm94XzEgPSB0aGlzLl9ib3hlc1tib3hJbmRleF0sIGVsZW1JbmRleCA9IHRoaXMuX2dldEVsZW1lbnRJbmRleEZvcigkKGVsKSwgYm94XzEpO1xuICAgICAgICAgICAgICAgIHJlc3VsdCA9IGVsZW1JbmRleCAhPSAtMTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICAgIH0sXG4gICAgICAgIGlzRGlzYWJsZWQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLm9wdGlvbnMuZGlzYWJsZWQ7XG4gICAgICAgIH0sXG4gICAgICAgIGRlc3Ryb3k6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLl9kcmFndWxhSW5zdGFuY2UpIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9kcmFndWxhSW5zdGFuY2UuZGVzdHJveSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5fc3VwZXIoKTtcbiAgICAgICAgfSxcbiAgICAgICAgLypcbiAgICAgICAgICogIERldnVlbHZlIHVuIG9yZGVuIGFsZWF0b3JpbyBkZWwgYXJyYXkgcXVlIHNlIGxlIHBhc2FcbiAgICAgICAgICogIEBwYXJhbXMgYXJyYXlcbiAgICAgICAgICovXG4gICAgICAgIF9zaHVmZmxlQXJyYXk6IGZ1bmN0aW9uIChhcnJheSkge1xuICAgICAgICAgICAgZm9yICh2YXIgcG9zaXRpb25JbmRleCA9IGFycmF5Lmxlbmd0aCAtIDE7IHBvc2l0aW9uSW5kZXggPiAwOyBwb3NpdGlvbkluZGV4LS0pIHtcbiAgICAgICAgICAgICAgICB2YXIgaiA9IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIChwb3NpdGlvbkluZGV4ICsgMSkpO1xuICAgICAgICAgICAgICAgIHZhciB0ZW1wID0gYXJyYXlbcG9zaXRpb25JbmRleF07XG4gICAgICAgICAgICAgICAgYXJyYXlbcG9zaXRpb25JbmRleF0gPSBhcnJheVtqXTtcbiAgICAgICAgICAgICAgICBhcnJheVtqXSA9IHRlbXA7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gYXJyYXk7XG4gICAgICAgIH1cbiAgICB9KTtcbn0pKTtcbiJdLCJmaWxlIjoianFEcmFndG9ib3guanMifQ==
