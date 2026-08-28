from flask import Blueprint, render_template, request, redirect, url_for, flash, session
from app.controllers.usuario_controller import UsuarioController
from app.models.enums import PerfilUsuarioEnum

usuarios_bp = Blueprint('admin_usuarios', __name__, url_prefix='/admin/usuarios')


@usuarios_bp.route('', methods=['GET'])
def index():
    busca = request.args.get('busca', '')
    situacao = request.args.get('situacao', '')
    usuarios = UsuarioController.listar(busca=busca, perfil=PerfilUsuarioEnum.USUARIO, situacao=situacao)
    return render_template('admin/usuarios/index.html', usuarios=usuarios, busca=busca, situacao=situacao, tipo='usuarias', active_page='usuarios')


@usuarios_bp.route('/administradores', methods=['GET'])
def administradores():
    busca = request.args.get('busca', '')
    situacao = request.args.get('situacao', '')
    usuarios = UsuarioController.listar(busca=busca, perfil=PerfilUsuarioEnum.ADMINISTRADOR, situacao=situacao)
    return render_template('admin/usuarios/index.html', usuarios=usuarios, busca=busca, situacao=situacao, tipo='administradores', active_page='administradores')


@usuarios_bp.route('/<int:id>/toggle', methods=['POST'])
def toggle(id):
    # Proteção de auto-bloqueio: não permite inativar o próprio usuário logado
    if session.get('admin_usuario_id') == id:
        flash('Você não pode inativar sua própria conta de administrador.', 'error')
        return redirect(request.referrer or url_for('admin_usuarios.administradores'))

    try:
        usuario = UsuarioController.alternar_situacao(id)
        status_str = 'ativado(a)' if usuario.situacao else 'inativado(a)'
        flash(f'Usuário(a) "{usuario.nome}" foi {status_str} com sucesso!', 'success')
    except Exception as e:
        flash(f'Erro ao alterar status: {str(e)}', 'error')

    return redirect(request.referrer or url_for('admin_usuarios.index'))

