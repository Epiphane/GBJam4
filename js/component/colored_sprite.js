(function() {
    Juicy.Components.Sprite.create('ColoredSprite', {
        
        constructor: function(entity) {
            var self = this;

            Juicy.Components.Sprite.prototype.constructor.apply(this, arguments);

            // Swipe out the old image
            this.template  = this.image;
            this.image = document.createElement('canvas');
            this.context = this.image.getContext('2d');

            var old_onload = this.template.onload;
            this.template.onload = function() {
                old_onload.apply(this /* template */);

                // Color the image
                Palette.applyPalette(self.template, self.image);
                self.onupdateimage();
            }

            this.clearRects = false;
            this.rectsRemaining = 0;
            this.clearSize = 4;
        },

        setImageSrc: function(url) {
            this.template.src = url;
        },

        sectionsRemaining: function() {
            if (!this.clearRects) {
                return (this.sprite_width - 2) * (this.sprite_height - 2) / (this.clearSize * this.clearSize);
            }

            return this.rectsRemaining;
        },

        onupdateimage: function() {
            for (var x = 0; x < this.clearRects.length; x ++) {
                for (var y = 0; y < this.clearRects[0].length; y ++) {
                    if (this.clearRects[x][y]) {
                        for (var i = 0; i < this.image.width; i += this.sprite_width) {
                            this.context.clearRect(i + x * this.clearSize, y * this.clearSize, this.clearSize, this.clearSize);
                        }
                    }
                }
            }
        },

        initClearRects: function() {
            this.clearRects = [];
            for (var i = 0; i < this.entity.width / this.clearSize; i ++) {
                this.clearRects[i] = [];
                for (var j = 0; j < this.entity.height / this.clearSize; j ++) {
                    this.clearRects[i][j] = false;
                }
            }

            this.rectsRemaining = (this.sprite_width - 2) * (this.sprite_height - 2) / (this.clearSize * this.clearSize)

            var self = this;
            Palette.onchange.push(function() {
                self.onupdateimage();
            });
        },

        clearRect: function(x, y) {
            if (!this.clearRects) {
                this.initClearRects();
            }

            if (this.rectsRemaining === 0) return;

            var rect = this.rectsRemaining - 1;
            if (!x && !y) {
                do {
                    x = Juicy.rand(this.clearRects.length);
                    y = Juicy.rand(this.clearRects[0].length);
                } while (this.clearRects[x][y]);
            }

            if (this.clearRects[x][y]) {
                return;
            }
            
            this.clearRects[x][y] = true;
            this.rectsRemaining --;

            for (var i = 0; i < this.image.width; i += this.sprite_width) {
                this.context.clearRect(i + x * this.clearSize, y * this.clearSize, this.clearSize, this.clearSize);
            }
        },
    });
})();
