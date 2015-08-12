Juicy.Component.create('Physics', {
    constructor: function() {
        this.dx = this.dy = 0;
        this.jumpPower = -120;
        this.weight = 450;
        this.weight_modifier = 1;
    },

    update: function(dt, input) {
        var tile_manager = this.entity.state.tile_manager;
        var position     = this.entity.position;
        var width        = new Juicy.Point(this.entity.width - 1,  0);
        var height       = new Juicy.Point(0, this.entity.height - 1);

        var weight = this.weight;
        if (this.dx === 0) weight *= 2;
        weight *= this.weight_modifier;

        this.dy += weight * dt;
        if (this.dy > 200) this.dy = 200;
        else if (this.dy < -300) this.dy = -300;

        var movement = (new Juicy.Point(this.dx, this.dy)).mult(dt);

        this.entity.position = position.add(movement);

        this.weight_modifier = 1;
    }
});