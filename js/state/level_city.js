var CityLevel = Level.extend({
    constructor: function(options) {
        // Set tutorial specific options
        options = options || {};
        options.width = 10;
        options.height = 2;
        options.countdown = false;
        options.song = 'lvl2';

        Level.call(this, options);

        var pyramid = new Juicy.Entity(this, ['ColoredSprite']);
        pyramid.getComponent('ColoredSprite').setSheet('img/altar.png', 40, 80);
        pyramid.getComponent('ColoredSprite').runAnimation(0, 3, 0.32, true);
        pyramid.position.x = 100;
        pyramid.position.y = -80;
        pyramid.scale = Juicy.Point.create(2, 2);
    
        this.objects.push(pyramid);

        this.helper = new Juicy.Entity(this, ['ColoredSprite', 'Follower', 'TextRender']);
        this.helper.getComponent('ColoredSprite').setSheet('img/helper.png', 10, 14);
        this.helper.getComponent('ColoredSprite').runAnimation(0, 11, 0.16, true);
        this.helper.position = this.player.position.sub(Juicy.Point.temp(10, 8));
        this.helper.getComponent('Follower').follow(this.player, Juicy.Point.create(-10, -8), true);
        this.message = this.helper.getComponent('TextRender').set({
            text: '',
            font: 'BIG',
            animate: 'NONE',
            position: Juicy.Point.create(10, 10),
            showBackground: true,
            brightness: 3,
            offset: Juicy.Point.create(14, -4)
        });

        this.objects.push(this.helper);
    },

    init: function() {
        Level.prototype.init.apply(this, arguments);

        if (this.loaded) {
            this.tile_manager.persistTiles(40, 0, this.game_width * this.tile_manager.TILE_SIZE - 100, 20);
        }
    }
});

