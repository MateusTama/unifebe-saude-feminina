from app.models import db


class Lembrete(db.Model):
    __tablename__ = 'lembrete'

    id = db.Column(db.Integer, primary_key=True)
    usuario_id = db.Column(db.Integer, db.ForeignKey('usuario.id', ondelete='CASCADE'))
    titulo = db.Column(db.String(100), nullable=False)
    descricao = db.Column(db.String(10000))
    data_hora = db.Column(db.DateTime(timezone=True))
    situacao = db.Column(db.Boolean, default=True, nullable=False)
