var WinScreen = Juicy.State.extend({
    constructor: function(state) {
        this.winMan = new Juicy.Entity(this, ['ColoredSprite']);
        this.winMan.getComponent('ColoredSprite').setSheet('img/win-screen.png', 160, 144);

        this.ui_entity = new Juicy.Entity(this, ['UI']);
        this.ui = this.ui_entity.getComponent('UI');

        this.timeToNext = 10;
    },


    update: function(dt) {
//         Level.prototype.update.apply(this, arguments);

        this.winMan.position.x = Math.random() * 4 - 2;
        this.winMan.position.y = Math.random() * 4 - 2;

        this.winMan.update(dt);

        this.ui_entity.update(dt);

        var congrats = [
            "NICE", "GOOD JOB", "YOU DID IT", "WOW", "HOW DID YOU DO THAT", "I AM IMPRESSED", "UTTERLY AMAZING", "UNBELIEVABLE",
            "HAVE A NICE DAY", "WHAT IN THE NAME OF HEAVENS DID YOU DO TO MY FACE YOU PSYCOPATH", "WHAT", "CONGRATS", "COOL", "YOU ARE A GOOD PERSON",
            "WHAT IS FOR DINNER", "GREAT WORK", "I AM PROUD", "GOOD JOB SON",
        ]

        this.timeToNext--
        if (this.timeToNext <= 0) {
            this.ui.addText({
               text: randFromArray(congrats),
               font: TEXT.FONTS.BIG,
               position: Juicy.Point.create(Math.random() * 160, Math.random() * 144),
               center: false,
               brightness: Math.floor(Math.random() * 4),
               animate: 'DRAMATIC',
               delayPerCharacter: 2,
               timeTillDeath: 200,
            });

            this.timeToNext = 10;
        }
    },

    render: function(context) {
        this.ui_entity.render(context);
        this.winMan.render(context);
    },

    
});
