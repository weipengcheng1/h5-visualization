//导入模块
const ora = require("ora");
const {Shell, resolveJson} = require("../lib/util")
const process = require("process")
const axios = require("axios")

//全局变量
const rootPath = process.cwd()


/**
 * 发布组件
 * @param webDomain
 * @param nameSpace
 * @param gitUrl
 * @param name
 * @param baseApi
 * @returns {Promise<void>}
 */

async function releaseComponents({webDomain, nameSpace, gitUrl, name, baseApi}) {
    const spinner = ora("🗃 Start uploading components...").start();
    const sh = new Shell();
    const componentConfig = require(`${process.cwd()}/coco.config.js`)
    const config = {
        ...componentConfig,
        config: []
    }
    //开始查找package下的所有文件
    sh.shell.ls("packages").forEach(file => {
        if (file.indexOf(".") === -1) {
            const json = resolveJson(`${rootPath}/packages/${file}`);
            if (!json.name || !json.version || !json.description) {
                console.error(`${rootPath}/packages/${file} there are non-standard problems 'package.json',Must contain name, version and description attributes`);
                process.exit(0)
            }
            //组件发布按照 组件名+组件版本 的形式进行发布，比如 coco-global-banner.0.0.1.umd.js
            const name = `${json.name}.${json.version}`
            config.config.push({
                dir: file,
                snapshot: json.snapshot,
                name,
                description: json.description,
                js: `${componentConfig.webDomian}/${json.name}/${name}.umd.js`,
                css: `${componentConfig.webDomian}/${json.name}/${name}.css`
            })
        }
    })

    try {
        const res = await axios.get(`${baseApi}/component/query`, {params: {gitUrl}});
        config.config = JSON.stringify(config.config);
        const hasRecord = !!res.data.result[0];
        if (!hasRecord) {
            const res = await axios.post(`${baseApi}/component/add`, config);
            if (res.data.showType !== undefined) {
                console.log('Upload failed' + res.data.result.message)
                return;
            }
            console.log("Upload succeeded!!!!")

        } else {
            await axios.post(`${baseApi}/component/update`, config)
            console.log("Component existence,Upload succeeded!!!")
        }
        spinner.succeed("🎉 Component Upload complete")

    } catch (error) {
        process.exit(0)
        console.log('Upload failed' + error)
    }
}

async function releaseComponent() {
    const baseApi = "http://127.0.0.1:70001";
    await releaseComponents({baseApi})
}

module.exports = releaseComponent;