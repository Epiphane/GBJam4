Juicy.Component.create('Player', {
    constructor: function() {
        this.speed = 200;
    
        this.controls = ['LEFT', 'RIGHT', 'DOWN'];

        this.arrow = new Image();
        this.arrow.src = 'img/arrow.png';

        /** Lets us keep track of what spritesheet direction we're using */
        this.direction = 'IDLE';

        this.arrow = document.createElement('canvas');
        this.arrow_context = this.arrow.getContext('2d');
    },

    score: function() {
        this.entity.state.moveGoal();
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
            sprite.runAnimation(8, 19, 0.16, true);
        }
        else if (this.direction == 'LEFT') {
            sprite.runAnimation(4, 7, 0.016, true);
            sprite.flipped = true;
        }
        else if (this.direction == 'RIGHT') {
            sprite.runAnimation(4, 7, 0.016, true);
        }
        else if (this.direction == 'DOWN') {
            sprite.runAnimation(0, 3, 0.016, true);
        }
    },

    update: function(dt, game) {
        var digger = this.entity.getComponent('Digger');
        var newDirection = 'IDLE';

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

        this.updateAnim(newDirection);

        if (this.entity.state.target.testCollision(this.entity)) {
            this.score();

            Juicy.Sound.play('goal');
        }
    },
    render: function(context) {
        var target = this.entity.state.target;

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
            while (position.sub(pos).length() < arrow_length) {
                var p = pos.floor();

                // Gotta be far away from center
                if (center.sub(p).length() > 10) {
                    setPixel(p, color);
                }

                pos = pos.add(step);
            }

            // We're at the end of the arrow. Draw lines back to make the L shape
            var horiz = step.rotate(Math.PI * 3 / 4);
            var vert  = step.rotate(-Math.PI * 3 / 4);

            for (var dist = 0; dist < 10; dist ++) {
                setPixel(pos.add(horiz.mult(dist)).floor(), color);
                setPixel(pos.add(vert .mult(dist)).floor(), color);
            }
        }

        for (var i = -arrow_width; i <= arrow_width; i ++) {
            for (var j = -arrow_width; j <= arrow_width; j ++) {
                castPixels(center.add(i, j), Palette.get('MID'));
            }
        }

        this.arrow_context.putImageData(arrowData, 0, 0);  

        context.drawImage(this.arrow, (this.entity.width - this.arrow.width) / 2, (this.entity.height - this.arrow.height) / 2);
    }
});
