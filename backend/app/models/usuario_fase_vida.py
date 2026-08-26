from app.models import db


class UsuarioFaseVida(db.Model):
    __tablename__ = 'UsuarioFaseVida'

    id = db.Column(db.Integer, primary_key=True)
    usuario_id = db.Column(db.Integer, db.ForeignKey('Usuario.id', ondelete='CASCADE'))
    fase_vida_id = db.Column(db.Integer, db.ForeignKey('FaseVida.id', ondelete='CASCADE'))
    data_cadastro = db.Column(db.DateTime(timezone=True), server_default=db.func.current_timestamp(), nullable=False)
    situacao = db.Column(db.Boolean, default=True, nullable=False)
    data_alteracao = db.Column(db.DateTime(timezone=True))
