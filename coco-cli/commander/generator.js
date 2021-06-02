//导入模块
const inquirer = require("inquirer")  //交互式命令行工具，用来收集用户填入表单
const path = require("path")
const fs = require("fs")
const ora = require("ora") //终端加载动画效果，增加趣味性
const chalk = require("chalk") //可以在终端显示颜色
const download = require("download-git-repo")   //用来下载远程模板
const {writeFileTree, resolveJson} = require("../lib/util")
const getConfig = require("../tpl/getConfig")
const {execSync} = require("child_process")


//全局变量
let targetRootPath = process.cwd()


/**
 * 生成器
 * @param name 文件名
 * @returns {Promise<void>}
 */
async function generate(name) {
    //交互式问答，生成模板配置信息
    const config = await getTemplateInfo();
    //生成项目目录
    const targetDir = path.join(targetRootPath, name)

    //判断目录是否存在
    if (fs.existsSync(targetDir)) {
        //如果模板存在，询问开发者是否覆盖文件
        inquirer.prompt([
            {
                name: "template-overwrite",
                type: "input",
                message: `模板${name}已存在，是否确认覆盖?(y/n)`,
                validate: function (input) {
                    if (input.toLowerCase() !== "y" && input.toLowerCase() !== 'n') {
                        return "Please input y/n"
                    } else {
                        return true
                    }
                }
            }
        ]).then(answer => {
            if (answer["template-overwrite"]) {
                //删除文件
                deleteFolderRecursive(targetDir)

                //创建新的模块文件夹
                fs.mkdirSync(targetDir)
                copyTemplates(name, config)
                console.log(chalk.green(`生成模板 "${name}" 完成!`));
            }
        }).catch(error => {
            console.log(chalk.red(error))
        })
    } else {
        //创建新的模块文件夹
        fs.mkdirSync(targetDir)
        copyTemplates(name, config)
        console.log(chalk.green(`生成模板 "${name}" 完成!`));
    }
}


/**
 * 创建模板信息
 * @returns {Promise<*>}
 */
async function getTemplateInfo() {
    return await inquirer.prompt([
        {
            name: "author",
            type: "input",
            message: "作者",
            default: ""
        },
        {
            name: "templateName",
            type: "input",
            message: "你还需要给模板起个中文名称",
            default: ""
        }
    ])
}


/**
 * 删除文件夹方法
 * @param path  要删除的文件路径
 */
function deleteFolderRecursive(path) {
    if (fs.existsSync(path)) {
        fs.readdirSync(path).forEach((file, index) => {
            let curPath = path + "/" + file;

            if (fs.lstatSync(curPath).isDirectory()) {   //判断当前路径是否是一个目录
                deleteFolderRecursive(curPath)
            } else {
                //删除文件
                fs.unlinkSync(curPath)
            }

        });
        fs.rmdirSync(path)
    }
}


/**
 * 创建模板文件夹
 * @param name  文件名
 * @param config  配置
 */
function copyTemplates(name, config) {
    console.log(name)

    async function readAndCopyFile(parentPath, tempPath) {
        const spinner = ora("🗃 开始下载模版...").start()
        await downloadTemplate(`direct:https://github.com/coco-h5/coco-template.git`, name, true)
        spinner.succeed("🎉 模版下载完成")
        console.log()
        console.info("🚀 初始化文件配置信息...")
        console.log()
        console.log(parentPath)

        const pkg = {
            name,
            version: "1.0.0",
            private: true
        }

        await writeFileTree(parentPath, {
            "package.json": JSON.stringify({
                ...resolveJson(parentPath),
                ...pkg
            }, null, 2)
        })

        await writeFileTree(parentPath, {
            "coco.config.js": getConfig({
                name: this.name,
                templateName: config.templateName,
                author: config.author
            })
        })

        //下载 npm install
        try {
            execSync(`cd ./${name} && npm install`)
            console.log();
            console.log(chalk.green(`🎉 你的项目 ${name} 已创建成功！`));
            console.log();
        } catch (error) {
            console.log(error)
        }


    }

    readAndCopyFile(path.join(targetRootPath, name), name).then().catch()
}

/**
 * 下载模板文件通过github
 * @param repository  github路径
 * @param name   文件名
 * @param clone  是否克隆
 */
async function downloadTemplate(repository, name, clone) {
    await new Promise((resolve, reject) => {
        download(repository, name, {clone: clone}, (err) => {
            if (err) return reject(err)
            resolve()
        })
    })
}

module.exports = generate