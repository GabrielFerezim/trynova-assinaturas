import nodemailer from "nodemailer";
import { fileURLToPath } from "node:url";
import path from "node:path";
import fs from "node:fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

  // Localização dos assets para inclusão via CID (garante exibição sem bloqueio de imagens no Outlook)
  const appUrl = process.env.APP_URL || "https://www.trynova.com.br";
  const possibleLogoPaths = [
    path.join(__dirname, "../assets/imagens/logo_trynova_white.png"),
    path.join(__dirname, "../../../frontend/public/imagens/logo_trynova_white.png"),
  ];
  const possible33Paths = [
    path.join(__dirname, "../assets/imagens/33_anos.png"),
    path.join(__dirname, "../../../frontend/public/imagens/33_anos.png"),
  ];

  const attachments = [];
  const logoPath = possibleLogoPaths.find((p) => fs.existsSync(p));
  if (logoPath) {
    attachments.push({
      filename: "logo_trynova_white.png",
      path: logoPath,
      cid: "trynova_logo_white",
    });
  }

  const selo33Path = possible33Paths.find((p) => fs.existsSync(p));
  if (selo33Path) {
    attachments.push({
      filename: "33_anos.png",
      path: selo33Path,
      cid: "trynova_33_anos",
    });
  }

  const logoSrc = logoPath ? "cid:trynova_logo_white" : `${appUrl}/imagens/logo_trynova_white.png`;
  const selo33Src = selo33Path ? "cid:trynova_33_anos" : `${appUrl}/imagens/33_anos.png`;

  const resultado = await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to: para,
    subject: "Sua Assinatura Corporativa Trynova",
    attachments,

    text: [
      `Olá, ${nome}.`,
      "",
      "Sua assinatura corporativa da Trynova Consultoria Imobiliária está pronta para visualização e configuração.",
      "",
      "Para acessar e configurar sua assinatura no Outlook, utilize o link de acesso seguro abaixo:",
      link,
      "",
      "AVISO DE SEGURANÇA E VALIDADE:",
      "- Este link é individual e intransferível.",
      "- Por motivos de governança de dados, o link possui validade de 30 minutos a partir do envio.",
      "",
      "Atenciosamente,",
      "Tecnologia da Informação & Comunicação Corporativa",
      "Trynova Consultoria Imobiliária",
    ].join("\n"),

    html: `
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Sua Assinatura de E-mail Corporativa</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f1f5f9; padding: 40px 16px;">
          <tr>
            <td align="center">
              
              <!-- Cartão Principal -->
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 560px; background-color: #ffffff; border-radius: 8px; border: 1px solid #dce4ee; box-shadow: 0 4px 20px rgba(6, 26, 56, 0.05); overflow: hidden;">
                
                <!-- Faixa Superior Accent -->
                <tr>
                  <td style="height: 3px; background-color: #054a96; line-height: 3px; font-size: 3px;">&nbsp;</td>
                </tr>

                <!-- Cabeçalho Corporativo com Logo Branca Menor -->
                <tr>
                  <td align="center" style="background-color: #061a38; padding: 26px 24px; text-align: center;">
                    <img src="${logoSrc}" alt="Trynova" width="68" style="display: block; margin: 0 auto; max-width: 68px; height: auto; border: 0;" />
                  </td>
                </tr>

                <!-- Corpo da Mensagem -->
                <tr>
                  <td style="padding: 38px 40px 32px 40px;">
                    
                    <!-- Tag da Categoria -->
                    <table border="0" cellspacing="0" cellpadding="0" style="margin-bottom: 14px;">
                      <tr>
                        <td style="background-color: #f0f5fc; border: 1px solid #d4e3f7; border-radius: 4px; padding: 4px 10px;">
                          <span style="color: #054a96; font-size: 10px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase;">
                            COMUNICAÇÃO CORPORATIVA
                          </span>
                        </td>
                      </tr>
                    </table>

                    <!-- Título Formal -->
                    <h1 style="color: #061a38; font-size: 21px; margin: 0 0 16px 0; font-weight: 700; line-height: 1.35; letter-spacing: -0.3px;">
                      Sua Assinatura de E-mail Corporativa
                    </h1>

                    <!-- Saudação -->
                    <p style="color: #1e293b; font-size: 14px; line-height: 1.6; margin: 0 0 14px 0;">
                      Olá, <strong>${nome}</strong>,
                    </p>

                    <!-- Texto Principal -->
                    <p style="color: #475569; font-size: 14px; line-height: 1.65; margin: 0 0 22px 0;">
                      Sua assinatura corporativa oficial da <strong>Trynova Consultoria Imobiliária</strong> está pronta para visualização e configuração.
                    </p>

                    <!-- Instruções de Configuração -->
                    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; margin: 0 0 28px 0;">
                      <tr>
                        <td style="padding: 16px 20px;">
                          <div style="color: #061a38; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 10px;">
                            Instruções para Configuração:
                          </div>
                          <table width="100%" border="0" cellspacing="0" cellpadding="0">
                            <tr>
                              <td width="20" valign="top" style="color: #054a96; font-size: 13px; font-weight: 700; line-height: 1.5;">1.</td>
                              <td valign="top" style="color: #475569; font-size: 13px; line-height: 1.5; padding-bottom: 6px;">
                                Acesse o link individual pelo botão abaixo;
                              </td>
                            </tr>
                            <tr>
                              <td width="20" valign="top" style="color: #054a96; font-size: 13px; font-weight: 700; line-height: 1.5;">2.</td>
                              <td valign="top" style="color: #475569; font-size: 13px; line-height: 1.5; padding-bottom: 6px;">
                                Confira seus dados profissionais (cargo, departamento, ramal e telefone);
                              </td>
                            </tr>
                            <tr>
                              <td width="20" valign="top" style="color: #054a96; font-size: 13px; font-weight: 700; line-height: 1.5;">3.</td>
                              <td valign="top" style="color: #475569; font-size: 13px; line-height: 1.5;">
                                Copie ou baixe o arquivo oficial e aplique em seu Microsoft Outlook.
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>

                    <!-- Botão de Ação -->
                    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin: 0 0 28px 0;">
                      <tr>
                        <td align="center">
                          <table border="0" cellspacing="0" cellpadding="0">
                            <tr>
                              <td align="center" style="border-radius: 6px; background-color: #054a96;">
                                <a href="${link}" target="_blank" style="display: inline-block; padding: 14px 34px; color: #ffffff; font-size: 14px; font-weight: 700; text-decoration: none; border-radius: 6px; letter-spacing: 0.3px;">
                                  Visualizar Minha Assinatura &rarr;
                                </a>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>

                    <!-- Aviso de Segurança e Validade (Sem emojis) -->
                    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="border-left: 3px solid #054a96; background-color: #f1f5f9; border-radius: 0 4px 4px 0; margin: 0 0 28px 0;">
                      <tr>
                        <td style="padding: 12px 16px;">
                          <div style="color: #061a38; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 2px;">
                            Aviso de Segurança e Validade
                          </div>
                          <div style="color: #526b91; font-size: 12px; line-height: 1.5;">
                            Este link é pessoal, intransferível e possui validade de <strong>30 minutos</strong> a partir do envio. Não compartilhe esta mensagem.
                          </div>
                        </td>
                      </tr>
                    </table>

                    <!-- Assinatura Institucional do E-mail -->
                    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="padding-top: 18px; border-top: 1px solid #eef2f6;">
                      <tr>
                        <td>
                          <p style="color: #475569; font-size: 13px; line-height: 1.4; margin: 0 0 4px 0;">
                            Atenciosamente,
                          </p>
                          <p style="color: #061a38; font-size: 13px; font-weight: 700; margin: 0 0 2px 0;">
                            Tecnologia da Informação & Comunicação Corporativa
                          </p>
                          <p style="color: #64748b; font-size: 12px; margin: 0;">
                            Trynova Consultoria Imobiliária
                          </p>
                        </td>
                      </tr>
                    </table>

                  </td>
                </tr>

                <!-- Rodapé Interno com Selo de 33 Anos -->
                <tr>
                  <td style="padding: 18px 40px; background-color: #fafbfc; border-top: 1px solid #e2e8f0;">
                    <table width="100%" border="0" cellspacing="0" cellpadding="0">
                      <tr>
                        <td width="46" valign="middle">
                          <img src="${selo33Src}" alt="33 Anos" width="40" style="display: block; height: auto; border: 0;" />
                        </td>
                        <td valign="middle" style="padding-left: 14px; border-left: 1px solid #dce4ee;">
                          <div style="font-size: 11px; font-weight: 800; color: #061a38; letter-spacing: 1.5px;">
                            TRYNOVA &bull; 33 ANOS
                          </div>
                          <div style="font-size: 10px; color: #64748b; letter-spacing: 0.5px; line-height: 1.4; margin-top: 2px;">
                            Consultoria Imobiliária
                          </div>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

              </table>

              <!-- Rodapé Externo Formal -->
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 560px; margin-top: 18px;">
                <tr>
                  <td align="center" style="padding: 0 10px;">
                    <p style="color: #94a3b8; font-size: 11px; line-height: 1.5; margin: 0 0 6px 0; text-align: center;">
                      Esta é uma mensagem automática gerada pela plataforma interna de assinaturas. Por favor, não responda a este e-mail.
                    </p>
                    <p style="color: #94a3b8; font-size: 10px; font-weight: 600; letter-spacing: 1px; text-transform: uppercase; margin: 0; text-align: center;">
                      Copyright &copy; 2026 Trynova Consultoria Imobiliária. Todos os direitos reservados.
                    </p>
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