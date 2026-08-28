from app.models import db


class Artigo(db.Model):
    __tablename__ = 'artigo'

    id = db.Column(db.Integer, primary_key=True)
    tema_id = db.Column(db.Integer, db.ForeignKey('tema.id', ondelete='SET NULL'))
    titulo = db.Column(db.String(200), nullable=False)
    conteudo = db.Column(db.Text)
    data_publicacao = db.Column(db.DateTime(timezone=True))
    data_cadastro = db.Column(db.DateTime(timezone=True), server_default=db.func.current_timestamp(), nullable=False)
    usuario_cadastro = db.Column(db.Integer, db.ForeignKey('usuario.id', ondelete='SET NULL'))
    data_alteracao = db.Column(db.DateTime(timezone=True))
    usuario_alteracao = db.Column(db.Integer, db.ForeignKey('usuario.id', ondelete='SET NULL'))
    situacao = db.Column(db.Boolean, default=True, nullable=False)

    # Relacionamento com Tema
    tema = db.relationship('Tema', foreign_keys=[tema_id], backref=db.backref('artigos', lazy=True))
