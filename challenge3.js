const express = require('express');
const app = express();
app.use(express.json());
const orders = require('./orders.json');
const fees = require('./fees.json');

function getItemPrice(itemType) {
  const fee_info = fees.find(fee => fee.order_item_type === itemType);

  if (fee_info) {
    const flat_fee = fee_info.fees.find(thisFee => thisFee.type === 'flat');
    if (flat_fee) {
      return Number(flat_fee.amount);
    }
  }
  return 0;
}

function calculatePrices(orders) {
  //mapping to loop through orders
  return orders.map(order => { 
    let order_total = 0;
    const orderItems = order.order_items.map((item) => {
      let item_price = 0;

      item_price += getItemPrice(item.type); //we can also directly provide prices for item types but hard-coding is not preferred.
      if(item.type === 'Real Property Recording'){
        item_price += (item.pages - 1) * 1.00;
      }
      order_total += item_price;
      return { item_type: item.type, item_total: item_price.toFixed(2) };
    });

    return {
      order_number: order.order_number,
      order_items: orderItems,
      order_total: order_total.toFixed(2),
    };
  });
}

function calculateDistributions(orders, fees) {
  //mapping to loop through orders
  return orders.map(order => {
    const order_number = order.order_number;
    const distribution_totals = {};
  //looping through order_items
    order.order_items.forEach(item => {
      const item_type = item.type;
      //finding the corresponding value in fees array
      const fee_info = fees.find(fee => fee.order_item_type === item_type);

      if (fee_info) {
  //looping through distributions
        fee_info.distributions.forEach(distribution => {
          const distributionName = distribution.name;
          const distributionAmount = parseFloat(distribution.amount);

          if (!(distributionName in distribution_totals)) {
            distribution_totals[distributionName] = 0;
          }
          distribution_totals[distributionName] += distributionAmount;
        });
      }
    });
    const orderDistributionTotals = Object.entries(distribution_totals).map(([name, amount]) => ({
      distribution_name: name,
      distribution_total: amount.toFixed(2),
    }));
    return {
      order_number: order_number,
      distribution_totals: orderDistributionTotals,
    };
  });
}

app.post('/calculatePrices', (req, res) => {
  const orders = req.body;
  // console.log(orders)
  const response = calculatePrices(orders);
  res.json(response);
});

app.post('/calculateDistributions', (req, res) => {
  const orders = req.body;
  const response = calculateDistributions(orders, fees);
  res.json(response);
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server successfully running on port ${PORT}`);
});
