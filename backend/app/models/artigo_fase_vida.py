from app.models import db


class ArtigoFaseVida(db.Model):
    __tablename__ = 'artigofasevida'

    id = db.Column(db.Integer, primary_key=True)
    fase_vida_id = db.Column(db.Integer, db.ForeignKey('fasevida.id', ondelete='CASCADE'))
    artigo_id = db.Column(db.Integer, db.ForeignKey('artigo.id', ondelete='CASCADE'))
    situacao = db.Column(db.Boolean, default=True, nullable=False)
