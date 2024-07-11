import Enemy from "./Enemy.js";
import MovingDirection from "./MovingDirection.js";
//creating this file so we can controll the enemy movements
export default class EnemyController {
  enemyMap = [
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [2, 2, 2, 3, 3, 3, 3, 2, 2, 2],
    [2, 2, 2, 3, 3, 3, 3, 2, 2, 2],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
  ];
  enemyRows = [];
  enemyMapFirst = [[1, 1, 1, 1, 1, 1, 1, 1, 1, 1]];
  // properties
  currentDirection = MovingDirection.right;
  xVelocity = 0;
  yVelocity = 0;
  defaultXVelocity = 1.5;
  defaultYVelocity = 1.5;
  moveDownTimerDefault = 30;
  moveDownTimer = this.moveDownTimerDefault; 
  fireBulletTimerDefault = 100;
  fireBulletTimer = this.fireBulletTimerDefault;

  constructor(player, canvas, enemyBulletController, playerBulletController, level = 1) {
    this.player = player;
    this.canvas = canvas;
    this.enemyBulletController = enemyBulletController;
    this.playerBulletController = playerBulletController;

    this.enemyDeathSound = new Audio("sound/enemy-death.wav");
    this.enemyDeathSound.volume = 0.2;

    for (let i = 1; i < level; i++) {
      const randomEnemyRow = Array.from({ length: 10 }, () => Math.ceil(Math.random() * 3));
      this.enemyMapFirst.push(randomEnemyRow);
    }

    this.defaultXVelocity += level/10;

    this.createEnemies();
  }
  draw(ctx) {
    this.decrementMoveDownTimer();
    this.updateVelocityAndDirection();
    this.collisionDetection();
    this.drawEnemies(ctx);
    this.resetMoveDownTimer();
    this.fireBullet();
  }

  collisionDetection() {
    this.enemyRows.forEach((enemyRow) => {
      enemyRow.forEach((enemy, enemyIndex) => {
        if (this.playerBulletController.collideWith(enemy)) {
          this.enemyDeathSound.currentTime = 0;
          this.enemyDeathSound.play();
          enemyRow.splice(enemyIndex, 1);
          this.player.score++;
        }
      });
    });

    this.enemyRows = this.enemyRows.filter((enemyRow) => enemyRow.length > 0);
  }

  fireBullet() {
    this.fireBulletTimer--;
    if (this.fireBulletTimer <= 0) {
      //reset
      this.fireBulletTimer = this.fireBulletTimerDefault;
      const allEnemies = this.enemyRows.flat(); //ke betunim az length estefade konim
      const enemyIndex = Math.floor(Math.random() * allEnemies.length);
      const enemy = allEnemies[enemyIndex];
      this.enemyBulletController.shoot(enemy.x + enemy.width / 2, enemy.y, -3);
      // console.log(enemyIndex);
    }
  }

  resetMoveDownTimer() {
    if (this.moveDownTimer <= 0) {
      this.moveDownTimer = this.moveDownTimerDefault;
    }
  }
  decrementMoveDownTimer() {
    if (
      this.currentDirection === MovingDirection.downLeft ||
      this.currentDirection === MovingDirection.downRight
    ) {
      this.moveDownTimer--;
    }
  }
  updateVelocityAndDirection() {
    let addNewRow = false;
    let rightMostEnemy;
    let leftMostEnemy;
    for (const enemyRow of this.enemyRows) {
      if (this.currentDirection == MovingDirection.right) {
        this.xVelocity = this.defaultXVelocity; //1
        this.yVelocity = 0;

        rightMostEnemy = enemyRow[enemyRow.length - 1];
        if (rightMostEnemy.x + rightMostEnemy.width >= this.canvas.width) {
          addNewRow = true;
          this.currentDirection = MovingDirection.downLeft;
          break;
        }
      } else if (this.currentDirection === MovingDirection.downLeft) {
        // this.xVelocity = 0;
        // this.yVelocity = this.defaultYVelocity;
        if (this.moveDown(MovingDirection.left)) {
          break;
        }
      } else if (this.currentDirection === MovingDirection.left) {
        this.xVelocity = -this.defaultXVelocity;
        this.yVelocity = 0; //ta movarab harekat nakone
        leftMostEnemy = enemyRow[0];
        if (leftMostEnemy.x <= 0) {
          addNewRow = true;
          this.currentDirection = MovingDirection.downRight;
          break;
        }
      } else if (this.currentDirection === MovingDirection.downRight) {
        if (this.moveDown(MovingDirection.right)) {
          break;
        }
      }
    }
    
    if (addNewRow) {
      for (let i = this.enemyRows.length - 1; i > 1; i--) {
        if (this.enemyRows[i].length < 1) {
          this.enemyRows.pop();
        } else {
          break;
        }
      }

      let newEnemyRow = [];
      
      if (this.currentDirection === MovingDirection.downLeft) {
        for (let i = 0; i < this.enemyMapFirst[0].length; i++) {
          let enemy = new Enemy(
            rightMostEnemy.x - (i * 40),
            this.enemyRows[this.enemyRows.length - 1][0].y + 45,
            Math.floor(Math.random() * (3) + 1)
          );
          newEnemyRow.push(enemy);
        }
      } else if (this.currentDirection === MovingDirection.downRight) {
        for (let i = 0; i < this.enemyMapFirst[0].length; i++) {
          let enemy = new Enemy(
            leftMostEnemy.x + (i * 40),
            this.enemyRows[this.enemyRows.length - 1][0].y + 45,
            Math.floor(Math.random() * (3) + 1)
          );
          newEnemyRow.push(enemy);
        }
      }

      this.enemyRows.push(newEnemyRow);
    }
  }

  moveDown(newDirection) {
    this.xVelocity = 0;
    this.yVelocity = this.defaultYVelocity;
    if (this.moveDownTimer <= 0) {
      this.currentDirection = newDirection;
      return true;
    }
    return false;
  }

  drawEnemies(ctx) {
    this.enemyRows.flat().forEach((enemy) => {
      enemy.move(this.xVelocity, this.yVelocity);
      enemy.draw(ctx);
    });
  }

  createEnemies() {
    this.enemyMapFirst.forEach((row, rowIndex) => {
      this.enemyRows[rowIndex] = [];
      row.forEach((enemyNumber, enemyIndex) => {
        if (enemyNumber > 0) {
          this.enemyRows[rowIndex].push(
            new Enemy(enemyIndex * 40, rowIndex * 40, enemyNumber)
          );
        }
      });
    });
  }

  collideWith(sprite) {  
    return this.enemyRows.flat().some((enemy) => enemy.collideWith(sprite));
  }
}
