import Vue from 'vue'
import Vuex from 'vuex';

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    lang: 'cn',
    accountInfo: {},
  },
  mutations: {
    changeAccount(state, accountInfo) {
      accountInfo = accountInfo || {address: ""};
      state.accountInfo = accountInfo;
    },
  },
  actions: {}
})
