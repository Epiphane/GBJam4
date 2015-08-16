var CityLevel = Level.extend({
    constructor: function(options) {
        var self = this;

        // Set tutorial specific options
        options = options || {};
        options.width = 2;
        options.height = 2;
        options.countdown = false;
        options.song = 'lvl2';

        Level.call(this, options);

        this.player.position.x = 140;

        var pyramid = new Juicy.Entity(this, ['ColoredSprite']);
        pyramid.getComponent('ColoredSprite').setSheet('img/altar.png', 40, 80);
        pyramid.getComponent('ColoredSprite').runAnimation(0, 3, 0.32, true);
        pyramid.position.x = 40;
        pyramid.position.y = -80;
        pyramid.scale = Juicy.Point.create(2, 2);
    
        this.objects.push(pyramid);

        this.helper = new Juicy.Entity(this, ['ColoredSprite', 'Follower', 'TextRender']);
        this.helper.getComponent('ColoredSprite').setSheet('img/helper.png', 10, 14);
        this.helper.getComponent('ColoredSprite').runAnimation(0, 11, 0.16, true);
        this.helper.position = this.player.position.sub(Juicy.Point.temp(10, 8));
        this.helper.getComponent('Follower').follow(this.player, Juicy.Point.create(-10, -8), true);
        this.message = this.helper.getComponent('TextRender').set({
            text: '',
            font: 'BIG',
            animate: 'NONE',
            position: Juicy.Point.create(10, 10),
            showBackground: true,
            brightness: 3,
            offset: Juicy.Point.create(14, -4)
        });

        this.objects.push(this.helper);

        this.gate = new Juicy.Entity(this, ['Gate', 'ColoredSprite']);
        this.gate.position = new Juicy.Point(180, -48);
        this.objects.push(this.gate);

        this.gate.getComponent('Gate').onplayertouch = function() {
            self.shake = 2;
            self.updateFunc = self.endLevel;
        };

        var gateSprite = this.gate.getComponent('ColoredSprite');
        gateSprite.setSheet('img/gate.png', 52, 48);
        gateSprite.runAnimation(8, 10, 0.2, true);

        var destroyShrine = Juicy.Component.extend({
            constructor: function(chunkToRemove) {
                
            },
            update: function() {
                if (this.entity.position.y < -200) {
                    this.entity.remove = true;
                }
            }
        })

        // Create Saw enemies
        for (var i = 0; i < 100; i ++) {
            var xval = 44 * ((i / 10) % 1);
            newDude = new Juicy.Entity(this, ['ColoredSprite', destroyShrine, 'CutScene']);
            newDude.position = new Juicy.Point(48 + xval, options.height * this.tile_manager.chunk_height + 10 * (i / 8) * (i % 3));        
            newDude.getComponent('ColoredSprite').setSheet('img/sawman-all.png', 20, 20);
            newDude.getComponent('ColoredSprite').runAnimation(4, 7, 0.016, true);
            newDude.getComponent('CutScene').setSpeed(0, -300);
            this.objects.push(newDude);
        }
    },

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

