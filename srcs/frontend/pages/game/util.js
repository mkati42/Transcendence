export function initializeSingleEliminationBracket( tournament ) {

  const numPlayers = tournament.players.length;

  const round1 = [];
  const shuffled = [...tournament.players].sort( () => Math.random() - 0.5 );

  for ( let i = 0; i < shuffled.length; i += 2 ) {
    round1.push( {
      player1: shuffled[i],
      player2: shuffled[i + 1] || null,
      winner: null
    } );
  }

  const totalRounds = Math.ceil( Math.log2( numPlayers ) );

  const rounds = [round1];
  for ( let r = 1; r < totalRounds; r++ ) {
    const prevRoundSize = rounds[r - 1].length;
    const nextRoundSize = Math.ceil( prevRoundSize / 2 );
    const nextRound = [];
    for ( let m = 0; m < nextRoundSize; m++ ) {
      nextRound.push( { player1: null, player2: null, winner: null } );
    }
    rounds.push( nextRound );
  }

  tournament.rounds = rounds;
  tournament.currentRoundIndex = 0;
  tournament.currentMatchIndex = 0;
}
