Juicy.Component.create('UI', {
    constructor: function() {
        this.textObjects = [];

        this.font = null;
        this.font_width = 0;
        this.font_height = 0;
    },

    setFontSprite: function(spriteEntity, letterWidth, letterHeight) {
        this.font = spriteEntity.getComponent('ColoredSprite');
        this.font_width = letterWidth;
        this.font_height = letterHeight;

        this.font.setSize(letterWidth, letterHeight);
    },

    render: function(context) {
        for (var ndx = 0; ndx < this.textObjects.length; ndx++) {
            var drawPosition = this.textObjects[ndx].position.clone();

            // Go through each character of the string
            var currString = this.textObjects[ndx].text;
            for (var c = 0; c < currString.length; c++) {
                var intChar = currString.charCodeAt(c) - 65;

                this.font.sprite = intChar;
                this.font.render(context, drawPosition.x, drawPosition.y);

                drawPosition.x += this.font_width;
            }
        }
    },

    testText: function() {
        var newText = {
            position: new Juicy.Point(30, 10),
            text: "THE SCOURGE OF DARKNESS"
        };
        this.textObjects.push(newText);
    },

});
