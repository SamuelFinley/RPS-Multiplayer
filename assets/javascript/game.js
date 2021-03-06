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
    oppt: '',
  }

  let matchmaking = false;
  let win = 0;
  let loss = 0;

  firebase.initializeApp(config);
  

  let database = firebase.database();
    
  function start () {
    $('#btn0').css('display', 'none');
    $('#btn-container').css('display', 'none');
    $('#btn1, #btn2, #btn3').prop('disabled', true);
    $('#btn1, #btn2, #btn3').css('display', 'none');
  }

  window.onload = start ();

  function reset () {
    matchmaking = false;
    let userRef = database.ref('users/' + gameObj.userId);
    userRef.update({
      isWaiting: false,
      inGame: false,
    }).catch((err) => {
      console.log(`Error setting db values -- ${err}`);
    });
  }

  function findGame (userId) {
    gameObj.gId = '';
    gameObj.player = '';
    gameObj.oppt = '';
    let ref = database.ref('users');
    let userRef = database.ref('users/' + userId);
    userRef.update({
      isWaiting: true
    });
    let ordering = ref.orderByChild("isWaiting");
    ordering.once("child_changed", function(snapshot) {
      const theyWait = snapshot.val();
      if (theyWait.isWaiting && theyWait.Id !== userId && !theyWait.inGame) {
        let p2Ref = database.ref('users/' + theyWait.Id);
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
      }
  });
  userRef.on("child_changed", function(snapshot) {
      if (!snapshot.val() && gameObj.oppt !== 'player2' && matchmaking) {
        $('#btn-container > h1').html('connected!<br>Make your Pick!');
        $('#btn-container > h1').css('display', 'block');
        $('#btn0').css('display', 'none');
        $('#btn1, #btn2, #btn3').prop('disabled', false);
        gameObj.player = 'player2';
        gameObj.oppt = 'player1';
      }

    });
  }


  function setUserData(name) {
    let userRef = database.ref('users').push();
    gameObj.username = name;
    gameObj.userId = userRef.key;
    userRef.set({
      Id: userRef.key,
      isWaiting: false,
      game: '',
      win: 0,
      loss: 0,
      inGame: false,
      username: name,
    });
  }

  function setGameData(player1, player2) {
    let gameRef = database.ref('game').push();
    gameObj.gId = gameRef.key;
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
  }

  function turn(choice) {
    $('#btn-container > h1').html(choice);
    let ref = database.ref('users/' + gameObj.userId);
    ref.once("value", function(data) {
      gameObj.gId = data.val().game
    });
    let ref2 = database.ref('game/' + gameObj.gId);
    ref2.child(gameObj.player).update({
      choice: choice
    });
    ref2.child(gameObj.oppt).once("value", function(data) {
      if (data.val().choice) {
        game(choice, data.val().choice);
      }
    })
    ref2.child(gameObj.player).on("child_changed", function(data) {
      $('#btn-container > h1').html(data.val());
      condits (data.val());
    })
  }

  function condits (data) {
    switch (true) {
      case (data === 'You Win!') :
      win++
      $('#footer').html('wins: ' + win + '    Losses: ' + loss);
      $('#btn0').css('display', 'block');
      reset ();
      break;
      case (data === 'You Lose!') :
      loss++
      $('#footer').html('wins: ' + win + '    Losses: ' + loss);
      $('#btn0').css('display', 'block');
      reset ();
      break;
      case (data === 'You Tied!') :
      $('#btn0').css('display', 'block');
      reset ();
      break;
    }
  }

  function game (choice, choice2) {
    let gref = database.ref('game/' + gameObj.gId);
    let ref = database.ref('users/');
    let name = '';
    gref.child(gameObj.oppt).once("value", function(data) {
      name = data.val().ID;
      switch (true) {
        case ((choice === 'rock') && (choice2 === 'rock')) : 
        gref.child(gameObj.player).update({
          response: 'You Tied!'
        });
        gref.child(gameObj.oppt).update({
          response: 'You Tied!'
        });
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
        gref.child(gameObj.player).update({
          response: 'You Tied!'
        });
        gref.child(gameObj.oppt).update({
          response: 'You Tied!'
        });
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
        gref.child(gameObj.player).update({
          response: 'You Tied!'
        });
        gref.child(gameObj.oppt).update({
          response: 'You Tied!'
        });
        break;
        }
      });
  }

  
  $('#btn1, #btn2, #btn3').click(function () {
    let choice = $(this).attr('name');
    $('#btn1, #btn2, #btn3').prop('disabled', true);
    $('#btn1, #btn2, #btn3').css('display', 'none');
    $(this).css('display', 'flex');
    turn(choice);
    
  })

  $('#btn0').click(() => {
    $('#btn0').css('display', 'none');
    $('#btn-container > h1').html('Finding Match...');
    $('#btn-container > h1').css('display', 'block');
    $('#btn1, #btn2, #btn3').css('display', 'flex');
    matchmaking = true;
    findGame(gameObj.userId);
  })

  $('#submit').click(() => {
    $('#btn0').css('display', 'block');
    $('#btn-container').css('display', '-webkit-flex');
    $('#sign-in').css('display', 'none');
    let name = $('#username').prop('value');
    let newKey = firebase.database().ref().child('users').push().key;
    setUserData(name);
    });
})
  