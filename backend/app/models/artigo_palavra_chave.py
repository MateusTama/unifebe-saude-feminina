from app.models import db


class ArtigoPalavraChave(db.Model):
    __tablename__ = 'ArtigoPalavraChave'

    id = db.Column(db.Integer, primary_key=True)
    artigo_id = db.Column(db.Integer, db.ForeignKey('Artigo.id', ondelete='CASCADE'))
    palavra_chave_id = db.Column(db.Integer, db.ForeignKey('PalavraChave.id', ondelete='CASCADE'))