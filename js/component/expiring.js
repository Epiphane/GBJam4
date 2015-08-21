Juicy.Component.create('Expiring', {
    constructor: function() {
        this.life = Math.random() * 0.2;
    },
    update: function(dt, game) {
        this.life -= dt;

        this.width += 0.5

        if (this.life < 0) {
            this.entity.remove = true;
        }
    }
});