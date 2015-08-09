Juicy.Component.create('ParticleManager', {
    constructor: function() {
        this.pendingParticles = Array();
        this.particles = Array();
    },

    /* Required: color, size, howMany, timeToLive, initThisParticle, updateParticle */
    spawnParticles: function(config) {
        this.howMany = config.howMany;
        this.updateFunction = config.updateParticle;

        for (var i = 0; i < this.howMany; i++) {
            var newParticle = {
                life: 30,
                init: config.initParticle,
                updateFuncarino: config.updateParticle,
            };
            this.pendingParticles.push(newParticle);
            newParticle.timeToLive = config.timeToLive(newParticle, i);
            newParticle.color = config.color;
            newParticle.size = config.size;
        }
    },

    initParticle: function(currParticle) {
        this.particles.push(currParticle);
        currParticle.init(currParticle);
    },

    update: function(dt, input) {

        /**
         * Go through the particles that haven't spawned yet and check
         *  if they're ready to go.
         */
        for (var i = this.pendingParticles.length - 1; i >= 0; i--) {
            var currParticle = this.pendingParticles[i];
            if (currParticle.timeToLive < 0) {
                this.initParticle(currParticle);
                this.pendingParticles.splice(i, 1);
            }
            currParticle.timeToLive--;
        }

        /**
         * Loop through the existing particles and call their update function
         */
        for (var i = this.particles.length - 1; i >= 0; i--) {
            if (this.particles[i]) {
                this.particles[i].updateFuncarino(this.particles[i], i, dt);
                this.particles[i].life--;

                if (this.particles[i].life < 0) {
                    this.particles.splice(i, 1);
                }
            }
        }
    },

    render: function(context) {
         context.mozImageSmoothingEnabled = false;
         context.imageSmoothingEnabled = false;
        for (var i = 0; i < this.particles.length; i++) {
            context.beginPath();
            context.rect(Math.round(this.particles[i].x), Math.round(this.particles[i].y), this.particles[i].size, this.particles[i].size);
            context.fillStyle = "rgba(" + Palette.get(this.particles[i].color).join(',') + ")"; 
            context.fill();
        }
    },
});
