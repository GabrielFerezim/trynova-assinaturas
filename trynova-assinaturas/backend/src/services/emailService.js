import nodemailer from "nodemailer";

const camposObrigatorios = [
  "SMTP_HOST",
  "SMTP_PORT",
  "SMTP_USER",
  "SMTP_PASS",
  "SMTP_FROM",
];

function temConfiguracaoSmtp() {
  const ausentes = camposObrigatorios.filter(
    (campo) => !process.env[campo]?.trim()
  );
  return ausentes.length === 0;
}

export async function enviarLink({ para, nome, link }) {
  if (!temConfiguracaoSmtp()) {
    console.log("\n=======================================================");
    console.log(`[MODO DEV] SMTP não configurado. Link gerado:`);
    console.log(`Colaborador: ${nome} <${para}>`);
    console.log(`Link: ${link}`);
    console.log("=======================================================\n");
    return { dev: true };
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: process.env.SMTP_SECURE === "true",
    requireTLS: process.env.SMTP_PORT === "587",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  await transporter.verify();

  // URL base para as imagens do e-mail (utiliza a tua variável de ambiente ou domínio)
  const appUrl = process.env.APP_URL || "https://www.trynova.com.br";

  const resultado = await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to: para,
    subject: "Sua assinatura corporativa Trynova",

    text: [
      `Olá, ${nome}.`,
      "",
      "Sua assinatura corporativa está disponível no endereço abaixo:",
      link,
      "",
      "O link é temporário.",
    ].join("\n"),

    html: `
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Sua Assinatura Corporativa</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: 'Segoe UI', Arial, sans-serif; -webkit-font-smoothing: antialiased;">
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f1f5f9; padding: 40px 15px;">
          <tr>
            <td align="center">
              
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 580px; background-color: #ffffff; border-radius: 16px; border: 1px solid #dce4ee; box-shadow: 0 10px 30px rgba(6, 26, 56, 0.08); overflow: hidden;">
                
                <!-- Cabeçalho com Gradiente Azul Escuro -->
                <tr>
                  <td align="center" style="background: #061a38; padding: 36px 30px; text-align: center;">
                    <img src="${appUrl}/imagens/logo_trynova.png" alt="Trynova Logo" width="160" style="display: block; margin: 0 auto 12px auto; max-width: 180px; height: auto;" />
                    <div style="color: #92b0d8; font-size: 9px; font-weight: 700; letter-spacing: 2.5px; text-transform: uppercase;">
                      PESSOAS <span style="color: #054a96;">+</span> PROCESSOS  <span style="color: #054a96;">+</span> RESULTADOS
                    </div>
                  </td>
                </tr>

                <!-- Corpo da Mensagem -->
                <tr>
                  <td style="padding: 40px 36px;">
                    
                    <div style="color: #627899; font-size: 10px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 8px;">
                      ÁREA DO COLABORADOR
                    </div>

                    <h1 style="color: #061a38; font-size: 22px; margin: 0 0 16px 0; font-weight: 700; line-height: 1.3;">
                      Sua assinatura corporativa está <span style="color: #054a96;">pronta!</span>
                    </h1>

                    <p style="color: #435b80; font-size: 14px; line-height: 1.7; margin: 0 0 8px 0;">
                      Olá, <strong>${nome}</strong>.
                    </p>

                    <p style="color: #435b80; font-size: 14px; line-height: 1.7; margin: 0 0 24px 0;">
                      Sua assinatura corporativa está disponível. Clique no botão abaixo para conferir seus dados e baixar a imagem PNG oficial.
                    </p>

                    <!-- Botão de Ação -->
                    <table border="0" cellspacing="0" cellpadding="0" style="margin: 28px 0;">
                      <tr>
                        <td align="center" style="border-radius: 10px; background: #054a96;">
                          <a href="${link}" target="_blank" style="display: inline-block; padding: 16px 32px; color: #ffffff; font-size: 14px; font-weight: 700; text-decoration: none; border-radius: 10px; letter-spacing: 0.5px;">
                            Acessar minha assinatura &rarr;
                          </a>
                        </td>
                      </tr>
                    </table>

                    <!-- Aviso de Segurança -->
                    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f4f7fb; border: 1px solid #e1e8f0; border-radius: 8px; padding: 12px 16px;">
                      <tr>
                        <td style="color: #5d7496; font-size: 12px; line-height: 1.5;">
                          🔒 <strong>Acesso individual e temporário.</strong> Este link deve ser utilizado somente pelo destinatário.
                        </td>
                      </tr>
                    </table>

                  </td>
                </tr>

                <!-- Rodapé Interno com Marca de 33 Anos -->
                <tr>
                  <td style="padding: 24px 36px; background-color: #fafbfc; border-top: 1px solid #e1e8f0;">
                    <table width="100%" border="0" cellspacing="0" cellpadding="0">
                      <tr>
                        <td width="65" valign="middle">
                          <img src="${appUrl}/imagens/33_anos.png" alt="33 Anos" width="50" style="display: block; height: auto;" />
                        </td>
                        <td valign="middle" style="padding-left: 14px; border-left: 1px solid #d0dcfa;">
                          <div style="font-size: 11px; font-weight: 800; color: #061a38; letter-spacing: 2px;">
                            33 ANOS
                          </div>
                          <div style="font-size: 9px; color: #526b91; letter-spacing: 1px; line-height: 1.4; margin-top: 2px;">
                            CONECTANDO PESSOAS, TECNOLOGIA E RESULTADOS
                          </div>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

              </table>

              <!-- Rodapé Externo -->
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 580px; margin-top: 20px;">
                <tr>
                  <td align="center" style="color: #8298b8; font-size: 10px; font-weight: 600; letter-spacing: 2px; text-transform: uppercase;">
                    TRYNOVA &reg; &bull; COMUNICAÇÃO CORPORATIVA
                  </td>
                </tr>
              </table>

            </td>
          </tr>
        </table>
      </body>
      </html>
    `,
  });

  console.log("E-mail enviado:", {
    messageId: resultado.messageId,
    destinatario: para,
  });

  return {
    enviado: true,
    messageId: resultado.messageId,
  };
}