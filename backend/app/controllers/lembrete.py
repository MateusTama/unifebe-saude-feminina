from flask import request, jsonify
from flask_jwt_extended import get_jwt_identity
from app.models import db
from app.models.lembrete import Lembrete

def cadastrar_lembrete():
    dados = request.get_json()
    
    if not dados:
        return jsonify({"mensagem": "Corpo da requisicao vazio"}), 400
        
    usuario_id = get_jwt_identity()
    
    try:
        novo_lembrete = Lembrete(
            usuario_id=usuario_id,
            titulo=dados.get('titulo'),
            descricao=dados.get('descricao'),
            data_hora=dados.get('data_hora'),
            situacao=dados.get('situacao', True)
        )
        
        db.session.add(novo_lembrete)
        db.session.commit()
    except ValueError as e:
        return jsonify({"mensagem": str(e)}), 400
        
    return jsonify({"mensagem": "Lembrete cadastrado com sucesso"}), 201

def listar_lembretes():
    usuario_id = get_jwt_identity()
    lembretes = Lembrete.query.filter_by(usuario_id=usuario_id).order_by(Lembrete.data_hora.asc(), Lembrete.id.asc()).all()
    
    return jsonify({
        "lembretes": [
            {
                "id": l.id,
                "titulo": l.titulo,
                "descricao": l.descricao,
                "data_hora": l.data_hora.isoformat() if l.data_hora else None,
                "situacao": l.situacao
            }
            for l in lembretes
        ]
    }), 200

def obter_lembrete(id):
    usuario_id = get_jwt_identity()
    lembrete = db.session.get(Lembrete, id)
    
    if not lembrete or str(lembrete.usuario_id) != str(usuario_id):
        return jsonify({"mensagem": "Lembrete nao encontrado"}), 404
        
    return jsonify({
        "id": lembrete.id,
        "titulo": lembrete.titulo,
        "descricao": lembrete.descricao,
        "data_hora": lembrete.data_hora.isoformat() if lembrete.data_hora else None,
        "situacao": lembrete.situacao
    }), 200

def editar_lembrete(id):
    usuario_id = get_jwt_identity()
    lembrete = db.session.get(Lembrete, id)
    
    if not lembrete or str(lembrete.usuario_id) != str(usuario_id):
        return jsonify({"mensagem": "Lembrete nao encontrado"}), 404
        
    dados = request.get_json()
    if not dados:
        return jsonify({"mensagem": "Corpo da requisicao vazio"}), 400
        
    try:
        if 'titulo' in dados:
            lembrete.titulo = dados['titulo']
            
        if 'descricao' in dados:
            lembrete.descricao = dados['descricao']
            
        if 'data_hora' in dados:
            lembrete.data_hora = dados['data_hora']
            
        if 'situacao' in dados:
            lembrete.situacao = dados['situacao']
            
        db.session.commit()
    except ValueError as e:
        return jsonify({"mensagem": str(e)}), 400
        
    return jsonify({"mensagem": "Lembrete atualizado com sucesso"}), 200

