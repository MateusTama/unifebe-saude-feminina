from app.models import db


class ArtigoFavorito(db.Model):
    __tablename__ = 'artigofavorito'

    id = db.Column(db.Integer, primary_key=True)
    usuario_id = db.Column(db.Integer, db.ForeignKey('usuario.id', ondelete='CASCADE'), nullable=False)
    artigo_id = db.Column(db.Integer, db.ForeignKey('artigo.id', ondelete='CASCADE'), nullable=False)
    data_cadastro = db.Column(db.DateTime(timezone=True), server_default=db.func.current_timestamp(), nullable=False)

    __table_args__ = (
        db.UniqueConstraint('usuario_id', 'artigo_id', name='uq_usuario_artigo_favorito'),
    )

    usuario = db.relationship('Usuario', backref=db.backref('artigos_favoritos', lazy=True, cascade='all, delete-orphan'))
    artigo = db.relationship('Artigo', backref=db.backref('favoritos', lazy=True, cascade='all, delete-orphan'))

