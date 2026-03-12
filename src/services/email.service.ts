import fs from 'fs';
import path from 'path';
import logger from '../config/logger';

/**
 * Interface para variáveis de template
 */
export interface TemplateVariables {
  [key: string]: string | number;
}

/**
 * Carrega um template de email e substitui as variáveis
 * @param templateName Nome do arquivo do template (sem .html)
 * @param variables Objeto com as variáveis para substituir
 * @returns HTML processado
 */
export function loadEmailTemplate(
  templateName: string,
  variables: TemplateVariables
): string {
  const templatePath = path.join(
    __dirname,
    `../templates/emails/${templateName}.html`
  );

  // Verificar se o arquivo existe
  if (!fs.existsSync(templatePath)) {
    throw new Error(`Template não encontrado: ${templateName}`);
  }

  // Ler o arquivo
  let htmlContent = fs.readFileSync(templatePath, 'utf-8');

  // Substituir variáveis
  Object.entries(variables).forEach(([key, value]) => {
    const regex = new RegExp(`{{${key}}}`, 'g');
    htmlContent = htmlContent.replace(regex, String(value));
  });

  return htmlContent;
}

/**
 * Envia um email usando Resend
 */
export async function sendEmail(
  _to: string,
  subject: string,
  templateName: string,
  variables: TemplateVariables
) {
  try {
    const { Resend } = await import('resend');
    const resend = new Resend(process.env.RESEND_API_KEY);

    const html = loadEmailTemplate(templateName, variables);

    const result = await resend.emails.send({
      from: process.env.EMAIL_FROM as string,
      to: 'marcosvictorsb@gmail.com',
      subject,
      html,
    });

    console.log(`Email sent to ${_to}:`, result);
    return result;
  } catch (error) {
    logger.error('Erro ao enviar email', { error });
    throw new Error('Falha ao enviar email');
  }
}
