const orders = require('./orders.json');
const fees = require('./fees.json');

function calculatePrices(orders, fees) {
  const feeMap = fees.reduce((map, fee) => {
    map[fee.order_item_type] = fee.fees;
    return map;
  }, {});
  //looping through orders
  orders.forEach(order => {
    console.log(`Order ID: ${order.order_number}`);
    let orderTotal = 0;
  //looping through order_items
    order.order_items.forEach((item, index) => {
      const item_fees = feeMap[item.type];
      let item_price = 0;

      item_fees.forEach(fee => {
        if (fee.type === 'flat') {
          item_price += parseFloat(fee.amount);
        } else if (fee.type === 'per-page') {
          item_price += (item.pages - 1) * parseFloat(fee.amount);
        }
      });

      orderTotal += item_price;
      console.log(`   Order item ${index + 1}: $${item_price.toFixed(2)}`);
    });

    console.log(`\n   Order total: $${orderTotal.toFixed(2)}\n`);
  });
}

calculatePrices(orders, fees);
