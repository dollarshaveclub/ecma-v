#!/usr/bin/env node
const prog = require('caporal')
const acorn = require('acorn')
const glob = require('glob')
const fs = require('fs')

const pkg = require('./package.json')
const argsArray = process.argv

/*
  es-check 🏆
  ----
  - define the EcmaScript version to check for against a glob of JavaScript files
  - match the EcmaScript version option against a glob of files
    to to test the EcmaScript version of each file
  - error failures
*/
prog
  .version(pkg.version)
  .command('check')
  .alias('c')
  .argument(
    '<ecmaVersion>',
    'define the EcmaScript version to check for against a glob of JavaScript files'
  ).argument(
    '[files...]',
    'a glob of files to to test the EcmaScript version against'
  ).action((args, options,  logger) => {
    const v = args.ecmaVersion
    const files = args.files
    let e
    // define ecmaScript version
    switch (v) {
      case 'ecma3':
        e = '3'
        break
      case 'ecma4':
        e = '4'
        break
      case 'ecma6':
        e = '6'
        break
      case 'ecma7':
        e = '7'
        break
      case 'ecma8':
        e = '8'
        break
      default:
        e = '5'
    }

    const errors = []

    files.forEach((pattern) => {
      // pattern => glob or array
      const globbedFiles = glob.sync(pattern)

      globbedFiles.forEach((file) => {
        const code = fs.readFileSync(file, 'utf8')
        try {
          const result = acorn.parse(code, {
            ecmaVersion: e,
            silent: true,
          })
        } catch (err) {
          errors.push(file)
        }
      })
    })

    if (errors.length > 0) {
      logger.error(`ES-check: there were ${errors.length} ES version matching errors.`)
      errors.forEach((error) => {
        logger.info(`\n es-check: error in: ${error}`)
      })
      process.exit(1)
      return
    } else {
      logger.error(`ES-check: there were no ES version matching errors!  🎉`)
    }
  })

prog.parse(process.argv)
