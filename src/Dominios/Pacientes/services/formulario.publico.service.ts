import { Resend } from 'resend';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import logger from '../../../config/logger';

interface EnviarFormularioEmailParams {
  email: string;
  nomePaciente: string;
  nomeNutricionista: string;
  linkFormulario: string;
}

function renderizarTemplate(
  templatePath: string,
  dados: Record<string, string>
): string {
  try {
    let html = readFileSync(templatePath, 'utf-8');

    // Substituir variáveis no template
    Object.entries(dados).forEach(([chave, valor]) => {
      const placeholder = `{{${chave}}}`;
      html = html.replace(new RegExp(placeholder, 'g'), valor);
    });

    return html;
  } catch (error) {
    logger.error('Erro ao ler template de email', { error, templatePath });
    throw new Error('Erro ao renderizar template de email');
  }
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

  // Caminho do template
  const templatePath = resolve(
    __dirname,
    '../../../templates/emails/formulario-anamnese.html'
  );

  // Renderizar template com as variáveis
  const html = renderizarTemplate(templatePath, {
    nomePaciente,
    nomeNutricionista,
    linkFormulario,
  });

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
