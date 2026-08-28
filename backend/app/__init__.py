from flask import Flask, redirect, url_for
from flask_jwt_extended import JWTManager
from flask_cors import CORS
from config import Config
from app.models import db
from app.routes.admin import register_admin_blueprints
from app.routes.usuario import usuario_bp
from app.routes.fase_vida import fase_vida_bp
from app.routes.lembrete import lembrete_bp


def create_app(config_class=Config):
    app = Flask(
        __name__,
        template_folder='templates',
        static_folder='static'
    )
    app.config.from_object(config_class)

    # Inicialização do Banco de Dados e JWT
    db.init_app(app)
    JWTManager(app)
    CORS(app)

    # Registro das Rotas da API Mobile
    app.register_blueprint(usuario_bp, url_prefix='/usuarios')
    app.register_blueprint(fase_vida_bp, url_prefix='/fases-vida')
    app.register_blueprint(lembrete_bp, url_prefix='/lembretes')

    # Registro das Rotas do Backoffice Administrativo
    register_admin_blueprints(app)

    # Redirecionamento da raiz para o Login do Backoffice
    @app.route('/')
    def index():
        return redirect(url_for('admin_auth.login'))

    return app

