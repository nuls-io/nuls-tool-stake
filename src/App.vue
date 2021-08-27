<template>
    <div id="app" class="app">
        <HeaderBar>
        </HeaderBar>
        <router-view>
        </router-view>
    </div>
</template>

<script>
  import HeaderBar from './components/HeaderBar'

  export default {
    components: {
      HeaderBar,
    },
    methods: {}
  }
</script>

<style lang="less">
    @import "assets/css/base.less";

    .app {
        background-color: #ffffff;
        max-width: 400px;
        margin: 0 auto;
    }
</style>
