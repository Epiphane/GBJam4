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
        constructor: function(width) {
            this.tiles  = [];
            this.chunks = [];

            this.width = width * this.TILE_SIZE;
            this.height = 0;

            // For ultimate performance gainz
            this.chunk_width  = 160;
            this.chunk_height = 144;
        },
        getWidth: function() {
            return this.chunks.length * this.chunk_height * this.TILE_SIZE;
        },
        addRow: function(immediate) {
            var newRow = this.tiles[this.height] = [];

            for (var i = 0; i < this.width; i ++) {
                if (Math.random() > 0.01) {
                    this.addCell(i, this.height, immediate);
                }
            }

            this.height ++;
        },
        getCell: function(x, y) {
            if (!this.tiles[y]) {
                this.tiles[y] = [];
            }

            return this.tiles[y][x];
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
        getChunk: function(x, y) {
            var x = Math.floor(x / this.chunk_width);
            var y = Math.floor(y / this.chunk_height);

            if (!this.chunks[y]) {
                this.chunks[y] = [];
            }

            if (!this.chunks[y][x]) {
                var image    = document.createElement('canvas');
                image.width  = this.chunk_width ;
                image.height = this.chunk_height;

                console.log('Creating Chunk', x, y);

                this.chunks[y][x] = {
                    image: image, 
                    context: image.getContext('2d'),
                    x: x,
                    y: y
                };
            }

            return this.chunks[y][x];
        },
        blitCell: function(x, y, cell) {
            var self = this;
            if (!cell.complete) {
                if (!blitqueue[cell.src]) {
                    blitqueue[cell.src] = [];
                    cell.onload = function() {
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

            var chunk = this.getChunk(x, y);

            chunk.context.drawImage(cell, (x % this.chunk_width) * this.TILE_SIZE, (y % this.chunk_height) * this.TILE_SIZE);
        },
        removeCell: function(x, y) {
            x -= (x % this.TILE_SIZE);
            y -= (y % this.TILE_SIZE);
            
            var chunk = this.getChunk(x, y);
            chunk.context.clearRect(x - chunk.x * this.chunk_width, y - chunk.y * this.chunk_height, this.TILE_SIZE, this.TILE_SIZE);
        
            if (this.tiles[y]) {
                if (!this.tiles[y][x]) return 0;

                this.tiles[y][x] = false;
            }
            else {
                return 0;
            }

            var self = this;
            this.entity.state.particles.getComponent('ParticleManager').spawnParticles("255, 255, 255, ", 3, 1, function(particle, ndx) {
                return 0;
            },
            function(particle) {
                particle.x = x;
                particle.y = y;
                var dx = self.entity.state.player.getComponent('Physics').dx;
                var dy = self.entity.state.player.getComponent('Physics').dy;
                var dist = Math.sqrt(dx*dx + dy*dy) * 10;
                particle.dx = -dx / dist + Math.random()*2;
                particle.dy = -dy / dist + Math.random()*2;
                particle.startLife = 5;
                particle.life = particle.startLife;
            },
            function(particle) {
                particle.x += particle.dx;
                particle.y += particle.dy;
                particle.alpha = 1.0;
            });

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
        render: function(context, x, y, w, h) {
            window.rendering = [];
            var chunk_x = Math.floor(x / this.chunk_width);
            var chunk_y = Math.floor(y / this.chunk_height);

            for (var i = chunk_x * this.chunk_width; i < x + w; i += this.chunk_width) {
                for (var j = chunk_y * this.chunk_height; j <= y + h; j += this.chunk_height) {
                    if (j < 0) continue;

                    var chunk = this.getChunk(i, j);
                    window.rendering.push(j, chunk);

                    context.drawImage(chunk.image, i, j);
                }
            }
        }
    });
})();
