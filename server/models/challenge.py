from app import db
from datetime import datetime
from sqlalchemy_serializer import SerializerMixin

class Challenge(db.Model, SerializerMixin):
    __tablename__ = "challenges"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text)
    target = db.Column(db.Integer, nullable=False)  # e.g., 30 days, 10 recipes
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    is_active = db.Column(db.Boolean, default=True)

    # Serialization rules
    serialize_rules = ('-user_challenges.challenge',)

    def __repr__(self):
        return f'<Challenge {self.name}>'

class UserChallenge(db.Model, SerializerMixin):
    __tablename__ = "user_challenges"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    challenge_id = db.Column(db.Integer, db.ForeignKey('challenges.id'), nullable=False)
    progress = db.Column(db.Integer, default=0)
    completed = db.Column(db.Boolean, default=False)
    joined_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationships
    user = db.relationship('User', back_populates='challenges')
    challenge = db.relationship('Challenge')

    # Serialization rules
    serialize_rules = ('-user.challenges', '-challenge.user_challenges')

    def __repr__(self):
        return f'<UserChallenge {self.user_id}-{self.challenge_id}>'