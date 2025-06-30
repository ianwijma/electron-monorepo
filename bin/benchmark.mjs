import "zx/globals"
import { pathToFileURL } from 'url'
import path from 'path'
import fs from 'fs/promises'
import { setupProject, safeRun } from './utils.mjs'

const findBenchmarkFiles = async (dir) => {
    const benchmarkFiles = []
    
    const scanDirectory = async (currentDir) => {
        try {
            const entries = await fs.readdir(currentDir, { withFileTypes: true })
            
            for (const entry of entries) {
                const fullPath = path.join(currentDir, entry.name)
                
                if (entry.isDirectory()) {
                    await scanDirectory(fullPath)
                } else if (entry.isFile() && (entry.name.endsWith('.bench.ts') || entry.name.endsWith('.bench.tsx') || entry.name.endsWith('.bench.mjs') || entry.name.endsWith('.bench.js'))) {
                    benchmarkFiles.push(fullPath)
                }
            }
        } catch (error) {
            // Skip directories we can't read
        }
    }
    
    await scanDirectory(dir)
    return benchmarkFiles
}

const runBenchmarkFile = async (filePath) => {
    try {
        // Use ts-node to run TypeScript files
        if (filePath.endsWith('.ts') || filePath.endsWith('.tsx')) {
            const result = await $`cd ${path.dirname(filePath)} && npx ts-node --esm ${path.basename(filePath)}`
            console.log(result.stdout)
        } else {
            const fileUrl = pathToFileURL(filePath).href
            const module = await import(fileUrl)
            
            if (typeof module.default === 'function') {
                await module.default()
            } else if (typeof module.benchmark === 'function') {
                await module.benchmark()
            } else {
                console.warn(`No default export or benchmark function found in ${filePath}`)
            }
        }
    } catch (error) {
        console.error(`Error running benchmark ${filePath}:`, error.message)
    }
}

await safeRun(async () => {
    const { app } = argv
    
    if (!app) {
        console.error('Please specify an app with --app parameter')
        process.exit(1)
    }
    
    const { BACKEND_DIR, FRONTEND_DIR, COMMON_DIR } = await setupProject(app)
    
    const allDirs = [BACKEND_DIR, FRONTEND_DIR, COMMON_DIR]
    const allBenchmarkFiles = []
    
    for (const dir of allDirs) {
        const benchmarkFiles = await findBenchmarkFiles(dir)
        allBenchmarkFiles.push(...benchmarkFiles)
    }
    
    if (allBenchmarkFiles.length === 0) {
        console.log(`No benchmark files found for app: ${app}`)
        return
    }
    
    console.log(`Found ${allBenchmarkFiles.length} benchmark file(s) for ${app}:`)
    allBenchmarkFiles.forEach(file => {
        console.log(`  - ${path.relative(process.cwd(), file)}`)
    })
    console.log()
    
    for (const benchmarkFile of allBenchmarkFiles) {
        console.log(`Running benchmarks from: ${path.relative(process.cwd(), benchmarkFile)}`)
        await runBenchmarkFile(benchmarkFile)
        console.log()
    }
})