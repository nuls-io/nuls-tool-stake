<template>
    <div class="home">
        <div class="all">
            <div class="top">
              <div class="left">
                <h3>{{$t('home.home1')}}(NULS)</h3>
                <p>{{consensusTotal}}</p>
              </div>
              <div class="right">
                <h3>APR</h3>
                <p>{{apr}}%</p>
              </div>
<!--                <div class="alls">-->
<!--                    <h3>{{$t('home.home1')}}</h3>-->
<!--                    <p>{{consensusTotal}}</p>-->
<!--                </div>-->
            </div>
            <ul class="list cb">
                <li>
                    <h6>{{consensusInfo.lastDayReward}}</h6>
                    <p>
                      {{$t('home.home2')}}
                      <br>
                      <span class="font_12">(NULS)</span>
                    </p>
                </li>
                <li>
                    <h6>{{consensusInfo.totalReward}}</h6>
                  <p>
                    {{$t('home.home3')}}
                    <br>
                    <span class="font_12">(NULS)</span>
                  </p>
                </li>
                <li>
                    <h6>{{consensusInfo.consensusLock}}</h6>
                  <p>
                    {{$t('home.home4')}}
                    <br>
                    <span class="font_12">(NULS)</span>
                  </p>
                </li>
            </ul>
        </div>

        <div class="node">

            <el-select v-model="searchValue" filterable :placeholder="$t('home.home5')" class="search"
                       @change="changeValue">
                <el-option v-for="item in allNodeData" :key="item.agentId"
                           :label="item.agentAlias ? item.agentAlias:item.agentId" :value="item">
                </el-option>
            </el-select>
            <ul>
                <li>{{$t('home.home6')}}<span class="fr">{{nodeInfo.creditValue}}</span></li>
                <li>{{$t('home.home7')}}<span class="fr">{{nodeInfo.totalDeposit}} NULS</span></li>
                <li>{{$t('home.home8')}}<span class="fr">{{nodeInfo.remaining}} NULS</span></li>
                <li>{{$t('home.home9')}}<span class="fr">{{nodeInfo.commissionRate}}%</span></li>
            </ul>

            <div class="fr available">
                {{$t('home.home10')}}: {{balance}} NULS
            </div>
            <el-form :model="joinForm" status-icon :rules="joinRules" ref="joinForm" class="join-form">
                <el-form-item label="" prop="stakingValue" ref="stakingValue">
<!--                    <div class="max" @click="max">{{$t('home.home11')}}</div>-->
                    <el-input :placeholder="$t('home.home12')" v-model="joinForm.stakingValue" class="staking-value">
                      <el-button slot="append" @click="max">{{$t('home.home11')}}</el-button>
                    </el-input>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" class="pledge" @click="submitStaking('joinForm')">{{$t('home.home13')}}
                    </el-button>
                </el-form-item>
            </el-form>
            <div class="cb"></div>
        </div>

        <div class="pledgeing" v-show="nodeDepositData.length !==0">
            <h5>{{$t('home.home14')}}</h5>
            <div class="lis" v-for="(item,index) in nodeDepositData" :key="index">
                <div class="fl">
                    <div class="top">{{item.amount}} NULS <span>{{item.createTime}}</span></div>
                    <div class="tx">TXID: <span @click="toUrl(item.txHash,'url')" class="click">{{superLongs(item.txHash,10)}}</span>
                    </div>
                </div>
                <div class="fr">
                    <span class="click" @click="outStaking(item)">{{$t('home.home15')}}</span>
                </div>
            </div>
            <div class="cb"></div>
        </div>

        <el-dialog :title="$t('home.home16')" :visible.sync="outDialog" width="350px" class="outDialog">
            <div class="tips">{{$t('home.home17')}}{{outStakingInfo.amount}} NULS</div>
            <div class="btns">
                <el-button type="primary" @click="outDialog=false">{{$t('public.cancel')}}</el-button>
                <el-button type="primary" @click="out">{{$t('public.exit')}}</el-button>
            </div>
        </el-dialog>
    </div>
</template>

<script>
  import {EXPLORER_URL, RUN_DEV} from '@/config'
  import dayjs from 'dayjs'
  import {
    Minus,
    divisionDecimals,
    formatNum,
    getLocalTime,
    superLong,
    arrDistinctByProp,
    tofix
  } from '@/api/util'

  export default {
    data() {

      let checkStakingValue = (rule, value, callback) => {
        let usable = Number(Minus(500000, Number(this.nodeInfo.totalDeposit)));
        let balance = Number(Minus(this.balance, Number(value)));
        let re = /^\d+(?=\.{0,1}\d+$|$)/;
        let res = /^\d{1,8}(\.\d{1,8})?$/;
        if (!value) {
          return callback(new Error(this.$t('tips.tips0')));
        } else if (!re.exec(value) || !res.exec(value)) {
          callback(new Error(this.$t('tips.tips1')))
        } else if (value < 2000) {
          return callback(new Error(this.$t('tips.tips5')));
        } else if (value > usable) {
          return callback(new Error(this.$t('tips.tips3') + usable + this.$t('tips.tips4')));
        } else if (balance < 0.001) {
          return callback(new Error(this.$t('tips.tips6') + this.balance));
        } else {
          callback()
        }
      };

      return {
        consensusTotal: 0,//全网TVL
        consensusInfo: {
          lastDayReward: 0,
          totalReward: 0,
          consensusLock: 0
        },//账户的质押信息
        balance: 0,//账户余额

        allNodeData: [],//所有节点信息
        searchValue: '',//搜索框内容
        nodeInfo: {},//节点信息

        joinForm: {
          stakingValue: '',//加入staking
        },
        joinRules: {
          stakingValue: [
            {validator: checkStakingValue, trigger: ['blur', 'change']}
          ]
        },


        myNodeData: [],//我的节点列表
        nodeDepositData: [],//委托列表
        oldData: [],//旧委托列表

        outDialog: false,//退出弹框
        outStakingInfo: {},//退出staking信息
        apr: "", // 年化率

      };
    },
    created() {
      this.init()
    },
    mounted() {

      setInterval(() => {
        if (this.$store.state.accountInfo.address) {
          this.getAddressInfoByNode(this.$store.state.accountInfo);
          this.getConsensusInfoByAddress(1, 500, this.$store.state.accountInfo.address);
        }
      }, 11000)

    },
    watch: {
      '$store.state.accountInfo': {
        immediate: false, // immediate选项可以开启首次赋值监听
        handler(newVal, oldVal) {
          console.log(newVal, oldVal);
          if (newVal) {
            this.nodeDepositData = [];
            this.oldData = [];
            this.getAddressInfoByNode(newVal);
            this.getConsensusInfoByAddress(1, 500, newVal.address);
          }
        }
      },
    },
    methods: {

      init() {
        this.getCoinInfo();
        this.getConsensusNodes();
        this.getAnnulizedRewardStatistical()
        // if (this.$store.state.accountInfo.address) {
        //   this.getAddressInfoByNode(this.$store.state.accountInfo);
        //   this.getConsensusInfoByAddress(1, 500, this.$store.state.accountInfo.address);
        // }
      },

      superLongs(string, leng) {
        return superLong(string, leng)
      },

      /**
       * 获取共识委托量统计信息
       **/
      getCoinInfo() {
        this.$post('/', 'getCoinInfo', [])
          .then((response) => {
            if (response.hasOwnProperty("result")) {
              let consensusTotal = divisionDecimals(response.result.consensusTotal);
              this.consensusTotal = formatNum(Number(consensusTotal));
            } else {
              this.consensusTotal = 0;
            }
          })
          .catch((error) => {
            console.log("getCoinInfo:" + error);
          });
      },

      /**
       * 所有共识列表信息
       * @param pageIndex
       * @param pageSize,
       * @param type
       **/
      getConsensusNodes(pageIndex = 1, pageSize = 500, type = 0) {
        this.$post('/', 'getConsensusNodes', [pageIndex, pageSize, type])
          .then((response) => {
            //console.log(response);
            if (response.hasOwnProperty("result")) {
              for (let itme of response.result.list) {
                itme.bozhengjin = itme.deposit;
                itme.deposit = Number(divisionDecimals(itme.deposit)).toFixed(3);
                itme.agentReward = Number(divisionDecimals(itme.agentReward)).toFixed(3);
                itme.totalDeposit = Number(divisionDecimals(itme.totalDeposit)).toFixed(3);
                itme.remaining = Number(Minus(500000, itme.totalDeposit)).toFixed(3);
                itme.totalReward = Number(divisionDecimals(itme.totalReward)).toFixed(3);
              }
              this.allNodeData = response.result.list;
              this.nodeInfo = this.allNodeData[0];
              this.searchValue = this.nodeInfo.agentAlias ? this.nodeInfo.agentAlias : this.nodeInfo.agentId;
              //console.log(this.nodeInfo);
            }
          })
          .catch((error) => {
            console.log("getConsensusNodes:" + error);
          });
      },

      // 获取年化收益率list
      getAnnulizedRewardStatistical() {
        this.$post('/', 'getAnnulizedRewardStatistical', [3])
            .then((response) => {
              //console.log(response);
              if (response.hasOwnProperty("result")) {
                const aprList = response.result;
                if (aprList.length) {
                  this.apr = aprList[aprList.length - 1].value
                }
                // console.log(response.result);
              }
            })
            .catch((error) => {
              console.log("getAnnulizedRewardStatistical:" + error);
            });
      },
      /**
       * 搜索
       * */
      changeValue(e) {
        this.nodeInfo = e;
        this.searchValue = this.nodeInfo.agentAlias ? this.nodeInfo.agentAlias : this.nodeInfo.agentId;
      },

      //最大
      max() {
        if (Number(this.balance)){
          this.joinForm.stakingValue = Minus(this.balance.toString(), 0.001).toString()
        } else {
          this.joinForm.stakingValue = 0;
        }

      },

      /**
       * 获取地址网络信息
       * @param addressInfos
       **/
      async getAddressInfoByNode(addressInfos) {
        await this.$post('/', 'getAccount', [addressInfos.address])
          .then((response) => {
            //console.log(response);
            if (response.hasOwnProperty("result")) {
              this.consensusInfo.lastDayReward = tofix(divisionDecimals(Minus(response.result.totalReward, response.result.lastDayReward)), 3, -1);
              this.consensusInfo.totalReward = tofix(divisionDecimals(response.result.totalReward), 3, -1);
              this.consensusInfo.consensusLock = tofix(divisionDecimals(response.result.consensusLock), 3, -1);
              this.balance = tofix(divisionDecimals(response.result.balance), 3, -1);
            }
          })
          .catch((error) => {
            console.log("getAccount:" + error);
          });
      },

      /**
       * 我的节点（根据地址获取共识信息）
       * @param pageIndex
       * @param pageSize
       * @param address
       **/
      getConsensusInfoByAddress(pageIndex = 1, pageSize = 500, address) {
        this.$post('/', 'getAccountConsensus', [pageIndex, pageSize, address])
          .then((response) => {
            //console.log(response);
            if (response.hasOwnProperty("result")) {
              //this.nodeDepositData = [];
              for (let item of response.result.list) {
                //console.log(item.txHash);
                this.getNodeDepositByHash(address, item.txHash)
              }
              this.myNodeData = response.result.list
            }
          })
          .catch((error) => {
            console.log("getAccountConsensus:" + error);
          });
      },

      /**
       * 根据hash获取节点委托列表
       * @param pageIndex
       * @param pageSize
       * @param address
       * @param hash
       **/
      getNodeDepositByHash(address, hash, pageIndex = 1, pageSize = 50) {
        this.$post('/', 'getAccountDeposit', [pageIndex, pageSize, address, hash])
          .then((response) => {
            //console.log(response);
            if (response.hasOwnProperty("result")) {
              for (let itme of response.result.list) {
                itme.amount = divisionDecimals(itme.amount);
                itme.fee = divisionDecimals(itme.fee);
                itme.createTime = dayjs(getLocalTime(itme.createTime * 1000)).format('YYYY/MM/DD HH:mm:ss');
              }
              this.oldData = [...this.oldData, ...response.result.list];
              this.oldData = arrDistinctByProp(this.oldData, "txHash");
              //console.log(newList);
              if (this.oldData.length !== this.nodeDepositData.length || this.nodeDepositData.length === 0) {
                this.nodeDepositData = this.oldData
              }
            }
          })
          .catch((error) => {
            console.log("getConsensusDeposit:" + error);
          });
      },

      //加入共识
      async submitStaking(formName) {
        //console.log(this.nodeInfo);

        this.$refs[formName].validate(async (valid) => {
          if (valid) {
            const data = {
              from: this.$store.state.accountInfo.address,
              assetChainId: RUN_DEV ? 1 : 2,
              assetId: 1,
              depositValue: this.joinForm.stakingValue,
              agentHash: this.nodeInfo.txHash
            };
            try {
              const resData = await window.nabox.sendDepositTransaction(data);
              console.log(resData);
              if (resData) {
                this.$message({
                  type: "success",
                  message: this.$t("tips.tips10")
                })
                this.joinForm.stakingValue = '';
                this.$refs['stakingValue'].resetField()
              }
            } catch (e) {
              this.$message({
                type: "error",
                message: e.message || JSON.stringify(e)
              })
            }

          } else {
            return false;
          }
        });
      },

      //退出staking
      async outStaking(info) {
        this.outDialog = true;
        this.outStakingInfo = info;
      },

      async out() {
        const data = {
          from: this.$store.state.accountInfo.address,
          assetChainId: RUN_DEV ? 1 : 2,
          assetId: 1,
          withdrawAmount: this.outStakingInfo.amount,
          depositHash: this.outStakingInfo.txHash
        };
        try {
          const resData = await window.nabox.sendWithDrawTransaction(data);
          //console.log(resData);
          if (resData) {
            this.outDialog = false;
            this.outStakingInfo = {};
            this.$message({
              type: "success",
              message: this.$t("tips.tips10")
            })
            setTimeout(() => {
              this.oldData = [];
            }, 20000)
          }
        } catch (e) {
          this.outDialog = false;
          this.$message({
            type: "error",
            message: e.message || JSON.stringify(e)
          })
        }

      },

      /**
       * url 连接
       * @param name
       * @param pas
       */
      toUrl(name, pas) {
        if (pas === 'url') {
          window.open(EXPLORER_URL + 'transaction/info?hash=' + name)
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
    .home {
        .all {
            margin: 10px;
            padding: 10px;
            border-radius: 5px;
            background-color: #f1f1f1;
            height: 170px;
            .top {
              display: flex;
              align-items: center;
              height: 80px;
              border-bottom: 1px solid #DCDFE6;
              //padding: 10px 0;
                .left,.right {
                  flex: 1;
                  text-align: center;
                  padding: 10px 0;
                  h3 {
                    font-size: 16px;
                    //padding: 10px 80px 0 0;
                  }
                  p {
                    font-size: 16px;
                    font-weight: 600;
                    margin: 10px 0 0 0;
                  }
                }
              .left {
                border-right: 1px solid #DCDFE6;
              }
                .alls {
                    text-align: center;
                    h3 {
                        font-size: 20px;
                        padding: 10px 80px 0 0;
                    }
                    p {
                        font-size: 16px;
                        margin: 5px 0 0 0;
                    }
                }
            }
            .list {
                margin-top: 10px;
                li {
                    float: left;
                    width: 33.33%;
                    text-align: center;
                    h6 {
                        font-size: 14px;
                        line-height: 24px;
                    }
                    p {
                        font-size: 14px;
                    }
                }
            }
        }
        .node {
            margin: 20px 10px;
            padding: 20px 10px 20px;
            border-radius: 5px;
            background-color: #f1f1f1;
            .search {
                width: 100%;
            }
            ul {
                margin: 20px 0 0 0;
                font-size: 14px;
                li {
                    line-height: 30px;
                    span {
                        color: #000000;
                    }
                }
            }
            .available {
                margin: 20px 0 0 0;
                font-size: 14px;
            }
            .staking-value {
                margin: 10px 0 5px 0;
            }
            .el-form-item__error {
                //padding-top: -5px !important;
            }
            .max {
                position: absolute;
                z-index: 99;
                font-size: 12px;
                margin: 9px 0 0 310px;
                cursor: pointer;
            }
            .pledge {
                width: 100%;
                //margin: 20px 0 0 0;
            }
        }
        .pledgeing {
            margin: 20px 10px;
            padding: 20px 10px 40px;
            border-radius: 5px;
            background-color: #f1f1f1;
            h5 {
                font-size: 14px;
                color: #000000;
                margin: 0 0 10px 0;
            }
            .lis {
                height: 60px;
                width: 100%;
                font-size: 14px;
                border-bottom: 1px solid #8c939d;
                line-height: 25px;
                .fl {
                    .top {
                        color: #000000;
                        span {
                            color: #5e6983;
                            display: block;
                            float: right;
                            margin: 0 0 0 80px;
                            font-size: 12px;
                        }
                    }
                    .tx {
                        span {
                            color: #608FFF;
                        }
                    }
                }
                .fr {
                    span {
                        color: #608FFF;
                        display: block;
                        margin: 15px 0 0 0;
                    }
                }
            }
        }

        .outDialog {
            .tips {
                font-size: 14px;
                color: #000000;
                height: 50px;
            }
            .btns {
                text-align: center;
                padding: 0 0 30px 0;
                .el-button {
                    width: 45%;
                }
            }
        }
    }
</style>
