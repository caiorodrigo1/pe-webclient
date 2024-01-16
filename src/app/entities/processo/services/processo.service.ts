import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';

import { config } from 'src/app/core/config/config';
import { createRequestOption } from 'src/app/shared/util/request.util';
import { IEntidade } from 'src/app/shared/models/entidade-response.model';
import {
  IProcesso,
  IProcessoJuntadaRequest,
  IProcessoRequest,
} from 'src/app/shared/models/processo.model';
import { TramitacaoProcesso } from 'src/app/shared/models/tramitacao-processo.model';
import { IDespacho } from 'src/app/shared/models/despacho.model';
import { ISignatarioRequest } from 'src/app/shared/models/signatario.model';

type RespostaTipoEntidade = HttpResponse<IEntidade>;
//type RespostaTipoEntidadeLista = HttpResponse<IEntidade[]>;

@Injectable({
  providedIn: 'root',
})
export class ProcessoService {
  private readonly API_URL = `${config['apiUrl']}/processo-eletronico`;
  private readonly tam = 1000;

  constructor(private httpClient: HttpClient) {}

  //Buscas de Processos--------------------------
  pesquisarProcessosExternamente(
    request: any,
    tenant: string
  ): Observable<RespostaTipoEntidade> {
    const queryParams: string[] = [];

    for (const key in request) {
      if (request[key]) queryParams.push(`${key}=${request[key]}`);
    }

    const queryString =
      queryParams.length > 0 ? '&' + queryParams.join('&') : '';

    return this.httpClient.get<IEntidade>(
      `${this.API_URL}/processo/pesquisa/publica?tenant=${tenant}${queryString}&pageSize=${this.tam}&pageIndex=1`,
      {
        observe: 'response',
      }
    );
  }

  // consultarLista(requisicao?: any): Observable<RespostaTipoEntidadeLista> {
  //   const options = createRequestOption(requisicao);
  //   return this.httpClient.get<IEntidade[]>(
  //     `${this.API_URL}/processo?pageSize=${this.tam}&pageIndex=1`,
  //     {
  //       params: options,
  //       observe: 'response',
  //     }
  //   );
  // }

  consultarLista_Tipo(
    tipo: number,
    setorId: number
  ): Observable<RespostaTipoEntidade> {
    return this.httpClient.get<IEntidade>(
      `${this.API_URL}/processo/visualizar/todos?tipoVisualizacao=${tipo}&setorId=${setorId}&pageSize=${this.tam}&pageIndex=1`,
      {
        observe: 'response',
      }
    );
  }

  consultarProcesso(id: number): Observable<RespostaTipoEntidade> {
    return this.httpClient.get<IEntidade>(`${this.API_URL}/processo/${id}`, {
      observe: 'response',
    });
  }

  consultarProcessoExternamente(
    numeroProcesso: string,
    tenant: string
  ): Observable<RespostaTipoEntidade> {
    return this.httpClient.get<IEntidade>(
      `${this.API_URL}/processo/pesquisa/publica/numero/${numeroProcesso}?tenant=${tenant}`,
      {
        observe: 'response',
      }
    );
  }

  consultarFavoritos(requisicao?: any): Observable<RespostaTipoEntidade> {
    const options = createRequestOption(requisicao);
    return this.httpClient.get<IEntidade>(
      `${this.API_URL}/favorito?pageSize=${this.tam}&pageIndex=1`,
      {
        params: options,
        observe: 'response',
      }
    );
  }

  consultarRascunhos(requisicao?: any): Observable<RespostaTipoEntidade> {
    const options = createRequestOption(requisicao);
    return this.httpClient.get<IEntidade>(
      `${this.API_URL}/rascunho?pageSize=${this.tam}&pageIndex=1`,
      {
        params: options,
        observe: 'response',
      }
    );
  }

  consultarArquivados(
    idSetor: number,
    requisicao?: any
  ): Observable<RespostaTipoEntidade> {
    const options = createRequestOption(requisicao);
    return this.httpClient.get<IEntidade>(
      `${this.API_URL}/processo/${idSetor}/arquivado?pageSize=${this.tam}&pageIndex=1`,
      {
        params: options,
        observe: 'response',
      }
    );
  }

  pesquisaInterna(
    filtros: Map<string, string>
  ): Observable<RespostaTipoEntidade> {
    let queryString = '';
    let count = 1;

    filtros.forEach((value, key) => {
      if (value !== '') {
        if (count === 1) {
          queryString += `?${key}=${value}`;
        } else {
          queryString += `&${key}=${value}`;
        }
        count++;
      }
    });
    return this.httpClient.get<IEntidade>(
      `${this.API_URL}/processo/pesquisa/interna${queryString}`,
      {
        observe: 'response',
      }
    );
  }
  //Fim de Buscas de Processos--------------------------

  //Criação de um Processo---------------
  incluirProcesso(processo: IProcesso): Observable<RespostaTipoEntidade> {
    return this.httpClient.post<IEntidade>(
      `${this.API_URL}/processo`,
      processo,
      {
        observe: 'response',
      }
    );
  }

  atualizarProcesso(processo: IProcesso): Observable<RespostaTipoEntidade> {
    return this.httpClient.put<IEntidade>(
      `${this.API_URL}/processo/${processo.id}`,
      processo,
      {
        observe: 'response',
      }
    );
  }

  incluirDocumentosLista(
    processo: IProcesso
  ): Observable<RespostaTipoEntidade> {
    return this.httpClient.post<IEntidade>(
      `${this.API_URL}/processo/${processo.id}/documento`,
      processo,
      {
        observe: 'response',
      }
    );
  }

  adicionarDocumento(documento: any): Observable<RespostaTipoEntidade> {
    return this.httpClient.post<IEntidade>(
      `${this.API_URL}/documento/processo`,
      documento,
      {
        observe: 'response',
      }
    );
  }

  incluirNumeroProcesso(processo: IProcesso): Observable<RespostaTipoEntidade> {
    return this.httpClient.post<IEntidade>(
      `${this.API_URL}/processo/${processo.id}/numero-processo`,
      processo,
      {
        observe: 'response',
      }
    );
  }
  //Fim de Criação de um Processo---------------

  //Signatários de um Processo---------------
  incluirSignatarioDocumento(
    documentoId: number,
    signatarios: ISignatarioRequest
  ): Observable<RespostaTipoEntidade> {
    return this.httpClient.post<IEntidade>(
      `${this.API_URL}/documento/${documentoId}/signatario`,
      signatarios,
      {
        observe: 'response',
      }
    );
  }

  incluirSignatarioAnexo(
    anexoId: number,
    signatario: ISignatarioRequest
  ): Observable<RespostaTipoEntidade> {
    return this.httpClient.post<IEntidade>(
      `${this.API_URL}/anexo/${anexoId}/signatario`,
      signatario,
      {
        observe: 'response',
      }
    );
  }

  removerSignatarioDocumento(
    documentoId: number,
    signatarioId: number
  ): Observable<RespostaTipoEntidade> {
    return this.httpClient.delete<IEntidade>(
      `${this.API_URL}/documento/${documentoId}/signatario/remover/${signatarioId}`,
      {
        observe: 'response',
      }
    );
  }

  removerSignatarioAnexo(
    anexoId: number,
    signatarioId: number
  ): Observable<RespostaTipoEntidade> {
    return this.httpClient.delete<IEntidade>(
      `${this.API_URL}/anexo/${anexoId}/signatario/remover/${signatarioId}`,
      {
        observe: 'response',
      }
    );
  }
  //Fim de Signatários de um Processo---------------

  //Inclusões e Exclusões em Processos Existentes--------------------------
  incluirAnexosLista(processo: IProcesso): Observable<RespostaTipoEntidade> {
    return this.httpClient.post<IEntidade>(
      `${this.API_URL}/processo/${processo.id}/anexo`,
      processo,
      {
        observe: 'response',
      }
    );
  }

  adicionarAnexo(anexo: any): Observable<RespostaTipoEntidade> {
    return this.httpClient.post<IEntidade>(
      `${this.API_URL}/anexo/processo`,
      anexo,
      {
        observe: 'response',
      }
    );
  }

  adicionarDespacho(despacho: IDespacho): Observable<RespostaTipoEntidade> {
    return this.httpClient.post<IEntidade>(
      `${this.API_URL}/despacho`,
      despacho,
      {
        observe: 'response',
      }
    );
  }

  incluirInteressadosLista(
    processo: IProcesso | IProcessoRequest
  ): Observable<RespostaTipoEntidade> {
    return this.httpClient.post<IEntidade>(
      `${this.API_URL}/processo/${processo.id}/interessado`,
      processo,
      {
        observe: 'response',
      }
    );
  }

  excluirDocumento_Processo(
    documentoId: number
  ): Observable<RespostaTipoEntidade> {
    return this.httpClient.delete<IEntidade>(
      `${this.API_URL}/documento/${documentoId}`,
      {
        observe: 'response',
      }
    );
  }

  excluirAnexo_Processo(anexoId: number): Observable<RespostaTipoEntidade> {
    return this.httpClient.delete<IEntidade>(
      `${this.API_URL}/anexo/${anexoId}`,
      {
        observe: 'response',
      }
    );
  }

  excluirDepacho_Processo(
    despachoId: number
  ): Observable<RespostaTipoEntidade> {
    return this.httpClient.delete<IEntidade>(
      `${this.API_URL}/despacho/${despachoId}`,
      {
        observe: 'response',
      }
    );
  }

  excluirInteressado_Processo(
    interessadoId: number,
    processoId: number
  ): Observable<RespostaTipoEntidade> {
    return this.httpClient.delete<IEntidade>(
      `${this.API_URL}/processo/${processoId}/interessado/remover/${interessadoId}`,
      {
        observe: 'response',
      }
    );
  }
  //Fim de Inclusões e Exclusões em Processos Existentes--------------------------

  //Envios de Processos--------------------------
  tramitar(tramitacao: TramitacaoProcesso): Observable<RespostaTipoEntidade> {
    return this.httpClient.post<IEntidade>(
      `${this.API_URL}/tramitacao/enviar`,
      tramitacao,
      {
        observe: 'response',
      }
    );
  }

  tramitarSetores(
    tramitacao: TramitacaoProcesso
  ): Observable<RespostaTipoEntidade> {
    return this.httpClient.post<IEntidade>(
      `${this.API_URL}/tramitacao/multsetor/enviar`,
      tramitacao,
      {
        observe: 'response',
      }
    );
  }

  distribuir(distribuir: any): Observable<RespostaTipoEntidade> {
    return this.httpClient.post<IEntidade>(
      `${this.API_URL}/tramitacao/distribuir`,
      distribuir,
      {
        observe: 'response',
      }
    );
  }

  arquivarProcesso(
    id: number,
    motivo: IProcessoRequest
  ): Observable<RespostaTipoEntidade> {
    return this.httpClient.put<IEntidade>(
      `${this.API_URL}/processo/${id}/arquivar`,
      motivo,
      { observe: 'response' }
    );
  }

  enviarParaInstituicaoExterna(
    tramitacao: TramitacaoProcesso
  ): Observable<RespostaTipoEntidade> {
    return this.httpClient.post<IEntidade>(
      `${this.API_URL}/tramitacao/instituicao-externa`,
      tramitacao,
      {
        observe: 'response',
      }
    );
  }

  retornarInstituicaoExterna(
    tramitacao: TramitacaoProcesso
  ): Observable<RespostaTipoEntidade> {
    return this.httpClient.post<IEntidade>(
      `${this.API_URL}/tramitacao/retornar-instituicao-externa`,
      tramitacao,
      {
        observe: 'response',
      }
    );
  }

  retornarDistribuicao(
    tramitacao: TramitacaoProcesso
  ): Observable<RespostaTipoEntidade> {
    return this.httpClient.post<IEntidade>(
      `${this.API_URL}/tramitacao/retornar-distribuicao`,
      tramitacao,
      {
        observe: 'response',
      }
    );
  }
  //Fim de Envios de Processos--------------------------

  //Ações de Processos--------------------------
  marcarProcessoLido(id: number): Observable<RespostaTipoEntidade> {
    return this.httpClient.post<IEntidade>(
      `${this.API_URL}/tramitacao/${id}/marcar-lido`,
      {
        id: id,
      },
      {
        observe: 'response',
      }
    );
  }

  excluirRascunho(id: number): Observable<{}> {
    return this.httpClient.delete(`${this.API_URL}/rascunho/${id}`, {
      observe: 'response',
    });
  }

  excluirFavorito(id: number): Observable<{}> {
    return this.httpClient.delete(`${this.API_URL}/favorito/${id}`, {
      observe: 'response',
    });
  }

  adicionarFavorito(
    Processoid: IProcessoRequest
  ): Observable<RespostaTipoEntidade> {
    return this.httpClient.post<IEntidade>(
      `${this.API_URL}/favorito`,
      Processoid,
      {
        observe: 'response',
      }
    );
  }

  desmembrarDocumento(
    processoId: number,
    documentoId: number
  ): Observable<RespostaTipoEntidade> {
    return this.httpClient.put<IEntidade>(
      `${this.API_URL}/processo/${processoId}/desmembrar`,
      {
        documentoId: documentoId,
      },
      {
        observe: 'response',
      }
    );
  }

  juntadaProcessoAnexacao(
    request: IProcessoJuntadaRequest
  ): Observable<RespostaTipoEntidade> {
    return this.httpClient.post<IEntidade>(
      `${this.API_URL}/processo/vincular-anexacao`,
      request,
      { observe: 'response' }
    );
  }

  juntadaProcessoApensacao(
    request: IProcessoJuntadaRequest
  ): Observable<RespostaTipoEntidade> {
    return this.httpClient.post<IEntidade>(
      `${this.API_URL}/processo/vincular`,
      request,
      { observe: 'response' }
    );
  }

  desjuntadaProcesso(
    processoPaiId: number,
    processoFilhoId: number
  ): Observable<RespostaTipoEntidade> {
    return this.httpClient.post<IEntidade>(
      `${this.API_URL}/processo/desvincular`,
      { processoPaiId: processoPaiId, processoFilhoId: processoFilhoId },
      { observe: 'response' }
    );
  }

  consultarJuntada(id: number): Observable<RespostaTipoEntidade> {
    return this.httpClient.get<IEntidade>(
      `${this.API_URL}/processo/${id}/vinculados`,
      {
        observe: 'response',
      }
    );
  }

  consultarJuntadaAnexacao(id: number): Observable<RespostaTipoEntidade> {
    return this.httpClient.get<IEntidade>(
      `${this.API_URL}/processo/${id}/vinculados-anexacao`,
      {
        observe: 'response',
      }
    );
  }

  // visualizarCapaProcesso(processo: any): Observable<any> {
  //   return this.httpClient.post<any>(
  //     `${this.API_URL}/processo/${processo.id}/capa`,
  //     processo,
  //     {
  //       observe: 'response',
  //       responseType: 'json',
  //     }
  //   );
  // }

  // imprimirCapaProcesso(id: number): Observable<any> {
  //   return this.httpClient.post<any>(`${this.API_URL}/processo/${id}/capa`, {
  //     observe: 'response',
  //     responseType: 'blob',
  //   });
  // }
}
