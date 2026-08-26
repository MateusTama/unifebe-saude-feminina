from app.models import db


class RegistroDiario(db.Model):
    __tablename__ = 'RegistroDiario'
    __table_args__ = (
        db.UniqueConstraint('usuario_id', 'data'),
    )

    id = db.Column(db.Integer, primary_key=True)
    usuario_id = db.Column(db.Integer, db.ForeignKey('Usuario.id', ondelete='CASCADE'))
    data = db.Column(db.Date, nullable=False)
    observacoes = db.Column(db.String(10000))
