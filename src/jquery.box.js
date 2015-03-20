(function($){
	
	$.fn.box = function(options)
	{
		return this.each(function() {
			$.box({element: $(this)}, options);
		});
	}
	
	$.box = function(content, options) {
		
		var options = $.extend({}, $.box.defaults, options);
		
		var loadingImage = new Image();
		var $loadingImage = $(loadingImage);
		
		$loadingImage.load(function() {
			
			$loadingImage.width(loadingImage.width);
			$loadingImage.height(loadingImage.height);
			
			console.log('image loaded');
			
			if( content.element ) {
				
				//
				// Open a new box for which the content is an element
				//
				new Box(content.element, $loadingImage, options);
				
			} else if( content.image ) {
				
				//
				// Open a new box for with the content is an image
				//
				var img = new Image();
				var $img = $(img);
				
				// Create the box when the image is fully loaded
				$img.load(function() {
					$img.width(img.width);
					$img.height(img.height);
					
					$.box.data($img, options.id);
					$.box.center(id);
				});
				
				// Set the url of the image
				$img.attr('src', content.image);
				
				new Box($loadingImage, $loadingImage, options);
				
			} else if( content.url ) {
				
				//
				// Open a new box when the url is loaded using AJAX
				//
				var optionsCopy2 = options
				optionsCopy2.loaded = function() {
				  
					var success = options.success;
					
					var optionsCopy = options;
					optionsCopy.url = content.url;
					optionsCopy.success = function(data) {
						$('#'+options.id+' .'+options.decoratorContentClass).html(data);
						$.box.data(data, id)
						$.box.center(id);
						success(data);
					}
					
					console.log("ajax send...")
					$.ajax(optionsCopy);
				}
				
				// Open box
				console.log("open box with loading image");
				new Box($loadingImage, $loadingImage, optionsCopy2);
				
			} else { // simple html
				
				new Box(content, $loadingImage, options);
				
			}
		});
		
		$loadingImage.attr('src', options.loadingImageUrl);
	}
	
	//
	// Update the data of the box
	//
	$.box.data = function(data, id) {
		$(document).trigger('box.data', {'id': id});
	}
	
	//
	// Center the box
	//
	$.box.center = function(id) {
		$(document).trigger('box.center', {'id': id});
	}
	
	//
	// Close the box
	//
	$.box.close = function(id) {
		$(document).trigger('box.close', {'id': id});
	}
	
	//
	// Indicate the box as loading
	//
	$.box.loading = function(id) {
		console.log('loading box of '+id);
		$(document).trigger('box.loading', {'id': id});
	}

	//
	// Box prototype !
	// When calling this, we supposed that the loading image and the 
	// content is already loaded !
	//
	function Box(content, $loadingImage, options)
	{
		this.options = options;
		this.content = content;
		this.$box = null;
		this.$glass = null;
		this.$container = null;
		
		this.$loadingImage = $loadingImage;
		
		this.make_box();
	};
	
	Box.prototype = {
		make_box: function() {
			var self = this;
			
			// Get the container
			this.$container = $('body');
			if( this.options.container != null ) {
				this.$container = this.options.container;
			}
			
			// glass
			if( $('.'+this.options.glassClass).length == 0 ) {
				this.$glass = $('<div />').addClass(this.options.glassClass).mousedown(function(){
					$(document).trigger('box.close', {'id': self.options.id});
				});
				this.$container.append(this.$glass);
				
			} else {
				this.$glass = $('.'+this.options.glassClass);
			}
			
			// Constructs or get the box
			// append to container if new
			this.$box = null;
			if( typeof this.options.id == 'string' ) {

				if( $('#'+this.options.id).length == 0 ) {
					this.$box = $('<div />')
						.addClass(this.options.boxClass)
						.attr('id', this.options.id);
					this.$container.append(this.$box);
				} else {
					this.$box = $('#'+this.options.id);
				}

			} else {
				this.$box = $('<div />').addClass(this.options.boxClass);
				this.$container.append(this.$box);
			}

			// Set the content of the box.
			if( typeof this.options.decorator == 'string' ) {
				
				var $decorator = $(this.options.decorator);
				
				$decorator.find('.'+this.options.decoratorContentClass).html(this.content);

				this.$box.html($decorator.html());
			} else {
				this.$box.html(content);
			}

			// Update the z-index css property
			if( typeof this.options.zIndex == 'number' ) {
				this.$box.css({
					'z-index': this.options.zIndex
				});
			}

			// Update the box position
			this.center();

			this.open();
			
			var self = this;
			$(document).bind('box.open', function(e, data) {
				if( data.id == self.options.id ) {
					self.open();
				}
				
			});
			
			$(document).bind('box.close', function(e, data) {
				if( data.id == self.options.id ) {
					self.close();
				}
			});
			
			$(document).bind('box.center', function(e, data) {
			  if( data.id == self.options.id ) {
				self.center();
			  }
			});
			
			$(document).bind('box.loading', function(e, data) {
			  console.log('box loading received');
			  if( data.id == self.options.id ) {
			    console.log('set data loading image');
				self.data(self.$loadingImage);
			  }
			})
			
			$(document).bind('keydown', function(e) {
				
				if( e.keyCode == 27 ) { // escape
					self.close();
				}
				
			});
			
			this.options.loaded();
		},
		data: function(data) {
			console.log('update the box content data');
			this.$box.find('.'+this.options.decoratorContentClass).html(data);
		},
		open: function() {
			this.$glass.show();
			this.$box.fadeIn();
			
		},
		close: function() {
			this.$glass.fadeOut();
			this.$box.fadeOut();
		},
		center: function() {
		  
		  this.$box.css({
			'left': (this.$container.width()/2 - this.$box.width()/2)+'px',
			'top': (this.$container.height()/2 - this.$box.height()/2)+'px'
		  });
		}
	};

	$.box.defaults = {
		boxClass: 'box',
		zIndex: null,
		container: null,
		id: ''+new Date().getTime(),
		decorator: '\
		<div> \
		  <div class="popup"> \
			<table> \
			  <tbody> \
				<tr> \
				  <td class="tl"/><td class="b"/><td class="tr"/> \
				</tr> \
				<tr> \
				  <td class="b"/> \
				  <td class="body"> \
					<div class="box_content"> \
					</div> \
				  </td> \
				  <td class="b"/> \
				</tr> \
				<tr> \
				  <td class="bl"/><td class="b"/><td class="br"/> \
				</tr> \
			  </tbody> \
			</table> \
		  </div> \
		</div>',
		loaded: function() {},
		decoratorContentClass: 'box_content',
		containerHBorder: 0,
		containerVBorder: 0,
		glassClass: 'box_glass',
		loadingImageUrl: 'loading.gif'
	};
	
})(jQuery);