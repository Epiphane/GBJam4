
Juicy.Component.create('UI', {
    constructor: function() {
        this.textObjects = [];
        this.generatePlaceName();
    },

    setFontSprite: function(spriteEntity, letterWidth, letterHeight) {
        this.fontSprite = spriteEntity;
        this.fontSprite.getComponent('ColoredSprite').setSize(letterWidth, letterHeight);
        this.fontSprite.width = letterWidth;
        this.fontSprite.height = letterHeight;
    },

    render: function(context) {
        for (var ndx = 0; ndx < this.textObjects.length; ndx++) {
            var drawPosition = this.textObjects[ndx].position.clone();

            // Go through each character of the string
            var currString = this.textObjects[ndx].text;
            for (var c = 0; c < currString.length; c++) {
                var intChar = currString.charCodeAt(c) - 65;

                this.fontSprite.getComponent('ColoredSprite').sprite = intChar;
                this.fontSprite.getComponent('ColoredSprite').render(context, drawPosition.x, drawPosition.y);

                drawPosition.x += this.fontSprite.width;
            }
        }
    },

    testText: function() {
        var newText = {
            position: new Juicy.Point(30, 10),
            text: COOL_NAME() + " " + COOL_PLACE_SUBTITLE()
        };
        this.textObjects.push(newText);
    },


    generatePlaceName: function() {
        console.log(COOL_NAME() + " " + COOL_PLACE_SUBTITLE());
        console.log(COOL_NAME() + " " + COOL_PLACE_SUBTITLE());
        console.log(COOL_NAME() + " " + COOL_PLACE_SUBTITLE());
        console.log(COOL_NAME() + " " + COOL_PLACE_SUBTITLE());
        console.log(COOL_NAME() + " " + COOL_PLACE_SUBTITLE());
        console.log(COOL_NAME() + " " + COOL_PLACE_SUBTITLE());
        console.log(COOL_NAME() + " " + COOL_PLACE_SUBTITLE());
        console.log(COOL_NAME() + " " + COOL_PLACE_SUBTITLE());
    },
});
