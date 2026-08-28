from flask import Blueprint, render_template, request, redirect, url_for, flash, session
from werkzeug.security import check_password_hash
from app.models.usuario import Usuario
from app.models.enums import PerfilUsuarioEnum

auth_bp = Blueprint('admin_auth', __name__, url_prefix='/admin')


@auth_bp.route('/login', methods=['GET', 'POST'])
def login():
    # Se já está logado, redireciona para o painel
    if session.get('admin_usuario_id'):
        return redirect(url_for('admin_artigos.index'))

    if request.method == 'POST':
        email = request.form.get('email', '').strip().lower()
        senha = request.form.get('senha', '')

        if not email or not senha:
            flash('Por favor, informe o e-mail e a senha.', 'error')
            return render_template('admin/auth/login.html')

        usuario = Usuario.query.filter_by(email=email).first()

        # Valida existência e senha
        if not usuario or not check_password_hash(usuario.senha, senha):
            flash('E-mail ou senha incorretos.', 'error')
            return render_template('admin/auth/login.html')

        # Valida se o usuário está ativo
        if not usuario.situacao:
            flash('Este usuário está inativo. Entre em contato com o suporte.', 'error')
            return render_template('admin/auth/login.html')

        # Valida se o perfil é de Administrador
        perfil_valor = usuario.perfil.value if hasattr(usuario.perfil, 'value') else str(usuario.perfil)
        if perfil_valor != PerfilUsuarioEnum.ADMINISTRADOR.value:
            flash('Acesso restrito a administradores.', 'error')
            return render_template('admin/auth/login.html')

        # Salva dados do usuário na sessão
        session['admin_usuario_id'] = usuario.id
        session['admin_usuario_nome'] = usuario.nome
        session['admin_usuario_email'] = usuario.email
        session['admin_usuario_perfil'] = perfil_valor

        flash(f'Bem-vindo(a), {usuario.nome}!', 'success')
        return redirect(url_for('admin_artigos.index'))

    return render_template('admin/auth/login.html')


@auth_bp.route('/logout', methods=['GET'])
def logout():
    session.clear()
    flash('Sessão encerrada com sucesso.', 'info')
    return redirect(url_for('admin_auth.login'))
