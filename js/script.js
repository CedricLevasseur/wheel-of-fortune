let game = { gameScore: [0,0], roundScore: [0,0], currPlayer: 0, round:1  }
let url="http://localhost/server/"

/*var gameScore = [0,0]
var roundScore = [0,0]
var currPlayer = 0
var round = 1
let enigma = clueBank.getRandClue()
let clue
let category
clue = enigma[1]
category = enigma[0]
*/
var clueTablePos = []
var guessedLetters = ""
var buyAVowel = false


var $tiles = [$(".tile.r1"),$(".tile.r2"),$(".tile.r3")]
var tilesPerRow = $tiles[0].length
var $category = $("#category")

var $instructionBox = $("#instructions")


var $p1Name = $("#p1-name")
var $p2Name = $("#p2-name")
var pNames = [$p1Name.val(), $p2Name.val()]

var $p1roundScore = $("#p1-score")
var $p2roundScore = $("#p2-score")
var $p1gameScore = $("#p1-bank")
var $p2gameScore = $("#p2-bank")
var pScore = {  roundEl: [$p1roundScore, $p2roundScore],
                gameEl: [$p1gameScore, $p2gameScore]}


var $startButton = $("#start")
var $guessInput = $("#guess-input")
var $spinButton = $("#spin")
var $buyVowelButton = $("#buy-vowel")
var $solveButton = $("#solve")
var $wheel = $("#wheel")

$wheel.values = [ 50000,
                  5000,
                  8500,
                  3000,
                  5000,
                  4500,
                  "Lose a Turn",
                  4000,
                  9500,
                  3500,
                  5000,
                  6500,
                  "Bankrupt",
                  3000,
                  3000,
                  8000,
                  9000,
                  6000,
                  3000,
                  5500,
                  7500,
                  4000,
                  5000,
                  3000]

$wheel.getValue = function () {
  var max = this.values.length
  var min = 0
  return this.values[Math.floor(Math.random() * (max - min)) + min]
}
init()
.then(main)

/* --------------------------------------------------------------- */

async function init() {
    console.log(JSON.stringify(game))
    let promise1=await get(url,'enigma')   
    return promise1;
}
function main(){
    console.log(JSON.stringify(game))
    showStartButton()

}

async function get(url,propertie_name) {
    const json = await fetch(url+propertie_name,{mode: 'cors'})
                .then(response => response.json())
                .then(data => game[propertie_name] = data)
    return json    
}


function showStartButton () {
  $startButton.show().on("click", function (e) {
    $startButton.fadeOut("fast").off()

    emptyBoard()
    placeTiles()
    showMessage("Let's play!", true) // shows message and displays continue button

    $("table").fadeIn('slow')
    for (var i=0; i<game.gameScore.length; i++) {
      pScore.roundEl[i].html(0)
      pScore.gameEl[i].html(game.gameScore[i])
    }
  })
}

/* --------------------------------------------------------------- */

/*
 * UI Display a message 
 */
function showMessage(msg, showContinue, nextRound) {
  $instructionBox.html(msg + " ")
  if(showContinue) {
    $instructionBox.append($("<button id=continue>").click(function () {
      $(this).hide()
      choose()
    }).html(">"))
  }
  if (nextRound) {
    $instructionBox.append($("<button id=continue>").click(function () {
      $(this).hide()
      emptyBoard()
      var enigma = clueBank.getRandClue()
      console.log(enigma)
      clue = enigma.clue
      category = enigma.category
      placeTiles()
      // reset scores display for round
      for (var i=0; i<game.gameScore.length; i++) {
        pScore.roundEl[i].html(0)
      }
      showMessage("Let's play the round " + game.round,true)
    }).html(">"))
  }
}

function currPlayerName() {
  pNames = [$p1Name.val(), $p2Name.val()]
  return pNames[game.currPlayer]
}

/* 
 * Return Tiles
 */
function emptyBoard() {
  for (var i=0; i<$tiles.length; i++) {
    $tiles[i].removeClass("blank-tile").html("")
  }
}

function placeTiles(solved) {
  var clueArr = game.enigma.clue.split(" ")
  var currRow = 0
  var currCol = 0
  var k = 0
  clueTablePos = []

  $category.html(category)

  for(var i=0; i<clueArr.length; i++) {  //for each element (aka word) in clue
    var currWord = clueArr[i]
    if(currCol + currWord.length < tilesPerRow) { //if element fits
      if(currCol !== 0) { //if not on first column add a space
        currCol += 1
      }
    } else {
      currRow += 1 //go to next row
      currCol = 0 //go to first tile of that row
    }
    for(var j=0; j< currWord.length; j++) {
      flipTiles(currRow, currCol, k, solved, currWord[j])
      clueTablePos.push([currRow, currCol])
      currCol++
      k++
    }
  }
  // reveals disambigous letter 
  let letter
  for( var i=0; i<game.enigma.clue.length; i++){
      letter=game.enigma.clue[i]
      const authorized="abcdefghijklmnopkrstuvwxyz"
      if(authorized.index_of(letter)===-1){
            updateBoard(letter)
      }
  }
}

function flipTiles (passedCurrRow, passedCurrCol,tileNum, solvedBool, currLetter) {
  window.setTimeout(function () {
    $($tiles[passedCurrRow][passedCurrCol]).delay(1000).addClass('blank-tile')
    if(solvedBool) {
      $($tiles[passedCurrRow][passedCurrCol]).html(currLetter)
    }
  }, tileNum*150)

}

function choose() {
  enableChoices()
  showMessage("Ok " + currPlayerName() + ", what do you want to do?", false)
}

function enableChoices() {
  $spinButton.show().on("click", spin)
  $buyVowelButton.show().on("click", buyVowel)
  $solveButton.show().on("click", solve)
}

function disableChoices() {
  $spinButton.hide().off()
  $buyVowelButton.hide().off()
  $solveButton.hide().off()
}

function spin () {
  showSpinGif()
  buyAVowel = false
  disableChoices()

  var spinValue = $wheel.getValue()


  if(spinValue === "Bankrupt") {
    showMessage(spinValue +  "! Womp womp!", true)
    updateScore(0,0,true)
    nextPlayer()

  } else if (spinValue === "Lose a Turn") {
    showMessage(spinValue +  " " + currPlayerName() + ".", true)
    nextPlayer()
  } else {
    var returnDown = false
    $guessInput.show().focus().keydown(function (event){
      if(event.which === 13 && returnDown === false) {
        returnDown = true
        guess($(this).val(), spinValue)
        $(this).val("")
      }
    }).keyup(function(event) {
      if(event.which === 13 && returnDown === true){
        returnDown = false
      }
    })
    showMessage(spinValue +  "! " + currPlayerName() + ", please guess a letter.", false)
  }
}

function buyVowel () {
  //check if you can even buy a vowel
  if(game.roundScore[game.currPlayer] < 250) {
    showMessage("You need at least 250 for a vowel.", false)
    $guessInput.hide().off()
  } else {
    spinValue = -250
    disableChoices()
    showMessage("Alright, vowels are 250 each.", false)
    var returnDown = false
      $guessInput.show().focus().keydown(function (event){
        if(event.which === 13 && returnDown === false) {
          returnDown = true
          guessVowel($(this).val(), spinValue)
          $(this).val("")
        }
      }).keyup(function(event) {
        if(event.which === 13 && returnDown === true){
          returnDown = false
        }
      })
  }
}

function solve () {
  disableChoices()
  showMessage("Go ahead and solve, " + currPlayerName())
  var returnDown = false
  $guessInput.show().focus().attr('maxlength', 30).keydown(function (event){
    if(event.which === 13 && returnDown === false) {
      returnDown = true
      checkSolve($(this).val())
      $(this).val("").attr('maxlength', 1)
    }
  }).keyup(function(event) {
    if(event.which === 13 && returnDown === true){
      returnDown = false
    }
  })
}



function guess (letter, spinValue) {
  letter = letter.toLowerCase()
  var result = checkGuess(letter)
  if(result === "vowel") {
    showMessage("Sorry, you have to buy vowels. Please guess a consonant. You spun " + spinValue + ".", false)
  } if(result === "not a letter") {
    showMessage("Uh, that's not a letter", false)
  } else if (result === "already-guessed") {
    showMessage("Whoops, '" + letter + "' was already guessed. Sorry you lost your turn.", true)
    nextPlayer()
    $guessInput.hide().off()
  } else if (result === "wrong") {
    guessedLetters += letter
    nextPlayer()
    showMessage("No '" + letter + "'. " + currPlayerName() + ", you're up", true)
    $guessInput.hide().off()
  } else if (result === "correct") {
      guessedLetters += letter

      letterCount = updateBoard(letter)

      updateScore(spinValue, letterCount)

      showMessage("Alright! Go ahead and flip them!", true)
      $guessInput.hide().off()
  }
}

//
//String.prototype.index_of = function (char) {
//    return this.index_of(char, 0)
//}

String.prototype.index_of = function (char, pos) {
    console.log("entering with this: "+this+" char:"+char+" startingPos:"+pos )
    if(char == null)
        return -1
    if( pos == null)
        pos=0
    char=char.toLowerCase()
    
    let idx=-1
    let similarLetters=[ ['À','à','A','a'], ['È','è','É','é','E','Ê','ê','Ë','ë','e'], ['Ù','ù','U','u'], ['Ç','ç','C','c'],['Î','î','Ï','ï', 'i'] ]
    for (var lettersArr of similarLetters){
        let last = lettersArr.slice(-1).pop()  // last element of an array. Here it's "a" 
//        console.log("char: "+char+" last: "+last +" this: "+this)
        if(char==last){
            for (var lttr of lettersArr){
                idx= this.indexOf(lttr, pos)
                if( idx!=-1 ){
                    return idx
                }
            }    
        }    
    }
    let result=this.toLowerCase().indexOf(char, pos);
    console.log("exiting result: "+result)
    return result
}


function guessVowel (letter, spinValue) {
  letter = letter.toLowerCase()

  //check the letter
  var result = checkGuess(letter)
  var clueNoSpaces = game.enigma.clue.replace(/\s/ig, "")
  if(result !== "vowel") {
    showMessage("That's not a vowel.", false)
  } else {  
    if (guessedLetters.index_of(letter) !== -1){
      showMessage("Whoops, '" + letter + "' was already guessed. Sorry you lost your turn.", true)
      nextPlayer()
      $guessInput.hide().off()
    } else if (clueNoSpaces.index_of(letter) === -1) {
      guessedLetters += letter
      nextPlayer()
      showMessage("No '" + letter + "'. " + currPlayerName() + ", you're up", true)
      $guessInput.hide().off()
    } else {
        guessedLetters += letter

        letterCount = updateBoard(letter)
        updateScore(spinValue, letterCount)
        showMessage("Flip over those vowels!", true)
        $guessInput.hide().off()
    }
  }
}
/*
 * Light on letters when founds
 */
function updateBoard(letter) {
  //find positions of letter on board
  var clueNoSpaces = game.enigma.clue.replace(/\s/ig, "")
  console.log("letter:"+letter+ " clueNoSpaces:"+clueNoSpaces)
  var pos = clueNoSpaces.index_of(letter)
  var posArr = []
  var count = 0

  // pos and count of the letters
  while (pos !== -1) {
      posArr.push(pos)
       pos = clueNoSpaces.index_of(letter, pos+1)
      count++
      if(count>100){
          debugger;
          pos=-1
      }    
  }

  //highlight all the tiles with that letter
  for (var i=0;i<posArr.length; i++) {
    tileRow = clueTablePos[posArr[i]][0]
    tileCol = clueTablePos[posArr[i]][1]
    $($tiles[tileRow][tileCol]).addClass("highlight").html(clueNoSpaces[posArr[i]]).click(function(e) { //give tiles ability to flip
        $(e.currentTarget).removeClass('highlight').off()
      })
  }

  return count
}


//note have it return an array of strings
function checkGuess(letter) { //return "vowel", "correct", "already guessed", "wrong", or "not a letter"
  var vowels = ["a", "e", "i", "o", "u"]
  var clueNoSpaces = game.enigma.clue.replace(/\s/ig, "")

  if (letter.length === 0) {
    return "no input"
  } else if (!/[a-zA-Z]/.test(letter)) {
    return "not a letter"
  } else if(vowels.indexOf(letter) !== -1) {
    return "vowel"
  } else if(guessedLetters.index_of(letter) !== -1) {
    return "already-guessed"
  } else if(clueNoSpaces.index_of(letter) === -1) {
    return "wrong"
  } else {
    return "correct"
  }
}

function checkSolve(guess) {
  guess = guess.toLowerCase()
  var clueNoSpaces = game.enigma.clue.replace(/\s/ig, "").toLowerCase()
  var guessNoSpaces = guess.replace(/\s/ig, "").toLowerCase().toLowerCase()
  if (clueNoSpaces === guessNoSpaces) {
    //empty the board
    emptyBoard()
    // loop through every letter in the clue and place it on the board
    for (var j=0; j<guessNoSpaces.length; j++) {

      //find the position(s) of that letter
      var letter = guessNoSpaces[j]
      var pos = clueNoSpaces.index_of(letter)
      var posArr = []
      var count = 0

      while (pos !== -1) {
          posArr.push(pos)
          pos = clueNoSpaces.index_of(letter, pos+1)
          count++
      }

      window.setTimeout(function () {placeTiles(true)}, 500)
    }

    //go to next round.
    nextRound()


  } else {
    nextPlayer()
    showMessage("Not quite, sorry. You're up "+ currPlayerName(), true)
  }

  $guessInput.hide().off()
}

function nextPlayer() {
  if(game.currPlayer === 1) {
    game.currPlayer = 0
  } else {
    game.currPlayer++
  }
}

function nextRound() {
  //bank round points of the current player only
  game.gameScore[game.currPlayer] += game.roundScore[game.currPlayer]
   //display game scores so far
  for (var i=0; i<game.gameScore.length; i++) {
    pScore.roundEl[i].html(0)
    pScore.gameEl[i].html(game.gameScore[i])
  }

  if (game.round > 2) {
    pNames = [$p1Name.val(), $p2Name.val()]
    console.log("finished game", game.gameScore)
    game.round = 1
    //check who won.
    if (game.gameScore[0] == game.gameScore [1]) {
      showMessage("It's a tie, womp womp. \rPress start to play a new game.")
    } else if(game.gameScore[0] > game.gameScore [1]) {
      showMessage("Congrats "+ pNames[0] +", you won with " + game.gameScore [0] +" points! \rPress start to play a new game.")
    } else {
      showMessage("Congrats "+ pNames[1] +", you won with " + game.gameScore [1] +" points! \rPress start to play a new game.")
    }
    game.gameScore = [0,0]
    showStartButton()
  } else {
    game.round++
    //show message and
    showMessage("Congratulations! You banked " + game.roundScore[game.currPlayer] + " that round! Here are the scores.", false,true)
  }

  //reset guessed letters
  guessedLetters = ""
  //reset round score
  game.roundScore = [0,0]

}

function updateScore (points, numGuessed, bankrupt) {
  if(bankrupt) {
    game.roundScore[game.currPlayer] = 0
  } else {
    game.roundScore[game.currPlayer] += points*numGuessed
    console.log(game.roundScore)
  }
  pScore.roundEl[game.currPlayer].html(game.roundScore[game.currPlayer])
}

function showSpinGif() {
  $("#gif").css('background-image', 'url('+ gifUrls.getUrl() +')').toggle().delay(1000).fadeOut("slow")
}
