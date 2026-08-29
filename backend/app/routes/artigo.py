from flask import Blueprint
from flask_jwt_extended import jwt_required
from app.controllers.artigo import (
    listar_artigos,
    listar_artigos_favoritos,
    obter_artigo,
    alternar_favorito_artigo,
)

artigo_bp = Blueprint('artigo', __name__)


@artigo_bp.route('/', methods=['GET'])
@jwt_required()
def listar():
    return listar_artigos()


@artigo_bp.route('/favoritos', methods=['GET'])
@jwt_required()
def favoritos():
    return listar_artigos_favoritos()


@artigo_bp.route('/<int:id>', methods=['GET'])
@jwt_required()
def obter(id):
    return obter_artigo(id)


@artigo_bp.route('/<int:id>/favoritar', methods=['POST'])
@jwt_required()
def favoritar(id):
    return alternar_favorito_artigo(id)

