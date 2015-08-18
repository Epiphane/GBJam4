var Level = Juicy.State.extend({
    constructor: function(options) {
        options = options || {};

        if (typeof(options.countdown) === 'undefined') {
            options.countdown = options.countdown || 3;
        }

        // Initialize variables
        var self = this;
        this.game_width = (options.width || 4) * 80; // tiles per chunk
        this.game_height = (options.height || 30) + 1;
        this.dramaticPauseTime = 0.0;
        this.shake = 0;
        this.song = options.song || ('lvl' + (Juicy.rand(2) + 1));

        // State variables
        this.loaded = false;
        this.gateOpen = false;
        this.updateFunc = null;
        this.objects = [];
        this.speechTime = options.speechTime || 2;

        // Create Tile Manager
        this.tile_manager = new Juicy.Components.TileManager(this.game_width);
        this.tiles = new Juicy.Entity(this, [ this.tile_manager ]);

        // Create UI
        this.ui_entity = new Juicy.Entity(this, ['UI']);
        this.ui = this.ui_entity.getComponent('UI');

        // Create Player
        this.player = new Juicy.Entity(this, ['ColoredSprite', 'Player', 'Digger', 'Physics', 'Animations']);
        this.player.position = new Juicy.Point(16, 240);        
        this.player.getComponent('ColoredSprite').setSheet('img/sawman-all.png', 20, 20);
        this.player.getComponent('Player').updateAnim('IDLE');

        // Create Background
        this.backdrop = new Juicy.Entity(this, ['ColoredSprite']);
        this.backdrop.getComponent('ColoredSprite').setSheet('img/backdrop.png', 160, 144);

        // Particle Manager
        this.particles = new Juicy.Entity(this, ['ParticleManager']);

        // Countdown until game starts
        if (options.countdown !== false) {
            this._countdown = options.countdown - 0.01;
            this.countdownText = this.ui.addText({
                text: Math.ceil(this._countdown) + '',
                font: TEXT.FONTS.BIG,
                position: Juicy.Point.create(80, 10),
                center: true,
                brightness: 3,
                noBG: true,
                animate: TEXT.ANIMATIONS.DRAMATIC
            });
        }
        else {
            this._countdown = false;
        }

        // Camera info
        this.watching = this.player;
        this.camera = {
            x: this.player.position.x,
            y: this.player.position.y,
            give_x: 4,
            give_y: 0,
            dx: 8,
            dy: 20
        };

        if (this.camera.x < 0) 
            this.camera.x = 0;
    },

    cleanup: function() {
        this.tile_manager.cleanup();
        music.stop(this.song);
        this.tiles = null;
    },

    load: function(piece) {
        var cleanupProgress = this.tile_manager.cleanupLastManager();
        if (cleanupProgress < 1) {
            return cleanupProgress;
        }

        for (var i = 0; i < this.tile_manager.width / this.tile_manager.chunk_width; i ++) {
            if (this.loadedChunkRow === this.game_height + 1) {
                this.tile_manager.buildChunk(i, this.loadedChunkRow, 'solid');
            }
            else if (this.loadedChunkRow < 2) {
                this.tile_manager.buildChunk(i, this.loadedChunkRow, 'empty');
            }
            else {
                this.tile_manager.buildChunk(i, this.loadedChunkRow);
            }
        }

        return (++this.loadedChunkRow / (this.game_height + 2));
    },

    init: function() {
        var self = this;
        if (!this.loaded) {
            this.loadedChunkRow = 0;
            this.game.setState(new LoadingState(this, {
                // Pre-build chunks down to self.game_height!!
                load: this.load.bind(this)
            }));
        }

        music.play(this.song);
    },

    say: function(dialog) {
        dialog = this.speech[dialog];
        if (!dialog) {
            this.updateFunc = null;
            return;
        }

        this.ivan_message.set(dialog);

        if (dialog.execute) {
            dialog.execute.call(this);
        }


        if (dialog.next) {
            var next = dialog.next;
            if (next && typeof(next) === 'string') {
                var nextDialog = next;
                var self = this;
                next = function() {
                    self.say(nextDialog);
                };
            }

            this.wait(dialog.time || this.speechTime, next);
        }
        else if (dialog.nextKey) {
            var next = dialog.nextKey;
            if (next && typeof(next) === 'string') {
                var nextDialog = next;
                var self = this;
                next = function() {
                    self.say(nextDialog);
                };
            }

            this.updateFunc = function() { return false; };
            var self = this;
            this.game.on('key', dialog.keys || ['SPACE'], function() {
                self.key_DOWN = false;

                next.call(self);
            });
        }
    },

    wait: function(time, callback) {
        var self = this;
        setTimeout(function() {
            callback.call(self);
        }, time * 1000);
    },

    key_ESC: function() {
        this.game.setState(new PauseState(this));
    },
    
    update: function(dt, game) {
        if (this.shake > 0) {
            this.shake -= dt;

            if (this.shake < 0) {
                this.shake = 0;
            }
        }

        var shouldUpdate = true;

        this.particles.update(dt);
        this.ui_entity.update(dt);

        if (this._countdown !== false) {
            if (this._countdown > 0) {
                var nextCountdown = this._countdown - dt;

                if (Math.ceil(nextCountdown) !== Math.ceil(this._countdown)) {
                    this.countdownText.setText(Math.ceil(nextCountdown) + '');
                }

                this._countdown = nextCountdown;

                shouldUpdate = false; // Don't update game yet
            }
            else if (this._countdown > -0.5) {
                this._countdown -= dt;

                this.countdownText.setText('GO');

                if (this._countdown <= -0.5) {
                    this.countdownText.remove = true;
                }
            }
        }

        if (this.updateFunc) {
            shouldUpdate = this.updateFunc(dt, game);
        }

        if (typeof(shouldUpdate) === 'undefined' || shouldUpdate) {
            this.player.update(dt);

            if (this.player.position.x < 0) this.player.position.x = 0;
            if (this.player.position.x + this.player.width > this.tile_manager.width) {
                this.player.position.x = this.tile_manager.width - this.player.width;
            }

            for (var i = 0; i < this.objects.length; i ++) {
                this.objects[i].update(dt);
            }

            this.camera.dx = 8;
            this.camera.dy = 20;
            this.watching = this.player;
        }
        else {
            var alwaysUpdate = ['ColoredSprite', 'Follower'];

            for (var n = 0; n < alwaysUpdate.length; n ++) {
                for (var i = 0; i < this.objects.length; i ++) {
                    this.objects[i].update(dt, alwaysUpdate[n]);
                }
            }
        }

        for (var i = 0; i < this.objects.length; i ++) {
            if (this.objects[i].remove) {
                this.objects.splice(i--, 1);
            }
        }

        this.updateCamera(dt);
    },
    
    updateCamera: function(dt) {
        // Update Camera
        var center = this.watching.center();
        var dx = (center.x - this.game.width / 2) - this.camera.x;
        var dy = (center.y - this.game.height / 2) - this.camera.y;

        this.camera.x += dx * this.camera.dx * dt;
        this.camera.y += dy * this.camera.dy * dt;
        if (this.camera.x < 0) 
            this.camera.x = 0;
        if (this.camera.x + this.game.width > this.tile_manager.width) {
            this.camera.x = this.tile_manager.width - this.game.width;
        }

        return 
    },

    render: function(context) {

        context.save();
        this.backdrop.render(context);
        context.translate(-Math.round(this.camera.x + 2 * Math.sin(this.shake * 100)), -Math.round(this.camera.y));

        this.tiles.render(context, this.camera.x, this.camera.y, this.game.width, this.game.height);

        this.particles.render(context);
        
        for (var i = 0; i < this.objects.length; i ++) {
            this.objects[i].render(context);
        }
        this.player.render(context);

        context.restore();

        // Draw UI independent of Camera
        this.ui_entity.render(context);
    },

    placeName: function() {
        return COOL_NAME();
    },

    subtitle: function() {
       return COOL_PLACE_SUBTITLE(); 
    },
});
