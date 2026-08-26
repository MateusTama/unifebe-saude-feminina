from app.models import db


class RegistroSintoma(db.Model):
    __tablename__ = 'registrosintoma'

    id = db.Column(db.Integer, primary_key=True)
    registro_diario_id = db.Column(db.Integer, db.ForeignKey('registrodiario.id', ondelete='CASCADE'))
    sintoma_id = db.Column(db.Integer, db.ForeignKey('sintoma.id', ondelete='CASCADE'))
    situacao = db.Column(db.Boolean, default=True, nullable=False)
