from flask import request, jsonify
from flask_jwt_extended import get_jwt_identity
from app.models import db
from app.models.lembrete import Lembrete

def cadastrar_lembrete():
    dados = request.get_json()
    
    if not dados:
        return jsonify({"mensagem": "Corpo da requisicao vazio"}), 400
        
    titulo = dados.get('titulo')
    if not titulo or not str(titulo).strip():
        return jsonify({"mensagem": "O campo titulo e obrigatorio"}), 400
        
    usuario_id = get_jwt_identity()
    
    novo_lembrete = Lembrete(
        usuario_id=usuario_id,
        titulo=str(titulo).strip(),
        descricao=dados.get('descricao'),
        data_hora=dados.get('data_hora'),
        situacao=dados.get('situacao', True)
    )
    
    db.session.add(novo_lembrete)
    db.session.commit()
    
    return jsonify({"mensagem": "Lembrete cadastrado com sucesso"}), 201
