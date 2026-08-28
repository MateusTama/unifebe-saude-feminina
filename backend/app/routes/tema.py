from flask import Blueprint
from flask_jwt_extended import jwt_required
from app.controllers.tema import listar_temas

tema_bp = Blueprint('tema', __name__)


@tema_bp.route('/', methods=['GET'])
@jwt_required()
def listar():
    return listar_temas()

