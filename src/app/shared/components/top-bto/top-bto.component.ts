import { Component, Input, Output, OnInit, EventEmitter } from '@angular/core';

@Component({
  selector: 'top-bto',
  templateUrl: './top-bto.component.html',
  styleUrls: ['./top-bto.component.scss'],
})
export class TopBtoComponent implements OnInit {
  @Input() label!: string;
  @Input() tipo!: string;
  @Input() disabled!: boolean;

  @Output() buttonClick = new EventEmitter();

  icone!: string;

  constructor() {}

  ngOnInit(): void {
    this.ajustarTipo(this.tipo);
  }

  ajustarTipo(tipo: string) {
    switch (tipo) {
      case 'excluir':
        this.icone = 'pi-times';
        break;
      case 'editar':
        this.icone = 'pi-pencil';
        break;
      case 'adicionar':
        this.icone = 'pi-plus';
        break;
      default:
        this.tipo = 'confirmar';
        this.icone = 'pi-check';
        break;
    }
  }

  onClick(event: MouseEvent) {
    if (this.disabled) {
      event.stopPropagation(); // Evita que o evento se propague para outros elementos
      event.preventDefault(); // Evita o comportamento padrão do clique
    } else {
      this.buttonClick.emit();
    }
  }
}
