
const socket =io.connect('http://localhost:5000');
const chatForm=document.getElementById("chatForm")
const joinForm=document.getElementById("joinForm");
const messageInput=document.getElementById('msg')
const messagecontainer=document.querySelector('.message');
const chatMessages=document.querySelector('.messages')
const roomName=document.querySelector('.roomname')
let status =document.getElementById('gamestatus');
const gamereset=document.getElementById('gamereset');
const whitescoreDis=document.getElementById('whitescore')
const blackscoreDis=document.getElementById('blackscore')
const myBoard=document.getElementById('MyBoard');

var audio1= new Audio('./ting.mp3')
var audio2= new Audio('./chessmove.mp3');
whiteScore=0;
blackScore=0;


const {username,room,player}=Qs.parse(location.search,{
    ignoreQueryPrefix: true
})
var playerCol=player.toLowerCase();
var board;
var game;
var Orientation=`${playerCol}`;
// let Orientation=;

socket.on('checkplayer',(user)=>{
  console.log(user);
  if(user.player!==player)
  Orientation=user.player.toLowerCase();
  console.log(Orientation)
})

// Making onlt legal moves
function onDragStart (source, piece, position, orientation) {
    // do not pick up pieces if the game is over
    if (game.game_over()) return false
  
    // only pick up pieces for the side to move
    if ((game.turn() === 'w' && piece.search(/^b/) !== -1) ||
        (game.turn() === 'b' && piece.search(/^w/) !== -1)) {
      return false
    }

    if ((orientation === 'white' && playerCol==='white' && piece.search(/^w/) === -1) ||
      (orientation === 'black' && playerCol==='black' &&  piece.search(/^b/) === -1)) {
    return false
  }
  }


// Setting the initial board
var config = {
    draggable: true,
    position: 'start',
    snapbackSpeed:25,
    onDragStart: onDragStart,
    orientation:Orientation,
    onDrop:handleMove
  }
  // console.log(Orientation)

board=new Chessboard('MyBoard',config);
game=new Chess();
updateStatus();


// Handle the move
function handleMove(source,target){
  const move=game.move({
      from:source,
      to:target,
      promotion:'q'
  })
// Giving the move to the server
  if(move===null) return 'snapback';
  else {
      socket.emit('move',move);
      updateStatus();
  }
}

// showing the move in client side
socket.on('move', (move)=>{
    game.move(move)
    board.position(game.fen())
    updateStatus();
    audio2.play();
})

const h3=document.createElement('h3')
    h3.innerHTML=`${room}`
    roomName.appendChild(h3);

// console.log(username,room,player)

socket.emit('Join',{username,room,player});

socket.on('message',(message)=>{
    // console.log(message);
    showMessage(message);
    chatMessages.scrollTop=chatMessages.scrollHeight;
})


// listen to chat messages when inputed
chatForm.addEventListener('submit',(e)=>{
    e.preventDefault();
    const msg=messageInput.value;
    // console.log(msg)
    if(msg.length>0)
      socket.emit('sendMessage',msg);
    messageInput.value='';
    messageInput.focus();
})


// show chat messages with ting sound
function showMessage(message){
    const div=document.createElement('div');
    
    div.classList.add('messageContainer');
    if(message.username===username){
        div.classList.add('justifyEnd');
    div.innerHTML=
    `<p class="sentText pr-10">You</p>
    <div class="messageBox backgroundBlue">
        <p class="messageText colorWhite">${message.text}</p>
    </div>`
    }
    else if(message.username==='admin'){
      div.classList.add('justifyCenter');
      if(message.text.includes('new game')){
        div.innerHTML=`<div class="messageBox backgroundGreen">
        <p class="messageText colorDark">${message.text}</p>
        </div>`
      }
      else if(message.text.includes('left')){
        div.innerHTML=`<div class="messageBox backgroundRed">
        <p class="messageText colorWhite">${message.text}</p>
        </div>`
      }
      else{
        div.innerHTML =`<div class="messageBox backgroundLight">
            <p class="messageText colorDark">${message.text}</p>
            </div>`
            // <p class="sentText pl-10">${message.username}</p>`
      }
        // div.innerHTML =`<div class="messageBox backgroundLight">
        //     <p class="messageText colorDark">${message.text}</p>
        //     </div>`
        //     // <p class="sentText pl-10">${message.username}</p>`
        if(!message.text.includes('move'))
          audio1.play();
    }
    else{
        div.classList.add('justifyStart');
        div.innerHTML =`<div class="messageBox backgroundLight">
            <p class="messageText colorDark">${message.text}</p>
            </div>
            <p class="sentText pl-10">${message.username}</p>`
        audio1.play();
    }    
    messagecontainer.appendChild(div);
}

// update game status
function updateStatus () {
    var stats = ''
  
    var moveColor = 'White'
    if (game.turn() === 'b') {
      moveColor = 'Black'
    }
  
    // checkmate?
    if (game.in_checkmate()) {
      stats = 'Game over, ' + moveColor + ' is in checkmate.'
      if(game.turn()==='b') whiteScore=whiteScore+1;
        else if(game.turn()==='w') blackScore++;
    }
  
    // draw?
    else if (game.in_draw()) {
      stats = 'Game over, drawn position'
    }
  
    // game still on
    else {
      stats = moveColor + ' to move'
  
      // check?
      if (game.in_check()) {
        stats += ', ' + moveColor + ' is in check'
      }
    }
    console.log(whiteScore,blackScore);
    whitescoreDis.innerHTML=`WHITE SCORE: ${whiteScore}`;
    blackscoreDis.innerHTML=`BLACK SCORE: ${blackScore}`;
    status.innerHTML =stats.toUpperCase();
}

gamereset.addEventListener('click',(e)=>{
    e.preventDefault();
    // socket.emit('gamereset');
    socket.emit('gamereset');
})

socket.on('gamereset',(playerColor)=>{
    gameReset(playerColor);
})


// reset function
function gameReset(playerColor){
    game.reset()
    board.position('start');
    updateStatus();
    if(playerColor==='white') blackScore++;
    else whiteScore++;
    whitescoreDis.innerHTML=`WHITE SCORE: ${whiteScore}`;
    blackscoreDis.innerHTML=`BLACK SCORE: ${blackScore}`;
    status.innerHTML =stats.toUpperCase();
}

board.resize()

