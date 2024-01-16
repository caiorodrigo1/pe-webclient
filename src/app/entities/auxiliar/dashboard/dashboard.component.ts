import { Component, OnDestroy, OnInit } from '@angular/core';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { Subscription } from 'rxjs';

import * as d3 from 'd3';

import { TotalizadorService } from 'src/app/shared/services/totalizador.service';
import { ExibirMensagemService } from 'src/app/shared/services/exibir-mensagem.service';
import { UsuarioLogadoService } from 'src/app/shared/services/usuario-logado.service';
import { CodigosErro } from 'src/app/shared/enums/codigos-erro.enum';
import { IEntidade } from 'src/app/shared/models/entidade-response.model';
import { IUsuarioLogado } from 'src/app/shared/models/usuarioLogado.model';
import { IDashboard } from 'src/app/shared/models/dashboard.model';

declare let nv: any;

@Component({
  selector: 'top-dashboard',
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent implements OnInit, OnDestroy {
  dashboard?: IDashboard;

  setorId!: number;

  inscricaoUsuarioLogado!: Subscription;
  inscricaoDashboard!: Subscription;

  carregado: boolean = false;

  constructor(
    private usuarioLogadoService: UsuarioLogadoService,
    private totalizadorService: TotalizadorService,
    private exibirMensagemService: ExibirMensagemService
  ) {}

  ngOnInit(): void {
    this.buscarOrigem();
    this.consultarDadosDashboard();
  }

  ngOnDestroy(): void {
    if (this.inscricaoUsuarioLogado) this.inscricaoUsuarioLogado.unsubscribe();
    if (this.inscricaoDashboard) this.inscricaoDashboard.unsubscribe();
  }

  private buscarOrigem(): void {
    this.inscricaoUsuarioLogado = this.usuarioLogadoService
      .consultarUsuarioLogado()
      .subscribe((usuarioLogado: IUsuarioLogado) => {
        this.setorId = usuarioLogado.setor!.id!;
      });
  }

  protected consultarDadosDashboard(): void {
    this.inscricaoDashboard = this.totalizadorService
      .buscarDadosDashboard(this.setorId)
      .subscribe({
        next: (resposta: HttpResponse<IEntidade>) => {
          const corpo = resposta.body;
          this.dashboard = corpo!.data || {};

          if (
            this.dashboard!.evolucaoProcessos !== undefined &&
            this.dashboard!.totalizadores !== undefined
          ) {
            this.desenharGraficoStacked();
            this.desenharGraficoDonut();
          }
          this.carregado = true;
        },
        error: (resposta: HttpErrorResponse) => {
          this.dashboard = {};
          const erro = resposta.error;
          this.exibirErro(erro.message, 'Buscar', 'Dados do Dashboard');
        },
      });
  }

  protected getValuesEnviados(dashboard: IDashboard) {
    const values: any = [];

    dashboard.evolucaoProcessos!.forEach((element: any) => {
      let value = [
        Date.parse(`${element.mes} 01 ${element.ano}`),
        element.enviados,
      ];
      values.push(value);
    });
    return values.reverse();
  }

  protected getValuesRecebidos(dashboard: IDashboard) {
    const values: any = [];

    dashboard.evolucaoProcessos!.forEach((element) => {
      let value = [
        Date.parse(`${element.mes} 01 ${element.ano}`),
        element.recebidos,
      ];
      values.push(value);
    });
    return values.reverse();
  }

  protected desenharGraficoStacked() {
    let grafArea = [
      {
        key: 'Enviados',
        color: '#005EFF',
        values: this.getValuesEnviados(this.dashboard!),
      },
      {
        key: 'Recebidos',
        color: '#00CED1',
        values: this.getValuesRecebidos(this.dashboard!),
      },
    ];

    nv.addGraph(function () {
      let chart = nv.models
        .stackedAreaChart()
        .useInteractiveGuideline(true)
        .x(function (d: any) {
          return d[0];
        })
        .y(function (d: any) {
          return d[1];
        })
        .controlLabels({ stacked: 'Stacked' })
        .showControls(false)
        .duration(300);

      chart.xAxis.tickFormat(function (d: any) {
        return d3.timeFormat('%m/%Y')(new Date(d));
      });
      chart.yAxis.tickFormat(d3.format(',.0f'));

      d3.select('#area-chart').append('svg').datum(grafArea).call(chart);

      nv.utils.windowResize(chart.update);

      return chart;
    });
  }

  protected desenharGraficoDonut() {
    let donutChartData = [
      {
        key: 'Enviados',
        value: this.dashboard!.totalizadores!.enviados,
        color: '#005EFF',
      },
      {
        key: 'Recebidos',
        value: this.dashboard!.totalizadores!.recebidos,
        color: '#00CED1',
      },
    ];

    nv.addGraph(function () {
      let chart = nv.models
        .pieChart()
        .x(function (d: any) {
          return d.key;
        })
        .y(function (d: any) {
          return d.value;
        })
        .showLabels(true)
        .labelThreshold(0.05)
        .labelType('percent')
        .donut(true)
        .donutRatio(0.35);

      d3.select('#donut-chart')
        .append('svg')
        .datum(donutChartData)
        .transition()
        .duration(350)
        .call(chart);

      return chart;
    });
  }

  private exibirErro(codigo: string, acao: string, nome: string): void {
    let erro = (CodigosErro as Record<string, string>)[codigo];
    if (erro === undefined) erro = `Erro ao ${acao} ${nome}`;
    this.exibirMensagemService.mensagem('error', 'Serviço de Mensagem', [erro]);
  }

  // public convertToPDF() {
  //   html2canvas(document.getElementById('contentToConvert')).then((canvas) => {
  //     const contentDataURL = canvas.toDataURL('image/pdf');
  //     let pdf = new jsPDF('p', 'mm', 'a4');
  //     var width = pdf.internal.pageSize.getWidth();
  //     var height = (canvas.height * width) / canvas.width;
  //     pdf.addImage(contentDataURL, 'PNG', 0, 0, width, height);
  //     pdf.save('output.pdf');
  //   });
  // }
}
