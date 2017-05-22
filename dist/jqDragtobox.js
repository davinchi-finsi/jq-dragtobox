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
    QUERY_BOX: '.hz-dragtobox__box',
    QUERY_ELEMENT: '.hz_dragtobox__element',
    QUERY_ELEMENTS: '.hz_dragtobox__elements',
    QUERY_ELEMENT_STATE_KO: '.hz-dragtobox__element--ko',
    QUERY_ELEMENT_STATE_OK: '.hz-dragtobox__element--ok',
    QUERY_ELEMENT_PLACED: 'hz-dragtobox__element--placed',
    ATTR_BOX_TITLE: 'data-hz-dragtobox__box--title',
    ATTR_BOX_IMAGE: 'data-hz-dragtobox__box--image',
    ATTR_BOX_ID: 'data-hz-dragtobox__box--id',
    ATTR_ELEMENT_ID: 'data-hz-dragtobox__element--id',
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
            this._drawElementsToDrag();
        }
    },
    /*
     * Pintamos los elementos (palabras o imÃ¡genes) disponibles para colocar en los box
     */
    _drawElementsToDrag: function () {
        // creamos el contenedor donde irÃ¡n ubicados los elementos
        var html = $('<div class="' + this.CLASS_ELEMENTS + '"></div>');
        var arrElements = this._shuffleArray(this._elements);
        // recorremos los elementos que tenemos almacenados
        for (var elementIndex = 0; elementIndex < arrElements.length; elementIndex++) {
            var currentElement = arrElements[elementIndex];
            var $element = $("<div class=\"" + this.CLASS_ELEMENT + " box_" + currentElement.idBox + "  ui-draggable\" " + this.ATTR_ELEMENT_ID + "=\"" + currentElement.idElement + "\">" + currentElement.content + "</div>");
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
            /*,
            accept:function (ui) {

                let idBox=$(this).attr('data-hz-dragtobox__box--id');
                if(idBox==1){
                    return true;
                }

            }*/
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
            $element.css({ left: '', top: '', position: '' });
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

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJqcURyYWd0b2JveC5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBjbGFzcyBkcmFndG9ib3hcbiAqL1xuJC53aWRnZXQoXCJoei5kcmFndG9ib3hcIiwge1xuICAgIC8qKlxuICAgICAqIEBtZW1iZXJvZiBkcmFndG9ib3hcbiAgICAgKi9cbiAgICBOQU1FU1BBQ0U6IFwiZHJhZ3RvYm94XCIsXG4gICAgRUxFTUVOVF9TVEFURToge1xuICAgICAgICBLTzogMCxcbiAgICAgICAgT0s6IDFcbiAgICB9LFxuICAgIE9OX0RSQUdUT0JPWF9TVEFSVDogXCJkcmFndG9ib3g6c3RhcnRcIixcbiAgICBPTl9EUkFHVE9CT1hfT1ZFUjogJ2RyYWd0b2JveDpvdmVyJyxcbiAgICBPTl9EUkFHVE9CT1hfQ09NUExFVEVEOiAnZHJhZ3RvYm94OmNvbXBsZXRlZCcsXG4gICAgT05fRFJBR1RPQk9YX09LOiAnZHJhZ3RvYm94Om9rJyxcbiAgICBDTEFTU19CT1g6ICdoei1kcmFndG9ib3hfX2JveCcsXG4gICAgQ0xBU1NfQk9YX0hPVkVSOiAnaHotZHJhZ3RvYm94X19ib3gtLWhvdmVyJyxcbiAgICBDTEFTU19FTEVNRU5UOiAnaHotZHJhZ3RvYm94X19lbGVtZW50JyxcbiAgICBDTEFTU19FTEVNRU5UUzogJ2h6LWRyYWd0b2JveF9fZWxlbWVudHMnLFxuICAgIENMQVNTX0VMRU1FTlRfUExBQ0VEOiAnaHotZHJhZ3RvYm94X19lbGVtZW50LS1wbGFjZWQnLFxuICAgIENMQVNTX0VMRU1FTlRfU1RBVEVfT0s6ICdoei1kcmFndG9ib3hfX2VsZW1lbnQtLW9rJyxcbiAgICBDTEFTU19FTEVNRU5UX1NUQVRFX0tPOiAnaHotZHJhZ3RvYm94X19lbGVtZW50LS1rbycsXG4gICAgUVVFUllfQk9YOiAnLmh6LWRyYWd0b2JveF9fYm94JyxcbiAgICBRVUVSWV9FTEVNRU5UOiAnLmh6X2RyYWd0b2JveF9fZWxlbWVudCcsXG4gICAgUVVFUllfRUxFTUVOVFM6ICcuaHpfZHJhZ3RvYm94X19lbGVtZW50cycsXG4gICAgUVVFUllfRUxFTUVOVF9TVEFURV9LTzogJy5oei1kcmFndG9ib3hfX2VsZW1lbnQtLWtvJyxcbiAgICBRVUVSWV9FTEVNRU5UX1NUQVRFX09LOiAnLmh6LWRyYWd0b2JveF9fZWxlbWVudC0tb2snLFxuICAgIFFVRVJZX0VMRU1FTlRfUExBQ0VEOiAnaHotZHJhZ3RvYm94X19lbGVtZW50LS1wbGFjZWQnLFxuICAgIEFUVFJfQk9YX1RJVExFOiAnZGF0YS1oei1kcmFndG9ib3hfX2JveC0tdGl0bGUnLFxuICAgIEFUVFJfQk9YX0lNQUdFOiAnZGF0YS1oei1kcmFndG9ib3hfX2JveC0taW1hZ2UnLFxuICAgIEFUVFJfQk9YX0lEOiAnZGF0YS1oei1kcmFndG9ib3hfX2JveC0taWQnLFxuICAgIEFUVFJfRUxFTUVOVF9JRDogJ2RhdGEtaHotZHJhZ3RvYm94X19lbGVtZW50LS1pZCcsXG4gICAgLy8gRGVmYXVsdCBvcHRpb25zLlxuICAgIG9wdGlvbnM6IHtcbiAgICAgICAgaW1tZWRpYXRlX2ZlZWRiYWNrOiB0cnVlLFxuICAgICAgICBjbGFzc2VzOiB7XG4gICAgICAgICAgICAnaHotZHJhZ3RvYm94JzogJ2h6LWRyYWd0b2JveC0tZGVmYXVsdCcsXG4gICAgICAgICAgICAnaHotZHJhZ3RvYm94X19ib3gnOiAnaHotZHJhZ3RvYm94X19ib3gnXG4gICAgICAgIH1cbiAgICB9LFxuICAgIC8qKlxuICAgICAqIEBtZW1iZXJvZiBkcmFndG9ib3hcbiAgICAgKiBGdW5jacODwrNuIGRlIGNyZWFjacODwrNuIGRlbCB3aWRnZXRcbiAgICAgKiBAZnVuY3Rpb25cbiAgICAgKi9cbiAgICBfY3JlYXRlOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIC8vVmFyIGRlY2xhcmF0aW9uIGdsb2JhbGVzXG4gICAgICAgIHRoaXMuX2JveGVzID0gW107XG4gICAgICAgIHRoaXMuX2VsZW1lbnRzID0gW107XG4gICAgICAgIC8vXG4gICAgICAgIHRoaXMuX2J1aWxkSHRtbCgpO1xuICAgIH0sXG4gICAgLyoqXG4gICAgICogSW5pY2lhIGVsIGNvbXBvbmVudGVcbiAgICAgKi9cbiAgICBfaW5pdDogZnVuY3Rpb24gKCkge1xuICAgIH0sXG4gICAgX2J1aWxkSHRtbDogZnVuY3Rpb24gKCkge1xuICAgICAgICAvLyBvYnRlbmVtb3MgdG9kb3MgbG9zIGJveCBxdWUgaGF5XG4gICAgICAgIHZhciBfYm94ZXMgPSB0aGlzLmVsZW1lbnQuZmluZCh0aGlzLlFVRVJZX0JPWCk7XG4gICAgICAgIC8vIFNpIG5vIGV4aXN0ZSBuaW5nw4PCum4gYm94IGxhbnphbW9zIHVuIGVycm9yXG4gICAgICAgIGlmIChfYm94ZXMubGVuZ3RoID09IDApIHtcbiAgICAgICAgICAgIHRocm93ICdObyBzZSBoYSBlbmNvbnRyYWRvIG5pbmd1bm5hIGNhamEuIE5lY2VzaXRhcyB1c2FyIGxhIGNsYXNlICcgKyB0aGlzLlFVRVJZX0JPWDtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHZhciBpZEVsZW1lbnQgPSAwO1xuICAgICAgICAgICAgLy9SZWNvcnJlbW9zIGxvcyBib3hcbiAgICAgICAgICAgIGZvciAodmFyIGJveEluZGV4ID0gMDsgYm94SW5kZXggPCBfYm94ZXMubGVuZ3RoOyBib3hJbmRleCsrKSB7XG4gICAgICAgICAgICAgICAgdmFyIGN1cnJlbnRCb3ggPSAkKF9ib3hlc1tib3hJbmRleF0pO1xuICAgICAgICAgICAgICAgIHZhciBib3hUaXRsZSA9IGN1cnJlbnRCb3guYXR0cih0aGlzLkFUVFJfQk9YX1RJVExFKSB8fCAnJztcbiAgICAgICAgICAgICAgICB2YXIgYm94SW1hZ2UgPSBjdXJyZW50Qm94LmF0dHIodGhpcy5BVFRSX0JPWF9JTUFHRSkgfHwgJyc7XG4gICAgICAgICAgICAgICAgdmFyIF9lbGVtZW50cyA9IGN1cnJlbnRCb3guZmluZCh0aGlzLlFVRVJZX0VMRU1FTlQpO1xuICAgICAgICAgICAgICAgIHZhciBfZWxlbWVudHNJbkJveCA9IFtdO1xuICAgICAgICAgICAgICAgIGN1cnJlbnRCb3hcbiAgICAgICAgICAgICAgICAgICAgLmFkZENsYXNzKCd1aS1kcm9wcGFibGUnKVxuICAgICAgICAgICAgICAgICAgICAuYXR0cih0aGlzLkFUVFJfQk9YX0lELCBib3hJbmRleCk7XG4gICAgICAgICAgICAgICAgZm9yICh2YXIgZWxlbWVudEluZGV4ID0gMDsgZWxlbWVudEluZGV4IDwgX2VsZW1lbnRzLmxlbmd0aDsgZWxlbWVudEluZGV4KyspIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGN1cnJlbnRFbGVtZW50ID0gJChfZWxlbWVudHNbZWxlbWVudEluZGV4XSk7XG4gICAgICAgICAgICAgICAgICAgIHZhciBuZXdFbGVtZW50ID0ge1xuICAgICAgICAgICAgICAgICAgICAgICAgJ2lkRWxlbWVudCc6IGlkRWxlbWVudCxcbiAgICAgICAgICAgICAgICAgICAgICAgICdpZEJveCc6IGJveEluZGV4LFxuICAgICAgICAgICAgICAgICAgICAgICAgJ2NvbnRlbnQnOiBjdXJyZW50RWxlbWVudC50ZXh0KCksXG4gICAgICAgICAgICAgICAgICAgICAgICAnJGVsZW1lbnQnOiBjdXJyZW50RWxlbWVudFxuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICB0aGlzLl9lbGVtZW50cy5wdXNoKG5ld0VsZW1lbnQpO1xuICAgICAgICAgICAgICAgICAgICBfZWxlbWVudHNJbkJveC5wdXNoKG5ld0VsZW1lbnQpO1xuICAgICAgICAgICAgICAgICAgICBpZEVsZW1lbnQrKztcbiAgICAgICAgICAgICAgICAgICAgY3VycmVudEVsZW1lbnQucmVtb3ZlKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHZhciBuZXdCb3ggPSB7XG4gICAgICAgICAgICAgICAgICAgICdpZEJveCc6IGJveEluZGV4LFxuICAgICAgICAgICAgICAgICAgICAndGl0bGUnOiBib3hUaXRsZSxcbiAgICAgICAgICAgICAgICAgICAgJ2ltYWdlJzogYm94SW1hZ2UsXG4gICAgICAgICAgICAgICAgICAgICckYm94JzogY3VycmVudEJveCxcbiAgICAgICAgICAgICAgICAgICAgJ2VsZW1lbnRzJzogX2VsZW1lbnRzSW5Cb3hcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIHRoaXMuX2JveGVzLnB1c2gobmV3Qm94KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMuX2RyYXdFbGVtZW50c1RvRHJhZygpO1xuICAgICAgICB9XG4gICAgfSxcbiAgICAvKlxuICAgICAqIFBpbnRhbW9zIGxvcyBlbGVtZW50b3MgKHBhbGFicmFzIG8gaW3Dg8KhZ2VuZXMpIGRpc3BvbmlibGVzIHBhcmEgY29sb2NhciBlbiBsb3MgYm94XG4gICAgICovXG4gICAgX2RyYXdFbGVtZW50c1RvRHJhZzogZnVuY3Rpb24gKCkge1xuICAgICAgICAvLyBjcmVhbW9zIGVsIGNvbnRlbmVkb3IgZG9uZGUgaXLDg8KhbiB1YmljYWRvcyBsb3MgZWxlbWVudG9zXG4gICAgICAgIHZhciBodG1sID0gJCgnPGRpdiBjbGFzcz1cIicgKyB0aGlzLkNMQVNTX0VMRU1FTlRTICsgJ1wiPjwvZGl2PicpO1xuICAgICAgICB2YXIgYXJyRWxlbWVudHMgPSB0aGlzLl9zaHVmZmxlQXJyYXkodGhpcy5fZWxlbWVudHMpO1xuICAgICAgICAvLyByZWNvcnJlbW9zIGxvcyBlbGVtZW50b3MgcXVlIHRlbmVtb3MgYWxtYWNlbmFkb3NcbiAgICAgICAgZm9yICh2YXIgZWxlbWVudEluZGV4ID0gMDsgZWxlbWVudEluZGV4IDwgYXJyRWxlbWVudHMubGVuZ3RoOyBlbGVtZW50SW5kZXgrKykge1xuICAgICAgICAgICAgdmFyIGN1cnJlbnRFbGVtZW50ID0gYXJyRWxlbWVudHNbZWxlbWVudEluZGV4XTtcbiAgICAgICAgICAgIHZhciAkZWxlbWVudCA9ICQoXCI8ZGl2IGNsYXNzPVxcXCJcIiArIHRoaXMuQ0xBU1NfRUxFTUVOVCArIFwiIGJveF9cIiArIGN1cnJlbnRFbGVtZW50LmlkQm94ICsgXCIgIHVpLWRyYWdnYWJsZVxcXCIgXCIgKyB0aGlzLkFUVFJfRUxFTUVOVF9JRCArIFwiPVxcXCJcIiArIGN1cnJlbnRFbGVtZW50LmlkRWxlbWVudCArIFwiXFxcIj5cIiArIGN1cnJlbnRFbGVtZW50LmNvbnRlbnQgKyBcIjwvZGl2PlwiKTtcbiAgICAgICAgICAgICRlbGVtZW50LmRhdGEoXCJlbGVtZW50SWRcIiwgY3VycmVudEVsZW1lbnQuaWRFbGVtZW50KTtcbiAgICAgICAgICAgIGN1cnJlbnRFbGVtZW50LiRlbGVtZW50ID0gJGVsZW1lbnQ7XG4gICAgICAgICAgICBodG1sLmFwcGVuZCgkZWxlbWVudCk7XG4gICAgICAgIH1cbiAgICAgICAgLy8gbGFzIGHDg8KxYWRpbW9zIGFsIGVsZW1lbnRvIHByaW5jaXBhbFxuICAgICAgICB0aGlzLmVsZW1lbnQucHJlcGVuZChodG1sKTtcbiAgICAgICAgdGhpcy5fY3JlYXRlRXZlbnRzKCk7XG4gICAgfSxcbiAgICBfY3JlYXRlRXZlbnRzOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciB0aGF0ID0gdGhpcztcbiAgICAgICAgLy9saXN0ZW5lciBjbGljayBlbiBlbGVtZW50b3MgZmFsbGlkYXNcbiAgICAgICAgLy90aGF0LmVsZW1lbnQub2ZmKCdjbGljay4nICsgdGhpcy5OQU1FU1BBQ0UpXG4gICAgICAgIC8vICAgIC5vbignY2xpY2suJyArIHRoaXMuTkFNRVNQQUNFLCB0aGlzLlFVRVJZX0VMRU1FTlRfU1RBVEVfS08sIHsgaW5zdGFuY2U6IHRoaXMsIHRoYXQ6dGhhdCB9LCB0aGlzLl9vbktvRWxlbWVudENsaWNrKTtcbiAgICAgICAgLy8gaGFiaWxpdGFtb3MgcXVlIGxhcyBlbGVtZW50b3Mgc2UgcHVlZGFuIG1vdmVyXG4gICAgICAgIHRoYXQuZWxlbWVudC5maW5kKCcuaHotZHJhZ3RvYm94X19lbGVtZW50JylcbiAgICAgICAgICAgIC5kcmFnZ2FibGUoe1xuICAgICAgICAgICAgLy9yZXZlcnQ6IFwiaW52YWxpZFwiLFxuICAgICAgICAgICAgc3RhcnQ6IGZ1bmN0aW9uIChldmVudCwgdWkpIHtcbiAgICAgICAgICAgICAgICB1aS5oZWxwZXIucmVtb3ZlQ2xhc3ModGhhdC5DTEFTU19FTEVNRU5UX1NUQVRFX09LKS5yZW1vdmVDbGFzcyh0aGF0LkNMQVNTX0VMRU1FTlRfU1RBVEVfS08pO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGNvbnRhaW5tZW50OiBcIi5oei1kcmFndG9ib3hcIiAvL3RoaXMuUVVFUllfQk9YXG4gICAgICAgIH0pO1xuICAgICAgICAvLyBoYWJpbGl0YW1vcyBxdWUgbG9zIGJveCBwdWVkYW4gcmVjaWJpciBlbGVtZW50b3NcbiAgICAgICAgdGhhdC5lbGVtZW50LmZpbmQodGhpcy5RVUVSWV9CT1gpXG4gICAgICAgICAgICAuZHJvcHBhYmxlKHtcbiAgICAgICAgICAgIGhvdmVyQ2xhc3M6IHRoaXMuQ0xBU1NfQk9YX0hPVkVSLFxuICAgICAgICAgICAgZHJvcDogZnVuY3Rpb24gKGV2ZW50LCB1aSkge1xuICAgICAgICAgICAgICAgIHRoYXQuX2hhbmRsZURyb3AoZXZlbnQsIHVpLCB0aGlzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8qLFxuICAgICAgICAgICAgYWNjZXB0OmZ1bmN0aW9uICh1aSkge1xuXHJcbiAgICAgICAgICAgICAgICBsZXQgaWRCb3g9JCh0aGlzKS5hdHRyKCdkYXRhLWh6LWRyYWd0b2JveF9fYm94LS1pZCcpO1xuICAgICAgICAgICAgICAgIGlmKGlkQm94PT0xKXtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICAgICAgfVxuXHJcbiAgICAgICAgICAgIH0qL1xuICAgICAgICB9KTtcbiAgICB9LFxuICAgIF9oYW5kbGVEcm9wOiBmdW5jdGlvbiAoZXZlbnQsIHVpLCBfdGhpcykge1xuICAgICAgICBpZiAoIXRoaXMuaXNEaXNhYmxlZCgpKSB7XG4gICAgICAgICAgICB2YXIgJGVsZW1lbnQgPSB1aS5oZWxwZXI7XG4gICAgICAgICAgICB2YXIgJGJveCA9ICQoX3RoaXMpO1xuICAgICAgICAgICAgdmFyIGVsZW1lbnRJZCA9ICRlbGVtZW50LmRhdGEoXCJlbGVtZW50SWRcIik7XG4gICAgICAgICAgICB2YXIgaWRCb3ggPSAkYm94LmF0dHIodGhpcy5BVFRSX0JPWF9JRCk7XG4gICAgICAgICAgICB2YXIgZWxlbWVudCA9IHRoaXMuX2dldEVsZW1lbnRCeUlkKGVsZW1lbnRJZCk7XG4gICAgICAgICAgICAkZWxlbWVudC5yZW1vdmVDbGFzcyh0aGlzLkNMQVNTX0VMRU1FTlRfU1RBVEVfT0spLnJlbW92ZUNsYXNzKHRoaXMuQ0xBU1NfRUxFTUVOVF9TVEFURV9LTyk7XG4gICAgICAgICAgICAvLyBjb21wcm9iYW1vcyBzaSBoYSBhY2VydGFkb1xuICAgICAgICAgICAgdmFyIGV2YWx1YXRlID0gdGhpcy5FTEVNRU5UX1NUQVRFLktPO1xuICAgICAgICAgICAgaWYgKGVsZW1lbnQuaWRCb3ggPT0gaWRCb3gpIHtcbiAgICAgICAgICAgICAgICBldmFsdWF0ZSA9IHRoaXMuRUxFTUVOVF9TVEFURS5PSztcbiAgICAgICAgICAgICAgICAkZWxlbWVudC5kcmFnZ2FibGUoXCJkaXNhYmxlXCIpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gY29sb2NhbW9zIGxhIHBhbGFicmEgZW4gZWwgaHVlY29cbiAgICAgICAgICAgICRlbGVtZW50LmFkZENsYXNzKHRoaXMuQ0xBU1NfRUxFTUVOVF9QTEFDRUQpXG4gICAgICAgICAgICAgICAgLmFkZENsYXNzKGV2YWx1YXRlID09PSB0aGlzLkVMRU1FTlRfU1RBVEUuT0sgPyB0aGlzLkNMQVNTX0VMRU1FTlRfU1RBVEVfT0sgOiB0aGlzLkNMQVNTX0VMRU1FTlRfU1RBVEVfS08pLnRleHQoZWxlbWVudC5jb250ZW50KTtcbiAgICAgICAgICAgICRib3guZGF0YShcImN1cnJlbnRFbGVtZW50XCIsIGVsZW1lbnRJZCk7XG4gICAgICAgICAgICAkZWxlbWVudC5jc3MoeyBsZWZ0OiAnJywgdG9wOiAnJywgcG9zaXRpb246ICcnIH0pO1xuICAgICAgICAgICAgJGJveC5hcHBlbmQoJGVsZW1lbnQpO1xuICAgICAgICAgICAgJGVsZW1lbnQubW92ZWQgPSB0cnVlO1xuICAgICAgICAgICAgLy8gZXZhbHVhbW9zIHNpIHNlIGhhIHRlcm1pbmFkbyBlbCBlamVyY2ljaW9cbiAgICAgICAgICAgIHRoaXMuX251bWJlckVsZW1lbnRzUGxhY2VkID0gdGhpcy5lbGVtZW50LmZpbmQoJy5oei1kcmFndG9ib3hfX2VsZW1lbnQtLXBsYWNlZCcpLmxlbmd0aDtcbiAgICAgICAgICAgIHRoaXMuX251bWJlckVsZW1lbnRzT0sgPSB0aGlzLmVsZW1lbnQuZmluZCh0aGlzLlFVRVJZX0VMRU1FTlRfU1RBVEVfT0spLmxlbmd0aDtcbiAgICAgICAgICAgIGlmICh0aGlzLl9udW1iZXJFbGVtZW50c1BsYWNlZCA9PSB0aGlzLl9lbGVtZW50cy5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmVsZW1lbnQudHJpZ2dlcih0aGlzLk9OX0RSQUdUT0JPWF9DT01QTEVURUQpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHRoaXMuX251bWJlckVsZW1lbnRzT0sgPT0gdGhpcy5fZWxlbWVudHMubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5lbGVtZW50LnRyaWdnZXIodGhpcy5PTl9EUkFHVE9CT1hfT0spO1xuICAgICAgICAgICAgICAgIHRoaXMuZWxlbWVudC5maW5kKHRoaXMuUVVFUllfRUxFTUVOVFMpXG4gICAgICAgICAgICAgICAgICAgIC5yZW1vdmUoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIH1cbiAgICB9LFxuICAgIF9vbktvRWxlbWVudENsaWNrOiBmdW5jdGlvbiAoZSkge1xuICAgICAgICB2YXIgaW5zdGFuY2UgPSBlLmRhdGEuaW5zdGFuY2U7XG4gICAgICAgIGlmICghaW5zdGFuY2UuaXNEaXNhYmxlZCgpKSB7XG4gICAgICAgICAgICB2YXIgJGVsZW1lbnQgPSAkKGUudGFyZ2V0KTtcbiAgICAgICAgICAgICRlbGVtZW50LnJlbW92ZUNsYXNzKGluc3RhbmNlLkNMQVNTX0VMRU1FTlRfU1RBVEVfS08gKyBcIiBcIiArIGluc3RhbmNlLkNMQVNTX0VMRU1FTlRfUExBQ0VEKTtcbiAgICAgICAgICAgIHZhciBfZWxlbWVudHMgPSBpbnN0YW5jZS5lbGVtZW50LmZpbmQoJy5oel9kcmFndG9ib3hfX2VsZW1lbnRzJyk7XG4gICAgICAgICAgICBfZWxlbWVudHMuYXBwZW5kKCRlbGVtZW50KTtcbiAgICAgICAgICAgICRlbGVtZW50Lm1vdmVkID0gZmFsc2U7XG4gICAgICAgIH1cbiAgICB9LFxuICAgIGRpc2FibGU6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdGhpcy5fc3VwZXIoKTtcbiAgICAgICAgdGhpcy5lbGVtZW50LmZpbmQodGhpcy5RVUVSWV9FTEVNRU5UKS5kcmFnZ2FibGUoXCJkaXNhYmxlXCIpO1xuICAgICAgICB0aGlzLmVsZW1lbnQuZmluZCh0aGlzLlFVRVJZX0JPWCkuZHJvcHBhYmxlKFwiZGlzYWJsZVwiKTtcbiAgICB9LFxuICAgIGlzRGlzYWJsZWQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMub3B0aW9ucy5kaXNhYmxlZDtcbiAgICB9LFxuICAgIGVuYWJsZTogZnVuY3Rpb24gKCkge1xuICAgICAgICB0aGlzLl9zdXBlcigpO1xuICAgICAgICB0aGlzLl93b3JkcyA9IHRoaXMuZWxlbWVudC5maW5kKHRoaXMuUVVFUllfQk9YKTtcbiAgICAgICAgdGhpcy5lbGVtZW50LmZpbmQodGhpcy5RVUVSWV9FTEVNRU5UKS5kcmFnZ2FibGUoXCJlbmFibGVcIik7XG4gICAgICAgIHRoaXMuZWxlbWVudC5maW5kKHRoaXMuUVVFUllfQk9YKS5kcm9wcGFibGUoXCJlbmFibGVcIik7XG4gICAgfSxcbiAgICAvKlxuICAgICAqIE9idGllbmUgbGEgcGFsYWJyYSBxdWUgY29ycmVzcG9uZGUgYWwgaHVlY28gZGUgZGVzdGlubyBzZWxlY2Npb25hZG9cbiAgICAgKi9cbiAgICBfZ2V0RWxlbWVudEJ5SWQ6IGZ1bmN0aW9uIChpZCkge1xuICAgICAgICB2YXIgZWxlbWVudHMgPSB0aGlzLl9lbGVtZW50cywgcmVzdWx0O1xuICAgICAgICBmb3IgKHZhciBlbGVtZW50SW5kZXggPSAwOyBlbGVtZW50SW5kZXggPCBlbGVtZW50cy5sZW5ndGg7IGVsZW1lbnRJbmRleCsrKSB7XG4gICAgICAgICAgICB2YXIgY3VycmVudEVsZW1lbnQgPSBlbGVtZW50c1tlbGVtZW50SW5kZXhdO1xuICAgICAgICAgICAgaWYgKGlkID09IGN1cnJlbnRFbGVtZW50LmlkRWxlbWVudCkge1xuICAgICAgICAgICAgICAgIHJlc3VsdCA9IGN1cnJlbnRFbGVtZW50O1xuICAgICAgICAgICAgICAgIGVsZW1lbnRJbmRleCA9IGVsZW1lbnRzLmxlbmd0aDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH0sXG4gICAgLypcbiAgICAgKiAgRGV2dWVsdmUgdW4gb3JkZW4gYWxlYXRvcmlvIGRlbCBhcnJheSBxdWUgc2UgbGUgcGFzYVxuICAgICAqICBAcGFyYW1zIGFycmF5XG4gICAgICovXG4gICAgX3NodWZmbGVBcnJheTogZnVuY3Rpb24gKGFycmF5KSB7XG4gICAgICAgIGZvciAodmFyIHBvc2l0aW9uSW5kZXggPSBhcnJheS5sZW5ndGggLSAxOyBwb3NpdGlvbkluZGV4ID4gMDsgcG9zaXRpb25JbmRleC0tKSB7XG4gICAgICAgICAgICB2YXIgaiA9IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIChwb3NpdGlvbkluZGV4ICsgMSkpO1xuICAgICAgICAgICAgdmFyIHRlbXAgPSBhcnJheVtwb3NpdGlvbkluZGV4XTtcbiAgICAgICAgICAgIGFycmF5W3Bvc2l0aW9uSW5kZXhdID0gYXJyYXlbal07XG4gICAgICAgICAgICBhcnJheVtqXSA9IHRlbXA7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGFycmF5O1xuICAgIH1cbn0pO1xuIl0sImZpbGUiOiJqcURyYWd0b2JveC5qcyJ9
