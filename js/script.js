
var gameScore = [0,0]
var roundScore = [0,0]
var currPlayer = 0
var round = 1
var url="http://localhost/arr.json"
let arr = clueBank.getRandClue()
let clue
let category
clue = arr[1]
category = arr[0]
console.log(category, ",",clue)

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
//init();
showStartButton()
/* --------------------------------------------------------------- */
async function getArr(url) {
    const json = await fetch(url,{mode: 'cors'})
                .then(response => response.json());
    arr= json
}

async function init() {
    arr=getArr(url)
    console.log("--->"+arr.clue)    
}

function showStartButton () {
  $startButton.show().on("click", function (e) {
    $startButton.fadeOut("fast").off()

    emptyBoard()
    placeTiles()
    showMessage("Let's play!", true) // shows message and displays continue button

    $("table").fadeIn('slow')
    for (var i=0; i<gameScore.length; i++) {
      pScore.roundEl[i].html(0)
      pScore.gameEl[i].html(gameScore[i])
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
      var arr = clueBank.getRandClue()
      console.log(arr)
      clue = arr[1]
      category = arr[0]
      placeTiles()
      // reset scores display for round
      for (var i=0; i<gameScore.length; i++) {
        pScore.roundEl[i].html(0)
      }
      showMessage("Let's play the round " + round,true)
    }).html(">"))
  }
}

function currPlayerName() {
  pNames = [$p1Name.val(), $p2Name.val()]
  return pNames[currPlayer]
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
  var clueArr = clue.split(" ")
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
  if(roundScore[currPlayer] < 250) {
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

function guessVowel (letter, spinValue) {
  letter = letter.toLowerCase()

  //check the letter
  var result = checkGuess(letter)
  var clueNoSpaces = clue.replace(/\s/ig, "")
  if(result !== "vowel") {
    showMessage("That's not a vowel.", false)
  } else {
    if (guessedLetters.indexOf(letter) !== -1){
      showMessage("Whoops, '" + letter + "' was already guessed. Sorry you lost your turn.", true)
      nextPlayer()
      $guessInput.hide().off()
    } else if (clueNoSpaces.indexOf(letter) === -1) {
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
  var clueNoSpaces = clue.replace(/\s/ig, "")
  var pos = clueNoSpaces.indexOf(letter)
  var posArr = []
  var count = 0

  // pos and count of the letters
  while (pos !== -1) {
      posArr.push(pos)
      pos = clueNoSpaces.indexOf(letter, pos+1)
      count++
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
  var clueNoSpaces = clue.replace(/\s/ig, "")

  if (letter.length === 0) {
    return "no input"
  } else if (!/[a-zA-Z]/.test(letter)) {
    return "not a letter"
  } else if(vowels.indexOf(letter) !== -1) {
    return "vowel"
  } else if(guessedLetters.indexOf(letter) !== -1) {
    return "already-guessed"
  } else if(clueNoSpaces.indexOf(letter) === -1) {
    return "wrong"
  } else {
    return "correct"
  }
}

function checkSolve(guess) {
  guess = guess.toLowerCase()

  var clueNoSpaces = clue.replace(/\s/ig, "")
  var guessNoSpaces = guess.replace(/\s/ig, "").toLowerCase()
  if (clueNoSpaces === guessNoSpaces) {
    //empty the board
    emptyBoard()
    // loop through every letter in the clue and place it on the board
    for (var j=0; j<guessNoSpaces.length; j++) {

      //find the position(s) of that letter
      var letter = guessNoSpaces[j]
      var pos = clueNoSpaces.indexOf(letter)
      var posArr = []
      var count = 0

      while (pos !== -1) {
          posArr.push(pos)
          pos = clueNoSpaces.indexOf(letter, pos+1)
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
  if(currPlayer === 1) {
    currPlayer = 0
  } else {
    currPlayer++
  }
}

function nextRound() {
  //bank round points of the current player only
  gameScore[currPlayer] += roundScore[currPlayer]
   //display game scores so far
  for (var i=0; i<gameScore.length; i++) {
    pScore.roundEl[i].html(0)
    pScore.gameEl[i].html(gameScore[i])
  }

  if (round > 2) {
    pNames = [$p1Name.val(), $p2Name.val()]
    console.log("finished game", gameScore)
    round = 1
    //check who won.
    if (gameScore[0] == gameScore [1]) {
      showMessage("It's a tie, womp womp. \rPress start to play a new game.")
    } else if(gameScore[0] > gameScore [1]) {
      showMessage("Congrats "+ pNames[0] +", you won with " + gameScore [0] +" points! \rPress start to play a new game.")
    } else {
      showMessage("Congrats "+ pNames[1] +", you won with " + gameScore [1] +" points! \rPress start to play a new game.")
    }
    gameScore = [0,0]
    showStartButton()
  } else {
    round++
    //show message and
    showMessage("Congratulations! You banked " + roundScore[currPlayer] + " that round! Here are the scores.", false,true)
  }

  //reset guessed letters
  guessedLetters = ""
  //reset round score
  roundScore = [0,0]

}

function updateScore (points, numGuessed, bankrupt) {
  if(bankrupt) {
    roundScore[currPlayer] = 0
  } else {
    roundScore[currPlayer] += points*numGuessed
    console.log(roundScore)
  }
  pScore.roundEl[currPlayer].html(roundScore[currPlayer])
}

function showSpinGif() {
  $("#gif").css('background-image', 'url('+ gifUrls.getUrl() +')').toggle().delay(1000).fadeOut("slow")
}
