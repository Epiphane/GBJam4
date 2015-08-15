Juicy.Component.create('TextRender', {
    constructor: function(myEntity) {
        this.animationTicks = -10;
    },

    update: function(dt) {
        this.animationTicks++;
    },

    render: function(context) {
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

            var textTiming = c*16 - textObject.animationTicks*2 + 10;

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

            if (textObject.animationTicks*2 > c*16) {
                if (shakeIt) {
                    context.save();
                    context.translate(Math.random() * 2 - 1, Math.random() * 2 - 1);
                }
                if (charCode != 32) {
                    this.drawCharacter(charCode, context, font, textObject.brightness-1, drawPosition, 0);
                    this.drawCharacter(charCode, context, font, textObject.brightness, drawPosition, offset);
                }

                if (shakeIt) {
                    context.restore();
                }
            }

            drawPosition.x += font.width;
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
    },

        

        
}
