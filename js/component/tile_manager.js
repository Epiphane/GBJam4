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

    var tile_img = document.createElement('canvas');
    var tile_template = new Image();
        tile_template.src = 'img/tiles.png';
        tile_template.onload = function() {
            Palette.applyPalette(this, tile_img);
        };

    var tile_mid_img = document.createElement('canvas');
    var tile_mid_template = new Image();
        tile_mid_template.src = 'img/tiles_mid.png';
        tile_mid_template.onload = function() {
            Palette.applyPalette(this, tile_mid_img);
        };

    var tile_low_img = document.createElement('canvas');
    var tile_low_template = new Image();
        tile_low_template.src = 'img/tiles_low.png';
        tile_low_template.onload = function() {
            Palette.applyPalette(this, tile_low_img);
        };

    var _pool_Tile = [];
    var Tile = function(sx, sy, obj) {
        this.sx = sx;
        this.sy = sy;
        this.obj = obj || false;
        this.drawn = false;
    }

    Tile.create = function(sx, sy, obj) {
        // if (_pool_Tile.length > 0) {
        //     var tile = _pool_Tile.shift();
        //     tile.sx = sx;
        //     tile.sy = sy;
        //     tile.obj = obj || false;
        //     tile.drawn = false;

        //     return tile;
        // }
        // else {
            return new Tile(sx, sy, obj);
        // }
    }

    Tile.prototype.free = function() { };//_pool_Tile.push(this); };

    Juicy.Component.create('TileManager', {
        TILE_SIZE: TILE_SIZE,
        constructor: function(width) {
            this.tiles       = [];
            this.chunks      = [];
            this.objects     = [];

            this.width = width * TILE_SIZE;
            this.height = 0;

            // For ultimate performance gainz
            this.chunk_width  = 160;
            this.chunk_height = 144;
        },
        cleanup: function() {
            // for (var i = 0; i < this.tiles.length; i ++) {
            //     for (var j = 0; j < this.tiles[i].length; j ++) {
            //         if (this.tiles[i][j]) {
            //             this.tiles[i][j].free();
            //             delete this.tiles[i][j];
            //         }
            //     }
            //     delete this.tiles[i];
            // }
        },
        generateChunk: function(x, y, solid) {
            var chunk = this.chunks[y][x];

            x *= this.chunk_width  / TILE_SIZE;
            y *= this.chunk_height / TILE_SIZE;

            for (var i = x; i < x + this.chunk_width / TILE_SIZE; i ++) {
                for (var j = y; j < y + this.chunk_height / TILE_SIZE; j ++) {

                    // Just put solid blocks here?
                    if (solid) {
                        if (!this.tiles[j]) {
                            this.tiles[j] = [];
                        }

                        var sx = i % 4;
                        var sy = 12 + j % 4;
                        this.tiles[j][i] = Tile.create(sx, sy);
                    }
                    // Figure out whether we need to continue a pattern
                    else if (!this.tiles[j] || typeof(this.tiles[j][i]) === 'undefined') {
                        var preset = getRandomPreset();
                        
                        var presetApproved = true;
                        for (var p_i = 0; presetApproved && p_i < preset.width + preset.padding * 2; p_i ++) {
                            for (var p_j = 0; presetApproved && p_j < preset.height + preset.padding * 2; p_j ++) {
                                if (p_i < 0 || p_j < 0 || p_i >= this.width / TILE_SIZE ||
                                   (this.tiles[p_j + j] && this.tiles[p_j + j][p_i + i])) {
                                    presetApproved = false;

                                    if (!this.tiles[j]) { this.tiles[j] = []; }
                                    this.tiles[j][i] = Tile.create(presets.DIRT.start[0], presets.DIRT.start[1]);
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
                                        this.tiles[p_j + j][p_i + i] = Tile.create(preset.start[0] + p_i - preset.padding, preset.start[1] + p_j - preset.padding);

                                        if (preset.name && withinEllipse(p_i, p_j)) {
                                            this.tiles[p_j + j][p_i + i].obj = object_ndx
                                            object_size ++;
                                        }
                                    }
                                    else {
                                        this.tiles[p_j + j][p_i + i] = Tile.create(1, 0, false);
                                    }
                                }
                            }

                            this.objects.push({
                                count: Math.floor(object_size * 0.95),
                                type: preset.name
                            });
                        }
                    }
                }
            }
        },
        buildChunk: function(chunk_x, chunk_y, solid) {
            if (!this.chunks[chunk_y]) {
                this.chunks[chunk_y] = [];
            }

            if (this.chunks[chunk_y][chunk_x]) throw 'Chunk already exists';

            var image    = document.createElement('canvas');
            image.width  = this.chunk_width ;
            image.height = this.chunk_height;

            var chunk = this.chunks[chunk_y][chunk_x] = {
                image: image, 
                context: image.getContext('2d'),
                x: chunk_x,
                y: chunk_y
            };

            this.generateChunk(chunk_x, chunk_y, solid);

            if (chunk_y * this.chunk_height > this.height) {
                this.height = chunk_y * this.chunk_height;
            }
        },
        getChunk: function(x, y, build) {
            var x = Math.floor(x / this.chunk_width);
            var y = Math.floor(y / this.chunk_height);

            if (!this.chunks[y] || !this.chunks[y][x]) {
                // console.log('Creating Chunk', x, y);
                this.buildChunk(x, y);

                for (var i = 0; i < this.width; i += this.chunk_width) {
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

            if (!this.tiles[y]) {
                throw 'Tile row ' + y + ' does not exist?';
            }

            if (this.tiles[y][x] === false) {
                return 0;
            }
            var obj = this.tiles[y][x].obj;
            if (obj !== false) {
                this.objects[obj].count --;
                if (this.objects[obj].count === 0) {
                    console.log('Removed object ' + obj + ': ' + this.objects[obj].type);
                }
            }
            this.tiles[y][x] = false;

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

            for (var i = chunk_x * this.chunk_width; i < x + w; i += this.chunk_width) {
                for (var j = chunk_y * this.chunk_height; j <= y + h; j += this.chunk_height) {
                    if (j < 0) continue;

                    var chunk = this.getChunk(i, j);

                    for (var tile_x = 0; tile_x < this.chunk_width; tile_x += 2) {
                        var global_x = tile_x + i;
                        if (global_x < x - 2) continue;
                        if (global_x >= x + w) break;

                        // Create a parabola with player as directrix LOL
                        // Vertex: player position - { 0, 4 }
                        // y = 1/200*(x - player.x)^2 + player.y - 50
                        var player_center = this.entity.state.player.center();
                        var dx_to_player = global_x - player_center.x;
                        var dy_to_player = j - player_center.y;

                        var bottom_parabola = dx_to_player * dx_to_player / 200 + dy_to_player - 50;
                        var fadeLength = 24;

                        for (var tile_y = 0; tile_y < this.chunk_height && tile_y + bottom_parabola <= fadeLength; tile_y += 2) {
                            var global_y = tile_y + j;
                            if (global_y < y - 2) continue;
                            if (global_y >= y + h) break;

                            var tile = this.tiles[global_y / TILE_SIZE][global_x / TILE_SIZE];
                            if (tile !== false && !tile.drawn) {
                                var opacity = (1 - (tile_y + bottom_parabola) / fadeLength);

                                if (opacity >= 1) {
                                    chunk.context.drawImage(tile_img, tile.sx * TILE_SIZE, tile.sy * TILE_SIZE, TILE_SIZE, TILE_SIZE,
                                                            tile_x, tile_y, TILE_SIZE, TILE_SIZE);

                                    tile.drawn = true;
                                }
                                else if (opacity >= 0) {
                                    var img = tile_mid_img;
                                    if (opacity < 0.5) img = tile_low_img;
                                    chunk.context.drawImage(img, tile.sx * TILE_SIZE, tile.sy * TILE_SIZE, TILE_SIZE, TILE_SIZE,
                                                           tile_x, tile_y, TILE_SIZE, TILE_SIZE);
                                }
                                else {
                                    break;
                                }
                            }
                        }
                    }

                    context.drawImage(chunk.image, i, j);
                }
            }
        }
    });
})();
