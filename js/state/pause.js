var PauseState = Juicy.State.extend({
    constructor: function(prevState) {
        this.prevState = prevState;

        this.text = new Juicy.Entity(this, ['Text']);
        this.text.getComponent('Text').set({
            text: 'PAUSED', 
            font: '10pt Arial', 
            fillStyle: 'red'
        });

        this.sub = new Juicy.Entity(this, ['Text']);
        this.sub.getComponent('Text').set({
            text: 'Press ESC to continue', 
            font: '8pt Arial', 
            fillStyle: 'red'
        });
    },
    key_ESC: function() {
        this.game.setState(this.prevState);
    },
    init: function() {
        // this.prevState.music.setVolume(15);
    },
    render: function(context) {
        this.prevState.render(context);

        this.text.render(context, (this.game.width - this.text.width) / 2, 0);
        this.sub.render(context, (this.game.width - this.sub.width) / 2, 30);
    }
});