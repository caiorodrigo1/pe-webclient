import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { CKEditorModule } from '@ckeditor/ckeditor5-angular';
import { NgxExtendedPdfViewerModule } from 'ngx-extended-pdf-viewer';
import { ToastModule } from 'primeng/toast';
import { DropdownModule } from 'primeng/dropdown';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { TableModule } from 'primeng/table';
import { MultiSelectModule } from 'primeng/multiselect';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputSwitchModule } from 'primeng/inputswitch';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { AccordionModule } from 'primeng/accordion';
import { InputMaskModule } from 'primeng/inputmask';
import { SelectButtonModule } from 'primeng/selectbutton';
import { CheckboxModule } from 'primeng/checkbox';
import { DynamicDialogModule } from 'primeng/dynamicdialog';
import { CalendarModule } from 'primeng/calendar';
import { PanelModule } from 'primeng/panel';
import { TooltipModule } from 'primeng/tooltip';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { RadioButtonModule } from 'primeng/radiobutton';
import { SkeletonModule } from 'primeng/skeleton';

import { ConfirmationService } from 'primeng/api';
import { DialogService } from 'primeng/dynamicdialog';

@NgModule({
  imports: [],
  exports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    CKEditorModule,
    NgxExtendedPdfViewerModule,
    ToastModule,
    DropdownModule,
    ProgressSpinnerModule,
    TableModule,
    MultiSelectModule,
    ButtonModule,
    InputTextModule,
    InputSwitchModule,
    InputTextareaModule,
    AccordionModule,
    InputMaskModule,
    SelectButtonModule,
    CheckboxModule,
    DynamicDialogModule,
    CalendarModule,
    PanelModule,
    TooltipModule,
    ConfirmDialogModule,
    RadioButtonModule,
    SkeletonModule,
  ],
  providers: [ConfirmationService, DialogService],
})
export class SharedLibsModule {}
