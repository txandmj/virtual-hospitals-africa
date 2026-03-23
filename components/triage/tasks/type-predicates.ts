import { RenderedTaskToBeDone } from '../../../types.ts'

export function isLink(task: RenderedTaskToBeDone): task is RenderedTaskToBeDone & { atom: 'link' } {
  return task.atom === 'link'
}

export function isFinding(task: RenderedTaskToBeDone): task is RenderedTaskToBeDone & { atom: 'finding' } {
  return task.atom === 'finding'
}

export function isManage(task: RenderedTaskToBeDone): task is RenderedTaskToBeDone & { atom: 'procedure' } {
  return task.atom === 'procedure'
}

export function isMeasurement(task: RenderedTaskToBeDone): task is RenderedTaskToBeDone & { atom: 'measurement' } {
  return task.atom === 'measurement'
}
