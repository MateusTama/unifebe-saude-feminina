from flask import Blueprint
from flask_jwt_extended import jwt_required
from app.controllers.lembrete import cadastrar_lembrete, listar_lembretes, obter_lembrete, editar_lembrete

lembrete_bp = Blueprint('lembrete', __name__)

@lembrete_bp.route('/', methods=['GET'])
@jwt_required()
def listar():
    return listar_lembretes()

@lembrete_bp.route('/<int:id>', methods=['GET'])
@jwt_required()
def obter(id):
    return obter_lembrete(id)

@lembrete_bp.route('/', methods=['POST'])
@jwt_required()
def cadastrar():
    return cadastrar_lembrete()

@lembrete_bp.route('/<int:id>', methods=['PUT', 'PATCH'])
@jwt_required()
def editar(id):
    return editar_lembrete(id)
