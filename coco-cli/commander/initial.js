//模块依赖
const fs = require("fs");
const path = require("path")
const inquirer = require("inquirer")
const process = require("process")
const chalk = require("chalk")
const figlet = require("figlet")

function copyCocoConfigJs() {
    figlet("coco cli", function (err, data) {
        if (err) {
            console.log(chalk.red("Some thing about figlet is wrong!"))
        }
        console.log(chalk.yellow(data))
        let targetFilePath = path.resolve("coco.config.js");
        let templateFilePath = path.join(__dirname, "../tpl/coco.config.js");
        let contents = fs.readFileSync(templateFilePath, 'utf8')
        fs.writeFileSync(targetFilePath, contents, 'utf8')
        console.log(chalk.green("初始化配置成功\n"));
        process.exit(0)
    })
}


function initial() {
    //配置文件如果存在就覆盖
    if (fs.existsSync(path.join("coco.config.js"))) {
        //连续提问
        inquirer.prompt([
            {
                name: "init-confirm",
                type: "confirm",
                message: `coco.config.js 已经存在，是否覆盖(y/n)`,
                validate: (input) => {
                    if (input.toLowerCase() !== 'y' || input.toLowerCase() !== 'n') {
                        return "Please input y/n";
                    } else {
                        return true
                    }

                }
            }
        ]).then(answer => {
            if (answer['init-confirm']) {
                copyCocoConfigJs()
            } else {
                process.exit(0)
            }
        }).catch(error => {
            console.log(chalk.red(error))
        })
    }
}

module.exports = initial