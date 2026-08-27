from flask import Blueprint
from flask_jwt_extended import jwt_required
from app.controllers.lembrete import cadastrar_lembrete

lembrete_bp = Blueprint('lembrete', __name__)

@lembrete_bp.route('/', methods=['POST'])
@jwt_required()
def cadastrar():
    return cadastrar_lembrete()
