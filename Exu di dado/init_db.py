import sqlite3
from contextlib import closing
from pathlib import Path


def inicializar_banco(caminho=None):
    pasta = Path(__file__).resolve().parent
    destino = Path(caminho) if caminho else pasta / 'banco.db'
    with closing(sqlite3.connect(destino)) as conexao:
        conexao.execute('PRAGMA foreign_keys = ON')
        existente = conexao.execute("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'").fetchall()
        if existente:
            raise RuntimeError('O banco já contém tabelas. Use um arquivo novo; este inicializador não migra nem apaga dados existentes.')
        conexao.executescript((pasta / 'script.sql').read_text(encoding='utf-8'))
    print('Banco de dados SQLite inicializado com sucesso!')


if __name__ == '__main__':
    inicializar_banco()