Juicy.Component.create('Digger', {
    constructor: function() {
        this.speed = 100;
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
    up: function() {
        this._up = true;
    },
    forCollisionBox: function(callback) {
        var tile_manager = this.entity.state.tile_manager;
        var center = new Juicy.Point(this.entity.width / 2, this.entity.height / 2);
        var pad = 5;
        for (var x = -pad; x <= this.entity.width + pad; x += tile_manager.TILE_SIZE) {
            for (var y = -pad; y <= this.entity.height + pad; y += tile_manager.TILE_SIZE) {
                if (center.sub(new Juicy.Point(x, y)).length() > 10) continue;

                callback(x, y);
            }
        }
    },
    update: function(dt, game) {
        var physics = this.entity.getComponent('Physics');
        if (!physics)
            return;

        physics.dx *= 0.4;

        if (this._left) {
            physics.dx = -this.speed;
        }
        if (this._right) {
            physics.dx = this.speed;
        }
        if (this._down) {
            physics.weight_modifier = 4;
        }
        if (this._up) {
            physics.weight_modifier = 0.75;
        }

        // Dig first
        var tile_manager = this.entity.state.tile_manager;
        var blocksRekt = 0;
        var self = this;
        this.forCollisionBox(function(x, y) {
            var pos = self.entity.position.add(x, y).floor();
            blocksRekt += tile_manager.removeCell(pos.x, pos.y);
        });

        // Slow down and shoot upwards
        var MAX_UP = 0;
        var upward = blocksRekt * 2;
        if (this._up || (physics.dy - upward > MAX_UP)) {
            physics.dy -= upward;
        }
        else if (physics.dy > MAX_UP && physics.dy - upward < MAX_UP) {
            physics.dy = MAX_UP;
        }

        this._up = this._down = this._left = this._right = false;
    },
    // render: function(context) {
    //     context.fillStyle = 'rgba(255, 0, 0, 0.5)';
    //     this.forCollisionBox(function(x, y) {
    //         context.fillRect(x, y, 2, 2);
    //     });
    // }
});
