/* Compiler v0.0.1 */

async function compiler(code, request = '', local = false) {
    return new Promise(response => {
        let compiled = `const BDCashCore = require('@bdcash-protocol/core'); const db = require('db'); const axios = require('axios');`
        compiled += `const bdcash = new BDCashCore; bdcash.staticnodes = true;`
        if (local === true) {
            compiled += `bdcash.mainnetIdaNodes = ['http://localhost:3001']; bdcash.testnetIdaNodes = ['http://localhost:3001'];`
        }
        if (request !== '') {
            compiled += 'const request = ' + JSON.stringify(request) + ';'
        }

        let functions = code.match(/(?<=function )(.*?)(?=\s*\()/gi)
        compiled += code
        
        let runnable = []
        let name
        let author
        let version
        let description
        let immutable
        let manifest = code.toString().match(/\/\*(\*(?!\/)|[^*])*\*\//gi)
        manifest = manifest[0].replace('/**', '')
        manifest = manifest.replace('**/', '')
        manifest = manifest.replace(new RegExp('\n', 'g'), '')
        manifest = manifest.split('*')

        for (let k in manifest) {
            let definition = manifest[k].trim().split(':')
            if (definition[1] !== undefined) {
                if (definition[0] === 'NAME') {
                    name = definition[1].trim()
                }
                if (definition[0] === 'AUTHOR') {
                    author = definition[1].trim()
                }
                if (definition[0] === 'VERSION') {
                    version = definition[1].trim()
                }
                if (definition[0] === 'DESCRIPTION') {
                    description = definition[1].trim()
                }
                if (definition[0] === 'IMMUTABLE') {
                    immutable = definition[1].trim()
                }
            }
        }

        if (functions.length > 1) {
            for (let k in functions) {
                let fn = functions[k]
                if (fn !== 'constructor') {
                    let sp = fn.split(':')
                    if (sp[1] !== undefined) {
                        if (sp[0].trim() === 'public') {
                            runnable.push(sp[1].trim())
                            compiled += '\nmodule.exports.' + sp[1].trim() + ' = ' + sp[1].trim() + ';'
                        }
                        compiled = compiled.replace(fn, sp[1].trim())
                    } else {
                        runnable.push(fn)
                        compiled += '\nmodule.exports.' + fn + ' = ' + fn + ';'
                    }
                }
            }

            compiled += '\nconstructor();'
            response({
                name: name,
                author: author,
                version: version,
                description: description,
                immutable: immutable,
                functions: runnable,
                code: compiled
            })
        } else {
            response(false)
        }
    })
}

exports.compiler = compiler