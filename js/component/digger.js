Juicy.Component.create('Digger', {
    constructor: function() {
        this.speed = 100;

        this.controlPause = 0;
        this.energy = this.max_energy = 2000;
    },
    destroyObject: function(type) {
        if (type === 'BLOCK') {
            this.energy += 200;
            sfx.play('fuel');
        }
    },
    left: function() {
        this._left = true;
    },
    right: function() {
        this._right = true;
    },
    down: function() {
        this._down = true;
    },
    up: function() {
        this._up = true;
    },
    forCollisionBox: function(callback) {
        var tile_manager = this.entity.state.tile_manager;
        var center = Juicy.Point.create(this.entity.width / 2, this.entity.height / 2);
        var pad = 5;
        for (var x = -pad; x <= this.entity.width + pad; x += tile_manager.TILE_SIZE) {
            for (var y = -pad; y <= this.entity.height + pad; y += tile_manager.TILE_SIZE) {
                if (center.distance(Juicy.Point.temp(x, y)) > 10) continue;

                callback(x, y);
            }
        }
        center.free();
    },
    update: function(dt, game) {
        var physics = this.entity.getComponent('Physics');
        if (!physics)
            return;

        if (this.controlPause) {
            this.controlPause -= dt;

            if (this.controlPause < 0) {
                this.controlPause = 0;
            }
        }
        else {
            physics.dx *= 0.4;

            if (this._left) {
                physics.dx = -this.speed;
            }
            if (this._right) {
                physics.dx = this.speed;
            }
            if (this._down) {
                physics.weight_modifier = 4;
            }
            if (this._up) {
                physics.weight_modifier = 0.4;

                this.energy --;
                this.entity.state.particles.getComponent('ParticleManager').spawnParticles({
                    color: "MID", 
                    size: 3, 
                    howMany: 5, 
                    timeToLive: function(particle, ndx) {
                        return 0;
                    },
                    initParticle: function(particle) {
                        particle.x = self.entity.position.x + self.entity.width*(Math.random()*0.5+0.25);
                        particle.y = self.entity.position.y + self.entity.height;
                        
                        particle.startLife = 5 + Math.random() * 15;
                        particle.life = particle.startLife;
                    },
                    updateParticle: function(particle) {
                        particle.y += 1;
                    }
                });
            }
        }

        // Dig first
        var tile_manager = this.entity.state.tile_manager;
        var blocksRekt = 0;
        var self = this;
        this.forCollisionBox(function(x, y) {
            var pos = self.entity.position.add(x, y)._floor().free();
            blocksRekt += tile_manager.removeCell(pos.x, pos.y, self);
        });

        // Slow down and shoot upwards
        var MAX_UP = 0;
        var upward = blocksRekt * 2 + (this._up && physics.onGround ? 160 : 0);
        if (this._up || (physics.dy - upward > MAX_UP)) {
            physics.dy -= upward;
        }
        else if (physics.dy > MAX_UP && physics.dy - upward < MAX_UP) {
            physics.dy = MAX_UP;
        }

        this._up = this._down = this._left = this._right = false;

        if (this.energy > this.max_energy) {
            this.energy = this.max_energy;
        }
    },
    // render: function(context) {
    //     context.fillStyle = 'rgba(0, 255, 0, 0.5)';
    //     this.forCollisionBox(function(x, y) {
    //         context.fillRect(x, y, 2, 2);
    //     });
    // }
});
