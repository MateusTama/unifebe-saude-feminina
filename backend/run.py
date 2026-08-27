from flask import Flask
from config import Config
from app.models import db
from app.routes.usuario import usuario_bp
from app.routes.fase_vida import fase_vida_bp
from app.routes.lembrete import lembrete_bp
from flask_jwt_extended import JWTManager

app = Flask(__name__)
app.config.from_object(Config)

db.init_app(app)
jwt = JWTManager(app)

app.register_blueprint(usuario_bp, url_prefix='/usuarios')
app.register_blueprint(fase_vida_bp, url_prefix='/fases-vida')
app.register_blueprint(lembrete_bp, url_prefix='/lembretes')

@app.route('/')
def index():
    return {"mensagem": "API rodando"}

if __name__ == '__main__':
    app.run(port=5000, debug=True)
