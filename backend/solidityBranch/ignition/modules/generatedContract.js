const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

module.exports = buildModule("SoccerGame", (m) => {
  const teamAPlayers = ["Player1", "Player2", "Player3"]; // Replace with actual player names
  const teamBPlayers = ["Player4", "Player5", "Player6"]; // Replace with actual player names

  const soccerGame = m.contract("SoccerGame", [teamAPlayers, teamBPlayers]);

  return { soccerGame };
});