from flask import Flask, jsonify
app = Flask(__name__)

@app.route('/', methods=['GET'])
def status_api():
    return jsonify({
        "status": "sucesso",
        "mensagem": "API do Projeto Integrador rodando com sucesso!"
    })
if __name__ == '__main__':
    app.run(debug=True)
from flask import Flask, jsonify, request
from flask_cors import CORS
from database import get_db_connection

app = Flask(__name__)
CORS(app)

@app.route('/cursos', methods=['GET'])
def listar_cursos():
    conn = get_db_connection()
    cursos_cursor = conn.execute('SELECT * FROM cursos').fetchall()
    conn.close()
    lista_cursos = [dict(curso) for curso in cursos_cursor]
    
    return jsonify(lista_cursos), 200