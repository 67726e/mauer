// Mauer
(function($, window, undefined) {
	$.mauer = function(options, callback, element) {
		this.$element = $(element);
		this.$window = $(window);
		this.options = $.extend($.mauer.defaults, options);

		this.init();
		if (typeof callback === 'function') { callback.call(element); }
	}

	$.mauer.defaults = {
		columnWidth: 360,
		gutterWidth: 0,
		initCallback: undefined,
		calculateCallback: undefined,
		mauerCallback: undefined,
		resizeCallback: undefined
	}

	$.mauer.prototype = {
		columns: 0,
		columnWidth: 0,
		containerWidth: 0,
		positions: new Array(0),

		init: function() {
			this.$element.data("mauer", this);
			this.resize();
			this.$window.bind("resize.mauer", this.resize());

			if (typeof this.options.initCallback === 'function') {
				this.options.initCallback.call();
			}
		},
		resize: function() {
			if (this.columns && this.$steine) {
				for (var i = 0; i < this.columns; i++) {
					this.$steine.removeClass("col-" + i);
				}
			}

			this.calculate();	// Crunch numbers needed for layout
			this.mauer(this.$element.children());	// Position all child elements
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
				this.columnWidth = this.columnWidth.call(this.containerWidth);
			}
			this.columns = Math.floor(this.containerWidth / this.columnWidth);
			this.positions = new Array(this.columns);
			this.$element.css("width", (this.columnWidth * this.columns) + "px");

			// Initialize the array of vertical positions
			for (var i = 0; i < this.columns; i++) {
				this.positions[i] = 0;
			}

			if (typeof this.options.calculateCallback === 'function') {
				this.options.calculateCallback.call();
			}
		},
		mauer: function($steine) {
			var self = this;

			$steine.each(function(index, element) {
				var $stein = $(element);
				var column = (index % self.columns);
				var x = column * self.columnWidth;
				var y = self.positions[column];
				var gross = $stein.height();
				self.positions[column] += gross + 10; // Add 10px top margin

				$stein.css({
					position: "absolute",
					left: x,
					top: y
				});
				$stein.addClass("stein");
				$stein.addClass("col-" + column);
			});
		},
		append: function($newElements, callback) {
			this.mauer($newElements);
			if (typeof callback === 'function') {
				callback.call();
			}
		}
	}

	$.fn.mauer = function(options, callback) {
		var type = typeof options;

		switch (type) {
			case 'string':	// Function
				var args = Array.prototype.slice.call(arguments, 1);
				var instance = this.data("mauer");
				instance[options].apply(instance, args);
				if (typeof callback === 'function') callback.apply(instance);
				break;
			case 'object':	// Map
			default:
				var instance = this.data("mauer");
				if (instance === undefined) {
					instance = new $.mauer(options, callback, this);
				}
				break;

		}
	}
})(jQuery, window);
