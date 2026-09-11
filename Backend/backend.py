import sqlite3

def inicializar_banco():
    conexao = sqlite3.connect('Exu di dado/banco.db')
    cursor = conexao.cursor()

    with open('Exu di dado/script.sql', 'r', encoding='utf-8') as arq:
        script = arq.read()
        cursor.executescript(script)

    conexao.commit()
    conexao.close()
    print("Banco de dados SQLite inicializado com sucesso!")

if __name__ == '__main__':
    inicializar_banco()
