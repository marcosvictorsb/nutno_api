import { Router } from 'express';
import { authMiddleware } from '../../../middlewares/auth';
import { criarPaciente } from '../controllers/criar.paciente.controller';
import { listarPacientes } from '../controllers/listar.pacientes.controller';
import { buscarPaciente } from '../controllers/buscar.paciente.controller';
import { atualizarPaciente } from '../controllers/atualizar.paciente.controller';
import { arquivarPaciente } from '../controllers/arquivar.paciente.controller';
import { enviarFormularioPaciente } from '../controllers/enviar.formulario.controller';

const pacienteRoutes = Router();

pacienteRoutes.use(authMiddleware);

pacienteRoutes.post('/pacientes', criarPaciente);
pacienteRoutes.get('/pacientes', listarPacientes);
pacienteRoutes.get('/pacientes/:id', buscarPaciente);
pacienteRoutes.put('/pacientes/:id', atualizarPaciente);
pacienteRoutes.patch('/pacientes/:id/arquivar', arquivarPaciente);
pacienteRoutes.post(
  '/pacientes/:id/enviar-formulario',
  enviarFormularioPaciente
);

export default pacienteRoutes;
