from app.models import db


class ArtigoPalavraChave(db.Model):
    __tablename__ = 'artigopalavrachave'

    id = db.Column(db.Integer, primary_key=True)
    artigo_id = db.Column(db.Integer, db.ForeignKey('artigo.id', ondelete='CASCADE'))
    palavra_chave_id = db.Column(db.Integer, db.ForeignKey('palavrachave.id', ondelete='CASCADE'))