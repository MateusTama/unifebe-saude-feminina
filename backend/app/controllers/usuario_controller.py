from datetime import datetime, timezone
from app.models import db, Usuario, PerfilUsuarioEnum


class UsuarioController:
    @staticmethod
    def listar(busca=None, perfil=None, situacao=None):
        query = Usuario.query
        if busca:
            termo = f"%{busca.strip()}%"
            query = query.filter((Usuario.nome.ilike(termo)) | (Usuario.email.ilike(termo)))

        if perfil:
            if isinstance(perfil, str):
                if perfil.lower() in ['admin', 'administrador']:
                    query = query.filter(Usuario.perfil == PerfilUsuarioEnum.ADMINISTRADOR)
                elif perfil.lower() in ['user', 'usuario']:
                    query = query.filter(Usuario.perfil == PerfilUsuarioEnum.USUARIO)
            else:
                query = query.filter(Usuario.perfil == perfil)

        if situacao is not None and situacao != '':
            if situacao in [True, 'True', 'true', '1', 1]:
                query = query.filter(Usuario.situacao.is_(True))
            elif situacao in [False, 'False', 'false', '0', 0]:
                query = query.filter(Usuario.situacao.is_(False))

        return query.order_by(Usuario.nome.asc()).all()

    @staticmethod
    def obter_por_id(id):
        return Usuario.query.get_or_404(id)

    @staticmethod
    def alternar_situacao(id):
        usuario = Usuario.query.get_or_404(id)
        usuario.situacao = not usuario.situacao
        usuario.data_alteracao = datetime.now(timezone.utc)
        db.session.commit()
        return usuario
