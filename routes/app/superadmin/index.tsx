import redirect from '../../../util/redirect.ts'

export const handler = {
  GET() {
    return redirect('/app/superadmin/patients')
  },
}
