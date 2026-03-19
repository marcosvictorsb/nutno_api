import { Router } from 'express';
import { authMiddleware } from '../../../middlewares/auth';
import { criarPaciente } from '../controllers/criar.paciente.controller';
import { listarPacientes } from '../controllers/listar.pacientes.controller';
import { buscarPaciente } from '../controllers/buscar.paciente.controller';
import { atualizarPaciente } from '../controllers/atualizar.paciente.controller';
import { arquivarPaciente } from '../controllers/arquivar.paciente.controller';
import { enviarFormularioPaciente } from '../controllers/enviar.formulario.controller';

const pacienteRoutes = Router();

pacienteRoutes.post('/pacientes', authMiddleware, criarPaciente);
pacienteRoutes.get('/pacientes', authMiddleware, listarPacientes);
pacienteRoutes.get('/pacientes/:id', authMiddleware, buscarPaciente);
pacienteRoutes.put('/pacientes/:id', authMiddleware, atualizarPaciente);
pacienteRoutes.patch(
  '/pacientes/:id/arquivar',
  authMiddleware,
  arquivarPaciente
);
pacienteRoutes.post(
  '/pacientes/:id/enviar-formulario',
  authMiddleware,
  enviarFormularioPaciente
);

export default pacienteRoutes;
