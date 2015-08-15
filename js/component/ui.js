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
        constructor: function() {
            this.textObjects = [];
//             this.generatePlaceName();
        },

        setFontSprite: function(spriteEntity, letterWidth, letterHeight) {
            this.font = spriteEntity.getComponent('ColoredSprite');
            this.font_width = letterWidth;
            this.font_height = letterHeight;

            this.font.setSize(letterWidth, letterHeight);
        },

        addText: function(info) {
            info.center     = !!info.center;
            info.brightness = info.brightness || 0;
            info.font       = info.font || UI.FONTS.SMALL;
            info.animate    = info.animate || UI.ANIMATIONS.NONE;

            info.animationTicks = -10;

            this.textObjects.push(info);
        },

        clearText: function() { this.textObjects = []; },

        update: function() {
            for (var i = 0; i < this.textObjects.length; i ++) {
                this.textObjects[i].animationTicks++;
                if (this.textObjects.remove) {
                    this.textObjects.splice(i--, 1);
                }
            }
        },

        render: function(context) {
            for (var ndx = 0; ndx < this.textObjects.length; ndx++) {
                var textObject = this.textObjects[ndx];
                var drawPosition = textObject.position.floor();

                var font = fonts[textObject.font];

                // Go through each character of the string
                var currString = textObject.text;
                if (textObject.center) {
                    drawPosition.x -= currString.length * font.width / 2;
                }

                // Draw background for text
                if (textObject.noBG != true) {
                    if (textObject.brightness > 0) {
                        context.fillStyle = Palette.get('DARK');
                        context.fillRect(drawPosition.x - font.pad, drawPosition.y - font.pad, currString.length * font.width + font.pad, font.height + font.pad);
                    }
                    else if (textObject.brightness) {
                        context.fillStyle = Palette.get('LIGHT');
                        context.fillRect(drawPosition.x - font.pad, drawPosition.y - font.pad, currString.length * font.width + font.pad, font.height + font.pad);
                    }
                }

                // Animation nonsense:

                for (var c = 0; c < currString.length; c++) {
                    var charCode = currString.charCodeAt(c);

                    var offset = Math.max(1, c - textObject.animationTicks);
//                     if (textObject.animationTicks / 20 > c) {
                        if (charCode != 32) {
                            this.drawCharacter(charCode, context, font, textObject.brightness-1, drawPosition, 0);
                            this.drawCharacter(charCode, context, font, textObject.brightness, drawPosition, offset);
                        }
//                     }
        
                    drawPosition.x += font.width;
                }
            }
        },

        drawCharacter: function(charCode, context, font, brightness, drawPosition, offset) {
            if (charCode >= A && charCode <= Z) {
                charCode -= A;
            }
            else if (charCode >= a && charCode <= z) {
                charCode -= a;
            }
            else if (charCode >= _0 && charCode <= _9) {
                charCode -= _0;
                charCode += 25; // To go to numbers
            }

            context.drawImage(font.font, charCode * font.width, brightness * font.height, font.width, font.height,
                drawPosition.x + offset, drawPosition.y - offset, font.width, font.height);
        }

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
