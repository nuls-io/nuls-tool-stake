<template>
  <div class="import-address bg-gray">
    <div class="bg-white"></div>
    <div style="">
      <el-tabs v-model="activeName" @tab-click="handleClick" class="new_import w1200">
        <el-tab-pane :label="$t('newAddress.newAddress0')" name="keystoreImport">
          <div class="tc upload_keystore">
            <el-upload drag class="upload" action="localhost" :accept="mobile?'*':'.keystore'" v-if="!isfileReader"
                       :before-upload="handleUpload"
                       :multiple="false"
                       :limit="1">
              <i class="el-icon-upload"></i>
              <div class="el-upload__text">{{$t('newAddress.newAddress3')}}<em>{{$t('newAddress.newAddress4')}}</em>
              </div>
            </el-upload>
            <div v-else>{{$t('newAddress.newAddress5')}}</div>
          </div>
        </el-tab-pane>
        <el-tab-pane :label="$t('newAddress.newAddress1')" name="keyImport">
          <div class="bg-white w1200 mt_100">
            <el-form :model="importForm" :rules="importRules" ref="importForm" status-icon class="import-form w630">
              <el-form-item :label="$t('newAddress.newAddress6')" prop="keys">
                <el-input type="textarea" v-model.trim="importForm.keys" autocomplete="off"></el-input>
              </el-form-item>
              <el-form-item :label="$t('newAddress.newAddress7')" prop="pass">
                <el-input v-model="importForm.pass" type="password" autocomplete="off"></el-input>
              </el-form-item>
              <el-form-item :label="$t('newAddress.newAddress8')" prop="checkPass">
                <el-input v-model="importForm.checkPass" type="password" autocomplete="off"></el-input>
              </el-form-item>
              <el-form-item class="form-bnt mb_100">
                <el-button type="success" @click="keyImport('importForm')">{{$t('newAddress.newAddress9')}}</el-button>
              </el-form-item>
            </el-form>
          </div>
        </el-tab-pane>
        <el-tab-pane :label="$t('newAddress.newAddress2')" name="newAddress">
          <el-form :model="newAddressForm" status-icon :rules="newAddressRules" ref="newAddressForm"
                   class="new_address w630">
            <el-form-item :label="$t('newAddress.newAddress7')" prop="pass">
              <el-input type="password" v-model="newAddressForm.pass" autocomplete="off"></el-input>
            </el-form-item>
            <el-form-item :label="$t('newAddress.newAddress8')" prop="checkPass">
              <el-input type="password" v-model="newAddressForm.checkPass" autocomplete="off"></el-input>
            </el-form-item>
            <el-form-item label="" prop="agreement" class="agreement">
              <el-checkbox-group v-model="newAddressForm.agreement">
                <el-checkbox :label="$t('tips.tips10')" name="agreement"></el-checkbox>
              </el-checkbox-group>
            </el-form-item>
            <el-form-item class="form-bnt">
              <el-button type="success" @click="newAddressSubmitForm('newAddressForm')">
                {{$t('newAddress.newAddress2')}}
              </el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>
      </el-tabs>
    </div>
    <Password ref="password" @passwordSubmit="keystoreImportPassSubmit">
    </Password>
  </div>
</template>

<script>
  import nuls from 'nuls-sdk-js'
  import {API_CHAIN_ID, API_PREFIX} from '@/config'
  import {getAddressInfoByAddress} from '@/api/requestData'
  import {passwordVerification, connect} from '@/api/util'
  import Password from '@/components/PasswordBar'

  export default {
    data() {
      this.mobile =/Android|webOS|iPhone|iPad|BlackBerry/i.test(navigator.userAgent);
      let validateKeys = (rule, value, callback) => {
        if (value === '') {
          callback(new Error(this.$t('tips.tips0')));
        } else if (value.length < 60 || value.length > 66) {
          callback(new Error(this.$t('tips.tips32')));
        } else {
          callback();
        }
      };
      let validatePass = (rule, value, callback) => {
        if (value === '') {
          callback(new Error(this.$t('tips.password0')));
        } else {
          if (this.importForm.checkPass !== '') {
            this.$refs.importForm.validateField('checkPass');
          }
          callback();
        }
      };
      let validateCheckPass = (rule, value, callback) => {
        if (value === '') {
          callback(new Error(this.$t('tips.tips1')));
        } else if (value !== this.importForm.pass) {
          callback(new Error(this.$t('tips.tips2')));
        } else {
          callback();
        }
      };

      let validateNewPass = (rule, value, callback) => {
        let patrn = /^(?![\d]+$)(?![a-zA-Z]+$)(?![^\da-zA-Z]+$).{8,20}$/;
        if (value === '') {
          callback(new Error(this.$t('tips.password0')));
        } else if (!patrn.exec(value)) {
          callback(new Error(this.$t('tips.password1')));
        } else {
          if (this.newAddressForm.checkPass !== '') {
            this.$refs.newAddressForm.validateField('validateNewCheckPass');
          }
          callback();
        }
      };
      let validateNewCheckPass = (rule, value, callback) => {
        if (value === '') {
          callback(new Error(this.$t('tips.tips1')));
        } else if (value !== this.newAddressForm.pass) {
          callback(new Error(this.$t('tips.tips2')));
        } else {
          callback();
        }
      };
      let validateAgreement = (rule, value, callback) => {
        if (!value) {
          callback(new Error(this.$t('tips.tips9')));
        } else {
          callback();
        }
      };
      return {
        activeName: 'keystoreImport',//tab选中

        isfileReader: typeof FileReader === "undefined",//浏览器是否支持FileReader
        keystoreInfo: {},//keystore导入文本信息

        importForm: {
          keys: '',
          pass: '',
          checkPass: ''
        },
        importRules: {
          keys:
            [
              {validator: validateKeys, trigger: 'blur'}
            ],
          pass: [
            {validator: validatePass, trigger: 'blur'}
          ],
          checkPass: [
            {validator: validateCheckPass, trigger: 'blur'}
          ],
        },
        importAddressInfo: {},//私钥导入地址信息

        newAddressForm: {
          pass: '',
          checkPass: '',
          agreement: false,
        },
        newAddressRules: {
          pass: [
            {validator: validateNewPass, trigger: 'blur'}
          ],
          checkPass: [
            {validator: validateNewCheckPass, trigger: 'blur'}
          ],
          agreement: [
            {validator: validateAgreement, trigger: 'blur'}
          ],
        },
        newAddressInfo: {},//创建地址信息
      };
    },
    components: {
      Password
    },
    created() {
    },
    methods: {

      /**
       * @disc: tab选择
       * @params: tab
       * @date: 2019-08-31 16:18
       * @author: Wave
       */
      handleClick(tab) {
        if (tab.name === 'keystoreImport') {
          this.importAddressInfo = {};
          this.newAddressInfo = {};
          this.$refs['importForm'].resetFields();
          this.$refs['newAddressForm'].resetFields();
        } else if (tab.name === 'keyImport') {
          this.keystoreInfo = {};
          this.newAddressInfo = {};
          this.$refs['newAddressForm'].resetFields();
        } else {
          this.keystoreInfo = {};
          this.importAddressInfo = {};
          this.$refs['importForm'].resetFields();
        }
      },

      /**
       * @disc: 获取kestore信息
       * @params: file
       * @date: 2019-08-31 16:01
       * @author: Wave
       */
      handleUpload(file) {
        const name = file.name.split('.')
        const ext = name[name.length-1]
        if (ext.toLowerCase()!=='keystore') {
          this.$message({
            message: this.$t('tips.keyStore'),
            type: 'warning',
            duration: 3000
          })
          return
        }

        const reader = new FileReader();
        reader.addEventListener("load", () => {
          //console.log(JSON.parse(reader.result));
          this.keystoreInfo = JSON.parse(reader.result);
          this.$refs.password.showPassword(true);
        });
        reader.readAsText(file, "utf-8");
      },

      /**
       * @disc: keystore 导入密码框提交
       * @params: password
       * @date: 2019-09-02 10:49
       * @author: Wave
       */
      async keystoreImportPassSubmit(password) {
        this.keystoreInfo.aesPri = this.keystoreInfo.encryptedPrivateKey;
        this.keystoreInfo.pub = this.keystoreInfo.pubKey;
        let isPassword = passwordVerification(this.keystoreInfo, password);
        if (isPassword.success) {
          this.keystoreInfo.address = isPassword.address;
          let addressInfo = await getAddressInfoByAddress(this.keystoreInfo.address);
          if (addressInfo.success) {
            let newAddressInfo = {...this.keystoreInfo, ...addressInfo.data};
            localStorage.setItem('accountInfo', JSON.stringify(newAddressInfo));
            this.toUrl('backupsAddress');
          } else {
            this.$message({
              message: this.$t('tips.tips3') + addressInfo.data.error.message,
              type: 'error',
              duration: 2000
            });
          }
        } else {
          this.$message({message: this.$t('tips.tips4'), type: 'error', duration: 2000});
        }
      },

      /**
       * @disc: 私钥导入账户提交
       * @params: formName
       * @date: 2019-08-31 16:01
       * @author: Wave
       */
      keyImport(formName) {
        this.$refs[formName].validate(async (valid) => {
          if (valid) {
            const keyAddressInfo = nuls.importByKey(API_CHAIN_ID, this.importForm.keys, this.importForm.pass, API_PREFIX);
            let addressInfo = await getAddressInfoByAddress(keyAddressInfo.address);
            //console.log(addressInfo);
            if (addressInfo.success) {
              let newAddressInfo = {...keyAddressInfo, ...addressInfo.data};
              localStorage.setItem('accountInfo', JSON.stringify(newAddressInfo));
              this.toUrl('backupsAddress');
            } else {
              this.$message({
                message: this.$t('tips.tips5') + addressInfo.data.error.message,
                type: 'error',
                duration: 2000
              });
            }
            this.toUrl('backupsAddress');
          } else {
            return false;
          }
        });
      },

      /**
       * @disc: 创建账户提交
       * @params: formName
       * @date: 2019-08-31 16:01
       * @author: Wave
       */
      newAddressSubmitForm(formName) {
        this.$refs[formName].validate(async (valid) => {
          if (valid) {
            this.newAddressInfo = nuls.newAddress(API_CHAIN_ID, this.newAddressForm.pass, API_PREFIX);
            let addressInfo = await getAddressInfoByAddress(this.newAddressInfo.address);
            if (addressInfo.success) {
              let newAdressInfo = {...this.newAddressInfo, ...addressInfo.data};
              localStorage.setItem('accountInfo', JSON.stringify(newAdressInfo));
              this.toUrl('backupsAddress');
            } else {
              this.$message({
                message: this.$t('tips.tips6') + addressInfo.data.error.message,
                type: 'error',
                duration: 2000
              });
            }

          } else {
            return false;
          }
        });
      },

      /**
       * @disc: 连接跳转
       * @params: name, parameter, type
       * @date: 2019-09-02 11:12
       * @author: Wave
       */
      toUrl(name, parameter = '', type = 0) {
        let newConnect = connect(name, parameter, type);
        if (newConnect.success) {
          this.$router.push(newConnect.data)
        }
      },
    }
  }
</script>

<style lang="less">
  @import "./../../assets/css/style";
  .import-address {
    .bg-white {
      min-height: 130px;
    }
    .new_import {
      margin: -90px auto 100px;
      .el-tabs__header {
        margin: 0;
        .el-tabs__nav-wrap {
          text-align: center;
          &:after {
            height: 1px;
          }
        }
        .el-tabs__nav-scroll {
          .el-tabs__nav {
            float: none;
            .el-tabs__active-bar {
              height: 0;
            }
            .el-tabs__item {
              text-align: center;
              padding: 0 25px;
              margin: 10px 20px 20px;
              border-radius: 4px;
              @media screen and (max-width: 1024px) {
                padding: 0 0.5rem;
              }
              &:hover {
                background: linear-gradient(to right, #4ef16a, #0ede94);
                color: #FFFFFF;
              }
            }
            .is-active {
              background: linear-gradient(to right, #4ef16a, #0ede94);
              color: #FFFFFF;
            }
          }
        }
      }
      .el-tabs__content {
        background-color: #FFFFFF;
        .upload_keystore {
          padding: 100px 0 100px 0;
          border: 1px solid #E4E7ED;
        }
        .import-form {
          margin: 60px auto 0;
          @media screen and (max-width: 1024px) {
            margin: 2rem 0 0 0.5rem;
            width: 96%;
          }
        }
        .new_address {
          margin: 60px auto 100px;
          @media screen and (max-width: 1024px) {
            margin: 2rem 0 0 0.5rem;
            width: 96%;
          }
          .agreement {
            margin-bottom: 0;
            .el-form-item__content {
              line-height: 10px;
              margin-top: 5px;
            }
          }
        }
      }
    }
    @media screen and (max-width: 1000px) {
      .new_import {
        padding: @unit*12;
        .el-tabs__header {
          padding-bottom: @unit*5;
          overflow-x: auto;
          .el-tabs__nav-wrap {
            .el-tabs__nav-prev,.el-tabs__nav-next {
              display: none;
            }
            &.is-scrollable {
              padding:0;
            }
            .el-tabs__nav-scroll {
              overflow-x: auto;
              &::-webkit-scrollbar {display:none}
              .el-tabs__nav{
                float: left;
                .el-tabs__item {
                  font-size: @unit*14;
                  height: @unit*30;
                  line-height: @unit*30;
                  padding: 0 @unit*12;
                  text-align: left;
                  margin: 0;
                  border-radius: 0;
                  &:nth-of-type(2) {
                    padding-right: @unit*10;
                    padding-left:0;
                  }
                  &:last-of-type {
                    padding-left: @unit*10;
                    padding-right:0;
                  }
                  &:hover,&.is-active {
                    background: transparent;
                    color: #303133;
                  }
                }
                .el-tabs__active-bar {
                  background-color: #0ede94;
                  height: 2px;
                }

              }
            }
          }
        }
        .el-tabs__content {
          .upload_keystore {
            padding-top: @unit*100;
            border: none;
            .el-upload-dragger {
              width: @unit*350;
              height: @unit*180;
              .el-icon-upload{
                font-size: @unit*60;
                margin: @unit*40 0 @unit*16;
                line-height: @unit*50
              }
              .el-upload__text {
                font-size: @unit*14;
              }
            }
          }
          .new_address {
            .el-checkbox__inner {
              width: @unit*14;
              height: @unit*14;
              &:after {
                width: @unit*3;
                height: @unit*7;
                left: @unit*4;
                top: @unit*1
              }
            }
          }
        }
        .el-form .form-bnt {
          text-align: center;
        }
        .el-form .form-bnt .el-button {
          width: @unit*200;
          margin-top: @unit*20;
        }
      }
    }
  }
</style>
