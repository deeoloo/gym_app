from datetime import datetime
from app import db
from app import bcrypt
from sqlalchemy.orm import validates
from sqlalchemy_serializer import SerializerMixin

# Association table for User-Friends (many-to-many)
user_friends = db.Table('user_friends',
    db.Column('user_id', db.Integer, db.ForeignKey('users.id'), primary_key=True),
    db.Column('friend_id', db.Integer, db.ForeignKey('users.id'), primary_key=True),
    db.Column('created_at', db.DateTime, default=datetime.utcnow),
    db.Column('status', db.String(20), default='pending')  # 'pending', 'accepted', 'rejected'
)

class User(db.Model, SerializerMixin):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(64), nullable=False, unique=True)
    email = db.Column(db.String(120), nullable=False, unique=True)
    password_hash = db.Column(db.String(128))
    avatar = db.Column(db.String(255), default="👤")  # Emoji avatar
    bio = db.Column(db.String(200))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    last_active = db.Column(db.DateTime, default=datetime.utcnow)
    is_admin = db.Column(db.Boolean, default=False)  
    
    # Relationships
    workouts = db.relationship('Workout', back_populates='user', lazy='dynamic',
                             cascade='all, delete-orphan')
    posts = db.relationship('Post', back_populates='user', lazy='dynamic',
                           cascade='all, delete-orphan')
    challenges = db.relationship('UserChallenge', back_populates='user', lazy='dynamic')
    # Add to User model
    nutrition_plans = db.relationship('NutritionPlan', back_populates='user', lazy='dynamic')

    
    # Many-to-many friends relationship
    friends = db.relationship(
        'User',
        secondary=user_friends,
        primaryjoin=(user_friends.c.user_id == id),
        secondaryjoin=(user_friends.c.friend_id == id),
        backref=db.backref('friend_of', lazy='dynamic'),
        lazy='dynamic'
    )
    
    # Serialization rules
    serialize_rules = (
        '-password_hash',
        '-workouts.user',
        '-posts.user',
        '-challenges.user',
        '-friend_of',
        '-friends.friend_of',
        '-friends.friends',
    )

    def __repr__(self):
        return f'<User {self.username}>'

    @validates('username')
    def validate_username(self, key, username):
        if not username or len(username) < 4:
            raise ValueError("Username must be at least 4 characters")
        if User.query.filter(User.username == username, User.id != self.id).first():
            raise ValueError("Username already exists")
        return username
    
    @validates('email')
    def validate_email(self, key, email):
        if not email or '@' not in email:
            raise ValueError("Invalid email format")
        if User.query.filter(User.email == email, User.id != self.id).first():
            raise ValueError("Email already exists")
        return email
    
    @property
    def password(self):
        raise AttributeError('password is write-only')
    
    @password.setter
    def password(self, password):
        if len(password) < 8:
            raise ValueError("Password must be at least 8 characters")
        self.password_hash = bcrypt.generate_password_hash(password).decode('utf-8')
    
    def verify_password(self, password):
        return bcrypt.check_password_hash(self.password_hash, password)
    
    # Friendship methods
    def send_friend_request(self, friend):
        if self.id == friend.id:
            raise ValueError("Cannot add yourself as friend")
        if self.is_friends_with(friend):
            raise ValueError("Already friends or request pending")
        
        db.session.execute(
            user_friends.insert().values(
                user_id=self.id,
                friend_id=friend.id,
                status='pending'
            )
        )
        db.session.commit()
    
    def accept_friend_request(self, friend):
        relationship = db.session.execute(
            db.select(user_friends).where(
                (user_friends.c.user_id == friend.id) &
                (user_friends.c.friend_id == self.id) &
                (user_friends.c.status == 'pending')
        ).first())
        
        if not relationship:
            raise ValueError("No pending friend request from this user")
        
        # Update both directions
        db.session.execute(
            user_friends.update().where(
                (user_friends.c.user_id == friend.id) &
                (user_friends.c.friend_id == self.id)
            ).values(status='accepted'))
        
        db.session.execute(
            user_friends.insert().values(
                user_id=self.id,
                friend_id=friend.id,
                status='accepted'
            )
        )
        db.session.commit()
    
    def is_friends_with(self, friend):
        result = db.session.execute(
            db.select(user_friends).where(
                ((user_friends.c.user_id == self.id) & (user_friends.c.friend_id == friend.id)) |
                ((user_friends.c.user_id == friend.id) & (user_friends.c.friend_id == self.id))
            )
        ).first()
        return result is not None

    
    def get_friends(self):
    # Friends the user added
        q1 = User.query.join(
            user_friends,
            (user_friends.c.friend_id == User.id)
        ).filter(
            user_friends.c.user_id == self.id,
            user_friends.c.status == 'accepted'
        )

    # Friends who added the user
        q2 = User.query.join(
            user_friends,
            (user_friends.c.user_id == User.id)
        ).filter(
            user_friends.c.friend_id == self.id,
            user_friends.c.status == 'accepted'
        )

        return q1.union(q2).all()

    
    def get_pending_requests(self):
        return User.query.join(
            user_friends,
            (user_friends.c.user_id == User.id) &
            (user_friends.c.friend_id == self.id) &
            (user_friends.c.status == 'pending')
        ).all()
    
    # Utility methods
    def update_last_active(self):
        self.last_active = datetime.utcnow()
        db.session.commit()
    
    def to_dict(self, include_relationships=False):
        data = {
            'id': self.id,
            'username': self.username,
            'avatar': self.avatar,
            'bio': self.bio,
            'created_at': self.created_at.isoformat(),
            'last_active': self.last_active.isoformat(),
            'workout_count': self.workouts.count(),
            'post_count': self.posts.count()
        }
        
        if include_relationships:
            data['friends'] = [friend.to_dict() for friend in self.get_friends()]
            data['pending_requests'] = [user.to_dict() for user in self.get_pending_requests()]
        
        return data