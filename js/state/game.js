var GameState = Juicy.State.extend({
    constructor: function() {
        this.tile_manager = new Juicy.Components.TileManager(16, 4);
        this.tiles = new Juicy.Entity(this, [ this.tile_manager ]);

        this.player = new Juicy.Entity(this, ['Sprite', 'Player', 'Digger', 'Physics']);
        this.player.position = new Juicy.Point(75, -20);
        this.player.getComponent('Sprite').setSheet('img/sawman-fast.png', 20, 20);
        this.player.getComponent('Sprite').last_sprite = 3;
        this.player.getComponent('Sprite').repeat = true;

        this.player2 = new Juicy.Entity(this, ['Sprite', 'Player', 'Digger', 'Physics']);
        this.player2.position = new Juicy.Point(75, -20);
        this.player2.getComponent('Player').controls = ['A', 'D', 'S'];
        this.player2.getComponent('Sprite').setSheet('img/sawman-fast.png', 20, 20);
        this.player2.getComponent('Sprite').last_sprite = 3;
        this.player2.getComponent('Sprite').repeat = true;

        this.watching = this.player;

        this.camera = {
            x: 0,       //this.player.position.x,
            y: -104,    //this.player.position.y,
            give_x: 4,
            give_y: 0,
            dx: 0,
            dy: 0
        };
    },
    init: function() {
        Juicy.Sound.load('jump', 'fx_jump.mp3');
//        this.player.getComponent('Sprite').runAnimation(0, 3, 0.016, true);
    },
    key_UP: function() {
        console.log('up!');

        Juicy.Sound.play('jump');
    },
    key_ESC: function() {
        this.game.setState(new PauseState(this));
    },
    key_SPACE: function() {
        if (this.watching === this.player) {
            this.watching = this.player2;
        }
        else {
            this.watching = this.player;
        }
    },
    update: function(dt, game) {
        this.player.update(dt);
        this.player2.update(dt);

        var dx = 0;
        var dy = (this.watching.position.y - game.height / 4) - this.camera.y;

        this.camera.x += dx * 8 * dt;
        this.camera.y += dy * 8 * dt;
        if (this.camera.x < 0) 
            this.camera.dx = this.camera.x = 0;
        if (this.camera.x * this.tilesize + game.width > this.tile_manager.width * this.tilesize) {
            this.camera.dx = 0;
            this.camera.x = this.tile_manager.width - game.width / this.tilesize;
        }

        var winner = this.player;
        if (this.player2.position.y > winner.position.y) {
            winner = this.player2;
        }

        winner.getComponent('Physics').dy -= 1;
        if (winner.position.y + game.height >= this.tile_manager.height * this.tile_manager.TILE_SIZE) {
            this.tile_manager.addRow(true);
        }
    },
    render: function(context) {
        context.save();
        context.translate(-this.camera.x, -this.camera.y);

        this.tiles.render(context, this.camera.x, this.camera.y, this.game.width, this.game.height);
        this.player.render(context);
        this.player2.render(context);

        context.restore();
    }
});
