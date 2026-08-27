from flask import Blueprint
from flask_jwt_extended import jwt_required
from app.controllers.fase_vida import listar_fases_vida, cadastrar_fase_vida, editar_fase_vida

fase_vida_bp = Blueprint('fase_vida', __name__)

@fase_vida_bp.route('/', methods=['GET'])
@jwt_required()
def listar():
    return listar_fases_vida()

@fase_vida_bp.route('/', methods=['POST'])
@jwt_required()
def cadastrar():
    return cadastrar_fase_vida()

@fase_vida_bp.route('/<int:id>', methods=['PUT', 'PATCH'])
@jwt_required()
def editar(id):
    return editar_fase_vida(id)
