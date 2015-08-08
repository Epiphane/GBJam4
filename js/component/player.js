Juicy.Component.create('Player', {
    constructor: function() {
        this.speed = 50;
    
        this.controls = ['LEFT', 'RIGHT', 'DOWN'];
    },
    update: function(dt, game) {
        var digger = this.entity.getComponent('Digger');

        if (game.keyDown(this.controls[0])) {
            digger.left();
        }
        if (game.keyDown(this.controls[1])) {
            digger.right();
        }
        if (game.keyDown(this.controls[2])) {
            digger.down();
        }
    }
});
