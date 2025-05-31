from dashboard.models import GameData
from users.models import CustomUser


from dashboard.mock_data import mock_data

def calculate_winrate():
    players = mock_data["players"]
    games = mock_data["games"]

    winrate_data = []

    for player in players:
        username = player["username"]
        wins = player["wins"]
        games_played = player["games_played"]
        winrate = (wins / games_played) * 100 if games_played > 0 else 0

        player_games = [game for game in games if username in [game["player1"], game["player2"]]]

        winrate_data.append({
            "username": username,
            "winrate": round(winrate, 2),
            "games_participated": len(player_games),
        })

    return winrate_data


def updateUsersAfterSave(game_data: GameData):
    player1 = CustomUser.objects.get(username=game_data.player1_name)
    player2 = CustomUser.objects.get(username=game_data.player2_name)
    if game_data.player1_goals > game_data.player2_goals:
        winner = player1
    elif game_data.player1_goals < game_data.player2_goals:
        winner = player2

    if game_data.game_type == "casual":
        if winner == player1:
            player1.total_wins += 1
            player1.casual_rating += 10
            player2.casual_rating -= 10
            player1.win_streak += 1
            player1.lose_streak = 0
            player2.lose_streak += 1
            player2.win_streak = 0
        else:
            player2.total_wins += 1
            player2.casual_rating += 10
            player1.casual_rating -= 10
            player2.win_streak += 1
            player2.lose_streak = 0
            player1.lose_streak += 1
            player1.win_streak = 0
        player1.total_games += 1
        player2.total_games += 1
        player1.goals_scored += game_data.player1_goals
        player1.goals_conceded += game_data.player2_goals
        player2.goals_scored += game_data.player2_goals
        player2.goals_conceded += game_data.player1_goals

    elif game_data.game_type == "tournament":
        if winner == player1:
            player1.tournament_wins += 1
            player1.tournament_rating += 10
            player2.tournament_rating -= 10
            player1.win_streak += 1
            player1.lose_streak = 0
            player2.lose_streak += 1
            player2.win_streak = 0
        else:
            player2.tournament_wins += 1
            player2.tournament_rating += 10
            player1.tournament_rating -= 10
            player2.win_streak += 1
            player2.lose_streak = 0
            player1.lose_streak += 1
            player1.win_streak = 0
        player1.tournament_total += 1
        player2.tournament_total += 1
        player1.goals_scored += game_data.player1_goals
        player1.goals_conceded += game_data.player2_goals
        player2.goals_scored += game_data.player2_goals
        player2.goals_conceded += game_data.player1_goals

    else:
        print("Invalid game type")
        return

    player1.save()
    player2.save()

