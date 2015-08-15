var TutorialLevel = Level.extend({
    constructor: function(options) {
        // Set tutorial specific options
        options = options || {};
        options.width = 2;
        options.height = 3;
        options.countdown = false;
        options.song = 'tutorial';

        Level.call(this, options);

        this.message = {
            text: 'HI THERE',
            font: UI.FONTS.BIG,
            animate: UI.ANIMATIONS.NONE,
            position: Juicy.Point.create(),
            brightness: 2
        };
        this.ui.addText(this.message);

        this.helper = new Juicy.Entity(this, ['ColoredSprite']);
        this.helper.getComponent('ColoredSprite').setSheet('img/helper.png', 10, 14);
        this.helper.getComponent('ColoredSprite').runAnimation(0, 11, 0.16, true);
        this.helper.position = this.player.position.sub(Juicy.Point.temp(10, 8));

        this.objects.push(this.helper);

        this._blink = 2;
        this.countdown = 7;

        this.initIntro();
    },

    init: function() {
        Level.prototype.init.apply(this, arguments);

        if (this.loaded) {
            var self = this;
            this.game.on('key', ['UP', 'DOWN', 'LEFT', 'RIGHT'], function() {
                if (self.nextMessage) {
                    var next = self.nextMessage;
                    self.nextMessage = false;

                    next();
                }
            });
        }
    },

    update: function(dt, game) {
        this._blink -= dt;
        if (this._blink <= 0) this._blink = 1.9;

        var dest = this.player.position.sub(Juicy.Point.temp(10, 8 + Math.sin(this._blink * 10)));
        this.helper.position = this.helper.position.add(dest._sub(this.helper.position)._mult(1/8));

        this.message.position = this.helper.center().sub(Juicy.Point.temp(this.camera.x - 8, this.camera.y + 8));
        if (this.message.font === UI.FONTS.SPECIAL) {
            this.message.brightness = Math.floor(this._blink);
        }

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
            };
    },

    queueMessage: function(text, next) {
        var self = this;
        return function() {
            self.message.text = text;
            self.message.animationTicks = -10;

            self.nextMessage = next;
        };
    },

    queueMessages: function(messages, oncomplete) {
        var next = oncomplete;
        for (var i = messages.length - 1; i >= 0; i --) {
            next = this.queueMessage(messages[i], next);
        }

        return next;
    },

    initIntro: function() {
        var self = this;
        this.updateFunc = this.updateHelperOnly;

        this.queueMessages([
            'HI THERE',
            'IM IVAN',
            'WELCOME TO QUICKSILVER',
            'LETS SHOW YOU THE ROPES'
        ], function() {
            self.updateFunc = self.pressDown;
        })();
    },

    updateHelperOnly: function(dt, game) {
        this.helper.update(dt);

        return false;
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
            this.cleanup();
            game.setState(new InfiniteLevel());
        }
    }
});

