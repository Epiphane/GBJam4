Juicy.Component.create('BirdManager', {
    constructor: function() {
        this.burds = [];
        this.maxBirdTicks = 120;
        this.ticksTillNextBurd = this.maxBirdTicks;
    },

    update: function(dt) {
        // Update existing burds
        for (var ndx = this.burds.length - 1; ndx >= 0; ndx--) {
            var burd = this.burds[ndx];
            burd.position.x += dt*60;
            burd.getComponent('ColoredSprite').update(dt);

            if (this.entity.state.player.testCollision(burd)) {
                this.burds.splice(ndx, 1);

                sfx.play('quack');
                var startLoc = burd.position.clone();

                this.entity.state.particles.getComponent('ParticleManager').spawnParticles({
                    color: "MID", 
                    size: 4, 
                    howMany: 60, 
                    timeToLive: function(particle, ndx) {
                        return Math.random() * 10;
                    },
                    initParticle: function(particle) {
                        particle.x = startLoc.x;
                        particle.y = startLoc.y;

                        particle.dx = Math.random() * 6 - 3;
                        particle.dy = Math.random() * 5 - 4;

                        particle.startLife = Math.random() * 46;
                        particle.life = particle.startLife;
                    },
                    updateParticle: function(particle) {
                        particle.x += particle.dx;
                        particle.y += particle.dy;

                        particle.dx *= 0.99;
                        particle.dy *= 0.99;
                        particle.dy += 0.14;
                    }
                });  
            }
        }

        // Make new burd if not enough burds
        this.ticksTillNextBurd--;
        if (this.ticksTillNextBurd <= 0) {
            this.ticksTillNextBurd = this.maxBirdTicks;
            this.newBurd(); 
        }
    },

    newBurd: function() {
        var newBurd = new Juicy.Entity(this.entity.state, ['ColoredSprite']);

        // Choose random Y
        newBurd.position = new Juicy.Point(-4, 238 + Math.round(-Math.random() * 20));

        newBurd.getComponent('ColoredSprite').setSheet('img/dumb-bird.png', 25, 11);
        newBurd.getComponent('ColoredSprite').flipped = true;
        newBurd.getComponent('ColoredSprite').runAnimation(0, 5, 0.1, true);

        this.burds.push(newBurd);
    },

    render: function(context) {
        for (var ndx = 0; ndx < this.burds.length; ndx++) {
            var burd = this.burds[ndx];
            burd.render(context);
        }
    },
});
