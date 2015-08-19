Juicy.Component.create('Boss', {
    constructor: function() {
        this.type = nextArtifactType();
    },
    getArtifact: function() {
        return nextArtifact(this.entity.state, this.type);
    }
}, {
    SUN: 0,
    MOON: 1,
    ZEN: 2
});