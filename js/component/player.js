Juicy.Component.create('Player', {
    constructor: function(myEntity) {
        this.speed = 50;
    
        this.controls = ['LEFT', 'RIGHT', 'DOWN'];

        this.arrow = new Image();
        this.arrow.src = 'img/arrow.png';

        /** Lets us keep track of what spritesheet direction we're using */
        this.direction = 'IDLE';
    },

    score: function() {
        this.entity.state.moveGoal();
    },

    startIdleAnim: function() {
        this.entity.getComponent('Sprite').runAnimation(0, 11, 0.16, true);
    },

    updateAnim: function(newDirection) {
        if (this.direction == newDirection) {
            return;
        }

        this.direction = newDirection;

        if (this.direction == 'IDLE') {
            this.startIdleAnim();
        }
        else if (this.direction == 'LEFT') {
            this.entity.getComponent('Sprite').runAnimation(12, 15, 0.016, true);
        }
        else if (this.direction == 'RIGHT') {
            this.entity.getComponent('Sprite').runAnimation(16, 19, 0.016, true);
        }
        else if (this.direction == 'DOWN') {
            this.entity.getComponent('Sprite').runAnimation(12, 15, 0.016, true);
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
        var distanceToTarget = this.entity.position.sub(this.entity.state.target.position);
        var angleToTarget = Math.atan2(distanceToTarget.y, distanceToTarget.x);

        context.imageSmoothingEnabled = false;
        context.stroke();
        context.save();
        context.translate(this.entity.width / 2, this.entity.height / 2);
        context.rotate(angleToTarget - Math.PI / 2);
        // context.scale(1, 1 - 1 / (1 + distanceToTarget.length() / 100));
        context.drawImage(this.arrow, -this.arrow.width / 2, -this.arrow.height - 10);
        context.restore();
    }
});
