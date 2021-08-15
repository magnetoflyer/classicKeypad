const THRESHOLD_CHAR = 500;// delay limit for contiuous keyupress of same key
const THRESHOLD_NUM = 600; // delay limit for hold keypress

// map for each key and corresponding alphabetical/symbol sign
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
    '': "",
    '0': "0",
    '#': '#',
};

const userKeyPresses = {}

let lastCharacter = 0; // variable to check for last character pressed
let lastDown = 0;   // varialble to track time elasped since the last key pressed

let lastUp = 0;
let currentUp = 0;
let currentDown = 0;

let capsified = false; // variable to hold if the caps lock is on/off


// function for initializing the mapped value of each key and no. time of same key pressed count
var initialize = (function() {
    var initialized = false;
    const characters = [0,1,2,3,4,5,6,7,8,9,'#','*', 12, 13,14]
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

initialize();  // function call 


// function to return character to be printed based on the time elasped since last pressed
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


//function to check time of mousekey down event
const handleMouseDown = () => {
    lastDown = currentDown;
    currentDown = Date.now();
}


// function to check time of mousekey up event
const handleMouseUp = () => {
    lastUp = currentUp;
    currentUp = Date.now();
}

// this function is required to map the value of each key in html to its corresponding character
const characterFilter = (character) => {
    if(Number(character)<=9) return character;
    else {
        switch(character) {
            case 10: 
                return '*';
            case 11: 
                return '#';
            default:
                return character
        }
    }
}

const handleSpecialKeyPreseses = (character) => {
    switch (character) {
        case 12: 
            capsified = true;
        case 13:
            backspace = true;
        default: return;
    }
}


// to convert characters in Capital if capsified variable is true
const capsify = (character) => {
    if(character >= 'a' && character<='z') {
        return character.toUpperCase();
    }
    return character;
}


//main interactice funtion to write on the text box of web page
$(function(){
	var $write = $('#write');

    $('#keyboard li').click(function(){
        const character = characterFilter($(this).attr('value'));// recieve the value of each button pressed and get its corresponding character


        // based on the character perform the required action
        switch (character) {
            case 12:// case for capslock key
                capsified = !capsified;
                (capsified )? $(this).addClass('selected'): $(this).removeClass('selected'); // adding an extra class to the for UI effect
                return;
            case 13:// case for backspace key
                let presentText = $write.html(); 
                $write.html(presentText.slice(0, presentText.length-1));
                return;
            case 14: // case for spacebar key
                $write.html($write.html() + " ");
                return;
            default: // for all other keys
                const durationPressed = currentUp - currentDown;
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
                lastCharacter = character;// keep track of the last character pressed
        }
    });
});