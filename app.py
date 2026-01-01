from flask import Flask, render_template, request, redirect, url_for, flash
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager, UserMixin, login_user, login_required, logout_user, current_user
from werkzeug.security import generate_password_hash, check_password_hash
from email_validator import validate_email, EmailNotValidError
import os

app = Flask(__name__)
app.config['SECRET_KEY'] = os.urandom(24)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///users.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)
login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = 'login'

class User(UserMixin, db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(200), nullable=False)
    role = db.Column(db.String(20), default='member')  # owner, admin, moderator, member
    discord_id = db.Column(db.String(50), unique=True, nullable=True)

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        username = request.form.get('username')
        email = request.form.get('email')
        password = request.form.get('password')
        confirm_password = request.form.get('confirm_password')

        # Validation
        if not all([username, email, password, confirm_password]):
            flash('Tous les champs sont obligatoires', 'error')
            return redirect(url_for('register'))

        if password != confirm_password:
            flash('Les mots de passe ne correspondent pas', 'error')
            return redirect(url_for('register'))

        try:
            validate_email(email)
        except EmailNotValidError:
            flash('Adresse email invalide', 'error')
            return redirect(url_for('register'))

        if User.query.filter_by(username=username).first():
            flash('Ce nom d\'utilisateur est déjà pris', 'error')
            return redirect(url_for('register'))

        if User.query.filter_by(email=email).first():
            flash('Cette adresse email est déjà utilisée', 'error')
            return redirect(url_for('register'))

        # Création du nouvel utilisateur
        hashed_password = generate_password_hash(password, method='sha256')
        new_user = User(username=username, email=email, password=hashed_password)
        
        db.session.add(new_user)
        db.session.commit()

        flash('Inscription réussie ! Vous pouvez maintenant vous connecter.', 'success')
        return redirect(url_for('login'))

    return render_template('register.html')

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form.get('username')
        password = request.form.get('password')
        remember = True if request.form.get('remember') else False

        user = User.query.filter_by(username=username).first()

        if not user or not check_password_hash(user.password, password):
            flash('Nom d\'utilisateur ou mot de passe incorrect', 'error')
            return redirect(url_for('login'))

        login_user(user, remember=remember)
        return redirect(url_for('dashboard'))  # Redirige vers le dashboard approprié

    return render_template('login.html')

@app.route('/profile')
@login_required
def profile():
    return render_template('profile.html', user=current_user)

@app.route('/logout')
@login_required
def logout():
    logout_user()
    return redirect(url_for('home'))

@app.route('/api/discord/register', methods=['POST'])
def discord_register():
    data = request.get_json()
    
    # Vérifier les données requises
    required_fields = ['username', 'email', 'password', 'discord_id', 'role']
    if not all(field in data for field in required_fields):
        return {'error': 'Tous les champs sont requis'}, 400
    
    # Vérifier si l'utilisateur existe déjà
    if User.query.filter_by(discord_id=data['discord_id']).first():
        return {'error': 'Ce compte Discord est déjà enregistré'}, 400
    
    if User.query.filter_by(username=data['username']).first():
        return {'error': 'Ce nom d\'utilisateur est déjà pris'}, 400
    
    if User.query.filter_by(email=data['email']).first():
        return {'error': 'Cette adresse email est déjà utilisée'}, 400
    
    # Créer le nouvel utilisateur
    hashed_password = generate_password_hash(data['password'], method='sha256')
    new_user = User(
        username=data['username'],
        email=data['email'],
        password=hashed_password,
        discord_id=data['discord_id'],
        role=data['role']
    )
    
    db.session.add(new_user)
    db.session.commit()
    
    return {'message': 'Compte créé avec succès'}, 201

# Redirection en fonction du rôle après connexion
@app.route('/dashboard')
@login_required
def dashboard():
    if current_user.role == 'owner':
        return redirect(url_for('owner_dashboard'))
    elif current_user.role == 'admin':
        return redirect(url_for('admin_dashboard'))
    elif current_user.role == 'moderator':
        return redirect(url_for('moderator_dashboard'))
    else:
        return redirect(url_for('member_dashboard'))

# Exemple de route pour le panel admin
@app.route('/admin')
@login_required
def admin_dashboard():
    if current_user.role not in ['admin', 'owner']:
        return redirect(url_for('profile'))
    return render_template('admin/dashboard.html')

# Exemple de route pour le panel modo
@app.route('/moderator')
@login_required
def moderator_dashboard():
    if current_user.role not in ['moderator', 'admin', 'owner']:
        return redirect(url_for('profile'))
    return render_template('moderator/dashboard.html')

# Exemple de route pour le panel membre
@app.route('/member')
@login_required
def member_dashboard():
    return render_template('member/dashboard.html')


if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True, load_dotenv=False, port=3000)  # Port 3000 pour correspondre à l'API attendue
