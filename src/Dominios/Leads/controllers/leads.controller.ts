import { Response } from 'express';
import Lead from '../models/Lead';
import { CustomRequest } from '../../../middlewares/validation';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY as string);

const sendWelcomeEmail = async (
  email: string,
  name: string | null
): Promise<void> => {
  const displayName = name || 'Você';
  const subject = `✅ Você está na lista, ${displayName}!`;

  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #333;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    p {
      margin: 15px 0;
    }
  </style>
</head>
<body>
  <div class="container">
    <p>Olá, ${displayName}!</p>

    <p>Que bom ter você aqui.</p>

    <p>Você acaba de garantir seu lugar na lista de acesso 
    antecipado do Nutno — o jeito mais simples de montar 
    e enviar dietas para seus pacientes.</p>

    <h3>O que acontece agora?</h3>

    <p>Estamos finalizando os últimos detalhes da plataforma.
    Assim que abrirmos as primeiras vagas, você será 
    um dos primeiros a saber — antes de todo mundo.</p>

    <h3>Por estar na lista desde o início, você garante:</h3>
    <p>
      ✅ Acesso antes do lançamento oficial<br>
      ✅ 30 dias grátis para testar tudo<br>
      ✅ Preço de fundador travado para sempre
    </p>

    <h3>Enquanto isso, uma pergunta rápida:</h3>

    <p>👉 Qual é sua maior dificuldade hoje na hora de 
    montar e enviar dietas para seus pacientes?</p>

    <p>Responde esse e-mail com uma palavra ou uma frase curta.
    Cada resposta lemos pessoalmente e vai ajudar a moldar 
    o Nutno para a sua realidade.</p>

    <p>Com carinho,<br>
    Marcos<br>
    Fundador do Nutno</p>
  </div>
</body>
</html>
  `;

  const textContent = `
Olá, ${displayName}!

Que bom ter você aqui.

Você acaba de garantir seu lugar na lista de acesso antecipado do Nutno — o jeito mais simples de montar e enviar dietas para seus pacientes.

O que acontece agora?

Estamos finalizando os últimos detalhes da plataforma. Assim que abrirmos as primeiras vagas, você será um dos primeiros a saber — antes de todo mundo.

Por estar na lista desde o início, você garante:
✅ Acesso antes do lançamento oficial
✅ 30 dias grátis para testar tudo
✅ Preço de fundador travado para sempre

Enquanto isso, uma pergunta rápida:

👉 Qual é sua maior dificuldade hoje na hora de montar e enviar dietas para seus pacientes?

Responde esse e-mail com uma palavra ou uma frase curta. Cada resposta lemos pessoalmente e vai ajudar a moldar o Nutno para a sua realidade.

Com carinho,
Marcos
Fundador do Nutno
  `;

  try {
    await resend.emails.send({
      from: 'Nutno <oi@nutno.com.br>',
      to: email,
      subject: subject,
      html: htmlContent,
      text: textContent,
    });
    console.log(`Welcome email sent to ${email}`);
  } catch (error) {
    console.error(`Failed to send welcome email to ${email}:`, error);
    throw error;
  }
};

export const createLead = async (
  req: CustomRequest,
  res: Response
): Promise<void> => {
  try {
    if (req.validationErrors && req.validationErrors.length > 0) {
      res.status(400).json({
        success: false,
        errors: req.validationErrors,
      });
      return;
    }

    const { name, email } = req.body;

    const lead = await Lead.create({
      name: name || null,
      email: email || null,
    });
    console.log('Lead created:', {
      id: lead.id,
      name: lead.name,
      email: lead.email,
      createdAt: lead.createdAt,
    });

    if (process.env.NODE_ENV === 'production') {
      await sendWelcomeEmail(email, lead.name);
    }

    res.status(201).json({
      success: true,
      message: 'Lead created successfully',
      data: {
        id: lead.id,
        name: lead.name,
        email: lead.email,
        createdAt: lead.createdAt,
      },
    });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes('Duplicate entry')) {
        res.status(409).json({
          success: false,
          error: 'Email already exists',
        });
      } else {
        console.error('Error creating lead:', error);
        res.status(500).json({
          success: false,
          error: 'Failed to create lead',
        });
      }
    } else {
      res.status(500).json({
        success: false,
        error: 'Internal server error',
      });
    }
  }
};
