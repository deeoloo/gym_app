from app import create_app, db
from models.user import User, user_friends
from models.workout import Workout
from models.post import Post
from models.challenge import Challenge, UserChallenge
from models.nutrition import NutritionPlan
from models.product import Product



from faker import Faker
import random
from datetime import datetime, timedelta


fake = Faker()
app = create_app()

def seed_users(num_users=5):
    """Seed users with random data"""
    print("Seeding users...")

    # Create admin
    admin = User(
        username='admin',
        email='admin@gymhum.com',
        is_admin=True,
        avatar=fake.image_url(),
        created_at=fake.date_time_this_year()
    )
    db.session.add(admin)

    # Create regular users
    users = [admin]  # Include admin in returned list
    for _ in range(num_users):
        user = User(
            username=fake.unique.user_name(),
            email=fake.unique.email(),
            avatar=random.choice(["🏋️", "🧘", "🏊", "🚴", "🏃", "💪"]),
            bio=fake.sentence(),
            created_at=fake.date_time_this_year()
        )
        password = fake.password()
        user.password = password
        db.session.add(user)
        users.append(user)

    db.session.commit()
    return users


def seed_workouts(users, num_workouts=8):
    """Seed workouts for users"""
    print("Seeding workouts...")
    workout_types = [
        "Strength Training", "Cardio", "HIIT", "Yoga",
        "Pilates", "CrossFit", "Swimming", "Cycling"
    ]
    difficulties = ["Easy", "Moderate", "Hard", "Advanced"]
    
    for _ in range(num_workouts):
        user = random.choice(users)
        workout = Workout(
            name=f"{random.choice(workout_types)} Session",
            description=fake.sentence(),
            difficulty=random.choice(difficulties),
            duration=random.randint(15, 120),
            exercises=", ".join(fake.words(nb=random.randint(3, 6))),  # Simulate a list of exercises
            created_at=fake.date_time_between(
                start_date=user.created_at,
                end_date='now'
            ),
            user_id=user.id
        )
        db.session.add(workout)
    db.session.commit()


def seed_challenges(num_challenges=5):
    """Seed community challenges"""
    print("Seeding challenges...")
    challenges = []
    challenge_types = ['Fitness', 'Nutrition', 'Wellness', 'Yoga', 'Running']
    durations = ['30-Day', '90-Day', 'Weekly', 'Monthly']
    targets = [30, 90, 7, 28, 14]

    for i in range(num_challenges):
        challenge = Challenge(
            name=f"{durations[i % len(durations)]} {challenge_types[i % len(challenge_types)]} Challenge",
            description=fake.paragraph(),
            target=targets[i % len(targets)],
            created_at=fake.date_time_this_year(),
            is_active=random.choice([True, False])  # Optional control
        )
        challenges.append(challenge)
        db.session.add(challenge)
    db.session.commit()
    return challenges


def seed_user_challenges(users, challenges):
    """Seed user participation in challenges"""
    print("Seeding user challenges...")
    for user in users:
        # Each user joins 1-3 random challenges
        for _ in range(random.randint(1, 3)):
            challenge = random.choice(challenges)
            if not UserChallenge.query.filter_by(
                user_id=user.id,
                challenge_id=challenge.id
            ).first():
                user_challenge = UserChallenge(
                    user_id=user.id,
                    challenge_id=challenge.id,
                    progress=random.randint(0, challenge.target),
                    completed=random.random() > 0.7,
                    joined_at=fake.date_time_between(
                        start_date=challenge.created_at,
                        end_date='now'
                    )
                )
                db.session.add(user_challenge)
    db.session.commit()

def seed_posts(users, num_posts=200):
    """Seed community posts"""
    print("Seeding posts...")
    for _ in range(num_posts):
        user = random.choice(users)
        post = Post(
            content=fake.paragraph(),
            likes=random.randint(0, 100),
            comments_count=random.randint(0, 20),
            created_at=fake.date_time_between(
                start_date=user.created_at,
                end_date='now'
            ),
            user_id=user.id
        )
        db.session.add(post)
    db.session.commit()

def seed_friendships(users):
    """Seed friend relationships between users"""
    print("Seeding friendships...")
    for user in users:
        # Each user has 3-10 friends
        num_friends = random.randint(3, min(10, len(users) - 1))
        potential_friends = [u for u in users if u.id != user.id]
        
        for _ in range(num_friends):
            friend = random.choice(potential_friends)
            potential_friends.remove(friend)
            
            # Check if relationship already exists
            existing = db.session.execute(
                db.select(user_friends).where(
                    ((user_friends.c.user_id == user.id) &
                     (user_friends.c.friend_id == friend.id)) |
                    ((user_friends.c.user_id == friend.id) &
                     (user_friends.c.friend_id == user.id))
                )
            ).first()
            
            if not existing:
                status = 'accepted' if random.random() > 0.3 else 'pending'
                db.session.execute(
                    user_friends.insert().values(
                        user_id=user.id,
                        friend_id=friend.id,
                        status=status,
                        created_at=fake.date_time_this_year()
                    )
                )
    db.session.commit()

def seed_nutrition_plans(users, num_plans=50):
    """Seed nutrition plans"""
    print("Seeding nutrition plans...")
    for _ in range(num_plans):
        user = random.choice(users)
        plan = NutritionPlan(
            name=f"{random.choice(['Lean', 'Bulk', 'Keto', 'Vegan'])} {random.choice(['Meal', 'Plan', 'Nutrition'])}",
            description=fake.paragraph(),
            calories=random.randint(1200, 3000),
            protein=random.randint(50, 200),
            carbs=random.randint(50, 400),
            fats=random.randint(20, 150),
            created_at=fake.date_time_between(
                start_date=user.created_at,
                end_date='now'
            ),
            user_id=user.id
        )
        db.session.add(plan)
    db.session.commit()

def seed_products(num_products=30):
    """Seed fitness products"""
    print("Seeding products...")
    categories = ["Protein", "Vitamins", "Equipment", "Apparel", "Accessories"]
    for _ in range(num_products):
        product = Product(
            name=fake.catch_phrase(),
            features=fake.paragraph(),
            price=round(random.uniform(5, 200), 2),
            category=random.choice(categories),
            image_url=fake.image_url(),
            created_at=fake.date_time_this_year()
        )
        db.session.add(product)
    db.session.commit()

def seed_database():
    """Main seeding function"""
    with app.app_context():
        print("Starting database seeding...")
        db.drop_all()
        db.create_all()
        
        users = seed_users()
        seed_workouts(users)
        challenges = seed_challenges()
        seed_user_challenges(users, challenges)
        seed_posts(users)
        seed_friendships(users)
        seed_nutrition_plans(users)
        seed_products()
        
        print("Database seeding completed successfully!")

if __name__ == '__main__':
    seed_database()