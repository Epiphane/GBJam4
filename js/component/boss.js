Juicy.Component.create('Boss', {
    getArtifact: function() {
        return nextArtifact(this.entity);
    }
}, {
    SUN: 0,
    MOON: 1,
    ZEN: 2
});