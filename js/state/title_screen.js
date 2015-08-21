var TitleScreen = Juicy.State.extend({
    constructor: function(state) {
        this.titleGuy = new Juicy.Entity(this, ['ColoredSprite']);
        this.titleGuy.getComponent('ColoredSprite').setSheet('img/titlescreen-shine.png', 92, 71);
        this.titleGuy.getComponent('ColoredSprite').runAnimation(0, 35, 0.08, true);
        this.titleGuy.position.x = 80 - (this.titleGuy.width / 2);
        this.titleGuy.position.y = 30;

        this.particles = new Juicy.Entity(this, ['ParticleManager']);

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

        this.particles.getComponent('ParticleManager').spawnParticles({
            color: "LOW", 
            size: 1, 
            howMany: 500, 
            timeToLive: function(particle, ndx) {
                return 0;
            },
            initParticle: function(particle) {
                particle.x = Math.random() * 160;
                particle.y = Math.random() * 150;
                
                particle.dx = -Math.random() * 0.5 - 0.15;
                particle.dy = 0;

                particle.startLife = 500;
                particle.life = particle.startLife;
            },
            updateParticle: function(particle) {
                particle.x += particle.dx;
                particle.y += particle.dy;
            }
        });

        this.tiles = [];

        for (var x = 0; x < 3; x++) {
                var newTile = new Juicy.Entity(this, ['ColoredSprite']);
                newTile.getComponent('ColoredSprite').setSheet('img/stalac.png', 160, 144);
                newTile.position.x = x * 160;
                newTile.dx = -2;
                this.tiles.push(newTile);
        }

        for (var x = 0; x < 3; x++) {
                var newTile = new Juicy.Entity(this, ['ColoredSprite']);
                newTile.getComponent('ColoredSprite').setSheet('img/dirt.png', 160, 144);
                newTile.position.x = x * 160;
                newTile.dx = -4;
                this.tiles.push(newTile);
        }

        for (var x = 0; x < 3; x++) {
                var newTile = new Juicy.Entity(this, ['ColoredSprite']);
                newTile.getComponent('ColoredSprite').setSheet('img/dark.png', 160, 144);
                newTile.position.x = x * 160;
                newTile.dx = -9;
                this.tiles.push(newTile);
        }

        music.play('title');
    },

    render: function(context) {
        this.particles.render(context);
        for (var ndx = 0; ndx < this.tiles.length; ndx++) {
            this.tiles[ndx].render(context);
        }

        this.titleGuy.render(context);
        this.ui.render(context);
    },

    update: function(dt) {
        this.particles.update(dt);
        this.titleGuy.update(dt);
        this.ui.update(dt);

        this.totalTime += dt;
        this.titleGuy.position.y = Math.sin(this.totalTime*1.2) * 5 + 20;

        for (var ndx = 0; ndx < this.tiles.length; ndx++) {
            var currTile = this.tiles[ndx];
            currTile.position.x += currTile.dx;
            if (currTile.position.x < -160) {
                currTile.position.x += 320
            }
        }

        this.particles.getComponent('ParticleManager').spawnParticles({
            color: "LOW", 
            size: 1, 
            howMany: 1, 
            timeToLive: function(particle, ndx) {
                return 0;
            },
            initParticle: function(particle) {
                particle.x = 160;
                particle.y = 20 + Math.random() * 100;
                
                particle.dx = -Math.random() * 0.5 - 0.15;
                particle.dy = 0;

                particle.startLife = 900;
                particle.life = particle.startLife;
            },
            updateParticle: function(particle) {
                particle.x += particle.dx;
                particle.y += particle.dy;
            }
        });

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
