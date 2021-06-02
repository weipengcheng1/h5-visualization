<template>
    <div @onRemoteComponentLoad="remoteComponentLoad">
    </div>
</template>

<script>
import RemoteComponentLoader from "./remote-component-loader";

export default {
    name: "component",
    components: {
        RemoteComponentLoader
    },
    data() {
        return {
            remoteComponents: []
        }
    },
    methods: {
        /**
         * 远程组件加载完成后需要生成props
         * @param config
         * @param index  组件顺序标记
         */
        remoteComponentLoad({config, index}) {
            const has = this.remoteComponents.filter(item => `${item.name}.${item.version}` === `${config.name}.${config.version}`)[0]
            if (!has) {
                this.remoteComponents.push(config)
            }
            this.remoteComponents.forEach((item) => {
                if (item.config && item.config.index === index) {
                    item.props = item.props || config.data;
                }
            })

        }
    }
}
</script>

<style lang="scss" scoped>

</style>