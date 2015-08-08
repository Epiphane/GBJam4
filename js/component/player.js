Juicy.Component.create('Player', {
    constructor: function() {
        this.speed = 50;
    },
    update: function(dt, game) {
        var physics = this.entity.getComponent('Physics');
        if (!physics)
            return;

        physics.dx = 0;

        if (game.keyDown('UP')) {
            physics.jump();
        }
        if (game.keyDown('LEFT')) {
            physics.dx = -this.speed;
        }
        if (game.keyDown('RIGHT')) {
            physics.dx = this.speed;
        }


        if (game.keyDown('UP')) {
            this.entity.position.y -= this.speed * dt;
        }
        if (game.keyDown('DOWN')) {
            this.entity.position.y += this.speed * dt;
        }
        if (game.keyDown('LEFT')) {
            this.entity.position.x -= this.speed * dt;
        }
        if (game.keyDown('RIGHT')) {
            this.entity.position.x += this.speed * dt;
        }
    }
});