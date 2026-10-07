// Shared helpers for the send-*.mjs runner scripts (arg flags, pacing, dedup logs).
import { readFile, writeFile } from 'node:fs/promises'

export const emailPattern = /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/
export const isValidEmail = email => emailPattern.test(email)
export const sleep = ms => new Promise(resolve => setTimeout(resolve, ms))

export function argHelpers(args = process.argv.slice(2)) {
  return {
    has: name => args.includes(name),
    flagValue: name => {
      const i = args.indexOf(name)
      const value = i !== -1 ? args[i + 1] : undefined
      return value && !value.startsWith('--') ? value : undefined
    },
  }
}

export async function loadJsonLog(logPath) {
  try {
    const parsed = JSON.parse(await readFile(logPath, 'utf8'))
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {}
  } catch {
    return {}
  }
}

export async function saveJsonLog(logPath, log) {
  await writeFile(logPath, JSON.stringify(log, null, 2) + '\n')
}
