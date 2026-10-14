import nodemailer from "nodemailer";

const camposObrigatorios = [
  "SMTP_HOST",
  "SMTP_PORT",
  "SMTP_USER",
  "SMTP_PASS",
  "SMTP_FROM",
];

function validarConfiguracao() {
  const ausentes = camposObrigatorios.filter(
    (campo) => !process.env[campo]?.trim()
  );

  if (ausentes.length > 0) {
    throw new Error(
      `Configuração SMTP incompleta: ${ausentes.join(", ")}`
    );
  }
}

export async function enviarLink({ para, nome, link }) {
  validarConfiguracao();

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
      <div style="font-family: Arial, sans-serif; color: #1e293b;">
        <h2 style="color: #23325a;">
          Sua assinatura corporativa
        </h2>

        <p>Olá, <strong>${nome}</strong>.</p>

        <p>
          Sua assinatura corporativa está pronta.
          Clique no botão abaixo para acessá-la.
        </p>

        <p style="margin: 25px 0;">
          <a
            href="${link}"
            style="
              display: inline-block;
              padding: 12px 22px;
              color: #ffffff;
              background: #1659a6;
              border-radius: 8px;
              text-decoration: none;
              font-weight: bold;
            "
          >
            Acessar minha assinatura
          </a>
        </p>

        <p style="font-size: 12px; color: #64748b;">
          Este link é temporário e deve ser utilizado somente pelo destinatário.
        </p>
      </div>
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