var InfiniteLevel = Level.extend({
    constructor: function(options) {
        var self = this;

        this.gateOpen = false;

        // Level.apply(this, arguments);
        Level.call(this, options);

        // Create coins!
        this.target = new Juicy.Entity(this, ['ColoredSprite', 'Goal']);
        this.target.getComponent('ColoredSprite').setSheet('img/doge-coin.png', 32, 32);
        this.target.getComponent('ColoredSprite').runAnimation(0, 7, 0.2, true);
        this.objects.push(this.target);
        this.moveGoal();

        this.player.target = this.target;

        // Create tha birds
        this.objects.push(new Juicy.Entity(this, ['BirdManager']));

        // Create gate to next level
        this.gate = new Juicy.Entity(this, ['ColoredSprite']);
        this.gate.position = new Juicy.Point((this.game_width - 52) / 2, -48);
        this.objects.push(this.gate);

        var gateSprite = this.gate.getComponent('ColoredSprite');
        gateSprite.setSheet('img/gate.png', 52, 48);
        gateSprite.runAnimation(0, 7, -1, false);
        gateSprite.oncompleteanimation = function() {
                self.gateOpen = true;
                self.updateFunc = self.panToGate;

                self.player.target = self.gate;

                gateSprite.runAnimation(8, 10, 0.2, true);
                gateSprite.oncompleteanimation = null;
            };
    },

    completeLevel: function() {
        this.cleanup();
        this.game.setState(new InfiniteLevel({
            width: 4, 
            height: 30
        }));
    },

    moveGoal: function() {
        this.target.position = new Juicy.Point(Juicy.rand(this.tile_manager.width - 100), -Juicy.rand(10, 80));
    },

    getTarget: function() {
        if (!this.gateOpen) {
            this.target.getComponent('Goal').asplode();
            this.moveGoal();

            this.gate.getComponent('ColoredSprite').goNextFrame();
        }
        else if (this.updateFunc !== this.checkGate) {
            this.updateFunc = this.checkGate;

            this.shake = 3.0;
        }

        sfx.play('goal');
    },

    endLevel: function(dt, game) {
        var dist = this.gate.center().sub(this.player.center());
        this.player.position = this.player.position.add(dist.mult(1/8).free());

        if (this.shake <= 0.5) {
            this.completeLevel();
        }

        this.gate.update(dt);

        return false; // Do NOT update physics
    },

    panToGate: function(dt, game) {
        this.watching = this.gate;
        this.camera.dx = 1;
        this.camera.dy = 1.5;

        if (this.gate.center()._sub(Juicy.Point.temp(this.camera.x + game.width / 2, this.camera.y + game.height / 4))._length() < 10) {
            this.updateFunc = null;

            this.watching = this.player;
        }

        return false; // Do NOT update physics
    },

    checkGate: function(dt, game) {
        if (this.gate.center().sub(this.player.center()).length() < 30) {
            this.updateFunc = this.endLevel;

            return false; // Do NOT update physics
        }

        return true;
    }
});

