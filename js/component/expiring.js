Juicy.Component.create('Expiring', {
    constructor: function() {
        this.life = Math.random() * 3;
    },
    update: function(dt, game) {
        this.life -= dt;

        if (this.life < 0) {
            this.entity.remove = true;
        }
    }
});