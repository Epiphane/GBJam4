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
            this.width  = initial_width;
            this.height = 0;
            this.tiles  = [];

            this.chunks = [];
            this.chunk_width  = initial_width;
            this.chunk_height = initial_height * 10;

            for (var j = 0; j < initial_height; j ++) {
                this.addRow(true);
            }
        },
        addRow: function(immediate) {
            for (var i = 0; i < this.width; i ++) {
                if (Math.random() > 0.3) {
                    this.addCell(i, this.height, immediate);
                }
            }

            console.log("adding row", this.height);
            this.height ++;
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
        getChunk: function(y) {
            var chunk_y = Math.floor(y / this.chunk_height);
            return this.chunks[chunk_y];
        },
        blitCell: function(x, y, cell) {
            var chunk_y = Math.floor(y / this.chunk_height);
            if (!this.chunks[chunk_y]) {
                console.log('Adding chunk at', chunk_y);
                var image    = document.createElement('canvas');
                image.width  = this.chunk_width * this.TILE_SIZE;
                image.height = this.chunk_height * this.TILE_SIZE;

                this.chunks[chunk_y] = image;
            }
            var chunk = this.chunks[chunk_y].getContext('2d');

            chunk.drawImage(cell, x * this.TILE_SIZE, (y - chunk_y) * this.TILE_SIZE);
        },
        removeCell: function(x, y) {
            if (this.tiles[y]) {
                if (!this.tiles[y][x]) return;

                this.tiles[y][x] = false;
            }

            this.getChunk(y).getContext('2d').clearRect(x * this.TILE_SIZE, y * this.TILE_SIZE, this.TILE_SIZE, this.TILE_SIZE);
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
            for (var i = 0; i < this.chunks.length; i ++) {
                context.drawImage(this.chunks[i], 0, i * this.chunk_height * this.TILE_SIZE);
            }
        }
    });
})();