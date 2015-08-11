var sfx = new Juicy.SFX();
sfx.load('goal', 'audio/fx_jump.mp3');

Juicy.Component.create('Goal', {
    constructor: function() {
        this.ticksTillParticle = 10;
    },


    update: function(dt, game) {

        this.ticksTillParticle--;
        if (this.ticksTillParticle <= 0) {
            this.ticksTillParticle = 4;

            var self = this;

            this.entity.state.particles.getComponent('ParticleManager').spawnParticles({
                color: "LIGHT", 
                size: 2, 
                howMany: 1, 
                timeToLive: function(particle, ndx) {
                    return 0;
                },
                initParticle: function(particle) {
                    particle.x = self.entity.position.x + self.entity.width/2;
                    particle.y = self.entity.position.y + self.entity.height/2;
                    
                    particle.dx = Math.random() * 6 - 3;
                    particle.dy = Math.random() * 6 - 5;

                    particle.startLife = 25;
                    particle.life = particle.startLife;
                },
                updateParticle: function(particle) {
                    particle.x += particle.dx;
                    particle.y += particle.dy;

                    particle.dx *= 0.9;
                    particle.dy *= 0.9;

                    particle.dy += 0.11;
                }
            });
        }
    },


    asplode: function() {
        var startLoc = this.entity.position;
        startLoc.x += this.entity.width/2;
        startLoc.y += this.entity.height/2;

        this.entity.state.particles.getComponent('ParticleManager').spawnParticles({
            color: "LIGHT", 
            size: 3, 
            howMany: 60, 
            timeToLive: function(particle, ndx) {
                return Math.random() * 5;
            },
            initParticle: function(particle) {
                particle.x = startLoc.x;
                particle.y = startLoc.y;

                particle.dx = Math.random() * 3 - 1.5;
                particle.dy = Math.random() * 10 - 8;

                particle.startLife = 10 + Math.random() * 60;
                particle.life = particle.startLife;
            },
            updateParticle: function(particle) {
                particle.x += particle.dx;
                particle.y += particle.dy;

                particle.dy += 0.21;
            }
        });  
    },
});
