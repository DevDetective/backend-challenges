const orders = require('./orders.json');
const fees = require('./fees.json');

function calculateDistributions(orders, fees) {
  const feeMap = fees.reduce((map, fee) => {
    map[fee.order_item_type] = { fees: fee.fees, distributions: fee.distributions };
    return map;
  }, {});
  let totalDistributions = {};
  //loop through orders
  orders.forEach(order => {
    console.log(`Order ID: ${order.order_number}`);
    let orderDistributions = {};
  //loop through order_items
    order.order_items.forEach(item => {
      const { fees, distributions } = feeMap[item.type];
      let item_total_fee = 0;

      //calculating total fee for order_item
      fees.forEach(fee => {
        if (fee.type === 'flat') {
          item_total_fee += parseFloat(fee.amount);
        } else if (fee.type === 'per-page') {
          item_total_fee += (item.pages - 1) * parseFloat(fee.amount);
        }
      });
      distributions.forEach(distribution => {
        const amount = parseFloat(distribution.amount);
        orderDistributions[distribution.name] = (orderDistributions[distribution.name] || 0) + amount;
        totalDistributions[distribution.name] = (totalDistributions[distribution.name] || 0) + amount;
        item_total_fee -= amount;
      });

      if (item_total_fee > 0) {
        orderDistributions['Other'] = (orderDistributions['Other'] || 0) + item_total_fee;
        totalDistributions['Other'] = (totalDistributions['Other'] || 0) + item_total_fee;
      }
    });

    for (const [fund, amount] of Object.entries(orderDistributions)) {
      console.log(`  Fund - ${fund}: $${amount.toFixed(2)}`);
    }
    console.log();
  });

  console.log('Total distributions:');
  for (const [fund, amount] of Object.entries(totalDistributions)) {
    console.log(`  Fund - ${fund}: $${amount.toFixed(2)}`);
  }
}

calculateDistributions(orders, fees);
