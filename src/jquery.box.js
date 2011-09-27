(function($){
    
    $.fn.box = function(options)
    {
        return this.each(function() {
            $.box({element: $(this)}, options);
        });
    }
    
    $.box = function(content, options) {
        var options = $.extend({}, $.box.defaults, options);
        
        if( content.element ) {
            new Box(content.element, options);
        } else if( content.image ) {
            
            var img = new Image();
            var $img = $(img);
            
            $img.load(function(){
               $img.width(img.width);
               $img.height(img.height);
               
               new Box($img, options);
            });

            $img.attr('src', content.image);
            
        } else if( content.url ) {
            
            
            
        } else { // simple html
            
            new Box(content, options);
            
        }
    }
    
    function Box(content, options)
    {
        this.options = options;
        this.content = content;
        this.$box = null;
        this.$glass = null;
        
        this.make_box();
    };
    
    Box.prototype = {
        make_box: function() {
            var self = this;
            
            // Get the container
            var $container = $('body');
            if( this.options.container != null ) {
                $container = this.options.container;
            }
            
            // glass
            if( $('.'+this.options.glassClass).length == 0 ) {
                this.$glass = $('<div />').addClass(this.options.glassClass).css({
                   'width' : $container.outerWidth()-this.options.containerHBorder,
                   'height': $container.outerHeight()-this.options.containerVBorder
                }).mousedown(function(){
                    $(document).trigger('box.close', {'id': self.options.id});
                });
                $container.append(this.$glass);
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
                    $container.append(this.$box);
                } else {
                    this.$box = $('#'+this.options.id);
                }

            } else {
                this.$box = $('<div />').addClass(this.options.boxClass);
                $container.append(this.$box);
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
            this.$box.css({
              'left': ($container.width()/2 - this.$box.width()/2)+'px',
              'top': ($container.height()/2 - this.$box.height()/2)+'px'
            });

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
            
            $(document).bind('keydown', function(e) {
                
                if( e.keyCode == 27 ) { // escape
                    self.close();
                }
                
            });
        },
        open: function() {
            this.$glass.fadeIn();
            this.$box.fadeIn();
            
        },
        close: function() {
            this.$glass.fadeOut();
            this.$box.fadeOut();
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
        decoratorContentClass: 'box_content',
        containerHBorder: 0,
        containerVBorder: 0,
        glassClass: 'box_glass'
    };
    
})(jQuery);