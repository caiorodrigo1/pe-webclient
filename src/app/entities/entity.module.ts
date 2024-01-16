import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

@NgModule({
  imports: [
    RouterModule.forChild([
      {
        path: '',
        redirectTo: 'processo',
        pathMatch: 'full',
      },
      {
        path: 'processo',
        loadChildren: () =>
          import('./processo/processo.module').then((m) => m.ProcessoModule),
      },
      {
        path: 'hipotese-legal',
        loadChildren: () =>
          import('./crud/hipotese-legal/hipotese-legal.module').then(
            (m) => m.HipoteseLegalModule
          ),
      },
      {
        path: 'cargo',
        loadChildren: () =>
          import('./crud/cargo/cargo.module').then((m) => m.CargoModule),
      },
      {
        path: 'funcao',
        loadChildren: () =>
          import('./crud/funcao/funcao.module').then((m) => m.FuncaoModule),
      },
      {
        path: 'tipo-processo',
        loadChildren: () =>
          import('./crud/tipo-processo/tipo-processo.module').then(
            (m) => m.TipoProcessoModule
          ),
      },
      {
        path: 'tipo-documento',
        loadChildren: () =>
          import('./crud/tipo-documento/tipo-documento.module').then(
            (m) => m.TipoDocumentoModule
          ),
      },
      {
        path: 'tipo-anexo',
        loadChildren: () =>
          import('./crud/tipo-anexo/tipo-anexo.module').then(
            (m) => m.TipoAnexoModule
          ),
      },
      {
        path: 'assunto-processo',
        loadChildren: () =>
          import('./crud/assunto-processo/assunto-processo.module').then(
            (m) => m.AssuntoProcessoModule
          ),
      },
      {
        path: 'interessado-processo',
        loadChildren: () =>
          import(
            './crud/interessado-processo/interessado-processo.module'
          ).then((m) => m.InteressadoProcessoModule),
      },
      {
        path: 'instituicao-externa',
        loadChildren: () =>
          import('./crud/instituicao-externa/instituicao-externa.module').then(
            (m) => m.InstituicaoExternaModule
          ),
      },
      {
        path: 'template-despacho',
        loadChildren: () =>
          import('./crud/template-despacho/template-despacho.module').then(
            (m) => m.TemplateDespachoModule
          ),
      },
      {
        path: 'template-documento',
        loadChildren: () =>
          import('./crud/template-documento/template-documento.module').then(
            (m) => m.TemplateDocumentoModule
          ),
      },
      {
        path: 'template-processo',
        loadChildren: () =>
          import('./crud/template-processo/template-processo.module').then(
            (m) => m.TemplateProcessoModule
          ),
      },
      {
        path: 'situacao-processo',
        loadChildren: () =>
          import('./crud/situacao-processo/situacao-processo.module').then(
            (m) => m.SituacaoProcessoModule
          ),
      },
      {
        path: 'fluxo-processo',
        loadChildren: () =>
          import('./crud/fluxo-processo/fluxo-processo.module').then(
            (m) => m.FluxoProcessoModule
          ),
      },
      {
        path: 'papeis-usuario',
        loadChildren: () =>
          import('./crud/papeis-usuario/papeis-usuario.module').then(
            (m) => m.PapeisUsuarioModule
          ),
      },
      {
        path: 'auditoria',
        loadChildren: () =>
          import('./auxiliar/auditoria/auditoria.module').then(
            (m) => m.AuditoriaModule
          ),
      },
      {
        path: 'cliente',
        loadChildren: () =>
          import('./crudsso/cliente/cliente.module').then(
            (m) => m.ClienteModule
          ),
      },
      {
        path: 'orgao',
        loadChildren: () =>
          import('./crudsso/orgao/orgao.module').then((m) => m.OrgaoModule),
      },
      {
        path: 'setor',
        loadChildren: () =>
          import('./crudsso/setor/setor.module').then((m) => m.SetorModule),
      },
      {
        path: 'unidade',
        loadChildren: () =>
          import('./crudsso/unidade/unidade.module').then(
            (m) => m.UnidadeModule
          ),
      },
      {
        path: 'municipio',
        loadChildren: () =>
          import('./crudsso/municipio/municipio.module').then(
            (m) => m.MunicipioModule
          ),
      },
      {
        path: 'usuario',
        loadChildren: () =>
          import('./crudsso/usuario/usuario.module').then(
            (m) => m.UsuarioModule
          ),
      },
      {
        path: 'permissao',
        loadChildren: () =>
          import('./crud/permissao/permissao.module').then(
            (m) => m.PermissaoModule
          ),
      },
      {
        path: 'peticionamento',
        loadChildren: () =>
          import('./auxiliar/peticionamento/peticionamento.module').then(
            (m) => m.PeticionamentoModule
          ),
      },
      {
        path: 'assinatura',
        loadChildren: () =>
          import('./auxiliar/assinatura/assinatura.module').then(
            (m) => m.AssinaturaModule
          ),
      },
      {
        path: 'dashboard',
        loadChildren: () =>
          import('./auxiliar/dashboard/dashboard.module').then(
            (m) => m.DashboardModule
          ),
      },
    ]),
  ],
})
export class EntityModule {}
