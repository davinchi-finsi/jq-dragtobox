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
                start: function( event, ui ) {
                    ui.helper.removeClass(that.CLASS_ELEMENT_STATE_OK).removeClass(that.CLASS_ELEMENT_STATE_KO);
                },
                containment: ".hz-dragtobox"//this.QUERY_BOX
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
                $element.draggable( "disable" );
            }

            // colocamos la palabra en el hueco
            $element.addClass(this.CLASS_ELEMENT_PLACED)
                .addClass(evaluate === this.ELEMENT_STATE.OK ? this.CLASS_ELEMENT_STATE_OK : this.CLASS_ELEMENT_STATE_KO).text(element.content);
            $box.data("currentElement", elementId);

            $element.css( {left:0, top:0, position:"inherit" });
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