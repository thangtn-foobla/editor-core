import type { EditorState } from './EditorState.ts'

type AddCommand = 'add-node'
type RemoveCommand = 'remove-node'
type UpdateCommand = 'update-node'

type NodeCommandType = AddCommand | RemoveCommand | UpdateCommand

export interface Command {
  type: NodeCommandType
  execute(state: EditorState): EditorState
  undo(state: EditorState): EditorState
  redo(state: EditorState): EditorState
}
