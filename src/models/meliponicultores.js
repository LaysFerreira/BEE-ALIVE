import bcrypt from 'bcryptjs';
import jwt from "jsonwebtoken";
import 'dotenv/config';
import Database from '../database/database.js';
import SendMail from '../services/SendMail.js';

const salt = Number(process.env.SALT);

async function create(meliponicultor) {
  const db = await Database.connect();

  const {nome, email, senha, cidade, cpf, telefone} = meliponicultor;
  
  const hash = bcrypt.hashSync(senha, salt);

  const sql = `
    INSERT INTO
      Meliponicultores (nome, email, password, cidade, cpf, telefone )
    VALUES
      (?, ?, ?, ?, ?, ?)
  `;

  const {lastID} = await db.run(sql, [nome, email, hash, cidade, cpf, telefone]);
  submitEmail(email);
  return read(lastID);
}

async function read(id_meliponicultor) {
  const db = await Database.connect();
  
  const sql = `
    SELECT 
      *
    FROM 
      Meliponicultores
    WHERE
      id_meliponicultor = ?
  `;

  const meliponicultor = await db.get(sql, [id_meliponicultor]);

  return meliponicultor;
}

async function readByEmail(email) {
  const db = await Database.connect();

  const sql = `
    SELECT 
      *
    FROM 
      Meliponicultores
    WHERE
      email = ?
  `;

  const meliponicultor = await db.get(sql, [email]);

  return meliponicultor;
}

function submitEmail(to) {

  const subject = 'Seu Cadastro foi Feito com Sucesso no BeeAlive App';
  const text = 'Seu cadastro foi feito com sucesso no BeeAlive App, agora você pode cadastrar seus meliponários e acompanhar a produção de mel.';
  const html = '<h1>Cadastro feito como Melipoicultor</h1><p><a href="http://localhost:3000">Seu cadastro foi feito com sucesso no BeeAlive App, agora você pode cadastrar seus meliponários e acompanhar a produção de mel.</a></p>';

  SendMail.sendMail(to, subject, text, html);
}

async function infoToken(token){
  const result = jwt.verify(token, process.env.SECRET);
  return result.userId;
}

export default { create, read, readByEmail, infoToken };