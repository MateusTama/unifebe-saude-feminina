from sqlalchemy.orm import validates
from app.models import db


class FaseVida(db.Model):
    __tablename__ = 'fasevida'

    id = db.Column(db.Integer, primary_key=True)
    nome = db.Column(db.String(100), unique=True, nullable=False)
    descricao = db.Column(db.String(3000))
    data_cadastro = db.Column(db.DateTime(timezone=True), server_default=db.func.current_timestamp(), nullable=False)
    usuario_cadastro = db.Column(db.Integer, db.ForeignKey('usuario.id', ondelete='SET NULL'))
    situacao = db.Column(db.Boolean, default=True, nullable=False)
    data_alteracao = db.Column(db.DateTime(timezone=True))
    usuario_alteracao = db.Column(db.Integer, db.ForeignKey('usuario.id', ondelete='SET NULL'))

    @validates('nome')
    def validate_nome(self, key, value):
        if not value or not str(value).strip():
            raise ValueError("O campo nome e obrigatorio")
        nome_limpo = str(value).strip()
        if len(nome_limpo) > 100:
            raise ValueError("O campo nome nao pode ultrapassar 100 caracteres")
        existente = FaseVida.query.filter_by(nome=nome_limpo).first()
        if existente and existente.id != self.id:
            raise ValueError("Ja existe uma fase da vida cadastrada com este nome")
        return nome_limpo

    @validates('descricao')
    def validate_descricao(self, key, value):
        if value and len(str(value).strip()) > 3000:
            raise ValueError("A descricao nao pode ultrapassar 3000 caracteres")
        return str(value).strip() if value else None


