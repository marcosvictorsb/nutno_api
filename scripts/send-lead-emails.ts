import 'dotenv/config';
import logger from '../src/config/logger';
import Lead from '../src/Dominios/Leads/models/Lead';
import { sendEmail } from '../src/services/email.service';

/**
 * Script para enviar emails de abertura de vagas aos leads
 * Executado via: npm run send:lead-emails
 */
async function sendLeadEmails(): Promise<void> {
  logger.info(
    '[SCRIPT - LEADS] Iniciando script de envio de emails para leads'
  );

  try {
    // Buscar todos os leads que ainda não receberam o email
    logger.info('[SCRIPT - LEADS] Buscando leads com enviada = false');

    const leadsParaEnviar = await Lead.findAll({
      where: {
        enviada: false,
      },
      raw: true,
    });

    logger.info('[SCRIPT - LEADS] Leads encontrados', {
      quantidade: leadsParaEnviar.length,
    });

    if (leadsParaEnviar.length === 0) {
      logger.info('[SCRIPT - LEADS] Nenhum lead para enviar email');
      console.log('\n✅ Nenhum lead para enviar email\n');
      process.exit(0);
    }

    console.log(
      `\n📧 Iniciando envio de emails para ${leadsParaEnviar.length} lead(s)...\n`
    );

    let enviados = 0;
    let erros = 0;

    // Enviar email para cada lead
    for (const lead of leadsParaEnviar) {
      try {
        logger.info('[SCRIPT - LEADS] Processando lead', {
          leadId: lead.id,
          leadEmail: lead.email,
          leadName: lead.name,
        });

        // Validar email
        if (!lead.email) {
          logger.warn('[SCRIPT - LEADS] Lead sem email, pulando', {
            leadId: lead.id,
            leadName: lead.name,
          });
          console.log(
            `⚠️  Lead #${lead.id} (${lead.name}) - Sem email, pulado`
          );
          erros++;
          continue;
        }

        // Construir link exclusivo
        const exclusiveLink = `https://www.nutno.com.br/criar-conta-lead?${lead.email}`;

        logger.info('[SCRIPT - LEADS] Enviando email', {
          leadId: lead.id,
          leadEmail: lead.email,
          exclusiveLink,
        });

        // Enviar email
        await sendEmail(
          lead.email,
          lead.name || 'Lead',
          'lead-abertura-vagas',
          {
            leadName: lead.name || 'Você',
            exclusiveLink,
          }
        );

        logger.info('[SCRIPT - LEADS] Email enviado com sucesso', {
          leadId: lead.id,
          leadEmail: lead.email,
        });

        // Atualizar lead marcando como enviado
        await Lead.update(
          {
            enviada: true,
          },
          {
            where: {
              id: lead.id,
            },
          }
        );

        logger.info('[SCRIPT - LEADS] Lead marcado como enviado', {
          leadId: lead.id,
        });

        console.log(
          `✅ Lead #${lead.id} (${lead.name}) - Email enviado para ${lead.email}`
        );
        enviados++;
      } catch (error: Error | any) {
        logger.error('[SCRIPT - LEADS] Erro ao enviar email para lead', {
          leadId: lead.id,
          leadEmail: lead.email,
          error: error.message,
          stack: error.stack,
        });
        console.log(
          `❌ Lead #${lead.id} (${lead.name}) - Erro: ${error.message}`
        );
        erros++;
      }
    }

    console.log(`\n${'='.repeat(60)}`);
    console.log(`📊 Resumo do envio:`);
    console.log(`   Total de leads: ${leadsParaEnviar.length}`);
    console.log(`   ✅ Enviados: ${enviados}`);
    console.log(`   ❌ Erros: ${erros}`);
    console.log(`${'='.repeat(60)}\n`);

    logger.info('[SCRIPT - LEADS] Script finalizado com sucesso', {
      totalLeads: leadsParaEnviar.length,
      enviados,
      erros,
    });

    process.exit(0);
  } catch (error: Error | any) {
    logger.error('[SCRIPT - LEADS] Erro geral no script de leads', {
      error: error.message,
      stack: error.stack,
    });
    console.log(`\n❌ Erro geral: ${error.message}\n`);
    process.exit(1);
  }
}

// Executar o script
sendLeadEmails();
