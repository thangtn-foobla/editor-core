import { describe, it, expect } from 'vitest'
import { historyOps } from './historyOps'
import type { HistoryState } from '../../interfaces/domain/History'
import type { Command } from '../../interfaces/domain/Command'

function createHistoryState(past: Command[] = [], future: Command[] = []): HistoryState {
  return { past, future }
}

function createCommand(type: Command['type'], payload: any = {}): Command {
  return {
    type,
    payload,
    meta: { source: 'ui' }
  } as Command
}

describe('historyOps', () => {
  describe('record', () => {
    it('should add a command to the past array', () => {
      const history = createHistoryState()
      const command = createCommand('ADD_NODE', { node: { id: 'node-1' } })

      const result = historyOps.record(history, command)

      expect(result.past).toHaveLength(1)
      expect(result.past[0]).toEqual(command)
    })

    it('should append to existing past commands', () => {
      const command1 = createCommand('ADD_NODE', { node: { id: 'node-1' } })
      const command2 = createCommand('ADD_NODE', { node: { id: 'node-2' } })
      const history = createHistoryState([command1])

      const result = historyOps.record(history, command2)

      expect(result.past).toHaveLength(2)
      expect(result.past[0]).toEqual(command1)
      expect(result.past[1]).toEqual(command2)
    })

    it('should preserve future array', () => {
      const futureCommand = createCommand('REMOVE_NODE', { nodeId: 'node-1' })
      const history = createHistoryState([], [futureCommand])
      const newCommand = createCommand('ADD_NODE', { node: { id: 'node-2' } })

      const result = historyOps.record(history, newCommand)

      expect(result.future).toEqual([futureCommand])
      expect(result.past).toHaveLength(1)
    })

    it('should not modify the original history state', () => {
      const history = createHistoryState()
      const command = createCommand('ADD_NODE', { node: { id: 'node-1' } })

      historyOps.record(history, command)

      expect(history.past).toHaveLength(0)
    })

    it('should handle multiple commands in sequence', () => {
      const history = createHistoryState()
      const commands = [
        createCommand('ADD_NODE', { node: { id: 'node-1' } }),
        createCommand('ADD_NODE', { node: { id: 'node-2' } }),
        createCommand('UPDATE_NODE', { nodeId: 'node-1', updates: {} })
      ]

      let result = history
      commands.forEach(cmd => {
        result = historyOps.record(result, cmd)
      })

      expect(result.past).toHaveLength(3)
      expect(result.past).toEqual(commands)
    })
  })
})
