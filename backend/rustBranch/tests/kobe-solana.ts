import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { SoccerGame } from "../target/types/soccer_game";
import { expect } from "chai";

describe("soccer-game", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.SoccerGame as Program<SoccerGame>;

  let gamePda: anchor.web3.PublicKey;
  let managerKeypair: anchor.web3.Keypair;

  before(async () => {
    managerKeypair = anchor.web3.Keypair.generate();
    [gamePda] = await anchor.web3.PublicKey.findProgramAddress(
      [Buffer.from("game"), managerKeypair.publicKey.toBuffer()],
      program.programId
    );
  });

  it("Initialize game", async () => {
    const tx = await program.methods
      .initialize("Team A", "Team B")
      .accounts({
        game: gamePda,
        manager: managerKeypair.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([managerKeypair])
      .rpc();

    const gameAccount = await program.account.game.fetch(gamePda);
    expect(gameAccount.team1.name).to.equal("Team A");
    expect(gameAccount.team2.name).to.equal("Team B");
    expect(gameAccount.state).to.deep.equal({ pending: {} });
    expect(gameAccount.manager.toString()).to.equal(managerKeypair.publicKey.toString());
  });

  it("Start game", async () => {
    const tx = await program.methods
      .startGame()
      .accounts({
        game: gamePda,
        manager: managerKeypair.publicKey,
      })
      .signers([managerKeypair])
      .rpc();

    const gameAccount = await program.account.game.fetch(gamePda);
    expect(gameAccount.state).to.deep.equal({ inProgress: {} });
  });

  it("Score goal for team 1", async () => {
    const tx = await program.methods
      .scoreGoal(1)
      .accounts({
        game: gamePda,
        manager: managerKeypair.publicKey,
      })
      .signers([managerKeypair])
      .rpc();

    const gameAccount = await program.account.game.fetch(gamePda);
    expect(gameAccount.team1.score).to.equal(1);
  });

  it("Score goal for team 2", async () => {
    const tx = await program.methods
      .scoreGoal(2)
      .accounts({
        game: gamePda,
        manager: managerKeypair.publicKey,
      })
      .signers([managerKeypair])
      .rpc();

    const gameAccount = await program.account.game.fetch(gamePda);
    expect(gameAccount.team2.score).to.equal(1);
  });

  it("End game", async () => {
    const tx = await program.methods
      .endGame()
      .accounts({
        game: gamePda,
        manager: managerKeypair.publicKey,
      })
      .signers([managerKeypair])
      .rpc();

    const gameAccount = await program.account.game.fetch(gamePda);
    expect(gameAccount.state).to.deep.equal({ finished: {} });
  });

  it("Fail to start an already started game", async () => {
    try {
      await program.methods
        .startGame()
        .accounts({
          game: gamePda,
          manager: managerKeypair.publicKey,
        })
        .signers([managerKeypair])
        .rpc();
      expect.fail("Should have thrown an error");
    } catch (error) {
      expect(error.error.errorMessage).to.equal("Game has already started");
    }
  });

  it("Fail to score when game is not in progress", async () => {
    try {
      await program.methods
        .scoreGoal(1)
        .accounts({
          game: gamePda,
          manager: managerKeypair.publicKey,
        })
        .signers([managerKeypair])
        .rpc();
      expect.fail("Should have thrown an error");
    } catch (error) {
      expect(error.error.errorMessage).to.equal("Game is not in progress");
    }
  });

  it("Fail to score for an invalid team", async () => {
    // First, initialize and start a new game
    const newGamePda = anchor.web3.Keypair.generate().publicKey;
    await program.methods
      .initialize("New Team A", "New Team B")
      .accounts({
        game: newGamePda,
        manager: managerKeypair.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([managerKeypair])
      .rpc();

    await program.methods
      .startGame()
      .accounts({
        game: newGamePda,
        manager: managerKeypair.publicKey,
      })
      .signers([managerKeypair])
      .rpc();

    try {
      await program.methods
        .scoreGoal(3)
        .accounts({
          game: newGamePda,
          manager: managerKeypair.publicKey,
        })
        .signers([managerKeypair])
        .rpc();
      expect.fail("Should have thrown an error");
    } catch (error) {
      expect(error.error.errorMessage).to.equal("Invalid team");
    }
  });
});