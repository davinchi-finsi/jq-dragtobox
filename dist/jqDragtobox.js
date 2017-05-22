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
                var currentElement = $(_elements[elementIndex]).detach();
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
        this._dragulaInstance = dragula(this._$origin.toArray().concat(this._$boxes.toArray()), {
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
        return $(el).hasClass(this.CLASS_BOX);
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
        return this.options.disabled || !$(el).hasClass(this.CLASS_ELEMENT);
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

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJqcURyYWd0b2JveC5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBjbGFzcyBkcmFndG9ib3hcbiAqL1xuJC53aWRnZXQoXCJoei5kcmFndG9ib3hcIiwge1xuICAgIC8qKlxuICAgICAqIEBtZW1iZXJvZiBkcmFndG9ib3hcbiAgICAgKi9cbiAgICBOQU1FU1BBQ0U6IFwiZHJhZ3RvYm94XCIsXG4gICAgRUxFTUVOVF9TVEFURToge1xuICAgICAgICBLTzogMCxcbiAgICAgICAgT0s6IDFcbiAgICB9LFxuICAgIE9OX0RSQUdUT0JPWF9TVEFSVDogXCJkcmFndG9ib3g6c3RhcnRcIixcbiAgICBPTl9EUkFHVE9CT1hfT1ZFUjogJ2RyYWd0b2JveDpvdmVyJyxcbiAgICBPTl9EUkFHVE9CT1hfQ09NUExFVEVEOiAnZHJhZ3RvYm94OmNvbXBsZXRlZCcsXG4gICAgT05fRFJBR1RPQk9YX09LOiAnZHJhZ3RvYm94Om9rJyxcbiAgICBDTEFTU19CT1g6ICdoei1kcmFndG9ib3hfX2JveCcsXG4gICAgQ0xBU1NfQk9YX0hPVkVSOiAnaHotZHJhZ3RvYm94X19ib3gtLWhvdmVyJyxcbiAgICBDTEFTU19FTEVNRU5UOiAnaHotZHJhZ3RvYm94X19lbGVtZW50JyxcbiAgICBDTEFTU19FTEVNRU5UUzogJ2h6LWRyYWd0b2JveF9fZWxlbWVudHMnLFxuICAgIENMQVNTX0VMRU1FTlRfUExBQ0VEOiAnaHotZHJhZ3RvYm94X19lbGVtZW50LS1wbGFjZWQnLFxuICAgIENMQVNTX0VMRU1FTlRfU1RBVEVfT0s6ICdoei1kcmFndG9ib3hfX2VsZW1lbnQtLW9rJyxcbiAgICBDTEFTU19FTEVNRU5UX1NUQVRFX0tPOiAnaHotZHJhZ3RvYm94X19lbGVtZW50LS1rbycsXG4gICAgQ0xBU1NfT1JJR0lOOiBcImh6LWRyYWd0b2JveF9fb3JpZ2luXCIsXG4gICAgUVVFUllfQk9YOiAnLmh6LWRyYWd0b2JveF9fYm94JyxcbiAgICBRVUVSWV9FTEVNRU5UOiAnLmh6LWRyYWd0b2JveF9fZWxlbWVudCcsXG4gICAgUVVFUllfRUxFTUVOVFM6ICcuaHotZHJhZ3RvYm94X19lbGVtZW50cycsXG4gICAgUVVFUllfRUxFTUVOVF9TVEFURV9LTzogJy5oei1kcmFndG9ib3hfX2VsZW1lbnQtLWtvJyxcbiAgICBRVUVSWV9FTEVNRU5UX1NUQVRFX09LOiAnLmh6LWRyYWd0b2JveF9fZWxlbWVudC0tb2snLFxuICAgIFFVRVJZX0VMRU1FTlRfUExBQ0VEOiAnLmh6LWRyYWd0b2JveF9fZWxlbWVudC0tcGxhY2VkJyxcbiAgICBRVUVSWV9PUklHSU46IFwiLmh6LWRyYWd0b2JveF9fb3JpZ2luXCIsXG4gICAgLy8gRGVmYXVsdCBvcHRpb25zXG4gICAgb3B0aW9uczoge1xuICAgICAgICBvcmlnaW46IFwiLmh6LWRyYWd0b2JveF9fb3JpZ2luXCIsXG4gICAgICAgIGJveGVzOiBcIi5oei1kcmFndG9ib3hfX2JveFwiLFxuICAgICAgICBlbGVtZW50czogXCIuaHotZHJhZ3RvYm94X19lbGVtZW50XCIsXG4gICAgICAgIGFsbG93RHJvcEluSW52YWxpZDogdHJ1ZSxcbiAgICAgICAgbWlycm9yQ29udGFpbmVyOiBkb2N1bWVudC5ib2R5XG4gICAgfSxcbiAgICAvKipcbiAgICAgKiBAbWVtYmVyb2YgZHJhZ3RvYm94XG4gICAgICogRnVuY2nDs24gZGUgY3JlYWNpw7NuIGRlbCB3aWRnZXRcbiAgICAgKiBAZnVuY3Rpb25cbiAgICAgKi9cbiAgICBfY3JlYXRlOiBmdW5jdGlvbiAoKSB7XG4gICAgfSxcbiAgICAvKipcbiAgICAgKiBJbmljaWEgZWwgY29tcG9uZW50ZVxuICAgICAqL1xuICAgIF9pbml0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHRoaXMuX2NvcnJlY3QgPSAwO1xuICAgICAgICB0aGlzLl9ib3hlcyA9IFtdO1xuICAgICAgICB0aGlzLl9lbGVtZW50cyA9IFtdO1xuICAgICAgICB0aGlzLl9nZXRFbGVtZW50cygpO1xuICAgICAgICB0aGlzLl9wYXJzZUl0ZW1zKCk7XG4gICAgICAgIHRoaXMuX3N0YXJ0KCk7XG4gICAgfSxcbiAgICBfZ2V0RWxlbWVudHM6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdGhpcy5fJGJveGVzID0gdGhpcy5lbGVtZW50LmZpbmQodGhpcy5vcHRpb25zLmJveGVzKTtcbiAgICAgICAgaWYgKHRoaXMuXyRib3hlcy5sZW5ndGggPCAxKSB7XG4gICAgICAgICAgICB0aHJvdyAnTm8gc2UgaGEgZW5jb250cmFkbyBuaW5ndW5uYSBjYWphIGRlIGRlc3Rpbm8uIE5lY2VzaXRhcyB1c2FyIGxhIGNsYXNlICcgKyB0aGlzLkNMQVNTX0JPWDtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLl8kb3JpZ2luID0gdGhpcy5lbGVtZW50LmZpbmQodGhpcy5vcHRpb25zLm9yaWdpbik7XG4gICAgICAgIGlmICh0aGlzLl8kb3JpZ2luLmxlbmd0aCA8IDEpIHtcbiAgICAgICAgICAgIHRocm93ICdObyBzZSBoYSBlbmNvbnRyYWRvIG5pbmd1bm5hIGNhamEgZGUgb3JpZ2VuLiBOZWNlc2l0YXMgdXNhciBsYSBjbGFzZSAnICsgdGhpcy5DTEFTU19PUklHSU47XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5fJGJveGVzLmFkZENsYXNzKHRoaXMuQ0xBU1NfQk9YKTtcbiAgICAgICAgdGhpcy5fJG9yaWdpbi5hZGRDbGFzcyh0aGlzLkNMQVNTX09SSUdJTik7XG4gICAgfSxcbiAgICBfcGFyc2VJdGVtczogZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgaWRFbGVtZW50ID0gMDtcbiAgICAgICAgLy9SZWNvcnJlbW9zIGxvcyBib3hcbiAgICAgICAgZm9yICh2YXIgYm94SW5kZXggPSAwOyBib3hJbmRleCA8IHRoaXMuXyRib3hlcy5sZW5ndGg7IGJveEluZGV4KyspIHtcbiAgICAgICAgICAgIHZhciBjdXJyZW50Qm94ID0gJCh0aGlzLl8kYm94ZXNbYm94SW5kZXhdKTtcbiAgICAgICAgICAgIHZhciBfZWxlbWVudHMgPSBjdXJyZW50Qm94LmZpbmQodGhpcy5vcHRpb25zLmVsZW1lbnRzKTtcbiAgICAgICAgICAgIHZhciBfZWxlbWVudHNJbkJveCA9IFtdO1xuICAgICAgICAgICAgZm9yICh2YXIgZWxlbWVudEluZGV4ID0gMDsgZWxlbWVudEluZGV4IDwgX2VsZW1lbnRzLmxlbmd0aDsgZWxlbWVudEluZGV4KyspIHtcbiAgICAgICAgICAgICAgICB2YXIgY3VycmVudEVsZW1lbnQgPSAkKF9lbGVtZW50c1tlbGVtZW50SW5kZXhdKS5kZXRhY2goKTtcbiAgICAgICAgICAgICAgICB2YXIgbmV3RWxlbWVudCA9IHtcbiAgICAgICAgICAgICAgICAgICAgJ2lkRWxlbWVudCc6IGlkRWxlbWVudCxcbiAgICAgICAgICAgICAgICAgICAgJ2lkQm94JzogYm94SW5kZXgsXG4gICAgICAgICAgICAgICAgICAgICckZWxlbWVudCc6IGN1cnJlbnRFbGVtZW50LFxuICAgICAgICAgICAgICAgICAgICAnaXNDb3JyZWN0JzogbnVsbFxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgdGhpcy5fZWxlbWVudHMucHVzaChuZXdFbGVtZW50KTtcbiAgICAgICAgICAgICAgICBfZWxlbWVudHNJbkJveC5wdXNoKG5ld0VsZW1lbnQpO1xuICAgICAgICAgICAgICAgIGlkRWxlbWVudCsrO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdmFyIG5ld0JveCA9IHtcbiAgICAgICAgICAgICAgICAnaWRCb3gnOiBib3hJbmRleCxcbiAgICAgICAgICAgICAgICAnJGJveCc6IGN1cnJlbnRCb3gsXG4gICAgICAgICAgICAgICAgJ2VsZW1lbnRzJzogX2VsZW1lbnRzSW5Cb3gsXG4gICAgICAgICAgICAgICAgJyRlbGVtZW50cyc6IF9lbGVtZW50c1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIHRoaXMuX2JveGVzLnB1c2gobmV3Qm94KTtcbiAgICAgICAgfVxuICAgIH0sXG4gICAgX2dldEVsZW1lbnRzT2Y6IGZ1bmN0aW9uIChpdGVtcykge1xuICAgICAgICBpZiAoaXRlbXMgPT09IHZvaWQgMCkgeyBpdGVtcyA9IFtdOyB9XG4gICAgICAgIHZhciByZXN1bHQgPSBbXTtcbiAgICAgICAgZm9yICh2YXIgaXRlbUluZGV4ID0gMCwgaXRlbXNMZW5ndGggPSBpdGVtcy5sZW5ndGg7IGl0ZW1JbmRleCA8IGl0ZW1zTGVuZ3RoOyBpdGVtSW5kZXgrKykge1xuICAgICAgICAgICAgdmFyIGN1cnJlbnRJdGVtID0gaXRlbXNbaXRlbUluZGV4XTtcbiAgICAgICAgICAgIHJlc3VsdC5wdXNoKGN1cnJlbnRJdGVtLiRlbGVtZW50KTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gJC5tYWtlQXJyYXkocmVzdWx0KTtcbiAgICB9LFxuICAgIF9zdGFydDogZnVuY3Rpb24gKCkge1xuICAgICAgICB0aGlzLl8kb3JpZ2luLmFwcGVuZCh0aGlzLl9nZXRFbGVtZW50c09mKHRoaXMuX3NodWZmbGVBcnJheSh0aGlzLl9lbGVtZW50cykpKTtcbiAgICAgICAgdGhpcy5fZHJhZ3VsYUluc3RhbmNlID0gZHJhZ3VsYSh0aGlzLl8kb3JpZ2luLnRvQXJyYXkoKS5jb25jYXQodGhpcy5fJGJveGVzLnRvQXJyYXkoKSksIHtcbiAgICAgICAgICAgIGlzQ29udGFpbmVyOiB0aGlzLl9pc0NvbnRhaW5lci5iaW5kKHRoaXMpLFxuICAgICAgICAgICAgbW92ZXM6IHRoaXMuX21vdmVzLmJpbmQodGhpcyksXG4gICAgICAgICAgICBhY2NlcHRzOiB0aGlzLl9hY2NlcHRzLmJpbmQodGhpcyksXG4gICAgICAgICAgICBpbnZhbGlkOiB0aGlzLl9pbnZhbGlkLmJpbmQodGhpcyksXG4gICAgICAgICAgICByZXZlcnRPblNwaWxsOiB0cnVlLFxuICAgICAgICAgICAgbWlycm9yQ29udGFpbmVyOiB0aGlzLm9wdGlvbnMubWlycm9yQ29udGFpbmVyLFxuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy5fYXNzaWduRXZlbnRzKCk7XG4gICAgfSxcbiAgICBfaXNDb250YWluZXI6IGZ1bmN0aW9uIChlbCkge1xuICAgICAgICByZXR1cm4gJChlbCkuaGFzQ2xhc3ModGhpcy5DTEFTU19CT1gpO1xuICAgIH0sXG4gICAgX21vdmVzOiBmdW5jdGlvbiAoZWwsIHNvdXJjZSwgaGFuZGxlLCBzaWJsaW5nKSB7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH0sXG4gICAgX2FjY2VwdHM6IGZ1bmN0aW9uIChlbCwgdGFyZ2V0LCBzb3VyY2UsIHNpYmxpbmcpIHtcbiAgICAgICAgdmFyIGFsbG93ID0gZmFsc2U7XG4gICAgICAgIGlmICghdGhpcy5fJG9yaWdpbi5pcyh0YXJnZXQpKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5vcHRpb25zLmFsbG93RHJvcEluSW52YWxpZCAhPSB0cnVlKSB7XG4gICAgICAgICAgICAgICAgdmFyIGJveGVzID0gdGhpcy5fYm94ZXM7XG4gICAgICAgICAgICAgICAgLy9wb3IgY2FkYSBjYWphXG4gICAgICAgICAgICAgICAgYWxsb3cgPSB0aGlzLl92YWxpZGF0ZShlbCwgdGFyZ2V0KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIGFsbG93ID0gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gYWxsb3c7XG4gICAgfSxcbiAgICBfaW52YWxpZDogZnVuY3Rpb24gKGVsLCBoYW5kbGUpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMub3B0aW9ucy5kaXNhYmxlZCB8fCAhJChlbCkuaGFzQ2xhc3ModGhpcy5DTEFTU19FTEVNRU5UKTtcbiAgICB9LFxuICAgIF9hc3NpZ25FdmVudHM6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdGhpcy5fZHJhZ3VsYUluc3RhbmNlLm9uKFwiZHJvcFwiLCB0aGlzLl9vbkRyb3AuYmluZCh0aGlzKSk7XG4gICAgfSxcbiAgICBfb25Ecm9wOiBmdW5jdGlvbiAoZWwsIHRhcmdldCwgc291cmNlLCBzaWJsaW5nKSB7XG4gICAgICAgIHZhciBpc0NvcnJlY3QgPSB0aGlzLl92YWxpZGF0ZShlbCwgdGFyZ2V0KSwgJGVsID0gJChlbCksIGVsZW1lbnQgPSB0aGlzLl9lbGVtZW50c1t0aGlzLl9nZXRFbGVtZW50SW5kZXhGb3IoJGVsKV07XG4gICAgICAgIGlmIChpc0NvcnJlY3QpIHtcbiAgICAgICAgICAgICRlbC5yZW1vdmVDbGFzcyh0aGlzLkNMQVNTX0VMRU1FTlRfU1RBVEVfS08pO1xuICAgICAgICAgICAgJGVsLmFkZENsYXNzKHRoaXMuQ0xBU1NfRUxFTUVOVF9TVEFURV9PSyk7XG4gICAgICAgICAgICBpZiAoZWxlbWVudC5pc0NvcnJlY3QgIT0gdHJ1ZSkge1xuICAgICAgICAgICAgICAgIHRoaXMuX2NvcnJlY3QrKztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICRlbC5yZW1vdmVDbGFzcyh0aGlzLkNMQVNTX0VMRU1FTlRfU1RBVEVfT0spO1xuICAgICAgICAgICAgJGVsLmFkZENsYXNzKHRoaXMuQ0xBU1NfRUxFTUVOVF9TVEFURV9LTyk7XG4gICAgICAgICAgICBpZiAoZWxlbWVudC5pc0NvcnJlY3QgPT0gdHJ1ZSkge1xuICAgICAgICAgICAgICAgIHRoaXMuX2NvcnJlY3QtLTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBlbGVtZW50LmlzQ29ycmVjdCA9IGlzQ29ycmVjdDtcbiAgICAgICAgaWYgKHRoaXMuX2NvcnJlY3QgPT0gdGhpcy5fZWxlbWVudHMubGVuZ3RoKSB7XG4gICAgICAgICAgICB0aGlzLl9lbmQoKTtcbiAgICAgICAgfVxuICAgIH0sXG4gICAgX2VuZDogZnVuY3Rpb24gKCkge1xuICAgICAgICB0aGlzLmVsZW1lbnQudHJpZ2dlcih0aGlzLk9OX0RSQUdUT0JPWF9DT01QTEVURUQpO1xuICAgIH0sXG4gICAgX2dldEJveEluZGV4Rm9yOiBmdW5jdGlvbiAoJGJveCkge1xuICAgICAgICB2YXIgYm94ZXMgPSB0aGlzLl9ib3hlcywgcmVzdWx0ID0gLTE7XG4gICAgICAgIGZvciAodmFyIGJveEluZGV4ID0gMCwgYm94ZXNMZW5ndGggPSBib3hlcy5sZW5ndGg7IGJveEluZGV4IDwgYm94ZXNMZW5ndGg7IGJveEluZGV4KyspIHtcbiAgICAgICAgICAgIHZhciBjdXJyZW50Qm94ID0gYm94ZXNbYm94SW5kZXhdO1xuICAgICAgICAgICAgaWYgKGN1cnJlbnRCb3guJGJveC5pcygkYm94KSkge1xuICAgICAgICAgICAgICAgIHJlc3VsdCA9IGJveEluZGV4O1xuICAgICAgICAgICAgICAgIGJveEluZGV4ID0gYm94ZXNMZW5ndGg7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9LFxuICAgIF9nZXRFbGVtZW50SW5kZXhGb3I6IGZ1bmN0aW9uICgkZWxlbWVudCwgYm94KSB7XG4gICAgICAgIHZhciByZXN1bHQgPSAtMTtcbiAgICAgICAgaWYgKGJveCkge1xuICAgICAgICAgICAgcmVzdWx0ID0gYm94LiRlbGVtZW50cy5pbmRleCgkZWxlbWVudCk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICB2YXIgZWxlbWVudHMgPSB0aGlzLl9lbGVtZW50cztcbiAgICAgICAgICAgIGZvciAodmFyIGVsZW1lbnRJbmRleCA9IDAsIGVsZW1lbnRzTGVuZ3RoID0gZWxlbWVudHMubGVuZ3RoOyBlbGVtZW50SW5kZXggPCBlbGVtZW50c0xlbmd0aDsgZWxlbWVudEluZGV4KyspIHtcbiAgICAgICAgICAgICAgICB2YXIgY3VycmVudEVsZW1lbnQgPSBlbGVtZW50c1tlbGVtZW50SW5kZXhdO1xuICAgICAgICAgICAgICAgIGlmICgkZWxlbWVudC5pcyhjdXJyZW50RWxlbWVudC4kZWxlbWVudCkpIHtcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0ID0gZWxlbWVudEluZGV4O1xuICAgICAgICAgICAgICAgICAgICBlbGVtZW50SW5kZXggPSBlbGVtZW50c0xlbmd0aDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9LFxuICAgIF92YWxpZGF0ZTogZnVuY3Rpb24gKGVsLCBib3gpIHtcbiAgICAgICAgdmFyIGJveEluZGV4ID0gdGhpcy5fZ2V0Qm94SW5kZXhGb3IoJChib3gpKSwgcmVzdWx0ID0gZmFsc2U7XG4gICAgICAgIGlmIChib3hJbmRleCAhPSAtMSkge1xuICAgICAgICAgICAgdmFyIGJveF8xID0gdGhpcy5fYm94ZXNbYm94SW5kZXhdLCBlbGVtSW5kZXggPSB0aGlzLl9nZXRFbGVtZW50SW5kZXhGb3IoJChlbCksIGJveF8xKTtcbiAgICAgICAgICAgIHJlc3VsdCA9IGVsZW1JbmRleCAhPSAtMTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH0sXG4gICAgaXNEaXNhYmxlZDogZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5vcHRpb25zLmRpc2FibGVkO1xuICAgIH0sXG4gICAgZGVzdHJveTogZnVuY3Rpb24gKCkge1xuICAgICAgICBpZiAodGhpcy5fZHJhZ3VsYUluc3RhbmNlKSB7XG4gICAgICAgICAgICB0aGlzLl9kcmFndWxhSW5zdGFuY2UuZGVzdHJveSgpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuX3N1cGVyKCk7XG4gICAgfSxcbiAgICAvKlxuICAgICAqICBEZXZ1ZWx2ZSB1biBvcmRlbiBhbGVhdG9yaW8gZGVsIGFycmF5IHF1ZSBzZSBsZSBwYXNhXG4gICAgICogIEBwYXJhbXMgYXJyYXlcbiAgICAgKi9cbiAgICBfc2h1ZmZsZUFycmF5OiBmdW5jdGlvbiAoYXJyYXkpIHtcbiAgICAgICAgZm9yICh2YXIgcG9zaXRpb25JbmRleCA9IGFycmF5Lmxlbmd0aCAtIDE7IHBvc2l0aW9uSW5kZXggPiAwOyBwb3NpdGlvbkluZGV4LS0pIHtcbiAgICAgICAgICAgIHZhciBqID0gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogKHBvc2l0aW9uSW5kZXggKyAxKSk7XG4gICAgICAgICAgICB2YXIgdGVtcCA9IGFycmF5W3Bvc2l0aW9uSW5kZXhdO1xuICAgICAgICAgICAgYXJyYXlbcG9zaXRpb25JbmRleF0gPSBhcnJheVtqXTtcbiAgICAgICAgICAgIGFycmF5W2pdID0gdGVtcDtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gYXJyYXk7XG4gICAgfVxufSk7XG4iXSwiZmlsZSI6ImpxRHJhZ3RvYm94LmpzIn0=
