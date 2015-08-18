(function() {
    var playedCutScene = false;

    window.resetAltar = function() {
        localStorage.removeItem('altar');

        var altarComponent = new AltarComponent();
    }

    var altar = Palette.loadImage('img/altar.png');
    var altar_context = altar.getContext('2d');
    var AltarComponent = Juicy.Component.extend({
        constructor: function() {
            var self = this;
            Palette.onchange.push(function() {
                self.onupdateimage();
            });

            this.pieces = JSON.parse(localStorage.getItem('altar'));
            if (this.pieces && this.pieces.length === 10) {
                playedCutScene = true;
                var self = this;
                altar.onload = function() {
                    self.onupdateimage();
                }
            }
            else {
                playedCutScene = false;
                this.pieces = [];
                for (var i = 0; i < 10; i ++) {
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
                        altar_context.clearRect(120 + i * 4, 4 + j * 2, 4, 2);
                    }
                }
            }

            this.save();
        },
        removePiece: function(i, j) {
            this.pieces[i][j] = false;

            altar_context.clearRect(120 + i * 4, 4 + j * 2, 4, 2);

            this.save();
        },
        addPiece: function(i, j) {
            if (i > 10 || j > 10) {
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
    });

    var altarComponent = new AltarComponent();

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
        
            this.levelLoaded = 0;
            this.loaded = 0;
            this.playingCutScene = false;

            this.roomTitle.setText('Hometown');
        },

        load: function(part) {
            if (this.levelLoaded < 1) {
                this.levelLoaded = Level.prototype.load.apply(this, arguments);
                
                if (this.levelLoaded === 1) {
                    return 0.9;
                }
                else {
                    return this.levelLoaded;
                }
            }
            else {
                if (this.loaded === 0) {
                    // Create tha birds
                    this.birds = new Juicy.Entity(this, ['BirdManager']);
                    this.objects.push(this.birds);
                }
                else if (this.loaded === 1) {
                    // Create tha altar
                    this.altar = new Juicy.Entity(this, [altarComponent]);
                    this.altar.position.x = 400;
                    this.altar.position.y = 288-80;
                    this.altar.scale = Juicy.Point.create(2, 2);
                    this.objects.push(this.altar);
                }
                else if (this.loaded === 2) {
                    // Create tha gate
                    this.gate = new Juicy.Entity(this, ['Gate', 'ColoredSprite']);
                    this.gate.position = new Juicy.Point(640, 288-48);
                    this.objects.push(this.gate);

                    if (playedCutScene) {
                        var self = this;
                        this.gate.getComponent('Gate').onplayertouch = function() {
                            self.shake = 2;
                            self.updateFunc = self.endLevel;
                        };
                    }
                }
                else if (this.loaded === 3) {
                    this.ivan = new Juicy.Entity(this, ['ColoredSprite', 'Follower', 'TextRender']);
                    this.ivan.getComponent('ColoredSprite').setSheet('img/helper.png', 12, 16);
                    this.ivan.getComponent('ColoredSprite').runAnimation(0, 11, 0.16, true);
                    this.ivan.position = this.player.position.sub(Juicy.Point.temp(10, 8));
                    this.ivan.getComponent('Follower').follow(this.player, Juicy.Point.create(-10, -8), true);
                    
                    this.objects.push(this.ivan);
                }
                else if (this.loaded === 4) {
                    this.ivan_message = this.ivan.getComponent('TextRender').set({
                        text: 'Welcome to town!',
                        font: 'SMALL',
                        animate: 'NONE',
                        position: Juicy.Point.create(10, 10),
                        showBackground: true,
                        brightness: 3,
                        offset: Juicy.Point.create(14, -4)
                    });
                }
                else if (this.loaded === 5) {
                    this.tile_manager.persistTiles(0, 288, this.game_width * this.tile_manager.TILE_SIZE, 32);
                    this.tile_manager.blockTiles  (0, 288, 56, 16);
                    this.tile_manager.blockTiles  (104, 288, 312, 16);
                    this.tile_manager.blockTiles  (464, 288, 496, 16);
                    this.tile_manager.blockTiles  (480, 248, 64, 16);
                }
                else if (this.loaded === 6) {
                    this.tile_manager.illuminate  (450, 288, 500);
                }
                else if (this.loaded === 7) {
                    var gateSprite = this.gate.getComponent('ColoredSprite');
                    gateSprite.setSheet('img/gate.png', 52, 48);
                    gateSprite.runAnimation(8, 10, 0.2, true);
                }

                var objectsToLoad = 8;
                return (++this.loaded) / objectsToLoad;
            }
        },

        init: function() {
            Level.prototype.init.apply(this, arguments);

            if (this.loaded) {       
                var self = this;         
                setTimeout(function() {
                    self.ivan_message.setText('');
                }, 3000);

                if (!playedCutScene) {
                    this.initCutScene();
                    this.playingCutScene = true;
                    playedCutScene = true;
                }
            }
        },

        update: function(dt, game) {
            if (this.playingCutScene) {
                this.player.getComponent('Digger').controlPause = 0.5;
            }

            Level.prototype.update.apply(this, arguments);
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

        initCutScene: function() {
            var self = this;

            this.camera.x = this.player.position.x = 484;
            this.camera.y = this.player.position.y = 288 - 80;

            var nBadDudes = 0;
            var playedSound = false;
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

                        if (!playedSound) {
                            playedSound = true;

                            sfx.play('explode');
                        }

                        this.destroyedAltar = true;
                    }

                    if (this.entity.position.y < 0) {
                        this.entity.remove = true;
                        nBadDudes --;

                        if (nBadDudes === 0) {
                            self.say('weNeedHelp');
                        }
                    }
                }
            });

            // Create Saw enemies
            this.badDudes = [];
            for (var i = 0; i < 86; i ++) {
                var xval = 44 * ((i / 10) % 1);
                var yToDelete = Math.floor(i / 10);
                badDude = new Juicy.Entity(this, ['ColoredSprite', new destroyShrine(i % 10, yToDelete)]);
                badDude.position = new Juicy.Point(this.altar.position.x + 8 + xval, 988 + 10 * (i / 8) * (i % 3));        
                badDude.getComponent('ColoredSprite').setSheet('img/sawman-all.png', 20, 20);
                badDude.getComponent('ColoredSprite').runAnimation(4, 7, 0.016, true);
                this.badDudes.push(badDude);

                nBadDudes ++;
            }

            this.say('theAltar');
        },

        distress: function() {
            sfx.play('quack');
            var startLoc = this.ivan.position.clone();

            this.particles.getComponent('ParticleManager').spawnParticles({
                color: "MID", 
                size: 4, 
                howMany: 60, 
                timeToLive: function(particle, ndx) {
                    return Math.random() * 10;
                },
                initParticle: function(particle) {
                    particle.x = startLoc.x;
                    particle.y = startLoc.y;

                    particle.dx = Math.random() * 6 - 3;
                    particle.dy = Math.random() * 5 - 4;

                    particle.startLife = Math.random() * 46;
                    particle.life = particle.startLife;
                },
                updateParticle: function(particle) {
                    particle.x += particle.dx;
                    particle.y += particle.dy;

                    particle.dx *= 0.99;
                    particle.dy *= 0.99;
                    particle.dy += 0.14;
                }
            });  
        },

        speech: {
            theAltar: {
                font: 'SMALL',
                text: 'This is our Altar',
                next: 'itsImportant',
            },
            itsImportant: {
                text: 'It protects our world',
                next: 'ofOurWorld'
            },
            ofOurWorld: {
                text: 'and maintains balance',
                next: 'whatsThat'
            },
            whatsThat: {
                text: 'Whats that?',
                execute: function() {
                    this.shake = 3;

                    music.stop(this.song);
                    this.song = 'quake';
                    music.play(this.song);

                    this.distress();
                },
                next: 'somethingsUp'
            },
            somethingsUp: {
                text: 'Something feels wrong',
                next: 'ohNo'
            },
            ohNo: {
                font: 'BIG',
                text: 'OH NO!!!',
                time: 4,
                execute: function() {
                    this.shake = 5;
                    while (this.badDudes.length > 0) {
                        this.objects.push(this.badDudes.shift());
                    }

                    this.distress();

                    var self = this;
                    for (var i = 0.2; i < 4.2; i += 0.2) {
                        this.timeout(function() { self.distress(); }, i);
                    }
                }
            },
            weNeedHelp: {
                font: 'SMALL',
                text: 'The altar!!!',
                next: 'helpRestore',
                time: 3,
                execute: function() {
                    this.ivan.getComponent('Follower').follow(this.altar, Juicy.Point.create(20, 44), true);

                    this.distress();

                    var self = this;
                    for (var i = 0.2; i < 1.2; i += 0.2) {
                        this.timeout(function() { self.distress(); }, i);
                    }
                }
            },
            helpRestore: {
                font: 'SMALL',
                text: 'We must restore it!',
                execute: function() {
                    this.ivan.getComponent('Follower').follow(this.altar, Juicy.Point.create(30, 40), true);
                    
                    this.distress();
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

                    this.playingCutScene = false;
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