Juicy.Component.create('Player', {
    constructor: function() {
        this.speed = 50;
    
        this.controls = ['LEFT', 'RIGHT', 'DOWN'];

        /** Lets us keep track of what spritesheet direction we're using */
        this.direction = 'IDLE';
    },

    startIdleAnim: function() {
        this.entity.getComponent('Sprite').setSheet('img/sawman-idle.png', 20, 20);
        this.entity.getComponent('Sprite').last_sprite = 11;
        this.entity.getComponent('Sprite').repeat = true;
        this.entity.getComponent('Sprite').frametime = 0.16;
    },

    updateAnim: function(newDirection) {
        if (this.direction == newDirection) {
            return;
        }

        this.direction = newDirection;

        if (this.direction == 'IDLE') {
            this.startIdleAnim();
        }
        else if (this.direction == 'LEFT') {
            this.entity.getComponent('Sprite').setSheet('img/sawman-fast.png', 20, 20);
            this.entity.getComponent('Sprite').last_sprite = 3;
            this.entity.getComponent('Sprite').repeat = true;
            this.entity.getComponent('Sprite').frametime = 0.016;
        }
        else if (this.direction == 'RIGHT') {

        }
        else if (this.direction == 'DOWN') {
            this.entity.getComponent('Sprite').setSheet('img/sawman-fast.png', 20, 20);
            this.entity.getComponent('Sprite').last_sprite = 3;
            this.entity.getComponent('Sprite').repeat = true;
            this.entity.getComponent('Sprite').frametime = 0.016;
        }
    },

    update: function(dt, game) {
        var digger = this.entity.getComponent('Digger');
        var newDirection = 'IDLE';

        if (game.keyDown(this.controls[0])) {
            digger.left();
            newDirection = 'LEFT';
        }
        if (game.keyDown(this.controls[1])) {
            digger.right();
            newDirection = 'RIGHT';
        }
        if (game.keyDown(this.controls[2])) {
            digger.down();
            newDirection = 'DOWN';
        }

        this.updateAnim(newDirection);
    },
});
