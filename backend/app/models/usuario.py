from sqlalchemy.dialects.postgresql import ENUM
from sqlalchemy.orm import validates
from werkzeug.security import generate_password_hash
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

    @validates('nome')
    def validate_nome(self, key, value):
        if not value or not value.strip():
            raise ValueError("O campo nome e obrigatorio")
        return value.strip()

    @validates('email')
    def validate_email(self, key, value):
        if not value or "@" not in value:
            raise ValueError("Email invalido")
        email_limpo = value.strip().lower()
        existing = Usuario.query.filter_by(email=email_limpo).first()
        if existing and existing.id != self.id:
            raise ValueError("Email ja cadastrado")
        return email_limpo

    @validates('senha')
    def validate_senha(self, key, value):
        if not value:
            raise ValueError("O campo senha e obrigatorio")
        if value.startswith(('pbkdf2:', 'scrypt:', 'bcrypt:')):
            return value
        return generate_password_hash(value)
