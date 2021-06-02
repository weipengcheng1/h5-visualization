//导入模块
const inquirer = require("inquirer")
const {execSync} = require("child_process")  //提供了衍生子进程的能力
const process = require("process")
const ora = require("ora")
const axios = require("axios")
const {resolveJson, writeFileTree, pusBranch} = require("../lib/util");
//发布模板
const rootPath = process.cwd()
const platformQues = [
    {
        type: "list",
        name: "env",
        message: "请选择打包环境",
        default: "",
        choices: ['测试 qa', '预发 pre', '生产 production']
    }
]

const releaseApiMap = {
    qs: "http://127.0.0.1:7001",
    pre: "http://127.0.0.1:7001",
    production: "http://127.0.0.1:7001"
}

/**
 * 发布模板
 * @returns {Promise<void>}
 */
async function release() {
    //构建
    const res = await inquirer.prompt(platformQues)
    const {env} = res;
    const mode = env.split(" ")[1];
    execSync(`npx vue-cli-service build ${mode ? `--mode ${mode}` : ''}`, {stdio: 'inherit'});
    //发布
    const baseApi = releaseApiMap[mode]
    const templateConfig = require(`${process.cwd()}/coco.config.js`)

    //升级版本
    const spinner = ora("🗃 Start submitting template...").start();
    await upVersion()
    pusBranch()
    spinner.succeed("🎉 Template submission completed");
    await releaseTemplate({...baseApi, baseApi})
}

/**
 * 发布模板
 * @param snapshot
 * @param name
 * @param templateName
 * @param author
 * @param baseApi
 * @param gitUrl
 * @returns {Promise<void>}
 */
async function releaseTemplate({snapshot, name, templateName, author, baseApi, gitUrl}) {
    try {
        await axios.post(`${baseApi}/template/update`, {
            name,
            templateName,
            author,
            snapshot,
            gitUrl,
            version: resolveJson(rootPath).version
        })
        chalk.green(`🎉 🎉 Successfully published！`)
    } catch (error) {
        console.log(error)
    }
}

/**
 * 创建版本号
 * @returns {Promise<void>}
 */
async function upVersion() {
    const pkg = resolveJson(rootPath);
    //master版本号自增
    const v = pkg.version.split(".")
    v[2] = Number(v[2]) < 10 ? Number(v[2]) + 1 : 0;
    v[1] = v[2] === 0 ? Number(v[1] + 1) : Number(v[1]);
    v[1] = v[1] < 10 ? Number(v[1]) : 0;
    v[0] = v[1] === 0 ? Number(v[0]) + 1 : Number(v[0])
    pkg.version = v.join(".")

    await writeFileTree(rootPath, {
        "package.json": JSON.stringify(pkg, null, 2)
    })
}

module.exports = release;
