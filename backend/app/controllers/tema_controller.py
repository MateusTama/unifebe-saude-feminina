from datetime import datetime, timezone
from app.models import db, Tema


class TemaController:
    @staticmethod
    def listar(busca=None, situacao=None):
        query = Tema.query
        if busca:
            termo = f"%{busca.strip()}%"
            query = query.filter((Tema.nome.ilike(termo)) | (Tema.descricao.ilike(termo)))

        if situacao is not None and situacao != '':
            if situacao in [True, 'True', 'true', '1', 1]:
                query = query.filter(Tema.situacao.is_(True))
            elif situacao in [False, 'False', 'false', '0', 0]:
                query = query.filter(Tema.situacao.is_(False))

        return query.order_by(Tema.nome.asc()).all()

    @staticmethod
    def obter_por_id(tema_id):
        return Tema.query.get_or_404(tema_id)

    @staticmethod
    def criar(dados):
        nome = dados.get('nome', '').strip()
        descricao = dados.get('descricao', '').strip()
        tema_destaque = dados.get('tema_destaque', False)
        situacao = dados.get('situacao', True)

        if isinstance(tema_destaque, str):
            tema_destaque = tema_destaque.lower() in ['true', '1', 'on']
        if isinstance(situacao, str):
            situacao = situacao.lower() in ['true', '1', 'on', 'ativo']

        novo_tema = Tema(
            nome=nome,
            descricao=descricao,
            tema_destaque=tema_destaque,
            situacao=situacao,
            data_cadastro=datetime.now(timezone.utc)
        )

        db.session.add(novo_tema)
        db.session.commit()
        return novo_tema

    @staticmethod
    def atualizar(tema_id, dados):
        tema = Tema.query.get_or_404(tema_id)

        if 'nome' in dados:
            tema.nome = dados.get('nome', '').strip()
        if 'descricao' in dados:
            tema.descricao = dados.get('descricao', '').strip()
        if 'tema_destaque' in dados:
            td = dados.get('tema_destaque')
            tema.tema_destaque = td.lower() in ['true', '1', 'on'] if isinstance(td, str) else bool(td)
        if 'situacao' in dados:
            sit = dados.get('situacao')
            tema.situacao = sit.lower() in ['true', '1', 'on', 'ativo'] if isinstance(sit, str) else bool(sit)

        tema.data_alteracao = datetime.now(timezone.utc)
        db.session.commit()
        return tema

    @staticmethod
    def alternar_situacao(tema_id):
        tema = Tema.query.get_or_404(tema_id)
        tema.situacao = not tema.situacao
        tema.data_alteracao = datetime.now(timezone.utc)
        db.session.commit()
        return tema

    @staticmethod
    def excluir(tema_id):
        tema = Tema.query.get_or_404(tema_id)
        db.session.delete(tema)
        db.session.commit()
        return True
