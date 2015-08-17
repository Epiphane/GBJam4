(function() {
    var fonts = [];

    function Font(name, src, width, height) {
        var font = this.font = document.createElement('canvas');

        var image = new Image();
            image.src = src;
            image.onload = function() {
                Palette.applyPalette(this, font);
            };

        this.name = name;
        this.pad = 1;
        this.width = width;
        this.height = height;
    }

    fonts.push(new Font('SMALL', 'img/font.png', 4, 6));
    fonts.push(new Font('BIG', 'img/big-font.png', 6, 9));
    fonts.push(new Font('SPECIAL', 'img/special-font.png', 10, 10));

    fonts[2].pad = 0;

    var A = 'A'.charCodeAt(0);
    var Z = 'Z'.charCodeAt(0);
    var a = 'a'.charCodeAt(0);
    var z = 'z'.charCodeAt(0);
    var _0 = '0'.charCodeAt(0);
    var _9 = '9'.charCodeAt(0);
    var exclaim = '!'.charCodeAt(0);
    var question = '?'.charCodeAt(0);

    window.TEXT = Juicy.Component.create('TextRender', {
        constructor: function(myEntity) {
            this.animationTicks = 0;
            this.delayPerCharacter = 8;
            this.animationMaxFrames = 10;

            this.font = fonts[0];
            this.particles = new Juicy.Entity(myEntity.state, ['ParticleManager'])
        },

        setText: function(text) {
            this.text = text;
            
            // Tracks where each character is in its animation cycle
            this.characterAnim = Array(text.length);
            for (var ndx = 0; ndx < text.length; ndx++) {
                this.characterAnim[ndx] = 0;
            }
        },

        set: function(info) {
            if (typeof(info.font) === 'string') {
                info.font = TEXT.FONTS[info.font]; // For super easy shorthand fonts ('BIG', 'SPECIAL')
            }

            this.center         = !!info.center;
            this.brightness     = info.brightness || 0;
            this.showBackground = info.showBackground || false;
            this.offset         = info.offset || Juicy.Point.create();
            this.animate        = info.animate || TEXT.ANIMATIONS.DRAMATIC;
            
            this.delayPerCharacter = info.delayPerCharacter || 2;

            this.setFont(info.font || TEXT.FONTS.SMALL);
            this.setText(info.text || '');

            return this;
        },

        setFont: function(font) {
            if (typeof(font) === 'string') {
                font = TEXT.FONTS[font];
            }

            this.font = fonts[font];
        },

        update: function(dt) {
            this.animationTicks++;

            for (var ndx = 0; ndx < this.characterAnim.length; ndx++) {
                if (ndx < this.animationTicks / this.delayPerCharacter) {
                    this.characterAnim[ndx]++;
                }
            }
        },

        render: function(context) {
            if (this.text === '') {
                return;
            }

            var drawPosition = this.offset.clone();

            // Go through each character of the string
            if (this.center) {
                drawPosition.x -= this.text.length * this.font.width / 2;
            }
            var startX = drawPosition.x;

            // Draw background for text
            if (this.showBackground) {
                if (this.brightness > 0) {
                    context.fillStyle = Palette.getStyle('DARK');
                    context.fillRect(drawPosition.x - this.font.pad, drawPosition.y - this.font.pad, this.text.length * this.font.width + this.font.pad, this.font.height + this.font.pad);
                }
                else {
                    context.fillStyle = Palette.getStyle('LIGHT');
                    context.fillRect(drawPosition.x - this.font.pad, drawPosition.y - this.font.pad, this.text.length * this.font.width + this.font.pad, this.font.height + this.font.pad);
                }
            }

            switch (this.animate) {
            // NONE
            case TEXT.ANIMATIONS.NORMAL: 
                this.normalRender(context, drawPosition);
                break;
            // SLIDE
            case TEXT.ANIMATIONS.SLIDE:
                // TODO
                break;
            // DRAMATIC
            case TEXT.ANIMATIONS.DRAMATIC:
                this.dramaticRender(context, drawPosition);
                break;
            }
        },

        normalRender: function(context, drawPosition) {
            for (var c = 0; c < this.text.length; c++) {
                var charCode = this.text.charCodeAt(c);

                if (charCode != 32) {
                    this.drawCharacter(charCode, context, this.font, this.brightness, drawPosition, 0);
                    this.drawCharacter(charCode, context, this.font, this.brightness-1, drawPosition + 1, -1);
                }

                drawPosition.x += this.font.width;
            }
        },

        dramaticRender: function(context, drawPosition) {
            for (var c = 0; c < this.text.length; c++) {
                var charCode = this.text.charCodeAt(c);

                var animFrame = this.characterAnim[c];

                if (animFrame == 4) {
                    if (charCode != 32) {
                        sfx.play('textBonk');
                    }
                }

                if (animFrame == 8) {
                    var currNdx = c;
                    var self = this;

                    this.particles.getComponent('ParticleManager').spawnParticles({
                        color: "LIGHT", 
                        size: 2, 
                        howMany: 8, 
                        timeToLive: function(particle, ndx) {
                            return 0;
                        },
                        initParticle: function(particle) {
                            particle.x = currNdx*self.font.width + Math.random() * self.font.width + startX;
                            particle.y = drawPosition.y + Math.random() * self.font.height;

                            particle.dx = Math.random() * 2 - 1;
                            particle.dy = Math.random() * 6 - 2.8;

                            particle.startLife = 4;
                            particle.life = particle.startLife;
                        },
                        updateParticle: function(particle) {
                            particle.x += particle.dx;
                            particle.y += particle.dy;
                        }
                    });
                }

                var shakeIt = (animFrame < 9);
                var offset = Math.max(1, animFrame);

                if (animFrame > 0) {
                    if (shakeIt) {
                        context.save();
                        context.translate(Math.random() * 2 - 1, Math.random() * 2 - 1);
                    }
                    if (charCode != 32) {
                        this.drawCharacter(charCode, context, this.font, this.brightness-1, drawPosition, 0);
                        this.drawCharacter(charCode, context, this.font, this.brightness, drawPosition, offset);
                    }

                    if (shakeIt) {
                        context.restore();
                    }
                }

                drawPosition.x += this.font.width;
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
                charCode += 26; // To go to numbers
            }
            if (charCode === exclaim) {
                charCode = 36;
            }
            if (charCode === question) {
                charCode = 37;
            }

            context.drawImage(font.font, charCode * font.width, brightness * font.height, font.width, font.height,
                drawPosition.x + offset, drawPosition.y - offset, font.width, font.height);
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
