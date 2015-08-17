var TitleScreen = Juicy.State.extend({
    constructor: function(state) {
        this.titleGuy = new Juicy.Entity(this, ['ColoredSprite']);
        this.titleGuy.getComponent('ColoredSprite').setSheet('img/titlescreen-shine.png', 92, 71);
        this.titleGuy.getComponent('ColoredSprite').runAnimation(0, 8, 0.08, true);
        this.titleGuy.position.x = 80 - (this.titleGuy.width / 2);
        this.titleGuy.position.y = 20;

        this.ui_entity = new Juicy.Entity(this, ['UI']);
        this.ui = this.ui_entity.getComponent('UI');

        this.roomTitle = this.ui.addText({
            text: "HEY PRESS SPACE DUMMY",
            font: TEXT.FONTS.BIG,
            position: Juicy.Point.create(80, 100),
            center: true,
            brightness: 2,
            animate: 'DRAMATIC',
            delayPerCharacter: 6,
        });

        music.play('title');
    },

    render: function(context) {
        this.titleGuy.render(context);
        this.ui.render(context);
    },

    update: function(dt) {
        this.titleGuy.update(dt);
        this.ui.update(dt);
    },

    key_SPACE: function() {
        music.stop('title');
        this.game.setState(new CityLevel());        

        var tutorial = localStorage.getItem('tutorial');

        if (!tutorial) {
            Juicy.Game.setState(new TutorialLevel()).run();
        }
        else {
            Juicy.Game.setState(new CityLevel()).run();
        }     
    },
});
