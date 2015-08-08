var GameState = Juicy.State.extend({
    constructor: function() {
        this.tile_manager = new Juicy.Components.TileManager(16, 4);
        this.tiles = new Juicy.Entity(this, [ this.tile_manager ]);

        this.player = new Juicy.Entity(this, ['Sprite', 'Player', 'Physics']);
        this.player.position = new Juicy.Point(75, -20);

        this.player.getComponent('Sprite').setSheet('img/enemy.png', 25, 16);
        this.player.getComponent('Sprite').last_sprite = 7;
        this.player.getComponent('Sprite').repeat = true;
        this.camera = {
            x: 0,       //this.player.   position.x,
            y: -104,    //this.player.   position.y,
            give_x: 4,
            give_y: 0,
            dx: 0,
            dy: 0
        };
    },
    init: function() {
        Juicy.Sound.load('jump', 'fx_jump.mp3');
        this.player.getComponent('Sprite').runAnimation(0, 7, 0.1, true);
    },
    key_UP: function() {
        console.log('up!');

        Juicy.Sound.play('jump');
    },
    update: function(dt, game) {
        this.player.update(dt);

        var dx = 0,
            dy = 0,
            dt = 0;

        this.camera.x += dx * 4 * dt;
        this.camera.y += dy * 4 * dt;
        if (this.camera.x < 0) 
            this.camera.dx = this.camera.x = 0;
        if (this.camera.x * this.tilesize + game.width > this.tile_manager.width * this.tilesize) {
            this.camera.dx = 0;
            this.camera.x = this.tile_manager.width - game.width / this.tilesize;
        }
    },
    render: function(context) {
        context.save();
        context.translate(-this.camera.x, -this.camera.y);

        this.tiles.render(context);
        this.player.render(context);

        context.restore();
    }
});
