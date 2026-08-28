from flask import Blueprint, render_template, request, redirect, url_for, flash
from app.controllers.palavra_chave_controller import PalavraChaveController

palavras_chave_bp = Blueprint('admin_palavras_chave', __name__, url_prefix='/admin/palavras-chave')


@palavras_chave_bp.route('', methods=['GET'])
def index():
    busca = request.args.get('busca', '')
    situacao = request.args.get('situacao', '')
    palavras = PalavraChaveController.listar(busca=busca, situacao=situacao)
    return render_template('admin/palavras_chave/index.html', palavras=palavras, busca=busca, situacao=situacao, active_page='palavras_chave')


@palavras_chave_bp.route('/novo', methods=['GET', 'POST'])
def novo():
    if request.method == 'POST':
        try:
            dados = {
                'nome': request.form.get('nome'),
                'situacao': request.form.get('situacao') == 'on' or request.form.get('situacao') == 'true'
            }
            if not dados['nome']:
                flash('O nome da palavra-chave é obrigatório.', 'error')
                return render_template('admin/palavras_chave/form.html', palavra=None, active_page='palavras_chave')

            PalavraChaveController.criar(dados)
            flash('Palavra-chave criada com sucesso!', 'success')
            return redirect(url_for('admin_palavras_chave.index'))
        except Exception as e:
            flash(f'Erro ao criar palavra-chave: {str(e)}', 'error')

    return render_template('admin/palavras_chave/form.html', palavra=None, active_page='palavras_chave')


@palavras_chave_bp.route('/<int:id>/editar', methods=['GET', 'POST'])
def editar(id):
    palavra = PalavraChaveController.obter_por_id(id)

    if request.method == 'POST':
        try:
            dados = {
                'nome': request.form.get('nome'),
                'situacao': request.form.get('situacao') == 'on' or request.form.get('situacao') == 'true'
            }
            if not dados['nome']:
                flash('O nome da palavra-chave é obrigatório.', 'error')
                return render_template('admin/palavras_chave/form.html', palavra=palavra, active_page='palavras_chave')

            PalavraChaveController.atualizar(id, dados)
            flash('Palavra-chave atualizada com sucesso!', 'success')
            return redirect(url_for('admin_palavras_chave.index'))
        except Exception as e:
            flash(f'Erro ao atualizar palavra-chave: {str(e)}', 'error')

    return render_template('admin/palavras_chave/form.html', palavra=palavra, active_page='palavras_chave')


@palavras_chave_bp.route('/<int:id>/toggle', methods=['POST'])
def toggle(id):
    try:
        palavra = PalavraChaveController.alternar_situacao(id)
        status_str = 'ativada' if palavra.situacao else 'inativada'
        flash(f'Palavra-chave "{palavra.nome}" foi {status_str} com sucesso!', 'success')
    except Exception as e:
        flash(f'Erro ao alterar status: {str(e)}', 'error')

    return redirect(request.referrer or url_for('admin_palavras_chave.index'))


@palavras_chave_bp.route('/<int:id>/excluir', methods=['POST'])
def excluir(id):
    try:
        PalavraChaveController.excluir(id)
        flash('Palavra-chave excluída com sucesso!', 'success')
    except Exception as e:
        flash(f'Erro ao excluir: {str(e)}', 'error')

    return redirect(url_for('admin_palavras_chave.index'))
