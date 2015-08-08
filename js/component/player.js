Juicy.Component.create('Player', {
    constructor: function() {
        this.speed = 50;
    
        this.controls = ['LEFT', 'RIGHT', 'DOWN'];

        this.arrow = new Image();
        this.arrow.src = 'img/arrow.png';
    },
    score: function() {
        this.entity.state.moveGoal();
    },
    update: function(dt, game) {
        var digger = this.entity.getComponent('Digger');

        if (game.keyDown(this.controls[0])) {
            digger.left();
        }
        if (game.keyDown(this.controls[1])) {
            digger.right();
        }
        if (game.keyDown(this.controls[2])) {
            digger.down();
        }

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
