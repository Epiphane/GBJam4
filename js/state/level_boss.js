var BossLevel = Level.extend({
    constructor: function(options) {
        options = options || {};

        options.width = 4;
        options.height = 1;
        options.music = 'boss';

        var self = this;

        // Level.apply(this, arguments);
        Level.call(this, options);

        this.particles = new Juicy.Entity(this, ['ParticleManager'])

        this.boss = new Juicy.Entity(this, ['ColoredSprite', 'Enemy']);

        var bossType = getAltarState();
        this.boss.position.y = 288 - 60;
        this.boss.position.x = 240;
        if (bossType === 0) {
            this.boss.getComponent('ColoredSprite').setSheet('img/buzz_boss.png', 32, 24).runAnimation(0, 11, 0.1, true);
            this.boss.getComponent('Enemy').movePattern = 'HOVER';
        }
        else if (bossType === 1) {
            this.boss.getComponent('ColoredSprite').setSheet('img/enemy.png', 50, 32).runAnimation(0, 7, 0.1, true);
            this.boss.getComponent('Enemy').movePattern = 'WALK';
            this.boss.position.y = 288 - 32;
        }
        else { // 2
            this.boss.getComponent('ColoredSprite').setSheet('img/eyeboss.png', 40, 40).runAnimation(0, 9, 0.1, true);
            this.boss.getComponent('Enemy').movePattern = 'FLY';
        }
        this.objects.push(this.boss);

        this.asplosion = new Juicy.Components.ColoredSprite();
        this.asplosion.setSheet('img/explosion.png', 20, 20);
        this.asplosionsLeft = 200;

        this.player.position.x = 180;

        this.niceHit = {
            text: 'NICE HIT!',
            font: 'BIG',
            center: 'TRUE',
            brightness: 0,
            position: new Juicy.Point(80, 20)
        };

        this.drones = [];
    },

    init: function() {
        Level.prototype.init.apply(this, arguments);

        if (this.loaded) {
            this.tile_manager.blockTiles(0, 0, 8, (this.game_height + 1) * this.tile_manager.chunk_height);
            this.tile_manager.blockTiles(this.game_width * this.tile_manager.TILE_SIZE - 8, 0, 8, (this.game_height + 1) * this.tile_manager.chunk_height);
        }

        this.player.target = this.boss;
    },

    niceHit: function() {
        var text = this.ui.addText(this.niceHit);
    
        this.timeout(function() {
            text.remove = true;
        }, 1);
    },

    beatLevel: function() {
        this.ui.addText({
            text: 'Artifact acquired!',
            font: 'BIG',
            animate: 'DRAMATIC',
            position: Juicy.Point.create(80, 40),
            center: true,
            brightness: 3,
            showBackground: true
        });

        this.updateFunc = function() { return false; };

        var self = this;
        this.timeout(function() {
            self.completeLevel();
        }, 2);
    },

    completeLevel: function() {
        this.complete = true;
        this.game.setState(new CityLevel());
    },

    getTarget: function() {}, // Ignore

    update: function(dt, game) {
        this.particles.update(dt);

        Level.prototype.update.call(this, dt, game);

        if (this.boss.remove) {
            for (var ndx = 0; ndx < this.drones.length; ndx++) {
                var drone = this.drones[ndx];
                drone.remove = true;
            }

            if (this.asplosionsLeft > 0) {
                dt /= 4;
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
            else if (this.asplosionsLeft === 0) {
                var artifact = nextArtifact(this.boss);
                this.objects.splice(0, 0, artifact);

                this.player.target = artifact;
                this.getTarget = function() {
                    this.player.target = null;
                    artifact.collect();
                    this.beatLevel();
                }

                this.asplosionsLeft = -1;
            }
        }
        else {
            for (var ndx = 0; ndx < this.drones.length; ndx++) {
                var drone = this.drones[ndx];

                drone.offRailsTimer--;
                if (drone.offRailsTimer <= 0) {

                    if (drone.offRails) {
                        drone.offRailsTimer = Math.random() * 200 + 300;
                    }
                    else {
                        drone.offRailsTimer = Math.random() * 200 + 20;
                    }


                    drone.offRails = !drone.offRails;
                    drone.offRailsDx = Math.random() * 1 - 0.5;
                    drone.offRailsDy = Math.random() * 1 - 0.5;
                }

                if (drone.offRails) {
                    drone.position.x += drone.offRailsDx;
                    drone.position.y += drone.offRailsDy;
                }
                else {
                    var diff = this.player.position.sub(drone.position);
                    var normalDiff = diff.mult(1/diff.length());

                    drone.position.x += normalDiff.x * 0.4;
                    drone.position.y += normalDiff.y * 0.7;

                }

                if (this.player.testCollision(drone) && !this.boss.remove) {
                    var physics = this.player.getComponent('Physics');
                    var directionToPlayer = drone.center().sub(this.player.center());

                    physics.dx += Math.random() * 120 - 60;
                    physics.dy += Math.random() * 120 - 60;
                    if (directionToPlayer.x > 0)
                        physics.dx *= -1;
                    if (directionToPlayer.y > 0)
                        physics.dy *= -1;

                    this.player.getComponent('Digger').energy -= 5;
                }
            }
        }
    },

    render: function(context) {
        Level.prototype.render.call(this, context);
        this.particles.render(context);
    },

    newDrone: function() {
        var newDrone = new Juicy.Entity(this, ['ColoredSprite', 'Digger', 'Physics']);
        newDrone.getComponent('ColoredSprite').setSheet('img/bad-drone.png', 8, 8);
        newDrone.getComponent('ColoredSprite').runAnimation(0, 3, 0.016, true);

        newDrone.position = this.boss.position.clone();
        newDrone.getComponent('Digger').badDig = true;
        newDrone.getComponent('Physics').nah = true;

        newDrone.offRailsTimer = Math.random() * 200;

        this.objects.push(newDrone);
        this.drones.push(newDrone);
    }
});
