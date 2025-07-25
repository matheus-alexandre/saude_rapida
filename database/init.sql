CREATE DATABASE IF NOT EXISTS saude_rapida CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE USER IF NOT EXISTS 'saude_admin'@'%' IDENTIFIED BY '@senhasuperforte123@321@';
GRANT ALL PRIVILEGES ON saude_rapida.* TO 'saude_admin'@'%';
FLUSH PRIVILEGES;

USE saude_rapida;

CREATE TABLE IF NOT EXISTS saude_rapida.triagem (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_name VARCHAR(100) NOT NULL,
    user_priority ENUM('alta', 'media', 'baixa') NOT NULL DEFAULT 'media',
    reason TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    user_status ENUM('aguardando', 'atendimento', 'atendido') NOT NULL DEFAULT 'atendimento'
);
