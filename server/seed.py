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
def seed_workouts(users):
    """Seed workouts for users"""
    print("Seeding workouts...")

    workouts = [
    {
        "name": "Full-body",
        "video_url": "workouts/crossfit",
        "description": "A balanced training routine that targets all major muscle groups—upper body, lower body, and core—using a mix of strength, cardio, and flexibility exercises to improve overall fitness and endurance.",
        "difficulty": "Medium",
        "duration": 45,  
        "exercises": "Rope swing, Burpees, Push-ups, Squats, Deadlifts"
    },
    {
        "name": "Yoga",
        "video_url": "workouts/yoga",
        "description": "A mindful practice designed to enhance flexibility, strength, and mental focus. This workout will work on your core, balance, and body alignment.",
        "difficulty": "Hard",
        "duration": 45,  
        "exercises": "Downward Dog, Plank, Tree Pose, Warrior I, Child's Pose"
    },
    {
        "name": "Back-workout",
        "video_url": "workouts/katabox",
        "description": "Focuses on strengthening the back muscles while incorporating high-intensity cardio exercises to burn fat and improve endurance.",
        "difficulty": "Advanced",
        "duration": 30,  
        "exercises": "Jump Squats, Burpees, Sprints, Push-ups, Deadlifts, Bent-over Rows"
    },
    {
        "name": "Pilates",
        "video_url": "workouts/pilates",
        "description": "A low-impact exercise that focuses on core strength, flexibility, and total body alignment. The exercises promote long, lean muscle development.",
        "difficulty": "Advanced",
        "duration": 45,  
        "exercises": "Roll-ups, Leg Circles, Plank, Swimming, Teaser"
    },
    {
        "name": "Cycling",
        "video_url": "workouts/cycling",
        "description": "An intense cardio workout designed to improve cardiovascular health and burn fat. This routine involves interval training on a stationary bike to maximize calorie burn.",
        "difficulty": "Advanced",
        "duration": 30,  
        "exercises": "High-intensity intervals, Sprint intervals, Hill climbs, Recovery pedaling"
    }
]


    for item in workouts:
        user = random.choice(users)
        workout = Workout(
            video_url=item["video_url"],
            name=item["name"],
            description=item["description"],
            difficulty=item["difficulty"],
            duration=item["duration"],
            exercises=item["exercises"],
            created_at=fake.date_time_between(start_date=user.created_at, end_date='now'),
            user_id=user.id
        )
        db.session.add(workout)
    db.session.commit()


def seed_nutrition_plans(users):
    """Seed nutrition plans"""
    print("Seeding nutrition plans...")

    plans = [
        {
            "name": "Vegetable",
            "image_url": "nutrition/stir_fried_vegetable",
            "description": "Balanced vegetable perfect for muscle recovery.",
            "calories": 450,
            "protein": 42,
            "carbs": 38,
            "fats": 12
        },
        {
            "name": "Smoothie",
            "image_url": "nutrition/smoothie",
            "description": "A smoothie made of carbs and fiber to fuel your morning.",
            "calories": 320,
            "protein": 18,
            "carbs": 45,
            "fats": 8
        },
        {
            "name": "Cereal Bowl",
            "image_url": "nutrition/cereal",
            "description": "Flakes and granola mixed with yoghurt and berries, with drizzed honey for natural sweetness.",
            "calories": 250,
            "protein": 10,
            "carbs": 30,
            "fats": 9
        },
        {
            "name": "Chicken Bowl",
            "image_url": "nutrition/chicken_rice",
            "description": "High-protein, balanced meal perfect for muscle recovery.",
            "calories": 450,
            "protein": 42,
            "carbs": 38,
            "fats": 12
        },
        {
            "name": "Salmon dish",
            "image_url": "nutrition/salmon",
            "description": "Freshly grilled salmon rich in high-protein, balanced with a bowl of vegetable.",
            "calories": 450,
            "protein": 42,
            "carbs": 38,
            "fats": 12
        }
    ]

    for item in plans:
        user = random.choice(users)
        plan = NutritionPlan(
            name=item["name"],
            image_url=item["image_url"],
            description=item["description"],
            calories=item["calories"],
            protein=item["protein"],
            carbs=item["carbs"],
            fats=item["fats"],
            created_at=fake.date_time_between(start_date=user.created_at, end_date='now'),
            user_id=user.id
        )
        db.session.add(plan)
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


def seed_products():
    """Seed fitness products using real images"""
    print("Seeding products...")

    products = [
        {
            "name": "Leg Press Machine",
            "features": "Heavy-duty leg press machine with adjustable resistance. Ideal for building lower body strength.",
            "price": 1299.99,
            "category": "Equipment",
            "image_url": "/images/leg _machine.jpg"
        },
        {
            "name": "Adjustable Gym Recliner",
            "features": "Ergonomic recliner designed for post-workout recovery or seated exercises. Durable and comfortable.",
            "price": 499.50,
            "category": "Equipment",
            "image_url": "/images/recliner.jpeg"
        },
        {
            "name": "Veriliss 3pcs Gym Set (Women)",
            "features": "Stylish and breathable activewear set including leggings, sports bra, and top. Perfect for daily training.",
            "price": 74.99,
            "category": "Apparel",
            "image_url": "/images/veriliss-3pcs-gym-clothes-for-women.jpg"
        }
    ]

    for item in products:
        product = Product(
            name=item["name"],
            features=item["features"],
            price=item["price"],
            category=item["category"],
            image_url=item["image_url"]
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