var GameState = Juicy.State.extend({
    constructor: function() {
        this.tile_manager = new Juicy.Components.TileManager(240, 240);
        this.tiles = new Juicy.Entity(this, [ this.tile_manager ]);

        this.player = new Juicy.Entity(this, ['Sprite', 'Player', 'Digger', 'Physics', 'Animations']);
        this.player.position = new Juicy.Point(100, -40);
        
        this.player.getComponent('Sprite').setSheet('img/sawman-all.png', 20, 20);
        this.player.getComponent('Player').startIdleAnim();

        this.tracker_image = new Image();
        this.tracker_image.src = './img/player.png';

        this.particles = new Juicy.Entity(this, ['ParticleManager']);

        this.countdown = 2.99;
        this.countdown_entity = new Juicy.Entity(this, ['Sprite']);
        this.countdown_sprite = this.countdown_entity.getComponent('Sprite');
        this.countdown_sprite.setSheet('img/countdown.png', 10, 10);
        this.countdown_sprite.last_sprite = 3;
        this.countdown_sprite.repeat = true;

        this.watching = this.player;

        this.camera = {
            x: 0,       //this.player.position.x,
            y: -104,    //this.player.position.y,
            give_x: 4,
            give_y: 0
        };

        this.target = new Juicy.Entity(this, ['Sprite']);
        this.target.getComponent('Sprite').setSheet('img/goal.png', 10, 10);
        this.moveGoal();
    },
    moveGoal: function() {
        this.target.position = new Juicy.Point(Juicy.rand(this.tile_manager.width * this.tile_manager.TILE_SIZE), -Juicy.rand(10, 80));
    },
    init: function() {
        Juicy.Sound.load('goal', 'audio/fx_jump.mp3');
        Juicy.Sound.load('ost', 'audio/music_particles.mp3', true);
        Juicy.Sound.play('ost');

        var self = this;
        this.game.getPlayer = function() { return self.player; };
    },
    key_ESC: function() {
        this.game.setState(new PauseState(this));
    },
    key_SPACE: function() {
        this.watching = this.player;
    },
    update: function(dt, game) {
        this.particles.getComponent('ParticleManager').update(dt);
            
        if (this.countdown > -0.5) {
            var nextCountdown = this.countdown - dt;

            if (Math.floor(this.countdown) !== Math.floor(nextCountdown)) {
                this.countdown_sprite.goNextFrame();
            }

            this.countdown = nextCountdown;
            this.player.getComponent('Sprite').update(dt);
        }
        
        if (this.countdown <= 0) {
            this.player.update(dt);

            if (this.player.position.x < 0) this.player.position.x = 0;
            if (this.player.position.x + this.player.width > this.tile_manager.width * this.tile_manager.TILE_SIZE) {
                this.player.position.x = this.tile_manager.width * this.tile_manager.TILE_SIZE - this.player.width;
            }
        }

        // Update Camera
        var dx = (this.watching.position.x - game.width / 2) - this.camera.x;
        var dy = (this.watching.position.y - game.height / 4) - this.camera.y;

        this.camera.x += dx * 8 * dt;
        this.camera.y += dy * 20 * dt;
        if (this.camera.x < 0) 
            this.camera.x = 0;
        if (this.camera.x + game.width > this.tile_manager.width * this.tile_manager.TILE_SIZE) {
            this.camera.x = this.tile_manager.width * this.tile_manager.TILE_SIZE - game.width;
        }

        while (this.camera.y + game.height > this.tile_manager.height * this.tile_manager.TILE_SIZE) {
            this.tile_manager.addRow(true);
        }
    },
    render: function(context) {
        if (this.countdown > -0.5) {
            this.countdown_entity.render(context, this.game.width / 2 - 5, 20);
        }

        context.save();
        context.translate(-this.camera.x, -this.camera.y);

        this.target.render(context);
        this.tiles.render(context, this.camera.x, this.camera.y, this.game.width, this.game.height);
        this.player.render(context);
        this.particles.render(context);

        context.restore();
    }
});
