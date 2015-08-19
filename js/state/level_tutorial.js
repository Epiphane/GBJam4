var TutorialLevel = Level.extend({
    constructor: function(options) {
        // Set tutorial specific options
        options = options || {};
        options.width = 10;
        options.height = 3;
        options.countdown = false;
        options.song = 'tutorial';
        options.backdrop = false;

        Level.call(this, options);

        this.showEnergy = false;

        this.player.getComponent('Digger').energy = 1000;

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

        this.esc = this.ui.addText({
            text: 'PRESS ESCAPE TO SKIP',
            animate: 'SLIDE',
            showBackground: true,
            brightness: 2,
            position: Juicy.Point.create(1, 2)
        });

        this.spc = this.ui.addText({
            text: 'PRESS SPACE TO CONTINUE',
            animate: 'SLIDE',
            showBackground: true,
            brightness: 2,
            initialDelay: 50,
            position: Juicy.Point.create(1, 8)
        });

        this.objects.push(this.ivan);

        this._blink = 2;
        this.countdown = 5;

        var self = this;
        this.pauseMenuItems = [
            {
                text: 'Restart Tutorial',
                oncomplete: function() {
                    self.game.setState(new TutorialLevel());

                    self.cleanup();
                }
            },
            {
                text: 'Skip Tutorial',
                oncomplete: function() {
                    self.endLevel();

                    self.cleanup();
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

        this.started = false;
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

    init: function() {
        Level.prototype.init.apply(this, arguments);

        if (this.loaded) {
            var self = this;

            if (!this.started) {
                this.say('hello');
                this.updateFunc = function() { return null; };

                this.started = true;
            }
        }
    },

    speech: {
        hello: {
            text: 'HI THERE!',
            font: 'BIG',
            nextKey: 'ivan'
        },
        ivan: {
            text: 'IM IVAN!',
            font: 'BIG',
            nextKey: 'welcome',
            brightness: 3,
            execute: function() {
                this.spc.remove = this.esc.remove = true;

                this.roomTitle.setText('Tutorial');
            }
        },
        welcome: {
            text: 'WELCOME TO QUICKSILVER!',
            font: 'SMALL',
            nextKey: 'ropes'
        },
        ropes: {
            text: 'ILL SHOW YOU HOW TO PLAY',
            font: 'SMALL',
            nextKey: function() {
                this.pressDown();
            }
        },
        nice: {
            text: 'NICE!',
            font: 'BIG',
            brightness: 3
        },
        watchFuel: {
            text: 'Pressing up uses fuel',
            font: 'SMALL',
            time: 2,
            execute: function() {
                this.updateFunc = function() { return false; };
                this.showEnergy = true;
            },
            next: 'watchYourFuel',
        },
        watchYourFuel: {
            text: 'So be careful!',
            font: 'SMALL',
            next: 'thisShouldHelp'
        },
        thisShouldHelp: {
            text: 'These refill your tank',
            execute: function() {
                for (var i = 0; i < 4; i ++) {
                    for (var j = 0; j < 4; j ++) {
                        this.tile_manager.addHealthPack(this.player.position.x + i * 8, this.player.position.y + 40 + j * 8);
                    }
                }
            },
            next: 'grabSome'
        },
        grabSome: {
            text: 'Grab some now!',
            next: function() {
                this.updateFunc = false;

                var self = this;
                this.timeout(function() {
                    self.say('hmm')
                }, 2);
            }
        },
        hmm: {
            text: 'Hmmmm',
            font: 'SMALL',
            brightness: 3,
            next: 'letsGetOut',
            execute: function() {
                this.updateFunc = function() { 
                    if (this.player.position.y >= 258) {
                        this.player.getComponent('Player').startIdleAnim();
                        return false; 
                    };
                }
            }
        },
        letsGetOut: {
            text: 'Lets get outta here',
            next: 'weNeedDoor'
        },
        weNeedDoor: {
            text: 'Grab that part!',
            execute: function() {
                this.updateFunc = false;

                this.piece.position.x = this.player.position.x + 140;
                this.piece.position.y = 288 - 60;

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
                this.getTarget = function() {};
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

        var self = this;
        this.updateFunc = function(dt, game) {
            if (game.keyDown('DOWN')) {
                self.updateFunc = false;
                self.speech.nice.next = function() {
                    self.pressRightUp();
                }
                self.say('nice');

                return true;
            }

            return false; // Do NOT update game
        }
    },

    pressRightUp: function(dt, game) {
        this.ivan_message.set({
            text: '\1\0',
            font: 'SPECIAL'
        });

        this.updateFunc = function(dt, game) {
            if (this.player.getComponent('Physics').dy < -60) {
                this.updateFunc = false;
                this.speech.nice.next = 'watchFuel';
                this.say('nice');
            }
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

