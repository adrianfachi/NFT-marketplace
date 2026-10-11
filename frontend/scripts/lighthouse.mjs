import { mkdir, writeFile } from 'node:fs/promises'
import { spawn } from 'node:child_process'
import { setTimeout as delay } from 'node:timers/promises'
import { request } from 'node:http'
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'

const execFileAsync = promisify(execFile)
const port = 4173
const origin = `http://127.0.0.1:${port}`
const routes = ['/', '/nfts/1']
const modes = [
  { name: 'desktop', flags: '--preset=desktop' },
  { name: 'mobile', flags: '--form-factor=mobile' },
]

function isReady() {
  return new Promise(resolve => {
    const req = request(`${origin}/`, { timeout: 500 }, response => {
      response.resume()
      resolve(response.statusCode === 200)
    })
    req.on('error', () => resolve(false))
    req.end()
  })
}

async function waitForServer() {
  for (let attempt = 0; attempt < 40; attempt += 1) {
    if (await isReady()) return
    await delay(250)
  }
  throw new Error('O servidor de preview não respondeu em tempo hábil.')
}

function median(values) {
  const sorted = [...values].sort((a, b) => a - b)
  return sorted[Math.floor(sorted.length / 2)]
}

await mkdir('reports/lighthouse', { recursive: true })
const server = spawn('npm', ['run', 'preview', '--', '--host', '127.0.0.1', '--port', String(port)], {
  stdio: 'ignore',
  shell: true,
})

try {
  await waitForServer()
  const report = { generatedAt: new Date().toISOString(), runs: [], medians: {} }

  for (const route of routes) {
    for (const mode of modes) {
      const scores = []
      for (let run = 1; run <= 3; run += 1) {
        const outputPath = `reports/lighthouse/${route === '/' ? 'home' : 'detail'}-${mode.name}-${run}.json`
        await execFileAsync(process.platform === 'win32' ? 'npx.cmd' : 'npx', [
          'lighthouse',
          `${origin}${route}`,
          '--quiet',
          '--output=json',
          `--output-path=${outputPath}`,
          mode.flags,
          '--chrome-flags=--headless',
        ], { maxBuffer: 10 * 1024 * 1024, shell: process.platform === 'win32' })
        const result = await import(`../${outputPath}`, { with: { type: 'json' } })
        const categories = result.default.categories
        const values = {
          performance: Math.round(categories.performance.score * 100),
          accessibility: Math.round(categories.accessibility.score * 100),
          bestPractices: Math.round(categories['best-practices'].score * 100),
          seo: Math.round(categories.seo.score * 100),
          lcp: result.default.audits['largest-contentful-paint'].numericValue,
          cls: result.default.audits['cumulative-layout-shift'].numericValue,
          tbt: result.default.audits['total-blocking-time'].numericValue,
        }
        scores.push(values)
        report.runs.push({ route, mode: mode.name, run, ...values })
      }

      report.medians[`${route}:${mode.name}`] = Object.fromEntries(
        Object.keys(scores[0]).map(key => [key, median(scores.map(score => score[key]))]),
      )
    }
  }

  await writeFile('reports/lighthouse/summary.json', JSON.stringify(report, null, 2))
  console.log(JSON.stringify(report.medians, null, 2))
} finally {
  server.kill()
}
