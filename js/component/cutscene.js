Juicy.Component.create('CutScene', {
    constructor: function(options) {
        if (options.position) { // Do nothing for entity objects
            this.dx = 0;
            this.dy = 0;
        }
        else { // Do nothing for entity objects
            this.setSpeed(options.dx, options.dy);
        }
    },
    setSpeed: function(dx, dy) {
        this.dx = dx;
        this.dy = dy;
    },
    update: function(dt, game) {
        this.entity.position.x += this.dx * dt;
        this.entity.position.y += this.dy * dt;
    }
});