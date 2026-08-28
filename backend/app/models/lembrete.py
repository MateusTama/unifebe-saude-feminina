from sqlalchemy.orm import validates
from app.models import db


class Lembrete(db.Model):
    __tablename__ = 'lembrete'

    id = db.Column(db.Integer, primary_key=True)
    usuario_id = db.Column(db.Integer, db.ForeignKey('usuario.id', ondelete='CASCADE'))
    titulo = db.Column(db.String(100), nullable=False)
    descricao = db.Column(db.String(10000))
    data_hora = db.Column(db.DateTime(timezone=True))
    situacao = db.Column(db.Boolean, default=True, nullable=False)

    @validates('usuario_id')
    def validate_usuario_id(self, key, value):
        if not value:
            raise ValueError("O usuario e obrigatorio")
        return value

    @validates('titulo')
    def validate_titulo(self, key, value):
        if not value or not str(value).strip():
            raise ValueError("O campo titulo e obrigatorio")
        titulo_limpo = str(value).strip()
        if len(titulo_limpo) > 100:
            raise ValueError("O campo titulo nao pode ultrapassar 100 caracteres")
        return titulo_limpo

    @validates('descricao')
    def validate_descricao(self, key, value):
        if value and len(str(value).strip()) > 10000:
            raise ValueError("A descricao nao pode ultrapassar 10000 caracteres")
        return str(value).strip() if value else None


