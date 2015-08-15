var Level = Juicy.State.extend({
    constructor: function(options) {
        options = options || {};

        // Initialize variables
        var self = this;
        this.game_width = (options.width || 4) * 80; // tiles per chunk
        this.game_height = (options.height || 30) + 1;
        this.dramaticPauseTime = 0.0;
        this.shake = 0;
        this.song = options.song || 'lvl1';

        // State variables
        this.loaded = false;
        this.gateOpen = false;
        this.updateFunc = null;
        this.objects = [];

        // Random palette!
        Palette.set(/* random */);

        // Create Tile Manager
        this.tile_manager = new Juicy.Components.TileManager(this.game_width);
        this.tiles = new Juicy.Entity(this, [ this.tile_manager ]);

        // Create UI
        this.ui_entity = new Juicy.Entity(this, ['UI']);
        this.ui = this.ui_entity.getComponent('UI');

        // Create Player
        this.player = new Juicy.Entity(this, ['ColoredSprite', 'Player', 'Digger', 'Physics', 'Animations']);
        this.player.position = new Juicy.Point(16, -40);        
        this.player.getComponent('ColoredSprite').setSheet('img/sawman-all.png', 20, 20);
        this.player.getComponent('Player').updateAnim('IDLE');

        // Particle Manager
        this.particles = new Juicy.Entity(this, ['ParticleManager']);

        /*var placeTitle = {
            text: 'THIS IS A STICKUP YA HEAR',
            font: TEXT.FONTS.BIG,
            position: Juicy.Point.create(this.game_width/4, 10),
            center: true,
            showBackground: false,
            brightness: 2,
            animate: TEXT.ANIMATIONS.DRAMATIC,
        };
        this.ui.addText(placeTitle);*/

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
        music.pause(this.song);
        delete this.tiles;
    },

    init: function() {
        var self = this;
        if (!this.loaded) {
            var chunk_row = 0;
            this.game.setState(new LoadingState(this, {
                // Pre-build chunks down to self.game_height!!
                load: function(piece) {
                    for (var i = 0; i < self.tile_manager.width / self.tile_manager.chunk_width; i ++) {
                        self.tile_manager.buildChunk(i, chunk_row, chunk_row === self.game_height - 1);
                    }

                    return (++chunk_row / self.game_height);
                }
            }));
        }

        music.play(this.song);
    },

    key_ESC: function() {
        music.pause(this.song);
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

            if (this.player.position.y + this.player.height > this.tile_manager.height) {
                this.player.position.y = this.tile_manager.height - this.player.height;
                this.player.getComponent('Digger').onGround = true;
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

        this.updateCamera(dt);
    },
    
    updateCamera: function(dt) {
        // Update Camera
        var center = this.watching.center();
        var dx = (center.x - this.game.width / 2) - this.camera.x;
        var dy = (center.y - this.game.height / 4) - this.camera.y;

        this.camera.x += dx * this.camera.dx * dt;
        this.camera.y += dy * this.camera.dy * dt;
        if (this.camera.x < 0) 
            this.camera.x = 0;
        if (this.camera.x + this.game.width > this.tile_manager.width) {
            this.camera.x = this.tile_manager.width - this.game.width;
        }
    },

    render: function(context) {

        context.save();
        context.translate(-Math.round(this.camera.x + Math.sin(this.shake * 100)), -Math.round(this.camera.y));

        this.tiles.render(context, this.camera.x, this.camera.y, this.game.width, this.game.height);

        this.particles.render(context);
        
        for (var i = 0; i < this.objects.length; i ++) {
            this.objects[i].render(context);
        }
        this.player.render(context);

        context.restore();

        // Draw UI independent of Camera
        this.ui_entity.render(context);
    }
});
