var TutorialLevel = Level.extend({
    constructor: function(options) {
        // Set tutorial specific options
        options = options || {};
        options.width = 10;
        options.height = 3;
        options.countdown = false;
        options.song = 'tutorial';

        Level.call(this, options);

        this.helper = new Juicy.Entity(this, ['ColoredSprite', 'Follower', 'TextRender']);
        this.helper.getComponent('ColoredSprite').setSheet('img/helper.png', 12, 16);
        this.helper.getComponent('ColoredSprite').runAnimation(0, 11, 0.16, true);
        this.helper.position = this.player.position.sub(Juicy.Point.temp(10, 8));
        this.helper.getComponent('Follower').follow(this.player, Juicy.Point.create(-10, -8), true);
        this.message = this.helper.getComponent('TextRender').set({
            text: 'HI THERE!',
            font: 'BIG',
            animate: 'NONE',
            position: Juicy.Point.create(10, 10),
            showBackground: true,
            brightness: 3,
            offset: Juicy.Point.create(14, -4)
        });

        this.ui.addText({
            text: 'PRESS SPACE TO SKIP',
            animate: 'NONE',
            showBackground: true,
            brightness: 2,
            position: Juicy.Point.create(1)
        });

        this.objects.push(this.helper);

        this._blink = 2;
        this.countdown = 5;

        this.initIntro();

        var pyramid = new Juicy.Entity(this, ['ColoredSprite']);
        pyramid.getComponent('ColoredSprite').setSheet('img/altar.png', 40, 80);
        pyramid.getComponent('ColoredSprite').runAnimation(0, 3, 0.32, true);
        pyramid.position.x = 40;
        pyramid.position.y = -80;
        pyramid.scale = Juicy.Point.create(2, 2);
    
        // this.objects.push(pyramid);

        var self = this;
        this.pauseMenuItems = [
            {
                text: 'Skip Tutorial',
                oncomplete: function() {
                    self.key_SPACE();
                }
            }
        ];
    },

    goToCity: function() {
        localStorage.setItem('tutorial', 'true');
        this.complete = true;
        this.game.setState(new CityLevel());
    },

    key_SPACE: function() {
        this.goToCity();
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

        if (this.message.font.name === 'SPECIAL') {
            this.message.brightness = Math.floor(this._blink);
        }

        Level.prototype.update.apply(this, arguments);
    },

    sayNice: function(whatToDoNext) {
        var niceTime = 1.5;
        this.message.text = 'NICE!!';
        this.message.brightness = 3;
        this.message.setFont('BIG');

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
            'HI THERE!',
            'IM IVAN!',
            'WELCOME TO QUICKSILVER!',
            'LETS SHOW YOU THE ROPES'
        ], function() {
            self.updateFunc = self.pressDown;
        })();
    },

    updateHelperOnly: function(dt, game) {
        return false;
    },

    pressDown: function(dt, game) {
        this.message.text = '\2';
        this.message.setFont('SPECIAL');

        if (game.keyDown('DOWN')) {
            this.sayNice(this.pressRightUp);

            return true;
        }

        return false; // Do NOT update game
    },

    pressRightUp: function(dt, game) {
        this.message.text = '\1\0';
        this.message.setFont('SPECIAL');

        if (this.player.getComponent('Physics').dy < -20) {
            this.sayNice(this.countdownToGame);
        }
    },

    countdownToGame: function(dt, game) {
        this.countdown -= dt;
        this.message.setFont('BIG');
        this.message.text = Math.floor(this.countdown) + '';
        this.message.brightness = 3;

        if (this.countdown <= 1) {
            this.goToCity();
        }
    }
});

