/*global jQuery: true*/

(function($, window, undefined) {
	"use strict";

	$.mauer = function(options, callback, element) {
		this.$element = $(element);
		this.$window = $(window);
		this.options = $.extend($.mauer.defaults, options);

		this.init();
		if (typeof callback === 'function') { callback.call(element); }
	};

	$.mauer.defaults = {
		columnWidth: 360,
		gutterWidth: 20,
		gutterHeight: 20,
		filter: undefined,
		initCallback: undefined,
		calculateCallback: undefined,
		mauerCallback: undefined,
		resizeCallback: undefined
	};

	$.mauer.prototype = {
		columns: 0,
		columnWidth: 0,
		containerWidth: 0,
		positions: new Array(0),

		init: function() {
			this.$element.data("mauer", this);
			this.resize();

			var self = this;
			this.$window.bind("resize.mauer", function(){
				self.resize.apply(self);
			});

			if (typeof this.options.initCallback === 'function') {
				this.options.initCallback.call();
			}
		},
		resize: function() {
			// Crunch numbers used in layout
			this.calculate();
			// Position child elements
			this.mauer(this.$element.children().not(this.options.filter));
			// Set the height of the container to based on the contents
			this.$element.height(Math.max.apply(Math, this.positions));
			if (typeof this.options.resizeCallback === 'function') {
				this.options.resizeCallback.call();
			}
		},
		calculate: function() {
			this.columnWidth = this.options.columnWidth;
			this.$element.css("width", "100%");
			this.containerWidth = this.$element.width();

			// Get the appropriate column width if the user supplied a function
			if (typeof this.columnWidth === 'function') {
				this.columnWidth = this.columnWidth.call(this, this.containerWidth);
			}
			this.columns = Math.floor(this.containerWidth / (this.columnWidth + this.options.gutterWidth));
			this.positions = new Array(this.columns);
			var gutterWidths = (this.columns > 0) ? ((this.columns - 1) * this.options.gutterWidth) : 0;
			var columnWidths = (this.columns * this.columnWidth);
			this.$element.css("width", (columnWidths + gutterWidths) + "px");

			// Initialize the array of vertical positions
			for (var i = 0; i < this.columns; i++) {
				this.positions[i] = 0;
			}

			if (typeof this.options.calculateCallback === 'function') {
				this.options.calculateCallback.call();
			}
		},
		calculateColumn: function() {
			var columnIndex = 0,
				leastY = this.positions[0];

			for (var i = 0; i < this.positions.length; i++) {
				if (this.positions[i] < leastY) {
					leastY = this.positions[i];
					columnIndex = i;
				}
			}

			return columnIndex;
		},
		mauer: function($steine) {
			var self = this;

			$steine.each(function(index, element) {
				var $stein = $(element);
				var column = self.calculateColumn();
				var x = (column * (self.columnWidth + self.options.gutterWidth));
				var y = self.positions[column];
				var gross = $stein.height();
				self.positions[column] += (gross + self.options.gutterHeight);

				$stein.css({
					position: "absolute",
					left: x,
					top: y
				});

				$stein.addClass("stein");
			});
		},
		append: function($newElements, callback) {
			this.mauer($newElements.not(this.options.filter));
			if (typeof callback === 'function') {
				callback.call();
			}
		}
	};

	$.fn.mauer = function(options, callback) {
		var type = typeof options;
		var instance = this.data("mauer");

		switch (type) {
			case 'string':	// Function
				var args = Array.prototype.slice.call(arguments, 1);
				instance[options].apply(instance, args);
				if (typeof callback === 'function') {
					callback.apply(instance);
				}
				break;
			default:
			case 'object':	// Map
				if (instance === undefined) {
					instance = new $.mauer(options, callback, this);
				}
				break;
		}
	};
})(jQuery, window);
