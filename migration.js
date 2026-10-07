const db = require("./db")

async function criar_tabela(){
    try{  
        await db.pool.query(`
            DROP TABLE IF EXISTS cliente;
            CREATE TABLE cliente (
            id int NOT NULL AUTO_INCREMENT,
            nome varchar(50) NOT NULL,
            celular char(14) NOT NULL,
            email varchar(50) NOT NULL,
            senha varchar(512) NOT NULL,
            PRIMARY KEY (id),
            UNIQUE KEY email (email)
            ) ENGINE=InnoDB AUTO_INCREMENT=322 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
            iNSERT INTO cliente VALUES (321,'Rafael Carvalho','(43)98888-0000','rafael.carvalho@gmail.com','$2b$10$4Yj9NbpPqUoV8EmK/wvfYu87gw2H0QUsMCRiH4UQ06.0ofmLtirAq');
                  
       `)
       console.log("Estrutura e dados da tabela 'cliente' criado com sucesso!")
       process.exit(0);

    } catch (error) {
        console.log(error)
         process.exit(1);
    }
}
criar_tabela()
