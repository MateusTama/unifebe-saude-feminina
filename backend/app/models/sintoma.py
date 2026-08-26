from app.models import db


class Sintoma(db.Model):
    __tablename__ = 'Sintoma'

    id = db.Column(db.Integer, primary_key=True)
    nome = db.Column(db.String(100), nullable=False)
    data_cadastro = db.Column(db.DateTime(timezone=True), server_default=db.func.current_timestamp(), nullable=False)
    usuario_cadastro = db.Column(db.Integer, db.ForeignKey('Usuario.id', ondelete='SET NULL'))
    situacao = db.Column(db.Boolean, default=True, nullable=False)
    data_alteracao = db.Column(db.DateTime(timezone=True))
    usuario_alteracao = db.Column(db.Integer, db.ForeignKey('Usuario.id', ondelete='SET NULL'))
