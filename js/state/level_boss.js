var BossLevel = Level.extend({
    constructor: function(options) {
        options = options || {};

        options.width = 2;
        options.height = 5;

        var self = this;

        // Level.apply(this, arguments);
        Level.call(this, options);

        this.boss = new Juicy.Entity(this, ['ColoredSprite']);
        this.boss.getComponent('ColoredSprite').setSheet('img/buzz_boss.png', 40, 40)
                 .runAnimation(0, 11, 0.1, true);
        this.boss.position.y = 288 - 60;
        this.objects.push(this.boss);
    },

    init: function() {
        Level.prototype.init.apply(this, arguments);
        console.log(this.loaded);

        if (this.loaded) {
            this.tile_manager.blockTiles(0, 0, 8, (this.game_height + 1) * this.tile_manager.chunk_height);
            this.tile_manager.blockTiles(this.game_width * this.tile_manager.chunk_width / 2 - 8, 0, 8, (this.game_height + 1) * this.tile_manager.chunk_height);
        }
    },

    completeLevel: function() {
        this.complete = true;
        this.game.setState(new CityLevel());
    },

    getTarget: function() {}, // Ignore


});
