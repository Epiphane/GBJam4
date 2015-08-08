var glob = null;

(function() {
    var tile = new Image();
    tile.src = 'img/tile.png';

    Juicy.Point.prototype.floor = function() {
        return new Juicy.Point(Math.floor(this.x), Math.floor(this.y));
    };

    Juicy.Point.prototype.clone = function() {
        return new Juicy.Point(this.x, this.y);
    };

    Juicy.Component.create('TileManager', {
        TILE_SIZE: 10,
        constructor: function(initial_width, initial_height) {
            glob = this;
            console.log(this.TILE_SIZE);
            this.width  = initial_width;
            this.height = initial_height;
            this.tiles  = [];

            this.image = document.createElement('canvas');
            this.ctx   = this.image.getContext('2d');
            this.image.width  = initial_width  * this.TILE_SIZE;
            this.image.height = initial_height * this.TILE_SIZE;

            for (var i = 0; i < this.width; i ++) {
                for (var j = 0; j < this.height; j ++) {
                    if (Math.random() > 0.8) {
                        this.addCell(i, j, true);
                    }
                }
            }
        },
        addCell: function(x, y, immediate) {
            if (!this.tiles[y]) {
                this.tiles[y] = [];
            }

            this.tiles[y][x] = true;

            if (immediate) {
                this.blitCell(x, y, tile);
            }
        },
        blitCell: function(x, y, cell) {
            if ((x + 1) * this.TILE_SIZE > this.image.width) {
                this.image.width = (x + 1) * this.TILE_SIZE;
            }
            if ((y + 1) * this.TILE_SIZE > this.image.height) {
                this.image.height = (y + 1) * this.TILE_SIZE;
            }

            this.ctx.drawImage(cell, x * this.TILE_SIZE, y * this.TILE_SIZE);
        },
        getTile: function(point) {
            point = point.mult(1 / this.TILE_SIZE).floor();

            if (!this.tiles[point.y]) {
                return false;
            }

            return this.tiles[point.y][point.x];
        },
        isTileBlocking: function(point) {
            var tile = this.getTile(point);
            return (tile === true /* || something else that blocks */);
        },
        canMove: function(point, movement) {
            return !this.isTileBlocking(point.add(movement));
        },
        raycast: function(origin, movement, nodebug) {
            var dy = movement.y;
            var dx = movement.x;

            var hit_y = false, hit_x = false;

            var pos = origin;
            if (dy !== 0) { // Vertical
                var dist = Math.abs(dy);
                var step = new Juicy.Point(0, dy / dist); // +1 or -1
                while (dist > 0 && this.canMove(pos, step)) {
                    pos = pos.add(step);
                    dist --;
                }

                if (dist < 0) {
                    // Went too far. Backtrack!
                    pos = pos.add(step.mult(dist));
                }
                else {
                    // Hit a block oh no...
                    if (step.y > 0) 
                        pos.y = Math.ceil(pos.y) - 0.1;
                    else
                        pos.y = Math.floor(pos.y) + 0.1;

                    hit_y = true;
                }
            }

            if (dx !== 0) { // Horizontal
                var dist = Math.abs(dx);
                var step = new Juicy.Point(dx / dist, 0); // +1 or -1
                while (dist > 0 && this.canMove(pos, step)) {
                    pos = pos.add(step);
                    dist --;
                }

                if (dist < 0) {
                    // Went too far. Backtrack!
                    pos = pos.add(step.mult(dist));
                }
                else {
                    // Hit a block oh no...
                    if (step.x > 0)
                        pos.x = Math.ceil(pos.x) - 0.1;
                    else
                        pos.x = Math.floor(pos.x) + 0.1;

                    hit_x = true;
                }
            }

            return origin.sub(pos);
        },
        update: function(dt, game) {

        },
        render: function(context) {
            context.drawImage(this.image, 0, 0);
        }
    });
})();