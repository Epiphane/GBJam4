Juicy.Component.create('Physics', {
    constructor: function() {
        this.dx = this.dy = 0;
        this.jumpPower = -120;
        this.weight = 450;
        this.weight_modifier = 1;
    },

    update: function(dt, input) {
        var tile_manager = this.entity.state.tile_manager;
        var center       = this.entity.center();
        var width        = new Juicy.Point(this.entity.width - 1,  0);
        var height       = new Juicy.Point(0, this.entity.height - 1);

        var weight = this.weight;
        if (this.dx === 0) weight *= 2;
        weight *= this.weight_modifier;

        this.dy += weight * dt;
        if (this.dy > 200) this.dy = 200;
        else if (this.dy < -300) this.dy = -300;

        var movement = (new Juicy.Point(this.dx, this.dy)).mult(dt);

        var feet = [];

        var e_width = this.entity.width;
        for (var theta = 0; theta < Math.PI * 2; theta += Math.PI / 8) {
            feet.push(tile_manager.raycast(center.add(Juicy.Point.create(Math.sin(theta), Math.cos(theta))._mult(e_width / 2)), movement));
        }

        var mindx = feet[0].x;
        var mindy = feet[0].y;
        for (var i = 1; i < feet.length; i ++) {
            if (Math.abs(feet[i].x) < Math.abs(mindx)) mindx = feet[i].x;
            if (Math.abs(feet[i].y) < Math.abs(mindy)) mindy = feet[i].y;
        }

        this.entity.position = this.entity.position.sub(new Juicy.Point(mindx, mindy));

        this.weight_modifier = 1;

        if (this.dy * dt > 0.1 && Math.abs(mindy) < 0.01) {
            console.log(this.dy, mindy);
            this.dy = 0;
            this.onGround = true;
        }
        else {
            this.onGround = false;
        }

        if (Math.abs(mindy) < Math.abs(movement.y) - 0.1) {
            this.dy = 0;
        }
        if (Math.abs(mindx) < Math.abs(movement.x) - 0.1) {
            this.dx = 0;
        }
    },
    // render: function(context) {
    //     context.fillStyle = 'rgba(255, 0, 0, 0.5)';

    //     var center       = this.entity.center();
    //     var movement = (new Juicy.Point(this.dx, this.dy)).mult(0.018);

    //     var e_width = this.entity.width;
    //     for (var theta = 0; theta < Math.PI * 2; theta += Math.PI / 8) {
    //         var pt = center.add(Juicy.Point.create(Math.sin(theta), Math.cos(theta))._mult(e_width / 2))
    //         context.fillRect(pt.x - this.entity.position.x, pt.y - this.entity.position.y, 2, 2);
    //     }
    // }
});