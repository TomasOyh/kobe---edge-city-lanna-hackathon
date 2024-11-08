use anchor_lang::prelude::*;

declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");

#[program]
pub mod soccer_game {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>, team1_name: String, team2_name: String) -> Result<()> {
        let game = &mut ctx.accounts.game;
        game.team1 = Team { name: team1_name, score: 0 };
        game.team2 = Team { name: team2_name, score: 0 };
        game.state = GameState::Pending;
        game.manager = *ctx.accounts.manager.key;
        Ok(())
    }

    pub fn start_game(ctx: Context<ManageGame>) -> Result<()> {
        let game = &mut ctx.accounts.game;
        require!(game.state == GameState::Pending, ErrorCode::GameAlreadyStarted);
        game.state = GameState::InProgress;
        emit!(GameStateChanged { new_state: GameState::InProgress });
        Ok(())
    }

    pub fn score_goal(ctx: Context<ManageGame>, team: u8) -> Result<()> {
        let game = &mut ctx.accounts.game;
        require!(game.state == GameState::InProgress, ErrorCode::GameNotInProgress);
        match team {
            1 => game.team1.score += 1,
            2 => game.team2.score += 1,
            _ => return Err(ErrorCode::InvalidTeam.into()),
        }
        emit!(GoalScored { team, new_score: if team == 1 { game.team1.score } else { game.team2.score } });
        Ok(())
    }

    pub fn end_game(ctx: Context<ManageGame>) -> Result<()> {
        let game = &mut ctx.accounts.game;
        require!(game.state == GameState::InProgress, ErrorCode::GameNotInProgress);
        game.state = GameState::Finished;
        emit!(GameStateChanged { new_state: GameState::Finished });
        Ok(())
    }
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq)]
pub enum GameState {
    Pending,
    InProgress,
    Finished,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct Team {
    pub name: String,
    pub score: u8,
}

#[account]
pub struct Game {
    pub team1: Team,
    pub team2: Team,
    pub state: GameState,
    pub manager: Pubkey,
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(init, payer = manager, space = 8 + 64 + 64 + 1 + 32)]
    pub game: Account<'info, Game>,
    #[account(mut)]
    pub manager: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct ManageGame<'info> {
    #[account(mut, has_one = manager)]
    pub game: Account<'info, Game>,
    pub manager: Signer<'info>,
}

#[error_code]
pub enum ErrorCode {
    #[msg("Game has already started")]
    GameAlreadyStarted,
    #[msg("Game is not in progress")]
    GameNotInProgress,
    #[msg("Invalid team")]
    InvalidTeam,
}

#[event]
pub struct GameStateChanged {
    pub new_state: GameState,
}

#[event]
pub struct GoalScored {
    pub team: u8,
    pub new_score: u8,
}