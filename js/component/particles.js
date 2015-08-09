Juicy.Component.create('ParticleManager', {
    constructor: function() {
        this.pendingParticles = Array();
        this.particles = Array();
    },

    spawnParticles: function(image, size, howMany, timeToLive, initThisParticle, updateParticle) {
        this.howMany = howMany;
        this.updateFunction = updateParticle;

        for (var i = 0; i < this.howMany; i++) {
            var newParticle = {
                life: 30,
                init: initThisParticle,
                updateFuncarino: updateParticle,
            };
            this.pendingParticles.push(newParticle);
            newParticle.timeToLive = timeToLive(newParticle, i);
            newParticle.image = image;
            newParticle.size = size;
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
             context.rect(this.particles[i].x, this.particles[i].y, this.particles[i].size, this.particles[i].size);
            context.fillStyle = "rgba(" + this.particles[i].image + this.particles[i].alpha + 1 + ")"; 
            context.fill();
        }
    },
});
