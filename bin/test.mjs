import "zx/globals"
import path from 'path'
import fs from 'fs/promises'
import {safeRun, setupProject} from './utils.mjs'

const TEST_EXTENSIONS = ['.test.ts', '.test.tsx', '.test.js', '.test.jsx']

const findTestFiles = async (dir) => {
    const testFiles = []

    const scanDirectory = async (currentDir) => {
        try {
            const entries = await fs.readdir(currentDir, {withFileTypes: true})

            for (const entry of entries) {
                const fullPath = path.join(currentDir, entry.name)

                if (entry.isDirectory()) {
                    await scanDirectory(fullPath)
                } else if (entry.isFile() && TEST_EXTENSIONS.some(ext => entry.name.endsWith(ext))) {
                    testFiles.push(fullPath)
                }
            }
        } catch (error) {
            // Skip directories we can't read
        }
    }

    await scanDirectory(dir)
    return testFiles
}

const createJestConfig = (projectDir, testFiles) => {
    return {
        preset: 'ts-jest',
        testEnvironment: 'node',
        roots: [projectDir],
        testMatch: testFiles.map(file => `**/${path.basename(file)}`),
        moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
        transform: {
            '^.+\\.(ts|tsx)$': 'ts-jest',
        },
        collectCoverageFrom: [
            '**/*.{ts,tsx}',
            '!**/*.d.ts',
            '!**/node_modules/**',
            '!**/*.test.{ts,tsx}',
        ],
        moduleNameMapper: {
            '^@/(.*)$': '<rootDir>/src/$1',
        },
        testPathIgnorePatterns: ['/node_modules/'],
        transformIgnorePatterns: ['node_modules/(?!(.*\\.mjs$))'],
    }
}

const runTestsForDirectory = async (dir, projectName) => {
    const testFiles = await findTestFiles(dir)

    if (testFiles.length === 0) {
        console.log(`No test files found in ${projectName}`)
        return
    }

    console.log(`Found ${testFiles.length} test file(s) in ${projectName}:`)
    testFiles.forEach(file => {
        console.log(`  - ${path.relative(process.cwd(), file)}`)
    })
    console.log()

    // Create temporary Jest config
    const jestConfig = createJestConfig(dir, testFiles)
    const configPath = path.join(dir, 'jest.config.temp.json')

    try {
        await fs.writeFile(configPath, JSON.stringify(jestConfig, null, 2))

        console.log(`Running tests for ${projectName}...`)
        await $`cd ${dir} && npx jest --config jest.config.temp.json`

    } catch (error) {
        console.error(`Error running tests for ${projectName}:`, error.message)
    } finally {
        // Clean up temporary config
        try {
            await fs.unlink(configPath)
        } catch (cleanupError) {
            // Ignore cleanup errors
        }
    }
}

await safeRun(async () => {
    const {app} = argv

    if (!app) {
        console.error('Please specify an app with --app parameter')
        process.exit(1)
    }

    const {BACKEND_DIR, FRONTEND_DIR, COMMON_DIR} = await setupProject(app)

    console.log(`Running tests for ${app}...\n`)

    // Run tests for each directory
    await runTestsForDirectory(BACKEND_DIR, `${app}-backend`)
    await runTestsForDirectory(FRONTEND_DIR, `${app}-frontend`)
    await runTestsForDirectory(COMMON_DIR, `${app}-common`)

    console.log('All tests completed!')
})