from datetime import datetime, timezone
from app.models import db, Artigo, Tema, ArtigoPalavraChave


class ArtigoController:
    @staticmethod
    def listar(busca=None, tema_id=None, situacao=None):
        query = Artigo.query

        if busca:
            termo = f"%{busca.strip()}%"
            query = query.outerjoin(Tema).filter(
                (Artigo.titulo.ilike(termo)) | 
                (Artigo.conteudo.ilike(termo)) |
                (Tema.nome.ilike(termo))
            )

        if tema_id and str(tema_id).isdigit():
            query = query.filter(Artigo.tema_id == int(tema_id))

        if situacao is not None and situacao != '':
            if situacao in [True, 'True', 'true', '1', 1]:
                query = query.filter(Artigo.situacao.is_(True))
            elif situacao in [False, 'False', 'false', '0', 0]:
                query = query.filter(Artigo.situacao.is_(False))

        return query.order_by(Artigo.data_cadastro.desc()).all()

    @staticmethod
    def obter_por_id(artigo_id):
        return Artigo.query.get_or_404(artigo_id)

    @staticmethod
    def criar(dados):
        titulo = dados.get('titulo', '').strip()
        conteudo = dados.get('conteudo', '').strip()
        tema_id = dados.get('tema_id')
        situacao = dados.get('situacao', True)

        if isinstance(situacao, str):
            situacao = situacao.lower() in ['true', '1', 'on', 'ativo']

        if tema_id and str(tema_id).isdigit():
            tema_id = int(tema_id)
        else:
            tema_id = None

        novo_artigo = Artigo(
            titulo=titulo,
            conteudo=conteudo,
            tema_id=tema_id,
            situacao=situacao,
            data_cadastro=datetime.now(timezone.utc),
            data_publicacao=datetime.now(timezone.utc)
        )

        db.session.add(novo_artigo)
        db.session.commit()
        return novo_artigo

    @staticmethod
    def atualizar(artigo_id, dados):
        artigo = Artigo.query.get_or_404(artigo_id)

        if 'titulo' in dados:
            artigo.titulo = dados.get('titulo', '').strip()
        if 'conteudo' in dados:
            artigo.conteudo = dados.get('conteudo', '').strip()
        if 'tema_id' in dados:
            tema_id = dados.get('tema_id')
            artigo.tema_id = int(tema_id) if (tema_id and str(tema_id).isdigit()) else None
        if 'situacao' in dados:
            situacao = dados.get('situacao')
            if isinstance(situacao, str):
                artigo.situacao = situacao.lower() in ['true', '1', 'on', 'ativo']
            else:
                artigo.situacao = bool(situacao)

        artigo.data_alteracao = datetime.now(timezone.utc)
        db.session.commit()
        return artigo

    @staticmethod
    def alternar_situacao(artigo_id):
        artigo = Artigo.query.get_or_404(artigo_id)
        artigo.situacao = not artigo.situacao
        artigo.data_alteracao = datetime.now(timezone.utc)
        db.session.commit()
        return artigo

    @staticmethod
    def excluir(artigo_id):
        artigo = Artigo.query.get_or_404(artigo_id)
        db.session.delete(artigo)
        db.session.commit()
        return True

    @staticmethod
    def obter_palavras_chave_ids(artigo_id):
        """Retorna a lista de IDs de palavras-chave vinculadas a um artigo."""
        registros = ArtigoPalavraChave.query.filter_by(artigo_id=artigo_id).all()
        return [r.palavra_chave_id for r in registros]

    @staticmethod
    def atualizar_palavras_chave(artigo_id, palavras_chave_ids):
        """Remove as associações existentes e cria as novas."""
        # Remove todas as associações existentes
        ArtigoPalavraChave.query.filter_by(artigo_id=artigo_id).delete()

        # Adiciona as novas
        for pc_id in palavras_chave_ids:
            if pc_id and str(pc_id).isdigit():
                associacao = ArtigoPalavraChave(
                    artigo_id=artigo_id,
                    palavra_chave_id=int(pc_id)
                )
                db.session.add(associacao)

        db.session.commit()
