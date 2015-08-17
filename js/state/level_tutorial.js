var TutorialLevel = Level.extend({
    constructor: function(options) {
        // Set tutorial specific options
        options = options || {};
        options.width = 10;
        options.height = 3;
        options.countdown = false;
        options.song = 'tutorial';

        Level.call(this, options);

        this.ivan = new Juicy.Entity(this, ['ColoredSprite', 'Follower', 'TextRender']);
        this.ivan.getComponent('ColoredSprite').setSheet('img/helper.png', 12, 16);
        this.ivan.getComponent('ColoredSprite').runAnimation(0, 11, 0.16, true);
        this.ivan.position = this.player.position.sub(Juicy.Point.temp(10, 8));
        this.ivan.getComponent('Follower').follow(this.player, Juicy.Point.create(-10, -8), true);
        var ivan_message = this.ivan_message = this.ivan.getComponent('TextRender').set({
            text: 'Welcome to town!',
            font: 'SMALL',
            animate: 'NONE',
            position: Juicy.Point.create(10, 10),
            showBackground: true,
            brightness: 3,
            offset: Juicy.Point.create(14, -4)
        });

        this.ui.addText({
            text: 'PRESS SPACE TO SKIP',
            animate: 'SLIDE',
            showBackground: true,
            brightness: 2,
            position: Juicy.Point.create(1)
        });

        this.objects.push(this.ivan);

        this._blink = 2;
        this.countdown = 5;

        this.say('hello');
        this.updateFunc = function() { return null; };

        var self = this;
        this.pauseMenuItems = [
            {
                text: 'Skip Tutorial',
                oncomplete: function() {
                    self.key_SPACE();
                }
            }
        ];

        this.piece = new Juicy.Entity(this, ['ColoredSprite']);
        this.piece.position = Juicy.Point.create(200, 288-20);
        this.piece.getComponent('ColoredSprite').setSheet('img/spinningpiece2.png', 24, 24).runAnimation(0, 7, 0.18, true);
    
        this.gate = new Juicy.Entity(this, ['Gate', 'ColoredSprite']);
        this.gate.position = new Juicy.Point(640, 288-48);
        var gateSprite = this.gate.getComponent('ColoredSprite');
        gateSprite.setSheet('img/gate.png', 52, 48);
        gateSprite.runAnimation(8, 10, 0.2, true);
        this.gate.getComponent('Gate').onplayertouch = function() {
            self.shake = 2;
            self.updateFunc = self.endLevel;
        };
    },

    endLevel: function(dt, game) {
        this.complete = true;
        localStorage.setItem('tutorial', 'true');

        var dist = this.gate.center().sub(this.player.center());
        this.player.position = this.player.position.add(dist.mult(1/8).free());

        if (this.shake < 1) {
            this.goToCity();
        }

        return false; // Do NOT update physics
    },

    goToCity: function() {
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

            this.tile_manager.persistTiles(40, 288, this.game_width * this.tile_manager.chunk_width, 8);
        }
    },

    speech: {
        hello: {
            text: 'HI THERE!',
            font: 'BIG',
            next: 'down'
        },
        down: {
            text: '\2',
            font: 'SPECIAL',
            nextKey: 'ivan'
        },
        ivan: {
            text: 'IM IVAN!',
            font: 'BIG',
            nextKey: 'welcome',
            brightness: 3
        },
        welcome: {
            text: 'WELCOME TO QUICKSILVER!',
            font: 'SMALL',
            nextKey: 'ropes'
        },
        ropes: {
            text: 'LETS SHOW YOU THE ROPES',
            font: 'SMALL',
            nextKey: function() {
                this.updateFunc = this.pressDown;
            }
        },
        nice: {
            text: 'NICE!',
            font: 'BIG',
            brightness: 3
        },
        hmm: {
            text: 'Hmmmm',
            font: 'SMALL',
            brightness: 3,
            next: 'letsGetOut'
        },
        letsGetOut: {
            text: 'Lets get outta here',
            next: 'weNeedDoor'
        },
        weNeedDoor: {
            text: 'Grab that part!',
            execute: function() {
                this.objects.push(this.piece);
                this.player.target = this.piece;
            }
        },
        letsGo: {
            text: 'OK! Lets Go!!',
            font: 'BIG',
            execute: function() {
                this.objects.push(this.gate);
                this.player.target = this.gate;
            }
        }
    },

    getTarget: function() {
        this.speech.nice.next = 'letsGo';
        this.piece.remove = true;
        sfx.play('goal');

        this.player.target = this.gate;

        this.say('nice');
    },

    update: function(dt, game) {
        this._blink -= dt;
        if (this._blink <= 0) this._blink = 1.9;

        if (this.ivan_message.font.name === 'SPECIAL') {
            this.ivan_message.brightness = Math.floor(this._blink);
        }

        Level.prototype.update.apply(this, arguments);
    },

    updateHelperOnly: function(dt, game) {
        return false;
    },

    pressDown: function(dt, game) {
        this.ivan_message.set({
            text: '\2',
            font: 'SPECIAL'
        });

        if (game.keyDown('DOWN')) {
            this.updateFunc = false;
            this.speech.nice.next = function() {
                this.updateFunc = this.pressRightUp;
            }
            this.say('nice');

            return true;
        }

        return false; // Do NOT update game
    },

    pressRightUp: function(dt, game) {
        this.ivan_message.set({
            text: '\1\0',
            font: 'SPECIAL'
        });

        if (this.player.getComponent('Physics').dy < -20) {
            this.updateFunc = false;
            this.speech.nice.next = 'hmm';
            this.say('nice');
        }
    },

    countdownToGame: function(dt, game) {
        this.countdown -= dt;
        this.ivan_message.set({
            font: 'BIG',
            text: Math.floor(this.countdown) + '',
            brightness: 3
        });

        if (this.countdown <= 1) {
            this.goToCity();
        }
    }
});

