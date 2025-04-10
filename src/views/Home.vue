<template>
    <div class="home">
        <div class="all">
            <div class="top">
              <div class="left">
                <h3>{{$t('home.home1')}}({{ symbol }})</h3>
                <p>{{$toThousands(consensusTotal)}}</p>
              </div>
              <div class="right">
                <h3>APR</h3>
                <p>{{apr}}%</p>
              </div>
            </div>
            <ul class="list cb">
                <li>
                    <h6>{{$toThousands(consensusInfo.lastDayReward)}}</h6>
                    <p>
                      {{$t('home.home2')}}
                      <br>
                      <span class="font_12">({{ symbol }})</span>
                    </p>
                </li>
                <li>
                    <h6>{{$toThousands(consensusInfo.totalReward)}}</h6>
                  <p>
                    {{$t('home.home3')}}
                    <br>
                    <span class="font_12">({{ symbol }})</span>
                  </p>
                </li>
                <li>
                    <h6>{{$toThousands(consensusInfo.consensusLock)}}</h6>
                  <p>
                    {{$t('home.home4')}}
                    <br>
                    <span class="font_12">({{ symbol }})</span>
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
                <li>{{$t('home.home7')}}<span class="fr">{{$toThousands(nodeInfo.totalDeposit)}} {{ symbol }}</span></li>
                <li>{{$t('home.home8')}}<span class="fr">{{$toThousands(nodeInfo.remaining)}} {{ symbol }}</span></li>
                <li>{{$t('home.home9')}}<span class="fr">{{nodeInfo.commissionRate}}%</span></li>
            </ul>

            <div class="fr available">
                {{$t('home.home10')}}: {{$toThousands(balance)}} {{ symbol }}
            </div>
            <el-form :model="joinForm" status-icon :rules="joinRules" ref="joinForm" class="join-form">
                <el-form-item label="" prop="stakingValue" ref="stakingValue">
<!--                    <div class="max" @click="max">{{$t('home.home11')}}</div>-->
                    <el-input :placeholder="$t('home.home12')" v-model="joinForm.stakingValue" class="staking-value">
                      <el-button slot="append" @click="max">{{$t('home.home11')}}</el-button>
                    </el-input>
                </el-form-item>
                <el-form-item>
                    <el-button v-if="$store.state.address" type="primary" class="pledge" @click="submitStaking('joinForm')">{{$t('home.home13')}}
                    </el-button>
                    <el-button v-else type="primary" class="pledge" @click="connectWallet">{{$t('header.header0')}}
                    </el-button>
                </el-form-item>
            </el-form>
            <div class="cb"></div>
        </div>

        <div class="pledgeing" v-show="nodeDepositData.length !==0">
            <h5>{{$t('home.home14')}}</h5>
            <div class="lis" v-for="(item,index) in nodeDepositData" :key="index">
                <div class="left">
                  <div style="color: #000">{{$toThousands(item.amount)}} {{ symbol }}</div>
                  <div class="tx">TXID: <span @click="toUrl(item.txHash,'url')" class="click">{{superLongs(item.txHash,10)}}</span></div>
                </div>
                <div class="right">
                  <div class="time">{{item.createTime}}</div>
                  <span class="click" @click="outStaking(item)">{{$t('home.home15')}}</span>
                </div>
            </div>
            <div class="cb"></div>
        </div>

        <el-dialog :title="$t('home.home16')" :visible.sync="outDialog" width="350px" class="outDialog">
            <div class="tips">{{$t('home.home17')}}{{ $toThousands(outStakingInfo.amount) }} {{ symbol }}</div>
            <div class="btns">
                <el-button type="primary" @click="outDialog=false">{{$t('public.cancel')}}</el-button>
                <el-button type="primary" @click="out">{{$t('public.confirm')}}</el-button>
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
    divisionAndFix,
    getLocalTime,
    superLong,
    arrDistinctByProp,
    fixNumber,
    toThousands
  } from '@/api/util'
  import { NSymbol, NDecimals, Max_Deposit, Min_Deposit, DEFAULT_FEE } from '@/constants/constants'
  import { timesDecimals } from '../api/util'
  import providerMixin from '../mixins/providerMixin'

  const min_deposit = divisionDecimals(Min_Deposit, NDecimals)
  const max_deposit = divisionDecimals(Max_Deposit, NDecimals)
  export default {
    mixins: [providerMixin],
    data() {

      let checkStakingValue = (rule, value, callback) => {
        let usable = Minus(max_deposit, this.nodeInfo.totalDeposit).toFixed();
        let re = /^\d+(?=\.{0,1}\d+$|$)/;
        let res = /^\d{1,12}(\.\d{1,4})?$/;
        if (!value) {
          return callback(new Error(this.$t('tips.tips0')));
        } else if (!re.exec(value) || !res.exec(value)) {
          callback(new Error(this.$t('tips.tips1')))
        } else if (value - min_deposit < 0) {
          return callback(new Error(this.$t('tips.tips5', { min: toThousands(min_deposit) })));
        } else if (value - usable > 0) {
          return callback(new Error(this.$t('tips.tips3') + toThousands(usable) + this.$t('tips.tips4')));
        } else if (Minus(this.balance, value).toFixed() - DEFAULT_FEE < 0) {
          return callback(new Error(this.$t('tips.tips6') + toThousands(Minus(this.balance, DEFAULT_FEE).toFixed())));
        } else {
          callback()
        }
      };

      this.timer1 = null
      this.timer2 = null
      return {
        symbol: NSymbol,
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

    mounted() {
      this.init()
      this.timer1 = setInterval(() => {
        this.init()
      }, 10000)
    },

    beforeDestroy() {
      if (this.timer1) {
        clearInterval(this.timer1);
      }
      if (this.timer2) {
        clearInterval(this.timer2);
      }
    },
    
    watch: {
      '$store.state.address': {
        immediate: true, // immediate选项可以开启首次赋值监听
        handler(val) {
          this.nodeDepositData = [];
          this.oldData = [];
          clearInterval(this.timer2);
          if (val) {
            this.getAddressInfoByNode(val);
            this.getConsensusInfoByAddress(1, 500, val);
            this.timer2 = setInterval(() => {
              this.getAddressInfoByNode(val);
              this.getConsensusInfoByAddress(1, 500, val);
            }, 11000)
          } else {
            this.balance = '0'
            this.consensusInfo = {
              lastDayReward: 0,
              totalReward: 0,
              consensusLock: 0
            }
            if (this.$refs.joinForm) {
              this.$refs.joinForm.resetFields()
            }
          }
        }
      },
    },
    methods: {

      init() {
        this.getCoinInfo();
        this.getConsensusNodes();
        this.getAnnulizedRewardStatistical()
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
              this.consensusTotal = divisionAndFix(response.result.consensusTotal, NDecimals, 0);
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
                itme.deposit = divisionAndFix(itme.deposit, NDecimals, 3);
                itme.agentReward = divisionAndFix(itme.agentReward, NDecimals, 3);
                itme.remaining = divisionAndFix(Minus(Max_Deposit, itme.totalDeposit), NDecimals, 3);
                itme.totalDeposit = divisionAndFix(itme.totalDeposit, NDecimals, 3);
                // itme.remaining = fixNumber(Minus(500000, itme.totalDeposit), 3);
                itme.totalReward = divisionAndFix(itme.totalReward, NDecimals, 3);
              }
              this.allNodeData = response.result.list;
              if (this.nodeInfo.agentId) {
                this.nodeInfo = this.allNodeData.find(item => item.agentId === this.nodeInfo.agentId);
              } else {
                this.nodeInfo = this.allNodeData[0];
              }
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
          this.joinForm.stakingValue = Minus(this.balance, DEFAULT_FEE).toString()
        } else {
          this.joinForm.stakingValue = 0;
        }

      },

      /**
       * 获取地址网络信息
       * @param addressInfos
       **/
      async getAddressInfoByNode(address) {
        await this.$post('/', 'getAccount', [address])
          .then((response) => {
            //console.log(response);
            if (response.hasOwnProperty("result")) {
              // this.consensusInfo.lastDayReward = divisionAndFix(Minus(response.result.totalReward, response.result.lastDayReward), 8, 3);
              this.consensusInfo.lastDayReward = divisionAndFix(response.result.lastReward, NDecimals, 3);
              this.consensusInfo.totalReward = divisionAndFix(response.result.totalReward, NDecimals, 3);
              this.consensusInfo.consensusLock = divisionAndFix(response.result.consensusLock, NDecimals, 3);
              this.balance = divisionAndFix(response.result.balance, NDecimals, 3);
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
              const agentHashs = []
              for (let item of response.result.list) {
                //console.log(item.txHash);
                agentHashs.push(item.txHash)
              }
              // console.log(response.result.list, '22');
              this.myNodeData = response.result.list
              if (agentHashs.length) {
                this.getNodesDeposit(agentHashs)
              }
            }
          })
          .catch((error) => {
            console.log("getAccountConsensus:" + error);
          });
      },

      async getNodesDeposit(hashs) {
        const promises = hashs.map((hash) => {
          return this.$post('/', 'getAccountDeposit', [1, 50, this.$store.state.address, hash])
        });
        Promise.all(promises)
          .then((responses) => {
            const depositData = []
            responses.map(response => {
              if (response.result) {
                for (let item of response.result.list) {
                  item.amount = divisionDecimals(item.amount, NDecimals);
                  item.fee = divisionDecimals(item.fee, NDecimals);
                  item.createTime = dayjs(getLocalTime(item.createTime * 1000)).format('YYYY/MM/DD HH:mm:ss');
                  depositData.push(item)
                }
              }
            })
            this.nodeDepositData = depositData
          })
          .catch((error) => {
            console.log("getAccountDeposit:" + error);
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
                itme.amount = divisionDecimals(itme.amount, NDecimals);
                itme.fee = divisionDecimals(itme.fee, NDecimals);
                itme.createTime = dayjs(getLocalTime(itme.createTime * 1000)).format('YYYY/MM/DD HH:mm:ss');
              }
              console.log(response.result.list, 234234);
              this.oldData = [...this.oldData, ...response.result.list];
              this.oldData = arrDistinctByProp(this.oldData, "txHash");
              //console.log(newList);
              this.nodeDepositData = this.oldData
              // if (this.oldData.length !== this.nodeDepositData.length || this.nodeDepositData.length === 0) {
              // }
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
              from: this.$store.state.address,
              assetChainId: RUN_DEV ? 1 : 2,
              assetId: 1,
              depositValue: timesDecimals(this.joinForm.stakingValue, NDecimals),
              agentHash: this.nodeInfo.txHash
            };
            try {
              const resData = await window.NaboxWallet.nai.sendDepositTransaction(data);
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
          from: this.$store.state.address,
          assetChainId: RUN_DEV ? 1 : 2,
          assetId: 1,
          withdrawAmount: timesDecimals(this.outStakingInfo.amount, NDecimals),
          depositHash: this.outStakingInfo.txHash
        };
        try {
          const resData = await window.NaboxWallet.nai.sendWithDrawTransaction(data);
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
@import '../assets//css//style.less';
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
                display: flex;
                justify-content: space-between;
                .left {
                  flex: 1;
                  margin-right: 10px;
                }
                .right {
                  text-align: right;
                  .time {
                    color: #5e6983;
                    font-size: 12px;
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
