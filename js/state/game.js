var GameState = Juicy.State.extend({
    constructor: function() {
        this.tile_manager = new Juicy.Components.TileManager(16, 4);
        this.tiles = new Juicy.Entity(this, [ this.tile_manager ]);

        this.player = new Juicy.Entity(this, ['Sprite', 'Player', 'Physics']);
        this.player.position = new Juicy.Point(75, -20);

        this.player.getComponent('Sprite').setSheet('img/sawman-fast.png', 20, 20);
        this.player.getComponent('Sprite').last_sprite = 3;
        this.player.getComponent('Sprite').repeat = true;
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
    update: function(dt, game) {
        if (game.keyDown('ESC')) throw 'au';

        this.player.update(dt);

        var dx = 0;
        var dy = (this.player.position.y - game.height / 4) - this.camera.y;

        this.camera.x += dx * 8 * dt;
        this.camera.y += dy * 8 * dt;
        if (this.camera.x < 0) 
            this.camera.dx = this.camera.x = 0;
        if (this.camera.x * this.tilesize + game.width > this.tile_manager.width * this.tilesize) {
            this.camera.dx = 0;
            this.camera.x = this.tile_manager.width - game.width / this.tilesize;
        }

        if (this.camera.y + game.height >= this.tile_manager.height * this.tile_manager.TILE_SIZE) {
            this.tile_manager.addRow(true);
        }
    },
    render: function(context) {
        context.save();
        context.translate(-this.camera.x, -this.camera.y);

        this.tiles.render(context, this.camera.x, this.camera.y, this.game.width, this.game.height);
        this.player.render(context);

        context.restore();
    }
});
