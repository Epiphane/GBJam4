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
        var width        = new Juicy.Point(this.entity.width - 0.2,  0);
        var height       = new Juicy.Point(0, this.entity.height - 0.2);
        var width_height = width.add(height);

        this.dy += this.weight * dt;
        this.dt = dt;

        var movement = (new Juicy.Point(this.dx, this.dy)).mult(dt);

        var tl = tile_manager.raycast(position, movement);
        var tr = tile_manager.raycast(position.add(width), movement);
        var bl = tile_manager.raycast(position.add(height), movement);
        var br = tile_manager.raycast(position.add(width_height), movement);

        var mindx = tl.x;
        var mindy = tl.y;
        if (this.dx > 0) {
            if (Math.abs(tr.x) < Math.abs(mindx)) mindx = tr.x;
            if (Math.abs(tr.y) < Math.abs(mindy)) mindy = tr.y;
        }
        if (Math.abs(br.x) < Math.abs(mindx)) mindx = br.x;
        if (Math.abs(br.y) < Math.abs(mindy)) mindy = br.y;
        if (Math.abs(bl.x) < Math.abs(mindx)) mindx = bl.x;
        if (Math.abs(bl.y) < Math.abs(mindy)) mindy = bl.y;

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
        var width        = new Juicy.Point(this.entity.width - 0.2,  0);
        var height       = new Juicy.Point(0, this.entity.height - 0.2);
        var width_height = width.add(height);

        var movement = (new Juicy.Point(this.dx, this.dy)).mult(this.dt);

        function drawcast(position) {
            var tl = tile_manager.raycast(position, movement, true);

            context.beginPath();
            context.moveTo(position.x, position.y);
            context.lineTo(position.x + tl.x, position.y + tl.y);
            context.lineWidth = 1;

            // set line color
            context.strokeStyle = '#ff0000';
            context.stroke();
        }

        drawcast(new Juicy.Point(0.1));
        drawcast(width);
        drawcast(height);
        drawcast(width_height);
    }
});