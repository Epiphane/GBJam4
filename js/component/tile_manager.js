(function() {
    var TILE_SIZE = 2;

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

    var Tile = function(sx, sy, obj) {
        this.sx = sx;
        this.sy = sy;
        this.obj = obj || false;
        this.drawn = 0;
        this.persistent = false;
        this.blocking   = false;
    }

    Tile.create = function(sx, sy, obj) { return new Tile(sx, sy, obj); };

    var currentTileManager = null;
    var lastTileManager = null;
    Palette.onchange.push(function() {
        if (currentTileManager) {
            currentTileManager.onPaletteChange();
        }
    })

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

            currentTileManager = this;

            this.cleanedUp = 0;
        },

        cleanup: function() {
            lastTileManager = this;
            return;
        },

        cleanupLastManager: function() {
            if (!lastTileManager) return 1;

            return lastTileManager.progressiveCleanup();
        },

        progressiveCleanup: function() {
            var cleanup = 0;
            while (cleanup < 10  && this.cleanedUp < this.tiles.length) {
                this.tiles[this.cleanedUp] = null;

                cleanup ++;
                this.cleanedUp ++;
            }

            if (this.cleanedUp === this.tiles.length) {
                lastTileManager = null; // Throw me awayyyy
            }

            return this.cleanedUp / this.tiles.length;
        },

        setTiles: function(x, y, w, h, cb) {
            x = Math.floor(x / TILE_SIZE);
            y = Math.floor(y / TILE_SIZE);
            w = Math.floor(w / TILE_SIZE);
            h = Math.floor(h / TILE_SIZE);
        
            for (var j = y; j < y + h; j ++) {
                if (!this.tiles[j]) continue;

                for (var i = x; i < x + w; i ++) {
                    if (!this.tiles[j][i]) this.tiles[j][i] = new Tile();

                    this.removeObj(this.tiles[j][i]);

                    cb.call(this, this.tiles[j][i], i, j);
                }
            }
        },

        persistTiles: function(x, y, w, h) {
            this.setTiles(x, y, w, h, function(tile, i, j) {
                var sx = i % 4;
                var sy = 16 + j % 4;
                tile.sx = sx;
                tile.sy = sy;
                tile.persistent = true;
                tile.blocking = false;
            });
        },

        blockTiles: function(x, y, w, h) {
            this.setTiles(x, y, w, h, function(tile, i, j) {
                var sx = i % 4;
                var sy = 12 + j % 4;
                this.tiles[j][i].sx = sx;
                this.tiles[j][i].sy = sy;
                this.tiles[j][i].persistent = true;
                this.tiles[j][i].blocking = true;
            });
        },

        addHealthPack: function(x, y) {
            var i = Math.floor(x / TILE_SIZE);
            var j = Math.floor(y / TILE_SIZE);

            var preset = presets.BLOCK;

            var object_ndx = this.objects.length;
            var object_size = 0;
            var object = { name: preset.name };

            for (var p_i = 0; p_i < preset.width; p_i ++) {
                for (var p_j = 0; p_j < preset.height; p_j ++) {
                    this.tiles[p_j + j][p_i + i] = Tile.create(preset.start[0] + p_i, preset.start[1] + p_j);

                    this.tiles[p_j + j][p_i + i].obj = object_ndx
                    object_size ++;
                }
            }

            this.objects.push({
                count: Math.floor(object_size * 0.95),
                type: preset.name
            });
        },

        generateChunk: function(x, y, special) {
            var chunk = this.chunks[y][x];

            x *= this.chunk_width  / TILE_SIZE;
            y *= this.chunk_height / TILE_SIZE;

            for (var i = x; i < x + this.chunk_width / TILE_SIZE; i ++) {
                for (var j = y; j < y + this.chunk_height / TILE_SIZE; j ++) {

                    // Just put solid blocks here?
                    if (special === 'solid') {
                        if (!this.tiles[j]) {
                            this.tiles[j] = [];
                        }

                        this.removeObj(this.tiles[j][i]);

                        var sx = i % 4;
                        var sy = 12 + j % 4;
                        this.tiles[j][i] = Tile.create(sx, sy);
                        this.tiles[j][i].persistent = true;
                        this.tiles[j][i].blocking = true;
                    }
                    else if (special === 'empty') {
                        if (!this.tiles[j]) {
                            this.tiles[j] = [];
                        }

                        this.removeObj(this.tiles[j][i]);

                        this.tiles[j][i] = false;
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
                                        this.tiles[p_j + j][p_i + i] = Tile.create(presets.DIRT.start[0], presets.DIRT.start[1], false);
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

        buildChunk: function(chunk_x, chunk_y, special) {
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

            if (chunk_y >= 2) {
                chunk.context.fillStyle = Palette.getStyle('DARK');
                chunk.context.fillRect(0, 0, this.chunk_width, this.chunk_height);
            }

            this.generateChunk(chunk_x, chunk_y, special);

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

        onPaletteChange: function() {
            for (var chunk_y = 0; chunk_y < this.chunks.length; chunk_y ++) {
                for (var chunk_x = 0; chunk_x < this.chunks[chunk_y].length; chunk_x ++) {
                    var chunk = this.chunks[chunk_y][chunk_x];
                    var filled = false;

                    for (var tile_x = 0; tile_x < this.chunk_width / TILE_SIZE; tile_x ++) {
                        for (var tile_y = 0; tile_y < this.chunk_height / TILE_SIZE; tile_y ++) {
                            var tile = this.tiles[tile_y + chunk_y * this.chunk_height / TILE_SIZE]
                                                 [tile_x + chunk_x * this.chunk_width  / TILE_SIZE];
                            if (tile !== false) {
                                if (!filled) {
                                    chunk.context.fillStyle = Palette.getStyle('DARK');
                                    chunk.context.fillRect(0, 0, this.chunk_width, this.chunk_height);
                                
                                    filled = true;
                                }

                                if (tile.drawn) {
                                    var opacity = tile.drawn;

                                    if (opacity === 1) {
                                        chunk.context.drawImage(tile_img, tile.sx * TILE_SIZE, tile.sy * TILE_SIZE, TILE_SIZE, TILE_SIZE,
                                                                tile_x * TILE_SIZE, tile_y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
                                    }
                                    else {
                                        var img = tile_mid_img;
                                        if (opacity < 0.5) img = tile_low_img;
                                        chunk.context.drawImage(img, tile.sx * TILE_SIZE, tile.sy * TILE_SIZE, TILE_SIZE, TILE_SIZE,
                                                               tile_x * TILE_SIZE, tile_y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
                                    }
                                }
                            }
                        }
                    }
                }
            }
        },

        illuminate: function(x, y, r) {
            x = Math.floor(x / TILE_SIZE);
            y = Math.floor(y / TILE_SIZE);
            r = Math.floor(r / TILE_SIZE);

            var r2 = r * r;

            for (var dy = -r; dy <= r; dy ++) {
                if (!this.tiles[y + dy]) continue;
                var tile_y = y + dy;

                for (var dx = -r; dx <= r; dx ++) {
                    var tile_x = x + dx;

                    var tile = this.tiles[tile_y][tile_x];
                    if (tile && tile.drawn < 1 && dx * dx + dy * dy < r2) {
                        var opacity = 1.5 - (dx * dx + dy * dy) / r2;
                        if (opacity > 1) opacity = 1;

                        if (tile.drawn < opacity) {
                            tile.drawn = opacity;

                            var localTileX = tile_x % (this.chunk_width  / TILE_SIZE);
                            var localTileY = tile_y % (this.chunk_height / TILE_SIZE);

                            var chunk = this.getChunk(tile_x * TILE_SIZE, tile_y * TILE_SIZE);

                            if (opacity === 1) {
                                chunk.context.drawImage(tile_img, tile.sx * TILE_SIZE, tile.sy * TILE_SIZE, TILE_SIZE, TILE_SIZE,
                                                        localTileX * TILE_SIZE, localTileY * TILE_SIZE, TILE_SIZE, TILE_SIZE);
                            }
                            else {
                                var img = tile_mid_img;
                                if (opacity < 0.5) img = tile_low_img;
                                chunk.context.drawImage(img, tile.sx * TILE_SIZE, tile.sy * TILE_SIZE, TILE_SIZE, TILE_SIZE,
                                                       localTileX * TILE_SIZE, localTileY * TILE_SIZE, TILE_SIZE, TILE_SIZE);
                            }
                        }
                    }
                }
            }
        },

        removeObj: function(tile, digger) {
            if (!tile) return;

            var obj = tile.obj;
            if (obj !== false) {
                this.objects[obj].count --;
                if (digger && this.objects[obj].count === 0) {
                    digger.destroyObject(this.objects[obj].type);
                }
            }
        },  

        removeCell: function(x, y, digger) {
            x = Math.floor(x / TILE_SIZE);
            y = Math.floor(y / TILE_SIZE);

            if (y < 0) return 0; // No tiles above ground

            if (this.tiles[y] && this.tiles[y][x]) {
                if (this.tiles[y][x].blocking) {
                    return 0;
                }
                else if (this.tiles[y][x].persistent) {
                    return 1;
                }
            }

            var chunk = this.getChunk(x * TILE_SIZE, y * TILE_SIZE);
            chunk.context.clearRect(x * TILE_SIZE - chunk.x * this.chunk_width, y * TILE_SIZE - chunk.y * this.chunk_height, TILE_SIZE, TILE_SIZE);
            
            if (!this.tiles[y]) {
                throw 'Tile row ' + y + ' does not exist?';
            }

            if (this.tiles[y][x] === false) {
                return 0;
            }
            this.removeObj(this.tiles[y][x], digger);
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

                    if (dy < -0.1) {
                        particle.y -= 8;
                    }

                    if (dx < -0.1) {
                        particle.x -= 8;
                    }
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
            point = point.mult(1 / this.TILE_SIZE).floor();

            if (!this.tiles[point.y]) {
                return false;
            }

            return this.tiles[point.y][point.x];
        },
        
        isTileBlocking: function(point) {
            var tile = this.getTile(point);
            return typeof(tile) === 'undefined' || !!tile.blocking;
        },
        
        canMove: function(point, movement) {
            return !this.isTileBlocking(point.add(movement));
        },

        raycast: function(origin, movement) {
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
                            if (tile !== false && tile.drawn < 1) {
                                var opacity = (1 - (tile_y + bottom_parabola) / fadeLength);

                                if (opacity >= 1) {
                                    chunk.context.drawImage(tile_img, tile.sx * TILE_SIZE, tile.sy * TILE_SIZE, TILE_SIZE, TILE_SIZE,
                                                            tile_x, tile_y, TILE_SIZE, TILE_SIZE);

                                    tile.drawn = 1;
                                }
                                else if (opacity >= tile.drawn) {
                                    var img = tile_mid_img;
                                    if (opacity < 0.5) img = tile_low_img;
                                    chunk.context.drawImage(img, tile.sx * TILE_SIZE, tile.sy * TILE_SIZE, TILE_SIZE, TILE_SIZE,
                                                           tile_x, tile_y, TILE_SIZE, TILE_SIZE);
                                
                                    tile.drawn = opacity;
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
