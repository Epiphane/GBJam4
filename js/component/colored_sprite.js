(function() {
    Juicy.Components.Sprite.create('ColoredSprite', {
        
        constructor: function(entity) {
            var self = this;

            Juicy.Components.Sprite.prototype.constructor.apply(this, arguments);

            this.template  = this.image;
            this.palette   = 1;
            var old_onload = this.template.onload;
            this.template.onload = function() {
                old_onload.apply(this /* template */);

                // Color the image
                Palette.applyPalette(self.template, self.image);
            }

            // Swipe out the old image
            this.image = document.createElement('canvas');
        },

        setImageSrc: function(url) {
            this.template.src = url;
        }

    });
})();
