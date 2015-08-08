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

        if (game.keyDown('SPACE')) {
            this.entity.getComponent('Sprite').goNextFrame();    
        }

        var pad = 0;
        var xpad = 0;
        var tile_manager = this.entity.state.tile_manager;
        this.collisions = [
            new Juicy.Point(xpad - 2, this.entity.height - pad),
            new Juicy.Point(xpad, this.entity.height),
            new Juicy.Point(this.entity.width / 2 + xpad, this.entity.height),
            new Juicy.Point(this.entity.width + xpad, this.entity.height - pad),
        ];

        for (var i = 0; i < this.collisions.length; i ++) {
            this.collisions[i] = this.entity.position.add(this.collisions[i]).mult(1 / tile_manager.TILE_SIZE).floor()
        }

        if (game.keyDown('SPACE')) {
            var tile_manager = this.entity.state.tile_manager;

            var blocksRekt = 0;
            for (var i = 0; i < this.collisions.length; i ++) {
                var pos = this.collisions[i];
                blocksRekt += tile_manager.removeCell(pos.x, pos.y);
            }

            if (blocksRekt > 0) {
                physics.dy -= (4 - blocksRekt) * 10;
            }
        }
    },
    render: function(context) {
        var tile_size = this.entity.state.tile_manager.TILE_SIZE;
        context.fillStyle = 'rgba(255, 0, 0, 0.5)';

        for (var i = 0; i < this.collisions.length; i ++) {
            var collision = this.collisions[i].mult(tile_size).sub(this.entity.position);
            context.fillRect(collision.x, collision.y, tile_size, tile_size)
        }
    }
});
