let time = 5;
const IOsock = io('http://localhost:3004');

$(document).ready(function () {
  $('#newGame').modal(
    { 'dismissible': false });
  $('#newGame').modal('open');
  $("#newGameBtn").focus()
  updateScore()
});
let pause = true;
const canvas = document.querySelector('.tetris');
const context = canvas.getContext('2d');
const nextCanvas = document.querySelector('.next');
const nextContext = nextCanvas.getContext('2d');
context.scale(20, 20);
nextContext.scale(30, 30);
const arena = createMatrix(12, 20);
const nextArena = createMatrix(6, 6);

const player = {
  pos: { x: 0, y: 0 },
  matrix: null,
  score: 0,
  level: 1,
  dropInterval: 600,
  DROP_SLOW: 100,
  next: null,
};

let dropCounter = 0;
let DROP_FAST = 50;

function arenaSweep() {
  let rowCount = 1;
  outer: for (y = arena.length - 1; y > 0; y--) {
    for (x = 0; x < arena[y].length; x++) {
      if (arena[y][x] === 0) {
        continue outer;
      }
    }
    const row = arena.splice(y, 1)[0].fill(0);
    arena.unshift(row);
    y++;

    player.score += rowCount * 100;
    rowCount *= 2;
    let scoreStr = player.score.toString();
    if (scoreStr.length > 3) {
      let num = Number(scoreStr.slice(0, scoreStr.length - 3));
      player.level = num + 1;
      player.dropInterval = 1000 - (num * 50);
      player.DROP_SLOW = 1000 - (num * 50);
    }
  }
}

function collide(arena, player) {
  const [m, o] = [player.matrix, player.pos];
  for (y = 0; y < m.length; y++) {
    for (x = 0; x < m[y].length; x++) {
      if (m[y][x] !== 0 && (arena[y + o.y] && arena[y + o.y][x + o.x]) !== 0) {
        return true;
      }
    }
  }
  return false;
}

function createMatrix(w, h) {
  const matrix = [];
  while (h--) {
    matrix.push(new Array(w).fill(0));
  }
  return matrix;
}

function createPiece(type) {
  currentPose = type
  if (type === 'I') {
    return [
      [0, 1, 0, 0],
      [0, 1, 0, 0],
      [0, 1, 0, 0],
      [0, 1, 0, 0]
    ];
  } else if (type === 'J') {
    return [
      [0, 2, 0],
      [0, 2, 0],
      [2, 2, 0]
    ];
  } else if (type === 'L') {
    return [
      [0, 3, 0],
      [0, 3, 0],
      [0, 3, 3]
    ];
  } else if (type === 'O') {
    return [
      [4, 4],
      [4, 4]
    ];
  } else if (type === 'S') {
    return [
      [0, 5, 5],
      [5, 5, 0],
      [0, 0, 0]
    ];
  } else if (type === 'T') {
    return [
      [0, 0, 0],
      [6, 6, 6],
      [0, 6, 0]
    ];
  } else if (type === 'Z') {
    return [
      [7, 7, 0],
      [0, 7, 7],
      [0, 0, 0]
    ];
  }
}

function drawNext() {
  nextContext.fillStyle = '#001e26';
  nextContext.fillRect(0, 0, nextCanvas.width, nextCanvas.height);
  drawMatrix(nextArena, { x: 0, y: 0 }, nextContext);
  drawMatrix(player.next, { x: 1, y: 1 }, nextContext);
}

function draw() {
  context.fillStyle = '#001e26';
  context.fillRect(0, 0, canvas.width, canvas.height);
  drawMatrix(arena, { x: 0, y: 0 }, context);
  drawMatrix(player.matrix, player.pos, context);
}

function drawMatrix(mat, offset, cont) {
  mat.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value !== 0) {
        cont.fillStyle = colors[value];
        cont.fillRect(x + offset.x, y + offset.y, 1, 1);
      }
    });
  });
}

function merge(arena, player) {
  player.matrix.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value !== 0) {
        arena[y + player.pos.y][x + player.pos.x] = value;
      }
    });
  });
}

function playerDrop() {
  player.pos.y++;
  if (collide(arena, player)) {
    player.pos.y--;
    merge(arena, player);
    playerReset();
    arenaSweep();
    updateScore();
  }
  dropCounter = 0;
}

function playerMove(dir) {
  player.pos.x += dir;
  if (collide(arena, player)) {
    player.pos.x -= dir;
  }
}

function playerReset() {
  //const pieces = 'IJLOSTZ';
  const pieces = 'ILOST';
  if (player.next === null) {
    player.matrix = createPiece(pieces[pieces.length * Math.random() | 0]);
    player.next = createPiece(pieces[pieces.length * Math.random() | 0]);
  } else {
    player.matrix = player.next;
    player.next = createPiece(pieces[pieces.length * Math.random() | 0]);
  }
  drawNext();
  player.pos.y = 0;
  player.pos.x = (arena[0].length / 2 | 0) - (player.matrix[0].length / 2 | 0);
  if (collide(arena, player)) {
    pauseGame();
    document.removeEventListener('keydown', keyListener);
    document.removeEventListener('keyup', keyListener);
  }
}

function clearPlayer() {
  player.dropInterval = 1000;
  player.DROP_SLOW = 1000;
  player.score = 0;
  player.level = 1;
  arena.forEach(row => row.fill(0));
  updateScore();
}

function playerRotate(dir) {
  const pos = player.pos.x
  let offset = 1;
  rotate(player.matrix, dir);

  while (collide(arena, player)) {
    player.pos.x += offset;
    offset = -(offset + (offset > 0 ? 1 : -1));
    if (offset > player.matrix[0].length) {
      rotate(player.matrix, -dir);
      player.pos.x = pos;
      return;
    }
  }
}

function rotate(matrix, dir) {
  for (y = 0; y < matrix.length; y++) {
    for (x = 0; x < y; x++) {
      [matrix[x][y], matrix[y][x],] = [matrix[y][x], matrix[x][y],];
    }
  }
  if (dir > 0) {
    matrix.forEach(row => row.reverse());
  } else {
    matrix.reverse();
  }
}

let lastTime = 0;
function update(time = 0) {
  $('#pause').off();
  if (!pause) {
    const deltaTime = time - lastTime;
    lastTime = time;
    dropCounter += deltaTime;
    if (dropCounter > player.dropInterval) {
      playerDrop();
    }
    draw();
    requestAnimationFrame(update);
  } else {
    draw();
  }
}

function updateScore() {
  document.querySelector('.score').innerHTML = `Score: ${player.score}`;
  document.querySelector('.level').innerHTML = `Level: ${player.level}`;
}

const colors = [
  null,
  '#EDB0FF',//I
  '#FF406F',//J
  '#2A5FFF',//L
  '#8C79E0',//O
  '#CEFF00',//S 
  '#00F29B',//T
  '#F15A24'//Z
];

function keyListener(e) {
  if (e.type === 'keydown') {
    if (e.keyCode === 37) {
      playerMove(-1)
    } else if (e.keyCode === 39) {
      playerMove(1);
    } else if (e.keyCode === 81) {
      playerRotate(-1);
    } else if (e.keyCode === 87 || e.keyCode === 38) {
      playerRotate(1);
    } else if (e.keyCode === 27) {
      pauseGame();
    }
  }

  // down down down
  if (e.keyCode === 40) {
    if (e.type === 'keydown') {
      if (player.dropInterval !== DROP_FAST) {
        playerDrop();
        player.dropInterval = DROP_FAST;
      }
    } else {
      player.dropInterval = player.DROP_SLOW;
    }
  }
};

function pauseGame() {
  if (pause === true) {
    pause = false;
    $('#pause').modal('close');
    if (gotimer) {
      clearInterval(gotimer)
      gotimer = null
    }
    update()
  } else {
    timer(time, document.getElementById("timer"))
    $('#pause').modal(
      { 'dismissible': false });
    $('#pause').modal('open');
    if (collide(arena, player)) {
      pause = true;
      $('#pause').modal('close');
      if (gotimer) {
        clearInterval(gotimer)
        gotimer = null
      }
      //if (player.score > 0) {
        $('#gameOver').modal({
          'dismissible': false,
          "onOpenEnd": function () { $('#name').focus(); }
        });
        $('#gameOver').modal('open');
        $('.yourScore').html(`<p>Your Score: ${player.score}`)
      /* } else {
        $('#newGame').modal({ 'dismissible': false });
        $('#newGame').modal('open');
      } */
    } else {
      pause = true;
    }
  }
}


let currentPose = null
function newGame() {
  clearPlayer();
  pause = false;
  playerReset();
  update();
  document.addEventListener('keydown', keyListener);
  document.addEventListener('keyup', keyListener);

  /*** commands

  if pose if wrong
  pauseGame();

  ***********/

  IOsock.on('poseCmd', (data) => {
    //console.log('pose', data)
    if (data === currentPose && pause) {
      pauseGame();
    } else if (data != currentPose && !pause) {
      pauseGame();
    }
  })


  /*** commands

  playerMove(-1)
  playerMove(1);
  playerRotate(-1);
  playerRotate(1);

  ***********/
  IOsock.on('audioCmd', (data) => {
    //console.log('audio', data, data == 'Left')
    switch(data) {
      case 'Left':
        playerMove(-1)
      break;
      case 'Right':
        playerMove(1)
      break;
      case 'Turn':
        playerRotate(-1)
      break;
    }
  })
}

let gotimer = null
function timer(time, display) {
  gotimer = setInterval(() => {
    display.innerHTML = time
    time--
    if (time < 0) {
      time = 0;
      $('#gameOver').modal({
        'dismissible': false,
        "onOpenEnd": function () { $('#name').focus(); }
      });
      $('#gameOver').modal('open');
      $('#pause').modal('close');
      clearInterval(gotimer)
      gotimer = null
    }
  }, 1000);
}

update();
