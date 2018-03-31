$(document).ready(() => {

  let config = {
    apiKey: "AIzaSyDc2e8p_O9uPEVetfH4uonXUc7yQFIR7kM",
    authDomain: "rps-multiplayer-88459.firebaseapp.com",
    databaseURL: "https://rps-multiplayer-88459.firebaseio.com",
    projectId: "rps-multiplayer-88459",
    storageBucket: "rps-multiplayer-88459.appspot.com",
    messagingSenderId: "758017970476"
  };

  let gameObj = {
    gId: '',
    username: '',
    userId: '',
    player: '',
    oppt: ''
  }

  firebase.initializeApp(config);
  
  
  // Create a variable to reference the database
  let database = firebase.database();
    
  // const setDatabase = ({id = '', username = '', password = ''}) => {
  //   database.ref().set({
  //     name: name,
  //     email: email,
  //     age: age,
  //     comment: comment
  //   }).then(() => {
  //     $("#name-display").text(name);
  //     $("#email-display").text(email);
  //     $("#age-display").text(age);
  //     $("#comment-display").text(comment);
  //   }).catch((err) => {
  //     console.log(`Error setting db values -- ${err}`);
  //   });
  // };
  // function checkIfUserExists(userId) {
  //   var usersRef = new Firebase(USERS_LOCATION);
  //   usersRef.child(userId).once('value', function(snapshot) {
  //     var exists = (snapshot.val() !== null);
  //     userExistsCallback(userId, exists);
  //   });
  function start () {
    $('#btn0').css('display', 'none');
    $('#btn-container').css('display', 'none');
    $('#btn1, #btn2, #btn3').prop('disabled', true);
  }

  window.onload = start ();

  function findGame (userId) {
    let ref = database.ref('users')
    let userRef = database.ref('users/' + userId);
    userRef.update({
      isWaiting: true
    });
    let ordering = ref.orderByChild("isWaiting");
    ordering.on("child_changed", function(snapshot) {
      const theyWait = snapshot.val();
      if (theyWait.isWaiting && theyWait.Id !== userId) {
        let p2Ref = database.ref('users/' + theyWait.Id);
        console.log(theyWait);
        setGameData(userId, theyWait.Id);
        $('#btn0').css('display', 'none');
        $('#btn1, #btn2, #btn3').prop('disabled', false)
        $('#btn-container > h1').html('connected!<br>Make your Pick!')
        $('#btn-container > h1').css('display', 'block');
        gameObj.player = 'player1';
        gameObj.oppt = 'player2';
        userRef.update({
          isWaiting: false,
          inGame: true,
          game: gameObj.gId
        }).catch((err) => {
          console.log(`Error setting db values -- ${err}`);
        });
        p2Ref.update({
          isWaiting: false,
          inGame: true,
          game: gameObj.gId
        }).catch((err) => {
          console.log(`Error setting db values -- ${err}`);
        });
      } console.log(theyWait.isWaiting)
      if (theyWait.Id === userId && !theyWait.isWaiting && theyWait.inGame && !gameObj.player) {
        console.log('here')
        $('#btn-container > h1').html('connected!<br>Make your Pick!')
        $('#btn-container > h1').css('display', 'block');
        $('#btn0').css('display', 'none');
        $('#btn1, #btn2, #btn3').prop('disabled', false)
        gameObj.player = 'player2';
        gameObj.oppt = 'player1';
      }
  });
  }

  // function game (

  // )

  function setUserData(name) {
    let userRef = database.ref('users').push();
    gameObj.username = name;
    gameObj.userId = userRef.key;
    console.log(name)
    userRef.set({
      Id: userRef.key,
      isWaiting: false,
      game: '',
      win: 0,
      loss: 0,
      inGame: false,
      username: name,
      choice: ''
    });
  }

  function setGameData(player1, player2) {
    let gameRef = database.ref('game').push();
    gameObj.gId = gameRef.key
    gameRef.set({
      Id: gameRef.key,
      win: '',
      loss: '',
      player1: {
        ID: player1,
        choice: '',
        response: ''
      },
      player2: {
        ID: player2,
        choice: '',
        response: ''
      }
    });
    // let userRef = database.ref('users');
    // userRef.child(player1).update({
    //   game: gameRef.key
    // });
    // userRef.child(player2).update({
    //   game: gameRef.key
    // });
  }

  function turn(choice) {
    //let path = 'game/' + gameId + '/turn/' + turnId;
    //updates['game/' + gameId + '/turn/' + turnId] = turnData;
    console.log(choice)
    let ref = database.ref('users/' + gameObj.userId);
    ref.once("value", function(data) {
      console.log(data.val().game)
      gameObj.gId = data.val().game
    });
    let ref2 = database.ref('game/' + gameObj.gId);
    ref2.child(gameObj.player).update({
      choice: choice
    });
    console.log(gameObj.oppt)
    ref2.child(gameObj.oppt).once("value", function(data) {
      console.log(data.val())
      if (data.val().choice) {
        game(choice, data.val().choice);
      }
    })
    ref2.child(gameObj.player).once("value", function(data) {
      $('#btn-container > h1').html(data.val().response);
    })
  }

  function game (choice, choice2) {
    let gref = database.ref('game/' + gameObj.gId);
    let ref = database.ref('users/');
    let name = '';
    console.log('win')
    //ref.child(gameObj.oppt).once("value", function(data) {
    gref.child(gameObj.oppt).once("value", function(data) {
      name = data.val().ID
      console.log(data.val().ID)
    // gref.child('win').on("child_changed", function(snapshot) {
    //   console.log('win')
    // })
      switch (true) {
        case ((choice === 'rock') && (choice2 === 'rock')) : 
          $('#btn-container > h1').html('You tied!');
          break;
        case ((choice === 'rock') && (choice2 === 'paper')) : 
        $('#btn-container > h1').html('You Lose!');
          gref.child(gameObj.player).update({
            response: 'You Lose!'
          });
          gref.child(gameObj.oppt).update({
            response: 'You Win!'
          });
          break;
        case ((choice === 'rock') && (choice2 === 'scissors')) : 
        $('#btn-container > h1').html('You Win!');
        gref.child(gameObj.player).update({
          response: 'You Win!'
        });
        gref.child(gameObj.oppt).update({
          response: 'You Lose!'
        });
          break;
        case ((choice === 'paper') && (choice2 === 'rock')) : 
        gref.child(gameObj.player).update({
          response: 'You Win!'
        });
        gref.child(gameObj.oppt).update({
          response: 'You Lose!'
        });
          break;
        case ((choice === 'paper') && (choice2 === 'paper')) : 
        break;
        case ((choice === 'paper') && (choice2 === 'scissors')) : 
        gref.child(gameObj.player).update({
          response: 'You Lose!'
        });
        gref.child(gameObj.oppt).update({
          response: 'You Win!'
        });
          break;
        case ((choice === 'scissors') && (choice2 === 'rock')) : 
        console.log(name)
        gref.child(gameObj.player).update({
          response: 'You Lose!'
        });
        gref.child(gameObj.oppt).update({
          response: 'You Win!'
        });
          break;
        case ((choice === 'scissors') && (choice2 === 'paper')) : 
        gref.child(gameObj.player).update({
          response: 'You Win!'
        });
        gref.child(gameObj.oppt).update({
          response: 'You Lose!'
        });
          break;
        case ((choice === 'scissors') && (choice2 === 'scissors')) : 
        break;
        }
      });
  }

  
  $('#btn1, #btn2, #btn3').click(function () {
    let choice = $(this).attr('name');
    $('#btn1, #btn2, #btn3').prop('disabled', true)
    turn(choice);
    
  })

  $('#btn0').click(() => {
    console.log('clicked')
    //$('#btn0').prop('disabled', false);
    findGame(gameObj.userId);
  })

  $('#submit').click(() => {
    $('#btn0').css('display', 'block');
    $('#btn-container').css('display', '-webkit-flex');
    $('#sign-in').css('display', 'none');
    let name = $('#username').prop('value');
    let newKey = firebase.database().ref().child('users').push().key;
    console.log(name)
    setUserData(name);
    });



//   function win () {
//     if (correct == big) {
//       won +=1
//       window.localStorage.setItem('won', won)
//       $('#wins').html('wins: ' + won)
//       $('#hal').html("H.A.L 9000: <br>" + halStuff[halStuff.length-1])
//     }
//   }

//   document.onkeyup = (event) => {
//     if (guess > 0) {
//     letter = String.fromCharCode(event.which).toLowerCase();
//     reg = new RegExp(letter,"i");
//       if (!letters.includes(letter)) {
//         letters = letters + letter + ' ';
//         $('#letters').html('[ ' + letters + ']')
//         hal (reg.test(word));
//         while (reg.test(word)) {
//           indx = (word.search(reg) + 1) * 2 - 1;
//           blanks= blanks.substring(0, indx) + letter + blanks.substring(indx + 1);
//           word = word.replace(reg, '_')
//           correct += 1
//         }
//         win ();
//     $('#word').html(blanks)
//   }}
// }

  // $('#begin').click(nGame)

})
  