from app import db
from datetime import datetime
from sqlalchemy_serializer import SerializerMixin

class Post(db.Model, SerializerMixin):
    __tablename__ = "posts"

    id = db.Column(db.Integer, primary_key=True)
    content = db.Column(db.Text, nullable=False)
    likes = db.Column(db.Integer, default=0)
    comments_count = db.Column(db.Integer, default=0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)

    # Relationships
    user = db.relationship('User', back_populates='posts')

    # Serialization rules
    serialize_rules = ('-user.posts', '-user.password_hash')

    def __repr__(self):
        return f'<Post {self.id} by User {self.user_id}>'

    def to_dict(self):
        return {
            'id': self.id,
            'content': self.content,
            'likes': self.likes,
            'comments': self.comments_count,
            'created_at': self.created_at.isoformat(),
            'user': {
                'id': self.user.id,
                'username': self.user.username,
                'avatar': self.user.avatar
            }
        }