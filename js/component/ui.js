var UI = Juicy.Component.create('UI', {
    constructor: function(thisEntity) {
        this.textObjects = [];

        this.ui_particles = new Juicy.Entity(this.state, ['ParticleManager']);
    },

    addText: function(info) {
        var newText = new Juicy.Entity(this.state, ['TextRender']);
        var textComp = newText.getComponent('TextRender');
        textComp.set(info);

        newText.position = info.position || new Juicy.Point();

        this.textObjects.push(newText);

        return textComp;
    },

    clearText: function() { this.textObjects = []; },

    update: function(dt) {
        this.ui_particles.getComponent('ParticleManager').update(dt);

        for (var i = 0; i < this.textObjects.length; i ++) {
            this.textObjects[i].getComponent('TextRender').update(dt);
            if (this.textObjects[i].remove) {
                this.textObjects.splice(i--, 1);
            }
        }
    },

    render: function(context) {
        this.ui_particles.getComponent('ParticleManager').render(context);

        for (var ndx = 0; ndx < this.textObjects.length; ndx++) {
            this.textObjects[ndx].render(context);
        }
    },
});
