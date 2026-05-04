// ⚠️ SUBSTITUA pelos seus valores:
const TELEGRAM_TOKEN = '8566709078:AAERwkWZ3nhpY0M9AQwcOkrzxrfinSfEq-8';
const TELEGRAM_CHAT_ID = '962300263';
const SPREADSHEET_ID = '1WzPzpSARxTiCCMkai9pH-Y0_BRTTre_Czy7nvMOmd5s';

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);

    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getActiveSheet();

    // Número de pedido sequencial baseado na planilha (ignora linha de cabeçalho)
    const ultimaLinha = sheet.getLastRow();
    const numeroPedido = ultimaLinha > 0 ? ultimaLinha : 1;
    const numeroPedidoFormatado = String(numeroPedido).padStart(6, '0');

    sheet.appendRow([
      numeroPedidoFormatado,
      new Date().toLocaleString('pt-BR'),
      data.nome,
      data.telefone,
      data.endereco,
      data.pedido,
      data.total,
      data.pagamento,
      data.observacoes || ''
    ]);

    const mensagem = `
🛵 *NOVO PEDIDO #${numeroPedidoFormatado}*

👤 *Cliente:* ${data.nome}
📞 *Telefone:* ${data.telefone}
📍 *Endereço:* ${data.endereco}

🍕 *Pedido:*
${data.pedido}

💰 *Total:* ${data.total}
💳 *Pagamento:* ${data.pagamento}
📝 *Obs:* ${data.observacoes || 'Nenhuma'}

⏰ ${new Date().toLocaleString('pt-BR')}
    `.trim();

    const url = `https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`;
    UrlFetchApp.fetch(url, {
      method: 'post',
      contentType: 'application/json',
      payload: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text: mensagem,
        parse_mode: 'Markdown'
      })
    });

    return ContentService
      .createTextOutput(JSON.stringify({ status: 'ok', numeroPedido: numeroPedidoFormatado }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    Logger.log('ERRO doPost: ' + err.toString());
    return ContentService
      .createTextOutput(JSON.stringify({ status: 'error', message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// Rode esta função manualmente no editor para testar sem precisar do site
function testar() {
  const dadosTeste = {
    numeroPedido: '000001',
    nome: 'João Teste',
    telefone: '(11) 99999-9999',
    endereco: 'Rua Exemplo, 123, Centro',
    pedido: '1x Prato Feito Completo — R$ 28,00\n2x Suco Natural 500ml — R$ 20,00',
    total: 'R$ 48,00',
    pagamento: 'PIX',
    observacoes: 'Sem cebola'
  };

  doPost({ postData: { contents: JSON.stringify(dadosTeste) } });
  Logger.log('Teste concluído! Verifique a planilha e o Telegram.');
}
