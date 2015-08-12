Juicy.Component.create('AdvPhysics', {
    constructor: function() {
        this.dx = this.dy = 0;
        this.speed = 50;
        this.weight = 100;
        this.weight_modifier = 1; // idk but im keeping it
    },

    update: function(dt, input) {
        var position     = this.entity.position;
        var width        = new Juicy.Point(this.entity.width - 1,  0);
        var height       = new Juicy.Point(0, this.entity.height - 1);

        // Different stuff happens depending on Enemy's 
        // movement pattern

        var enemy = this.entity.getComponent('Enemy');

        switch(enemy.movePattern) {
            case 'AGGRESSIVE_SURFACE': // Towards player on surface
                //lol
                break;
            case 'AGGRESSIVE_FLY': // Towards player; can move freely
                //kek
                break;
            case 'AGGRESSIVE_DIG': // Towards player while digging
                //hue
                break;
            case 'IDLE_SURFACE': // Moves back and forth on surface
                //pshhhh
                break;
            case 'IDLE_FLY': // Moves randomly; can move freely
                //n00b
                break;
            case 'IDLE_DIG': //Digs around randomly
                //scrub
                break;
            default: //'NONE' - completely stationary'
                // DO NOTHING LOL
                break;
        }

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