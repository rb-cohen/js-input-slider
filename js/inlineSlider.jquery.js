$.fn.inlineSlider = function(options) {
    return this.each(function() {
        var slider = {
            init: function(input, options) {
                var defaults = {
                    width: 200,
                    inputWidth: 40,
                    min: 0,
                    max: 1000,
                    step: 1,
                    onChange: null,
                    onMove: null,
                    onDragStart: null,
                    onDragEnd: null,
                    onScrollStart: null,
                    onScrollEnd: null
                };
                this.options = $.extend(defaults, options);
                this.$input = $(input);
                var $slider = $('<div class="inlineSlider"><div class="slider" /></div>');
                this.$input.wrap($slider);
                this.$input.before('<div class="arrow arrow-left" />');
                this.$input.after('<div class="arrow arrow-right" />');
                this.$slider = this.$input.parent('.slider');
                this.$slider.wrap('<div class="container" />');
                this.$track = $('<div class="track"><div class="line" /></div>');
                this.$slider.before(this.$track);
                this.$input.css('width', this.options.inputWidth + 'px');
                this.$track.css('width', this.options.width + 'px');
                var inputMin = this.$input.attr('data-min');
                if (inputMin)
                    this.options.min = parseFloat(inputMin);
                var inputMax = this.$input.attr('data-max');
                if (inputMax)
                    this.options.max = parseFloat(inputMax);
                var inputStep = this.$input.attr('data-step');
                if (inputStep)
                    this.options.step = parseFloat(inputStep);
                this.registerEvents();
                this.jumpToCurrentValue();
            },
            registerEvents: function() {
                var self = this;
                this.$input.bind('change', function() {
                    self.jumpToCurrentValue();
                    self.trigger('onChange');
                });
                this.$slider.find('.arrow').bind('mousedown', function(event) {
                    event.preventDefault();
                    self.startDragging(event);
                });
                this.$track.bind('mousedown', function(event) {
                    event.preventDefault();
                    self.startScrolling(event);
                });
            },
            startDragging: function(event) {
                var self = this;
                this.offset = [event.pageX, event.pageY];
                this.pos = this.$slider.position();

                this.trigger('onDragStart');

                $(document).bind('mouseup.inlineSlider', function(event) {
                    self.stopDragging.call(self, event);
                });
                $(document).bind('mousemove.inlineSlider', function(event) {
                    self.calculateDragDelta.call(self, event);
                });
                this.$input.focus();
            },
            stopDragging: function() {
                $(document).unbind('mouseup.inlineSlider mousemove.inlineSlider');
                this.offset = null;
                this.pos = null;

                this.trigger('onDragEnd');
                this.trigger('onChange');
            },
            calculateDragDelta: function(event) {
                if (this.offset) {
                    var delta = event.pageX - this.offset[0];
                    var position = this.pos.left + delta;
                    this.setPosition(position);
                }
            },
            startScrolling: function(event) {
                var self = this;
                this.scrollTo = [event.pageX, event.pageY];

                this.trigger('onScrollStart');

                $(document).bind('mouseup.inlineSlider', function(event) {
                    self.stopScrolling.call(self, event);
                });
                $(document).bind('mousemove.inlineSlider', function(event) {
                    self.scrollTo = [event.pageX, event.pageY];
                });
                this.scroll();
            },
            stopScrolling: function() {
                $(document).unbind('mouseup.inlineSlider mousemove.inlineSlider');
                this.scrollTo = null;
                clearTimeout(this.scrollTimeout);

                this.trigger('onScrollEnd');
                this.trigger('onChange');
            },
            scroll: function() {
                if (this.scrollTo) {
                    var self = this;
                    var offset = this.$slider.offset();
                    var position = this.$slider.position();
                    var max = this.$track.width() / 10;
                    var delta = this.scrollTo[0] - offset.left - this.$slider.outerWidth() / 2;
                    var move = (delta < 0) ? Math.max(delta, max * -1) : Math.min(delta, max);
                    this.setPosition(position.left + move);
                    this.scrollTimeout = setTimeout(function() {
                        self.scroll();
                    }, 150);
                }
            },
            jumpToCurrentValue: function() {
                var value = this.parseValue(this.$input.val());
                var position = this.calculatePosition(value);

                this.moveSliderTo(position);
                this.$input.val(value);
            },
            parseValue: function(value) {
                value = parseFloat(value);
                if (value <= this.options.min) {
                    value = this.options.min;
                }

                if (value >= this.options.max) {
                    value = this.options.max;
                }

                if (this.options.step) {
                    var remainder = value % this.options.step;
                    value = value - remainder;
                }

                return value;
            },
            getValue: function() {
                return parseFloat(this.$input.val());
            },
            updateInputValue: function(value) {
                value = this.parseValue(value);

                var currentValue = this.getValue();
                if (currentValue !== value) {
                    this.$input.val(value);
                    this.trigger('onMove');
                }
            },
            trigger: function(event) {
                if (this.options[event]) {
                    this.options[event](this);
                }
            },
            calculatePosition: function(value) {
                var range = this.options.max - this.options.min;
                var width = this.$track.width();
                var ratio = width / range;
                return value * ratio - this.$slider.outerWidth() / 2;
            },
            calculateValue: function(position) {
                var range = this.options.max - this.options.min;
                var width = this.$track.width();
                var ratio = range / width;
                var value = (position + this.$slider.outerWidth() / 2) * ratio;
                value = parseFloat(value);
                if (value <= this.options.min) {
                    value = this.options.min;
                }

                if (value >= this.options.max) {
                    value = this.options.max;
                }

                return value;
            },
            setPosition: function(position) {
                var offset = this.$slider.outerWidth() / 2;
                position = Math.max(0 - offset, position);
                position = Math.min(position, this.$track.width() - offset);

                var value = this.calculateValue(position);
                this.moveSliderTo(position);
                this.updateInputValue(value);
            },
            moveSliderTo: function(position) {
                this.$slider.css('left', position + 'px');
            }
        };

        slider.init(this, options);
    });
};