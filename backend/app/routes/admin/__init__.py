from flask import session, redirect, url_for, flash
from app.routes.admin.dashboard_routes import dashboard_bp
from app.routes.admin.artigos_routes import artigos_bp
from app.routes.admin.temas_routes import temas_bp
from app.routes.admin.sintomas_routes import sintomas_bp
from app.routes.admin.palavras_chave_routes import palavras_chave_bp
from app.routes.admin.fases_vida_routes import fases_vida_bp
from app.routes.admin.usuarios_routes import usuarios_bp
from app.routes.admin.auth_routes import auth_bp


def register_admin_blueprints(app):
    app.register_blueprint(dashboard_bp)
    app.register_blueprint(artigos_bp)
    app.register_blueprint(temas_bp)
    app.register_blueprint(sintomas_bp)
    app.register_blueprint(palavras_chave_bp)
    app.register_blueprint(fases_vida_bp)
    app.register_blueprint(usuarios_bp)
    app.register_blueprint(auth_bp)

    @app.before_request
    def proteger_rotas_admin():
        """Bloqueia acesso a rotas /admin/ sem sessão autenticada."""
        from flask import request
        if request.path.startswith('/admin') and not request.path.startswith('/admin/login') and not request.path.startswith('/static'):
            if not session.get('admin_usuario_id'):
                flash('Faça login para acessar o painel administrativo.', 'error')
                return redirect(url_for('admin_auth.login'))

    @app.context_processor
    def injetar_usuario_admin():
        """Disponibiliza dados do admin logado em todos os templates."""
        return {
            'admin_usuario_nome': session.get('admin_usuario_nome'),
            'admin_usuario_email': session.get('admin_usuario_email'),
            'admin_usuario_perfil': session.get('admin_usuario_perfil'),
        }
