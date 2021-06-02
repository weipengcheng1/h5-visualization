#! /usr/bin/env node
const fs = require("fs")
const path = require("path")

const program = require("commander")  //提供了命令行输入和参数解析，简化命令行开发
const generate = require("../commander/generator");
const release = require("../commander/release");
const releaseComponent = require("../commander/releaseComponent")
const initial = require("../commander/initial")
const pkg = require("../package.json")

let config = {};
// 配置文件如果存在则读取
if (fs.existsSync(path.resolve('coco.config.js'))) {
    config = require(path.resolve('coco.config.js'));
}
/**
 * 初始化配置文件
 */
program
    .version(pkg.version, '-v, --version')
    .command("init")
    .description("初始化 coco config 配置文件")
    .action(initial)


/**
 * 创建项目命令
 */
program
    .command("create [template]")
    .description("Generator a new template")
    .action(function (template) {
        generate(template).then().catch()
    })


/**
 * 发布模板
 */
program
    .command("release-tpl")
    .description("Release template")
    .action(function () {
        release().then().catch()
    })

program
    .command("release-component")
    .description("Release component")
    .action(function () {
        releaseComponent().then().catch()
    })

program.parse(process.argv);