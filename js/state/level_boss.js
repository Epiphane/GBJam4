var BossLevel = Level.extend({
    constructor: function(options) {
        options = options || {};

        options.width = 2;
        options.height = 1;

        var self = this;

        // Level.apply(this, arguments);
        Level.call(this, options);

        this.boss = new Juicy.Entity(this, ['ColoredSprite']);
        this.boss.getComponent('ColoredSprite').setSheet('img/buzz_boss.png', 40, 40)
                 .runAnimation(0, 11, 0.1, true);
        this.boss.position.y = 288 - 60;
        this.objects.push(this.boss);
    },

    completeLevel: function() {
        this.complete = true;
        this.game.setState(new CityLevel());
    },

    getTarget: function() {}, // Ignore


});
