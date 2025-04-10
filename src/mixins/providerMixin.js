export default {
  data() {},
  methods: {
    initAccount() {
      if (window.NaboxWallet && window.NaboxWallet.nai) {
        console.log(this.connectWallet, 23);
        this.confirmConnect();
      }
    },
    connectWallet() {
      if (window.NaboxWallet && window.NaboxWallet.nai) {
        this.confirmConnect();
      } else {
        this.$message({
          message: this.$t("tips.tips7"),
          type: "error",
          duration: 3000,
        });
        setTimeout(() => {
          window.open("https://nabox.io", "_blank");
        }, 1000);
      }
    },

    async confirmConnect() {
      const result = await window.NaboxWallet.nai.createSession();
      if (result && result.length) {
        const address = result[0];
        const isWrongChain =
          !address.startsWith("tNULS") && !address.startsWith("NULS");
        this.$store.commit("changeAddress", address);
        this.$store.commit("changeIsWrongChain", isWrongChain);
        this.addAccountListener();
      } else {
        this.$message({
          message: this.$t("tips.tips9"),
          type: "error",
          duration: 3000,
        });
      }
    },

    disconnect() {
      this.$store.commit("changeAddress", "");
      this.$store.commit("changeIsWrongChain", false);
    },

    addAccountListener() {
      this.removeAccountListener();
      window.NaboxWallet.nai.on("accountsChanged", this.handleAccountChange);
    },

    removeAccountListener() {
      window.NaboxWallet.nai.removeAllListeners(
        "accountsChanged",
        this.handleAccountChange
      );
    },

    handleAccountChange(accounts) {
      if (accounts && accounts.length) {
        const address = accounts[0];
        const isWrongChain =
          !address.startsWith("tNULS") && !address.startsWith("NULS");
        this.$store.commit("changeAddress", address);
        this.$store.commit("changeIsWrongChain", isWrongChain);
      } else {
        this.$store.commit("changeAddress", "");
        this.$store.commit("changeIsWrongChain", false);
      }
    },
  },
};
