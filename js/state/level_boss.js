var BossLevel = Level.extend({
    constructor: function(options) {
        options = options || {};

        options.width = 4;
        options.height = 1;

        var self = this;

        // Level.apply(this, arguments);
        Level.call(this, options);

        this.particles = new Juicy.Entity(this, ['ParticleManager'])

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

    completeLevel: function() {
        this.complete = true;
        this.game.setState(new CityLevel());
    },

    getTarget: function() {}, // Ignore

    update: function(dt, game) {
        this.particles.update(dt);

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
        }

        Level.prototype.update.call(this, dt, game);

        for (var ndx = 0; ndx < this.drones.length; ndx++) {
            var drone = this.drones[ndx];

            var diff = this.player.position.sub(drone.position);
            var normalDiff = diff.mult(1/diff.length());

            var dronePhysics = drone.getComponent('Physics');

            dronePhysics.dx += normalDiff.x * 150 - 75;
            dronePhysics.dy += normalDiff.y * 150 - 75;

            if (this.player.testCollision(drone) && !this.boss.remove) {
                var physics = this.player.getComponent('Physics');
                var directionToPlayer = drone.center().sub(this.player.center());

                physics.dx = Math.random() * 120 - 60;
                physics.dy = Math.random() * 120 - 60;
                if (directionToPlayer.x > 0)
                    physics.dx *= -1;
                if (directionToPlayer.y > 0)
                    physics.dy *= -1;

                this.player.getComponent('Digger').energy -= 5;
            }
        }
    },

    render: function(context) {
        Level.prototype.render.call(this, context);
        this.particles.render(context);
    },

    newDrone: function() {
        var newDrone = new Juicy.Entity(this, ['ColoredSprite', 'Digger', 'Physics']);
        newDrone.getComponent('ColoredSprite').setSheet('img/helper.png', 12, 16);
        newDrone.position = this.boss.position.clone();

        this.objects.push(newDrone);
        this.drones.push(newDrone);
    }
});
