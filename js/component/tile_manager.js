(function() {
    var tile = new Image();
    tile.src = 'img/tile.png';

    var blitqueue = {};

    Juicy.Point.prototype.floor = function() {
        return new Juicy.Point(Math.floor(this.x), Math.floor(this.y));
    };

    Juicy.Point.prototype.clone = function() {
        return new Juicy.Point(this.x, this.y);
    };

    Juicy.Component.create('TileManager', {
        TILE_SIZE: 2,
        constructor: function(initial_width, initial_height) {
            this.width  = initial_width;
            this.height = 0;
            this.tiles  = [];

            this.chunks = [];
            this.chunk_width  = initial_width;
            this.chunk_height = initial_height * 2;

            for (var j = 0; j < initial_height; j ++) {
                this.addRow(true);
            }
        },
        addRow: function(immediate) {
            for (var i = 0; i < this.width; i ++) {
                if (Math.random() > 0.01) {
                    this.addCell(i, this.height, immediate);
                }
            }

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
        blitCell: function(x, y, cell) {
            var self = this;
            if (!cell.complete) {
                if (!blitqueue[cell.src]) {
                    blitqueue[cell.src] = [];
                    cell.oncomplete = function() {
                        console.log('ayy');
                        var item;
                        while (item = blitqueue[cell.src].shift()) {
                            self.blitCell(item.x, item.y, cell);
                        }
                    }
                }

                blitqueue[cell.src].push({
                    x: x,
                    y: y
                });

                return;
            }

            var chunk_y = Math.floor(y / this.chunk_height);
            if (!this.chunks[chunk_y]) {
                var image    = document.createElement('canvas');
                image.width  = this.chunk_width * this.TILE_SIZE;
                image.height = this.chunk_height * this.TILE_SIZE;

                this.chunks[chunk_y] = {
                    image: image, 
                    context: image.getContext('2d')
                };
            }
            var chunk = this.chunks[chunk_y].context;

            chunk.drawImage(cell, x * this.TILE_SIZE, (y - chunk_y * this.chunk_height) * this.TILE_SIZE);
        },
        removeCell: function(x, y) {
            if (this.tiles[y]) {
                if (!this.tiles[y][x]) return 0;

                this.tiles[y][x] = false;
            }
            else {
                return 0;
            }

            var chunk_y = Math.floor(y / this.chunk_height);
            this.chunks[chunk_y].context.clearRect(x * this.TILE_SIZE, (y - chunk_y * this.chunk_height) * this.TILE_SIZE, this.TILE_SIZE, this.TILE_SIZE);
        
            return 1;
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
        render: function(context, x, y, w, h) {
            var min_chunk_y = Math.floor(y / this.chunk_height / this.TILE_SIZE);
            if (min_chunk_y < 0) min_chunk_y = 0;
            var max_chunk_y = Math.ceil((y + h) / this.chunk_height / this.TILE_SIZE);

            for (var i = min_chunk_y; i < this.chunks.length && i <= max_chunk_y; i ++) {
                context.drawImage(this.chunks[i].image, 0, i * this.chunk_height * this.TILE_SIZE);
            }
        }
    });
})();