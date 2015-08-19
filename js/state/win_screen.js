var WinScreen = Juicy.State.extend({
    constructor: function(state) {
        this.winMan = new Juicy.Entity(this, ['ColoredSprite']);
        this.winMan.getComponent('ColoredSprite').setSheet('img/win-screen.png', 160, 144);

        this.ui_entity = new Juicy.Entity(this, ['UI']);
        this.ui = this.ui_entity.getComponent('UI');

        this.timeToNext = 30;
        this.particles = new Juicy.Entity(this, ['ParticleManager']);

        this.tiles = [];
        this.totalTime = 0;

        for (var x = 0; x < 3; x++) {
            for (var y = -1; y < 3; y++) {
                var newTile = new Juicy.Entity(this, ['ColoredSprite']);
                newTile.getComponent('ColoredSprite').setSheet('img/win-tile.png', 160, 144);
                newTile.position.x = x * 160;
                newTile.position.y = y * 144;
                this.tiles.push(newTile);
            }
        }

        this.spaceJunk = [];
    },


    update: function(dt) {
//         Level.prototype.update.apply(this, arguments);

        this.totalTime += dt;
        this.winMan.position.x = Math.random() * 8 - 4 + Math.sin(this.totalTime) * 20 + 10;
        this.winMan.position.y = Math.random() * 8 - 4;

        this.winMan.update(dt);

        this.particles.update(dt);

        var self = this;

        var newSpaceJunk = new Juicy.Entity(this, ['ColoredSprite']);
        newSpaceJunk.getComponent('ColoredSprite').setSheet('img/space-junk' + Math.ceil(Math.random() * 9) + '.png', 37, 37);
        newSpaceJunk.position.x = 200;
        newSpaceJunk.position.y = Math.random() * 144;
        newSpaceJunk.dx = Math.random() * -5 - 1;
        this.spaceJunk.push(newSpaceJunk);

        
        for (var ndx = 0; ndx < this.spaceJunk.length; ndx++) {
            this.spaceJunk[ndx].position.x += this.spaceJunk[ndx].dx;
        }

        this.particles.getComponent('ParticleManager').spawnParticles({
            color: "LIGHT", 
            size: 10, 
            howMany: 1, 
            timeToLive: function(particle, ndx) {
                return 0;
            },
            initParticle: function(particle) {
                particle.x = self.winMan.position.x + 60;
                particle.y = 20 + Math.random() * 80;
                
                particle.dx = -10;
                particle.dy = 0;

                particle.startLife = 5 + Math.random() * 15;
                particle.life = particle.startLife;
            },
            updateParticle: function(particle) {
                particle.x += particle.dx;
                particle.y += particle.dy;
            }
        });


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
               position: Juicy.Point.create(Math.random() * 160 - 60, Math.random() * 144),
               center: false,
               brightness: Math.floor(Math.random() * 3) + 1,
               animate: 'DRAMATIC',
               delayPerCharacter: 2,
               timeTillDeath: 200,
            });

            this.timeToNext = 300;
        }

        for (var ndx = 0; ndx < this.tiles.length; ndx++) {
            var currTile = this.tiles[ndx];
            currTile.position.x -= 4;
            if (currTile.position.x < -160) {
                currTile.position.x += 320
            }
        }
    },

    render: function(context) {

        for (var ndx = 0; ndx < this.spaceJunk.length; ndx++) {
            var currSpaceJunk = this.spaceJunk[ndx];

            context.save();
            context.translate(currSpaceJunk.position.x, currSpaceJunk.position.y);
            this.spaceJunk[ndx].render(context);
            context.restore();
        }

        context.save();
//         context.translate(0, Math.random() * 2 - 1);
        for (var ndx = 0; ndx < this.tiles.length; ndx++) {
         //   this.tiles[ndx].render(context);
        }
        context.restore();

        this.ui_entity.render(context);
        this.particles.render(context);
        this.winMan.render(context);
    },

    
});
