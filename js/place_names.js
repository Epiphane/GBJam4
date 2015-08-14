var VOWELS = ['A', 'E', 'I', 'O', 'U'];
var LONE_CONSONANTS = ["D","J","M","QU","T"];
var DOUBLE_LETTERS = ["MM","NN","TT","LL","DD","FF","SS"];
var FOLLOWER_CONSONANTS = ["H","L","R"];
var LEADER_CONSONANTS = ["B","C","F","G","K","P","S","T"];

function randomRange(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randFromArray(array) {
    return array[Math.floor(Math.random() * array.length)];
}


function COOL_NAME() {
    var result = "";
    
    while (result.length < Math.random() * 4 + 5) {
        switch(randomRange(0, 4)) {
        case 0:
            result += randFromArray(LONE_CONSONANTS);
            result += randFromArray(VOWELS);
            break;
        case 1:
            if (result.length > 1) {
                result += randFromArray(DOUBLE_LETTERS);
                result += randFromArray(VOWELS);
            }
            break;
        case 2:
            result += randFromArray(LEADER_CONSONANTS);
            result += randFromArray(VOWELS);
            break;
        case 3:
        case 4:
            result += randFromArray(LEADER_CONSONANTS);
            result += randFromArray(FOLLOWER_CONSONANTS);
            result += randFromArray(VOWELS);
            break;
        }
    }

    return result;
}

var COUNTRY_THIRD_SYLLABLE = [
    "ISTAN",
    "ILAND",
    "ANY",
    "IUM",
    "IA",
    "FORD",
];

var PLACE_FIRST_WORD = [
    "HOWLING",
    "RICH",
    "DANK",
    "TREACHEROUS",
    "RADICAL",
    "AMETHYST",
    "RUBY",
    "TRICKY",
    "FOSSIL",
    "DINOSAUR",
    "SKELETON",
    "GOLD",
    "EXOTIC",
    "SECRET",
    "WET",
    "MOIST",
    "TRICKLING",
    "SPRAWLING",
    "INAPPROPRIATE",
    "HIDDEN",
    "FROZEN",
    "ICY",
    "VOLCANIC",
    "EXPLOSIVE",
    "ABANDONED",
    "EMERALD",
    "SAPPHIRE",
    "CRYSTAL",
    "DESERTED",
    "SANDY",
    "CANDY",
    "SUBMERGED",
    "HORRIFIC",
    "ANCIENT",
    "WORST",
    "ROTTEN",
    "GUTTED",
    "SWARMING",
    "MASONIC",
    "ANGRY",
    "CRUEL",
    "BEST",
    "DEATHLY",
    "DIAMOND",
    "QUARTZ",
    "ASBESTOS",
    "CACKLING",
    "SPOOPY",
    "CANNIBAL",


];

var PLACE_SECOND_WORD = [
    "MINES",
    "ABYSS",
    "CATACOMBS",
    "TUNNELS",
    "PLACE",
    "ZONE",
    "LAND",
    "HIVE",
    "VILLAGE",
    "KINGDOM",
    "3-BEDROOM APARTMENT ABOVE JC PENNY'S",
    "LEVEL",
    "FACTORY",
    "CREVICE",
    "MAN",
    "LAKE",
    "RIVER",
    "TOMB",
    "SKELETONS",
    "NURSERY",
    "PRISON",
    "ORCHARD",
    "GARAGE",
    "FOREST",
    "JUNGLE",
    "BOG",
    "HALLOWS",
    "KEEP",
    "DUNGEON",
    "PARKING LOT OUTSIDE OF DENNY'S",
    "TEMPLE",
    "UNDERBELLY",
    "WOMB",
    "MEADOWS",
    "SANDS",
    "ISLE",
    "HAGGENS",

];

function COOL_PLACE_SUBTITLE() {
    return "THE " + randFromArray(PLACE_FIRST_WORD) + " " + randFromArray(PLACE_SECOND_WORD);
}

