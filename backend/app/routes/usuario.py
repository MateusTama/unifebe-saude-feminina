from flask import Blueprint
from flask_jwt_extended import jwt_required
from app.controllers.usuario import cadastrar_usuario, login_usuario, editar_usuario, obter_perfil_usuario, listar_usuarios

usuario_bp = Blueprint('usuario', __name__)

@usuario_bp.route('/', methods=['GET'])
@jwt_required()
def listar():
    return listar_usuarios()

@usuario_bp.route('/cadastro', methods=['POST'])
def cadastro():
    return cadastrar_usuario()

@usuario_bp.route('/login', methods=['POST'])
def login():
    return login_usuario()

@usuario_bp.route('/perfil', methods=['GET'])
@jwt_required()
def perfil():
    return obter_perfil_usuario()

@usuario_bp.route('/editar', methods=['PUT', 'PATCH'])
@jwt_required()
def editar():
    return editar_usuario()
