import Database from '../database/database.js';
import Meliponicultores from './meliponicultores.js';
import Sendmail from '../services/SendMail.js';

async function readAll() {
  const db = await Database.connect();

  const sql = `
     SELECT 
      m.id_meliponario, m.nome, m.descricao, m.qtd_caixas, m.telefone, m.bairro, m.rua, m.numero, r.UF as regiao
    FROM 
      Meliponarios as m INNER JOIN Regioes as r
    ON
      m.regioes_id = r.id_regiao
   ` ;

  const meliponarios = await db.all(sql);
  return meliponarios;
}

async function read(id) {
  const db = await Database.connect();

  const sql = `
    SELECT 
      m.id_meliponario, m.nome, m.descricao, m.qtd_caixas, m.telefone, m.bairro, m.rua, m.numero, r.UF as regiao
    FROM 
      Meliponarios as m INNER JOIN Regioes as r
    ON
      m.regioes_id = r.id_regiao
    WHERE
      m.id_meliponario = ?
  `;

  const meliponario = await db.get(sql, [id]);

  return meliponario;
}

async function create(meliponario) {
  const db = await Database.connect();
  
  const { nome, descricao, qtd_caixas, telefone, bairro, rua, numero, regioes_id, token } = meliponario;
  const id_meliponicultor = await Meliponicultores.infoToken(token);
  const sql = `
    INSERT INTO
      Meliponarios (nome, descricao, qtd_caixas, telefone, bairro, rua, numero, regioes_id, id_meliponicultor)
    VALUES
      (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
  
  const {lastID} = await db.run(sql, [nome, descricao, qtd_caixas, telefone, bairro, rua, numero, regioes_id, id_meliponicultor]);
  const meliponarioCriado = await Meliponicultores.read(id_meliponicultor);
  submitEmail(meliponarioCriado.email);
  
  const newMeliponario = {codmeliponario: lastID, ...meliponario};

  return newMeliponario;
}

async function update(meliponario, id_meliponario) {
  const db = await Database.connect();

  const { nome, qtd_caixas, telefone, bairro, rua, numero, descricao, regioes_id } = meliponario;

  const sql = `
    UPDATE
      Meliponarios
    SET
      nome = ?, qtd_caixas = ?, telefone = ?,  bairro = ?, rua = ?, numero = ?, descricao = ?, regioes_id = ?
    WHERE
      id_meliponario = ?
  `;

  const { changes } = await db.run(sql, [nome, qtd_caixas, telefone, bairro, rua, numero, descricao, regioes_id, id_meliponario]);

  if (changes === 1) {
    return read(id_meliponario);
  } else {
    return false;
  }
}

async function destroy(id_meliponario) {
  const db = await Database.connect();

  const sql = `
    DELETE FROM
      Meliponarios
    WHERE
      id_meliponario = ?
  `;

  const { changes } = await db.run(sql, [id_meliponario]);

  return changes === 1;
}

async function ReadByregioes() {
  const db = await Database.connect();

  const sql = `
    SELECT 
      Regioes
    FROM
      Meliponarios
    WHERE
      Regioes = ?
  `;
  
}

/* Faltar capturar o email na função de criar o meliponario */
async function submitEmail(to) {

  const subject = 'Você Cadastrou com Sucesso o Meliponário no BeeAlive App';
  const text = 'Você Cadastrou com Sucesso o Meliponário no BeeAlive App, agora você pode cadastrar as suas colmeias e acompanhar o desenvolvimento do seu meliponário';
  const html = '<h1>Você Cadastrou com Sucesso o Meliponário no BeeAlive App.</h1><p><a href="http://localhost:3000"> Você Cadastrou com Sucesso o Meliponário no BeeAlive App, agora você pode cadastrar as suas colmeias e acompanhar o desenvolvimento do seu meliponário.</a></p>';

  Sendmail.sendMail(to, subject, text, html);

}

export default { readAll, read, create, update, destroy, ReadByregioes };