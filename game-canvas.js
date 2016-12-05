var game = (function() {
  var gameState = {};
  var assetsPaths = [
    './assets/santa.svg',
    './assets/tree.svg',
    './assets/cloud.svg',
  ]

  var getRandomInt = function (min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  var awake = function() {
    var container = document.getElementById('game');
    container.addEventListener('mousedown', function(e) {
      e.preventDefault();
    });
    container.style.position = 'relative';
    container.style.width = '100%';
    container.style.height = '100%';
    container.style.overflow = 'hidden';
    var width = container.getBoundingClientRect().width;
    var height = container.getBoundingClientRect().height;

    var canvas = document.createElement('canvas');
    var ctx = canvas.getContext('2d');
    canvas.style.position = 'relative';
    canvas.style.zIndex = '2';
    canvas.style.height = height;
    canvas.style.width = width;
    canvas.height = height;
    canvas.width = width;
    container.appendChild(canvas);

    canvas.addEventListener('click', function() {
      gameState.velocity = -4.6;
    }, false);

    gameState = {
      pause: false,
      stop: false,
      score: 0,
      container: container,
      ctx: ctx,
      gravity: 0.25,
      velocity: 0,
      viewport: {
        width: width,
        height: height
      },
      dom: {
        outroScreen: null,
        introScreen: null,
        btnStart: null,
        controlsArea: null,
        btnTogglePause: null,
        score: null
      },
      time: {
        prevTime: 0,
        treeCounter: 0,
        cloudCounter: 0
      }
    }
    loadAssets();
    initKeyPress();
  }

  var createPlayer = function() {
    var playerTexture = gameState.getAsset('./assets/santa.svg');
    return {
      texture: playerTexture,
      position: {
        x: 0,
        y: 0
      },
      size: {
        width: 100,
        height: 100 / playerTexture.aspectRatio
      },
      collider: {
        top: 0,
        bottom: 1,
        left: 0,
        right: 1
      }
    }
  }
  var enemies = [];
  var createTree = function() {
    var treeTexture = gameState.getAsset('./assets/tree.svg');
    var random = getRandomInt(1, 4);
    var height = gameState.viewport.height * (0.3 + random * 0.05)
    var width = height * treeTexture.aspectRatio;
    return {
      texture: treeTexture,
      type: 'tree',
      position: {
        x: gameState.viewport.width,
        y: gameState.viewport.height - height + 40
      },
      size: {
        width: width,
        height: height
      },
      collider: {
        top: 0,
        bottom: 1,
        left: 0.5,
        right: 0.5
      }
    }
  }
  var createCloud = function() {
    var treeTexture = gameState.getAsset('./assets/cloud.svg');
    var random = getRandomInt(5, 14);
    var height = gameState.viewport.height * random / 100;
    var width = height * treeTexture.aspectRatio;
    random = getRandomInt(1, 4);
    var posY = gameState.viewport.height * random / 10 - height;
    return {
      texture: treeTexture,
      type: 'cloud',
      position: {
        x: gameState.viewport.width,
        y: posY
      },
      size: {
        width: width,
        height: height
      },
      collider: {
        top: 0,
        bottom: 0.8,
        left: 0.2,
        right: 0.2
      }
    }
  }
  var init = function() {
    initCss();
    initUI();
    initBackground();
    initSnow();
    gameState.player = createPlayer();
    start();
    pause();
    window.requestAnimationFrame(update);
  }

  var initCss = function() {
    var style = document.createElement('style');
    style.type = 'text/css';
    style.innerHTML = '';
    style.innerHTML += '@keyframes anim-stars {';
    style.innerHTML += '    from {background-position:0 0;}';
    style.innerHTML += '    to {background-position:-10000px 5000px;}';
    style.innerHTML += '}';
    style.innerHTML += '@-webkit-keyframes anim-stars {';
    style.innerHTML += '    from {background-position:0 0;}';
    style.innerHTML += '    to {background-position:-10000px 5000px;}';
    style.innerHTML += '}';
    style.innerHTML += '@-moz-keyframes anim-stars {';
    style.innerHTML += '    from {background-position:0 0;}';
    style.innerHTML += '    to {background-position:-10000px 5000px;}';
    style.innerHTML += '}';
    style.innerHTML += '@-ms-keyframes anim-stars {';
    style.innerHTML += '    from {background-position:0 0;}';
    style.innerHTML += '    to {background-position:-10000px 5000px;}';
    style.innerHTML += '}';
    style.innerHTML += '@keyframes anim-landscape {';
    style.innerHTML += '    from { background-position-x: 0; }';
    style.innerHTML += '    to { background-position-x: -10000px; }';
    style.innerHTML += '}';
    style.innerHTML += '@-webkit-keyframes anim-landscape {';
    style.innerHTML += '    from { background-position-x: 0; }';
    style.innerHTML += '    to { background-position-x: -10000px; }';
    style.innerHTML += '}';
    style.innerHTML += '@-moz-keyframes anim-landscape {';
    style.innerHTML += '    from { background-position-x: 0; }';
    style.innerHTML += '    to { background-position-x: -10000px; }';
    style.innerHTML += '}';
    style.innerHTML += '@-ms-keyframes anim-landscape {';
    style.innerHTML += '    from { background-position-x: 0; }';
    style.innerHTML += '    to { background-position-x: -10000px; }';
    style.innerHTML += '}';
    style.innerHTML += '.bg-stars {';
    style.innerHTML += '  position: absolute;';
    style.innerHTML += '  top: 0;';
    style.innerHTML += '  left: 0;';
    style.innerHTML += '  right: 0;';
    style.innerHTML += '  bottom: 0;';
    style.innerHTML += '  height: 100%;';
    style.innerHTML += '  width: 100%;';
    style.innerHTML += '  background: #16498b url("./assets/stars.png") repeat top center;';
    style.innerHTML += '  z-index: 0;';
    style.innerHTML += '}';
    style.innerHTML += '.bg-stars-fade {';
    style.innerHTML += '  position: absolute;';
    style.innerHTML += '  top: 0;';
    style.innerHTML += '  left: 0;';
    style.innerHTML += '  right: 0;';
    style.innerHTML += '  bottom: 0;';
    style.innerHTML += '  height: 100%;';
    style.innerHTML += '  width: 100%;';
    style.innerHTML += '  background: url("./assets/twinkling.png") repeat top center;';
    style.innerHTML += '  -moz-animation: anim-stars 200s linear infinite;';
    style.innerHTML += '  -ms-animation: anim-stars 200s linear infinite;';
    style.innerHTML += '  -o-animation: anim-stars 200s linear infinite;';
    style.innerHTML += '  -webkit-animation: anim-stars 200s linear infinite;';
    style.innerHTML += '  animation: anim-stars 200s linear infinite;';
    style.innerHTML += '}';
    style.innerHTML += '.bg-landscape {';
    style.innerHTML += '  position: absolute;';
    style.innerHTML += '  left: 0;';
    style.innerHTML += '  right: 0;';
    style.innerHTML += '  bottom: 0;';
    style.innerHTML += '  height: 256px;';
    style.innerHTML += '  width: 100%;';
    style.innerHTML += '  background: url("./assets/landscape.png") repeat bottom center;';
    style.innerHTML += '  -moz-animation: anim-landscape 200s linear infinite;';
    style.innerHTML += '  -ms-animation: anim-landscape 200s linear infinite;';
    style.innerHTML += '  -o-animation: anim-landscape 200s linear infinite;';
    style.innerHTML += '  -webkit-animation: anim-landscape 200s linear infinite;';
    style.innerHTML += '  animation: anim-landscape 200s linear infinite;';
    style.innerHTML += '}';
    style.innerHTML += '.paused {';
    style.innerHTML += '  -webkit-animation-play-state: paused;';
    style.innerHTML += '  animation-play-state: paused;';
    style.innerHTML += '}';
    style.innerHTML += '.game-ui-screen {';
    style.innerHTML += '  position: absolute;';
    style.innerHTML += '  z-index: 3;';
    style.innerHTML += '  top: 0;';
    style.innerHTML += '  left: 0;';
    style.innerHTML += '  bottom: 0;';
    style.innerHTML += '  right: 0;';
    style.innerHTML += '  margin: auto;';
    style.innerHTML += '  padding: 10px 10px 10px 10px;';
    style.innerHTML += '  border: 6px solid #eb5d50;';
    style.innerHTML += '  box-shadow: 0px 0px 0px 4px #ffffff;';
    style.innerHTML += '  width: 200px;';
    style.innerHTML += '  height: 100px;';
    style.innerHTML += '  background: #ffffff;';
    style.innerHTML += '  text-align: center;';
    style.innerHTML += '}';
    style.innerHTML += '.game-ui-text {';
    style.innerHTML += '  font-family: Times New Roman;';
    style.innerHTML += '  font-size: 10px;';
    style.innerHTML += '  line-height: 16px;';
    style.innerHTML += '  font-weight: 900;';
    style.innerHTML += '  text-align: center;';
    style.innerHTML += '  letter-spacing: 3px;';
    style.innerHTML += '  margin-top: 12px;';
    style.innerHTML += '  margin-bottom: 8px;';
    style.innerHTML += '}';
    style.innerHTML += '.game-ui-score {';
    style.innerHTML += '  font-family: Times New Roman;';
    style.innerHTML += '  font-size: 22px;';
    style.innerHTML += '  line-height: 22px;';
    style.innerHTML += '  font-weight: 900;';
    style.innerHTML += '  text-align: center;';
    style.innerHTML += '  letter-spacing: 3px;';
    style.innerHTML += '  margin-top: 0;';
    style.innerHTML += '  margin-bottom: 12px;';
    style.innerHTML += '}';
    style.innerHTML += '.game-ui-btn {';
    style.innerHTML += '  font-family: Times New Roman;';
    style.innerHTML += '  letterSpacing: 3px;';
    style.innerHTML += '  font-size: 16px;';
    style.innerHTML += '  font-weight: 900;';
    style.innerHTML += '  color: #eb5d50;';
    style.innerHTML += '  background: transparent;';
    style.innerHTML += '  border: none;';
    style.innerHTML += '  cursor: pointer;';
    style.innerHTML += '  text-shadow: 1px 1px 0px rgba(0, 0, 0, 0.5);';
    style.innerHTML += '}';
    style.innerHTML += '.controls {';
    style.innerHTML += '  position: absolute;';
    style.innerHTML += '  z-index: 3;';
    style.innerHTML += '  top: 15px;';
    style.innerHTML += '  right: 15px;';
    style.innerHTML += '}';
    style.innerHTML += '.controls-btn-pause {';
    style.innerHTML += '  font-family: Times New Roman;';
    style.innerHTML += '  letterSpacing: 3px;';
    style.innerHTML += '  font-size: 12px;';
    style.innerHTML += '  font-weight: 900;';
    style.innerHTML += '  margin: 0;';
    style.innerHTML += '  padding: 5px 10px 5px 10px;';
    style.innerHTML += '  color: #eb5d50;';
    style.innerHTML += '  background: #ffffff;';
    style.innerHTML += '  border: none;';
    style.innerHTML += '  cursor: pointer;';
    style.innerHTML += '  border: 3px solid #eb5d50;';
    style.innerHTML += '  box-shadow: 0px 0px 0px 2px #ffffff;';
    style.innerHTML += '}';
    style.innerHTML += '';
    document.getElementsByTagName('head')[0].appendChild(style);
  }

  var initUI = function() {
    var introScreen = document.createElement('div');
    introScreen.classList.add('game-ui-screen');
    gameState.container.appendChild(introScreen);
    gameState.dom.introScreen = introScreen;
    var hello = document.createElement('p');
    hello.classList.add('game-ui-text');
    hello.innerText = 'Klikając lewym przyciskiem myszy, pomóż Mikołajowi omijać chmury i drzewa :)';
    introScreen.appendChild(hello);
    var btnStart = document.createElement('button');
    btnStart.classList.add('game-ui-btn');
    btnStart.innerText = 'START';
    btnStart.addEventListener('click', play);
    introScreen.appendChild(btnStart);
    gameState.dom.btnStart = btnStart;

    var outroScreen = document.createElement('div');
    outroScreen.classList.add('game-ui-screen');
    gameState.container.appendChild(outroScreen);
    gameState.dom.outroScreen = outroScreen;
    var gratz = document.createElement('p');
    gratz.classList.add('game-ui-text');
    gratz.innerText = 'GRATZ! Twój wynik to:';
    outroScreen.appendChild(gratz);
    var score = document.createElement('p');
    score.classList.add('game-ui-score');
    score.innerText = '0';
    gameState.dom.score = score;
    outroScreen.appendChild(score);
    var btnRestart = document.createElement('button');
    btnRestart.classList.add('game-ui-btn');
    btnRestart.innerText = 'RESTART';
    btnRestart.addEventListener('click', start);
    outroScreen.appendChild(btnRestart);
    var controlsArea = document.createElement('div');
    controlsArea.classList.add('controls');
    gameState.container.appendChild(controlsArea);
    gameState.dom.controlsArea = controlsArea;
    var btnTogglePause = document.createElement('button');
    btnTogglePause.classList.add('controls-btn-pause');
    btnTogglePause.innerText = 'Pauza (P)';
    btnTogglePause.addEventListener('click', togglePause);
    btnTogglePause.setAttribute('type', 'button');
    controlsArea.appendChild(btnTogglePause);
    gameState.dom.btnTogglePause = btnTogglePause;
  }

  var initBackground = function() {
    var bgStars = document.createElement('div');
    bgStars.classList.add('bg-stars');
    gameState.container.appendChild(bgStars);
    var bgStarsFade = document.createElement('div');
    bgStarsFade.classList.add('bg-stars-fade');
    bgStars.appendChild(bgStarsFade);
    var bgLandscape = document.createElement('div');
    bgLandscape.classList.add('bg-landscape');
    bgStars.appendChild(bgLandscape);
  }

  var initSnow = function() {
    gameState.snow = {
      angle: 0,
      particles: []
    }
    for(var i = 0; i < 25; i++) {
      gameState.snow.particles.push({
        x: Math.random() * gameState.viewport.width,
        y: Math.random() * gameState.viewport.height,
        r: Math.random() * 4 + 1,
        d: Math.random() * 25
      })
    }
  }

  var update = function(time) {
    window.requestAnimationFrame(update);
    if (gameState.pause) {
      gameState.time.prevTime = time;
      return;
    }
    var ctx = gameState.ctx;
    deltaTime = (time - gameState.time.prevTime) / 1000;
    gameState.score += deltaTime;
    gameState.time.treeCounter += deltaTime;
    gameState.time.cloudCounter += deltaTime;
    if (gameState.time.cloudCounter >= 1) {
    }
    if (gameState.time.treeCounter >= 1.5) {
      gameState.time.cloudCounter = 0;
      gameState.time.treeCounter = 0;
      enemies.push(createCloud());
      enemies.push(createTree());
    }
    gameState.time.prevTime = time;
    gameState.velocity += gameState.gravity;
    gameState.player.position.y = gameState.player.position.y + gameState.velocity;

    if (gameState.player.position.y + gameState.player.size.height >= gameState.viewport.height || gameState.player.position.y < -10) {
      stop();
    }

    ctx.clearRect(0,0, gameState.viewport.width, gameState.viewport.height);
    ctx.beginPath()
    ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
    gameState.snow.angle += 0.01;
    for(var i = 0; i < gameState.snow.particles.length; i++) {
      var p = gameState.snow.particles[i];
      p.y += Math.cos(gameState.snow.angle + p.d) + 1 + p.r / 2;
      p.x += Math.sin(gameState.snow.angle) * 2;
      if (p.x > gameState.viewport.width + 5 || p.x < -5 || p.y > gameState.viewport.height) {
        if (i%3 > 0) {
          gameState.snow.particles[i] = {x: Math.random() * gameState.viewport.width, y: -10, r: p.r, d: p.d};
        } else {
          if(Math.sin(gameState.snow.angle) > 0) {
            gameState.snow.particles[i] = {x: -5, y: Math.random() * gameState.viewport.height, r: p.r, d: p.d};
          } else {
            gameState.snow.particles[i] = {x: gameState.viewport.width + 5, y: Math.random() * gameState.viewport.height, r: p.r, d: p.d};
          }
        }
      }
      ctx.moveTo(p.x, p.y);
      ctx.arc(p.x, p.y, p.r, 0, Math.PI*2, true);
    }
    ctx.closePath();
    ctx.fill();

    ctx.drawImage(
      gameState.player.texture.img,
      gameState.player.position.x, gameState.player.position.y,
      gameState.player.size.width, gameState.player.size.height
    );

    enemies.map( function(enemy) {
      if (isCollision(gameState.player, enemy)) {
        stop();
      }
      if (enemy.type == 'tree') {
        enemy.position.x = enemy.position.x - deltaTime * 150;
      } else {
        enemy.position.x = enemy.position.x - deltaTime * 175;
      }
      ctx.drawImage(
        enemy.texture.img,
        enemy.position.x, enemy.position.y,
        enemy.size.width, enemy.size.height
      );
    })
    enemies = enemies.filter( function(enemy) {
      return enemy.position.x > enemy.size.width * (-1)
    });
  }

  var loadAssets = function() {
    gameState.assets = [];
    gameState.getAsset = function(path) {
      var result = gameState.assets.filter(function(asset) {
        return (asset.path === path);
      })
      if (result.length === 0) {
        return;
      }
      return result[0];
    }
    assetsPaths.map(function(path) {
      var img = document.createElement('img');
      img.style.display = 'none';
      gameState.container.appendChild(img);
      img.src = path;
      img.onload = function(){
        gameState.assets.push({
          path: path,
          img: img,
          width: img.naturalWidth,
          height: img.naturalHeight,
          aspectRatio: img.naturalWidth / img.naturalHeight
        });
        if (gameState.assets.length == assetsPaths.length) {
          init();
        }
      }
    });
  }

  var isCollision = function(elem1, elem2) {
    var testLeft = elem1.position.x <= elem2.position.x + elem2.size.width * elem2.collider.right + elem1.size.width * elem1.collider.left;
    var testRight = elem1.position.x >= elem2.position.x - elem1.size.width * elem1.collider.right + elem2.size.width * elem2.collider.left;
    var testTop = elem1.position.y <= elem2.position.y + elem2.size.height * elem2.collider.bottom - elem1.size.height * elem1.collider.top
    var testBottom = elem1.position.y >= elem2.position.y - elem1.size.height * elem1.collider.bottom + elem2.size.height * elem2.collider.top;
    return testTop && testLeft && testBottom && testRight;
  }

  var initKeyPress = function () {
    document.onkeypress = function (e) {
      e = e || window.event;

      if (e.charCode === 112) { // P key
        togglePause();
        e.preventDefault();
      }
    };
  }

  awake();

  var togglePause = function () {
    if (gameState.pause === true) {
      play();
    } else {
      pause();
    }
  }

  var start = function() {
    enemies = []
    gameState.player.position.x = gameState.viewport.width / 3;
    gameState.player.position.y = gameState.viewport.height / 2.5;
    gameState.velocity = 0;
    gameState.score = 0;
    gameState.time.cloudCounter = 0;
    gameState.time.treeCounter = 0;
    gameState.dom.outroScreen.style.display = 'none';
    gameState.stop = false;
    gameState.pause = false;
    document.getElementsByClassName('bg-landscape')[0].classList.remove('paused');
  }
  var play = function() {
    if (gameState.pause === false || gameState.stop === true) {
      return;
    }
    gameState.dom.introScreen.style.display = 'none';
    gameState.dom.btnStart.innerText = 'KONTYNUUJ';
    gameState.pause = false;
    gameState.dom.btnTogglePause.innerText = 'Pauza (P)';
    document.getElementsByClassName('bg-landscape')[0].classList.remove('paused') ;
  }
  var pause = function() {
    if (gameState.pause === true) {
      return;
    }
    gameState.dom.introScreen.style.display = 'block';
    gameState.pause = true;
    gameState.dom.btnTogglePause.innerText = 'Graj (P)';
    document.getElementsByClassName('bg-landscape')[0].classList.add('paused');
  }

  var stop = function() {
    gameState.dom.outroScreen.style.display = 'block';
    gameState.dom.score.innerText = parseInt(gameState.score);
    gameState.stop = true;
    gameState.pause = true;
    document.getElementsByClassName('bg-landscape')[0].classList.add('paused');
  }

  return {
    play: play,
    pause: pause
  }
}());
