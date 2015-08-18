var TitleScreen = Juicy.State.extend({
    constructor: function(state) {
        this.titleGuy = new Juicy.Entity(this, ['ColoredSprite']);
        this.titleGuy.getComponent('ColoredSprite').setSheet('img/titlescreen-shine.png', 92, 71);
        this.titleGuy.getComponent('ColoredSprite').runAnimation(0, 35, 0.08, true);
        this.titleGuy.position.x = 80 - (this.titleGuy.width / 2);
        this.titleGuy.position.y = 20;

        this.ui_entity = new Juicy.Entity(this, ['UI']);
        this.ui = this.ui_entity.getComponent('UI');

        this.totalTime = 0;

        this.ui.addText({
            text: "PRESS SPACE",
            font: TEXT.FONTS.BIG,
            position: Juicy.Point.create(80, 100),
            center: true,
            brightness: 2,
            animate: 'DRAMATIC',
            delayPerCharacter: 2,
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

        this.totalTime += dt;
        this.titleGuy.position.y = Math.sin(this.totalTime*1.2) * 5 + 10;
    },

    key_SPACE: function() {
        music.stop('title');
        this.game.setState(new CityLevel());        

        var tutorial = localStorage.getItem('tutorial');

        if (!tutorial) {
            Juicy.Game.setState(new TutorialLevel()).run();
        }
        else {
            Juicy.Game.setState(new BossLevel()).run();
        }     
    },
});
