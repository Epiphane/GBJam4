var InfiniteLevel = Level.extend({
    constructor: function(options) {
        options = options || {};

        var self = this;

        options.countdown = 3;

        // Level.apply(this, arguments);
        Level.call(this, options);

        this.score = 0;
        this.scoreText = this.ui.addText({
            font: 'BIG',
            text: 'SCORE 0',
            brightness: 3,
            animate: 'SLIDE',
            delayPerCharacter: 0,
            showBackground: true,
            initialDelay: 80,
            position: new Juicy.Point(110, 20)
        })

        // Create coins!
        this.target = new Juicy.Entity(this, ['ColoredSprite', 'Goal']);
        this.target.getComponent('ColoredSprite').setSheet('img/spinningpiece2.png', 24, 24).runAnimation(0, 7, 0.18, true);
        this.objects.push(this.target);
        this.moveGoal();

        this.player.target = this.target;

        // Create tha birds
        this.objects.push(new Juicy.Entity(this, ['BirdManager']));

        this.initPlaceName();
    },

    key_SPACE: function() {
        this.initPlaceName();
    },

    initPlaceName: function() {
        if (this.subTitle) {
            this.subTitle.setText(this.subtitle());
        }
        else {
            this.subTitle = this.ui.addText({
                text: this.subtitle(),
                font: TEXT.FONTS.SMALL,
                position: Juicy.Point.create(5, 20),
                brightness: 2,
                animate: 'SLIDE',
                delayPerCharacter: 0,
                initialDelay: 80,
            });
        }

        this.roomTitle.setText(this.placeName());
    },

    moveGoal: function() {
        var type = Juicy.rand(3);

        if (type === 0) {
            this.target.getComponent('ColoredSprite').setSheet('img/spinningpiece2.png', 24, 24).runAnimation(0, 7, 0.18, true);
        }
        else if (type === 1) {
            this.target.getComponent('ColoredSprite').setSheet('img/doge-coin.png', 32, 32).runAnimation(0, 7, 0.18, true);
        }
        else {
            this.target.getComponent('ColoredSprite').setSheet('img/spinningpiece1.png', 20, 20).runAnimation(0, 7, 0.18, true);
        }
        this.target.position = new Juicy.Point(Juicy.rand(this.tile_manager.width - 100), 288-Juicy.rand(10, 80));
    },

    getTarget: function() {
        this.target.getComponent('Goal').asplode();
        this.moveGoal();

        this.shake = 0.4;
        this.score ++;
        this.scoreText.setText('Score: ' + this.score);

        sfx.play('goal');
    }
});

