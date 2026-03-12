import { Resend } from 'resend';
import logger from '../../../config/logger';

interface EnviarFormularioEmailParams {
  email: string;
  nomePaciente: string;
  nomeNutricionista: string;
  linkFormulario: string;
}

export async function enviarFormularioPorEmail({
  email,
  nomePaciente,
  nomeNutricionista,
  linkFormulario,
}: EnviarFormularioEmailParams): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    throw new Error('RESEND_API_KEY nao configurada');
  }

  const resend = new Resend(apiKey);

  const html = `
    <html>
      <body style="font-family: Arial, sans-serif; line-height: 1.5; color: #1f2937;">
        <h2>Ola, ${nomePaciente}!</h2>
        <p>${nomeNutricionista} enviou seu formulario inicial.</p>
        <p>Para preencher, clique no link abaixo:</p>
        <p><a href="${linkFormulario}" target="_blank">Preencher formulario</a></p>
        <p>Se o botao nao abrir, copie e cole este link no navegador:</p>
        <p>${linkFormulario}</p>
      </body>
    </html>
  `;

  logger.info('Enviando formulario por email', { email });

  await resend.emails.send({
    from: (process.env.EMAIL_FROM as string) || 'Nutno <onboarding@resend.dev>',
    to: email,
    subject: 'Seu formulario de anamnese',
    html,
  });

  logger.info('Formulario enviado por email', { email });
}

export function criarMensagemWhatsApp(
  nomePaciente: string,
  nomeNutricionista: string,
  linkFormulario: string
): string {
  return `Ola, ${nomePaciente}! Aqui e ${nomeNutricionista}.\n\nPara adiantar sua consulta, preencha seu formulario neste link:\n${linkFormulario}`;
}

export function gerarLinkWhatsApp(numero: string, mensagem: string): string {
  const numeroLimpo = numero.replace(/\D/g, '');
  return `https://wa.me/${numeroLimpo}?text=${encodeURIComponent(mensagem)}`;
}
