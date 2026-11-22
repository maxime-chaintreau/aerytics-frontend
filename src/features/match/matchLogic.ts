import type { MatchDetail, MatchParticipant, MatchTeam, TeamSide } from "@/types/match";

/** the player whose page this is */
export function focusedParticipant(match: MatchDetail): MatchParticipant {
  const participant = match.participants.find(({ puuid }) => puuid === match.focus.puuid);
  if (!participant) throw new Error(`Player ${match.focus.puuid} is not in match ${match.matchId}`);
  return participant;
}

/** same role, other team */
export function laneOpponent(match: MatchDetail, participant: MatchParticipant): MatchParticipant | undefined {
  return match.participants.find(({ role, side }) => role === participant.role && side !== participant.side);
}

export function teamOf(match: MatchDetail, side: TeamSide): { team: MatchTeam; players: MatchParticipant[] } {
  const team = match.teams.find((candidate) => candidate.side === side);
  if (!team) throw new Error(`No ${side} team in match ${match.matchId}`);
  return { team, players: match.participants.filter((participant) => participant.side === side) };
}
