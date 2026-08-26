from sqlalchemy.dialects.postgresql import ENUM
from app.models import db
from app.models.enums import PerfilUsuarioEnum


class Usuario(db.Model):
    __tablename__ = 'usuario'

    id = db.Column(db.Integer, primary_key=True)
    nome = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(150), unique=True, nullable=False)
    senha = db.Column(db.String(255), nullable=False)
    telefone = db.Column(db.String(20))
    situacao = db.Column(db.Boolean, default=True, nullable=False)
    data_nascimento = db.Column(db.Date)
    data_cadastro = db.Column(db.DateTime(timezone=True), server_default=db.func.current_timestamp(), nullable=False)
    data_alteracao = db.Column(db.DateTime(timezone=True))
    perfil = db.Column(
        ENUM(PerfilUsuarioEnum, name='enum_usuario_perfil', create_type=False, values_callable=lambda x: [e.value for e in x]),
        default=PerfilUsuarioEnum.USUARIO
    )
    permite_notificacao = db.Column(db.Boolean, default=True)
    permite_compartilhar_dados = db.Column(db.Boolean, default=False)
    sexo = db.Column(db.String(1), default='F')
