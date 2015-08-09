(function() {
    var TILE_SIZE = 2;

    var tiles = {
        EMPTY: 0,
        DIRT: 1
    };

    var tile = document.createElement('canvas');
    var tile_queue = [];
    var tile_template = new Image();
        tile_template.src = 'img/tiles.png';
        tile_template.onload = function() {
            Palette.applyPalette(tile_template, tile);

            var cb;
            while (cb = tile_queue.shift()) {
                cb();
            }
        };


    Juicy.Point.prototype.floor = function() {
        return new Juicy.Point(Math.floor(this.x), Math.floor(this.y));
    };

    Juicy.Point.prototype.clone = function() {
        return new Juicy.Point(this.x, this.y);
    };

    Juicy.Component.create('TileManager', {
        TILE_SIZE: TILE_SIZE,
        constructor: function(width) {
            this.tiles  = [];
            this.chunks = [];

            this.width = width;
            this.height = 0;

            // For ultimate performance gainz
            this.chunk_width  = 160;
            this.chunk_height = 144;
        },
        getCell: function(x, y) {
            if (!this.tiles[y]) {
                this.tiles[y] = [];
            }

            return this.tiles[y][x];
        },
        generateChunk: function(x, y) {
            x *= this.chunk_width  / TILE_SIZE;
            y *= this.chunk_height / TILE_SIZE;

            for (var i = 0; i < this.chunk_width / TILE_SIZE; i ++) {
                for (var j = 0; j < this.chunk_height / TILE_SIZE; j ++) {

                    if (!this.tiles[y + j]) {
                        this.tiles[y + j] = [];
                    }

                    var tile = 'DIRT';
                    if (Math.random() < 0.01) {
                        tile = 'EMPTY';
                    }
                    
                    this.tiles[y + j][x + i] = tile;
                }
            }
        },
        renderChunk: function(x, y) {
            var context = this.chunks[y][x].context;

            x *= this.chunk_width;
            y *= this.chunk_height;
            for (var i = 0; i < this.chunk_width; i += TILE_SIZE) {
                for (var j = 0; j < this.chunk_height; j += TILE_SIZE) {
                    var cell = tiles[this.tiles[(y + j) / TILE_SIZE][(x + i) / TILE_SIZE]];

                    context.drawImage(tile, cell * TILE_SIZE, 0, TILE_SIZE, TILE_SIZE, i, j, TILE_SIZE, TILE_SIZE);
                }
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

                this.generateChunk(x, y);
                this.renderChunk(x, y);
            }

            return this.chunks[y][x];
        },
        blitCell: function(x, y, cell) {
            var self = this;
            if (!tile_template.complete) {
                tile_queue.push(function() {
                    self.blitCell(x, y, cell);
                });

                return;
            }

            var chunk = this.getChunk(x, y);

            chunk.context.drawImage(cell, (x % this.chunk_width) * TILE_SIZE, (y % this.chunk_height) * TILE_SIZE);
        },
        removeCell: function(x, y) {
            x -= x % TILE_SIZE;
            y -= y % TILE_SIZE;

            if (y < 0) return 0; // No tiles above ground
            
            var chunk = this.getChunk(x, y);
            // debugger;
            chunk.context.clearRect(x - chunk.x * this.chunk_width, y - chunk.y * this.chunk_height, TILE_SIZE, TILE_SIZE);
            
            x /= TILE_SIZE;
            y /= TILE_SIZE;

            if (!this.tiles[y]) { console.log(chunk); debugger; throw x + ', ' + y; return 0; }// No tiles in this row
            if (this.tiles[y][x] === 'EMPTY') {
                return 0;
            }
            this.tiles[y][x] = 'EMPTY';

            var self = this;
            this.entity.state.particles.getComponent('ParticleManager').spawnParticles("255, 255, 255, ", 3, 1, function(particle, ndx) {
                    return 0;
                },
                function(particle) {
                    particle.x = x * 2;
                    particle.y = y * 2;
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
            this.entity.state.particles.getComponent('ParticleManager').spawnParticles("255, 255, 255", 2, 1, function(particle, ndx) {
                    return 0;
                },
                function(particle) {
                    var dx = self.entity.state.player.getComponent('Physics').dx;
                    var dy = self.entity.state.player.getComponent('Physics').dy;

                    particle.x = x;
                    particle.y = y - 1.8;

                    if (dy < 0) {
                        particle.y -= 10;
                    }
                    else {
                        particle.y += 7;
                    }

                    if (dx < -6) {
                        particle.x -= 8;
                    }

                    var dist = Math.sqrt(dx*dx + dy*dy) * 10;
                    particle.dx = -dx / dist + Math.random()*2 - 1;
                    particle.dy = -dy / dist + Math.random()*2 - 1;
                    particle.startLife = 9;
                    particle.life = particle.startLife;
                },
                function(particle) {
                    particle.x += particle.dx;
                    particle.y += particle.dy;
                });

            return 1;
        },
        getTile: function(point) {
            point = point.mult(1 / TILE_SIZE).floor();

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
            var chunk_x = Math.floor(x / this.chunk_width);
            var chunk_y = Math.floor(y / this.chunk_height);

            window.rendering = [];

            for (var i = chunk_x * this.chunk_width; i < x + w; i += this.chunk_width) {
                for (var j = chunk_y * this.chunk_height; j <= y + h; j += this.chunk_height) {
                    if (j < 0) continue;

                    var chunk = this.getChunk(i, j);
                    rendering.push(j);

                    context.drawImage(chunk.image, i, j);
                }
            }
        }
    });
})();
