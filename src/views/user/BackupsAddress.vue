<template>
  <div class="backups-address ">
    <div class="bg-white">
      <h3 class="title tc">{{$t('backupsAddress.backupsAddress0')}}</h3>
    </div>
    <div class="bg-white w1200 tab">
      <div class="address w630">
        <p class="info mt_20 mb_20 pt_20">
          {{$t('backupsAddress.backupsAddress1')}}
          <span class="yellow">{{accountAddress.address}}</span>
           &nbsp;<i class="el-icon-document-copy click" @click="copy(accountAddress.address)"></i>
        </p>
      </div>
      <div class="tips bg-gray w630">
        <p class="sub_info "><i></i> {{$t('backupsAddress.backupsAddress2')}}</p>
        <p class="sub_info "><i></i> {{$t('backupsAddress.backupsAddress3')}}</p>
      </div>

      <div class="w630 tc btn-next pb_20">
        <div class="mt_20">
          <el-button type="success " @click="backupsKeyStore">{{$t('backupsAddress.backupsAddress41')}}</el-button>
        </div>
        <div class="mt_20">
          <el-button type="success" @click="backupsKey">{{$t('backupsAddress.backupsAddress4')}}</el-button>
        </div>
        <div class="mt_20 mb_20">
          <el-button @click="toUrl('home')"> {{$t('backupsAddress.backupsAddress5')}}</el-button>
        </div>
      </div>
    </div>
    <Password ref="password" @passwordSubmit="passSubmit">
    </Password>
    <el-dialog :title="$t('backupsAddress.backupsAddress6')" width="40%"
               :visible.sync="keyDialog"
               :close-on-click-modal="false"
               :close-on-press-escape="false"
    >
      <span></span>
      <p class="bg-white">
        {{accountAddress.pri}}
      </p>
      <span slot="footer" class="dialog-footer">
        <el-button type="success" @click="copy(accountAddress.pri)">{{$t('public.copy')}}</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
  import Password from '@/components/PasswordBar'
  import {copys, passwordVerification} from '@/api/util'

  export default {
    components: {Password},
    data() {
      return {
        accountAddress: JSON.parse(localStorage.getItem('accountInfo')),
        keyDialog: false, //key弹框
        backupsType: 0,// 备份类型 0:keystore 1:key
      };
    },
    methods: {

      /**
       *  获取密码框的密码
       * @param password
       **/
      async passSubmit(password) {
        let isPassword = await passwordVerification(this.accountAddress, password);
        if (!isPassword.success) {
          this.$message({message: this.$t('tips.tips4'), type: 'error', duration: 3000});
          return;
        }
        if (this.backupsType === 0) {
          let FileSaver = require('file-saver');
          let fileInfo = {
            address: isPassword.address,
            encryptedPrivateKey: isPassword.aesPri,
            pubKey: isPassword.pub,
            priKey: null
          };
          let blob = new Blob([JSON.stringify(fileInfo)], {type: "text/plain;charset=utf-8"});
          FileSaver.saveAs(blob, isPassword.address + ".keystore");
        } else {
          this.keyDialog = true;
          this.accountAddress.pri = isPassword.pri;
        }
      },

      /**
       *  备份私钥
       **/
      backupsKey() {
        this.backupsType = 1;
        this.$refs.password.showPassword(true);
      },

      /**
       * @disc: 备份keystore
       * @date: 2019-10-12 14:24
       * @author: Wave
       */
      backupsKeyStore() {
        try {
          let isFileSaverSupported = !!new Blob;
          if (isFileSaverSupported) {
            this.backupsType = 0;
            this.$refs.password.showPassword(true);
          }
        } catch (e) {
          this.$message({message: this.$t('tips.tips7'), type: 'error', duration: 3000});
          console.log(e);
        }
      },

      /**
       * 连接跳转
       * @param name
       */
      toUrl(name) {
        this.$router.push({
          name: name,
        })
      },

      /**
       * 复制方法
       * @param sting
       **/
      copy(sting) {
        copys(sting);
        this.$message({message: this.$t('public.copyComplete'), type: 'success', duration: 1000});
      },
    }
  }
</script>

<style lang="less">
  @import "./../../assets/css/style";

  .backups-address {
    .bg-white {
      .title {
        margin: 20px auto 10px;
        font-size: 30px;
      }
    }
    .tab {
      .address {
        margin: 20px auto;
        font-size: 18px;
      }
      .tips {
        margin: 0 auto 40px;
        padding: 20px 30px;
        p {
          line-height: 24px;
          i {
            width: 5px;
            height: 5px;
            display: block;
            float: left;
            margin: 9px 10px 0 0;
            border-radius: 5px;
            background: #000000;
          }
        }
      }
    }
    .btn-next {
      @media screen and (max-width: 1024px) {
        width: 100%;
      }
    }
    @media screen and (max-width: 1000px) {
      padding: @unit*12;
      .title-wrap {
        display: none;
      }
      .tab {
        .address {
          margin-top: @unit*10;
          margin-left: 0;
          .fCN {
            margin-top: @unit*5;
            display: inline-block;
          }
          p,span,i{
            font-size: @unit*14;
            margin-bottom: 0;
          }
        }
        .tips {
          /*margin: 0.4rem auto;*/
          padding: @unit*20;
          p {
            line-height: @unit*24;
            font-size: @unit*14;
            i {
              width: @unit*5;
              height: @unit*5;
              display: block;
              float: left;
              margin: @unit*10 @unit*10 0 0;
              border-radius: @unit*5;
              background: #000000;
            }
          }
        }
        .btn-next {
          .el-button{
            width: 70%;
          }
          .mt_20 {
            margin-top: @unit*10;
          }
        }
      }
    }
  }

</style>
