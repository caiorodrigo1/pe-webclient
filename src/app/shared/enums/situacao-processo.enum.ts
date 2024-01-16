export enum SituacaoProcessoEnum {
  RASCUNHO = 'RASCUNHO',
  CRIADO = 'CRIADO',
  EM_ANDAMENTO = 'EM_ANDAMENTO',
  ARQUIVADO = 'ARQUIVADO',
}

export const SituacaoProcessoLabelMapping: Record<
  SituacaoProcessoEnum,
  string
> = {
  [SituacaoProcessoEnum.RASCUNHO]: SituacaoProcessoEnum.RASCUNHO,
  [SituacaoProcessoEnum.CRIADO]: SituacaoProcessoEnum.CRIADO,
  [SituacaoProcessoEnum.EM_ANDAMENTO]: SituacaoProcessoEnum.EM_ANDAMENTO,
  [SituacaoProcessoEnum.ARQUIVADO]: SituacaoProcessoEnum.ARQUIVADO,
};
