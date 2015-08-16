(function() {
    var altar = Palette.loadImage('img/altar.png');
    var altar_context = altar.getContext('2d');
    var altarComponent = new (Juicy.Component.extend({
        constructor: function() {
            var self = this;
            Palette.onchange.push(function() {
                self.onupdateimage();
            });

            this.pieces = [];
            for (var i = 0; i < 11; i ++) {
                var row = [];    
                for (var j = 0; j < 10; j ++) {
                    row.push(true);
                }
                this.pieces.push(row);
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
        },
        removePiece: function(i, j) {
            this.pieces[i][j] = false;

            altar_context.clearRect(129 + i * 2, j * 4, 2, 4);
        },
        addPiece: function(i, j) {
            this.pieces[i][j] = true;

            Palette.set(Palette.current);
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
            options.width = 2;
            options.height = 2;
            options.countdown = false;
            options.song = 'quake';

            Level.call(this, options);

            this.player.position.x = 140;

            var pyramid = this.altar = new Juicy.Entity(this, [altarComponent]);
            // pyramid.getComponent('ColoredSprite').setSheet('img/altar.png', 40, 80);
            // pyramid.getComponent('ColoredSprite').runAnimation(0, 3, 0.32, true);
            pyramid.position.x = 40;
            pyramid.position.y = -80;
            pyramid.scale = Juicy.Point.create(2, 2);
            this.objects.push(pyramid);

            this.gate = new Juicy.Entity(this, ['Gate', 'ColoredSprite']);
            this.gate.position = new Juicy.Point(180, -48);
            this.objects.push(this.gate);

            this.ivan = new Juicy.Entity(this, ['ColoredSprite', 'Follower', 'TextRender']);
            this.ivan.getComponent('ColoredSprite').setSheet('img/helper.png', 10, 14);
            this.ivan.getComponent('ColoredSprite').runAnimation(0, 11, 0.16, true);
            this.ivan.position = this.player.position.sub(Juicy.Point.temp(10, 8));
            this.ivan.getComponent('Follower').follow(this.player, Juicy.Point.create(-10, -8), true);
            this.ivan_message = this.ivan.getComponent('TextRender').set({
                text: 'OH NO!',
                font: 'BIG',
                animate: 'NONE',
                position: Juicy.Point.create(10, 10),
                showBackground: true,
                brightness: 3,
                offset: Juicy.Point.create(14, -4)
            });

            this.objects.push(this.ivan);

            var gateSprite = this.gate.getComponent('ColoredSprite');
            gateSprite.setSheet('img/gate.png', 52, 48);
            gateSprite.runAnimation(8, 10, 0.2, true);

            var badDudes = 0;
            var destroyShrine = Juicy.Component.extend({
                constructor: function(i, j) {
                    this.toDelete_i = i;
                    this.toDelete_j = j;
                    this.destroyedAltar = false;
                },
                update: function(dt, game) {
                    this.entity.position.y -= 250 * dt;

                    if (!this.destroyedAltar && this.entity.position.y < pyramid.position.y + this.toDelete_j * 4) {
                        altarComponent.removePiece(this.toDelete_i, this.toDelete_j);

                        this.destroyedAltar = true;
                    }

                    if (this.entity.position.y < -200) {
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
                badDude.position = new Juicy.Point(48 + xval, options.height * this.tile_manager.chunk_height + 10 * (i / 8) * (i % 3));        
                badDude.getComponent('ColoredSprite').setSheet('img/sawman-all.png', 20, 20);
                badDude.getComponent('ColoredSprite').runAnimation(4, 7, 0.016, true);
                this.objects.push(badDude);

                badDudes ++;
            }
        },

        say: function(dialog) {
            if (!dialog) {
                this.updateFunc = null;
                return;
            }

            dialog = this.speech[dialog];

            this.ivan_message.set(dialog);

            if (dialog.execute) {
                dialog.execute.call(this);
            }

            var next = dialog.next;
            if (next && typeof(next) === 'string') {
                var nextDialog = next;
                next = function() {
                    this.say(nextDialog);
                };
            }

            if (next) {
                this.wait(2, next);
            }
        },

        wait: function(time, callback) {
            var timeleft = time;

            this.updateFunc = function(dt) {
                timeleft -= dt;

                if (timeleft < 0) {
                    this.updateFunc = null;

                    callback.call(this);
                }
            }
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

                    var self = this;
                    this.gate.getComponent('Gate').onplayertouch = function() {
                        self.shake = 2;
                        self.updateFunc = self.endLevel;
                    };
                }
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

        init: function() {
            Level.prototype.init.apply(this, arguments);

            if (this.loaded) {
                this.tile_manager.persistTiles(0, 0, this.game_width * this.tile_manager.TILE_SIZE, 32);
                this.tile_manager.blockTiles  (40, 0, 16, 16);
                this.tile_manager.blockTiles  (104, 0, 192, 16);
            }
        }
    });
})();