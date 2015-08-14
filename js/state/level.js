var Level = Juicy.State.extend({
    constructor: function(options) {
        // Initialize variables
        this.game_width = (options.width || 4) * 80; // tiles per chunk
        this.game_height = (options.height + 1) || 30;
        this.song = options.song || 'lvl1';

        // State variables
        this.shake             = 0;
        this.loaded            = false;
        this.objects           = [];

        // Random palette!
        Palette.set(Juicy.rand(5));

        // Create Tile Manager
        this.tile_manager = new Juicy.Components.TileManager(this.game_width);
        this.tiles        = new Juicy.Entity(this, [ 
            this.tile_manager // Set it as a component
        ]);

        // Create UI
        var fontSprite = new Juicy.Entity(this, ['ColoredSprite']);
        fontSprite.getComponent('ColoredSprite').setSheet('img/font.png', 0, 0);
        this.ui = new Juicy.Entity(this, ['UI']);
        this.ui.getComponent('UI').setFontSprite(fontSprite, 4, 5);

        // Create Player
        this.player = new Juicy.Entity(this, ['ColoredSprite', 'Player', 'Digger', 'Physics', 'Animations']);
        this.player.position = new Juicy.Point(40, -40);        
        this.player.getComponent('ColoredSprite').setSheet('img/sawman-all.png', 20, 20);
        this.player.getComponent('Player').updateAnim('IDLE');

        // Particle Manager
        this.particles = new Juicy.Entity(this, ['ParticleManager']);

        // Default for countdown
        if (typeof(options.countdown) === 'undefined') {
            options.countdown = 3;
        }

        // Countdown until game starts
        if (options.countdown) {
            this.countdown = options.countdown - 0.001; // So we start with a full second
            this.countdown_entity = new Juicy.Entity(this, ['ColoredSprite']);
            this.countdown_sprite = this.countdown_entity.getComponent('ColoredSprite');
            this.countdown_sprite.setSheet('img/countdown.png', 10, 10);
            this.countdown_sprite.last_sprite = 3;
            this.countdown_sprite.repeat = true;
        }
        else {
            this.countdown = false;
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
    },

    cleanup: function() {
        this.tile_manager.cleanup();
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

        // Update all particles
        this.particles.getComponent('ParticleManager').update(dt);

        // Specific update perchance?
        var updateNormally = undefined;
        if (this.updateFunc) {
            updateNormally = this.updateFunc(dt, game);
        }

        if (updateNormally || typeof(updateNormally) === 'undefined') {
            // Default update: countdown, physics, camera
            var shouldUpdateGame = this.updateCountdown(dt);

            // Update everything!!
            if (shouldUpdateGame) {
                this.updatePhysics(dt, game);
            }

            this.camera.dx = 8;
            this.camera.dy = 20;
        }

        this.updateCamera(dt, game);
    },

    updateCountdown: function(dt) {
        if (this.countdown === false) {
            return true; // should update
        }

        if (this.countdown > -0.5) {
            var nextCountdown = this.countdown - dt;

            if (Math.floor(this.countdown) !== Math.floor(nextCountdown)) {
                this.countdown_sprite.goNextFrame();
            }

            this.countdown = nextCountdown;
        }

        return this.countdown <= 0;
    },

    updatePhysics: function(dt, game) {
        // First update the player
        this.player.update(dt);

        if (this.player.position.x < 0) this.player.position.x = 0;
        if (this.player.position.x + this.player.width > this.tile_manager.width) {
            this.player.position.x = this.tile_manager.width - this.player.width;
        }

        if (this.player.position.y + this.player.height > this.tile_manager.height) {
            this.player.position.y = this.tile_manager.height - this.player.height;
        }

        // Then update everything else
        for (var i = 0; i < this.objects.length; i ++) {
            this.objects[i].update(dt);
        }
    },
    
    updateCamera: function(dt, game) {
        // Update Camera
        var position = this.watching.center();//.free();
        var dx = (position.x - this.game.width / 2) - this.camera.x;
        var dy = (position.y - this.game.height / 4) - this.camera.y;

        this.camera.x += dx * this.camera.dx * dt;
        this.camera.y += dy * this.camera.dy * dt;
        if (this.camera.x < 0) 
            this.camera.x = 0;
        if (this.camera.x + this.game.width > this.tile_manager.width) {
            this.camera.x = this.tile_manager.width - this.game.width;
        }
    },

    preRender: function(context) {
        if (this.countdown > -0.5) {
            this.countdown_entity.render(context, this.game.width / 2 - 5, 20);
        }

        context.save();
        context.translate(-Math.round(this.camera.x + Math.sin(this.shake * 100)), -Math.round(this.camera.y));

    },

    postRender: function(context) {
        context.restore();

        // Draw UI independent of Camera
        this.ui.render(context);
    },

    _render: function(context) {
        this.particles.render(context);
        this.tiles.render(context, this.camera.x, this.camera.y, this.game.width, this.game.height);
        
        for (var i = 0; i < this.objects.length; i ++) {
            this.objects[i].render(context);
        }
        
        this.player.render(context);
    },

    render: function(context) {
        this.preRender(context);
        
        this._render(context);

        this.postRender(context);
    }
});
