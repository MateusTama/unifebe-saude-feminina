from datetime import datetime, timezone
from app.models import db, PalavraChave


class PalavraChaveController:
    @staticmethod
    def listar(busca=None, situacao=None):
        query = PalavraChave.query
        if busca:
            query = query.filter(PalavraChave.nome.ilike(f"%{busca.strip()}%"))

        if situacao is not None and situacao != '':
            if situacao in [True, 'True', 'true', '1', 1]:
                query = query.filter(PalavraChave.situacao.is_(True))
            elif situacao in [False, 'False', 'false', '0', 0]:
                query = query.filter(PalavraChave.situacao.is_(False))

        return query.order_by(PalavraChave.nome.asc()).all()

    @staticmethod
    def obter_por_id(id):
        return PalavraChave.query.get_or_404(id)

    @staticmethod
    def criar(dados):
        nome = dados.get('nome', '').strip()
        situacao = dados.get('situacao', True)
        if isinstance(situacao, str):
            situacao = situacao.lower() in ['true', '1', 'on', 'ativo']

        nova_palavra = PalavraChave(
            nome=nome,
            situacao=situacao,
            data_cadastro=datetime.now(timezone.utc)
        )
        db.session.add(nova_palavra)
        db.session.commit()
        return nova_palavra

    @staticmethod
    def atualizar(id, dados):
        palavra = PalavraChave.query.get_or_404(id)
        if 'nome' in dados:
            palavra.nome = dados.get('nome', '').strip()
        if 'situacao' in dados:
            sit = dados.get('situacao')
            palavra.situacao = sit.lower() in ['true', '1', 'on', 'ativo'] if isinstance(sit, str) else bool(sit)

        palavra.data_alteracao = datetime.now(timezone.utc)
        db.session.commit()
        return palavra

    @staticmethod
    def alternar_situacao(id):
        palavra = PalavraChave.query.get_or_404(id)
        palavra.situacao = not palavra.situacao
        palavra.data_alteracao = datetime.now(timezone.utc)
        db.session.commit()
        return palavra

    @staticmethod
    def excluir(id):
        palavra = PalavraChave.query.get_or_404(id)
        db.session.delete(palavra)
        db.session.commit()
        return True
