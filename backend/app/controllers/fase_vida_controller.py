from datetime import datetime, timezone
from app.models import db, FaseVida


class FaseVidaController:
    @staticmethod
    def listar(busca=None, situacao=None):
        query = FaseVida.query
        if busca:
            termo = f"%{busca.strip()}%"
            query = query.filter((FaseVida.nome.ilike(termo)) | (FaseVida.descricao.ilike(termo)))

        if situacao is not None and situacao != '':
            if situacao in [True, 'True', 'true', '1', 1]:
                query = query.filter(FaseVida.situacao.is_(True))
            elif situacao in [False, 'False', 'false', '0', 0]:
                query = query.filter(FaseVida.situacao.is_(False))

        return query.order_by(FaseVida.nome.asc()).all()

    @staticmethod
    def obter_por_id(id):
        return FaseVida.query.get_or_404(id)

    @staticmethod
    def criar(dados):
        nome = dados.get('nome', '').strip()
        descricao = dados.get('descricao', '').strip()
        situacao = dados.get('situacao', True)

        if isinstance(situacao, str):
            situacao = situacao.lower() in ['true', '1', 'on', 'ativo']

        nova_fase = FaseVida(
            nome=nome,
            descricao=descricao,
            situacao=situacao,
            data_cadastro=datetime.now(timezone.utc)
        )
        db.session.add(nova_fase)
        db.session.commit()
        return nova_fase

    @staticmethod
    def atualizar(id, dados):
        fase = FaseVida.query.get_or_404(id)
        if 'nome' in dados:
            fase.nome = dados.get('nome', '').strip()
        if 'descricao' in dados:
            fase.descricao = dados.get('descricao', '').strip()
        if 'situacao' in dados:
            sit = dados.get('situacao')
            fase.situacao = sit.lower() in ['true', '1', 'on', 'ativo'] if isinstance(sit, str) else bool(sit)

        fase.data_alteracao = datetime.now(timezone.utc)
        db.session.commit()
        return fase

    @staticmethod
    def alternar_situacao(id):
        fase = FaseVida.query.get_or_404(id)
        fase.situacao = not fase.situacao
        fase.data_alteracao = datetime.now(timezone.utc)
        db.session.commit()
        return fase

    @staticmethod
    def excluir(id):
        fase = FaseVida.query.get_or_404(id)
        db.session.delete(fase)
        db.session.commit()
        return True
