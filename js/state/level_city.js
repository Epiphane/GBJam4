(function() {
    var playedCutScene = localStorage.getItem('cutscene');

    var altar = Palette.loadImage('img/altar.png');
    var altar_context = altar.getContext('2d');
    var altarComponent = new (Juicy.Component.extend({
        constructor: function() {
            var self = this;
            Palette.onchange.push(function() {
                self.onupdateimage();
            });

            this.pieces = JSON.parse(localStorage.getItem('altar'));
            if (this.pieces) {
                var self = this;
                altar.onload = function() {
                    self.onupdateimage();
                }
            }
            else {
                this.pieces = [];
                for (var i = 0; i < 11; i ++) {
                    var row = [];    
                    for (var j = 0; j < 10; j ++) {
                        row.push(true);
                    }
                    this.pieces.push(row);
                }
            }
        },
        onupdateimage: function() {
            for (var i = 0; i < this.pieces.length; i ++) {
                for (var j = 0; j < this.pieces[0].length; j ++) {
                    if (!this.pieces[i][j]) {
                        altar_context.clearRect(129 + i * 2, j * 4, 2, 4);
                    }
                }
            }

            this.save();
        },
        removePiece: function(i, j) {
            this.pieces[i][j] = false;

            altar_context.clearRect(129 + i * 2, j * 4, 2, 4);

            this.save();
        },
        addPiece: function(i, j) {
            if (i > 11 || j > 10) {
                // ALTAR IS REBUIL (?)
            }
            else {
                this.pieces[i][j] = true;
            }

            Palette.set(Palette.current);
        },
        save: function() {
            localStorage.setItem('altar', JSON.stringify(this.pieces));
        },
        render: function(context) {
            context.drawImage(altar, 120, 0, 40, 40, 0, 0, 40, 40);
        }
    }))();

    window.CityLevel = Level.extend({
        constructor: function(options) {
            var self = this;

            // Set tutorial specific options
            options = options || {};
            options.width = 6;
            options.height = 2;
            options.countdown = false;
            options.song = options.song || 'city';

            Level.call(this, options);

            // Create tha birds
            this.birds = new Juicy.Entity(this, ['BirdManager']);
            this.objects.push(this.birds);

            this.altar = new Juicy.Entity(this, [altarComponent]);
            this.altar.position.x = 400;
            this.altar.position.y = 288-80;
            this.altar.scale = Juicy.Point.create(2, 2);
            this.objects.push(this.altar);

            this.gate = new Juicy.Entity(this, ['Gate', 'ColoredSprite']);
            this.gate.position = new Juicy.Point(640, 288-48);
            this.objects.push(this.gate);

            if (playedCutScene) {
                this.gate.getComponent('Gate').onplayertouch = function() {
                    self.shake = 2;
                    self.updateFunc = self.endLevel;
                };
            }

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

            setTimeout(function() {
                ivan_message.setText('');
            }, 3000);

            this.objects.push(this.ivan);

            var gateSprite = this.gate.getComponent('ColoredSprite');
            gateSprite.setSheet('img/gate.png', 52, 48);
            gateSprite.runAnimation(8, 10, 0.2, true);
        
            this.levelLoaded = 0;
        },

        load: function(part) {
            if (this.levelLoaded < 1) {
                this.levelLoaded = Level.prototype.load.apply(this, arguments);
            
                return this.levelLoaded;
            }
            else {

            }
        },

        init: function() {
            Level.prototype.init.apply(this, arguments);

            if (this.loaded) {
                this.tile_manager.persistTiles(0, 288, this.game_width * this.tile_manager.TILE_SIZE, 32);
                this.tile_manager.blockTiles  (0, 288, 56, 16);
                this.tile_manager.blockTiles  (104, 288, 312, 16);
                this.tile_manager.blockTiles  (464, 288, 496, 16);
            }
        },

        getTarget: function() {}, // Ignore

        endLevel: function(dt, game) {
            var dist = this.gate.center().sub(this.player.center());
            this.player.position = this.player.position.add(dist.mult(1/8).free());

            if (this.shake < 0.5) {
                this.complete = true;

                this.game.setState(new InfiniteLevel());
            }

            return false; // Do NOT update physics
        },

        update: function() {
            if (!playedCutScene) {
                if (this.player.position.x > this.altar.position.x - 20) {
                    this.initCutScene();
                    playedCutScene = true;
                    localStorage.setItem('cutscene', true);
                }
            }

            Level.prototype.update.apply(this, arguments);
        },

        initCutScene: function() {
            music.stop(this.song);
            this.song = 'quake';
            music.play(this.song);

            var self = this;

            var badDudes = 0;
            var destroyShrine = Juicy.Component.extend({
                constructor: function(i, j) {
                    this.toDelete_i = i;
                    this.toDelete_j = j;
                    this.destroyedAltar = false;
                },
                update: function(dt, game) {
                    this.entity.position.y -= 250 * dt;

                    if (!this.destroyedAltar && this.entity.position.y < self.altar.position.y + this.toDelete_j * 4) {
                        altarComponent.removePiece(this.toDelete_i, this.toDelete_j);

                        this.destroyedAltar = true;
                    }

                    if (this.entity.position.y < 0) {
                        this.entity.remove = true;
                        badDudes --;

                        if (badDudes === 0) {
                            self.say('weNeedHelp');
                        }
                    }
                }
            });

            // Create Saw enemies
            for (var i = 0; i < 86; i ++) {
                var xval = 44 * ((i / 11) % 1);
                var yToDelete = Math.floor(i / 11);
                badDude = new Juicy.Entity(this, ['ColoredSprite', new destroyShrine(i % 11, yToDelete)]);
                badDude.position = new Juicy.Point(this.altar.position.x + 8 + xval, 988 + 10 * (i / 8) * (i % 3));        
                badDude.getComponent('ColoredSprite').setSheet('img/sawman-all.png', 20, 20);
                badDude.getComponent('ColoredSprite').runAnimation(4, 7, 0.016, true);
                this.objects.push(badDude);

                badDudes ++;
            }

            this.shake = 3;

            this.ivan_message.setText('OH NO!!');
        },

        speech: {
            weNeedHelp: {
                font: 'SMALL',
                text: 'The altar!!!',
                next: 'helpRestore',
                execute: function() {
                    this.ivan.getComponent('Follower').follow(this.altar, Juicy.Point.create(20, 44), true);
                }
            },
            helpRestore: {
                font: 'SMALL',
                text: 'We must restore it!',
                execute: function() {
                    this.ivan.getComponent('Follower').follow(this.altar, Juicy.Point.create(30, 40), true);
                },
                next: 'pleaseHelp'
            },
            pleaseHelp: {
                font: 'BIG',
                text: 'Please help us!',
                execute: function() {
                    this.ivan.getComponent('Follower').follow(this.altar, Juicy.Point.create(36, 48), true);
                },
                next: 'gottaFind'
            },
            gottaFind: {
                font: 'SMALL',
                text: 'find the lost pieces!',
                execute: function() {
                    this.ivan.getComponent('Follower').follow(this.player, Juicy.Point.create(-10, -8), true);
                    this.player.target = this.gate;

                    localStorage.setItem('cutscene', 'true');

                    var self = this;
                    this.gate.getComponent('Gate').onplayertouch = function() {
                        self.shake = 2;
                        self.updateFunc = self.endLevel;
                    };
                }
            }
        },
    });
    window.addAltarPiece = function() {
        var broken = false;
        for (var i = 0; i < 11; i ++) {    
            for (var j = 0; j < 10; j ++) {
                if (!altarComponent.pieces[i][j]) {
                    broken = true;
                    break;
                }
            }
            if (broken) {
                break;
            }
        }

        altarComponent.addPiece(i,j);
    };
})();