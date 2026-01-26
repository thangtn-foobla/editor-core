import { addNodeIntent } from './nodeIntents'
import {
  NodeCommandTypes,
  OrderCommandTypes
} from '../../interfaces/domain/Command.ts'
import type { IntentMap } from '../../interfaces/domain/Engine.ts'

export const intentMap: IntentMap = {
  [NodeCommandTypes.Add]: addNodeIntent
  // [NodeCommandTypes.Remove]: () => {
  //   throw new Error('Not implemented')
  // },
  // [NodeCommandTypes.Update]: () => {
  //   throw new Error('Not implemented')
  // },
  // [OrderCommandTypes.Reorder]: () => {
  //   throw new Error('Not implemented')
  // }
}
