Juicy.Component.create('Digger', {
    constructor: function() {
        this.speed = 50;
    },
    left: function() {
        this._left = true;
    },
    right: function() {
        this._right = true;
    },
    down: function() {
        this._down = true;
    },
    update: function(dt, game) {
        var physics = this.entity.getComponent('Physics');
        if (!physics)
            return;

        physics.dx = 0;

        if (this._left) {
            physics.dx = -this.speed;
        }
        if (this._right) {
            physics.dx = this.speed;
        }

        var tile_manager = this.entity.state.tile_manager;
        this.collisions = [
            new Juicy.Point(-1, this.entity.height),
            new Juicy.Point(0, this.entity.height),
            new Juicy.Point(this.entity.width / 2, this.entity.height),
            new Juicy.Point(this.entity.width - 0.2, this.entity.height),
        ];

        for (var i = 0; i < this.collisions.length; i ++) {
            this.collisions[i] = this.entity.position.add(this.collisions[i]).mult(1 / tile_manager.TILE_SIZE).floor()
        }

        if (this._down) {
            // Dig first
            var tile_manager = this.entity.state.tile_manager;

            var blocksRekt = 0;
            for (var i = 0; i < this.collisions.length; i ++) {
                blocksRekt += tile_manager.removeCell(this.collisions[i].x, this.collisions[i].y);
            }

            // Slow down
            if (blocksRekt > 1) {
                physics.dy -= (4 - blocksRekt) * 10;
            }
            else {
                physics.dy -= blocksRekt * 10;
            }

            // Animate later
            var sprite = this.entity.getComponent('Sprite');
            if (sprite) {
                sprite.goNextFrame()
            }
        }

        this._down = this._left = this._right = false;
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
