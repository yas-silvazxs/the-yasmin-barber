const db = require("./db")

async function criar_tabelas() {
    try {
        // Tabela de clientes (NÃO apaga mais os clientes a cada start)
        await db.pool.query(`
            CREATE TABLE IF NOT EXISTS cliente (
                id int NOT NULL AUTO_INCREMENT,
                nome varchar(50) NOT NULL,
                celular char(14) NOT NULL,
                email varchar(50) NOT NULL,
                senha varchar(512) NOT NULL,
                PRIMARY KEY (id),
                UNIQUE KEY email (email)
            ) ENGINE=InnoDB AUTO_INCREMENT=322 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

            INSERT IGNORE INTO cliente VALUES (321,'Rafael Carvalho','(43)98888-0000','rafael.carvalho@gmail.com','$2b$10$4Yj9NbpPqUoV8EmK/wvfYu87gw2H0QUsMCRiH4UQ06.0ofmLtirAq');
        `)

        // Tabela de produtos (recriada a cada start para manter o catálogo atualizado)
        await db.pool.query(`
            DROP TABLE IF EXISTS produto;
            CREATE TABLE produto (
                id int NOT NULL AUTO_INCREMENT,
                nome varchar(80) NOT NULL,
                descricao varchar(255) NOT NULL,
                categoria varchar(30) NOT NULL,
                preco decimal(10,2) NOT NULL,
                icone varchar(10) NOT NULL,
                estoque int NOT NULL DEFAULT 0,
                PRIMARY KEY (id)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

            INSERT INTO produto (nome, descricao, categoria, preco, icone, estoque) VALUES
            ('Pomada Modeladora Matte', 'Fixação forte com acabamento fosco. Ideal para texturizados e crop. 120 g.', 'Cabelo', 49.90, '💈', 25),
            ('Pomada Efeito Brilho', 'Brilho intenso e fixação média, perfeita para pompadour e quiff. 120 g.', 'Cabelo', 52.90, '✨', 18),
            ('Cera Modeladora Capilar', 'Textura maleável e acabamento natural, fácil de reestilizar durante o dia. 80 g.', 'Cabelo', 39.90, '🧴', 30),
            ('Shampoo Antiqueda', 'Limpeza profunda com extrato de cafeína e mentol. Fortalece os fios. 250 ml.', 'Cabelo', 44.90, '🚿', 20),
            ('Óleo para Barba', 'Hidrata, dá brilho e controla o frizz. Aroma amadeirado. 30 ml.', 'Barba', 42.90, '🪵', 22),
            ('Balm Hidratante para Barba', 'Amacia e disciplina os fios, com manteiga de karité e cera de abelha. 60 g.', 'Barba', 47.90, '🧔', 15),
            ('Shampoo para Barba', 'Limpa sem ressecar a pele nem os fios. Refrescância de eucalipto. 200 ml.', 'Barba', 34.90, '🫧', 28),
            ('Pente de Madeira para Barba', 'Pente artesanal em madeira, dentes finos e antiestático.', 'Acessórios', 29.90, '🪮', 40),
            ('Navalha Profissional', 'Navalha em aço inox com cabo ergonômico, para acabamento preciso.', 'Acessórios', 79.90, '🔪', 10),
            ('Kit Presente Barbearia', 'Pomada matte, óleo de barba e pente de madeira em caixa presente.', 'Kits', 119.90, '🎁', 8);
        `)

        console.log("Tabelas 'cliente' e 'produto' prontas, produtos cadastrados com sucesso!")
        process.exit(0)
    } catch (error) {
        console.log(error)
        process.exit(1)
    }
}
criar_tabelas()
