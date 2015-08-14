function randFromArray(array) {
    return array[Math.floor(Math.random() * array.length)];
}

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
            text: "THE SCOURGE OF DARKNESS"
        };
        this.textObjects.push(newText);
    },


    generatePlaceName: function() {
        var country1 = randFromArray(COUNTRY_FIRST_SYLLABLE);
        var country2 = randFromArray(COUNTRY_SECOND_SYLLABLE);
        var country3 = randFromArray(COUNTRY_THIRD_SYLLABLE);

        console.log(country1 + country2 + country3);
    },
});
