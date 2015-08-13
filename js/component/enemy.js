Juicy.Component.create('Enemy', {
    constructor: function(myEntity) {
        this.speed = 200;
        this.direction = 'IDLE';

        this.health = 100;
        this.baseDmg = 10;

        // Where the enemy can take damage from
        // Not sure how to integrate, but options will be
        // 'ALL', 'TOP', 'BOTTOM', 'LEFT', 'RIGHT', 'PROJECTILE'
        this.weakPoint = 'ALL';

        // Same as above
        // 'AGGRESSIVE_SURFACE' - Towards player on surface
        // 'AGGRESSIVE_FLY' - Towards player; can move freely
        // 'AGGRESSIVE_DIG' - Towards player while digging
        // 'IDLE_SURFACE' - Moves back and forth on surface
        // 'IDLE_FLY' - Moves randomly; can move freely
        // 'IDLE_DIG' - Digs around randomly
        // 'NONE' - completely stationary
        this.movePattern = 'NONE';

    },

    startIdleAnim: function() {
        //this.entity.getComponent('ColoredSprite').runAnimation(8, 19, 0.16, true);
    },

    updateAnim: function(newDirection) {
        if (this.direction == newDirection) {
            return;
        }

        this.direction = newDirection;

        var sprite = this.entity.getComponent('ColoredSprite');
        sprite.flipped = false;
        if (this.direction == 'IDLE') {
            this.entity.visualTransform.scale.x = 1;
            sprite.runAnimation(12, 23, 0.16, true);
        }
        else if (this.direction == 'LEFT') {
            sprite.runAnimation(8, 11, 0.016, true);
            sprite.flipped = true;
        }
        else if (this.direction == 'RIGHT') {
            sprite.runAnimation(8, 11, 0.016, true);
        }
        else if (this.direction == 'DOWN') {
            sprite.runAnimation(0, 3, 0.016, true);
        }
        else if (this.direction == 'UP') {
            sprite.runAnimation(4, 7, 0.016, true);
        }
    },

    die: function() {
        // TODO: WRITE ME!!!
        console.log('oh noes, da enemi is ded');
    },

    update: function(dt, game) {
        var newDirection = 'IDLE';

        var self = this;

        this.entity.state.particles.getComponent('ParticleManager').spawnParticles({
            color: "LIGHT", 
            size: 1, 
            howMany: 1, 
            timeToLive: function(particle, ndx) {
                return 0;
            },
            initParticle: function(particle) {
                particle.x = self.entity.position.x + self.entity.width*Math.random()*0.6 + 4;
                particle.y = self.entity.position.y + self.entity.height/2;
                
                particle.dx = -self.entity.getComponent('Physics').dx / 70;
                particle.dy = -self.entity.getComponent('Physics').dy / 70;

                particle.startLife = 20;
                particle.life = particle.startLife;
            },
            updateParticle: function(particle) {
                particle.x += particle.dx;
                particle.y += particle.dy;
            }
        });

        if (game.keyDown(this.controls[0])) {
            digger.left();
            newDirection = 'LEFT';
        }
        if (game.keyDown(this.controls[1])) {
            digger.right();
            newDirection = 'RIGHT';
        }
        if (game.keyDown(this.controls[2])) {
            digger.down();
            newDirection = 'DOWN';
        }
        if (game.keyDown(this.controls[3])) {
            newDirection = 'UP';
        }

        this.updateAnim(newDirection);

        if (this.entity.state.player.testCollision(this.entity)) {
            // In here, test further for this.weakPoint
            var player = this.entity.state.player;
            if (this.weakPoint == 'ALL') {
                this.health -= player.baseDmg * Math.abs(playerself.entity.getComponent('Physics').dy/70);
            }
        }

        if (this.health <= 0) {
            this.die(); // TODO: WRITE ME!!!
        }
    },
    render: function(context) {
        var entity_center = this.entity.center();
        this.arrow.width = 2 * (arrow_length * Math.abs(Math.sin(angleToTarget)) + arrow_width *  Math.abs(Math.cos(angleToTarget))) + 10;
        this.arrow.height = 2 * (arrow_width * Math.abs(Math.sin(angleToTarget)) + arrow_length *  Math.abs(Math.cos(angleToTarget))) + 10;

        var self = this;
        var center = Juicy.Point.create(this.arrow.width / 2, this.arrow.height / 2);
        var step = distanceToTarget.mult(-1 / distanceToTarget.length()).free();

        for (var i = -arrow_width; i <= arrow_width; i ++) {
            for (var j = -arrow_width; j <= arrow_width; j ++) {
                castPixels(center.add(i, j).free(), Palette.get('MID'));
            }
        }
    }
});
