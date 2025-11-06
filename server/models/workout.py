from app import db
from datetime import datetime
from sqlalchemy_serializer import SerializerMixin

class Workout(db.Model, SerializerMixin):
    __tablename__ = 'workouts'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    video_url = db.Column(db.String)
    description = db.Column(db.Text)
    difficulty = db.Column(db.String)
    duration = db.Column(db.Integer, nullable=False) 
    exercises = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)

    user = db.relationship('User', back_populates = 'workouts')
    serialize_rules=('-user.workouts',)

    
    def __repr__(self):
        return f'Workout{self.name} {self.description} {self.video_url} {self.difficulty}'
    

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'video_url': self.video_url,
            'difficulty': self.difficulty,
            'duration': self.duration,
            'exercises': self.exercises,
            'created_at': self.created_at.isoformat()
    }