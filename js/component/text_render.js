
var A = 'A'.charCodeAt(0);
var Z = 'Z'.charCodeAt(0);
var a = 'a'.charCodeAt(0);
var z = 'z'.charCodeAt(0);
var _0 = '0'.charCodeAt(0);
var _9 = '9'.charCodeAt(0);

Juicy.Component.create('TextRender', {
    constructor: function(myEntity) {
        this.animationTicks = -10;
        this.delayPerCharacter = 8;
    },

    setText: function(text) {
        this.text = text;
        
        // Tracks where each character is in its animation cycle
        this.characterAnim = Array(text.length);
        for (var ndx = 0; ndx < text.length; ndx++) {
            this.characterAnim[ndx] = 0;
        }
    },

    update: function(dt) {
        this.animationTicks++;
        // TODO: magic where we correctly update the characterAnim array.  Fun programming puzzle!
    },

    render: function(context) {
        var drawPosition = this.entity.position.floor();

        // Go through each character of the string
        if (this.center) {
            drawPosition.x -= this.text.length * this.font.width / 2;
        }
        var startX = drawPosition.x;

        // Draw background for text
        if (this.showBackground) {
            if (this.brightness > 0) {
                context.fillStyle = Palette.get('DARK');
                context.fillRect(drawPosition.x - this.font.pad, drawPosition.y - this.font.pad, this.text.length * this.font.width + this.font.pad, this.font.height + this.font.pad);
            }
            else if (this.brightness) {
                context.fillStyle = Palette.get('LIGHT');
                context.fillRect(drawPosition.x - this.font.pad, drawPosition.y - this.font.pad, this.text.length * this.font.width + this.font.pad, this.font.height + this.font.pad);
            }
        }

// Text animation TODO stuff
/*
        switch (this.animate) {
        // NONE
        case 0: 
            this.normalRender(context, drawPosition);
            break;
        // SLIDE
        case 1:
            // TODO
            break;
        // DRAMATIC
        case 2:
            this.dramaticRender();
            break;
        }
*/
        this.normalRender(context, drawPosition);
    },

    normalRender: function(context, drawPosition) {
        for (var c = 0; c < this.text.length; c++) {
            var charCode = this.text.charCodeAt(c);

            if (charCode != 32) {
                this.drawCharacter(charCode, context, this.font, this.brightness-1, drawPosition, 0);
            }

            drawPosition.x += this.font.width;
        }
    },

    // TODO: me
    dramaticRender: function() {
        for (var c = 0; c < this.text.length; c++) {
            var charCode = this.text.charCodeAt(c);

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

            var shakeIt = (textTiming > -7);
            var offset = Math.max(1, textTiming);

            if (textObject.animationTicks*2 > c*16) {
                if (shakeIt) {
                    context.save();
                    context.translate(Math.random() * 2 - 1, Math.random() * 2 - 1);
                }
                if (charCode != 32) {
                    this.drawCharacter(charCode, context, this.font, textObject.brightness-1, drawPosition, 0);
                    this.drawCharacter(charCode, context, this.font, textObject.brightness, drawPosition, offset);
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
            charCode += 25; // To go to numbers
        }

        context.drawImage(font.font, charCode * font.width, brightness * font.height, font.width, font.height,
            drawPosition.x + offset, drawPosition.y - offset, font.width, font.height);
    },
});
