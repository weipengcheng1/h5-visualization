//导入组件
import Component from "./index.vue"
import config from "./package.json"


Component.install = function (Vue) {
    Vue.component(`${config.name}+${config.version}`, Component)
}


export {
    Component
}