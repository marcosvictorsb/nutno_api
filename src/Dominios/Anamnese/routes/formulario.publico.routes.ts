import { Router } from 'express';
import { validarFormularioPublico } from '../controllers/validar.formulario.controller';
import { salvarAnamnesePublica } from '../controllers/salvar.anamnese.controller';

const formularioPublicoRoutes = Router();

formularioPublicoRoutes.get('/formulario/:token', validarFormularioPublico);
formularioPublicoRoutes.post('/formulario/:token', salvarAnamnesePublica);

export default formularioPublicoRoutes;
