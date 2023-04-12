import { ViewColumn, ViewEntity } from 'typeorm'
import { type IAutenticavel } from './IAutencavel'

@ViewEntity({
  expression: `
    SELECT "paciente"."email" AS "email", "paciente"."senha" AS "senha" FROM "paciente"
    UNION ALL
    SELECT "especialista"."email" AS "email", "especialista"."senha" AS "senha" FROM "especialista"
    UNION ALL
    SELECT "clinica"."email" AS "email", "clinica"."senha" AS "senha" FROM "clinica"
`
})

export class Autenticaveis implements IAutenticavel {
  @ViewColumn()
    email: string

  @ViewColumn()
    senha: string
}