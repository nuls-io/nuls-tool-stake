<template>
    <div class="header bg-white">
        <div class="logo fl">
            <img class="clicks" @click="toUrl('home')" :src="logoSvg"/>
        </div>
        <div class="account fr">
            <div class="fl">
                <div v-if="$store.state.address" class="clicks address" @click="accountDialog=true">
                    {{superLongs($store.state.address,5)}}
                </div>
                <div v-else class="click" @click="connectWallet">{{$t('header.header0')}}</div>
            </div>
            <div class="fr clicks language" @click="selectLanguage">{{lang !=='en' ? 'En':'Zh'}}</div>
        </div>
        <el-dialog title="" :visible.sync="accountDialog" width="350px" class="account-dialog">
            <div class="address">{{$store.state.address}}</div>
            <div class="btns">
                <el-button @click="toUrl($store.state.address,'url')">{{$t('header.header1')}}</el-button>
                <el-button @click="copy($store.state.address)">{{$t('header.header2')}}</el-button>
                <el-button @click="offLink">{{$t('header.header3')}}</el-button>
            </div>
        </el-dialog>
    </div>
</template>

<script>
  import {EXPLORER_URL} from '@/config'
  import logo from '@/assets/img/logo.svg'
  import {copys, superLong} from '@/api/util'
  import providerMixin from '../mixins/providerMixin'

  export default {
    mixins: [providerMixin],
    data() {
      return {
        logoSvg: logo,
        lang: localStorage.getItem('lang') || 'en',
        accountDialog: false
      };
    },
    components: {},

    mounted() {
      this.initAccount()
    },

    methods: {

      superLongs(string, leng) {
        return superLong(string, leng)
      },

      async getAvailableVotes() {
        await this.$store.dispatch('changeBalance')
      },

      //断开连接钱包
      async offLink() {
        this.accountDialog = false;
        this.disconnect()
      },

      //显示账户信息
      showAccount() {
        this.walletDialog = true;
      },

      /**
       * 复制方法
       * @param sting
       **/
      copy(sting) {
        copys(sting);
        this.$message({message: this.$t('public.copyComplete'), type: 'success', duration: 2000});
        this.accountDialog = false;
      },

      /**
       * 语言切换
       */
      selectLanguage() {
        this.lang = this.lang === 'en' ? 'cn' : 'en';
        localStorage.setItem('lang', this.lang);
        this.$i18n.locale = this.lang;
      },

      /**
       * url 连接
       * @param name
       * @param pas
       */
      toUrl(name, pas) {
        if (pas === 'url') {
          window.open(EXPLORER_URL + 'address/info?address=' + name);
          this.accountDialog = false;
        } else {
          this.$router.push({
            name: name,
          })
        }
      }
    }
  }
</script>

<style lang="less">
    @import "./../assets/css/style";

    .header {
        height: 60px;
        line-height: 60px;
        border-bottom: 1px solid #f1f1f1;
        .logo {
            margin: 5px 0 0 10px;
            height: 40px;
            img {
                width: 120px;
            }
        }
        .account {
            font-size: 12px;
            line-height: 60px;
            margin: 0 10px 0 0;
            .address {
                background-color: #f1f1f1;
                height: 30px;
                line-height: 30px;
                margin: 15px 0 0 0;
                //width: 100px;
                padding: 0 10px;
                text-align: center;
                border-radius: 15px;
            }
            .language {
                margin: 0 0 0 10px;
                width: 25px;
                text-align: center;
            }
        }
        .account-dialog {
            .el-dialog {
                .el-dialog__body {
                    padding: 10px 5px;
                    .address {
                        padding: 10px 5px;
                        border-radius: 5px;
                        background-color: #f1f1f1;
                        margin: 0 0 15px 0;
                        font-size: 13px;
                    }
                    .btns {
                        text-align: center;
                        padding: 0 0 15px 0;
                        .el-button {
                            width: 100px;
                            .span {
                                color: #000000 !important;
                            }
                        }
                    }
                }
            }

        }
    }
</style>
