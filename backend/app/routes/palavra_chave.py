from flask import Blueprint
from flask_jwt_extended import jwt_required
from app.controllers.palavra_chave import listar_palavras_chave

palavra_chave_bp = Blueprint('palavra_chave', __name__)


@palavra_chave_bp.route('/', methods=['GET'])
@jwt_required()
def listar():
    return listar_palavras_chave()

