//
// const data = [
//   {
//     "person": "dju ",
//     "owesTo": "alx",
//     "amount": 3
//   },
//   {
//     "person": "cam",
//     "owesTo": "alx",
//     "amount": 3
//   },
//   {
//     "person": "maxk",
//     "owesTo": "alx",
//     "amount": 3
//   },
//   {
//     "person": "dju ",
//     "owesTo": "alx",
//     "amount": 11
//   },
//   {
//     "person": "maxk",
//     "owesTo": "alx",
//     "amount": 11
//   },
//   {
//     "person": "cam",
//     "owesTo": "dju ",
//     "amount": 57
//   },
//   {
//     "person": "maxk",
//     "owesTo": "dju ",
//     "amount": 57
//   },
//   {
//     "person": "dju ",
//     "owesTo": "cam",
//     "amount": 21
//   },
//   {
//     "person": "maxk",
//     "owesTo": "cam",
//     "amount": 21
//   }
// ];
//
// function checkAmounts(amount, amount1, decimals, targetBit = "===") {
//   amount = Math.round(amount * Math.pow(10, decimals));
//   amount1 = Math.round(amount1 * Math.pow(10, decimals));
//
//   const res = eval(`${amount} ${targetBit} ${amount1}`);
//
//   return res
// }
//
// function reduceRepart(data) {
//   let gvbdf = (data || []).reduce((res, item, index, arr) => {
//     // add up the values
//     const target = res.find(r => r.person === item.person && r.owesTo === item.owesTo);
//     if(target) {
//       // target.amount += item.amount;
//     }
//     else {
//       const listToAdd = arr.filter((r) => r.person === item.person && r.owesTo === item.owesTo);
//       const sum = listToAdd.reduce((res, item) => {return res + item.amount;}, 0);
//       const newi = Object.assign({}, item);
//       newi.amount = sum;
//       res.push(newi);
//     }
//
//     return res;
//   }, []);
//
//   const newArr = gvbdf.slice();
//   gvbdf.forEach((item) => {
//     // removes what we already owe
//
//     if(!newArr.includes(item)) {
//       return; // already handled
//     }
//
//     const targets = newArr.filter((g) => g.person === item.owesTo && g.owesTo === item.person);
//     for(const target of targets) {
//       if(item.amount < target.amount) {
//         continue;
//       }
//
//       item.amount -= target.amount;
//       const inh = newArr.indexOf(target);
//       newArr.splice(inh, 1);
//
//       if(checkAmounts(item.amount, 0, 2)) {
//         const inh = newArr.indexOf(item);
//         newArr.splice(inh, 1);
//       }
//     }
//   });
//
//   // remove sames
//   // for(let i = 0; i < da)
//
//   return newArr;
// }
//
// const repart = reduceRepart(data);
//
// console.log(repart);



const allExp = [{"amount":9,"payer":"alx","payees":[{"name":"dju","selected":false,"e4xpenseRatio":0.3333333333333333},{"name":"cam","selected":false,"e4xpenseRatio":0.3333333333333333},{"name":"maxk","selected":false,"e4xpenseRatio":0.3333333333333333}]},{"amount":22,"payer":"alx","payees":[{"name":"dju","selected":false,"e4xpenseRatio":0.5},{"name":"maxk","selected":false,"e4xpenseRatio":0.5}]},{"amount":114,"payer":"dju","payees":[{"name":"cam","selected":false,"e4xpenseRatio":0.5},{"name":"maxk","selected":false,"e4xpenseRatio":0.5}]},{"amount":42,"payer":"cam","payees":[{"name":"dju","selected":false,"e4xpenseRatio":0.5},{"name":"maxk","selected":false,"e4xpenseRatio":0.5}]}];

function getIPaidForOthers(allExp, me) {
  const targs = allExp.filter(ae => ae.payer === me);
  return targs.reduce((res, item) => {
    const otherPayees = item.payees.filter(i => i.name !== me);
    return res + otherPayees.reduce((rres, ritem) => rres + item.amount * ritem.e4xpenseRatio, 0);
  }, 0);
}

function getOthersPaidForMe(allExp, me) {
  const targs = allExp.filter(ae => ae.payer !== me && ae.payees.find(aep => aep.name === me));
  return targs.reduce((res, item) => {
    const mePayee = item.payees.find(i => i.name === me);
    return res + item.amount * mePayee.e4xpenseRatio;
  }, 0);
}

function getOwed(allExp, me) {
  //const me = "dju";
  const iPaidForOthers = getIPaidForOthers(allExp, me);
  const othersPaidForMe = getOthersPaidForMe(allExp, me);
  const owed = iPaidForOthers - othersPaidForMe;
  return owed;
}

for(const name of ["dju", "alx", "maxk", "cam"]) {
  const oo = getOwed(allExp[, name);
  console.log(`${name} owed ${oo}`);
}
