const {default: makeWASocket, makeInMemoryStore, useMultiFileAuthState, delay, downloadContentFromMessage, DisconnectReason, templateMessage, MediaType, GroupSettingChange, isBaileys, WASocket, WAProto, getStream, relayWAMessage, Miimetype, proto, mentionedJid, processTime, MessageTypeProto, BufferJSON, GroupMetadata, getContentType} = require("@adiwajshing/baileys")

const P = require("pino")
const fs = require("fs")
const util = require("util")
const clui = require("clui")
const ms = require("ms")
const yts = require("yt-search")
const speed = require("performance-now")
const fetch = require("node-fetch")
const axios = require("axios")
const webp = require("node-webpmux")
const chalk = require("chalk")
const cfonts = require("cfonts")
const moment = require("moment-timezone")
const ffmpeg = require("fluent-ffmpeg")
const { Boom } = require("@hapi/boom")
const { exec, spawn, execSync } = require("child_process")
const { getBuffer, generateMessageTag, tempRuntime, clockString, color, fetchJson, getGroupAdmins, getRandom, parseMention, getExtension, banner, uncache, nocache, isFiltered, addFilter, ia } = require('./arquivos/funções/ferramentas')
const { prefixo, nomebot, nomedono, numerodono } = require('./arquivos/funções/configuração.json')

const options = { timeZone: 'America/Sao_Paulo', hour12: false }
const data = new Date().toLocaleDateString('pt-BR', { ...options, day: '2-digit', month: '2-digit', year: '2-digit' })
const hora = new Date().toLocaleTimeString('pt-BR', options)
const horaAtual = new Date().getHours()
const varping = speed()
const ping = speed() - varping
const timestamp = speed()
const latensi = speed() - timestamp

//Conexão
const MAX_RECONNECTION_ATTEMPTS = 3
let reconnectionAttempts = 0
async function connectToWhatsApp() {
const store = makeInMemoryStore({ logger: P().child({ level: "silent", stream: "store" }) 
})
console.log(banner.string)
const { state, saveCreds } = await useMultiFileAuthState('./arquivos/qr-code')
const conn = makeWASocket({
logger: P({ level: "silent" }),
printQRInTerminal: true,
browser: ['XANAX - AIP Ϟ', 'macOS', 'desktop'],
auth: state
})
conn.ev.on("creds.update", saveCreds)
store.bind(conn.ev)
conn.ev.on("chats.set", () => {
console.log("Tem conversas", store.chats.all())
})
conn.ev.on("contacts.set", () => {
console.log("Tem contatos", Object.values(store.contacts))
})
conn.ev.on("connection.update", (update) => {
const { connection, lastDisconnect } = update
if (connection === "close") {
const shouldReconnect = lastDisconnect && lastDisconnect.error && lastDisconnect.error.output && lastDisconnect.error.output.statusCode !== DisconnectReason.loggedOut;
console.log("Conexão fechada erro:", lastDisconnect.error, "Tentando reconectar...", shouldReconnect)
if (shouldReconnect && reconnectionAttempts < MAX_RECONNECTION_ATTEMPTS) {
reconnectionAttempts++
setTimeout(connectToWhatsApp, 5000)
} else {
console.log("Falha na reconexão. Limite máximo de tentativas atingido.")}
} else if (connection === "open") {
console.log(color(`➱ Conectado com sucesso!\n• Status: online\n• Horário ligado: ${hora}\n• Bem-vindo ao ${nomebot}\n➱ Próximos logs...\n`, 'green'))}
})
conn.ev.on('messages.upsert', async (m) => {

//Visualização da mensagem, etc...
try {
const info = m.messages[0]
if (!info.message) return 
await conn.readMessages([info.key])
if (info.key && info.key.remoteJid == 'status@broadcast') return 
const type = Object.keys(info.message)[0] == 'senderKeyDistributionMessage' ? Object.keys(info.message)[2] : (Object.keys(info.message)[0] == 'messageContextInfo') ? Object.keys(info.message)[1] : Object.keys(info.message)[0]
const content = JSON.stringify(info.message)
const from = info.key.remoteJid

var body = (type === 'conversation') ? info.message.conversation : (type == 'imageMessage') ? info.message.imageMessage.caption : (type == 'videoMessage') ? info.message.videoMessage.caption : (type == 'extendedTextMessage') ? info.message.extendedTextMessage.text : (type == 'buttonsResponseMessage') ? info.message.buttonsResponseMessage.selectedButtonId : (type == 'listResponseMessage') ? info.message.listResponseMessage.singleSelectReply.selectedRowId : (type == 'templateButtonReplyMessage') ? info.message.templateButtonReplyMessage.selectedId : ''

const budy = (type === 'conversation') ? info.message.conversation : (type === 'extendedTextMessage') ? info.message.extendedTextMessage.text : ''

var pes = (type === 'conversation' && info.message.conversation) ? info.message.conversation : (type == 'imageMessage') && info.message.imageMessage.caption ? info.message.imageMessage.caption : (type == 'videoMessage') && info.message.videoMessage.caption ? info.message.videoMessage.caption : (type == 'extendedTextMessage') && info.message.extendedTextMessage.text ? info.message.extendedTextMessage.text : ''

//Const isGroup, etc...
const isGroup = info.key.remoteJid.endsWith('@g.us')
const sender = isGroup ? info.key.participant : info.key.remoteJid
const groupMetadata = isGroup ? await conn.groupMetadata(from) : ''
const groupName = isGroup ? groupMetadata.subject : ''
const groupDesc = isGroup ? groupMetadata.desc : ''
const groupMembers = isGroup ? groupMetadata.participants : ''
const groupAdmins = isGroup ? getGroupAdmins(groupMembers) : ''
const nome = info.pushName ? info.pushName : ''
const messagesC = pes.slice(0).trim().split(/ +/).shift().toLowerCase()
const args = body.trim().split(/ +/).slice(1)
const q = args.join(' ')
const isCmd = body.startsWith(prefixo)
const comando = isCmd ? body.slice(1).trim().split(/ +/).shift().toLocaleLowerCase() : null 
const mentions = (teks, memberr, id) => {
(id == null || id == undefined || id == false) ? conn.sendMessage(from, {text: teks.trim(), mentions: memberr}) : conn.sendMessage(from, {text: teks.trim(), mentions: memberr})}
const quoted = info.quoted ? info.quoted : info
const mime = (quoted.info || quoted).mimetype || ""
const sleep = async (ms) => {return new Promise(resolve => setTimeout(resolve, ms))}

//Outras const...
const isBot = info.key.fromMe ? true : false
const isOwner = numerodono.includes(sender)
const BotNumber = conn.user.id.split(':')[0]+'@s.whatsapp.net'
const isGroupAdmins = groupAdmins.includes(sender) || false 
const isBotGroupAdmins = groupAdmins.includes(BotNumber) || false
const isUrl = (url) => { return url.match(new RegExp(/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\n([-a-zA-Z0-9()@:%_+.~#?&/=]*)/, 'gi')) }
const deviceType = info.key.id.length > 21 ? 'Android' : info.key.id.substring(0, 2) == '3A' ? 'IPhone' : 'WhatsApp web'
const command = isCmd ? budy.slice(1).trim().split(/ +/).shift().toLocaleLowerCase() : null
const reply = (text) => {
conn.sendMessage(from, {text: text}, {quoted: info})}

//Const isQuoted.
const isImage = type == "imageMessage"
const isVideo = type == "videoMessage"
const isAudio = type == "audioMessage"
const isSticker = type == "stickerMessage"
const isContact = type == "contactMessage"
const isLocation = type == "locationMessage"
const isProduct = type == "productMessage"
const isMedia = (type === "imageMessage" || type === "videoMessage" || type === "audioMessage") 
typeMessage = body.substr(0, 50).replace(/\n/g, "")
if (isImage) typeMessage = "Image"
else if (isVideo) typeMessage = "Video"
else if (isAudio) typeMessage = "Audio"
else if (isSticker) typeMessage = "Sticker"
else if (isContact) typeMessage = "Contact"
else if (isLocation) typeMessage = "Location"
else if (isProduct) typeMessage = "Product"
const isQuotedMsg = type === "extendedTextMessage" && content.includes("textMessage")
const isQuotedImage = type === "extendedTextMessage" && content.includes("imageMessage")
const isQuotedVideo = type === "extendedTextMessage" && content.includes("videoMessage")
const isQuotedDocument = type === "extendedTextMessage" && content.includes("documentMessage")
const isQuotedAudio = type === "extendedTextMessage" && content.includes("audioMessage")
const isQuotedSticker = type === "extendedTextMessage" && content.includes("stickerMessage")
const isQuotedContact = type === "extendedTextMessage" && content.includes("contactMessage")
const isQuotedLocation = type === "extendedTextMessage" && content.includes("locationMessage")
const isQuotedProduct = type === "extendedTextMessage" && content.includes("productMessage")

//Obtém o conteúdo de um arquivo em formato de buffer
const getFileBuffer = async (mediakey, MediaType) => {
const stream = await downloadContentFromMessage(mediakey, MediaType)
let buffer = Buffer.from([])
for await(const chunk of stream) {
buffer = Buffer.concat([buffer, chunk]) }
return buffer}


function muptime(seconds){
function pad(s){
return (s < 10 ? '0' : '') + s;
}
var days = Math.floor(seconds / (3600 * 24))
var hours = Math.floor(seconds / (60*60));
var minutes = Math.floor(seconds % (60*60) / 60);
var seconds = Math.floor(seconds % 60);
return 'Dias: ' + pad(days) + ' • ' + 'Horas: ' + pad(hours) + ' • ' + 'Minutos: ' + pad(minutes) + ' • ' + 'Segundos: ' +  pad(seconds)
}

function ping() {
  const speed = require('performance-now');
  const timestampm = speed();
  const latency = speed() - timestampm;
  const ms = latency.toFixed(4);
    return ms
}

//Respostas de verificação
resposta = {
espere: "Por favor, aguarde um momento...",
registro: `Olá ${nome}, parece que você ainda não está registrado. Para fazer seu registro, utilize o comando ${prefixo}rg.`,
rg: "Oops! Parece que você já está registrado. Não é possível ter mais de um registro por usuário.",
premium: "Lamentamos, mas você não possui uma assinatura Premium. Este comando é exclusivo para usuários na lista Premium. Aproveite todos os benefícios de se tornar Premium!",
bot: "Este comando só pode ser executado pelo bot.",
dono: "Desculpe, mas apenas o dono do bot pode utilizar este comando.",
grupo: "Este comando só pode ser utilizado em grupos.",
privado: "Este comando só pode ser utilizado em conversas privadas.",
adm: "Apenas administradores do grupo podem utilizar este comando.",
botadm: "Este comando só pode ser utilizado quando o bot é um administrador do grupo.",
erro: "Desculpe, ocorreu um erro. Por favor, tente novamente mais tarde."}

//Verificação anti-spam
if (isCmd) {
if (isFiltered(sender)) {
return reply('Sem flood amigo... agora espere 5 segundos.')
} else {
addFilter(sender)}}

//Mensagens do console
if (isGroup) {
if (isCmd && !isBot) {
console.log(
color(`\n ⟨ Comando em grupo ⟩`, 'yellow'),
color(`\n➱ Comando: ${comando}`, 'green'),
color(`\n➱ Número: ${sender.split("@")[0]}`, 'green'),
color(`\n➱ Grupo: ${groupName}`, 'green'),
color(`\n➱ Nome: ${nome}`, 'green'),
color(`\n➱ Hora: ${hora}\n`, 'green'))
} else if (!isBot) {
console.log(
color(`\n ⟨ Mensagem em grupo ⟩`, 'yellow'),
color(`\n➱ Comando: ${color('Não', 'red')}`, 'green'),
color(`\n➱ Número: ${sender.split("@")[0]}`, 'green'),
color(`\n➱ Grupo: ${groupName}`, 'green'),
color(`\n➱ Nome: ${nome}`, 'green'),
color(`\n➱ Hora: ${hora}\n`, 'green'))}
} else {
if (isCmd && !isBot) {
console.log(
color(`\n ⟨ Comando no privado ⟩`, 'yellow'),
color(`\n➱ Comando: ${comando}`, 'green'),
color(`\n➱ Número: ${sender.split("@")[0]}`, 'green'),
color(`\n➱ Nome: ${nome}`, 'green'),
color(`\n➱ Hora: ${hora}\n`, 'green'))
} else if (!isBot) {
console.log(
color(`\n ⟨ Mensagem no privado ⟩`, 'yellow'),
color(`\n➱ Comando: ${color('Não', 'red')}`, 'green'),
color(`\n➱ Número: ${sender.split("@")[0]}`, 'green'),
color(`\n➱ Nome: ${nome}`, 'green'),
color(`\n➱ Hora: ${hora}\n`, 'green'))}}

//Aqui começa os comandos com prefixo
switch(comando) {
	
case "netflix-acc":
try {
data = JSON.parse(fs.readFileSync("./contas/netflix.json")) 
var accounts = data.netflix;
var randomIndex = Math.floor(Math.random() * accounts.length);
var randomAccount = accounts[randomIndex];
var totalAccounts = accounts.length;
if (totalAccounts <= 0 ) return conn.sendMessage(from, {text: `Sem Contas Disponiveis`}, {quoted: info})	
var mercadopago = require('mercadopago');
mercadopago.configure({
    access_token: 'APP_USR-2628777322419993-092309-81e30e904a4a862fd13b8bcb0a695dab-334859896' 
});
var payment = {
  transaction_amount: 1,
  description: 'PAGAMENTO-XANAX',
  payment_method_id: 'pix',
  payer: {
    email: 'EMAIL',
    first_name: 'XANAX',
    last_name: 'LTDA',
    identification: {
  type: 'CPF',
  number: 'NUMERO CPF'
    },
    address:  {
  zip_code: 'CEP',
  street_name: 'RUA',
  street_number: 'NUUMERO',
  neighborhood: 'BAIRRO',
  city: 'CIDADE',
  federal_unit: 'SIGLA ESTADO'
    }
  }
};

var pagamentohora = moment.tz("America/Sao_Paulo").format("HH:mm:ss");
var pagamentodata = moment.tz("America/Sao_Paulo").format("DD/MM/YY");
var data = mercadopago.payment.create(payment).then(data => {
  let pix = (data.response.point_of_interaction.transaction_data.qr_code);
  let id1 = (data.response.id)
  let sta = (data.response.status)
  conn.sendMessage(from, {image: {url: `https://chart.apis.google.com/chart?cht=qr&chl=${pix}&chs=300x300`}, caption: `💠 PIX NO VALOR DE: R$${payment.transaction_amount}\n\n• ID DO PAGAMENT0: ${id1}\n• STATUS PIX: ${sta}\n• DATA PEDIDO: ${pagamentodata}\n• HORA PEDIDO: ${pagamentohora}\n\n• SERVIÇO: NETFLIX TELAS`}, {quoted: info})
setTimeout(async() => {
conn.sendMessage(from,{text:`${pix}`})
await sleep(200);
conn.sendMessage(from,{text:`• Copie o Codigo Do Pix Acima 👆🏻\n\• Faça o Pagamento No seu Banco!`})
}, 8000)
let tentativas = 0;
var interval = setInterval(async () => {
tentativas++;
var res = await mercadopago.payment.get(data.body.id);
var pagamentoStatus = res.body.status;
if (tentativas >= 1200 || pagamentoStatus === 'approved') {
if (pagamentoStatus === 'approved') {
reply(`${randomAccount.conta}`)
clearInterval(interval);
}
}
}, 1_000);
})
} catch (e) {
return reply(`${e}`)
}
break


case 'xqr':
if (!isOwner) return reply(resposta.dono)
reply('Reiniciando...')
await delay(2000)
process.exit()  
break

default: 


if (body.startsWith('>')){
try {
if (info.key.fromMe) return 
if (!isOwner) return 
return conn.sendMessage(from, {text: JSON.stringify(eval(body.slice(2)),null,'\t')}).catch(e => {
return reply(String(e))})
} catch (e){
return reply(String(e))}}
}
} catch (e) {
e = String(e)
if (e.includes('this.isZero')) {
return
}
console.error('\n %s', color(`➱ ${e}`, 'yellow'))
console.log(color('\n « ! Crashlog ! »', 'red'), (color('Erro detectado! \n', 'yellow')))
conn.sendMessage(`${numerodono}`, {text: `Ocorreu um erro: ${e}`})}
})}
connectToWhatsApp()

let file = require.resolve(__filename)
fs.watchFile(file, () => {
fs.unwatchFile(file)
console.log(`O arquivo ${__filename} foi atualizado.\n`)
process.exit()
})