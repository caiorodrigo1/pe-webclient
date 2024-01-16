interface Submenu {
  url: string;
  title: string;
  badge?: string;
  state: string;
  hide: string;
  caret?: string;
  submenu: Submenu[];
}

interface Menu {
  icon: string;
  title: string;
  label: string;
  badge?: string;
  state: string;
  hide: string;
  url: string;
  caret?: string;
  submenu: Submenu[];
}

const appMenus: Menu[] = [
  {
    icon: 'fa fa-sitemap',
    title: 'Processo',
    label: '',
    caret: 'false',
    badge: '',
    state: '',
    hide: '',
    url: 'widget',
    submenu: [
      {
        url: 'processo/tramitados',
        title: 'Tramitados',
        badge: '',
        state: '',
        hide: '',
        submenu: [],
      },
      {
        url: 'processo/nao-tramitados',
        title: 'Não Tramitados',
        badge: '',
        state: '',
        hide: '',
        submenu: [],
      },
      {
        url: 'processo/favoritos',
        title: 'Favoritos',
        badge: '',
        state: '',
        hide: '',
        submenu: [],
      },
      {
        url: 'processo/instituicoes-externas',
        title: 'Instituições Externas',
        state: '',
        hide: '',
        submenu: [],
      },
      {
        url: 'processo/distribuidos',
        title: 'Distribuídos',
        state: '',
        hide: '',
        submenu: [],
      },
      {
        url: 'processo/arquivados',
        title: 'Arquivados',
        state: '',
        hide: '',
        submenu: [],
      },
      {
        url: 'processo/pesquisa',
        title: 'Pesquisar Processos',
        state: '',
        hide: '',
        submenu: [],
      },
      {
        url: 'peticionamento',
        title: 'Peticionamentos',
        state: '',
        hide: '',
        submenu: [],
      },
    ],
  },
  {
    icon: 'fa fa-file-edit',
    title: 'Assinaturas',
    label: '',
    state: '',
    hide: '',
    url: 'assinatura',
    submenu: [],
  },
  {
    icon: 'fa fa-table',
    title: 'Tabelas Auxiliares',
    label: '',
    caret: 'false',
    state: '',
    hide: '',
    url: 'widget',
    submenu: [
      {
        url: 'hipotese-legal',
        title: 'Hipóteses Legais (LGPD)',
        state: '',
        hide: '',
        submenu: [],
      },
      {
        url: 'cargo',
        title: 'Cargos',
        state: '',
        hide: '',
        submenu: [],
      },
      {
        url: 'funcao',
        title: 'Funções',
        state: '',
        hide: '',
        submenu: [],
      },
      {
        url: 'tipo-documento',
        title: 'Tipos de Documento',
        state: '',
        hide: '',
        submenu: [],
      },
      {
        url: 'tipo-anexo',
        title: 'Tipos de Anexo',
        state: '',
        hide: '',
        submenu: [],
      },
      {
        url: 'tipo-processo',
        title: 'Tipos de Processo',
        state: '',
        hide: '',
        submenu: [],
      },
      {
        url: 'assunto-processo',
        title: 'Assuntos do Processo',
        state: '',
        hide: '',
        submenu: [],
      },
      {
        url: 'interessado-processo',
        title: 'Interessados no Processo',
        state: '',
        hide: '',
        submenu: [],
      },
      {
        url: 'instituicao-externa',
        title: 'Instituições Externas',
        state: '',
        hide: '',
        submenu: [],
      },
      {
        url: 'template-despacho',
        title: 'Template de Despacho',
        state: '',
        hide: '',
        submenu: [],
      },
      {
        url: 'template-documento',
        title: 'Template de Documento',
        state: '',
        hide: '',
        submenu: [],
      },
      {
        url: 'template-processo',
        title: 'Template de Processo',
        state: '',
        hide: '',
        submenu: [],
      },
      {
        url: 'situacao-processo',
        title: 'Situação do Processo',
        state: '',
        hide: '',
        submenu: [],
      },
      {
        url: 'fluxo-processo',
        title: 'Fluxo de Processo',
        state: '',
        hide: '',
        submenu: [],
      },
      {
        url: 'papeis-usuario',
        title: 'Papéis do Usuário',
        state: '',
        hide: '',
        submenu: [],
      },
      // {
      //   url: 'processo',
      //   title: 'Processo',
      //   state: '',
      //   hide: '',
      //   submenu: [],
      // },
    ],
  },
  {
    icon: 'fa fa-building',
    title: 'Administrativo',
    label: '',
    caret: 'false',
    state: '',
    hide: '',
    url: 'widget',
    submenu: [
      {
        url: 'auditoria',
        title: 'Consultar Auditoria',
        state: '',
        hide: '',
        submenu: [],
      },
      {
        url: 'cliente',
        title: 'Clientes',
        state: '',
        hide: '',
        submenu: [],
      },
      {
        url: 'orgao',
        title: 'Órgãos',
        state: '',
        hide: '',
        submenu: [],
      },
      {
        url: 'setor',
        title: 'Setores',
        state: '',
        hide: '',
        submenu: [],
      },
      {
        url: 'unidade',
        title: 'Unidades',
        state: '',
        hide: '',
        submenu: [],
      },
      {
        url: 'municipio',
        title: 'Municípios',
        state: '',
        hide: '',
        submenu: [],
      },
      {
        url: 'usuario',
        title: 'Usuários',
        state: '',
        hide: '',
        submenu: [],
      },
      {
        url: 'permissao',
        title: 'Permissões',
        state: '',
        hide: '',
        submenu: [],
      },
    ],
  },
];

export default appMenus;
