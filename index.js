const THRESHOLD_CHAR = 500;  // delay for continuous press detection of same key
const THRESHOLD_NUM = 600;   // time delay for hold detection 


// mapping each key value to its corresponding characters 
const  keyMap = {
    '1': ".,!",
    '2': "abc",
    '3': "def",
    '4': "ghi",
    '5': "jkl",
    '6': "mno",
    '7': "pqrs",
    '8': "tuv",
    '9': "wxyz",
    '*': "*",
    '0': "0",
    '#': '#',
};


// a count variable is required to store the no. of times a key is pressed in continuation
const userKeyPresses = {}   // map to store count

let lastCharacter = 0; // these variables are used to keep track of the mouse button presses
let lastDown = 0;

let lastUp = 0;
let currentUp = 0;
let currentDown = 0;

let capsified = false;


// initializing count variable for each character button
var initialize = (function() {
    var initialized = false;
    const characters = [0,1,2,3,4,5,6,7,8,9,'#','*', 12, 13,14];
    return function() {
        if (!initialized) {
            initialized = true;
            for(character of characters) {
                userKeyPresses[character] = {
                    count: 0,
                }
            }
        }
    };
})();

initialize();  //calling the function 


// function to count the no. times one key is pressed and return out corresponding character
const handlePress = (character) => {
    if(character === lastCharacter) {;
        const diff = currentDown - lastUp
        if (diff> THRESHOLD_CHAR) {
            userKeyPresses[character].count = 0;
        } else {
            const newCount = (userKeyPresses[character].count+1)%(keyMap[character].length);
            userKeyPresses[character].count = newCount;
        }
    } else {
        userKeyPresses[character].count = 0;
    }
    return keyMap[character][userKeyPresses[character].count];
}


// function to keep track of last time when mouse left button was down
const handleMouseDown = () => {
    lastDown = currentDown;
    currentDown = Date.now();
}



// function to keep track of last time when mouse left button was released
const handleMouseUp = () => {
    lastUp = currentUp;
    currentUp = Date.now();
}


//  this function is required because ".attr(value)" function would only recieve numerical value and we need special characters as well
// thus it maps the value of each button to its character if needed
const characterFilter = (character) => {
    if(Number(character)<=9) return character;
    else {
        switch(character) {
            case '10': 
                return '*';
            case '11': 
                return '#'
            default:
                return character
        }
    }
}


// this method handles the press of backspace and capslock and change the required varialbles
const handleSpecialKeyPreseses = (character) => {
    switch (character) {
        case 12: 
            capsified = true;
        case 13:
            backspace = true;
        default: return;
    }
}


// finction to capitalize the character capslock is ON
const capsify = (character) => {
    if(character >= 'a' && character<='z') {
        return character.toUpperCase();
    }
    return character;
}


// main function to handle character and return out string to be shown on app's text area
$(function(){
	var $write = $('#write');

    $('#keyboard li').click(function(){

        const character = characterFilter($(this).attr('value'));

        switch (character) {
            case '12': // case to deal with capslock
                capsified = !capsified;
                (capsified )? $(this).addClass('selected'): $(this).removeClass('selected'); // adding extra class to show ON effect using CSS
                return;
            case '13': // case to deal with backspace
                let presentText = $write.html(); 
                $write.html(presentText.slice(0, presentText.length-1)); // trimming out the last character 
                return;
            case '14': // case for spacebar key
                $write.html($write.html() + " ");
                return;
            default:
                const durationPressed = currentUp - currentDown;  // checking the duration of keypress
                let updatedCharacter = (durationPressed >= THRESHOLD_NUM) ? 
                character : handlePress(character);
                
                if(capsified) 
                    updatedCharacter = capsify(updatedCharacter);

                if((character === lastCharacter) && currentDown - lastUp <= 1000) {
                    let presentText = $write.html();
                    const newText = presentText.slice(0, presentText.length-1) + updatedCharacter;
                    $write.html(newText);
                } else {
                    $write.html($write.html() + updatedCharacter);
                }
                lastCharacter = character;
        }
    });
});