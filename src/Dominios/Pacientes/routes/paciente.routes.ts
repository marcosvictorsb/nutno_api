import { Router } from 'express';
import { authMiddleware } from '../../../middlewares/auth';
import {
  handleUploadError,
  uploadFotoPaciente,
} from '../../../middlewares/upload';
import { arquivarPaciente } from '../controllers/arquivar.paciente.controller';
import { ativarPaciente } from '../controllers/ativar.paciente.controller';
import { atualizarFotoPaciente } from '../controllers/atualizar.foto.paciente.controller';
import { atualizarPaciente } from '../controllers/atualizar.paciente.controller';
import { buscarPaciente } from '../controllers/buscar.paciente.controller';
import { criarPaciente } from '../controllers/criar.paciente.controller';
import { enviarFormularioPaciente } from '../controllers/enviar.formulario.controller';
import { listarPacientes } from '../controllers/listar.pacientes.controller';

const pacienteRoutes = Router();

pacienteRoutes.post('/pacientes', authMiddleware, criarPaciente);
pacienteRoutes.get('/pacientes', authMiddleware, listarPacientes);
pacienteRoutes.get('/pacientes/:id', authMiddleware, buscarPaciente);
pacienteRoutes.put('/pacientes/:id', authMiddleware, atualizarPaciente);
pacienteRoutes.put(
  '/pacientes/:pacienteId/foto',
  authMiddleware,
  uploadFotoPaciente.single('foto'),
  handleUploadError,
  atualizarFotoPaciente
);
pacienteRoutes.patch(
  '/pacientes/:id/arquivar',
  authMiddleware,
  arquivarPaciente
);
pacienteRoutes.patch('/pacientes/:id/ativar', authMiddleware, ativarPaciente);

pacienteRoutes.post(
  '/pacientes/:id/enviar-formulario',
  authMiddleware,
  enviarFormularioPaciente
);

export default pacienteRoutes;
