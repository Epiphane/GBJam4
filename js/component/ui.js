

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
            info.center     = !!info.center;
            info.brightness = info.brightness || 0;
            info.font       = info.font || UI.FONTS.SMALL;
            info.animate    = info.animate || UI.ANIMATIONS.NONE;

            info.animationTicks = -10;

            this.textObjects.push(info);
        },

        clearText: function() { this.textObjects = []; },

        update: function(dt) {
            this.ui_particles.getComponent('ParticleManager').update(dt);

            for (var i = 0; i < this.textObjects.length; i ++) {
                this.textObjects[i].animationTicks++;
                if (this.textObjects[i].remove) {
                    this.textObjects.splice(i--, 1);
                }
            }
        },

        render: function(context) {
            this.ui_particles.getComponent('ParticleManager').render(context);

            for (var ndx = 0; ndx < this.textObjects.length; ndx++) {
                var textObject = this.textObjects[ndx];
                var drawPosition = textObject.position.floor();

                var font = fonts[textObject.font];

                // Go through each character of the string
                var currString = textObject.text;
                if (textObject.center) {
                    drawPosition.x -= currString.length * font.width / 2;
                }
                var startX = drawPosition.x;

                // Draw background for text
                if (textObject.noBG != true) {
                    if (textObject.brightness > 0) {
                        context.fillStyle = 'rgba(' + Palette.get('DARK').join(',') + ')';
                        context.fillRect(drawPosition.x - font.pad, drawPosition.y - font.pad - 1, currString.length * font.width + font.pad * 2, font.height + font.pad * 2);
                    }
                    else if (textObject.brightness) {
                        context.fillStyle = 'rgba(' + Palette.get('LIGHT').join(',') + ')';
                        context.fillRect(drawPosition.x - font.pad, drawPosition.y - font.pad - 1, currString.length * font.width + font.pad * 2, font.height + font.pad * 2);
                    }
                }

                // Animation nonsense:
                for (var c = 0; c < currString.length; c++) {
                    var charCode = currString.charCodeAt(c);

                    var textTiming = c*8 - textObject.animationTicks*2 + 10;

                    if (textTiming == 4) {
                        if (charCode != 32) {
                            sfx.play('textBonk');
                        }
                    }

                    if (textTiming == 8) {
                        var currNdx = c;
                        var self = this;

                        this.ui_particles.getComponent('ParticleManager').spawnParticles({
                            color: "LIGHT", 
                            size: 2, 
                            howMany: 8, 
                            timeToLive: function(particle, ndx) {
                                return 0;
                            },
                            initParticle: function(particle) {
                                particle.x = currNdx*font.width + Math.random() * font.width + startX;
                                particle.y = drawPosition.y + Math.random() * font.height;

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

                    var shakeIt = (textTiming > -7);
                    var offset = Math.max(1, textTiming);

                    if (textObject.animationTicks*2 > c*8) {
                        if (shakeIt) {
                            context.save();
                            context.translate(Math.random() * 2 - 1, Math.random() * 2 - 1);
                        }
                        if (charCode != 32) {
                            this.drawCharacter(charCode, context, font, textObject.brightness-2, drawPosition, 0);
                            this.drawCharacter(charCode, context, font, textObject.brightness, drawPosition, offset);
                        }

                        if (shakeIt) {
                            context.restore();
                        }
                    }
        
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
                charCode += 26; // To go to numbers
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
