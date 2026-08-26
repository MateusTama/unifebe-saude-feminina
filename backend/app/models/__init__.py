from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

from app.models.enums import PerfilUsuarioEnum, IntensidadeCicloEnum

from app.models.usuario import Usuario
from app.models.fase_vida import FaseVida
from app.models.usuario_fase_vida import UsuarioFaseVida

from app.models.tema import Tema
from app.models.palavra_chave import PalavraChave
from app.models.artigo import Artigo  # noqa: F401
from app.models.artigo_palavra_chave import ArtigoPalavraChave
from app.models.artigo_fase_vida import ArtigoFaseVida

from app.models.sintoma import Sintoma
from app.models.registro_diario import RegistroDiario
from app.models.registro_sintoma import RegistroSintoma

from app.models.ciclo_menstrual import CicloMenstrual
from app.models.lembrete import Lembrete
