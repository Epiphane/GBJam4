

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

    var A = 'A'.charCodeAt(0);
    var Z = 'Z'.charCodeAt(0);
    var a = 'a'.charCodeAt(0);
    var z = 'z'.charCodeAt(0);
    var _0 = '0'.charCodeAt(0);
    var _9 = '9'.charCodeAt(0);

    window.UI = Juicy.Component.create('UI', {
        constructor: function(thisEntity) {
            this.textObjects = [];

            this.ui_particles = new Juicy.Entity(this.state, ['ParticleManager']);
        },

        setFontSprite: function(spriteEntity, letterWidth, letterHeight) {
            this.font = spriteEntity.getComponent('ColoredSprite');
            this.font_width = letterWidth;
            this.font_height = letterHeight;

            this.font.setSize(letterWidth, letterHeight);
        },

        addText: function(info) {
            var newText = new Juicy.Entity(this.state, ['TextRender']);
            newText.center     = !!info.center;
            newText.brightness = info.brightness || 0;
            newText.font       = info.font || UI.FONTS.SMALL;
            newText.animate    = info.animate || UI.ANIMATIONS.NONE;

            this.textObjects.push(newText);
        },

        clearText: function() { this.textObjects = []; },

        update: function(dt) {
            this.ui_particles.getComponent('ParticleManager').update(dt);

            for (var i = 0; i < this.textObjects.length; i ++) {
                this.textObjects[i].update(dt);
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
