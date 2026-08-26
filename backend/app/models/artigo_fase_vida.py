from app.models import db


class ArtigoFaseVida(db.Model):
    __tablename__ = 'ArtigoFaseVida'

    id = db.Column(db.Integer, primary_key=True)
    fase_vida_id = db.Column(db.Integer, db.ForeignKey('FaseVida.id', ondelete='CASCADE'))
    artigo_id = db.Column(db.Integer, db.ForeignKey('Artigo.id', ondelete='CASCADE'))
    situacao = db.Column(db.Boolean, default=True, nullable=False)
