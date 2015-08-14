var music = new Juicy.Music();
music.load('lvl1', 'audio/music_cave_in.mp3');

var GameState = Juicy.State.extend({
    constructor: function(width_in_chunks, height_in_chunks) {
        var self = this;
        var game_width = (width_in_chunks || 4) * 80; // tiles per chunk
        this.game_height = (height_in_chunks + 1) || 30;

        this.tile_manager = new Juicy.Components.TileManager(game_width);
        this.tiles = new Juicy.Entity(this, [ this.tile_manager ]);

        this.loaded = false;

        this.ui = new Juicy.Entity(this, ['UI']);
        this.ui.getComponent('UI').testText();
        var fontSprite = new Juicy.Entity(this, ['ColoredSprite']);
        fontSprite.getComponent('ColoredSprite').setSheet('img/font.png', 0, 0);
        this.ui.getComponent('UI').setFontSprite(fontSprite, 4, 5);

        this.player = new Juicy.Entity(this, ['ColoredSprite', 'Player', 'Digger', 'Physics', 'Animations']);
        this.player.position = new Juicy.Point(40, -40);
        
        this.player.getComponent('ColoredSprite').setSheet('img/sawman-all.png', 20, 20);
        this.player.getComponent('Player').updateAnim('IDLE');

        this.birdManager = new Juicy.Entity(this, ['BirdManager']);

        this.gate = new Juicy.Entity(this, ['ColoredSprite']);
        var gateSprite = this.gate.getComponent('ColoredSprite');
        gateSprite.setSheet('img/gate.png', 52, 48);
        gateSprite.runAnimation(0, 7, 0, false);
        gateSprite.oncompleteanimation = function() {
                self.gateOpen = true;
                self.panningToGate = true;

                self.target = self.gate;

                gateSprite.runAnimation(8, 10, 0.2, true);
                gateSprite.oncompleteanimation = null;

                self.shake = 2.0;
            };
        this.gate.position = new Juicy.Point((game_width - 52) / 2, -48);

        this.gateOpen = false;

        this.particles = new Juicy.Entity(this, ['ParticleManager']);

        this.countdown = 2.99;
        this.countdown_entity = new Juicy.Entity(this, ['ColoredSprite']);
        this.countdown_sprite = this.countdown_entity.getComponent('ColoredSprite');
        this.countdown_sprite.setSheet('img/countdown.png', 10, 10);
        this.countdown_sprite.last_sprite = 3;
        this.countdown_sprite.repeat = true;

        this.watching = this.player;

        this.camera = {
            x: this.player.position.x,
            y: this.player.position.y,
            give_x: 4,
            give_y: 0,
            dx: 8,
            dy: 20
        };

        this.target = new Juicy.Entity(this, ['ColoredSprite', 'Goal']);
        this.target.getComponent('ColoredSprite').setSheet('img/doge-coin.png', 32, 32);
        this.target.getComponent('ColoredSprite').runAnimation(0, 7, 0.2, true);
        this.moveGoal();

        this.dramaticPauseTime = 0.0;
        this.shake = 0;

        Palette.set(Juicy.rand(5));
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
                // Build chunks down to 100!!
                load: function(piece) {
                    for (var i = 0; i < self.tile_manager.width / self.tile_manager.chunk_width; i ++) {
                        self.tile_manager.buildChunk(i, chunk_row, chunk_row === self.game_height - 1);
                    }

                    return (++chunk_row / self.game_height);
                }
            }));
        }

        music.play('lvl1');
    },

    moveGoal: function() {
        this.target.position = new Juicy.Point(Juicy.rand(this.tile_manager.width), -Juicy.rand(10, 80));
    },

    score: function() {
        if (!this.gateOpen) {
            this.target.getComponent('Goal').asplode();
            this.moveGoal();

            this.gate.getComponent('ColoredSprite').goNextFrame();
        }
    },

    completeLevel: function() {
        this.suckingInPlayer = false;
        this.gameOver = true;
        this.dramaticPauseTime = 3.0;
        this.shake = 1.5;
    },

    dramaticPause: function() {
        this.dramaticPauseTime = 0.2;
    },
    key_ESC: function() {
        music.pause('lvl1');
        this.game.setState(new PauseState(this));
    },
    update: function(dt, game) {
        if (this.shake > 0) {
            this.shake -= dt;

            if (this.shake < 0) {
                this.shake = 0;
            }
        }

        if (this.gateOpen) {
            this.gate.update(dt);
        }

        if (this.dramaticPauseTime > 0) {
            this.dramaticPauseTime -= dt;
            // update whatever cool effects can still happen when we're dramatically paused
            this.particles.getComponent('ParticleManager').update(dt);
        }
        else if (this.panningToGate) {
            var gateCenter = this.gate.center();

            var dx = (gateCenter.x - game.width / 2) - this.camera.x;
            var dy = (gateCenter.y - game.height / 2) - this.camera.y;

            this.camera.x += dx * dt;
            this.camera.y += dy * 1.5 * dt;

            if (gateCenter.sub(new Juicy.Point(this.camera.x + game.width / 2, this.camera.y + game.height / 2)).length() < 10) {
                this.dramaticPauseTime = 1;
                this.panningToGate = false;
            }

            this.shake = 1.0;
        }
        else if (this.suckingInPlayer) {
            var dist = this.gate.center().sub(this.player.center());
            this.player.position = this.player.position.add(dist.mult(1/8));

            if (dist.length() < 5) {
                this.completeLevel();
            }

            this.updateCamera(dt);
        }
        else if (this.gameOver) {
            this.cleanup();
            game.setState(new GameState(4, 30));
        }
        else {
            if (this.target.getComponent('Goal')) {
                this.target.getComponent('Goal').update(dt);
            }
            this.watching = this.player;

            this.particles.getComponent('ParticleManager').update(dt);
            
            if (!this.gateOpen) {
                this.target.getComponent('ColoredSprite').update(dt);
            }

            if (this.countdown > -0.5) {
                var nextCountdown = this.countdown - dt;

                if (Math.floor(this.countdown) !== Math.floor(nextCountdown)) {
                    this.countdown_sprite.goNextFrame();
                }

                this.countdown = nextCountdown;
                this.player.getComponent('ColoredSprite').update(dt);
            }

            if (this.countdown <= 0) {
                this.player.update(dt);

                if (this.player.position.x < 0) this.player.position.x = 0;
                if (this.player.position.x + this.player.width > this.tile_manager.width) {
                    this.player.position.x = this.tile_manager.width - this.player.width;
                }

                if (this.player.position.y + this.player.height > this.tile_manager.height) {
                    this.player.position.y = this.tile_manager.height - this.player.height;
                }
            }

            this.birdManager.update(dt);

            if (this.gateOpen) {
                if (this.gate.center().sub(this.player.center()).length() < 30) {
                    this.suckingInPlayer = true;
                }
            }

            this.updateCamera(dt);
        }
    },
    updateCamera: function(dt) {
        // Update Camera
        var dx = (this.watching.position.x - this.game.width / 2) - this.camera.x;
        var dy = (this.watching.position.y - this.game.height / 4) - this.camera.y;

        this.camera.x += dx * this.camera.dx * dt;
        this.camera.y += dy * this.camera.dy * dt;
        if (this.camera.x < 0) 
            this.camera.x = 0;
        if (this.camera.x + this.game.width > this.tile_manager.width) {
            this.camera.x = this.tile_manager.width - this.game.width;
        }
    },
    render: function(context) {
        if (this.countdown > -0.5) {
            this.countdown_entity.render(context, this.game.width / 2 - 5, 20);
        }

        context.save();
        context.translate(-Math.round(this.camera.x + Math.sin(this.shake * 100)), -Math.round(this.camera.y));

        this.tiles.render(context, this.camera.x, this.camera.y, this.game.width, this.game.height);
        this.gate.render(context);
        if (this.target !== this.gate) {
            this.target.render(context);
        }

        this.birdManager.render(context);

        this.particles.render(context);
        this.target.render(context);
        this.player.render(context);

        context.restore();

        // Draw UI independent of Camera
        this.ui.render(context);
    }
});
