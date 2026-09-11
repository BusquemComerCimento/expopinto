CREATE DATABASE db_celiadesgracada;
USE db_celiadesgracada;
CREATE TABLE usuarios(
    id INTEGER IDENTITY(1,1) PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    senha VARCHAR(255) NOT NULL
);
