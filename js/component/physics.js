Juicy.Component.create('Physics', {
    constructor: function() {
        this.dx = this.dy = 0;
        this.onGround = false;
        this.jumpPower = -120;
        this.weight = 400;
    },

    jump: function() {
        if (this.onGround) {
            this.dy = this.jumpPower;
            this.onGround = false;
        }
    },

    update: function(dt, input) {
        var tile_manager = this.entity.state.tile_manager;
        var position     = this.entity.position;
        var width        = new Juicy.Point(this.entity.width - 1,  0);
        var height       = new Juicy.Point(0, this.entity.height - 1);

        this.dy += this.weight * dt;
        this.dt = dt;

        var movement = (new Juicy.Point(this.dx, this.dy)).mult(dt);

        // TODO Add dynamic feet counting

        var feet = [];
        feet.push(tile_manager.raycast(position, movement));
        feet.push(tile_manager.raycast(position.add(width), movement));
        feet.push(tile_manager.raycast(position.add(height), movement));
        feet.push(tile_manager.raycast(position.add(width.mult(0.5)).add(height), movement));
        feet.push(tile_manager.raycast(position.add(width).add(height), movement));

        var mindx = feet[0].x;
        var mindy = feet[0].y;
        for (var i = 1; i < feet.length; i ++) {
            if (Math.abs(feet[i].x) < Math.abs(mindx)) mindx = feet[i].x;
            if (Math.abs(feet[i].y) < Math.abs(mindy)) mindy = feet[i].y;
        }

        this.entity.position = position.sub(new Juicy.Point(mindx, mindy));

        if (this.dy > 0.1 && Math.abs(mindy) < 0.01) {
            this.dy = 0;
            this.onGround = true;
        }
        else {
            this.onGround = false;
        }
    },
    render: function(context) {
        var tile_manager = this.entity.state.tile_manager;
        var position     = this.entity.position;
        var width        = new Juicy.Point(this.entity.width - 1,  0);
        var height       = new Juicy.Point(0, this.entity.height -1 );

        var movement = (new Juicy.Point(this.dx, this.dy)).mult(this.dt);

        function drawcast(position) {
            var cast = tile_manager.raycast(position, movement, true);

            context.beginPath();
            context.moveTo(position.x, position.y);
            context.lineTo(position.x + cast.x, position.y + cast.y);
            context.lineWidth = 1;

            // set line color
            context.strokeStyle = '#ff0000';
            context.stroke();
        }

        drawcast(new Juicy.Point(0.1));
        drawcast(width);
        drawcast(height);
        drawcast(width.add(height));
    }
});