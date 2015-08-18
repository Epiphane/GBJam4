Juicy.Component.create('Player', {
    constructor: function(myEntity) {
        this.speed = 200;
    
        this.controls = ['LEFT', 'RIGHT', 'DOWN', 'UP'];

        /** Lets us keep track of what spritesheet direction we're using */
        this.direction = 'POOP';

        this.arrow = document.createElement('canvas');
        this.arrow_context = this.arrow.getContext('2d');

        this.health = 8;
        this.baseDmg = 20;

        this.controlPause = 0;
    },
    
    loseLife: function() {
        this.health -= 1;
        // Call death animation + sound?

        if (this.health == 0) {
            this.RIP();
        }
    },

    getHit: function() {
        this.invincible = 1;
        var digger = this.entity.getComponent('Digger');
        digger.controlPause = 0.25;
    },

    RIP: function() {
        this.entity.state.gameOver();
        // probably call some game.setState(gameover) or something
        // idfk i have no idea what im doing
    },

    startIdleAnim: function() {
        this.entity.getComponent('ColoredSprite').runAnimation(8, 19, 0.16, true);
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

    update: function(dt, game) {
        var digger = this.entity.getComponent('Digger');
        var newDirection = 'IDLE';

        if (digger.energy < 0) {
            this.RIP();
        }

        var self = this;

        if (this.invincible > 0) {
            this.invincible -= dt;

            if (this.invincible < 0) {
                this.invincible = 0;
            }
        }

        this.entity.state.particles.getComponent('ParticleManager').spawnParticles({
            color: "LIGHT", 
            size: 1, 
            howMany: 1, 
            timeToLive: function(particle, ndx) {
                return 0;
            },
            initParticle: function(particle) {
                particle.x = self.entity.position.x + self.entity.width*Math.random()*0.35 + 4;
                particle.y = self.entity.position.y + self.entity.height/2 * Math.random() * 0.8 + 5;
                
                particle.dx = -self.entity.getComponent('Physics').dx / 70;
                particle.dy = -self.entity.getComponent('Physics').dy / 70;

                particle.startLife = 5 + Math.random() * 15;
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
            digger.up();
            newDirection = 'UP';
        }

        this.updateAnim(newDirection);

        if (this.entity.target && this.entity.target.testCollision(this.entity)) {
            this.entity.state.getTarget();
        }
    },

    render: function(context) {
        var target = this.entity.target;

        if (!target) {
            return;
        }

        var entity_center = this.entity.center();
        var distanceToTarget = entity_center.sub(target.center());
        var angleToTarget = Math.atan2(distanceToTarget.y, distanceToTarget.x) - Math.PI / 2;

        var arrow_length = Math.min(40, distanceToTarget.length() / 2);
        var arrow_width  = Math.floor(arrow_length / 25);

        this.arrow.width = 2 * (arrow_length * Math.abs(Math.sin(angleToTarget)) + arrow_width *  Math.abs(Math.cos(angleToTarget))) + 10;
        this.arrow.height = 2 * (arrow_width * Math.abs(Math.sin(angleToTarget)) + arrow_length *  Math.abs(Math.cos(angleToTarget))) + 10;

        var arrowData = context.createImageData(this.arrow.width, this.arrow.height);
        var data = arrowData.data;

        function setPixel(point, color) {
            if (point.x < 0 || point.x >= self.arrow.width || point.y < 0 || point.y >= self.arrow.height)
                return;

            var i = 4 * (point.x + point.y * self.arrow.width);
            data[i+0]=color[0];
            data[i+1]=color[1];
            data[i+2]=color[2];
            data[i+3]=color[3];
        }

        var self = this;
        var center = new Juicy.Point(this.arrow.width / 2, this.arrow.height / 2);
        var step = distanceToTarget.mult(-1 / distanceToTarget.length());
        function castPixels(position, color) {
            var pos = position;
            while (position.distance(pos) < arrow_length) {
                var p = pos.floor();

                // Gotta be far away from center
                if (center.distance(p) > 10) {
                    setPixel(p, color);
                }

                p.free();

                pos = pos.add(step);
            }

            // We're at the end of the arrow. Draw lines back to make the L shape
            var horiz = step.rotate(Math.PI * 3 / 4);
            var vert  = step.rotate(-Math.PI * 3 / 4);

            for (var dist = 0; dist < 10; dist ++) {
                setPixel(pos.add(horiz.mult(dist).free())._floor(), color);
                setPixel(pos.add(vert .mult(dist).free())._floor(), color);
            }

            horiz.free();
            vert.free();
        }

        var color = Palette.get('MID');
        for (var i = -arrow_width; i <= arrow_width; i ++) {
            for (var j = -arrow_width; j <= arrow_width; j ++) {
                castPixels(center.add(i, j), color);
            }
        }
        step.free();

        this.arrow_context.putImageData(arrowData, 0, 0);  

        context.drawImage(this.arrow, (this.entity.width - this.arrow.width) / 2, (this.entity.height - this.arrow.height) / 2);
    }
});