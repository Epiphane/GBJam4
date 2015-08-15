

(function() {
    var fonts = [];

    function Font(src, width, height) {
        var font = this.font = document.createElement('canvas');

        var image = new Image();
            image.src = src;
            image.onload = function() {
                Palette.applyPalette(this, font);
            };

        this.pad = 1;
        this.width = width;
        this.height = height;
    }

    fonts.push(new Font('img/font.png', 4, 6));
    fonts.push(new Font('img/big-font.png', 6, 9));
    fonts.push(new Font('img/special-font.png', 10, 10));

    fonts[2].pad = 0;

    window.UI = Juicy.Component.create('UI', {
        constructor: function(thisEntity) {
            this.textObjects = [];

            this.ui_particles = new Juicy.Entity(this.state, ['ParticleManager']);
        },

        addText: function(info) {
            var newText = new Juicy.Entity(this.state, ['TextRender']);
            var textComp = newText.getComponent('TextRender');
            textComp.center         = !!info.center;
            textComp.brightness     = info.brightness || 0;
            var fontNum             = info.font || UI.FONTS.SMALL;
            textComp.font           = fonts[fontNum];
            textComp.animate        = info.animate || UI.ANIMATIONS.NONE;
            textComp.showBackground = info.showBackground || false;
            textComp.setText(info.text || '');

            newText.position        = info.position;// || new Juicy.Point();

            this.textObjects.push(newText);
        },

        clearText: function() { this.textObjects = []; },

        update: function(dt) {
            this.ui_particles.getComponent('ParticleManager').update(dt);

            for (var i = 0; i < this.textObjects.length; i ++) {
                this.textObjects[i].getComponent('TextRender').update(dt);
                if (this.textObjects.remove) {
                    this.textObjects.splice(i--, 1);
                }
            }
        },

        render: function(context) {
            this.ui_particles.getComponent('ParticleManager').render(context);

            for (var ndx = 0; ndx < this.textObjects.length; ndx++) {
                this.textObjects[ndx].getComponent('TextRender').render(context);
            }
        },
    }, {
        FONTS: {
            SMALL: 0,
            BIG: 1,
            SPECIAL: 2
        },

        ANIMATIONS: {
            NONE: 0,
            DRAMATIC: 1,
            SLIDE: 2,   
        }
    });
})();
