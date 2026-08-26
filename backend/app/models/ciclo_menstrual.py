from sqlalchemy.dialects.postgresql import ENUM
from app.models import db
from app.models.enums import IntensidadeCicloEnum


class CicloMenstrual(db.Model):
    __tablename__ = 'CicloMenstrual'

    id = db.Column(db.Integer, primary_key=True)
    usuario_id = db.Column(db.Integer, db.ForeignKey('Usuario.id', ondelete='CASCADE'))
    data_inicio = db.Column(db.Date, nullable=False)
    data_fim = db.Column(db.Date)
    intensidade = db.Column(
        ENUM(IntensidadeCicloEnum, name='enum_ciclomenstrual_intensidade', create_type=False)
    )
    data_cadastro = db.Column(db.DateTime(timezone=True), server_default=db.func.current_timestamp(), nullable=False)
    situacao = db.Column(db.Boolean, default=True, nullable=False)
    data_alteracao = db.Column(db.DateTime(timezone=True))
