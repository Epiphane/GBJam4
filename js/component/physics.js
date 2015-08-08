Juicy.Component.create('Physics', {
    constructor: function() {
        this.dx = this.dy = 0;
        this.onGround = false;
        this.jumpPower = -60;
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
        var width        = new Juicy.Point(this.entity.width,  0);
        var height       = new Juicy.Point(this.entity.height, 0);

        var movement = (new Juicy.Point(this.dx, this.dy)).mult(dt);
        if (this.dx !== 0) {
            console.log(this.dx, dt, movement);
        }

        var tl = tile_manager.raycast(position, movement);
        var tr = tile_manager.raycast(position.add(width), movement);
        var bl = tile_manager.raycast(position.add(height), movement);
        var br = tile_manager.raycast(position.add(width).add(height), movement);

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

        // Walk across all the tiles
        this.entity.position = position.add(new Juicy.Point(mindx, mindy));

        if (this.dy > 0 && Math.abs(mindy) < 0.01) {
            this.dy = 0;
            this.onGround = true;
        }
        else {
            this.onGround = false;
        }

        this.touchingSpike = false;
        for (var i = 0; i < width; i ++) {
            for (var j = 0; j < height; j ++) {
                var x = Math.floor(position.x + i);
                var y = Math.floor(position.y + j);

                if (tileManager.getTile(x, y) === tileManager.SPIKE) {
                    this.touchingSpike = true;
                }
            }
        }
    }
});