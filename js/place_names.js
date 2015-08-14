public static String[] vowels = new String[] {"a","e","i","o","u"};
	public static String[] loneConsonants = new String[] {"d","j","m","n","qu","t"};
	public static String[] doubleLetters = new String[] {"mm","nn","tt","ll","dd","ff","kk","ss"};
	public static String[] followerConsonants = new String[] {"h","l","r"};
	public static String[] leaderConsonants = new String[] {"b","c","f","g","k","p","s"};
	
	private String name;
	
	public Pidgeon() {
		name = "";
		while(name.length() < Math.random() * 16) {
			switch((int) (Math.random() * 4)) {
			case 0:
				name += randomLetter(loneConsonants);
				name += randomLetter(vowels);
				break;
			case 1:
				if(name.length() > 1)
					name += randomLetter(doubleLetters);
				name += randomLetter(vowels);
				break;
			case 2:
				name += randomLetter(leaderConsonants);
				name += randomLetter(vowels);
				break;
			case 3:
				name += randomLetter(leaderConsonants);
				name += randomLetter(followerConsonants);
			case 4:
				name += randomLetter(vowels);
				break;
			}
		}
	}

var VOWELS = ['a', 'e', 'i', 'o', 'u'];
var LONE_CONSONANTS = ["d","j","m","n","qu","t"];
var DOUBLE_LETTERS = ["mm","nn","tt","ll","dd","ff","kk","ss"];
var FOLLOWER_CONSONANTS = ["h","l","r"];
var LEADER_CONSONANTS = ["b","c","f","g","k","p","s"];

var COUNTRY_FIRST_SYLLABLE = [
    "WEED",
    "TUR",
    "DURK",
    "FORK",
    "OIL",
    "STA",
    "DUCK",
    "ARM",
    "AND",
    "BUR",
    "CHEST",
];

var COUNTRY_SECOND_SYLLABLE = [
    "MAN",
    "OIL",
    "DOG",
    "ER",
];

var COUNTRY_THIRD_SYLLABLE = [
    "ISTAN",
    "ILAND",
    "ANY",
    "IUM",
    "IA",
    "OLA",
    "FORD",
];

var PLACE_FIRST_WORD = [
    "HOWLING",
    "RICH",    
    "DARK",
    "DANK",
    "DANGEROUS",
    "TREACHEROUS",
    "RADICAL",
    "TRICKY",
    "AMETHYST",
    "RUBY",
    "FOSSIL",
    "DINOSAUR",
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
    "LEVEL",
];


