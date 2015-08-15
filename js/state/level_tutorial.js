var TutorialLevel = Level.extend({
    constructor: function(options) {
        // Set tutorial specific options
        options = options || {};
        options.width = 2;
        options.height = 3;
        options.countdown = false;

        Level.call(this, options);

        this.updateFunc = this.pressDown;

        this.message = {
            text: '\2',
            font: UI.FONTS.SPECIAL,
            position: Juicy.Point.create(),
            center: true,
        };
        this.ui.addText(this.message);

        this._blink = 2;
        this.countdown = 7;
    },

    update: function(dt, game) {
        this._blink -= dt;
        if (this._blink <= 0) this._blink = 1.9;

        this.message.brightness = Math.floor(this._blink);
        this.message.position = this.player.center().sub(Juicy.Point.temp(this.camera.x, this.camera.y + 20));

        Level.prototype.update.apply(this, arguments);
    },

    sayNice: function(whatToDoNext) {
        var niceTime = 1.5;
        this.message.text = 'NICE';
        this.message.brightness = 3;
        this.message.font = UI.FONTS.BIG;

        this.updateFunc = function(dt) {
                niceTime -= dt;
                if (niceTime < 0) {
                    this.updateFunc = whatToDoNext;
                }
            }
    },

    pressDown: function(dt, game) {
        this.message.text = '\2';
        this.message.font = UI.FONTS.SPECIAL;

        if (game.keyDown('DOWN')) {
            this.sayNice(this.pressRightUp);

            return true;
        }

        return false; // Do NOT update game
    },

    pressRightUp: function(dt, game) {
        this.message.text = '\1\0';
        this.message.font = UI.FONTS.SPECIAL;

        if (this.player.getComponent('Physics').dy < -20) {
            this.sayNice(this.countdownToGame);
        }
    },

    countdownToGame: function(dt, game) {
        this.countdown -= dt;
        this.message.font = UI.FONTS.BIG;
        this.message.text = Math.floor(this.countdown) + '';
        this.message.brightness = 3;

        if (this.countdown <= 1) {
            game.setState(new InfiniteLevel());
        }
    }
});

