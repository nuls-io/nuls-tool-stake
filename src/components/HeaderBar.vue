<template>
    <div class="header bg-white">
        <div class="logo fl">
            <img class="clicks" @click="toUrl('home')" :src="logoSvg"/>
        </div>
        <div class="account fr">
            <div class="fl">
                <div v-if="$store.state.accountInfo.address" class="clicks address" @click="accountDialog=true">
                    {{superLongs($store.state.accountInfo.address,5)}}
                </div>
                <div v-else class="click" @click="connectTo('nabox')">{{$t('header.header0')}}</div>
            </div>
            <div class="fr clicks language" @click="selectLanguage">{{lang !=='en' ? 'EN':'中文'}}</div>
        </div>
        <el-dialog title="" :visible.sync="accountDialog" width="350px" class="account-dialog">
            <div class="address">{{$store.state.accountInfo.address}}</div>
            <div class="btns">
                <el-button @click="toUrl($store.state.accountInfo.address,'url')">{{$t('header.header1')}}</el-button>
                <el-button @click="copy($store.state.accountInfo.address)">{{$t('header.header2')}}</el-button>
                <el-button @click="offLink($store.state.accountInfo.address)">{{$t('header.header3')}}</el-button>
            </div>
        </el-dialog>
    </div>
</template>

<script>
  import {RUN_DEV, EXPLORER_URL} from '@/config'
  import logoBeta from '@/assets/img/logo-beta.svg'
  import logo from '@/assets/img/logo.svg'
  import {copys, superLong} from '@/api/util'

  export default {
    data() {
      return {
        logoSvg: RUN_DEV ? logo : logoBeta,
        accountInfo: {},//账户信息
        lang: localStorage.getItem('lang') || 'en',
        accountDialog: false
      };
    },
    components: {},
    created() {
      // this.selectLanguage();
    },
    mounted() {
      setTimeout(() => {
        if (typeof window.nabox !== "undefined") {
          this.getConnect();
        }
      }, 300)
    },
    methods: {

      //连接钱包
      onLink() {
        this.$store.commit("toggleConnect", true)
        // this.connectDialog = true;
      },

      superLongs(string, leng) {
        return superLong(string, leng)
      },

      async getAvailableVotes() {
        await this.$store.dispatch('changeBalance')
      },

      /**
       * @disc: 连接到插件
       * @params: wallet name
       * @date: 2021-03-10 13:52
       * @author: Wave
       */
      connectTo(walletName) {
        //console.log(walletName);
        if (walletName === 'nabox') {
          if (typeof window.nabox !== "undefined") {
            this.getConnect();
          } else {
            //this.$message({message: this.$t('set.set16'), type: 'error', duration: 3000});
            this.$message({message: this.$t('tips.tips7'), type: 'error', duration: 3000});
            setTimeout(() => {
              window.open("https://chrome.google.com/webstore/detail/nabox-wallet/nknhiehlklippafakaeklbeglecifhad?hl=zh-CN&authuser=2")
            }, 1000)
          }
        } else {
          this.$message({message: this.$t('tips.tips8'), type: 'error', duration: 3000});
        }
      },

      //断开连接钱包
      async offLink(address) {
        this.accountDialog = false;
        this.$store.commit("changeAccount", {address: ""});
        // let resData = await window.nabox.offLink({address: address, chain: RUN_DEV ? 'tNULS' : "NULS"});
        // console.log(resData);
      },

      //连接nabox 并获取地址信息
      async getConnect() {
        let naboxInfo = await window.nabox.createSession();
        console.log(naboxInfo);
        if (naboxInfo && naboxInfo.length) {
          if (naboxInfo[0].startsWith('tNULS') || naboxInfo[0].startsWith('NULS')) {
            this.$store.commit("changeAccount", {address: naboxInfo[0]});
            this.naboxAccount();
          } else {
            if (naboxInfo[0]) {
              this.offLink(naboxInfo[0])
            }
            console.log("请切换nabox的网络到nuls ");
          }
        } else {
          //this.$message({message: this.$t('set.set19'), type: 'error', duration: 3000});
          this.$message({message: this.$t('tips.tips9'), type: 'error', duration: 3000});
        }
      },

      //监听插件账户变化
      naboxAccount() {
        if (!window.nabox) {
          this.$store.commit("changeAccount", {address: ""});
          return
        }
        window.nabox.on("accountsChanged", (payload) => {
          //console.log(payload[0]);
          if (payload && payload.length) {
            if (payload[0].startsWith('tNULS') || payload[0].startsWith('NULS')) {
              this.$store.commit("changeAccount", {address: payload[0]});
              //this.accountInfo.address = payload[0];
            }
          } else {
            this.$store.commit("changeAccount", {address: ""});
          }
        });

      },

      /*naboxDisconnect() {
        if (!window.nabox) {
          this.$store.commit("changeAccount", null);
          this.accountInfo = {address: ""};
          return
        }
        window.nabox.on("disconnect", (payload) => {
          console.log(payload[0], "disconnect");
        });
      },*/

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
        console.log(this.lang, 366)
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
            margin: 5px 0 0 5px;
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
