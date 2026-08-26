import enum


class PerfilUsuarioEnum(str, enum.Enum):
    ADMINISTRADOR = "Administrador"
    USUARIO = "Usuario"


class IntensidadeCicloEnum(str, enum.Enum):
    LEVE = "1-Leve"
    MODERADO = "2-Moderado"
    INTENSO = "3-Intenso"
