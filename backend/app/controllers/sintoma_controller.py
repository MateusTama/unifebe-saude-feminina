from datetime import datetime, timezone
from app.models import db, Sintoma


class SintomaController:
    @staticmethod
    def listar(busca=None, situacao=None):
        query = Sintoma.query
        if busca:
            query = query.filter(Sintoma.nome.ilike(f"%{busca.strip()}%"))

        if situacao is not None and situacao != '':
            if situacao in [True, 'True', 'true', '1', 1]:
                query = query.filter(Sintoma.situacao.is_(True))
            elif situacao in [False, 'False', 'false', '0', 0]:
                query = query.filter(Sintoma.situacao.is_(False))

        return query.order_by(Sintoma.nome.asc()).all()

    @staticmethod
    def obter_por_id(sintoma_id):
        return Sintoma.query.get_or_404(sintoma_id)

    @staticmethod
    def criar(dados):
        nome = dados.get('nome', '').strip()
        situacao = dados.get('situacao', True)
        if isinstance(situacao, str):
            situacao = situacao.lower() in ['true', '1', 'on', 'ativo']

        novo_sintoma = Sintoma(
            nome=nome,
            situacao=situacao,
            data_cadastro=datetime.now(timezone.utc)
        )
        db.session.add(novo_sintoma)
        db.session.commit()
        return novo_sintoma

    @staticmethod
    def atualizar(sintoma_id, dados):
        sintoma = Sintoma.query.get_or_404(sintoma_id)
        if 'nome' in dados:
            sintoma.nome = dados.get('nome', '').strip()
        if 'situacao' in dados:
            sit = dados.get('situacao')
            sintoma.situacao = sit.lower() in ['true', '1', 'on', 'ativo'] if isinstance(sit, str) else bool(sit)

        sintoma.data_alteracao = datetime.now(timezone.utc)
        db.session.commit()
        return sintoma

    @staticmethod
    def alternar_situacao(sintoma_id):
        sintoma = Sintoma.query.get_or_404(sintoma_id)
        sintoma.situacao = not sintoma.situacao
        sintoma.data_alteracao = datetime.now(timezone.utc)
        db.session.commit()
        return sintoma

    @staticmethod
    def excluir(sintoma_id):
        sintoma = Sintoma.query.get_or_404(sintoma_id)
        db.session.delete(sintoma)
        db.session.commit()
        return True
