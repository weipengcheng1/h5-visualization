const path = require("path")

module.exports = {
    //修改src为examples
    pages: {
        index: {
            entry: "examples/main.js",
            template: "public/index.html",
            filename: "index.html"
        }
    },
    //扩展webpack配置， 使packages加入编译
    chainWebpack: config => {
        config.module
            .rule("eslint")
            .exclude.add(path.resolve("dist"))
            .end()
            .exclude.add(path.resolve("examples/docs"))
            .end();
        config.module
            .rule("js")
            .include
            .add("/packages")
            .end()
            .use("babel")
            .loader("babel-loader")
            .tap(options => {
                return options
            })
    }
}