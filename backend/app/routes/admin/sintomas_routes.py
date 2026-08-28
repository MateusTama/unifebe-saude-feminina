from flask import Blueprint, render_template, request, redirect, url_for, flash
from app.controllers.sintoma_controller import SintomaController

sintomas_bp = Blueprint('admin_sintomas', __name__, url_prefix='/admin/sintomas')


@sintomas_bp.route('', methods=['GET'])
def index():
    busca = request.args.get('busca', '')
    situacao = request.args.get('situacao', '')
    sintomas = SintomaController.listar(busca=busca, situacao=situacao)
    return render_template('admin/sintomas/index.html', sintomas=sintomas, busca=busca, situacao=situacao, active_page='sintomas')


@sintomas_bp.route('/novo', methods=['GET', 'POST'])
def novo():
    if request.method == 'POST':
        try:
            dados = {
                'nome': request.form.get('nome'),
                'situacao': request.form.get('situacao') == 'on' or request.form.get('situacao') == 'true'
            }
            if not dados['nome']:
                flash('O nome do sintoma é obrigatório.', 'error')
                return render_template('admin/sintomas/form.html', sintoma=None, active_page='sintomas')

            SintomaController.criar(dados)
            flash('Sintoma criado com sucesso!', 'success')
            return redirect(url_for('admin_sintomas.index'))
        except Exception as e:
            flash(f'Erro ao criar sintoma: {str(e)}', 'error')

    return render_template('admin/sintomas/form.html', sintoma=None, active_page='sintomas')


@sintomas_bp.route('/<int:sintoma_id>/editar', methods=['GET', 'POST'])
def editar(sintoma_id):
    sintoma = SintomaController.obter_por_id(sintoma_id)

    if request.method == 'POST':
        try:
            dados = {
                'nome': request.form.get('nome'),
                'situacao': request.form.get('situacao') == 'on' or request.form.get('situacao') == 'true'
            }
            if not dados['nome']:
                flash('O nome do sintoma é obrigatório.', 'error')
                return render_template('admin/sintomas/form.html', sintoma=sintoma, active_page='sintomas')

            SintomaController.atualizar(sintoma_id, dados)
            flash('Sintoma atualizado com sucesso!', 'success')
            return redirect(url_for('admin_sintomas.index'))
        except Exception as e:
            flash(f'Erro ao atualizar sintoma: {str(e)}', 'error')

    return render_template('admin/sintomas/form.html', sintoma=sintoma, active_page='sintomas')


@sintomas_bp.route('/<int:sintoma_id>/toggle', methods=['POST'])
def toggle(sintoma_id):
    try:
        sintoma = SintomaController.alternar_situacao(sintoma_id)
        status_str = 'ativado' if sintoma.situacao else 'inativado'
        flash(f'Sintoma "{sintoma.nome}" foi {status_str} com sucesso!', 'success')
    except Exception as e:
        flash(f'Erro ao alterar status do sintoma: {str(e)}', 'error')

    return redirect(request.referrer or url_for('admin_sintomas.index'))


@sintomas_bp.route('/<int:sintoma_id>/excluir', methods=['POST'])
def excluir(sintoma_id):
    try:
        SintomaController.excluir(sintoma_id)
        flash('Sintoma excluído com sucesso!', 'success')
    except Exception as e:
        flash(f'Erro ao excluir sintoma: {str(e)}', 'error')

    return redirect(url_for('admin_sintomas.index'))
