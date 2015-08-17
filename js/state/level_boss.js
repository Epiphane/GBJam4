var BossLevel = Level.extend({
    constructor: function(options) {
        options = options || {};

        options.width = 2;
        options.height = 1;

        var self = this;

        // Level.apply(this, arguments);
        Level.call(this, options);

        this.boss = new Juicy.Entity(this, ['ColoredSprite', 'Enemy']);
        this.boss.getComponent('ColoredSprite').setSheet('img/buzz_boss.png', 32, 24).runAnimation(0, 11, 0.1, true);
        this.boss.position.y = 288 - 60;
        this.boss.position.x = 240;
        this.boss.getComponent('Enemy').movePattern = 'HOVER';
        this.objects.push(this.boss);

        this.boss.getComponent('ColoredSprite').clearRect();

        this.asplosion = new Juicy.Components.ColoredSprite();
        this.asplosion.setSheet('img/explosion.png', 20, 20);
        this.asplosionsLeft = 200;

        this.player.position.x = 180;
    },

    init: function() {
        Level.prototype.init.apply(this, arguments);

        if (this.loaded) {
            this.tile_manager.blockTiles(0, 0, 8, (this.game_height + 1) * this.tile_manager.chunk_height);
            this.tile_manager.blockTiles(this.game_width * this.tile_manager.TILE_SIZE - 8, 0, 8, (this.game_height + 1) * this.tile_manager.chunk_height);
        }
    },

    completeLevel: function() {
        this.complete = true;
        this.game.setState(new CityLevel());
    },

    getTarget: function() {}, // Ignore

    update: function(dt, game) {
        if (this.boss.remove) {
            if (this.asplosionsLeft > 0) {
                dt /= 2;
                sfx.play('textBonk');

                if (this.asplosionsLeft % 3) {
                    var asplosion = new Juicy.Entity(this, [this.asplosion, 'Expiring']);
                    asplosion.position.x = Juicy.rand(this.boss.position.x, this.boss.position.x + this.boss.width)
                    asplosion.position.y = Juicy.rand(this.boss.position.y, this.boss.position.y + this.boss.height)
                    asplosion.width = asplosion.height = 20;
                    this.objects.push(asplosion);
                }

                this.asplosionsLeft --;
            }
        }

        Level.prototype.update.call(this, dt, game);
    }
});
