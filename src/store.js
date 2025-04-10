import Vue from 'vue'
import Vuex from 'vuex';

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    lang: 'cn',
    address: '',
    isWrongChain: false
  },
  mutations: {
    changeAddress(state, address) {
      state.address = address;
    },
    changeIsWrongChain(state, isWrongChain) {
      state.isWrongChain = isWrongChain;
    }
  },
  actions: {}
})
