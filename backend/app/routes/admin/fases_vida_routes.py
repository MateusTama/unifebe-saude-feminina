from flask import Blueprint, render_template, request, redirect, url_for, flash
from app.controllers.fase_vida_controller import FaseVidaController

fases_vida_bp = Blueprint('admin_fases_vida', __name__, url_prefix='/admin/fases-vida')


@fases_vida_bp.route('', methods=['GET'])
def index():
    busca = request.args.get('busca', '')
    situacao = request.args.get('situacao', '')
    fases = FaseVidaController.listar(busca=busca, situacao=situacao)
    return render_template('admin/fases_vida/index.html', fases=fases, busca=busca, situacao=situacao, active_page='fases_vida')


@fases_vida_bp.route('/novo', methods=['GET', 'POST'])
def novo():
    if request.method == 'POST':
        try:
            dados = {
                'nome': request.form.get('nome'),
                'descricao': request.form.get('descricao'),
                'situacao': request.form.get('situacao') == 'on' or request.form.get('situacao') == 'true'
            }
            if not dados['nome']:
                flash('O nome da fase da vida é obrigatório.', 'error')
                return render_template('admin/fases_vida/form.html', fase=None, active_page='fases_vida')

            FaseVidaController.criar(dados)
            flash('Fase da vida criada com sucesso!', 'success')
            return redirect(url_for('admin_fases_vida.index'))
        except Exception as e:
            flash(f'Erro ao criar fase da vida: {str(e)}', 'error')

    return render_template('admin/fases_vida/form.html', fase=None, active_page='fases_vida')


@fases_vida_bp.route('/<int:id>/editar', methods=['GET', 'POST'])
def editar(id):
    fase = FaseVidaController.obter_por_id(id)

    if request.method == 'POST':
        try:
            dados = {
                'nome': request.form.get('nome'),
                'descricao': request.form.get('descricao'),
                'situacao': request.form.get('situacao') == 'on' or request.form.get('situacao') == 'true'
            }
            if not dados['nome']:
                flash('O nome da fase da vida é obrigatório.', 'error')
                return render_template('admin/fases_vida/form.html', fase=fase, active_page='fases_vida')

            FaseVidaController.atualizar(id, dados)
            flash('Fase da vida atualizada com sucesso!', 'success')
            return redirect(url_for('admin_fases_vida.index'))
        except Exception as e:
            flash(f'Erro ao atualizar fase da vida: {str(e)}', 'error')

    return render_template('admin/fases_vida/form.html', fase=fase, active_page='fases_vida')


@fases_vida_bp.route('/<int:id>/toggle', methods=['POST'])
def toggle(id):
    try:
        fase = FaseVidaController.alternar_situacao(id)
        status_str = 'ativada' if fase.situacao else 'inativada'
        flash(f'Fase da vida "{fase.nome}" foi {status_str} com sucesso!', 'success')
    except Exception as e:
        flash(f'Erro ao alterar status: {str(e)}', 'error')

    return redirect(request.referrer or url_for('admin_fases_vida.index'))


@fases_vida_bp.route('/<int:id>/excluir', methods=['POST'])
def excluir(id):
    try:
        FaseVidaController.excluir(id)
        flash('Fase da vida excluída com sucesso!', 'success')
    except Exception as e:
        flash(f'Erro ao excluir: {str(e)}', 'error')

    return redirect(url_for('admin_fases_vida.index'))
