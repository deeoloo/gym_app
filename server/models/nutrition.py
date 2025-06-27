from app import db
from datetime import datetime
from sqlalchemy_serializer import SerializerMixin

class NutritionPlan(db.Model, SerializerMixin):
    __tablename__ = "nutrition_plans"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text)
    calories = db.Column(db.Integer)
    protein = db.Column(db.Integer)
    carbs = db.Column(db.Integer)
    fats = db.Column(db.Integer)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    user = db.relationship('User')  # the one who added it

    def __repr__(self):
        return f'<NutritionPlan {self.name}>'
