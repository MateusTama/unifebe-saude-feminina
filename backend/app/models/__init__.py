from flask_sqlalchemy import SQLAlchemy

# Instância central do banco de dados
db = SQLAlchemy()

# Importa todos os models para garantir que o SQLAlchemy os registre
# antes de qualquer criação de tabelas ou query.
from app.models.enums import PerfilUsuarioEnum, IntensidadeCicloEnum  # noqa: F401

from app.models.usuario import Usuario  # noqa: F401
from app.models.fase_vida import FaseVida  # noqa: F401
from app.models.usuario_fase_vida import UsuarioFaseVida  # noqa: F401

from app.models.tema import Tema  # noqa: F401
from app.models.palavra_chave import PalavraChave  # noqa: F401
from app.models.artigo import Artigo  # noqa: F401
from app.models.artigo_palavra_chave import ArtigoPalavraChave  # noqa: F401
from app.models.artigo_fase_vida import ArtigoFaseVida  # noqa: F401

from app.models.sintoma import Sintoma  # noqa: F401
from app.models.registro_diario import RegistroDiario  # noqa: F401
from app.models.registro_sintoma import RegistroSintoma  # noqa: F401

from app.models.ciclo_menstrual import CicloMenstrual  # noqa: F401
from app.models.lembrete import Lembrete  # noqa: F401
