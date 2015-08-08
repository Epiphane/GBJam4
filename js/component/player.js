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

        if (game.keyDown('SPACE')) {
            var tile_manager = this.entity.state.tile_manager;
            var pos = this.entity.position.add(this.entity.width, this.entity.height).mult(1 / tile_manager.TILE_SIZE).floor();
            tile_manager.removeCell(pos.x, pos.y);

            pos = this.entity.position.add(0, this.entity.height).mult(1 / tile_manager.TILE_SIZE).floor();
            tile_manager.removeCell(pos.x, pos.y);

            pos = this.entity.position.add(this.entity.width / 2, this.entity.height).mult(1 / tile_manager.TILE_SIZE).floor();
            tile_manager.removeCell(pos.x, pos.y);

            pos = this.entity.position.add(-1, this.entity.height).mult(1 / tile_manager.TILE_SIZE).floor();
            tile_manager.removeCell(pos.x, pos.y);

            pos = this.entity.position.add(-1, this.entity.height / 2).mult(1 / tile_manager.TILE_SIZE).floor();
            tile_manager.removeCell(pos.x, pos.y);

            pos = this.entity.position.add(this.entity.width, this.entity.height / 2).mult(1 / tile_manager.TILE_SIZE).floor();
            tile_manager.removeCell(pos.x, pos.y);
        }
    }
});
