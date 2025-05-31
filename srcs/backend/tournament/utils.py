import uuid
from django.contrib.auth.models import User
from .models import Match

def matchmaker(tournament):
    """
    Create matches for tournament participants
    
    Args:
        tournament (Tournament): The tournament to create matches for
    
    Returns:
        list: Created Match objects
    """
    participants = list(tournament.participants.all())
    
    # Shuffle participants randomly
    import random
    random.shuffle(participants)
    
    matches = []
    
    # Create matches in pairs
    while len(participants) >= 2:
        player1 = participants.pop()
        player2 = participants.pop()
        
        match = Match.objects.create(
            tournament=tournament,
            player1=player1,
            player2=player2,
            room_id=str(uuid.uuid4())  # Generate unique room ID
        )
        matches.append(match)
    
    return matches
