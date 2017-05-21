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
    //CLASS_GAP_DESTINY: 'hz-dragtobox__gap--destiny',
    //CLASS_GAP_EMPTY: 'hz-dragtobox__gap--empty',
    //CLASS_GAP_ORIGIN: 'hz-fill-gaps-gaps_origin',
    //CLASS_GAP_HOVER_DESTINY:'hover_destiny',
    //CLASS_ELEMENT_PLACED:'hz-dragtobox__gap--filled',
    //CLASS_GAP_STATE_OK:'hz-dragtobox__gap--ok',
    //CLASS_ELEMENT_STATE_KO:'hz-dragtobox__gap--ko',
    QUERY_BOX: '.hz-dragtobox__box',
    QUERY_ELEMENT: '.hz_dragtobox__element',
    QUERY_ELEMENTS: '.hz_dragtobox__elements',
    QUERY_ELEMENT_STATE_KO: '.hz-dragtobox__element--ko',
    QUERY_ELEMENT_STATE_OK: '.hz-dragtobox__element--ok',
    QUERY_ELEMENT_PLACED: 'hz-dragtobox__element--placed',
    //QUERY_GAP_ORIGIN: '.hz-fill-gaps-gap_origin',
    //QUERY_BOX: '.hz-dragtobox__gap--destiny',
    //QUERY_ELEMENT:'.hz-dragtobox__word',
    //QUERY_ELEMENTS:'.hz-dragtobox__words',
    //QUERY_GAP_FILLED:'.hz-dragtobox__gap--filled',
    //QUERY_GAP_STATE_OK:'.hz-dragtobox__gap--ok',
    //QUERY_GAP_STATE_KO:'.hz-dragtobox__gap--ko',
    //
    ATTR_BOX_TITLE: 'data-hz-dragtobox__box--title',
    ATTR_BOX_IMAGE: 'data-hz-dragtobox__box--image',
    ATTR_BOX_ID: 'data-hz-dragtobox__box--id',
    ATTR_ELEMENT_ID: 'data-hz-dragtobox__element--id',
    //ATTR_GAP_WORD:'data-hz-dragtobox-word',
    //ATTR_GAP_DESTINY:'data-hz-dragtobox-gap-destiny',
    //ATTR_GAP_LENGTH: 'data-hz-dragtobox-gap-lenght',
    // Default options.
    options: {
        immediate_feedback: true,
        classes: {
            'hz-dragtobox': 'hz-dragtobox--default',
            'hz-dragtobox__box': 'hz-dragtobox__box'
        }
    },
    /**
     * @memberof dragtobox
     * FunciÃ³n de creaciÃ³n del widget
     * @function
     */
    _create: function () {
        //Var declaration globales
        this._boxes = [];
        this._elements = [];
        //
        this._buildHtml();
    },
    /**
     * Inicia el componente
     */
    _init: function () {
    },
    _buildHtml: function () {
        // obtenemos todos los box que hay
        var _boxes = this.element.find(this.QUERY_BOX);
        // Si no existe ningÃºn box lanzamos un error
        if (_boxes.length == 0) {
            throw 'No se ha encontrado ningunna caja. Necesitas usar la clase ' + this.QUERY_BOX;
        }
        else {
            var idElement = 0;
            //Recorremos los box
            for (var boxIndex = 0; boxIndex < _boxes.length; boxIndex++) {
                var currentBox = $(_boxes[boxIndex]);
                var boxTitle = currentBox.attr(this.ATTR_BOX_TITLE) || '';
                var boxImage = currentBox.attr(this.ATTR_BOX_IMAGE) || '';
                var _elements = currentBox.find(this.QUERY_ELEMENT);
                var _elementsInBox = [];
                currentBox
                    .addClass('ui-droppable')
                    .attr(this.ATTR_BOX_ID, boxIndex);
                for (var elementIndex = 0; elementIndex < _elements.length; elementIndex++) {
                    var currentElement = $(_elements[elementIndex]);
                    var newElement = {
                        'idElement': idElement,
                        'idBox': boxIndex,
                        'content': currentElement.text(),
                        '$element': currentElement
                    };
                    this._elements.push(newElement);
                    _elementsInBox.push(newElement);
                    idElement++;
                    currentElement.remove();
                }
                var newBox = {
                    'idBox': boxIndex,
                    'title': boxTitle,
                    'image': boxImage,
                    '$box': currentBox,
                    'elements': _elementsInBox
                };
                this._boxes.push(newBox);
            }
            this._drawBoxes();
        }
    },
    /*
     * Pintamos los elementos (palabras o imÃ¡genes) disponibles para colocar en los box
     */
    _drawBoxes: function () {
        // creamos el contenedor donde irÃ¡n ubicados los elementos
        var html = $('<div class="' + this.CLASS_ELEMENTS + '"></div>');
        var arrElements = this._shuffleArray(this._elements);
        // recorremos los elementos que tenemos almacenados
        for (var elementIndex = 0; elementIndex < arrElements.length; elementIndex++) {
            var currentElement = arrElements[elementIndex];
            var $element = $("<div class=\"" + this.CLASS_ELEMENT + " ui-draggable\" " + this.ATTR_ELEMENT_ID + "=\"" + currentElement.idElement + "\">" + currentElement.content + "</div>");
            $element.data("elementId", currentElement.idElement);
            currentElement.$element = $element;
            html.append($element);
        }
        // las aÃ±adimos al elemento principal
        this.element.prepend(html);
        this._createEvents();
    },
    _createEvents: function () {
        var that = this;
        //listener click en elementos fallidas
        //that.element.off('click.' + this.NAMESPACE)
        //    .on('click.' + this.NAMESPACE, this.QUERY_ELEMENT_STATE_KO, { instance: this, that:that }, this._onKoElementClick);
        // habilitamos que las elementos se puedan mover
        that.element.find('.hz-dragtobox__element')
            .draggable({
            //revert: "invalid",
            start: function (event, ui) {
                ui.helper.removeClass(that.CLASS_ELEMENT_STATE_OK).removeClass(that.CLASS_ELEMENT_STATE_KO);
            },
            containment: ".hz-dragtobox" //this.QUERY_BOX
        });
        // habilitamos que los box puedan recibir elementos
        that.element.find(this.QUERY_BOX)
            .droppable({
            hoverClass: this.CLASS_BOX_HOVER,
            drop: function (event, ui) {
                that._handleDrop(event, ui, this);
            }
        });
    },
    _handleDrop: function (event, ui, _this) {
        if (!this.isDisabled()) {
            var $element = ui.helper;
            var $box = $(_this);
            var elementId = $element.data("elementId");
            var idBox = $box.attr(this.ATTR_BOX_ID);
            var element = this._getElementById(elementId);
            $element.removeClass(this.CLASS_ELEMENT_STATE_OK).removeClass(this.CLASS_ELEMENT_STATE_KO);
            // comprobamos si ha acertado
            var evaluate = this.ELEMENT_STATE.KO;
            if (element.idBox == idBox) {
                evaluate = this.ELEMENT_STATE.OK;
                $element.draggable("disable");
            }
            // colocamos la palabra en el hueco
            $element.addClass(this.CLASS_ELEMENT_PLACED)
                .addClass(evaluate === this.ELEMENT_STATE.OK ? this.CLASS_ELEMENT_STATE_OK : this.CLASS_ELEMENT_STATE_KO).text(element.content);
            $box.data("currentElement", elementId);
            $element.css({ left: 0, top: 0, position: "inherit" });
            $box.append($element);
            $element.moved = true;
            // evaluamos si se ha terminado el ejercicio
            this._numberElementsPlaced = this.element.find('.hz-dragtobox__element--placed').length;
            this._numberElementsOK = this.element.find(this.QUERY_ELEMENT_STATE_OK).length;
            if (this._numberElementsPlaced == this._elements.length) {
                this.element.trigger(this.ON_DRAGTOBOX_COMPLETED);
            }
            if (this._numberElementsOK == this._elements.length) {
                this.element.trigger(this.ON_DRAGTOBOX_OK);
                this.element.find(this.QUERY_ELEMENTS)
                    .remove();
            }
        }
        else {
            event.preventDefault();
        }
    },
    _onKoElementClick: function (e) {
        var instance = e.data.instance;
        if (!instance.isDisabled()) {
            var $element = $(e.target);
            $element.removeClass(instance.CLASS_ELEMENT_STATE_KO + " " + instance.CLASS_ELEMENT_PLACED);
            var _elements = instance.element.find('.hz_dragtobox__elements');
            _elements.append($element);
            $element.moved = false;
        }
    },
    disable: function () {
        this._super();
        this.element.find(this.QUERY_ELEMENT).draggable("disable");
        this.element.find(this.QUERY_BOX).droppable("disable");
    },
    isDisabled: function () {
        return this.options.disabled;
    },
    enable: function () {
        this._super();
        this._words = this.element.find(this.QUERY_BOX);
        this.element.find(this.QUERY_ELEMENT).draggable("enable");
        this.element.find(this.QUERY_BOX).droppable("enable");
    },
    /*
     * Obtiene la palabra que corresponde al hueco de destino seleccionado
     */
    _getElementById: function (id) {
        var elements = this._elements, result;
        for (var elementIndex = 0; elementIndex < elements.length; elementIndex++) {
            var currentElement = elements[elementIndex];
            if (id == currentElement.idElement) {
                result = currentElement;
                elementIndex = elements.length;
            }
        }
        return result;
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

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJqcURyYWd0b2JveC5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBjbGFzcyBkcmFndG9ib3hcbiAqL1xuJC53aWRnZXQoXCJoei5kcmFndG9ib3hcIiwge1xuICAgIC8qKlxuICAgICAqIEBtZW1iZXJvZiBkcmFndG9ib3hcbiAgICAgKi9cbiAgICBOQU1FU1BBQ0U6IFwiZHJhZ3RvYm94XCIsXG4gICAgRUxFTUVOVF9TVEFURToge1xuICAgICAgICBLTzogMCxcbiAgICAgICAgT0s6IDFcbiAgICB9LFxuICAgIE9OX0RSQUdUT0JPWF9TVEFSVDogXCJkcmFndG9ib3g6c3RhcnRcIixcbiAgICBPTl9EUkFHVE9CT1hfT1ZFUjogJ2RyYWd0b2JveDpvdmVyJyxcbiAgICBPTl9EUkFHVE9CT1hfQ09NUExFVEVEOiAnZHJhZ3RvYm94OmNvbXBsZXRlZCcsXG4gICAgT05fRFJBR1RPQk9YX09LOiAnZHJhZ3RvYm94Om9rJyxcbiAgICBDTEFTU19CT1g6ICdoei1kcmFndG9ib3hfX2JveCcsXG4gICAgQ0xBU1NfQk9YX0hPVkVSOiAnaHotZHJhZ3RvYm94X19ib3gtLWhvdmVyJyxcbiAgICBDTEFTU19FTEVNRU5UOiAnaHotZHJhZ3RvYm94X19lbGVtZW50JyxcbiAgICBDTEFTU19FTEVNRU5UUzogJ2h6LWRyYWd0b2JveF9fZWxlbWVudHMnLFxuICAgIENMQVNTX0VMRU1FTlRfUExBQ0VEOiAnaHotZHJhZ3RvYm94X19lbGVtZW50LS1wbGFjZWQnLFxuICAgIENMQVNTX0VMRU1FTlRfU1RBVEVfT0s6ICdoei1kcmFndG9ib3hfX2VsZW1lbnQtLW9rJyxcbiAgICBDTEFTU19FTEVNRU5UX1NUQVRFX0tPOiAnaHotZHJhZ3RvYm94X19lbGVtZW50LS1rbycsXG4gICAgLy9DTEFTU19HQVBfREVTVElOWTogJ2h6LWRyYWd0b2JveF9fZ2FwLS1kZXN0aW55JyxcbiAgICAvL0NMQVNTX0dBUF9FTVBUWTogJ2h6LWRyYWd0b2JveF9fZ2FwLS1lbXB0eScsXG4gICAgLy9DTEFTU19HQVBfT1JJR0lOOiAnaHotZmlsbC1nYXBzLWdhcHNfb3JpZ2luJyxcbiAgICAvL0NMQVNTX0dBUF9IT1ZFUl9ERVNUSU5ZOidob3Zlcl9kZXN0aW55JyxcbiAgICAvL0NMQVNTX0VMRU1FTlRfUExBQ0VEOidoei1kcmFndG9ib3hfX2dhcC0tZmlsbGVkJyxcbiAgICAvL0NMQVNTX0dBUF9TVEFURV9PSzonaHotZHJhZ3RvYm94X19nYXAtLW9rJyxcbiAgICAvL0NMQVNTX0VMRU1FTlRfU1RBVEVfS086J2h6LWRyYWd0b2JveF9fZ2FwLS1rbycsXG4gICAgUVVFUllfQk9YOiAnLmh6LWRyYWd0b2JveF9fYm94JyxcbiAgICBRVUVSWV9FTEVNRU5UOiAnLmh6X2RyYWd0b2JveF9fZWxlbWVudCcsXG4gICAgUVVFUllfRUxFTUVOVFM6ICcuaHpfZHJhZ3RvYm94X19lbGVtZW50cycsXG4gICAgUVVFUllfRUxFTUVOVF9TVEFURV9LTzogJy5oei1kcmFndG9ib3hfX2VsZW1lbnQtLWtvJyxcbiAgICBRVUVSWV9FTEVNRU5UX1NUQVRFX09LOiAnLmh6LWRyYWd0b2JveF9fZWxlbWVudC0tb2snLFxuICAgIFFVRVJZX0VMRU1FTlRfUExBQ0VEOiAnaHotZHJhZ3RvYm94X19lbGVtZW50LS1wbGFjZWQnLFxuICAgIC8vUVVFUllfR0FQX09SSUdJTjogJy5oei1maWxsLWdhcHMtZ2FwX29yaWdpbicsXG4gICAgLy9RVUVSWV9CT1g6ICcuaHotZHJhZ3RvYm94X19nYXAtLWRlc3RpbnknLFxuICAgIC8vUVVFUllfRUxFTUVOVDonLmh6LWRyYWd0b2JveF9fd29yZCcsXG4gICAgLy9RVUVSWV9FTEVNRU5UUzonLmh6LWRyYWd0b2JveF9fd29yZHMnLFxuICAgIC8vUVVFUllfR0FQX0ZJTExFRDonLmh6LWRyYWd0b2JveF9fZ2FwLS1maWxsZWQnLFxuICAgIC8vUVVFUllfR0FQX1NUQVRFX09LOicuaHotZHJhZ3RvYm94X19nYXAtLW9rJyxcbiAgICAvL1FVRVJZX0dBUF9TVEFURV9LTzonLmh6LWRyYWd0b2JveF9fZ2FwLS1rbycsXG4gICAgLy9cbiAgICBBVFRSX0JPWF9USVRMRTogJ2RhdGEtaHotZHJhZ3RvYm94X19ib3gtLXRpdGxlJyxcbiAgICBBVFRSX0JPWF9JTUFHRTogJ2RhdGEtaHotZHJhZ3RvYm94X19ib3gtLWltYWdlJyxcbiAgICBBVFRSX0JPWF9JRDogJ2RhdGEtaHotZHJhZ3RvYm94X19ib3gtLWlkJyxcbiAgICBBVFRSX0VMRU1FTlRfSUQ6ICdkYXRhLWh6LWRyYWd0b2JveF9fZWxlbWVudC0taWQnLFxuICAgIC8vQVRUUl9HQVBfV09SRDonZGF0YS1oei1kcmFndG9ib3gtd29yZCcsXG4gICAgLy9BVFRSX0dBUF9ERVNUSU5ZOidkYXRhLWh6LWRyYWd0b2JveC1nYXAtZGVzdGlueScsXG4gICAgLy9BVFRSX0dBUF9MRU5HVEg6ICdkYXRhLWh6LWRyYWd0b2JveC1nYXAtbGVuZ2h0JyxcbiAgICAvLyBEZWZhdWx0IG9wdGlvbnMuXG4gICAgb3B0aW9uczoge1xuICAgICAgICBpbW1lZGlhdGVfZmVlZGJhY2s6IHRydWUsXG4gICAgICAgIGNsYXNzZXM6IHtcbiAgICAgICAgICAgICdoei1kcmFndG9ib3gnOiAnaHotZHJhZ3RvYm94LS1kZWZhdWx0JyxcbiAgICAgICAgICAgICdoei1kcmFndG9ib3hfX2JveCc6ICdoei1kcmFndG9ib3hfX2JveCdcbiAgICAgICAgfVxuICAgIH0sXG4gICAgLyoqXG4gICAgICogQG1lbWJlcm9mIGRyYWd0b2JveFxuICAgICAqIEZ1bmNpw4PCs24gZGUgY3JlYWNpw4PCs24gZGVsIHdpZGdldFxuICAgICAqIEBmdW5jdGlvblxuICAgICAqL1xuICAgIF9jcmVhdGU6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgLy9WYXIgZGVjbGFyYXRpb24gZ2xvYmFsZXNcbiAgICAgICAgdGhpcy5fYm94ZXMgPSBbXTtcbiAgICAgICAgdGhpcy5fZWxlbWVudHMgPSBbXTtcbiAgICAgICAgLy9cbiAgICAgICAgdGhpcy5fYnVpbGRIdG1sKCk7XG4gICAgfSxcbiAgICAvKipcbiAgICAgKiBJbmljaWEgZWwgY29tcG9uZW50ZVxuICAgICAqL1xuICAgIF9pbml0OiBmdW5jdGlvbiAoKSB7XG4gICAgfSxcbiAgICBfYnVpbGRIdG1sOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIC8vIG9idGVuZW1vcyB0b2RvcyBsb3MgYm94IHF1ZSBoYXlcbiAgICAgICAgdmFyIF9ib3hlcyA9IHRoaXMuZWxlbWVudC5maW5kKHRoaXMuUVVFUllfQk9YKTtcbiAgICAgICAgLy8gU2kgbm8gZXhpc3RlIG5pbmfDg8K6biBib3ggbGFuemFtb3MgdW4gZXJyb3JcbiAgICAgICAgaWYgKF9ib3hlcy5sZW5ndGggPT0gMCkge1xuICAgICAgICAgICAgdGhyb3cgJ05vIHNlIGhhIGVuY29udHJhZG8gbmluZ3VubmEgY2FqYS4gTmVjZXNpdGFzIHVzYXIgbGEgY2xhc2UgJyArIHRoaXMuUVVFUllfQk9YO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgdmFyIGlkRWxlbWVudCA9IDA7XG4gICAgICAgICAgICAvL1JlY29ycmVtb3MgbG9zIGJveFxuICAgICAgICAgICAgZm9yICh2YXIgYm94SW5kZXggPSAwOyBib3hJbmRleCA8IF9ib3hlcy5sZW5ndGg7IGJveEluZGV4KyspIHtcbiAgICAgICAgICAgICAgICB2YXIgY3VycmVudEJveCA9ICQoX2JveGVzW2JveEluZGV4XSk7XG4gICAgICAgICAgICAgICAgdmFyIGJveFRpdGxlID0gY3VycmVudEJveC5hdHRyKHRoaXMuQVRUUl9CT1hfVElUTEUpIHx8ICcnO1xuICAgICAgICAgICAgICAgIHZhciBib3hJbWFnZSA9IGN1cnJlbnRCb3guYXR0cih0aGlzLkFUVFJfQk9YX0lNQUdFKSB8fCAnJztcbiAgICAgICAgICAgICAgICB2YXIgX2VsZW1lbnRzID0gY3VycmVudEJveC5maW5kKHRoaXMuUVVFUllfRUxFTUVOVCk7XG4gICAgICAgICAgICAgICAgdmFyIF9lbGVtZW50c0luQm94ID0gW107XG4gICAgICAgICAgICAgICAgY3VycmVudEJveFxuICAgICAgICAgICAgICAgICAgICAuYWRkQ2xhc3MoJ3VpLWRyb3BwYWJsZScpXG4gICAgICAgICAgICAgICAgICAgIC5hdHRyKHRoaXMuQVRUUl9CT1hfSUQsIGJveEluZGV4KTtcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBlbGVtZW50SW5kZXggPSAwOyBlbGVtZW50SW5kZXggPCBfZWxlbWVudHMubGVuZ3RoOyBlbGVtZW50SW5kZXgrKykge1xuICAgICAgICAgICAgICAgICAgICB2YXIgY3VycmVudEVsZW1lbnQgPSAkKF9lbGVtZW50c1tlbGVtZW50SW5kZXhdKTtcbiAgICAgICAgICAgICAgICAgICAgdmFyIG5ld0VsZW1lbnQgPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAnaWRFbGVtZW50JzogaWRFbGVtZW50LFxuICAgICAgICAgICAgICAgICAgICAgICAgJ2lkQm94JzogYm94SW5kZXgsXG4gICAgICAgICAgICAgICAgICAgICAgICAnY29udGVudCc6IGN1cnJlbnRFbGVtZW50LnRleHQoKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICckZWxlbWVudCc6IGN1cnJlbnRFbGVtZW50XG4gICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX2VsZW1lbnRzLnB1c2gobmV3RWxlbWVudCk7XG4gICAgICAgICAgICAgICAgICAgIF9lbGVtZW50c0luQm94LnB1c2gobmV3RWxlbWVudCk7XG4gICAgICAgICAgICAgICAgICAgIGlkRWxlbWVudCsrO1xuICAgICAgICAgICAgICAgICAgICBjdXJyZW50RWxlbWVudC5yZW1vdmUoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgdmFyIG5ld0JveCA9IHtcbiAgICAgICAgICAgICAgICAgICAgJ2lkQm94JzogYm94SW5kZXgsXG4gICAgICAgICAgICAgICAgICAgICd0aXRsZSc6IGJveFRpdGxlLFxuICAgICAgICAgICAgICAgICAgICAnaW1hZ2UnOiBib3hJbWFnZSxcbiAgICAgICAgICAgICAgICAgICAgJyRib3gnOiBjdXJyZW50Qm94LFxuICAgICAgICAgICAgICAgICAgICAnZWxlbWVudHMnOiBfZWxlbWVudHNJbkJveFxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgdGhpcy5fYm94ZXMucHVzaChuZXdCb3gpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5fZHJhd0JveGVzKCk7XG4gICAgICAgIH1cbiAgICB9LFxuICAgIC8qXG4gICAgICogUGludGFtb3MgbG9zIGVsZW1lbnRvcyAocGFsYWJyYXMgbyBpbcODwqFnZW5lcykgZGlzcG9uaWJsZXMgcGFyYSBjb2xvY2FyIGVuIGxvcyBib3hcbiAgICAgKi9cbiAgICBfZHJhd0JveGVzOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIC8vIGNyZWFtb3MgZWwgY29udGVuZWRvciBkb25kZSBpcsODwqFuIHViaWNhZG9zIGxvcyBlbGVtZW50b3NcbiAgICAgICAgdmFyIGh0bWwgPSAkKCc8ZGl2IGNsYXNzPVwiJyArIHRoaXMuQ0xBU1NfRUxFTUVOVFMgKyAnXCI+PC9kaXY+Jyk7XG4gICAgICAgIHZhciBhcnJFbGVtZW50cyA9IHRoaXMuX3NodWZmbGVBcnJheSh0aGlzLl9lbGVtZW50cyk7XG4gICAgICAgIC8vIHJlY29ycmVtb3MgbG9zIGVsZW1lbnRvcyBxdWUgdGVuZW1vcyBhbG1hY2VuYWRvc1xuICAgICAgICBmb3IgKHZhciBlbGVtZW50SW5kZXggPSAwOyBlbGVtZW50SW5kZXggPCBhcnJFbGVtZW50cy5sZW5ndGg7IGVsZW1lbnRJbmRleCsrKSB7XG4gICAgICAgICAgICB2YXIgY3VycmVudEVsZW1lbnQgPSBhcnJFbGVtZW50c1tlbGVtZW50SW5kZXhdO1xuICAgICAgICAgICAgdmFyICRlbGVtZW50ID0gJChcIjxkaXYgY2xhc3M9XFxcIlwiICsgdGhpcy5DTEFTU19FTEVNRU5UICsgXCIgdWktZHJhZ2dhYmxlXFxcIiBcIiArIHRoaXMuQVRUUl9FTEVNRU5UX0lEICsgXCI9XFxcIlwiICsgY3VycmVudEVsZW1lbnQuaWRFbGVtZW50ICsgXCJcXFwiPlwiICsgY3VycmVudEVsZW1lbnQuY29udGVudCArIFwiPC9kaXY+XCIpO1xuICAgICAgICAgICAgJGVsZW1lbnQuZGF0YShcImVsZW1lbnRJZFwiLCBjdXJyZW50RWxlbWVudC5pZEVsZW1lbnQpO1xuICAgICAgICAgICAgY3VycmVudEVsZW1lbnQuJGVsZW1lbnQgPSAkZWxlbWVudDtcbiAgICAgICAgICAgIGh0bWwuYXBwZW5kKCRlbGVtZW50KTtcbiAgICAgICAgfVxuICAgICAgICAvLyBsYXMgYcODwrFhZGltb3MgYWwgZWxlbWVudG8gcHJpbmNpcGFsXG4gICAgICAgIHRoaXMuZWxlbWVudC5wcmVwZW5kKGh0bWwpO1xuICAgICAgICB0aGlzLl9jcmVhdGVFdmVudHMoKTtcbiAgICB9LFxuICAgIF9jcmVhdGVFdmVudHM6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIHRoYXQgPSB0aGlzO1xuICAgICAgICAvL2xpc3RlbmVyIGNsaWNrIGVuIGVsZW1lbnRvcyBmYWxsaWRhc1xuICAgICAgICAvL3RoYXQuZWxlbWVudC5vZmYoJ2NsaWNrLicgKyB0aGlzLk5BTUVTUEFDRSlcbiAgICAgICAgLy8gICAgLm9uKCdjbGljay4nICsgdGhpcy5OQU1FU1BBQ0UsIHRoaXMuUVVFUllfRUxFTUVOVF9TVEFURV9LTywgeyBpbnN0YW5jZTogdGhpcywgdGhhdDp0aGF0IH0sIHRoaXMuX29uS29FbGVtZW50Q2xpY2spO1xuICAgICAgICAvLyBoYWJpbGl0YW1vcyBxdWUgbGFzIGVsZW1lbnRvcyBzZSBwdWVkYW4gbW92ZXJcbiAgICAgICAgdGhhdC5lbGVtZW50LmZpbmQoJy5oei1kcmFndG9ib3hfX2VsZW1lbnQnKVxuICAgICAgICAgICAgLmRyYWdnYWJsZSh7XG4gICAgICAgICAgICAvL3JldmVydDogXCJpbnZhbGlkXCIsXG4gICAgICAgICAgICBzdGFydDogZnVuY3Rpb24gKGV2ZW50LCB1aSkge1xuICAgICAgICAgICAgICAgIHVpLmhlbHBlci5yZW1vdmVDbGFzcyh0aGF0LkNMQVNTX0VMRU1FTlRfU1RBVEVfT0spLnJlbW92ZUNsYXNzKHRoYXQuQ0xBU1NfRUxFTUVOVF9TVEFURV9LTyk7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgY29udGFpbm1lbnQ6IFwiLmh6LWRyYWd0b2JveFwiIC8vdGhpcy5RVUVSWV9CT1hcbiAgICAgICAgfSk7XG4gICAgICAgIC8vIGhhYmlsaXRhbW9zIHF1ZSBsb3MgYm94IHB1ZWRhbiByZWNpYmlyIGVsZW1lbnRvc1xuICAgICAgICB0aGF0LmVsZW1lbnQuZmluZCh0aGlzLlFVRVJZX0JPWClcbiAgICAgICAgICAgIC5kcm9wcGFibGUoe1xuICAgICAgICAgICAgaG92ZXJDbGFzczogdGhpcy5DTEFTU19CT1hfSE9WRVIsXG4gICAgICAgICAgICBkcm9wOiBmdW5jdGlvbiAoZXZlbnQsIHVpKSB7XG4gICAgICAgICAgICAgICAgdGhhdC5faGFuZGxlRHJvcChldmVudCwgdWksIHRoaXMpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9LFxuICAgIF9oYW5kbGVEcm9wOiBmdW5jdGlvbiAoZXZlbnQsIHVpLCBfdGhpcykge1xuICAgICAgICBpZiAoIXRoaXMuaXNEaXNhYmxlZCgpKSB7XG4gICAgICAgICAgICB2YXIgJGVsZW1lbnQgPSB1aS5oZWxwZXI7XG4gICAgICAgICAgICB2YXIgJGJveCA9ICQoX3RoaXMpO1xuICAgICAgICAgICAgdmFyIGVsZW1lbnRJZCA9ICRlbGVtZW50LmRhdGEoXCJlbGVtZW50SWRcIik7XG4gICAgICAgICAgICB2YXIgaWRCb3ggPSAkYm94LmF0dHIodGhpcy5BVFRSX0JPWF9JRCk7XG4gICAgICAgICAgICB2YXIgZWxlbWVudCA9IHRoaXMuX2dldEVsZW1lbnRCeUlkKGVsZW1lbnRJZCk7XG4gICAgICAgICAgICAkZWxlbWVudC5yZW1vdmVDbGFzcyh0aGlzLkNMQVNTX0VMRU1FTlRfU1RBVEVfT0spLnJlbW92ZUNsYXNzKHRoaXMuQ0xBU1NfRUxFTUVOVF9TVEFURV9LTyk7XG4gICAgICAgICAgICAvLyBjb21wcm9iYW1vcyBzaSBoYSBhY2VydGFkb1xuICAgICAgICAgICAgdmFyIGV2YWx1YXRlID0gdGhpcy5FTEVNRU5UX1NUQVRFLktPO1xuICAgICAgICAgICAgaWYgKGVsZW1lbnQuaWRCb3ggPT0gaWRCb3gpIHtcbiAgICAgICAgICAgICAgICBldmFsdWF0ZSA9IHRoaXMuRUxFTUVOVF9TVEFURS5PSztcbiAgICAgICAgICAgICAgICAkZWxlbWVudC5kcmFnZ2FibGUoXCJkaXNhYmxlXCIpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gY29sb2NhbW9zIGxhIHBhbGFicmEgZW4gZWwgaHVlY29cbiAgICAgICAgICAgICRlbGVtZW50LmFkZENsYXNzKHRoaXMuQ0xBU1NfRUxFTUVOVF9QTEFDRUQpXG4gICAgICAgICAgICAgICAgLmFkZENsYXNzKGV2YWx1YXRlID09PSB0aGlzLkVMRU1FTlRfU1RBVEUuT0sgPyB0aGlzLkNMQVNTX0VMRU1FTlRfU1RBVEVfT0sgOiB0aGlzLkNMQVNTX0VMRU1FTlRfU1RBVEVfS08pLnRleHQoZWxlbWVudC5jb250ZW50KTtcbiAgICAgICAgICAgICRib3guZGF0YShcImN1cnJlbnRFbGVtZW50XCIsIGVsZW1lbnRJZCk7XG4gICAgICAgICAgICAkZWxlbWVudC5jc3MoeyBsZWZ0OiAwLCB0b3A6IDAsIHBvc2l0aW9uOiBcImluaGVyaXRcIiB9KTtcbiAgICAgICAgICAgICRib3guYXBwZW5kKCRlbGVtZW50KTtcbiAgICAgICAgICAgICRlbGVtZW50Lm1vdmVkID0gdHJ1ZTtcbiAgICAgICAgICAgIC8vIGV2YWx1YW1vcyBzaSBzZSBoYSB0ZXJtaW5hZG8gZWwgZWplcmNpY2lvXG4gICAgICAgICAgICB0aGlzLl9udW1iZXJFbGVtZW50c1BsYWNlZCA9IHRoaXMuZWxlbWVudC5maW5kKCcuaHotZHJhZ3RvYm94X19lbGVtZW50LS1wbGFjZWQnKS5sZW5ndGg7XG4gICAgICAgICAgICB0aGlzLl9udW1iZXJFbGVtZW50c09LID0gdGhpcy5lbGVtZW50LmZpbmQodGhpcy5RVUVSWV9FTEVNRU5UX1NUQVRFX09LKS5sZW5ndGg7XG4gICAgICAgICAgICBpZiAodGhpcy5fbnVtYmVyRWxlbWVudHNQbGFjZWQgPT0gdGhpcy5fZWxlbWVudHMubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5lbGVtZW50LnRyaWdnZXIodGhpcy5PTl9EUkFHVE9CT1hfQ09NUExFVEVEKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICh0aGlzLl9udW1iZXJFbGVtZW50c09LID09IHRoaXMuX2VsZW1lbnRzLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgIHRoaXMuZWxlbWVudC50cmlnZ2VyKHRoaXMuT05fRFJBR1RPQk9YX09LKTtcbiAgICAgICAgICAgICAgICB0aGlzLmVsZW1lbnQuZmluZCh0aGlzLlFVRVJZX0VMRU1FTlRTKVxuICAgICAgICAgICAgICAgICAgICAucmVtb3ZlKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICB9XG4gICAgfSxcbiAgICBfb25Lb0VsZW1lbnRDbGljazogZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgdmFyIGluc3RhbmNlID0gZS5kYXRhLmluc3RhbmNlO1xuICAgICAgICBpZiAoIWluc3RhbmNlLmlzRGlzYWJsZWQoKSkge1xuICAgICAgICAgICAgdmFyICRlbGVtZW50ID0gJChlLnRhcmdldCk7XG4gICAgICAgICAgICAkZWxlbWVudC5yZW1vdmVDbGFzcyhpbnN0YW5jZS5DTEFTU19FTEVNRU5UX1NUQVRFX0tPICsgXCIgXCIgKyBpbnN0YW5jZS5DTEFTU19FTEVNRU5UX1BMQUNFRCk7XG4gICAgICAgICAgICB2YXIgX2VsZW1lbnRzID0gaW5zdGFuY2UuZWxlbWVudC5maW5kKCcuaHpfZHJhZ3RvYm94X19lbGVtZW50cycpO1xuICAgICAgICAgICAgX2VsZW1lbnRzLmFwcGVuZCgkZWxlbWVudCk7XG4gICAgICAgICAgICAkZWxlbWVudC5tb3ZlZCA9IGZhbHNlO1xuICAgICAgICB9XG4gICAgfSxcbiAgICBkaXNhYmxlOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHRoaXMuX3N1cGVyKCk7XG4gICAgICAgIHRoaXMuZWxlbWVudC5maW5kKHRoaXMuUVVFUllfRUxFTUVOVCkuZHJhZ2dhYmxlKFwiZGlzYWJsZVwiKTtcbiAgICAgICAgdGhpcy5lbGVtZW50LmZpbmQodGhpcy5RVUVSWV9CT1gpLmRyb3BwYWJsZShcImRpc2FibGVcIik7XG4gICAgfSxcbiAgICBpc0Rpc2FibGVkOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLm9wdGlvbnMuZGlzYWJsZWQ7XG4gICAgfSxcbiAgICBlbmFibGU6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdGhpcy5fc3VwZXIoKTtcbiAgICAgICAgdGhpcy5fd29yZHMgPSB0aGlzLmVsZW1lbnQuZmluZCh0aGlzLlFVRVJZX0JPWCk7XG4gICAgICAgIHRoaXMuZWxlbWVudC5maW5kKHRoaXMuUVVFUllfRUxFTUVOVCkuZHJhZ2dhYmxlKFwiZW5hYmxlXCIpO1xuICAgICAgICB0aGlzLmVsZW1lbnQuZmluZCh0aGlzLlFVRVJZX0JPWCkuZHJvcHBhYmxlKFwiZW5hYmxlXCIpO1xuICAgIH0sXG4gICAgLypcbiAgICAgKiBPYnRpZW5lIGxhIHBhbGFicmEgcXVlIGNvcnJlc3BvbmRlIGFsIGh1ZWNvIGRlIGRlc3Rpbm8gc2VsZWNjaW9uYWRvXG4gICAgICovXG4gICAgX2dldEVsZW1lbnRCeUlkOiBmdW5jdGlvbiAoaWQpIHtcbiAgICAgICAgdmFyIGVsZW1lbnRzID0gdGhpcy5fZWxlbWVudHMsIHJlc3VsdDtcbiAgICAgICAgZm9yICh2YXIgZWxlbWVudEluZGV4ID0gMDsgZWxlbWVudEluZGV4IDwgZWxlbWVudHMubGVuZ3RoOyBlbGVtZW50SW5kZXgrKykge1xuICAgICAgICAgICAgdmFyIGN1cnJlbnRFbGVtZW50ID0gZWxlbWVudHNbZWxlbWVudEluZGV4XTtcbiAgICAgICAgICAgIGlmIChpZCA9PSBjdXJyZW50RWxlbWVudC5pZEVsZW1lbnQpIHtcbiAgICAgICAgICAgICAgICByZXN1bHQgPSBjdXJyZW50RWxlbWVudDtcbiAgICAgICAgICAgICAgICBlbGVtZW50SW5kZXggPSBlbGVtZW50cy5sZW5ndGg7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9LFxuICAgIC8qXG4gICAgICogIERldnVlbHZlIHVuIG9yZGVuIGFsZWF0b3JpbyBkZWwgYXJyYXkgcXVlIHNlIGxlIHBhc2FcbiAgICAgKiAgQHBhcmFtcyBhcnJheVxuICAgICAqL1xuICAgIF9zaHVmZmxlQXJyYXk6IGZ1bmN0aW9uIChhcnJheSkge1xuICAgICAgICBmb3IgKHZhciBwb3NpdGlvbkluZGV4ID0gYXJyYXkubGVuZ3RoIC0gMTsgcG9zaXRpb25JbmRleCA+IDA7IHBvc2l0aW9uSW5kZXgtLSkge1xuICAgICAgICAgICAgdmFyIGogPSBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAocG9zaXRpb25JbmRleCArIDEpKTtcbiAgICAgICAgICAgIHZhciB0ZW1wID0gYXJyYXlbcG9zaXRpb25JbmRleF07XG4gICAgICAgICAgICBhcnJheVtwb3NpdGlvbkluZGV4XSA9IGFycmF5W2pdO1xuICAgICAgICAgICAgYXJyYXlbal0gPSB0ZW1wO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBhcnJheTtcbiAgICB9XG59KTtcbiJdLCJmaWxlIjoianFEcmFndG9ib3guanMifQ==
