Juicy.Component.create('Gate', {
    constructor: function() {
        this.onplayertouch = null;
    },
    update: function(dt) {
        if (!this.onplayertouch) {
            return;
        }

        if (this.entity.distance(this.entity.state.player) < this.entity.width / 3) {
            this.onplayertouch();
        }
    }
});