import Bullet from "./Bullet.js";
export default class BulletController {
  bullets = [];
  timeTilNextBulletAllowed = 0;

  constructor(canvas, maxBulletAtATime, bulletColor, soundEnabled) {
    this.canvas = canvas;
    this.maxBulletAtATime = maxBulletAtATime;
    this.bulletColor = bulletColor;
    this.soundEnabled = soundEnabled;

    this.shootSound = new Audio("sound/shoot.wav");
    this.shootSound.volume = 0.1; // this.shootSound.volume * 1/2
  }
  draw(ctx) {
    
    this.bullets = this.bullets.filter(
      (bullet) =>
        bullet.y + bullet.width> 0 && bullet.y <= this.canvas.height
    );
    // console.log(this.bullets.length);
    this.bullets.forEach((bullet) => bullet.draw(ctx));
    if (this.timeTilNextBulletAllowed > 0) {
      this.timeTilNextBulletAllowed--;
    }
  }

  collideWith(sprite) {
    const bulletThatHitSpriteIndex = this.bullets.findIndex((bullet) =>
      bullet.collideWith(sprite)
    );

    if (bulletThatHitSpriteIndex >= 0) {
      this.bullets.splice(bulletThatHitSpriteIndex, 1);
      return true;
    }
    return false;
  }
  shoot(x, y, velocity, timeTilNextBulletAllowed = 0) {
    if (
      this.timeTilNextBulletAllowed <= 0 && 
      this.bullets.length < this.maxBulletAtATime
    ) {
      const bullet = new Bullet(this.canvas, x, y, velocity, this.bulletColor);
      this.bullets.push(bullet);
      if (this.soundEnabled) {
        this.shootSound.currentTime = 0;
        this.shootSound.play();
      }
      this.timeTilNextBulletAllowed = timeTilNextBulletAllowed;
    }
  }
}
