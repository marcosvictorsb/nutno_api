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
 * Interface para anexos
 */
export interface EmailAttachment {
  filename: string;
  content: Buffer | string;
  contentType?: string;
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
    process.cwd(),
    `templates/emails/${templateName}.html`
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
  variables: TemplateVariables,
  attachments?: EmailAttachment[]
) {
  try {
    const { Resend } = await import('resend');
    const resend = new Resend(process.env.RESEND_API_KEY);

    const html = loadEmailTemplate(templateName, variables);

    const emailData: any = {
      from: process.env.EMAIL_FROM as string,
      to:
        process.env.NODE_ENV === 'production'
          ? _to
          : (process.env.DEV_EMAIL as string),
      subject,
      html,
    };

    // Adicionar anexos se fornecidos
    if (attachments && attachments.length > 0) {
      emailData.attachments = attachments.map((att) => ({
        filename: att.filename,
        content: att.content,
        contentType: att.contentType || 'application/octet-stream',
      }));

      logger.info('Anexos adicionados ao email', {
        destinatario: _to,
        quantidade_anexos: attachments.length,
        anexos: attachments.map((a) => a.filename),
      });
    }

    const result = await resend.emails.send(emailData);

    logger.info('Email enviado com sucesso', {
      destinatario: _to,
      assunto: subject,
      template: templateName,
      com_anexos: !!attachments?.length,
    });

    return result;
  } catch (error) {
    logger.error('Erro ao enviar email', { error });
    throw new Error('Falha ao enviar email');
  }
}
