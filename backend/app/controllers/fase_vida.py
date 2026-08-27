from flask import request, jsonify
from flask_jwt_extended import get_jwt_identity
from app.models import db
from app.models.fase_vida import FaseVida

def listar_fases_vida():
    query = FaseVida.query
    
    nome_filtro = request.args.get('nome')
    if nome_filtro:
        query = query.filter(FaseVida.nome.ilike(f"%{nome_filtro.strip()}%"))
        
    situacao_filtro = request.args.get('situacao')
    if situacao_filtro is not None and situacao_filtro.strip() != "":
        if situacao_filtro.strip().lower() in ['true', '1']:
            query = query.filter(FaseVida.situacao == True)
        elif situacao_filtro.strip().lower() in ['false', '0']:
            query = query.filter(FaseVida.situacao == False)
            
    fases = query.order_by(FaseVida.id).all()
    
    return jsonify({
        "fases_vida": [
            {
                "id": f.id,
                "nome": f.nome,
                "descricao": f.descricao,
                "situacao": f.situacao
            }
            for f in fases
        ]
    }), 200

def cadastrar_fase_vida():
    dados = request.get_json()
    
    if not dados:
        return jsonify({"mensagem": "Corpo da requisicao vazio"}), 400
        
    nome = dados.get('nome')
    if not nome or not str(nome).strip():
        return jsonify({"mensagem": "O campo nome e obrigatorio"}), 400
        
    nome_limpo = str(nome).strip()
    
    if FaseVida.query.filter_by(nome=nome_limpo).first():
        return jsonify({"mensagem": "Fase da vida ja cadastrada"}), 400
        
    usuario_id = get_jwt_identity()
    
    nova_fase = FaseVida(
        nome=nome_limpo,
        descricao=dados.get('descricao'),
        situacao=dados.get('situacao', True),
        usuario_cadastro=usuario_id
    )
    
    db.session.add(nova_fase)
    db.session.commit()
    
    return jsonify({"mensagem": "Fase da vida cadastrada com sucesso"}), 201

def editar_fase_vida(id):
    fase = db.session.get(FaseVida, id)
    
    if not fase:
        return jsonify({"mensagem": "Fase da vida nao encontrada"}), 404
        
    dados = request.get_json()
    if not dados:
        return jsonify({"mensagem": "Corpo da requisicao vazio"}), 400
        
    if 'nome' in dados:
        nome = dados['nome']
        if not nome or not str(nome).strip():
            return jsonify({"mensagem": "O campo nome nao pode ser vazio"}), 400
            
        nome_limpo = str(nome).strip()
        existente = FaseVida.query.filter_by(nome=nome_limpo).first()
        if existente and existente.id != fase.id:
            return jsonify({"mensagem": "Ja existe outra fase da vida com este nome"}), 400
            
        fase.nome = nome_limpo
        
    if 'descricao' in dados:
        fase.descricao = dados['descricao']
        
    if 'situacao' in dados:
        fase.situacao = dados['situacao']
        
    usuario_id = get_jwt_identity()
    fase.usuario_alteracao = usuario_id
    fase.data_alteracao = db.func.current_timestamp()
    
    db.session.commit()
    
    return jsonify({"mensagem": "Fase da vida atualizada com sucesso"}), 200

