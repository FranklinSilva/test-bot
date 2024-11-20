const qrcode = require("qrcode-terminal");

const { Client } = require("whatsapp-web.js");

let sessionLocal = JSON.parse(process.env.WW_SESSION);
console.log(sessionLocal);

const puppeteerOptions = {
  headless: true,
  args: ["--no-sandbox"],
};

const client = new Client({
  puppeteer: puppeteerOptions,
  // session: sessionLocal
});

client.on("qr", (qr) => {
  qrcode.generate(qr, { small: true });
  console.log(qr);
});

client.on("authenticated", (session) => {
  // Save this session object in WW_SESSION manually to reuse it next time
  console.log(JSON.stringify(session));
});

client.on("ready", () => {
  console.log("Whatsapp conectado!");
});

/*
    Estrutura do bot
    [] Gatilho com mensagem padrão
    [] Falar 2 tipos de serviços e um terceiro customizado
    [] Depois de saber cada pedido, perguntar se ele deseja adicionar mais alguma observação.
    [] Finalizar o atendimento enviando um compilado das informações para um número externo
*/

const mensagem_gatilho = "Olá, quero fazer um pedido";
const nome_do_atendente = "Franklin";
const especialidades_da_empresa =
  "Somos especializados em bolos e salgados diversos. Contamos tanto com entrega própria quanto com retirada na loja"; //A especialidade de sua empresa, como uma boas vindas
const endereco =
  "Ficamos situados na R. Alceu Amoroso Lima, 276 - bloco a sala 506 - Caminho das Árvores, Salvador - BA. Funcionamos todos os dias das 09 às 18"; //Seu endereço e horário de funcionamento
const servico_1 = "Bolos"; //Nome do serviço 1
const servico_1_descricao =
  "Possuímos bolos dos mais diversos sabores. Nosso top 5 pedidos são Tapioca, Carimâ, Laranja, Milho e Cenoura. Nossos tamanhos são P:R$35, M:R$45 e G:R$50. \nPor favor, me diga em detalhes como você quer o seu bolo e para qual data você deseja solicitar, vamos fazer o melhor possível para te atender"; //descrição do serviço 1. Por favor, não pule linhas
const servico_2 = "Salgados diversos"; //Nome serviço 2
const servico_2_descricao =
  "Quem come nossos salgados não esquece, veja nosso cardápio (https://www.instagram.com/escolacafeina/) e escolha o tipo e quantidade que deseja:"; //Descrição serviço 2, perceba que podemos colocar links normalmente
const servico_3 = "Outro serviço não listado"; //Serviço "outros", não indico modificar aqui
const servico_3_descricao =
  "Deseja pedir algum serviço não listado? Faremos o possível para te atender."; //Descrição do serviço "outros", não indico modificar aqui
const numero_contato_redirecionamento = 5571993628734; //Número que você deseja que seja enviado o aviso de novo cliente. Respeite o padrão 55+ddd+numero

/*
    Fim da área editável
*/

let atendimento = {
  pedido: "inicial",
  opcao_selecionada: "0",
  observacoes: "inicial",
};

client.on("message", async (message) => {
  if (message.body == null) return;

  let chatId = message.from;

  const contato_cliente = await message.getContact();

  let mensagem_sem_espaços = message.body.trim();

  if (
    mensagem_sem_espaços === mensagem_gatilho ||
    mensagem_sem_espaços.toLowerCase() === "oi"
  ) {
    client.sendMessage(
      chatId,
      `Olá, ${
        contato_cliente.pushname ? contato_cliente.pushname : null
      } tudo bem? Me chamo ${nome_do_atendente} e sou representante da Bolos e cia.`
    );

    setTimeout(() => {
      client.sendMessage(chatId, endereco);
    }, 1000);

    setTimeout(() => {
      client.sendMessage(
        chatId,
        `Vou te passar uma lista com nossos principais produtos, assim eu consigo te colocar na frente dos demais pedidos`
      );
    }, 1200);

    setTimeout(() => {
      client.sendMessage(chatId, especialidades_da_empresa);
    }, 1400);

    setTimeout(() => {
      client.sendMessage(
        chatId,
        `Por favor, selecione uma das opções: \n Digite 1 para realizar um pedido de ${servico_1}; \n Digite 2 para realizar um pedido de ${servico_2}; \n Digite 3 para solicitar ${servico_3};`
      );
    }, 1500);
  }

  if (mensagem_sem_espaços === "1" || mensagem_sem_espaços === "2") {
    atendimento.opcao_selecionada = mensagem_sem_espaços;
    client.sendMessage(
      chatId,
      mensagem_sem_espaços === "1" ? servico_1_descricao : servico_2_descricao
    );

    setTimeout(() => {
      client.sendMessage(chatId, "Utilize o padrão: Obs: _Sua mensagem_");
    }, 1000 + Math.floor(Math.random() * 1000));

    setTimeout(() => {
      client.sendMessage(
        `${numero_contato_redirecionamento}@c.us`,
        `Novo cliente, entre em contato com: https://wa.me/${contato_cliente.id.user}.`
      );
    }, 1000 + Math.floor(Math.random() * 1000));
  }

  if (mensagem_sem_espaços === "3") {
    client.sendMessage(chatId, servico_3_descricao);

    setTimeout(() => {
      client.sendMessage(chatId, "Utilize o padrão: Obs: _Sua mensagem_");
    }, 1000 + Math.floor(Math.random() * 1000));

    setTimeout(() => {
      client.sendMessage(
        `${numero_contato_redirecionamento}@c.us`,
        `Novo cliente, entre em contato com: https://wa.me/${contato_cliente.id.user}.`
      );
    }, 1000 + Math.floor(Math.random() * 1000));
  }

  if (mensagem_sem_espaços.toLowerCase().includes("obs:")) {
    atendimento.observacoes = mensagem_sem_espaços;
    client.sendMessage(
      chatId,
      `Muito obrigado pelas informações, vamos retornar o contato o mais rápido possível :)`
    );
  }
});
client.initialize();
