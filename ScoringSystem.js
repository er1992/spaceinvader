export default class ScoringSystem {
  //
  constructor() {
    this.rankedPlayers = JSON.parse(localStorage.getItem("users")) || [];
  }

  addPlayer(player) {
    //creating new user

    this.rankedPlayers.push(player);
    console.log(this.rankedPlayers);

    this.rankedPlayers.sort((a, b) => b.score - a.score);
    console.log(this.rankedPlayers);
  }
  updatePlayer(player) {
    let playerIndex = this.rankedPlayers.findIndex(
      (rankedPlayer) => rankedPlayer.username === player.username
    );
    this.rankedPlayers[playerIndex] = player;
  }
  findPlayer(username) {
    return this.rankedPlayers.find(
      (rankedPlayer) => rankedPlayer.userName === username
    );
  }
  save() {
    localStorage.setItem("users", JSON.stringify(this.rankedPlayers));
  }
  getPlayers() {
    return this.rankedPlayers;
  }
}
