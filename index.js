// npm i express mysql2 bcrypt jsonwebtoken dotenv cors
const express = require("express")
const app = express()
const port = 3000
app.use(express.json())

const db = require("./db")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const dotenv = require("dotenv")
dotenv.config()
const cors = require("cors")
app.use(cors())

// Cadastro de cliente
app.post("/cliente", async (req, res) => {
    try {
        const cliente = req.body
        const senhaCript = bcrypt.hashSync(cliente.senha, 10)
        cliente.senha = senhaCript

        const resultado = await db.pool.query(
            `INSERT INTO cliente (nome, celular, email, senha) VALUES (?, ?, ?, ?)`,
            [cliente.nome, cliente.celular, cliente.email, cliente.senha]
        )

        res.status(201).json({
            msg: "Cliente cadastrado, ID = " + resultado[0].insertId
        })
    } catch (error) {
        res.status(500).json({ erro: error.message })
    }
})

// Login
app.post("/login", async (req, res) => {
    try {
        const user = req.body
        const resultado = await db.pool.query(
            "SELECT id, nome, email, senha FROM cliente WHERE email = ?",
            [user.email]
        )

        const dados_bd = resultado[0][0]

        if (!dados_bd) {
            return res.status(401).json({ msg: "Email não cadastrado!" })
        }

        const senha_valida = await bcrypt.compare(user.senha, dados_bd.senha)

        if (!senha_valida) {
            return res.status(401).json({ msg: "Credenciais inválidas!" })
        }

        const payload = {
            id: dados_bd.id,
            email: dados_bd.email
        }

        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '2m' })

        return res.status(200).json({
            id: dados_bd.id,
            nome: dados_bd.nome,
            email: dados_bd.email,
            token: token
        })

    } catch (error) {
        res.status(500).json({ erro: error.message })
    }
})

// ---------------- PRODUTOS ----------------
const PRODUTOS_POR_PAGINA = 6

const ORDENACOES = {
    preco_asc: "preco ASC, id ASC",    // menor preço primeiro
    preco_desc: "preco DESC, id ASC"   // maior preço primeiro
}

// pega o valor como texto (se vier repetido na URL, usa o primeiro)
function texto(v) {
    if (Array.isArray(v)) v = v[0]
    return typeof v === "string" ? v.trim() : ""
}

// transforma em número; null se vazio, NaN se inválido
function numero(v) {
    const t = texto(v).replace(",", ".")
    if (t === "") return null
    const n = Number(t)
    return Number.isFinite(n) ? n : NaN
}

// Lista as categorias disponíveis (para montar o filtro no front)
app.get("/produtos/categorias", async (req, res) => {
    try {
        const resultado = await db.pool.query("SELECT DISTINCT categoria FROM produto ORDER BY categoria")
        res.status(200).json(resultado[0].map(l => l.categoria))
    } catch (error) {
        res.status(500).json({ erro: error.message })
    }
})

// Lista de produtos com filtros, ordenação e paginação
// Ex.: /produtos?busca=pomada&categoria=Cabelo&preco_min=30&preco_max=60&ordem=preco_asc&pagina=1
app.get("/produtos", async (req, res) => {
    try {
        const busca = texto(req.query.busca) || texto(req.query.nome)
        const categoria = texto(req.query.categoria)
        const precoMin = numero(req.query.preco_min)
        const precoMax = numero(req.query.preco_max)
        const ordem = texto(req.query.ordem)

        if (Number.isNaN(precoMin) || Number.isNaN(precoMax)) {
            return res.status(400).json({ erro: "preco_min e preco_max devem ser números" })
        }
        if (precoMin !== null && precoMax !== null && precoMin > precoMax) {
            return res.status(400).json({ erro: "preco_min não pode ser maior que preco_max" })
        }
        if (ordem && !ORDENACOES[ordem]) {
            return res.status(400).json({ erro: "ordem deve ser preco_asc ou preco_desc" })
        }

        let pagina = parseInt(texto(req.query.pagina), 10)
        if (!(pagina >= 1)) pagina = 1

        const where = []
        const params = []

        if (busca) {
            // escapa \ % _ para a busca ser literal
            where.push("nome LIKE ?")
            params.push("%" + busca.replace(/[\\%_]/g, "\\$&") + "%")
        }
        if (categoria) {
            where.push("categoria = ?")
            params.push(categoria)
        }
        if (precoMin !== null) {
            where.push("preco >= ?")
            params.push(precoMin)
        }
        if (precoMax !== null) {
            where.push("preco <= ?")
            params.push(precoMax)
        }

        const clausula = where.length ? " WHERE " + where.join(" AND ") : ""

        const contagem = await db.pool.query(
            "SELECT COUNT(*) AS total FROM produto" + clausula,
            params
        )
        const total = contagem[0][0].total
        const totalPaginas = Math.max(1, Math.ceil(total / PRODUTOS_POR_PAGINA))
        if (pagina > totalPaginas) pagina = totalPaginas

        const offset = (pagina - 1) * PRODUTOS_POR_PAGINA
        const resultado = await db.pool.query(
            "SELECT id, nome, descricao, categoria, preco, icone, estoque FROM produto" +
            clausula +
            " ORDER BY " + (ORDENACOES[ordem] || "id ASC") +
            " LIMIT ? OFFSET ?",
            [...params, PRODUTOS_POR_PAGINA, offset]
        )

        res.status(200).json({
            produtos: resultado[0],
            total: total,
            pagina: pagina,
            total_paginas: totalPaginas,
            limite: PRODUTOS_POR_PAGINA
        })
    } catch (error) {
        res.status(500).json({ erro: error.message })
    }
})

// Perfil do cliente (protegida)
app.get("/cliente/perfil", autenticar, async (req, res) => {
    try {
        const id = req.usuario.id
        const result = await db.pool.query("SELECT * FROM cliente WHERE id = ?", [id])
        const perfil = result[0][0]
        delete perfil.senha
        res.status(200).json(perfil)
    } catch (err) {
        res.status(500).json({ erro: 'Erro interno' })
    }
})

// Middleware de autenticação
function autenticar(req, res, next) {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]

    if (token == null) {
        return res.status(401).json({
            erro: "Token não enviado, usar Authorization Bearer <token>"
        })
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, usuario) => {
        if (err) return res.status(403).json({ erro: "Token inválido" })
        req.usuario = usuario
        next()
    })
}

app.listen(port, () => {
    console.log("API rodando na porta " + port)
})