Juicy.Component.create('Boss', {
    constructor: function() {
        this.type = 0;
    },
    setBoss: function(type) {
        if (typeof(type) === 'string') {
            type = Juicy.Components.Boss[type];
        }

        this.type = type;
    },
    getArtifact: function() {
        var artifact = new Juicy.Entity(this.entity.state, ['ColoredSprite']);
        var sprite   = artifact.getComponent('ColoredSprite');
        if (this.type === 0) {
            sprite.setSheet('img/sun_artifact.png', 24, 24);
        }
        else if (this.type === 1) {
            sprite.setSheet('img/moon_artifact.png', 13, 19);
        }
        else if (this.type === 2) {
            sprite.setSheet('img/zen_artifact.png', 27, 12);
        }

        artifact.scale = Juicy.Point.create(2, 2);
        artifact.position = this.entity.position.clone();

        return artifact;
    }
}, {
    SUN: 0,
    MOON: 1,
    ZEN: 2
});