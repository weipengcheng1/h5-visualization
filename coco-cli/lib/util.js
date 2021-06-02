//导入模块
const fs = require('fs');
const path = require("path");
const fsExtra = require("fs-extra");  //模块是系统fs模块的扩展，提供了更多便利的 API，并继承了fs模块的 API
const readPkg = require("read-pkg");
const {execSync} = require('child_process');
const sh = require("shelljs")

/**
 * 写文件树
 * @param dir  根目录
 * @param files 文件
 */
function writeFileTree(dir, files) {
    Object.keys(files).forEach(name => {
        const filePath = path.join(dir, name)
        fsExtra.ensureDirSync(path.dirname(filePath))
        fsExtra.writeFileSync(filePath, files[name])
    })
}

/**
 *解析jsons数据
 * @param context   json数据
 * @param name  文件名
 * @returns {{}|*}
 */
function resolveJson(context, name = "package.json") {
    if (fs.existsSync(path.join(context, name))) {
        return readPkg.sync({
            cwd: context
        })
    }
    return {}
}


function pusBranch() {
    try {
        execSync(`git add . && git commit -m 'release project' && git push`)
    } catch (error) {
        console.log(error)
    }
}

class Shell {
    constructor() {
        this.shell = sh
    }

    exec(command) {
        return new Promise((resolve, reject) => {
            sh.exec(command, {async: true}, (code, stdout, stderr) => {
                stdout = stdout.toString().trim();
                if (code === 0) {
                    if (stderr) {
                        console.error(stderr.toString().trim())
                    }
                    resolve(stdout)
                } else {
                    if (stdout && stderr) {
                        console.log(`\n${stdout}`)
                    }
                    reject(new Error(stderr || stdout))
                }
            })
        })
    }
}

module.exports = {
    writeFileTree,
    resolveJson,
    pusBranch,
    Shell
}