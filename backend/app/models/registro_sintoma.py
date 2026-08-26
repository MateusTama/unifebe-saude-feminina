from app.models import db


class RegistroSintoma(db.Model):
    __tablename__ = 'RegistroSintoma'

    id = db.Column(db.Integer, primary_key=True)
    registro_diario_id = db.Column(db.Integer, db.ForeignKey('RegistroDiario.id', ondelete='CASCADE'))
    sintoma_id = db.Column(db.Integer, db.ForeignKey('Sintoma.id', ondelete='CASCADE'))
    situacao = db.Column(db.Boolean, default=True, nullable=False)
