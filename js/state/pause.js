var PauseState = Juicy.State.extend({
    constructor: function(prevState) {
        this.prevState = prevState;

        this.ui_entity = new Juicy.Entity(this, ['UI']);
        this.ui = this.ui_entity.getComponent('UI');
        this.ui.addText({
            text: 'PAUSED',
            font: UI.FONTS.BIG,
            center: true,
            position: Juicy.Point.create(80, 10),
            brightness: 3
        });

        this.ui.addText({
            text: 'Press ESC to continue',
            center: true,
            position: Juicy.Point.create(80, 30),
            brightness: 3
        });
    },
    key_ESC: function() {
        this.game.setState(this.prevState);
    },
    init: function() {
    },
    update: function(dt) { 
        this.ui_entity.update(dt);
    },
    render: function(context) {
        this.prevState.render(context);

        this.ui_entity.render(context);
    }
});