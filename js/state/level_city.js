(function() {
    window.resetAltar = function() {
        localStorage.setItem('altarState', altarState = -1);
        animateAltar();
    }

    var altar = new Juicy.Entity({}, ['ColoredSprite']);
        altar.position.x = 400;
        altar.position.y = 288-80;
        altar.scale = Juicy.Point.create(2, 2);
    var altarSprite = altar.getComponent('ColoredSprite').setSheet('img/altar.png', 40, 40);

    var altarState = parseInt(localStorage.getItem('altarState'));
    function animateAltar() {
        if (!altarState && altarState !== 0) {
            altarState = -1;
            localStorage.setItem('altarState', -1);
        }
        
        if (altarState === 3 || altarState === -1) {
            altarSprite.runAnimation(0, 3, 0.5, true);
        }
        else {
            console.log(altarState);
            altarSprite.runAnimation(4 + altarState, 4 + altarState, -1, true);
        }

        saveAltar();
    }

    function saveAltar() {
        localStorage.setItem('altarState', altarState);
    }

    animateAltar();

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
                    this.altar = altar;
                    this.altar.state = this;
                    this.objects.push(this.altar);
                }
                else if (this.loaded === 2) {
                    // Create tha gate
                    this.gate = new Juicy.Entity(this, ['Gate', 'ColoredSprite']);
                    this.gate.position = new Juicy.Point(640, 288-48);
                    this.objects.push(this.gate);

                    if (altarState !== -1) {
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
                        brightness: 0,
                        offset: Juicy.Point.create(14, -4)
                    });
                }
                else if (this.loaded === 5) {
                    this.tile_manager.persistTiles  (0, 288, this.game_width * this.tile_manager.TILE_SIZE, 32);
                    this.tile_manager.blockTiles    (0, 288, 56, 16);
                    this.tile_manager.blockTiles    (104, 288, 296, 16);
                    this.tile_manager.blockTiles    (480, 288, 464, 16);
                    this.tile_manager.blockTiles    (496, 248, 48, 16);
                    for (var x = 360; x <= 386; x += 8) {
                        for (var y = 288-32; y < 288; y += 8) {
                            this.tile_manager.addHealthPack (x, y);
                        }
                    }
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

            if (this.loaded && !this.playingCutScene) {
                var self = this;         
                setTimeout(function() {
                    self.ivan_message.setText('');
                }, 3000);

                if (altarState === -1) {
                    this.initCutScene();
                    this.playingCutScene = true;
                    // altarState = 3;
                    animateAltar();
                }

                this.camera.x = this.player.position.x = 490;
                this.camera.y = this.player.position.y = 288 - 80;
            }
        },

        update: function(dt, game) {
            this.player.getComponent('Digger').energy = this.player.getComponent('Digger').max_energy;
            if (this.playingCutScene) {
                this.player.getComponent('Digger').controlPause = 0.5;
                this.player.getComponent('Physics').dx = 0;
            }

            Level.prototype.update.apply(this, arguments);
        },

        getTarget: function() {}, // Ignore

        endLevel: function(dt, game) {
            var dist = this.gate.center().sub(this.player.center());
            this.player.position = this.player.position.add(dist.mult(1/8).free());

            if (this.shake < 0.5) {
                this.complete = true;

                this.game.setState(new PreBossLevel());
            }

            return false; // Do NOT update physics
        },

        initCutScene: function() {
            var self = this;

            this.backdrop = false;

            this.camera.x = this.player.position.x = 490;
            this.camera.y = this.player.position.y = 288 - 80;
            this.camera.offset_x = 30;

            this.ivan_message.offset.x -= 40;
            this.ivan_message.offset.y -= 2;

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
                        if (nBadDudes % 33 === 0) {
                            if (altarState === -1) altarState = 2;
                            else altarState --;
                            animateAltar();
                        }

                        nBadDudes --;

                        if (nBadDudes === 0) {
                            self.say('weNeedHelp');
                        }

                        if (!playedSound) {
                            playedSound = true;

                            sfx.play('explode');
                        }

                        this.destroyedAltar = true;
                    }

                    if (this.entity.position.y < 0) {
                        this.entity.remove = true;
                    }
                }
            });

            // Create Saw enemies
            this.badDudes = [];
            for (var i = 0; i < 99; i ++) {
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
                next: 'ages',
                execute: function() {
                    this.ivan_message.center = true;
                }
            },
            ages: {
                text: 'Ages ago',
                next: 'turmoil'
            },
            turmoil: {
                text: 'this world was ravaged',
                next: 'evil'
            },
            evil: {
                text: 'by evil demons',
                next: 'earthcrushers'
            },
            earthcrushers: {
                text: 'called earthcrushers',
                next: 'sawron'
            },
            sawron: {
                text: 'The great Sawman',
                next: 'fought',
            },
            fought: {
                text: 'Built this altar',
                next: 'protect',
            },
            protect: {
                text: 'to repel them and save us',
                next: 'itsImportant'
            },
            itsImportant: {
                text: 'It protects our world',
                next: 'ofOurWorld'
            },
            ofOurWorld: {
                text: 'without it we would be',
                next: 'itsUseful'
            },
            itsUseful: {
                text: 'in serious trouble!!',
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
                next: 'dot'
            },
            dot: {
                text: '.',
                font: 'BIG',
                time: 1,
                next: 'dotdot'
            },
            dotdot: {
                text: '..',
                font: 'BIG',
                time: 1,
                next: 'dotdotdot'
            },
            dotdotdot: {
                text: '...',
                font: 'BIG',
                time: 1,
                next: 'somethingsUp'
            },
            somethingsUp: {
                text: 'Something feels wrong',
                font: 'SMALL',
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
                next: 'theyBack',
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
            theyBack: {
                font: 'SMALL',
                text: 'The earthcrushers are back!!',
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
                text: 'We need to rebuild it!',
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

    var addAltarPiece = function() {
        if (altarState < 3 && altarState >= 0) {
            altarState ++;
        }

        animateAltar();
    };

    window.getAltarState = function() { return altarState; };

    window.nextArtifact = function(entity) {
        var artifact = new Juicy.Entity(entity.state, ['ColoredSprite']);
        var sprite   = artifact.getComponent('ColoredSprite');
        if (altarState === 0) {
            sprite.setSheet('img/zen_artifact.png', 27, 12);
        }
        else if (altarState === 1) {
            sprite.setSheet('img/moon_artifact.png', 13, 19);
        }
        else if (altarState === 2) {
            sprite.setSheet('img/sun_artifact.png', 24, 24);
        }

        artifact.scale = Juicy.Point.create(2, 2);
        artifact.position = entity.position.clone();

        artifact.collect = addAltarPiece;

        return artifact;
    };
})();