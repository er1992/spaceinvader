import EnemyController from "./EnemyController.js";
import Player from "./Player.js";
import BulletController from "./BulletController.js";
import RankedPlayer from "./RankedPlayers.js";
import ScoringSystem from "./ScoringSystem.js";

const canvas = document.getElementById("game");

const ctx = canvas.getContext("2d");
canvas.width = 600;
canvas.height = 600;
const background = new Image();
background.src = "images/5YYYFi.png";
//
let intervalId;
const playerBulletController = new BulletController(canvas, 10, "red", true);
const enemyBulletController = new BulletController(canvas, 4, "white", false);
const player = new Player(canvas, 3, playerBulletController);
const scoringSystem = new ScoringSystem();
let rankedPlayer;

//instance of enemyController
let enemyController;
// velocity
let isGameOver = false;
let didWin = false;

//login and signup elements
const loginScreen = document.getElementById("login-screen");
const signupScreen = document.getElementById("signup-screen");
const gameScreen = document.getElementById("game-screen");
const usernameInput = document.getElementById("username");
const passwordInput = document.getElementById("password");
const newUsernameInput = document.getElementById("new-username");
const newPasswordInput = document.getElementById("new-password");
const startGameButton = document.getElementById("Start-game-button");
const createAccountButton = document.getElementById("create-account");
const showSignupLink = document.getElementById("show-signup");
const showLoginLink = document.getElementById("show-login");

// let users = JSON.parse(localStorage.getItem("users")) || [];
loginScreen.classList.remove("hidden");
//start game button activation
startGameButton.addEventListener("click", () => {
  const username = usernameInput.value;
  const password = passwordInput.value;

  console.log(scoringSystem.getPlayers())
  const user = scoringSystem.findPlayer(username);
  if (user && user.password === password) {
    loginScreen.classList.add("hidden");
    gameScreen.classList.remove("hidden");
    rankedPlayer = user;
    enemyController = new EnemyController(
      player,
      canvas,
      enemyBulletController,
      playerBulletController,
      Math.floor(rankedPlayer.score / 10) // Number of enemies in a row
    );
    startGame();
  } else {
    const signup = confirm(
      "Invalid username or password. Sign up if you don't have an Account "
    );
    if (signup) {
      loginScreen.classList.add("hidden");
      signupScreen.classList.remove("hidden");
    } else {
      usernameInput.value = "";
      passwordInput.value = "";
      usernameInput.focus();
    }
  }
});

createAccountButton.addEventListener("click", () => {
  const newUsername = newUsernameInput.value;
  const newPassword = newPasswordInput.value;

  if (scoringSystem.findPlayer(newUsername)) {
    alert("Username already exists. please choose a different username.");
    return;
  }

  // creating new user
  rankedPlayer = new RankedPlayer(newUsername, newPassword, 0);
  scoringSystem.addPlayer(rankedPlayer);
  console.log(scoringSystem.getPlayers())
  scoringSystem.save();

  const loginTitle = document.getElementById("login-title");
  loginTitle.innerHTML =
    'Account Successfully Created\n Click "Start Game" button now';
  signupScreen.classList.add("hidden");
  loginScreen.classList.remove("hidden");
  usernameInput.value = newUsername;
  passwordInput.value = newPassword;
});

showSignupLink.addEventListener("click", () => {
  loginScreen.classList.add("hidden");
  signupScreen.classList.remove("hidden");
});

showLoginLink.addEventListener("click", () => {
  signupScreen.classList.add("hidden");
  loginScreen.classList.remove("hidden");
});
//game loop

function startGame() {
  function game() {
    checkGameOver();
    //drawing the background image
    ctx.drawImage(background, 0, 0, canvas.width, canvas.height);
    displayGameOver();
    if (!isGameOver) {
      enemyController.draw(ctx);
      player.draw(ctx);
      playerBulletController.draw(ctx);
      enemyBulletController.draw(ctx);
    }
  }
  function displayGameOver() {
    if (isGameOver) {
      // scoring and ranked implimentation
      if (player.score > rankedPlayer.score) {
        rankedPlayer.score = player.score;
        scoringSystem.updatePlayer(rankedPlayer);
        scoringSystem.save();
      }
      // display the ranked players
      ctx.fillStyle = "white";
      ctx.font = "70px Arial";
      scoringSystem.getPlayers().forEach((player, index) => {
        ctx.fillText(
          `${index + 1}. ${player.userName}: ${player.score}`,
          canvas.width / 4,
          canvas.height / 2 + (index + 1) * 50
        );
      });

      let text = didWin ? "You Won" : "Game Over";
      let textOffset = didWin ? 3.5 : 5;

      ctx.fillStyle = "white";
      ctx.font = "70px Arial";
      ctx.fillText(text, canvas.width / textOffset, canvas.height / 2);
    }
  }
  function checkGameOver() {
    if (enemyBulletController.collideWith(player)) {
      isGameOver = true;
    }
    if (enemyController.collideWith(player)) {
      isGameOver = true;
    }
    if (enemyController.enemyRows.length === 0) {
      didWin = true;
      isGameOver = true;
    }
    if (isGameOver) {
      clearInterval(intervalId);
      return;
    }
  }
  intervalId = setInterval(game, 1000 / 60);
}
