from flask import Blueprint, render_template, request, redirect, url_for, flash
from app.controllers.tema_controller import TemaController

temas_bp = Blueprint('admin_temas', __name__, url_prefix='/admin/temas')


@temas_bp.route('', methods=['GET'])
def index():
    busca = request.args.get('busca', '')
    situacao = request.args.get('situacao', '')
    temas = TemaController.listar(busca=busca, situacao=situacao)
    return render_template('admin/temas/index.html', temas=temas, busca=busca, situacao=situacao, active_page='temas')


@temas_bp.route('/novo', methods=['GET', 'POST'])
def novo():
    if request.method == 'POST':
        try:
            dados = {
                'nome': request.form.get('nome'),
                'descricao': request.form.get('descricao'),
                'tema_destaque': request.form.get('tema_destaque') == 'on',
                'situacao': request.form.get('situacao') == 'on' or request.form.get('situacao') == 'true'
            }
            if not dados['nome']:
                flash('O nome do tema é obrigatório.', 'error')
                return render_template('admin/temas/form.html', tema=None, active_page='temas')

            TemaController.criar(dados)
            flash('Tema criado com sucesso!', 'success')
            return redirect(url_for('admin_temas.index'))
        except Exception as e:
            flash(f'Erro ao criar tema: {str(e)}', 'error')

    return render_template('admin/temas/form.html', tema=None, active_page='temas')


@temas_bp.route('/<int:tema_id>/editar', methods=['GET', 'POST'])
def editar(tema_id):
    tema = TemaController.obter_por_id(tema_id)

    if request.method == 'POST':
        try:
            dados = {
                'nome': request.form.get('nome'),
                'descricao': request.form.get('descricao'),
                'tema_destaque': request.form.get('tema_destaque') == 'on',
                'situacao': request.form.get('situacao') == 'on' or request.form.get('situacao') == 'true'
            }
            if not dados['nome']:
                flash('O nome do tema é obrigatório.', 'error')
                return render_template('admin/temas/form.html', tema=tema, active_page='temas')

            TemaController.atualizar(tema_id, dados)
            flash('Tema atualizado com sucesso!', 'success')
            return redirect(url_for('admin_temas.index'))
        except Exception as e:
            flash(f'Erro ao atualizar tema: {str(e)}', 'error')

    return render_template('admin/temas/form.html', tema=tema, active_page='temas')


@temas_bp.route('/<int:tema_id>/toggle', methods=['POST'])
def toggle(tema_id):
    try:
        tema = TemaController.alternar_situacao(tema_id)
        status_str = 'ativado' if tema.situacao else 'inativado'
        flash(f'Tema "{tema.nome}" foi {status_str} com sucesso!', 'success')
    except Exception as e:
        flash(f'Erro ao alterar status do tema: {str(e)}', 'error')

    return redirect(request.referrer or url_for('admin_temas.index'))


@temas_bp.route('/<int:tema_id>/excluir', methods=['POST'])
def excluir(tema_id):
    try:
        TemaController.excluir(tema_id)
        flash('Tema excluído com sucesso!', 'success')
    except Exception as e:
        flash(f'Erro ao excluir tema: {str(e)}', 'error')

    return redirect(url_for('admin_temas.index'))
