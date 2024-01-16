import { Component, OnInit } from '@angular/core';

import { DynamicDialogConfig } from 'primeng/dynamicdialog';

import { IAuditoria } from 'src/app/shared/models/auditoria.model';

@Component({
  selector: 'top-processo-visualizar',
  templateUrl: './auditoria-visualizar.component.html',
})
export class AuditoriaVisualizarComponent implements OnInit {
  auditoria!: IAuditoria;

  constructor(private config: DynamicDialogConfig) {}

  ngOnInit(): void {
    this.auditoria = this.config.data.auditoria;
  }
}
