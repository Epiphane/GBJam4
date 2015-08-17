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
        // 'HOVER' - hovers up and down
        // 'NONE' - completely stationary
        this.movePattern = 'NONE';

        this.dy = this.dx = 0;
    },

    updateAnim: function(newDirection) {
        if (this.direction === newDirection) {
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
        sfx.play('textBonk');

        this.entity.remove = true;
    },

    update: function(dt, game) {
        var newDirection = 'IDLE';

        if (this.movePattern === 'HOVER') {
            this.hovertime = (this.hovertime || 0) + dt;
            this.dy = 0.1 * Math.sin(this.hovertime * 2);
        
            this.entity.position.y += this.dy;
        }

        var self = this;

        // this.entity.state.particles.getComponent('ParticleManager').spawnParticles({
        //     color: "LIGHT", 
        //     size: 1, 
        //     howMany: 1, 
        //     timeToLive: function(particle, ndx) {
        //         return 0;
        //     },
        //     initParticle: function(particle) {
        //         particle.x = self.entity.position.x + self.entity.width*Math.random()*0.6 + 4;
        //         particle.y = self.entity.position.y + self.entity.height/2;
                
        //         particle.dx = -self.entity.getComponent('Physics').dx / 70;
        //         particle.dy = -self.entity.getComponent('Physics').dy / 70;

        //         particle.startLife = 20;
        //         particle.life = particle.startLife;
        //     },
        //     updateParticle: function(particle) {
        //         particle.x += particle.dx;
        //         particle.y += particle.dy;
        //     }
        // });

        this.updateAnim(newDirection);

        var player = this.entity.state.player;
        if (player.testCollision(this.entity)) {
            // In here, test further for this.weakPoint
            var directionToPlayer = this.entity.center().sub(player.center());

            // if (!player.getComponent('Player').invincible) {
                if (this.weakPoint == 'ALL') {
                    this.health -= player.baseDmg * Math.abs(player.getComponent('Physics').dy/70);
                }

                var physics = player.getComponent('Physics');
                physics.dx = 80;
                physics.dy = Math.abs(physics.dy);
                if (directionToPlayer.x > 0)
                    physics.dx *= -1;
                if (directionToPlayer.y > 0)
                    physics.dy *= -1;

                player.getComponent('Player').getHit();

                this.entity.getComponent('ColoredSprite').clearRect();
            // }
        }

        if (this.entity.getComponent('ColoredSprite').sectionsRemaining() <= 20) {
            this.die(); // TODO: WRITE ME!!!
        }
    }
});
