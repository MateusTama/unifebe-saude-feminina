from flask import Blueprint, render_template, request, redirect, url_for, flash
from app.controllers.artigo_controller import ArtigoController
from app.controllers.tema_controller import TemaController
from app.controllers.palavra_chave_controller import PalavraChaveController

artigos_bp = Blueprint('admin_artigos', __name__, url_prefix='/admin/artigos')


@artigos_bp.route('', methods=['GET'])
def index():
    busca = request.args.get('busca', '')
    tema_id = request.args.get('tema_id', '')
    situacao = request.args.get('situacao', '')

    artigos = ArtigoController.listar(busca=busca, tema_id=tema_id, situacao=situacao)
    temas = TemaController.listar(situacao=True)

    return render_template(
        'admin/artigos/index.html',
        artigos=artigos,
        temas=temas,
        busca=busca,
        tema_id=tema_id,
        situacao=situacao,
        active_page='artigos'
    )


@artigos_bp.route('/novo', methods=['GET', 'POST'])
def novo():
    if request.method == 'POST':
        try:
            dados = {
                'titulo': request.form.get('titulo'),
                'tema_id': request.form.get('tema_id'),
                'conteudo': request.form.get('conteudo'),
                'situacao': request.form.get('situacao') == 'on' or request.form.get('situacao') == 'true'
            }
            palavras_chave_ids = request.form.getlist('palavras_chave_ids')

            if not dados['titulo']:
                flash('O título do artigo é obrigatório.', 'error')
                temas = TemaController.listar(situacao=True)
                palavras_chave = PalavraChaveController.listar(situacao=True)
                return render_template('admin/artigos/form.html', temas=temas, artigo=None, palavras_chave=palavras_chave, palavras_selecionadas=[], active_page='artigos')

            artigo = ArtigoController.criar(dados)
            ArtigoController.atualizar_palavras_chave(artigo.id, palavras_chave_ids)
            flash('Artigo criado com sucesso!', 'success')
            return redirect(url_for('admin_artigos.index'))
        except Exception as e:
            flash(f'Erro ao criar artigo: {str(e)}', 'error')

    temas = TemaController.listar(situacao=True)
    palavras_chave = PalavraChaveController.listar(situacao=True)
    return render_template('admin/artigos/form.html', temas=temas, artigo=None, palavras_chave=palavras_chave, palavras_selecionadas=[], active_page='artigos')


@artigos_bp.route('/<int:artigo_id>/editar', methods=['GET', 'POST'])
def editar(artigo_id):
    artigo = ArtigoController.obter_por_id(artigo_id)

    if request.method == 'POST':
        try:
            dados = {
                'titulo': request.form.get('titulo'),
                'tema_id': request.form.get('tema_id'),
                'conteudo': request.form.get('conteudo'),
                'situacao': request.form.get('situacao') == 'on' or request.form.get('situacao') == 'true'
            }
            palavras_chave_ids = request.form.getlist('palavras_chave_ids')

            if not dados['titulo']:
                flash('O título do artigo é obrigatório.', 'error')
                temas = TemaController.listar(situacao=True)
                palavras_chave = PalavraChaveController.listar(situacao=True)
                palavras_selecionadas = ArtigoController.obter_palavras_chave_ids(artigo_id)
                return render_template('admin/artigos/form.html', temas=temas, artigo=artigo, palavras_chave=palavras_chave, palavras_selecionadas=palavras_selecionadas, active_page='artigos')

            ArtigoController.atualizar(artigo_id, dados)
            ArtigoController.atualizar_palavras_chave(artigo_id, palavras_chave_ids)
            flash('Artigo atualizado com sucesso!', 'success')
            return redirect(url_for('admin_artigos.index'))
        except Exception as e:
            flash(f'Erro ao atualizar artigo: {str(e)}', 'error')

    temas = TemaController.listar(situacao=True)
    palavras_chave = PalavraChaveController.listar(situacao=True)
    palavras_selecionadas = ArtigoController.obter_palavras_chave_ids(artigo_id)
    return render_template('admin/artigos/form.html', temas=temas, artigo=artigo, palavras_chave=palavras_chave, palavras_selecionadas=palavras_selecionadas, active_page='artigos')


@artigos_bp.route('/<int:artigo_id>/toggle', methods=['POST'])
def toggle(artigo_id):
    try:
        artigo = ArtigoController.alternar_situacao(artigo_id)
        status_str = 'ativado' if artigo.situacao else 'inativado'
        flash(f'Artigo "{artigo.titulo}" foi {status_str} com sucesso!', 'success')
    except Exception as e:
        flash(f'Erro ao alterar status: {str(e)}', 'error')

    return redirect(request.referrer or url_for('admin_artigos.index'))


@artigos_bp.route('/<int:artigo_id>/excluir', methods=['POST'])
def excluir(artigo_id):
    try:
        ArtigoController.excluir(artigo_id)
        flash('Artigo excluído com sucesso!', 'success')
    except Exception as e:
        flash(f'Erro ao excluir artigo: {str(e)}', 'error')

    return redirect(url_for('admin_artigos.index'))
