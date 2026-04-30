import { PageProps } from 'fresh'
import { parseWithSchema } from '../shared/s_expression.ts'
import { any_rule } from '../shared/s_expression_schemas.ts'
import { json } from '../util/responses.ts'
import SExpressionPlayground from '../islands/SExpressionPlayground.tsx'

export const handler = {
  async POST(ctx: { req: Request }) {
    const { expression } = await ctx.req.json() as { expression?: string }
    if (typeof expression !== 'string' || !expression.trim()) {
      return json({ ok: false, error: 'Expression is empty' })
    }
    try {
      parseWithSchema(expression, any_rule)
      return json({ ok: true })
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      return json({ ok: false, error: message })
    }
  },
}

export default function SExpressionPlaygroundPage(_props: PageProps) {
  return (
    <div class='p-6 max-w-5xl mx-auto'>
      <h1 class='text-2xl font-semibold mb-1'>S-Expression Playground</h1>
      <p class='text-gray-600 mb-4'>
        Validate an expression against <code>any_rule</code> from <code>shared/s_expression_schemas.ts</code>.
      </p>
      <SExpressionPlayground />
    </div>
  )
}
