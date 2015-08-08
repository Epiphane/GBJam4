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
    }
});