(function() {
    var TILE_SIZE = 2;

    var tiles = {
        EMPTY: [0, 0],
        DIRT: [1, 0]
    };

    var presets = {
        EMPTY: {
            start: [0, 0], 
            width: 1,
            height: 1,
            rarity: 1
        },
        DIRT: {
            start: [1, 0], 
            width: 1,
            height: 1,
            rarity: 1
        },
        BLOCK: {
            start: [0, 1], 
            width: 4,
            height: 4,
            rarity: 100
        },
        FOSSIL: {
            start: [0, 5], 
            width: 7,
            height: 7,
            rarity: 150
        },
        CRACK: {
            start: [4, 0], 
            width: 3,
            height: 5,
            rarity: 100
        },
        DOGE: {
            start: [7, 0], 
            width: 28,
            height: 28,
            padding: 60,
            rarity: 100,
            limit: 1
        }
    };
    var preset_names = Object.keys(presets);
    var preset_probabilities = [];
    (function() {
        var total_points = 0;
        var max = 0;
        for (var i = 0; i < preset_names.length; i ++) {
            if (max < presets[preset_names[i]].rarity + 1)
                max = presets[preset_names[i]].rarity + 1;

            if (!presets[preset_names[i]].padding)
                presets[preset_names[i]].padding = 12;
        }

        // Ignore EMPTY and DIRT
        for (var i = 2; i < preset_names.length; i ++) {
            presets[preset_names[i]].rarity = max - presets[preset_names[i]].rarity;

            presets[preset_names[i]].name = preset_names[i];
        }

        for (var i = 0; i < preset_names.length; i ++) {
            total_points += presets[preset_names[i]].rarity;
        }

        for (var i = 0; i < preset_names.length; i ++) {
            // Everyone gets evenly spaces between 0 and 1
            preset_probabilities.push(presets[preset_names[i]].rarity / total_points);
        }
    })();

    var getRandomPreset = function() {
        var type = Math.random();
        var ndx  = 0;
        while (type >= preset_probabilities[ndx]) {
            type -= preset_probabilities[ndx];

            ndx ++;
        }

        return presets[preset_names[ndx]];
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
            this.objects     = [];

            this.width = width;
            this.height = 0;

            // For ultimate performance gainz
            this.chunk_width  = 160;
            this.chunk_height = 144;
        },
        generateChunk: function(x, y) {
            var chunk = this.chunks[y][x];

            x *= this.chunk_width  / TILE_SIZE;
            y *= this.chunk_height / TILE_SIZE;

            for (var i = x; i < x + this.chunk_width / TILE_SIZE; i ++) {
                for (var j = y; j < y + this.chunk_height / TILE_SIZE; j ++) {

                    // Make sure the proper rows exist
                    if (!this.transitions[i]) {
                        this.transitions[i] = [];
                    }

                    // Figure out whether we need to continue a pattern
                    if (!this.tiles[j] || typeof(this.tiles[j][i]) === 'undefined') {
                        var preset = getRandomPreset();
                        
                        var presetApproved = true;
                        for (var p_i = 0; presetApproved && p_i < preset.width + preset.padding * 2; p_i ++) {
                            for (var p_j = 0; presetApproved && p_j < preset.height + preset.padding * 2; p_j ++) {
                                if (p_i < 0 || p_j < 0 || p_i >= this.width / TILE_SIZE ||
                                   (this.tiles[p_j + j] && this.tiles[p_j + j][p_i + i])) {
                                    presetApproved = false;

                                    if (!this.tiles[j]) { this.tiles[j] = []; }
                                    this.tiles[j][i] = {
                                        sx: presets.DIRT.start[0],
                                        sy: presets.DIRT.start[1],
                                        obj: false
                                    };
                                }
                            }
                        }

                        var object_ndx = this.objects.length;
                        var object_size = 0;
                        var object = { name: preset.name };

                        if (presetApproved) {
                            var center = {
                                x: preset.width / 2 + preset.padding,
                                y: preset.height / 2 + preset.padding
                            };
                            var withinEllipse = function(x, y) {
                                // (x−h)^2/r^2 + (y−k)^2/r^2 ≤ 1
                                return Math.pow(x - center.x, 2) / Math.pow(center.x, 2)
                                     + Math.pow(y - center.y, 2) / Math.pow(center.y, 2) <= 0.05;
                            }

                            for (var p_i = 0; p_i < preset.width + preset.padding * 2; p_i ++) {
                                for (var p_j = 0; p_j < preset.height + preset.padding * 2; p_j ++) {
                                    if (!this.tiles[p_j + j]) {
                                        this.tiles[p_j + j] = [];
                                    }

                                    if (p_i >= preset.padding && p_i < preset.width + preset.padding &&
                                        p_j >= preset.padding && p_j < preset.height + preset.padding) {
                                        this.tiles[p_j + j][p_i + i] = {
                                            sx: preset.start[0] + p_i - preset.padding,
                                            sy: preset.start[1] + p_j - preset.padding,
                                            obj: false
                                        };

                                        if (preset.name && withinEllipse(p_i, p_j)) {
                                            this.tiles[p_j + j][p_i + i].obj = object_ndx
                                            object_size ++;
                                        }
                                    }
                                    else {
                                        this.tiles[p_j + j][p_i + i] = {
                                            sx: 1, 
                                            sy: 0,
                                            obj: false
                                        };
                                    }
                                }
                            }

                            this.objects.push({
                                count: Math.floor(object_size * 0.95),
                                type: preset.name
                            });
                        }
                    }

                    this.transitions[i].push({
                        x: (i - x) * TILE_SIZE,
                        y: (j - y) * TILE_SIZE,
                        chunk: chunk,
                        cell: this.tiles[j][i],
                        t: 8 + Juicy.rand(2),
                        dx: Juicy.rand(-1, 1),
                        dy: 1
                    });
                }
            }
        },
        buildChunk: function(chunk_x, chunk_y) {
            if (!this.chunks[chunk_y]) {
                this.chunks[chunk_y] = [];
            }

            if (this.chunks[chunk_y][chunk_x]) throw 'Chunk already exists';

            var image    = document.createElement('canvas');
            image.width  = this.chunk_width ;
            image.height = this.chunk_height;

            this.chunks[chunk_y][chunk_x] = {
                image: image, 
                context: image.getContext('2d'),
                x: chunk_x,
                y: chunk_y
            };

            this.generateChunk(chunk_x, chunk_y);
        },
        getChunk: function(x, y, build) {
            var x = Math.floor(x / this.chunk_width);
            var y = Math.floor(y / this.chunk_height);

            if (!this.chunks[y] || !this.chunks[y][x]) {
                // console.log('Creating Chunk', x, y);
                this.buildChunk(x, y);

                for (var i = 0; i < this.width * TILE_SIZE; i += this.chunk_width) {
                    this.getChunk(i, y * this.chunk_height, build);
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

            if (this.tiles[y][x] === 0) {
                return 0;
            }
            var obj = this.tiles[y][x].obj;
            if (obj !== false) {
                this.objects[obj].count --;
                if (this.objects[obj].count === 0) {
                    console.log('Removed object ' + obj + ': ' + this.objects[obj].type);
                }
            }
            this.tiles[y][x] = 0;

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
                            transition.chunk.context.drawImage(tile, transition.cell.sx * TILE_SIZE, transition.cell.sy * TILE_SIZE, TILE_SIZE, TILE_SIZE, 
                                                                transition.x, transition.y, TILE_SIZE, TILE_SIZE);

                            transitions.splice(t, 1);
                            t --;
                        }
                        else {
                            var dx = piece_x + transition.dx * transition.t;
                            var dy = piece_y + transition.dy * transition.t;

                            // Draw transitioning piece
                            context.drawImage(tile, transition.cell.sx * TILE_SIZE, transition.cell.sy * TILE_SIZE, TILE_SIZE, TILE_SIZE,
                                                    dx, dy, TILE_SIZE, TILE_SIZE);
                        }
                    }
                }
            }
        }
    });
})();
