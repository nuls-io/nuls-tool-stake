import {post} from './https'
import {Plus, chainID} from './util'

/**
 * 获取inputs and outputs
 * @param transferInfo
 * @param balanceInfo
 * @param type
 * @returns {*}
 **/
export async function inputsOrOutputs(transferInfo, type) {
  console.log(transferInfo, type);
  let nulsbalance = await getBalanceOrNonceByAddress(transferInfo.assetsChainId, transferInfo.assetsId, transferInfo.fromAddress);
  console.log(nulsbalance);
  if (nulsbalance.data.balance < 100000) {
    return {success: false, code: 1001, data: "Your balance is not enough."}
  }

  let newAmount = Number(Plus(transferInfo.amount, transferInfo.fee));
  let newLocked = 0;
  let newNonce = nulsbalance.data.nonce;
  let newoutputAmount = transferInfo.amount;
  let newLockTime = 0;
  if (nulsbalance.data.balance < newAmount) {
    return {success: false, code: 1001, data: "Your balance is not enough."}
    //余额不足 1001
  }
  if (type === 4) {
    newLockTime = -1;
  } else if (type === 5) {
    newLockTime = -1;
  } else if (type === 6) {
    newAmount = transferInfo.amount;
    newLocked = -1;
    newNonce = transferInfo.depositHash.substring(transferInfo.depositHash.length - 16);
    newoutputAmount = transferInfo.amount - transferInfo.fee;
  } else if (type === 9) {
    newAmount = transferInfo.amount;
    newLocked = -1;
    newNonce = transferInfo.depositHash.substring(transferInfo.depositHash.length - 16);
    newoutputAmount = transferInfo.amount - transferInfo.fee;
    //锁定三天
    newLockTime = (new Date()).valueOf() + 3600000 * 72;
  } else {
    //return {success: false, data: "No transaction type"}
  }

  let inputs = [{
    address: transferInfo.fromAddress,
    assetsChainId: transferInfo.assetsChainId,
    assetsId: transferInfo.assetsId,
    amount: newAmount,
    locked: newLocked,
    nonce: newNonce
  }];

  if (type === 2 && transferInfo.assetsChainId !== chainID()) {
    inputs[0].amount = transferInfo.amount;
    inputs.push({
      address: transferInfo.fromAddress,
      assetsChainId: chainID(),
      assetsId: transferInfo.assetsId,
      amount: 100000,
      locked: newLocked,
      nonce: nulsbalance.data.nonce
    })
  }
  let outputs = [];
  if (type === 15 || type === 17) {
    return {success: true, data: {inputs: inputs, outputs: outputs}};
  }
  if (type === 16) {
    //console.log(transferInfo);
    if (!transferInfo.toAddress) {
      return {success: true, data: {inputs: inputs, outputs: outputs}};
    } else {
      newoutputAmount = transferInfo.value;
    }
  }
  outputs = [{
    address: transferInfo.toAddress ? transferInfo.toAddress : transferInfo.fromAddress,
    assetsChainId: transferInfo.assetsChainId,
    assetsId: transferInfo.assetsId,
    amount: newoutputAmount,
    lockTime: newLockTime
  }];
  console.log(inputs,outputs);

  return {success: true, data: {inputs: inputs, outputs: outputs}};
}

/**
 * 获取地址的余额及nonce根据地址
 * @param chainId
 * @param assetsId
 * @param address
 * @returns {Promise<any>}
 */
export async function getBalanceOrNonceByAddress(chainId, assetsId, address) {
  return await post('/', 'getAccountBalance', [chainId, assetsId, address])
    .then((response) => {
      //console.log(response);
      if (response.hasOwnProperty("result")) {
        return {success: true, data: {balance: response.result.balance, nonce: response.result.nonce}}
      } else {
        return {success: false, data: response}
      }
    })
    .catch((error) => {
      return {success: false, data: error};
    });
}
