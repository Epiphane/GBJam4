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
            this.tiles       = [];
            this.transitions = [];
            this.chunks      = [];

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
            var chunk = this.chunks[y][x];

            x *= this.chunk_width  / TILE_SIZE;
            y *= this.chunk_height / TILE_SIZE;

            for (var i = 0; i < this.chunk_width / TILE_SIZE; i ++) {
                for (var j = 0; j < this.chunk_height / TILE_SIZE; j ++) {

                    if (!this.tiles[y + j]) {
                        this.tiles[y + j] = [];
                    }
                    if (!this.transitions[x + i]) {
                        this.transitions[x + i] = [];
                    }

                    var tile = 'DIRT';
                    if (Math.random() < 0.01) {
                        tile = 'EMPTY';
                    }
                    
                    this.tiles[y + j][x + i] = tile;
                    this.transitions[x + i].push({
                        x: i * TILE_SIZE,
                        y: j * TILE_SIZE,
                        chunk: chunk,
                        cell: tiles[tile],
                        t: 8 + Juicy.rand(2),
                        dx: Juicy.rand(-1, 1),
                        dy: 1
                    });
                }
            }
        },
        renderChunk: function(x, y) {
            var self = this;
            if (!tile_template.complete) {
                tile_queue.push(function() {
                    self.renderChunk(x, y);
                });

                return;
            }

            var chunk = this.chunks[y][x];

            x *= this.chunk_width;
            y *= this.chunk_height;
            for (var i = 0; i < this.chunk_width; i += TILE_SIZE) {
                for (var j = 0; j < this.chunk_height; j += TILE_SIZE) {
                    var cell = tiles[this.tiles[(chunk.y * this.chunk_height + j) / TILE_SIZE][(chunk.x * this.chunk_height + i) / TILE_SIZE]]

                    // this.transitioning.push({
                    //     cell: cell,
                    //     chunk: chunk,
                    //     x: i,
                    //     y: j,
                    // });
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

                var self = this;
                Palette.onchange.push(function() {
                    self.renderChunk(x, y);
                });

                for (var i = 0; i < this.width * TILE_SIZE; i += this.chunk_width) {
                    this.getChunk(i, y * this.chunk_height);
                }
            }

            return this.chunks[y][x];
        },
        removeCell: function(x, y) {
            x -= x % TILE_SIZE;
            y -= y % TILE_SIZE;

            if (y < 0) return 0; // No tiles above ground
            
            var chunk = this.getChunk(x, y);
            chunk.context.clearRect(x - chunk.x * this.chunk_width, y - chunk.y * this.chunk_height, TILE_SIZE, TILE_SIZE);
            
            x /= TILE_SIZE;
            y /= TILE_SIZE;

            if (!this.tiles[y]) { console.log(chunk); debugger; throw x + ', ' + y; return 0; }// No tiles in this row
            if (this.tiles[y][x] === 'EMPTY') {
                return 0;
            }
            this.tiles[y][x] = 'EMPTY';

            var self = this;
            this.entity.state.particles.getComponent('ParticleManager').spawnParticles({
                color: "LIGHT", 
                size: 3, 
                howMany: 1, 
                timeToLive: function(particle, ndx) {
                    return 0;
                },
                initParticle: function(particle) {
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
                updateParticle: function(particle) {
                    particle.x += particle.dx;
                    particle.y += particle.dy;
                    particle.alpha = 1.0;
                }
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

            for (var i = 0; i < this.transitions.length; i ++) {
                var transitions = this.transitions[i];

                if (transitions.length > 0) {
                    var MAX_T = 4;
                    var lookahead = Math.max(1, MAX_T - transitions[0].t);
                    for (var t = 0; t < transitions.length; t ++) {
                        var transition = transitions[t];

                        transition.t --;

                        var piece_x = transition.chunk.x * this.chunk_width + transition.x;
                        var piece_y = transition.chunk.y * this.chunk_height + transition.y;

                        /* Create a parabola with player as directrix LOL */
                        // Vertex: player position - { 0, 4 }
                        // y = 4(x - player.x)^2 + player.y
                        var toPlayer = (new Juicy.Point(piece_x, piece_y)).sub(this.entity.state.player.center());
                        var below_parabola = (toPlayer.x * toPlayer.x / 200 + toPlayer.y - 50 > 0)

                        if (below_parabola) {
                            break;
                        }
                        else if (transition.t <= 0 || piece_y < (y + h) / 2) {
                            transition.chunk.context.drawImage(tile, transition.cell * TILE_SIZE, 0, TILE_SIZE, TILE_SIZE, 
                                                                transition.x, transition.y, TILE_SIZE, TILE_SIZE);

                            transitions.splice(t, 1);
                            t --;
                        }
                        else {
                            var dx = piece_x + transition.dx * transition.t;
                            var dy = piece_y + transition.dy * transition.t;

                            // Draw transitioning piece
                            context.drawImage(tile, transition.cell * TILE_SIZE, 0, TILE_SIZE, TILE_SIZE,
                                                    dx, dy, TILE_SIZE, TILE_SIZE);
                        }
                    }
                }
            }
        }
    });
})();
