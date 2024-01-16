import { Component, OnInit } from '@angular/core';

import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';

@Component({
  selector: 'top-documento-modal',
  templateUrl: './visualizar-documento.component.html',
})
export class VisualizarDocumentoComponent implements OnInit {
  link!: string;

  finalizado: boolean = false;
  pdf: boolean = false;
  img: boolean = false;

  constructor(
    private ref: DynamicDialogRef,
    private config: DynamicDialogConfig
  ) {}

  ngOnInit(): void {
    this.buscarDados();
    console.log(this.link);
  }

  private buscarDados(): void {
    this.link = this.config.data.link;
    this.pdf = this.config.data.pdf;
    this.img = this.config.data.img;
  }

  protected exibir(): void {
    this.finalizado = true;
  }

  protected cancelar(): void {
    this.ref.close();
  }
}
