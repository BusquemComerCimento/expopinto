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
